"use client";

import { useState, useEffect } from "react";
import { PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function AdminTemplesPage() {
  interface TempleFormData {
    name: string; slug: string; deity: string; templeType: string; city: string; state: string; country: string;
    shortDescription: string; overview: string; history: string; significance: string; architecture: string;
    heroImage: string; gallery: string[];
    timings: { morningOpen: string; morningClose: string; eveningOpen: string; eveningClose: string; aartiTiming: string };
    offerings: { name: string; description: string; price: number | string; image: string }[];
    festivals: string[];
    howToReach: { byAir: string; byTrain: string; byRoad: string; nearbyStation: string };
    coordinates: { latitude: string; longitude: string };
    faq: { question: string; answer: string }[];
    relatedArticles: string[]; relatedTemples: string[]; relatedPujas: string[];
    featured: boolean; popular: boolean;
    metaTitle: string; metaDescription: string;
  }

  interface TempleItem extends TempleFormData {
    _id: string;
    imageUrl?: string;
  }
  const [items, setItems] = useState<TempleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<TempleFormData>({
    name: "", slug: "", deity: "", templeType: "Shiva Temple", city: "", state: "", country: "India",
    shortDescription: "", overview: "", history: "", significance: "", architecture: "",
    heroImage: "", gallery: [""],
    timings: { morningOpen: "", morningClose: "", eveningOpen: "", eveningClose: "", aartiTiming: "" },
    offerings: [],
    festivals: [""],
    howToReach: { byAir: "", byTrain: "", byRoad: "", nearbyStation: "" },
    coordinates: { latitude: "", longitude: "" },
    faq: [],
    relatedArticles: [""], relatedTemples: [""], relatedPujas: [""],
    featured: false, popular: false,
    metaTitle: "", metaDescription: ""
  });

  const templeTypes = ["Shiva Temple", "Vishnu Temple", "Devi Temple", "Murugan Temple", "Hanuman Temple", "Jyotirlinga", "Shakti Peetha", "Pilgrimage Site"];

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/content?type=temples`);
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleOpenAdd = () => {
    if (isAdding) {
      setEditingId(null);
      setIsAdding(false);
      return;
    }
    resetForm();
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      name: "", slug: "", deity: "", templeType: "Shiva Temple", city: "", state: "", country: "India",
      shortDescription: "", overview: "", history: "", significance: "", architecture: "",
      heroImage: "", gallery: [""],
      timings: { morningOpen: "", morningClose: "", eveningOpen: "", eveningClose: "", aartiTiming: "" },
      offerings: [],
      festivals: [""],
      howToReach: { byAir: "", byTrain: "", byRoad: "", nearbyStation: "" },
      coordinates: { latitude: "", longitude: "" },
      faq: [],
      relatedArticles: [""], relatedTemples: [""], relatedPujas: [""],
      featured: false, popular: false,
      metaTitle: "", metaDescription: ""
    });
    setEditingId(null);
  };

  const handleEdit = (item: TempleItem) => {
    setFormData({
      ...item,
      gallery: item.gallery?.length ? item.gallery : [""],
      timings: item.timings || { morningOpen: "", morningClose: "", eveningOpen: "", eveningClose: "", aartiTiming: "" },
      offerings: item.offerings || [],
      festivals: item.festivals?.length ? item.festivals : [""],
      howToReach: item.howToReach || { byAir: "", byTrain: "", byRoad: "", nearbyStation: "" },
      coordinates: item.coordinates || { latitude: "", longitude: "" },
      faq: item.faq || [],
      relatedArticles: item.relatedArticles?.length ? item.relatedArticles : [""],
      relatedTemples: item.relatedTemples?.length ? item.relatedTemples : [""],
      relatedPujas: item.relatedPujas?.length ? item.relatedPujas : [""],
      featured: !!item.featured, popular: !!item.popular
    });
    setEditingId(String(item._id));
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this temple?")) return;
    try {
      const res = await fetch(`/api/admin/content?type=temples&id=${id}`, { method: "DELETE" });
      if (res.ok) fetchItems();
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // cleanup empty arrays
    const cleanData = { ...formData };
    cleanData.gallery = cleanData.gallery.filter((v: string) => v);
    cleanData.festivals = cleanData.festivals.filter((v: string) => v);
    cleanData.relatedArticles = cleanData.relatedArticles.filter((v: string) => v);
    cleanData.relatedTemples = cleanData.relatedTemples.filter((v: string) => v);
    cleanData.relatedPujas = cleanData.relatedPujas.filter((v: string) => v);

    const endpoint = editingId ? `/api/admin/content?type=temples&id=${editingId}` : `/api/admin/content?type=temples`;
    try {
      const res = await fetch(endpoint, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanData)
      });
      if (res.ok) {
        setIsAdding(false);
        resetForm();
        fetchItems();
      }
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  const handleChange = (field: keyof TempleFormData, value: unknown) => setFormData((p) => ({ ...p, [field]: value }));
  const handleNested = (parent: "timings" | "howToReach" | "coordinates", field: string, value: string) => setFormData((p) => ({ ...p, [parent]: { ...p[parent], [field]: value } }));

  // Array Handlers
  const handleArrayChange = (field: "gallery" | "festivals" | "relatedArticles" | "relatedTemples" | "relatedPujas", idx: number, value: string) => {
    const arr = [...formData[field]];
    arr[idx] = value;
    handleChange(field, arr);
  };
  const addArrayItem = (field: "gallery" | "festivals" | "relatedArticles" | "relatedTemples" | "relatedPujas") => handleChange(field, [...formData[field], ""]);
  const removeArrayItem = (field: "gallery" | "festivals" | "relatedArticles" | "relatedTemples" | "relatedPujas", idx: number) => {
    const arr = [...formData[field]];
    arr.splice(idx, 1);
    handleChange(field, arr);
  };

  // Offering Handlers
  const addOffering = () => handleChange("offerings", [...formData.offerings, { name: "", description: "", price: 0, image: "" }]);
  const handleOffering = (idx: number, field: string, value: string | number) => {
    const arr = [...formData.offerings];
    arr[idx] = { ...arr[idx], [field]: value };
    handleChange("offerings", arr);
  };
  const removeOffering = (idx: number) => {
    const arr = [...formData.offerings];
    arr.splice(idx, 1);
    handleChange("offerings", arr);
  };

  // FAQ Handlers
  const addFaq = () => handleChange("faq", [...formData.faq, { question: "", answer: "" }]);
  const handleFaq = (idx: number, field: string, value: string) => {
    const arr = [...formData.faq];
    arr[idx] = { ...arr[idx], [field]: value };
    handleChange("faq", arr);
  };
  const removeFaq = (idx: number) => {
    const arr = [...formData.faq];
    arr.splice(idx, 1);
    handleChange("faq", arr);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Temple CMS</h1>
        <div className="flex items-center gap-2">
          {isAdding && (
            <button
              form="temples-admin-form"
              type="submit"
              disabled={submitting}
              className="flex items-center rounded-md bg-[#6869F9] px-4 py-2 text-sm font-medium text-white hover:bg-[#5657e8] disabled:opacity-50"
            >
              {submitting ? "Saving..." : editingId ? "Update Temple" : "Save Temple"}
            </button>
          )}
          <button
            onClick={handleOpenAdd}
            className={`flex items-center rounded-md px-4 py-2 text-sm font-medium text-white ${
              isAdding
                ? "bg-gray-500 hover:bg-gray-600"
                : "bg-[#6869F9] hover:bg-[#5657e8]"
            }`}
          >
            {isAdding ? "Cancel" : <><PlusIcon className="mr-2 h-5 w-5" /> Add Temple</>}
          </button>
        </div>
      </div>

      {isAdding && (
        <form id="temples-admin-form" onSubmit={handleSubmit} className="bg-white p-8 shadow-sm border border-gray-100 rounded-2xl space-y-8">
          
          {/* SECTION A */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Section A - Basic Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Temple Name" required value={formData.name} onChange={e=>handleChange("name", e.target.value)} className="border p-2 rounded" />
              <input placeholder="Slug" required value={formData.slug} onChange={e=>handleChange("slug", e.target.value)} className="border p-2 rounded" />
              <input placeholder="Deity" required value={formData.deity} onChange={e=>handleChange("deity", e.target.value)} className="border p-2 rounded" />
              <select value={formData.templeType} onChange={e=>handleChange("templeType", e.target.value)} className="border p-2 rounded">
                {templeTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input placeholder="City" required value={formData.city} onChange={e=>handleChange("city", e.target.value)} className="border p-2 rounded" />
              <input placeholder="State" required value={formData.state} onChange={e=>handleChange("state", e.target.value)} className="border p-2 rounded" />
              <input placeholder="Country" required value={formData.country} onChange={e=>handleChange("country", e.target.value)} className="border p-2 rounded" />
            </div>
          </section>

          {/* SECTION B */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Section B - Temple Content</h3>
            <div className="space-y-4">
              <textarea placeholder="Short Description" rows={2} value={formData.shortDescription} onChange={e=>handleChange("shortDescription", e.target.value)} className="border p-2 rounded w-full" />
              <textarea placeholder="Temple Overview" rows={4} value={formData.overview} onChange={e=>handleChange("overview", e.target.value)} className="border p-2 rounded w-full" />
              <textarea placeholder="History of the Temple" rows={4} value={formData.history} onChange={e=>handleChange("history", e.target.value)} className="border p-2 rounded w-full" />
              <textarea placeholder="Significance" rows={4} value={formData.significance} onChange={e=>handleChange("significance", e.target.value)} className="border p-2 rounded w-full" />
              <textarea placeholder="Architecture" rows={4} value={formData.architecture} onChange={e=>handleChange("architecture", e.target.value)} className="border p-2 rounded w-full" />
            </div>
          </section>

          {/* SECTION C */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Section C - Images & Gallery</h3>
            <input placeholder="Hero Image URL" value={formData.heroImage} onChange={e=>handleChange("heroImage", e.target.value)} className="border p-2 rounded w-full mb-4" />
            <div className="space-y-2">
              <label className="text-sm font-medium">Gallery (Min 5 Images)</label>
              {formData.gallery.map((g: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <input placeholder="Image URL" value={g} onChange={e=>handleArrayChange("gallery", i, e.target.value)} className="border p-2 rounded flex-1" />
                  <button type="button" onClick={()=>removeArrayItem("gallery", i)} className="text-red-500"><XMarkIcon className="w-5 h-5"/></button>
                </div>
              ))}
              <button type="button" onClick={()=>addArrayItem("gallery")} className="text-sm text-blue-600">+ Add Gallery Image</button>
            </div>
          </section>

          {/* SECTION D */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Section D - Temple Timings</h3>
            <div className="grid grid-cols-3 gap-4">
              <input placeholder="Morning Open" value={formData.timings.morningOpen} onChange={e=>handleNested("timings", "morningOpen", e.target.value)} className="border p-2 rounded" />
              <input placeholder="Morning Close" value={formData.timings.morningClose} onChange={e=>handleNested("timings", "morningClose", e.target.value)} className="border p-2 rounded" />
              <input placeholder="Evening Open" value={formData.timings.eveningOpen} onChange={e=>handleNested("timings", "eveningOpen", e.target.value)} className="border p-2 rounded" />
              <input placeholder="Evening Close" value={formData.timings.eveningClose} onChange={e=>handleNested("timings", "eveningClose", e.target.value)} className="border p-2 rounded" />
              <input placeholder="Aarti Timing" value={formData.timings.aartiTiming} onChange={e=>handleNested("timings", "aartiTiming", e.target.value)} className="border p-2 rounded" />
            </div>
          </section>

          {/* SECTION E */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Section E - Offerings / Chadhava</h3>
            <div className="space-y-4">
              {formData.offerings.map((o, i) => (
                <div key={i} className="flex gap-2 items-start border p-4 rounded bg-gray-50">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <input placeholder="Offering Name" value={o.name} onChange={e=>handleOffering(i, "name", e.target.value)} className="border p-2 rounded" />
                    <input type="number" placeholder="Price" value={o.price} onChange={e=>handleOffering(i, "price", e.target.value)} className="border p-2 rounded" />
                    <input placeholder="Image URL" value={o.image} onChange={e=>handleOffering(i, "image", e.target.value)} className="border p-2 rounded col-span-2" />
                    <textarea placeholder="Description" rows={2} value={o.description} onChange={e=>handleOffering(i, "description", e.target.value)} className="border p-2 rounded col-span-2" />
                  </div>
                  <button type="button" onClick={()=>removeOffering(i)} className="text-red-500 mt-2"><XMarkIcon className="w-6 h-6"/></button>
                </div>
              ))}
              <button type="button" onClick={addOffering} className="text-sm text-blue-600">+ Add Offering</button>
            </div>
          </section>

          {/* SECTION F */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Section F - Festivals</h3>
            <div className="space-y-2">
              {formData.festivals.map((f: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <input placeholder="Festival Name" value={f} onChange={e=>handleArrayChange("festivals", i, e.target.value)} className="border p-2 rounded flex-1" />
                  <button type="button" onClick={()=>removeArrayItem("festivals", i)} className="text-red-500"><XMarkIcon className="w-5 h-5"/></button>
                </div>
              ))}
              <button type="button" onClick={()=>addArrayItem("festivals")} className="text-sm text-blue-600">+ Add Festival</button>
            </div>
          </section>

          {/* SECTION G & H */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Section G & H - Reach & Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="By Air" value={formData.howToReach.byAir} onChange={e=>handleNested("howToReach", "byAir", e.target.value)} className="border p-2 rounded" />
              <input placeholder="By Train" value={formData.howToReach.byTrain} onChange={e=>handleNested("howToReach", "byTrain", e.target.value)} className="border p-2 rounded" />
              <input placeholder="By Road" value={formData.howToReach.byRoad} onChange={e=>handleNested("howToReach", "byRoad", e.target.value)} className="border p-2 rounded" />
              <input placeholder="Nearby Station" value={formData.howToReach.nearbyStation} onChange={e=>handleNested("howToReach", "nearbyStation", e.target.value)} className="border p-2 rounded" />
              <input placeholder="Latitude" type="number" step="any" value={formData.coordinates.latitude} onChange={e=>handleNested("coordinates", "latitude", e.target.value)} className="border p-2 rounded" />
              <input placeholder="Longitude" type="number" step="any" value={formData.coordinates.longitude} onChange={e=>handleNested("coordinates", "longitude", e.target.value)} className="border p-2 rounded" />
            </div>
          </section>

          {/* SECTION I */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Section I - FAQ</h3>
            <div className="space-y-4">
              {formData.faq.map((f, i) => (
                <div key={i} className="flex gap-2 items-start border p-4 rounded bg-gray-50">
                  <div className="flex-1 space-y-2">
                    <input placeholder="Question" value={f.question} onChange={e=>handleFaq(i, "question", e.target.value)} className="border p-2 rounded w-full" />
                    <textarea placeholder="Answer" rows={2} value={f.answer} onChange={e=>handleFaq(i, "answer", e.target.value)} className="border p-2 rounded w-full" />
                  </div>
                  <button type="button" onClick={()=>removeFaq(i)} className="text-red-500 mt-2"><XMarkIcon className="w-6 h-6"/></button>
                </div>
              ))}
              <button type="button" onClick={addFaq} className="text-sm text-blue-600">+ Add FAQ</button>
            </div>
          </section>

          {/* SECTION J */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Section J - Relationships</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Related Articles</label>
                {formData.relatedArticles.map((g: string, i: number) => (
                  <div key={i} className="flex gap-1 mb-2">
                    <input placeholder="Article ID/Slug" value={g} onChange={e=>handleArrayChange("relatedArticles", i, e.target.value)} className="border p-1 rounded flex-1 text-sm" />
                    <button type="button" onClick={()=>removeArrayItem("relatedArticles", i)} className="text-red-500"><XMarkIcon className="w-4 h-4"/></button>
                  </div>
                ))}
                <button type="button" onClick={()=>addArrayItem("relatedArticles")} className="text-xs text-blue-600">+ Add</button>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Related Temples</label>
                {formData.relatedTemples.map((g: string, i: number) => (
                  <div key={i} className="flex gap-1 mb-2">
                    <input placeholder="Temple ID/Slug" value={g} onChange={e=>handleArrayChange("relatedTemples", i, e.target.value)} className="border p-1 rounded flex-1 text-sm" />
                    <button type="button" onClick={()=>removeArrayItem("relatedTemples", i)} className="text-red-500"><XMarkIcon className="w-4 h-4"/></button>
                  </div>
                ))}
                <button type="button" onClick={()=>addArrayItem("relatedTemples")} className="text-xs text-blue-600">+ Add</button>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Related Pujas</label>
                {formData.relatedPujas.map((g: string, i: number) => (
                  <div key={i} className="flex gap-1 mb-2">
                    <input placeholder="Puja ID/Slug" value={g} onChange={e=>handleArrayChange("relatedPujas", i, e.target.value)} className="border p-1 rounded flex-1 text-sm" />
                    <button type="button" onClick={()=>removeArrayItem("relatedPujas", i)} className="text-red-500"><XMarkIcon className="w-4 h-4"/></button>
                  </div>
                ))}
                <button type="button" onClick={()=>addArrayItem("relatedPujas")} className="text-xs text-blue-600">+ Add</button>
              </div>
            </div>
          </section>

          {/* SECTION K */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Section K - Feature Flags</h3>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.featured} onChange={e=>handleChange("featured", e.target.checked)} className="w-4 h-4" />
                <span>Featured Temple</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.popular} onChange={e=>handleChange("popular", e.target.checked)} className="w-4 h-4" />
                <span>Popular Temple</span>
              </label>
            </div>
          </section>

          {/* SECTION L */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Section L - SEO</h3>
            <div className="space-y-4">
              <input placeholder="Meta Title" value={formData.metaTitle} onChange={e=>handleChange("metaTitle", e.target.value)} className="border p-2 rounded w-full" />
              <textarea placeholder="Meta Description" rows={2} value={formData.metaDescription} onChange={e=>handleChange("metaDescription", e.target.value)} className="border p-2 rounded w-full" />
            </div>
          </section>

          <div className="flex justify-end pt-4 border-t">
            <button disabled={submitting} type="submit" className="bg-[#6869F9] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#5657e8] transition-colors">
              {submitting ? "Saving..." : editingId ? "Update Temple" : "Save Temple"}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Temple</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={3} className="p-6 text-center text-gray-500">Loading...</td></tr> : 
             items.length === 0 ? <tr><td colSpan={3} className="p-6 text-center text-gray-500">No temples found.</td></tr> :
             items.map(item => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {item.heroImage || item.imageUrl ? <img src={item.heroImage || item.imageUrl} className="w-10 h-10 rounded-lg object-cover" alt="" /> : <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>}
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.templeType}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.city}, {item.state}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={()=>handleEdit(item)} className="text-blue-600 hover:text-blue-800 mr-3"><PencilSquareIcon className="w-5 h-5 inline"/></button>
                  <button onClick={()=>handleDelete(item._id)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5 inline"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


