"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

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

function getSectionIcon(section: string): string {
  switch (section) {
    case "Basic & Header Info":
      return "⚡";
    case "Media & Banners":
      return "🖼️";
    case "Trust & Assurances":
    case "Trust & Highlights":
    case "Trust Badges":
      return "🛡️";
    case "Schedule & Muhurat":
      return "⏳";
    case "Temple & Location":
      return "🛕";
    case "Packages & Pricing":
      return "₹";
    case "About & Sacred Details":
      return "📖";
    case "Vedic Filters":
      return "🕉️";
    case "FAQs & Layout":
      return "❓";
    default:
      return "📝";
  }
}

interface SectionTheme {
  gradient: string;
  iconBg: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  hoverBorder: string;
  cardBg: string;
  pillHover: string;
}

const UNIFIED_SECTION_THEME: SectionTheme = {
  gradient: "from-primary via-[#6c5ce7] to-[#5657e8]",
  iconBg: "bg-gradient-to-br from-primary to-[#5657e8] shadow-md shadow-primary/25",
  badgeBg: "bg-primary/10",
  badgeText: "text-primary",
  borderColor: "border-slate-200/90",
  hoverBorder: "hover:border-primary/40",
  cardBg: "bg-white",
  pillHover: "hover:border-primary hover:bg-primary/5 hover:text-primary",
};

function getSectionTheme(_section?: string): SectionTheme {
  return UNIFIED_SECTION_THEME;
}

interface SubField {
  name: string;
  label: string;
  type: "text" | "textarea" | "url" | "number" | "select" | "checkbox";
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
  | "checkbox"
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
  section?: string;
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
  const [currencyRates] = useState<{ usd: number; myr: number } | null>(null);

  const [customOptionsState, setCustomOptionsState] = useState<Record<string, string[]>>({});
  const [excludedOptionsState, setExcludedOptionsState] = useState<Record<string, string[]>>({});
  const [addingCustomField, setAddingCustomField] = useState<string | null>(null);
  const [customInputText, setCustomInputText] = useState("");
  const [openSelectDropdown, setOpenSelectDropdown] = useState<string | null>(null);
  const [dropdownSearchQuery, setDropdownSearchQuery] = useState<Record<string, string>>({});

  // Close custom select dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("[data-custom-select]")) {
        setOpenSelectDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const effectiveFilterGroups = useMemo(() => {
    // If not puja or homa, return default filterGroups
    if (type !== "puja" && type !== "homa") {
      return filterGroups;
    }

    const fieldMapping: Record<string, string> = {
      Deity: "deity",
      Tithis: "tithis",
      Dosha: "dosha",
      Benefits: "benefit",
      Benefit: "benefit",
      Location: "filterLocation",
    };

    return filterGroups.map((group) => {
      const fieldName = fieldMapping[group.label];
      // Collect values from items
      const map = new Map<string, { value: string; keywords?: string[] }>();

      // First add static default options (except 'All')
      group.options.forEach((opt) => {
        if (opt.value && opt.value !== "All") {
          map.set(opt.value.trim().toLowerCase(), opt);
        }
      });

      // Next add custom entered options in memory
      if (fieldName && customOptionsState[fieldName]) {
        customOptionsState[fieldName].forEach((customVal) => {
          const trimmed = customVal.trim();
          if (trimmed) {
            const lower = trimmed.toLowerCase();
            if (!map.has(lower)) {
              map.set(lower, { value: trimmed, keywords: [lower] });
            }
          }
        });
      }

      // Next aggregate values from saved items
      if (group.label === "Location") {
        items.forEach((item) => {
          const parts = [
            item.filterLocation,
            item.location,
            item.templeLocation,
            item.templeVenue,
            item.details && typeof item.details === "object" && item.details !== null
              ? (item.details as { templeLocation?: string }).templeLocation
              : undefined,
          ].filter(Boolean) as string[];

          parts.forEach((s) => {
            const trimmed = s.trim();
            if (trimmed) {
              const lower = trimmed.toLowerCase();
              if (!map.has(lower)) {
                map.set(lower, { value: trimmed, keywords: [lower] });
              }
            }
            trimmed.split(/[,|;]/).forEach((chunk) => {
              const t = chunk.trim();
              if (t) {
                const lower = t.toLowerCase();
                if (!map.has(lower)) {
                  map.set(lower, { value: t, keywords: [lower] });
                }
              }
            });
          });
        });
      } else if (fieldName) {
        items.forEach((item) => {
          const val = item[fieldName];
          if (typeof val === "string" && val.trim()) {
            const trimmed = val.trim();
            const lower = trimmed.toLowerCase();
            if (!map.has(lower)) {
              map.set(lower, { value: trimmed, keywords: [lower] });
            }
          }
        });
      }

      const excludedList = fieldName ? (excludedOptionsState[fieldName] || []) : [];
      const excludedLower = new Set(excludedList.map((x) => x.toLowerCase()));

      const sortedOptions = Array.from(map.values())
        .filter((opt) => !excludedLower.has(opt.value.trim().toLowerCase()))
        .sort((a, b) => a.value.localeCompare(b.value));
      return {
        ...group,
        options: [{ value: "All" }, ...sortedOptions],
      };
    });
  }, [type, items, filterGroups, customOptionsState, excludedOptionsState]);

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

