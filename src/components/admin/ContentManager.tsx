"use client";

import { useState, useEffect, useMemo } from "react";
import { PencilSquareIcon, PlusIcon, TrashIcon, EyeIcon, Bars3Icon } from "@heroicons/react/24/outline";

/** Puja card date stored as DD-MM-YYYY; native date input uses YYYY-MM-DD */
function ddmmyyyyToIso(value: string): string {
  const m = String(value).trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!m) return "";
  const d = m[1].padStart(2, "0");
  const mo = m[2].padStart(2, "0");
  const y = m[3];
  return `${y}-${mo}-${d}`;
}

function isoToDdmmyyyy(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, mo, d] = iso.split("-");
  return `${d}-${mo}-${y}`;
}

interface SubField {
  name: string;
  label: string;
  type: "text" | "textarea" | "url" | "number" | "select";
  placeholder?: string;
  options?: string[];
}

interface Field {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "url"
    | "number"
    | "date"
    | "date-ddmmyyyy"
    | "datetime-local"
    | "json"
    | "array-string"
    | "array-object"
    | "reference-array"
    | "section-order"
    | "select";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  objectSchema?: SubField[];
  referenceEndpoint?: string;
  referenceLabelField?: string;
}

interface ContentManagerProps {
  type: string;
  title: string;
  fields: Field[];
  searchFields?: string[];
  filterGroups?: {
    label: string;
    options: { value: string; keywords?: string[] }[];
  }[];
  /** Build Location filter options from saved puja rows (new locations appear automatically) */
  dynamicPujaLocationFromItems?: boolean;
  /** Review-only mode: hide Add/Edit, show Approve/Unapprove */
  reviewMode?: boolean;
  hideAddButton?: boolean;
}

/** Stable empty default — avoid new [] each render (breaks useMemo + causes setState loops). */
const EMPTY_FILTER_GROUPS: NonNullable<ContentManagerProps["filterGroups"]> = [];

function filtersRecordEqual(a: Record<string, string>, b: Record<string, string>): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => a[k] === b[k]);
}

const PAGE_SIZE = 10;

