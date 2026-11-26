"use client";

import React, { useState } from "react";
import { MapPin, Building, Phone, Edit2, Trash2, Plus, Check, Loader2, X } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

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

interface SavedAddressTabProps {
  loadingAddresses: boolean;
}

export default function SavedAddressTab({ loadingAddresses }: SavedAddressTabProps) {
  const { user, setUser } = useUser();
  const addresses: Address[] = user?.addresses || [];

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
    isDefault: false,
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [citySuggestions, setCitySuggestions] = useState<Array<{ City: string; State?: string; StateorProvince?: string; Country: string }>>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const getUserAuthHeaders = (): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const match = document.cookie.match(/(?:^|;\s*)(?:token|adminToken)=([^;]+)/);
    const cookieToken = match ? decodeURIComponent(match[1]) : null;
    const localToken = localStorage.getItem("token");
    const token = cookieToken || localToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleCitySearch = async (term: string) => {
    const cleanTerm = term.trim();
    if (cleanTerm.length < 3) {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      return;
    }

    setIsLoadingCities(true);
    try {
      const countryTarget = addressFormData.country || "India";
      const res = await fetch(
        `https://webservice.astroved.com/Api/Panchang/PopulateCityBycountry/${encodeURIComponent(
          countryTarget
        )}/${encodeURIComponent(cleanTerm)}`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setCitySuggestions(data);
        setShowCitySuggestions(data.length > 0);
      } else {
        setCitySuggestions([]);
        setShowCitySuggestions(false);
      }
    } catch (err) {
      console.error("Error fetching cities from AstroVed:", err);
      setCitySuggestions([]);
      setShowCitySuggestions(false);
    } finally {
      setIsLoadingCities(false);
    }
  };

  const validateAddressForm = () => {
    const errors: Record<string, string> = {};
    const trimmedName = addressFormData.fullName.trim();
    const cleanPhone = addressFormData.phone.replace(/\D/g, "");
    const trimmedAddress = addressFormData.address.trim();
    const trimmedCity = addressFormData.city.trim();
    const trimmedState = addressFormData.state.trim();
    const cleanPincode = addressFormData.pincode.replace(/\D/g, "");
    const trimmedCountry = addressFormData.country.trim();

    if (!trimmedName) {
      errors.fullName = "Full name is required";
    } else if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      errors.fullName = "Name must contain only letters";
    }

    if (!cleanPhone) {
      errors.phone = "Phone number is required";
    } else if (cleanPhone.length !== 10) {
      errors.phone = "Enter a valid 10-digit mobile number";
    } else if (!["6", "7", "8", "9"].includes(cleanPhone[0])) {
      errors.phone = "Mobile number must start with 6, 7, 8, or 9";
    }

    if (!trimmedAddress) {
      errors.address = "Address is required";
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
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";

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
        isDefault: addressFormData.isDefault,
      };

      let updatedAddresses = [...(user.addresses || [])];

      if (newAddress.isDefault) {
        updatedAddresses = updatedAddresses.map((a: Address) => ({ ...a, isDefault: false }));
      } else if (updatedAddresses.length === 0) {
        newAddress.isDefault = true;
      }

      if (addressFormData._id) {
        const index = updatedAddresses.findIndex((a: Address) => a._id === addressFormData._id);
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
        addresses: updatedAddresses,
      };

      const res = await fetch(`${baseUrl}/api/users/updateProfile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getUserAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        const updatedUser = { ...user, ...data.data };
        setUser(updatedUser);
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
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";

      const updatedAddresses = (user.addresses || []).filter(
        (a: Address) => a._id !== addressId && a.id !== addressId
      );

      if (updatedAddresses.length > 0 && !updatedAddresses.some((a: Address) => a.isDefault)) {
        updatedAddresses[0].isDefault = true;
      }

      const payload = {
        userId: user.id || user._id,
        name: user.name || "",
        email: user.email || "",
        mobileNumber: user.mobileNumber || "",
        addresses: updatedAddresses,
      };
      const res = await fetch(`${baseUrl}/api/users/updateProfile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getUserAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        const updatedUser = { ...user, ...data.data };
        setUser(updatedUser);
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
    setShowCitySuggestions(false);
    setAddressFormData({
      _id: addr._id || addr.id || "",
      type: addr.type || "Home",
      fullName: addr.name || "",
      phone: addr.phone || "",
      address: addr.addressLine1 || addr.address || "",
      landmark: addr.addressLine2 || addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      country: addr.country || "India",
      isDefault: addr.isDefault || false,
    });
    setShowAddressModal(true);
  };

  const openAddAddressModal = () => {
    setAddressErrors({});
    setShowCitySuggestions(false);
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
      isDefault: false,
    });
    setShowAddressModal(true);
  };

  return (
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
            onClick={openAddAddressModal}
            className="bg-primary text-white text-xs sm:text-sm font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-full flex items-center gap-1.5 hover:bg-[#008F4C] transition cursor-pointer"
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
            onClick={openAddAddressModal}
            className="bg-primary text-white text-[13px] font-bold px-6 py-2.5 rounded-full flex items-center gap-1.5 hover:bg-[#008F4C] transition cursor-pointer"
          >
            <span>+</span> Add New Address
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {addresses.map((addr: Address, idx: number) => (
              <div key={addr._id || addr.id || idx} className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="flex items-center gap-1.5 bg-[#fdf2f0] text-danger text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                    <Building className="w-3 h-3" />
                    {addr.type || "Home"}
                  </span>
                  {addr.isDefault && (
                    <span className="bg-[#F1F5F9] text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                      Default
                    </span>
                  )}
                </div>
                <h4 className="text-[15px] font-bold text-gray-900 mb-1">{addr.name}</h4>
                <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-gray-700 font-medium mb-2.5">
                  <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{addr.phone}</span>
                </div>
                <div className="text-[12px] sm:text-[13px] text-gray-600 leading-relaxed mb-4 bg-stone-50/70 p-2.5 rounded-xl border border-stone-100 space-y-1">
                  <p className="font-medium text-stone-800">
                    {addr.addressLine1 || addr.address || "Address"}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                  </p>
                  {addr.landmark && (
                    <p className="text-[11px] text-stone-500">
                      <span className="font-semibold text-stone-600">Landmark:</span> {addr.landmark}
                    </p>
                  )}
                  <p className="text-stone-700 font-medium">
                    {[addr.city, addr.state].filter(Boolean).join(", ")}
                    {addr.pincode ? ` - ${addr.pincode}` : ""}
                    {addr.country ? ` (${addr.country})` : ""}
                  </p>
                </div>
                <hr className="border-gray-150 mb-4" />
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openEditAddressModal(addr)}
                    className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 rounded-full text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAddress((addr._id || addr.id) as string)}
                    className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 rounded-full text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}

            <div
              onClick={openAddAddressModal}
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

      {/* Address Form Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-bold text-gray-900">
                {addressFormData._id ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="w-8 h-8 rounded-full bg-[#f8eadd] text-[#555] flex items-center justify-center hover:bg-[#ebd5c1] transition cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="flex items-center gap-2 mb-6">
                {["Home", "Work", "Other"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAddressFormData((prev) => ({ ...prev, type }))}
                    className={`px-5 py-2 rounded-full text-sm font-bold border transition cursor-pointer ${
                      addressFormData.type === type
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
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
                      setAddressFormData((p) => ({ ...p, fullName: val }));
                      if (addressErrors.fullName) {
                        setAddressErrors((prev) => ({ ...prev, fullName: "" }));
                      }
                    }}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none transition ${
                      addressErrors.fullName
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
                      if (digits.length > 0 && !["6", "7", "8", "9"].includes(digits[0])) {
                        digits = "";
                      }
                      setAddressFormData((p) => ({ ...p, phone: digits }));
                      if (addressErrors.phone) {
                        setAddressErrors((prev) => ({ ...prev, phone: "" }));
                      }
                    }}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none transition ${
                      addressErrors.phone
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
                    setAddressFormData((p) => ({ ...p, address: e.target.value }));
                    if (addressErrors.address) {
                      setAddressErrors((prev) => ({ ...prev, address: "" }));
                    }
                  }}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none transition ${
                    addressErrors.address
                      ? "border-red-500 focus:border-red-500 bg-red-50/20"
                      : "border-gray-250 focus:border-primary"
                  }`}
                />
                {addressErrors.address && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{addressErrors.address}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="text-[13px] font-bold text-gray-800 block mb-1.5">
                  Landmark <span className="text-gray-400 font-medium">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Nearby landmark / area"
                  value={addressFormData.landmark}
                  onChange={(e) => setAddressFormData((p) => ({ ...p, landmark: e.target.value }))}
                  className="w-full border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* City with AstroVed Auto-suggest */}
                <div className="relative">
                  <label className="text-[13px] font-bold text-gray-800 block mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Type 3+ letters (e.g. Chennai, Mumbai)"
                    value={addressFormData.city}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAddressFormData((p) => ({ ...p, city: val }));
                      handleCitySearch(val);
                      if (addressErrors.city) {
                        setAddressErrors((prev) => ({ ...prev, city: "" }));
                      }
                    }}
                    onFocus={() => {
                      if (citySuggestions.length > 0) setShowCitySuggestions(true);
                    }}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none transition ${
                      addressErrors.city
                        ? "border-red-500 focus:border-red-500 bg-red-50/20"
                        : "border-gray-250 focus:border-primary"
                    }`}
                  />
                  {isLoadingCities && (
                    <div className="absolute right-3 top-[38px] text-[11px] text-stone-400 font-medium animate-pulse">
                      Searching...
                    </div>
                  )}
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                      {citySuggestions.map((item, idx) => {
                        const stateVal = item.StateorProvince || item.State || "";
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setAddressFormData((p) => ({
                                ...p,
                                city: item.City,
                                state: stateVal || p.state,
                                country: item.Country || p.country || "India",
                              }));
                              setShowCitySuggestions(false);
                            }}
                            className="px-3 py-2 text-xs hover:bg-[#E8F8EE] cursor-pointer text-stone-700 font-medium flex justify-between items-center border-b border-stone-50 last:border-0 gap-2"
                          >
                            <span className="font-bold text-stone-800">{item.City}</span>
                            <span className="text-stone-500 text-[11px] shrink-0">
                              {stateVal ? `${stateVal}, ` : ""}
                              {item.Country}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {addressErrors.city && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{addressErrors.city}</p>
                  )}
                </div>

                {/* State */}
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
                      setAddressFormData((p) => ({ ...p, state: val }));
                      if (addressErrors.state) {
                        setAddressErrors((prev) => ({ ...prev, state: "" }));
                      }
                    }}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none transition ${
                      addressErrors.state
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
                      setAddressFormData((p) => ({ ...p, pincode: val }));
                      if (addressErrors.pincode) {
                        setAddressErrors((prev) => ({ ...prev, pincode: "" }));
                      }
                    }}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none transition ${
                      addressErrors.pincode
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
                      setAddressFormData((p) => ({ ...p, country: val }));
                      if (addressErrors.country) {
                        setAddressErrors((prev) => ({ ...prev, country: "" }));
                      }
                    }}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none transition ${
                      addressErrors.country
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
                  onChange={(e) => setAddressFormData((p) => ({ ...p, isDefault: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-[13px] font-medium text-gray-800">Set as default address</span>
              </label>
            </div>

            <div className="p-5 sm:p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-800 border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAddress}
                className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-[#008F4C] transition cursor-pointer"
              >
                {addressFormData._id ? "Update Address" : "Add Address"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
