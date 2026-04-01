import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const tab = req.query.tab as string;
  if (!tab) return res.status(400).json({ error: 'Tab is required' });

  const supabase_url = process.env.VITE_SUPABASE_URL;
  const service_role = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabase_url || !service_role) {
    return res.status(500).json({ error: 'Server configuration missing' });
  }

  // Use service role key to bypass RLS for manager access
  const supabase = createClient(supabase_url, service_role);

  try {
    let query;
    if (tab === 'orders') {
      query = supabase.from('website_orders').select('*').order('createdAt', { ascending: false });
    } else if (tab === 'logs') {
      query = supabase.from('activity_logs').select('*');
    } else if (tab === 'courses') {
      query = supabase.from('courses').select('*');
    } else {
      return res.status(400).json({ error: 'Invalid tab' });
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Manager Fetch API Error [${tab}]:`, error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data || []);
  } catch (err: any) {
    console.error(`Manager query catch error:`, err);
    return res.status(500).json({ error: err.message });
  }
}
