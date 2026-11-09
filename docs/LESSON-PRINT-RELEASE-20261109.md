# Approved lesson print update — 9 November 2026

Owner approval: “Approve print fixes” (8 November 2026), resumed 9 November.

## Implemented scope

- Printed materials use one checkbox per item with an exact printable link where one is configured.
- The saved PDF retains clickable resource links and readable 11pt body text.
- A4 is explicitly selected with safe print margins.
- Every teaching step, tip, objective and SEN adaptation remains in the handout.
- Teaching tips share a compact two-column list; support notes and copyright stay together.
- The existing standalone handout and Back to lesson controls are retained.

## Evidence

An offline audit rendered all eight current Cobie print templates and the eight Darcy plans. The PDF verifier checked A4 dimensions, full expected content, clickable link annotations, checkboxes, safe text bounds and nearly empty pages. All 16 passed. Cobie Lesson 1 uses three pages; Cobie Lessons 2–8 and all Darcy plans use two pages. Pages are allowed to grow to preserve readable text.

The local evidence is under `C:/Users/us/Documents/ChatGPT/many petals apps/output/playwright/lesson-print-qa-20261109/`: `audit.json`, `pdf-verification.json` and individual lesson PDFs. Representative pages were also rendered to PNG and visually inspected. TypeScript checking and production export are required before pushing.

This evidence covers lesson printing only. Payment, access, email, account-isolation and school-validation release gates remain separate.
