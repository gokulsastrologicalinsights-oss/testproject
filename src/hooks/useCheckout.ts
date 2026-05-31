'use client';

import { useState } from 'react';
import { useAuth } from './useAuth';

export interface CheckoutParams {
  paymentType: 'subscription' | 'featured_profile' | 'consultation';
  planId?: string;
  couponCode?: string;
  bookingDetails?: any;
  featuredDays?: number;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export function useCheckout() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openSimulatedCheckout = (orderData: any, params: CheckoutParams) => {
    // 1. Create overlay container
    const container = document.createElement('div');
    container.id = 'simulated-razorpay-modal';
    container.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-zinc-950/60 animate-fade-in';
    
    // Inject dynamic CSS transitions
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleUp {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .animate-fade-in {
        animation: fadeIn 0.2s ease-out forwards;
      }
      .animate-scale-up {
        animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .tab-active {
        border-bottom: 2px solid #800020;
        color: #800020 !important;
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);

    // Structure simulated Razorpay frame with premium Gokul Vivaham branding
    container.innerHTML = `
      <div class="bg-white dark:bg-zinc-900 border border-sandal-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-up flex flex-col font-sans">
        <!-- Header banner matching Razorpay styling -->
        <div class="luxury-gradient px-6 py-5 flex justify-between items-center text-white">
          <div class="text-left">
            <h2 class="text-sm font-bold tracking-widest uppercase font-serif">Gokul Vivaham</h2>
            <p class="text-[9px] text-zinc-300 tracking-wider font-light mt-0.5">SECURE SIMULATED PAYMENT SANDBOX</p>
          </div>
          <button id="close-sim-modal" class="text-zinc-300 hover:text-white focus:outline-none cursor-pointer p-1 rounded-full hover:bg-white/10 transition-colors">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Order Summary -->
        <div class="bg-sandal-50/40 dark:bg-zinc-950/40 px-6 py-4 border-b border-sandal-200/30 dark:border-zinc-800/80 flex justify-between items-center text-xs">
          <div class="flex flex-col text-left gap-1">
            <span class="text-zinc-500 dark:text-zinc-500 font-light text-[10px] uppercase tracking-wider">Item Description</span>
            <span class="text-zinc-800 dark:text-zinc-200 font-semibold">${orderData.description}</span>
          </div>
          <div class="flex flex-col text-right gap-1">
            <span class="text-zinc-500 dark:text-zinc-500 font-light text-[10px] uppercase tracking-wider">Amount Due</span>
            <span class="text-maroon-700 dark:text-gold-450 font-extrabold text-base">₹${(orderData.amount / 100).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <!-- Payment Methods Tabs -->
        <div class="flex border-b border-zinc-150 dark:border-zinc-800/60 text-xs">
          <button id="tab-card" class="flex-1 py-3 text-center border-b-2 tab-active text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer transition-colors">Card</button>
          <button id="tab-upi" class="flex-1 py-3 text-center border-b-2 border-transparent text-zinc-500 dark:text-zinc-400 focus:outline-none cursor-pointer transition-colors">UPI / QR</button>
          <button id="tab-nb" class="flex-1 py-3 text-center border-b-2 border-transparent text-zinc-500 dark:text-zinc-400 focus:outline-none cursor-pointer transition-colors">Netbanking</button>
        </div>

        <!-- Tab contents -->
        <div class="p-6 flex-1 text-left flex flex-col justify-center min-h-[160px]">
          
          <!-- Card Details Content -->
          <div id="content-card" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Card Number</label>
              <input type="text" value="4111 •••• •••• 1111" class="w-full px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs dark:bg-zinc-950 focus:outline-none font-mono text-zinc-700 dark:text-zinc-300" readonly />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Expiry (MM/YY)</label>
                <input type="text" value="12/30" class="w-full px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs dark:bg-zinc-950 focus:outline-none font-mono text-zinc-700 dark:text-zinc-300" readonly />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">CVV</label>
                <input type="text" value="•••" class="w-full px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs dark:bg-zinc-950 focus:outline-none font-mono text-zinc-700 dark:text-zinc-300" readonly />
              </div>
            </div>
          </div>

          <!-- UPI Details Content -->
          <div id="content-upi" class="hidden flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">UPI Address (VPA)</label>
              <input type="text" value="demo@gokulupi" class="w-full px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs dark:bg-zinc-950 focus:outline-none font-mono text-zinc-700 dark:text-zinc-300" readonly />
            </div>
            <p class="text-[10px] text-zinc-450 dark:text-zinc-500 leading-normal font-light">
              Payment notification request will be sent to this virtual payment address.
            </p>
          </div>

          <!-- Netbanking Details Content -->
          <div id="content-nb" class="hidden flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Select Bank</label>
              <select class="w-full px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 focus:outline-none cursor-pointer">
                <option>State Bank of India</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
              </select>
            </div>
          </div>

          <!-- Loading Spinner -->
          <div id="sim-spinner" class="hidden flex flex-col items-center justify-center py-4 gap-3">
            <div class="w-8 h-8 border-3 border-maroon-600 border-t-transparent rounded-full animate-spin"></div>
            <span id="spinner-text" class="text-xs text-zinc-500 dark:text-zinc-400 font-light tracking-wide">Processing test transaction...</span>
          </div>

          <!-- Error Alert Banner -->
          <div id="sim-error" class="hidden p-3 rounded-2xl bg-red-500/10 border border-red-950/20 text-red-650 dark:text-red-400 text-xs font-light leading-relaxed"></div>
        </div>

        <!-- Footer Actions -->
        <div class="px-6 pb-6 pt-3 border-t border-zinc-150 dark:border-zinc-800/60 flex flex-col gap-4">
          <div id="action-buttons" class="flex flex-col sm:flex-row gap-3">
            <button id="sim-fail" class="flex-1 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950/20 text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider cursor-pointer transition-colors focus:outline-none">
              Decline
            </button>
            <button id="sim-success" class="flex-1 py-2.5 rounded-full luxury-gradient text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow hover:opacity-95 transition-all focus:outline-none">
              Authorize
            </button>
          </div>
          
          <button id="sim-cancel" class="text-zinc-400 hover:text-zinc-650 dark:text-zinc-500 dark:hover:text-zinc-300 text-[10px] font-bold tracking-wider uppercase cursor-pointer hover:underline focus:outline-none self-center">
            Cancel Payment
          </button>

          <div class="flex flex-col gap-2 items-center justify-center">
            <div class="flex items-center justify-center gap-1 text-[9px] text-zinc-400 dark:text-zinc-500 tracking-wide">
              <svg class="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Razorpay Simulated Mode Sandbox Environment</span>
            </div>
            <a href="https://razorpay.me/@gokulmurugan" target="_blank" rel="noopener noreferrer" class="mt-1 text-[10px] font-bold text-maroon-700 dark:text-gold-450 hover:underline flex items-center gap-1">
              💳 Pay via Official Razorpay Page: razorpay.me/@gokulmurugan
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Event Handlers for Tabs switching
    const tabCard = document.getElementById('tab-card')!;
    const tabUpi = document.getElementById('tab-upi')!;
    const tabNb = document.getElementById('tab-nb')!;

    const contentCard = document.getElementById('content-card')!;
    const contentUpi = document.getElementById('content-upi')!;
    const contentNb = document.getElementById('content-nb')!;

    const switchTab = (activeTab: HTMLElement, activeContent: HTMLElement, inactiveTabs: HTMLElement[], inactiveContents: HTMLElement[]) => {
      activeTab.classList.add('tab-active');
      activeTab.classList.remove('border-transparent', 'text-zinc-500', 'dark:text-zinc-400');
      activeContent.classList.remove('hidden');

      inactiveTabs.forEach(t => {
        t.classList.remove('tab-active');
        t.classList.add('border-transparent', 'text-zinc-500', 'dark:text-zinc-400');
      });
      inactiveContents.forEach(c => c.classList.add('hidden'));
    };

    tabCard.onclick = () => switchTab(tabCard, contentCard, [tabUpi, tabNb], [contentUpi, contentNb]);
    tabUpi.onclick = () => switchTab(tabUpi, contentUpi, [tabCard, tabNb], [contentCard, contentNb]);
    tabNb.onclick = () => switchTab(tabNb, contentNb, [tabCard, tabUpi], [contentCard, contentUpi]);

    // Handle closing/cancellation
    const dismissModal = () => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };

    const closeBtn = document.getElementById('close-sim-modal')!;
    const cancelBtn = document.getElementById('sim-cancel')!;
    
    const handleCancel = () => {
      dismissModal();
      setLoading(false);
      if (params.onCancel) {
        params.onCancel();
      }
    };

    closeBtn.onclick = handleCancel;
    cancelBtn.onclick = handleCancel;

    // Payment verification triggers
    const btnSuccess = document.getElementById('sim-success')!;
    const btnFail = document.getElementById('sim-fail')!;
    const spinner = document.getElementById('sim-spinner')!;
    const spinnerText = document.getElementById('spinner-text')!;
    const errorAlert = document.getElementById('sim-error')!;
    const actionButtons = document.getElementById('action-buttons')!;

    btnSuccess.onclick = async () => {
      // Show loading spinner
      actionButtons.classList.add('hidden');
      cancelBtn.classList.add('hidden');
      contentCard.classList.add('hidden');
      contentUpi.classList.add('hidden');
      contentNb.classList.add('hidden');
      tabCard.classList.add('hidden');
      tabUpi.classList.add('hidden');
      tabNb.classList.add('hidden');
      errorAlert.classList.add('hidden');
      
      spinner.classList.remove('hidden');
      spinnerText.innerText = 'Contacting simulated gateway bank...';

      // 1.2s spinner delay for premium UX
      await new Promise(r => setTimeout(r, 1200));

      spinnerText.innerText = 'Verifying payment ledger with server...';

      try {
        const razorpay_payment_id = `pay_mock_${Math.random().toString(36).substring(2, 11)}`;
        const razorpay_signature = `mock_sig_${orderData.orderId}_${razorpay_payment_id}`;

        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id,
            razorpay_signature,
          }),
        });

        if (!verifyRes.ok) {
          const verifyErr = await verifyRes.json();
          throw new Error(verifyErr.error || 'Payment signature verification failed');
        }

        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          // Sync mock database tables in localStorage
          if (verifyData.subscription) {
            try {
              const subsKey = 'gokul_mock_subscriptions';
              const existingSubs = JSON.parse(localStorage.getItem(subsKey) || '[]');
              const updatedSubs = existingSubs.map((s: any) => ({ ...s, payment_status: 'Expired' }));
              updatedSubs.push(verifyData.subscription);
              localStorage.setItem(subsKey, JSON.stringify(updatedSubs));
            } catch (e) { console.error('Error syncing mock subscriptions:', e); }
          }

          if (verifyData.transaction) {
            try {
              const txsKey = 'gokul_mock_transactions';
              const existingTxs = JSON.parse(localStorage.getItem(txsKey) || '[]');
              existingTxs.push(verifyData.transaction);
              localStorage.setItem(txsKey, JSON.stringify(existingTxs));
            } catch (e) { console.error('Error syncing mock transactions:', e); }
          }

          try {
            const profilesKey = 'gokul_mock_profiles';
            const existingProfiles = JSON.parse(localStorage.getItem(profilesKey) || '[]');
            const updatedProfiles = existingProfiles.map((p: any) => ({ ...p, is_premium: true }));
            localStorage.setItem(profilesKey, JSON.stringify(updatedProfiles));
          } catch (e) {}

          // Update session cookies & role in mockAuth token
          if (verifyData.newRole && typeof window !== 'undefined') {
            const saved = localStorage.getItem('gokul_mock_session');
            if (saved) {
              const session = JSON.parse(saved);
              session.user.user_metadata.role = verifyData.newRole;
              session.user.role = verifyData.newRole;
              
              const safeBtoa = (str: string) => {
                if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
                  return window.btoa(str);
                }
                return Buffer.from(str).toString('base64');
              };
              const generateMockJwt = (user: any) => {
                const header = safeBtoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
                const payload = safeBtoa(JSON.stringify({
                  sub: user.id,
                  email: user.email,
                  user_metadata: user.user_metadata,
                  role: user.user_metadata?.role || 'user'
                }));
                const signature = 'mock-signature';
                return `${header}.${payload}.${signature}`;
              };

              session.access_token = generateMockJwt(session.user);
              localStorage.setItem('gokul_mock_session', JSON.stringify(session));
              
              const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
              document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secureFlag}`;
            }
          }

          dismissModal();
          setLoading(false);
          if (params.onSuccess) {
            params.onSuccess(verifyData);
          }
        } else {
          throw new Error('Payment capture validation returned unsuccessful');
        }
      } catch (err: any) {
        // Render error, allow retry
        spinner.classList.add('hidden');
        errorAlert.classList.remove('hidden');
        errorAlert.innerText = err.message || 'Verification failed. Please retry.';
        
        actionButtons.classList.remove('hidden');
        cancelBtn.classList.remove('hidden');
        tabCard.classList.remove('hidden');
        tabUpi.classList.remove('hidden');
        tabNb.classList.remove('hidden');

        const activeTab = [tabCard, tabUpi, tabNb].find(t => t.classList.contains('tab-active'))!;
        if (activeTab === tabCard) contentCard.classList.remove('hidden');
        if (activeTab === tabUpi) contentUpi.classList.remove('hidden');
        if (activeTab === tabNb) contentNb.classList.remove('hidden');

        setError(err.message || 'Payment verification failed');
      }
    };

    btnFail.onclick = async () => {
      actionButtons.classList.add('hidden');
      cancelBtn.classList.add('hidden');
      contentCard.classList.add('hidden');
      contentUpi.classList.add('hidden');
      contentNb.classList.add('hidden');
      tabCard.classList.add('hidden');
      tabUpi.classList.add('hidden');
      tabNb.classList.add('hidden');
      errorAlert.classList.add('hidden');
      
      spinner.classList.remove('hidden');
      spinnerText.innerText = 'Declining payment authorization...';

      await new Promise(r => setTimeout(r, 850));
      
      dismissModal();
      setLoading(false);
      setError('Payment transaction failed at gateway level (Declined by Sandbox user).');
    };
  };

  const initiateCheckout = async (params: CheckoutParams) => {
    setLoading(true);
    setError(null);

    try {
      if (!isAuthenticated) {
        throw new Error('Please login to purchase membership packages.');
      }

      // 1. Request Order Creation on Server
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentType: params.paymentType,
          planId: params.planId,
          couponCode: params.couponCode,
          bookingDetails: params.bookingDetails,
          featuredDays: params.featuredDays,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to initialize payment transaction');
      }

      const orderData = await res.json();

      // 2. Open payment modal (Check if placeholder keys are active)
      if (orderData.keyId === 'rzp_test_placeholderid') {
        openSimulatedCheckout(orderData, params);
        return;
      }

      // Real Mode - Load SDK dynamically
      const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay Checkout SDK. Please check your network connection.');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Gokul Vivaham',
        description: orderData.description,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          setLoading(true);
          try {
            // Post verification payload to Server
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              const verifyErr = await verifyRes.json();
              throw new Error(verifyErr.error || 'Payment verification failed');
            }

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              setLoading(false);
              if (params.onSuccess) {
                params.onSuccess(verifyData);
              }
            } else {
              throw new Error('Verification failed. Payment status is invalid.');
            }
          } catch (err: any) {
            setError(err.message || 'Payment verification failed');
            setLoading(false);
          }
        },
        prefill: {
          name: orderData.user.name,
          email: orderData.user.email,
          contact: orderData.user.phone,
        },
        theme: {
          color: '#800020', // Signature Maroon Accent
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            if (params.onCancel) {
              params.onCancel();
            }
          },
        },
      };

      const paymentObject = new (window as any).Razorpay(options);

      paymentObject.on('payment.failed', function (response: any) {
        setError(response.error.description || 'Payment transaction failed at gateway level');
        setLoading(false);
      });

      paymentObject.open();

    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout setup');
      setLoading(false);
    }
  };

  return {
    initiateCheckout,
    loading,
    error,
    setError,
  };
}
