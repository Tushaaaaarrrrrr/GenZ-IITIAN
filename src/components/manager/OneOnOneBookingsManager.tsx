import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MessageCircle, 
  Loader2, 
  Eye,
  CalendarClock,
  Ghost,
  Ban,
  Copy,
  Check,
  Shield,
  FileText,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type BookingStatus = 
  | 'CONFIRMED' 
  | 'RESCHEDULED' 
  | 'COMPLETED' 
  | 'TRY_LATER' 
  | 'GHOSTED' 
  | 'NOT_INTERESTED' 
  | 'CANCELLED';

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: string;
  subjects: string;
  slot_date: string;
  slot_time: string;
  plan: string;
  notes?: string;
  user_notes?: string;
  manager_notes?: string;
  status: BookingStatus;
  created_at: string;
  updated_at?: string;
}

const TIME_SLOTS = [
  '10:00 AM - 10:15 AM',
  '11:00 AM - 11:15 AM',
  '12:00 PM - 12:15 PM',
  '02:00 PM - 02:15 PM',
  '03:30 PM - 03:45 PM',
  '05:00 PM - 05:15 PM',
  '06:30 PM - 06:45 PM',
  '07:30 PM - 07:45 PM',
  '08:30 PM - 08:45 PM',
  '09:15 PM - 09:30 PM'
];

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  CONFIRMED: {
    label: 'Confirmed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: CalendarClock
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: CheckCircle2
  },
  TRY_LATER: {
    label: 'Try Later',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: Clock
  },
  GHOSTED: {
    label: 'Ghosted',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    icon: Ghost
  },
  NOT_INTERESTED: {
    label: 'Not Interested',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: Ban
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: XCircle
  }
};

const getStatusConfig = (status: string) => {
  return STATUS_CONFIG[status as BookingStatus] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: AlertCircle
  };
};

