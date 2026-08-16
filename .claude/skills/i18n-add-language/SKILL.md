---
name: i18n-add-language
description: |
  Add a new language to Unify end-to-end: Sanity content (lesson/checklist/practice/quiz
  translations, draft-only) and the web app's UI-string locale. Extracted from the fr-CA
  (Canadian French) rollout — a real, completed run of this exact process. Use when asked to
  "add a language", "translate the app into X", "roll out i18n for X", or "do what we did for
  French but for X". Parameterized by target language code + display name; not French-specific.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - AskUserQuestion
---

# Add a new language (Sanity content + web UI strings)

This is the real recipe from the fr-CA (Canadian French) rollout, generalized. It is not a
theoretical process — every step, every pitfall, and every number below happened. Follow it
literally; don't re-derive the approach from first principles.

**Read this whole file before starting anything.** The pitfalls section at the bottom is not
optional reading — two of them cost real time (session-limit crashes, false audit positives)
the first time through.

## Inputs

You need the following before starting, either from `args` (e.g. `/i18n-add-language fr-CA
"French (Canada)" "Français (canadien)" FRENCH`) or by asking the user directly:

- **`LANG_CODE`** — the language code this project will use everywhere (e.g. `fr-CA`, `es-MX`).
  **Use a region-qualified code if the target has meaningfully different regional conventions**
  (date/number formatting, institutional vocabulary) — the code doubles as the `Intl` locale
  string on the web side, so `fr-CA` vs bare `fr` is the difference between "9 août 2026" and
  generic French formatting, for zero extra code. Confirm this choice with whoever requested the
  language before writing anything; it's expensive to rename later.
- **`SANITY_LANGUAGE_TITLE`** — the display name Sanity's Studio shows (e.g. `"French
  (Canada)"`). English-named, editor-facing.
- **`UI_NATIVE_LABEL`** — the label the web app's language picker shows, **in the language
  itself** (e.g. `"Français (canadien)"`, not `"French (Canada)"`). These are genuinely two
  different strings — don't conflate them into one "display name" input; the fr-CA rollout used
  different values for each and a shared field would silently produce the wrong one in one of the
  two systems.
- **`ENV_FLAG_SUFFIX`** — if gating (below), the uppercase, underscore-safe suffix for the feature
  flag, e.g. `FRENCH` (→ `NEXT_PUBLIC_ENABLE_FRENCH`), not the raw `LANG_CODE`. **Do not
  mechanically interpolate a region-qualified `LANG_CODE` into an env var name** —
  `NEXT_PUBLIC_ENABLE_fr-CA` is not a valid JS identifier and breaks dot-access (`process.env.NEXT_PUBLIC_ENABLE_fr-CA`
  parses as a subtraction expression). Pick a human-chosen, normalized name instead — this
  project used `NEXT_PUBLIC_ENABLE_FRENCH` for `fr-CA`, mirroring the existing
  `NEXT_PUBLIC_ENABLE_ARABIC` for `ar`.

Also confirm **scope**: Sanity content only, web UI strings only, or both (this rollout did
both). And confirm **gating**: should the language be visible immediately, or hidden behind the
`ENV_FLAG_SUFFIX` flag until native review (recommended default for a machine-translated first
pass — see Phase 2b).

---

## Phase 1 — Recon (do this before writing anything)

### 1a. Sanity: confirm scope and current state

Find the `documentInternationalization` plugin config (in this project:
`unify/sanity.config.ts`). Read its `supportedLanguages` array and `schemaTypes` array — the
latter is the list of document types that get translated. Confirm `LANG_CODE` is not already
present.

For each type in `schemaTypes`, get the base-language document count and current translation
coverage, so you have a real baseline to work against:

