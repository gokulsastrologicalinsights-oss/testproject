'use client';

import { useState, useEffect } from 'react';
import { 
  Star, Sparkles, ShieldCheck, Check, 
  Calendar, Clock, CreditCard, ChevronRight, 
  AlertCircle, ArrowLeft, Loader2, Tag
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCheckout } from '@/hooks/useCheckout';
import { FEATURED_PROFILE_PRICES } from '@/constants/payments';
import Link from 'next/link';

export default function PromoteProfilePage() {
  const [loading, setLoading] = useState(true);
  const [dbUserId, setDbUserId] = useState<string>('');
  const [profile, setProfile] = useState<any>(null);
  const [activeBoost, setActiveBoost] = useState<any>(null);

  // Checkout States
  const [selectedDays, setSelectedDays] = useState<15 | 30>(30);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [appliedCouponId, setAppliedCouponId] = useState<string | null>(null);

  const { initiateCheckout, loading: checkoutLoading, error: checkoutError, setError: setCheckoutError } = useCheckout();

  const basePrice = selectedDays === 30 ? FEATURED_PROFILE_PRICES.DAYS_30 : FEATURED_PROFILE_PRICES.DAYS_15;
  const gstAmount = Math.round((basePrice - discount) * 0.18);
  const totalAmount = Math.max(0, basePrice - discount + gstAmount);

  const loadBoostData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Resolve user ID
      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      const currentUserId = userRow?.id || user.id;
      setDbUserId(currentUserId);

      // 2. Fetch profile details
      const { data: pRow } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUserId)
        .maybeSingle();

      setProfile(pRow);

      // 3. Fetch active boost status
      const { data: boostRow } = await supabase
        .from('featured_profiles')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('is_active', true)
        .gt('end_date', new Date().toISOString())
        .order('end_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      setActiveBoost(boostRow);
    } catch (err) {
      console.error('Error fetching boost status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoostData();
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponError(null);
    setCouponSuccess(null);
    setDiscount(0);
    setAppliedCouponId(null);

    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .gt('expiry_date', new Date().toISOString())
        .maybeSingle();

      if (error || !coupon) {
        setCouponError('Invalid, expired, or inactive coupon code.');
        return;
      }

      if (coupon.uses_count >= coupon.max_uses) {
        setCouponError('This coupon usage limit has been exceeded.');
        return;
      }

      let discountVal = 0;
      if (coupon.discount_type === 'percentage') {
        discountVal = Math.round((basePrice * Number(coupon.discount_value)) / 100);
      } else {
        discountVal = Math.round(Number(coupon.discount_value));
      }

      setDiscount(discountVal);
      setAppliedCouponId(coupon.id);
      setCouponSuccess(`Coupon applied! Saved ₹${discountVal.toLocaleString('en-IN')}`);
    } catch (err) {
      setCouponError('Error verifying coupon. Please try again.');
    }
  };

  const handleCheckout = () => {
    setCheckoutError(null);
    initiateCheckout({
      paymentType: 'featured_profile',
      featuredDays: selectedDays,
      couponCode: couponCode ? couponCode.toUpperCase() : undefined,
      onSuccess: (data) => {
        alert('Congratulations! Your profile has been promoted to Featured status.');
        loadBoostData();
        // Reset states
        setCouponCode('');
        setDiscount(0);
        setCouponSuccess(null);
      },
      onCancel: () => {
        console.log('Payment checkout cancelled by user');
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[60vh] text-sm text-zinc-500 font-mono gap-3">
        <Loader2 className="h-8 w-8 border-4 border-maroon-500 border-t-transparent rounded-full animate-spin text-maroon-600" />
        Synchronizing promotion data...
      </div>
    );
  }

  // Calculate days remaining
  let daysRemaining = 0;
  if (activeBoost) {
    const end = new Date(activeBoost.end_date).getTime();
    const now = new Date().getTime();
    daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="flex flex-col gap-6 text-left max-w-4xl mx-auto w-full">
      {/* Back button & Page title */}
      <div className="flex flex-col gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 self-start mb-1 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Star className="h-7 w-7 text-gold-550 fill-gold-550/10" /> Promote Matrimonial Profile
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light max-w-xl">
          Get up to 10x more profile views, high compatibility alerts, and top billing on search result listings by featuring your profile.
        </p>
      </div>

      {checkoutError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-950/20 text-red-655 dark:text-red-400 text-xs font-light leading-relaxed flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
          <span>{checkoutError}</span>
        </div>
      )}

      {/* 1. Active Status Banner */}
      {activeBoost ? (
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-gold-500/10 to-amber-500/5 dark:from-zinc-900 dark:to-zinc-900/40 border-2 border-gold-400/80 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gold-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-2 z-10">
            <span className="px-3 py-1 rounded-full bg-gold-400 text-[10px] font-bold text-zinc-950 uppercase tracking-widest leading-none self-start flex items-center gap-1 shadow-sm">
              <Sparkles className="h-3 w-3 fill-zinc-950" /> Active Boost status
            </span>
            <h2 className="text-lg md:text-xl font-serif font-bold text-zinc-900 dark:text-zinc-50 mt-1">
              Your profile is featured on Gokul Vivaham
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3 text-xs text-zinc-650 dark:text-zinc-400 font-light">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gold-600" />
                <div className="flex flex-col">
                  <span className="font-semibold text-[10px] uppercase text-zinc-400">Started On</span>
                  <span>{new Date(activeBoost.start_date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold-600" />
                <div className="flex flex-col">
                  <span className="font-semibold text-[10px] uppercase text-zinc-400">Expires On</span>
                  <span>{new Date(activeBoost.end_date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                <Check className="h-4 w-4 text-emerald-600" />
                <div className="flex flex-col">
                  <span className="font-semibold text-[10px] uppercase text-zinc-400">Days Remaining</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{daysRemaining} Days</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 z-10 shrink-0">
            <div className="p-3.5 bg-white dark:bg-zinc-950 border border-sandal-200 dark:border-zinc-800 rounded-2xl flex items-center gap-2.5 shadow-sm">
              <ShieldCheck className="h-6 w-6 text-gold-600" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase text-zinc-450 leading-none">Visibility</span>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Featured Placement Active</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 2. Purchase Boost Flow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Benefits & Plan Selection */}
        <div className="md:col-span-7 flex flex-col gap-6">
          
          {/* Boost benefits card */}
          <div className="bg-white dark:bg-zinc-900 border border-sandal-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-serif font-bold text-zinc-855 dark:text-zinc-200 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-850 pb-3">
              <Sparkles className="h-4.5 w-4.5 text-gold-550 fill-gold-550" /> Why Boost Your Profile?
            </h3>
            
            <ul className="space-y-4 text-xs font-light text-zinc-650 dark:text-zinc-450">
              <li className="flex gap-3 items-start">
                <div className="p-1 rounded-lg bg-gold-400/10 text-gold-600 shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-805 dark:text-zinc-200">Homepage Carousel Placement</h4>
                  <p className="mt-0.5 leading-relaxed text-[11px]">Your profile card will rotate in our premium landing page carousel shown to all registered candidates.</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <div className="p-1 rounded-lg bg-gold-400/10 text-gold-600 shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-805 dark:text-zinc-200">Search Results Top-Billing</h4>
                  <p className="mt-0.5 leading-relaxed text-[11px]">Appear first in candidate lists when other users search matches matching your parameters.</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <div className="p-1 rounded-lg bg-gold-400/10 text-gold-600 shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-805 dark:text-zinc-200">Featured Profile Badge</h4>
                  <p className="mt-0.5 leading-relaxed text-[11px]">Stand out visually on dashboard recommendations with a dedicated gold star featured badge.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Choose Duration */}
          <div className="bg-white dark:bg-zinc-900 border border-sandal-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-serif font-bold text-zinc-855 dark:text-zinc-200">
              Select Promotion Duration
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
              {/* Option 1: 15 Days */}
              <button
                onClick={() => setSelectedDays(15)}
                className={`p-5 rounded-2xl border text-left flex flex-col gap-1 transition-all relative overflow-hidden cursor-pointer focus:outline-none ${
                  selectedDays === 15 
                    ? 'border-gold-555 bg-gold-555/5 ring-1 ring-gold-555 shadow-sm' 
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-950/20'
                }`}
              >
                <span className="text-xs font-mono font-bold text-zinc-450 uppercase tracking-widest">Standard Boost</span>
                <span className="text-lg font-serif font-black text-zinc-855 dark:text-zinc-100 mt-1">15 Days Promotion</span>
                <span className="text-xl font-bold text-maroon-700 dark:text-gold-450 mt-2">₹{FEATURED_PROFILE_PRICES.DAYS_15}</span>
                <span className="text-[10px] text-zinc-500 font-light mt-0.5">Approx. ₹53 / day</span>
              </button>

              {/* Option 2: 30 Days */}
              <button
                onClick={() => setSelectedDays(30)}
                className={`p-5 rounded-2xl border text-left flex flex-col gap-1 transition-all relative overflow-hidden cursor-pointer focus:outline-none ${
                  selectedDays === 30 
                    ? 'border-gold-555 bg-gold-555/5 ring-1 ring-gold-555 shadow-sm' 
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-950/20'
                }`}
              >
                <div className="absolute top-0 right-4 transform -translate-y-1/2 bg-gold-400 text-[8px] font-black text-zinc-950 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Best Value
                </div>
                <span className="text-xs font-mono font-bold text-zinc-450 uppercase tracking-widest">Premium Boost</span>
                <span className="text-lg font-serif font-black text-zinc-855 dark:text-zinc-100 mt-1">30 Days Promotion</span>
                <span className="text-xl font-bold text-maroon-700 dark:text-gold-450 mt-2">₹{FEATURED_PROFILE_PRICES.DAYS_30}</span>
                <span className="text-[10px] text-zinc-500 font-light mt-0.5">Approx. ₹50 / day (Save 10%)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Billing Summary & Payment */}
        <div className="md:col-span-5 flex flex-col gap-6">
          
          <div className="bg-white dark:bg-zinc-900 border border-sandal-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm flex flex-col gap-5 text-left">
            <h3 className="text-base font-serif font-bold text-zinc-855 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-850 pb-3">
              Order Details
            </h3>

            {/* Coupon Code Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Have a Coupon Code?</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="ENTER CODE"
                    className="w-full pl-8 pr-3 h-9 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-maroon-500 uppercase"
                  />
                  <Tag className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={!couponCode}
                  className="px-3.5 h-9 rounded-xl bg-zinc-805 dark:bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-40"
                >
                  Apply
                </button>
              </div>
              {couponError && <span className="text-[10px] text-red-500 font-light flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {couponError}</span>}
              {couponSuccess && <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><Check className="h-3 w-3" /> {couponSuccess}</span>}
            </div>

            <div className="h-px bg-zinc-100 dark:bg-zinc-850/80 my-1" />

            {/* Order Price Details */}
            <div className="flex flex-col gap-3.5 text-xs text-zinc-650 dark:text-zinc-400 font-light">
              <div className="flex justify-between items-center">
                <span>Featured Profile ({selectedDays} Days)</span>
                <span className="font-semibold text-zinc-805 dark:text-zinc-205">₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-650 dark:text-emerald-400 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>GST (18%)</span>
                <span>₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="h-px bg-zinc-100 dark:bg-zinc-850/80 my-1" />

              <div className="flex justify-between items-end text-sm">
                <span className="font-bold text-zinc-855 dark:text-zinc-200">Grand Total</span>
                <span className="text-lg font-bold text-maroon-700 dark:text-gold-450 font-serif font-black">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full py-3 rounded-full luxury-gradient text-white text-xs font-bold uppercase tracking-widest shadow-md hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" /> Launching Checkout...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" /> Secure Checkout
                </>
              )}
            </button>
            <span className="text-[9px] text-zinc-450 font-light text-center leading-normal">
              By checking out, you agree to our Terms of Service &amp; Refund Policy. Secure 256-bit SSL encrypted transaction via Razorpay.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
