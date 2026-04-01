import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const email = req.query.email as string;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const supabase_url = process.env.VITE_SUPABASE_URL;
  const service_role = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabase_url || !service_role) {
    return res.status(500).json({ error: 'Server configuration missing' });
  }

  // Use service role key to bypass RLS
  const supabase = createClient(supabase_url, service_role);

  const { data, error } = await supabase
    .from('website_orders')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get orders error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data || []);
}
