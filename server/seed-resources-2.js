import db from './db.js';

const resources = [
  // =============================================
  // FOUNDATION — MATHS 1 — QUIZ 1
  // =============================================

  // Oct 2025
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Oct 2025 (Full Folder)", description: "All sets from 26 Oct 2025", url: "https://drive.google.com/drive/folders/1lD7xmX3hnMAcT5oCyLC-287OiCLFEXzs" },

  // Jul 2025
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Jul 2025 (Full Folder)", description: "All sets from 13 Jul 2025", url: "https://drive.google.com/drive/folders/1UaIqMV6MUZmw7T4qyVv943oA7DSmDIbR" },

  // Feb 2025
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Feb 2025 Set 1", description: "23 Feb 2025", url: "https://drive.google.com/open?id=1-3eXVSbnWiAOlljSfO0G29opxAM94Ese" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Feb 2025 Set 2", description: "23 Feb 2025", url: "https://drive.google.com/open?id=1-0SxR2mb_UvT9qhJ5nyEPoQoIUSY1fVW" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Feb 2025 Set 3", description: "23 Feb 2025", url: "https://drive.google.com/open?id=1-2GaK6ZOxqSBWPp7PGPCjk3Jb8DE1lbY" },

  // Oct 2024
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Oct 2024 Set 1", description: "27 Oct 2024", url: "https://drive.google.com/file/d/1aK1oP5zfaZsFFl_hUY169cuywrkgDTSq/view" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Oct 2024 Set 2", description: "27 Oct 2024", url: "https://drive.google.com/file/d/1Q5kr3s5g7Hn-emDo8TM6vNNCkznFsClY/view" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Oct 2024 Set 3", description: "27 Oct 2024", url: "https://drive.google.com/file/d/1ZsZmZlh3dwz6bsVLooFySAx9eCF-schX/view" },

  // Jul 2024
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Jul 2024 Set 1", description: "7 Jul 2024", url: "https://drive.google.com/open?id=1gWazA01s7Z-pyb-n-jK10YUfSWXVl6d3" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Jul 2024 Set 2", description: "7 Jul 2024", url: "https://drive.google.com/open?id=1KWxtDT2enav83kD8mLBDZ_m7qucZKcMx" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Jul 2024 Set 3", description: "7 Jul 2024", url: "https://drive.google.com/open?id=1grpspBEGMj_ihPvMF2ZwtbSEqUUqfvQv" },

  // Feb 2024
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Feb 2024 Set 1", description: "25 Feb 2024", url: "https://drive.google.com/open?id=1OwIaoHTn1Ab3h6wZSpGd39x3cvMgkD4I" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Feb 2024 Set 2", description: "25 Feb 2024", url: "https://drive.google.com/open?id=1RYcIfbrCfg9jJ3-MY_H-puPdtXOyxyj6" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Feb 2024 Set 3", description: "25 Feb 2024", url: "https://drive.google.com/open?id=1aueDLHC-bLfTbKh3vQqygraXCzCO2OUl" },

  // Oct 2023
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Oct 2023 Set 1", description: "29 Oct 2023", url: "https://drive.google.com/open?id=1VtKXjqLu8S1ZSCMNhL63YV36xOpJMgW7" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Oct 2023 Set 2", description: "29 Oct 2023", url: "https://drive.google.com/open?id=1PXt0d_ykLQQd0kBKVQoMa2HqSqGZu2VP" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Oct 2023 Set 3", description: "29 Oct 2023", url: "https://drive.google.com/open?id=166xFT9UwlQ-C1la6nHFYGXHjnMF9leph" },

  // Jul 2023
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Jul 2023 Set 1", description: "16 Jul 2023", url: "https://drive.google.com/open?id=1HxWKk38Gz1cwQxAg0LrYVN-w7f-8xGGi" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Jul 2023 Set 2", description: "16 Jul 2023", url: "https://drive.google.com/file/d/1jPDgduVTNl8XtiIfMrfrbuxoDf6Aup5X/view" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Jul 2023 Set 3", description: "16 Jul 2023", url: "https://drive.google.com/open?id=12Q3iT9SArlPfcyXvKXgu-NhYBMgq3vju" },

  // Feb 2023
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Feb 2023 Set 1", description: "26 Feb 2023", url: "https://drive.google.com/open?id=1m8rLjxc7TL_q3i71dDNZJtu_S0FtvyRs" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Feb 2023 Set 2", description: "26 Feb 2023", url: "https://drive.google.com/open?id=1VcaETd74yLUxh_1QY2IYZxNVPe9cOoMs" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 1", title: "Quiz 1 — Feb 2023 Set 3", description: "26 Feb 2023", url: "https://drive.google.com/open?id=16wq-Uh2e0Hqgj3L5XJBstaardVXrisNn" },

  // =============================================
  // FOUNDATION — MATHS 1 — QUIZ 2
  // =============================================

  // Dec 2024
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 2", title: "Quiz 2 — Dec 2024 Set 1", description: "1 Dec 2024", url: "https://drive.google.com/open?id=118WmCnyFDEZd7S-R1bT_v-QLXMtqQxtf" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 2", title: "Quiz 2 — Dec 2024 Set 2", description: "1 Dec 2024", url: "https://drive.google.com/open?id=117ipVqimBMHHz26N0lptiyU3chzCNIXZ" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 2", title: "Quiz 2 — Dec 2024 Set 3", description: "1 Dec 2024", url: "https://drive.google.com/open?id=116_36dDzAtZYHZH6MHPs5cBAp27FyC--" },

  // Aug 2024
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 2", title: "Quiz 2 — Aug 2024 Set 1", description: "4 Aug 2024", url: "https://drive.google.com/open?id=1-PeOPl1X_qRQ2xZUf29pHTwX2kjehIi3" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 2", title: "Quiz 2 — Aug 2024 Set 2", description: "4 Aug 2024", url: "https://drive.google.com/open?id=1-D-3NCceR7TMxw7z3A2SqdAqs3Lq3SiQ" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "Quiz 2", title: "Quiz 2 — Aug 2024 Set 3", description: "4 Aug 2024", url: "https://drive.google.com/open?id=1-HP3SAHk801zhYSC6p_JgjapX25TRgVo" },

  // =============================================
  // FOUNDATION — MATHS 1 — END TERM
  // =============================================

  // Dec 2024
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "End Term", title: "End Term — Dec 2024 FN Set 1", description: "22 Dec 2024 Forenoon", url: "https://drive.google.com/open?id=1Xzpe1UgWGx2vDYLO-ZjrdFTnWuaZ7F5h" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "End Term", title: "End Term — Dec 2024 FN Set 2", description: "22 Dec 2024 Forenoon", url: "https://drive.google.com/open?id=1jge_lo192L2ZrTw0fVtbFmppWPyPDvVp" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "End Term", title: "End Term — Dec 2024 AN Set 1", description: "22 Dec 2024 Afternoon", url: "https://drive.google.com/open?id=1o1FSL2NRuw4YSS2beqHHlhQVqROzak3M" },
  { level: "Foundation", subject: "Maths 1", resource_type: "pyq", sub_type: "End Term", title: "End Term — Dec 2024 AN Set 2", description: "22 Dec 2024 Afternoon", url: "https://drive.google.com/open?id=13cp2NZKBEflFd6asvIuN2TijhwvBrdUJ" },
];

async function seed() {
  console.log(`\n🌱 Seeding ${resources.length} Foundation Maths 1 PYQ resources...\n`);

  let inserted = 0;
  for (const r of resources) {
    try {
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
      console.log(`✅ ${r.sub_type} | ${r.title}`);
    } catch (err) {
      console.error(`❌ Failed: ${r.title} — ${err.message}`);
    }
  }

  console.log(`\n🎉 Done! Inserted ${inserted} resources (${resources.length - inserted} skipped).\n`);

  // Summary for Foundation Maths 1 PYQs
  const counts = await db.allAsync(
    `SELECT sub_type, COUNT(*) as count FROM resources WHERE published = 1 AND level = 'Foundation' AND subject = 'Maths 1' AND resource_type = 'pyq' GROUP BY sub_type ORDER BY sub_type`
  );
  console.log('📊 Foundation > Maths 1 PYQ Summary:');
  console.table(counts);

  process.exit(0);
}

setTimeout(seed, 1000);
