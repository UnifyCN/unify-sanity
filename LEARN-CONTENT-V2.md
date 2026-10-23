# Learn design and content contract

Status: app readers implemented and tested locally. Studio deployed. 142 English lessons and 174 translated lessons published and verified. Remaining catalog content is under editorial review. Selected resume option: A (2026-10-21).

## Reference and scope

Figma file `ogEzPZmWDVLmZl3D0R0VCW`:

- `8888:207`: Learn and category list. Replace its large resume card with selected prototype A.
- `8889:687`: category title, description, and module progress cards.
- `8889:773`: module description, progress, and lesson rows.
- `8889:855`: lesson reader with Concept, Example, Quick check, Visual, FAQ, and Citations.

Use system typography, white surfaces, 16-17 point content gutters, 16 point card corners, and 44 point minimum controls. Use actual content and progress. Figma titles, durations, and percentages are sample content. A new learner has no resume row. Returning learners see their latest unfinished lesson. Other active lessons remain available in a sheet. Keep the Resources view, existing task/practice flows, saved pages, highlights, and analytics.

The existing application allows access to all categories and lessons. The redesign does not add locks based on the gray sample rows in Figma. The existing bottom tab bar remains shared app navigation.

## Category symbols

Use SF Symbols on iOS through `expo-image`. Use Material Community outline equivalents on Android. Map stable Sanity document IDs, not translated titles or the current ambiguous icon field. The implementation is `components/learn/CategorySymbol.tsx`.

| Topic | SF Symbol |
| --- | --- |
| Documentation | person.text.rectangle |
| Employment | briefcase |
| Housing | house |
| Healthcare | cross.case |
| Scam prevention | checkmark.shield |
| Education | graduationcap |
| Finance | banknote |
| Canadian culture | globe.americas |
| Permanent residence | person.crop.rectangle |
| Mental health | brain.head.profile |
| Taxes and benefits | doc.text |
| Transportation | tram |
| Universities and colleges | building.columns |
| Unknown future topic | book.closed |

## Content contract

The canonical Studio source is `UnifyCN/unify-sanity`, project `fercgabp`, dataset `production`. Both mobile and web read this dataset.

Add optional `contentVersion: 2`, `sections`, and `readingMinutes` to each existing `pages[]` entry. Each section has a stable `_key` and an optional translated `title`. Supported types:

| Type | Fields |
| --- | --- |
| lessonConcept | content: Portable Text |
| lessonExample | theory, practice: Portable Text |
| lessonVisual | image with alternative text, optional content and caption |
| lessonQuickCheck | question, options with one correct answer, explanation |
| lessonFaq | items with question and Portable Text answer |
| lessonCitations | sources with title, publisher, year, and HTTP(S) URL |

New lessons can use one content page with all sections. Existing multi-page lessons retain their pages. Do not flatten or reorder published pages. The Back/Next flow, activity pages, quizzes, ending pages, and completion rules remain in effect. The Next lesson label applies only when the action actually opens the next lesson.

Quick checks give local feedback and allow a retry. They do not replace scored quizzes or write quiz progress. FAQ disclosures and example tabs use local state. Citation links open their source. The visual image comes from authored Sanity content. The water image in Figma is sample lesson media, not app chrome.

## Compatibility and migration

Keep `pages[].content` as a readable projection for older clients and for search, read-time, and retrieval consumers. Studio provides a **Sync legacy content** action. The action saves a draft only and uses a revision guard. Validation blocks publication when the projection differs from the new sections.

The migration adds one Concept section containing each existing page's unchanged content. It does not infer educational meaning, fabricate FAQs, answers, sources, or reading times. Editors can then split the content into the appropriate section types. The migration preserves document IDs, references, page order, page keys, block keys, span boundaries, text, links, and assets. It is idempotent. Its output is an inspectable set of revision-guarded patches. It does not publish content.

Migrate each language document from its own content. Do not copy English content into translated documents. Two published Punjabi documents have page keys that differ from their English source: `7277fa7d-f24f-4faa-8c21-49dfb25b2a5e-pa` and `a3584573-51db-4c69-b0cd-bcddb3aaaa16-pa`. Keep those identities during this migration. Their existing mobile overlay behavior requires separate content reconciliation before changing any keys.

