import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const tab = req.query.tab as string;
  const filter = (req.query.filter as string) || 'all';
  if (!tab) return res.status(400).json({ error: 'Tab is required' });

  const supabase_url = process.env.VITE_SUPABASE_URL;
  const service_role = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabase_url || !service_role) {
    return res.status(500).json({ error: 'Server configuration missing' });
  }

  // Use service role key to bypass RLS for manager access
  const supabase = createClient(supabase_url, service_role);

  try {
    if (tab === 'orders') {
      const { data, error } = await supabase.from('website_orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    } 
    
    if (tab === 'logs') {
      const { data, error } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return res.status(200).json(data || []);
    } 
    
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

    if (tab === 'dashboard') {
      // 1. Calculate Date Range
      let dateFrom = new Date();
      if (filter === 'today') {
        dateFrom.setHours(0, 0, 0, 0);
      } else if (filter === '7days') {
        dateFrom.setDate(dateFrom.getDate() - 7);
      } else if (filter === 'month') {
        dateFrom.setMonth(dateFrom.getMonth() - 1);
      } else {
        dateFrom = new Date(0); // All time
      }

      const isoDateFrom = dateFrom.toISOString();

      // 2. Fetch Stats
      const [ordersRes, studentsRes, totalStudentsRes] = await Promise.all([
        supabase.from('website_orders').select('*').gte('created_at', isoDateFrom),
        supabase.from('profiles').select('id', { count: 'exact' }).gte('created_at', isoDateFrom),
        supabase.from('profiles').select('id', { count: 'exact' })
      ]);

      if (ordersRes.error) throw ordersRes.error;
      const orders = ordersRes.data || [];

      const stats = {
        totalEarnings: orders.filter(o => o.status === 'PAID').reduce((sum, o) => sum + (o.total_amount || 0), 0),
        totalFailures: orders.filter(o => o.status !== 'PAID').length,
        newStudents: studentsRes.count || 0,
        totalStudents: totalStudentsRes.count || 0,
        mostSellingCourses: calculateTopCourses(orders.filter(o => o.status === 'PAID'))
      };

      return res.status(200).json(stats);
    }

    return res.status(400).json({ error: 'Invalid tab' });
  } catch (err: any) {
    console.error(`Manager query catch error:`, err);
    return res.status(500).json({ error: err.message });
  }
}

function calculateTopCourses(orders: any[]) {
  const counts: Record<string, number> = {};
  orders.forEach(o => {
    (o.course_ids || []).forEach((cid: string) => {
      counts[cid] = (counts[cid] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, count]) => ({ id, count }));
}
