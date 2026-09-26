import Navbar from '@/components/layout/Navbar';
import PanchangClientPage from '@/components/panchang/PanchangClientPage';
import { Suspense } from 'react';

export default function PanchangPage() {
  return (
    <>
      <Navbar />
      <div className="bg-[#f5f3ff] pb-12 min-h-screen">
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200" />}>
          <PanchangClientPage />
        </Suspense>
      </div>
    </>
  );
}

