import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  const supabase = supabaseUrl && serviceRole ? createClient(supabaseUrl, serviceRole) : null;

  // 1. POST: Submit a new job application
  if (req.method === 'POST') {
    try {
      const {
        role,
        role_title,
        full_name,
        name,
        email,
        phone,
        is_iitm,
        isIITM,
        level,
        subject,
        language,
        cgpa,
        resume_link,
        resumeLink,
        official_email,
        officialEmail,
        is_bs_student,
        isBSStudent,
        is_group_owner,
        isGroupOwner,
        group_link,
        groupLink,
        group_members,
        groupMembers,
        inquiries,
        metadata = {}
      } = req.body || {};

      const candidateName = (full_name || name || '').trim();
      const candidateEmail = (email || '').trim().toLowerCase();
      const candidatePhone = (phone || '').trim();

      if (!candidateName || !candidateEmail) {
        return res.status(400).json({ error: 'Name and email are required.' });
      }

      const appId = `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const resolvedRole = role || (role_title?.toLowerCase().includes('campus') ? 'campus-leader' : 'tutor');
      const resolvedRoleTitle = role_title || (resolvedRole === 'campus-leader' ? 'Campus Leaders' : 'Subject Tutor (Faculty)');

      const applicationRecord = {
        id: appId,
        role: resolvedRole,
        role_title: resolvedRoleTitle,
        full_name: candidateName,
        email: candidateEmail,
        phone: candidatePhone,

        // Tutor
        is_iitm: is_iitm || isIITM || null,
        level: level || null,
        subject: subject || null,
        language: language || null,
        cgpa: cgpa || null,
        resume_link: resume_link || resumeLink || null,

        // Campus Leader
        official_email: official_email || officialEmail || null,
        is_bs_student: is_bs_student || isBSStudent || null,
        is_group_owner: is_group_owner || isGroupOwner || null,
        group_link: group_link || groupLink || null,
        group_members: group_members || groupMembers || null,
        inquiries: inquiries || null,

        metadata: {
          ...metadata,
          submitted_at: new Date().toISOString(),
          userAgent: req.headers['user-agent'] || ''
        },
        status: 'PENDING',
        manager_notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (supabase) {
        // Try inserting into job_applications table
        try {
          const { error: insErr } = await supabase.from('job_applications').insert([applicationRecord]);
          if (insErr) {
            console.warn('[Job Applications API] Table insert warning:', insErr.message);
          }
        } catch (e: any) {
          console.warn('[Job Applications API] Supabase insert error:', e.message);
        }

        // Always log to activity_logs as durable ledger
        try {
          await supabase.from('activity_logs').insert({
            email: candidateEmail,
            action: 'JOB_APPLICATION_SUBMITTED',
            metadata: applicationRecord
          });
        } catch (e: any) {
          console.warn('[Job Applications API] activity_logs error:', e.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Application recorded successfully',
        application: applicationRecord
      });
    } catch (err: any) {
      console.error('[Job Applications API] Submission error:', err);
      return res.status(500).json({ error: 'Failed to record application' });
    }
  }

  // 2. GET: Retrieve all job applications (for Manager)
  if (req.method === 'GET') {
    try {
      let applications: any[] = [];

      if (supabase) {
        // Attempt fetch from job_applications
        try {
          const { data, error } = await supabase
            .from('job_applications')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && Array.isArray(data)) {
            applications = data;
          }
        } catch (e) {}

        // Best effort: merge from activity_logs if table was empty or missing
        try {
          const { data: logs } = await supabase
            .from('activity_logs')
            .select('*')
            .eq('action', 'JOB_APPLICATION_SUBMITTED')
            .order('created_at', { ascending: false });

          if (Array.isArray(logs)) {
            const existingIds = new Set(applications.map(a => a.id));
            for (const log of logs) {
              const meta = log.metadata || {};
              const id = meta.id || `log-${log.id}`;
              if (!existingIds.has(id)) {
                applications.push({
                  id,
                  role: meta.role || 'tutor',
                  role_title: meta.role_title || 'Subject Tutor (Faculty)',
                  full_name: meta.full_name || 'Candidate',
                  email: log.email || meta.email || '',
                  phone: meta.phone || '',
                  is_iitm: meta.is_iitm,
                  level: meta.level,
                  subject: meta.subject,
                  language: meta.language,
                  cgpa: meta.cgpa,
                  resume_link: meta.resume_link,
                  official_email: meta.official_email,
                  is_bs_student: meta.is_bs_student,
                  is_group_owner: meta.is_group_owner,
                  group_link: meta.group_link,
                  group_members: meta.group_members,
                  inquiries: meta.inquiries,
                  metadata: meta,
                  status: meta.status || 'PENDING',
                  manager_notes: meta.manager_notes || '',
                  created_at: log.created_at || meta.created_at || new Date().toISOString(),
                  updated_at: log.created_at || meta.updated_at || new Date().toISOString()
                });
                existingIds.add(id);
              }
            }
          }
        } catch (e) {}
      }

      return res.status(200).json({ success: true, applications });
    } catch (err: any) {
      console.error('[Job Applications API] Fetch error:', err);
      return res.status(500).json({ error: 'Failed to fetch applications' });
    }
  }

  // 3. PATCH/PUT: Update Status / Notes
  if (req.method === 'PATCH' || req.method === 'PUT') {
    try {
      const { id, status, manager_notes } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Application ID is required' });

      if (supabase) {
        const updatePayload: any = { updated_at: new Date().toISOString() };
        if (status) updatePayload.status = status;
        if (manager_notes !== undefined) updatePayload.manager_notes = manager_notes;

        try {
          await supabase.from('job_applications').update(updatePayload).eq('id', id);
        } catch (e) {}

        try {
          await supabase.from('activity_logs').insert({
            action: 'JOB_APPLICATION_STATUS_UPDATED',
            metadata: { id, status, manager_notes, timestamp: new Date().toISOString() }
          });
        } catch (e) {}
      }

      return res.status(200).json({ success: true, message: 'Application updated' });
    } catch (err: any) {
      console.error('[Job Applications API] Update error:', err);
      return res.status(500).json({ error: 'Failed to update application' });
    }
  }

  // 4. DELETE: Remove Application
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query || req.body || {};
      if (!id) return res.status(400).json({ error: 'Application ID is required' });

      if (supabase) {
        try {
          await supabase.from('job_applications').delete().eq('id', id);
        } catch (e) {}
      }

      return res.status(200).json({ success: true, message: 'Application deleted' });
    } catch (err: any) {
      console.error('[Job Applications API] Delete error:', err);
      return res.status(500).json({ error: 'Failed to delete application' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
