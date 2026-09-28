"use client";

import { useState, useEffect } from "react";
import { 
  UserCircleIcon, 
  KeyIcon, 
  EnvelopeIcon, 
  UserIcon, 
  CheckCircleIcon, 
  XMarkIcon, 
  ExclamationCircleIcon, 
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/admin/profile");
      const data = await res.json();
      if (res.ok) {
        setFormData((prev) => ({
          ...prev,
          name: data.name || "",
          email: data.email || "",
        }));
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear relevant errors
    if (name === "name" || name === "email") {
      setProfileSuccess(false);
      setProfileError("");
    } else {
      setPasswordSuccess(false);
      setPasswordError("");
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    setProfileSuccess(false);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setProfileSuccess(true);
      } else {
        setProfileError(data.error || "Failed to update profile");
      }
    } catch (err: any) {
      setProfileError(err.message || "An error occurred");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordError("");
    setPasswordSuccess(false);

    if (!formData.currentPassword) {
      setPasswordError("Current password is required");
      setSavingPassword(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError("New passwords do not match");
      setSavingPassword(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      setSavingPassword(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name, // required by API
          email: formData.email, // required by API
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordSuccess(true);
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setTimeout(() => {
          setShowPasswordChange(false);
          setPasswordSuccess(false);
        }, 3000);
      } else {
        setPasswordError(data.error || "Failed to update password");
      }
    } catch (err: any) {
      setPasswordError(err.message || "An error occurred");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6869F9]"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-[#1f1f1f] to-[#000000] rounded-full mb-4 shadow-lg ring-4 ring-[#1f1f1f]/20">
          <UserCircleIcon className="h-16 w-16 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Admin Profile</h1>
        <p className="mt-3 text-base text-gray-500 max-w-xl mx-auto">
          Manage your personal information and security settings. Changes will be reflected immediately across the admin panel.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Personal Information Card */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-2xl overflow-hidden">
          <div className="px-6 py-8 sm:p-10 border-b border-gray-900/5 bg-gray-50/50">
            <h2 className="text-xl font-semibold leading-6 text-gray-900 flex items-center gap-2">
              <UserIcon className="h-6 w-6 text-[#1f1f1f]" />
              Personal Information
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Update your name and the email address used for logging in.
            </p>
          </div>
          
          <div className="px-6 py-8 sm:p-10">
            {profileSuccess && (
              <div className="mb-6 rounded-xl bg-green-50 p-4 border border-green-100 flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                <p className="text-sm font-medium text-green-800">Profile details successfully updated.</p>
              </div>
            )}

            {profileError && (
              <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-100 flex items-start gap-3">
                <ExclamationCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                <p className="text-sm font-medium text-red-800">{profileError}</p>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                    Full Name
                  </label>
                  <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#1f1f1f]">
                    <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                      <UserIcon className="h-5 w-5" />
                    </span>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="block flex-1 border-0 bg-transparent py-2.5 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none focus:border-transparent outline-none sm:text-sm sm:leading-6"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                    Email Address
                  </label>
                  <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#1f1f1f]">
                    <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                      <EnvelopeIcon className="h-5 w-5" />
                    </span>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block flex-1 border-0 bg-transparent py-2.5 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none focus:border-transparent outline-none sm:text-sm sm:leading-6"
                      placeholder="admin@AstroVed.com"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-x-2 rounded-lg bg-[#6869F9] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#5657e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f1f1f] disabled:opacity-60 transition-all"
                >
                  {savingProfile ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : "Save Details"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-2xl overflow-hidden">
          <div className="px-6 py-8 sm:p-10 border-b border-gray-900/5 bg-gray-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold leading-6 text-gray-900 flex items-center gap-2">
                <ShieldCheckIcon className="h-6 w-6 text-[#1f1f1f]" />
                Security Settings
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Ensure your account is using a long, random password to stay secure.
              </p>
            </div>
            {!showPasswordChange && (
              <button
                onClick={() => setShowPasswordChange(true)}
                className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all"
              >
                Change Password
              </button>
            )}
          </div>
          
          {showPasswordChange && (
            <div className="px-6 py-8 sm:p-10 bg-gray-50/30 animate-in fade-in slide-in-from-top-4 duration-300">
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Update Password</h3>
                <button 
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPasswordError("");
                    setFormData(prev => ({...prev, currentPassword: "", newPassword: "", confirmPassword: ""}));
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {passwordSuccess && (
                <div className="mb-6 rounded-xl bg-green-50 p-4 border border-green-100 flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                  <p className="text-sm font-medium text-green-800">Password successfully updated!</p>
                </div>
              )}

              {passwordError && (
                <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-100 flex items-start gap-3">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                  <p className="text-sm font-medium text-red-800">{passwordError}</p>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium leading-6 text-gray-900">
                    Current Password
                  </label>
                  <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#1f1f1f] bg-white relative">
                    <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                      <KeyIcon className="h-5 w-5" />
                    </span>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      id="currentPassword"
                      required
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="block flex-1 border-0 bg-transparent py-2.5 pl-2 pr-10 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none focus:border-transparent outline-none sm:text-sm sm:leading-6 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200/60" />

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium leading-6 text-gray-900">
                    New Password
                  </label>
                  <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#1f1f1f] bg-white relative">
                    <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                      <KeyIcon className="h-5 w-5" />
                    </span>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      id="newPassword"
                      required
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="block flex-1 border-0 bg-transparent py-2.5 pl-2 pr-10 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none focus:border-transparent outline-none sm:text-sm sm:leading-6 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">
                    Confirm New Password
                  </label>
                  <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#1f1f1f] bg-white relative">
                    <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                      <KeyIcon className="h-5 w-5" />
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      id="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block flex-1 border-0 bg-transparent py-2.5 pl-2 pr-10 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none focus:border-transparent outline-none sm:text-sm sm:leading-6 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="w-full inline-flex justify-center items-center gap-x-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-60 transition-all"
                  >
                    {savingPassword ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating Password...
                      </>
                    ) : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

