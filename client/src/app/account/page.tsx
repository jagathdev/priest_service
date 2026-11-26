"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useUser } from "@/contexts/UserContext";
import { apiClient, getAuthToken } from "@/services/api";

import AccountAuthCard from "@/components/account/AccountAuthCard";
import AccountSidebar, { ACCOUNT_TABS } from "@/components/account/AccountSidebar";
import ProfileTab from "@/components/account/ProfileTab";
import BookingsTab from "@/components/account/BookingsTab";
import SubscriptionsTab from "@/components/account/SubscriptionsTab";
import WalletTab from "@/components/account/WalletTab";
import WishlistTab, { WishlistItem } from "@/components/account/WishlistTab";
import SavedAddressTab from "@/components/account/SavedAddressTab";
import AboutTab from "@/components/account/AboutTab";
import SupportTab from "@/components/account/SupportTab";

function AccountPageContent() {
  const searchParams = useSearchParams();
  const { user, setUser, isHydrated } = useUser();
  const [activeTab, setActiveTab] = useState("profile");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync tab from URL query (?tab=bookings, etc.)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Sync hash if present
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hashTab = window.location.hash.replace("#", "");
      if (ACCOUNT_TABS.some((t) => t.id === hashTab)) {
        setActiveTab(hashTab);
      }
    }
  }, []);

  // Shared state: Bookings count & Wishlist
  const [bookingsCount, setBookingsCount] = useState<number | null>(null);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(!user?.addresses);

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
    const userId = user?._id || user?.id;
    if (userId && getAuthToken()) {
      if (!user?.addresses || user.addresses.length === 0) {
        setLoadingAddresses(true);
      }
      apiClient(`/api/users/profile/${userId}`)
        .then((res) => {
          if (res.success && res.data) {
            setUser((prev) => ({ ...(prev || {}), ...res.data }));
          }
        })
        .catch((err) => {
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
        .then((data) => {
          if (data && data.success && Array.isArray(data.data)) {
            setBookingsCount(data.data.length);
          } else if (Array.isArray(data)) {
            setBookingsCount(data.length);
          } else {
            setBookingsCount(0);
          }
        })
        .catch((err) => {
          console.error("Error fetching bookings count:", err);
          setBookingsCount(0);
        })
        .finally(() => {
          setLoadingBookings(false);
        });
      fetchWishlist();
    } else {
      setLoadingBookings(false);
      setLoadingWishlist(false);
    }
  }, [user?._id, user?.id, fetchWishlist]);

  const handleLogout = async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com"}/api/auth/logout`,
        { method: "POST" }
      );
    } catch {
      // ignore
    }
    document.cookie = "userLogin=false; path=/; max-age=0;";
    localStorage.removeItem("token");
    localStorage.removeItem("mockUser");
    setUser(null);
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
                <div className="space-y-2 pt-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-9 bg-stone-100 rounded-xl" />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-9 bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 min-h-[400px] animate-pulse">
                <div className="h-7 w-48 bg-stone-200 rounded-lg mb-8" />
                <div className="h-32 bg-stone-100 rounded-2xl mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="h-20 bg-stone-100 rounded-2xl" />
                  <div className="h-20 bg-stone-100 rounded-2xl" />
                  <div className="h-20 bg-stone-100 rounded-2xl" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  const addresses = user?.addresses || [];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#fafafc] pb-16 font-sans">
        {/* Top Breadcrumb Bar */}
        <div className="border-b border-gray-150 bg-white">
          <div className="mx-auto max-w-[1350px] px-4 sm:px-6 lg:px-10 py-3.5 flex items-center justify-between text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-2">
              <Link href="/" className="hover:text-gray-900 transition">
                Home
              </Link>
              <span>/</span>
              <button
                onClick={() => {
                  setActiveTab("profile");
                  setIsDrawerOpen(false);
                }}
                className={`transition cursor-pointer ${
                  activeTab === "profile" ? "text-gray-900 font-bold" : "hover:text-gray-900"
                }`}
              >
                Account
              </button>
              {activeTab !== "profile" && (
                <>
                  <span>/</span>
                  <span className="text-gray-900 font-bold capitalize">
                    {ACCOUNT_TABS.find((t) => t.id === activeTab)?.label || activeTab}
                  </span>
                </>
              )}
            </div>

            {/* Mobile menu trigger */}
            {user && (
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="lg:hidden text-xs font-bold text-primary flex items-center gap-1 border border-primary/20 bg-primary/5 px-2.5 py-1 rounded-full cursor-pointer"
              >
                <span>Menu</span>
              </button>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-[1350px] px-2.5 sm:px-6 lg:px-10 pt-4 sm:pt-8 pb-16">
          {!user ? (
            /* Direct 1-Click Form for Unauthenticated Users */
            <AccountAuthCard />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Desktop Left Sidebar (3 Cols) */}
              <aside className="hidden lg:block lg:col-span-3 sticky top-24">
                <AccountSidebar
                  user={user}
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                  onLogout={handleLogout}
                />
              </aside>

              {/* Mobile Drawer */}
              {isDrawerOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                  <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                    onClick={() => setIsDrawerOpen(false)}
                  />
                  <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl p-5 z-10 flex flex-col">
                    <AccountSidebar
                      user={user}
                      activeTab={activeTab}
                      onSelectTab={setActiveTab}
                      onLogout={handleLogout}
                      isDrawer={true}
                      onCloseDrawer={() => setIsDrawerOpen(false)}
                    />
                  </div>
                </div>
              )}

              {/* Right Main Content Pane (9 Cols) */}
              <section className="lg:col-span-9 w-full">
                {activeTab === "profile" && (
                  <ProfileTab
                    onNavigateTab={setActiveTab}
                    bookingsCount={bookingsCount}
                    loadingBookings={loadingBookings}
                    wishlistCount={wishlistItems.length}
                    loadingWishlist={loadingWishlist}
                    addressesCount={addresses.length}
                    loadingAddresses={loadingAddresses}
                  />
                )}

                {activeTab === "bookings" && <BookingsTab />}

                {activeTab === "subscriptions" && <SubscriptionsTab />}

                {activeTab === "wallet" && <WalletTab />}

                {activeTab === "wishlist" && (
                  <WishlistTab
                    wishlistItems={wishlistItems}
                    loadingWishlist={loadingWishlist}
                    onRefreshWishlist={fetchWishlist}
                  />
                )}

                {activeTab === "address" && (
                  <SavedAddressTab loadingAddresses={loadingAddresses} />
                )}

                {activeTab === "about" && <AboutTab />}

                {activeTab === "support" && <SupportTab />}
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafc] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <AccountPageContent />
    </Suspense>
  );
}
