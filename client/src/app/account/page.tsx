"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";

interface User {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  mobileNumber?: string;
  gender?: string;
  dob?: string;
  placeOfBirth?: string;
  occupation?: string;
  addresses?: Address[];
}

export interface Address {
  _id?: string;
  id?: string;
  type?: string;
  name?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  address?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  isDefault?: boolean;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<User>({});
  const [saving, setSaving] = useState(false);

  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  const addresses = user?.addresses || [];
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    _id: "",
    type: "Home",
    fullName: "",
    phone: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false
  });
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [openFaq, setOpenFaq] = useState<number | null>(1);

  // Still Need Help States
  const [helpFormData, setHelpFormData] = useState({
    name: "",
    mobileNumber: "",
    email: "",
    bookingId: "",
    subject: "",
    message: "",
    consent: false
  });
  const [isSubmittingHelp, setIsSubmittingHelp] = useState(false);

  const handleHelpSubmit = async () => {
    if (!helpFormData.name || !helpFormData.mobileNumber || !helpFormData.subject || !helpFormData.message || !helpFormData.consent) {
      alert("Please fill all required fields and accept the consent.");
      return;
    }
    setIsSubmittingHelp(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://priest-service.onrender.com";
      const apiUrl = process.env.NEXT_PUBLIC_API_CUSTOMERQUERIES || "/api/customerQueries";

      const res = await fetch(`${baseUrl}${apiUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...helpFormData,
          userId: user?.id || user?._id || undefined
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Your request has been submitted successfully!");
        setHelpFormData({
          name: "",
          mobileNumber: "",
          email: "",
          bookingId: "",
          subject: "",
          message: "",
          consent: false
        });
      } else {
        alert(data.message || "Failed to submit request.");
      }
    } catch (error) {
      alert("Error submitting request.");
    } finally {
      setIsSubmittingHelp(false);
    }
  };

  // Login Modal States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStep, setLoginStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useEffect(() => {
    // API call removed
  }, []);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    setIsSendingOtp(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://priest-service.onrender.com";
      const sendUrl = process.env.NEXT_PUBLIC_API_OTP_SEND || "/api/otp/sendOtp";

      const res = await fetch(`${baseUrl}${sendUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: phoneNumber }),
      });
      const data = await res.json();

      if (data.success) {
        setLoginStep('otp');
        setTimer(30);
        setOtp(['', '', '', '', '', '']);
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (error) {
      alert("Error sending OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (otpString?: string) => {
    const finalOtp = otpString || otp.join('');
    if (finalOtp.length !== 6) return;

    setIsVerifyingOtp(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://priest-service.onrender.com";
      const verifyUrl = process.env.NEXT_PUBLIC_API_OTP_VERIFY || "/api/otp/verifyOtp";

      const res = await fetch(`${baseUrl}${verifyUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: phoneNumber, otp: finalOtp }),
      });
      const data = await res.json();

      if (data.success) {
        const u = data.data?.user || {};
        setUser(u);
        setFormData(u);
        document.cookie = "userLogin=true; path=/; max-age=604800;";
        setShowLoginModal(false);
        setOtp(['', '', '', '', '', '']);
      } else {
        setOtpError(data.message || "Invalid OTP");
      }
    } catch (error) {
      setOtpError("Error verifying OTP");
    } finally {
      setIsVerifyingOtp(false);
    }
  };
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showLoginModal && loginStep === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showLoginModal, loginStep, timer]);


  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hashTab = window.location.hash.replace("#", "");
      if (["profile", "bookings", "subscriptions", "wallet", "wishlist", "address", "language"].includes(hashTab)) {
        setActiveTab(hashTab);
      }
    }
  }, []);

  const fetchWishlist = async () => {
    if (!user || (!user.id && !user._id)) return;
    setLoadingWishlist(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://priest-service.onrender.com";
      const res = await fetch(`${baseUrl}/api/wishlist/${user.id || user._id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setWishlistItems(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'wishlist' && user) {
      fetchWishlist();
    }
  }, [activeTab, user]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "https://priest-service.onrender.com"}/api/auth/logout`, { method: "POST" });
    } catch {
      // ignore
    }
    document.cookie = "userLogin=false; path=/; max-age=0;";
    setUser(null);
  };



  const handleSave = async () => {
    setSaving(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.PUBLIC_BASE_URL || "https://priest-service.onrender.com";
      const updateUrl = process.env.NEXT_PUBLIC_API_USER_UPDATE || "/api/users/updateProfile";

      const res = await fetch(`${baseUrl}${updateUrl}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          name: (formData.name || '').trim(),
          email: (formData.email || '').trim(),
          mobileNumber: (formData.mobileNumber || formData.phone || '').trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        const updatedUser = { ...user, ...data.data };
        setUser(updatedUser);
        // Mock update state
        setShowEditModal(false);
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (error) {
      alert("Error updating profile");
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!user) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://priest-service.onrender.com";

      const newAddress = {
        type: addressFormData.type,
        name: addressFormData.fullName,
        phone: addressFormData.phone,
        addressLine1: addressFormData.address,
        addressLine2: addressFormData.landmark,
        city: addressFormData.city,
        state: addressFormData.state,
        pincode: addressFormData.pincode,
        country: addressFormData.country,
        isDefault: addressFormData.isDefault
      };

      let updatedAddresses = [...(user.addresses || [])];

      if (newAddress.isDefault) {
        updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
      } else if (updatedAddresses.length === 0) {
        newAddress.isDefault = true;
      }

      if (addressFormData._id) {
        const index = updatedAddresses.findIndex(a => a._id === addressFormData._id);
        if (index > -1) {
          updatedAddresses[index] = { ...updatedAddresses[index], ...newAddress };
        }
      } else {
        updatedAddresses.push({ ...newAddress });
      }

      const payload = {
        userId: user.id || user._id,
        name: user.name || "",
        email: user.email || "",
        mobileNumber: user.mobileNumber || "",
        addresses: updatedAddresses
      };

      const updateUrl = process.env.NEXT_PUBLIC_API_USER_UPDATE || "/api/users/updateProfile";
      const res = await fetch(`${baseUrl}${updateUrl}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        const updatedUser = { ...user, ...data.data };
        setUser(updatedUser);
        // Mock update state
        setShowAddressModal(false);
      } else {
        alert(data.message || "Failed to save address");
      }
    } catch (error) {
      alert("Error saving address");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;
    if (!window.confirm("Are you sure to delete the address?")) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://priest-service.onrender.com";

      const updatedAddresses = (user.addresses || []).filter((a: Address) => a._id !== addressId && a.id !== addressId);

      if (updatedAddresses.length > 0 && !updatedAddresses.some((a: Address) => a.isDefault)) {
        updatedAddresses[0].isDefault = true;
      }

      const payload = {
        userId: user.id || user._id,
        name: user.name || "",
        email: user.email || "",
        mobileNumber: user.mobileNumber || "",
        addresses: updatedAddresses
      };

      const updateUrl = process.env.NEXT_PUBLIC_API_USER_UPDATE || "/api/users/updateProfile";
      const res = await fetch(`${baseUrl}${updateUrl}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        const updatedUser = { ...user, ...data.data };
        setUser(updatedUser);
        // Mock update state
      } else {
        alert(data.message || "Failed to delete address");
      }
    } catch (error) {
      alert("Error deleting address");
    }
  };

  const openEditAddressModal = (addr: Address) => {
    setAddressFormData({
      _id: addr._id || "",
      type: addr.type || "Home",
      fullName: addr.name || "",
      phone: addr.phone || "",
      address: addr.addressLine1 || "",
      landmark: addr.addressLine2 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      country: addr.country || "India",
      isDefault: addr.isDefault || false
    });
    setShowAddressModal(true);
  };


  const openAddAddressModal = () => {
    setAddressFormData({
      _id: "",
      type: "Home",
      fullName: "",
      phone: "",
      address: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      isDefault: false
    });
    setShowAddressModal(true);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center bg-[#fafafc]">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[#069e5d]" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fafafc] pb-16 font-sans">

        {/* ── Breadcrumb Bar ── */}
        <div className="border-b border-gray-150 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-4">
            {/* Mobile/Tablet Hamburger Toggle (Moved to Left) */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden shrink-0 flex items-center gap-1.5 text-[#069e5d] font-bold text-sm px-3 py-1.5 rounded-lg border border-[#069e5d] bg-white active:scale-95 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
              {isSidebarOpen ? "Close" : "Menu"}
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 overflow-x-auto whitespace-nowrap lg:overflow-visible lg:whitespace-normal [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <Link href="/" className="hover:text-gray-900 transition">HOME</Link>
              <span className="text-gray-300">›</span>
              <button onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} className={`transition ${activeTab === 'profile' ? 'text-gray-900 font-bold' : 'hover:text-gray-900'}`}>Account</button>
              {activeTab !== 'profile' && (
                <>
                  <span className="text-gray-300">›</span>
                  <span className="text-gray-900 font-bold">
                    {activeTab === 'bookings' && 'My Bookings'}
                    {activeTab === 'subscriptions' && 'My Subscriptions'}
                    {activeTab === 'wallet' && 'Wallet'}
                    {activeTab === 'wishlist' && 'Wishlist'}
                    {activeTab === 'address' && 'Saved Address'}
                    {activeTab === 'language' && 'Language'}
                    {activeTab === 'about' && 'About'}
                    {activeTab === 'support' && 'Support'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Container: Sidebar + Content ── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {!user ? (
            <div className="flex flex-col items-center justify-center pt-24 pb-40 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h2>
              <p className="text-gray-500 max-w-sm mb-6">You must be logged in to access your account settings and history.</p>
              <button
                onClick={() => {
                  setLoginStep('phone');
                  setPhoneNumber('');
                  setOtp(['', '', '', '', '', '']);
                  setOtpError('');
                  setShowLoginModal(true);
                }}
                className="bg-[#069e5d] text-white font-bold py-2.5 px-8 rounded-full hover:bg-[#058a51] transition"
              >
                Login Now
              </button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 items-start">

              {/* Mobile Overlay Backdrop */}
              {isSidebarOpen && (
                <div
                  className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}

              {/* ── Left Sidebar Navigation (Matching Image 3) ── */}
              <aside className={
                isSidebarOpen
                  ? "fixed top-0 left-0 z-50 h-[100dvh] w-[85%] sm:w-80 bg-white rounded-r-3xl shadow-2xl p-5 pb-28 flex flex-col gap-1.5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] lg:sticky lg:top-[120px] lg:max-h-[calc(100vh-140px)] lg:h-auto lg:w-72 lg:shrink-0 lg:rounded-2xl lg:border lg:border-gray-200 lg:shadow-xs lg:p-4"
                  : "hidden lg:flex flex-col gap-1.5 w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-gray-200 shadow-xs p-4 lg:sticky lg:top-[120px] lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              }>

                {/* Mobile Drawer Header */}
                <div className="flex items-center justify-between mb-4 lg:hidden pb-4 border-b border-gray-100">
                  <span className="text-lg font-serif font-bold text-gray-900">Account</span>
                  <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-gray-900 p-1">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Profile (Active Tab) */}
                <button
                  type="button"
                  onClick={() => { setActiveTab("profile"); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm transition ${activeTab === "profile"
                    ? "bg-[#069e5d] text-white font-bold shadow-xs"
                    : "text-gray-700 font-medium hover:bg-gray-50"
                    }`}
                >
                  <svg className={`w-4 h-4 shrink-0 ${activeTab === 'profile' ? '' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </button>

                {/* My Bookings */}
                <button
                  type="button"
                  onClick={() => { setActiveTab("bookings"); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm transition ${activeTab === "bookings"
                    ? "bg-[#069e5d] text-white font-bold shadow-xs"
                    : "text-gray-700 font-medium hover:bg-gray-50"
                    }`}
                >
                  <svg className={`w-4 h-4 shrink-0 ${activeTab === 'bookings' ? '' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V9a2 2 0 012-2h2a2 2 0 012 2v12" />
                  </svg>
                  <span>My Bookings</span>
                </button>

                {/* My Subscriptions */}
                <button
                  type="button"
                  onClick={() => { setActiveTab("subscriptions"); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm transition ${activeTab === "subscriptions"
                    ? "bg-[#069e5d] text-white font-bold shadow-xs"
                    : "text-gray-700 font-medium hover:bg-gray-50"
                    }`}
                >
                  <svg className={`w-4 h-4 shrink-0 ${activeTab === 'subscriptions' ? '' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>My Subscriptions</span>
                </button>

                {/* Wallet */}
                <button
                  type="button"
                  onClick={() => { setActiveTab("wallet"); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm transition ${activeTab === "wallet"
                    ? "bg-[#069e5d] text-white font-bold shadow-xs"
                    : "text-gray-700 font-medium hover:bg-gray-50"
                    }`}
                >
                  <svg className={`w-4 h-4 shrink-0 ${activeTab === 'wallet' ? '' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Wallet</span>
                </button>

                {/* Wishlist */}
                <button
                  type="button"
                  onClick={() => { setActiveTab("wishlist"); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm transition ${activeTab === "wishlist"
                    ? "bg-[#069e5d] text-white font-bold shadow-xs"
                    : "text-gray-700 font-medium hover:bg-gray-50"
                    }`}
                >
                  <svg className={`w-4 h-4 shrink-0 ${activeTab === 'wishlist' ? '' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Wishlist</span>
                </button>

                {/* Saved Address */}
                <button
                  type="button"
                  onClick={() => { setActiveTab("address"); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm transition ${activeTab === "address"
                    ? "bg-[#069e5d] text-white font-bold shadow-xs"
                    : "text-gray-700 font-medium hover:bg-gray-50"
                    }`}
                >
                  <svg className={`w-4 h-4 shrink-0 ${activeTab === 'address' ? '' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Saved Address</span>
                </button>

                {/* Language */}
                <button
                  type="button"
                  onClick={() => { setActiveTab("language"); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm transition ${activeTab === "language"
                    ? "bg-[#069e5d] text-white font-bold shadow-xs"
                    : "text-gray-700 font-medium hover:bg-gray-50"
                    }`}
                >
                  <svg className={`w-4 h-4 shrink-0 ${activeTab === 'language' ? '' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Language</span>
                </button>

                {/* About */}
                <button
                  type="button"
                  onClick={() => { setActiveTab("about"); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm transition ${activeTab === "about"
                    ? "bg-[#069e5d] text-white font-bold shadow-xs"
                    : "text-gray-700 font-medium hover:bg-gray-50"
                    }`}
                >
                  <svg className={`w-4 h-4 shrink-0 ${activeTab === 'about' ? '' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>About</span>
                </button>

                {/* Support */}
                <button
                  type="button"
                  onClick={() => { setActiveTab("support"); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm transition ${activeTab === "support"
                    ? "bg-[#069e5d] text-white font-bold shadow-xs"
                    : "text-gray-700 font-medium hover:bg-gray-50"
                    }`}
                >
                  <svg className={`w-4 h-4 shrink-0 ${activeTab === 'support' ? '' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Support</span>
                </button>

                {/* Bottom Logout Button (Matching Image 3) */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-6 border border-[#069e5d] text-[#069e5d] hover:bg-green-50 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm transition w-full"
                >
                  <svg className="w-4 h-4 text-[#069e5d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </aside>

              {/* ── Right Main Content Area (Matching Image 3) ── */}
              <div className="flex-1 w-full">
                {activeTab === 'profile' && (
                  <>
                    {/* Section Title Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-[#701a28] text-white flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                      </div>
                      <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#5b1422] tracking-tight">
                        Profile Details
                      </h1>
                    </div>

                    {/* Profile Card Container */}
                    <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 sm:p-10 relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-10">

                      {/* Decorative Mandala Background Watermark */}
                      <div className="absolute -bottom-16 -right-16 opacity-[0.03] pointer-events-none">
                        <svg className="w-80 h-80 text-gray-900" fill="currentColor" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" fill="none" />
                          <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1" fill="none" />
                          <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1" fill="none" />
                          <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18" stroke="currentColor" strokeWidth="0.5" />
                        </svg>
                      </div>

                      {/* Left: Avatar */}
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[#8b1a1a] flex items-center justify-center border-[8px] border-[#fce4e0] shrink-0 relative z-10">
                        <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                      </div>

                      {/* Right: Form or Details */}
                      <div className="flex-1 w-full relative z-10">
                        {showEditModal ? (
                          <div className="max-w-md">
                            <div className="mb-4">
                              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Name</label>
                              <input
                                type="text"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder=""
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#069e5d] transition"
                              />
                            </div>
                            <div className="mb-5">
                              <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Email</label>
                              <input
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder=""
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#069e5d] transition"
                              />
                            </div>

                            <div className="flex items-center gap-2 text-gray-500 mb-6">
                              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span className="text-[13px] font-medium">Mobile number can&apos;t be changed here.</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(user || {});
                                  setShowEditModal(false);
                                }}
                                className="px-6 py-2.5 rounded-full border border-gray-200 text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleSave();
                                  setShowEditModal(false);
                                }}
                                disabled={saving}
                                className="px-6 py-2.5 rounded-full bg-[#069e5d] text-white text-[14px] font-bold hover:bg-[#058a51] transition"
                              >
                                {saving ? 'Saving...' : 'Save Changes'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                            <div>
                              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight h-8 capitalize">
                                {user?.name || "Enter your name"}
                              </h2>
                              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-semibold inline-block mt-1">
                                Devotee
                              </span>

                              <div className="mt-4 space-y-1.5 text-xs sm:text-sm text-gray-600 font-medium">
                                <div className="flex items-center gap-2.5">
                                  <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  <span>{user?.mobileNumber || user?.phone || "+91 XXXXXXXXXX"}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                  <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  <span className="h-5 flex items-center">{user?.email || "Add your email"}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowEditModal(true)}
                              className="border border-[#069e5d] text-[#069e5d] hover:bg-green-50 text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 transition self-start shadow-xs"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              <span>Edit</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── 3 Quick Shortcut Cards Row (Matching Image 3) ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

                      {/* Card 1: My Bookings */}
                      <div
                        onClick={() => setActiveTab('bookings')}
                        className="cursor-pointer bg-[#fdf2f0] border border-[#fce4e0] rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#701a28] shrink-0 shadow-2xs">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V9a2 2 0 012-2h2a2 2 0 012 2v12" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900">My Bookings (1)</h4>
                            <p className="text-[11px] text-gray-500 font-medium leading-tight">View your all puja bookings and History</p>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[#069e5d] text-white flex items-center justify-center text-xs font-bold shrink-0 ml-2">
                          ➔
                        </div>
                      </div>

                      {/* Card 2: My Subscriptions */}
                      <div
                        onClick={() => setActiveTab('subscriptions')}
                        className="cursor-pointer bg-[#fffbeb] border border-[#fef3c7] rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900">My Subscriptions (0)</h4>
                            <p className="text-[11px] text-gray-500 font-medium leading-tight">Manage your active subscriptions</p>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[#069e5d] text-white flex items-center justify-center text-xs font-bold shrink-0 ml-2">
                          ➔
                        </div>
                      </div>

                      {/* Card 3: My Addresses */}
                      <div
                        onClick={() => setActiveTab('address')}
                        className="cursor-pointer bg-[#f0fdf4] border border-[#dcfce7] rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#069e5d] shrink-0 shadow-2xs">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900">My Addresses (0)</h4>
                            <p className="text-[11px] text-gray-500 font-medium leading-tight">Manage your saved delivery addresses</p>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[#069e5d] text-white flex items-center justify-center text-xs font-bold shrink-0 ml-2">
                          ➔
                        </div>
                      </div>
                    </div>

                    {/* ── Green Security Banner (Matching Image 3) ── */}
                    <div className="bg-[#e8f5e9] border border-[#c8e6c9] text-[#069e5d] text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 mt-6">
                      <svg className="w-4 h-4 text-[#069e5d]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Your personal information is protected and securely stored.</span>
                    </div>
                  </>
                )}

                {activeTab === 'bookings' && (
                  <div>
                    {/* Header section with Title and Filters */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[10px] bg-[#701a28] text-white flex items-center justify-center shrink-0 shadow-sm">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                          </svg>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-serif text-[#333]">
                          Bookings <span className="text-gray-500 font-medium text-lg">(1)</span>
                        </h1>
                      </div>

                      <div className="flex items-center gap-3">
                        <button className="px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-[#069e5d] text-[#069e5d] bg-white transition">
                          All
                          <div className="w-4 h-4 rounded-full bg-[#069e5d] text-white flex items-center justify-center">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </button>
                        <button className="px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-transparent text-gray-700 bg-[#f0f0f0] hover:bg-[#e0e0e0] transition">
                          Ongoing
                        </button>
                        <button className="px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-transparent text-gray-700 bg-[#f0f0f0] hover:bg-[#e0e0e0] transition">
                          Complete
                        </button>
                      </div>
                    </div>

                    {/* Bookings List */}
                    <div className="bg-white rounded-[20px] border border-[#a8d5c0] p-5 hover:shadow-sm transition mb-12">
                      {/* Card Header */}
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2 font-bold text-gray-800 text-[13px] sm:text-[15px]">
                          <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>25 Sept 2026</span>
                        </div>
                        <div className="font-bold text-gray-800 text-[13px] sm:text-[15px]">
                          Booking: <span className="text-[#3b82f6]">#200627</span>
                        </div>
                      </div>

                      <hr className="border-gray-100 mb-5" />

                      {/* Card Body */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-24 h-16 sm:w-28 sm:h-18 bg-gray-200 rounded-lg overflow-hidden shrink-0 relative border border-gray-100">
                          <img src="https://picsum.photos/seed/rahu/200/100" alt="Puja" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="text-[16px] sm:text-[18px] font-bold text-[#069e5d] mb-1">Rahu Shanti Rudrabhishek</h3>
                          <div className="flex items-center gap-1.5 text-gray-700 font-bold text-[13px] sm:text-[15px]">
                            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                            </svg>
                            <span>Shri Rahu Temple, Paithani,</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Tracker */}
                      <div className="relative max-w-[380px] mt-8 pb-2">
                        {/* Background lines */}
                        <div className="absolute top-6 left-12 right-1/2 h-[3px] bg-[#eadecd] -z-10"></div>
                        <div className="absolute top-6 left-1/2 right-14 h-[3px] bg-[#eadecd] -z-10"></div>

                        <div className="flex justify-between items-start text-center">
                          {/* Step 1 */}
                          <div className="flex flex-col items-center w-24">
                            <div className="w-12 h-12 rounded-full border-[2px] border-[#069e5d] bg-white flex items-center justify-center mb-2 z-10 shadow-sm relative">
                              {/* calendar icon */}
                              <svg className="w-5 h-5 text-[#069e5d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4" />
                              </svg>
                            </div>
                            <p className="text-[12px] font-extrabold text-gray-900 leading-tight">Booked</p>
                            <div className="flex items-center justify-center gap-1 mt-0.5">
                              <span className="text-[11px] font-bold text-gray-600">25 Sept 2026</span>
                              <div className="w-3.5 h-3.5 rounded-full bg-[#069e5d] text-white flex items-center justify-center shrink-0">
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Step 2 */}
                          <div className="flex flex-col items-center w-24">
                            <div className="w-12 h-12 rounded-full bg-[#fae8e3] flex items-center justify-center mb-2 z-10 shadow-[0_0_0_4px_white]">
                              {/* diya icon */}
                              <svg className="w-6 h-6 text-[#a3948e]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C8 2 8 8 8 8s-4 0-4 4c0 3 4 5 8 8 4-3 8-5 8-8 0-4-4-4-4-4s0-6-4-6zm0 13c-2 0-4-1-5-2 1 1 3 2 5 2s4-1 5-2c-1 1-3 2-5 2z" />
                              </svg>
                            </div>
                            <p className="text-[12px] font-bold text-[#a8a19d] leading-tight">Puja Scheduled</p>
                            <p className="text-[11px] font-bold text-[#a8a19d] mt-0.5">on 12 Oct 2026</p>
                          </div>

                          {/* Step 3 */}
                          <div className="flex flex-col items-center w-28">
                            <div className="h-12 flex items-center justify-center mb-2 z-10 shadow-[0_0_0_4px_white]">
                              <div className="px-4 py-1.5 rounded-full bg-[#edeae8] text-[#a09691] font-bold text-[12px] flex items-center gap-1.5">
                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                                Puja Video
                              </div>
                            </div>
                            <p className="text-[10px] font-bold text-[#a8a19d] leading-tight px-1">Available only after puja performed</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Messages */}
                    <div className="flex flex-col items-center justify-center text-center pb-8">
                      <p className="text-[14px] font-extrabold text-gray-600 mb-1">
                        You&apos;ve reached the end of your all bookings
                      </p>
                      <p className="text-[12px] font-bold text-gray-400">
                        1 of 1 bookings shown
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'subscriptions' && (
                  <div>
                    {/* Header section with Title and Filters */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[10px] bg-[#701a28] text-white flex items-center justify-center shrink-0 shadow-sm">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
                          Subscriptions <span className="text-gray-500 font-medium text-lg">(0)</span>
                        </h1>
                      </div>

                      <div className="flex items-center gap-3">
                        <button className="px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-[#069e5d] text-[#069e5d] bg-white transition">
                          All
                          <div className="w-4 h-4 rounded-full bg-[#069e5d] text-white flex items-center justify-center">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </button>
                        <button className="px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-transparent text-gray-700 bg-[#ebebeb] hover:bg-[#e0e0e0] transition">
                          Ongoing
                        </button>
                        <button className="px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-transparent text-gray-700 bg-[#ebebeb] hover:bg-[#e0e0e0] transition">
                          Complete
                        </button>
                      </div>
                    </div>

                    {/* Empty State Container */}
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h2 className="text-lg font-extrabold text-gray-800 mb-2">No subscriptions</h2>
                      <p className="text-[13px] font-medium text-gray-500">
                        You don&apos;t have any subscriptions yet.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'wallet' && (
                  <div className="animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-[10px] bg-[#701a28] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
                        My Wallet
                      </h1>
                    </div>

                    {/* Main Wallet Card */}
                    <div className="bg-[#fcfaf9] border border-gray-150 rounded-2xl p-6 relative overflow-hidden mb-8 shadow-sm">
                      {/* Background SVG Watermark */}
                      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-[20%] translate-y-[20%]">
                        <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor" className="text-gray-500">
                          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1" fill="none" />
                          <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="0.5" fill="none" />
                          <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18" stroke="currentColor" strokeWidth="0.5" />
                        </svg>
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-[10px] bg-[#e8f5e9] flex items-center justify-center shrink-0">
                              <svg className="w-5 h-5 text-[#069e5d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <h2 className="text-[17px] font-medium font-serif text-gray-800 tracking-wide">VedaMandir Wallet</h2>
                          </div>
                          <div className="bg-[#ce9d52] text-white text-[9.5px] font-extrabold px-3.5 py-1.5 rounded-full tracking-wider shadow-sm uppercase">
                            Coming Soon
                          </div>
                        </div>

                        <div className="mb-6 space-y-1.5 max-w-lg">
                          <p className="text-[13px] font-bold text-gray-600">One balance for every puja</p>
                          <p className="text-[13px] font-medium text-gray-500 leading-relaxed">
                            Add money once, book in a tap, and get refunds & festival cashback straight to your wallet.
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 text-[#069e5d] text-[12px] font-bold">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Bank-grade security
                        </div>
                      </div>
                    </div>

                    {/* What's coming section */}
                    <h3 className="text-xl font-bold font-serif text-[#4a4a4a] mb-5 tracking-tight">What&apos;s coming</h3>

                    <div className="space-y-4 mb-8">
                      {/* Item 1 */}
                      <div className="bg-white border border-gray-150 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[10px] bg-[#fdf2f0] flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-[#8b2332]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-[14px] font-extrabold text-gray-900 mb-0.5">Add money & pay in one tap</h4>
                            <p className="text-[13px] font-medium text-gray-500">Top up via UPI or card and check out faster on every booking.</p>
                          </div>
                        </div>
                        <div className="bg-[#fdf2f0] text-[#8b2332] text-[10px] font-extrabold px-3 py-1 rounded-full tracking-wider ml-4 shrink-0 uppercase">
                          Soon
                        </div>
                      </div>

                      {/* Item 2 */}
                      <div className="bg-white border border-gray-150 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[10px] bg-[#fdf2f0] flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-[#8b2332]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-[14px] font-extrabold text-gray-900 mb-0.5">Instant refunds to wallet</h4>
                            <p className="text-[13px] font-medium text-gray-500">Cancellations and adjustments credited back immediately — no waiting.</p>
                          </div>
                        </div>
                        <div className="bg-[#fdf2f0] text-[#8b2332] text-[10px] font-extrabold px-3 py-1 rounded-full tracking-wider ml-4 shrink-0 uppercase">
                          Soon
                        </div>
                      </div>

                      {/* Item 3 */}
                      <div className="bg-white border border-gray-150 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[10px] bg-[#fdf2f0] flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-[#8b2332]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-[14px] font-extrabold text-gray-900 mb-0.5">Festival cashback & rewards</h4>
                            <p className="text-[13px] font-medium text-gray-500">Earn cashback on special pujas and redeem it against future bookings.</p>
                          </div>
                        </div>
                        <div className="bg-[#fdf2f0] text-[#8b2332] text-[10px] font-extrabold px-3 py-1 rounded-full tracking-wider ml-4 shrink-0 uppercase">
                          Soon
                        </div>
                      </div>
                    </div>

                    {/* Bottom Security Banner */}
                    <div className="bg-[#e8f5e9] border border-[#c8e6c9] text-[#069e5d] text-[13px] font-bold py-4 px-5 rounded-2xl flex items-center gap-3">
                      <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>When your wallet goes live, your balance and transactions will be encrypted and securely stored.</span>
                    </div>
                  </div>
                )}

                {activeTab === 'wishlist' && (
                  <div className="animate-fade-in">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-[10px] bg-[#701a28] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
                        My Wishlist <span className="text-gray-500 font-medium text-lg">({wishlistItems.length})</span>
                      </h1>
                    </div>

                    {loadingWishlist ? (
                      <div className="flex justify-center py-10">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#069e5d]"></div>
                      </div>
                    ) : wishlistItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <h2 className="text-lg font-extrabold text-gray-800 mb-2">Your wishlist is empty</h2>
                        <p className="text-[13px] font-medium text-gray-500 mb-6">
                          Save your favorite pujas and homas to view them here later.
                        </p>
                        <Link href="/" className="bg-[#069e5d] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-sm hover:bg-[#058a51] transition">
                          Explore Services
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {wishlistItems.map((item) => (
                          <div key={item.wishlistId} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
                            {/* Top Image Section */}
                            <div className="relative h-44 bg-[#6e1e12] overflow-hidden flex flex-col justify-center p-4">
                              {/* Background Image */}
                              <img
                                src={item.image?.startsWith("http") ? item.image : `/${item.image}`}
                                alt={item.name}
                                className="absolute right-0 top-0 bottom-0 w-1/2 object-cover opacity-80"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-[#6e1e12] via-[#6e1e12]/80 to-transparent"></div>

                              {/* Heart Icon (Remove) */}
                              <button
                                onClick={async () => {
                                  try {
                                    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://priest-service.onrender.com";
                                    await fetch(`${baseUrl}/api/wishlist/updateWishlist`, {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ userId: user?.id || user?._id, serviceId: item.serviceId, action: "remove" }),
                                    });
                                    fetchWishlist();
                                  } catch (error) {
                                    console.error(error);
                                  }
                                }}
                                className="absolute top-3 right-3 z-20 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-gray-50 text-[#069e5d]"
                              >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                              </button>

                              {/* Image Content Overlay */}
                              <div className="relative z-10 w-[65%]">
                                <div className="inline-block bg-[#801314] border border-[#a42018] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm text-center leading-[1.1] mb-2 max-w-full truncate whitespace-normal line-clamp-3">
                                  {item.badge}
                                </div>
                                <div className="text-[#fad06a] font-serif font-bold text-sm leading-[1.15] drop-shadow-md mb-2 line-clamp-3">
                                  {item.name}
                                </div>
                                <div className="inline-flex items-center bg-[#074f20] text-white text-[9px] font-bold px-2 py-1 rounded-full border border-[#0a7a30] shadow-sm">
                                  BOOK NOW <span className="ml-1 text-[11px] leading-none">›</span>
                                </div>
                              </div>
                            </div>

                            {/* Bottom Content Section */}
                            <div className="p-4 flex flex-col min-h-[140px]">
                              <h3 className="text-[13px] font-extrabold text-gray-900 leading-tight mb-2 line-clamp-2">
                                {item.name}
                              </h3>

                              <div className="flex items-start gap-1.5 text-[11px] text-gray-500 font-medium mb-4">
                                <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#701a28]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="leading-snug line-clamp-2">{item.location}</span>
                              </div>

                              <div className="mt-auto flex items-center justify-between">
                                <div className="text-[15px] font-extrabold text-gray-900">₹{item.price || 516}</div>
                                <Link href={`/${item.serviceType}/${item.slug || item.serviceId}`} className="bg-[#069e5d] text-white text-[11px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-green-700 transition shadow-sm">
                                  Book Now
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                  </svg>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'address' && (
                  <div className="animate-fade-in w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[10px] bg-[#701a28] text-white flex items-center justify-center shrink-0 shadow-sm">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
                          Saved Address <span className="text-gray-500 font-medium text-lg">({addresses.length})</span>
                        </h1>
                      </div>
                      {addresses.length > 0 && (
                        <button
                          onClick={() => openAddAddressModal()}
                          className="bg-[#069e5d] text-white text-xs sm:text-sm font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-full flex items-center gap-1.5 hover:bg-green-700 transition"
                        >
                          <span>+</span> Add New Address
                        </button>
                      )}
                    </div>

                    {addresses.length === 0 ? (
                      <div className="border border-dashed border-[#dca3a3] bg-[#fdfaf8] rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                          <svg className="w-6 h-6 text-[#701a28]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-serif font-bold text-gray-800 mb-1">No saved addresses yet</h3>
                        <p className="text-[13px] text-gray-500 font-medium mb-6">Add a delivery address to check out faster next time.</p>
                        <button
                          onClick={() => openAddAddressModal()}
                          className="bg-[#069e5d] text-white text-[13px] font-bold px-6 py-2.5 rounded-full flex items-center gap-1.5 hover:bg-green-700 transition"
                        >
                          <span>+</span> Add New Address
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                          {addresses.map((addr: Address, idx: number) => (
                            <div key={idx} className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="flex items-center gap-1.5 bg-[#fdf2f0] text-[#701a28] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  {addr.type}
                                </span>
                                {addr.isDefault && (
                                  <span className="bg-[#e8f5e9] text-[#069e5d] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                                    Default
                                  </span>
                                )}
                              </div>
                              <h4 className="text-[15px] font-bold text-gray-900 mb-1.5">{addr.name}</h4>
                              <p className="text-[13px] text-gray-600 leading-relaxed mb-3 pr-4">
                                {addr.address}
                              </p>
                              <div className="flex items-center gap-2 text-[13px] text-gray-700 font-medium mb-4">
                                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {addr.phone}
                              </div>
                              <hr className="border-gray-150 mb-4" />
                              <div className="flex items-center gap-3">
                                <button onClick={() => openEditAddressModal(addr)} className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 rounded-full text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                  Edit
                                </button>
                                <button onClick={() => handleDeleteAddress((addr._id || addr.id) as string)} className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 rounded-full text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}

                          <div
                            onClick={() => openAddAddressModal()}
                            className="border border-dashed border-[#a3e3c6] bg-[#e8fbf1] rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-[#d8f5e6] transition text-center min-h-[220px]"
                          >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-[#069e5d]">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                            <span className="text-[#069e5d] text-[14px] font-bold">Add a New Address</span>
                          </div>
                        </div>

                        <div className="bg-[#e8f5e9] text-[#069e5d] text-[12px] font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Your saved addresses are protected and securely stored.
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'language' && (
                  <div className="animate-fade-in w-full">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-[10px] bg-[#701a28] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
                        Language Preferences
                      </h1>
                    </div>

                    <div className="bg-[#fdf2f0] border border-[#fce4e0] text-[#701a28] p-4 rounded-xl flex items-start gap-3 mb-8">
                      <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-[13px] font-medium leading-relaxed">
                        Choose your preferred language. The app interface, puja descriptions and notifications will appear in the selected language wherever available.
                      </p>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Select Language</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                      {[
                        { name: "English", nativeName: "English", char: "A" },
                        { name: "Bengali", nativeName: "বাংলা", char: "বা" },
                        { name: "Gujarati", nativeName: "ગુજરાતી", char: "ગુ" },
                        { name: "Hindi", nativeName: "हिन्दी", char: "हि" },
                        { name: "Kannada", nativeName: "ಕನ್ನಡ", char: "ಕ" },
                        { name: "Malayalam", nativeName: "മലയാളം", char: "മ" },
                        { name: "Marathi", nativeName: "मराठी", char: "म" },
                        { name: "Oriya", nativeName: "ଓଡ଼ିଆ", char: "ଓ" },
                        { name: "Tamil", nativeName: "தமிழ்", char: "த" },
                        { name: "Telugu", nativeName: "తెలుగు", char: "తె" },
                      ].map((lang) => {
                        const isSelected = selectedLanguage === lang.name;
                        return (
                          <div
                            key={lang.name}
                            onClick={() => setSelectedLanguage(lang.name)}
                            className={`cursor-pointer rounded-2xl p-3 flex items-center justify-between border transition ${isSelected
                              ? 'border-[#069e5d] bg-white shadow-sm'
                              : 'border-gray-150 bg-white hover:border-[#069e5d] hover:shadow-sm'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold ${isSelected
                                ? 'bg-[#069e5d] text-white'
                                : 'bg-[#f0fdf4] text-[#069e5d]'
                                }`}>
                                {lang.char}
                              </div>
                              <div>
                                <div className="text-[14px] font-bold text-gray-900 leading-tight mb-0.5">{lang.name}</div>
                                <div className="text-[12px] text-gray-500 font-medium">{lang.nativeName}</div>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-[#069e5d] text-white flex items-center justify-center shrink-0">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                      <button className="bg-[#83d9aa] text-white text-[13px] font-bold px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-[#68c894] transition">
                        Save Preference
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <div className="text-[13px] text-gray-600">
                        Currently selected: <strong className="text-gray-900">{selectedLanguage}</strong>
                      </div>
                    </div>

                    <div className="bg-[#e8f5e9] text-[#069e5d] text-[12px] font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Your language preference is saved to your account and synced across devices.
                    </div>
                  </div>
                )}

                {activeTab === 'about' && (
                  <div className="animate-fade-in w-full">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-[10px] bg-[#701a28] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V9a2 2 0 012-2h2a2 2 0 012 2v12" />
                        </svg>
                      </div>
                      <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
                        About VedaMandir
                      </h1>
                    </div>

                    {/* Top Banner */}
                    <div className="bg-[#fcf5f3] rounded-2xl p-8 mb-8 text-center border border-[#faebe8]">
                      <div className="mb-4 flex justify-center">
                        {/* VedaMandir text logo approximation */}
                        <div className="flex items-center gap-1.5 text-[#701a28]">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                          </svg>
                          <span className="font-serif font-bold text-sm tracking-wide">vedamandir</span>
                        </div>
                      </div>
                      <h2 className="text-2xl font-serif font-bold text-[#333] mb-4">A Sacred Bridge Between Devotees and Temples</h2>
                      <p className="text-[13px] text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        VedaMandir is a spiritual platform that enables devotees to book authentic Vedic pujas from sacred temples across India. We connect you with verified, experienced purohits who perform rituals in your name and family&apos;s name &mdash; and deliver the complete puja video, prasadam, and divine blessings right to your home.
                      </p>
                    </div>

                    {/* What We Offer */}
                    <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">What We Offer</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-[#701a28] text-white flex items-center justify-center mb-4">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V9a2 2 0 012-2h2a2 2 0 012 2v12" />
                          </svg>
                        </div>
                        <h4 className="text-[14px] font-bold text-gray-900 mb-2">Authentic Temple Pujas</h4>
                        <p className="text-[12px] text-gray-500 leading-relaxed">
                          Rituals performed in sacred temples following traditional Pancharatra and Vedic Agama practices.
                        </p>
                      </div>

                      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-[#701a28] text-white flex items-center justify-center mb-4">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="text-[14px] font-bold text-gray-900 mb-2">Puja Video Delivered</h4>
                        <p className="text-[12px] text-gray-500 leading-relaxed">
                          Receive your full puja video on WhatsApp within 48 hours, including your personalized sankalpam.
                        </p>
                      </div>

                      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-[#701a28] text-white flex items-center justify-center mb-4">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <h4 className="text-[14px] font-bold text-gray-900 mb-2">Authentic Puja Journey</h4>
                        <p className="text-[12px] text-gray-500 leading-relaxed">
                          Experience a seamless puja journey from booking to divine blessings.
                        </p>
                      </div>

                      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-[#701a28] text-white flex items-center justify-center mb-4">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <h4 className="text-[14px] font-bold text-gray-900 mb-2">Verified Purohits</h4>
                        <p className="text-[12px] text-gray-500 leading-relaxed">
                          Every ritual is conducted by experienced, verified Vedic acharyas you can trust.
                        </p>
                      </div>

                      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm md:col-span-2">
                        <div className="w-10 h-10 rounded-xl bg-[#701a28] text-white flex items-center justify-center mb-4">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <h4 className="text-[14px] font-bold text-gray-900 mb-2">Our Brands</h4>
                        <p className="text-[12px] text-gray-500 leading-relaxed">
                          Organisations we work with to serve devotees better divyakshetram, nithyasamrithi, kailasamandir, poojamandhir, Vedalayam, devotsav, daivasankalpam, jyotirvedam, manebhakti, aalayaseva, vishwappoje, pujasankalpam, kovilseva
                        </p>
                      </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="bg-gradient-to-r from-[#701a28] to-[#a32230] rounded-2xl p-6 text-white grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-center shadow-md">
                      <div>
                        <div className="text-2xl font-bold font-serif mb-1">35,000+</div>
                        <div className="text-[10px] font-bold tracking-wider uppercase text-red-100">Pujas Conducted</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold font-serif mb-1">18,900+</div>
                        <div className="text-[10px] font-bold tracking-wider uppercase text-red-100">Happy Devotees</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold font-serif mb-1">120+</div>
                        <div className="text-[10px] font-bold tracking-wider uppercase text-red-100">Partner Temples</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold font-serif mb-1 flex items-center justify-center gap-1">
                          4.9
                          <svg className="w-5 h-5 text-[#fad06a]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <div className="text-[10px] font-bold tracking-wider uppercase text-red-100">Devotee Rating</div>
                      </div>
                    </div>

                    {/* Our Mission */}
                    <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Our Mission</h3>
                    <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm mb-8">
                      <p className="text-[13px] text-gray-600 leading-relaxed">
                        Our mission is to make authentic Vedic worship accessible to every devotee, wherever they are. Distance, time, and busy lives should never stand between a devotee and divine blessings. Through technology and tradition together, VedaMandir brings the sanctity of the temple to your home.
                      </p>
                    </div>

                    {/* Company Information */}
                    <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Company Information</h3>
                    <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm mb-8">
                      <p className="text-[13px] text-gray-600 leading-relaxed mb-4">
                        The Platform is owned and operated by Way2News Private Limited, a company incorporated under the Companies Act, 2013, with its registered office at:
                      </p>
                      <p className="text-[13px] text-gray-500 leading-relaxed">
                        H.No. 8-2-293,<br />
                        Plot No. 499,<br />
                        First Floor,<br />
                        Road No.36,<br />
                        Jubilee Hills,<br />
                        Hyderabad-500033
                      </p>
                    </div>

                    {/* Bottom Banner */}
                    <div className="bg-[#e8f5e9] text-[#069e5d] text-[12px] font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      100% Secure & Verified bookings &mdash; trusted by devotees across India.
                    </div>
                  </div>
                )}

                {activeTab === 'support' && (
                  <div className="animate-fade-in w-full">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-[10px] bg-[#701a28] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
                        Help & Support
                      </h1>
                    </div>

                    {/* Contact Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                      {/* WhatsApp */}
                      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                        <div className="w-10 h-10 rounded-xl bg-[#069e5d] text-white flex items-center justify-center mb-4">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                        </div>
                        <h4 className="text-[14px] font-bold text-gray-900 mb-1">WhatsApp Support</h4>
                        <p className="text-[11px] text-gray-500 mb-4">Reply within minutes</p>
                        <button className="text-[#069e5d] text-[12px] font-bold flex items-center gap-1 hover:text-[#047a47]">
                          +91 9677391108 <span>&rarr;</span>
                        </button>
                      </div>

                      {/* Call Support */}
                      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                        <div className="w-10 h-10 rounded-xl bg-[#069e5d] text-white flex items-center justify-center mb-4">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <h4 className="text-[14px] font-bold text-gray-900 mb-1">Call Support</h4>
                        <p className="text-[11px] text-gray-500 mb-4">10 AM - 7 PM, all days</p>
                        <button className="text-[#069e5d] text-[12px] font-bold flex items-center gap-1 hover:text-[#047a47]">
                          +91 9677391108 <span>&rarr;</span>
                        </button>
                      </div>

                      {/* Email Support */}
                      <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                        <div className="w-10 h-10 rounded-xl bg-[#d49a46] text-white flex items-center justify-center mb-4">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h4 className="text-[14px] font-bold text-gray-900 mb-1">Email Support</h4>
                        <p className="text-[11px] text-gray-500 mb-4">Response within 24 hours</p>
                        <button className="text-[#069e5d] text-[12px] font-bold flex items-center gap-1 hover:text-[#047a47]">
                          support@astroved.com <span>&rarr;</span>
                        </button>
                      </div>
                    </div>

                    {/* Frequently Asked */}
                    <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Frequently Asked</h3>
                    <div className="space-y-3 mb-8">
                      {/* FAQ 1 */}
                      <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                          className="w-full flex items-center justify-between p-5 text-left transition hover:bg-gray-50"
                        >
                          <span className="text-[14px] font-bold text-gray-900">How do I book a puja?</span>
                          <span className="text-[#069e5d] font-bold text-xl leading-none">
                            {openFaq === 1 ? '×' : '+'}
                          </span>
                        </button>
                        {openFaq === 1 && (
                          <div className="px-5 pb-5 text-[12px] text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                            Browse pujas from the Puja menu, choose your package and temple, add devotee and sankalpam details, and complete the payment. You&apos;ll receive a confirmation instantly.
                          </div>
                        )}
                      </div>

                      {/* FAQ 2 */}
                      <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                          className="w-full flex items-center justify-between p-5 text-left transition hover:bg-gray-50"
                        >
                          <span className="text-[14px] font-bold text-gray-900">When will I receive my puja video?</span>
                          <span className="text-[#069e5d] font-bold text-xl leading-none">
                            {openFaq === 2 ? '×' : '+'}
                          </span>
                        </button>
                        {openFaq === 2 && (
                          <div className="px-5 pb-5 text-[12px] text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                            You will receive your personalized puja video within 48 hours of the puja completion on your registered WhatsApp number.
                          </div>
                        )}
                      </div>

                      {/* FAQ 3 */}
                      <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                          className="w-full flex items-center justify-between p-5 text-left transition hover:bg-gray-50"
                        >
                          <span className="text-[14px] font-bold text-gray-900">Can I edit my devotee details after booking?</span>
                          <span className="text-[#069e5d] font-bold text-xl leading-none">
                            {openFaq === 3 ? '×' : '+'}
                          </span>
                        </button>
                        {openFaq === 3 && (
                          <div className="px-5 pb-5 text-[12px] text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                            Yes, you can edit your details from the &quot;My Bookings&quot; section up to 24 hours before the scheduled puja time.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Still need help? Form */}
                    <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm mb-8">
                      <h3 className="text-lg font-serif font-bold text-gray-800 mb-2">Still need help?</h3>
                      <p className="text-[12px] text-gray-500 mb-6">
                        Send us a message and our support team will get back to you within 24 hours.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-[12px] font-bold text-gray-800 block mb-1.5">Your Name <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            placeholder="Enter your full name"
                            value={helpFormData.name}
                            onChange={(e) => setHelpFormData({ ...helpFormData, name: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-[#069e5d]"
                          />
                        </div>
                        <div>
                          <label className="text-[12px] font-bold text-gray-800 block mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
                          <div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#069e5d]">
                            <span className="bg-gray-50 border-r border-gray-200 px-4 py-2.5 text-[13px] text-gray-700 font-medium">
                              +91
                            </span>
                            <input
                              type="text"
                              placeholder="10-digit mobile number"
                              value={helpFormData.mobileNumber}
                              onChange={(e) => setHelpFormData({ ...helpFormData, mobileNumber: e.target.value.replace(/\D/g, '') })}
                              maxLength={10}
                              className="w-full px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-[12px] font-bold text-gray-800 block mb-1.5">Email <span className="text-gray-400 font-medium">(optional)</span></label>
                          <input
                            type="email"
                            placeholder="your.email@example.com"
                            value={helpFormData.email}
                            onChange={(e) => setHelpFormData({ ...helpFormData, email: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-[#069e5d]"
                          />
                        </div>
                        <div>
                          <label className="text-[12px] font-bold text-gray-800 block mb-1.5">Booking ID <span className="text-gray-400 font-medium">(optional)</span></label>
                          <input
                            type="text"
                            placeholder="e.g. VM123456789"
                            value={helpFormData.bookingId}
                            onChange={(e) => setHelpFormData({ ...helpFormData, bookingId: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-[#069e5d]"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="text-[12px] font-bold text-gray-800 block mb-1.5">Subject <span className="text-red-500">*</span></label>
                        <select
                          value={helpFormData.subject}
                          onChange={(e) => setHelpFormData({ ...helpFormData, subject: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-[#069e5d] bg-white appearance-none"
                        >
                          <option value="" disabled>Select a subject</option>
                          <option value="Booking Issue">Booking Issue</option>
                          <option value="Puja Video Query">Puja Video Query</option>
                          <option value="Refund/Cancellation">Refund/Cancellation</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="text-[12px] font-bold text-gray-800 block mb-1.5">Message <span className="text-red-500">*</span></label>
                        <textarea
                          placeholder="Describe your issue..."
                          rows={4}
                          value={helpFormData.message}
                          onChange={(e) => setHelpFormData({ ...helpFormData, message: e.target.value })}
                          maxLength={1000}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-[#069e5d] resize-none"
                        ></textarea>
                        <div className="text-right text-[10px] text-gray-400 mt-1">
                          {helpFormData.message.length} / 1000
                        </div>
                      </div>

                      <label className="flex items-start gap-2 cursor-pointer mb-6">
                        <input
                          type="checkbox"
                          checked={helpFormData.consent}
                          onChange={(e) => setHelpFormData({ ...helpFormData, consent: e.target.checked })}
                          className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-[#069e5d] focus:ring-[#069e5d]"
                        />
                        <span className="text-[11px] font-medium text-gray-600">I authorize VedaMandir to send notifications via SMS / WhatsApp / email. <span className="text-red-500">*</span></span>
                      </label>

                      <button
                        onClick={handleHelpSubmit}
                        disabled={isSubmittingHelp}
                        className={`bg-[#069e5d] text-white text-[13px] font-bold px-6 py-2.5 rounded-full flex items-center gap-1.5 transition w-max ${isSubmittingHelp ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#058a51]'}`}
                      >
                        {isSubmittingHelp ? 'Submitting...' : 'Submit Request'} {!isSubmittingHelp && <span>&rarr;</span>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Add New Address Modal ── */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
                <h3 className="text-xl font-serif font-bold text-gray-900">Add New Address</h3>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="w-8 h-8 rounded-full bg-[#f8eadd] text-[#555] flex items-center justify-center hover:bg-[#ebd5c1] transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="flex items-center gap-2 mb-6">
                  {['Home', 'Work', 'Other'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddressFormData(prev => ({ ...prev, type }))}
                      className={`px-5 py-2 rounded-full text-sm font-bold border transition ${addressFormData.type === type
                        ? 'bg-[#069e5d] text-white border-[#069e5d]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[13px] font-bold text-gray-800 block mb-1.5">Full Name</label>
                    <input
                      type="text"
                      placeholder="Recipient name"
                      value={addressFormData.fullName}
                      onChange={(e) => setAddressFormData(p => ({ ...p, fullName: e.target.value }))}
                      className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#069e5d]"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-gray-800 block mb-1.5">Phone</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={addressFormData.phone}
                      onChange={(e) => setAddressFormData(p => ({ ...p, phone: e.target.value }))}
                      className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#069e5d]"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-[13px] font-bold text-gray-800 block mb-1.5">Address</label>
                  <input
                    type="text"
                    placeholder="Flat / House no. / Building / Street"
                    value={addressFormData.address}
                    onChange={(e) => setAddressFormData(p => ({ ...p, address: e.target.value }))}
                    className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#069e5d]"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-[13px] font-bold text-gray-800 block mb-1.5">Landmark <span className="text-gray-400 font-medium">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="Nearby landmark / area"
                    value={addressFormData.landmark}
                    onChange={(e) => setAddressFormData(p => ({ ...p, landmark: e.target.value }))}
                    className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#069e5d]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[13px] font-bold text-gray-800 block mb-1.5">City</label>
                    <input
                      type="text"
                      placeholder="City"
                      value={addressFormData.city}
                      onChange={(e) => setAddressFormData(p => ({ ...p, city: e.target.value }))}
                      className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#069e5d]"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-gray-800 block mb-1.5">State</label>
                    <input
                      type="text"
                      placeholder="State"
                      value={addressFormData.state}
                      onChange={(e) => setAddressFormData(p => ({ ...p, state: e.target.value }))}
                      className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#069e5d]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="text-[13px] font-bold text-gray-800 block mb-1.5">Pincode</label>
                    <input
                      type="text"
                      placeholder="500033"
                      value={addressFormData.pincode}
                      onChange={(e) => setAddressFormData(p => ({ ...p, pincode: e.target.value }))}
                      className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#069e5d]"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-gray-800 block mb-1.5">Country</label>
                    <input
                      type="text"
                      placeholder="India"
                      value={addressFormData.country}
                      onChange={(e) => setAddressFormData(p => ({ ...p, country: e.target.value }))}
                      className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#069e5d]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={addressFormData.isDefault}
                    onChange={(e) => setAddressFormData(p => ({ ...p, isDefault: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-[#069e5d] focus:ring-[#069e5d]"
                  />
                  <span className="text-[13px] font-medium text-gray-800">Set as default address</span>
                </label>
              </div>

              <div className="p-5 sm:p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-800 border border-gray-200 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  className="px-6 py-2.5 rounded-full bg-[#069e5d] text-white text-sm font-bold hover:bg-green-700 transition"
                >
                  {addressFormData._id ? "Update Address" : "Add Address"}
                </button>
              </div>
            </div>
          </div>
        )}



        {/* ── Login Modal ── */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginStep('phone');
                  setPhoneNumber('');
                  setOtp(['', '', '', '']);
                }}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-8 pt-10">
                {loginStep === 'phone' ? (
                  <>
                    <h2 className="text-2xl font-serif text-center text-[#333] mb-8">Login or signup</h2>

                    <div className="flex border border-gray-300 rounded-xl overflow-hidden focus-within:border-[#069e5d] mb-6">
                      <div className="bg-white flex items-center gap-2 px-4 py-3.5 border-r border-gray-300 shrink-0">
                        <img src="https://flagcdn.com/w20/in.png" alt="India flag" className="w-5 h-auto rounded-[2px]" />
                        <span className="text-[14px] text-gray-800 font-medium">+91</span>
                        <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Mobile number"
                        className="w-full px-4 py-3.5 text-[15px] text-gray-800 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className={`w-full bg-[#069e5d] text-white font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 transition relative group mb-4 ${isSendingOtp ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#058a51]'}`}
                    >
                      <span className="text-[15px]">{isSendingOtp ? 'Sending...' : 'Continue'}</span>
                      <div className="absolute right-2 w-8 h-8 rounded-full bg-white text-[#069e5d] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </button>

                    <p className="text-[11px] text-center text-gray-500 leading-relaxed max-w-[280px] mx-auto">
                      By tapping &quot;Continue&quot;, you agree to receive notifications, and our <Link href="#" className="text-blue-600 underline">terms and conditions</Link>.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-serif text-center text-[#333] mb-2">Enter OTP</h2>
                    <p className="text-[12px] text-center text-gray-500 mb-8">
                      OTP has been sent to +91 {phoneNumber || '93602 70984'}
                    </p>

                    <div className="flex justify-center gap-2 sm:gap-3 mb-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          autoFocus={index === 0}
                          type="text"
                          maxLength={1}
                          value={otp[index]}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length > 1) return; // Prevent pasting multiple chars here

                            const newOtp = [...otp];
                            newOtp[index] = val;
                            setOtp(newOtp);
                            setOtpError('');

                            // Auto focus next
                            if (val && index < 5) {
                              const nextInput = document.getElementById(`otp-${index + 1}`);
                              if (nextInput) nextInput.focus();
                            }

                            // Auto submit if full
                            if (newOtp.every(d => d !== '')) {
                              handleVerifyOtp(newOtp.join(''));
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !otp[index] && index > 0) {
                              const prevInput = document.getElementById(`otp-${index - 1}`);
                              if (prevInput) prevInput.focus();
                            }
                          }}
                          className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-xl font-bold text-gray-800 border-b-2 bg-transparent focus:outline-none ${otpError ? 'border-red-500 text-red-500' : otp[index] ? 'border-gray-800' : 'border-gray-300 focus:border-[#069e5d]'}`}
                        />
                      ))}
                    </div>

                    {otpError ? (
                      <p className="text-red-500 text-[12px] text-center font-medium mb-6">{otpError}</p>
                    ) : (
                      <div className="h-6 mb-6"></div>
                    )}

                    <p className="text-[13px] text-center text-gray-500 mb-8">
                      {timer > 0 ? (
                        <>Resend code in <strong className="text-gray-800 font-bold">00:{timer < 10 ? `0${timer}` : timer}</strong></>
                      ) : (
                        <button onClick={handleSendOtp} disabled={isSendingOtp} className="text-[#069e5d] font-bold hover:underline">Resend code now</button>
                      )}
                    </p>

                    <button
                      onClick={() => handleVerifyOtp()}
                      disabled={isVerifyingOtp || otp.join('').length !== 6}
                      className={`w-full bg-[#069e5d] text-white font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 transition relative group ${(isVerifyingOtp || otp.join('').length !== 6) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#058a51]'}`}
                    >
                      <span className="text-[15px]">{isVerifyingOtp ? 'Verifying...' : 'Continue'}</span>
                      <div className="absolute right-2 w-8 h-8 rounded-full bg-white text-[#069e5d] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
