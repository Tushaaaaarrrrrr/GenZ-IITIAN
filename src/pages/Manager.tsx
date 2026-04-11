import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, ShoppingBag, ScrollText, BookOpen, Plus, Search, Trash2, Edit, Save, X, Loader2, AlertCircle, User, Download, TrendingUp, TrendingDown, Users, ShieldCheck, CreditCard, RefreshCw, Gift, ArrowRight, Copy, Coins, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { apiService } from '../lib/api';

type Tab = 'users' | 'courses' | 'discounts' | 'payments' | 'catalog' | 'referrals';

function sanitizeCourseId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function Manager() {
  const { isManager, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active tab from URL path
  const activeTab = (location.pathname.split('/').pop() || 'users') as Tab;
  
  // Validate tab - if path is just /manager, it's users. If invalid, could redirect.
  const validTabs: Tab[] = ['users', 'courses', 'discounts', 'payments', 'referrals'];
  const effectiveTab = validTabs.includes(activeTab) ? activeTab : 'users';
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'today' | 'yesterday' | 'lastweek' | '7days' | 'month' | 'all'>('all');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [isBundle, setIsBundle] = useState(false);
  const [bundleCourses, setBundleCourses] = useState<{courseId: string, courseName: string, price: number}[]>([]);
  const [bundleDiscountPrice, setBundleDiscountPrice] = useState<number | ''>('');
  const [bundleDiscountCode, setBundleDiscountCode] = useState('');
  const [isFixedBundle, setIsFixedBundle] = useState(false);

  // Discount Coupons state
  const [showAddDiscount, setShowAddDiscount] = useState(false);
  const [discountOptions, setDiscountOptions] = useState<any[]>([]); // To hold courses
  const [courseCatalog, setCourseCatalog] = useState<any[]>([]); // New state for full course ID -> Name mapping
  const [catalogSearch, setCatalogSearch] = useState('');
  const [editingDiscount, setEditingDiscount] = useState<any>(null);
  const discountOptionMap = new Map(discountOptions.map(option => [option.id, option]));

  // User Detail View state
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserOrders, setSelectedUserOrders] = useState<any[]>([]);
  const [selectedUserReferrals, setSelectedUserReferrals] = useState<any[]>([]);
  const [selectedUserWallet, setSelectedUserWallet] = useState<any>(null);
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(false);

  useEffect(() => {
    if (editingCourse) {
      setIsBundle(editingCourse.isBundle || false);
      setBundleCourses(editingCourse.bundleCourses || []);
      setBundleDiscountPrice(editingCourse.bundleDiscountPrice || '');
      setBundleDiscountCode(editingCourse.bundleDiscountCode || '');
      setIsFixedBundle(editingCourse.isFixedBundle || false);
    } else {
      setIsBundle(false);
      setBundleCourses([{ courseId: '', courseName: '', price: 0 }]);
      setBundleDiscountPrice('');
      setBundleDiscountCode('');
      setIsFixedBundle(false);
    }
  }, [editingCourse, showAddCourse]);

  const addBundleCourse = () => {
    if (bundleCourses.length >= 6) return;
    setBundleCourses([...bundleCourses, { courseId: '', courseName: '', price: 0 }]);
  };

  const updateBundleCourse = (index: number, key: 'courseId' | 'courseName' | 'price', value: string | number) => {
    const updated = [...bundleCourses];
    (updated[index] as any)[key] = value;
    setBundleCourses(updated);
  };

  const removeBundleCourse = (index: number) => {
    setBundleCourses(bundleCourses.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!authLoading && !isManager) navigate('/');
  }, [isManager, authLoading]);

  useEffect(() => {
    if (isManager) fetchData();
  }, [effectiveTab, isManager, filter, paymentSearch, userSearch]);

  useEffect(() => {
    if ((showAddDiscount || editingDiscount) && discountOptions.length === 0) {
      fetchDiscountOptions();
    }
  }, [showAddDiscount, editingDiscount]);

  const fetchDiscountOptions = async () => {
    try {
      const coursesData = await apiService.managerFetch('courses');
      setDiscountOptions(coursesData || []);
    } catch (err) {
      console.error('Failed to fetch discount options via manager API, falling back to direct Supabase:', err);
      const { data: coursesData, error } = await supabase.from('courses').select('*').order('name');
      if (error) throw error;
      setDiscountOptions(coursesData || []);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Always fetch catalog for mapping (merge denormalized catalog + main courses)
      const [{ data: catalog }, { data: courses }] = await Promise.all([
        supabase.from('course_catalog').select('id, name'),
        supabase.from('courses').select('id, name')
      ]);
      
      const merged = [
        ...(catalog || []),
        ...(courses || [])
      ];
      
      // Remove duplicates by ID (prefer catalog for override names)
      const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
      setCourseCatalog(unique);

      if (effectiveTab === 'discounts') {
        const [discountsData] = await Promise.all([
          apiService.managerFetch('discounts', filter),
          fetchDiscountOptions()
        ]);
        setData(discountsData || []);
      } else if (effectiveTab === 'payments') {
        const [paymentsData] = await Promise.all([
          apiService.managerFetch('payments', filter, paymentSearch),
          fetchDiscountOptions()
        ]);
        setData(paymentsData || []);
      } else {
        const result = await apiService.managerFetch(effectiveTab, filter, effectiveTab === 'users' ? userSearch : paymentSearch);
        setData(result || []);
      }
    } catch (err: any) {
      console.error(`Manager Fetch Error [${activeTab}]:`, err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const exportUsers = () => {
    if (effectiveTab !== 'users' || !Array.isArray(data)) return;
    
    const headers = ['Name', 'Email', 'Phone', 'Gender', 'Joined At'];
    const rows = data.map(u => [
      u.name || '',
      u.email || '',
      u.phone || '',
      u.gender || '',
      u.created_at ? new Date(u.created_at).toLocaleString() : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };
  
  const exportPayments = () => {
    if (effectiveTab !== 'payments' || !Array.isArray(data)) return;
    
    const headers = ['Order ID', 'Email', 'Courses', 'Amount', 'Status', 'Date'];
    const rows = data.map(order => [
      order.order_id || '',
      order.user_email || '',
      Array.isArray(order.course_ids) 
        ? order.course_ids.map(id => courseCatalog.find(c => c.id === id)?.name || id).join('; ') 
        : '',
      order.total_amount || 0,
      order.status || '',
      order.created_at ? new Date(order.created_at).toISOString() : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportReferrals = () => {
    if (effectiveTab !== 'referrals' || !Array.isArray(data)) return;
    
    const headers = ['Order ID', 'Buyer Email', 'Referrer Code', 'Original Price', 'Buyer Discount', 'Final Paid', 'Referrer Reward', 'Date'];
    const rows = data.map((tx: any) => [
      tx.order_id || '',
      tx.buyer_email || '',
      tx.referral_code || '',
      tx.original_price || 0,
      tx.buyer_discount || 0,
      tx.final_price || 0,
      tx.referrer_reward || 0,
      tx.created_at ? new Date(tx.created_at).toISOString() : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `referrals_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const fetchUserDetails = async (user: any) => {
    setSelectedUser(user);
    setIsLoadingUserDetails(true);
    try {
      const email = user.email;
      const [ordersRes, referralsRes, walletRes] = await Promise.all([
        supabase.from('website_orders').select('*').eq('user_email', email).order('created_at', { ascending: false }),
        supabase.from('referral_transactions').select('*').eq('referrer_email', email).order('created_at', { ascending: false }),
        supabase.from('referral_profiles').select('*').eq('email', email).maybeSingle()
      ]);
      
      setSelectedUserOrders(ordersRes.data || []);
      setSelectedUserReferrals(referralsRes.data || []);
      setSelectedUserWallet(walletRes.data || null);
    } catch (err) {
      console.error("Failed to load user details", err);
    } finally {
      setIsLoadingUserDetails(false);
    }
  };

  const exportCatalog = () => {
    if (effectiveTab !== 'catalog' || !Array.isArray(courseCatalog)) return;
    
    const headers = ['Course ID', 'Display Name', 'Last Updated'];
    const rows = courseCatalog.map(c => [
      c.id || '',
      c.name || '',
      c.updated_at ? new Date(c.updated_at).toLocaleString('en-GB') : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `manager_course_catalog_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleCourseAction = async (course: any, isDelete = false) => {
    if (isDelete) {
      if (!confirm('Are you sure you want to delete this course?')) return;
      await supabase.from('courses').delete().eq('id', course.id);
    } else {
      const nextCourseId = course.id || sanitizeCourseId(course.name);
      const previousCourseId = course.previousId || null;

      // Ensure specific fields for existing schema
      const cleanedCourse = {
        id: nextCourseId,
        name: course.name,
        description: course.subtitle, // subtitle maps to description in DB for now
        price: parseInt(course.price as string),
        isPinned: course.isPinned || false,
        learn: [],
        who: '',
        outcomes: '',
        cohortContent: course.cohortContent || null,
        discountPrice: course.discountPrice ? parseInt(course.discountPrice) : null,
        isBundle: course.isBundle || false,
        bundleCourses: course.bundleCourses || [],
        bundleDiscountPrice: course.bundleDiscountPrice || null,
        bundleDiscountCode: course.bundleDiscountCode || null,
        isFixedBundle: course.isFixedBundle || false,
        subject: course.category || null,
        startDate: course.startDate || null,
        endDate: course.endDate || null,
      };

      let error = null;

      if (previousCourseId && previousCourseId !== nextCourseId) {
        const { data: existingCourse } = await supabase
          .from('courses')
          .select('id')
          .eq('id', nextCourseId)
          .maybeSingle();

        if (existingCourse) {
          alert('That database ID is already in use. Please choose a unique one.');
          return;
        }

        const { data: allCourses, error: fetchCoursesError } = await supabase.from('courses').select('*');
        if (fetchCoursesError) {
          alert(fetchCoursesError.message);
          return;
        }

        const coursesToUpdate = (allCourses || [])
          .filter((existing: any) =>
            existing.id !== previousCourseId &&
            existing.bundleCourses?.some((bundleCourse: any) => bundleCourse.courseId === previousCourseId)
          )
          .map((existing: any) => ({
            ...existing,
            bundleCourses: existing.bundleCourses.map((bundleCourse: any) =>
              bundleCourse.courseId === previousCourseId
                ? { ...bundleCourse, courseId: nextCourseId }
                : bundleCourse
            )
          }));

        const { error: insertError } = await supabase.from('courses').insert(cleanedCourse);
        if (insertError) {
          alert(insertError.message);
          return;
        }

        if (coursesToUpdate.length > 0) {
          const { error: referenceUpdateError } = await supabase.from('courses').upsert(coursesToUpdate);
          if (referenceUpdateError) {
            alert(referenceUpdateError.message);
            return;
          }
        }

        const { data: discountsToUpdate, error: fetchDiscountsError } = await supabase
          .from('discount_coupons')
          .select('*')
          .eq('applies_to', previousCourseId);

        if (fetchDiscountsError) {
          alert(fetchDiscountsError.message);
          return;
        }

        if ((discountsToUpdate || []).length > 0) {
          const { error: discountUpdateError } = await supabase.from('discount_coupons').upsert(
            discountsToUpdate.map((discount: any) => ({
              ...discount,
              applies_to: nextCourseId
            }))
          );

          if (discountUpdateError) {
            alert(discountUpdateError.message);
            return;
          }
        }

        const { error: deleteOldError } = await supabase.from('courses').delete().eq('id', previousCourseId);
        error = deleteOldError;
      } else {
        const response = await supabase.from('courses').upsert(cleanedCourse);
        error = response.error;
      }

      if (error) {
        alert(error.message);
      } else {
        // --- SYNC TO COURSE CATALOG ---
        const catalogEntries = [{ id: cleanedCourse.id, name: cleanedCourse.name }];
        if (cleanedCourse.isBundle && Array.isArray(cleanedCourse.bundleCourses)) {
          cleanedCourse.bundleCourses.forEach((bc: any) => {
            if (bc.courseId && bc.courseName) {
              catalogEntries.push({ id: bc.courseId, name: bc.courseName });
            }
          });
        }
        
        const { error: catalogError } = await supabase
          .from('course_catalog')
          .upsert(catalogEntries, { onConflict: 'id' });
          
        if (catalogError) console.error('Failed to sync course catalog:', catalogError);
      }

      setEditingCourse(null);
      setShowAddCourse(false);
    }
    fetchData();
  };

  const handleDiscountAction = async (discount: any, isDelete = false) => {
    if (isDelete) {
      if (!confirm('Are you sure you want to delete this discount code?')) return;
      await supabase.from('discount_coupons').delete().eq('id', discount.id);
    } else {
      const cleanedDiscount = {
        ...(discount.id ? { id: discount.id } : {}),
        code: discount.code.toUpperCase(),
        discount_percentage: discount.discount_percentage ? parseInt(discount.discount_percentage) : null,
        discount_amount: discount.discount_amount ? parseInt(discount.discount_amount) : null,
        applies_to: discount.applies_to || 'ALL'
      };
      const { error } = await supabase.from('discount_coupons').upsert(cleanedDiscount, { onConflict: 'code' });
      if (error) alert(error.message);
      setEditingDiscount(null);
      setShowAddDiscount(false);
    }
    fetchData();
  };

  if (authLoading || !isManager) return <div className="min-h-screen flex items-center justify-center font-black">ACCESS DENIED</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-20 lg:w-64 bg-[#0b1120] text-white p-6 flex flex-col gap-8 h-screen sticky top-0 border-r-4 border-[#0b1120]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center font-black text-xl text-white border-2 border-white shadow-[2px_2px_0px_#fff]">G</div>
          <span className="hidden lg:block font-black text-xl tracking-tight">GenZ Manager</span>
        </div>
        
        <nav className="space-y-4 flex-grow">
          {[
            { id: 'users', icon: User, path: '/manager/users' },
            { id: 'courses', icon: BookOpen, path: '/manager/courses' },
            { id: 'discounts', icon: ShoppingBag, path: '/manager/discounts' },
            { id: 'payments', icon: CreditCard, path: '/manager/payments' },
            { id: 'referrals', icon: Gift, path: '/manager/referrals' }
          ].map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.path}
              end={tab.id === 'dashboard'}
              className={({ isActive }) => `
                w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-black transition-all border-2
                ${isActive ? 'bg-blue-600 border-white text-white shadow-[4px_4px_0px_#fff]' : 'hover:bg-white/5 border-transparent text-gray-400'}
              `}
            >
              <tab.icon className="w-6 h-6" />
              <span className="hidden lg:block capitalize">{tab.id}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-8 lg:p-16 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex justify-between items-end border-b-[6px] border-[#0b1120] pb-8">
            <div>
              <h1 className="text-5xl font-black text-[#0b1120] capitalize mb-2">{effectiveTab}</h1>
              <p className="text-xl text-gray-500 font-bold tracking-tight">Platform administration panel.</p>
            </div>
            <div className="flex gap-4">
              {effectiveTab === 'users' && (
                <button 
                  onClick={exportUsers}
                  className="flex items-center gap-3 px-8 py-4 bg-[#3b82f6] text-white rounded-2xl font-black border-[3px] border-[#0b1120] shadow-[6px_6px_0px_#0b1120] hover:translate-y-1 hover:shadow-none transition-all"
                >
                  <Download className="w-6 h-6" /> Export CSV
                </button>
              )}
              {effectiveTab === 'catalog' && (
                <button 
                  onClick={exportCatalog}
                  className="flex items-center gap-3 px-8 py-4 bg-[#3b82f6] text-white rounded-2xl font-black border-[3px] border-[#0b1120] shadow-[6px_6px_0px_#0b1120] hover:translate-y-1 hover:shadow-none transition-all"
                >
                  <Download className="w-6 h-6" /> Export CSV
                </button>
              )}
              {effectiveTab === 'payments' && (
                <div className="flex gap-4">
                  <button 
                    onClick={fetchData}
                    className="flex items-center gap-3 px-8 py-4 bg-white text-[#0b1120] rounded-2xl font-black border-[3px] border-[#0b1120] shadow-[6px_6px_0px_#0b1120] hover:translate-y-1 hover:shadow-none transition-all"
                    title="Sync with Database"
                  >
                    <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} /> Sync
                  </button>
                  <button 
                    onClick={exportPayments}
                    className="flex items-center gap-3 px-8 py-4 bg-[#3b82f6] text-white rounded-2xl font-black border-[3px] border-[#0b1120] shadow-[6px_6px_0px_#0b1120] hover:translate-y-1 hover:shadow-none transition-all"
                  >
                    <Download className="w-6 h-6" /> Export CSV
                  </button>
                </div>
              )}
              {effectiveTab === 'courses' && (
                <button 
                  onClick={() => setShowAddCourse(true)}
                  className="flex items-center gap-3 px-8 py-4 bg-[#10b981] text-[#0b1120] rounded-2xl font-black border-[3px] border-[#0b1120] shadow-[6px_6px_0px_#0b1120] hover:translate-y-1 hover:shadow-none transition-all"
                >
                  <Plus className="w-6 h-6" /> Create Course
                </button>
              )}
              {effectiveTab === 'discounts' && (
                <button 
                  onClick={() => setShowAddDiscount(true)}
                  className="flex items-center gap-3 px-8 py-4 bg-purple-500 text-white rounded-2xl font-black border-[3px] border-[#0b1120] shadow-[6px_6px_0px_#0b1120] hover:translate-y-1 hover:shadow-none transition-all"
                >
                  <Plus className="w-6 h-6" /> New Coupon
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-24 text-gray-300 animate-pulse font-black text-2xl uppercase tracking-widest">Loading Data...</div>
          ) : (
            <div className="space-y-8">


              {effectiveTab === 'users' && (
                <div className="space-y-8">
                  {/* Search Bar for Users */}
                  <div className="bg-white border-[4px] border-[#0b1120] rounded-[2rem] p-4 flex gap-4 items-center shadow-[6px_6px_0px_#0b1120]">
                    <Search className="w-6 h-6 text-gray-400 shrink-0 ml-2" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or Referral Code..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full font-black outline-none text-lg text-[#0b1120] placeholder:text-gray-300"
                    />
                  </div>

                  <div className="bg-white border-[4px] border-[#0b1120] rounded-[2.5rem] overflow-hidden shadow-[12px_12px_0px_#0b1120]">
                    <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b-[3px] border-gray-100 font-black text-sm uppercase text-gray-400">
                      <tr>
                        <th className="px-8 py-6">Name</th>
                        <th className="px-8 py-6">Email</th>
                        <th className="px-8 py-6">Phone</th>
                        <th className="px-8 py-6">Gender</th>
                        <th className="px-8 py-6">Joined At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-[3px] divide-gray-50 font-bold">
                      {data.map((user: any) => (
                        <tr 
                          key={user.id} 
                          onClick={() => fetchUserDetails(user)}
                          className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="text-lg font-black text-[#0b1120] group-hover:text-blue-600 transition-colors">{user.name || 'N/A'}</div>
                              <ArrowRight className="w-4 h-4 text-transparent group-hover:text-blue-600 transition-colors" />
                            </div>
                          </td>
                          <td className="px-8 py-6 text-gray-500">{user.email}</td>
                          <td className="px-8 py-6 text-gray-500 font-mono">{user.phone || 'N/A'}</td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1 bg-gray-100 border-2 border-[#0b1120] rounded-lg text-[10px] font-black uppercase">
                              {user.gender || 'N/A'}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-gray-400 text-sm">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

              {effectiveTab === 'payments' && (
                <div className="space-y-6">
                  {/* Search and Filters Bar */}
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Search Input */}
                    <div className="flex-grow bg-white border-[4px] border-[#0b1120] rounded-[2rem] p-4 flex gap-4 items-center shadow-[6px_6px_0px_#0b1120]">
                      <Search className="w-6 h-6 text-gray-400 shrink-0 ml-2" />
                      <input
                        type="text"
                        placeholder="Search by email or Order ID..."
                        value={paymentSearch}
                        onChange={(e) => setPaymentSearch(e.target.value)}
                        className="w-full font-black outline-none text-lg text-[#0b1120] placeholder:text-gray-300"
                      />
                    </div>

                    {/* Filter Buttons */}
                    <div className="bg-white border-[4px] border-[#0b1120] rounded-[2rem] p-2 flex gap-2 shadow-[6px_6px_0px_#0b1120] overflow-x-auto whitespace-nowrap">
                      {[
                        { id: 'all', label: 'All Time' },
                        { id: 'today', label: 'Today' },
                        { id: 'yesterday', label: 'Yesterday' },
                        { id: 'lastweek', label: 'Last Week' }
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setFilter(f.id as any)}
                          className={`px-6 py-3 rounded-xl font-black text-sm transition-all ${
                            filter === f.id 
                              ? 'bg-[#0b1120] text-white' 
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payments Table */}
                  <div className="bg-white border-[4px] border-[#0b1120] rounded-[2.5rem] overflow-hidden shadow-[12px_12px_0px_#0b1120]">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b-[3px] border-gray-100 font-black text-sm uppercase text-gray-400">
                        <tr>
                          <th className="px-8 py-6">Order Info</th>
                          <th className="px-8 py-6">Courses</th>
                          <th className="px-8 py-6">Amount</th>
                          <th className="px-8 py-6">Status</th>
                          <th className="px-8 py-6">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-[3px] divide-gray-50 font-bold">
                        {data.map((order: any) => (
                          <tr key={order.order_id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-8 py-6">
                              <div className="text-lg font-black text-[#0b1120]">{order.user_email}</div>
                              <div className="text-xs font-mono text-gray-400">{order.order_id}</div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-wrap gap-2">
                                {Array.isArray(order.course_ids) ? order.course_ids.map((cid: string) => {
                                  const courseInCatalog = courseCatalog.find(c => c.id === cid);
                                  const courseInOptions = discountOptions.find(c => c.id === cid);
                                  return (
                                    <span key={cid} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black border border-blue-100">
                                      {courseInCatalog?.name || courseInOptions?.name || cid}
                                    </span>
                                  );
                                }) : <span className="text-gray-400">No courses</span>}
                              </div>
                            </td>
                            <td className="px-8 py-6 text-xl font-black text-[#10b981]">₹{order.total_amount}</td>
                            <td className="px-8 py-6">
                              <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase border-2 shadow-[2px_2px_0px_currentColor] ${
                                order.status === 'PAID' ? 'bg-green-50 text-green-600 border-green-600' :
                                order.status === 'FAILED' ? 'bg-red-50 text-red-600 border-red-600' :
                                'bg-yellow-50 text-yellow-600 border-yellow-600'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              {order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                            </td>
                          </tr>
                        ))}
                        {data.length === 0 && (
                          <tr><td colSpan={5} className="px-8 py-24 text-center text-gray-300 font-black text-2xl uppercase tracking-widest">No payments found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}








              {effectiveTab === 'courses' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {data.map((course) => (
                    <div key={course.id} className="bg-white border-[4px] border-[#0b1120] rounded-[2.5rem] p-8 shadow-[10px_10px_0px_#0b1120] flex flex-col hover:shadow-[10px_10px_0px_#10b981] transition-all">
                      <div className="w-full aspect-video bg-gray-100 rounded-2xl border-2 border-[#0b1120] mb-6 overflow-hidden">
                        <img src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-2xl font-black text-[#0b1120] mb-2">{course.name}</h3>
                      <div className="text-3xl font-black text-[#10b981] mb-6">
                        {course.discountPrice ? (
                          <><span className="text-sm text-gray-400 line-through mr-2">₹{course.price}</span>₹{course.discountPrice}</>
                        ) : (
                          `₹${course.price}`
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-8">
                        <div className="text-xs font-black uppercase tracking-widest text-gray-400">Database ID (Text)</div>
                        <div className="text-sm font-bold p-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">{course.id}</div>
                      </div>

                      <div className="flex gap-4 mt-auto">
                        <button 
                          onClick={() => setEditingCourse(course)}
                          className="flex-grow py-4 bg-[#0b1120] text-white rounded-2xl font-black border-2 border-[#0b1120] hover:bg-white hover:text-[#0b1120] transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_#0b1120] hover:shadow-none translate-y-[-4px] hover:translate-y-0 active:translate-y-1"
                        >
                          <Edit className="w-5 h-5" /> Edit
                        </button>
                        <button 
                          onClick={() => handleCourseAction(course, true)}
                          className="p-4 text-red-500 bg-red-50 border-2 border-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {effectiveTab === 'discounts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {data.map((discount) => (
                    <div key={discount.id} className="bg-white border-[4px] border-[#0b1120] rounded-[2.5rem] p-8 shadow-[10px_10px_0px_#0b1120] flex flex-col hover:shadow-[10px_10px_0px_#8b5cf6] transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="px-4 py-2 bg-purple-100 text-purple-700 font-black rounded-lg border-2 border-purple-200 tracking-widest uppercase text-xs">
                          COUPON CODE
                        </div>
                        <div className="flex items-center text-xs font-bold text-gray-400 gap-1 uppercase tracking-widest">
                          <Users className="w-4 h-4" /> Used {discount.used_count || 0} times
                        </div>
                      </div>
                      
                      <h3 className="text-4xl font-black text-[#0b1120] mb-2 font-mono uppercase tracking-widest border-b-4 border-gray-100 pb-4 break-all">
                        {discount.code}
                      </h3>
                      
                      <div className="my-6 space-y-4">
                        <div>
                          <div className="text-[10px] font-black uppercase text-gray-400 mb-1">Discount Value</div>
                          {discount.discount_percentage ? (
                            <div className="text-2xl font-black text-purple-600">{discount.discount_percentage}% OFF</div>
                          ) : discount.discount_amount ? (
                            <div className="text-2xl font-black text-purple-600">₹{discount.discount_amount} OFF</div>
                          ) : (
                            <div className="text-xl font-black text-gray-400">Invalid Config</div>
                          )}
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase text-gray-400 mb-1">Applies To</div>
                          <div className="text-sm font-bold text-[#0b1120] bg-gray-50 border-2 border-dashed border-gray-200 p-2 rounded-lg truncate">
                            {discount.applies_to === 'ALL'
                              ? 'Everything (Global)'
                              : `${(discountOptionMap.get(discount.applies_to) as any)?.name || discount.applies_to} ${(discountOptionMap.get(discount.applies_to) as any)?.isBundle ? '[Bundle]' : '[Course]'} (${discount.applies_to})`}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-auto border-t-4 border-gray-50 pt-6">
                        <button 
                          onClick={() => setEditingDiscount(discount)}
                          className="flex-grow py-4 bg-[#0b1120] text-white rounded-2xl font-black border-2 border-[#0b1120] hover:bg-white hover:text-[#0b1120] transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_#0b1120] hover:shadow-none translate-y-[-4px] hover:translate-y-0 active:translate-y-1"
                        >
                          <Edit className="w-5 h-5" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDiscountAction(discount, true)}
                          className="p-4 text-red-500 bg-red-50 border-2 border-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {effectiveTab === 'referrals' && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <button onClick={exportReferrals} className="flex items-center gap-2 px-6 py-3 bg-[#0b1120] text-white rounded-xl font-black text-sm hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_#0b1120]">
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                  </div>
                  <div className="bg-white border-[4px] border-[#0b1120] rounded-[2.5rem] overflow-hidden shadow-[12px_12px_0px_#0b1120]">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b-[3px] border-gray-100 font-black text-sm uppercase text-gray-400">
                        <tr>
                          <th className="px-6 py-6">Buyer</th>
                          <th className="px-6 py-6">Referrer Code</th>
                          <th className="px-6 py-6">Original</th>
                          <th className="px-6 py-6">Discount</th>
                          <th className="px-6 py-6">Final Paid</th>
                          <th className="px-6 py-6">Reward</th>
                          <th className="px-6 py-6">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-[3px] divide-gray-50 font-bold">
                        {data.map((tx: any) => (
                          <tr key={tx.id} className="hover:bg-purple-50/50 transition-colors">
                            <td className="px-6 py-5">
                              <div className="text-sm font-black text-[#0b1120]">{tx.buyer_email}</div>
                              <div className="text-[10px] text-gray-400 font-mono">{tx.order_id}</div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-black border border-purple-200 tracking-widest">
                                {tx.referral_code}
                              </span>
                            </td>
                            <td className="px-6 py-5 font-black text-gray-500">₹{tx.original_price}</td>
                            <td className="px-6 py-5 font-black text-green-600">-₹{tx.buyer_discount}</td>
                            <td className="px-6 py-5 text-lg font-black text-[#0b1120]">₹{tx.final_price}</td>
                            <td className="px-6 py-5">
                              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm font-black border border-amber-200">
                                +{tx.referrer_reward} Coins
                              </span>
                            </td>
                            <td className="px-6 py-5 text-sm text-gray-400">
                              {tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                            </td>
                          </tr>
                        ))}
                        {data.length === 0 && (
                          <tr><td colSpan={7} className="px-8 py-24 text-center text-gray-300 font-black text-2xl uppercase tracking-widest">No referral transactions yet</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Course Modal */}
      <AnimatePresence>
        {(showAddCourse || editingCourse) && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 lg:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowAddCourse(false); setEditingCourse(null); }} className="absolute inset-0 bg-[#0b1120]/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              className="relative bg-white border-[6px] border-[#0b1120] rounded-[3.5rem] p-10 lg:p-16 w-full max-w-4xl shadow-[20px_20px_0px_#0b1120] overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-5xl font-black text-[#0b1120] mb-12 flex items-center gap-4">
                {editingCourse ? 'Update Course' : 'Create Course'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">Course Name</label>
                    <input 
                      type="text" 
                      defaultValue={editingCourse?.name} 
                      id="c-name" 
                      onChange={(e) => {
                        if (!editingCourse) {
                          const idInput = document.getElementById('c-id') as HTMLInputElement;
                          if (idInput) {
                            idInput.value = e.target.value
                              .toLowerCase()
                              .trim()
                              .replace(/[^\w\s-]/g, '')
                              .replace(/[\s_-]+/g, '-')
                              .replace(/^-+|-+$/g, '');
                          }
                        }
                      }}
                      className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-blue-100 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-[#0b1120] uppercase mb-1">Subtitle / Brief Description</label>
                    <textarea defaultValue={editingCourse?.description} id="c-subtitle" className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-blue-100 outline-none h-32" />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">What You Get in the Cohort</label>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-2">This content appears under the "What You Get in the Cohort" section on the course page. Use line breaks for separate points.</p>
                    <textarea defaultValue={editingCourse?.cohortContent || ''} id="c-cohort" placeholder="e.g.&#10;✅ Live doubt-solving sessions every week&#10;✅ Structured notes + PYQs&#10;✅ Mock tests before every quiz&#10;..." className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-blue-100 outline-none h-48 leading-relaxed" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">Display Price / Starts From (₹)</label>
                      <input type="number" defaultValue={editingCourse?.price} id="c-price" className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-blue-100 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">Discount Display Price (₹)</label>
                      <input type="number" defaultValue={editingCourse?.discountPrice} id="c-discount" placeholder="Optional" className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-blue-100 outline-none" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">Category</label>
                      <input type="text" defaultValue={editingCourse?.subject} id="c-category" placeholder="e.g. Data Science" className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-blue-100 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">Pinned?</label>
                      <select id="c-pinned" defaultValue={editingCourse?.isPinned ? 'true' : 'false'} className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-black focus:ring-[6px] ring-blue-100 outline-none bg-white">
                        <option value="false">Regular</option>
                        <option value="true">Pinned</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">Start Date</label>
                      <input type="datetime-local" defaultValue={editingCourse?.startDate ? new Date(editingCourse.startDate).toISOString().slice(0, 16) : ''} id="c-start" className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-blue-100 outline-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">End Date</label>
                      <input type="datetime-local" defaultValue={editingCourse?.endDate ? new Date(editingCourse.endDate).toISOString().slice(0, 16) : ''} id="c-end" className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-blue-100 outline-none bg-white" />
                    </div>
                  </div>

                  {isBundle && (
                    <div className="p-6 bg-green-50 border-[3px] border-[#10b981] rounded-2xl space-y-4 mt-6">
                      <h4 className="text-sm font-black text-[#0b1120] uppercase flex items-center gap-2">
                        🎁 Bundle Discount Settings
                      </h4>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                        This discount applies only when a student selects ALL courses and enters the code.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-[#10b981] uppercase tracking-widest pl-1">Bundle Discount Price (₹)</label>
                          <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">₹</span>
                            <input
                              type="number"
                              value={bundleDiscountPrice}
                              onChange={e => setBundleDiscountPrice(e.target.value ? parseInt(e.target.value) : '')}
                              placeholder="e.g. 799"
                              className="w-full pl-12 pr-6 py-4 border-2 border-green-200 rounded-2xl font-black text-xl outline-none focus:border-[#10b981] transition-all bg-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-[#10b981] uppercase tracking-widest pl-1">Discount Code</label>
                          <input
                            type="text"
                            value={bundleDiscountCode}
                            onChange={e => setBundleDiscountCode(e.target.value.toUpperCase())}
                            placeholder="e.g. TERM1SAVE"
                            className="w-full px-6 py-4 border-2 border-green-200 rounded-2xl font-black text-lg outline-none focus:border-[#10b981] transition-all bg-white uppercase"
                          />
                        </div>
                      </div>
                      {bundleDiscountPrice && bundleCourses.length > 0 && (
                        <div className="p-3 bg-white border-2 border-green-200 rounded-xl text-xs font-bold text-gray-600">
                          Individual total: ₹{bundleCourses.reduce((s, bc) => s + (bc.price || 0), 0)} → Bundle price: <span className="text-[#10b981] font-black">₹{bundleDiscountPrice}</span> (Save ₹{bundleCourses.reduce((s, bc) => s + (bc.price || 0), 0) - Number(bundleDiscountPrice)})
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">URL ID (Unique Text)</label>
                    <input
                      type="text"
                      defaultValue={editingCourse?.id}
                      placeholder="python-basics"
                      id="c-id"
                      className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-blue-100 outline-none bg-blue-50"
                    />
                  </div>

                  <div className="p-6 bg-blue-50/50 border-[3px] border-[#0b1120] rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <label className="block text-sm font-black text-[#0b1120] uppercase">Enable Bundle System</label>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Toggle to add multiple sub-courses</span>
                      </div>
                      <button type="button" onClick={() => setIsBundle(!isBundle)} className={`w-14 h-8 rounded-full border-2 border-[#0b1120] flex items-center p-1 transition-colors ${isBundle ? 'bg-[#10b981]' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full border-2 border-[#0b1120] transition-transform ${isBundle ? 'translate-x-6' : ''}`} />
                      </button>
                    </div>

                    {isBundle && (
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                          <label className="block text-sm font-black text-[#0b1120] uppercase">Fixed Bundle?</label>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Students cannot unselect courses</span>
                        </div>
                        <button type="button" onClick={() => setIsFixedBundle(!isFixedBundle)} className={`w-14 h-8 rounded-full border-2 border-[#0b1120] flex items-center p-1 transition-colors ${isFixedBundle ? 'bg-[#3b82f6]' : 'bg-gray-300'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full border-2 border-[#0b1120] transition-transform ${isFixedBundle ? 'translate-x-6' : ''}`} />
                        </button>
                      </div>
                    )}

                    <div className="pt-4 border-t-2 border-[#0b1120]/10 space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                          {isBundle ? `Included Courses (${bundleCourses.length}/6)` : 'Main Enrollment ID'}
                        </span>
                        {isBundle && bundleCourses.length < 6 && (
                          <button type="button" onClick={addBundleCourse} className="text-xs font-black bg-[#0b1120] text-white px-3 py-1 rounded-lg hover:bg-gray-800">
                            + ADD COURSE
                          </button>
                        )}
                      </div>
                      {bundleCourses.map((bc, idx) => (
                        <div key={idx} className="p-8 bg-white border-[3px] border-[#0b1120] rounded-[2.5rem] shadow-[8px_8px_0px_#0b1120] space-y-6 mb-6">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-blue-600 uppercase tracking-widest pl-1">Course ID</label>
                            <input 
                              value={bc.courseId} 
                              onChange={e => updateBundleCourse(idx, 'courseId', e.target.value)} 
                              placeholder="e.g. PYTHON-CORE-101" 
                              className="w-full px-6 py-4 bg-blue-50/50 border-2 border-blue-200 rounded-2xl font-bold text-lg outline-none focus:border-blue-400 focus:bg-white transition-all uppercase" 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Course Title</label>
                            <input 
                              value={bc.courseName} 
                              onChange={e => updateBundleCourse(idx, 'courseName', e.target.value)} 
                              placeholder="Enter the full display name..." 
                              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl font-bold text-lg outline-none focus:border-[#0b1120] transition-all" 
                            />
                          </div>

                          <div className="space-y-6 pt-2">
                            <div className="space-y-2">
                              <label className="text-xs font-black text-[#10b981] uppercase tracking-widest pl-1">Price (₹)</label>
                              <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">₹</span>
                                <input 
                                  type="number" 
                                  value={bc.price} 
                                  onChange={e => updateBundleCourse(idx, 'price', parseInt(e.target.value) || 0)} 
                                  className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 rounded-2xl font-black text-xl outline-none focus:border-[#10b981] transition-all" 
                                />
                              </div>
                            </div>

                            {isBundle && (
                              <button 
                                type="button" 
                                onClick={() => removeBundleCourse(idx)} 
                                className="w-full py-4 text-red-500 bg-red-50 border-2 border-red-100 rounded-2xl font-black hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center justify-center gap-3"
                              >
                                <Trash2 className="w-5 h-5" /> Remove Course
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>


                  </div>
                </div>
              </div>

              <div className="flex gap-6 mt-16">
                <button 
                  onClick={() => {
                    const rawId = (document.getElementById('c-id') as HTMLInputElement)?.value || editingCourse?.id;
                    const id = sanitizeCourseId(rawId);
                    const name = (document.getElementById('c-name') as HTMLInputElement).value;
                    const subtitle = (document.getElementById('c-subtitle') as HTMLTextAreaElement).value;
                    const cohortContent = (document.getElementById('c-cohort') as HTMLTextAreaElement).value;
                    const price = (document.getElementById('c-price') as HTMLInputElement).value;
                    const discountPrice = (document.getElementById('c-discount') as HTMLInputElement).value;
                    const isPinned = (document.getElementById('c-pinned') as HTMLSelectElement).value === 'true';
                    const category = (document.getElementById('c-category') as HTMLInputElement).value;
                    const startDate = (document.getElementById('c-start') as HTMLInputElement).value;
                    const endDate = (document.getElementById('c-end') as HTMLInputElement).value;

                    if (!id) {
                      alert('Please enter a valid database ID.');
                      return;
                    }
                    if (bundleCourses.length === 0 || bundleCourses.some(bc => !bc.courseId || !bc.courseName)) {
                      alert('Please fill course ID and name for at least one entry!');
                      return;
                    }
                    if (discountPrice && parseInt(discountPrice) >= parseInt(price)) {
                      alert('Discount price must be less than the original price!');
                      return;
                    }

                    handleCourseAction({ 
                      id, previousId: editingCourse?.id, name, price, isPinned, subtitle,
                      cohortContent,
                      category,
                      discountPrice: discountPrice || null,
                      isBundle,
                      bundleCourses,
                      bundleDiscountPrice: isBundle && bundleDiscountPrice ? Number(bundleDiscountPrice) : null,
                      bundleDiscountCode: isBundle && bundleDiscountCode ? bundleDiscountCode : null,
                      isFixedBundle: isBundle && isFixedBundle,
                      startDate: startDate ? new Date(startDate).toISOString() : null,
                      endDate: endDate ? new Date(endDate).toISOString() : null,
                    });
                  }}
                  className="flex-grow py-5 bg-[#10b981] text-[#0b1120] rounded-2xl font-black text-xl border-[4px] border-[#0b1120] flex items-center justify-center gap-3 shadow-[8px_8px_0px_#0b1120] active:translate-y-1 active:shadow-none"
                >
                  <Save className="w-6 h-6" /> Confirm Changes
                </button>
                <button onClick={() => { setShowAddCourse(false); setEditingCourse(null); }} className="px-10 py-5 bg-white text-[#0b1120] rounded-2xl font-black border-[4px] border-[#0b1120] hover:bg-gray-50 flex items-center justify-center">
                  Abort
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Discount Modal */}
      <AnimatePresence>
        {(showAddDiscount || editingDiscount) && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 lg:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowAddDiscount(false); setEditingDiscount(null); }} className="absolute inset-0 bg-[#0b1120]/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              className="relative bg-white border-[6px] border-[#0b1120] rounded-[3.5rem] p-10 lg:p-16 w-full max-w-2xl shadow-[20px_20px_0px_#0b1120]"
            >
              <h2 className="text-4xl font-black text-[#0b1120] mb-8 flex items-center gap-4">
                {editingDiscount ? 'Update Coupon' : 'Create Coupon'}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">Coupon Code*</label>
                  <input type="text" defaultValue={editingDiscount?.code} id="d-code" placeholder="e.g. WELCOME100" className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-black text-xl uppercase focus:ring-[6px] ring-purple-100 outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">Discount (%)</label>
                    <input type="number" defaultValue={editingDiscount?.discount_percentage} id="d-percent" placeholder="e.g. 10" className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-purple-100 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">OR Amount (₹)</label>
                    <input type="number" defaultValue={editingDiscount?.discount_amount} id="d-amount" placeholder="e.g. 500" className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-purple-100 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-[#0b1120] uppercase mb-3 text-gray-500 text-xs">⚠️ Leave ONE of the above blank. If both are filled, Percentage might take priority depending on backend logic.</label>
                </div>

                <div>
                  <label className="block text-sm font-black text-[#0b1120] uppercase mb-3">Applies To:</label>
                  <select id="d-applies" defaultValue={editingDiscount?.applies_to || 'ALL'} className="w-full px-6 py-4 border-[3px] border-[#0b1120] rounded-2xl font-bold focus:ring-[6px] ring-purple-100 outline-none bg-white">
                    <option value="ALL">ALL COURSES (Global Discount)</option>
                    {discountOptions.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.isBundle ? '[Bundle]' : '[Course]'} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-6 mt-12">
                <button 
                  onClick={() => {
                    const code = (document.getElementById('d-code') as HTMLInputElement).value;
                    const discount_percentage = (document.getElementById('d-percent') as HTMLInputElement).value;
                    const discount_amount = (document.getElementById('d-amount') as HTMLInputElement).value;
                    const applies_to = (document.getElementById('d-applies') as HTMLSelectElement).value;

                    if (!code) {
                      alert('Please enter a coupon code.');
                      return;
                    }
                    if (!discount_percentage && !discount_amount) {
                      alert('Please specify either a percentage or an amount.');
                      return;
                    }

                    handleDiscountAction({ 
                      id: editingDiscount?.id,
                      code,
                      discount_percentage,
                      discount_amount,
                      applies_to
                    });
                  }}
                  className="flex-grow py-5 bg-purple-500 text-white rounded-2xl font-black text-xl border-[4px] border-[#0b1120] flex items-center justify-center gap-3 shadow-[8px_8px_0px_#0b1120] active:translate-y-1 active:shadow-none hover:bg-purple-600 transition-colors"
                >
                  <Save className="w-6 h-6" /> Confirm Changes
                </button>
                <button onClick={() => { setShowAddDiscount(false); setEditingDiscount(null); }} className="px-10 py-5 bg-white text-[#0b1120] rounded-2xl font-black border-[4px] border-[#0b1120] hover:bg-gray-50 flex items-center justify-center">
                  Abort
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USER DETAILS MODAL */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border-[4px] border-[#0b1120] rounded-[2.5rem] p-6 lg:p-10 w-full max-w-5xl shadow-[16px_16px_0px_#0b1120] my-auto"
            >
              <div className="flex justify-between items-start border-b-[3px] border-gray-100 pb-6 mb-8">
                <div>
                  <h3 className="text-3xl font-black text-[#0b1120] flex items-center gap-3">
                    <User className="w-8 h-8 text-blue-500" />
                    {selectedUser.name || 'Anonymous User'}
                  </h3>
                  <p className="text-gray-500 font-bold mt-2 flex items-center gap-4">
                    <span>{selectedUser.email}</span>
                    {selectedUser.phone && <span>• {selectedUser.phone}</span>}
                    {selectedUser.created_at && (
                      <span className="text-gray-4" style={{ opacity: 0.7 }}>
                         • Joined: {new Date(selectedUser.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
                <button onClick={() => setSelectedUser(null)} className="w-12 h-12 rounded-full border-[3px] border-[#0b1120] flex items-center justify-center hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_#0b1120]">
                  <X className="w-6 h-6 text-[#0b1120]" />
                </button>
              </div>

              {isLoadingUserDetails ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-300 gap-4">
                  <Loader2 className="w-12 h-12 animate-spin" />
                  <span className="font-black text-xl uppercase tracking-widest">Loading User Data...</span>
                </div>
              ) : (
                <div className="space-y-8">
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-blue-50 rounded-[2rem] border-[3px] border-blue-200">
                      <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Total Orders</div>
                      <div className="text-4xl font-black text-blue-600">{selectedUserOrders.length}</div>
                      <div className="mt-2 text-sm font-bold text-blue-800">
                        Total Spent: ₹{selectedUserOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)}
                      </div>
                    </div>

                    <div className="p-6 bg-purple-50 rounded-[2rem] border-[3px] border-purple-200">
                      <div className="text-xs font-black text-purple-400 uppercase tracking-widest mb-2">Referrals Made</div>
                      <div className="text-4xl font-black text-purple-600">{selectedUserReferrals.length}</div>
                      {selectedUserWallet && (
                        <div className="mt-2 text-sm font-bold text-purple-800 font-mono">
                          Code: {selectedUserWallet.referral_code}
                        </div>
                      )}
                    </div>

                    <div className="p-6 bg-amber-50 rounded-[2rem] border-[3px] border-amber-200">
                      <div className="text-xs font-black text-amber-400 uppercase tracking-widest mb-2">Coin Wallet</div>
                      <div className="text-4xl font-black text-amber-600 flex items-center gap-2">
                        {selectedUserWallet?.wallet_balance || 0} <Coins className="w-6 h-6 text-amber-500" />
                      </div>
                      <div className="mt-2 text-sm font-bold text-amber-800">
                        Total Earned: {selectedUserReferrals.reduce((sum, r) => sum + (r.referrer_reward || 0), 0)}
                      </div>
                    </div>
                  </div>

                  {/* Tables Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Orders */}
                    <div className="space-y-4">
                      <h4 className="font-black text-xl flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-gray-400" /> Order History
                      </h4>
                      <div className="bg-white border-[3px] border-gray-200 rounded-3xl overflow-hidden">
                        <div className="max-h-80 overflow-y-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 sticky top-0 font-black text-xs uppercase text-gray-400">
                              <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Courses</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-gray-100 font-bold">
                              {selectedUserOrders.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-400">No orders found.</td></tr>
                              ) : (
                                selectedUserOrders.map(order => (
                                  <tr key={order.order_id}>
                                    <td className="p-4 text-gray-500 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="p-4">
                                      <div className="flex flex-wrap gap-1">
                                        {Array.isArray(order.course_ids) ? order.course_ids.map((cid: string) => {
                                          const course = courseCatalog.find(c => c.id === cid);
                                          return (
                                            <span key={cid} className="px-2 py-0.5 bg-gray-50 text-[10px] font-black text-gray-500 border border-gray-100 rounded">
                                              {course?.name || cid}
                                            </span>
                                          );
                                        }) : <span className="text-gray-400">-</span>}
                                      </div>
                                    </td>
                                    <td className="p-4 font-black">₹{order.total_amount}</td>
                                    <td className="p-4">
                                      <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-black ${order.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {order.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Referrals */}
                    <div className="space-y-4">
                      <h4 className="font-black text-xl flex items-center gap-2">
                        <Gift className="w-5 h-5 text-purple-400" /> Referral Activity
                      </h4>
                      <div className="bg-white border-[3px] border-purple-200 rounded-3xl overflow-hidden">
                        <div className="max-h-80 overflow-y-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-purple-50 sticky top-0 font-black text-xs uppercase text-purple-400">
                              <tr>
                                <th className="p-4">Referred User</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Reward</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-purple-50 font-bold">
                              {selectedUserReferrals.length === 0 ? (
                                <tr><td colSpan={3} className="p-8 text-center text-purple-300">No referrals yet.</td></tr>
                              ) : (
                                selectedUserReferrals.map(ref => (
                                  <tr key={ref.id}>
                                    <td className="p-4 text-gray-600 truncate max-w-[150px]" title={ref.buyer_email}>
                                      {ref.buyer_email}
                                    </td>
                                    <td className="p-4 text-gray-500">{new Date(ref.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 font-black text-amber-500">+{ref.referrer_reward}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
