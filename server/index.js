import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import db from './db.js';
import pseoRouter from './pseo-routes.js';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Hostinger reverse proxy)
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

// ========== RATE LIMITING ==========
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all /api routes
app.use('/api/', apiLimiter);

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
    const ADMIN_USER = process.env.ADMIN_USER;
    const ADMIN_PASS = process.env.ADMIN_PASS;
    if (!ADMIN_USER || !ADMIN_PASS) {
        return res.status(503).json({ error: 'Admin login is not configured.' });
    }
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

    const { email, courseIds, bundleId, discountCode, referralCode, coinsToApply } = req.body;
    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0 || !email) {
        return res.status(400).json({ error: 'Email and at least one course ID are required' });
    }

    try {
        let totalAmount = 0;
        let originalAmount = 0; // The price before any discounts
        let discountAmountTotal = 0; // Total ₹ value of all discounts (coupon + ref + coins)
        let discountApplied = false;
        let isBundleDiscountUsed = false;
        let orderNotes = null;

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
                    originalAmount = bundleSubCourses.filter(bc => courseIds.includes(bc.courseId)).reduce((sum, bc) => sum + Number(bc.price), 0);
                    discountApplied = true;
                } else {
                    return res.status(400).json({ error: 'Bundle discount requires all courses to be selected' });
                }
            }

            if (!isBundleDiscountUsed) {
                totalAmount = bundleSubCourses.filter(bc => courseIds.includes(bc.courseId)).reduce((sum, bc) => sum + Number(bc.price), 0);
                originalAmount = totalAmount;
            }
        } else {
            // --- SINGLE COURSE FLOW ---
            const { data: courses } = await supabase.from('courses').select('id, name, price, discountPrice').in('id', courseIds);
            if (!courses || courses.length === 0) return res.status(400).json({ error: 'Invalid course IDs' });

            totalAmount = courses.reduce((sum, c) => sum + Number((c.discountPrice && c.discountPrice > 0) ? c.discountPrice : c.price), 0);
            originalAmount = courses.reduce((sum, c) => sum + Number(c.price), 0);
            
            // Get course names for notes
            const courseNames = courses.map(c => c.name).join(', ');
            orderNotes = { courses: courseNames, user_email: email };
        }

        // Add bundle name to notes if it's a bundle
        if (bundleId && !orderNotes) {
            const { data: bundle } = await supabase.from('courses').select('name').eq('id', bundleId).single();
            orderNotes = { courses: bundle?.name || 'Bundle', user_email: email };
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

        // --- REFERRAL CODE DISCOUNT (5% off) ---
        let referralDiscount = 0;
        let referrerEmail = null;
        if (referralCode && !isBundleDiscountUsed) {
            const codeToCheck = referralCode.trim().toUpperCase();
            const { data: referrerProfile } = await supabase
                .from('referral_profiles')
                .select('email')
                .eq('referral_code', codeToCheck)
                .maybeSingle();

            if (referrerProfile) {
                // Self-referral check
                if (referrerProfile.email.toLowerCase() === email.toLowerCase()) {
                    return res.status(400).json({ error: 'You cannot use your own referral code' });
                }
                referralDiscount = Math.floor(totalAmount * 0.05);
                totalAmount = totalAmount - referralDiscount;
                referrerEmail = referrerProfile.email;
            } else {
                return res.status(400).json({ error: 'Invalid referral code' });
            }
        }

        // --- COIN WALLET DEDUCTION ---
        let coinsApplied = 0;
        const MAX_COINS_PER_ORDER = 50;
        if (coinsToApply && coinsToApply > 0) {
            const { data: buyerReferral } = await supabase
                .from('referral_profiles')
                .select('wallet_balance')
                .eq('email', email)
                .maybeSingle();

            if (buyerReferral) {
                // Server-side enforcement: cap at 50 coins, actual balance, and keep cart ≥ ₹1
                const maxCoins = Math.min(MAX_COINS_PER_ORDER, buyerReferral.wallet_balance, totalAmount - 1);
                coinsApplied = Math.min(coinsToApply, Math.max(maxCoins, 0));
                if (coinsApplied > 0) {
                    totalAmount = totalAmount - coinsApplied;
                }
            }
        }

        if (totalAmount <= 0) totalAmount = 1; // Razorpay minimum
        if (totalAmount < 1) return res.status(400).json({ error: 'Total amount must be at least ₹1' });

        const order = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: orderNotes || { user_email: email }
        });

        const { error: insertError } = await supabase.from('website_orders').insert({
            order_id: order.id,
            user_email: email,
            course_ids: courseIds,
            original_amount: originalAmount,
            discount_amount: Math.max(originalAmount - totalAmount, 0),
            total_amount: totalAmount,
            status: 'CREATED',
            discount_code: discountCode || null,
            referral_code: referralCode || null,
            coins_applied: coinsApplied || 0
        });
        
        if (insertError) {
          console.error('[CRITICAL] Failed to insert into website_orders:', insertError);
        }

        res.json({ ...order, _serverTotal: totalAmount, _discountApplied: discountApplied, _referralDiscount: referralDiscount, _coinsApplied: coinsApplied, _referrerEmail: referrerEmail });
    } catch (err) {
        console.error('Order creation error:', err);
        res.status(500).json({ error: err.message || 'Internal server error' });
    }
});

