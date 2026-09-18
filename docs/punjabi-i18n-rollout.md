# Punjabi (pa) content rollout

Adds Punjabi (locale `pa`, Gurmukhi script) as a fifth translation target for the
Learn/Checklist content catalog, following the same zero-AI-Credits pattern already
used for Vietnamese, Spanish, Hindi, and Arabic (and most recently French/fr-CA).

## What this is

- **Content only.** Every `pa` document was written directly via the Sanity MCP
  (`create_documents` / `patch_documents`) — no Sanity Agent Actions, no AI Credits,
  no Translate feature.
- **Drafts only, nothing published.** Every `pa` document exists as
  `drafts.<sourceId>-pa` and is linked into its source's `translation.metadata`
  group additively (existing `en`/`vi`/`es`/`hi`/`ar`/`fr-CA` links untouched).
- **`documentInternationalization` plugin config is untouched**, as are all existing
  translations in every other language. This PR contains no schema/config changes —
  see the note below on why.

## Final counts (435/435)

| Document type | English sources | `pa` drafts created | `pa` linked in metadata |
| -------------- | ---------------: | -------------------: | ------------------------: |
| lesson         | 208              | 208                  | 208                        |
| checklist      | 170              | 170                  | 170                        |
| practice       | 39               | 39                   | 39                         |
| quiz           | 18               | 18                   | 18                         |
| **Total**      | **435**          | **435**              | **435**                    |

`module` (15) and `submodule` (61) are intentionally excluded — they have never been
translated into any of the existing languages (vi/es/hi/ar/fr-CA all skip them), so
this rollout mirrors that same boundary rather than expanding scope.

## Note: fr-CA is actually published, not draft-gated

The original assumption going into this rollout was that fr-CA (the most recent
language added) sits in an "unpublished, pending native review" state, and that
Punjabi should follow the same gate. That assumption does not hold: as of this
rollout, **all 208 fr-CA lessons (and all 170/39/18 checklist/practice/quiz fr-CA
docs) are published**, alongside vi/es/hi/ar. None of the five existing languages
are currently held as drafts.

Punjabi was still built and left as **drafts only**, per explicit instruction for
this rollout — but the publish decision should be made explicitly by a human
reviewer rather than assumed to follow "the same gate as the other languages,"
since that gate does not currently exist in practice. Native-speaker review of the
`pa` translations (and a decision on whether/when to publish, and whether to also
revisit the fr-CA precedent) is an open follow-up, not something this PR resolves.
