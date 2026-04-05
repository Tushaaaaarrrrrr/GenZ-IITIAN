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
    
    const search = (req.query.search as string) || '';

    if (tab === 'courses') {
      let query = supabase.from('courses').select('*').order('name');
      if (search) {
        query = query.or(`name.ilike.%${search}%,id.ilike.%${search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (tab === 'users') {
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (tab === 'discounts') {
      let query = supabase.from('discount_coupons').select('*').order('created_at', { ascending: false });
      if (search) {
        query = query.ilike('code', `%${search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (tab === 'payments') {
      let query = supabase.from('website_orders').select('*').order('created_at', { ascending: false });
      
      if (search) {
        query = query.or(`user_email.ilike.%${search}%,order_id.ilike.%${search}%`);
      }

      if (filter !== 'all') {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (filter === 'today') {
          query = query.gte('created_at', startOfToday.toISOString());
        } else if (filter === 'yesterday') {
          const startOfYesterday = new Date(startOfToday);
          startOfYesterday.setDate(startOfYesterday.getDate() - 1);
          query = query.gte('created_at', startOfYesterday.toISOString()).lt('created_at', startOfToday.toISOString());
        } else if (filter === 'lastweek') {
          const sevenDaysAgo = new Date(startOfToday);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          query = query.gte('created_at', sevenDaysAgo.toISOString());
        } else if (filter === 'month') {
          const thirtyDaysAgo = new Date(startOfToday);
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          query = query.gte('created_at', thirtyDaysAgo.toISOString());
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    }





    return res.status(400).json({ error: 'Invalid tab' });
  } catch (err: any) {
    console.error(`Manager query catch error:`, err);
    return res.status(500).json({ error: err.message });
  }
}