export default function ContentManager({
  type,
  title,
  fields,
  searchFields = [],
  filterGroups = EMPTY_FILTER_GROUPS,
  dynamicPujaLocationFromItems = false,
  reviewMode = false,
  hideAddButton = false,
}: ContentManagerProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [referenceData, setReferenceData] = useState<Record<string, any[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingReview, setViewingReview] = useState<any | null>(null);
  const [currencyRates, setCurrencyRates] = useState<{usd: number, myr: number} | null>(null);

  const effectiveFilterGroups = useMemo(() => {
    if (type !== "puja" || !dynamicPujaLocationFromItems) {
      return filterGroups;
    }

    const locStrings = new Set<string>();
    items.forEach((item) => {
      const parts = [
        item.location,
        item.templeLocation,
        item.templeVenue,
        item.details && typeof item.details === "object" && item.details !== null
          ? (item.details as { templeLocation?: string }).templeLocation
          : undefined,
      ].filter(Boolean) as string[];

      parts.forEach((s) => {
        const trimmed = s.trim();
        if (trimmed) locStrings.add(trimmed);
        trimmed.split(/[,|;]/).forEach((chunk) => {
          const t = chunk.trim();
          if (t) locStrings.add(t);
        });
      });
    });

    const sorted = Array.from(locStrings).sort((a, b) => a.localeCompare(b));
    const locationGroup = {
      label: "Location",
      options: [
        { value: "All" },
        ...sorted.map((value) => ({ value, keywords: [value.toLowerCase()] })),
      ],
    };

    const withoutStaticLocation = filterGroups.filter((g) => g.label !== "Location");
    return [...withoutStaticLocation, locationGroup];
  }, [type, dynamicPujaLocationFromItems, items, filterGroups]);

  useEffect(() => {
    setActiveFilters((prev) => {
      const next: Record<string, string> = {};
      effectiveFilterGroups.forEach((g) => {
        const previous = prev[g.label];
        const optionValues = new Set(g.options.map((o) => o.value));
        next[g.label] =
          previous !== undefined && optionValues.has(previous) ? previous : "All";
      });
      // Avoid infinite loops: new `{}` is never referentially equal; bail out if values unchanged.
      if (filtersRecordEqual(prev, next)) return prev;
      return next;
    });
  }, [effectiveFilterGroups]);

  useEffect(() => {
    fetchItems();
    
    // Fetch currency settings
    fetch("/api/admin/content?type=currency")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const rates = data[0];
          setCurrencyRates({
            usd: Number(rates.usdConversionRate) || 0,
            myr: Number(rates.myrConversionRate) || 0
          });
        }
      })
      .catch(console.error);
    
    // Fetch any reference data
    fields.forEach(async (f) => {
      if (f.type === "reference-array" && f.referenceEndpoint) {
        try {
          const res = await fetch(f.referenceEndpoint);
          const data = await res.json();
          if (Array.isArray(data)) {
            setReferenceData((prev) => ({ ...prev, [f.name]: data }));
          }
        } catch (error) {
          console.error(`Failed to fetch reference data for ${f.name}:`, error);
        }
      }
    });
  }, [type]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/content?type=${type}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => {
      const next = { ...prev, [name]: value };
      
      // Auto-calculate currencies
      if (currencyRates && name.endsWith("INR")) {
        const baseName = name.replace(/INR$/, "");
        const valNum = Number(value);
        if (!isNaN(valNum) && valNum > 0) {
          const usdField = baseName + "USD";
          const myrField = baseName + "MYR";
          
          if (fields.some(f => f.name === usdField)) {
             next[usdField] = (valNum * currencyRates.usd).toFixed(2);
          }
          if (fields.some(f => f.name === myrField)) {
             next[myrField] = (valNum * currencyRates.myr).toFixed(2);
          }
        }
      }
      
      return next;
    });
  };

  const handleArrayChange = (fieldName: string, index: number, value: any, subField?: string) => {
    setFormData((prev: any) => {
      const arr = Array.isArray(prev[fieldName]) ? [...prev[fieldName]] : [];
      if (subField) {
        const itemObj = { ...arr[index], [subField]: value };
        
        // Auto-calculate for array objects (e.g. packages)
        if (currencyRates && subField.endsWith("INR")) {
           const baseName = subField.replace(/INR$/, "");
           const valNum = Number(value);
           if (!isNaN(valNum) && valNum > 0) {
               itemObj[baseName + "USD"] = (valNum * currencyRates.usd).toFixed(2);
               itemObj[baseName + "MYR"] = (valNum * currencyRates.myr).toFixed(2);
           }
        }
        
        arr[index] = itemObj;
      } else {
        arr[index] = value;
      }
      return { ...prev, [fieldName]: arr };
    });
  };

  const addArrayItem = (fieldName: string, type: "array-string" | "array-object") => {
    setFormData((prev: any) => {
      const arr = Array.isArray(prev[fieldName]) ? [...prev[fieldName]] : [];
      arr.push(type === "array-string" ? "" : {});
      return { ...prev, [fieldName]: arr };
    });
  };

  const removeArrayItem = (fieldName: string, index: number, itemLabel = "item") => {
    if (!window.confirm(`Are you sure you want to delete this ${itemLabel}?`)) return;
    setFormData((prev: any) => {
      const arr = Array.isArray(prev[fieldName]) ? [...prev[fieldName]] : [];
      arr.splice(index, 1);
      return { ...prev, [fieldName]: arr };
    });
  };

  const resetForm = () => {
    setFormData({});
    setFormError(null);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleOpenAdd = () => {
    if (isAdding) {
      resetForm();
      return;
    }

    setFormData({});
    setFormError(null);
    setEditingId(null);
    setIsAdding(true);
  };

  const handleEdit = (item: Record<string, any>) => {
    const draft: Record<string, unknown> = {};

    fields.forEach((field) => {
      const raw = item[field.name];
      if (field.type === "json") {
        draft[field.name] = raw === undefined || raw === null ? "" : JSON.stringify(raw, null, 2);
        return;
      }
      if (field.type === "array-string" || field.type === "array-object" || field.type === "reference-array" || field.type === "section-order") {
        draft[field.name] = Array.isArray(raw) && raw.length > 0 ? raw : (field.type === "section-order" ? field.options || [] : []);
        return;
      }

      draft[field.name] = raw ?? "";
    });

    setFormData(draft);
    setFormError(null);
    setEditingId(String(item._id));
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload: Record<string, unknown> = { ...formData };
    for (const field of fields) {
      const rawValue = formData[field.name];

      if (field.type === "number") {
        if (rawValue === "" || rawValue === undefined || rawValue === null) {
          continue;
        }

        const numericValue = Number(rawValue);
        if (Number.isNaN(numericValue)) {
          setFormError(`${field.label} must be a valid number.`);
          return;
        }

        payload[field.name] = numericValue;
      }

      if (field.type === "json") {
        if (typeof rawValue !== "string" || rawValue.trim() === "") {
          payload[field.name] = field.required ? {} : undefined;
          continue;
        }

        try {
          payload[field.name] = JSON.parse(rawValue);
        } catch {
          setFormError(`${field.label} must be valid JSON.`);
          return;
        }
      }

      if (field.type === "array-string") {
        payload[field.name] = (formData[field.name] || []).filter((v: string) => typeof v === "string" && v.trim().length > 0);
        continue;
      }

      if (field.type === "array-object") {
        payload[field.name] = (formData[field.name] || []).filter((v: any) => 
          v && typeof v === "object" && Object.values(v).some(val => val !== "" && val !== null && val !== undefined)
        );
        continue;
      }

      if (field.type === "reference-array") {
        payload[field.name] = Array.isArray(formData[field.name]) ? formData[field.name] : [];
        continue;
      }

      if (field.type === "section-order") {
        payload[field.name] = formData[field.name] || field.options || [];
        continue;
      }
    }

    if (type === "puja" && !payload.status) {
      payload.status = "active";
    }

    setSubmitting(true);
    try {
      const endpoint = editingId
        ? `/api/admin/content?type=${type}&id=${editingId}`
        : `/api/admin/content?type=${type}`;

      const res = await fetch(endpoint, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        resetForm();
        fetchItems();
      }
    } catch (error) {
      console.error("Failed to save item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const res = await fetch(`/api/admin/content?type=${type}&id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const haystack = searchFields
          .map((field) => String(item[field] ?? ""))
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      for (const group of effectiveFilterGroups) {
        const selected = activeFilters[group.label];
        if (!selected || selected === "All") continue;
        const option = group.options.find((opt) => opt.value === selected);
        if (!option) continue;

        const fieldMapping: Record<string, string> = {
          Deity: "deity",
          Tithis: "tithis",
          Dosha: "dosha",
          Benefits: "benefit",
          Location: "filterLocation",
        };
        const fieldName = fieldMapping[group.label];
        const savedValue = fieldName ? item[fieldName] : undefined;

        let matches = false;
        if (typeof savedValue === "string" && savedValue.trim()) {
          matches = savedValue.trim().toLowerCase() === selected.toLowerCase();
        } else {
          const textToMatch = [
            ...searchFields.map((field) => String(item[field] ?? "")),
            JSON.stringify(item),
          ]
            .join(" ")
            .toLowerCase();

          const keywords =
            "keywords" in option && Array.isArray(option.keywords) && option.keywords.length > 0
              ? option.keywords
              : [option.value.toLowerCase()];
          matches = keywords.some((kw) => textToMatch.includes(kw.toLowerCase()));
        }

        if (!matches) return false;
      }

      return true;
    });
  }, [items, searchQuery, searchFields, effectiveFilterGroups, activeFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pagedItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to page 1 whenever filters/search change
  const prevFilterKey = useMemo(() => searchQuery + JSON.stringify(activeFilters), [searchQuery, activeFilters]);
  useEffect(() => { setCurrentPage(1); }, [prevFilterKey]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-ink">{title}</h1>
        <div className="flex items-center gap-2">
          {isAdding && (
            <button
              form="content-manager-form"
              type="submit"
              disabled={submitting}
              className="flex items-center rounded-md bg-[#6869F9] px-4 py-2 text-sm font-medium text-white hover:bg-[#5657e8] disabled:opacity-50"
            >
              {submitting ? "Saving..." : editingId ? "Update Item" : "Save Item"}
            </button>
          )}
          {(!hideAddButton || isAdding) && (
            <button
              onClick={handleOpenAdd}
              className={`flex items-center rounded-md px-4 py-2 text-sm font-medium text-white ${
                isAdding
                  ? "bg-gray-500 hover:bg-gray-600"
                  : "bg-[#6869F9] hover:bg-[#5657e8]"
              }`}
            >
              {isAdding ? "Cancel" : <><PlusIcon className="mr-2 h-5 w-5" /> Add New</>}
            </button>
          )}
        </div>
      </div>

      {!isAdding && (
        <div className="rounded-lg border border-[#e8e2ff] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#6869F9] focus:outline-none focus:ring-[#1f1f1f] sm:max-w-sm"
            />
            {effectiveFilterGroups.length > 0 && (
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="rounded-md border border-[#d8ceff] bg-white px-4 py-2 text-sm font-medium text-[#000000] hover:bg-[#f3f0ff]"
              >
                Filter
              </button>
            )}
          </div>

          {isFilterOpen && effectiveFilterGroups.length > 0 && (
            <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-wrap items-end gap-3">
                {effectiveFilterGroups.map((group) => (
                  <label key={group.label} className="min-w-40 flex-1 text-sm text-gray-700 sm:max-w-56">
                    <span className="mb-1 block font-medium">{group.label}</span>
                    <select
                      value={activeFilters[group.label] ?? "All"}
                      onChange={(e) =>
                        setActiveFilters((prev) => ({ ...prev, [group.label]: e.target.value }))
                      }
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#6869F9] focus:outline-none focus:ring-[#1f1f1f]"
                    >
                      {group.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.value}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const cleared: Record<string, string> = {};
                    effectiveFilterGroups.forEach((g) => {
                      cleared[g.label] = "All";
                    });
                    setActiveFilters(cleared);
                  }}
                  className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isAdding && (
        <div className="rounded-lg border border-[#e8e2ff] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-brand-ink">
            {editingId ? `Edit ${title.slice(0, -1)}` : `Add New ${title.slice(0, -1)}`}
          </h2>
          <form id="content-manager-form" onSubmit={handleSubmit} className="space-y-4">
            {formError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            ) : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={`${field.type === "textarea" || field.type === "json" || field.type === "array-string" || field.type === "array-object" || field.type === "reference-array" ? "sm:col-span-2" : ""} border-b border-gray-200 pb-4`}
                >
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  
                  {field.type === "date-ddmmyyyy" ? (
                    <input
                      type="date"
                      id={field.name}
                      name={field.name}
                      required={field.required}
                      value={ddmmyyyyToIso(String(formData[field.name] ?? ""))}
                      onChange={(e) => {
                        const iso = e.target.value;
                        setFormData((prev: Record<string, unknown>) => ({
                          ...prev,
                          [field.name]: iso ? isoToDdmmyyyy(iso) : "",
                        }));
                      }}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#6869F9] focus:outline-none focus:ring-[#1f1f1f] sm:text-sm"
                    />
                  ) : field.type === "reference-array" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      {referenceData[field.name]?.map((item: any) => (
                        <label key={item._id} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={(formData[field.name] || []).includes(String(item._id))}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData((prev: any) => {
                                const arr = prev[field.name] || [];
                                if (checked) {
                                  return { ...prev, [field.name]: [...arr, String(item._id)] };
                                }
                                return { ...prev, [field.name]: arr.filter((id: string) => id !== String(item._id)) };
                              });
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-[#1f1f1f] focus:ring-[#1f1f1f]"
                          />
                          {item[field.referenceLabelField || "name"]}
                        </label>
                      ))}
                      {!referenceData[field.name] && <div className="text-sm text-gray-500">Loading...</div>}
                      {referenceData[field.name]?.length === 0 && <div className="text-sm text-gray-500">No items available.</div>}
                    </div>
                  ) : field.type === "section-order" ? (
                    <div className="space-y-2 mt-2">
                      {(Array.isArray(formData[field.name]) && formData[field.name].length > 0 ? formData[field.name] : field.options || []).map((item: string, idx: number) => (
                        <div
                          key={item}
                          draggable
                          onDragStart={() => setDraggedItemIndex(idx)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedItemIndex === null || draggedItemIndex === idx) return;
                            const currentOrder = Array.isArray(formData[field.name]) && formData[field.name].length > 0 ? formData[field.name] : field.options || [];
                            const newOrder = [...currentOrder];
                            const [draggedItem] = newOrder.splice(draggedItemIndex, 1);
                            newOrder.splice(idx, 0, draggedItem);
                            setFormData((prev: any) => ({ ...prev, [field.name]: newOrder }));
                            setDraggedItemIndex(null);
                          }}
                          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:border-[#6869F9] transition-colors"
                        >
                          <Bars3Icon className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-700 capitalize">{item.replace(/-/g, " ")}</span>
                        </div>
                      ))}
                      <p className="text-xs text-gray-500 mt-2">Drag and drop to reorder sections on the frontend.</p>
                    </div>
                  ) : field.type === "array-string" ? (
                    <div className="space-y-2">
                      {(Array.isArray(formData[field.name]) ? formData[field.name] : []).map((val: string, idx: number) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => handleArrayChange(field.name, idx, e.target.value)}
                            placeholder={field.placeholder || "Enter value"}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#6869F9] focus:outline-none focus:ring-[#1f1f1f] sm:text-sm"
                          />
                          <button type="button" onClick={() => removeArrayItem(field.name, idx, field.label)} className="text-red-500 hover:text-red-700">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addArrayItem(field.name, "array-string")} className="mt-3 inline-flex text-sm text-[#1f1f1f] font-medium hover:underline">
                        + Add {field.label}
                      </button>
                    </div>
                  ) : field.type === "array-object" ? (
                    <div className="space-y-4">
                      {(Array.isArray(formData[field.name]) ? formData[field.name] : []).map((val: any, idx: number) => (
                        <div key={idx} className="relative rounded-lg border border-gray-200 bg-gray-50 p-4">
                          <button type="button" onClick={() => removeArrayItem(field.name, idx, field.label)} className="absolute right-2 top-2 text-red-500 hover:text-red-700">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                          <div className="grid grid-cols-1 gap-4 mt-2">
                            {field.objectSchema?.map(sub => (
                              <div key={sub.name}>
                                <label className="block text-xs font-medium text-gray-700">{sub.label}</label>
                                {sub.type === "textarea" ? (
                                  <textarea
                                    value={val[sub.name] || ""}
                                    onChange={(e) => handleArrayChange(field.name, idx, e.target.value, sub.name)}
                                    rows={2}
                                    placeholder={sub.placeholder}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#6869F9] focus:outline-none focus:ring-[#1f1f1f] sm:text-sm"
                                  />
                                ) : sub.type === "select" ? (
                                  <select
                                    value={val[sub.name] || ""}
                                    onChange={(e) => handleArrayChange(field.name, idx, e.target.value, sub.name)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#6869F9] focus:outline-none focus:ring-[#1f1f1f] sm:text-sm"
                                  >
                                    <option value="">-- Select {sub.label} --</option>
                                    {sub.options?.map(opt => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type={sub.type}
                                    value={val[sub.name] || ""}
                                    onChange={(e) => handleArrayChange(field.name, idx, e.target.value, sub.name)}
                                    placeholder={sub.placeholder || (sub.name.toLowerCase().includes("price") ? "$ Price" : undefined)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#6869F9] focus:outline-none focus:ring-[#1f1f1f] sm:text-sm"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={() => addArrayItem(field.name, "array-object")} className="mt-3 inline-flex text-sm text-[#1f1f1f] font-medium hover:underline">
                        + Add {field.label}
                      </button>
                    </div>
                  ) : field.type === "textarea" || field.type === "json" ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={handleInputChange}
                      rows={field.type === "json" ? 8 : 3}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#6869F9] focus:outline-none focus:ring-[#1f1f1f] sm:text-sm"
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={field.name}
                      name={field.name}
                      required={field.required}
                      value={formData[field.name] || ""}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#6869F9] focus:outline-none focus:ring-[#1f1f1f] sm:text-sm"
                    >
                      <option value="">-- Select {field.label} --</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <input
                        type={field.type === "url" ? "text" : field.type}
                        id={field.name}
                        name={field.name}
                        required={field.required}
                        placeholder={field.placeholder || (field.name.toLowerCase().includes("price") ? "$ Price" : undefined)}
                        value={formData[field.name] || ""}
                        onChange={handleInputChange}
                        list={field.options ? `${field.name}-options` : undefined}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#6869F9] focus:outline-none focus:ring-[#1f1f1f] sm:text-sm"
                      />
                      {field.options && (
                        <datalist id={`${field.name}-options`}>
                          {field.options.map((opt) => (
                            <option key={opt} value={opt} />
                          ))}
                        </datalist>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-[#6869F9] px-6 py-2 text-sm font-medium text-white hover:bg-[#5657e8] disabled:opacity-50"
              >
                {submitting ? "Saving..." : editingId ? "Update Item" : "Save Item"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!isAdding && (
        <div className="overflow-hidden rounded-lg border border-[#e8e2ff] bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {reviewMode ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Rating</th>
                  </>
                ) : (
                  fields.slice(0, 3).map((field) => (
                    <th key={field.name} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {field.label}
                    </th>
                  ))
                )}
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : pagedItems.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No items found.</td></tr>
              ) : (
                pagedItems.map((item) => (
                  <tr key={item._id}>
                    {reviewMode ? (
                      <>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-[180px] truncate">{item.service || item.type || "—"}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{item.rating ? `${'★'.repeat(Number(item.rating))} (${item.rating})` : "—"}</td>
                      </>
                    ) : (
                      fields.slice(0, 3).map((field) => (
                        <td key={field.name} className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {field.type === "url" && item[field.name] ? (
                            <div className="flex items-center">
                              <img src={item[field.name]} alt="" className="h-8 w-8 rounded object-cover mr-2" />
                              <span className="truncate max-w-37.5">{item[field.name]}</span>
                            </div>
                          ) : (
                            <span className="truncate max-w-50 block">{item[field.name]}</span>
                          )}
                        </td>
                      ))
                    )}
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        {reviewMode ? (
                          <>
                            <button
                              onClick={() => setViewingReview(item)}
                              className="text-[#000000] hover:text-[#4647c4]"
                              title="View review"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={async () => {
                                const nextStatus = item.approved ? false : true;
                                const payload = { ...item, approved: nextStatus };
                                delete payload._id;
                                const res = await fetch(`/api/admin/content?type=${type}&id=${item._id}`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify(payload),
                                });
                                if (res.ok) fetchItems();
                              }}
                              className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                                item.approved
                                  ? "border-red-300 text-red-600 hover:bg-red-50"
                                  : "border-green-400 text-green-700 hover:bg-green-50"
                              }`}
                            >
                              {item.approved ? "Unapprove" : "Approve"}
                            </button>
                            <button onClick={() => handleEdit(item)} className="text-[#000000] hover:text-[#4647c4]" aria-label="Edit review" title="Edit review">
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900" aria-label="Delete" title="Delete review">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            {(type === "puja" || type === "homa") && (
                              <>
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "inactive" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                  {item.status === "inactive" ? "Inactive" : "Active"}
                                </span>
                                <button
                                  onClick={async () => {
                                    const nextStatus = item.status === "inactive" ? "active" : "inactive";
                                    const payload = { ...item, status: nextStatus }; delete payload._id;
                                    const res = await fetch(`/api/admin/content?type=${type}&id=${item._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                                    if (res.ok) fetchItems();
                                  }}
                                  className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                                >
                                  Mark {item.status === "inactive" ? "Active" : "Inactive"}
                                </button>
                                <a href={`/${type}/${item.slug || String(item.title || "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")}`} target="_blank" rel="noreferrer" className="text-[#000000] hover:text-[#4647c4]" title={`View ${type}`}>
                                  <EyeIcon className="h-5 w-5" />
                                </a>
                              </>
                            )}
                            {type === "chadhava" && (
                              <a href={`/chadhava/${item.slug || String(item.title || "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")}`} target="_blank" rel="noreferrer" className="text-[#000000] hover:text-[#4647c4]" title="View chadhava">
                                <EyeIcon className="h-5 w-5" />
                              </a>
                            )}
                            <button onClick={() => handleEdit(item)} className="text-[#000000] hover:text-[#4647c4]" aria-label="Edit item">
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900" aria-label="Delete item">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredItems.length)} of {filteredItems.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-md border px-3 py-1.5 text-sm ${
                      page === currentPage
                        ? "border-[#6869F9] bg-[#6869F9] text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Detail Modal */}
      {viewingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewingReview(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-bold text-gray-900">{viewingReview.name}</p>
                  <p className="text-xs text-gray-500">{viewingReview.service || viewingReview.pujaName || viewingReview.type || ""}</p>
                </div>
              </div>
              <button onClick={() => setViewingReview(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            {viewingReview.rating && (
              <p className="text-yellow-500 text-lg mb-2">{'★'.repeat(Number(viewingReview.rating))}{'☆'.repeat(5 - Number(viewingReview.rating))}</p>
            )}
            {viewingReview.videoUrl ? (
              <video src={viewingReview.videoUrl} controls className="w-full rounded-lg mb-3" />
            ) : null}
            <p className="text-gray-700 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{viewingReview.content}</p>
            <div className="flex items-center justify-between">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${viewingReview.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {viewingReview.approved ? "Approved" : "Pending Approval"}
              </span>
              <button
                onClick={async () => {
                  const nextStatus = viewingReview.approved ? false : true;
                  const payload = { ...viewingReview, approved: nextStatus }; delete payload._id;
                  const res = await fetch(`/api/admin/content?type=${type}&id=${viewingReview._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                  if (res.ok) { fetchItems(); setViewingReview({ ...viewingReview, approved: nextStatus }); }
                }}
                className={`rounded-md border px-4 py-1.5 text-sm font-semibold ${
                  viewingReview.approved ? "border-red-300 text-red-600 hover:bg-red-50" : "border-green-400 text-green-700 hover:bg-green-50"
                }`}
              >
                {viewingReview.approved ? "Unapprove" : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


