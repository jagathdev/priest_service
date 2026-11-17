import Link from "next/link";
import { cookies } from "next/headers";
import {
  SparklesIcon,
  FireIcon,
  ShoppingBagIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default async function AdminDashboard() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
  let stats = {
    pujas: 0,
    homas: 0,
    orders: 0,
    revenue: 0,
    otps: {
      total: 0,
      today: 0,
      verified: 0,
      pending: 0,
    },
  };
  let recentBookings: any[] = [];

  const cookieStore = await cookies();
  const adminToken = cookieStore.get("adminToken")?.value;
  const headers: Record<string, string> = adminToken
    ? { Authorization: `Bearer ${adminToken}`, Cookie: `adminToken=${adminToken}` }
    : {};

  try {
    const res = await fetch(`${baseUrl}/api/admin/stats`, {
      cache: "no-store",
      headers,
    });
    if (res.ok) {
      const resData = await res.json();
      if (resData.success && resData.data) {
        stats = {
          pujas: resData.data.pujas ?? 0,
          homas: resData.data.homas ?? 0,
          orders: resData.data.orders ?? 0,
          revenue: resData.data.revenue ?? 0,
          otps: {
            total: resData.data.otps?.total ?? 0,
            today: resData.data.otps?.today ?? 0,
            verified: resData.data.otps?.verified ?? 0,
            pending: resData.data.otps?.pending ?? 0,
          },
        };
        if (Array.isArray(resData.data.recentBookings)) {
          recentBookings = resData.data.recentBookings;
        }
      }
    }
  } catch (err) {
    console.error("Failed to load dashboard stats:", err);
  }

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Control Center</h1>
          <p className="text-xs text-gray-500 mt-1">Manage Pujas, Homas, Bookings, Devotee Orders &amp; Revenue Metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pujas"
            className="px-4 py-2.5 rounded-xl bg-success text-white text-xs font-bold hover:bg-[#058a51] transition flex items-center gap-1.5 shadow-xs"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>+ Add Puja</span>
          </Link>
          <Link
            href="/admin/homas"
            className="px-4 py-2.5 rounded-xl bg-[#5b1422] text-white text-xs font-bold hover:bg-[#47101a] transition flex items-center gap-1.5 shadow-xs"
          >
            <FireIcon className="w-4 h-4" />
            <span>+ Add Homa</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Pujas Card */}
        <Link href="/admin/pujas" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Pujas</dt>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5" />
            </div>
          </div>
          <dd className="text-3xl font-black text-gray-900 mt-3">{stats.pujas}</dd>
          <span className="text-xs font-bold text-success mt-2 inline-block group-hover:underline">Manage Pujas →</span>
        </Link>

        {/* Total Homas Card */}
        <Link href="/admin/homas" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Homas</dt>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#5b1422] flex items-center justify-center">
              <FireIcon className="w-5 h-5" />
            </div>
          </div>
          <dd className="text-3xl font-black text-gray-900 mt-3">{stats.homas}</dd>
          <span className="text-xs font-bold text-success mt-2 inline-block group-hover:underline">Manage Homas →</span>
        </Link>

        {/* Total Orders Card */}
        <Link href="/admin/orders" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Bookings</dt>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBagIcon className="w-5 h-5" />
            </div>
          </div>
          <dd className="text-3xl font-black text-gray-900 mt-3">{stats.orders}</dd>
          <span className="text-xs font-bold text-success mt-2 inline-block group-hover:underline">View Bookings →</span>
        </Link>

        {/* Total Revenue Card */}
        <Link href="/admin/orders" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</dt>
            <div className="w-9 h-9 rounded-xl bg-green-50 text-success flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5" />
            </div>
          </div>
          <dd className="text-3xl font-black text-success mt-3">₹{stats.revenue.toLocaleString()}</dd>
          <span className="text-xs font-bold text-success mt-2 inline-block group-htext-green-700rline">View Bookings →</span>
        </Link>
      </div>

      {/* OTP Activity & Database Metrics */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <DevicePhoneMobileIcon className="w-5 h-5 text-indigo-600" />
              <span>OTP Activity &amp; Database Counts</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Real-time counts of OTPs generated today and stored in the database.</p>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Database Synced
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* OTPs Generated Today */}
          <div className="bg-white rounded-2xl border-2 border-indigo-200 p-5 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/40">
            <div className="flex items-center justify-between">
              <dt className="text-xs font-bold text-indigo-700 uppercase tracking-wider">OTPs Generated Today</dt>
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <ClockIcon className="w-4 h-4" />
              </div>
            </div>
            <dd className="text-3xl font-black text-indigo-950 mt-2">{stats.otps.today}</dd>
            <p className="text-[11px] text-indigo-600/80 font-medium mt-1">Generated since 12:00 AM today</p>
          </div>

          {/* Total Stored in DB */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total OTPs in DB</dt>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <DevicePhoneMobileIcon className="w-4 h-4" />
              </div>
            </div>
            <dd className="text-3xl font-black text-gray-900 mt-2">{stats.otps.total}</dd>
            <p className="text-[11px] text-gray-500 font-medium mt-1">All unique devotee mobile records</p>
          </div>

          {/* Verified OTPs */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verified Sessions</dt>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircleIcon className="w-4 h-4" />
              </div>
            </div>
            <dd className="text-3xl font-black text-emerald-600 mt-2">{stats.otps.verified}</dd>
            <p className="text-[11px] text-gray-500 font-medium mt-1">Successfully authenticated</p>
          </div>

          {/* Active / Pending OTPs */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active / Pending OTPs</dt>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ClockIcon className="w-4 h-4" />
              </div>
            </div>
            <dd className="text-3xl font-black text-amber-600 mt-2">{stats.otps.pending}</dd>
            <p className="text-[11px] text-gray-500 font-medium mt-1">Within 5-minute validity window</p>
          </div>
        </div>
      </div>

      {/* Quick Recent Bookings Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Devotee Bookings</h2>
          <Link href="/admin/orders" className="text-xs font-bold text-success hover:underline">View All →</Link>
        </div>

        <div className="w-full overflow-x-hidden">
          <table className="w-full text-left text-xs table-fixed">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10.5px] font-bold tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3 w-28 sm:w-36">Devotee</th>
                <th className="py-3 px-3">Service Ritual</th>
                <th className="py-3 px-2 w-20 text-center">Type</th>
                <th className="py-3 px-2 w-24 text-center">Source</th>
                <th className="py-3 px-3 w-28 sm:w-32">Booked At</th>
                <th className="py-3 px-3 w-20 text-right">Amount</th>
                <th className="py-3 px-3 w-24 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500 text-xs">
                    No recent devotee bookings found.
                  </td>
                </tr>
              ) : (
                recentBookings.slice(0, 10).map((booking: any, idx: number) => {
                  const serviceTitle =
                    booking.serviceName ||
                    booking.itemName ||
                    (typeof booking.pooja === "string" ? booking.pooja : booking.pooja?.title || booking.pooja?.name) ||
                    "Sacred Ritual";
                  const rawType = (booking.serviceType || booking.type || "Puja").toUpperCase();
                  const rawStatus = (booking.orderStatus || booking.paymentStatus || "confirmed").toLowerCase();

                  let badgeClass = "bg-blue-50 text-blue-700 border border-blue-200";
                  if (rawStatus === "scheduled") badgeClass = "bg-amber-50 text-amber-700 border border-amber-200";
                  else if (rawStatus === "performed") badgeClass = "bg-indigo-50 text-indigo-700 border border-indigo-200";
                  else if (rawStatus === "completed" || rawStatus === "paid") badgeClass = "bg-emerald-50 text-emerald-700 border border-emerald-200";
                  else if (rawStatus === "confirmed") badgeClass = "bg-teal-50 text-teal-700 border border-teal-200";

                  // Format Booking Date & Time
                  const dateSource = booking.createdAt || booking.bookingDate;
                  let bookingTimeInfo: { datePart: string; timePart: string } | null = null;
                  if (dateSource) {
                    try {
                      const d = new Date(dateSource);
                      if (!isNaN(d.getTime())) {
                        bookingTimeInfo = {
                          datePart: d.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }),
                          timePart: d.toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }).toLowerCase(),
                        };
                      }
                    } catch {
                      bookingTimeInfo = null;
                    }
                  }

                  const src = booking.utmSource || "Direct";
                  const lowerSrc = src.toLowerCase();
                  let sourceBadgeStyle = "bg-gray-100 text-gray-700 border-gray-200";
                  if (lowerSrc.includes("google")) sourceBadgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
                  else if (lowerSrc.includes("facebook") || lowerSrc.includes("fb")) sourceBadgeStyle = "bg-indigo-50 text-indigo-700 border-indigo-200";
                  else if (lowerSrc.includes("instagram")) sourceBadgeStyle = "bg-pink-50 text-pink-700 border-pink-200";
                  else if (lowerSrc.includes("whatsapp")) sourceBadgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  else if (lowerSrc.includes("youtube")) sourceBadgeStyle = "bg-red-50 text-red-700 border-red-200";

                  const orderId = booking._id;

                  return (
                    <tr
                      key={booking._id || idx}
                      className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                    >
                      {/* S.No */}
                      <td className="py-3 px-3 text-center text-xs font-bold text-gray-400">
                        <Link href={`/admin/orders/${orderId}`} className="block w-full h-full">
                          {idx + 1}
                        </Link>
                      </td>

                      {/* Devotee Name */}
                      <td className="py-3 px-3">
                        <Link href={`/admin/orders/${orderId}`} className="block">
                          <span className="font-bold text-gray-900 block truncate group-hover:text-emerald-700 transition" title={booking.customerName || booking.participants?.[0]?.name || "Devotee"}>
                            {booking.customerName || booking.participants?.[0]?.name || booking.name || "Devotee"}
                          </span>
                        </Link>
                      </td>

                      {/* Service Ritual */}
                      <td className="py-3 px-3">
                        <Link href={`/admin/orders/${orderId}`} className="block">
                          <span className="font-bold text-gray-800 block truncate group-hover:text-emerald-700 transition" title={serviceTitle}>
                            {serviceTitle}
                          </span>
                        </Link>
                      </td>

                      {/* Service Type */}
                      <td className="py-3 px-2 text-center">
                        <Link href={`/admin/orders/${orderId}`} className="inline-block">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase ${rawType.includes("HOMA")
                              ? "bg-purple-100 text-purple-700"
                              : "bg-emerald-100 text-emerald-700"
                              }`}
                          >
                            {rawType.includes("HOMA") ? "HOMA" : "PUJA"}
                          </span>
                        </Link>
                      </td>

                      {/* Source */}
                      <td className="py-3 px-2 text-center">
                        <Link href={`/admin/orders/${orderId}`} className="inline-block">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${sourceBadgeStyle}`}>
                            {src}
                          </span>
                        </Link>
                      </td>

                      {/* Booked At (Timestamp: Date + Time) */}
                      <td className="py-3 px-3">
                        <Link href={`/admin/orders/${orderId}`} className="block">
                          {bookingTimeInfo ? (
                            <div className="space-y-0.5">
                              <div className="font-bold text-gray-800 text-[11px] truncate">
                                {bookingTimeInfo.datePart}
                              </div>
                              <div className="text-[10px] font-semibold text-gray-400">
                                {bookingTimeInfo.timePart}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">–</span>
                          )}
                        </Link>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 font-extrabold text-gray-900 text-right whitespace-nowrap">
                        <Link href={`/admin/orders/${orderId}`} className="block">
                          ₹{(booking.pricing?.total || booking.amount || 0).toLocaleString("en-IN")}
                        </Link>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <Link href={`/admin/orders/${orderId}`} className="inline-block">
                          <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide inline-block ${badgeClass}`}>
                            {booking.orderStatus || booking.paymentStatus || "Confirmed"}
                          </span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