export default function OneOnOneBookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // View Details Modal state
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [managerNotesInput, setManagerNotesInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedToast, setNotesSavedToast] = useState(false);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Sub-actions inside View modal
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState(TIME_SLOTS[0]);
  const [rescheduleReason, setRescheduleReason] = useState('');

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Copy feedback state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/1on1-bookings');
      const data = await res.json();
      if (data.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Failed to fetch 1:1 bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenView = (booking: Booking) => {
    setViewBooking(booking);
    setManagerNotesInput(booking.manager_notes || '');
    setNewDate(booking.slot_date || '');
    setNewSlot(booking.slot_time || TIME_SLOTS[0]);
    setRescheduleReason('');
    setCancelReason('');
    setIsRescheduling(false);
    setIsCancelling(false);
    setCopiedField(null);
  };

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveNotes = async () => {
    if (!viewBooking) return;
    setSavingNotes(true);
    try {
      const res = await fetch('/api/1on1-bookings/update-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: viewBooking.id,
          manager_notes: managerNotesInput
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.map(b => b.id === viewBooking.id ? { ...b, manager_notes: managerNotesInput } : b));
        setViewBooking(prev => prev ? { ...prev, manager_notes: managerNotesInput } : null);
        setNotesSavedToast(true);
        setTimeout(() => setNotesSavedToast(false), 2500);
      } else {
        alert(data.error || 'Failed to save notes');
      }
    } catch (err) {
      console.error('Save notes error:', err);
      alert('Error saving notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleUpdateStatus = async (newStatus: BookingStatus, customManagerNotes?: string) => {
    if (!viewBooking) return;
    setActionLoading(true);
    const notesToSave = customManagerNotes !== undefined ? customManagerNotes : managerNotesInput;
    try {
      const res = await fetch('/api/1on1-bookings/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: viewBooking.id,
          status: newStatus,
          manager_notes: notesToSave
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.map(b => b.id === viewBooking.id ? {
          ...b,
          status: newStatus,
          manager_notes: notesToSave
        } : b));
        setViewBooking(prev => prev ? {
          ...prev,
          status: newStatus,
          manager_notes: notesToSave
        } : null);
        setActionSuccessToast(`Status updated to ${getStatusConfig(newStatus).label}`);
        setTimeout(() => setActionSuccessToast(null), 2500);
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Error updating status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!viewBooking || !newDate || !newSlot) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/1on1-bookings/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: viewBooking.id,
          new_slot_date: newDate,
          new_slot_time: newSlot,
          reason: rescheduleReason || managerNotesInput || 'Rescheduled by manager',
          manager_notes: managerNotesInput
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.map(b => b.id === viewBooking.id ? {
          ...b,
          slot_date: newDate,
          slot_time: newSlot,
          status: 'RESCHEDULED',
          manager_notes: managerNotesInput
        } : b));
        setViewBooking(prev => prev ? {
          ...prev,
          slot_date: newDate,
          slot_time: newSlot,
          status: 'RESCHEDULED',
          manager_notes: managerNotesInput
        } : null);
        setIsRescheduling(false);
        setActionSuccessToast('Slot rescheduled & student notified via email');
        setTimeout(() => setActionSuccessToast(null), 3000);
      } else {
        alert(data.error || 'Failed to reschedule');
      }
    } catch (err) {
      console.error('Reschedule failed:', err);
      alert('Error rescheduling');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!viewBooking) return;
    setActionLoading(true);
    try {
      const reasonToUse = cancelReason || managerNotesInput || 'Cancelled by manager';
      const res = await fetch('/api/1on1-bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: viewBooking.id,
          reason: reasonToUse,
          manager_notes: reasonToUse
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.map(b => b.id === viewBooking.id ? {
          ...b,
          status: 'CANCELLED',
          manager_notes: reasonToUse
        } : b));
        setViewBooking(prev => prev ? {
          ...prev,
          status: 'CANCELLED',
          manager_notes: reasonToUse
        } : null);
        setManagerNotesInput(reasonToUse);
        setIsCancelling(false);
        setActionSuccessToast('Booking cancelled & student notified via email');
        setTimeout(() => setActionSuccessToast(null), 3000);
      } else {
        alert(data.error || 'Failed to cancel');
      }
    } catch (err) {
      console.error('Cancel failed:', err);
      alert('Error cancelling');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered list
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const studentNote = (b.user_notes || b.notes || '').toLowerCase();
    const managerNote = (b.manager_notes || '').toLowerCase();
    const matchesSearch = !q || (
      b.name?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.phone?.includes(q) ||
      b.subjects?.toLowerCase().includes(q) ||
      b.level?.toLowerCase().includes(q) ||
      b.slot_date?.toLowerCase().includes(q) ||
      studentNote.includes(q) ||
      managerNote.includes(q)
    );
    return matchesStatus && matchesSearch;
  });

  // Summary counts
  const totalCount = bookings.length;
  const confirmedCount = bookings.filter(b => b.status === 'CONFIRMED').length;
  const rescheduledCount = bookings.filter(b => b.status === 'RESCHEDULED').length;
  const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;
  const tryLaterCount = bookings.filter(b => b.status === 'TRY_LATER').length;
  const ghostedCount = bookings.filter(b => b.status === 'GHOSTED').length;
  const notInterestedCount = bookings.filter(b => b.status === 'NOT_INTERESTED').length;
  const cancelledCount = bookings.filter(b => b.status === 'CANCELLED').length;

  const filterTabs: { id: string; label: string; count: number }[] = [
    { id: 'ALL', label: 'All', count: totalCount },
    { id: 'CONFIRMED', label: 'Confirmed', count: confirmedCount },
    { id: 'RESCHEDULED', label: 'Rescheduled', count: rescheduledCount },
    { id: 'COMPLETED', label: 'Completed', count: completedCount },
    { id: 'TRY_LATER', label: 'Try Later', count: tryLaterCount },
    { id: 'GHOSTED', label: 'Ghosted', count: ghostedCount },
    { id: 'NOT_INTERESTED', label: 'Not Interested', count: notInterestedCount },
    { id: 'CANCELLED', label: 'Cancelled', count: cancelledCount }
  ];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex justify-end items-center">
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer disabled:opacity-50 shadow-xs active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Bookings</span>
        </button>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
        <div 
          onClick={() => setStatusFilter('ALL')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${statusFilter === 'ALL' ? 'ring-2 ring-slate-900 bg-white shadow-md' : 'bg-white hover:bg-slate-50 border-slate-200'}`}
        >
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('CONFIRMED')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${statusFilter === 'CONFIRMED' ? 'ring-2 ring-emerald-600 bg-emerald-50/80 shadow-md' : 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200'}`}
        >
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Confirmed</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{confirmedCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('RESCHEDULED')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${statusFilter === 'RESCHEDULED' ? 'ring-2 ring-amber-600 bg-amber-50/80 shadow-md' : 'bg-amber-50/50 hover:bg-amber-50 border-amber-200'}`}
        >
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Rescheduled</div>
          <div className="text-2xl font-black text-amber-800 mt-1">{rescheduledCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('COMPLETED')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${statusFilter === 'COMPLETED' ? 'ring-2 ring-blue-600 bg-blue-50/80 shadow-md' : 'bg-blue-50/50 hover:bg-blue-50 border-blue-200'}`}
        >
          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Completed</div>
          <div className="text-2xl font-black text-blue-800 mt-1">{completedCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('TRY_LATER')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${statusFilter === 'TRY_LATER' ? 'ring-2 ring-indigo-600 bg-indigo-50/80 shadow-md' : 'bg-indigo-50/50 hover:bg-indigo-50 border-indigo-200'}`}
        >
          <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Try Later</div>
          <div className="text-2xl font-black text-indigo-800 mt-1">{tryLaterCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('GHOSTED')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${statusFilter === 'GHOSTED' ? 'ring-2 ring-slate-600 bg-slate-100 shadow-md' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}
        >
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Ghosted</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{ghostedCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('NOT_INTERESTED')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${statusFilter === 'NOT_INTERESTED' ? 'ring-2 ring-orange-600 bg-orange-50/80 shadow-md' : 'bg-orange-50/50 hover:bg-orange-50 border-orange-200'}`}
        >
          <div className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">Not Int.</div>
          <div className="text-2xl font-black text-orange-800 mt-1">{notInterestedCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('CANCELLED')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${statusFilter === 'CANCELLED' ? 'ring-2 ring-rose-600 bg-rose-50/80 shadow-md' : 'bg-rose-50/50 hover:bg-rose-50 border-rose-200'}`}
        >
          <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Cancelled</div>
          <div className="text-2xl font-black text-rose-800 mt-1">{cancelledCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, email, phone, notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading 1:1 bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-16 text-center text-slate-400 font-bold">
            No 1:1 bookings found matching your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">WhatsApp Contact</th>
                  <th className="py-3.5 px-4">Subject(s) & Level</th>
                  <th className="py-3.5 px-4">Date & 15-Min Slot</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredBookings.map((booking) => {
                  const statusConf = getStatusConfig(booking.status);
                  const StatusIcon = statusConf.icon;
                  const studentNote = booking.user_notes || booking.notes;
                  const managerNote = booking.manager_notes;

                  return (
                    <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Student Info */}
                      <td className="py-4 px-4 font-bold">
                        <div className="text-sm font-black text-slate-900">{booking.name}</div>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{booking.email}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Booked on {new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Phone / WhatsApp */}
                      <td className="py-4 px-4 font-bold">
                        <div className="flex items-center gap-2">
                          <span>+91 {booking.phone}</span>
                          {booking.phone && (
                            <a
                              href={`https://wa.me/91${booking.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Chat on WhatsApp"
                              className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Subjects & Level - Clean, without confusing merged notes */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-extrabold text-slate-800 line-clamp-2">{booking.subjects}</div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">{booking.level}</div>
                        {/* Indicators that notes exist to view in modal */}
                        <div className="flex items-center gap-1.5 mt-1">
                          {studentNote && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                              <User className="w-2.5 h-2.5" /> Student Note
                            </span>
                          )}
                          {managerNote && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              <Shield className="w-2.5 h-2.5" /> Manager Note
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Slot Date & Time */}
                      <td className="py-4 px-4 font-bold whitespace-nowrap">
                        <div className="text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{booking.slot_date}</span>
                        </div>
                        <div className="text-slate-600 font-medium flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{booking.slot_time}</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusConf.label}</span>
                        </span>
                      </td>

                      {/* View Button - Direct & Clean, replacing the actions dropdown */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleOpenView(booking)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer hover:shadow-md active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FULL BOOKING INFO MODAL */}
      <AnimatePresence>
        {viewBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full my-auto overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Top Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    {viewBooking.name ? viewBooking.name.charAt(0).toUpperCase() : 'B'}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                      Booking Details & Actions
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400 font-mono">ID: #{viewBooking.id.slice(0, 14)}...</span>
                      <button
                        onClick={() => handleCopy(viewBooking.id, 'id')}
                        className="text-[10px] text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer"
                      >
                        {copiedField === 'id' ? 'Copied ID!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Status Badge */}
                  {(() => {
                    const conf = getStatusConfig(viewBooking.status);
                    const Icon = conf.icon;
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${conf.bg} ${conf.text} ${conf.border}`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span>{conf.label}</span>
                      </span>
                    );
                  })()}

                  <button
                    onClick={() => setViewBooking(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Toast Feedback Banner */}
              {actionSuccessToast && (
                <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 text-xs font-bold text-emerald-800 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    {actionSuccessToast}
                  </span>
                </div>
              )}

              {/* Modal Body - Scrollable */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
                {/* 1. USER DETAILS CARD */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-600" /> Student Profile
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Booked {new Date(viewBooking.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Name */}
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Full Name</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">{viewBooking.name}</div>
                    </div>

                    {/* Email */}
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Email Address</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-slate-800 truncate" title={viewBooking.email}>
                          {viewBooking.email}
                        </span>
                        <button
                          onClick={() => handleCopy(viewBooking.email, 'email')}
                          title="Copy Email"
                          className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Phone & WhatsApp */}
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">WhatsApp / Phone</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-black text-slate-900">+91 {viewBooking.phone}</span>
                        {viewBooking.phone && (
                          <a
                            href={`https://wa.me/91${viewBooking.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-green-100 text-green-800 font-bold text-[10px] hover:bg-green-200 transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-3 h-3 text-green-700" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. BOOKING INFO CARD */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 shadow-xs">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Consultation Information
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Date & Slot */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Scheduled Slot</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-black text-slate-900 text-sm">{viewBooking.slot_date}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-slate-700 font-bold">
                        <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{viewBooking.slot_time}</span>
                      </div>
                    </div>

                    {/* Level & Plan */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Academic Level & Plan</div>
                      <div className="font-black text-slate-900 mt-1">{viewBooking.level || 'Foundation Level'}</div>
                      <div className="text-slate-500 text-[11px] font-medium mt-0.5">{viewBooking.plan || '1:1 Personalised Teaching'}</div>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Subject(s) Requested</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(viewBooking.subjects || 'General').split(',').map((sub, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold"
                        >
                          {sub.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. NOTES FROM USER (STUDENT BLOCKER) */}
                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" /> Notes from Student (User Query / Blocker)
                    </h4>
                    <span className="text-[10px] text-blue-600 bg-blue-100/80 font-bold px-2 py-0.5 rounded-md">
                      Student Input
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-blue-200 text-xs text-slate-800 leading-relaxed font-medium">
                    {viewBooking.user_notes || viewBooking.notes ? (
                      <p className="whitespace-pre-wrap">{viewBooking.user_notes || viewBooking.notes}</p>
                    ) : (
                      <span className="text-slate-400 italic">No notes or blocker submitted by the student during booking.</span>
                    )}
                  </div>
                </div>

                {/* 4. NOTES FROM MANAGER (INTERNAL REMARKS) */}
                <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-600" /> Notes from Manager (Internal Follow-up)
                    </h4>
                    <span className="text-[10px] text-amber-700 bg-amber-100/80 font-bold px-2 py-0.5 rounded-md">
                      Manager Only
                    </span>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={managerNotesInput}
                      onChange={e => setManagerNotesInput(e.target.value)}
                      placeholder="Add remarks, call outcome, student requirements, follow-up dates..."
                      className="w-full p-3 bg-white border border-amber-300 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />

                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-slate-500 font-medium">
                        {notesSavedToast ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Note saved successfully!
                          </span>
                        ) : (
                          <span>Internal notes are never visible to students.</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {savingNotes && <Loader2 className="w-3 h-3 animate-spin" />}
                        <span>Save Note</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. RESCHEDULE SUB-PANEL (If toggled) */}
                {isRescheduling && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                        <CalendarClock className="w-4 h-4 text-amber-700" /> Reschedule Session Slot
                      </h4>
                      <button
                        onClick={() => setIsRescheduling(false)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">New Date (YYYY-MM-DD)</label>
                        <input
                          type="text"
                          value={newDate}
                          onChange={e => setNewDate(e.target.value)}
                          placeholder="e.g. 2026-10-02"
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg font-medium text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">New 15-Min Slot</label>
                        <select
                          value={newSlot}
                          onChange={e => setNewSlot(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg font-medium text-slate-900"
                        >
                          {TIME_SLOTS.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Reason (Optional)</label>
                      <input
                        type="text"
                        value={rescheduleReason}
                        onChange={e => setRescheduleReason(e.target.value)}
                        placeholder="e.g. Rescheduled after WhatsApp discussion"
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-medium text-slate-900"
                      />
                    </div>

                    <div className="text-[11px] text-amber-800 bg-amber-100/70 p-2.5 rounded-lg border border-amber-300 font-bold">
                      ⚠️ Rescheduling will dispatch a confirmation email to <strong>{viewBooking.email}</strong>.
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsRescheduling(false)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleReschedule}
                        disabled={actionLoading || !newDate || !newSlot}
                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Confirm & Send Email</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 6. CANCEL SUB-PANEL (If toggled) */}
                {isCancelling && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-700" /> Cancel 1:1 Consultation
                      </h4>
                      <button
                        onClick={() => setIsCancelling(false)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600"
                      >
                        Back
                      </button>
                    </div>

                    <p className="text-xs text-rose-800 font-medium">
                      Are you sure you want to cancel the booking for <strong>{viewBooking.name}</strong>?
                    </p>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Cancellation</label>
                      <input
                        type="text"
                        value={cancelReason}
                        onChange={e => setCancelReason(e.target.value)}
                        placeholder="e.g. Student unable to attend / requested cancellation"
                        className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg text-xs font-medium text-slate-900"
                      />
                    </div>

                    <div className="text-[11px] text-rose-800 bg-rose-100/70 p-2.5 rounded-lg border border-rose-300 font-bold">
                      ⚠️ A cancellation email will be automatically dispatched to <strong>{viewBooking.email}</strong>.
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCancelling(false)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                      >
                        Keep Booking
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={actionLoading}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Confirm Cancellation</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 7. ACTION BUTTONS (Pipeline Status Changes) */}
                <div className="space-y-2.5 pt-2">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-slate-600" /> Actions & Pipeline Status
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">Click any action to update status immediately</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Mark as Completed */}
                    <button
                      type="button"
                      disabled={actionLoading || viewBooking.status === 'COMPLETED'}
                      onClick={() => handleUpdateStatus('COMPLETED')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        viewBooking.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-900 border-blue-300 ring-2 ring-blue-500'
                          : 'bg-white hover:bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>Mark Done</span>
                      <span className="text-[10px] text-slate-400 font-normal">Session conducted</span>
                    </button>

                    {/* Reschedule */}
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => {
                        setIsRescheduling(!isRescheduling);
                        setIsCancelling(false);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isRescheduling
                          ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-500'
                          : 'bg-white hover:bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      <CalendarClock className="w-4 h-4 text-amber-600" />
                      <span>Reschedule</span>
                      <span className="text-[10px] text-slate-400 font-normal">Change slot</span>
                    </button>

                    {/* Try Later */}
                    <button
                      type="button"
                      disabled={actionLoading || viewBooking.status === 'TRY_LATER'}
                      onClick={() => handleUpdateStatus('TRY_LATER')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        viewBooking.status === 'TRY_LATER'
                          ? 'bg-indigo-100 text-indigo-900 border-indigo-300 ring-2 ring-indigo-500'
                          : 'bg-white hover:bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}
                    >
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span>Try Later</span>
                      <span className="text-[10px] text-slate-400 font-normal">Postponed / Follow-up</span>
                    </button>

                    {/* Ghosted */}
                    <button
                      type="button"
                      disabled={actionLoading || viewBooking.status === 'GHOSTED'}
                      onClick={() => handleUpdateStatus('GHOSTED')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        viewBooking.status === 'GHOSTED'
                          ? 'bg-slate-200 text-slate-900 border-slate-400 ring-2 ring-slate-500'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                      }`}
                    >
                      <Ghost className="w-4 h-4 text-slate-600" />
                      <span>Ghosted</span>
                      <span className="text-[10px] text-slate-400 font-normal">No response / absent</span>
                    </button>

                    {/* Not Interested */}
                    <button
                      type="button"
                      disabled={actionLoading || viewBooking.status === 'NOT_INTERESTED'}
                      onClick={() => handleUpdateStatus('NOT_INTERESTED')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        viewBooking.status === 'NOT_INTERESTED'
                          ? 'bg-orange-100 text-orange-900 border-orange-300 ring-2 ring-orange-500'
                          : 'bg-white hover:bg-orange-50 text-orange-800 border-orange-200'
                      }`}
                    >
                      <Ban className="w-4 h-4 text-orange-600" />
                      <span>Not Interested</span>
                      <span className="text-[10px] text-slate-400 font-normal">Declined offer</span>
                    </button>

                    {/* Confirmed (Restore) */}
                    <button
                      type="button"
                      disabled={actionLoading || viewBooking.status === 'CONFIRMED'}
                      onClick={() => handleUpdateStatus('CONFIRMED')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        viewBooking.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-2 ring-emerald-500'
                          : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Confirmed</span>
                      <span className="text-[10px] text-slate-400 font-normal">Active session</span>
                    </button>

                    {/* Cancel Booking */}
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => {
                        setIsCancelling(!isCancelling);
                        setIsRescheduling(false);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer col-span-2 ${
                        isCancelling || viewBooking.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-900 border-rose-300 ring-2 ring-rose-500'
                          : 'bg-white hover:bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Cancel Booking</span>
                      <span className="text-[10px] text-slate-400 font-normal">Notify student via email</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="text-xs text-slate-500 font-medium">
                  Status: <strong>{getStatusConfig(viewBooking.status).label}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setViewBooking(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
