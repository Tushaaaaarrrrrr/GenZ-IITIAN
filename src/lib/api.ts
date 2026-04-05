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
  managerFetch: async (tab: string, filter: string = 'all') => {
    if (!isProduction) {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/manager-fetch?tab=${tab}&filter=${filter}`, {
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
          const { data, error } = await supabase.from('courses').select('*').order('name');
          if (error) throw error;
          return data || [];
        }

        if (tab === 'users') {
          const { data, error } = await supabase.from('profiles').select('*').order('name');
          if (error) throw error;
          return data || [];
        }

        if (tab === 'discounts') {
          const { data, error } = await supabase.from('discount_coupons').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          return data || [];
        }

        if (tab === 'payments') {
          const { data, error } = await supabase.from('website_orders').select('*').order('createdAt', { ascending: false });
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
        .order('createdAt', { ascending: false })
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
        .order('createdAt', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  },

  // 4. Create Razorpay Order
  createOrder: async (payload: { amount: number, email: string, courseIds: string[], discountCode?: string, bundleId?: string }) => {
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
  }
};