```groq
// perspective: 'raw' (required — otherwise drafts are invisible)
{
  "lesson_en": count(*[_type=="lesson" && language=="en" && !(_id in path("drafts.**"))]),
  // Aggregate across ALL lesson base docs, not just the first — [0] on an unfiltered
  // *[_type=="translation.metadata" && ...] reports one lesson's coverage, not the type's.
  "lesson_metadata_ids": *[_type=="lesson" && language=="en" && !(_id in path("drafts.**"))] {
    "metaId": *[_type=="translation.metadata" && references(^._id)][0]._id
  }.metaId,
  // repeat per schemaType
}
```

`lesson_metadata_ids` gives you the raw (possibly draft-or-published, ambiguously) id per lesson —
do **not** try to resolve each one's covered languages inline in GROQ by string-concatenating a
`drafts.` prefix onto whatever `[0]` returned. That reproduces the exact bare-id normalization bug
Phase 3 step 4a warns about: if `[0]` already returned a `drafts.`-prefixed id, prepending `drafts.`
again produces a nonexistent id and silently reports zero coverage. Instead, apply Phase 3 step 4's
canonical resolve → normalize → prefer-draft procedure to each id — as a normal step-by-step
sequence (strip any `drafts.` prefix yourself, then query `drafts.<bareId>` first, `<bareId>` as
fallback), not as one clever inline query.

This is a **recon-time approximation**, not a final audit — with hundreds of base docs, resolving
every id this way is exactly the per-document work Phase 3's query-tool-limits section warns can
time out at scale. If it does, run it on a sample or paginate; Phase 5a's flat `_id in [...]`
lookup against a batch of already-known ids is the pattern for when it must be exhaustive.

