import { supabase } from './supabase';

const isProduction = import.meta.env.VITE_APP_ENV === 'production' || 
                    (!window.location.hostname.includes('vercel.app') && 
                     window.location.hostname !== 'localhost');

// Helper: get auth headers for API calls
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { 'Authorization': `Bearer ${session.access_token}` };
  }
  return {};
};

const readJsonResponse = async (res: Response) => {
  const contentType = res.headers.get('content-type') || '';
  const rawText = await res.text();

  if (contentType.includes('application/json')) {
    return rawText ? JSON.parse(rawText) : {};
  }

  throw new Error(`API returned ${contentType || 'non-JSON'} instead of JSON`);
};

export const apiService = {
  // 1. Manager Dashboard Data
  managerFetch: async (tab: string, filter: string = 'all', search: string = '') => {
    if (!isProduction) {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/manager-fetch?tab=${tab}&filter=${filter}&search=${encodeURIComponent(search)}`, {
        headers: { ...authHeaders },
      });
      if (!res.ok) {
        const errorData = await readJsonResponse(res);
        throw new Error(errorData.error || 'Failed to fetch manager data');
      }
      return readJsonResponse(res);
    } else {
      // Direct Supabase Mode (Hostinger/Production)
      try {
        if (tab === 'courses') {
          let query = supabase.from('courses').select('*').order('name');
          if (search) {
            query = query.or(`name.ilike.%${search}%,id.ilike.%${search}%`);
          }
          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        }

        if (tab === 'users') {
          let emailsFromCode: string[] = [];
          if (search) {
            const { data: refMatches } = await supabase.from('referral_profiles').select('email').ilike('referral_code', `%${search}%`);
            if (refMatches && refMatches.length > 0) {
              emailsFromCode = refMatches.map((r: any) => r.email);
            }
          }

          let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
          if (search) {
            if (emailsFromCode.length > 0) {
              const emailsStr = emailsFromCode.map(e => `"${e}"`).join(',');
              query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,email.in.(${emailsStr})`);
            } else {
              query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
            }
          }
          const { data, error } = await query;
          if (error) throw error;
          
          let result = data || [];
          if (filter === 'no-number') {
            result = result.filter(u => !u.phone || u.phone.trim() === '');
          }
          return result;
        }

        if (tab === 'discounts') {
          let query = supabase.from('discount_coupons').select('*').order('created_at', { ascending: false });
          if (search) {
            query = query.ilike('code', `%${search}%`);
          }
          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        }

        if (tab === 'payments') {
          if (filter === 'not-purchased') {
            // Fetch all profiles
            let profileQuery = supabase.from('profiles').select('*').order('created_at', { ascending: false });
            if (search) {
              profileQuery = profileQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
            }
            const { data: profiles, error: pError } = await profileQuery;
            if (pError) throw pError;

            // Fetch all emails that have at least one PAID order
            const { data: paidOrders, error: oError } = await supabase
              .from('website_orders')
              .select('user_email')
              .eq('status', 'PAID');
            if (oError) throw oError;

            const paidEmails = new Set(paidOrders?.map(o => o.user_email?.toLowerCase()) || []);

            // Filter users who haven't paid for any course
            const leads = profiles?.filter(p => !paidEmails.has(p.email?.toLowerCase())) || [];

            // Map to "order" format so the UI remains consistent
            return leads.map(p => ({
              order_id: `LEAD_${p.id.toString().slice(0, 8)}`,
              user_email: p.email,
              course_ids: [],
              total_amount: 0,
              status: 'NOT_PURCHASED',
              created_at: p.created_at
            }));
          }

          let query = supabase.from('website_orders').select('*').order('created_at', { ascending: false });
          
          if (search) {
            query = query.or(`user_email.ilike.%${search}%,order_id.ilike.%${search}%`);
          }

          if (filter !== 'all') {
            if (filter === 'abandoned') {
              query = query.eq('status', 'CREATED');
            } else {
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
          }

          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        }
        
        if (tab === 'referrals') {
          let query = supabase.from('referral_transactions').select('*').order('created_at', { ascending: false });
          if (search) {
            query = query.or(`buyer_email.ilike.%${search}%,referrer_email.ilike.%${search}%,referral_code.ilike.%${search}%`);
          }
          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        }

        throw new Error('Invalid tab for managerFetch');

      } catch (err: any) {
        console.error('Direct Supabase Fetch Error:', err.message);
        throw err;
      }
    }
  },

  getLastOrder: async (email: string) => {
    if (!isProduction) {
      // Dev mode fallback
      return null;
    } else {
      const { data, error } = await supabase
        .from('website_orders')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
  },

  // 3. Get User Orders
  getOrders: async (email: string) => {
    if (!isProduction) {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/get-orders?email=${email}`, {
        headers: { ...authHeaders },
      });
      if (!res.ok) {
        const errorData = await readJsonResponse(res);
        throw new Error(errorData.error || 'Failed to fetch orders');
      }
      return readJsonResponse(res);
    } else {
      // Direct Supabase Mode
      const { data, error } = await supabase
        .from('website_orders')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  },

  // 4. Create Razorpay Order
  createOrder: async (payload: { amount: number, email: string, courseIds: string[], discountCode?: string, bundleId?: string, referralCode?: string, coinsToApply?: number, selectedClassType?: string }) => {
    if (!isProduction) {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await readJsonResponse(res);
      if (!res.ok) throw new Error(data.error || 'Order creation failed');
      return data;
    } else {
      // Razorpay order creation REQUIRE a backend secret.
      // On Hostinger (Production), you MUST use a Supabase Edge Function or your standalone server.
      // We will try to call a production endpoint if configured, otherwise fallback to an error.
      const PROD_API_URL = import.meta.env.VITE_PROD_API_URL || '/api/create-order';
      
      const res = await fetch(PROD_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await readJsonResponse(res);
      if (!res.ok) throw new Error(data.error || 'Order creation failed (Production)');
      return data;
    }
  },

  // 5. Verify Payment
  verifyPayment: async (payload: any) => {
    if (!isProduction) {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await readJsonResponse(res);
        throw new Error(errorData.error || 'Payment verification failed');
      }
      return readJsonResponse(res);
    } else {
      // Payment verification REQUIRE a backend secret.
      const PROD_VERIFY_URL = import.meta.env.VITE_PROD_VERIFY_URL || '/api/verify-payment';
      
      const res = await fetch(PROD_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await readJsonResponse(res);
        throw new Error(errorData.error || 'Payment verification failed (Production)');
      }
      return readJsonResponse(res);
    }
  },
  
  // 6. Log Payment Failure
  logPaymentFailure: async (payload: { email: string, order_id: string, failure_source: string, courseIds: string[] }) => {
    try {
      const PROD_API_URL = import.meta.env.VITE_PROD_API_URL || '/api/create-order';
      const LOG_FAILURE_URL = PROD_API_URL.replace('create-order', 'log-payment-failure');
      
      await fetch(LOG_FAILURE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Failed to log payment failure:', err);
    }
  }
};
