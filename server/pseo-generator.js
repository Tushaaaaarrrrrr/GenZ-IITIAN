import crypto from 'crypto';
import pdb from './pseo-db.js';

// ==========================================
// Content Validation Engine
// ==========================================

/**
 * Validates a generated page before insertion
 * Returns { valid: boolean, errors: string[] }
 */
export function validatePage(page) {
    const errors = [];

    // Required fields
    if (!page.slug) errors.push('Missing slug');
    if (!page.playbook_type) errors.push('Missing playbook_type');
    if (!page.title) errors.push('Missing title');
    if (!page.h1) errors.push('Missing h1');
    if (!page.primary_keyword) errors.push('Missing primary_keyword');
    if (!page.introduction) errors.push('Missing introduction');

    // Slug validation
    if (page.slug && !/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(page.slug)) {
        errors.push(`Invalid slug format: ${page.slug}`);
    }

    // Content length validation by playbook type
    const wordCount = countWords(page);
    const minWords = getMinWordCount(page.playbook_type);
    if (wordCount < minWords) {
        errors.push(`Content too short: ${wordCount} words (minimum ${minWords} for ${page.playbook_type})`);
    }

    // Sections check
    const sections = typeof page.sections === 'string' ? JSON.parse(page.sections) : (page.sections || []);
    if (sections.length < 3) {
        errors.push(`Too few sections: ${sections.length} (minimum 3)`);
    }

    // FAQ check
    const faq = typeof page.faq === 'string' ? JSON.parse(page.faq) : (page.faq || []);
    if (faq.length < 3) {
        errors.push(`Too few FAQs: ${faq.length} (minimum 3)`);
    }

    // Internal links check
    const internalLinks = typeof page.internal_links === 'string' ? JSON.parse(page.internal_links) : (page.internal_links || []);
    if (internalLinks.length < 3) {
        errors.push(`Too few internal links: ${internalLinks.length} (minimum 3)`);
    }

    // Meta description length
    if (page.meta_description && (page.meta_description.length < 50 || page.meta_description.length > 160)) {
        errors.push(`Meta description length out of range: ${page.meta_description.length} chars (50-160 required)`);
    }

    // Title length
    if (page.title && (page.title.length < 20 || page.title.length > 70)) {
        errors.push(`Title length out of range: ${page.title.length} chars (20-70 required)`);
    }

    return { valid: errors.length === 0, errors, wordCount };
}

/**
 * Count total words in a page
 */
function countWords(page) {
    let text = [page.introduction || '', page.call_to_action || ''];

    const sections = typeof page.sections === 'string' ? JSON.parse(page.sections) : (page.sections || []);
    for (const s of sections) {
        text.push(s.heading || '');
        text.push(s.body || '');
    }

    const faq = typeof page.faq === 'string' ? JSON.parse(page.faq) : (page.faq || []);
    for (const f of faq) {
        text.push(f.question || '');
        text.push(f.answer || '');
    }

    return text.join(' ').split(/\s+/).filter(Boolean).length;
}

/**
 * Get minimum word count by playbook type
 */
function getMinWordCount(type) {
    const minimums = {
        glossary: 600,
        comparison: 800,
        location: 500,
        persona: 500,
        guide: 800,
        subject_notes: 600,
        career: 500,
        profile: 400,
        curation: 600,
        template: 500,
        directory: 400,
        integration: 500,
    };
    return minimums[type] || 500;
}

// ==========================================
// Duplicate Detection
// ==========================================

/**
 * Check for duplicate slugs and keyword overlap
 */
export async function checkDuplicates(page) {
    const issues = [];

    // Check slug uniqueness
    const existingSlug = await pdb.getAsync('SELECT id FROM pseo_pages WHERE slug = ?', [page.slug]);
    if (existingSlug) {
        issues.push(`Duplicate slug: ${page.slug} (existing id: ${existingSlug.id})`);
    }

    // Check primary keyword uniqueness
    const existingKeyword = await pdb.getAsync(
        'SELECT id, slug FROM pseo_pages WHERE primary_keyword = ?',
        [page.primary_keyword]
    );
    if (existingKeyword) {
        issues.push(`Duplicate primary keyword "${page.primary_keyword}" already used by /${existingKeyword.slug}`);
    }

    return { unique: issues.length === 0, issues };
}

// ==========================================
// Internal Link Graph Builder
// ==========================================

/**
 * Generate valid internal links for a page based on cluster and playbook type
 */
