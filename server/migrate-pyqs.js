import db from './db.js';

// Reclassify quiz/PYQ notes as resource_type "pyq" with proper sub_types
const reclassifications = [
  // DBMS
  { id: 271, sub_type: "Quiz 1", note: "Quiz 1, 2, 3 Notes (Folder) → Quiz 1" },
  { id: 284, sub_type: "Quiz 1", note: "Quiz 1 PYQs & Notes" },
  // Java
  { id: 222, sub_type: "Quiz 1", note: "Quiz 1 Notes" },
  { id: 229, sub_type: "Quiz 2", note: "Quiz 2 Notes" },
  { id: 231, sub_type: "Quiz 1", note: "Quiz 1 Notes (Set B)" },
  // MAD 1
  { id: 261, sub_type: "Quiz 1", note: "Week 1–4 Quiz 1 Notes" },
  { id: 269, sub_type: "Quiz 1", note: "Quiz 1 PYQs & Notes" },
  // PDSA
  { id: 216, sub_type: "Quiz 1", note: "Quiz 1 PYQs & Notes" },
  // System Commands
  { id: 236, sub_type: "Quiz 1", note: "Quiz 1 Notes" },
  { id: 245, sub_type: "Quiz 2", note: "Quiz 2 Notes" },
];

async function migrate() {
  console.log(`\n🔄 Reclassifying ${reclassifications.length} resources from note → pyq...\n`);

  for (const r of reclassifications) {
    await db.runAsync(
      `UPDATE resources SET resource_type = 'pyq', sub_type = ? WHERE id = ?`,
      [r.sub_type, r.id]
    );
    console.log(`  ✅ ID ${r.id}: ${r.note} → pyq / ${r.sub_type}`);
  }

  // Also duplicate DBMS id=271 for Quiz 2 and Quiz 3 since it's a folder with all 3
  const dbmsFolder = await db.getAsync(`SELECT * FROM resources WHERE id = 271`);
  if (dbmsFolder) {
    // Check if Quiz 2 copy exists
    const q2 = await db.getAsync(`SELECT id FROM resources WHERE url = ? AND sub_type = 'Quiz 2'`, [dbmsFolder.url]);
    if (!q2) {
      await db.runAsync(
        `INSERT INTO resources (level, subject, resource_type, sub_type, title, description, url, published)
         VALUES (?, ?, 'pyq', 'Quiz 2', ?, ?, ?, 1)`,
        [dbmsFolder.level, dbmsFolder.subject, 'Quiz 1, 2, 3 Notes (Folder)', dbmsFolder.description, dbmsFolder.url]
      );
      console.log(`  ✅ Duplicated DBMS folder for Quiz 2`);
    }
  }

  console.log(`\n📊 Updated PYQ summary:`);
  const counts = await db.allAsync(
    `SELECT level, subject, sub_type, COUNT(*) as count
     FROM resources WHERE resource_type = 'pyq' AND published = 1
     GROUP BY level, subject, sub_type
     ORDER BY level, subject, sub_type`
  );
  console.table(counts);

  process.exit(0);
}

setTimeout(migrate, 1000);
