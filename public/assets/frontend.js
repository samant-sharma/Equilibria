/* Frontend-only behavior. No API requests, credentials, or third-party scripts. */
(() => {
  'use strict';
  const header = document.querySelector('header');
  const path = location.pathname.replace(/\/$/, '') || '/';
  header?.querySelectorAll('nav a').forEach(link => {
    if (link.getAttribute('href') === path) {
      link.setAttribute('aria-current', 'page');
      link.classList.add('text-ink', '[&::after]:![transform:scaleX(1)]');
    }
  });

  // Preserve the original hover, focus, click, and Escape dropdown behavior.
  const dropdowns = [];
  header?.querySelectorAll('nav[aria-label="Marketing"] button[aria-haspopup]').forEach(button => {
    const group = button.parentElement;
    const panel = button.nextElementSibling;
    let closeTimer;
    const setOpen = open => {
      button.setAttribute('aria-expanded', String(open));
      panel.setAttribute('aria-hidden', String(!open));
      group.classList.toggle('frontend-dropdown-open', open);
      panel.querySelectorAll('a').forEach(link => { link.tabIndex = open ? 0 : -1; });
    };
    dropdowns.push({group, button, setOpen});
    group.addEventListener('mouseenter', () => { clearTimeout(closeTimer); setOpen(true); });
    group.addEventListener('mouseleave', () => { closeTimer = setTimeout(() => setOpen(false), 150); });
    group.addEventListener('focusin', () => { clearTimeout(closeTimer); setOpen(true); });
    group.addEventListener('focusout', event => {
      if (!group.contains(event.relatedTarget)) closeTimer = setTimeout(() => setOpen(false), 150);
    });
    button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
    group.addEventListener('keydown', event => {
      if (event.key === 'Escape') { clearTimeout(closeTimer); setOpen(false); button.focus(); setOpen(false); }
      if (event.key === 'ArrowDown' && event.target === button) {
        event.preventDefault(); setOpen(true); panel.querySelector('a')?.focus();
      }
    });
  });
  document.addEventListener('click', event => {
    dropdowns.forEach(({group,setOpen}) => { if (!group.contains(event.target)) setOpen(false); });
  });

  // The mobile menu uses the same content and classes as the original menu.
  const mobileButton = header?.querySelector('button[aria-label="Open menu"]');
  if (mobileButton) {
    const menuIcon = mobileButton.innerHTML;
    const mobileMenu = document.createElement('nav');
    mobileMenu.id = 'mobile-marketing';
    mobileMenu.setAttribute('aria-label', 'Mobile marketing');
    mobileMenu.className = 'border-t border-divider bg-paper px-4 py-4 md:hidden';
    mobileMenu.hidden = true;
    const list = document.createElement('div');
    list.className = 'container mx-auto grid gap-1';
    const setMobileOpen = open => {
      mobileMenu.hidden = !open;
      mobileButton.setAttribute('aria-expanded', String(open));
      mobileButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      mobileButton.innerHTML = open ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>' : menuIcon;
    };
    [...header.querySelector('nav[aria-label="Marketing"]').children].forEach((entry,index) => {
      const button = entry.querySelector('button[aria-haspopup]');
      const delay = `${Math.min(index,5)*30}ms`;
      if (button) {
        const group = document.createElement('div');
        group.className = 'motion-safe:[animation:hero-fade-up_300ms_ease-out_both]';
        group.style.animationDelay = delay;
        const toggle = document.createElement('button');
        toggle.type = 'button'; toggle.setAttribute('aria-expanded', 'false');
        toggle.className = 'flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-3 text-base text-muted-foreground transition-colors hover:bg-paper-2 hover:text-ink';
        toggle.innerHTML = button.innerHTML;
        toggle.querySelector('svg')?.setAttribute('class','h-4 w-4 transition-transform');
        const children = document.createElement('div');
        children.className = 'ml-3 grid gap-1 border-l border-divider pl-3'; children.hidden = true;
        entry.querySelectorAll('a').forEach(link => {
          const copy = document.createElement('a'); copy.href = link.getAttribute('href');
          copy.textContent = link.querySelector('span').textContent;
          copy.className = 'rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-paper-2 hover:text-ink';
          if (copy.getAttribute('href') === path) { copy.classList.add('bg-paper-2','text-ink'); copy.setAttribute('aria-current','page'); }
          children.append(copy);
        });
        toggle.addEventListener('click', () => {
          children.hidden = !children.hidden;
          toggle.setAttribute('aria-expanded', String(!children.hidden));
          toggle.querySelector('svg')?.classList.toggle('rotate-180', !children.hidden);
        });
        group.append(toggle,children); list.append(group);
      } else {
        const link = entry.cloneNode(true);
        link.className = 'motion-safe:[animation:hero-fade-up_300ms_ease-out_both] rounded-md px-3 py-3 text-base text-muted-foreground transition-colors hover:bg-paper-2 hover:text-ink';
        if (link.getAttribute('href') === path) link.classList.add('bg-paper-2','text-ink');
        link.style.animationDelay = delay; list.append(link);
      }
    });
    const signIn = header.querySelector('a[href="https://investor.equilibria.net"]')?.cloneNode(true);
    if (signIn) {
      signIn.className = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 mt-3 cursor-pointer';
      list.append(signIn);
    }
    mobileMenu.append(list); header.append(mobileMenu);
    mobileButton.setAttribute('aria-controls',mobileMenu.id);
    mobileButton.addEventListener('click', () => setMobileOpen(mobileMenu.hidden));
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileMenu.hidden) { setMobileOpen(false); mobileButton.focus(); } });
    window.matchMedia('(min-width: 768px)').addEventListener('change', event => { if (event.matches) setMobileOpen(false); });
  }

  // Offering filters use the public data shown on the original website.
  const filters = [...document.querySelectorAll('main select')];
  const cards = [...document.querySelectorAll('[data-offering-card]')];
  if (filters.length === 3 && cards.length) {
    const grid = cards[0].parentElement;
    const bar = filters[0].closest('.relative').parentElement;
    const count = bar.previousElementSibling;
    const clear = document.createElement('button');
    clear.type = 'button'; clear.textContent = 'Clear'; clear.hidden = true;
    clear.className = 'eq-pill border border-divider-strong bg-transparent cursor-pointer text-accent transition-colors hover:border-accent';
    bar.append(clear);
    const empty = document.createElement('div');
    empty.className = 'border border-dashed border-divider-strong px-6 py-12 text-center text-sm text-muted-foreground';
    empty.textContent = 'No offerings match these filters.'; empty.hidden = true;
    grid.after(empty);
    const update = () => {
      const [region,type,status] = filters.map(select => select.value);
      let visible = 0;
      cards.forEach(card => {
        const matches = (!region || card.dataset.region === region) && (!type || card.dataset.type === type) && (!status || card.dataset.status === status);
        card.hidden = !matches; if (matches) visible++;
      });
      count.textContent = `Showing ${visible} of ${cards.length} offerings`;
      clear.hidden = !(region || type || status); empty.hidden = visible !== 0; grid.hidden = visible === 0;
      filters.forEach(select => { select.classList.toggle('border-accent',!!select.value); select.classList.toggle('text-ink',!!select.value); });
    };
    filters.forEach(select => select.addEventListener('change',update));
    clear.addEventListener('click', () => { filters.forEach(select => { select.value = ''; }); update(); });
    update();
  }

  // Details panels preserve the verified content of each original tab.
  const tablist = document.querySelector('[role="tablist"]');
  if (tablist) {
    const panels = document.querySelector('[data-tab-panels]');
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const templates = tabs.map((_,index) => document.getElementById(`panel-${['overview','investment','tokenization','secondary','documents'][index]}`));
    const activate = index => {
      tabs.forEach((tab,i) => {
        const selected = i === index;
        tab.setAttribute('aria-selected',String(selected)); tab.tabIndex = selected ? 0 : -1;
        tab.className = `flex-1 cursor-pointer whitespace-nowrap px-4 py-3 text-center text-sm font-medium transition-colors ${selected ? 'bg-accent text-white' : 'text-muted-foreground hover:bg-paper-2 hover:text-ink'}`;
      });
      panels.replaceChildren(templates[index].content.cloneNode(true));
      panels.setAttribute('aria-labelledby',tabs[index].id);
    };
    panels.id = 'offering-panel'; panels.setAttribute('role','tabpanel'); panels.tabIndex = 0;
    tabs.forEach((tab,index) => {
      tab.id = `offering-tab-${index}`; tab.setAttribute('aria-controls',panels.id);
      tab.addEventListener('click', () => activate(index));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index+1)%tabs.length;
        if (event.key === 'ArrowLeft') next = (index+tabs.length-1)%tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length-1;
        if (next !== undefined) { event.preventDefault(); activate(next); tabs[next].focus(); }
      });
    });
    activate(0);
  }

  document.querySelectorAll('[data-frontend-form]').forEach(form => {
    form.addEventListener('submit',event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      let status = form.querySelector('[data-form-status]');
      if (!status) {
        status = document.createElement('p'); status.dataset.formStatus = '';
        status.setAttribute('role','status'); status.className = 'mt-4 text-sm leading-6 text-muted-foreground';
        form.append(status);
      }
      status.textContent = 'Frontend preview: your message has been validated. Email delivery is not connected.';
    });
  });
})();
