import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, MessageCircle, CalendarPlus, User, Mail, Phone, BookOpen, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: string;
  defaultSubject?: string;
}

const POPULAR_SUBJECTS = [
  'Mathematics 1',
  'Mathematics 2',
  'Statistics 1',
  'Statistics 2',
  'Programming in Python',
  'Computational Thinking',
  'English 1 / 2',
  'Machine Learning Foundations',
  'Other / Multiple Subjects'
];

const PROGRAM_LEVELS = [
  'Qualifier Exam',
  'Foundation Level',
  'Diploma in Programming',
  'Diploma in Data Science',
  'BSc / BS Degree Level'
];

const TIME_SLOTS = [
  { time: '10:00 AM - 10:15 AM', period: 'Morning' },
  { time: '11:00 AM - 11:15 AM', period: 'Morning' },
  { time: '12:00 PM - 12:15 PM', period: 'Morning' },
  { time: '02:00 PM - 02:15 PM', period: 'Afternoon' },
  { time: '03:30 PM - 03:45 PM', period: 'Afternoon' },
  { time: '05:00 PM - 05:15 PM', period: 'Evening' },
  { time: '06:30 PM - 06:45 PM', period: 'Evening' },
  { time: '07:30 PM - 07:45 PM', period: 'Evening' },
  { time: '08:30 PM - 08:45 PM', period: 'Night' },
  { time: '09:15 PM - 09:30 PM', period: 'Night' }
];

