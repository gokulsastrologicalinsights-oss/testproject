'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, Clock, CheckCircle2, AlertCircle, FileText, 
  MapPin, HelpCircle, User, Sparkles, ChevronRight, Video, 
  ArrowLeft, X, Check, CalendarCheck, CalendarDays, ExternalLink
} from 'lucide-react';
import { ASTROLOGERS, Astrologer, getAstrologerById } from '@/constants/astrologers';
import { consultationService } from '@/services/consultation.service';
import { useCheckout } from '@/hooks/useCheckout';
import Toast from '@/components/ui/toast/Toast';
import { supabase } from '@/lib/supabase';

export default function UserConsultations() {
  const { initiateCheckout, loading: checkoutLoading, error: checkoutError, setError: setCheckoutError } = useCheckout();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'book' | 'my-bookings'>('book');

  // Booking Flow States
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState('Horoscope Matching');
  const [notes, setNotes] = useState('');
  
  // Birth Details manual inputs
  const [dob, setDob] = useState('');
  const [tob, setTob] = useState('');
  const [pob, setPob] = useState('');

  // Horoscope Option
  const [useUploadedHoroscope, setUseUploadedHoroscope] = useState(false);
  const [existingHoroscopeUrl, setExistingHoroscopeUrl] = useState<string | null>(null);
  
  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Booking result/success state
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // User Bookings Dashboard states
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Initialize and resolve user ID
  useEffect(() => {
    const initUser = async () => {
      const resolvedId = await consultationService.resolveDbUserId();
      setDbUserId(resolvedId);
      
      if (resolvedId) {
        // Fetch existing horoscope uploads
        const { data } = await consultationService.getHoroscopeUpload(resolvedId);
        if (data && data.file_url) {
          setExistingHoroscopeUrl(data.file_url);
        }
      }
    };
    initUser();
  }, []);

  // Fetch Bookings list
  const loadUserBookings = useCallback(async () => {
    if (!dbUserId) return;
    setLoadingBookings(true);
    try {
      const { data } = await consultationService.getUserBookings(dbUserId);
      setUserBookings(data || []);
    } catch (err) {
      console.error('Failed to load user bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  }, [dbUserId]);

  // Load bookings when changing tabs
  useEffect(() => {
    if (activeTab === 'my-bookings') {
      loadUserBookings();
    }
  }, [activeTab, loadUserBookings]);

  // Pricing calculations
  const baseFee = 999;
  const getDiscountedFee = () => {
    if (!appliedCoupon) return baseFee;
    if (appliedCoupon.discount_type === 'percentage') {
      const disc = (baseFee * Number(appliedCoupon.discount_value)) / 100;
      return Math.max(0, baseFee - disc);
    } else {
      return Math.max(0, baseFee - Number(appliedCoupon.discount_value));
    }
  };
  const finalFee = getDiscountedFee();
  const gstAmount = Number((finalFee * 0.18).toFixed(2));
  const baseTaxableAmount = Number((finalFee - (finalFee * 0.18)).toFixed(2));

  // Date selection logic (Generate next 14 days)
  const getNext14Days = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      dates.push({
        dayName: nextDate.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: nextDate.getDate(),
        month: nextDate.toLocaleDateString('en-US', { month: 'short' }),
        isoString: nextDate.toISOString().split('T')[0]
      });
    }
    return dates;
  };

  const next14Days = getNext14Days();

  // Handle Coupon Check
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(null);
    try {
      const { data: coupons } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .gt('expiry_date', new Date().toISOString());

      const coupon = coupons?.[0];
      if (coupon && (coupon.uses_count || 0) < (coupon.max_uses || 100)) {
        setAppliedCoupon(coupon);
        setCouponSuccess(`Coupon "${coupon.code}" applied! Save ₹${coupon.discount_value}${coupon.discount_type === 'percentage' ? '%' : ''}`);
      } else {
        setCouponError('Invalid or expired coupon code.');
        setAppliedCoupon(null);
      }
    } catch (e) {
      setCouponError('Error verifying coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  // Payment Execution
  const handleProceedToPayment = async () => {
    if (!selectedAstrologer || !selectedDate || !selectedSlot) {
      setCheckoutError('Please complete all selection steps.');
      return;
    }

    if (!useUploadedHoroscope && (!dob || !tob || !pob)) {
      setCheckoutError('Please enter your birth details or use your uploaded horoscope.');
      return;
    }

    const mergedNotes = `
Type: ${consultationType}
Birth Details: ${useUploadedHoroscope ? 'Linked Horoscope Upload' : `DOB: ${dob}, TOB: ${tob}, POB: ${pob}`}
Notes: ${notes}
    `.trim();

    const bookingDetails = {
      bookingType: 'astrologer_consultation',
      scheduledDate: selectedDate,
      scheduledSlot: selectedSlot,
      notes: mergedNotes,
    };

    // Open Razorpay flow
    await initiateCheckout({
      paymentType: 'consultation',
      couponCode: appliedCoupon?.code || undefined,
      bookingDetails: bookingDetails,
      onSuccess: (data: any) => {
        setBookingSuccess({
          astrologer: selectedAstrologer,
          date: selectedDate,
          slot: selectedSlot,
          details: bookingDetails,
          invoiceNumber: data.transaction?.invoice_number || `GV-INV-${Math.floor(100000 + Math.random() * 900000)}`
        });
        setSuccessMsg('Consultation booked and payment verified successfully!');
        // Reset selections
        setSelectedAstrologer(null);
        setSelectedDate(null);
        setSelectedSlot(null);
        setNotes('');
        setDob('');
        setTob('');
        setPob('');
        setAppliedCoupon(null);
        setCouponCode('');
      },
      onCancel: () => {
        console.log('Payment cancelled');
      }
    });
  };

  // Handle Cancel Booking
  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this astrologer consultation booking? A cancellation request will be sent.')) return;
    setCancellingId(bookingId);
    try {
      const res = await consultationService.cancelBooking(bookingId);
      if (res.success) {
        setSuccessMsg('Booking cancelled successfully.');
        loadUserBookings();
      } else {
        setCheckoutError('Failed to cancel booking. Please try again.');
      }
    } catch (e) {
      setCheckoutError('Error cancelling booking.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left relative">
      
      {/* Toast Notifications */}
      {checkoutError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[150] min-w-[300px]">
          <Toast message={checkoutError} type="error" onClose={() => setCheckoutError(null)} />
        </div>
      )}
      {successMsg && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[150] min-w-[300px]">
          <Toast message={successMsg} type="success" onClose={() => setSuccessMsg(null)} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-gold-500 animate-pulse" />
          Vedic Astrologer Consultations
        </h1>
        <p className="text-xs text-zinc-550 dark:text-zinc-400 font-light">
          Gain divine clarity on matching, Dosha remedies, and alliance timings with our certified senior astrologers.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-sm gap-6">
        <button
          onClick={() => { setActiveTab('book'); setBookingSuccess(null); }}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'book' && !bookingSuccess
              ? 'text-maroon-700 dark:text-gold-450 border-b-2 border-maroon-600 dark:border-gold-500'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-150'
          }`}
        >
          Book Consultation
        </button>
        <button
          onClick={() => { setActiveTab('my-bookings'); setBookingSuccess(null); }}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'my-bookings'
              ? 'text-maroon-700 dark:text-gold-450 border-b-2 border-maroon-600 dark:border-gold-500'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-150'
          }`}
        >
          My Bookings Dashboard
          {userBookings.filter(b => b.status === 'approved').length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[8px] text-white font-mono font-bold">
              {userBookings.filter(b => b.status === 'approved').length}
            </span>
          )}
        </button>
      </div>

      {/* BOOKING SUCCESS SCREEN */}
      {bookingSuccess && (
        <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 shadow-xl flex flex-col items-center text-center gap-6 animate-fade-in max-w-2xl mx-auto my-8">
          <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-16 w-16" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-serif font-bold text-zinc-900 dark:text-emerald-450">Consultation Booked Successfully!</h2>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed font-light">
              Your one-on-one session has been scheduled and approved. Meeting joining details have been dispatched to your email.
            </p>
          </div>

          <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-150 dark:border-zinc-800 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-450 uppercase font-mono">Astrologer</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{bookingSuccess.astrologer.name}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-450 uppercase font-mono">Date &amp; Time</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {new Date(bookingSuccess.date).toLocaleDateString('en-IN', {
                  weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-450 font-light flex items-center gap-1">
                <Clock className="h-3 w-3" /> {bookingSuccess.slot}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-450 uppercase font-mono">Transaction Reference</span>
              <span className="font-mono text-[10px] text-zinc-700 dark:text-zinc-300 font-bold">{bookingSuccess.invoiceNumber}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-450 uppercase font-mono">Platform Join Method</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-450 flex items-center gap-1.5">
                <Video className="h-4 w-4" /> Google Meet Video Call
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => { setActiveTab('my-bookings'); setBookingSuccess(null); }}
              className="px-6 py-2.5 rounded-full luxury-gradient text-white text-xs font-bold uppercase tracking-wider shadow cursor-pointer transition-transform hover:scale-[1.02] focus:outline-none"
            >
              View My Bookings
            </button>
            <button
              onClick={() => setBookingSuccess(null)}
              className="px-6 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 dark:hover:bg-zinc-950/20 cursor-pointer focus:outline-none"
            >
              Book Another
            </button>
          </div>
        </div>
      )}

      {/* BOOKING FLOW TAB */}
      {activeTab === 'book' && !bookingSuccess && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Step Sections */}
          <div className="lg:col-span-8 flex flex-col gap-6 text-left">
            
            {/* Step 1: Select Astrologer */}
            <div className="bg-white dark:bg-zinc-900 border border-sandal-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-md flex flex-col gap-4">
              <h2 className="text-base font-serif font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-maroon-600/10 dark:bg-gold-500/10 text-maroon-700 dark:text-gold-450 flex items-center justify-center font-bold text-xs">1</span>
                Select Vedic Astrologer
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ASTROLOGERS.map((astro) => {
                  const isSelected = selectedAstrologer?.id === astro.id;
                  return (
                    <div
                      key={astro.id}
                      onClick={() => {
                        setSelectedAstrologer(astro);
                        setSelectedSlot(null); // Reset slot since astrologer availability differs
                      }}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left relative ${
                        isSelected
                          ? 'border-maroon-600 dark:border-gold-500 ring-1 ring-maroon-600/30 bg-maroon-500/5 dark:bg-gold-500/5'
                          : 'border-zinc-200 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-950/20'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-maroon-700 dark:bg-gold-500 flex items-center justify-center text-white text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                      
                      <div className="flex flex-col gap-3">
                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${astro.colorClass} flex items-center justify-center font-serif text-lg font-bold shadow-md shrink-0`}>
                          {astro.initials}
                        </div>
                        
                        <div>
                          <h3 className="text-xs font-serif font-bold text-zinc-900 dark:text-zinc-100 mt-1">{astro.name}</h3>
                          <span className="text-[10px] bg-gold-400/20 text-gold-700 dark:text-gold-450 px-2 py-0.5 rounded font-bold font-mono tracking-wider">
                            {astro.experience} Exp
                          </span>
                        </div>
                        
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-light min-h-[45px]">
                          {astro.bio}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-850 flex flex-col gap-1">
                        <span className="text-[9px] text-zinc-400 uppercase font-mono tracking-wider">Specialties:</span>
                        <div className="flex flex-wrap gap-1">
                          {astro.specialties.map((s, idx) => (
                            <span key={idx} className="text-[8px] bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                        <span className="text-[9px] text-zinc-400 uppercase font-mono tracking-wider mt-1">Languages:</span>
                        <span className="text-[9px] font-semibold text-zinc-650 dark:text-zinc-350">{astro.languages.join(', ')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Date & Time Slot */}
            <div className={`bg-white dark:bg-zinc-900 border border-sandal-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-md flex flex-col gap-4 transition-all duration-300 ${
              !selectedAstrologer ? 'opacity-40 pointer-events-none select-none' : ''
            }`}>
              <h2 className="text-base font-serif font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-maroon-600/10 dark:bg-gold-500/10 text-maroon-700 dark:text-gold-450 flex items-center justify-center font-bold text-xs">2</span>
                Select Appointment Slot
              </h2>

              {selectedAstrologer && (
                <div className="flex flex-col gap-4 text-left">
                  {/* Calendar Row */}
                  <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider font-mono">1. Choose Date:</span>
                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                    {next14Days.map((d, index) => {
                      const isSelected = selectedDate === d.isoString;
                      return (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedDate(d.isoString);
                            setSelectedSlot(null); // Reset slot on date change
                          }}
                          className={`flex flex-col items-center justify-center min-w-[55px] p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-maroon-600 dark:border-gold-500 bg-maroon-600/10 dark:bg-gold-500/15 font-semibold text-maroon-800 dark:text-gold-400'
                              : 'border-zinc-150 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-950/20'
                          }`}
                        >
                          <span className="text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{d.dayName}</span>
                          <span className="text-sm font-serif font-bold dark:text-zinc-100">{d.dayNum}</span>
                          <span className="text-[8px] text-zinc-400 dark:text-zinc-500">{d.month}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Slot Grid Row */}
                  {selectedDate && (
                    <div className="flex flex-col gap-3 mt-2 animate-fade-in">
                      <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider font-mono">2. Choose Available Time Slot:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {selectedAstrologer.slots.map((slot, index) => {
                          const isSlotSelected = selectedSlot === slot;
                          return (
                            <button
                              key={index}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2 px-3 rounded-xl border text-[11px] font-light text-center transition-all cursor-pointer focus:outline-none flex items-center justify-center gap-1.5 ${
                                isSlotSelected
                                  ? 'border-maroon-600 dark:border-gold-500 bg-maroon-600/10 dark:bg-gold-500/15 font-semibold text-maroon-700 dark:text-gold-450'
                                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950/20 text-zinc-650 dark:text-zinc-350'
                              }`}
                            >
                              <Clock className="h-3 w-3 shrink-0 text-zinc-400" />
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Birth Details & Horoscope Integration */}
            <div className={`bg-white dark:bg-zinc-900 border border-sandal-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-md flex flex-col gap-4 transition-all duration-300 ${
              !selectedSlot ? 'opacity-40 pointer-events-none select-none' : ''
            }`}>
              <h2 className="text-base font-serif font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-maroon-600/10 dark:bg-gold-500/10 text-maroon-700 dark:text-gold-450 flex items-center justify-center font-bold text-xs">3</span>
                Consultation Details &amp; Horoscope
              </h2>

              {selectedSlot && (
                <div className="flex flex-col gap-4 text-left">
                  
                  {/* Select Consultation Reason */}
                  <div className="flex flex-col gap-1 text-xs">
                    <label className="font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider text-[9px]">Consultation Type</label>
                    <select
                      value={consultationType}
                      onChange={(e) => setConsultationType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:outline-none dark:text-zinc-100"
                    >
                      <option value="Horoscope Matching">Alliance Horoscope Matching Check</option>
                      <option value="Kundali Review">Detailed Personal Kundali Review</option>
                      <option value="Dosha & Remedies">Dosha Remedial (Chevvai/Kala Sarpa)</option>
                      <option value="Muhurtham Timing">Marriage Muhurtham Timings</option>
                      <option value="General Guidance">General Spiritual / Astrological Advice</option>
                    </select>
                  </div>

                  {/* Horoscope toggle integration */}
                  <div className="flex items-start gap-2 bg-sandal-50/50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-sandal-200/35 dark:border-zinc-850/60 my-1">
                    <input
                      type="checkbox"
                      id="horo-checkbox"
                      checked={useUploadedHoroscope}
                      onChange={(e) => setUseUploadedHoroscope(e.target.checked)}
                      disabled={!existingHoroscopeUrl}
                      className="mt-0.5 rounded cursor-pointer accent-maroon-600"
                    />
                    <div className="flex flex-col gap-0.5">
                      <label htmlFor="horo-checkbox" className={`text-[11px] font-bold cursor-pointer ${
                        !existingHoroscopeUrl ? 'text-zinc-405' : 'text-zinc-800 dark:text-zinc-250'
                      }`}>
                        Use my uploaded Horoscope PDF
                      </label>
                      {existingHoroscopeUrl ? (
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-light flex items-center gap-1 mt-0.5">
                          <Check className="h-3 w-3" /> Horoscope record found on profile
                        </span>
                      ) : (
                        <span className="text-[9px] text-zinc-405 font-light leading-normal">
                          No horoscope PDF found on your profile. Upload one in "My Profile" first to enable automatic sync, or fill details manually below.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Manual Birth details (Conditional) */}
                  {!useUploadedHoroscope && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in text-xs mt-1">
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider text-[9px]">Date of Birth</label>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent focus:outline-none dark:text-zinc-150"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider text-[9px]">Time of Birth</label>
                        <input
                          type="time"
                          value={tob}
                          onChange={(e) => setTob(e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent focus:outline-none dark:text-zinc-150"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider text-[9px]">Place of Birth</label>
                        <input
                          type="text"
                          value={pob}
                          onChange={(e) => setPob(e.target.value)}
                          placeholder="e.g. Madurai, Tamil Nadu"
                          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent focus:outline-none dark:text-zinc-150"
                        />
                      </div>
                    </div>
                  )}

                  {/* Astrologer specific questions */}
                  <div className="flex flex-col gap-1 text-xs">
                    <label className="font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider text-[9px]">Questions or Specific Notes for Astrologer</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="e.g. Please clarify if there are any Mars/Chevvai doshas in my chart, and provide remedies. I am looking at a match with Rasi Viruchigam."
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent focus:outline-none dark:text-zinc-100"
                    />
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* Pricing & Checkout Side Column */}
          <div className="lg:col-span-4 flex flex-col gap-6 text-left">
            <div className="bg-white dark:bg-zinc-900 border border-sandal-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-md flex flex-col gap-4">
              <h2 className="text-base font-serif font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-850 pb-3">
                Booking Summary
              </h2>

              <div className="flex flex-col gap-3.5 text-xs">
                {/* Slot Summary */}
                <div className="flex flex-col gap-1 bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-150/40 dark:border-zinc-850/60 leading-normal">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">Appointment Session</span>
                  {selectedAstrologer ? (
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedAstrologer.name}</span>
                  ) : (
                    <span className="text-zinc-450 italic font-light">No astrologer selected</span>
                  )}
                  {selectedDate && selectedSlot ? (
                    <span className="text-[10px] text-zinc-500 font-light mt-1 flex items-center gap-1 font-mono">
                      <CalendarCheck className="h-3.5 w-3.5 text-maroon-600" />
                      {selectedDate} @ {selectedSlot}
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-455 font-light italic mt-0.5">Please choose a date &amp; time slot</span>
                  )}
                </div>

                {/* Price Matrix */}
                <div className="flex flex-col gap-2 mt-1 border-t border-zinc-100 dark:border-zinc-850 pt-3">
                  <div className="flex justify-between text-zinc-550 dark:text-zinc-400">
                    <span>Base Fee:</span>
                    <span className="font-mono">₹{baseFee.toLocaleString('en-IN')}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-500">
                      <span>Discount ({appliedCoupon.code}):</span>
                      <span className="font-mono">-₹{Number(baseFee - finalFee).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-550 dark:text-zinc-400">
                    <span>Taxable Rate:</span>
                    <span className="font-mono">₹{baseTaxableAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-zinc-550 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-900 pb-2">
                    <span>Estimated GST (18%):</span>
                    <span className="font-mono">₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-zinc-100 pt-1">
                    <span>Total Amount:</span>
                    <span className="font-mono text-maroon-700 dark:text-gold-450 text-base">₹{finalFee.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Coupon Code section */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider font-mono">Apply Coupon</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. ASTRO20"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent uppercase font-mono"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="px-4 py-2 bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold uppercase rounded-xl transition-all cursor-pointer focus:outline-none"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <span className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">{couponError}</span>}
                  {couponSuccess && <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold mt-0.5">{couponSuccess}</span>}
                </div>

                {/* Action CTA Button */}
                <button
                  onClick={handleProceedToPayment}
                  disabled={!selectedSlot || checkoutLoading}
                  className="w-full mt-4 py-3 luxury-gradient rounded-full text-white text-xs font-bold uppercase tracking-wider shadow transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 hover:opacity-[0.98] focus:outline-none"
                >
                  {checkoutLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Loading Gateway...
                    </>
                  ) : (
                    <>
                      Book &amp; Pay ₹{finalFee.toLocaleString('en-IN')}
                    </>
                  )}
                </button>
                
                <span className="text-[9px] text-zinc-450 dark:text-zinc-500 text-center leading-normal mt-1 flex items-center justify-center gap-1">
                  🔒 Secured 256-bit SSL Payment Checkout
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER BOOKINGS DASHBOARD TAB */}
      {activeTab === 'my-bookings' && (
        <div className="flex flex-col gap-4">
          
          {loadingBookings ? (
            <div className="flex flex-col gap-6 items-center justify-center min-h-[250px] py-12">
              <div className="w-8 h-8 border-4 border-maroon-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-zinc-550 dark:text-zinc-400 font-light">Retrieving booking log...</span>
            </div>
          ) : userBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 items-stretch">
              {userBookings.map((booking) => {
                const astrologer = getAstrologerById(booking.astrologer_id);
                
                const isApproved = booking.status === 'approved';
                const isCancelled = booking.status === 'cancelled';
                const isPending = booking.status === 'pending';

                // Format slot date
                const formattedDate = new Date(booking.scheduled_date).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric', weekday: 'short'
                });

                // Simulated meet link based on booking ID
                const googleMeetUrl = `https://meet.google.com/gvv-mock-${booking.id.substring(0, 8)}`;

                return (
                  <div
                    key={booking.id}
                    className={`p-6 rounded-3xl bg-white dark:bg-zinc-900 shadow-md border flex flex-col justify-between transition-all relative overflow-hidden ${
                      isApproved 
                        ? 'border-emerald-500/30' 
                        : isCancelled 
                        ? 'border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/20 dark:bg-zinc-950/10 opacity-75' 
                        : 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/5'
                    }`}
                  >
                    
                    {/* Top Status Banner */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] text-zinc-450 uppercase font-mono">Astrologer</span>
                        <span className="text-xs font-serif font-bold text-zinc-850 dark:text-zinc-100">
                          {astrologer?.name || 'Vedic Astrologer'}
                        </span>
                      </div>
                      
                      {/* Status Badges */}
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                        isApproved
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-900/10'
                          : isCancelled
                          ? 'bg-zinc-100 text-zinc-450 border-zinc-900/10 dark:bg-zinc-800 dark:text-zinc-400'
                          : 'bg-amber-500/10 text-amber-600 border-amber-900/10 animate-pulse'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="h-px bg-zinc-100 dark:bg-zinc-800/80 my-3" />

                    {/* Booked Date details */}
                    <div className="flex flex-col gap-2.5 text-xs text-left font-light text-zinc-650 dark:text-zinc-350 leading-relaxed mb-6">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-zinc-400 shrink-0" />
                        <span>
                          <strong className="font-semibold text-zinc-800 dark:text-zinc-200">Date:</strong> {formattedDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-zinc-400 shrink-0" />
                        <span>
                          <strong className="font-semibold text-zinc-800 dark:text-zinc-200">Slot:</strong> {booking.scheduled_slot}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-zinc-400 shrink-0" />
                        <span>
                          <strong className="font-semibold text-zinc-800 dark:text-zinc-200">Category:</strong> {booking.booking_type === 'astrologer_consultation' ? 'Personal Consultation' : booking.booking_type}
                        </span>
                      </div>
                      
                      {/* Notes / Details */}
                      {booking.notes && (
                        <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-150/40 dark:border-zinc-850/60 w-full text-[10px] font-sans italic leading-relaxed text-zinc-500 dark:text-zinc-400">
                          {booking.notes}
                        </div>
                      )}
                    </div>

                    {/* CTA Actions */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-3 border-t border-zinc-100 dark:border-zinc-850 pt-4">
                      {isApproved && (
                        <>
                          <a
                            href={googleMeetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-center text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow transition-all flex items-center justify-center gap-1.5 focus:outline-none"
                          >
                            <Video className="h-4 w-4" />
                            Join Video Call
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="px-4 py-2 border border-red-500/20 hover:bg-red-500/5 text-red-650 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 focus:outline-none"
                          >
                            {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        </>
                      )}

                      {isPending && (
                        <>
                          <button
                            disabled
                            className="flex-1 py-2 px-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-xl text-center text-[10px] font-bold uppercase tracking-wider cursor-default"
                          >
                            Awaiting Gateway Capture
                          </button>
                          
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950/20 text-zinc-650 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 focus:outline-none"
                          >
                            Discard
                          </button>
                        </>
                      )}

                      {isCancelled && (
                        <button
                          disabled
                          className="w-full py-2 px-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-xl text-center text-[10px] font-bold uppercase tracking-wider cursor-default"
                        >
                          Booking Cancelled
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-850 rounded-3xl min-h-[300px] gap-3 text-center p-4">
              <Calendar className="h-10 w-10 text-zinc-300 dark:text-zinc-700 animate-bounce" />
              <div className="flex flex-col gap-1 max-w-sm">
                <span className="font-serif font-bold text-zinc-600 dark:text-zinc-400 text-sm">No bookings found</span>
                <p className="text-xs text-zinc-500 leading-normal font-light">
                  You have not scheduled any astrologer consultations yet. Go to the "Book Consultation" tab to schedule your first session.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