// Helper to send data to Google Sheets with 60s timeout (background fire & forget)
async function sendToGoogleSheet(payload) {
    const url = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    console.log('[DEBUG] GOOGLE_SHEET_WEBHOOK_URL:', url);
    console.log('[DEBUG] Google Sheet Payload:', JSON.stringify(payload, null, 2));

    if (!url) {
        console.error('[DEBUG] Google Sheet URL is missing!');
        return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60-second timeout

    try {
        console.log('[DEBUG] Sending request to Google Apps Script...');
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }),
            signal: controller.signal
        });

        const resText = await res.text();
        console.log('[DEBUG] Google Sheet Response status:', res.status);
        console.log('[DEBUG] Google Sheet Response text:', resText);
        
        if (!res.ok) {
            console.error('[DEBUG] Google Sheet Fetch failed:', res.status, resText);
        }
    } catch (err) {
        if (err.name === 'AbortError') {
            console.error('[DEBUG] Google Sheet Log Timeout (60s)');
        } else {
            console.error('[DEBUG] Google Sheet Log Error:', err.message);
        }
    } finally {
        clearTimeout(timeout);
    }
}

// ========== PAYMENTS (Razorpay) ==========
// Helper function for LMS enrollment and logging
async function enrollUserInLMS({ email, courseIds, razorpay_order_id, razorpay_payment_id, discountCode, referralCode, coinsApplied }) {
    if (!supabase) return { success: false, error: 'Supabase not initialized' };
    
    // 1. Check if already processed (Idempotency)
    const { data: existingOrder } = await supabase
        .from('website_orders')
        .select('status')
        .eq('order_id', razorpay_order_id)
        .single();
    
    // If already PAID, we still return success but skip re-enrolling
    if (existingOrder?.status === 'PAID') {
        return { success: true, alreadyProcessed: true };
    }

    const lms_enroll_url = process.env.LMS_ENROLL_URL || "https://class.genziitian.in/api/external-enroll";
    
    // Update status to PAID immediately to prevent race conditions
    await supabase.from('website_orders').update({ status: 'PAID' }).eq('order_id', razorpay_order_id);
    
    const { data: profile } = await supabase.from('profiles').select('id, name, phone').eq('email', email).single();

    // === STEP 1: LMS ENROLLMENT (isolated — failures must NOT block referral/coin processing) ===
    let lmsEnrollmentSucceeded = false;
    try {
        const lmsRes = await fetch(lms_enroll_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                secret: process.env.EXTERNAL_ENROLL_SECRET,
                email,
                name: profile?.name || "Student",
                phone: profile?.phone || "N/A",
                courseIds
            })
        });

        if (!lmsRes.ok) {
            const errorText = await lmsRes.text();
            throw new Error(errorText);
        }

        lmsEnrollmentSucceeded = true;

        const successLogs = courseIds.map(cid => ({
            userId: profile?.id,
            email,
            action: 'ENROLLMENT_SUCCESS',
            courseId: cid,
            created_at: new Date().toISOString(),
            metadata: { order_id: razorpay_order_id, payment_id: razorpay_payment_id, source: 'system' }
        }));
        await supabase.from('activity_logs').insert(successLogs);
    } catch (lmsErr) {
        console.error('LMS Enrollment Error:', lmsErr);
        try {
            const failureLogs = courseIds.map(cid => ({
                userId: profile?.id,
                email,
                action: 'ENROLLMENT_FAILURE',
                courseId: cid,
                created_at: new Date().toISOString(),
                metadata: { error: String(lmsErr), order_id: razorpay_order_id }
            }));
            await supabase.from('activity_logs').insert(failureLogs);
        } catch (logErr) {
            console.error('Failed to log enrollment failure:', logErr);
        }
    }

    // === STEP 2: GOOGLE SHEETS LOGGING (runs regardless of LMS result) ===
    try {
        let orderAmount = 0;
        let refCode = "N/A";
        let discCode = "N/A";
        let coinsUsed = 0;
        let courseNames = "Unknown Course";
        
        if (razorpay_order_id) {
            const { data: order } = await supabase.from('website_orders').select('*').eq('order_id', razorpay_order_id).single();
            if (order) {
                orderAmount = order.total_amount;
                refCode = order.referral_code || "N/A";
                discCode = order.discount_code || "N/A";
                coinsUsed = order.coins_applied || 0;
            }
        }
        
        if (courseIds && Array.isArray(courseIds) && courseIds.length > 0) {
            const { data: courses, error: coursesError } = await supabase.from('course_catalog').select('name').in('id', courseIds);
            if (courses && courses.length > 0) {
                courseNames = courses.map(c => c.name).join(', ');
            } else {
                const { data: coursesFallback } = await supabase.from('courses').select('name').in('id', courseIds);
                if (coursesFallback && coursesFallback.length > 0) {
                    courseNames = coursesFallback.map(c => c.name).join(', ');
                }
            }
        }

        console.log('[DEBUG] Calling sendToGoogleSheet...');
        sendToGoogleSheet({
            name: profile?.name || "Student",
            email,
            phone: profile?.phone || "N/A",
            course_name: courseNames,
            price: orderAmount,
            status: lmsEnrollmentSucceeded ? 'SUCCESS' : 'ENROLLMENT_FAILED',
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            referral_code: refCode,
            discount_code: discCode,
            coins_applied: coinsUsed
        }).catch(err => console.error("Background Sheet Log Error:", err));
    } catch (sheetErr) {
        console.error('Sheet Logging Error:', sheetErr);
    }

    // === STEP 3: RECORD COUPON USAGE (runs regardless of LMS result) ===
    if (discountCode) {
        try {
            await supabase.from('coupon_uses').upsert({ 
                code: discountCode, 
                user_email: email, 
                order_id: razorpay_order_id 
            }, { onConflict: 'code,user_email' });
        } catch (couponErr) {
            console.error('Coupon usage tracking error (non-fatal):', couponErr);
        }
    }

    // === STEP 4: REFERRAL REWARD PROCESSING (runs regardless of LMS result) ===
    if (referralCode) {
        try {
            console.log(`[Referral] Processing code: ${referralCode} for buyer: ${email}`);
            const codeToCheck = referralCode.trim().toUpperCase();
            const { data: referrerProfile } = await supabase
                .from('referral_profiles')
                .select('*')
                .eq('referral_code', codeToCheck)
                .maybeSingle();

            if (referrerProfile && referrerProfile.email.toLowerCase() !== email.toLowerCase()) {
                // Get order amount for calculation
                const { data: orderRow } = await supabase
                    .from('website_orders')
                    .select('total_amount')
                    .eq('order_id', razorpay_order_id)
                    .maybeSingle();

                const finalPrice = orderRow?.total_amount || 0;
                
                if (!orderRow || finalPrice <= 0) {
                    console.error('[CRITICAL] Could not find order amount for referral reward:', razorpay_order_id);
                    throw new Error('Order amount not found for reward calculation');
                }

                const referrerReward = Math.floor(finalPrice * 0.05);
                
                // Metadata for record
                const originalPrice = Math.ceil(finalPrice / 0.95);
                const buyerDiscount = originalPrice - finalPrice;

                // Credit referrer wallet
                const newBalance = (referrerProfile.wallet_balance || 0) + referrerReward;
                const newLifetime = (referrerProfile.lifetime_referrals || 0) + 1;
                const newQuarterly = (referrerProfile.quarterly_referrals || 0) + 1;

                // Check milestone bonuses
                const { data: milestones } = await supabase
                    .from('referral_milestones')
                    .select('*')
                    .order('referrals_required', { ascending: true });

                let milestoneBonus = 0;
                if (milestones) {
                    for (const ms of milestones) {
                        if (newQuarterly >= ms.referrals_required && (referrerProfile.quarterly_referrals || 0) < ms.referrals_required) {
                            milestoneBonus += ms.bonus_coins;
                            console.log(`[Referral] Milestone hit! Bonus: ${ms.bonus_coins}`);
                        }
                    }
                }

                console.log(`[Referral] Rewarding ${referrerReward + milestoneBonus} coins to ${referrerProfile.email}`);

                const { error: updateErr } = await supabase
                    .from('referral_profiles')
                    .update({
                        wallet_balance: newBalance + milestoneBonus,
                        lifetime_referrals: newLifetime,
                        quarterly_referrals: newQuarterly,
                    })
                    .eq('id', referrerProfile.id);

                if (updateErr) {
                    console.error('[Referral] Failed to update referrer wallet:', updateErr);
                    throw updateErr;
                }

                // Insert referral transaction
                const { error: txnErr } = await supabase.from('referral_transactions').insert({
                    referrer_email: referrerProfile.email,
                    buyer_email: email,
                    referral_code: codeToCheck,
                    order_id: razorpay_order_id,
                    original_price: originalPrice,
                    buyer_discount: buyerDiscount,
                    final_price: finalPrice,
                    referrer_reward: referrerReward + milestoneBonus,
                    coins_used: coinsApplied || 0,
                });

                if (txnErr) {
                    console.error('[Referral] Failed to insert transaction:', txnErr);
                    throw txnErr;
                }

                console.log(`[Referral] Successfully rewarded ${referrerProfile.email}`);
            } else if (!referrerProfile) {
                console.log(`[Referral] Code ${codeToCheck} not found.`);
            } else {
                console.log(`[Referral] Buyer using own code. Skipping.`);
            }
        } catch (referralErr) {
            console.error('Referral processing error (non-fatal):', referralErr);
        }
    }

    // === STEP 5: DEDUCT BUYER COINS (runs regardless of LMS result) ===
    if (coinsApplied && coinsApplied > 0) {
        try {
            const { data: buyerRef } = await supabase
                .from('referral_profiles')
                .select('wallet_balance')
                .eq('email', email)
                .maybeSingle();

            if (buyerRef) {
                const newBal = Math.max((buyerRef.wallet_balance || 0) - coinsApplied, 0);
                await supabase
                    .from('referral_profiles')
                    .update({ wallet_balance: newBal })
                    .eq('email', email);
            }
        } catch (coinErr) {
            console.error('Coin deduction error (non-fatal):', coinErr);
        }
    }

    return { success: lmsEnrollmentSucceeded };
}