Mobile selects translated sections by the stable page key, independently from the English section tree. If translated sections are absent, it uses the translated legacy content. Section keys can change independently across languages without replacing Spanish text with English. Mobile and web choose the new sections only when version 2 and a nonempty section array are present. Otherwise they use the existing content. Retain legacy content until older mobile versions are no longer supported and all retrieval/search consumers have moved.

## Authoring and translation

Create sections in the Studio, then run **Sync legacy content** on the draft. Validation prevents publication while the older-reader projection differs. Keep page and block keys when moving existing content into sections. The translation script now supports all six target languages. For new structured translations, it checks array structure, keys, references, URLs, numbers, and answer flags. It derives the legacy projection from translated sections. It leaves drafts for editorial review. Existing linked translations are preserved. A structural failure requires correction of the draft before publication. Automated translation quality and hosted execution are not verified by the local tests.

From the canonical Studio directory, generate a dry run from a fresh dataset export:

```sh
node --experimental-strip-types scripts/migrate-lesson-sections.mts export.ndjson patches.json
node --experimental-strip-types --test scripts/lessonContent.test.mts scripts/translatedLesson.test.mts scripts/lessonSchema.test.mts
```

The first command writes patches to disk. It sends no mutations. The initial conversion preserves all existing text in Concept sections. Splitting that text into Example, Quick check, FAQ, and Citations is a separate editorial operation.

## Acceptance evidence

- Resume excludes untouched/completed lessons and keeps lesson/activity/quiz/ending destinations.
- Migration preserves the complete original content and every page identity, including localized documents.
- Category icons remain correct across languages.
- Concept text keeps selection, highlights, and Ask AI. Saved page routes keep their page number.
- Examples switch; quick checks give feedback; FAQs expand; source links open safe URLs.
- Small screens, long titles, text scaling, and safe areas remain usable.
- Loading, empty, progress failure, refresh, completed, and multiple active lesson states remain available.
- Mobile typecheck, tests, translation parity, and native export pass. Studio typecheck/build and migration tests pass. Web tests/build and translation parity pass.
- Capture native Simulator evidence. Distinguish native fixture proof from authenticated account data.

## Rollout order

1. Review the app, web, and Studio changes together.
2. Deploy compatible readers and the Studio schema.
3. Export the dataset and generate guarded additive migration patches.
4. Review preservation checks and language exceptions.
5. Apply the reviewed migration. Re-read the affected documents and verify revisions and content.
6. Edit lesson sections with content review. Keep the legacy projection synchronized.

No production publication is part of local implementation verification.

## Local verification, 2026-10-21

- Mobile: 328 tests passed in 40 suites. TypeScript, changed-source lint, all seven locale files, and iOS/Android exports passed.
- Studio: typecheck and production build passed. Six migration, translation, and schema validation tests passed. No Studio deployment or hosted mutation was performed.
- Web: typecheck, changed-source lint, production build, and 15 existing tests passed. Those unit tests cover email filtering. A separate browser check used the real structured reader at 360 and 1280 px. It passed Example switching, wrong/correct answer retry, FAQ disclosure, safe source links, section anchors, keyboard focus, and overflow checks. Existing unrelated translation fallbacks remain; every new Learn key has all seven translations.
- Data: a public read exported 1,456 lessons with 208 per language. The dry run preserved 2,856 content pages, all original fields, keys, spans, links, assets, endings, and activities. It was idempotent.
- Native: the authenticated Learn, category, module, and legacy lesson screens rendered in an iPhone 17 Pro Simulator. A temporary native fixture used the actual resume and structured reader components with sample text. Taps verified Example, FAQ, and wrong/correct Quick check feedback. The fixture wrote no progress and was removed after capture. At the user request, the development-only preview route was restored for interactive Simulator review.
- Text scaling: module content remained readable at iOS extra-extra-extra-large. The existing shared bottom tab labels become crowded at that size.
- Evidence: `.design/learn-evidence/` in the mobile worktree. Sample content screenshots are labeled as fixtures. No claim of hosted migration, TestFlight distribution, VoiceOver end-to-end testing, or saved-highlight runtime verification is made.
- Resume destinations preserve stored section state. Ending-page position persistence is an existing gap; this change does not add it.

