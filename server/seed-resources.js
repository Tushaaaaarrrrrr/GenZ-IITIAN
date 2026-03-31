import db from './db.js';

const resources = [
  // =============================================
  // QUALIFIER PYQs
  // =============================================

  // --- English 1 PYQs ---
  { level: "Qualifier", subject: "English 1", resource_type: "pyq", sub_type: "Qualifier Exam", title: "English 1 Qualifier Paper", description: "Previous year qualifier exam paper", url: "https://drive.google.com/file/d/1fJbq8jZP70pX5UkeAuQh-T6UOaRSVC71" },
  { level: "Qualifier", subject: "English 1", resource_type: "pyq", sub_type: "Qualifier Exam", title: "Qualifier Paper — Set A", description: "Qualifier exam variant A", url: "https://drive.google.com/file/d/1x9lEW59vaGbzvRp5fVzQE5FQPDCDnEaR/view?usp=sharing" },
  { level: "Qualifier", subject: "English 1", resource_type: "pyq", sub_type: "Qualifier Exam", title: "Qualifier Paper — Set B", description: "Qualifier exam variant B", url: "https://drive.google.com/file/d/1a2wCnK1mz6UIK0Dj-kYeFpSR2Pvozkaz/view?usp=sharing" },

  // --- Maths 1 PYQs ---
  { level: "Qualifier", subject: "Maths 1", resource_type: "pyq", sub_type: "Qualifier Exam", title: "Mathematics 1 Qualifier Paper", description: "Previous year qualifier exam paper", url: "https://drive.google.com/file/d/1NwdVeIA78YZsxYhnjurZCeYwcgivvzhW" },
  { level: "Qualifier", subject: "Maths 1", resource_type: "pyq", sub_type: "Qualifier Exam", title: "Qualifier Practice Set 1", description: "Practice question set for Maths 1", url: "https://drive.google.com/file/d/1KxlCAhtkp0YQH4KkEDqZwLYpVFr1e_f7/view" },
  { level: "Qualifier", subject: "Maths 1", resource_type: "pyq", sub_type: "Qualifier Exam", title: "Qualifier Practice Set 2", description: "Practice question set for Maths 1", url: "https://drive.google.com/file/d/1Ozq2YIdyidGRzw6JtLdUKnfkZ73KDIU2/view" },
  { level: "Qualifier", subject: "Maths 1", resource_type: "pyq", sub_type: "Qualifier Exam", title: "Qualifier Practice Set 3", description: "Practice question set for Maths 1", url: "https://drive.google.com/file/d/1HzB3sM3etUu7G2_Z0BB_PYb797JoREDO/view" },
  { level: "Qualifier", subject: "Maths 1", resource_type: "pyq", sub_type: "Qualifier Exam", title: "Qualifier Paper — Set A", description: "Qualifier exam variant A", url: "https://drive.google.com/file/d/1e0ySlqTYwSyr3EjX4d7I3mwen_3gNSiV/view?usp=sharing" },
  { level: "Qualifier", subject: "Maths 1", resource_type: "pyq", sub_type: "Qualifier Exam", title: "Qualifier Paper — Set B", description: "Qualifier exam variant B", url: "https://drive.google.com/file/d/1e3mWdWAlqX8_OgG0Wk3HWUpyBwLjTnGs/view?usp=sharing" },
  { level: "Qualifier", subject: "Maths 1", resource_type: "pyq", sub_type: "Qualifier Exam", title: "Qualifier Paper — India Set 1", description: "India region qualifier paper", url: "https://drive.google.com/file/d/1oazgv-vzZgXyXvsORPh1dyrvAXF-0Rph/view?usp=share_link" },
  { level: "Qualifier", subject: "Maths 1", resource_type: "pyq", sub_type: "Qualifier Exam", title: "Qualifier Paper — India Set 2", description: "India region qualifier paper", url: "https://drive.google.com/file/d/1Gl7l6pVgBK3CvbjI7N8ZZ_z5q-zQTOvg/view?usp=share_link" },
  { level: "Qualifier", subject: "Maths 1", resource_type: "pyq", sub_type: "Qualifier Exam", title: "Qualifier Paper — Outside India Set 1", description: "Outside India qualifier paper", url: "https://drive.google.com/file/d/1IAsXfT4VxA2kxnxaV_ekMgjWJiSR4x26/view?usp=share_link" },
  { level: "Qualifier", subject: "Maths 1", resource_type: "pyq", sub_type: "Qualifier Exam", title: "Qualifier Paper — Outside India Set 2", description: "Outside India qualifier paper", url: "https://drive.google.com/file/d/1qHGDRdNqF55b0yxmDFhSFK17PekUAfq0/view?usp=share_link" },

  // --- Stats 1 PYQs ---
  { level: "Qualifier", subject: "Stats 1", resource_type: "pyq", sub_type: "Qualifier Exam", title: "Statistics 1 Qualifier Paper", description: "Previous year qualifier exam paper", url: "https://drive.google.com/file/d/1rbmdJVO07NdACoexI1hI0DRCY5j5l8Gq" },
  { level: "Qualifier", subject: "Stats 1", resource_type: "pyq", sub_type: "Qualifier Exam", title: "Qualifier Paper — Set A", description: "Qualifier exam variant A", url: "https://drive.google.com/file/d/1eGiecu7BFayR36CqYtCgO9oD0yzuLu45/view?usp=sharing" },
  { level: "Qualifier", subject: "Stats 1", resource_type: "pyq", sub_type: "Qualifier Exam", title: "Qualifier Paper — Set B", description: "Qualifier exam variant B", url: "https://drive.google.com/file/d/1eGBa713O1PTTS7GKY6hqqWF4tcJy6dLs/view?usp=sharing" },

  // --- CT PYQs ---
  { level: "Qualifier", subject: "CT", resource_type: "pyq", sub_type: "Qualifier Exam", title: "Computational Thinking Qualifier Paper", description: "Previous year qualifier exam paper", url: "https://drive.google.com/file/d/1zGXpxFAaHj5bWxSjKV5pr_qV7-Gd3rwn" },
  { level: "Qualifier", subject: "CT", resource_type: "pyq", sub_type: "Qualifier Exam", title: "Qualifier Paper — Set A", description: "Qualifier exam variant A", url: "https://drive.google.com/file/d/1eRjknyIFh0G25__rZ0xTqQ1jID_AzBrp/view?usp=sharing" },

  // =============================================
  // QUALIFIER NOTES — MATHS 1
  // =============================================

  // Full Notes
  { level: "Qualifier", subject: "Maths 1", resource_type: "note", sub_type: "Notes", title: "Week 1–9 Complete Notes", description: "Comprehensive notes covering weeks 1 through 9. Credits to contributors.", url: "https://drive.google.com/file/d/1zRgitQnCiM07m784tOekWsvhaa6viXrO/view" },
  { level: "Qualifier", subject: "Maths 1", resource_type: "note", sub_type: "Notes", title: "Week 1–9 Detailed Notes", description: "In-depth notes for weeks 1 to 9. Credits to contributors.", url: "https://drive.google.com/file/d/18w-ECQbOfreuBfuV4cwudyQBDWuXBt6z/view" },
  { level: "Qualifier", subject: "Maths 1", resource_type: "note", sub_type: "Notes", title: "General Concepts", description: "Key mathematical concepts overview. Credits to contributors.", url: "https://drive.google.com/file/d/10nb2fUJWQJGSIMPSKUv7MvS5rXqZdS0U/view" },
  { level: "Qualifier", subject: "Maths 1", resource_type: "note", sub_type: "Notes", title: "Week 1–4 Notes", description: "Notes covering first 4 weeks. Credits to contributors.", url: "https://drive.google.com/file/d/1Ar4aq38xgdVnrTZNAOixhViUyIfmTlWp/view?usp=sharing" },
  { level: "Qualifier", subject: "Maths 1", resource_type: "note", sub_type: "Notes", title: "Week 1–10 Comprehensive Notes", description: "Full notes covering weeks 1 through 10. Credits to contributors.", url: "https://drive.google.com/file/d/1RP9PPtHSdmF2BCcl5H7p0pkxiQ1_8olb/view" },
  { level: "Qualifier", subject: "Maths 1", resource_type: "note", sub_type: "Notes", title: "Week 1–12 Complete Notes", description: "Full course notes covering all 12 weeks. Credits to contributors.", url: "https://drive.google.com/file/d/1ONSILLrGO2lWVUTt__q3gLkGe-Cf8QJf/view?usp=sharing" },

  // Short Notes / Revision
  { level: "Qualifier", subject: "Maths 1", resource_type: "note", sub_type: "Short Notes", title: "Mathematics Quick Revision Notes", description: "Quick revision notes for Mathematics. Credits to contributors.", url: "https://drive.google.com/file/d/1O47UH-AkPSAGHpLtnIOPrKUrDz-h6dHf/view?usp=sharing" },
  { level: "Qualifier", subject: "Maths 1", resource_type: "note", sub_type: "Short Notes", title: "Week 1–4 Revision Short Notes", description: "Concise revision notes for weeks 1 to 4. Credits to contributors.", url: "https://drive.google.com/file/d/1dKjhNuOoqo8Px6bUkbGEQkAbQjYySuZT/view?usp=sharing" },
  { level: "Qualifier", subject: "Maths 1", resource_type: "note", sub_type: "Short Notes", title: "Formula Sheet", description: "Complete formula compilation for Maths 1. Credits to contributors.", url: "https://drive.google.com/file/d/1604fOibOUovOokF4Vky6G0i-fQHpzCuE/view" },

  // =============================================
  // QUALIFIER NOTES — STATS 1
  // =============================================

  // Full Notes
  { level: "Qualifier", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 1–10 Complete Notes", description: "Comprehensive notes covering weeks 1 through 10. Credits to contributors.", url: "https://drive.google.com/file/d/1XblPLzfSM7OIETPAvc8DeoqPqZa6RiLm/view" },
  { level: "Qualifier", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 1–6 Notes", description: "Notes covering weeks 1 to 6. Credits to contributors.", url: "https://drive.google.com/file/d/1Th3VZv1JQJFZEioUn5RJ_j1pB76XvuYa/view" },
  { level: "Qualifier", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 1–3 Notes", description: "Notes for first 3 weeks. Credits to contributors.", url: "https://drive.google.com/file/d/1rQT_W7xyksAtowNskrIfo5BkYgiSiAN0/view" },
  { level: "Qualifier", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 1–9 Notes", description: "Notes covering weeks 1 through 9. Credits to contributors.", url: "https://drive.google.com/file/d/1qFplfEds6Ij9hon8vMhe6WErmoApS1mO/view" },
  { level: "Qualifier", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 1–10 Detailed Notes", description: "Detailed notes for weeks 1 to 10. Credits to contributors.", url: "https://drive.google.com/file/d/1WvHq5pTt4lD5zwj7N_BByfDqFtxI6b4t/view" },
  { level: "Qualifier", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes", description: "Notes for week 1. Credits to contributors.", url: "https://drive.google.com/file/d/183wdpcG4eKNq9f81GAoDxKBuOmP9v_Pe/view?usp=sharing" },
  { level: "Qualifier", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes", description: "Notes for week 2. Credits to contributors.", url: "https://drive.google.com/file/d/1CPSoz_17Z0s0_hq8HAFaFjgWZeriM_gh/view?usp=sharing" },
  { level: "Qualifier", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes", description: "Notes for week 4. Credits to contributors.", url: "https://docs.google.com/document/d/1_E0soOOA7cHFxj1w1KJ7LbdyaLFcm2X0/edit?usp=sharing&ouid=105439982782612388426&rtpof=true&sd=true" },

  // Short Notes / Revision
  { level: "Qualifier", subject: "Stats 1", resource_type: "note", sub_type: "Short Notes", title: "Revision Notes Week 1–12", description: "Complete revision summary for all 12 weeks. Credits to contributors.", url: "https://drive.google.com/file/d/1jVkRBoz8ToI3x4HTPc7ggVTbAcG2idiB/view" },
  { level: "Qualifier", subject: "Stats 1", resource_type: "note", sub_type: "Short Notes", title: "Week 1–12 Revision Notes", description: "Full course revision summary. Credits to contributors.", url: "https://drive.google.com/file/d/1XnZOjJPpBNUn3lk-7ynCgT-AIjTL9AK_/view" },
  { level: "Qualifier", subject: "Stats 1", resource_type: "note", sub_type: "Short Notes", title: "Week 1–3 Quick Revision Notes", description: "Quick revision for weeks 1 to 3. Credits to contributors.", url: "https://drive.google.com/file/d/1dZl89w_CedQEcu0joPAoYkZQf9qB6ao5/view" },
  { level: "Qualifier", subject: "Stats 1", resource_type: "note", sub_type: "Short Notes", title: "Week 4 Short Notes", description: "Concise notes for week 4. Credits to contributors.", url: "https://drive.google.com/file/d/1uFBUvrPnB155tAsYkaqaeDiQwzZsLgmN/view" },

  // =============================================
  // QUALIFIER NOTES — ENGLISH 1
  // =============================================

  // Full Notes
  { level: "Qualifier", subject: "English 1", resource_type: "note", sub_type: "Notes", title: "Week 2–6 Notes", description: "Notes covering weeks 2 to 6. Credits to contributors.", url: "https://drive.google.com/file/d/1zv9_Gwuv1AZiQUFyS0ol7a8l5d2Yd2Vs/view?usp=sharing" },
  { level: "Qualifier", subject: "English 1", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set A)", description: "Week 1 study notes. Credits to contributors.", url: "https://drive.google.com/file/d/1KgdDpVHU87uXxaJvY8t6vX7Qq0K9FrXQ/view?usp=drivesdk" },
  { level: "Qualifier", subject: "English 1", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set B)", description: "Another set of week 1 notes. Credits to contributors.", url: "https://drive.google.com/file/d/1tbNlmiUZDOEAz6xETJKzYu__ZdIw_gO0/view" },
  { level: "Qualifier", subject: "English 1", resource_type: "note", sub_type: "Notes", title: "Week 1–3 Notes", description: "Notes for first 3 weeks. Credits to contributors.", url: "https://drive.google.com/file/d/1doarmT9KIdNbJj5DgI6t9W5_4md84ZJm/view" },
  { level: "Qualifier", subject: "English 1", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes", description: "Notes for week 4. Credits to contributors.", url: "https://drive.google.com/file/d/1ddyleNf4JD0_-OVcIx4AejHt8RubFxIR/view" },
  { level: "Qualifier", subject: "English 1", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes", description: "Week 1 notes. Credits to contributors.", url: "https://drive.google.com/file/d/1HY9RsNxGlK8lGaT1tyCedSAlvLme325k/view?usp=drivesdk" },
  { level: "Qualifier", subject: "English 1", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes", description: "Week 2 notes. Credits to contributors.", url: "https://drive.google.com/file/d/1LgdT20fpEhPq1XBHnhTxQIYbmLRgs8IN/view?usp=drivesdk" },

  // =============================================
  // QUALIFIER NOTES — CT (Computational Thinking)
  // =============================================

  // Full Notes
  { level: "Qualifier", subject: "CT", resource_type: "note", sub_type: "Notes", title: "Week 1–4 Complete Notes", description: "Comprehensive notes for weeks 1 to 4. Credits to contributors.", url: "https://drive.google.com/file/d/17XWmmxZNhJCzP864sPMPBlQDujNHCkEF/view?usp=sharing" },
  { level: "Qualifier", subject: "CT", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes", description: "Detailed notes for week 1. Credits to contributors.", url: "https://drive.google.com/file/d/1uxLK4tgf6wifsJvBLcwS0UpFfWoqfi6x/view?usp=sharing" },
  { level: "Qualifier", subject: "CT", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes", description: "Detailed notes for week 2. Credits to contributors.", url: "https://drive.google.com/file/d/1xjykGzQoupWOjh-uuupdzRJiJlomdPZc/view?usp=sharing" },
  { level: "Qualifier", subject: "CT", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes", description: "Detailed notes for week 3. Credits to contributors.", url: "https://drive.google.com/file/d/1QRs-kWKrYzJTA96meCn692rxyfvyZG7R/view?usp=sharing" },
  { level: "Qualifier", subject: "CT", resource_type: "note", sub_type: "Notes", title: "Week 1–3 Notes", description: "Combined notes for weeks 1 to 3. Credits to contributors.", url: "https://drive.google.com/file/d/1TuZzCjLBUQ4J3qxr_6PGuyoYfq_gXqDr/view" },
  { level: "Qualifier", subject: "CT", resource_type: "note", sub_type: "Notes", title: "Week 4–6 Notes", description: "Notes covering weeks 4 to 6. Credits to contributors.", url: "https://drive.google.com/file/d/1TxOFHTGh2g9ymclkMOAnWy832l0jmRVU/view" },
  { level: "Qualifier", subject: "CT", resource_type: "note", sub_type: "Notes", title: "Week 1–3 & 5–8 Notes", description: "Combined notes for weeks 1-3 and 5-8. Credits to contributors.", url: "https://drive.google.com/file/d/1u77RKNTKJ5MLQOqvqOI4LBIl1_ChWfPp/view" },
  { level: "Qualifier", subject: "CT", resource_type: "note", sub_type: "Notes", title: "Week 1–4 Notes (Set A)", description: "Another set of notes for weeks 1 to 4. Credits to contributors.", url: "https://drive.google.com/file/d/12XMGIncApO5IG25gA2I0H3eNmpWdWovq/view?usp=drivesdk" },
  { level: "Qualifier", subject: "CT", resource_type: "note", sub_type: "Notes", title: "Week 1–4 Notes (Set B)", description: "Additional set of notes for weeks 1 to 4. Credits to contributors.", url: "https://drive.google.com/file/d/1-GYYAZXH-NOuIjE1QDxEKkzK2QxzSktG/view?usp=drivesdk" },
  { level: "Qualifier", subject: "CT", resource_type: "note", sub_type: "Notes", title: "Week 1 Detailed Notes", description: "In-depth week 1 notes. Credits to contributors.", url: "https://drive.google.com/file/d/13I9vZmAMpKShTQKKbupta86nr5xJbCSz/view?usp=sharing" },
];

async function seed() {
  console.log(`\n🌱 Seeding ${resources.length} qualifier resources...\n`);

  let inserted = 0;
  for (const r of resources) {
    try {
      // Check for duplicate URL
      const existing = await db.getAsync('SELECT id FROM resources WHERE url = ?', [r.url]);
      if (existing) {
        console.log(`⏭  Skipped (duplicate): ${r.title}`);
        continue;
      }

      await db.runAsync(
        `INSERT INTO resources (level, subject, resource_type, sub_type, title, description, url, published)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [r.level, r.subject, r.resource_type, r.sub_type, r.title, r.description, r.url]
      );
      inserted++;
      console.log(`✅ ${r.level} > ${r.subject} > ${r.resource_type} > ${r.title}`);
    } catch (err) {
      console.error(`❌ Failed: ${r.title} — ${err.message}`);
    }
  }

  console.log(`\n🎉 Done! Inserted ${inserted} resources (${resources.length - inserted} skipped).\n`);

  // Summary
  const counts = await db.allAsync(
    `SELECT level, subject, resource_type, sub_type, COUNT(*) as count
     FROM resources WHERE published = 1
     GROUP BY level, subject, resource_type, sub_type
     ORDER BY level, subject, resource_type, sub_type`
  );
  console.log('📊 Resource Summary:');
  console.table(counts);

  process.exit(0);
}

// Wait a moment for DB to initialize, then seed
setTimeout(seed, 1000);
