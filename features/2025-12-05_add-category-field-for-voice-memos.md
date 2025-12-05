---
type: voice_memo_transcript
date: 2025-12-05T16:00:17
participants:
  - name: Richard
    contact_id: null
subject: "Add Category Field for Voice Memos"
summary: "Richard outlines adding a single-select Category control next to the existing tags UI for voice memos, requiring exactly one choice, display of current selection, and optional creation of new categories per business rules. He specifies backend behavior: create sanitizeed ingest/<category_name>/ subfolders (lowercase, hyphens), save to the selected subfolder at ingest time, use a designated "uncategorized" folder when none is chosen, and move or not move files on category changes depending on policy (specify desired behavior). Implementation considerations include whether categories are static or editable, atomic save/move operations, concurrency and filename collision handling (e.g., append timestamp or increment), backward compatibility for existing files, permissions, and logging of selections and paths. Acceptance criteria cover the UI control placement and single-choice behavior, correct save location, default handling, folder creation and sanitization, atomic operations with collision resolution, and tests for UI and file operations. Richard offers to draft UI labels, filesystem naming rules, or an API contract next."
tags: [work, planning, decision]
source_type: "text"
transcription_confidence: 1
processed_date: 2025-12-05T23:05:44.208Z
---

Goal
Add a single-select "Category" field in the same UI area where tags are assigned (Frontmatter). Selecting a category will both label the voice memo and determine the subfolder under the ingest folder where the file is saved.

UI requirements
- Place a single-select Category control next to the existing tags control (same row or panel).
- Only one category may be chosen per voice memo.
- The control should show the list of available categories and allow selecting one. (Optional: allow creating a new category if allowed by business rules.)
- Clearly display the currently selected category for existing memos.

File-system / backend behavior
- Under the existing ingest folder, create one subfolder per category (e.g., ingest/<category_name>/).  This folder is found at `/home/neo/agents/symbiont/docs/ingest`
- When a category is selected in the UI at the time of saving/ingest, the filepath/folder in the `Export` card.
- If no category is selected, save to the existing default ingest folder.
- If the UI category is changed after a file has already been saved, move the file to the new category subfolder.
- Ensure folder names are sanitized (no illegal filesystem characters) and use a consistent naming convention (e.g., lowercase, hyphens for spaces).

Implementation details / considerations
- Categories should be defined in the `settings.json` file.
- Ensure atomic save/move operations to avoid partial files.
- Handle concurrency (two memos with same filename): define filename collision policy (e.g., append timestamp or increment).

Acceptance criteria
- Category control appears in the tags area and allows exactly one choice.
- Selecting a category saves the voice memo file into ingest/<category>/ at time of save.
- If no category is selected, the file goes to the agreed default folder.
- Folder names are clean/sanitized and created automatically if missing.
- File save/move is atomic and handles name collisions as specified.
