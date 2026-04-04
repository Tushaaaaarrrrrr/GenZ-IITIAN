import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
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

// Initialize Supabase Admin
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Initialize Razorpay
const razorpayKeyId = process.env.VITE_RAZORPAY_KEY_ID;
const razorpaySecret = process.env.RAZORPAY_SECRET;
const razorpay = (razorpayKeyId && razorpaySecret)
  ? new Razorpay({ key_id: razorpayKeyId, key_secret: razorpaySecret })
  : null;

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;

if (!ADMIN_USER || !ADMIN_PASS) {
  console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: ADMIN_USER and ADMIN_PASS must be defined in environment variables!');
  console.error('Please set these in your .env file or hosting panel.');
  process.exit(1);
}

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

// ========== PAYMENTS (Razorpay) ==========

app.post('/api/create-order', async (req, res) => {
    if (!razorpay || !supabase) {
        return res.status(500).json({ error: 'Server configuration error (missing Razorpay/Supabase keys)' });
    }

    const { email, courseIds, bundleId, discountCode } = req.body;
    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0 || !email) {
        return res.status(400).json({ error: 'Email and at least one course ID are required' });
    }

    try {
        let totalAmount = 0;
        let discountApplied = false;
        let isBundleDiscountUsed = false;

        // --- BUNDLE FLOW ---
        if (bundleId) {
            const { data: bundle } = await supabase.from('courses').select('*').eq('id', bundleId).eq('isBundle', true).single();
            if (!bundle) return res.status(400).json({ error: 'Invalid bundle ID' });

            const bundleSubCourses = bundle.bundleCourses || [];
            if (bundleSubCourses.length === 0) return res.status(400).json({ error: 'Bundle has no courses' });

            const validBundleCourseIds = bundleSubCourses.map(bc => bc.courseId);
            if (courseIds.filter(id => !validBundleCourseIds.includes(id)).length > 0) {
                return res.status(400).json({ error: 'Some course IDs do not belong to this bundle' });
            }

            if (discountCode && bundle.bundleDiscountCode && discountCode.trim().toUpperCase() === bundle.bundleDiscountCode.toUpperCase()) {
                if (validBundleCourseIds.every(id => courseIds.includes(id))) {
                    isBundleDiscountUsed = true;
                    totalAmount = Number(bundle.bundleDiscountPrice);
                    discountApplied = true;
                } else {
                    return res.status(400).json({ error: 'Bundle discount requires all courses to be selected' });
                }
            }

            if (!isBundleDiscountUsed) {
                totalAmount = bundleSubCourses.filter(bc => courseIds.includes(bc.courseId)).reduce((sum, bc) => sum + Number(bc.price), 0);
            }
        } else {
            // --- SINGLE COURSE FLOW ---
            const { data: courses } = await supabase.from('courses').select('id, price, discountPrice').in('id', courseIds);
            if (!courses || courses.length === 0) return res.status(400).json({ error: 'Invalid course IDs' });

            totalAmount = courses.reduce((sum, c) => sum + Number((c.discountPrice && c.discountPrice > 0) ? c.discountPrice : c.price), 0);
        }

        // --- GLOBAL DISCOUNT ---
        if (discountCode && !isBundleDiscountUsed) {
            const codeToApply = discountCode.trim().toUpperCase();
            const { data: coupon } = await supabase.from('discount_coupons').select('*').eq('code', codeToApply).single();
            if (coupon) {
                const { data: usage } = await supabase.from('coupon_uses').select('*').eq('code', codeToApply).eq('user_email', email).maybeSingle();
                if (usage) return res.status(400).json({ error: 'Discount code already used' });

                if (coupon.applies_to !== 'ALL') {
                    const targetId = (coupon.applies_to || "").trim().toLowerCase();
                    if (!courseIds.some(id => id.trim().toLowerCase() === targetId) && (!bundleId || bundleId.trim().toLowerCase() !== targetId)) {
                        return res.status(400).json({ error: 'Discount code does not apply to selection' });
                    }
                }

                let disc = coupon.discount_percentage ? Math.floor(totalAmount * (coupon.discount_percentage / 100)) : (coupon.discount_amount || 0);
                totalAmount = Math.max(totalAmount - disc, 0);
                discountApplied = true;
            } else {
                return res.status(400).json({ error: 'Invalid discount code' });
            }
        }

        if (totalAmount <= 0) return res.status(400).json({ error: 'Total amount must be greater than zero' });

        const order = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        });

        await supabase.from('website_orders').insert({
            order_id: order.id,
            user_email: email,
            course_ids: courseIds,
            total_amount: totalAmount,
            status: 'CREATED'
        });

        res.json({ ...order, _serverTotal: totalAmount, _discountApplied: discountApplied });
    } catch (err) {
        console.error('Order creation error:', err);
        res.status(500).json({ error: err.message || 'Internal server error' });
    }
});

app.post('/api/verify-payment', async (req, res) => {
    if (!razorpay || !supabase) return res.status(500).json({ error: 'Server configuration error' });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, courseIds, discountCode } = req.body;
    const lms_enroll_url = process.env.LMS_ENROLL_URL || "https://class.genziitian.in/api/external-enroll";

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', razorpaySecret).update(body.toString()).digest('hex');

    if (expectedSignature !== razorpay_signature) return res.status(400).json({ error: 'Signature mismatch' });

    try {
        await supabase.from('website_orders').update({ status: 'PAID' }).eq('order_id', razorpay_order_id);
        const { data: profile } = await supabase.from('profiles').select('id, name').eq('email', email).single();

        try {
            const lmsRes = await fetch(lms_enroll_url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    secret: process.env.EXTERNAL_ENROLL_SECRET,
                    email,
                    name: profile?.name || "Student",
                    courseIds
                })
            });

            if (lmsRes.ok) {
                const successLogs = courseIds.map(cid => ({
                    userId: profile?.id,
                    email,
                    action: 'ENROLLMENT_SUCCESS',
                    courseId: cid,
                    created_at: new Date().toISOString(),
                    metadata: { order_id: razorpay_order_id, payment_id: razorpay_payment_id }
                }));
                await supabase.from('activity_logs').insert(successLogs);

                if (discountCode) {
                    await supabase.from('coupon_uses').insert({ code: discountCode, user_email: email, order_id: razorpay_order_id });
                }
            } else {
                throw new Error(await lmsRes.text());
            }
        } catch (lmsErr) {
            console.error('LMS Error:', lmsErr);
            const failureLogs = courseIds.map(cid => ({
                userId: profile?.id,
                email,
                action: 'ENROLLMENT_FAILURE',
                courseId: cid,
                created_at: new Date().toISOString(),
                metadata: { error: String(lmsErr) }
            }));
            await supabase.from('activity_logs').insert(failureLogs);
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Verification error:', err);
        res.status(500).json({ error: err.message });
    }
});

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
