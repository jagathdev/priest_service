"use client";
import React, { useState, useEffect, useRef } from "react";

export const CITIES = [
  { name: "New Delhi, Delhi, India", lat: 28.6139, lon: 77.2090 },
  { name: "Mumbai, Maharashtra, India", lat: 19.0760, lon: 72.8777 },
  { name: "Bengaluru, Karnataka, India", lat: 12.9716, lon: 77.5946 },
  { name: "Chennai, Tamil Nadu, India", lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata, West Bengal, India", lat: 22.5726, lon: 88.3639 },
  { name: "Hyderabad, Telangana, India", lat: 17.3850, lon: 78.4867 },
  { name: "Pune, Maharashtra, India", lat: 18.5204, lon: 73.8567 },
  { name: "Ahmedabad, Gujarat, India", lat: 23.0225, lon: 72.5714 },
  { name: "Jaipur, Rajasthan, India", lat: 26.9124, lon: 75.7873 },
  { name: "Surat, Gujarat, India", lat: 21.1702, lon: 72.8311 },
  { name: "Lucknow, Uttar Pradesh, India", lat: 26.8467, lon: 80.9462 },
  { name: "Kanpur, Uttar Pradesh, India", lat: 26.4499, lon: 80.3319 },
  { name: "Nagpur, Maharashtra, India", lat: 21.1458, lon: 79.0882 },
  { name: "Patna, Bihar, India", lat: 25.5941, lon: 85.1376 },
  { name: "Indore, Madhya Pradesh, India", lat: 22.7196, lon: 75.8577 },
  { name: "Thane, Maharashtra, India", lat: 19.2183, lon: 72.9781 },
  { name: "Bhopal, Madhya Pradesh, India", lat: 23.2599, lon: 77.4126 },
  { name: "Visakhapatnam, Andhra Pradesh, India", lat: 17.6868, lon: 83.2185 },
  { name: "Vadodara, Gujarat, India", lat: 22.3072, lon: 73.1812 },
  { name: "Varanasi, Uttar Pradesh, India", lat: 25.3176, lon: 82.9739 },
  { name: "West Tripura, Tripura, India", lat: 23.9408, lon: 91.9882 },
  { name: "North 24 Parganas, West Bengal, India", lat: 22.8500, lon: 88.3900 },
  { name: "South 24 Parganas, West Bengal, India", lat: 22.1500, lon: 88.4500 },
  { name: "Srinagar, Jammu & Kashmir, India", lat: 34.0837, lon: 74.7973 },
  { name: "Gautam Buddha Nagar, Uttar Pradesh, India", lat: 28.5958, lon: 77.6887 },
  { name: "Seraikela-kharsawan, Jharkhand, India", lat: 22.5000, lon: 85.9333 },
  { name: "Krishna, Andhra Pradesh, India", lat: 16.6100, lon: 80.7500 },
  { name: "Nellore, Andhra Pradesh, India", lat: 14.4426, lon: 79.9865 },
  { name: "Coimbatore, Tamil Nadu, India", lat: 11.0168, lon: 76.9558 },
  { name: "Madurai, Tamil Nadu, India", lat: 9.9252, lon: 78.1198 },
  { name: "Tirupati, Andhra Pradesh, India", lat: 13.6288, lon: 79.4192 },
  { name: "Kochi, Kerala, India", lat: 9.9312, lon: 76.2673 },
  { name: "Bhubaneswar, Odisha, India", lat: 20.2961, lon: 85.8245 },
  { name: "Guwahati, Assam, India", lat: 26.1445, lon: 91.7362 },
  { name: "Mysuru, Karnataka, India", lat: 12.2958, lon: 76.6394 },
  { name: "Allahabad (Prayagraj), Uttar Pradesh, India", lat: 25.4358, lon: 81.8464 },
  { name: "Haridwar, Uttarakhand, India", lat: 29.9457, lon: 78.1642 },
  { name: "Mathura, Uttar Pradesh, India", lat: 27.4924, lon: 77.6737 },
  { name: "Ujjain, Madhya Pradesh, India", lat: 23.1765, lon: 75.7885 },
  { name: "Dwarka, Gujarat, India", lat: 22.2374, lon: 68.9675 },
  { name: "Rameswaram, Tamil Nadu, India", lat: 9.2885, lon: 79.3129 },
  { name: "Puri, Odisha, India", lat: 19.8135, lon: 85.8312 },
];

interface LocationSearchProps {
  onSelectLocation: (city: { name: string; lat: number; lon: number }) => void;
}

export default function LocationSearch({ onSelectLocation }: LocationSearchProps) {
  const defaultCity = CITIES.find((c) => c.name.startsWith("Varanasi")) || CITIES[0];
  const [selectedCity, setSelectedCity] = useState(defaultCity);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* filter cities only while searching */
  const filteredCities = searchTerm
    ? CITIES.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : CITIES;

  /* close on outside click */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function openDropdown() {
    setSearchTerm("");       // clear search so full list shows
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 10);
  }

  function closeDropdown() {
    setIsOpen(false);
    setSearchTerm("");
  }

  function handleSelect(city: typeof defaultCity) {
    setSelectedCity(city);
    onSelectLocation(city);
    closeDropdown();
  }

  return (
    <div className="relative flex-1 min-w-0" ref={wrapperRef}>
      {/* ── Trigger row ── */}
      <div
        className="flex items-center gap-2 w-full cursor-pointer select-none"
        onClick={() => !isOpen && openDropdown()}
      >
        {/* Pin icon */}
        <svg
          className="w-4 h-4 text-gray-400 flex-shrink-0"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>

        {/* Input — shows selected city name when closed, becomes search box when open */}
        <input
          ref={inputRef}
          type="text"
          className="bg-transparent text-[14px] font-medium text-gray-700 outline-none flex-1 min-w-0"
          style={{ cursor: isOpen ? "text" : "pointer" }}
          value={isOpen ? searchTerm : selectedCity.name}
          placeholder={isOpen ? "Search city…" : selectedCity.name}
          readOnly={!isOpen}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => { if (!isOpen) openDropdown(); }}
        />

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
          onClick={(e) => { e.stopPropagation(); isOpen ? closeDropdown() : openDropdown(); }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* ── Dropdown list ── */}
      {isOpen && (
        <ul className="absolute z-[300] top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.14)] max-h-64 overflow-y-auto">
          {filteredCities.length > 0 ? (
            filteredCities.map((city, idx) => {
              const parts = city.name.split(", ");
              const cityName = parts[0];
              const rest = parts.slice(1).join(", ");
              const isActive = city.name === selectedCity.name;
              return (
                <li
                  key={idx}
                  className={`flex items-center gap-2 px-4 py-3 cursor-pointer transition-colors ${isActive ? "bg-[#f0effe]" : "hover:bg-gray-50"}`}
                  style={{ borderBottom: idx < filteredCities.length - 1 ? "1px solid #f3f4f6" : "none" }}
                  onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                  onClick={() => handleSelect(city)}
                >
                  <svg className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-[#6869F9]" : "text-gray-300"}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className={`text-[14px] font-medium ${isActive ? "text-[#6869F9]" : "text-gray-800"}`}>{cityName}</span>
                  {rest && <span className="text-[13px] text-gray-400 truncate">,&nbsp;{rest}</span>}
                </li>
              );
            })
          ) : (
            <li className="px-4 py-3 text-[14px] text-gray-400">No cities found</li>
          )}
        </ul>
      )}
    </div>
  );
}
