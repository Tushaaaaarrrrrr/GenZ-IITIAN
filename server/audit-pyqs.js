import db from './db.js';

setTimeout(async () => {
  // Current PYQ entries
  const pyqs = await db.allAsync(`SELECT level, subject, sub_type, title FROM resources WHERE resource_type = 'pyq' ORDER BY level, subject, sub_type`);
  console.log('=== Current PYQ resources ===');
  console.table(pyqs);

  // Notes that look like PYQs (quiz notes, PYQ in title)
  const quizNotes = await db.allAsync(`SELECT id, level, subject, resource_type, sub_type, title FROM resources WHERE resource_type = 'note' AND (title LIKE '%Quiz%' OR title LIKE '%PYQ%' OR title LIKE '%OPPE%') ORDER BY level, subject`);
  console.log('\n=== Notes that should be reclassified as PYQs ===');
  console.table(quizNotes);
  process.exit(0);
}, 1000);
