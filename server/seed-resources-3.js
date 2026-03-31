import db from './db.js';

const resources = [
  // =============================================
  // DIPLOMA — MLT (Machine Learning Techniques)
  // =============================================

  // --- Reference / External Notes ---
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "MLT Week-wise Notes (Website)", description: "Comprehensive week-wise MLT notes hosted online. Credits to original owners.", url: "https://sherrys997.github.io/MLT_notes/pages/Wk09.html" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Dive into Deep Learning — Reference Book", description: "Open-source ML/DL textbook for supplementary reading. Credits to original authors.", url: "https://d2l.ai/chapter_introduction/index.html" },

  // --- Notion Notes ---
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "MLT Notion Notes — Set 1", description: "Organized Notion notes. Credits to original owners.", url: "https://sejal23.notion.site/ee95c3645dbf40c9a2043e94763c38c3?v=7cfa2735387e456090a63aa2bfcb4d0d" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "MLT Notion Notes — Set 2", description: "Organized Notion notes. Credits to original owners.", url: "https://sejal23.notion.site/792f19bf22834e2eb8e2630895d4def7?v=c7f0cdc56ca344f7bca39920b52cce2e" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "MLT Notion Notes — Set 3", description: "Organized Notion notes. Credits to original owners.", url: "https://sejal23.notion.site/9bba2d95dafc4c8193478e350ff3bc2b?v=8817240bc5c445c18161765598b90b71" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "MLT Notion Notes — Set 4", description: "Organized Notion notes. Credits to original owners.", url: "https://sejal23.notion.site/19c91ca901b2419bb54ead5a5391a64e?v=2e58cf23b0444f3a9ec6f6f2949fd9a7" },

  // --- Google Doc Notes ---
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "MLT Google Doc Notes", description: "Detailed notes in Google Docs. Credits to original owners.", url: "https://docs.google.com/document/d/1JN9QIuvjH3G3FkBgPjmGV1V9t9UF-dp_1x7pdNKmf_s/edit" },

  // --- End Term Revision ---
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Short Notes", title: "End Term Revision — Part 1", description: "End term revision material. Credits to original owners.", url: "https://drive.google.com/file/d/1slH5ZgtvCjriPfrUMTeqDZna-2qkwJc4/view?usp=drive_link" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Short Notes", title: "End Term Revision — Part 2", description: "End term revision material. Credits to original owners.", url: "https://drive.google.com/file/d/1sXJDSL4rkbfCF5cGU8TxWi81OaHi8XKu/view?usp=drive_link" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Short Notes", title: "End Term Revision — Part 3", description: "End term revision material. Credits to original owners.", url: "https://drive.google.com/file/d/1sXeerPXF3O55nhb-ENTlSW7eEkcfJuWr/view?usp=drive_link" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Short Notes", title: "End Term Revision — Part 4", description: "End term revision material. Credits to original owners.", url: "https://drive.google.com/file/d/1smGFMau7ZQ2CbFDxFL_y9GHuUZq-gBUB/view?usp=drive_link" },

  // --- Weekly Notes (Set A) ---
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set A)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/10Yyyg9dJHOet8ey3kMG3TSr5jLBuqDvO/view?usp=sharing" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Set A)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1ZYSim7F1TRzKOS8-WQrrFUL6H5_tBFcp/view?usp=sharing" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes (Set A)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1e1qvjKIzCI7S_4l8ZN1h9DwBZX1XOFL_/view?usp=sharing" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes (Set A)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/18jHkNw4E94YslZINARsCHlqvdWAi-t4u/view?usp=sharing" },

  // --- Weekly Notes (Set B) ---
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/open?id=1-7tB9OG-Dppp_Ax0lTINH9FJ0ZRqwXh6&usp=drive_fs" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/open?id=1-8lEt-11EcNQdzjNoc-yl7cz1L8ZXU-c&usp=drive_fs" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/open?id=1-913hnT8ue4owpKfl0kSSIvcWDY4D1kQ&usp=drive_fs" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/open?id=1-B31078_e6JPnyK50jGtRqVLW1tAvky6&usp=drive_fs" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 5 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/open?id=10CzMI0z_4gfVGPrz8WcDkszJcueF4B_j&usp=drive_fs" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 7 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/open?id=10CYsVckyDIzRIyXAWq8Kz4wxu2kLi-sQ&usp=drive_fs" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 8 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/open?id=10DiYzdI4Pp7wmOHI97E3u9Swv4UhNDJh&usp=drive_fs" },

  // --- Weekly Notes (Set C) ---
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/open?id=1-RPDiosuXfM0LPZXB3pCfS7ZeJeow6By&usp=drive_fs" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/open?id=1-PZZBGlwJ38jalBRcnKZuoclgOp6fr7E&usp=drive_fs" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/open?id=1-FhlOIlFyvLgabDYI0XHq_BUJYBc-PcX&usp=drive_fs" },

  // --- Weekly Notes (Set D — Weeks 1–8) ---
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set D)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1jk2WCVDG1qzVnsvJ_u7yX04o5dWVkHyI/view?usp=drive_link" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Set D)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Eyfr30rAfzsAk8Qc-TlF50r9VL5Lh7aC/view?usp=drive_link" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes (Set D)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1t2fFrw5W-98Q7qDIP9DdSFnhxB6nBVAR/view?usp=drive_link" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes (Set D)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1x3WAtrmj2ncFHQjadgXSUhx_JC7pD4md/view?usp=drive_link" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 5 Notes (Set D)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1tBoIrYhVznGKVqDXylNz9iL56MxbBB6E/view?usp=drive_link" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 6 Notes (Set D)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1FHzTjT1DMc1RVb-mqtdPh_uz-pdhLVdK/view?usp=drive_link" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 7 Notes (Set D)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1z3CgSl4UyaYytQjFFfPx-gQLBE9RszO3/view?usp=drive_link" },
  { level: "Diploma", subject: "MLT", resource_type: "note", sub_type: "Notes", title: "Week 8 Notes (Set D)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1kiSMoWth42sni6rLaUQeCi2R6WuZBx3T/view?usp=drive_link" },

  // =============================================
  // DIPLOMA — TDS (Tools in Data Science)
  // =============================================

  // --- Full / Summary Notes ---
  { level: "Diploma", subject: "TDS", resource_type: "note", sub_type: "Notes", title: "Week 2–3 Notes", description: "Notes covering weeks 2 and 3. Credits to original owners.", url: "https://drive.google.com/file/d/1rcl0AGCWnNr22ZmEFkmlSkATdDhDBX6I/view?usp=sharing" },
  { level: "Diploma", subject: "TDS", resource_type: "note", sub_type: "Short Notes", title: "All Week Summary Notes (PDF)", description: "Complete summary notes for all weeks. Credits to original owners.", url: "https://drive.google.com/file/d/1P2S1YpOCV3LXGY_1wEjuhFBj9loBTXGj/view?usp=sharing" },
  { level: "Diploma", subject: "TDS", resource_type: "note", sub_type: "Short Notes", title: "All Week Summary Notes (Folder)", description: "Complete summary notes folder for all weeks. Credits to original owners.", url: "https://drive.google.com/drive/folders/1vOsIKAziwW1HIBDf3wXU4p4upu_HLHoN" },
  { level: "Diploma", subject: "TDS", resource_type: "note", sub_type: "Notes", title: "All Week Notes — Jan 2022 Term", description: "Complete notes from Jan 2022 term. Credits to original owners.", url: "https://drive.google.com/file/d/1uglxTZRURDFAWu9dtVvHU7mAd30nflbC/view?usp=sharing" },
  { level: "Diploma", subject: "TDS", resource_type: "note", sub_type: "Notes", title: "All Weeks Notes — May 2022 Term", description: "Complete notes from May 2022 term (requires IITM email). Credits to original owners.", url: "https://drive.google.com/file/d/1xMJEEzb63g0fSYldxoZNrzp9ta85O2Zu/view?usp=sharing" },
  { level: "Diploma", subject: "TDS", resource_type: "note", sub_type: "Notes", title: "All Weeks TDS Notes (Folder)", description: "Comprehensive folder with all weeks' notes. Credits to original owners.", url: "https://drive.google.com/drive/u/0/folders/1A1YGWZWywuTf1Hx0v1yBxFA_6AkxSaG3" },

  // --- Weekly Notes ---
  { level: "Diploma", subject: "TDS", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set A)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1rN4vH5uo6Yr68nyaNmR6CqPHI110IOVv/view" },
  { level: "Diploma", subject: "TDS", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1uahm5TKHIHxowwElSN-NPCPLXYlhl6nT/view?usp=sharing" },

  // --- Practical / Project Guides ---
  { level: "Diploma", subject: "TDS", resource_type: "note", sub_type: "Notes", title: "Geocoding Using Geopy — Guide 1", description: "Practical guide on geocoding with geopy library. Credits to original owners.", url: "https://drive.google.com/file/d/1PElL6TVdOv4XfEy7cwv2UBsH-JxH4A_U/view?usp=drivesdk" },
  { level: "Diploma", subject: "TDS", resource_type: "note", sub_type: "Notes", title: "Geocoding Using Geopy — Guide 2", description: "Additional geocoding guide with geopy. Credits to original owners.", url: "https://drive.google.com/file/d/1PFLydl3AS-HaBl-VsX-fvQ630m1dmA5U/view?usp=drivesdk" },
  { level: "Diploma", subject: "TDS", resource_type: "note", sub_type: "Notes", title: "Wikipedia Scraping Guide", description: "Guide on scraping Wikipedia data. Credits to original owners.", url: "https://drive.google.com/file/d/1PNwA6Ji1Ul2hKxnVQ4NRk62IJtLcLfI6/view?usp=drivesdk" },
  { level: "Diploma", subject: "TDS", resource_type: "note", sub_type: "Notes", title: "Scraping with Python", description: "Python web scraping tutorial. Credits to original owners.", url: "https://drive.google.com/file/d/1PMxtPDoehOJfSKIId4agiL8J_dl8KwOO/view?usp=drivesdk" },
  { level: "Diploma", subject: "TDS", resource_type: "note", sub_type: "Notes", title: "Scraping from Web Using Excel", description: "Guide on web scraping using Excel. Credits to original owners.", url: "https://drive.google.com/file/d/1PH8c3PiIg_uhQgjDEtCxBWCpmfY9L3Zk/view?usp=drivesdk" },
];

