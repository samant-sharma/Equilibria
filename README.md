# Equilibria frontend

A frontend-only Equilibria website containing **36 local pages**: the 23 originally requested pages and 13 additional offering detail pages. All 14 offerings now open local detail pages. Source content was captured on **7 October 2026**.

## Stack

Static HTML, the original production CSS, local font/image files, and plain JavaScript. Node.js 20 or later is used only for building and serving files. There are no runtime packages, database connections, server functions, API keys, or environment variables required.

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`. Stop with Ctrl+C. After editing, restart the command to regenerate the static output.

## Build and check

```bash
npm run check
npm run build
```

The build creates `dist/`. Every route has its own generated `index.html`, so direct links and refreshes work without a client-side router.

## Deploy to Vercel

1. Extract this ZIP and upload the contents of `equilibria-frontend/` to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. If the repository contains the `equilibria-frontend` folder instead of its contents at the root, set **Root Directory** to `equilibria-frontend`.
4. Use **Framework Preset: Other**, **Build Command: npm run build**, and **Output Directory: dist**. These settings are also defined in `vercel.json`.
5. Deploy. No environment variables are required.

## Editing

- `routes.json`: route paths, page titles, and source filenames.
- `src/pages/`: editable HTML for each requested page. For example, `solutions--esop-succession.html` supplies `/solutions/esop-succession`.
- `public/assets/original.css`: the original site's production stylesheet, retained byte-for-byte.
- `public/assets/fonts.css` and `public/assets/fonts/`: local Inter, Source Serif 4, Playfair Display, and JetBrains Mono fonts.
- `public/assets/images/`: local copies of the original images, including responsive variants. Identical files are deduplicated without changing their bytes.
- `public/assets/frontend.js`: desktop dropdowns, mobile navigation, offering filters, accessible detail tabs, and local contact-form validation.
- `public/assets/frontend.css`: small behavior-only additions.
- `public/assets/invest-links.js`: the shared investor portal destination, applied to current and future investment actions.
- `asset-manifest.json`: provenance and local filenames for 409 asset references (406 original references and three supplied temporary images).

## Included routes

| Page | Route |
| --- | --- |
| Homepage | `/` |
| ESOP & Succession | `/solutions/esop-succession` |
| M&A Advisory | `/solutions/ma-advisory` |
| Post-Close Operations | `/solutions/post-close` |
| Engagement Models | `/pricing` |
| Contact | `/contact` |
| Offerings | `/offerings` |
| Markets | `/markets` |
| Asia | `/markets/asia` |
| Europe | `/markets/europe` |
| GCC & Middle East | `/markets/gcc-middle-east` |
| North America | `/markets/north-america` |
| South America | `/markets/south-america` |
| For Advisors | `/for-advisors` |
| About | `/about` |
| ERC Communities Inc | `/offerings/syndication-delta` |
| Platform | `/platform` |
| Compliance | `/legal/compliance` |
| Privacy | `/legal/privacy` |
| Terms | `/legal/terms` |
| Regulation A+ | `/legal/reg-a` |
| Regulation S | `/legal/reg-s` |
| Regulation D | `/legal/reg-d` |

## Frontend boundaries

The contact form checks the original required fields and displays a clear local preview message. It does not send email or save submissions. Sign-in opens the existing investor portal. All offering cards open their local detail pages. Every Invest now action opens `https://investor.equilibria.net/` in the same tab. No new authentication, investment, payment, or subscription backend is included.

The site reflects the live content at capture time. For example, `/offerings/syndication-delta` is titled **ERC Communities Inc** on the source website; that content is preserved. The Tokenization tab currently contains only the Invest now action, matching the inspected source.

## Verification

The build and resource checks passed for all 36 local pages. DOM interaction checks passed for desktop/mobile menus on every page, offering filters including empty results and reset, all five detail tabs including keyboard navigation, and local form submission handling. The original stylesheet is unchanged; the requested About-page leadership edit is retained.

Graphical browser comparison of the generated frontend was unavailable in the execution environment. The original homepage was visually inspected, and the offering tab content was checked against the live site. The copy preserves the original layout markup, CSS, and downloaded assets, but a pixel-by-pixel desktop/mobile comparison should be completed before client acceptance. See `VERIFICATION.md` for the recorded checks.

## Requested update — 7 October 2026

The About-page Leadership section now shows only Steven Taracevicz, Founder & CEO. William Andreozzi and Alexandra Spalato have been removed from this section.

## Shared Invest now destination

All current Invest now buttons, including the hero, Investment Details, and Tokenization panels, point to `https://investor.equilibria.net/`. The browser rule also covers investment actions inserted dynamically after page load.

The destination is defined once by `INVESTOR_PORTAL_URL` in `public/assets/invest-links.js`. The build imports that value, writes it into static investment links, and automatically includes the shared script on every registered page. Static links therefore work with JavaScript disabled as well.

For future offerings, add a detail HTML file under `src/pages`, register its URL and source in `routes.json`, and add its card to the Offerings listing. Use an anchor or button labeled **Invest now**, or mark the action with `data-invest-now`. Running `npm run build` or restarting `npm run dev` applies the same portal destination automatically. This static frontend does not automatically synchronize new listings from the live site's content management system.

The 13 additional offering detail pages use the same five-tab structure as ERC Communities Inc. They include the original public company content, offering terms, tokenization details, and local images. The Invest now action takes the visitor to the portal homepage; it does not preselect a particular offering there.

### Additional local offering detail routes

| Offering | Route |
| --- | --- |
| AquaTerra Living - Invest in Floating Community Innovation | `/offerings/aquaterra-floating-communities` |
| ST Enterprises LLC - U.S. Industrial Assets Investment | `/offerings/st-enterprises-llc` |
| Azure Coast Resorts - Luxury Hospitality Investment | `/offerings/azure-coast-resorts` |
| Urban Modular Residential - High-Efficiency Housing Investment | `/offerings/urban-modular-residential` |
| Affordable Housing Solutions - Impact Investment Opportunity | `/offerings/affordable-housing-solutions` |
| W11 Demo Sandbox Offering | `/offerings/w11-demo-sandbox-offering` |
| Greenfield Sustainable Housing - Net-Zero Investment Opportunity | `/offerings/greenfield-sustainable-housing` |
| StreamVerse Entertainment - Interactive Streaming Investment | `/offerings/streamverse-entertainment` |
| Global Impact Ventures - Impact Investment Fund | `/offerings/global-impact-ventures` |
| GolfSuites Inc | `/offerings/golfsuites-inc-syndication-gamma` |
| PayFlow Technologies - Cross-Border Payment Investment | `/offerings/payflow-technologies` |
| Metropolitan Infrastructure Fund - Tokenized Infrastructure Investment | `/offerings/metropolitan-infrastructure-fund` |
| Community Solar Partners - Clean Energy Investment Portfolio | `/offerings/community-solar-partners` |

## Temporary images for the first three offering cards

The supplied images have been added in attachment order: ERC Communities Inc uses `erc-communities-placeholder.jpg`, GolfSuites Inc uses `golfsuites-placeholder.jpg`, and W11 Demo Sandbox Offering uses `w11-sandbox-placeholder.jpg`. Original image bytes are preserved.

The files are in `public/assets/images/`. To change one later, replace the corresponding JPG using the same filename and rebuild/redeploy the project. The markup is in `src/pages/offerings.html`. These images are temporary card visuals only.
