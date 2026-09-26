"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

interface User {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  placeOfBirth?: string;
  occupation?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState<"contact" | "general">("general");
  const [formData, setFormData] = useState<User>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
          setFormData(data.user);
        } else {
          router.push("/auth/login");
        }
        setLoading(false);
      })
      .catch(() => {
        router.push("/auth/login");
        setLoading(false);
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleSave = () => {
    setSaving(true);
    // Merge updated form data into user state
    setTimeout(() => {
      setUser((prev) => ({ ...prev, ...formData }));
      setSaving(false);
      setShowEditModal(false);
    }, 600);
  };

  const isProfileComplete =
    user?.gender && user?.dob && user?.placeOfBirth && user?.occupation;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center bg-[#f5f3ff]">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[#000000]" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f5f3ff]">
        {/* Breadcrumb */}
        <nav className="bg-[#f5f3ff] py-3.5 px-6 sticky top-[64px] z-30 border-b border-[#ddd6fe]">
          <div className="mx-auto max-w-3xl text-[14px] font-semibold text-gray-500 flex items-center gap-2.5">
            <Link href="/" className="hover:text-gray-800 transition-colors">Home</Link>
            <i className="fa-solid fa-chevron-right text-[10px] opacity-70"></i>
            <span className="text-[#1f1f1f] font-bold">Profile</span>
          </div>
        </nav>

        <div className="mx-auto max-w-3xl px-4 py-6">
          <h1 className="mb-4 text-xl font-bold text-gray-900">Profile</h1>

          {/* Main Profile Card */}
          <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Top: Name + Edit */}
            <div className="flex items-start justify-between px-6 pt-5 pb-4">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-900">
                      {user?.name || "Sri Mandir Bhakt"}
                    </span>
                    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-gray-400">
                      <path d="m7 10 2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">{user?.phone || user?.email || ""}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditField("general");
                  setShowEditModal(true);
                }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#000000] hover:bg-blue-50 transition"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" fill="currentColor" />
                </svg>
                Edit
              </button>
            </div>

            {/* Complete Profile Banner */}
            {!isProfileComplete && (
              <div className="mx-6 mb-4">
                <button
                  onClick={() => {
                    setEditField("general");
                    setShowEditModal(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6869F9] py-3 text-sm font-bold text-white hover:bg-[#4647c4] transition"
                >
                  Please complete your profile
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-1 gap-0 border-t border-gray-100 md:grid-cols-2">
              {/* Contact Information */}
              <div className="border-b border-gray-100 p-6 md:border-b-0 md:border-r">
                <h2 className="mb-4 text-sm font-semibold text-gray-700">Contact Information</h2>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-gray-400">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="w-16 text-gray-400">Phone</span>
                  <span className="font-medium text-gray-800">
                    {user?.phone || user?.email || "Not added"}
                  </span>
                </div>
              </div>

              {/* General Information */}
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700">General Information</h2>
                  <button
                    onClick={() => {
                      setEditField("general");
                      setShowEditModal(true);
                    }}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#000000] hover:bg-blue-50 transition"
                  >
                    <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" fill="currentColor" />
                    </svg>
                    Edit
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <InfoRow
                    icon={
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-gray-400">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    }
                    label="Gender"
                    value={user?.gender}
                    placeholder="Add Gender"
                  />
                  <InfoRow
                    icon={
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-gray-400">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    }
                    label="Date of Birth"
                    value={user?.dob}
                    placeholder="Add date of birth"
                  />
                  <InfoRow
                    icon={
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-gray-400">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    }
                    label="Place of Birth"
                    value={user?.placeOfBirth}
                    placeholder="Add Place of Birth"
                  />
                  <InfoRow
                    icon={
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-gray-400">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                    }
                    label="Occupation"
                    value={user?.occupation}
                    placeholder="Add Occupation"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Secure badge */}
          <div className="mb-4 rounded-2xl border border-gray-100 bg-[#f0faf4] px-6 py-5 text-center">
            <div className="mb-2 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-[#059669]">
                <svg viewBox="0 0 20 20" fill="none" className="h-6 w-6 text-[#059669]">
                  <path d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 10l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-semibold text-[#059669]">Your personal information is secure with us</p>
            <p className="text-xs text-[#059669]/80">We only use it to provide you a better experience.</p>
          </div>

          {/* Logout */}
          <div className="rounded-2xl border border-gray-100 bg-white">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 py-4 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path d="M13 15l3-5-3-5M16 10H7M10 3H5a2 2 0 00-2 2v10a2 2 0 002 2h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-[#000000] focus:outline-none focus:ring-1 focus:ring-[#000000]"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</label>
                <select
                  value={formData.gender || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, gender: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-[#000000] focus:outline-none focus:ring-1 focus:ring-[#000000]"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wide">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, dob: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-[#000000] focus:outline-none focus:ring-1 focus:ring-[#000000]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wide">Place of Birth</label>
                <input
                  type="text"
                  value={formData.placeOfBirth || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, placeOfBirth: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-[#000000] focus:outline-none focus:ring-1 focus:ring-[#000000]"
                  placeholder="City, State"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wide">Occupation</label>
                <input
                  type="text"
                  value={formData.occupation || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, occupation: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:border-[#000000] focus:outline-none focus:ring-1 focus:ring-[#000000]"
                  placeholder="e.g. Engineer, Teacher"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl bg-[#6869F9] py-2.5 text-sm font-bold text-white hover:bg-[#4647c4] transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="shrink-0">{icon}</span>
      <span className="w-24 shrink-0 text-gray-400">{label}</span>
      <span className={value ? "font-medium text-gray-800" : "text-gray-400"}>
        {value || placeholder}
      </span>
    </div>
  );
}