export default function BookingModal1on1({ isOpen, onClose, defaultPlan, defaultSubject }: BookingModalProps) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState<'details' | 'slot' | 'success'>('details');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [level, setLevel] = useState('Foundation Level');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    defaultSubject ? [defaultSubject] : ['Mathematics 2']
  );
  const [customSubject, setCustomSubject] = useState('');
  const [notes, setNotes] = useState('');

  // Automatically pre-fill from authenticated user & profile
  useEffect(() => {
    if (user) {
      if (user.email) {
        setEmail(user.email);
      }
      const prefillName = profile?.name || profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '';
      if (prefillName && !name) {
        setName(prefillName);
      }
      const prefillPhone = profile?.phone || profile?.whatsapp_number || user.user_metadata?.phone || user.user_metadata?.whatsapp_number || '';
      if (prefillPhone && !phone) {
        setPhone(prefillPhone);
      }
    }
  }, [user, profile, isOpen]);

  // Slot state
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>('06:30 PM - 06:45 PM');

  // Dates for next 7 days
  const upcomingDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayMonth = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    return { dateStr, dayName, dayMonth };
  });

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleNextToSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (trimmedName.length > 20) {
      setErrorMessage('Name cannot exceed 20 characters.');
      return;
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address for receiving slot details.');
      return;
    }

    // Phone validation: exactly 10 digits, starts with 6, 7, 8, or 9
    const digitsOnly = phone.replace(/\D/g, '');
    const valid10Digits = digitsOnly.length === 12 && digitsOnly.startsWith('91') ? digitsOnly.slice(2) : digitsOnly;
    if (!/^[6-9]\d{9}$/.test(valid10Digits)) {
      setErrorMessage('Phone number must be exactly 10 digits starting with 6, 7, 8, or 9.');
      return;
    }

    setErrorMessage('');
    setStep('slot');
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    setErrorMessage('');

    const finalSubjects = [...selectedSubjects];
    if (customSubject.trim() && !finalSubjects.includes(customSubject.trim())) {
      finalSubjects.push(customSubject.trim());
    }

    const bookingPayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      level,
      subjects: finalSubjects.join(', '),
      slot_date: selectedDate,
      slot_time: selectedSlot,
      plan: defaultPlan || '1:1 Personalised Teaching',
      notes: notes.trim(),
      bcc: 'genziitian@gmail.com',
      source: '1:1 Landing Page'
    };

    try {
      // 1. Send to server endpoint
      fetch('/api/book-1on1-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      }).catch(err => console.error('Server endpoint booking error:', err));

      // 2. Also send directly to Google Apps Script webhook for zero-delay backup logging & email dispatch
      const gParams = new URLSearchParams();
      gParams.append('form_type', '1:1 Personalised Teaching Slot');
      gParams.append('name', bookingPayload.name);
      gParams.append('email', bookingPayload.email);
      gParams.append('phone', bookingPayload.phone);
      gParams.append('level', bookingPayload.level);
      gParams.append('subjects', bookingPayload.subjects);
      gParams.append('slot_date', bookingPayload.slot_date);
      gParams.append('slot_time', bookingPayload.slot_time);
      gParams.append('notes', bookingPayload.notes);
      gParams.append('bcc_email', 'genziitian@gmail.com');
      gParams.append('timestamp', new Date().toISOString());

      await fetch('https://script.google.com/macros/s/AKfycbysGFbxo9r41D5kMnKmO90rr9u_mzn5aBuhZG6AFvRZOhDtFJ9dclTHgJJqdcBNS-Ny/exec', {
        method: 'POST',
        mode: 'no-cors',
        body: gParams
      }).catch(e => console.warn('Script fetch backup caught:', e));

      setSubmitting(false);
      setStep('success');
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setSubmitting(false);
      setStep('success');
    }
  };

  const formatCalendarDates = (dateStr: string, slotTimeStr: string) => {
    try {
      const cleanDate = dateStr.replace(/-/g, '');
      const [startPart, endPart] = slotTimeStr.split('-').map(s => s.trim());
      if (!startPart || !endPart) return '';

      const parseTime = (timeStr: string) => {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return null;
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const period = match[3].toUpperCase();
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return `${String(hours).padStart(2, '0')}${minutes}00`;
      };

      const startTime = parseTime(startPart);
      const endTime = parseTime(endPart);
      if (startTime && endTime) {
        return `${cleanDate}T${startTime}/${cleanDate}T${endTime}`;
      }
    } catch {
      // ignore
    }
    return '';
  };

  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent('Gen-Z IITian: 1:1 Personalised Consultation');
    const details = encodeURIComponent(
      `Hello ${name}!\n\nYour 15-minute 1:1 Personalised Teaching consultation with GenZ IITian is confirmed.\n\nDate: ${selectedDate}\nTime: ${selectedSlot}\nSubjects: ${selectedSubjects.join(', ')}\nLevel: ${level}\nNotes: ${notes || 'None'}\n\nSupport WhatsApp: +91 79704 95447\nBCC: genziitian@gmail.com`
    );
    const location = encodeURIComponent('Google Meet / WhatsApp (+91 79704 95447)');
    const datesParam = formatCalendarDates(selectedDate, selectedSlot);
    const datesQuery = datesParam ? `&dates=${datesParam}` : '';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}${datesQuery}&details=${details}&location=${location}`;
  };

  const resetForm = () => {
    setStep('details');
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setErrorMessage('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white border-[3.5px] border-[#0b1120] rounded-[1.5rem] sm:rounded-[2rem] shadow-[8px_8px_0px_#0b1120] overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Header Bar */}
          <div className="bg-[#0b1120] text-white px-5 sm:px-6 py-4 sm:py-4.5 flex items-center justify-between border-b-[3px] border-[#0b1120] shrink-0">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#10b981] text-white font-black text-sm">
                1:1
              </span>
              <div>
                <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  Book Your 15-Min Free Slot
                  <span className="text-xs bg-emerald-500/20 text-[#10b981] border border-[#10b981]/40 px-2 py-0.5 rounded-full font-bold">
                    Zero ₹ Fees
                  </span>
                </h3>
                <p className="text-xs text-gray-300 font-medium">
                  One student. One tutor. Personalised to your syllabus.
                </p>
              </div>
            </div>
            <button
              onClick={resetForm}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          {step !== 'success' && (
            <div className="bg-gray-100 px-5 sm:px-6 py-2.5 border-b-2 border-gray-200 flex items-center justify-between text-xs font-bold text-gray-600 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  step === 'details' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                }`}>
                  1
                </span>
                <span className={step === 'details' ? 'text-blue-700' : 'text-gray-700'}>
                  Your Details & Subjects
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  step === 'slot' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
                }`}>
                  2
                </span>
                <span className={step === 'slot' ? 'text-blue-700' : 'text-gray-500'}>
                  Choose 15-Min Slot
                </span>
              </div>
            </div>
          )}

          {/* Modal Content */}
          <div className="p-5 sm:p-7 overflow-y-auto flex-1">
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-700 flex items-center gap-3 text-sm font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: Details */}
            {step === 'details' && (
              <form onSubmit={handleNextToSlot} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600" /> Your Full Name *
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        {name.length}/20
                      </span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => {
                        if (e.target.value.length <= 20) {
                          setName(e.target.value);
                        }
                      }}
                      maxLength={20}
                      placeholder="e.g. Aryan Sharma"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-[#0b1120] text-sm font-bold text-[#0b1120] placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-600" /> Email Address *
                      </span>
                      {user?.email && (
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-700" /> Google Login (Locked)
                        </span>
                      )}
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled={Boolean(user?.email)}
                      readOnly={true}
                      placeholder="student@study.iitm.ac.in"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#0b1120] text-sm font-bold text-gray-700 bg-gray-100 cursor-not-allowed select-none opacity-90 focus:outline-none"
                    />
                    <span className="text-[11px] text-gray-500 font-medium">Slot confirmation will be sent to your Google login email</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-green-600" /> WhatsApp Number *
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">10 digits (6-9)</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs font-black text-gray-500 border-r border-gray-300 pr-2 pointer-events-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPhone(val);
                        }}
                        maxLength={10}
                        placeholder="9876543210"
                        required
                        className="w-full pl-14 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-[#0b1120] text-sm font-bold text-[#0b1120] placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium">Must be 10 digits starting with 6, 7, 8, or 9</span>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-purple-600" /> Program / Level
                    </label>
                    <select
                      value={level}
                      onChange={e => setLevel(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-[#0b1120] text-sm font-bold text-[#0b1120] focus:outline-none focus:bg-white"
                    >
                      {PROGRAM_LEVELS.map(lvl => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject Pills */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                    Select Subject(s) you need 1:1 help with
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SUBJECTS.map(sub => {
                      const isSelected = selectedSubjects.includes(sub);
                      return (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => toggleSubject(sub)}
                          className={`px-3 py-2 rounded-xl text-xs font-black border-2 transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white border-[#0b1120] shadow-[2px_2px_0px_#0b1120]'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-[#0b1120]'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '} {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                    What's your biggest blocker? (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. Scored low in Quiz 1 Integration, need a tutor who can explain from basics"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-[#0b1120] text-sm font-medium text-[#0b1120] placeholder-gray-400 focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleNextToSlot}
                    className="w-full py-4 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl font-black text-base border-[2.5px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] active:translate-y-0.5 active:shadow-[2px_2px_0px_#0b1120] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Choose 15-Minute Slot</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Slot Selection */}
            {step === 'slot' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-black text-[#0b1120] mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" /> Select Date
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                    {upcomingDates.map(({ dateStr, dayName, dayMonth }) => {
                      const isSelected = selectedDate === dateStr;
                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => setSelectedDate(dateStr)}
                          className={`p-2.5 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-[#0b1120] text-white border-[#0b1120] shadow-[3px_3px_0px_#10b981]'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-[#0b1120]'
                          }`}
                        >
                          <span className={`text-[10px] uppercase font-black ${isSelected ? 'text-[#10b981]' : 'text-gray-500'}`}>
                            {dayName}
                          </span>
                          <span className="text-xs font-black mt-0.5">
                            {dayMonth}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black text-[#0b1120] mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" /> Choose 15-Minute Consultation Window
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {TIME_SLOTS.map(({ time, period }) => {
                      const isSelected = selectedSlot === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedSlot(time)}
                          className={`px-4 py-3 rounded-xl border-2 font-bold text-xs flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-[#10b981] text-white border-[#0b1120] shadow-[3px_3px_0px_#0b1120]'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#0b1120] hover:bg-white'
                          }`}
                        >
                          <span className="font-black">{time}</span>
                          <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {period}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Booking Summary Box */}
                <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-200 text-xs text-blue-900 space-y-1.5">
                  <div className="font-black text-blue-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> 1:1 Consultation Overview:
                  </div>
                  <div><strong>Student:</strong> {name} ({email})</div>
                  <div><strong>Subjects:</strong> {selectedSubjects.join(', ') || 'All topics'}</div>
                  <div><strong>Slot:</strong> {selectedDate} @ {selectedSlot} (15 minutes)</div>
                  <div className="text-emerald-700 font-bold mt-1">
                    ✓ Completely Free • No Payment Required • Private 1-on-1 Call
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="px-5 py-4 bg-white text-gray-700 border-2 border-[#0b1120] rounded-xl font-black text-sm hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleConfirmBooking}
                    className="flex-1 py-4 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl font-black text-base border-[2.5px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] active:translate-y-0.5 active:shadow-[2px_2px_0px_#0b1120] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? (
                      <span>Reserving Slot & Sending Email...</span>
                    ) : (
                      <>
                        <span>Confirm 15-Min Free Slot</span>
                        <CheckCircle2 className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Thank You Screen */}
            {step === 'success' && (
              <div className="text-center py-6 sm:py-8 space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 border-[3px] border-[#0b1120] shadow-[4px_4px_0px_#0b1120] flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-3xl font-black text-[#0b1120] tracking-tight">
                    Your Slot is Confirmed! 🎉
                  </h3>
                  <p className="text-gray-600 font-bold text-sm mt-2 max-w-md mx-auto">
                    We’ve reserved your 15-minute 1:1 call. An automated confirmation email has been dispatched to{' '}
                    <span className="text-[#0b1120] underline">{email}</span>.
                  </p>
                </div>

                {/* Confirmed Ticket Card */}
                <div className="max-w-md mx-auto bg-gray-50 border-[2.5px] border-[#0b1120] rounded-2xl p-5 text-left shadow-[4px_4px_0px_#0b1120] space-y-2.5">
                  <div className="flex items-center justify-between border-b pb-2 border-gray-200">
                    <span className="text-xs font-black text-gray-500 uppercase">Consultation Type</span>
                    <span className="text-xs font-black text-blue-600">1:1 Home Tutor Session</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2 border-gray-200">
                    <span className="text-xs font-black text-gray-500 uppercase">Selected Date</span>
                    <span className="text-xs font-black text-[#0b1120]">{selectedDate}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2 border-gray-200">
                    <span className="text-xs font-black text-gray-500 uppercase">15-Min Slot</span>
                    <span className="text-xs font-black text-emerald-600">{selectedSlot}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-500 uppercase">Subjects</span>
                    <span className="text-xs font-black text-[#0b1120] max-w-[200px] truncate text-right">
                      {selectedSubjects.join(', ') || 'Custom'}
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 text-xs text-emerald-900 font-semibold max-w-md mx-auto text-left flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    A confirmation copy was delivered to your email, and our team at{' '}
                    <strong className="text-emerald-950">genziitian@gmail.com</strong> has received your notification to assign your senior tutor.
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <a
                    href={getGoogleCalendarUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs border-2 border-[#0b1120] shadow-[3px_3px_0px_#0b1120] flex items-center justify-center gap-2 transition-all"
                  >
                    <CalendarPlus className="w-4 h-4" /> Add to Google Calendar
                  </a>

                  <a
                    href="https://wa.me/917970495447?text=Hi%20GenZ%20IITian%2C%20I%20just%20booked%20my%201%3A1%20slot%20and%20wanted%20to%20connect."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl font-black text-xs border-2 border-[#0b1120] shadow-[3px_3px_0px_#0b1120] flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                  </a>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-black text-gray-500 hover:text-[#0b1120] underline transition-colors"
                >
                  Done / Close Window
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