export async function buildInternalLinks(page) {
    const links = [];

    // 1. Parent cluster hub page
    if (page.parent_topic) {
        const hub = await pdb.getAsync(
            'SELECT slug, title FROM pseo_pages WHERE cluster_topic = ? AND published = 1 LIMIT 1',
            [page.parent_topic]
        );
        if (hub) links.push({ url: `/${hub.slug}`, text: hub.title, type: 'parent' });
    }

    // 2. Sibling pages (same cluster)
    if (page.cluster_topic) {
        const siblings = await pdb.allAsync(
            'SELECT slug, title FROM pseo_pages WHERE cluster_topic = ? AND slug != ? AND published = 1 ORDER BY RANDOM() LIMIT 3',
            [page.cluster_topic, page.slug]
        );
        for (const s of siblings) {
            links.push({ url: `/${s.slug}`, text: s.title, type: 'sibling' });
        }
    }

    // 3. Cross-playbook pages
    const crossPages = await pdb.allAsync(
        'SELECT slug, title, playbook_type FROM pseo_pages WHERE playbook_type != ? AND published = 1 ORDER BY RANDOM() LIMIT 3',
        [page.playbook_type]
    );
    for (const cp of crossPages) {
        links.push({ url: `/${cp.slug}`, text: cp.title, type: 'cross-playbook' });
    }

    // 4. Always link back to main pages
    links.push({ url: '/courses', text: 'Explore IITM BS Courses', type: 'nav' });
    links.push({ url: '/resources', text: 'Study Resources & Notes', type: 'nav' });
    links.push({ url: '/blog', text: 'Latest Blog Posts', type: 'nav' });

    return links;
}

// ==========================================
// Page Insertion
// ==========================================

/**
 * Insert a validated page into the database
 */
