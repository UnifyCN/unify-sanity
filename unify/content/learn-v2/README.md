# Learn editorial batches

`budgeting.en.json` contains four English lesson additions. Existing teaching text is preserved. New examples use hypothetical figures. Citation links point to primary government sources checked on 2026-10-21. `catalog-audit.json` records gaps across the 208 English lessons in the source export.

Prepare a batch offline from the current export:

```sh
node --experimental-strip-types scripts/prepare-lesson-enrichment.mts /tmp/unify-lessons-export.ndjson content/learn-v2/budgeting.en.json /tmp/unify-budgeting-enrichment.json
node --experimental-strip-types scripts/validate-enriched-lessons.mts /tmp/unify-lessons-export.ndjson /tmp/unify-budgeting-enrichment.json
```

The second command validates the actual page schema. It does not query slug uniqueness, permissions, or hosted references. The preparation refuses already structured pages. It preserves original content as a prefix and checks page identities. Re-read document revisions and existing drafts before applying updates. Publish only the reviewed draft revision. Keep an original export and the exact applied batch for recovery.

Status: four English lessons published on 2026-10-21. Studio deployment and revision-guarded publication succeeded. Published page data exactly matches reviewed batch SHA-256 `114e491dbd302e4d91bb2763f635d5b3871615d76e8e7e9736dd9995c3eaf063`. The 24 translated additions were published on 2026-10-22 after independent review. All published pages exactly match reviewed batch SHA-256 `3d6e560bdb5433f997dc2c89ec02d021cef811a9474b014ff2dbc8ced47bd1d2`. The additions are archived in `budgeting.translations.json`. Remaining catalog enrichment is pending. Do not treat the catalog audit as completed editorial work. Existing translated content remains available through the language-specific fallback.

Hosted validation: Sanity MCP retains an old schema view and cannot execute the custom slug validator. The Studio CLI validated all four downloaded drafts with zero errors. The four slug warnings also occur in the original published documents. No slug values changed.

`catalog-batch-1.en.json` archives the additions for 25 more English lessons published on 2026-10-22. Independent review accepted these records and held eight other records, which were excluded. All published pages exactly match the reviewed subset. Translation preparation is running. This brings the live structured total to 29 English lessons and 24 translated budgeting lessons.

`catalog-batch-2.en.json` archives 41 further English lessons published on 2026-10-22. Six rejected records were excluded. All published pages match the independently reviewed subset. Current structured total: 70 English lessons plus 24 translated budgeting lessons. Translation preparation for both catalog batches remains in progress.

Third catalog batch: 40 accepted English lessons published and verified against exact reviewed pages. Full draft validation returned zero errors and 40 existing slug warnings. Six held records were excluded. Additions archive: `catalog-batch-3.en.json` in the canonical Studio. Current live total: 110 English plus 24 translations. The first 150 catalog translations are local candidates only, pending semantic review.

Publication update: catalog batches 4 and 5 added 32 English lessons. The latest verified export contains 142 structured English lessons and 24 translated budgeting lessons, 166 documents. There are 66 English lessons still pending. Five pre-existing drafts remain unchanged. Batch 5 includes one separately reviewed correction to an original CRS span. Two live aggregate checks found zero saved highlights on that block. This exception does not establish preservation of all original text. The archive records the before and after text.

Translation update: the first 150 catalog translations passed page schema validation after 31 field corrections across 26 records. Independent review of those corrections remains pending. These catalog translations are not published. Further automatic translation is blocked by the Sanity AI usage quota. Prepared local candidates remain available for review.

Translation publication update: all 150 translations of catalog batch 1 are published. Independent review accepted 31 corrections across 26 records. Before publication, all source and target revisions matched and no target drafts existed. Saved drafts matched reviewed pages and unchanged other fields. Full Studio validation returned zero errors and 150 slug warnings. Fresh published reads exactly match all 150 reviewed records, with 25 records per translated language and no remaining batch drafts. The latest verified totals are 142 English lessons plus 174 translations, 316 structured documents. Each translated language has 29 structured lessons. Other catalog work remains incomplete.
