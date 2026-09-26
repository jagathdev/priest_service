import React from 'react';

export default function PanchangHeader({ data }: { data: any }) {
  const dateObj = new Date(data.date);
  const formattedDate = dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const weekday = dateObj.toLocaleDateString('en-IN', { weekday: 'long' });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-violet-500 px-6 py-8 text-white relative overflow-hidden">
        {/* Abstract background shape */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{data.tithi?.name || 'Today\'s Panchang'}</h1>
              <p className="text-violet-100 mt-2 text-lg">
                {data.month?.purnimanta} Month • {data.season} Season • {data.samvat?.vikram}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-semibold">{formattedDate}</div>
              <div className="text-violet-100">{weekday}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex border-b border-gray-100 px-4">
        <button className="px-6 py-4 text-violet-600 border-b-2 border-violet-700 font-medium">Today</button>
        <button className="px-6 py-4 text-gray-500 hover:text-gray-800 font-medium">Tomorrow</button>
      </div>
    </div>
  );
}

