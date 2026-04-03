import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const tab = req.query.tab as string;
  const filter = (req.query.filter as string) || 'all';
  if (!tab) return res.status(400).json({ error: 'Tab is required' });

  const supabase_url = process.env.VITE_SUPABASE_URL;
  const service_role = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabase_url || !service_role) {
    return res.status(500).json({ error: 'Server configuration missing' });
  }

  // --- AUTH CHECK: Verify caller is a manager ---
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

  // Check manager role from DB
  const supabase = createClient(supabase_url, service_role);
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'MANAGER') {
    return res.status(403).json({ error: 'Forbidden: Manager access required' });
  }
  // --- END AUTH CHECK ---

  try {
    
    if (tab === 'courses') {
      const { data, error } = await supabase.from('courses').select('*').order('name');
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (tab === 'users') {
      const { data, error } = await supabase.from('profiles').select('*').order('name');
      if (error) throw error;
      return res.status(200).json(data || []);
    }





    return res.status(400).json({ error: 'Invalid tab' });
  } catch (err: any) {
    console.error(`Manager query catch error:`, err);
    return res.status(500).json({ error: err.message });
  }
}


