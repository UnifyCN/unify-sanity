# Practice Entity — Frontend Documentation

This document describes the **Practice** content type in Sanity. Practice unifies **quizzes** (one question per page) and **activities** (many questions/items per page) into a single entity linked to **submodules** (sections). The frontend can reuse existing quiz and activity UI; the only new concept is `practice_type` and the fact that practices are scoped to a submodule.

---

## 1. Overview

| Aspect | Description |
|--------|-------------|
| **Sanity type** | `practice` |
| **Parent** | One **submodule** (reference). Practices are ordered within a submodule by `order_number`. |
| **Modes** | **Quiz** (`practice_type: "quiz"`) — one question per screen. **Activity** (`practice_type: "activity"`) — multiple items per page, like lesson activity pages. |
| **Relationship** | Replaces the need for lesson-level quizzes and lesson-level activity pages for new content. Old `quiz` and lesson `activity_pages` remain in the CMS for migration; frontend can support both during transition. |

---

## 2. Document-Level Fields

Every Practice document has:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `submodule` | reference | Yes | Reference to the submodule (section) this practice belongs to. |
| `title` | string | Yes | Display name (e.g. in lists and headers). |
| `description` | text | No | Short summary of what the practice covers. |
| `practice_type` | string | Yes | `"quiz"` or `"activity"`. Drives which child field is populated and how to render. |
| `order_number` | number | Yes | Order among other practices in the same submodule. Lower = first. |
| `questions` | array | When quiz | Present only when `practice_type === "quiz"`. Array of quiz-style questions. |
| `pages` | array | When activity | Present only when `practice_type === "activity"`. Array of activity pages. |

**Frontend rule:** Branch on `practice_type`. Use `questions` for quiz mode and `pages` for activity mode. Same rendering as existing quiz screen and lesson activity screens.

---

## 3. Quiz Mode (`practice_type === "quiz"`)

- **Use:** `questions` array.
- **Rendering:** One question per screen (same as current quiz). Sort by `order_number` if needed.

### 3.1 Question object shape