  const getAdminAuthHeaders = useCallback((): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const adminCookieMatch = document.cookie.match(/(?:^|;\s*)adminToken=([^;]+)/);
    const adminCookieToken = adminCookieMatch ? decodeURIComponent(adminCookieMatch[1]) : null;
    const adminLocalToken = localStorage.getItem("adminToken");

    const userCookieMatch = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    const userCookieToken = userCookieMatch ? decodeURIComponent(userCookieMatch[1]) : null;
    const userLocalToken = localStorage.getItem("token");

    const token = adminCookieToken || adminLocalToken || userCookieToken || userLocalToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const getEndpoint = useCallback((itemType: string, id?: string | null): string => {
    let expressBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
    if (!expressBase.endsWith('/api')) {
      expressBase += '/api';
    }
    if (itemType === "puja") {
      return id ? `${expressBase}/pujas/${id}` : `${expressBase}/pujas`;
    }
    if (itemType === "homa") {
      return id ? `${expressBase}/homas/${id}` : `${expressBase}/homas`;
    }
    if (itemType === "hero-banner" || itemType === "home-banner" || itemType === "heroBanner") {
      return id ? `${expressBase}/hero-banners/${id}` : `${expressBase}/hero-banners?all=true`;
    }
    return id ? `/api/admin/content?type=${itemType}&id=${id}` : `/api/admin/content?type=${itemType}`;
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = getEndpoint(type);
      const res = await fetch(endpoint, {
        headers: {
          ...getAdminAuthHeaders(),
        },
        credentials: "include",
      });
      if (!res.ok) {
        console.error(`Failed to fetch items for ${type}: HTTP ${res.status}`);
        return;
      }
      const text = await res.text();
      if (!text) return;
      const data = JSON.parse(text);
      const list = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
      if (Array.isArray(list)) {
        setItems(list);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  }, [type, getEndpoint, getAdminAuthHeaders]);

  useEffect(() => {
    fetchItems();

    // Fetch any reference data
    fields.forEach(async (f) => {
      if (f.type === "reference-array" && f.referenceEndpoint) {
        try {
          const res = await fetch(f.referenceEndpoint);
          if (!res.ok) return;
          const text = await res.text();
          if (!text) return;
          const data = JSON.parse(text);
          const list = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
          if (Array.isArray(list)) {
            setReferenceData((prev) => ({ ...prev, [f.name]: list }));
          }
        } catch (error) {
          console.error(`Failed to fetch reference data for ${f.name}:`, error);
        }
      }
    });
  }, [fetchItems, fields]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const name = target.name;
    const value = target.type === "checkbox" ? target.checked : target.value;
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

    const initialDraft: Record<string, unknown> = {};
    if (fields.some((f) => f.name === "trustBadges")) {
      initialDraft.trustBadges = [
        type === "homa" ? "Homa Video Delivered Within 48 hours" : "Puja Video Delivered Within 48 hours",
        "Verified & Experienced Pandits",
        type === "homa" ? "Homa Performed in Sacred Temples" : "Puja Performed in Sacred Temples",
        "100% Authentic Vedic Rituals",
      ];
    }
    setFormData(initialDraft);
    setFormError(null);
    setEditingId(null);
    setIsAdding(true);
  };

  const handleEdit = (item: Record<string, any>) => {
    const draft: Record<string, unknown> = {};

    fields.forEach((field) => {
      let raw = item[field.name];
      if (field.name === "ctaText" && item.cta && typeof item.cta === "object") {
        raw = item.cta.text;
      } else if (field.name === "ctaUrl" && item.cta && typeof item.cta === "object") {
        raw = item.cta.url;
      } else if (field.name === "isActive" && item.isActive !== undefined) {
        raw = String(item.isActive);
      }

      if (field.type === "json") {
        draft[field.name] = raw === undefined || raw === null ? "" : JSON.stringify(raw, null, 2);
        return;
      }
      if (field.type === "array-string" || field.type === "array-object" || field.type === "reference-array" || field.type === "section-order") {
        if (field.name === "trustBadges" && (!Array.isArray(raw) || raw.length === 0)) {
          draft[field.name] = [
            type === "homa" ? "Homa Video Delivered Within 48 hours" : "Puja Video Delivered Within 48 hours",
            "Verified & Experienced Pandits",
            type === "homa" ? "Homa Performed in Sacred Temples" : "Puja Performed in Sacred Temples",
            "100% Authentic Vedic Rituals",
          ];
          return;
        }
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

    if (type === "hero-banner" || type === "home-banner" || type === "heroBanner") {
      payload.cta = {
        text: String(formData.ctaText || "Book Puja Now").trim(),
        url: String(formData.ctaUrl || "/puja").trim(),
      };
      if (formData.isActive !== undefined) {
        payload.isActive = String(formData.isActive) !== "false";
      }
    }

    setSubmitting(true);
    try {
      let expressBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com";
      if (!expressBase.endsWith('/api')) {
        expressBase += '/api';
      }
      const endpoint = editingId
        ? getEndpoint(type, editingId)
        : (type === "hero-banner" || type === "home-banner" || type === "heroBanner"
          ? `${expressBase}/hero-banners`
          : getEndpoint(type));

      const res = await fetch(endpoint, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        resetForm();
        fetchItems();
      } else {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.message || errorData.error || `Failed to save (Status ${res.status})`;
        setFormError(msg);
      }
    } catch (error: any) {
      console.error("Failed to save item:", error);
      setFormError(error?.message || "Failed to save item.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const endpoint = getEndpoint(type, id);
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          ...getAdminAuthHeaders(),
        },
        credentials: "include",
      });
      if (res.ok) {
        fetchItems();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || `Failed to delete (Status ${res.status})`);
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

  const sectionGroups = useMemo(() => {
    const groups: { name: string; fields: Field[] }[] = [];
    const map = new Map<string, Field[]>();

    fields.forEach((field) => {
      const secName = field.section || "General Information";
      if (!map.has(secName)) {
        map.set(secName, []);
        groups.push({ name: secName, fields: map.get(secName)! });
      }
      map.get(secName)!.push(field);
    });

    return groups;
  }, [fields]);

  const navScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = navScrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(hasOverflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }, []);

  useEffect(() => {
    if (!isAdding) return;
    const t1 = setTimeout(checkScrollability, 100);
    const t2 = setTimeout(checkScrollability, 400);
    window.addEventListener("resize", checkScrollability);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", checkScrollability);
    };
  }, [isAdding, checkScrollability, sectionGroups]);

  const scrollNav = (direction: "left" | "right") => {
    const el = navScrollRef.current;
    if (!el) return;
    const distance = 260;
    el.scrollBy({ left: direction === "left" ? -distance : distance, behavior: "smooth" });
    setTimeout(checkScrollability, 300);
  };

  const renderField = (field: Field) => {
    const isPrice =
      field.type === "number" ||
      field.name.toLowerCase().includes("price") ||
      field.name.toLowerCase().includes("inr");

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor={field.name} className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {field.label} {field.required && <span className="text-red-500 font-bold">*</span>}
          </label>
          {field.type === "url" && formData[field.name] && (
            <a
              href={String(formData[field.name])}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-primary hover:underline font-bold inline-flex items-center gap-1"
            >
              View link ↗
            </a>
          )}
        </div>

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
            className="block w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-gray-900 focus:bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-2xs transition-all"
          />
        ) : field.type === "datetime-local" ? (
          <input
            type="datetime-local"
            id={field.name}
            name={field.name}
            required={field.required}
            placeholder={field.placeholder}
            value={formData[field.name] || ""}
            onChange={handleInputChange}
            className="block w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-gray-900 focus:bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-2xs transition-all"
          />
        ) : field.type === "reference-array" ? (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {referenceData[field.name]?.map((item: any) => {
                const isChecked = (formData[field.name] || []).includes(String(item._id));
                return (
                  <label
                    key={item._id}
                    className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-sm cursor-pointer transition-all ${isChecked
                      ? "border-primary bg-gradient-to-r from-primary/10 via-indigo-50/60 to-white text-primary font-bold shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
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
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                    />
                    <span className="truncate">{item[field.referenceLabelField || "name"] || item.title}</span>
                  </label>
                );
              })}
              {!referenceData[field.name] && <div className="text-sm text-slate-400 py-2">Loading options...</div>}
              {referenceData[field.name]?.length === 0 && <div className="text-sm text-slate-400 py-2">No items available.</div>}
            </div>
          </div>
        ) : field.type === "section-order" ? (
          <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-xs text-slate-500 mb-2">Drag and drop the cards below to change the live page section sequence:</p>
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
                className="flex items-center gap-3 p-3.5 bg-white border border-slate-200/90 rounded-xl cursor-grab active:cursor-grabbing hover:border-primary hover:shadow-md transition-all"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-xs font-bold text-white shadow-xs">
                  {idx + 1}
                </span>
                <Bars3Icon className="h-5 w-5 text-slate-400" />
                <span className="font-bold text-slate-800 capitalize text-sm">{item.replace(/-/g, " ")}</span>
              </div>
            ))}
          </div>
        ) : field.type === "array-string" ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            {(Array.isArray(formData[field.name]) && formData[field.name].length > 0 ? formData[field.name] : []).map((val: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-2xs">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => handleArrayChange(field.name, idx, e.target.value)}
                  placeholder={field.placeholder || "Enter value"}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-2xs"
                />
                {field.name.toLowerCase().includes("image") && Boolean(val) && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={val}
                    alt="Preview"
                    className="h-9 w-9 rounded-xl object-cover border border-slate-200 bg-white shrink-0 shadow-2xs"
                    onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeArrayItem(field.name, idx, field.label)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-2xs"
                  title="Remove item"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem(field.name, "array-string")}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500/10 via-primary/15 to-indigo-500/10 border-2 border-primary/30 px-4 py-2.5 text-xs font-bold text-primary hover:from-primary hover:to-[#5657e8] hover:text-white hover:border-transparent transition-all duration-200 shadow-xs w-full justify-center"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white group-hover:bg-white group-hover:text-primary transition-colors shadow-xs">
                <PlusIcon className="h-3.5 w-3.5 stroke-[3]" />
              </span>
              <span>Add Item to {field.label}</span>
            </button>
          </div>
        ) : field.type === "array-object" ? (
          <div className="space-y-4">
            {(Array.isArray(formData[field.name]) ? formData[field.name] : []).map((val: any, idx: number) => {
              const itemTitle = val.name || val.title || val.question || `${field.label} #${idx + 1}`;
              const hasPrice = val.priceINR !== undefined && val.priceINR !== "" && !isNaN(Number(val.priceINR));
              const isPackageOrOffering = field.name === "packages" || field.name === "offerings";

              return (
                <div
                  key={idx}
                  className={`relative rounded-2xl border ${isPackageOrOffering
                    ? "border-amber-300/80 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 hover:border-amber-400"
                    : "border-slate-200/90 bg-gradient-to-br from-slate-50/50 via-white to-indigo-50/20 hover:border-primary/40"
                    } p-5 shadow-xs hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-lg ${isPackageOrOffering
                          ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                          : "bg-gradient-to-br from-primary to-indigo-600 text-white"
                          } text-[11px] font-bold shadow-xs`}
                      >
                        #{idx + 1}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {itemTitle}
                      </span>
                      {hasPrice && (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-0.5 text-xs font-bold shadow-2xs">
                          ₹{Number(val.priceINR).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeArrayItem(field.name, idx, field.label)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-500 hover:text-white border border-red-200/60 transition-all"
                    >
                      <TrashIcon className="h-4 w-4" /> Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {field.objectSchema?.map((sub) => {
                      const isSubPrice = sub.name.toLowerCase().includes("price") || sub.name.toLowerCase().includes("inr");
                      const isFullSpan = sub.type === "textarea" || sub.name === "description" || sub.name === "answer";

                      return (
                        <div key={sub.name} className={isFullSpan ? "sm:col-span-2" : ""}>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {sub.label}
                          </label>
                          {sub.type === "textarea" ? (
                            <textarea
                              value={val[sub.name] || ""}
                              onChange={(e) => handleArrayChange(field.name, idx, e.target.value, sub.name)}
                              rows={2}
                              placeholder={sub.placeholder}
                              className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-2xs"
                            />
                          ) : sub.type === "select" ? (
                            <select
                              value={val[sub.name] || ""}
                              onChange={(e) => handleArrayChange(field.name, idx, e.target.value, sub.name)}
                              className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-2xs"
                            >
                              <option value="">-- Select {sub.label} --</option>
                              {sub.options?.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : isSubPrice ? (
                            <div className="relative rounded-xl shadow-2xs">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-xs">₹</span>
                              </div>
                              <input
                                type="number"
                                value={val[sub.name] ?? ""}
                                onChange={(e) => handleArrayChange(field.name, idx, e.target.value, sub.name)}
                                placeholder={sub.placeholder || "Price in INR (₹)"}
                                className="block w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3.5 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/15 shadow-2xs"
                              />
                            </div>
                          ) : (
                            <div>
                              <input
                                type={sub.type}
                                value={val[sub.name] || ""}
                                onChange={(e) => handleArrayChange(field.name, idx, e.target.value, sub.name)}
                                placeholder={sub.placeholder}
                                className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-2xs"
                              />
                              {sub.type === "url" && Boolean(val[sub.name]) && (
                                <div className="mt-1.5 flex items-center gap-2">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={val[sub.name]}
                                    alt="Preview"
                                    className="h-8 w-8 rounded-lg object-cover border border-slate-200 shadow-2xs"
                                    onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                                  />
                                  <span className="text-[11px] text-slate-400 truncate max-w-xs">{val[sub.name]}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => addArrayItem(field.name, "array-object")}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary via-[#6c5ce7] to-[#5657e8] px-5 py-3 text-xs font-bold text-white hover:brightness-110 active:scale-[0.99] transition-all shadow-md shadow-primary/25 w-full justify-center"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-white group-hover:rotate-90 transition-transform">
                <PlusIcon className="h-3.5 w-3.5 stroke-[3]" />
              </span>
              <span>Add New {field.label}</span>
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
            rows={field.type === "json" ? 8 : (field.name === "about" || field.name === "description" ? 4 : 3)}
            className="block w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-2xs transition-all"
          />
        ) : field.type === "select" ? (
          (() => {
            // Aggregate static options + customOptionsState + options found in existing items
            const optMap = new Map<string, string>();
            (field.options || []).forEach((opt) => {
              if (opt && opt.trim()) {
                optMap.set(opt.trim().toLowerCase(), opt.trim());
              }
            });
            if (customOptionsState[field.name]) {
              customOptionsState[field.name].forEach((opt) => {
                if (opt && opt.trim()) {
                  optMap.set(opt.trim().toLowerCase(), opt.trim());
                }
              });
            }
            items.forEach((item) => {
              const val = item[field.name];
              if (typeof val === "string" && val.trim()) {
                optMap.set(val.trim().toLowerCase(), val.trim());
              }
            });
            // If current form has a value not in list yet, include it
            const curVal = String(formData[field.name] || "").trim();
            if (curVal && !optMap.has(curVal.toLowerCase())) {
              optMap.set(curVal.toLowerCase(), curVal);
            }

            // Filter out any explicitly deleted/excluded options
            const excludedList = excludedOptionsState[field.name] || [];
            const excludedSet = new Set(excludedList.map((x) => x.toLowerCase()));

            const dynamicOptions = Array.from(optMap.values())
              .filter((opt) => !excludedSet.has(opt.toLowerCase()))
              .sort((a, b) => a.localeCompare(b));
            const isAddingCustomThisField = addingCustomField === field.name;

            const handleAddCustom = () => {
              const trimmed = customInputText.trim();
              if (!trimmed) {
                setAddingCustomField(null);
                setCustomInputText("");
                return;
              }
              // Prevent duplicates (case-insensitive check)
              const lower = trimmed.toLowerCase();
              const existingMatch = dynamicOptions.find((o) => o.toLowerCase() === lower);
              const canonicalValue = existingMatch || trimmed;

              // Un-exclude if it was previously deleted
              setExcludedOptionsState((prev) => ({
                ...prev,
                [field.name]: (prev[field.name] || []).filter((x) => x.toLowerCase() !== lower),
              }));

              setCustomOptionsState((prev) => {
                const currentList = prev[field.name] || [];
                if (currentList.some((o) => o.toLowerCase() === lower)) {
                  return prev;
                }
                return { ...prev, [field.name]: [...currentList, canonicalValue] };
              });

              setFormData((prev: any) => ({
                ...prev,
                [field.name]: canonicalValue,
              }));

              setAddingCustomField(null);
              setCustomInputText("");
            };

            const handleDeleteOption = (optToDelete: string) => {
              if (!optToDelete) return;
              if (!confirm(`Are you sure you want to delete "${optToDelete}" from ${field.label}?`)) return;

              const lower = optToDelete.toLowerCase();

              // Add to excluded options so it won't show in the dropdown
              setExcludedOptionsState((prev) => {
                const current = prev[field.name] || [];
                if (current.some((x) => x.toLowerCase() === lower)) return prev;
                return { ...prev, [field.name]: [...current, optToDelete] };
              });

              // Remove from customOptionsState if present
              setCustomOptionsState((prev) => {
                const current = prev[field.name] || [];
                return {
                  ...prev,
                  [field.name]: current.filter((x) => x.toLowerCase() !== lower),
                };
              });

              // If currently selected in the form, reset/clear it
              if (curVal.toLowerCase() === lower) {
                setFormData((prev: any) => ({
                  ...prev,
                  [field.name]: "",
                }));
              }
            };

            const isOpen = openSelectDropdown === field.name;
            const searchVal = (dropdownSearchQuery[field.name] || "").toLowerCase().trim();
            const filteredDynamicOptions = searchVal
              ? dynamicOptions.filter((opt) => opt.toLowerCase().includes(searchVal))
              : dynamicOptions;

            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {/* Custom Dropdown with Delete Icons inside each option */}
                  <div className={`relative flex-1 ${isOpen ? "z-50" : "z-10"}`} data-custom-select>
                    <button
                      type="button"
                      id={field.name}
                      onClick={() => {
                        setOpenSelectDropdown((prev) => {
                          const next = prev === field.name ? null : field.name;
                          if (!next) {
                            setDropdownSearchQuery((q) => ({ ...q, [field.name]: "" }));
                          }
                          return next;
                        });
                      }}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-black focus:bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-2xs transition-all cursor-pointer text-left"
                    >
                      <span className={curVal ? "font-semibold text-black" : "text-gray-400"}>
                        {curVal || `-- Select ${field.label} --`}
                      </span>
                      <ChevronDownIcon
                        className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`}
                      />
                    </button>

                    {/* Dropdown Options Popup */}
                    {isOpen && (
                      <div className="absolute left-0 top-full z-[100] mt-1.5 w-full min-w-[220px] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/20 max-h-72 flex flex-col animate-[fadeIn_0.15s_ease-out]">
                        {/* Search input inside dropdown */}
                        <div className="relative mb-1.5 shrink-0 px-1 pt-1">
                          <input
                            type="text"
                            autoFocus
                            value={dropdownSearchQuery[field.name] || ""}
                            onChange={(e) =>
                              setDropdownSearchQuery((prev) => ({
                                ...prev,
                                [field.name]: e.target.value,
                              }))
                            }
                            placeholder={`Search ${field.label.toLowerCase()}...`}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/90 pl-8 pr-7 py-1.5 text-xs font-medium text-black placeholder:text-gray-400 focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                          {Boolean(dropdownSearchQuery[field.name]) && (
                            <button
                              type="button"
                              onClick={() =>
                                setDropdownSearchQuery((prev) => ({ ...prev, [field.name]: "" }))
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-black rounded"
                            >
                              <XMarkIcon className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Options List */}
                        <div className="overflow-y-auto custom-scrollbar space-y-0.5 flex-1 pr-0.5">
                          {/* Clear/Placeholder Option */}
                          <div
                            onClick={() => {
                              setFormData((prev: any) => ({ ...prev, [field.name]: "" }));
                              setOpenSelectDropdown(null);
                            }}
                            className="flex items-center justify-between rounded-xl px-3 py-2 text-xs text-gray-500 hover:bg-slate-100/70 cursor-pointer transition-colors"
                          >
                            <span>-- Select {field.label} --</span>
                            {!curVal && <CheckIcon className="h-4 w-4 text-primary" />}
                          </div>

                          {filteredDynamicOptions.length === 0 ? (
                            <div className="px-3 py-3 text-center text-xs text-slate-400">
                              {searchVal ? `No matching "${searchVal}"` : `No options available.`}
                            </div>
                          ) : (
                            filteredDynamicOptions.map((opt) => {
                              const isSelected = curVal.toLowerCase() === opt.toLowerCase();
                              return (
                                <div
                                  key={opt}
                                  className={`group/item flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors cursor-pointer ${isSelected
                                      ? "bg-blue-100/80 text-blue-950 font-bold"
                                      : "text-black hover:bg-blue-50/90 hover:text-blue-900 font-medium"
                                    }`}
                                  onClick={() => {
                                    setFormData((prev: any) => ({ ...prev, [field.name]: opt }));
                                    setOpenSelectDropdown(null);
                                    setDropdownSearchQuery((q) => ({ ...q, [field.name]: "" }));
                                  }}
                                >
                                  <div className="flex items-center gap-2 truncate pr-2">
                                    {isSelected && <CheckIcon className="h-4 w-4 shrink-0 text-blue-700" />}
                                    <span className="truncate">{opt}</span>
                                  </div>

                                  {/* Delete Icon directly inside dropdown row: prominent red icon */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteOption(opt);
                                    }}
                                    title={`Delete "${opt}"`}
                                    className="shrink-0 p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer"
                                  >
                                    <TrashIcon className="h-4 w-4 stroke-[2] text-red-500 hover:text-red-700" />
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Button to toggle custom input */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isAddingCustomThisField) {
                        setAddingCustomField(null);
                        setCustomInputText("");
                      } else {
                        setAddingCustomField(field.name);
                        setCustomInputText("");
                        setOpenSelectDropdown(null);
                      }
                    }}
                    title={`Add new ${field.label}`}
                    className="shrink-0 inline-flex items-center gap-1 px-3 py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    {isAddingCustomThisField ? (
                      <>
                        <XMarkIcon className="h-4 w-4" />
                        <span>Cancel</span>
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-4 w-4 stroke-[2.5]" />
                        <span>+ Add New</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Inline Add Custom Option Input Form */}
                {isAddingCustomThisField && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl border border-primary/30 bg-primary/[0.03] animate-[fadeIn_0.15s_ease-out]">
                    <input
                      type="text"
                      autoFocus
                      value={customInputText}
                      onChange={(e) => setCustomInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustom();
                        } else if (e.key === "Escape") {
                          setAddingCustomField(null);
                          setCustomInputText("");
                        }
                      }}
                      placeholder={`Enter new ${field.label.toLowerCase()} name...`}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustom}
                      disabled={!customInputText.trim()}
                      className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingCustomField(null);
                        setCustomInputText("");
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
                      title="Cancel"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Selected Pill with clear option */}
                {curVal && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100/80 border border-slate-200/70 rounded-lg px-2.5 py-1.5 w-fit">
                    <span className="font-medium text-slate-500">Selected:</span>
                    <span className="font-bold text-primary">{curVal}</span>
                    <button
                      type="button"
                      onClick={() => setFormData((prev: any) => ({ ...prev, [field.name]: "" }))}
                      title="Clear selection"
                      className="text-slate-400 hover:text-slate-700 transition-colors ml-1 cursor-pointer"
                    >
                      <XMarkIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })()
        ) : field.type === "checkbox" ? (
          <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-primary/40 cursor-pointer shadow-2xs transition-all">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={formData[field.name] !== undefined ? Boolean(formData[field.name]) : true}
              onChange={handleInputChange}
              className="h-5 w-5 rounded-md border-slate-300 text-primary focus:ring-primary cursor-pointer accent-primary"
            />
            <div className="flex-1">
              <span className="text-sm font-bold text-slate-800">{field.label}</span>
              {field.placeholder && <p className="text-xs text-slate-500 mt-0.5">{field.placeholder}</p>}
            </div>
          </label>
        ) : isPrice ? (
          <div className="relative rounded-xl shadow-2xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-xs">₹</span>
            </div>
            <input
              type="number"
              id={field.name}
              name={field.name}
              required={field.required}
              placeholder={field.placeholder || "0"}
              value={formData[field.name] ?? ""}
              onChange={handleInputChange}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/15 shadow-2xs transition-all"
            />
          </div>
        ) : (
          <div>
            <input
              type={field.type === "url" ? "text" : field.type}
              id={field.name}
              name={field.name}
              required={field.required}
              placeholder={field.placeholder}
              value={formData[field.name] || ""}
              onChange={handleInputChange}
              list={field.options ? `${field.name}-options` : undefined}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-2xs transition-all"
            />
            {field.options && (
              <datalist id={`${field.name}-options`}>
                {field.options.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            )}
            {field.type === "url" && Boolean(formData[field.name]) && (
              <div className="mt-2.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={String(formData[field.name])}
                  alt={field.label}
                  className="h-12 w-12 rounded-lg object-cover border border-slate-200 bg-white shrink-0 shadow-2xs"
                  onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800">Live Preview</p>
                  <p className="text-[11px] text-slate-400 truncate font-mono">{String(formData[field.name])}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-full">
      {/* Sticky Header Bar: Flush at top:0 with zero gap/hole */}
      <div className="sticky top-0 z-30 w-full bg-[#f3f0ff] border-b border-[#e8e2ff] px-4 md:px-6 py-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-ink">
              {isAdding
                ? (editingId ? (formData.title || title.slice(0, -1)) : `Add New ${title.slice(0, -1)}`)
                : title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isAdding && (
              <button
                form="content-manager-form"
                type="submit"
                disabled={submitting}
                className="flex items-center rounded-xl bg-gradient-to-r from-primary to-[#5657e8] px-5 py-2 text-sm font-bold text-white hover:brightness-110 active:scale-[0.99] disabled:opacity-50 shadow-md shadow-primary/25 transition-all"
              >
                {submitting ? "Saving..." : editingId ? "Update Item" : "Save Item"}
              </button>
            )}
            {(!hideAddButton || isAdding) && (
              <button
                onClick={handleOpenAdd}
                className={`flex items-center rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-xs transition-all ${isAdding
                  ? "bg-gray-600 hover:bg-gray-700"
                  : "bg-primary hover:bg-[#5657e8]"
                  }`}
              >
                {isAdding ? "Cancel" : <><PlusIcon className="mr-1.5 h-4 w-4 stroke-[3]" /> Add New</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Page Content Body with padding */}
      <div className="p-4 md:p-6 space-y-6">

        {!isAdding && (
          <div className="rounded-lg border border-[#e8e2ff] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-ink sm:max-w-sm"
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
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-ink"
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
          <div className="space-y-8 pt-2">
            {/* Quick Jump Pill Navigation with Scroll Arrows */}
            {sectionGroups.length > 1 && (
              <div className="sticky top-16 z-20 -mx-2 flex items-center rounded-2xl border border-gray-200/90 bg-white/95 px-2 py-2 backdrop-blur-md shadow-xs">
                {/* Left Arrow Button */}
                {canScrollLeft && (
                  <button
                    type="button"
                    onClick={() => scrollNav("left")}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:text-primary transition-all shadow-xs mr-1.5"
                    title="Scroll sections left"
                    aria-label="Scroll left"
                  >
                    <ChevronLeftIcon className="h-4 w-4 stroke-[2.5]" />
                  </button>
                )}

                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 pl-2 pr-1 shrink-0">
                  Sections:
                </span>

                {/* Scrollable Container */}
                <div
                  ref={navScrollRef}
                  onScroll={checkScrollability}
                  className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1"
                >
                  {sectionGroups.map((group, idx) => {
                    const theme = getSectionTheme(group.name);
                    return (
                      <button
                        key={group.name}
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(`section-${idx}`);
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }}
                        className={`inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 ${theme.pillHover} hover:shadow-xs transition-all duration-150`}
                      >
                        <span className="text-sm">{getSectionIcon(group.name)}</span>
                        <span>{group.name}</span>
                        <span className={`rounded-full ${theme.badgeBg} ${theme.badgeText} px-2 py-0.5 text-[10px] font-bold`}>
                          {group.fields.length}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Arrow Button when required */}
                {canScrollRight && (
                  <button
                    type="button"
                    onClick={() => scrollNav("right")}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-[#5657e8] text-white shadow-md shadow-primary/30 hover:brightness-110 active:scale-95 transition-all ml-1.5 animate-pulse hover:animate-none"
                    title="More sections"
                    aria-label="Scroll right"
                  >
                    <ChevronRightIcon className="h-4 w-4 stroke-[3]" />
                  </button>
                )}
              </div>
            )}

            {/* Form with Unique Colorful Sections and Top Spacing */}
            <form id="content-manager-form" onSubmit={handleSubmit} className="space-y-8 pt-2">
              {formError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 shadow-xs">
                  {formError}
                </div>
              ) : null}

              {sectionGroups.map((group, groupIdx) => {
                const theme = getSectionTheme(group.name);
                return (
                  <div
                    key={group.name}
                    id={`section-${groupIdx}`}
                    className={`group relative overflow-visible rounded-2xl border ${theme.borderColor} ${theme.cardBg} shadow-xs hover:shadow-md ${theme.hoverBorder} transition-all duration-300 scroll-mt-44`}
                  >
                    {/* Top Colorful Gradient Header Accent Line */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${theme.gradient} rounded-t-2xl`} />

                    <div className="p-7 md:p-8 pt-8">
                      {/* Section Header */}
                      <div className="flex items-start justify-between pb-5 mb-7 border-b border-gray-100 pt-1">
                        <div className="flex items-center gap-3.5">
                          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${theme.iconBg} text-xl text-white shadow-md transition-transform group-hover:scale-105 duration-200`}>
                            {getSectionIcon(group.name)}
                          </span>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
                          </div>
                        </div>
                      </div>

                      {/* Grid of Fields */}
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {group.fields.map((field) => {
                          const isFullSpan =
                            field.type === "textarea" ||
                            field.type === "json" ||
                            field.type === "array-string" ||
                            field.type === "array-object" ||
                            field.type === "reference-array" ||
                            field.type === "section-order";

                          return (
                            <div key={field.name} className={isFullSpan ? "sm:col-span-2" : ""}>
                              {renderField(field)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Form Actions Row (Inline at bottom of form, non-floating) */}
              <div className="flex items-center justify-end gap-3 pt-6 pb-12 border-t border-gray-200/80">
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-primary via-[#6c5ce7] to-[#5657e8] px-7 py-2.5 text-sm font-bold text-white hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all shadow-md shadow-primary/30 flex items-center gap-2"
                >
                  {submitting ? "Saving..." : editingId ? "Update Changes" : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        )}

        {!isAdding && (
          <div className="overflow-x-auto rounded-lg border border-[#e8e2ff] bg-white shadow-sm">
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
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 min-w-[200px]">Actions</th>
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
                          <td key={field.name} className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 max-w-[200px] truncate">
                            {field.type === "url" && item[field.name] ? (
                              <div className="flex items-center">
                                <Image src={item[field.name]} alt="" width={32} height={32} unoptimized className="h-8 w-8 rounded object-cover mr-2" />
                                <span className="truncate max-w-[150px]">{item[field.name]}</span>
                              </div>
                            ) : (
                              <span className="truncate max-w-[200px] block" title={String(item[field.name] ?? "")}>{item[field.name]}</span>
                            )}
                          </td>
                        ))
                      )}
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium min-w-[200px]">
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
                                className={`rounded-md border px-2 py-1 text-xs font-semibold ${item.approved
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
                              {(type === "puja" || type === "homa" || type === "home-banner" || type === "hero-banner" || type === "heroBanner") && (
                                <>
                                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "inactive" || item.isActive === false ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                    {item.status === "inactive" || item.isActive === false ? "Inactive" : "Active"}
                                  </span>
                                  <button
                                    onClick={async () => {
                                      const isCurrentActive = item.isActive !== false && item.status !== "inactive";
                                      const nextStatus = isCurrentActive ? false : true;
                                      const payload = { ...item, isActive: nextStatus, status: isCurrentActive ? "inactive" : "active" }; delete payload._id;
                                      const res = await fetch(getEndpoint(type, item._id), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                                      if (res.ok) fetchItems();
                                    }}
                                    className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                                  >
                                    Mark {item.isActive !== false && item.status !== "inactive" ? "Inactive" : "Active"}
                                  </button>
                                  {(type === "puja" || type === "homa") && (
                                    <a href={`/${type}/${item.slug || String(item.title || "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")}`} target="_blank" rel="noreferrer" className="text-[#000000] hover:text-[#4647c4]" title={`View ${type}`}>
                                      <EyeIcon className="h-5 w-5" />
                                    </a>
                                  )}
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
                      className={`rounded-md border px-3 py-1.5 text-sm ${page === currentPage
                        ? "border-primary bg-primary text-white"
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

      </div>

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
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://priestservices.astroved.com"}/api/admin/content?type=${type}&id=${viewingReview._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                  if (res.ok) { fetchItems(); setViewingReview({ ...viewingReview, approved: nextStatus }); }
                }}
                className={`rounded-md border px-4 py-1.5 text-sm font-semibold ${viewingReview.approved ? "border-red-300 text-red-600 hover:bg-red-50" : "border-green-400 text-green-700 hover:bg-green-50"
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


