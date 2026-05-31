'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, Clock, Check, X, Search, Filter, Database, 
  TrendingUp, IndianRupee, AlertCircle, RefreshCw, Edit3, 
  Trash2, User, Sparkles, CheckCircle2, ChevronDown, Video, ExternalLink
} from 'lucide-react';
import { ASTROLOGERS, getAstrologerById } from '@/constants/astrologers';
import { consultationService } from '@/services/consultation.service';
import Toast from '@/components/ui/toast/Toast';

export default function AdminConsultations() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [astrologerFilter, setAstrologerFilter] = useState('all');

  // Reschedule Modal state
  const [reschedulingBooking, setReschedulingBooking] = useState<any | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [savingReschedule, setSavingReschedule] = useState(false);

  // Load bookings from DB
  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await consultationService.getAllBookings();
      if (error) {
        setErrorMsg('Failed to load consultation bookings.');
      } else {
        setBookings(data || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Actions
  const handleApproveBooking = async (id: string) => {
    try {
      const res = await consultationService.updateBookingStatus(id, 'approved');
      if (res.success) {
        setSuccessMsg('Booking has been approved successfully.');
        loadBookings();
      } else {
        setErrorMsg('Failed to approve booking.');
      }
    } catch (e) {
      setErrorMsg('Error updating booking status.');
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel and refund this booking? This action is permanent.')) return;
    try {
      const res = await consultationService.updateBookingStatus(id, 'cancelled');
      if (res.success) {
        setSuccessMsg('Booking has been cancelled and refund initiated.');
        loadBookings();
      } else {
        setErrorMsg('Failed to cancel booking.');
      }
    } catch (e) {
      setErrorMsg('Error updating booking status.');
    }
  };

  // Open reschedule dialog
  const openRescheduleModal = (booking: any) => {
    setReschedulingBooking(booking);
    setRescheduleDate(booking.scheduled_date);
    setRescheduleSlot(booking.scheduled_slot);
  };

  // Save rescheduled slot
  const handleSaveReschedule = async () => {
    if (!reschedulingBooking || !rescheduleDate || !rescheduleSlot) return;
    setSavingReschedule(true);
    try {
      const res = await consultationService.rescheduleBooking(
        reschedulingBooking.id, 
        rescheduleDate, 
        rescheduleSlot
      );
      if (res.success) {
        setSuccessMsg('Booking has been rescheduled successfully.');
        setReschedulingBooking(null);
        loadBookings();
      } else {
        setErrorMsg('Failed to reschedule booking.');
      }
    } catch (e) {
      setErrorMsg('Error saving rescheduled details.');
    } finally {
      setSavingReschedule(false);
    }
  };

  // Filter Bookings client-side
  const getFilteredBookings = () => {
    return bookings.filter(b => {
      // 1. Search Query
      const userProfile = b.user_profile;
      const userName = userProfile?.name?.toLowerCase() || '';
      const userEmail = b.user_email?.toLowerCase() || '';
      const bookingId = b.id.toLowerCase();
      const matchSearch = 
        userName.includes(searchQuery.toLowerCase()) || 
        userEmail.includes(searchQuery.toLowerCase()) || 
        bookingId.includes(searchQuery.toLowerCase());

      // 2. Status
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;

      // 3. Astrologer
      const matchAstrologer = astrologerFilter === 'all' || b.astrologer_id === astrologerFilter;

      return matchSearch && matchStatus && matchAstrologer;
    });
  };

  const filteredBookings = getFilteredBookings();

  // Metrics Calculations
  const totalBookings = bookings.length;
  const approvedBookings = bookings.filter(b => b.status === 'approved').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
  const totalRevenue = approvedBookings * 999;

  // Next 14 days generator for rescheduling calendar
  const getNext14Days = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      dates.push(nextDate.toISOString().split('T')[0]);
    }
    return dates;
  };
  const next14Days = getNext14Days();

  // Pick slot times matching constants
  const availableSlotTimes = [
    "09:30 AM - 10:00 AM",
    "10:00 AM - 10:30 AM",
    "10:30 AM - 11:00 AM",
    "11:00 AM - 11:30 AM",
    "11:35 AM - 12:00 PM",
    "02:00 PM - 02:30 PM",
    "02:30 PM - 03:00 PM",
    "03:00 PM - 03:30 PM",
    "03:30 PM - 04:00 PM",
    "04:00 PM - 04:30 PM",
    "04:30 PM - 05:00 PM",
    "05:00 PM - 05:30 PM",
    "05:30 PM - 06:00 PM"
  ];

  return (
    <div className="p-6 flex flex-col gap-6 text-left relative min-h-screen text-zinc-150">
      
      {/* Toast Notifications */}
      {errorMsg && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[150] min-w-[300px]">
          <Toast message={errorMsg} type="error" onClose={() => setErrorMsg(null)} />
        </div>
      )}
      {successMsg && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[150] min-w-[300px]">
          <Toast message={successMsg} type="success" onClose={() => setSuccessMsg(null)} />
        </div>
      )}

      {/* Header Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-serif font-black text-white flex items-center gap-2 tracking-wide">
            Astrologer Consultation Registry
          </h1>
          <span className="text-[10px] text-gold-500 font-mono tracking-widest uppercase font-bold">
            Gokul Vivaham Control Panel &amp; Scheduling Desk
          </span>
        </div>
        <button
          onClick={loadBookings}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300 font-semibold cursor-pointer disabled:opacity-50 transition-all focus:outline-none shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Reload Register
        </button>
      </div>

      {/* ANALYTICS KPI DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-1">
        {/* Total Bookings */}
        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-3xl flex flex-col justify-between shadow-[inset_0_0_12px_rgba(255,255,255,0.02)] min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Total Bookings</span>
            <span className="p-1 rounded bg-zinc-800 text-zinc-400"><Calendar className="h-4 w-4" /></span>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalBookings}</div>
          <span className="text-[9px] text-zinc-500 font-light mt-1">All booking transactions logged</span>
        </div>

        {/* Total Revenue */}
        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-3xl flex flex-col justify-between shadow-[inset_0_0_12px_rgba(255,255,255,0.02)] min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold text-gold-500 uppercase tracking-widest font-mono">Astrologer Revenue</span>
            <span className="p-1 rounded bg-gold-950/20 text-gold-450 border border-gold-900/10"><IndianRupee className="h-4 w-4" /></span>
          </div>
          <div className="mt-2 text-2xl font-bold text-gold-450">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <span className="text-[9px] text-gold-600/80 font-light mt-1">Based on {approvedBookings} approved sessions</span>
        </div>

        {/* Pending Approval */}
        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-3xl flex flex-col justify-between shadow-[inset_0_0_12px_rgba(255,255,255,0.02)] min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest font-mono">Awaiting Review</span>
            <span className="p-1 rounded bg-amber-950/20 text-amber-450 border border-amber-900/10"><AlertCircle className="h-4 w-4" /></span>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-450">{pendingBookings}</div>
          <span className="text-[9px] text-zinc-500 font-light mt-1">Pending order confirmations</span>
        </div>

        {/* Approved Sessions */}
        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-3xl flex flex-col justify-between shadow-[inset_0_0_12px_rgba(255,255,255,0.02)] min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest font-mono">Approved Sessions</span>
            <span className="p-1 rounded bg-emerald-950/20 text-emerald-450 border border-emerald-900/10"><CheckCircle2 className="h-4 w-4" /></span>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-450">{approvedBookings}</div>
          <span className="text-[9px] text-zinc-500 font-light mt-1">Confirmed appointments</span>
        </div>

        {/* Cancelled Sessions */}
        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-3xl flex flex-col justify-between shadow-[inset_0_0_12px_rgba(255,255,255,0.02)] min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Cancelled Slots</span>
            <span className="p-1 rounded bg-zinc-800 text-zinc-500"><X className="h-4 w-4" /></span>
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-400">{cancelledBookings}</div>
          <span className="text-[9px] text-zinc-500 font-light mt-1">Cancelled &amp; refunded slots</span>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-3xl shadow flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search Member, Email, or Booking UUID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs focus:outline-none dark:text-zinc-100 placeholder:text-zinc-550"
          />
        </div>

        {/* Filter Selection Row */}
        <div className="flex flex-wrap gap-4 w-full md:w-auto items-center justify-end">
          
          {/* Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 font-light font-mono text-[10px] uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-100 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Astrologer Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 font-light font-mono text-[10px] uppercase">Astrologer:</span>
            <select
              value={astrologerFilter}
              onChange={(e) => setAstrologerFilter(e.target.value)}
              className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none dark:text-zinc-100 cursor-pointer max-w-[180px]"
            >
              <option value="all">All Astrologers</option>
              {ASTROLOGERS.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* REGISTRY LOG TABLE */}
      <div className="bg-zinc-900 border border-zinc-850 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col gap-6 items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-zinc-500 font-light font-mono tracking-widest uppercase">Loading consultations register...</span>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-850 bg-zinc-950/40 font-mono text-[9px] uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Booking Details</th>
                  <th className="px-6 py-4 font-bold">Member Information</th>
                  <th className="px-6 py-4 font-bold">Vedic Astrologer</th>
                  <th className="px-6 py-4 font-bold">Appointment Schedule</th>
                  <th className="px-6 py-4 font-bold">Billing</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {filteredBookings.map((b) => {
                  const astro = getAstrologerById(b.astrologer_id);
                  const isApproved = b.status === 'approved';
                  const isPending = b.status === 'pending';
                  const isCancelled = b.status === 'cancelled';
                  
                  const googleMeetUrl = `https://meet.google.com/gvv-mock-${b.id.substring(0, 8)}`;

                  return (
                    <tr 
                      key={b.id} 
                      className="text-zinc-300 hover:bg-zinc-950/20 transition-colors"
                    >
                      {/* Booking ID and details */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-left">
                          <span className="font-mono text-[9px] text-zinc-500 font-bold uppercase">ID: {b.id.substring(0, 8)}...</span>
                          <span className="text-[10px] text-zinc-400 font-sans italic max-w-[200px] truncate" title={b.notes}>
                            {b.notes || 'No description provided'}
                          </span>
                        </div>
                      </td>

                      {/* Member Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[10px] text-zinc-400">
                            {b.user_profile?.name?.[0] || 'M'}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-semibold text-zinc-200">{b.user_profile?.name || 'Member'}</span>
                            <span className="text-[9px] text-zinc-500">{b.user_email || 'N/A'}</span>
                            <span className="text-[8px] font-mono text-gold-600 uppercase tracking-widest mt-0.5">{b.user_profile?.profile_id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Astrologer */}
                      <td className="px-6 py-4 font-sans font-semibold text-zinc-250">
                        {astro?.name || 'Unassigned Astrologer'}
                      </td>

                      {/* Schedule */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-left">
                          <span className="font-semibold text-zinc-200">
                            {new Date(b.scheduled_date).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric', weekday: 'short'
                            })}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-light flex items-center gap-1 font-mono">
                            <Clock className="h-3.5 w-3.5 text-gold-650" /> {b.scheduled_slot}
                          </span>
                        </div>
                      </td>

                      {/* Billing / Cost */}
                      <td className="px-6 py-4 font-mono font-bold text-zinc-200">
                        ₹999.00
                        <span className="block text-[8px] font-light text-zinc-500 font-sans mt-0.5">Order ID: {b.payment?.razorpay_order_id?.substring(0, 10) || 'Mocked'}</span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-450 border-emerald-950/20'
                            : isCancelled
                            ? 'bg-zinc-800 text-zinc-500 border-zinc-800'
                            : 'bg-amber-500/10 text-amber-450 border-amber-950/20'
                        }`}>
                          {b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2.5 justify-end">
                          
                          {/* Join Link (Only if approved) */}
                          {isApproved && (
                            <a
                              href={googleMeetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-emerald-900 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 cursor-pointer"
                              title="Join Mock Video Meeting"
                            >
                              <Video className="h-4 w-4" />
                            </a>
                          )}

                          {/* Approve Action */}
                          {isPending && (
                            <button
                              onClick={() => handleApproveBooking(b.id)}
                              className="p-1.5 rounded-lg border border-emerald-900/30 hover:border-emerald-600 bg-emerald-950/10 text-emerald-500 hover:text-white cursor-pointer focus:outline-none transition-colors"
                              title="Approve Consultation Slot"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}

                          {/* Reschedule Action (Only approved/pending) */}
                          {!isCancelled && (
                            <button
                              onClick={() => openRescheduleModal(b)}
                              className="p-1.5 rounded-lg border border-zinc-800 hover:border-gold-500 bg-zinc-950/20 text-zinc-400 hover:text-gold-500 cursor-pointer focus:outline-none transition-colors"
                              title="Reschedule Appointment Slot"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          )}

                          {/* Cancel Action (Only approved/pending) */}
                          {!isCancelled && (
                            <button
                              onClick={() => handleCancelBooking(b.id)}
                              className="p-1.5 rounded-lg border border-zinc-800 hover:border-red-650 bg-zinc-950/20 text-zinc-450 hover:text-red-400 cursor-pointer focus:outline-none transition-colors"
                              title="Cancel & Refund Session"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}

                          {/* Delete/Status Info (If cancelled) */}
                          {isCancelled && (
                            <span className="text-[10px] text-zinc-500 italic uppercase">Refunded</span>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 min-h-[300px] gap-3 text-center border-t border-zinc-850">
            <Database className="h-10 w-10 text-zinc-700 animate-bounce" />
            <div className="flex flex-col gap-1 max-w-sm">
              <span className="font-serif font-bold text-zinc-400 text-sm">No match records</span>
              <p className="text-xs text-zinc-650 leading-normal font-light">
                There are no consultation bookings matching the search queries or status filters.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RESCHEDULE MODAL PANEL */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col relative max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-850 flex justify-between items-center bg-zinc-950/20">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-gold-500" />
                <h3 className="text-sm font-serif font-bold text-white">Reschedule Consultation</h3>
              </div>
              <button
                onClick={() => setReschedulingBooking(null)}
                className="p-1.5 rounded-full hover:bg-zinc-850 text-zinc-400 hover:text-white cursor-pointer focus:outline-none"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-4 text-xs">
              
              <div className="flex flex-col gap-1 text-left leading-normal bg-zinc-950/40 p-3 rounded-2xl border border-zinc-850">
                <span className="text-[8px] font-mono text-zinc-550 uppercase">Session Info</span>
                <span className="font-bold text-zinc-200">User: {reschedulingBooking.user_profile?.name}</span>
                <span className="text-[10px] text-zinc-400 font-light mt-0.5">
                  Astrologer: {getAstrologerById(reschedulingBooking.astrologer_id)?.name || 'Vedic Scholar'}
                </span>
                <span className="text-[10px] text-zinc-450 font-light mt-0.5">
                  Current Slot: {reschedulingBooking.scheduled_date} @ {reschedulingBooking.scheduled_slot}
                </span>
              </div>

              {/* Date Input Selector */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-zinc-400 uppercase tracking-wider text-[9px] font-mono">Select New Date</label>
                <select
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-zinc-800 rounded-2xl bg-zinc-950 text-white focus:outline-none cursor-pointer"
                >
                  {next14Days.map((d, index) => (
                    <option key={index} value={d}>
                      {new Date(d).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', weekday: 'short'
                      })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Slot Input Selector */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-zinc-400 uppercase tracking-wider text-[9px] font-mono">Select New Time Slot</label>
                <select
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-zinc-800 rounded-2xl bg-zinc-950 text-white focus:outline-none cursor-pointer"
                >
                  {availableSlotTimes.map((t, index) => (
                    <option key={index} value={t}>{t}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-zinc-850 bg-zinc-950/20 flex justify-end gap-3">
              <button
                onClick={() => setReschedulingBooking(null)}
                className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white text-[10px] font-bold uppercase rounded-xl hover:bg-zinc-850 transition-all cursor-pointer focus:outline-none"
              >
                Close
              </button>
              <button
                onClick={handleSaveReschedule}
                disabled={savingReschedule}
                className="px-5 py-2 luxury-gradient text-white text-[10px] font-bold uppercase tracking-wider rounded-xl shadow cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5 focus:outline-none"
              >
                {savingReschedule ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
