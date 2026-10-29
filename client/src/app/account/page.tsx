"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";
import LoginModal from "@/components/auth/LoginModal";
import BookingsTab from "@/components/account/BookingsTab";
import { apiClient, getAuthToken } from "@/services/api";
import {
  User as UserIcon,
  Flame,
  Calendar,
  Wallet,
  Heart,
  MapPin,
  Info,
  HelpCircle,
  Menu,
  ChevronDown,
  X,
  LogOut,
  Phone,
  Edit2,
  Mail,
  Building,
  Loader2,
  Check,
  ShieldCheck,
  Plus,
  RefreshCw,
  Gift,
  Trash2,
  Video,
  BookOpen,
  Tag,
  Star,
  ArrowRight,
  Globe,
  Landmark,
} from "lucide-react";

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

export interface WishlistItem {
  wishlistId?: string;
  serviceId?: string;
  serviceType?: string;
  slug?: string;
  image?: string;
  name?: string;
  location?: string;
  price?: number | string;
  [key: string]: unknown;
}

const ACCOUNT_TABS = [
  {
    id: "profile",
    label: "Profile",
    icon: (active: boolean) => (
      <UserIcon className={`w-4 h-4 shrink-0 ${active ? "" : "text-gray-500"}`} />
    ),
  },
  {
    id: "bookings",
    label: "My Bookings",
    icon: (active: boolean) => (
      <Flame className={`w-4 h-4 shrink-0 ${active ? "" : "text-gray-500"}`} />
    ),
  },
  {
    id: "subscriptions",
    label: "My Subscriptions",
    icon: (active: boolean) => (
      <Calendar className={`w-4 h-4 shrink-0 ${active ? "" : "text-gray-500"}`} />
    ),
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: (active: boolean) => (
      <Wallet className={`w-4 h-4 shrink-0 ${active ? "" : "text-gray-500"}`} />
    ),
  },
  {
    id: "wishlist",
    label: "Wishlist",
    icon: (active: boolean) => (
      <Heart className={`w-4 h-4 shrink-0 ${active ? "" : "text-gray-500"}`} />
    ),
  },
  {
    id: "address",
    label: "Saved Address",
    icon: (active: boolean) => (
      <MapPin className={`w-4 h-4 shrink-0 ${active ? "" : "text-gray-500"}`} />
    ),
  },
  {
    id: "about",
    label: "About",
    icon: (active: boolean) => (
      <Info className={`w-4 h-4 shrink-0 ${active ? "" : "text-gray-500"}`} />
    ),
  },
  {
    id: "support",
    label: "Support",
    icon: (active: boolean) => (
      <HelpCircle className={`w-4 h-4 shrink-0 ${active ? "" : "text-gray-500"}`} />
    ),
  },
];

