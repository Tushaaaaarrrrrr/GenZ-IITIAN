import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'admin.db');
const db = new sqlite3.Database(dbPath);

// Delete Maths 1 Quiz 1, Quiz 2, End Term PYQs that are wrongly at Qualifier level
// These belong to Foundation level (which already has them)
const idsToDelete = [4, 5, 6, 7, 8];

db.run(`DELETE FROM resources WHERE id IN (${idsToDelete.join(',')}) AND level='Qualifier'`, function(err) {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log(`Deleted ${this.changes} misplaced Qualifier-level PYQs (Quiz 1, Quiz 2, End Term for Maths 1)`);
  }

  // Verify remaining Qualifier PYQs
  db.all("SELECT subject, sub_type, COUNT(*) as cnt FROM resources WHERE resource_type='pyq' AND level='Qualifier' GROUP BY subject, sub_type ORDER BY subject, sub_type", (err2, rows) => {
    console.log('\nRemaining Qualifier PYQs:');
    rows.forEach(r => console.log(`  ${r.subject} — ${r.sub_type}: ${r.cnt}`));
    db.close();
  });
});
