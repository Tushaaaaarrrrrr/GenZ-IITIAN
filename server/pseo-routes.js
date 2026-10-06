import express from 'express';
import pdb from './pseo-db.js';
import {
    validatePage,
    checkDuplicates,
    processBatch,
    generateSitemap,
    getStats,
    buildInternalLinks
} from './pseo-generator.js';

const router = express.Router();

// ==========================================
// PUBLIC API — Serves pSEO pages to frontend
// ==========================================

/**
 * GET /api/pseo/page/:slug
 * Fetch a single published pSEO page by slug
 * Supports nested slugs like: compare/iitm-bs-vs-btech
 */
router.get('/page/*', async (req, res) => {
    try {
        const slug = req.params[0];
        const page = await pdb.getAsync(
            'SELECT * FROM pseo_pages WHERE slug = ? AND published = 1',
            [slug]
        );
        if (!page) return res.status(404).json({ error: 'Page not found' });

        // Parse JSON fields
        page.sections = JSON.parse(page.sections || '[]');
        page.faq = JSON.parse(page.faq || '[]');
        page.secondary_keywords = JSON.parse(page.secondary_keywords || '[]');
        page.internal_links = JSON.parse(page.internal_links || '[]');
        page.related_pages = JSON.parse(page.related_pages || '[]');
        page.schema_data = JSON.parse(page.schema_data || '{}');

        res.json(page);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/pseo/pages
 * List published pSEO pages with pagination and filters
 */
router.get('/pages', async (req, res) => {
    try {
        const { type, cluster, page = 1, limit = 20, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = 'SELECT id, slug, playbook_type, title, meta_description, primary_keyword, cluster_topic, word_count, updated_at FROM pseo_pages WHERE published = 1';
        const params = [];

        if (type) {
            query += ' AND playbook_type = ?';
            params.push(type);
        }
        if (cluster) {
            query += ' AND cluster_topic = ?';
            params.push(cluster);
        }
        if (search) {
            query += ' AND (title LIKE ? OR primary_keyword LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Get total count
        const countQuery = query.replace('SELECT id, slug, playbook_type, title, meta_description, primary_keyword, cluster_topic, word_count, updated_at', 'SELECT COUNT(*) as total');
        const countResult = await pdb.getAsync(countQuery, params);

        query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const pages = await pdb.allAsync(query, params);

        res.json({
            pages,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult.total,
                totalPages: Math.ceil(countResult.total / parseInt(limit)),
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/pseo/related/:slug
 * Get related pages for a given slug
 */
router.get('/related/:slug', async (req, res) => {
    try {
        const page = await pdb.getAsync('SELECT cluster_topic, playbook_type FROM pseo_pages WHERE slug = ?', [req.params.slug]);
        if (!page) return res.json([]);

        const related = await pdb.allAsync(`
      SELECT slug, title, playbook_type, meta_description
      FROM pseo_pages
      WHERE published = 1 AND slug != ? AND (cluster_topic = ? OR playbook_type = ?)
      ORDER BY RANDOM() LIMIT 6
    `, [req.params.slug, page.cluster_topic, page.playbook_type]);

        res.json(related);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/pseo/clusters
 * Get all clusters with page counts
 */
router.get('/clusters', async (req, res) => {
    try {
        const clusters = await pdb.allAsync(`
      SELECT pc.*, COUNT(pp.id) as actual_page_count
      FROM pseo_clusters pc
      LEFT JOIN pseo_pages pp ON pp.cluster_topic = pc.name AND pp.published = 1
      GROUP BY pc.id
      ORDER BY actual_page_count DESC
    `);
        res.json(clusters);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/pseo/sitemap.xml
 * Dynamic sitemap
 */
router.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = req.query.baseUrl || 'https://genziitian.in';
        const xml = await generateSitemap(baseUrl);
        res.set('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ADMIN API — Manage pSEO pages
// ==========================================

/**
 * GET /api/pseo/admin/stats
 * Dashboard statistics
 */
router.get('/admin/stats', async (req, res) => {
    try {
        const stats = await getStats();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/pseo/admin/pages
 * List ALL pages (including unpublished) with admin filters
 */
router.get('/admin/pages', async (req, res) => {
    try {
        const { type, phase, status, page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = 'SELECT * FROM pseo_pages WHERE 1=1';
        const params = [];

        if (type) { query += ' AND playbook_type = ?'; params.push(type); }
        if (phase) { query += ' AND phase = ?'; params.push(parseInt(phase)); }
        if (status) { query += ' AND review_status = ?'; params.push(status); }

        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const countResult = await pdb.getAsync(countQuery, params);

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const pages = await pdb.allAsync(query, params);

        // Parse JSON fields
        for (const p of pages) {
            p.sections = JSON.parse(p.sections || '[]');
            p.faq = JSON.parse(p.faq || '[]');
            p.internal_links = JSON.parse(p.internal_links || '[]');
        }

        res.json({
            pages,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult.total,
                totalPages: Math.ceil(countResult.total / parseInt(limit)),
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/pseo/admin/batch
 * Process a batch of generated pages
 * Body: { pages: [...], phase: 1 }
 */
router.post('/admin/batch', async (req, res) => {
    try {
        const { pages, phase = 1 } = req.body;
        if (!pages || !Array.isArray(pages) || pages.length === 0) {
            return res.status(400).json({ error: 'No pages provided' });
        }
        if (pages.length > 50) {
            return res.status(400).json({ error: 'Maximum 50 pages per batch' });
        }

        const stats = await processBatch(pages, phase);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /api/pseo/admin/pages/:id/publish
 * Publish or unpublish a page
 */
router.put('/admin/pages/:id/publish', async (req, res) => {
    try {
        const { published } = req.body;
        await pdb.runAsync(
            'UPDATE pseo_pages SET published = ?, updated_at = datetime(\'now\') WHERE id = ?',
            [published ? 1 : 0, req.params.id]
        );
        res.json({ message: published ? 'Page published' : 'Page unpublished' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /api/pseo/admin/pages/:id/review
 * Update review status
 */
router.put('/admin/pages/:id/review', async (req, res) => {
    try {
        const { review_status } = req.body;
        if (!['pending', 'approved', 'rejected', 'needs_edit'].includes(review_status)) {
            return res.status(400).json({ error: 'Invalid review status' });
        }
        await pdb.runAsync(
            'UPDATE pseo_pages SET review_status = ?, updated_at = datetime(\'now\') WHERE id = ?',
            [review_status, req.params.id]
        );

        // Auto-publish if approved
        if (review_status === 'approved') {
            await pdb.runAsync(
                'UPDATE pseo_pages SET published = 1 WHERE id = ?',
                [req.params.id]
            );
        }

        res.json({ message: `Review status updated to ${review_status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /api/pseo/admin/pages/:id
 * Update a page's content
 */
router.put('/admin/pages/:id', async (req, res) => {
    try {
        const { title, meta_description, h1, introduction, sections, faq, call_to_action } = req.body;
        await pdb.runAsync(`
      UPDATE pseo_pages SET
        title = COALESCE(?, title),
        meta_description = COALESCE(?, meta_description),
        h1 = COALESCE(?, h1),
        introduction = COALESCE(?, introduction),
        sections = COALESCE(?, sections),
        faq = COALESCE(?, faq),
        call_to_action = COALESCE(?, call_to_action),
        updated_at = datetime('now')
      WHERE id = ?
    `, [
            title, meta_description, h1, introduction,
            sections ? JSON.stringify(sections) : null,
            faq ? JSON.stringify(faq) : null,
            call_to_action,
            req.params.id
        ]);
        res.json({ message: 'Page updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /api/pseo/admin/pages/:id
 * Delete a page
 */
router.delete('/admin/pages/:id', async (req, res) => {
    try {
        await pdb.runAsync('DELETE FROM pseo_pages WHERE id = ?', [req.params.id]);
        res.json({ message: 'Page deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/pseo/admin/bulk-publish
 * Bulk publish/unpublish pages by phase or batch
 */
router.post('/admin/bulk-publish', async (req, res) => {
    try {
        const { phase, batchId, published, reviewStatus } = req.body;

        let query = 'UPDATE pseo_pages SET published = ?, updated_at = datetime(\'now\')';
        const params = [published ? 1 : 0];

        if (phase) {
            query += ' WHERE phase = ?';
            params.push(phase);
        } else if (batchId) {
            query += ' WHERE generation_batch = ?';
            params.push(batchId);
        } else if (reviewStatus) {
            query += ' WHERE review_status = ?';
            params.push(reviewStatus);
        } else {
            return res.status(400).json({ error: 'Specify phase, batchId, or reviewStatus' });
        }

        const result = await pdb.runAsync(query, params);
        res.json({ message: `${result.changes} pages updated` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/pseo/admin/datasets
 * List all input datasets
 */
router.get('/admin/datasets', async (req, res) => {
    try {
        const { type } = req.query;
        let query = 'SELECT * FROM pseo_datasets';
        const params = [];
        if (type) {
            query += ' WHERE dataset_type = ?';
            params.push(type);
        }
        query += ' ORDER BY dataset_type, name';
        const datasets = await pdb.allAsync(query, params);
        for (const d of datasets) {
            d.metadata = JSON.parse(d.metadata || '{}');
        }
        res.json(datasets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/pseo/admin/generation-prompt
 * Returns the current master prompt with populated datasets
 */
router.get('/admin/generation-prompt', async (req, res) => {
    try {
        const { playbook_type, phase = 1, count = 25 } = req.query;

        // Gather datasets
        const subjects = await pdb.allAsync("SELECT name, metadata FROM pseo_datasets WHERE dataset_type = 'subject' AND active = 1");
        const locations = await pdb.allAsync("SELECT name, metadata FROM pseo_datasets WHERE dataset_type = 'location' AND active = 1");
        const personas = await pdb.allAsync("SELECT name, metadata FROM pseo_datasets WHERE dataset_type = 'persona' AND active = 1");
        const comparisons = await pdb.allAsync("SELECT name, metadata FROM pseo_datasets WHERE dataset_type = 'comparison_pair' AND active = 1");
        const glossaryTerms = await pdb.allAsync("SELECT name, metadata FROM pseo_datasets WHERE dataset_type = 'glossary_term' AND active = 1");
        const careers = await pdb.allAsync("SELECT name, metadata FROM pseo_datasets WHERE dataset_type = 'career' AND active = 1");
        const guideTopics = await pdb.allAsync("SELECT name, metadata FROM pseo_datasets WHERE dataset_type = 'guide_topic' AND active = 1");

        // Get existing slugs for dedup
        const existingSlugs = await pdb.allAsync('SELECT slug, primary_keyword FROM pseo_pages');

        const inputData = {
            subjects: subjects.map(s => ({ name: s.name, ...JSON.parse(s.metadata) })),
            locations: locations.map(l => l.name),
            personas: personas.map(p => p.name),
            comparison_pairs: comparisons.map(c => JSON.parse(c.metadata)),
            glossary_terms: glossaryTerms.map(g => g.name),
            careers: careers.map(c => c.name),
            guide_topics: guideTopics.map(g => g.name),
            existing_slugs: existingSlugs.map(s => s.slug),
            existing_keywords: existingSlugs.map(s => s.primary_keyword),
        };

        const prompt = buildMasterPrompt(inputData, {
            playbook_type: playbook_type || null,
            phase: parseInt(phase),
            count: parseInt(count),
        });

        res.json({ prompt, inputData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Master Prompt Builder
// ==========================================

function buildMasterPrompt(inputData, options = {}) {
    const count = options.count || 25;
    const phase = options.phase || 1;
    const playbookFilter = options.playbook_type ? `\nFocus ONLY on playbook type: ${options.playbook_type}` : '';

    return `You are a Senior Programmatic SEO Content Architect for GenZ IITian (genziitian.in), the #1 resource platform for IIT Madras BS Degree students.

Your task: Generate ${count} unique, high-quality SEO pages for Phase ${phase}.
${playbookFilter}

BRAND CONTEXT:
- GenZ IITian helps students navigate IIT Madras BS Degree in Data Science & Electronic Systems
- Target audience: Students, working professionals, career changers interested in IITM BS
- Tone: Friendly, authoritative, Gen-Z relatable, data-driven
- Site URL: https://genziitian.in

SUPPORTED PLAYBOOK TYPES:
1. glossary — Define IITM BS terms (600+ words)
2. comparison — A vs B analysis (800+ words)
3. location — City/state specific info (500+ words)
4. persona — Audience-specific guides (500+ words)
5. guide — How-to and strategy content (800+ words)
6. subject_notes — Subject study resources (600+ words)
7. career — Career paths after IITM BS (500+ words)

CONTENT RULES:
1. NO placeholder or filler content — every sentence must provide value
2. Include specific facts, numbers, timelines, and actionable advice
3. Each page must satisfy real search intent
4. Write in a confident, helpful tone appropriate for Indian students
5. Include relevant IIT Madras BS-specific details and insider tips
6. Reference actual IITM BS subjects, exam patterns, and processes

STRUCTURE PER PAGE:
- H1 (clear, keyword-rich)
- Introduction (2-3 sentences, hook + value proposition)
- 5-7 structured sections with unique headings
- 3+ FAQs with detailed answers
- Call to action (drive to GenZ IITian resources)

INTERNAL LINKING:
Each page MUST include 5+ internal links referencing these valid URLs:
- /courses — Course listings
- /resources — Study resources
- /blog — Blog posts
- /about — About GenZ IITian
- /contact — Contact page
- Other generated page slugs from this batch

DEDUP RULES:
- Do NOT use any of these existing slugs: ${JSON.stringify(inputData.existing_slugs.slice(0, 100))}
- Do NOT use any of these existing primary keywords: ${JSON.stringify(inputData.existing_keywords.slice(0, 100))}
- Each page must have a unique primary keyword
- Each page must have a unique slug

INPUT DATASETS:
${JSON.stringify(inputData, null, 2)}

OUTPUT FORMAT — Return a JSON array of pages:

[
  {
    "slug": "string (URL-safe, lowercase, hyphens only)",
    "playbook_type": "string (from supported types)",
    "title": "string (20-70 chars, keyword-rich SEO title)",
    "meta_description": "string (50-160 chars)",
    "primary_keyword": "string (unique target keyword)",
    "secondary_keywords": ["string array (3-5 related keywords)"],
    "search_intent": "informational|navigational|transactional|commercial",
    "h1": "string (page heading)",
    "introduction": "string (2-3 sentences)",
    "sections": [
      { "heading": "string", "body": "string (detailed paragraph, 100+ words)" }
    ],
    "faq": [
      { "question": "string", "answer": "string (50+ words)" }
    ],
    "call_to_action": "string",
    "schema_type": "Article|FAQPage|HowTo|Course|WebPage",
    "schema_data": {},
    "internal_links": [
      { "url": "/slug", "text": "anchor text" }
    ],
    "related_pages": ["slug1", "slug2"],
    "parent_topic": "string (parent cluster name)",
    "cluster_topic": "string (cluster name from clusters list)"
  }
]

CLUSTER NAMES TO USE:
IIT Madras BS Degree, Qualifier Exam, Foundation Level, Diploma Level, Degree Level,
IITM BS Comparisons, Careers After IITM BS, IITM BS by Location, IITM BS by Persona,
Subject Resources, Glossary, Foundation Maths, Foundation Statistics,
Foundation Programming, Foundation English, Diploma Programming, Diploma Data Science,
IITM vs Traditional, IITM vs Online

IMPORTANT:
- Output ONLY valid JSON array, no markdown, no explanation
- Generate exactly ${count} pages
- Mix playbook types for topical diversity
- Every page must pass validation (minimum word counts, FAQs, sections)
- If data is insufficient for a page, return: { "status": "SKIPPED", "reason": "..." }`;
}

export default router;