Each element of `questions` is an object with:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question_type` | string | Yes | One of: `multiple_choice_single`, `multiple_choice_multiple`, `true_false`, `fill_blank`, `short_answer`, `matching`, `long_answer`. |
| `question_text` | array (Portable Text) | Yes | Rich text of the question. Same block/marks as lesson and quiz. |
| `options` | array | For MC / T-F | Only for `multiple_choice_single`, `multiple_choice_multiple`, `true_false`. See Options below. |
| `matching_pairs` | array | For matching | Only for `question_type === "matching"`. See Matching pairs below. |
| `correct_answer` | object | For text answers | Only for `fill_blank`, `short_answer`, `long_answer`. See Correct answer below. |
| `order_number` | number | Yes | Order of the question (0-based). |
| `answer_box` | object | No | Feedback after submit. See Answer box (quiz) below. |

### 3.2 Options (multiple choice / true-false)

Each option:

| Field | Type | Description |
|-------|------|-------------|
| `text` | array (Portable Text) | Label for the option. |
| `value` | string | Stable id (e.g. `"option_a"`, `"true"`). Use for checking correctness. |
| `is_correct` | boolean | Whether this option is correct. |
| `explanation` | array (Portable Text) | Optional explanation when this option is selected or after submit. |

Validation (for reference): single choice → exactly one `is_correct`; multiple choice → at least one; true/false → exactly one.

### 3.3 Matching pairs

Only when `question_type === "matching"`. Each item:

| Field | Type | Description |
|-------|------|-------------|
| `left_item` | string | Left column label. |
| `right_item` | string | Right column label (correct match for `left_item`). |
| `explanation` | array (Portable Text) | Optional. |

At least 2 pairs per question.

### 3.4 Correct answer (fill in the blank / short / long answer)

Only when `question_type` is `fill_blank`, `short_answer`, or `long_answer`.

| Field | Type | Description |
|-------|------|-------------|
| `value` | array of strings | Accepted answers (e.g. `["answer1", "answer2"]`). |
| `explanation` | array (Portable Text) | Shown after submit. |
| `points` | number | Points for a correct answer (default 1). |

### 3.5 Answer box (quiz question)

Optional per-question feedback:

| Field | Type | Description |
|-------|------|-------------|
| `content` | array (Portable Text) | Required when present. Feedback content. |
| `showAfterSubmit` | boolean | If true, show only after user submits; otherwise always visible. Default true. |

---

## 4. Activity Mode (`practice_type === "activity"`)

- **Use:** `pages` array.
- **Rendering:** One “page” per entry; each page has a title, an ordered list of items (instructions), and an optional answer box. Same pattern as current lesson activity pages (many items per page).

### 4.1 Activity page object

Each element of `pages`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Page heading. |
| `order` | number | Yes | Page order (0-based). |
| `instructions` | array | Yes | Mixed content: blocks, input boxes, and question blocks. See Instructions items below. |
| `answer_box` | object | No | Optional feedback for the whole page. See Answer box (activity) below. |

### 4.2 Instructions items (activity page)

Each item in `instructions` has a `_type` that identifies the block. Render the same way as lesson activity instructions.

| `_type` | Description | Relevant fields |
|---------|-------------|-----------------|
| `block` | Rich text (Portable Text) | Standard block content. |
| `large_input_box` | Large text input | `label`, `placeholder`, `required`. |
| `mid_input_box` | Medium text input | `label`, `placeholder`, `required`. |
| `small_input_box` | Small text input | `label`, `placeholder`, `required`. |
| `multiple_choice_single` | Single-answer MC | `question_text` (Portable Text), `options` (same shape as quiz options). |
| `multiple_choice_multiple` | Multi-answer MC | Same as above. |
| `two_options_question` | Two options (e.g. yes/no) | `question_text`, `options` (length 2, one correct). |
| `matching_question` | Matching pairs | `question_text`, `matching_pairs` (same shape as quiz matching_pairs). |

Options and matching_pairs use the same structure as in Quiz mode (see above).

### 4.3 Answer box (activity page)

Optional per-page feedback:

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Optional heading for the answer box. |
| `content` | array (Portable Text) | Required when answer_box is present. |
| `showAfterSubmit` | boolean | If true, show only after user submits. Default true. |

---

## 5. GROQ Examples

### 5.1 Practices for a submodule (by ref)

```groq
*[_type == "practice" && submodule._ref == $submoduleId] | order(order_number asc) {
  _id,
  _type,
  title,
  description,
  practice_type,
  order_number,
  submodule-> { _id, title },
  // Quiz mode
  questions[] {
    question_type,
    question_text,
    options[] { text, value, is_correct, explanation },
    matching_pairs[] { left_item, right_item, explanation },
    correct_answer { value, explanation, points },
    order_number,
    answer_box { content, showAfterSubmit }
  },
  // Activity mode
  pages[] {
    title,
    order,
    instructions[] {
      _type,
      _key,
      // blocks
      ...(_type == "block" => { ...@ }),
      // input boxes
      ...(_type == "large_input_box" || _type == "mid_input_box" || _type == "small_input_box" => { label, placeholder, required }),
      // multiple choice (single/multiple/two options)
      ...((_type == "multiple_choice_single" || _type == "multiple_choice_multiple" || _type == "two_options_question") => { question_text, options[] { text, value, is_correct, explanation } }),
      // matching
      ...(_type == "matching_question" => { question_text, matching_pairs[] { left_item, right_item, explanation } })
    },
    answer_box { title, content, showAfterSubmit }
  }
}
```

Use `$submoduleId` as the submodule document ID (e.g. `submodule._ref` from a submodule doc).

### 5.2 All practices with submodule info (for listing)

```groq
*[_type == "practice"] | order(submodule->order asc, order_number asc) {
  _id,
  title,
  description,
  practice_type,
  order_number,
  "submodule": submodule-> { _id, title, "module": module-> { _id, title } }
}
```

### 5.3 Single practice by ID (full detail for quiz or activity screen)

```groq
*[_type == "practice" && _id == $practiceId][0] {
  _id,
  title,
  description,
  practice_type,
  order_number,
  submodule-> { _id, title },
  questions[] { ... },
  pages[] { ... }
}
```

Expand `questions[]` and `pages[]` with the same projections as in 5.1 when you need full content for the current screen.

---

## 6. Frontend Checklist

- [ ] **Branch on `practice_type`:** Use `questions` for quiz UI, `pages` for activity UI.
- [ ] **Quiz:** One screen per question; sort by `order_number`; support all seven `question_type` values and reuse existing quiz components (options, matching, correct_answer, answer_box).
- [ ] **Activity:** One screen per page; sort pages by `order`; render `instructions` by `_type` (blocks, input boxes, multiple choice, two options, matching) and reuse existing lesson activity components.
- [ ] **Navigation:** Practices are children of a submodule; list them by `order_number` within that submodule (e.g. after intro pages and lessons, or in a dedicated “Practice” list for the section).
- [ ] **Portable Text:** All rich text (`question_text`, option `text`, `content`, etc.) is Portable Text; use your existing block renderer (same as lesson/quiz).
- [ ] **Optional:** Support both legacy (lesson `activity_pages` + `quiz` linked to lesson) and new Practice entity during migration, then deprecate legacy when data is moved.

---

## 7. Relationship to Legacy Quiz and Lesson Activities

| Legacy | New (Practice) |
|--------|-----------------|
| `quiz` linked to **lesson** | Practice linked to **submodule**; use `practice_type: "quiz"` and `questions`. |
| Lesson `activity_pages` (per lesson) | Practice with `practice_type: "activity"` and `pages`; one practice can group multiple activity-style pages under one submodule. |

Data shapes for questions and activity instructions are aligned so you can reuse the same components; only the parent (submodule vs lesson) and the top-level field names (`questions` vs `pages`) differ.
