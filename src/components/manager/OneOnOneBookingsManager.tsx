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
  ArrowUpDown,
  Filter,
  MoreVertical,
  CalendarPlus,
  Loader2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Booking {
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
  status: 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED';
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

export default function OneOnOneBookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Active Dropdown state (row ID)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Mark Completed Confirmation Modal state
  const [completeBooking, setCompleteBooking] = useState<Booking | null>(null);
  const [completeNotes, setCompleteNotes] = useState('');

  // Re-confirm Modal state
  const [confirmBooking, setConfirmBooking] = useState<Booking | null>(null);

  // Reschedule Modal state
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState(TIME_SLOTS[0]);
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Cancel Modal state
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

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

  const handleUpdateStatus = async (id: string, newStatus: string, notes?: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch('/api/1on1-bookings/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, notes })
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus as any, notes: notes || b.notes } : b));
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Error updating status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const submitReschedule = async () => {
    if (!rescheduleBooking || !newDate || !newSlot) return;
    setActionLoadingId(rescheduleBooking.id);
    try {
      const res = await fetch('/api/1on1-bookings/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rescheduleBooking.id,
          new_slot_date: newDate,
          new_slot_time: newSlot,
          reason: rescheduleReason || 'Rescheduled by manager'
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.map(b => b.id === rescheduleBooking.id ? {
          ...b,
          slot_date: newDate,
          slot_time: newSlot,
          status: 'RESCHEDULED'
        } : b));
        setRescheduleBooking(null);
      } else {
        alert(data.error || 'Failed to reschedule');
      }
    } catch (err) {
      console.error('Reschedule failed:', err);
      alert('Error rescheduling');
    } finally {
      setActionLoadingId(null);
    }
  };

  const submitCancel = async () => {
    if (!cancelBooking) return;
    setActionLoadingId(cancelBooking.id);
    try {
      const res = await fetch('/api/1on1-bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cancelBooking.id,
          reason: cancelReason || 'Cancelled by manager'
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.map(b => b.id === cancelBooking.id ? {
          ...b,
          status: 'CANCELLED',
          notes: cancelReason || b.notes
        } : b));
        setCancelBooking(null);
      } else {
        alert(data.error || 'Failed to cancel');
      }
    } catch (err) {
      console.error('Cancel failed:', err);
      alert('Error cancelling');
    } finally {
      setActionLoadingId(null);
    }
  };

  const submitComplete = async () => {
    if (!completeBooking) return;
    await handleUpdateStatus(completeBooking.id, 'COMPLETED', completeNotes);
    setCompleteBooking(null);
  };

  const submitMarkConfirmed = async () => {
    if (!confirmBooking) return;
    await handleUpdateStatus(confirmBooking.id, 'CONFIRMED');
    setConfirmBooking(null);
  };

  // Filtered list
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      b.name?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.phone?.includes(q) ||
      b.subjects?.toLowerCase().includes(q) ||
      b.level?.toLowerCase().includes(q) ||
      b.slot_date?.toLowerCase().includes(q)
    );
    return matchesStatus && matchesSearch;
  });

  // Summary counts
  const totalCount = bookings.length;
  const confirmedCount = bookings.filter(b => b.status === 'CONFIRMED').length;
  const rescheduledCount = bookings.filter(b => b.status === 'RESCHEDULED').length;
  const cancelledCount = bookings.filter(b => b.status === 'CANCELLED').length;
  const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex justify-end items-center">
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer disabled:opacity-50 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Bookings</span>
        </button>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Confirmed</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{confirmedCount}</div>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Rescheduled</div>
          <div className="text-2xl font-black text-amber-800 mt-1">{rescheduledCount}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
          <div className="text-xs font-bold text-red-700 uppercase tracking-wider">Cancelled</div>
          <div className="text-2xl font-black text-red-800 mt-1">{cancelledCount}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Completed</div>
          <div className="text-2xl font-black text-blue-800 mt-1">{completedCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, email, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
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
          <div className="overflow-x-auto min-h-[380px] pb-32">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">WhatsApp Contact</th>
                  <th className="py-3.5 px-4">Subject(s) & Level</th>
                  <th className="py-3.5 px-4">Date & 15-Min Slot</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredBookings.map((booking) => {
                  const isActioning = actionLoadingId === booking.id;
                  return (
                    <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Student Info */}
                      <td className="py-4 px-4 font-bold">
                        <div className="text-sm font-black text-slate-900">{booking.name}</div>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{booking.email}</span>
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
                              className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Subjects & Level */}
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-slate-800">{booking.subjects}</div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">{booking.level}</div>
                        {booking.notes && (
                          <div className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 max-w-xs truncate" title={booking.notes}>
                            Note: {booking.notes}
                          </div>
                        )}
                      </td>

                      {/* Slot Date & Time */}
                      <td className="py-4 px-4 font-bold">
                        <div className="text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{booking.slot_date}</span>
                        </div>
                        <div className="text-slate-600 font-medium flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{booking.slot_time}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : booking.status === 'RESCHEDULED'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : booking.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {booking.status === 'CONFIRMED' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                          {booking.status === 'RESCHEDULED' && <RefreshCw className="w-3 h-3 text-amber-700" />}
                          {booking.status === 'CANCELLED' && <XCircle className="w-3 h-3 text-red-700" />}
                          <span>{booking.status}</span>
                        </span>
                      </td>

                      {/* Actions Dropdown */}
                      <td className="py-4 px-4 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === booking.id ? null : booking.id)}
                            disabled={isActioning}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 border border-slate-300 hover:border-slate-400 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            <span>Actions</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 ${openDropdownId === booking.id ? 'rotate-180' : ''}`} />
                          </button>

                          {openDropdownId === booking.id && (
                            <>
                              {/* Invisible backdrop to dismiss dropdown */}
                              <div
                                className="fixed inset-0 z-30 cursor-default"
                                onClick={() => setOpenDropdownId(null)}
                              />

                              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border-2 border-slate-200 py-1.5 z-40 text-left divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                                <div className="py-1">
                                  {/* Action: Mark as Completed */}
                                  {booking.status !== 'COMPLETED' && (
                                    <button
                                      onClick={() => {
                                        setOpenDropdownId(null);
                                        setCompleteBooking(booking);
                                        setCompleteNotes('');
                                      }}
                                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer text-left"
                                    >
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                      <div>
                                        <div className="leading-tight">Mark as Done</div>
                                        <div className="text-[10px] text-slate-400 font-normal">Session conducted</div>
                                      </div>
                                    </button>
                                  )}

                                  {/* Action: Reschedule */}
                                  <button
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      setRescheduleBooking(booking);
                                      setNewDate(booking.slot_date || '');
                                      setNewSlot(booking.slot_time || TIME_SLOTS[0]);
                                      setRescheduleReason('');
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer text-left"
                                  >
                                    <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
                                    <div>
                                      <div className="leading-tight">Reschedule Slot</div>
                                      <div className="text-[10px] text-slate-400 font-normal">Change date or time</div>
                                    </div>
                                  </button>

                                  {/* Action: Restore / Mark Confirmed */}
                                  {booking.status !== 'CONFIRMED' && (
                                    <button
                                      onClick={() => {
                                        setOpenDropdownId(null);
                                        setConfirmBooking(booking);
                                      }}
                                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer text-left"
                                    >
                                      <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                                      <div>
                                        <div className="leading-tight">Mark as Confirmed</div>
                                        <div className="text-[10px] text-slate-400 font-normal">Restore to upcoming</div>
                                      </div>
                                    </button>
                                  )}
                                </div>

                                {/* Action: Cancel */}
                                {booking.status !== 'CANCELLED' && (
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        setOpenDropdownId(null);
                                        setCancelBooking(booking);
                                        setCancelReason('');
                                      }}
                                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                                    >
                                      <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                                      <div>
                                        <div className="leading-tight">Cancel Booking</div>
                                        <div className="text-[10px] text-slate-400 font-normal">Cancel & notify student</div>
                                      </div>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {rescheduleBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border-2 border-slate-900 shadow-2xl p-6 max-w-md w-full space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-600" /> Reschedule 1:1 Session
                </h3>
                <button onClick={() => setRescheduleBooking(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
                <div><strong>Student:</strong> {rescheduleBooking.name} ({rescheduleBooking.email})</div>
                <div><strong>Current Slot:</strong> {rescheduleBooking.slot_date} at {rescheduleBooking.slot_time}</div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Date</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    placeholder="e.g. 2026-09-22 or Thu, Sep 22"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">New 15-Min Slot</label>
                  <select
                    value={newSlot}
                    onChange={e => setNewSlot(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800"
                  >
                    {TIME_SLOTS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reason / Note (Optional)</label>
                  <input
                    type="text"
                    value={rescheduleReason}
                    onChange={e => setRescheduleReason(e.target.value)}
                    placeholder="e.g. Student requested evening time"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-bold">
                ⚠️ Updating this slot will automatically dispatch a Reschedule Confirmation Email to the student with BCC to genziitian@gmail.com.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleBooking(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReschedule}
                  disabled={!newDate || !newSlot}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-black text-xs disabled:opacity-50"
                >
                  Confirm Reschedule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {cancelBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border-2 border-slate-900 shadow-2xl p-6 max-w-md w-full space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-black text-red-600 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" /> Cancel 1:1 Consultation
                </h3>
                <button onClick={() => setCancelBooking(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Are you sure you want to cancel the session for <strong>{cancelBooking.name}</strong> ({cancelBooking.slot_date} at {cancelBooking.slot_time})?
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for cancellation</label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="e.g. Schedule clash or student opted for course"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                />
              </div>

              <div className="text-[11px] text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200 font-bold">
                ⚠️ A cancellation notification email will be sent to <strong>{cancelBooking.email}</strong> with BCC to genziitian@gmail.com.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelBooking(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={submitCancel}
                  disabled={actionLoadingId === cancelBooking.id}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoadingId === cancelBooking.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Cancellation</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mark Completed Confirmation Modal */}
      <AnimatePresence>
        {completeBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border-2 border-slate-900 shadow-2xl p-6 max-w-md w-full space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Mark Session as Completed
                </h3>
                <button onClick={() => setCompleteBooking(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Confirm that this 1:1 consultation session has been successfully conducted:
              </p>

              <div className="text-xs text-slate-700 space-y-1.5 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 font-medium">
                <div><strong>Student:</strong> {completeBooking.name} ({completeBooking.email})</div>
                <div><strong>Scheduled Slot:</strong> {completeBooking.slot_date} at {completeBooking.slot_time}</div>
                <div><strong>Subject(s):</strong> {completeBooking.subjects}</div>
                <div><strong>WhatsApp:</strong> +91 {completeBooking.phone}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Summary / Remarks (Optional)</label>
                <textarea
                  rows={2}
                  value={completeNotes}
                  onChange={e => setCompleteNotes(e.target.value)}
                  placeholder="e.g. Conducted call, cleared questions, discussed weekly schedule."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteBooking(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitComplete}
                  disabled={actionLoadingId === completeBooking.id}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoadingId === completeBooking.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Yes, Mark Done</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Re-confirm Modal */}
      <AnimatePresence>
        {confirmBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border-2 border-slate-900 shadow-2xl p-6 max-w-md w-full space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" /> Mark as Confirmed (Active)
                </h3>
                <button onClick={() => setConfirmBooking(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Do you want to change the status of this booking for <strong>{confirmBooking.name}</strong> ({confirmBooking.slot_date} at {confirmBooking.slot_time}) back to <strong>CONFIRMED</strong>?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmBooking(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitMarkConfirmed}
                  disabled={actionLoadingId === confirmBooking.id}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoadingId === confirmBooking.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Yes, Mark Confirmed</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
