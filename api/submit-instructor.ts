import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, subject, cgpa, devices } = req.body;
  
  if (!name || !email || !phone || !subject) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  const supabase_url = process.env.VITE_SUPABASE_URL;
  const service_role = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabase_url || !service_role) {
    return res.status(500).json({ error: 'Server configuration missing' });
  }

  const supabase = createClient(supabase_url, service_role);

  try {
    const { data, error } = await supabase
      .from('instructor_applications')
      .insert([
        { 
          name, 
          email, 
          phone, 
          subject, 
          cgpa: cgpa || null, 
          devices,
          created_at: new Date().toISOString() 
        }
      ]);

    if (error) throw error;

    return res.status(200).json({ message: 'Application submitted successfully', data });
  } catch (err: any) {
    console.error(`Instructor submission error:`, err);
    return res.status(500).json({ error: err.message });
  }
}