export async function insertPage(page, batchId, phase = 1) {
    const wordCount = countWords(page);

    const sections = typeof page.sections === 'string' ? page.sections : JSON.stringify(page.sections || []);
    const faq = typeof page.faq === 'string' ? page.faq : JSON.stringify(page.faq || []);
    const secondaryKeywords = typeof page.secondary_keywords === 'string' ? page.secondary_keywords : JSON.stringify(page.secondary_keywords || []);
    const internalLinks = typeof page.internal_links === 'string' ? page.internal_links : JSON.stringify(page.internal_links || []);
    const relatedPages = typeof page.related_pages === 'string' ? page.related_pages : JSON.stringify(page.related_pages || []);
    const schemaData = typeof page.schema_data === 'string' ? page.schema_data : JSON.stringify(page.schema_data || {});

    const result = await pdb.runAsync(`
    INSERT INTO pseo_pages (
      slug, playbook_type, title, meta_description, primary_keyword,
      secondary_keywords, search_intent, h1, introduction, sections,
      faq, call_to_action, schema_type, schema_data, internal_links,
      related_pages, parent_topic, cluster_topic, word_count, published,
      phase, generation_batch
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
        page.slug,
        page.playbook_type,
        page.title,
        page.meta_description || '',
        page.primary_keyword,
        secondaryKeywords,
        page.search_intent || 'informational',
        page.h1,
        page.introduction || '',
        sections,
        faq,
        page.call_to_action || '',
        page.schema_type || 'Article',
        schemaData,
        internalLinks,
        relatedPages,
        page.parent_topic || '',
        page.cluster_topic || '',
        wordCount,
        0, // Start unpublished
        phase,
        batchId
    ]);

    return result;
}

// ==========================================
// Batch Processing
// ==========================================

/**
 * Process a batch of generated pages
 * Returns stats about what was inserted/skipped
 */
export async function processBatch(pages, phase = 1) {
    const batchId = `batch_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const stats = { batchId, total: pages.length, inserted: 0, skipped: 0, errors: [] };

    // Log batch start
    await pdb.runAsync(
        `INSERT INTO pseo_generation_log (batch_id, pages_requested, status, started_at) VALUES (?, ?, 'running', datetime('now'))`,
        [batchId, pages.length]
    );

    for (const page of pages) {
        try {
            // Handle skipped pages
            if (page.status === 'SKIPPED') {
                stats.skipped++;
                stats.errors.push(`SKIPPED: ${page.reason || 'Unknown reason'}`);
                continue;
            }

            // Validate
            const validation = validatePage(page);
            if (!validation.valid) {
                stats.skipped++;
                stats.errors.push(`INVALID [${page.slug}]: ${validation.errors.join(', ')}`);
                continue;
            }

            // Check duplicates
            const dupCheck = await checkDuplicates(page);
            if (!dupCheck.unique) {
                stats.skipped++;
                stats.errors.push(`DUPLICATE [${page.slug}]: ${dupCheck.issues.join(', ')}`);
                continue;
            }

            // Build internal links if not enough provided
            const existingLinks = typeof page.internal_links === 'string'
                ? JSON.parse(page.internal_links)
                : (page.internal_links || []);

            if (existingLinks.length < 3) {
                const autoLinks = await buildInternalLinks(page);
                page.internal_links = [...existingLinks, ...autoLinks].slice(0, 10);
            }

            // Insert
            await insertPage(page, batchId, phase);
            stats.inserted++;
        } catch (err) {
            stats.skipped++;
            stats.errors.push(`ERROR [${page.slug || 'unknown'}]: ${err.message}`);
        }
    }

    // Update log
    const status = stats.inserted === stats.total ? 'completed' : (stats.inserted > 0 ? 'partial' : 'failed');
    await pdb.runAsync(
        `UPDATE pseo_generation_log SET pages_generated = ?, pages_skipped = ?, status = ?, error_log = ?, completed_at = datetime('now') WHERE batch_id = ?`,
        [stats.inserted, stats.skipped, status, JSON.stringify(stats.errors), batchId]
    );

    return stats;
}

// ==========================================
// Sitemap Generation
// ==========================================

/**
 * Generate sitemap XML for all published pSEO pages
 */
export async function generateSitemap(baseUrl = 'https://genziitian.in') {
    const pages = await pdb.allAsync(
        'SELECT slug, updated_at, playbook_type FROM pseo_pages WHERE published = 1 ORDER BY updated_at DESC'
    );

    const priorityMap = {
        guide: '0.9',
        comparison: '0.8',
        subject_notes: '0.8',
        career: '0.7',
        persona: '0.7',
        location: '0.6',
        glossary: '0.6',
        profile: '0.5',
        curation: '0.7',
        template: '0.6',
        directory: '0.6',
        integration: '0.5',
    };

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    const staticPages = [
        { url: '/', priority: '1.0', freq: 'weekly' },
        { url: '/courses', priority: '0.9', freq: 'weekly' },
        { url: '/resources', priority: '0.9', freq: 'weekly' },
        { url: '/blog', priority: '0.8', freq: 'daily' },
        { url: '/about', priority: '0.5', freq: 'monthly' },
        { url: '/contact', priority: '0.5', freq: 'monthly' },
    ];

    for (const sp of staticPages) {
        xml += `  <url>\n    <loc>${baseUrl}${sp.url}</loc>\n    <changefreq>${sp.freq}</changefreq>\n    <priority>${sp.priority}</priority>\n  </url>\n`;
    }

    // Add pSEO pages
    for (const page of pages) {
        const priority = priorityMap[page.playbook_type] || '0.5';
        const lastmod = page.updated_at ? page.updated_at.split(' ')[0] : new Date().toISOString().split('T')[0];
        xml += `  <url>\n    <loc>${baseUrl}/${page.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
    }

    xml += '</urlset>';
    return xml;
}

// ==========================================
// Stats & Analytics
// ==========================================

export async function getStats() {
    const total = await pdb.getAsync('SELECT COUNT(*) as count FROM pseo_pages');
    const published = await pdb.getAsync('SELECT COUNT(*) as count FROM pseo_pages WHERE published = 1');
    const byPlaybook = await pdb.allAsync('SELECT playbook_type, COUNT(*) as count FROM pseo_pages GROUP BY playbook_type');
    const byPhase = await pdb.allAsync('SELECT phase, COUNT(*) as count FROM pseo_pages GROUP BY phase');
    const byReview = await pdb.allAsync('SELECT review_status, COUNT(*) as count FROM pseo_pages GROUP BY review_status');
    const avgWordCount = await pdb.getAsync('SELECT AVG(word_count) as avg FROM pseo_pages');
    const recentBatches = await pdb.allAsync('SELECT * FROM pseo_generation_log ORDER BY created_at DESC LIMIT 10');
    const clusterStats = await pdb.allAsync(`
    SELECT pc.name, pc.parent_cluster, COUNT(pp.id) as page_count
    FROM pseo_clusters pc
    LEFT JOIN pseo_pages pp ON pp.cluster_topic = pc.name
    GROUP BY pc.name
    ORDER BY page_count DESC
  `);

    return {
        total: total.count,
        published: published.count,
        byPlaybook,
        byPhase,
        byReview,
        avgWordCount: Math.round(avgWordCount.avg || 0),
        recentBatches,
        clusterStats,
    };
}