async function seed() {
  console.log(`\n🌱 Seeding ${resources.length} Diploma MLT & TDS resources...\n`);

  let inserted = 0;
  for (const r of resources) {
    try {
      const existing = await db.getAsync('SELECT id FROM resources WHERE url = ?', [r.url]);
      if (existing) {
        console.log(`⏭  Skipped (duplicate): ${r.title}`);
        continue;
      }

      await db.runAsync(
        `INSERT INTO resources (level, subject, resource_type, sub_type, title, description, url, published)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [r.level, r.subject, r.resource_type, r.sub_type, r.title, r.description, r.url]
      );
      inserted++;
      console.log(`✅ ${r.level} > ${r.subject} > ${r.sub_type} | ${r.title}`);
    } catch (err) {
      console.error(`❌ Failed: ${r.title} — ${err.message}`);
    }
  }

  console.log(`\n🎉 Done! Inserted ${inserted} resources (${resources.length - inserted} skipped).\n`);

  const counts = await db.allAsync(
    `SELECT level, subject, resource_type, sub_type, COUNT(*) as count
     FROM resources WHERE published = 1 AND level = 'Diploma' AND subject IN ('MLT', 'TDS')
     GROUP BY level, subject, resource_type, sub_type
     ORDER BY level, subject, resource_type, sub_type`
  );
  console.log('📊 Diploma MLT & TDS Summary:');
  console.table(counts);

  process.exit(0);
}

setTimeout(seed, 1000);
