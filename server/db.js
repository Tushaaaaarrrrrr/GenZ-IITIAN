import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'admin.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Could not connect to database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database.');
  }
});

// Helper to run queries as promises
db.runAsync = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) reject(err);
    else resolve({ lastID: this.lastID, changes: this.changes });
  });
});

db.allAsync = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

db.getAsync = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

db.execAsync = (sql) => new Promise((resolve, reject) => {
  db.exec(sql, (err) => {
    if (err) reject(err);
    else resolve();
  });
});

// Initialize Tables
const init = async () => {
  await db.execAsync(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        image TEXT NOT NULL DEFAULT '',
        date TEXT NOT NULL DEFAULT '',
        read_time TEXT NOT NULL DEFAULT '5 min read',
        published INTEGER NOT NULL DEFAULT 1,
        seo_title TEXT NOT NULL DEFAULT '',
        seo_description TEXT NOT NULL DEFAULT '',
        seo_keywords TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL,
        subject TEXT NOT NULL,
        resource_type TEXT NOT NULL DEFAULT 'note',
        sub_type TEXT NOT NULL DEFAULT '',
        title TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        url TEXT NOT NULL DEFAULT '',
        published INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS widgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL DEFAULT '',
        image TEXT NOT NULL DEFAULT '',
        link TEXT NOT NULL DEFAULT '',
        position INTEGER NOT NULL DEFAULT 0,
        published INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

  // Migrations
  try { await db.execAsync(`ALTER TABLE blogs ADD COLUMN slug TEXT NOT NULL DEFAULT ''`); } catch (e) { }
  try { await db.execAsync(`ALTER TABLE resources ADD COLUMN sub_type TEXT NOT NULL DEFAULT ''`); } catch (e) { }
  try { await db.execAsync(`ALTER TABLE resources ADD COLUMN description TEXT NOT NULL DEFAULT ''`); } catch (e) { }
  try { await db.execAsync(`ALTER TABLE blogs ADD COLUMN seo_title TEXT NOT NULL DEFAULT ''`); } catch (e) { }
  try { await db.execAsync(`ALTER TABLE blogs ADD COLUMN seo_description TEXT NOT NULL DEFAULT ''`); } catch (e) { }
  try { await db.execAsync(`ALTER TABLE blogs ADD COLUMN seo_keywords TEXT NOT NULL DEFAULT ''`); } catch (e) { }

  // Seed Settings
  const settingsCount = await db.getAsync('SELECT COUNT(*) as count FROM settings');
  if (settingsCount.count === 0) {
    const defaultSettings = [
      { k: 'site_title', v: 'Gen-Z IITian | We transform You into genz iitians' },
      { k: 'site_description', v: 'Leading education platform for IIT Madras BS degree aspirants.' },
      { k: 'site_keywords', v: 'IIT Madras, BS Degree, Qualifier, Data Science, Aero' },
      { k: 'og_image', v: 'https://app.genziitian.in/og-image.jpg' },
      { k: 'ga_id', v: '' },
      { k: 'fb_pixel', v: '' }
    ];
    for (const s of defaultSettings) {
      await db.runAsync(`INSERT INTO settings (key, value) VALUES (?, ?)`, [s.k, s.v]);
    }
  }

  // Seed Blogs
  const blogCount = await db.getAsync('SELECT COUNT(*) as count FROM blogs');
  if (blogCount.count === 0) {
    const blogs = [
      { title: "How to Crack IIT Madras Qualifier Exam in First Attempt", slug: "how-to-crack-iit-madras-qualifier", category: "Exam Prep", content: "A comprehensive guide to clearing your IIT Madras qualifier exam on the first try.", image: "https://picsum.photos/seed/blog1/600/400", date: "Oct 12, 2024", read_time: "5 min read" },
      { title: "Top 5 Programming Languages to Learn in 2025", slug: "top-5-programming-languages-2025", category: "Career", content: "Explore the most in-demand programming languages.", image: "https://picsum.photos/seed/blog2/600/400", date: "Oct 15, 2024", read_time: "5 min read" },
    ];
    for (const b of blogs) {
      await db.runAsync(`INSERT INTO blogs (title, slug, category, content, image, date, read_time) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [b.title, b.slug, b.category, b.content, b.image, b.date, b.read_time]);
    }
  }

  // Seed Widgets
  const widgetCount = await db.getAsync('SELECT COUNT(*) as count FROM widgets');
  if (widgetCount.count === 0) {
    await db.runAsync(`INSERT INTO widgets (title, image, link, position) VALUES (?, ?, ?, ?)`, ['IIT Madras BS Degree - Enroll Now', 'https://picsum.photos/seed/widget1/400/500', 'https://example.com/enroll', 1]);
    await db.runAsync(`INSERT INTO widgets (title, image, link, position) VALUES (?, ?, ?, ?)`, ['Free Python Course', 'https://picsum.photos/seed/widget2/400/500', 'https://example.com/python', 2]);
  }

  // Seed Resources from JSON file
  const resourceCount = await db.getAsync('SELECT COUNT(*) as count FROM resources');
  if (resourceCount.count === 0) {
    const seedPath = path.join(__dirname, '..', 'data', 'seed-resources.json');
    if (fs.existsSync(seedPath)) {
      const resources = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
      for (const r of resources) {
        await db.runAsync(
          `INSERT INTO resources (level, subject, resource_type, sub_type, title, description, url, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [r.level, r.subject, r.resource_type, r.sub_type || '', r.title, r.description || '', r.url, r.published ?? 1]
        );
      }
      console.log(`✅ Seeded ${resources.length} resources from seed-resources.json`);
    }
  }

  // Remove placeholder BDM Sep 2024 entry
  await db.runAsync("DELETE FROM resources WHERE title = 'BDM Quiz 1 PYQ - Sep 2024' AND url = '#'");
  await db.runAsync("DELETE FROM resources WHERE subject = 'BDM' AND resource_type = 'note' AND url = '#'");

  // Ensure BDM PYQs exist
  const bdmPyqs = [
    { level: "Diploma", subject: "BDM", resource_type: "pyq", sub_type: "Quiz 1", title: "BDM Quiz 1 PYQ - Set 1", description: "Previous year questions", url: "https://drive.google.com/file/d/1XxH8OTW_IXoz-3tp3q0Ds7m0CvYfUYgn/view" },
    { level: "Diploma", subject: "BDM", resource_type: "pyq", sub_type: "Quiz 1", title: "BDM Quiz 1 PYQ - Set 2", description: "Previous year questions", url: "https://drive.google.com/file/d/15ROKkruHq1BZwPBe9hdfe_pDrOThgZ_s/view" },
  ];
  for (const r of bdmPyqs) {
    const exists = await db.getAsync('SELECT id FROM resources WHERE url = ?', [r.url]);
    if (!exists) {
      await db.runAsync(
        `INSERT INTO resources (level, subject, resource_type, sub_type, title, description, url, published) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [r.level, r.subject, r.resource_type, r.sub_type, r.title, r.description, r.url]
      );
      console.log(`✅ Inserted BDM PYQ: ${r.title}`);
    }
  }

  // Ensure BDM notes exist
  const bdmNotes = [
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Notes', title: 'BDM Week 1 Notes', description: 'Weekly notes', url: 'https://drive.google.com/file/d/1Uoxiuc6P1_4ptV4XTURSNThhQa0HtWoR/view?usp=drive_link' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Notes', title: 'BDM Week 2 Notes', description: 'Weekly notes', url: 'https://drive.google.com/file/d/10kuVA678PIIjaSwd_TCazpTLsSRsxUBn/view?usp=drive_link' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Notes', title: 'BDM Week 3 Notes', description: 'Weekly notes', url: 'https://drive.google.com/file/d/1XTJXevZl7BTcSeocFffKocNCutRXpk7m/view?usp=drive_link' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Notes', title: 'BDM Week 4 Notes', description: 'Weekly notes', url: 'https://drive.google.com/file/d/1COGrcwnCbqVCQb-pRR2QUW0WZwcsYk89/view?usp=drive_link' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Notes', title: 'BDM Week 5 Notes', description: 'Weekly notes', url: 'https://drive.google.com/file/d/1uCdxBiraDhJmFnwcWI36XI-Ty8RjK03z/view?usp=drive_link' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Notes', title: 'BDM Week 7 Notes', description: 'Weekly notes', url: 'https://drive.google.com/file/d/1osIoslgT2hZomvINE0x3Xx8P3pfTAVAE/view?usp=drive_link' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Notes', title: 'BDM Week 8 Notes', description: 'Weekly notes', url: 'https://drive.google.com/file/d/13QOsjdWUoHMb3i9545NKy31E8luu0Xei/view?usp=drive_link' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Notes', title: 'BDM Week 9 Notes', description: 'Weekly notes', url: 'https://drive.google.com/file/d/1b0d1U9pHUJkmrRUKDIsTSXUzsf9dovCi/view?usp=drive_link' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Notes', title: 'BDM Week 10 Notes', description: 'Weekly notes', url: 'https://drive.google.com/file/d/1hdT_RcU4TXkSqJ15IWZvRWtnQ42RacN-/view?usp=drive_link' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Notes', title: 'BDM Week 11 and 12 Notes', description: 'Weekly notes', url: 'https://drive.google.com/file/d/1N9Wuv7q0O6kZRu2BJRE4eOWA8Y-KlDzr/view?usp=drive_link' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Short Notes', title: 'BDM Short Notes Week 1 to 4', description: 'Short notes', url: 'https://drive.google.com/file/d/1Pp0ilU0RbjRa1BBEMDmxdy-bseWKLHId/view?usp=drive_link' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Short Notes', title: 'BDM Short Notes Week 5 to 8', description: 'Short notes', url: 'https://drive.google.com/file/d/1JDARZi7FdUN_tr0WK-h7LucKxAMh2g7m/view?usp=drive_link' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Short Notes', title: 'BDM Short Notes Week 9 to 12', description: 'Short notes', url: 'https://drive.google.com/file/d/1PkcgHp5F6mMkJKK-f7zsp3bOGf-ZqOva/view?usp=drive_link' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Summary Notes', title: 'BDM Summary Notes Week 1', description: 'Summary notes', url: 'https://drive.google.com/file/d/1rWcbHiy3aWFfz5S4k7FMyLhaMNQRqHh_/view' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Summary Notes', title: 'BDM Summary Notes Week 1 to 4 - Set 1', description: 'Summary notes', url: 'https://drive.google.com/file/u/5/d/1AFH6kXlUih_5LxW1zTBBqyoQDIZ3mWrD/view' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Formula Sheet', title: 'BDM Formula Sheet', description: 'Formula reference document', url: 'https://docs.google.com/document/u/0/d/1E_iN7EqtsperhA6H7JprM0CD1UHbH4mW' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Notes', title: 'BDM Week 1 Notes - Set 2', description: 'Weekly notes', url: 'https://drive.google.com/file/d/18O-DIVzwzlFE2mFwSKXXHflIAnjfLx3C/view' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Notes', title: 'BDM Week 2 Notes - Set 2', description: 'Weekly notes', url: 'https://drive.google.com/file/d/1qah00cuwxPnN1IVAx25p_JXeuJdhEZjK/view' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Notes', title: 'BDM Week 3 Notes - Set 2', description: 'Weekly notes', url: 'https://drive.google.com/file/d/1VWzUmhBEN0CLm7pmEuS28FRN_egdX4CL/view' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Notes', title: 'BDM Week 4 Notes - Set 2', description: 'Weekly notes', url: 'https://drive.google.com/file/d/1vxOu0etuj1GQZpAF3T-01m8ohmv0arO0/view' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Summary Notes', title: 'BDM Week 5 Summary Notes', description: 'Summary notes', url: 'https://drive.google.com/file/d/1659NGC5-gkgcDQkqVVTwAax_ryzwh52e/view?usp=sharing' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Notes', title: 'BDM Week 10 Notes - Set 2', description: 'Weekly notes', url: 'https://drive.google.com/file/d/1U1q4ekh3HUD5RYDuazHqL6iAVrVLMIY6/view?usp=drivesdk' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Notes', title: 'BDM Week 9 Notes - Set 2', description: 'Weekly notes', url: 'https://drive.google.com/file/d/1UCYVihnXtcOLVpsEm0lsX9BLKrH3huFp/view?usp=drivesdk' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Notes', title: 'BDM Week 11 Notes', description: 'Weekly notes', url: 'https://drive.google.com/file/d/1kthdnotk02Y55Z25E3Etik8EmtNLlk85/view?usp=sharing' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Summary Notes', title: 'BDM Week 1 to 4 Notes - Set 2', description: 'Summary notes', url: 'https://drive.google.com/file/d/1E96ycMPPtzykS9bvrGFF3yK9zbXx_sDU/view?usp=sharing' },
    { level: 'Diploma', subject: 'BDM', resource_type: 'note', sub_type: 'Summary Notes', title: 'BDM Week 5 to 11 Notes', description: 'Summary notes', url: 'https://drive.google.com/file/d/120D5MoKCd85Ac0YpneYh-tvW5tJVZfEE/view?usp=sharing' },
  ];

  for (const r of bdmNotes) {
    const exists = await db.getAsync('SELECT id FROM resources WHERE url = ?', [r.url]);
    if (!exists) {
      await db.runAsync(
        `INSERT INTO resources (level, subject, resource_type, sub_type, title, description, url, published) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [r.level, r.subject, r.resource_type, r.sub_type, r.title, r.description, r.url]
      );
      console.log(`✅ Inserted BDM note: ${r.title}`);
    }
  }
};

init().catch(console.error);

export default db;
