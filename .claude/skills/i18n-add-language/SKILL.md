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

You need two things before starting, either from `args` (e.g. `/i18n-add-language fr-CA "French
(Canada)"`) or by asking the user directly:

- **`LANG_CODE`** — the language code this project will use everywhere (e.g. `fr-CA`, `es-MX`).
  **Use a region-qualified code if the target has meaningfully different regional conventions**
  (date/number formatting, institutional vocabulary) — the code doubles as the `Intl` locale
  string on the web side, so `fr-CA` vs bare `fr` is the difference between "9 août 2026" and
  generic French formatting, for zero extra code. Confirm this choice with whoever requested the
  language before writing anything; it's expensive to rename later.
- **`LANG_DISPLAY_NAME`** — human display name (e.g. `"French (Canada)"` for Sanity,
  `"Français (canadien)"` for the web UI's native-label picker).

Also confirm **scope**: Sanity content only, web UI strings only, or both (this rollout did
both). And confirm **gating**: should the language be visible immediately, or hidden behind a
`NEXT_PUBLIC_ENABLE_<LANG>`-style flag until native review (recommended default for a
machine-translated first pass — see Phase 2b).

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
  "lesson_existing_langs": array::unique(*[_type=="translation.metadata" && "lesson" in schemaTypes][0].translations[]._key),
  // repeat per schemaType
}
```

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
  behind a `NEXT_PUBLIC_ENABLE_<LANG>` flag (see how Arabic and now fr-CA are gated in
  `lib/i18n/config.ts`) so they're built and testable but hidden from the public picker until a
  native speaker reviews them. Reuse that pattern for a new language unless told otherwise.
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

Add `{id: LANG_CODE, title: LANG_DISPLAY_NAME}` to `supportedLanguages` in the
`documentInternationalization` config. This is what makes the Studio's Translations UI recognize
the language — deploy the Studio (`npm run deploy` from the Studio package directory) once this
lands so the admin UI actually shows it.

### 2b. Web UI (if in scope)

Same shape every time, roughly 4 files:
1. Central language config — add `LANG_CODE: "LANG_DISPLAY_NAME"` to the supported-languages map.
2. If gating: add `LANG_CODE` to the gated-languages set and a
   `process.env.NEXT_PUBLIC_ENABLE_<LANG> === "true"` check, mirroring however the existing
   gated language does it.
3. i18next `resources` registration — import the (not-yet-created) locale JSON and add it to the
   resources map.
4. The parity script's hardcoded locale list — add `LANG_CODE`, or it will never be validated by
   CI.
5. **If `LANG_CODE` has a region suffix** (`fr-CA`, not `fr`): check whatever function resolves
   `Accept-Language` headers on first visit. If it reduces `fr-CA` → base `fr` before matching
   against supported codes, a browser sending `fr-CA` won't match your `fr-CA`-keyed locale.
   Patch it to map the bare form to your region-qualified key.

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
4. **Merge into `translation.metadata` additively.** Find the doc via
   `*[_type=="translation.metadata" && references("SRC")][0]` (perspective `raw`), take its
   `translations` array **verbatim**, and append (or replace, if re-running) one entry:
   ```json
   {
     "_key": "LANG_CODE",
     "_type": "internationalizedArrayReferenceValue",
     "value": {"_type": "reference", "_ref": "SRC-LANG_CODE", "_weak": true}
   }
   ```
   Patch with `set: {translations: [...existingEntries, newEntry]}`. **Never** patch with just
   the new entry alone — that wipes every other language's link. `patch_documents` targets a
   bare/published id and will transparently create a draft-with-patches-applied from the
   published revision; the published copy is left untouched (this matters for Phase 5).
5. **Idempotency check, always, before steps 2–4**: does `drafts.SRC-LANG_CODE` already exist?
   Skip if so. This makes the whole process safely re-runnable and lets you recover cleanly from
   a crash mid-batch (see Pitfall 2 below) without hand-tracking what's done.

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

## Worked example (fr-CA, Canadian French — the rollout this skill was extracted from)

For calibration: 435 Sanity documents across 4 types (208 lessons, 170 checklist, 39 practice,
18 quiz), 1532 UI string keys across 41 namespaces. Two session-limit crashes recovered from
cleanly using the ground-truth-first + exact-ID-batch approach this skill now prescribes from the
start. Zero documents published at any point. Two PRs (one per repo), Studio deployed
independently of PR merge state.
