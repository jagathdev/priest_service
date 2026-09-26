"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type PaymentState = 'idle' | 'processing' | 'success' | 'error';

export default function USDPaymentModal({
  isOpen,
  onClose,
  amount,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  amount?: string;
  title?: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'saved_cards' | 'credit_card'>('saved_cards');
  const [useWallet, setUseWallet] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [selectedCard, setSelectedCard] = useState('1');
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const MOCK_SAVED_CARDS = [
    { id: '1', last4: '4242', expiry: 'Nov, 2040', brand: 'visa' }
  ];

  const walletBalance = 110963.62;
  const orderTotal = amount ? parseFloat(amount) : 10000.00;
  const orderTitle = title || 'Puja Booking';

  // ── Mock pay handler (replace with real API once backend is ready) ──
  const handlePay = async () => {
    if (!acceptedPolicy) return;
    setPaymentState('processing');
    setErrorMsg('');

    // Simulate API call — replace with: POST /api/payment/create-usd-order
    await new Promise((res) => setTimeout(res, 2500));

    // Mock: 90% success, 10% failure for demo
    const success = Math.random() > 0.1;
    if (success) {
      setPaymentState('success');
      // After 1.5s, redirect to success page
      setTimeout(() => {
        router.push(`/payment/success?paymentId=USD_MOCK_${Date.now()}&amount=${orderTotal}&title=${encodeURIComponent(orderTitle)}`);
      }, 1500);
    } else {
      setPaymentState('error');
      setErrorMsg('Your card was declined. Please try a different card or contact your bank.');
    }
  };

  // ── SUCCESS state ──
  if (paymentState === 'success') {
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-md p-10 text-center shadow-2xl">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 text-sm mb-1">Amount Paid: <span className="font-bold text-gray-800">US $ {orderTotal.toFixed(2)}</span></p>
          <p className="text-gray-400 text-sm">Redirecting you to confirmation...</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-md w-full max-w-[850px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">

        {/* Header */}
        <div className="bg-[#615BFF] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <span className="bg-white text-[#615BFF] font-bold w-6 h-6 flex items-center justify-center text-sm rounded-sm">3</span>
            <h2 className="font-bold tracking-wide uppercase text-sm">Order Summary and Payment</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-bold text-sm tracking-wide">Total: US $ {orderTotal.toFixed(2)}</div>
            <button onClick={onClose} disabled={paymentState === 'processing'} className="text-white hover:text-gray-200 transition-colors disabled:opacity-40">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAFAFA]">

          {/* Order Summary Block */}
          <div className="bg-white border border-gray-200 rounded-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-5 mb-5 gap-4">
              <div className="flex gap-5 items-center">
                <div className="text-[#EA580C]">
                  <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-[15px]">{orderTitle}</h3>
                </div>
              </div>
              <div className="text-gray-800 text-[15px]">US $ {orderTotal.toFixed(2)}</div>
            </div>
            <div className="flex flex-col items-end gap-2.5 text-gray-800">
              <div className="text-[14px]">Sub Total: <span className="font-bold ml-3">US $ {orderTotal.toFixed(2)}</span></div>
              <div className="text-[16px]">Total: <span className="font-bold ml-3">US $ {orderTotal.toFixed(2)}</span></div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="flex flex-col md:flex-row gap-0 bg-white border border-gray-200 rounded-sm overflow-hidden min-h-[380px]">

            {/* Tabs sidebar */}
            <div className="w-full md:w-[200px] flex flex-col shrink-0 border-r border-gray-200">
              <div className="h-8 border-b border-gray-200 bg-white" />
              <button
                onClick={() => setActiveTab('saved_cards')}
                className={`py-4 px-5 text-left text-[13px] font-bold transition-colors border-b border-gray-200 ${activeTab === 'saved_cards' ? 'bg-[#615BFF] text-white' : 'bg-[#B0B0B0] text-white hover:bg-gray-400'}`}
              >
                Saved Credit Cards
              </button>
              <button
                onClick={() => setActiveTab('credit_card')}
                className={`py-4 px-5 text-left text-[13px] font-bold transition-colors border-b border-gray-200 ${activeTab === 'credit_card' ? 'bg-[#615BFF] text-white' : 'bg-[#B0B0B0] text-white hover:bg-gray-400'}`}
              >
                CreditCard
              </button>
              <div className="flex-1 bg-white" />
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 md:p-7">

              {/* Wallet usage */}
              <div className="mb-5">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[13px] text-gray-900">
                  <input type="checkbox" checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} className="w-3.5 h-3.5 cursor-pointer accent-blue-600" />
                  Use AstroVed Wallet
                </label>
                <p className="text-[13px] font-bold mt-1.5 pl-5">
                  Available wallet balance: <span className="text-[#EA580C]">US $ {walletBalance.toFixed(2)}</span>
                </p>
              </div>

              {/* Supported Card logos */}
              <div className="flex flex-wrap items-center gap-3 mb-5 border-b border-dashed border-gray-200 pb-4">
                <span className="text-[13px] text-gray-900 mr-1">Pay using Credit Card</span>
                <div className="flex gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 bg-[#14295B] text-white text-[10px] font-bold italic rounded-sm">VISA</span>
                  <span className="px-2 py-0.5 bg-[#EB001B] text-white text-[10px] font-bold rounded-sm">MasterCard</span>
                  <span className="px-2 py-0.5 bg-[#0070CE] text-white text-[10px] font-bold rounded-sm">AMEX</span>
                  <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-sm">DISCOVER</span>
                </div>
              </div>

              {/* Saved Cards View */}
              {activeTab === 'saved_cards' && (
                <div>
                  <h4 className="text-gray-800 mb-4 text-[14px]">Your Saved Cards</h4>
                  <div className="space-y-2.5">
                    {MOCK_SAVED_CARDS.map(card => (
                      <div key={card.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-sm bg-white">
                        <input
                          type="radio"
                          name="saved_card"
                          checked={selectedCard === card.id}
                          onChange={() => setSelectedCard(card.id)}
                          className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                        />
                        <span className="text-gray-400 text-[13px] tracking-widest font-mono flex-1">{'*'.repeat(12)}{card.last4}</span>
                        <span className="text-gray-700 text-[13px] font-medium px-3">{card.expiry}</span>
                        <span className="px-2 py-0.5 bg-[#14295B] text-white text-[10px] font-bold italic rounded-sm uppercase">{card.brand}</span>
                        <button className="text-blue-400 hover:text-red-500 font-bold px-2 text-[14px]">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Credit Card Form */}
              {activeTab === 'credit_card' && (
                <div className="space-y-3.5">
                  <input
                    type="text"
                    placeholder="Enter Card Number"
                    maxLength={19}
                    disabled={paymentState === 'processing'}
                    className="w-full border border-gray-300 p-2.5 text-[13px] rounded-sm outline-none focus:border-[#615BFF] text-gray-700 disabled:bg-gray-50"
                  />
                  <div className="flex gap-3">
                    <select disabled={paymentState === 'processing'} className="flex-1 border border-gray-300 p-2.5 text-[13px] rounded-sm outline-none focus:border-[#615BFF] bg-white text-gray-700 disabled:bg-gray-50">
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={String(m).padStart(2, '0')}>{String(m).padStart(2, '0')}</option>
                      ))}
                    </select>
                    <select disabled={paymentState === 'processing'} className="flex-1 border border-gray-300 p-2.5 text-[13px] rounded-sm outline-none focus:border-[#615BFF] bg-white text-gray-700 disabled:bg-gray-50">
                      <option value="">YYYY</option>
                      {Array.from({ length: 12 }, (_, i) => 2026 + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="CVV"
                      maxLength={4}
                      disabled={paymentState === 'processing'}
                      className="w-24 border border-gray-300 p-2.5 text-[13px] rounded-sm outline-none focus:border-[#615BFF] text-gray-700 disabled:bg-gray-50"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-[13px] font-bold text-gray-900 pt-1">
                    <input type="checkbox" disabled={paymentState === 'processing'} className="w-3.5 h-3.5 cursor-pointer accent-blue-600" />
                    Save Card Details For Easy Checkout
                  </label>
                </div>
              )}

              {/* Error alert */}
              {paymentState === 'error' && errorMsg && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-sm p-3 text-[13px] text-red-700 font-semibold flex items-start gap-2">
                  <span className="text-red-500 shrink-0 mt-0.5">⚠</span>
                  {errorMsg}
                  <button onClick={() => { setPaymentState('idle'); setErrorMsg(''); }} className="ml-auto text-red-400 hover:text-red-600 font-bold shrink-0">✕</button>
                </div>
              )}

              {/* Footer / Pay Button */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer text-[13px] font-bold text-gray-900 mb-5">
                  <input
                    type="checkbox"
                    checked={acceptedPolicy}
                    onChange={(e) => setAcceptedPolicy(e.target.checked)}
                    disabled={paymentState === 'processing'}
                    className="w-3.5 h-3.5 cursor-pointer accent-blue-600"
                  />
                  <span>
                    I accept the <a href="/disclaimer" className="text-blue-700 hover:underline" target="_blank">Disclaimer</a> and{' '}
                    <a href="/privacy" className="text-blue-700 hover:underline" target="_blank">Privacy Policy</a>
                  </span>
                </label>
                <button
                  onClick={handlePay}
                  disabled={!acceptedPolicy || paymentState === 'processing'}
                  className="bg-[#615BFF] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-sm hover:bg-[#4f48e8] active:scale-[0.98] transition-all text-[15px] tracking-wide flex items-center gap-3"
                >
                  {paymentState === 'processing' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white shrink-0" />
                      Processing...
                    </>
                  ) : (
                    `PAY US $ ${orderTotal.toFixed(2)}`
                  )}
                </button>
              </div>

            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-6 text-[13px]">
            <h4 className="font-bold underline mb-3 text-black underline-offset-4">Please Note</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-800 mb-6 leading-relaxed">
              <li>Please do not re-submit your payment details, as you may be charged an additional time</li>
              <li>Please refrain from pressing the refresh button while your order is being processed</li>
              <li>Should your payment be consistently declined, please reach out to your payment provider</li>
              <li>For inquiries, contact our support team at <a href="mailto:support@astroved.com" className="text-blue-700 hover:underline font-medium">support@astroved.com</a></li>
            </ul>
            <div className="bg-[#FFF9C4] border border-[#FBE9A7] px-4 py-3 rounded-sm flex items-start gap-3">
              <span className="text-orange-500 font-bold border border-orange-500 rounded-full w-[18px] h-[18px] flex items-center justify-center text-[10px] shrink-0 mt-[2px]">i</span>
              <p className="font-bold text-gray-900 leading-snug">In the next step, please don&apos;t forget to complete the remedy details required to fulfill your order.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
