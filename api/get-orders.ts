import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const email = req.query.email as string;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const supabase_url = process.env.VITE_SUPABASE_URL;
  const service_role = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabase_url || !service_role) {
    return res.status(500).json({ error: 'Server configuration missing' });
  }

  // --- AUTH CHECK: Verify caller owns these orders ---
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing auth token' });
  }

  const token = authHeader.slice(7);
  const supabaseAuth = createClient(supabase_url, process.env.VITE_SUPABASE_ANON_KEY || '');
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  // Users can only query their own orders
  if (user.email !== email) {
    return res.status(403).json({ error: 'Forbidden: You can only view your own orders' });
  }
  // --- END AUTH CHECK ---

  const supabase = createClient(supabase_url, service_role);

  const { data, error } = await supabase
    .from('website_orders')
    .select('*')
    .eq('user_email', email)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Get orders error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data || []);
}

