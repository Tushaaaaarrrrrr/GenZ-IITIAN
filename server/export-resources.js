import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'admin.db');
const db = new sqlite3.Database(dbPath);

const allAsync = (sql) => new Promise((resolve, reject) => {
  db.all(sql, (err, rows) => { if (err) reject(err); else resolve(rows); });
});

(async () => {
  const resources = await allAsync('SELECT level, subject, resource_type, sub_type, title, description, url, published FROM resources ORDER BY id');
  const outPath = path.join(__dirname, '..', 'data', 'seed-resources.json');
  fs.writeFileSync(outPath, JSON.stringify(resources, null, 2));
  console.log(`Exported ${resources.length} resources to data/seed-resources.json`);
  db.close();
})();
