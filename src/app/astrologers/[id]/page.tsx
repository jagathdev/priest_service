interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AstrologerProfilePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Astrologer Profile</h1>
        <p className="mt-4 text-lg text-gray-600">Viewing profile for ID: {id}</p>
        <p className="mt-2 text-gray-500">This page is under construction with actual data soon.</p>
      </div>
    </div>
  );
}
