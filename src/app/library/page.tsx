"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { BookOpenIcon } from "@heroicons/react/24/outline";

interface LibraryItem {
  _id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  imageUrl: string;
  content: string;
}

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/library")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-extrabold text-[#3b0764] mb-4">
                Spiritual Library
              </h1>
              <p className="text-gray-600 text-lg">
                Discover ancient wisdom through our curated collection of Vedic literature, spiritual guides, and research articles.
              </p>
            </div>
            <div className="flex gap-2">
               <button className="px-4 py-2 bg-white rounded-lg shadow-sm font-medium border border-gray-200">All</button>
               <button className="px-4 py-2 bg-white rounded-lg shadow-sm font-medium border border-gray-200 text-gray-400">Vedas</button>
               <button className="px-4 py-2 bg-white rounded-lg shadow-sm font-medium border border-gray-200 text-gray-400">Puranas</button>
            </div>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-xl"></div>
                ))}
             </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
               <BookOpenIcon className="mx-auto mb-4 h-12 w-12 text-[#1f1f1f]" />
               <p className="text-gray-500 font-medium">The library shelves are being stocked. Please visit later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {items.map((item) => (
                <div key={item._id} className="group bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                  <div className="relative h-64 overflow-hidden rounded-t-xl">
                    <img 
                      src={item.imageUrl || "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80"} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                       <span className="bg-purple-600 text-white text-[10px] uppercase tracking-widest px-2 py-1 rounded font-bold">
                          {item.category}
                       </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">{item.title}</h3>
                    <p className="text-sm text-gray-400 mb-3 font-medium">By {item.author}</p>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">{item.description}</p>
                    <a href="#docs" className="block w-full text-center py-2 text-purple-600 font-bold border border-purple-100 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-all">
                      Read Online
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}


