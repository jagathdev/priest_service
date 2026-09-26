import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PanchangPromotions() {
  const promos = [
    {
      id: 1,
      badge: "Bada Mangal Special",
      title: "Awaken the divine energy of Shri Ram-Hanuman",
      subtitle: "to receive protection and strength",
      image: "https://images.unsplash.com/photo-1604085572504-a392ddf0d86a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" // abstract/temple placeholder
    },
    {
      id: 2,
      badge: "Bada Mangal Special",
      title: "Receive divine protection from hidden enemies",
      subtitle: "with Hanuman's blessings",
      image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    }
  ];

  return (
    <div className="mt-12 mb-8">
      <div className="flex items-center justify-center mb-8">
         <div className="h-px bg-gray-300 w-24"></div>
         <div className="mx-4 text-gray-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L9 9H2L7 14L5 21L12 17L19 21L17 14L22 9H15L12 2Z" /></svg>
         </div>
         <div className="h-px bg-gray-300 w-24"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promos.map((promo) => (
          <div key={promo.id} className="relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer shadow-sm">
            <Image src={promo.image} alt={promo.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            
            <div className="absolute top-4 left-4">
              <span className="bg-[#ffc107] text-black text-xs font-bold px-2 py-1 rounded shadow-sm">{promo.badge}</span>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-lg font-bold leading-snug mb-1">{promo.title}</h3>
              <p className="text-sm text-gray-300">{promo.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
