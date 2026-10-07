# Verification record

Captured and checked on 7 October 2026.

| Check | Result |
| --- | --- |
| All 23 requested unique source URLs returned successfully | Passed |
| Static build generates all 23 route directories | Passed |
| Original H1/H2/H3 content matches every copied page | Passed at capture; About leadership subsequently updated as requested |
| Production stylesheet matches original bytes | Passed |
| 305 original asset references resolve to local files | Passed |
| Downloaded images are retained without recompression | Passed |
| Four font families are present locally | Passed |
| Original server/router executable scripts removed | Passed |
| Local links resolve to included routes or assets | Passed |
| Frontend JavaScript syntax | Passed |
| Desktop dropdowns, close-on-Escape, and mobile menus across 23 pages | Passed in DOM tests |
| Offering filters: region, availability, combined empty results, and reset | Passed in DOM tests |
| Offering detail tabs: all five contents and keyboard wrap-around | Passed in DOM tests |
| Contact form validates locally and prevents network submission | Passed in DOM tests |
| Live original homepage visual/typography inspection | Completed |
| Offering tab contents inspected on the live original | Completed |
| Generated frontend desktop/mobile screenshot comparison | Unavailable in this environment |

DOM tests verify behavior and document structure; they do not verify rendered pixel dimensions. The graphical verification limitation is documented in the README.

Requested update: About leadership now contains only Steven Taracevicz and his existing photo and title.

## Invest now update

- Build and resource checks pass for 36 local pages and 406 local asset references.
- All 14 offering cards open included local detail routes.
- Every static Invest now link, including template content, points to `https://investor.equilibria.net/`.
- DOM checks pass for all five tabs on all 14 offerings.
- Dynamically inserted investment links and subsequently changed href values are corrected to the shared portal URL.
- Future static anchor and button investment actions use the shared destination at build time.
- No remote rendering asset dependencies remain on the offering detail pages.
- The About Leadership section still contains only Steven Taracevicz.

Graphical browser comparison remains unavailable in this environment.

## Temporary offering card images

The first three offering cards each contain one supplied image, stored locally with original bytes preserved. Their original card sizes, Open badges, detail links, filtering attributes, and text are retained.
