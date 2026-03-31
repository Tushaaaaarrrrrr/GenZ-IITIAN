import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'pseo.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = sqlite3.verbose();
const pdb = new sqlite.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Could not connect to pSEO database:', err.message);
    } else {
        console.log('✅ Connected to pSEO SQLite database.');
    }
});

// Promise wrappers
pdb.runAsync = (sql, params = []) => new Promise((resolve, reject) => {
    pdb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
    });
});

pdb.allAsync = (sql, params = []) => new Promise((resolve, reject) => {
    pdb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});

pdb.getAsync = (sql, params = []) => new Promise((resolve, reject) => {
    pdb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
    });
});

pdb.execAsync = (sql) => new Promise((resolve, reject) => {
    pdb.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
    });
});

// ==========================================
// Initialize pSEO Tables
// ==========================================
const initPSEO = async () => {
    await pdb.execAsync(`
    -- Core pSEO pages
    CREATE TABLE IF NOT EXISTS pseo_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      playbook_type TEXT NOT NULL CHECK(playbook_type IN (
        'glossary','comparison','location','persona','guide',
        'subject_notes','career','profile','curation','template',
        'directory','integration'
      )),
      title TEXT NOT NULL,
      meta_description TEXT NOT NULL DEFAULT '',
      primary_keyword TEXT NOT NULL,
      secondary_keywords TEXT NOT NULL DEFAULT '[]',
      search_intent TEXT NOT NULL DEFAULT 'informational' CHECK(search_intent IN (
        'informational','navigational','transactional','commercial'
      )),
      h1 TEXT NOT NULL,
      introduction TEXT NOT NULL DEFAULT '',
      sections TEXT NOT NULL DEFAULT '[]',
      faq TEXT NOT NULL DEFAULT '[]',
      call_to_action TEXT NOT NULL DEFAULT '',
      schema_type TEXT NOT NULL DEFAULT 'Article' CHECK(schema_type IN (
        'Article','FAQPage','HowTo','SoftwareApplication',
        'Organization','Person','Dataset','Course','WebPage'
      )),
      schema_data TEXT NOT NULL DEFAULT '{}',
      internal_links TEXT NOT NULL DEFAULT '[]',
      related_pages TEXT NOT NULL DEFAULT '[]',
      parent_topic TEXT NOT NULL DEFAULT '',
      cluster_topic TEXT NOT NULL DEFAULT '',
      word_count INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 0,
      phase INTEGER NOT NULL DEFAULT 1 CHECK(phase BETWEEN 1 AND 4),
      generation_batch TEXT NOT NULL DEFAULT '',
      review_status TEXT NOT NULL DEFAULT 'pending' CHECK(review_status IN (
        'pending','approved','rejected','needs_edit'
      )),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Topical authority clusters
    CREATE TABLE IF NOT EXISTS pseo_clusters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      parent_cluster TEXT,
      description TEXT NOT NULL DEFAULT '',
      hub_page_slug TEXT,
      page_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Input datasets for generation
    CREATE TABLE IF NOT EXISTS pseo_datasets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dataset_type TEXT NOT NULL CHECK(dataset_type IN (
        'category','subject','location','persona','tool',
        'career','comparison_pair','glossary_term','guide_topic'
      )),
      name TEXT NOT NULL,
      metadata TEXT NOT NULL DEFAULT '{}',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Generation log
    CREATE TABLE IF NOT EXISTS pseo_generation_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id TEXT NOT NULL UNIQUE,
      pages_requested INTEGER NOT NULL DEFAULT 0,
      pages_generated INTEGER NOT NULL DEFAULT 0,
      pages_skipped INTEGER NOT NULL DEFAULT 0,
      playbook_types TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN (
        'pending','running','completed','failed','partial'
      )),
      error_log TEXT NOT NULL DEFAULT '',
      started_at TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_pseo_slug ON pseo_pages(slug);
    CREATE INDEX IF NOT EXISTS idx_pseo_playbook ON pseo_pages(playbook_type);
    CREATE INDEX IF NOT EXISTS idx_pseo_cluster ON pseo_pages(cluster_topic);
    CREATE INDEX IF NOT EXISTS idx_pseo_published ON pseo_pages(published);
    CREATE INDEX IF NOT EXISTS idx_pseo_phase ON pseo_pages(phase);
    CREATE INDEX IF NOT EXISTS idx_pseo_keyword ON pseo_pages(primary_keyword);
    CREATE INDEX IF NOT EXISTS idx_pseo_review ON pseo_pages(review_status);
    CREATE INDEX IF NOT EXISTS idx_pseo_dataset_type ON pseo_datasets(dataset_type);
  `);

    // ==========================================
    // Seed Topical Clusters
    // ==========================================
    const clusterCount = await pdb.getAsync('SELECT COUNT(*) as count FROM pseo_clusters');
    if (clusterCount.count === 0) {
        const clusters = [
            // Hub
            { name: 'IIT Madras BS Degree', parent: null, desc: 'Main hub for all IITM BS content', hub: '/iitm-bs-degree' },

            // Primary Clusters
            { name: 'Qualifier Exam', parent: 'IIT Madras BS Degree', desc: 'Qualifier exam preparation cluster', hub: '/guide/iitm-bs-qualifier-exam' },
            { name: 'Foundation Level', parent: 'IIT Madras BS Degree', desc: 'Foundation level subjects and study', hub: '/guide/iitm-bs-foundation-level' },
            { name: 'Diploma Level', parent: 'IIT Madras BS Degree', desc: 'Diploma level subjects and resources', hub: '/guide/iitm-bs-diploma-level' },
            { name: 'Degree Level', parent: 'IIT Madras BS Degree', desc: 'Degree level specialization', hub: '/guide/iitm-bs-degree-level' },
            { name: 'IITM BS Comparisons', parent: 'IIT Madras BS Degree', desc: 'Compare IITM BS with other degrees', hub: '/compare' },
            { name: 'Careers After IITM BS', parent: 'IIT Madras BS Degree', desc: 'Career paths after IITM BS', hub: '/careers-after-iitm-bs' },
            { name: 'IITM BS by Location', parent: 'IIT Madras BS Degree', desc: 'Location-specific information', hub: '/iitm-bs-degree-locations' },
            { name: 'IITM BS by Persona', parent: 'IIT Madras BS Degree', desc: 'Audience-specific information', hub: '/iitm-bs-degree-for' },
            { name: 'Subject Resources', parent: 'IIT Madras BS Degree', desc: 'Notes, syllabus, tips by subject', hub: '/resources' },
            { name: 'Glossary', parent: 'IIT Madras BS Degree', desc: 'Terminology and concepts', hub: '/glossary' },

            // Sub-clusters
            { name: 'Foundation Maths', parent: 'Foundation Level', desc: 'Maths 1 & Maths 2', hub: null },
            { name: 'Foundation Statistics', parent: 'Foundation Level', desc: 'Statistics 1 & Statistics 2', hub: null },
            { name: 'Foundation Programming', parent: 'Foundation Level', desc: 'Python & Computational Thinking', hub: null },
            { name: 'Foundation English', parent: 'Foundation Level', desc: 'English 1 & English 2', hub: null },
            { name: 'Diploma Programming', parent: 'Diploma Level', desc: 'PDSA, DBMS, App Dev', hub: null },
            { name: 'Diploma Data Science', parent: 'Diploma Level', desc: 'ML, BA, Tools', hub: null },
            { name: 'IITM vs Traditional', parent: 'IITM BS Comparisons', desc: 'vs BTech, BSc, BCA', hub: null },
            { name: 'IITM vs Online', parent: 'IITM BS Comparisons', desc: 'vs BITS, Amity, Manipal online', hub: null },
        ];

        for (const c of clusters) {
            await pdb.runAsync(
                `INSERT INTO pseo_clusters (name, parent_cluster, description, hub_page_slug) VALUES (?, ?, ?, ?)`,
                [c.name, c.parent, c.desc, c.hub]
            );
        }
        console.log('✅ Seeded pSEO clusters');
    }

    // ==========================================
    // Seed Input Datasets
    // ==========================================
    const datasetCount = await pdb.getAsync('SELECT COUNT(*) as count FROM pseo_datasets');
    if (datasetCount.count === 0) {
        const datasets = [
            // Subjects
            ...['Maths 1', 'Maths 2', 'Statistics 1', 'Statistics 2', 'English 1', 'English 2',
                'Python', 'Computational Thinking', 'PDSA', 'DBMS', 'MAD I', 'MAD II', 'Java',
                'Machine Learning', 'Business Analytics', 'Deep Learning', 'System Commands',
                'Application Development', 'Software Engineering', 'Software Testing',
                'Market Research', 'Strategies for Professional Growth', 'Business Data Management',
                'AI Search Methods', 'Tools in Data Science', 'Programming Concepts using Java'
            ].map(s => ({ type: 'subject', name: s, meta: { level: s.includes('1') || s.includes('2') || ['Python', 'Computational Thinking', 'English 1', 'English 2'].includes(s) ? 'Foundation' : 'Diploma' } })),

            // Locations (Top 50 Indian cities)
            ...['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata',
                'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Bhopal', 'Patna', 'Ranchi',
                'Guwahati', 'Dehradun', 'Kochi', 'Thiruvananthapuram', 'Visakhapatnam',
                'Nagpur', 'Indore', 'Coimbatore', 'Noida', 'Gurugram', 'Faridabad', 'Mysore',
                'Bhubaneswar', 'Surat', 'Vadodara', 'Jodhpur', 'Amritsar', 'Varanasi',
                'Agra', 'Meerut', 'Kanpur', 'Allahabad', 'Nashik', 'Aurangabad', 'Rajkot',
                'Vijayawada', 'Madurai', 'Tiruchirappalli', 'Salem', 'Hubli', 'Belgaum',
                'Mangalore', 'Jalandhar', 'Ludhiana', 'Raipur', 'Gwalior'
            ].map(l => ({ type: 'location', name: l, meta: { country: 'India' } })),

            // Personas
            ...['Working Professionals', 'Class 12 Students', 'College Dropouts',
                'Career Changers', 'Homemakers', 'Defense Personnel', 'Government Employees',
                'Teachers', 'Diploma Holders', 'B.Com Graduates', 'Arts Students',
                'Commerce Students', 'Science Students', 'MBA Aspirants', 'UPSC Aspirants',
                'Freelancers', 'Rural Students', 'NRI Students', 'Women in Tech',
                'Startup Founders', 'ITI Students', 'Polytechnic Students',
                'BBA Graduates', 'Law Students', 'Medical Students Exploring Tech',
                'Senior Citizens Learning Tech', 'Parents', 'School Teachers',
                'Banking Professionals', 'CA Aspirants'
            ].map(p => ({ type: 'persona', name: p, meta: {} })),

            // Comparison Pairs
            ...[
                ['IITM BS Degree', 'B.Tech'], ['IITM BS Degree', 'BCA'], ['IITM BS Degree', 'BSc Computer Science'],
                ['IITM BS Degree', 'BSc Data Science'], ['IITM BS Degree', 'MCA'],
                ['IITM BS Degree', 'BITS Pilani Online'], ['IITM BS Degree', 'Amity Online'],
                ['IITM BS Degree', 'Manipal Online'], ['IITM BS Degree', 'Lovely Professional University'],
                ['IITM BS Degree', 'Jain University Online'], ['IITM BS Degree', 'Chandigarh University Online'],
                ['IITM BS Degree', 'Regular Degree'], ['IITM BS Degree', 'IGNOU BCA'],
                ['IITM BS Degree', 'Coursera Certificates'], ['IITM BS Degree', 'edX MicroMasters'],
                ['IITM BS Data Science', 'IITM BS Electronic Systems'],
                ['Foundation Level', 'Diploma Level'], ['Diploma Level', 'Degree Level'],
                ['IITM BS Degree', 'Scaler Academy'], ['IITM BS Degree', 'UpGrad Programs'],
                ['IITM BS Degree', 'Great Learning'], ['IITM BS Degree', 'Simplilearn Programs'],
                ['PDSA', 'DSA'], ['MAD I', 'MAD II'], ['Python (IITM)', 'Python (NPTEL)'],
                ['IITM BS Degree', 'NIT Online Programs'], ['IITM BS Degree', 'IIT Kanpur EMASTERS'],
                ['IITM Qualifier', 'JEE Main'], ['IITM BS Degree', 'MBA'],
                ['IITM BS Degree', 'Self-taught Programming'], ['IITM BS Degree', 'Bootcamp']
            ].map(pair => ({ type: 'comparison_pair', name: `${pair[0]} vs ${pair[1]}`, meta: { a: pair[0], b: pair[1] } })),

            // Glossary Terms
            ...['Qualifier Exam', 'Foundation Level', 'Diploma Level', 'Degree Level',
                'CGPA', 'GAA (Graded Assignment Average)', 'Quiz Score', 'End Term Exam',
                'Weekly Assignment', 'NPTEL', 'Swayam', 'Proctored Exam', 'IITM BS Portal',
                'Seek Platform', 'Discussion Forum', 'Live Sessions', 'Office Hours',
                'Grade Card', 'Transcript', 'Convocation', 'Specialization Track',
                'Data Science Track', 'Electronic Systems Track', 'BS in Data Science',
                'BS in Electronic Systems', 'Programming Track', 'Problem Solving',
                'Algorithm', 'Data Structure', 'Machine Learning Basics',
                'Application Development', 'Database Management', 'Software Engineering',
                'Artificial Intelligence', 'Business Intelligence', 'Data Visualization',
                'Cloud Computing', 'DevOps', 'Cybersecurity', 'Blockchain Basics',
                'Open Book Exam', 'Term Schedule', 'Academic Calendar', 'Credit System',
                'Honor Code', 'Peer Learning', 'Study Group', 'Online Proctoring',
                'Fee Structure', 'Scholarship', 'Student ID', 'Library Access',
                'Placement Cell', 'Industry Connect', 'Research Opportunities',
                'Capstone Project', 'Minor Degree', 'Dual Degree', 'Cross Disciplinary',
                'Python Programming', 'Java Programming', 'SQL Basics', 'Linux Commands',
                'Git Version Control', 'Web Development', 'API Development'
            ].map(t => ({ type: 'glossary_term', name: t, meta: {} })),

            // Career Options
            ...['Data Scientist', 'Machine Learning Engineer', 'Full Stack Developer',
                'Data Analyst', 'Business Analyst', 'Product Manager', 'Research Scientist',
                'AI Engineer', 'Cloud Engineer', 'DevOps Engineer', 'Cybersecurity Analyst',
                'Database Administrator', 'Software Engineer', 'Startup Founder',
                'Consultant', 'Quantitative Analyst', 'Data Engineer', 'Backend Developer',
                'Frontend Developer', 'Mobile App Developer', 'Blockchain Developer',
                'Technical Writer', 'Project Manager', 'Scrum Master', 'UI/UX Designer',
                'Systems Analyst', 'Network Engineer', 'Quality Assurance Engineer',
                'Solutions Architect', 'Chief Technology Officer'
            ].map(c => ({ type: 'career', name: c, meta: {} })),

            // Guide Topics
            ...['How to Apply for IITM BS Degree', 'How to Crack IITM Qualifier Exam',
                'IITM BS Complete Roadmap 2025', 'Week-by-Week Study Plan Foundation',
                'How to Get Placement After IITM BS', 'How to Balance Job and IITM BS',
                'CGPA Calculation Guide', 'Foundation Level Complete Strategy',
                'Diploma Level Complete Strategy', 'Degree Level Complete Strategy',
                'How to Choose Specialization', 'IITM BS Fee Payment Guide',
                'How to Apply for Scholarship', 'IITM BS Exam Preparation Tips',
                'How to Use Seek Platform', 'Managing Time During Term Exams',
                'Best Laptop for IITM BS Students', 'Internet Requirements for IITM BS',
                'Study Material Organization Tips', 'How to Form Study Groups',
                'IITM BS Interview Preparation', 'Resume Building After IITM BS',
                'LinkedIn Profile for IITM BS Students', 'GitHub Portfolio Guide',
                'Freelancing While Studying IITM BS', 'Internship Guide for IITM BS',
                'How to Score 9+ CGPA', 'End Term Exam Strategy',
                'Weekly Assignment Best Practices', 'Discussion Forum Etiquette'
            ].map(g => ({ type: 'guide_topic', name: g, meta: {} })),
        ];

        for (const d of datasets) {
            await pdb.runAsync(
                `INSERT INTO pseo_datasets (dataset_type, name, metadata) VALUES (?, ?, ?)`,
                [d.type, d.name, JSON.stringify(d.meta)]
            );
        }
        console.log(`✅ Seeded ${datasets.length} pSEO dataset entries`);
    }
};

initPSEO().catch(console.error);

export default pdb;
