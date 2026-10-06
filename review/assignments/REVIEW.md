# Assignment source review — 6 October 2026

Source: `Graded Assignment/cs1001Assignments.pdf`, identical to the existing public asset.

The old text extractor lost comparison operators. Re-extraction with the bundled Poppler restored `≥` (including Week 1 percentage boundaries), `≤` and other symbols. The parser now detects all ten Week 1 questions and ten questions each in Weeks 3, 5 and 6; Week 2 contains seven detected questions. Extraction is reproducible from the five checked page ranges in `scripts/extract-assignments.py`.

Visual source inspection covered all Week 1 pages (PDF pages 6–11). The supplied file is a tutorial/solution archive and does not reproduce every original question's procedure or diagram. In particular, Week 1's transport flowchart is referenced but absent in the original PDF as well as the text extraction. This is not an operator that can be repaired mechanically.

All five weeks remain `review` in `src/public/assignment-review.ts`. Their populated URLs render the archive text and source attribution but carry HTML and HTTP noindex controls. They are excluded from public directories, all sitemaps and llms.txt. Weeks 4 and 7–12 do not get placeholder pages.

To promote a week:

1. Obtain the complete original assignment material, including figures and datasets referenced by each question.
2. Compare every question, operator, table, option and worked answer with its source. Record missing material; do not guess.
3. Correct the shared data, check mobile tables/code, and verify the displayed solution independently where possible.
4. Set that week's manifest status to `reviewed` and record the actual review date. Unknown term/year remains clearly labelled as an archive.
5. Build both bundles and run SEO tests. The directory, schema, sitemap and llms.txt automatically include approved weeks.

The current generic parser is an extraction aid, not proof of academic correctness. Regeneration should be followed by manual review and must not overwrite later reviewed corrections without checking them.