function AccountPageContent() {
  const searchParams = useSearchParams();
  const { user, setUser, isHydrated } = useUser();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<User>({});
  const [saving, setSaving] = useState(false);

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  const addresses = user?.addresses || [];
  const [loadingAddresses, setLoadingAddresses] = useState(!user?.addresses);
  const [bookingsCount, setBookingsCount] = useState<number | null>(null);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [subscriptionFilter, setSubscriptionFilter] = useState("All");

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId && getAuthToken()) {
      if (!user?.addresses || user.addresses.length === 0) {
        setLoadingAddresses(true);
      }
      apiClient(`/api/users/profile/${userId}`)
        .then(res => {
          if (res.success && res.data) {
            setUser(prev => ({ ...(prev || {}), ...res.data }));
          }
        })
        .catch(err => {
          console.error("Error fetching user profile addresses:", err);
        })
        .finally(() => {
          setLoadingAddresses(false);
        });
    } else {
      setLoadingAddresses(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, user?.id, setUser]);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      setLoadingBookings(true);
      apiClient(`/api/orders/user/${userId}`)
        .then(data => {
          if (data && data.success && Array.isArray(data.data)) {
            setBookingsCount(data.data.length);
          } else if (Array.isArray(data)) {
            setBookingsCount(data.length);
          } else {
            setBookingsCount(0);
          }
        })
        .catch(err => {
          console.error("Error fetching bookings count:", err);
          setBookingsCount(0);
        })
        .finally(() => {
          setLoadingBookings(false);
        });
    } else {
      setLoadingBookings(false);
    }
  }, [user?._id, user?.id]);
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
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
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
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";

      const res = await fetch(`${baseUrl}/api/customerQueries`, {
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
      console.error("Error submitting help request:", error);
      alert("Error submitting request.");
    } finally {
      setIsSubmittingHelp(false);
    }
  };

  // Login Modal States
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hashTab = window.location.hash.replace("#", "");
      if (["profile", "bookings", "subscriptions", "wallet", "wishlist", "address", "language"].includes(hashTab)) {
        setActiveTab(hashTab);
      }
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    const userId = user?.id || user?._id;
    if (!userId) {
      setLoadingWishlist(false);
      return;
    }
    setLoadingWishlist(true);
    try {
      const data = await apiClient(`/api/wishlist/${userId}`);
      if (data && data.success && Array.isArray(data.data)) {
        setWishlistItems(data.data);
      } else if (Array.isArray(data)) {
        setWishlistItems(data);
      } else {
        setWishlistItems([]);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
      setWishlistItems([]);
    } finally {
      setLoadingWishlist(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id || user?._id) {
      fetchWishlist();
    } else {
      setLoadingWishlist(false);
    }
  }, [user, fetchWishlist]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com"}/api/auth/logout`, { method: "POST" });
    } catch {
      // ignore
    }
    document.cookie = "userLogin=false; path=/; max-age=0;";
    setUser(null);
  };



  const getUserAuthHeaders = (): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const match = document.cookie.match(/(?:^|;\s*)(?:token|adminToken)=([^;]+)/);
    const cookieToken = match ? decodeURIComponent(match[1]) : null;
    const localToken = localStorage.getItem("token") || localStorage.getItem("adminToken");
    const token = cookieToken || localToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";

      const res = await fetch(`${baseUrl}/api/users/updateProfile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getUserAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          userId: user?.id || user?._id,
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

  const validateAddressForm = () => {
    const errors: Record<string, string> = {};
    const trimmedName = addressFormData.fullName.trim();
    const cleanPhone = addressFormData.phone.trim();
    const trimmedAddress = addressFormData.address.trim();
    const trimmedCity = addressFormData.city.trim();
    const trimmedState = addressFormData.state.trim();
    const cleanPincode = addressFormData.pincode.trim();
    const trimmedCountry = addressFormData.country.trim();

    if (!trimmedName) {
      errors.fullName = "Full name is required";
    } else if (trimmedName.length < 2) {
      errors.fullName = "Name must be at least 2 characters";
    } else if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      errors.fullName = "Full name must contain only letters";
    }

    if (!cleanPhone) {
      errors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = "Mobile number must be 10 digits and start with 6, 7, 8, or 9";
    }

    if (!trimmedAddress) {
      errors.address = "Address is required";
    } else if (trimmedAddress.length < 5) {
      errors.address = "Please enter complete street / building address";
    }

    if (!trimmedCity) {
      errors.city = "City is required";
    } else if (!/^[A-Za-z\s]+$/.test(trimmedCity)) {
      errors.city = "City must contain only letters";
    }

    if (!trimmedState) {
      errors.state = "State is required";
    } else if (!/^[A-Za-z\s]+$/.test(trimmedState)) {
      errors.state = "State must contain only letters";
    }

    if (!cleanPincode) {
      errors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(cleanPincode)) {
      errors.pincode = "Enter a valid 6-digit pincode";
    }

    if (!trimmedCountry) {
      errors.country = "Country is required";
    } else if (!/^[A-Za-z\s]+$/.test(trimmedCountry)) {
      errors.country = "Country must contain only letters";
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!user) return;
    if (!validateAddressForm()) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";

      const newAddress = {
        type: addressFormData.type,
        name: addressFormData.fullName.trim(),
        phone: addressFormData.phone.trim(),
        addressLine1: addressFormData.address.trim(),
        addressLine2: addressFormData.landmark.trim(),
        city: addressFormData.city.trim(),
        state: addressFormData.state.trim(),
        pincode: addressFormData.pincode.trim(),
        country: addressFormData.country.trim(),
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

      const res = await fetch(`${baseUrl}/api/users/updateProfile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getUserAuthHeaders(),
        },
        credentials: "include",
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
      console.error("Error saving address:", error);
      alert("Error saving address");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;
    if (!window.confirm("Are you sure to delete the address?")) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";

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
      const res = await fetch(`${baseUrl}/api/users/updateProfile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getUserAuthHeaders(),
        },
        credentials: "include",
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
      console.error("Error deleting address:", error);
      alert("Error deleting address");
    }
  };

  const openEditAddressModal = (addr: Address) => {
    setAddressErrors({});
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
    setAddressErrors({});
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

  if (!isHydrated) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#fafafc] pb-16 font-sans">
          <div className="mx-auto max-w-[1350px] px-4 sm:px-6 lg:px-10 py-3.5 border-b border-gray-150 bg-white">
            <div className="h-4 w-48 bg-stone-200/80 rounded animate-pulse" />
          </div>
          <div className="mx-auto max-w-[1350px] px-2.5 sm:px-6 lg:px-10 pt-4 sm:pt-8 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="hidden lg:block lg:col-span-3 bg-white rounded-3xl border border-stone-200 p-5 space-y-4 animate-pulse">
                <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                  <div className="w-12 h-12 rounded-full bg-stone-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-24 bg-stone-200 rounded" />
                    <div className="h-3 w-16 bg-stone-100 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-10 w-full bg-stone-100 rounded-xl" />
                  <div className="h-10 w-full bg-stone-100 rounded-xl" />
                  <div className="h-10 w-full bg-stone-100 rounded-xl" />
                  <div className="h-10 w-full bg-stone-100 rounded-xl" />
                </div>
              </div>
              <div className="lg:col-span-9 bg-white rounded-3xl border border-stone-200 p-6 space-y-6 animate-pulse">
                <div className="h-6 w-40 bg-stone-200 rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-28 bg-stone-100 rounded-2xl" />
                  <div className="h-28 bg-stone-100 rounded-2xl" />
                </div>
                <div className="h-44 bg-stone-100 rounded-2xl" />
              </div>
            </div>
          </div>
        </main>
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
          <div className="mx-auto max-w-[1350px] px-4 sm:px-6 lg:px-10 py-3.5 flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <Link href="/" className="hover:text-gray-900 transition">HOME</Link>
              <span className="text-gray-300">›</span>
              <button onClick={() => { setActiveTab('profile'); setIsDrawerOpen(false); }} className={`transition ${activeTab === 'profile' ? 'text-gray-900 font-bold' : 'hover:text-gray-900'}`}>Account</button>
              {activeTab !== 'profile' && (
                <>
                  <span className="text-gray-300">›</span>
                  <span className="text-gray-900 font-bold">
                    {ACCOUNT_TABS.find((t) => t.id === activeTab)?.label || activeTab}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Container: Sidebar + Content ── */}
        <div className="mx-auto max-w-[1350px] px-2.5 sm:px-6 lg:px-10 pt-4 sm:pt-8 pb-16">
          {!user ? (
            <div className="flex flex-col items-center justify-center pt-24 pb-40 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h2>
              <p className="text-gray-500 max-w-sm mb-6">You must be logged in to access your account settings and history.</p>
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-primary text-white font-bold py-2.5 px-8 rounded-full hover:bg-[#0f2d4a] transition"
              >
                Login Now
              </button>
            </div>
          ) : (
            <>
              {/* ── Mobile/Tablet Tab Selector Bar (< xl / 1024px) ── */}
              <div className="xl:hidden w-full mb-6">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 sm:py-3.5 flex items-center justify-between shadow-2xs hover:border-gray-300 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Menu className="w-5 h-5 text-primary shrink-0" strokeWidth={2.5} />
                    <span className="font-bold text-gray-900 text-sm sm:text-base capitalize">
                      {ACCOUNT_TABS.find((t) => t.id === activeTab)?.label || "Profile"}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ${isDrawerOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              {/* ── Mobile/Tablet Backdrop Overlay (< xl / 1024px) ── */}
              {isDrawerOpen && (
                <div
                  className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-xs xl:hidden transition-opacity duration-300"
                  onClick={() => setIsDrawerOpen(false)}
                />
              )}

              {/* ── Mobile/Tablet Off-canvas Card Drawer (< xl / 1024px, Matching Reference) ── */}
              <div
                className={`fixed top-0 bottom-0 left-0 z-[100] h-[100dvh] w-[82vw] max-w-[315px] bg-white shadow-2xl p-5 pb-6 sm:pb-8 flex flex-col justify-between overflow-hidden transition-transform duration-300 ease-out xl:hidden ${isDrawerOpen
                  ? "translate-x-0"
                  : "-translate-x-full pointer-events-none"
                  }`}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between pt-1 pb-3 mb-1 shrink-0">
                  <span className="text-xl font-serif font-bold text-gray-900 tracking-tight">Account</span>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full transition cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </div>

                {/* Modal Nav Items */}
                <div className="flex-1 flex flex-col gap-1 sm:gap-1.5 overflow-y-auto py-1 overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {ACCOUNT_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsDrawerOpen(false);
                        }}
                        className={`w-full flex items-center gap-3.5 px-4 py-2.5 sm:py-3 rounded-2xl text-[14px] sm:text-[15px] transition text-left cursor-pointer ${isActive
                          ? "bg-primary text-white font-bold shadow-xs"
                          : "text-gray-900 font-semibold hover:bg-gray-50"
                          }`}
                      >
                        {tab.icon(isActive)}
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Modal Logout */}
                <div className="pt-2 mt-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      handleLogout();
                    }}
                    className="w-full border-2 border-primary text-primary hover:bg-slate-50 font-bold py-2.5 sm:py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-[14px] sm:text-[15px] transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-primary" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col xl:flex-row gap-8 items-start">
                {/* ── Left Sidebar Navigation (Desktop >= xl) ── */}
                <aside className="hidden xl:flex flex-col gap-1 w-full xl:w-64 2xl:w-72 shrink-0 bg-white rounded-2xl border border-gray-200 shadow-xs p-3 xl:sticky xl:top-[90px] xl:max-h-[calc(100vh-105px)] overflow-y-auto">
                  <div className="flex flex-col gap-1">
                    {ACCOUNT_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer ${activeTab === tab.id
                          ? "bg-primary text-white font-bold shadow-xs"
                          : "text-gray-700 font-medium hover:bg-gray-50"
                          }`}
                      >
                        {tab.icon(activeTab === tab.id)}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Bottom Logout Button */}
                  <div className="pt-2 mt-auto">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="border border-primary text-primary hover:bg-slate-50 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm transition w-full cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-primary" />
                      <span>Logout</span>
                    </button>
                  </div>
                </aside>

                {/* ── Right Main Content Area (Matching Image 3) ── */}
                <div className="flex-1 w-full">
                  {activeTab === 'profile' && (
                    <>
                      {/* Section Title Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-[#F47820] text-white flex items-center justify-center shrink-0">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight">
                          Profile Details
                        </h1>
                      </div>

                      {/* Profile Card Container */}
                      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 sm:p-10 relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-10">

                        {/* Left: Avatar */}
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[#F47820] flex items-center justify-center shrink-0 relative z-10">
                          <UserIcon className="w-16 h-16 text-white" />
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
                                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-primary transition"
                                />
                              </div>
                              <div className="mb-5">
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Email</label>
                                <input
                                  type="email"
                                  value={formData.email || ''}
                                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                  placeholder=""
                                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-primary transition"
                                />
                              </div>

                              <div className="flex items-center gap-2 text-gray-500 mb-6">
                                <Phone className="w-4 h-4 shrink-0" />
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
                                  className="px-6 py-2.5 rounded-full bg-primary text-white text-[14px] font-bold hover:bg-[#0f2d4a] transition"
                                >
                                  {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 w-full">
                              <div className="w-full">
                                <div className="flex items-center justify-between sm:justify-start gap-4">
                                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight capitalize">
                                    {user?.name || "Enter your name"}
                                  </h2>

                                  {/* Mobile: Edit button straight to the right of name */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData(user || {});
                                      setShowEditModal(true);
                                    }}
                                    className="sm:hidden border border-primary text-primary hover:bg-slate-50 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition shrink-0 shadow-xs"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>
                                </div>

                                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-semibold inline-block mt-1">
                                  Devotee
                                </span>

                                <div className="mt-4 space-y-1.5 text-xs sm:text-sm text-gray-600 font-medium">
                                  <div className="flex items-center gap-2.5">
                                    <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>{user?.mobileNumber || user?.phone || "+91 XXXXXXXXXX"}</span>
                                  </div>
                                  <div className="flex items-center gap-2.5">
                                    <Mail className="w-4 h-4 text-red-500 shrink-0" />
                                    <span className="h-5 flex items-center">{user?.email || "Add your email"}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Desktop / Tablet: Edit button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(user || {});
                                  setShowEditModal(true);
                                }}
                                className="hidden sm:flex border border-primary text-primary hover:bg-slate-50 text-xs font-bold px-4 py-1.5 rounded-full items-center gap-1.5 transition self-start shadow-xs shrink-0"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
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
                            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-danger shrink-0 shadow-2xs">
                              <Building className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                <span>My Bookings</span>
                                {loadingBookings ? (
                                  <span className="inline-flex items-center text-[10px] text-gray-400 font-normal">
                                    <Loader2 className="animate-spin h-3 w-3 text-gray-500 inline mr-0.5" />
                                  </span>
                                ) : (
                                  <span>({bookingsCount ?? 0})</span>
                                )}
                              </h4>
                              <p className="text-[11px] text-gray-500 font-medium leading-tight">View your all puja bookings and History</p>
                            </div>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 ml-2">
                            ➔
                          </div>
                        </div>

                        {/* Card 2: My Wishlist */}
                        <div
                          onClick={() => setActiveTab('wishlist')}
                          className="cursor-pointer bg-[#fffbeb] border border-[#fef3c7] rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-danger shrink-0 shadow-2xs">
                              <Heart className="w-5 h-5 fill-current" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                <span>My Wishlist</span>
                                {loadingWishlist ? (
                                  <span className="inline-flex items-center text-[10px] text-gray-400 font-normal">
                                    <Loader2 className="animate-spin h-3 w-3 text-gray-500 inline mr-0.5" />
                                  </span>
                                ) : (
                                  <span>({wishlistItems.length})</span>
                                )}
                              </h4>
                              <p className="text-[11px] text-gray-500 font-medium leading-tight">View your saved pujas and services</p>
                            </div>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 ml-2">
                            ➔
                          </div>
                        </div>

                        {/* Card 3: My Addresses */}
                        <div
                          onClick={() => setActiveTab('address')}
                          className="cursor-pointer bg-[#F1F5F9] border border-[#E2E8F0] rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-primary shrink-0 shadow-2xs">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                <span>My Addresses</span>
                                {loadingAddresses ? (
                                  <span className="inline-flex items-center text-[10px] text-gray-400 font-normal">
                                    <Loader2 className="animate-spin h-3 w-3 text-gray-500 inline mr-0.5" />
                                  </span>
                                ) : (
                                  <span>({addresses.length})</span>
                                )}
                              </h4>
                              <p className="text-[11px] text-gray-500 font-medium leading-tight">Manage your saved delivery addresses</p>
                            </div>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 ml-2">
                            ➔
                          </div>
                        </div>
                      </div>

                      {/* ── Green Security Banner (Matching Image 3) ── */}
                      <div className="bg-[#F1F5F9] border border-[#CBD5E1] text-primary text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 mt-6">
                        <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                        <span>Your personal information is protected and securely stored.</span>
                      </div>
                    </>
                  )}

                  {activeTab === 'bookings' && (
                    <BookingsTab />
                  )}

                  {activeTab === 'subscriptions' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-3.5 sm:p-6 lg:p-8 min-h-[450px]">
                      {/* Header section with Title and Filters */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 sm:mb-8 gap-3 sm:gap-4">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] bg-danger text-white flex items-center justify-center shrink-0 shadow-sm">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <h1 className="text-lg sm:text-2xl font-bold font-serif text-[#333]">
                            Subscriptions <span className="text-gray-500 font-medium text-base sm:text-lg ml-1">(0)</span>
                          </h1>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                          <button
                            onClick={() => setSubscriptionFilter("All")}
                            className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 border transition ${subscriptionFilter === "All"
                              ? "border-primary text-primary bg-white shadow-sm"
                              : "border-transparent text-gray-700 bg-[#ebebeb] hover:bg-[#e0e0e0]"
                              }`}
                          >
                            All
                            {subscriptionFilter === "All" && (
                              <div className="w-3.5 h-3.5 rounded-full bg-primary text-white flex items-center justify-center">
                                <Check className="w-2 h-2" strokeWidth={3} />
                              </div>
                            )}
                          </button>
                          <button
                            onClick={() => setSubscriptionFilter("Ongoing")}
                            className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 border transition ${subscriptionFilter === "Ongoing"
                              ? "border-2 border-black text-[#1d3557] bg-[#e5e7eb] shadow-sm"
                              : "border-2 border-transparent text-gray-700 bg-[#ebebeb] hover:bg-[#e0e0e0]"
                              }`}
                          >
                            Ongoing
                          </button>
                          <button
                            onClick={() => setSubscriptionFilter("Complete")}
                            className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 border transition ${subscriptionFilter === "Complete"
                              ? "border-2 border-black text-[#1d3557] bg-[#e5e7eb] shadow-sm"
                              : "border-2 border-transparent text-gray-700 bg-[#ebebeb] hover:bg-[#e0e0e0]"
                              }`}
                          >
                            Complete
                          </button>
                        </div>
                      </div>

                      {/* Empty State Container */}
                      <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Calendar className="w-16 h-16 text-gray-300 mb-4" strokeWidth={2} />
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
                        <div className="w-10 h-10 rounded-[10px] bg-danger text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
                          My Wallet
                        </h1>
                      </div>

                      {/* Main Wallet Card */}
                      <div className="bg-[#fcfaf9] border border-gray-150 rounded-2xl p-6 relative overflow-hidden mb-8 shadow-sm">
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-[10px] bg-[#F1F5F9] flex items-center justify-center shrink-0">
                                <Wallet className="w-5 h-5 text-primary" strokeWidth={2.5} />
                              </div>
                              <h2 className="text-[17px] font-medium font-serif text-gray-800 tracking-wide">astroved Wallet</h2>
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

                          <div className="flex items-center gap-1.5 text-primary text-[12px] font-bold">
                            <ShieldCheck className="w-4 h-4" />
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
                              <Plus className="w-5 h-5 text-[#8b2332]" strokeWidth={2.5} />
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
                              <RefreshCw className="w-5 h-5 text-[#8b2332]" strokeWidth={2.5} />
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
                              <Gift className="w-5 h-5 text-[#8b2332]" strokeWidth={2} />
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
                      <div className="bg-[#F1F5F9] border border-[#CBD5E1] text-primary text-[13px] font-bold py-4 px-5 rounded-2xl flex items-center gap-3">
                        <Check className="w-5 h-5 shrink-0 text-primary" strokeWidth={3} />
                        <span>When your wallet goes live, your balance and transactions will be encrypted and securely stored.</span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'wishlist' && (
                    <div className="animate-fade-in">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-[10px] bg-danger text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Heart className="w-5 h-5 fill-current" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
                          My Wishlist <span className="text-gray-500 font-medium text-lg">({wishlistItems.length})</span>
                        </h1>
                      </div>

                      {loadingWishlist ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={`wish-skel-${i}`} className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 animate-pulse">
                              <div className="w-full aspect-[4/3] bg-stone-200/80 rounded-xl" />
                              <div className="h-4 w-3/4 bg-stone-200 rounded" />
                              <div className="h-3 w-1/2 bg-stone-100 rounded" />
                            </div>
                          ))}
                        </div>
                      ) : wishlistItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
                          <Heart className="w-16 h-16 text-gray-300 mb-4" strokeWidth={2} />
                          <h2 className="text-lg font-extrabold text-gray-800 mb-2">Your wishlist is empty</h2>
                          <p className="text-[13px] font-medium text-gray-500 mb-6">
                            Save your favorite pujas and homas to view them here later.
                          </p>
                          <Link href="/" className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-sm hover:bg-[#0f2d4a] transition">
                            Explore Services
                          </Link>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {wishlistItems.map((item) => (
                            <div key={item.wishlistId} className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12),0_2px_6px_-1px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.16),0_8px_10px_-6px_rgba(0,0,0,0.1)] transition-all duration-300">
                              {/* Top Image Section - Full Bleed */}
                              <Link href={`/${item.serviceType?.toLowerCase() === 'pooja' ? 'puja' : (item.serviceType || 'puja')}/${item.slug || item.serviceId}`} prefetch={true} className="relative h-[200px] w-full block overflow-hidden group cursor-pointer">
                                <Image
                                  src={typeof item.image === "string" ? (item.image.startsWith("http") || item.image.startsWith("/") ? item.image : `/${item.image}`) : ((item.image as any)?.src || "/subrahmanya_swamy_hero.png")}
                                  alt={item.name || "Service Image"}
                                  fill
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                  unoptimized
                                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />

                                {/* Heart Icon (Remove) */}
                                <button
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    try {
                                      await apiClient(`/api/wishlist/updateWishlist`, {
                                        method: "POST",
                                        body: JSON.stringify({ userId: user?.id || user?._id, serviceId: item.serviceId, action: "remove" }),
                                      });
                                      fetchWishlist();
                                    } catch (error) {
                                      console.error(error);
                                    }
                                  }}
                                  className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-white text-primary"
                                >
                                  <Heart className="w-4 h-4 fill-current" />
                                </button>
                              </Link>

                              {/* Bottom Content Section */}
                              <div className="p-4 flex flex-col min-h-[150px]">
                                <Link href={`/${item.serviceType?.toLowerCase() === 'pooja' ? 'puja' : (item.serviceType || 'puja')}/${item.slug || item.serviceId}`} prefetch={true} className="block mb-2">
                                  <h3 className="text-[14px] font-extrabold text-gray-900 leading-[1.3] line-clamp-2 hover:text-primary transition-colors">
                                    {item.name}
                                  </h3>
                                </Link>

                                <div className="flex items-start gap-1.5 text-[12px] text-gray-600 font-medium mb-4">
                                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-[3px] text-[#8b2332]" />
                                  <span className="leading-snug line-clamp-2">{item.location || 'Location details not provided'}</span>
                                </div>

                                <div className="mt-auto flex items-center justify-between pt-1">
                                  <div className="text-[16px] font-extrabold text-gray-900">₹{item.price || 516}</div>
                                  <Link href={`/${item.serviceType?.toLowerCase() === 'pooja' ? 'puja' : (item.serviceType || 'puja')}/${item.slug || item.serviceId}`} prefetch={true} className="bg-primary text-white text-[12px] font-bold pl-4 pr-1 py-1 rounded-full flex items-center gap-2 hover:bg-[#0f2d4a] transition shadow-sm group">
                                    Book Now
                                    <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
                                    </div>
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
                          <div className="w-10 h-10 rounded-[10px] bg-danger text-white flex items-center justify-center shrink-0 shadow-sm">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333] flex items-center gap-1.5">
                            <span>Saved Address</span>
                            {loadingAddresses ? (
                              <span className="inline-flex items-center text-sm text-gray-400 font-normal">
                                <Loader2 className="animate-spin h-4 w-4 text-gray-500 inline mr-0.5" />
                              </span>
                            ) : (
                              <span className="text-gray-500 font-medium text-lg">({addresses.length})</span>
                            )}
                          </h1>
                        </div>
                        {addresses.length > 0 && !loadingAddresses && (
                          <button
                            onClick={() => openAddAddressModal()}
                            className="bg-primary text-white text-xs sm:text-sm font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-full flex items-center gap-1.5 hover:bg-[#0f2d4a] transition"
                          >
                            <span>+</span> Add New Address
                          </button>
                        )}
                      </div>

                      {loadingAddresses ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Array.from({ length: 2 }).map((_, i) => (
                            <div key={`addr-skel-${i}`} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 animate-pulse">
                              <div className="flex justify-between items-center">
                                <div className="h-4 w-20 bg-stone-200 rounded" />
                                <div className="h-4 w-12 bg-stone-100 rounded" />
                              </div>
                              <div className="h-4 w-40 bg-stone-200 rounded" />
                              <div className="h-3 w-56 bg-stone-100 rounded" />
                              <div className="h-3 w-32 bg-stone-100 rounded" />
                            </div>
                          ))}
                        </div>
                      ) : addresses.length === 0 ? (
                        <div className="border border-dashed border-[#dca3a3] bg-[#fdfaf8] rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <MapPin className="w-6 h-6 text-danger" />
                          </div>
                          <h3 className="text-lg font-serif font-bold text-gray-800 mb-1">No saved addresses yet</h3>
                          <p className="text-[13px] text-gray-500 font-medium mb-6">Add a delivery address to check out faster next time.</p>
                          <button
                            onClick={() => openAddAddressModal()}
                            className="bg-primary text-white text-[13px] font-bold px-6 py-2.5 rounded-full flex items-center gap-1.5 hover:bg-[#0f2d4a] transition"
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
                                  <span className="flex items-center gap-1.5 bg-[#fdf2f0] text-danger text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                                    <Building className="w-3 h-3" />
                                    {addr.type}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="bg-[#F1F5F9] text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-[15px] font-bold text-gray-900 mb-1.5">{addr.name}</h4>
                                <p className="text-[13px] text-gray-600 leading-relaxed mb-3 pr-4">
                                  {addr.address}
                                </p>
                                <div className="flex items-center gap-2 text-[13px] text-gray-700 font-medium mb-4">
                                  <Phone className="w-4 h-4 text-red-500" />
                                  {addr.phone}
                                </div>
                                <hr className="border-gray-150 mb-4" />
                                <div className="flex items-center gap-3">
                                  <button onClick={() => openEditAddressModal(addr)} className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 rounded-full text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition">
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Edit
                                  </button>
                                  <button onClick={() => handleDeleteAddress((addr._id || addr.id) as string)} className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 rounded-full text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition">
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}

                            <div
                              onClick={() => openAddAddressModal()}
                              className="border border-dashed border-[#a3e3c6] bg-[#e8fbf1] rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-[#d8f5e6] transition text-center min-h-[220px]"
                            >
                              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-primary">
                                <Plus className="w-5 h-5" />
                              </div>
                              <span className="text-primary text-[14px] font-bold">Add a New Address</span>
                            </div>
                          </div>

                          <div className="bg-[#F1F5F9] text-primary text-[12px] font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                            <Check className="w-4 h-4 shrink-0" strokeWidth={3} />
                            Your saved addresses are protected and securely stored.
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === 'language' && (
                    <div className="animate-fade-in w-full">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-[10px] bg-danger text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Globe className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
                          Language Preferences
                        </h1>
                      </div>

                      <div className="bg-[#fdf2f0] border border-[#fce4e0] text-danger p-4 rounded-xl flex items-start gap-3 mb-8">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
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
                                ? 'border-primary bg-white shadow-sm'
                                : 'border-gray-150 bg-white hover:border-primary hover:shadow-sm'
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold ${isSelected
                                  ? 'bg-primary text-white'
                                  : 'bg-[#F1F5F9] text-primary'
                                  }`}>
                                  {lang.char}
                                </div>
                                <div>
                                  <div className="text-[14px] font-bold text-gray-900 leading-tight mb-0.5">{lang.name}</div>
                                  <div className="text-[12px] text-gray-500 font-medium">{lang.nativeName}</div>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-4 mb-8">
                        <button className="bg-[#83d9aa] text-white text-[13px] font-bold px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-[#68c894] transition">
                          Save Preference
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </button>
                        <div className="text-[13px] text-gray-600">
                          Currently selected: <strong className="text-gray-900">{selectedLanguage}</strong>
                        </div>
                      </div>

                      <div className="bg-[#F1F5F9] text-primary text-[12px] font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0" strokeWidth={3} />
                        Your language preference is saved to your account and synced across devices.
                      </div>
                    </div>
                  )}

                  {activeTab === 'about' && (
                    <div className="animate-fade-in w-full">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-[10px] bg-danger text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Info className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
                          About astroved
                        </h1>
                      </div>

                      {/* Top Banner */}
                      <div className="bg-[#fcf5f3] rounded-2xl p-8 mb-8 text-center border border-[#faebe8]">
                        <div className="mb-4 flex justify-center">
                          {/* astroved text logo approximation */}
                          <div className="flex items-center gap-1.5 text-danger">
                            <Landmark className="w-5 h-5" />
                            <span className="font-serif font-bold text-sm tracking-wide">astroved</span>
                          </div>
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-[#333] mb-4">A Sacred Bridge Between Devotees and Temples</h2>
                        <p className="text-[13px] text-gray-600 leading-relaxed max-w-2xl mx-auto">
                          astroved is a spiritual platform that enables devotees to book authentic Vedic pujas from sacred temples across India. We connect you with verified, experienced Pandits who perform rituals in your name and family&apos;s name &mdash; and deliver the complete puja video, prasadam, and divine blessings right to your home.
                        </p>
                      </div>

                      {/* What We Offer */}
                      <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">What We Offer</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
                          <div className="w-10 h-10 rounded-xl bg-danger text-white flex items-center justify-center mb-4">
                            <Landmark className="w-5 h-5" />
                          </div>
                          <h4 className="text-[14px] font-bold text-gray-900 mb-2">Authentic Temple Pujas</h4>
                          <p className="text-[12px] text-gray-500 leading-relaxed">
                            Rituals performed in sacred temples following traditional Pancharatra and Vedic Agama practices.
                          </p>
                        </div>

                        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
                          <div className="w-10 h-10 rounded-xl bg-danger text-white flex items-center justify-center mb-4">
                            <Video className="w-5 h-5" />
                          </div>
                          <h4 className="text-[14px] font-bold text-gray-900 mb-2">Puja Video Delivered</h4>
                          <p className="text-[12px] text-gray-500 leading-relaxed">
                            Receive your full puja video on WhatsApp within 48 hours, including your personalized sankalpam.
                          </p>
                        </div>

                        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
                          <div className="w-10 h-10 rounded-xl bg-danger text-white flex items-center justify-center mb-4">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <h4 className="text-[14px] font-bold text-gray-900 mb-2">Authentic Puja Journey</h4>
                          <p className="text-[12px] text-gray-500 leading-relaxed">
                            Experience a seamless puja journey from booking to divine blessings.
                          </p>
                        </div>

                        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
                          <div className="w-10 h-10 rounded-xl bg-danger text-white flex items-center justify-center mb-4">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <h4 className="text-[14px] font-bold text-gray-900 mb-2">Verified Pandits</h4>
                          <p className="text-[12px] text-gray-500 leading-relaxed">
                            Every ritual is conducted by experienced, verified Vedic acharyas you can trust.
                          </p>
                        </div>

                        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm md:col-span-2">
                          <div className="w-10 h-10 rounded-xl bg-danger text-white flex items-center justify-center mb-4">
                            <Tag className="w-5 h-5" />
                          </div>
                          <h4 className="text-[14px] font-bold text-gray-900 mb-2">Our Brands</h4>
                          <p className="text-[12px] text-gray-500 leading-relaxed">
                            Organisations we work with to serve devotees better divyakshetram, nithyasamrithi, kailasamandir, poojamandhir, Vedalayam, devotsav, daivasankalpam, jyotirvedam, manebhakti, aalayaseva, vishwappoje, pujasankalpam, kovilseva
                          </p>
                        </div>
                      </div>

                      {/* Stats Bar */}
                      <div className="bg-gradient-to-r from-danger to-[#a32230] rounded-2xl p-6 text-white grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-center shadow-md">
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
                            <Star className="w-5 h-5 text-[#fad06a] fill-current" />
                          </div>
                          <div className="text-[10px] font-bold tracking-wider uppercase text-red-100">Devotee Rating</div>
                        </div>
                      </div>

                      {/* Our Mission */}
                      <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Our Mission</h3>
                      <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm mb-8">
                        <p className="text-[13px] text-gray-600 leading-relaxed">
                          Our mission is to make authentic Vedic worship accessible to every devotee, wherever they are. Distance, time, and busy lives should never stand between a devotee and divine blessings. Through technology and tradition together, astroved brings the sanctity of the temple to your home.
                        </p>
                      </div>

                      {/* Company Information */}
                      <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Company Information</h3>
                      <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm mb-8">
                        <p className="text-[13px] text-gray-600 leading-relaxed mb-4">
                          Corporate Office:
                        </p>
                        <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
                          4th Floor, A-Block, Prince Info Park,<br />
                          Plot No. 81-B, 2nd Main Road,<br />
                          Ambattur Industrial Estate, Chennai 600058.
                        </p>
                        <p className="text-[13px] text-gray-700 font-semibold leading-relaxed">
                          Phone: <a href="tel:+914443419898" className="text-primary hover:underline">+91-44-43419898</a>
                        </p>
                      </div>

                      {/* Bottom Banner */}
                      <div className="bg-[#F1F5F9] text-primary text-[12px] font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0" strokeWidth={3} />
                        100% Secure & Verified bookings &mdash; trusted by devotees across India.
                      </div>
                    </div>
                  )}

                  {activeTab === 'support' && (
                    <div className="animate-fade-in w-full">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-[10px] bg-danger text-white flex items-center justify-center shrink-0 shadow-sm">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#333]">
                          Help & Support
                        </h1>
                      </div>

                      {/* Contact Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                        {/* WhatsApp */}
                        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center mb-4">
                            <i className="fa-brands fa-whatsapp text-2xl text-[#25D366]"></i>
                          </div>
                          <h4 className="text-[14px] font-bold text-gray-900 mb-1">WhatsApp Support</h4>
                          <p className="text-[11px] text-gray-500 mb-4">Reply within minutes</p>
                          <button className="text-primary text-[12px] font-bold flex items-center gap-1 hover:text-[#0f2d4a]">
                            +91 9566777645 <span>&rarr;</span>
                          </button>
                        </div>

                        {/* Call Support */}
                        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center mb-4">
                            <Phone className="w-5 h-5" />
                          </div>
                          <h4 className="text-[14px] font-bold text-gray-900 mb-1">Call Support</h4>
                          <p className="text-[11px] text-gray-500 mb-4">10 AM - 7 PM, all days</p>
                          <button className="text-primary text-[12px] font-bold flex items-center gap-1 hover:text-[#0f2d4a]">
                            +91 9677391108 <span>&rarr;</span>
                          </button>
                        </div>

                        {/* Email Support */}
                        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                          <div className="w-10 h-10 rounded-xl bg-[#d49a46] text-white flex items-center justify-center mb-4">
                            <Mail className="w-5 h-5" />
                          </div>
                          <h4 className="text-[14px] font-bold text-gray-900 mb-1">Email Support</h4>
                          <p className="text-[11px] text-gray-500 mb-4">Response within 24 hours</p>
                          <button className="text-primary text-[12px] font-bold flex items-center gap-1 hover:text-[#0f2d4a]">
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
                            <span className="text-primary font-bold text-xl leading-none">
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
                            <span className="text-primary font-bold text-xl leading-none">
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
                            <span className="text-primary font-bold text-xl leading-none">
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
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="text-[12px] font-bold text-gray-800 block mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
                            <div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:border-primary">
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
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="text-[12px] font-bold text-gray-800 block mb-1.5">Booking ID <span className="text-gray-400 font-medium">(optional)</span></label>
                            <input
                              type="text"
                              placeholder="e.g. VM123456789"
                              value={helpFormData.bookingId}
                              onChange={(e) => setHelpFormData({ ...helpFormData, bookingId: e.target.value })}
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="text-[12px] font-bold text-gray-800 block mb-1.5">Subject <span className="text-red-500">*</span></label>
                          <select
                            value={helpFormData.subject}
                            onChange={(e) => setHelpFormData({ ...helpFormData, subject: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-primary bg-white appearance-none"
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
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-primary resize-none"
                          ></textarea>
                          <div className="text-right text-[10px] text-gray-400 mt-1">
                            {helpFormData.message.length} / 1000
                          </div>
                        </div>

                        {/* <label className="flex items-start gap-2 cursor-pointer mb-6">
                          <input
                            type="checkbox"
                            checked={helpFormData.consent}
                            onChange={(e) => setHelpFormData({ ...helpFormData, consent: e.target.checked })}
                            className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-[11px] font-medium text-gray-600">I authorize astroved to send notifications via SMS / WhatsApp / email. <span className="text-red-500">*</span></span>
                        </label> */}

                        <button
                          onClick={handleHelpSubmit}
                          disabled={isSubmittingHelp}
                          className={`bg-primary text-white text-[13px] font-bold px-6 py-2.5 rounded-full flex items-center gap-1.5 transition w-max ${isSubmittingHelp ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#0f2d4a]'}`}
                        >
                          {isSubmittingHelp ? 'Submitting...' : 'Submit Request'} {!isSubmittingHelp && <span>&rarr;</span>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
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
                  <X className="w-4 h-4" strokeWidth={2.5} />
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
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[13px] font-bold text-gray-800 block mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Recipient name"
                      value={addressFormData.fullName}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                        setAddressFormData(p => ({ ...p, fullName: val }));
                        if (addressErrors.fullName) {
                          setAddressErrors(prev => ({ ...prev, fullName: "" }));
                        }
                      }}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none transition ${addressErrors.fullName
                        ? "border-red-500 focus:border-red-500 bg-red-50/20"
                        : "border-gray-250 focus:border-primary"
                        }`}
                    />
                    {addressErrors.fullName && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{addressErrors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-gray-800 block mb-1.5">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      maxLength={10}
                      value={addressFormData.phone}
                      onChange={(e) => {
                        let digits = e.target.value.replace(/\D/g, "");
                        // Ensure first digit must be 6, 7, 8, or 9
                        if (digits.length > 0 && !['6', '7', '8', '9'].includes(digits[0])) {
                          digits = "";
                        }
                        setAddressFormData(p => ({ ...p, phone: digits }));
                        if (addressErrors.phone) {
                          setAddressErrors(prev => ({ ...prev, phone: "" }));
                        }
                      }}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none transition ${addressErrors.phone
                        ? "border-red-500 focus:border-red-500 bg-red-50/20"
                        : "border-gray-250 focus:border-primary"
                        }`}
                    />
                    {addressErrors.phone && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{addressErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-[13px] font-bold text-gray-800 block mb-1.5">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Flat / House no. / Building / Street"
                    value={addressFormData.address}
                    onChange={(e) => {
                      setAddressFormData(p => ({ ...p, address: e.target.value }));
                      if (addressErrors.address) {
                        setAddressErrors(prev => ({ ...prev, address: "" }));
                      }
                    }}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none transition ${addressErrors.address
                      ? "border-red-500 focus:border-red-500 bg-red-50/20"
                      : "border-gray-250 focus:border-primary"
                      }`}
                  />
                  {addressErrors.address && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{addressErrors.address}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="text-[13px] font-bold text-gray-800 block mb-1.5">Landmark <span className="text-gray-400 font-medium">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="Nearby landmark / area"
                    value={addressFormData.landmark}
                    onChange={(e) => setAddressFormData(p => ({ ...p, landmark: e.target.value }))}
                    className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[13px] font-bold text-gray-800 block mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="City"
                      value={addressFormData.city}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                        setAddressFormData(p => ({ ...p, city: val }));
                        if (addressErrors.city) {
                          setAddressErrors(prev => ({ ...prev, city: "" }));
                        }
                      }}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none transition ${addressErrors.city
                        ? "border-red-500 focus:border-red-500 bg-red-50/20"
                        : "border-gray-250 focus:border-primary"
                        }`}
                    />
                    {addressErrors.city && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{addressErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-gray-800 block mb-1.5">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="State"
                      value={addressFormData.state}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                        setAddressFormData(p => ({ ...p, state: val }));
                        if (addressErrors.state) {
                          setAddressErrors(prev => ({ ...prev, state: "" }));
                        }
                      }}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none transition ${addressErrors.state
                        ? "border-red-500 focus:border-red-500 bg-red-50/20"
                        : "border-gray-250 focus:border-primary"
                        }`}
                    />
                    {addressErrors.state && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{addressErrors.state}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="text-[13px] font-bold text-gray-800 block mb-1.5">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="500033"
                      maxLength={6}
                      value={addressFormData.pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setAddressFormData(p => ({ ...p, pincode: val }));
                        if (addressErrors.pincode) {
                          setAddressErrors(prev => ({ ...prev, pincode: "" }));
                        }
                      }}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none transition ${addressErrors.pincode
                        ? "border-red-500 focus:border-red-500 bg-red-50/20"
                        : "border-gray-250 focus:border-primary"
                        }`}
                    />
                    {addressErrors.pincode && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{addressErrors.pincode}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-gray-800 block mb-1.5">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="India"
                      value={addressFormData.country}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                        setAddressFormData(p => ({ ...p, country: val }));
                        if (addressErrors.country) {
                          setAddressErrors(prev => ({ ...prev, country: "" }));
                        }
                      }}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none transition ${addressErrors.country
                        ? "border-red-500 focus:border-red-500 bg-red-50/20"
                        : "border-gray-250 focus:border-primary"
                        }`}
                    />
                    {addressErrors.country && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{addressErrors.country}</p>
                    )}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={addressFormData.isDefault}
                    onChange={(e) => setAddressFormData(p => ({ ...p, isDefault: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
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
                  className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-[#0f2d4a] transition"
                >
                  {addressFormData._id ? "Update Address" : "Add Address"}
                </button>
              </div>
            </div>
          </div>
        )}



        {/* ── Login Modal ── */}
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </main>
      <Footer />
    </>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafc] pb-16 font-sans">
          <div className="mx-auto max-w-[1350px] px-4 sm:px-6 lg:px-10 py-3.5 border-b border-gray-150 bg-white">
            <div className="h-4 w-48 bg-stone-200/80 rounded animate-pulse" />
          </div>
          <div className="mx-auto max-w-[1350px] px-2.5 sm:px-6 lg:px-10 pt-4 sm:pt-8 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="hidden lg:block lg:col-span-3 bg-white rounded-3xl border border-stone-200 p-5 space-y-4 animate-pulse">
                <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                  <div className="w-12 h-12 rounded-full bg-stone-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-24 bg-stone-200 rounded" />
                    <div className="h-3 w-16 bg-stone-100 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-10 w-full bg-stone-100 rounded-xl" />
                  <div className="h-10 w-full bg-stone-100 rounded-xl" />
                  <div className="h-10 w-full bg-stone-100 rounded-xl" />
                </div>
              </div>
              <div className="lg:col-span-9 bg-white rounded-3xl border border-stone-200 p-6 space-y-6 animate-pulse">
                <div className="h-6 w-40 bg-stone-200 rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-28 bg-stone-100 rounded-2xl" />
                  <div className="h-28 bg-stone-100 rounded-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <AccountPageContent />
    </Suspense>
  );
}