Read the actual schema for each type (`get_schema` / the type's file under `schemaTypes/`) and
classify every field as **translate** (human-readable text) or **copy verbatim** (structure,
refs, enums, numbers, booleans, slugs) — see Phase 3's field-classification table. Do this
per-project; field names differ.

**Check for an existing translation script** (this project has `unify/scripts/translate-*.ts` —
a Sanity Agent Actions-based translator). Read it even if you're not using Agent Actions,
because it documents the exact **deterministic ID convention**, the **additive metadata merge
shape**, and the **protected-phrases list** already established for this project — reuse them,
don't invent new conventions.

### 1b. Web UI strings: confirm structure

Find the locale directory (`lib/i18n/locales/` in the web-app repo). Confirm:
- The naming convention (2-letter codes like `en`/`vi`/`es`, or region-qualified like `fr-CA`?
  Match whatever's already there unless there's a reason to deviate — but see the `LANG_CODE`
  guidance above about region codes and date formatting).
- The exact leaf-key count of the baseline locale (`en`) via the project's own parity script
  (`scripts/check-i18n-parity.mjs` in this project) — this is your target for the new locale,
  not an estimate.
- Where languages are registered: the i18next `resources` map, a central
  `SUPPORTED_LANGUAGES`-style config object, and the parity script's own hardcoded locale list
  (it will NOT discover a new locale directory automatically — you must add the code to its list
  or it silently won't validate the new locale).
- **How date/time formatting resolves locale.** Grep for `toLocaleDateString`, `toLocaleTimeString`,
  `Intl.DateTimeFormat`, and any hardcoded locale string. In this project every call site already
  passes the active `i18n.language` straight into `Intl` — meaning a new locale needs **zero**
  formatting-code changes, because the resource key IS the Intl locale string. **Verify this
  holds** in whatever codebase you're working in; don't assume it — if formatting is hardcoded
  to one locale, you'll need to fix those call sites too.
- Whether the language should be **gated**. This project gates unreviewed machine translations
  behind a `NEXT_PUBLIC_ENABLE_<ENV_FLAG_SUFFIX>` flag (see how Arabic and now fr-CA are gated in
  `lib/i18n/config.ts` — `NEXT_PUBLIC_ENABLE_ARABIC`, `NEXT_PUBLIC_ENABLE_FRENCH`) so they're
  built and testable but hidden from the public picker until a native speaker reviews them.
  Reuse that pattern for a new language unless told otherwise.
- Any **shared-database constraint** on stored language preference (e.g. a Postgres `CHECK`
  constraint enumerating valid codes on a `preferred_language` column). If one exists and doesn't
  yet include your new code, cross-device sync will silently fail until it's updated — that's a
  shared-infra change requiring its own sign-off; don't bundle it into this rollout, just flag it.

### 1c. Report recon findings before translating anything

Show the human: base document counts per type, current language coverage, the field
classification you derived, and the UI key count. Confirm the `LANG_CODE` decision and gating
decision explicitly before proceeding — these are expensive to change after hundreds of docs
are translated.

---

## Phase 2 — Config wiring

### 2a. Sanity

Add `{id: LANG_CODE, title: SANITY_LANGUAGE_TITLE}` to `supportedLanguages` in the
`documentInternationalization` config. This is what makes the Studio's Translations UI recognize
the language — deploy the Studio (`npm run deploy` from the Studio package directory) once this
lands so the admin UI actually shows it.

### 2b. Web UI (if in scope)

Same shape every time, roughly 4 files:
1. Central language config — add `LANG_CODE: "UI_NATIVE_LABEL"` to the supported-languages map.
2. If gating: add `LANG_CODE` to the gated-languages set and a
   `process.env.NEXT_PUBLIC_ENABLE_<ENV_FLAG_SUFFIX> === "true"` check, mirroring however the existing
   gated language does it.
3. i18next `resources` registration — import the (not-yet-created) locale JSON and add it to the
   resources map.
4. The parity script's hardcoded locale list — add `LANG_CODE`, or it will never be validated by
   CI.
5. **If `LANG_CODE` has a region suffix** (`fr-CA`, not `fr`): check whatever function resolves
   `Accept-Language` headers on first visit. If it reduces `fr-CA` → base `fr` before matching
   against supported codes, a browser sending `fr-CA` won't match your `fr-CA`-keyed locale.
   Patch it to map the bare form to your region-qualified key — **but gate that mapping on the
   same enabled-check from step 2**, not just the "is this a known code" check. A first version of
   this exact patch in the fr-CA rollout mapped `fr` → `fr-CA` unconditionally, so a browser
   sending `Accept-Language: fr` auto-selected the pending-review catalog on first visit even with
   the flag off — silently defeating the entire point of gating. Caught in code review, not by
   this skill's first draft; now it is.

---

## Phase 3 — Content translation (the core work)

### The write pattern (validated, don't deviate)

For a source document with published id `SRC`:

1. **Fetch the full source document**, `perspective: 'raw'`, every field.
2. **Deep-clone it.** Change only `_id` (→ `SRC-LANG_CODE`), the language field (→ `LANG_CODE`),
   and the fields classified as "translate" in Phase 1. Drop `_rev`/`_createdAt`/`_updatedAt`.
   Everything else — every `_key`, `_type`, `marks`, `markDefs`, `style`, references, enum
   values, numbers, booleans, slugs — copied byte-for-byte. Array lengths and nesting must be
   identical to the source; only the translatable leaf strings differ.
3. **Write the draft.** Using the Sanity MCP `create_documents` tool with a bare `_id` of
   `SRC-LANG_CODE` — it automatically prefixes `drafts.`, producing `drafts.SRC-LANG_CODE`.
   **Never publish.** There is no reason to publish during this phase; native review and
   downstream app support (query filtering by language) come first.
4. **Merge into `translation.metadata` additively.** This is the step most likely to be gotten
   subtly wrong — read all four sub-steps before implementing it.

   a. **Resolve, then normalize to a bare id.**

      ```groq
      *[_type=="translation.metadata" && references("SRC")][0]._id
      ```

      This `[0]` can land on either the published copy or an existing draft — you cannot tell
      which from the result alone. **Strip a leading `drafts.` if present** to get `bareMetaId`
      before doing anything else. Skipping this is a real bug, not a hypothetical one: if you
      blindly prepend `drafts.` to whatever the query returned, and it already returned a
      `drafts.`-prefixed id, you construct `drafts.drafts.<id>` — a nonexistent document — and
      your "existing translations" read comes back empty, silently discarding every other
      language's link on the next write.

      **If the query returns nothing**, no metadata group exists for this document yet — this
      happens on a genuinely fresh document (e.g. one added since the project's languages were
      last set up, or a project running this skill for its very first language). Create one
      before continuing, using the same `create_documents` MCP tool this pattern uses everywhere
      else (not a raw `createIfNotExists` client call, which — unlike this tool — writes the
      supplied id as-is and would create a *published* group, breaking the draft-only rule):

      ```json
      {
        "_id": "i18n-<bareSource>",
        "_type": "translation.metadata",
        "schemaTypes": ["<sourceSchemaType>"],
        "translations": [
          {"_key": "<SOURCE_LANG>", "_type": "internationalizedArrayReferenceValue", "value": {"_type": "reference", "_ref": "<bareSource>", "_weak": true}}
        ]
      }
      ```

      `sourceSchemaType` is the base document's own `_type` (`"lesson"`, `"checklist"`, etc.);
      `SOURCE_LANG` is the source-language code (`"en"` in this project). **Seed the
      source-language entry — never start from an empty array.** This isn't just consistency
      with every other metadata group; it's required for step a's own resolution query to work
      at all: `references("SRC")` matches a document only if it contains a reference to `SRC`
      somewhere. An empty `translations: []` group has no references to anything, so it would be
      *permanently undiscoverable* by the exact query this step uses to find it — every future
      run would conclude no group exists and could try to recreate one. Then proceed to step b —
      the array now has one entry (the source language), not zero.

   b. **Read existing translations from the draft, preferring it over the published copy.**
      Because a prior patch on this exact document may already have created a draft copy,
      fetch `drafts.<bareMetaId>` first; only fall back to `<bareMetaId>` (published) if no draft
      exists yet. Reading from whichever copy an unqualified `[0]` happens to land on (the same
      ambiguity Phase 5a audits against) risks reading a **stale, unpatched published array** and
      overwriting a newer draft's already-merged languages.

   c. **Merge the new language in by `_key` — never by appending.** Build the result from the
      existing array keyed by `_key`, with the `LANG_CODE` key set (added, or overwritten if this
      exact merge is ever re-run — e.g. during Pitfall 2's crash-recovery flow) to:

      ```json
      {
        "_key": "LANG_CODE",
        "_type": "internationalizedArrayReferenceValue",
        "value": {"_type": "reference", "_ref": "SRC-LANG_CODE", "_weak": true}
      }
      ```

      A naive `[...existingEntries, newEntry]` append is a second real bug: on any re-run it
      produces a **duplicate `_key`** for the same language instead of replacing the stale entry.
      Merge through a map (`_key` → entry) and flatten back to an array — this is the same shape
      `unify/scripts/translate-lesson.ts` already uses; don't invent a different one.

   d. **Patch, guarded against a concurrent write.** `patch_documents` on `bareMetaId` with
      `set: {translations: <the merged array>}` and `ifRevisionId: <the _rev you read in step b>`
      — it accepts a bare/published id and transparently creates-or-edits the draft, so you don't
      need to target `drafts.<bareMetaId>` for the write itself (only for the *read* in step b).
      **Never** patch with just the new entry alone — that wipes every other language's link.

      The guard matters for a specific, real scenario, not races in general: **this skill's own
      concurrency discipline (2–3 agents, exclusive ID batches) already prevents two agents
      *within one language rollout* from touching the same metadata doc at once — that's not
      what this protects against.** It protects against two situations outside that discipline's
      reach, both sharing the same root cause (a stale read-then-blind-write on a document
      *other* rollouts also write to): running two *different* language rollouts against this
      project concurrently (metadata docs are shared across every language, so a fr-CA batch and
      an es-MX batch can legitimately race on the exact same document), and a crash-recovery
      re-run (Pitfall 2) that starts before an earlier, still-finishing run on the same content
      has fully stopped. Either way, without the guard, the second writer's blind
      `set: {translations: ...}` can silently overwrite the first writer's just-added language
      entry — same failure mode step c's merge-by-key already fixed for the *single-writer*
      case, just now for two writers. **On a revision conflict, reread the document (back to
      step b), redo the merge (step c) against the now-current array, and retry the patch** —
      don't just fail the whole document.

      The published copy itself is left untouched by any of this (why the draft/published
      distinction and the read-before-merge care in steps a–b matter in the first place).
5. **Idempotency check, always, before steps 2–4 — and it's two conditions, not one**:
   - Does `drafts.SRC-LANG_CODE` (the **content**) already exist, *and* does the metadata group
     already link `LANG_CODE`? → fully done, skip entirely.
   - Does the content draft exist but the metadata link is **missing**? → this is a real, common
     outcome of a crash between step 3 and step 4 (or of a batch that ran step 3 for many docs
     before step 4 for any of them). **Do not skip it as "already translated."** Perform only the
     cheap metadata merge (step 4) — do not re-translate content that already exists.
   - Neither exists? → run the full sequence.

   This distinction is what makes recovery from a crash mid-batch (see Pitfall 2) cheap: querying
   ground truth after a crash and finding "content exists, metadata doesn't" is normal and fixed
   in seconds per document, not by re-translating.

### Field classification (general shape — re-derive exact field names per schema)

| Translate | Copy verbatim |
|---|---|
| title, description, any free-text field | language field itself (→ new code) |
| Portable Text span `text` | Portable Text `_key`, `_type`, `marks`, `markDefs`, `style`, `listItem`, `level` |
| labels, placeholders, alt text | link `href` / URLs |
| question text, option text, explanations | option `value` / ids, `is_correct`, other booleans |
| accepted free-text answers (if graded against them) | slug (always copy the source slug verbatim — never translate it) |
| — | every reference (`_ref`) — refs point at other docs, not text |
| — | numbers, order/index fields |

**The one genuinely ambiguous field**: any "accepted answer" text that's matched against
learner-typed input (fill-in-the-blank, short answer). If the grading logic does a normalized
string match against the learner's own-language input, translate it. If it's matched against a
canonical/English value regardless of UI language, don't. Check the actual grading code — don't
guess.

### Terminology policy — confirm before scaling, not after

If the target domain has government/financial/institutional terms with official translations
that differ from a literal translation (in this rollout: RRSP→REER, not "RRSP" or a literal
translation) — **stop and get an explicit policy decision from a human before running more than
one pilot batch.** This rollout translated ~185 documents before this question surfaced, which
meant a remediation pass across everything already done. Ask up front: "for institutional
acronyms, use the target language's official name/acronym, or keep the source term verbatim?"
Get an explicit list of terms this applies to if the answer is "official equivalents" — and
accept that agents will encounter terms outside that explicit list and need to extend the
pattern by judgment; flag those extensions for human spot-review rather than treating them as
errors.

### Batching and concurrency — the hard-won part

**This rollout hit a full session-usage-limit crash twice**, both times from launching 7–8
parallel agents at once translating large documents via ordinal GROQ slices (`[0...14]`,
`[14...28]`, ...). Do not repeat that. Instead:

1. **Pilot first, always.** Translate one document by hand (or via a single agent), verify the
   write shape end-to-end (draft exists, metadata correctly merged, nothing published), before
   automating anything.
2. **Then a small single-agent batch** (5–8 docs) to validate that an agent can follow the
   recipe unattended and produce structurally correct output. Verify it.
3. **Then scale, but conservatively**: **cap concurrency at 2–3 parallel agents**, not 7–8.
   Translation work on long documents (lessons, in this rollout) consumes a lot of budget per
   doc; more parallelism does not reliably mean more throughput if it trips a session limit
   mid-batch, and a crash leaves partial writes that cost time to reconcile.
4. **Give each agent an exact list of document IDs, not an ordinal GROQ range.** Ordinal ranges
   (`[X...Y]`) are ambiguous under concurrent/retried runs and made post-crash reconciliation
   much harder than it needed to be. Once Phase 1 recon has the full base-document ID list,
   split it into explicit ID batches per agent.
5. **Explicitly forbid agents from spawning their own sub-agents or forks to parallelize their
   assigned batch.** This happened unprompted in this rollout (an agent split its 5-lesson
   assignment across 4 of its own forks) and silently multiplied concurrency far past what was
   launched at the top level — a direct contributor to both session-limit crashes. State this as
   a hard constraint in every batch-translation agent prompt: *"Process your assigned documents
   yourself, one at a time, sequentially. Do not spawn sub-agents or forks."*
6. **If a wave crashes mid-batch**: don't guess what got done. Query ground truth from Sanity
   directly (see Phase 5's coverage audit) before relaunching anything — check both content-draft
   existence and metadata-merge completeness per document. Fix any content-exists-but-metadata-
   missing gaps with a direct, cheap patch (no re-translation needed) before relaunching
   translation for the genuinely-untouched remainder.

### Query-tool limits worth knowing

- Sanity's query tool has its own result-count `limit` parameter (commonly defaults to 10, capped
  at 100), **separate from** any GROQ array slicing you write. Set it explicitly whenever you
  expect more than the default — a GROQ `[0...50]` slice with an unset/low tool limit silently
  truncates to far fewer results and will make you think you've covered more ground than you
  have.
- A GROQ query that does an expensive nested per-document subquery filter across hundreds of
  documents (e.g., checking a computed draft-id's existence *inside* a `*[...]` filter applied to
  every document) can time out. For bulk verification of many known IDs, prefer a flat
  `_id in [list of exact ids]` lookup over a filtered scan with per-document subqueries.

---

## Phase 4 — UI string translation

Simpler than content: translate the full baseline locale JSON, preserving structure exactly.

- Every `{{token}}` interpolation placeholder preserved exactly (same name, same count/format
  specs like `{{count, number}}`).
- Proper nouns / brand names kept as-is.
- **Structure must match the baseline byte-for-byte**: same keys, same nesting, arrays stay
  arrays. The parity script typically treats *missing* keys as a soft warning (falls back to the
  baseline language) but *extra*/orphan keys or interpolation-token drift as a hard failure — so
  0 extra keys matters as much as 0 missing.
- This is large-ish (this rollout: 1532 leaf keys across 41 namespaces) but doesn't carry the
  same structural-corruption risk as Portable Text — it's fine to do as 1–2 larger agent calls
  rather than the tight batching discipline Phase 3 needs.

---

## Phase 5 — Verification

Do all of this. Do not report "done" on the strength of what translation agents said they did —
verify against the actual database/filesystem state independently, in every case.

### 5a. Coverage audit (ground truth, not agent self-reports)

For each schema type, directly query Sanity for: base document count, translated-draft count,
metadata-linked count, and — critically — **published count for the new language, which must be
zero** throughout this entire process.

**Known pitfall: the draft/published metadata ambiguity.** Every metadata document you touch via
step 4 of the write pattern ends up with *two* copies sharing the same content-identity — an
untouched **published** copy (never has your new language, since you never publish) and a
**draft** copy (has it). A naive audit query like
`*[_type=="translation.metadata" && references(SRC)][0]` is ambiguous whenever both exist — `[0]`
can resolve to either one non-deterministically. This produces **false "missing metadata"**
reports. It cannot produce a false "complete" report — a genuinely untouched document has no
draft copy at all, so both interpretations agree it's missing. That asymmetry means: trust a "0
missing" result completely, but **independently re-verify every single flagged "missing" case**
by looking up its `drafts.<metaId>` directly (`_id in [...]` lookup, not the ambiguous
reference-based query) before treating it as a real gap and re-translating it. In this rollout,
every one of 42 flagged "gaps" across three document types turned out to be this false positive
— confirm before you re-do work that's already done.

### 5b. Structural preservation spot-check

For a sample of translated documents per type, directly diff the copy-verbatim fields (a
reference `_ref`, an enum value, a slug, an order number) against the source, and confirm the
translatable fields actually changed (aren't still byte-identical to source). Don't rely solely
on an agent's self-reported block/span counts — spot-check a few independently.

### 5c. UI string verification

- Run the parity script — must report the new locale's key count matching baseline, 0
  missing/extra.
- Typecheck + lint the touched config files.
- **English-leakage audit**: programmatically diff every leaf value in the new locale against the
  baseline; every identical value should be explainable (proper noun, a word that's spelled the
  same in both languages, a token-only string) — not a genuine untranslated leftover.
- **Real runtime verification, not just structural**: actually initialize the app's i18n library
  with the new resource file and call real translation lookups against **real key paths taken
  from the actual JSON** (don't guess plausible-sounding key names — a first attempt at this in
  this rollout guessed several wrong paths and produced false "untranslated" results). Also
  exercise the actual date/time formatting code path with the new locale code and confirm it
  produces target-locale-appropriate output, not source-locale output.
- If feasible without disrupting a shared/live dev server: a real browser check with the language
  active. If a gating flag blocks the picker and restarting the dev server to flip it risks
  disrupting other in-progress work, the runtime-library check above is an acceptable substitute
  — say so explicitly rather than silently skipping browser verification.

---

## Phase 6 — Ship

- Everything in Sanity stays in **draft**. Do not publish as part of this skill — that's a
  separate, explicit decision gated on native review and on the consuming app(s) actually
  filtering queries by language (publishing before that duplicates content in production).
- Deploy the Studio (so the Translations UI shows the new language) — this can happen
  independent of git/PR state, since it builds from local files.
- Commit config changes on a feature branch, one PR per repo touched, standard review process.
  Do not merge without either a clean review or the human's explicit go-ahead.
- If gated, the flag defaults off — flipping it (and lifting any shared-database constraint
  needed for cross-device sync) is a separate, later decision.

---

## Pitfalls, explicitly (recap)

1. **Draft/published `[0]`-selector ambiguity** in metadata audits → false "missing" positives,
   never false "complete" positives. Re-verify flagged gaps via direct id lookup before
   re-translating. (Phase 5a)
2. **Session-limit crashes from too much parallelism.** Cap concurrency at 2–3 agents, use exact
   ID lists not ordinal ranges, explicitly forbid agents from spawning their own sub-agents/forks.
   (Phase 3, batching section)
3. **GROQ timeouts** from expensive nested per-document subqueries at scale — use flat `_id in
   [...]` lookups for bulk checks instead. (Phase 3, query-tool limits)
4. **Query tool's own `limit` parameter** is separate from GROQ slicing and defaults low — set it
   explicitly or silently under-fetch. (Phase 3, query-tool limits)
5. **Terminology/acronym policy ambiguity** surfacing mid-rollout costs a remediation pass. Get
   the policy decision before scaling past a pilot batch. (Phase 3, terminology policy)
6. **Guessed translation-key paths** in runtime verification produce false failures — always
   pull real key paths from the actual JSON before testing lookups. (Phase 5c)
7. **Un-gated region-code negotiation.** A `base-language → region-qualified-code` mapping in
   Accept-Language negotiation (Phase 2b, item 5) must check the *same* enabled-flag as the
   picker, not just "is this a recognized code" — otherwise a browser header alone auto-selects a
   deliberately-hidden, unreviewed language on first visit, silently defeating the gate. Caught
   by code review after this skill's first draft shipped without it.

## Worked example (fr-CA, Canadian French — the rollout this skill was extracted from)

For calibration: 435 Sanity documents across 4 types (208 lessons, 170 checklist, 39 practice,
18 quiz), 1532 UI string keys across 41 namespaces. Two session-limit crashes recovered from
cleanly using the ground-truth-first + exact-ID-batch approach this skill now prescribes from the
start. Zero documents published at any point. Two PRs (one per repo), Studio deployed
independently of PR merge state.
