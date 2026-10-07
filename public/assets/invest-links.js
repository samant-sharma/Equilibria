/** One destination for every present and future Invest now action. */
export const INVESTOR_PORTAL_URL = 'https://investor.equilibria.net/';

const isInvestLabel = text => text.replace(/\s+/g, ' ').trim().toLowerCase() === 'invest now';

/** Apply the same destination when static pages are built, including templates. */
export function rewriteInvestLinks(html) {
  return html.replace(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/gi, (original, tag, attributes, content) => {
    const label = content.replace(/<[^>]*>/g, '').replace(/&nbsp;|&#160;|&#xa0;/gi, ' ');
    if (!isInvestLabel(label) && !/\bdata-invest-now(?:\s|=|$)/i.test(attributes)) return original;
    const clean = attributes
      .replace(/\s+(?:href|type|data-invest-now)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/\s+data-invest-now(?=\s|$)/gi, '');
    return `<a${clean} href="${INVESTOR_PORTAL_URL}" data-invest-now="">${content}</a>`;
  });
}

/** Also cover tab content and other offering actions inserted after page load. */
export function applyInvestLinks(root) {
  const update = element => {
    if (!element.matches?.('a, button, [role="button"]')) return;
    if (!element.hasAttribute('data-invest-now') && !isInvestLabel(element.textContent)) return;
    if (!element.hasAttribute('data-invest-now')) element.setAttribute('data-invest-now', '');
    if (element.tagName === 'A' && element.getAttribute('href') !== INVESTOR_PORTAL_URL) {
      element.setAttribute('href', INVESTOR_PORTAL_URL);
    }
  };
  update(root);
  root.querySelectorAll?.('a, button, [role="button"]').forEach(update);
  root.querySelectorAll?.('template').forEach(template => applyInvestLinks(template.content));
}

export function initializeInvestLinks(doc) {
  applyInvestLinks(doc);
  const observer = new doc.defaultView.MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') applyInvestLinks(record.target);
      else if (record.type === 'characterData') applyInvestLinks(record.target.parentElement);
      else {
        record.addedNodes.forEach(node => { if (node.nodeType === 1) applyInvestLinks(node); });
        applyInvestLinks(record.target);
      }
    }
  });
  observer.observe(doc.documentElement, {
    childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: ['href', 'aria-label', 'data-invest-now'],
  });
  doc.addEventListener('click', event => {
    const action = event.target.closest?.('a, button, [role="button"]');
    if (!action || (!action.hasAttribute('data-invest-now') && !isInvestLabel(action.textContent))) return;
    if (action.matches(':disabled, [aria-disabled="true"]')) return;
    applyInvestLinks(action);
    if (action.tagName !== 'A') {
      event.preventDefault();
      doc.defaultView.location.assign(INVESTOR_PORTAL_URL);
    }
  }, true);
  return observer;
}

if (typeof document !== 'undefined') initializeInvestLinks(document);
