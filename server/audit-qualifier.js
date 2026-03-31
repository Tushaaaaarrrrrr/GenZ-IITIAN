import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'admin.db');
const db = new sqlite3.Database(dbPath);

console.log('=== All Qualifier PYQs ===');
db.all("SELECT id, level, subject, sub_type, title FROM resources WHERE resource_type='pyq' AND level='Qualifier' ORDER BY subject, sub_type", (err, rows) => {
  rows.forEach(r => console.log(r.id, r.level, r.subject, r.sub_type, '|', r.title));
  console.log('Total:', rows.length);

  console.log('\n=== Qualifier subjects with PYQ counts ===');
  db.all("SELECT subject, sub_type, COUNT(*) as cnt FROM resources WHERE resource_type='pyq' AND level='Qualifier' GROUP BY subject, sub_type ORDER BY subject, sub_type", (err2, counts) => {
    counts.forEach(r => console.log(r.subject, r.sub_type, r.cnt));

    console.log('\n=== Foundation Maths 1 PYQs ===');
    db.all("SELECT id, sub_type, title FROM resources WHERE resource_type='pyq' AND level='Foundation' AND subject='Maths 1' ORDER BY sub_type", (err3, fRows) => {
      fRows.forEach(r => console.log(r.id, r.sub_type, '|', r.title));
      console.log('Total:', fRows.length);
      db.close();
    });
  });
});