app.post('/api/verify-payment', async (req, res) => {
    if (!razorpay || !supabase) return res.status(500).json({ error: 'Server configuration error' });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, courseIds, discountCode, referralCode, coinsApplied } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', razorpaySecret).update(body.toString()).digest('hex');

    if (expectedSignature !== razorpay_signature) {
        // --- GOOGLE SHEETS LOGGING (FAILED - SIGNATURE) ---
        try {
            let orderAmount = 0;
            let courseNames = "Unknown Course";
            
            const { data: profile } = await supabase.from('profiles').select('name, phone').eq('email', email).single();
                
            if (razorpay_order_id) {
                const { data: order } = await supabase.from('website_orders').select('total_amount').eq('order_id', razorpay_order_id).single();
                if (order) orderAmount = order.total_amount;
            }
                
            if (courseIds && Array.isArray(courseIds) && courseIds.length > 0) {
                const { data: courses } = await supabase.from('course_catalog').select('name').in('id', courseIds);
                if (courses && courses.length > 0) {
                    courseNames = courses.map(c => c.name).join(', ');
                } else {
                    const { data: coursesFallback } = await supabase.from('courses').select('name').in('id', courseIds);
                    if (coursesFallback && coursesFallback.length > 0) {
                        courseNames = coursesFallback.map(c => c.name).join(', ');
                    }
                }
            }

            console.log('[DEBUG] Calling sendToGoogleSheet for signature mismatch failure...');
            sendToGoogleSheet({
                name: profile?.name || "Student",
                email,
                phone: profile?.phone || "N/A",
                course_name: courseNames,
                price: orderAmount,
                status: 'FAILED',
                payment_id: null,
                order_id: razorpay_order_id,
                failure_source: 'BACKEND_VERIFICATION'
            }).catch(err => console.error("Background Sheet Log Error:", err));
        } catch (sheetErr) { }

        return res.status(400).json({ error: 'Signature mismatch' });
    }

    try {
        const result = await enrollUserInLMS({
            email,
            courseIds,
            razorpay_order_id,
            razorpay_payment_id,
            discountCode,
            referralCode,
            coinsApplied
        });
        
        // Always return success to the user — payment IS verified and PAID.
        // LMS enrollment failures are logged server-side and can be retried manually.
        // Referral rewards and coin deductions run regardless of LMS status.
        res.json({ success: true, lmsEnrolled: result.success });
    } catch (err) {
        console.error('Verification error:', err);
        // Even if enrollUserInLMS throws unexpectedly, the payment is already PAID.
        // Return success to avoid showing the user a false "payment failed" error.
        res.json({ success: true, enrollmentError: err.message });
    }
});