## Work locations

- Mobile: `/Users/savargupta/.t3/worktrees/Unify/prototype-learn-resume-options`, branch `prototype/learn-resume-options`.
- CMS: `/Users/savargupta/Github/unify-sanity/.claude/worktrees/learn-content-v2`, branch `feat/learn-content-v2`.
- Web: `/Users/savargupta/Github/Unify-Web-App/.claude/worktrees/learn-content-v2`, branch `feat/learn-content-v2`.

## Final visual corrections

The user requested Figma category colors. Documentation uses coral, employment blue, housing peach, and healthcare plum. Other topics use coordinated soft colors. All 14 symbol color pairs exceed 4.6:1 contrast. Cards remain white. The Courses header now uses the Figma 16 point heading, 12 point plain filter labels, and a thin divider. All and Started retain 44 point touch areas.

The development-only route `myapp:///learn-design-preview` shows the real compact resume and structured reader with sample content. It redirects to Learn in production. The user requested this route for Simulator inspection; it is not a published lesson.

## Publication update, 2026-10-22

The deployed Studio supports the new section schema. Four English budgeting lessons and their 24 translations now use the structured reader. Fresh published reads exactly match the independently reviewed batches. Each translated lesson keeps its original teaching content, page identities, and links. The Hindi emergency-fund answer was corrected before publication. The other catalog candidates remain local until their content and sources pass review.

Current checks: 329 mobile tests and eight CMS tests pass. CMS production build passes. Native taps on published English content confirm Example switching and wrong/correct Quick check feedback. These checks do not establish VoiceOver, all translated native layouts, or catalog-wide publication.

The first catalog publication added 25 independently accepted English lessons. All 25 drafts passed schema validation with only existing slug warnings. Fresh published reads match the reviewed pages exactly. The complete live count is 29 structured English lessons plus four lessons in each of six translated languages, 53 published documents total. Five pre-existing drafts remain unchanged. Translations for the 25 new English lessons are in preparation. Eight held records from the first review remain excluded.

The second catalog publication added 41 accepted English lessons. Six held records were excluded. Full draft validation returned zero errors and unchanged slug warnings. Published reads match the reviewed pages. Current live total: 70 English lessons and 24 translated budgeting lessons, 94 documents. Translation preparation continues for the two catalog batches.

The third catalog publication added 40 accepted English lessons, excluding six held records. Fresh published reads match the reviewed pages. Current total: 110 English and 24 translated budgeting lessons, 134 documents. The first 150 catalog translations are prepared locally and await semantic review. Two further translation batches are in preparation.

Publication update: catalog batches 4 and 5 added 32 English lessons. The latest verified export contains 142 structured English lessons and 24 translated budgeting lessons, 166 documents. There are 66 English lessons still pending. Five pre-existing drafts remain unchanged. Batch 5 includes one separately reviewed correction to an original CRS span. Two live aggregate checks found zero saved highlights on that block. This exception does not establish preservation of all original text. The archive records the before and after text.

Translation update: the first 150 catalog translations passed page schema validation after 31 field corrections across 26 records. Independent review of those corrections remains pending. These catalog translations are not published. Further automatic translation is blocked by the Sanity AI usage quota. Prepared local candidates remain available for review.

Translation publication update: all 150 translations of catalog batch 1 are published. Independent review accepted 31 corrections across 26 records. Before publication, all source and target revisions matched and no target drafts existed. Saved drafts matched reviewed pages and unchanged other fields. Full Studio validation returned zero errors and 150 slug warnings. Fresh published reads exactly match all 150 reviewed records, with 25 records per translated language and no remaining batch drafts. The latest verified totals are 142 English lessons plus 174 translations, 316 structured documents. Each translated language has 29 structured lessons. Other catalog work remains incomplete.
