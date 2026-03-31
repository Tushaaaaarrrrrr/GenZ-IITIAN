import db from './db.js';

const resources = [
  // =============================================
  // DIPLOMA — BDM — PYQs
  // =============================================
  { level: "Diploma", subject: "BDM", resource_type: "pyq", sub_type: "Quiz 1", title: "BDM Quiz 1 PYQ - Set 1", description: "Previous year questions", url: "https://drive.google.com/file/d/1XxH8OTW_IXoz-3tp3q0Ds7m0CvYfUYgn/view" },
  { level: "Diploma", subject: "BDM", resource_type: "pyq", sub_type: "Quiz 1", title: "BDM Quiz 1 PYQ - Set 2", description: "Previous year questions", url: "https://drive.google.com/file/d/15ROKkruHq1BZwPBe9hdfe_pDrOThgZ_s/view" },
];

async function seed() {
  console.log(`\n🌱 Seeding ${resources.length} Diploma BDM PYQ resources...\n`);

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

  const counts = await db.allAsync(
    `SELECT sub_type, COUNT(*) as count FROM resources WHERE published = 1 AND level = 'Diploma' AND subject = 'BDM' AND resource_type = 'pyq' GROUP BY sub_type ORDER BY sub_type`
  );
  console.log('📊 Diploma > BDM PYQ Summary:');
  console.table(counts);

  process.exit(0);
}

setTimeout(seed, 1000);
