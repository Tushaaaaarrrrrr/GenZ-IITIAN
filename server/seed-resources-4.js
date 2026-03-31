import db from './db.js';

const resources = [
  // =============================================
  // DIPLOMA — PDSA (Programming, Data Structures & Algorithms using Python)
  // =============================================
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Notes", title: "Google Colab Notebooks (Full Folder)", description: "Complete Colab notebooks for PDSA. Credits to original owners.", url: "https://drive.google.com/drive/u/0/mobile/folders/1qb6_mwzOjoef_N6zkC2YmAtPVpqjK00N?usp=sharing" },
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Colab)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1aRheiSTm2oEAVdfYx1GfgyUsrWzv_I1A/view" },
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Colab)", description: "Credits to original owners.", url: "https://colab.research.google.com/drive/106ws-hcozUOYt2MkeHssfvO9euNlp3gk?usp=sharing" },
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes (Colab)", description: "Credits to original owners.", url: "https://colab.research.google.com/drive/1XIYfiXNocxLAkuHIRmo8iaSZJVmPI1fP?usp=sharing" },
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes (Colab)", description: "Credits to original owners.", url: "https://colab.research.google.com/drive/1V9AKt3TGLsZIyvECyHRC5YZvobXeFxu8?usp=sharing" },
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Notes", title: "Week 5 Notes (Colab)", description: "Credits to original owners.", url: "https://colab.research.google.com/drive/1wS4ZObWmO3XYGuA8ETnk3XrZnJX4pfmn?usp=sharing" },
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Short Notes", title: "Week 5 Short Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1p3o6XB49N7TfJKnleXSkZjqSTTWOkTCT/view?usp=sharing" },
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Short Notes", title: "Week 6 Short Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/17bGF5BRTYagGK97_IXvbI1wrwx-fzNNs/view?usp=sharing" },
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Short Notes", title: "Week 7 Short Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1fCvMgQM8AOMp6GYRNG8aaH8YbDtQ7eYJ/view" },
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Short Notes", title: "Week 1–4 Short Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/18fTvIhhvryu9UJNXuMyXpU0s26MsELRC/view?usp=drivesdk" },
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Notes", title: "Week 1 Handwritten Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/16l7ET0sTPafxeIYekdcau3-sJ4Kk-Ey6" },
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Notes", title: "Week 2 Handwritten Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1ScJcgFBtFaUbtYK7Gj5P1jdfU0q5hdXH/view" },
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Notes", title: "Week 3 L1 — Quick Sort", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1PfQ6HP2ofAhTUTa9gYXBiUlTksXAACB6/view" },
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/15RMM54sARbq2eL3TkEui490LtToT99XN/view?usp=sharing" },
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1CGslzr0hvU-UE22jN4h0dQsQWoywyOzw/view?usp=sharing" },
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/15VUHSBo58ECakjFiKYy3tE-OIe25jfhI/view?usp=sharing" },
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/15ZOdlP1PqFm5D8eYyRGkynBesDDC_-EE/view?usp=sharing" },
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Notes", title: "All Weeks Code Examples (Colab)", description: "Credits to original owners.", url: "https://colab.research.google.com/drive/1-p9EPifiTd60L5G0NQFQ5MNABvmIyz8T#scrollTo=4GYLIybHg95d" },
  { level: "Diploma", subject: "PDSA", resource_type: "note", sub_type: "Short Notes", title: "Quiz 1 PYQs & Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Xw9aBGjd5ig_d7r8Z2G_BBhenZTik_N7/view?usp=drive_link" },

  // =============================================
  // DIPLOMA — Java
  // =============================================
  { level: "Diploma", subject: "Java", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Folder)", description: "Credits to original owners.", url: "https://drive.google.com/drive/folders/17Xsy0uWUg7xVGNLw5nODnPbqnRUUjXxM?usp=sharing" },
  { level: "Diploma", subject: "Java", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Folder)", description: "Credits to original owners.", url: "https://drive.google.com/drive/folders/1YYZ_AKWtMnMbCi5nb9QIKus9HuRrDjLH?usp=sharing" },
  { level: "Diploma", subject: "Java", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes (Folder)", description: "Credits to original owners.", url: "https://drive.google.com/drive/folders/14fx2jHChQwcHtLRhegx0T6tZjWBFWQX0?usp=sharing" },
  { level: "Diploma", subject: "Java", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1ppsRvzzJ4Xm3jkTsragRUsQ4pFwexG3b/view" },
  { level: "Diploma", subject: "Java", resource_type: "note", sub_type: "Notes", title: "Week 5 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/16dh0oL8CkEv4uEeX8f3ENUDjVZQ6Tk50/view?usp=sharing" },
  { level: "Diploma", subject: "Java", resource_type: "note", sub_type: "Short Notes", title: "Quiz 1 Notes", description: "Revision notes for Quiz 1. Credits to original owners.", url: "https://drive.google.com/file/d/1v7BinbEaTo-CA83xLg3wG0HRhhCdkyWe/view?usp=sharing" },
  { level: "Diploma", subject: "Java", resource_type: "note", sub_type: "Notes", title: "Week 6 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1xcEkPnazPIwN23RxWmMfGjRVoMhpV-B4/view?usp=sharing" },
  { level: "Diploma", subject: "Java", resource_type: "note", sub_type: "Notes", title: "Week 7 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1MXTlNDjHM50gqxzjGSjCTUwYoU8RnzMV/view?usp=sharing" },
  { level: "Diploma", subject: "Java", resource_type: "note", sub_type: "Notes", title: "Week 8 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1u4vr3_o5MqserSLvNj5O1KKZXbTOgFUr/view?usp=sharing" },
  { level: "Diploma", subject: "Java", resource_type: "note", sub_type: "Notes", title: "Week 9 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1bV5O0b2HQWKS4eIa9RE5l9iSh4ReOqjY/view?usp=sharing" },
  { level: "Diploma", subject: "Java", resource_type: "note", sub_type: "Notes", title: "Week 10 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1OjyGhV8o5uZ4b1iP76x_BRLvB06yH23g/view?usp=sharing" },
  { level: "Diploma", subject: "Java", resource_type: "note", sub_type: "Notes", title: "Week 11 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1DJDopJEZrsm6PuwJD10yhBRRDlTBtcN0/view?usp=sharing" },
  { level: "Diploma", subject: "Java", resource_type: "note", sub_type: "Short Notes", title: "Quiz 2 Notes", description: "Revision notes for Quiz 2. Credits to original owners.", url: "https://drive.google.com/file/d/1Wtp_PW-ABgDarSC7G1HzHfneUYzhaDwD/view?usp=sharing" },
  { level: "Diploma", subject: "Java", resource_type: "note", sub_type: "Notes", title: "Week 12 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1LDO-hIEx3V45s3oD0UxHdM1QxbvVt1CD/view?usp=sharing" },
  { level: "Diploma", subject: "Java", resource_type: "note", sub_type: "Short Notes", title: "Quiz 1 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1_JUpAvgIkPffTU0IRagvoIBORxPCCT3r/view?usp=sharing" },

  // =============================================
  // DIPLOMA — System Commands
  // =============================================
  { level: "Diploma", subject: "System Commands", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Folder)", description: "Credits to original owners.", url: "https://drive.google.com/drive/folders/1Ctrmv6hfChzgxqLePbeJbESXQJP76Coi?usp=sharing" },
  { level: "Diploma", subject: "System Commands", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Folder)", description: "Credits to original owners.", url: "https://drive.google.com/drive/folders/1T8j0DKmllNyhili_AgyRb4NxtS4Ezpy6?usp=sharing" },
  { level: "Diploma", subject: "System Commands", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes (Folder)", description: "Credits to original owners.", url: "https://drive.google.com/drive/folders/1iet9KIQOAzQQacXJJ3ESaOrsGJgYTtCv?usp=sharing" },
  { level: "Diploma", subject: "System Commands", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1zy1cnXhvIqryMlKKvgKH9Lz7opQuVeiu/view?usp=sharing" },
  { level: "Diploma", subject: "System Commands", resource_type: "note", sub_type: "Short Notes", title: "Quiz 1 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1RWw7uoletNoSv9TKHOvZiMcpHfeDME7z/view?usp=sharing" },
  { level: "Diploma", subject: "System Commands", resource_type: "note", sub_type: "Notes", title: "Week 5 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Wg7QOpd2UdxUge8ihFsPiktpMeAifHj_/view?usp=sharing" },
  { level: "Diploma", subject: "System Commands", resource_type: "note", sub_type: "Notes", title: "Week 6 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1VD8jZx717gWTrHRmpf_11-iZoIP8dxjI/view?usp=sharing" },
  { level: "Diploma", subject: "System Commands", resource_type: "note", sub_type: "Notes", title: "Regex Consolidated Notes", description: "Comprehensive regex reference. Credits to original owners.", url: "https://drive.google.com/file/d/1-N9E4ScHlzAIziwQtEHsntb4XNZ2Tm7Q/view?usp=sharing" },
  { level: "Diploma", subject: "System Commands", resource_type: "note", sub_type: "Notes", title: "Week 7 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1i2kgx6HQcPQVn571JIqciMMGYajZ-oqB/view?usp=sharing" },
  { level: "Diploma", subject: "System Commands", resource_type: "note", sub_type: "Notes", title: "Command Line Editors", description: "Notes on CLI editors. Credits to original owners.", url: "https://drive.google.com/file/d/1WD4R8UHsl7Zg7x7c4felrau7ExvJ8Pg9/view?usp=sharing" },
  { level: "Diploma", subject: "System Commands", resource_type: "note", sub_type: "Notes", title: "Bash Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1YTDb-Pf6yZZbWyArJDz902sgDNZ-Bi72/view?usp=sharing" },
  { level: "Diploma", subject: "System Commands", resource_type: "note", sub_type: "Notes", title: "AWK Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1QUL6IYOQ6EHXcpr7ZUqNwzRtTqJihFYu/view?usp=sharing" },
  { level: "Diploma", subject: "System Commands", resource_type: "note", sub_type: "Notes", title: "SED Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1SaNppTN6HWGIL1avwHsi4KC0sPuytfOA/view?usp=sharing" },
  { level: "Diploma", subject: "System Commands", resource_type: "note", sub_type: "Short Notes", title: "Quiz 2 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1KMjoEsSJMxnk-2DNxCDqP9_Pd1FLOfH4/view?usp=sharing" },
  { level: "Diploma", subject: "System Commands", resource_type: "note", sub_type: "Notes", title: "Week 8 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Btlm0eQ0mZEzNtOf44p-jveF5LRY0AOp/view?usp=sharing" },
  { level: "Diploma", subject: "System Commands", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1cgLWUJLr3buyTLAomusjQnjow0yBI9d8/view?usp=sharing" },
  { level: "Diploma", subject: "System Commands", resource_type: "note", sub_type: "Notes", title: "All Notes — GitHub Repository", description: "Complete course notes on GitHub. Credits to original owners.", url: "https://github.com/cheriangeorge/System-Commands-course" },
  { level: "Diploma", subject: "System Commands", resource_type: "note", sub_type: "Notes", title: "Week 1–8 Complete Notes", description: "Full course notes covering all 8 weeks. Credits to original owners.", url: "https://drive.google.com/file/d/1zo8icRcda7nK2dgoUHAY__6lji5nKQOQ/view" },

  // =============================================
  // DIPLOMA — MAD 2
  // =============================================
  { level: "Diploma", subject: "MAD 2", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Folder)", description: "Credits to original owners.", url: "https://drive.google.com/drive/folders/1wgcJ32F6NBUCWhkyOoddaZb-2oXjWGKn?usp=sharing" },
  { level: "Diploma", subject: "MAD 2", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Folder)", description: "Credits to original owners.", url: "https://drive.google.com/drive/folders/1uBTbVxXu9nDG1nguEOauD91Dgkoggy5P?usp=sharing" },
  { level: "Diploma", subject: "MAD 2", resource_type: "note", sub_type: "Notes", title: "Week 6 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1B8nZI1HLcDGNB7xc0sG6wh21GLlxYfYT/view?usp=sharing" },
  { level: "Diploma", subject: "MAD 2", resource_type: "note", sub_type: "Notes", title: "Week 7 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1kjayHbz73azFvDBbQ4xrWqA1h34cDY8B/view?usp=sharing" },
  { level: "Diploma", subject: "MAD 2", resource_type: "note", sub_type: "Notes", title: "Week 8 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1BwM-pUwbwAyEIqpALxhEHG36hHgjpLKv/view?usp=sharing" },
  { level: "Diploma", subject: "MAD 2", resource_type: "note", sub_type: "Notes", title: "Week 9 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1_Tfz-6velTuUOhCSrf42J8_t6qdohVYF/view?usp=sharing" },
  { level: "Diploma", subject: "MAD 2", resource_type: "note", sub_type: "Notes", title: "Week 10 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/19v8zmU7bX4DmSjanRb00Ty7CnTLmzYbN/view?usp=sharing" },

  // =============================================
  // DIPLOMA — MAD 1
  // =============================================
  { level: "Diploma", subject: "MAD 1", resource_type: "note", sub_type: "Notes", title: "Complete MAD 1 Notes (Folder)", description: "Full folder of Modern App Development notes. Credits to original owners.", url: "https://drive.google.com/drive/u/0/mobile/folders/1ZcJhrUSQSHYHXw4Dtm_C4KI_5iOP587o?usp=sharing" },
  { level: "Diploma", subject: "MAD 1", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set A)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1LOqQmyqIEOe95jiJJQaLMRMsmTU2vO_a/view?usp=sharing" },
  { level: "Diploma", subject: "MAD 1", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Set A)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1SV7jzyr4K6SHosWsbVNxX0ANMTalP5Xw/view?usp=sharing" },
  { level: "Diploma", subject: "MAD 1", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes (Set A)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1hhuyeb1XJkJJ-VGIoCeycZgRo2lePilA/view?usp=sharing" },
  { level: "Diploma", subject: "MAD 1", resource_type: "note", sub_type: "Short Notes", title: "Week 1–4 Quiz 1 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1wGId2DQtHDGxYFV9KyeToZka_K5SVyfl/view" },
  { level: "Diploma", subject: "MAD 1", resource_type: "note", sub_type: "Notes", title: "Week 1 Detailed Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1xPjMetfNrP534HL-P0a5f6ybvqiaMIwE/view?usp=sharing" },
  { level: "Diploma", subject: "MAD 1", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1cYnYptoS7EmeI4_yGRoaJcgz00qvmBbl/view?usp=share_link" },
  { level: "Diploma", subject: "MAD 1", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1jKBAvYWr2DaDKAMaOAtiubUHorQaivov/view?usp=share_link" },
  { level: "Diploma", subject: "MAD 1", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/182hsAAUuS_xu4j-HHMsnaUJa882N6ycQ/view?usp=share_link" },
  { level: "Diploma", subject: "MAD 1", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1elZRurBtepLZ7ZB2w40EN6GyFeZgB4tF/view?usp=share_link" },
  { level: "Diploma", subject: "MAD 1", resource_type: "note", sub_type: "Notes", title: "All Weeks Notes (Folder)", description: "Credits to original owners.", url: "https://drive.google.com/drive/folders/1FMKmQS44NC5rpyBQyabC5S2qRVL4FIJx?usp=sharing" },
  { level: "Diploma", subject: "MAD 1", resource_type: "note", sub_type: "Notes", title: "Complete Notes (Google Doc)", description: "Credits to original owners.", url: "https://docs.google.com/document/d/1cCDFBHrtBZDTkxMIlEVhSIQBFqV4ym3jYz3a1UPlAO0/edit?usp=sharing" },
  { level: "Diploma", subject: "MAD 1", resource_type: "note", sub_type: "Short Notes", title: "Quiz 1 PYQs & Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1XxP8VG2xVO10FzohPPp-cg-UIZFFkbAi/view?usp=drive_link" },

  // =============================================
  // DIPLOMA — DBMS
  // =============================================
  { level: "Diploma", subject: "DBMS", resource_type: "note", sub_type: "Notes", title: "All Week Notes (Folder)", description: "Complete notes folder. Credits to original owners.", url: "https://drive.google.com/drive/folders/1q_vUUALmof4FYcV-WEONRQxjZav1o5V9?usp=sharing" },
  { level: "Diploma", subject: "DBMS", resource_type: "note", sub_type: "Short Notes", title: "Quiz 1, 2, 3 Notes (Folder)", description: "Quiz preparation notes folder. Credits to original owners.", url: "https://drive.google.com/drive/folders/1akwWa6kbpIZMmpFW4ZnA5ViLP-PaQ_k3?usp=sharing" },
  { level: "Diploma", subject: "DBMS", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1FcIIEYLbbd32vo6ParB4rYzWmdUPFUIm/view" },
  { level: "Diploma", subject: "DBMS", resource_type: "note", sub_type: "Notes", title: "Week 11 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1zwUH0hb-tmY2dXsPNVNsY85JjEwhm92h/view?usp=sharing" },
  { level: "Diploma", subject: "DBMS", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set A)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1xXRjZmeIFTBhGMdpBmLIowLO2Tqe1D4q/view?usp=sharing" },
  { level: "Diploma", subject: "DBMS", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Set A)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1_ajnYqRFqsbCOsSGxqTBcmAFU0V8NeCo/view?usp=sharing" },
  { level: "Diploma", subject: "DBMS", resource_type: "note", sub_type: "Notes", title: "DBMS Reference Notes (Not in IITM order)", description: "Comprehensive DBMS reference. Credits to original owners.", url: "https://drive.google.com/file/d/14bXNQ8BRqYj_F5Q0h9kjCu5dBV_-Yc3h/view" },
  { level: "Diploma", subject: "DBMS", resource_type: "note", sub_type: "Notes", title: "Week 1 Detailed Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/11dZorUPFrFD03iENz-FAYCAUqBOEMDxT/view?usp=sharing" },
  { level: "Diploma", subject: "DBMS", resource_type: "note", sub_type: "Notes", title: "Week 2 Detailed Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/11dbZO7APkFF57SeUtKxrD91nkJ3Hbzrw/view?usp=sharing" },
  { level: "Diploma", subject: "DBMS", resource_type: "note", sub_type: "Notes", title: "Week 3 Detailed Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/17HF3bfIQWfjRVPxL14wJCm4lCYVev_Jz/view?usp=sharing" },
  { level: "Diploma", subject: "DBMS", resource_type: "note", sub_type: "Short Notes", title: "Week 1 & 2 Short Notes for Revision", description: "Credits to original owners.", url: "https://drive.google.com/file/d/11jC7mA6oy108ghhb2w1Gsmr3MYBMi3mv/view?usp=sharing" },
  { level: "Diploma", subject: "DBMS", resource_type: "note", sub_type: "Notes", title: "Week 10 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1ZMjuwXS5O3sJhDxF0sAtjKhciZ7nG70L/view?usp=sharing" },
  { level: "Diploma", subject: "DBMS", resource_type: "note", sub_type: "Notes", title: "All Weeks Complete Notes", description: "Full course notes. Credits to original owners.", url: "https://drive.google.com/file/d/1ylQG0ZbWzYHZHCs7ytU1YdFY9YSQh72z/view?usp=drive_link" },
  { level: "Diploma", subject: "DBMS", resource_type: "note", sub_type: "Notes", title: "All Weeks Notes (Folder — Set B)", description: "Credits to original owners.", url: "https://drive.google.com/drive/folders/1zOxUAgJMIYTI17GPgcjBqGtOR7NjTnkW?usp=sharing" },
  { level: "Diploma", subject: "DBMS", resource_type: "note", sub_type: "Short Notes", title: "Quiz 1 PYQs & Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Y-i97y61iLDU_WCnNFwh5oIeIsKcJHyD/view?usp=drive_link" },

  // =============================================
  // FOUNDATION — Python
  // =============================================
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Short Notes", title: "Python Cheat Sheet", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1LW0vJiIvbsnzL16KQNgsg07hLkOC9eVF/view" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set A)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1giCvH99enz5UJACBJ2rqQhXiHrdxyP7j/view" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Set A)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1TBxnFrR2Q-9EE6V8h3N-GXgCTY9W2pfL/view" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes (Set A)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/13MSbXkRHZ8D6r8SJZ1oAkiISYlmB_hah/view" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes (Set A)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1n71fweeo7vgiyZ3F-nIDY9VQcSmlblRh/view" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 5 — Functions", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1sMV0lN5_tA6plUIhtkXENbDDb7A5UzNS/view" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 6 — Python Collections", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1tyrOyERdNke1DTZqGtUKEohkj4x9uvv8/view" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 8 Notes (Set A)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1AWoeuxdLwUmLn-ixIKJSBBA57sKoJbV1/view" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 9 — File Handling", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1CM0Hbkk2PvbmFvDPBZh2UNlO5UBlX-tn/view?usp=drivesdk" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 10 — OOP", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1NngbghSqdOA9cAS-cgucbDuGnPnUeFDh/view" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 11 — Exception Handling & Functional Programming", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1BSFxwqE98hBS1q1cv-59VmiQ5UEx3VOm/view" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 1–2 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1qcm3rFvyN7UDNa23XXajSs6SQ69tq3Pz/view" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/12R0jgOvmu8M-KXu0QC_L2SaSY7pUGb5L/view" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Short Notes", title: "Revision Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1N6e8avbu2Gu-tczm7d1nyIlsD6z1l6Zd/view" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Blog)", description: "Credits to original owners.", url: "https://pythonstudynotes.wordpress.com/week-1-notes/" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Blog)", description: "Credits to original owners.", url: "https://pythonstudynotes.wordpress.com/week-2-notes/" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 1 Practice Questions", description: "Credits to original owners.", url: "https://pythonstudynotes.wordpress.com/week-1-selected-practice-questions/" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Python File Handling Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1ZvaXUhzbz5qf5phhFUE7URLHpd-ZFYQz/view?usp=sharing" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Od1hEpdk_-ZR28XwAOn2twrgWYk-DyLP/view?usp=share_link" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/12Ew-1rFgrVpzphTF1Xv56QzRcBSaHcVs/view?usp=share_link" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Wn0PE3tRYV03S__M3X0cXn6uqE91BuW1/view?usp=share_link" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1GvsmoAG7b93wLnKf7Ap_6e_clg8Lkcm6/view?usp=share_link" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 5 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1vjbcj-ULfB9CRluzkjvYNs6tViNR0h3H/view/" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 6 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Ag5u4tLYt1PDONY5Ef2jV_jxjsKxY2Jv/view" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 8 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1TkI_mnXr4airxlXTi0pE-OtHhOhdbI-h/view" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 9 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1REErTktUB6xxUgSUsyx_b-j2b2jOBH_f/view" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 10 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1OsXyii8uhMuRBi9N00wasnyDddoC4jwO/view?usp=sharing" },
  { level: "Foundation", subject: "Python", resource_type: "note", sub_type: "Notes", title: "Week 11 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1U3urN_zZgj0D5LcN0x58P-LlCNkxt0NY/view?usp=sharing" },
  { level: "Foundation", subject: "Python", resource_type: "video", sub_type: "", title: "Python IITM BS Complete Playlist (Hindi)", description: "Full video course in Hindi. Credits to original owners.", url: "https://www.youtube.com/playlist?list=PLClULgPbRPsD-t0AYG8hR5iLIt2ZaNTkv" },
  { level: "Foundation", subject: "Python", resource_type: "video", sub_type: "", title: "OPPE 1 Revision Session", description: "Credits to original owners.", url: "https://youtu.be/oTEwgdlqZtY" },
  { level: "Foundation", subject: "Python", resource_type: "video", sub_type: "", title: "OPPE 2 Revision Session", description: "Credits to original owners.", url: "https://youtu.be/D2UmPJRIC0g" },
  { level: "Foundation", subject: "Python", resource_type: "video", sub_type: "", title: "OPPE 2 Revision Session — Questions", description: "Credits to original owners.", url: "https://youtu.be/BS0p29var8E" },

  // =============================================
  // FOUNDATION — Stats 2
  // =============================================
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1jyY-W0B-JnVbgFYKyqlNcuAnGU7FZ0PJ/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1CF0bPQr6K9iqqEGvoEJS4jzKQ5lXZrwo/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Wh-pg7dpJb0oq2_fnhm3Sz-UitahMOmx/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Short Notes", title: "Week 1 Formulas", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1pRNGY8WtGT-VYF5zbz6YUrhtmo1Euw5D/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Short Notes", title: "Week 2 Formulas", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1GFZCVPk_YXqW-uxUKjT7C6yal7XmN8B6/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Short Notes", title: "Week 3 Formulas", description: "Credits to original owners.", url: "https://drive.google.com/file/d/10IXze-b3Fi6JrOWPXRcJSKEtn2di87v_/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Short Notes", title: "Week 4 Formulas", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1jvv0b1YjH0EZ53RqMJu4AyqV1Qjc7RmM/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Short Notes", title: "Week 5 Formulas", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1ZLuqPlDkqwkkOjaSMkxaFBMWG8YJ7wXJ/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Short Notes", title: "Week 6 Formulas", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1kjMDr3WNA7QxmjMRYoHakEMFuMm4BcfR/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 1–8 Complete Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1zgiiWg49h15RHPfo6hwnRFJrvVgWN7LR/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Short Notes", title: "Important Formulas & Results", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1-SnNxImOcEO4OVHZJ7BItej3_Ho1FzJ6/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 1–3 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1z79MOmEbzuEH4nf5bEktmnW6qSaMTpt5/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1z5TzObbHczAqjguDwRhn0QitIvxcrtei/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 5 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1z8nJwqqn5AyXpEjKhEvsnFV471wPP4qs/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 6 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1z9gygumUUkU84yYfuFma5MCrGx2h3CoP/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Hypothesis Testing Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1-YVJbKLUyIDLOznGlQz9NXRWr4pBkfnD/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Probability & Statistics with R — Reference Book", description: "Credits to original authors.", url: "https://drive.google.com/file/d/1j5B7RxfCXzVcVd4LRhT5R77qMYRTRYRl/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Think Stats — Reference Book", description: "Credits to original authors.", url: "https://drive.google.com/file/d/1RhBQmy31Q3omH7lhbziTGCp1jydT-Ile/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1rU2JCiH9CLnudcldBbdBpdZn8x5BJpRm/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 5 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Srq43zpUnPXlFw2Xt-Mh3uy52GZx4iA8/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 7 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1UJ6y2xdtNKDHiurbm6740ECJQCqOgaiB/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 8 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1F2590hhvWIewP3rbVTQrnevd1STX1jSd/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 9–10 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1mGiDyeh5L9mnmQjfsAvvFyTq4bcJFSVP/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Stats 2 Reference Book (PDF)", description: "Credits to original authors.", url: "https://drive.google.com/file/d/1QL7hYAguJHoD1sdUnD9ji7HjrR2-BOJv/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 0 (Part 1, 2, 3)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1laoPXQ5NL4e7YpB3pP7TWD-qgScTKZjS/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set D)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/14hRwAEX1W-iuMXxqwgFvBkmjKeczOtBj/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Set D)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/14gKfdSPxKWaTOkRLFSaEZ4qvaQiipu_p/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes (Set D)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/16Gc-FWTHi8AsVa31gShrao9MjoGmkZ-G/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes (Set D)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1CYttpPJuOC9uLFYbNZX7cGbEJIFPPRjM/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 5 Notes (Set D)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1CoWudOuuJw_PduIwq49MSpVvnw3A6vN5/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 0 Notes (Set E)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1QQWhpfdhCZIulJLgJxbripZTY9z1vlWV/view?usp=drivesdk" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set E)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1QQZWsuUcB7SGvhzPfVq0pSgb8MBWBXV9/view?usp=drivesdk" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Set E)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1QWpJ5a31UCrpp38MCv6eyR9Olf4YmFZ4/view?usp=drivesdk" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes (Set E)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1QXKVXm9-3rDALqqwcxd_UqtgXFpYilnm/view?usp=drivesdk" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 0 Notes (Set F)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1yLQELEy0YnnU_PBild0CKjR_buhxnsAb/view?usp=sharing" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set F)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1x1AQFab8COUj87kXY54AQYOgtGJ7Vsv4/view?usp=sharing" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Set F)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1UEMHT63YVfG2keyNF_Qh9Hle_xYfVyti/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes (Set F)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/18nXLa3wVrPjjjCjPcskaCumvbH1zgCXq/view?usp=sharing" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 6 Solutions", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1I0mHnXV0IsZAf6-V2OrAzHUALQVURBbQ/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 0 Part 2", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1_DDBRkEUj-IDS4fQKTCfLEiGWSSnemVd/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 0 Part 3", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1ulmW61zzJCRLkl9ggHRji5oYy2ZBnotH/view" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "All Weeks Notes (S-Grade)", description: "Complete notes that helped score an S grade. Credits to original owners.", url: "https://drive.google.com/file/d/1Ty8ZCAy_k96G7cgl8H6CCC5XM8ojwFXG/view?usp=share_link" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 1–12 IITM Complete Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1MDtJXX49XdHpAogUDdsIHYbn52R2aQm8/view?usp=sharing" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set G)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1VfBSo_3zrcN6hybjKs5SyLb67QoG1lKq/view?usp=drive_link" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Set G)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Vh8QXjzDDz2NIWT2QWvYQa5E67NKwQQe/view?usp=drive_link" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes (Set G)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Vki6lXYcSIB6o2Tib1w9eM6AsNjM3O_o/view?usp=drive_link" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes (Set G)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1VlWuhB05IvSEqJm72uZaIRQdqdt0cskl/view?usp=drive_link" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 5 Notes (Set G)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Tu8WwWgZcLeoLuq9Wc3LB_mpQKE_3x87/view?usp=drive_link" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 6 Notes (Set G)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1TuWqoatOg4SZn522htj8Cbu-18DRkaHj/view?usp=drive_link" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 7 Notes (Set G)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1TffFjQzB9Pow_0PBGFgTpuAnVNNV4LVN/view?usp=drive_link" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 8 Notes (Set G)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1TzZ4gzEH0CSD0m0S3huHSVOrQolT3JoJ/view?usp=drive_link" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 9 Notes (Set G)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1U-0vSGYdJ0pi_ZvKeHra1-6-VC7SZgUn/view?usp=drive_link" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 10 Notes (Set G)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1To9NEPmEhI15hVs7xX_UrGxBtVNfoCSg/view?usp=drive_link" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 11 Notes (Set G)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Tk6qcpX7ts1KflTdMmv8CA7Lwhq0sBQo/view?usp=drive_link" },
  { level: "Foundation", subject: "Stats 2", resource_type: "note", sub_type: "Notes", title: "Week 12 Notes (Set G)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1TqkxAtWqJUa02Nz-y408RVU8ye-x29xl/view?usp=drive_link" },

  // =============================================
  // FOUNDATION — Maths 2
  // =============================================
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1BfUgKg8d-5EBs4D7a7exTcySy-tnwSx8/view" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/12_U1YkvpvruQmhv8pTNAQSldEFua3zo8/view?usp=sharing" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1WhTJlG3b3x9tVW_xDjvkh0rUdYMmpAuO/view" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/15jMFju2o566Y_mOPsr4n1MP_lwF_wLhw/view" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 6 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1svTWKudLrauqje2OGUNUswEkmhVrio72/view" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 1–8 Complete Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1zeSiEapQ99JwQRPcEoLBIKyB0mUoWY70/view" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 1–3 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1WxTb8fLGh3UEwNBGCvU6AIUJaHQRfR2l/view?usp=drivesdk" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 4–5 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1V5jwnwtvtEvInCrJT_8MSHN-oNaK1ZAR/view?usp=sharing" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 6–7 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/11TdYvF77pVEkV7P2jnZiL2bVEtSLocET/view" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 8–9 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/140wSEVwwtE-vHTFOJA7ukWAbqTMRG0Fd/view" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 10 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/14oq3nswJDts1MO8BeEHxxbT6m1oRHOL-/view" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 11 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/14wMdZiI_9XtwjweAeej5NWWsKWxpSdos/view" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1rY8a5XK_ZHWua3apBHXWrB9sPLaRpsW6/view" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/14DFObZrDkd6J5K4uRvWGh8Cy6jhIcVCb/view" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1CqTuDCaMM-qjBCvQLJq4BsPiEH5phXja/view" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 5 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1CrgRgOtMvVWCa-cASbtDbzF9DGQDKowA/view" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 1–4 Notes (Set D)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/10e3VGyIXR30EEtUkIjvaGlObgkFcQRKr/view?usp=drivesdk" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 5 Notes (Set D)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/13xLWkWjvDfBQRYtalnjYj12Ug_Qm8OGa/view?usp=drivesdk" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 5–7 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Y0O1hruvymft9zqGhX56q52OFIjcZSv9/view?usp=drivesdk" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 1–11 Complete Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1qejIY5fwzq4qDc2bBAk165A2Fn55tMNt/view" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "All Weeks (1–12) Complete Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1EXtGFCXuP8Evk87qWD85h6Y41S9Xt3SH/view?usp=share_link" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 1–4 Notes (Set E)", description: "Credits to original owners.", url: "https://drive.google.com/open?id=101HnSFbZLdrgO5zZcYw-03qgDAh--bs2&usp=drive_fs" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Short Notes", title: "Week 5–7 Revision Notes", description: "Credits to original owners.", url: "https://drive.google.com/open?id=1-nXOD8uYdbPdKyT30bxUvZC9lQrYDBaz&usp=drive_fs" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 6 Notes (Set E)", description: "Credits to original owners.", url: "https://drive.google.com/open?id=1-q0PYwITbu06K1XDtioMrpn9IjfXrey6&usp=drive_fs" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 7 Notes (Set E)", description: "Credits to original owners.", url: "https://drive.google.com/open?id=1-V0gdx-m3RpdOHNTHEPiciUSnH3c9n5q&usp=drive_fs" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 8 Notes (Set E)", description: "Credits to original owners.", url: "https://drive.google.com/open?id=1-v8R9fA2ycoWhlJmg-vMWAie-ivxQfnM&usp=drive_fs" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 9 Notes (Set E)", description: "Credits to original owners.", url: "https://drive.google.com/open?id=10AsWX1AcvXdDABDobMN-5LkBbBtvaz-E&usp=drive_fs" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 10 Notes (Set E)", description: "Credits to original owners.", url: "https://drive.google.com/open?id=109_PRiWSwrCruZmrh_xqnRPk8GMoAGME&usp=drive_fs" },
  { level: "Foundation", subject: "Maths 2", resource_type: "note", sub_type: "Notes", title: "Week 11 Notes (Set E)", description: "Credits to original owners.", url: "https://drive.google.com/open?id=10BQtfUh176fRTy61nEi5ipnBnn99CYMs&usp=drive_fs" },

  // =============================================
  // FOUNDATION — English 2
  // =============================================
  { level: "Foundation", subject: "English 2", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1GiMINiGRsJEujIPi2UrIVA--thuS_6Dq/view" },
  { level: "Foundation", subject: "English 2", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1cq60312OPjp0SlYWIP5Dk_Vd4xLVCxfg/view" },
  { level: "Foundation", subject: "English 2", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1cwu_oXp44hMJytyg11zfXe9fEiR_ostT/view" },
  { level: "Foundation", subject: "English 2", resource_type: "note", sub_type: "Notes", title: "Week 4 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1cyuahLOCCam0JMhulVkIDY6CkysZVXg1/view" },
  { level: "Foundation", subject: "English 2", resource_type: "note", sub_type: "Notes", title: "Week 5 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1d0O3F_iKL0JLHXtDLq7qT8SRF-bvbX0_/view" },
  { level: "Foundation", subject: "English 2", resource_type: "note", sub_type: "Notes", title: "Week 6 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1d5YVwyNReQAJM675m6cZ_Z3sqap8ffME/view" },
  { level: "Foundation", subject: "English 2", resource_type: "note", sub_type: "Notes", title: "Week 1–3 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Vie2GlwyayCXGl8UEOhTZwstzUipUZcL/view" },
  { level: "Foundation", subject: "English 2", resource_type: "note", sub_type: "Notes", title: "Week 4–6 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1ewBT4TZ-s6u4CuZbXJBYTr5Mo0lxDi4v/view" },
  { level: "Foundation", subject: "English 2", resource_type: "note", sub_type: "Notes", title: "Week 7–8 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Ut9v-zpuUgHz7MeoXiYeNVfBO138D6Yu/view" },
  { level: "Foundation", subject: "English 2", resource_type: "note", sub_type: "Notes", title: "Week 9–10 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1nUk9FZ9Tios-P_sXZauTWjujVxc4KNGB/view" },
  { level: "Foundation", subject: "English 2", resource_type: "note", sub_type: "Notes", title: "Week 11–12 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/16jm3-7Z_nungiTWNsMvraiJkXpNU68zQ/view" },
  { level: "Foundation", subject: "English 2", resource_type: "note", sub_type: "Notes", title: "Week 1–9 Complete Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/12jWLWQuHuY8kWws_nLAEByqfF1efEmqT/view" },
  { level: "Foundation", subject: "English 2", resource_type: "note", sub_type: "Short Notes", title: "Main Topics Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1_aKpT0JT3EzadVv9o_zQrQsh4KUY8D3K/view" },
  { level: "Foundation", subject: "English 2", resource_type: "note", sub_type: "Notes", title: "Week 1–8 Lecture Notes (Notion)", description: "Amazing detailed lecture notes. Credits to original owners.", url: "https://moored-spoonbill-284.notion.site/4047696f343c43a79812d01e8df59812?v=bdb9ca78e00f41c38bb3f932e72bbd1f" },
  { level: "Foundation", subject: "English 2", resource_type: "note", sub_type: "Notes", title: "Week 1–12 Complete Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1xc1ihDSgshv7Z77XtI1r0HH3ooEqxOVg/view?usp=drive_link" },

  // =============================================
  // FOUNDATION — CT (additional — some may be duplicates)
  // =============================================
  { level: "Foundation", subject: "CT", resource_type: "note", sub_type: "Notes", title: "Week 1–4 Notes (Foundation)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1xVFe5e86Qfc0IlcDAW_23nd-8MjWYm4V/view" },

  // =============================================
  // FOUNDATION — Stats 1 (additional)
  // =============================================
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 8–9 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1jwhuuAXrfZOrFB5p1xdsTW9Q2F8TSVl3/view" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 7–9 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1LlEjlNPeIXynIiSjQnL7Z6GizmMRn5V5/view" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 10 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1ANLF40-nXz-2fDhMVvZFIUDDAMLNqNG0/view" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 7–8 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1heW6_3mjYE6jUj7g0R9s4niS30tPLwTx/view" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 9 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1IDb6DG1rkw6lDSzQdHv3Uk99v4Q1ovX3/view" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 10–11 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/15Px6LIRKelqG-D4QwcGMps_c1UOq08MR/view" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 12 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1tzF-3U78i_tdwo0ZOq-Km4HNGDIviL02/view" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 5 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1pyekuw0_XpfDxuQB0KHEadYArt4y-BQ4/view" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 6 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1pzsZHtOUSJ2NTXj_dS9RhBI2g7F1zLb1/view" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Short Notes", title: "Week 5–6 Cheat Sheet", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1qVj5F7HJ8WIWkG4oIaWBd8XQdft1etk2/view" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 7 — Probability", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1ITf7V8ZdriDHY6bXqXf8obkZbDtI3b6Y/view" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 8 — Conditional Probability", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1IQZ3-u3SA5JpkfS1HboL2mGp5Z7j_VS8/view" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 9 — Random Variables", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1NSxRbmQxqEvfKcXCU6EeCEbfEwGnYkiz/view?usp=sharing" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 10 — Discrete Random Variables", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1NPzIHLGYnf58DaXyqKgdyLnEvTdo9mdF/view?usp=sharing" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 1–4 Theory Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1y71uJSS3nuhS9MHy1nksvIhOJR39FawP/view" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 1–4 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1xOC2CD0q1WirqtMj7oZITtJE0PoGJRzV/view" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 5–6 Notes (Set C)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1AEONA947Kwte9gI6jPVvhgNAm-o0qFEB/view" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 9 Detailed Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1UL7z8EStaejOB0zKXqtOzEvF3IcvCmGx/view?usp=sharing" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Short Notes", title: "Formulas for Qualifier", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Wci_j5IOt6LdD6aMUFcEmQLuudhDj_4y/view?usp=sharing" },
  { level: "Foundation", subject: "Stats 1", resource_type: "note", sub_type: "Notes", title: "Week 1–12 All Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1rtpF7_G_vj_2boUEtEyZLh_FBb26z5Pf/view?usp=share_link" },

  // =============================================
  // FOUNDATION — Maths 1 (additional)
  // =============================================
  { level: "Foundation", subject: "Maths 1", resource_type: "note", sub_type: "Notes", title: "Week 7–9 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1U-LyyHiqCGhUXWXbw9Oqy8v7KXhsVHs5/view" },
  { level: "Foundation", subject: "Maths 1", resource_type: "note", sub_type: "Notes", title: "Week 10–12 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1TaOkuJqb_EH9PzE5rddiD-bFhfUk2QpS/view" },
  { level: "Foundation", subject: "Maths 1", resource_type: "note", sub_type: "Notes", title: "Week 7–9 Notes (Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1rOuNEEgWXF2ASYZ747OwqA4ollVHnYsL/view" },
  { level: "Foundation", subject: "Maths 1", resource_type: "note", sub_type: "Notes", title: "Week 1–10 Notes (Foundation)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1xI1I4REWIQXRDh5zq1W2GhVp-NHYDwKz/view" },
  { level: "Foundation", subject: "Maths 1", resource_type: "note", sub_type: "Short Notes", title: "Maths Formulas for Qualifier", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1daGtUIkLrDth4NkmbpO1hM_zoSRJIWmt/view?usp=sharing" },
  { level: "Foundation", subject: "Maths 1", resource_type: "note", sub_type: "Notes", title: "Week 7 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1Hc32whxqf_c_1BcjkvSZ4H-5a86CH1vP/view?usp=sharing" },
  { level: "Foundation", subject: "Maths 1", resource_type: "note", sub_type: "Notes", title: "Week 8 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1k43pqvyPIzyvapbuTGyg1zPrlwvs4Sg5/view?usp=sharing" },
  { level: "Foundation", subject: "Maths 1", resource_type: "note", sub_type: "Notes", title: "Week 9 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1AMg-75-zr2_tRJMDKhOBM3mNUHs77FeU/view?usp=sharing" },
  { level: "Foundation", subject: "Maths 1", resource_type: "note", sub_type: "Notes", title: "Week 1 Notes (Foundation Set)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1tvbYepf0Xq8nf_pDiCIf-wBqGxPU7OUI/view?usp=sharing" },
  { level: "Foundation", subject: "Maths 1", resource_type: "note", sub_type: "Notes", title: "Week 2 Notes (Foundation Set)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1u14Cnq30JtEN7rQDG3Ll3O7eN1X-dsZy/view?usp=sharing" },
  { level: "Foundation", subject: "Maths 1", resource_type: "note", sub_type: "Notes", title: "Week 3 Notes (Foundation Set)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1uGkZ0-FN0KJ5H-9b6ayQ5YkgxTHuuS06/view?usp=sharing" },
  { level: "Foundation", subject: "Maths 1", resource_type: "note", sub_type: "Short Notes", title: "Week 5–8 Short Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1U1KE2hXLBlWBUmZrW2ymB5SSwK6NZKN7/view?usp=drivesdk" },
  { level: "Foundation", subject: "Maths 1", resource_type: "note", sub_type: "Notes", title: "Week 1–4 Notes (May 2022 Term)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1UJaNvcAI0ZqfuhMslid0R49BPbqtKUEQ/view?usp=sharing" },
  { level: "Foundation", subject: "Maths 1", resource_type: "note", sub_type: "Notes", title: "Week 1–12 Complete Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1NUKgwfjaF64kmftN7rRQJ4prKSVjd0Rf/view?usp=sharing" },

  // =============================================
  // FOUNDATION — English 1 (additional)
  // =============================================
  { level: "Foundation", subject: "English 1", resource_type: "note", sub_type: "Notes", title: "Week 1–4 Notes (Foundation Set A)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1r98vJJiHkGXXMQ8cOgrq-FWULWY74Nc2/view" },
  { level: "Foundation", subject: "English 1", resource_type: "note", sub_type: "Notes", title: "Week 8 Notes", description: "Credits to original owners.", url: "https://drive.google.com/file/d/12jwNIOD2_VLFxLPkov8o6D4Nn-rLPOAb/view?usp=sharing" },
  { level: "Foundation", subject: "English 1", resource_type: "note", sub_type: "Notes", title: "Week 1–4 Notes (Foundation Set B)", description: "Credits to original owners.", url: "https://drive.google.com/file/d/1x9M-AmD-d-8iG4_o8GLj2ZQC74VFTg2W/view" },
];

async function seed() {
  console.log(`\n🌱 Seeding ${resources.length} resources across multiple subjects...\n`);

  let inserted = 0;
  let skipped = 0;
  for (const r of resources) {
    try {
      const existing = await db.getAsync('SELECT id FROM resources WHERE url = ?', [r.url]);
      if (existing) {
        skipped++;
        continue;
      }
      await db.runAsync(
        `INSERT INTO resources (level, subject, resource_type, sub_type, title, description, url, published)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [r.level, r.subject, r.resource_type, r.sub_type, r.title, r.description, r.url]
      );
      inserted++;
    } catch (err) {
      console.error(`❌ Failed: ${r.title} — ${err.message}`);
    }
  }

  console.log(`\n🎉 Done! Inserted ${inserted} new resources (${skipped} duplicates skipped).\n`);

  const counts = await db.allAsync(
    `SELECT level, subject, resource_type, COUNT(*) as count
     FROM resources WHERE published = 1
     GROUP BY level, subject, resource_type
     ORDER BY level, subject, resource_type`
  );
  console.log('📊 Full Resource Summary:');
  console.table(counts);

  process.exit(0);
}

setTimeout(seed, 1000);
