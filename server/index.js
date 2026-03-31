import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import db from './db.js';
import pseoRouter from './pseo-routes.js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'genz@2025';

const sessions = new Map();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.static(path.join(__dirname, '..', 'dist')));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

// ========== AUTH ==========

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.slice(7);
    const session = sessions.get(token);
    if (!session || session.expires < Date.now()) { sessions.delete(token); return res.status(401).json({ error: 'Session expired' }); }
    next();
}

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        const token = crypto.randomBytes(32).toString('hex');
        sessions.set(token, { user: username, expires: Date.now() + 24 * 60 * 60 * 1000 });
        return res.json({ token, message: 'Login successful' });
    }
    res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) sessions.delete(authHeader.slice(7));
    res.json({ message: 'Logged out' });
});

app.get('/api/auth/check', authMiddleware, (req, res) => {
    res.json({ authenticated: true });
});

// ========== PUBLIC API ==========

app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await db.allAsync('SELECT * FROM blogs WHERE published = 1 ORDER BY id DESC');
        res.json(blogs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/blogs/:slug', async (req, res) => {
    try {
        const blog = await db.getAsync('SELECT * FROM blogs WHERE slug = ? AND published = 1', [req.params.slug]);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/resources', async (req, res) => {
    const { level, subject, type } = req.query;
    let query = 'SELECT * FROM resources WHERE published = 1';
    const params = [];
    if (level) { query += ' AND level = ?'; params.push(level); }
    if (subject) { query += ' AND subject = ?'; params.push(subject); }
    if (type) { query += ' AND resource_type = ?'; params.push(type); }
    query += ' ORDER BY level, subject, resource_type, sub_type, id';

    try {
        const resources = await db.allAsync(query, params);
        res.json(resources);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/resources/subjects', async (req, res) => {
    const { level } = req.query;
    let query = 'SELECT DISTINCT level, subject FROM resources WHERE published = 1';
    const params = [];
    if (level) { query += ' AND level = ?'; params.push(level); }
    query += ' ORDER BY level, subject';

    try {
        const subjects = await db.allAsync(query, params);
        res.json(subjects);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/settings', async (req, res) => {
    try {
        const settings = await db.allAsync('SELECT * FROM settings');
        const config = {};
        settings.forEach(s => config[s.key] = s.value);
        res.json(config);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== ADMIN API ==========

app.get('/api/admin/blogs', authMiddleware, async (req, res) => {
    try {
        const blogs = await db.allAsync('SELECT * FROM blogs ORDER BY id DESC');
        res.json(blogs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/blogs', authMiddleware, async (req, res) => {
    const { title, slug, category, content, image, date, read_time, published, seo_title, seo_description, seo_keywords } = req.body;
    const finalSlug = slug || title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    try {
        const result = await db.runAsync(`INSERT INTO blogs (title, slug, category, content, image, date, read_time, published, seo_title, seo_description, seo_keywords) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title || '', finalSlug, category || '', content || '', image || '', date || '', read_time || '5 min read', published ?? 1, seo_title || '', seo_description || '', seo_keywords || '']);
        res.json({ id: result.lastID, message: 'Blog created' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/blogs/:id', authMiddleware, async (req, res) => {
    const { title, slug, category, content, image, date, read_time, published, seo_title, seo_description, seo_keywords } = req.body;
    const finalSlug = slug || title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    try {
        await db.runAsync(`UPDATE blogs SET title=?, slug=?, category=?, content=?, image=?, date=?, read_time=?, published=?, seo_title=?, seo_description=?, seo_keywords=?, updated_at=datetime('now') WHERE id=?`,
            [title, finalSlug, category, content, image, date, read_time, published ?? 1, seo_title || '', seo_description || '', seo_keywords || '', req.params.id]);
        res.json({ message: 'Blog updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/blogs/:id', authMiddleware, async (req, res) => {
    try {
        await db.runAsync('DELETE FROM blogs WHERE id = ?', [req.params.id]);
        res.json({ message: 'Blog deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- RESOURCES ---
app.get('/api/admin/resources', authMiddleware, async (req, res) => {
    try {
        const resources = await db.allAsync('SELECT * FROM resources ORDER BY level, subject, resource_type, sub_type, id DESC');
        res.json(resources);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/resources', authMiddleware, async (req, res) => {
    const { level, subject, resource_type, sub_type, title, description, url, published } = req.body;
    try {
        const result = await db.runAsync(`INSERT INTO resources (level, subject, resource_type, sub_type, title, description, url, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [level || '', subject || '', resource_type || 'note', sub_type || '', title || '', description || '', url || '', published ?? 1]);
        res.json({ id: result.lastID, message: 'Resource created' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/resources/:id', authMiddleware, async (req, res) => {
    const { level, subject, resource_type, sub_type, title, description, url, published } = req.body;
    try {
        await db.runAsync(`UPDATE resources SET level=?, subject=?, resource_type=?, sub_type=?, title=?, description=?, url=?, published=?, updated_at=datetime('now') WHERE id=?`,
            [level, subject, resource_type, sub_type || '', title, description || '', url, published ?? 1, req.params.id]);
        res.json({ message: 'Resource updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/resources/:id', authMiddleware, async (req, res) => {
    try {
        await db.runAsync('DELETE FROM resources WHERE id = ?', [req.params.id]);
        res.json({ message: 'Resource deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- WIDGETS ---
app.get('/api/widgets', async (req, res) => {
    try {
        const widgets = await db.allAsync('SELECT * FROM widgets WHERE published = 1 ORDER BY position ASC');
        res.json(widgets);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/widgets', authMiddleware, async (req, res) => {
    try {
        const widgets = await db.allAsync('SELECT * FROM widgets ORDER BY position ASC');
        res.json(widgets);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/widgets', authMiddleware, async (req, res) => {
    const { title, image, link, position, published } = req.body;
    try {
        const result = await db.runAsync(`INSERT INTO widgets (title, image, link, position, published) VALUES (?, ?, ?, ?, ?)`,
            [title || '', image || '', link || '', position || 0, published ?? 1]);
        res.json({ id: result.lastID, message: 'Widget created' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/widgets/:id', authMiddleware, async (req, res) => {
    const { title, image, link, position, published } = req.body;
    try {
        await db.runAsync(`UPDATE widgets SET title=?, image=?, link=?, position=?, published=?, updated_at=datetime('now') WHERE id=?`,
            [title, image, link, position || 0, published ?? 1, req.params.id]);
        res.json({ message: 'Widget updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/widgets/:id', authMiddleware, async (req, res) => {
    try {
        await db.runAsync('DELETE FROM widgets WHERE id = ?', [req.params.id]);
        res.json({ message: 'Widget deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- SETTINGS ---
app.get('/api/admin/settings', authMiddleware, async (req, res) => {
    try {
        const settings = await db.allAsync('SELECT * FROM settings');
        res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/settings', authMiddleware, async (req, res) => {
    const settings = req.body; // Expecting array of {key, value}
    try {
        for (const s of settings) {
            await db.runAsync(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [s.key, s.value]);
        }
        res.json({ message: 'Settings updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== pSEO ENGINE ==========
app.use('/api/pseo', pseoRouter);

// --- CATCH-ALL FOR FRONTEND ---
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/admin')) {
        res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`\n  🔐 Admin Panel running at: http://localhost:${PORT}/admin`);
    console.log(`  📡 API running at: http://localhost:${PORT}/api\n`);
});