app.get('/api/get-orders', async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Supabase not initialized' });
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const { data, error } = await supabase
            .from('website_orders')
            .select('*')
            .eq('user_email', email)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOG FRONTEND FAILURE
app.post('/api/log-payment-failure', async (req, res) => {
    const { email, order_id, failure_source, courseIds } = req.body;
    try {
        let orderAmount = 0;
        let courseNames = "Unknown Course";
        
        const { data: profile } = await supabase.from('profiles').select('name, phone').eq('email', email).single();
                
        if (order_id) {
            const { data: order } = await supabase.from('website_orders').select('total_amount').eq('order_id', order_id).single();
            if (order) orderAmount = order.total_amount;
        }
                
        if (courseIds && Array.isArray(courseIds) && courseIds.length > 0) {
            const { data: courses } = await supabase.from('course_catalog').select('name').in('id', courseIds);
            if (courses && courses.length > 0) {
                courseNames = courses.map(c => c.name).join(', ');
            } else {
                const { data: coursesFallback } = await supabase.from('courses').select('name').in('id', courseIds);
                if (coursesFallback && coursesFallback.length > 0) {
                    courseNames = coursesFallback.map(c => c.name).join(', ');
                }
            }
        }

        console.log('[DEBUG] Calling sendToGoogleSheet for logged payment failure...');
        sendToGoogleSheet({
            name: profile?.name || "Student",
            email,
            phone: profile?.phone || "N/A",
            course_name: courseNames,
            price: orderAmount,
            status: 'FAILED',
            payment_id: "failed_manual",
            order_id: order_id,
            failure_source: failure_source || 'FRONTEND_RAZORPAY',
            referral_code: "N/A",
            discount_code: "N/A",
            coins_applied: 0
        }).catch(err => console.error("Background Sheet Log Error:", err));
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/manager-fetch', authMiddleware, async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Supabase not initialized' });
    const { tab, filter } = req.query;

    try {
        if (tab === 'courses') {
            const { data, error } = await supabase.from('courses').select('*').order('name');
            if (error) throw error;
            return res.json(data);
        }
        if (tab === 'discounts') {
            const { data, error } = await supabase.from('discount_coupons').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return res.json(data);
        }
        if (tab === 'payments') {
            const { data, error } = await supabase.from('website_orders').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return res.json(data);
        }
        if (tab === 'referrals') {
            const { data, error } = await supabase.from('referral_transactions').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return res.json(data);
        }
        res.status(400).json({ error: 'Invalid tab' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Razorpay Webhook for mobile reliability
app.post('/api/razorpay-webhook', async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!secret || !signature) {
        return res.status(400).json({ error: 'Missing webhook secret or signature' });
    }

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (expectedSignature !== signature) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'order.paid' || event === 'payment.captured') {
        const payment = payload.payment.entity;
        const order_id = payment.order_id;
        
        // Fetch order details from our DB using order_id
        const { data: order } = await supabase
            .from('website_orders')
            .select('*')
            .eq('order_id', order_id)
            .single();

        if (order && order.status !== 'PAID') {
            await enrollUserInLMS({
                email: order.user_email,
                courseIds: order.course_ids,
                razorpay_order_id: order_id,
                razorpay_payment_id: payment.id,
                discountCode: order.discount_code // Ensure this column exists in your DB or handle accordingly
            });
        }
    }

    res.json({ status: 'ok' });
});

// ========== REFERRAL API ==========
app.get('/api/referral', async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Supabase not initialized' });
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const { data: profile } = await supabase
            .from('referral_profiles')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (profile) {
            // Lazy quarterly reset
            const quarterStart = new Date(profile.quarter_start_date);
            const now = new Date();
            const diffDays = (now.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24);

            if (diffDays >= 90) {
                const { data: updated } = await supabase
                    .from('referral_profiles')
                    .update({ quarterly_referrals: 0, quarter_start_date: now.toISOString() })
                    .eq('id', profile.id)
                    .select()
                    .single();
                return res.json(updated);
            }

            return res.json(profile);
        }

        // Profile doesn't exist yet — return null (Profile page will create it via frontend)
        return res.json(null);
    } catch (err) {
        console.error('Referral API error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Validate referral code
app.get('/api/referral/validate', async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Supabase not initialized' });
    const { code } = req.query;
    if (!code) return res.status(400).json({ valid: false });

    try {
        const { data } = await supabase
            .from('referral_profiles')
            .select('email')
            .eq('referral_code', String(code).trim().toUpperCase())
            .maybeSingle();

        if (data) {
            return res.json({ valid: true, referrerEmail: data.email });
        }
        return res.json({ valid: false });
    } catch (err) {
        res.status(500).json({ valid: false });
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
