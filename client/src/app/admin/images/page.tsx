"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Trash2,
  Edit2,
  Copy,
  Check,
  ExternalLink,
  Search,
  RefreshCw,
  AlertTriangle,
  X,
  FileImage,
  HardDrive,
  Layers,
  RotateCcw,
  ArchiveRestore,
  AlertCircle,
} from "lucide-react";

interface MediaItem {
  _id?: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

interface MediaStats {
  active: number;
  trash: number;
  totalSize: number;
}

export default function MediaManagerPage() {
  const router = useRouter();
  const [_authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "trash">("active");
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [stats, setStats] = useState<MediaStats>({ active: 0, trash: 0, totalSize: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // Upload modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [allowOverwrite, setAllowOverwrite] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Edit / Rename modal states
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [newName, setNewName] = useState("");
  const [editingLoading, setEditingLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete modal states
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const [permanentDeletingItem, setPermanentDeletingItem] = useState<MediaItem | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [deleteAllConfirmInput, setDeleteAllConfirmInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8564";

  // Fetch media depending on active tab
  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const isTrash = activeTab === "trash";
      const res = await fetch(`${API_BASE}/api/upload${isTrash ? "?trash=true" : ""}`);
      if (res.ok) {
        const json = await res.json();
        setMediaList(json.data || []);
        if (json.stats) {
          setStats(json.stats);
        } else {
          setStats((prev) => ({
            ...prev,
            [isTrash ? "trash" : "active"]: (json.data || []).length,
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, activeTab]);

  useEffect(() => {
    // Check if user is logged in as admin
    const hasAdminToken =
      typeof document !== "undefined" &&
      (document.cookie.includes("adminToken=") ||
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token"));

    if (!hasAdminToken) {
      router.replace("/admin/login");
    } else {
      setAuthorized(true);
      fetchMedia();
    }
  }, [router, fetchMedia]);

  // Filter & Search
  const filteredMedia = useMemo(() => {
    if (!searchQuery.trim()) return mediaList;
    const q = searchQuery.toLowerCase();
    return mediaList.filter(
      (item) =>
        item.filename.toLowerCase().includes(q) ||
        (item.originalName && item.originalName.toLowerCase().includes(q))
    );
  }, [mediaList, searchQuery]);

  // Total Storage Size
  const totalSizeBytes = useMemo(() => {
    if (stats.totalSize && stats.totalSize > 0) return stats.totalSize;
    return mediaList.reduce((acc, curr) => acc + (curr.size || 0), 0);
  }, [mediaList, stats.totalSize]);

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Copy URL with instant visual feedback
  const handleCopyLink = (url: string) => {
    const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    showToast(`Copied to clipboard: ${fullUrl}`);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Handle File Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError("");
      if (!customName) {
        const baseName = file.name.substring(0, file.name.lastIndexOf("."));
        setCustomName(baseName);
      }
    }
  };

  // Submit Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError("Please select an image file to upload.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");

      const formData = new FormData();
      formData.append("image", selectedFile);
      if (customName.trim()) {
        formData.append("customName", customName.trim());
      }
      if (allowOverwrite) {
        formData.append("overwrite", "true");
      }

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "FILE_ALREADY_EXISTS") {
          setUploadError(`File "${data.filename}" already exists. Check 'Overwrite existing file' below to replace it.`);
        } else {
          setUploadError(data.message || "Upload failed. Please try again.");
        }
        return;
      }

      showToast(`Image "${data.filename}" uploaded successfully!`);
      setIsUploadOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setCustomName("");
      setAllowOverwrite(false);
      fetchMedia();
    } catch (err: any) {
      setUploadError(err.message || "Network error uploading image.");
    } finally {
      setUploading(false);
    }
  };

  // Submit Edit / Rename
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !newName.trim()) return;

    try {
      setEditingLoading(true);
      setEditError("");

      const res = await fetch(`${API_BASE}/api/upload/${encodeURIComponent(editingItem.filename)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName: newName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEditError(data.message || "Failed to rename image.");
        return;
      }

      showToast(`Renamed image to "${data.data?.filename || newName}"!`);
      setEditingItem(null);
      setNewName("");
      fetchMedia();
    } catch (err: any) {
      setEditError(err.message || "Network error renaming image.");
    } finally {
      setEditingLoading(false);
    }
  };

  // Soft Delete (Move to Trash)
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE}/api/upload/${encodeURIComponent(deletingItem.filename)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(`Image moved to Trash: "${deletingItem.filename}". You can restore it anytime.`);
        setDeletingItem(null);
        fetchMedia();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to move image to trash.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Restore from Trash
  const handleRestore = async (filename: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE}/api/upload/${encodeURIComponent(filename)}/restore`, {
        method: "PUT",
      });
      if (res.ok) {
        showToast(`Restored image "${filename}" back to gallery!`);
        fetchMedia();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to restore image.");
      }
    } catch (err) {
      console.error("Restore error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Permanent Delete
  const handlePermanentDeleteConfirm = async () => {
    if (!permanentDeletingItem) return;
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE}/api/upload/${encodeURIComponent(permanentDeletingItem.filename)}/permanent`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(`Permanently erased "${permanentDeletingItem.filename}" from storage.`);
        setPermanentDeletingItem(null);
        fetchMedia();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to permanently delete image.");
      }
    } catch (err) {
      console.error("Permanent delete error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Delete All
  const handleDeleteAllConfirm = async () => {
    if (deleteAllConfirmInput !== "DELETE ALL") return;
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE}/api/upload/all`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("All images have been deleted.");
        setIsDeleteAllOpen(false);
        setDeleteAllConfirmInput("");
        fetchMedia();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to delete all images.");
      }
    } catch (err) {
      console.error("Delete all error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[120] bg-slate-900 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#00B05F] to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
            <FileImage className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Images &amp; Media Gallery
              </h1>
              <span className="bg-emerald-50 text-[#00B05F] text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Live Server
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Direct storage manager for server-hosted banners, poojas and gallery assets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 bg-[#00B05F] hover:bg-[#008F4C] active:scale-95 text-white font-bold text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-sm shadow-[#00B05F]/25 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Image</span>
          </button>

          {mediaList.length > 0 && activeTab === "active" && (
            <button
              onClick={() => {
                setDeleteAllConfirmInput("");
                setIsDeleteAllOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 active:scale-95 font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete All</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Metrics Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Tab Pills */}
        <div className="flex items-center gap-2 p-1 bg-slate-100/90 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === "active"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
              }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#00B05F]" />
            <span>All Images</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${activeTab === "active" ? "bg-emerald-50 text-[#00B05F]" : "bg-slate-200 text-slate-600"
                }`}
            >
              {stats.active}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("trash")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === "trash"
              ? "bg-white text-rose-600 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
              }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Trash / Soft Deleted</span>
            {stats.trash > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-extrabold bg-rose-50 text-rose-600 border border-rose-200">
                {stats.trash}
              </span>
            )}
          </button>
        </div>

        {/* Quick Metrics & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 lg:max-w-xl justify-end">
          {/* Storage metric */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
            <HardDrive className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Storage:</span>
            <span className="text-xs font-bold text-slate-800">{formatSize(totalSizeBytes)}</span>
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by filename or slug..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B05F]/20 focus:border-[#00B05F]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchMedia}
            aria-label="Refresh media list"
            title="Refresh list"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 active:scale-95 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Trash Tab Banner Notice */}
      {activeTab === "trash" && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Images in <strong>Trash</strong> are hidden from live pages but safely kept in storage. You can <strong>Restore</strong> them back to the active gallery at any time, or permanently delete them.
            </span>
          </div>
          <button
            onClick={() => setActiveTab("active")}
            className="font-bold underline text-amber-800 hover:text-amber-950 shrink-0 cursor-pointer"
          >
            View Active Gallery
          </button>
        </div>
      )}

      {/* Gallery Grid */}
      {loading && mediaList.length === 0 ? (
        <div className="min-h-[350px] flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-200/80">
          <RefreshCw className="w-8 h-8 animate-spin mb-3 text-[#00B05F]" />
          <p className="text-sm font-medium">Loading uploaded images...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="min-h-[350px] bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#00B05F] flex items-center justify-center mb-4">
            {activeTab === "trash" ? <Trash2 className="w-8 h-8 text-slate-400" /> : <UploadCloud className="w-8 h-8" />}
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {searchQuery
              ? "No matching images found"
              : activeTab === "trash"
                ? "Trash is empty"
                : "No images uploaded yet"}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            {searchQuery
              ? `No images match your search query "${searchQuery}". Try a different name.`
              : activeTab === "trash"
                ? "No deleted images in trash. When you delete images from the gallery, they will appear here."
                : "Upload your first image to automatically store it in the server gallery and obtain a public live link."}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="text-sm font-bold text-[#00B05F] hover:underline cursor-pointer"
            >
              Clear Search
            </button>
          ) : activeTab === "trash" ? (
            <button
              onClick={() => setActiveTab("active")}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Back to Gallery
            </button>
          ) : (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-[#00B05F] hover:bg-[#008F4C] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Upload Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredMedia.map((item) => {
            const fullUrl = item.url.startsWith("http") ? item.url : `${API_BASE}${item.url}`;
            const isCopied = copiedUrl === item.url;
            const ext = item.filename.split(".").pop()?.toUpperCase() || "IMG";
            const isBroken = brokenImages[item.filename];

            return (
              <div
                key={item._id || item.filename}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/50 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden relative"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                  {isBroken ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-50 text-slate-400 text-center">
                      <FileImage className="w-8 h-8 mb-1.5 stroke-[1.5] text-slate-300" />
                      <span className="text-[11px] font-semibold text-slate-500 truncate max-w-full px-2">
                        {item.filename}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">Preview not available</span>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fullUrl}
                      alt={item.originalName || item.filename}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={() => {
                        setBrokenImages((prev) => ({ ...prev, [item.filename]: true }));
                      }}
                    />
                  )}

                  {/* Format Badge */}
                  <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {ext}
                  </span>

                  {/* Quick Preview in New Tab */}
                  {!isBroken && (
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open full image in new tab"
                      className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 bg-white/95 hover:bg-white text-slate-800 p-1.5 rounded-lg shadow-md transition-all active:scale-95"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <p
                      className="font-bold text-slate-900 text-sm truncate"
                      title={item.filename}
                    >
                      {item.filename}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {formatSize(item.size)} • {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Saved"}
                    </p>
                  </div>

                  {/* Link Bar with 1-Click Copy */}
                  <button
                    type="button"
                    onClick={() => handleCopyLink(item.url)}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${isCopied
                      ? "bg-emerald-50 border-emerald-300 text-[#00B05F]"
                      : "bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-700"
                      }`}
                  >
                    <span className="truncate max-w-[140px] text-[11px] font-mono text-slate-500">
                      {item.url}
                    </span>
                    <span className="shrink-0 flex items-center gap-1 font-bold">
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#00B05F]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                          <span>Copy</span>
                        </>
                      )}
                    </span>
                  </button>

                  {/* Card Actions Footer: Dynamic for Active vs Trash */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    {activeTab === "active" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(item);
                            setNewName(item.filename.substring(0, item.filename.lastIndexOf(".")) || item.filename);
                            setEditError("");
                          }}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs font-semibold py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingItem(item)}
                          className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 text-xs font-semibold py-1 px-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Move to Trash"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRestore(item.filename)}
                          disabled={actionLoading}
                          className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs font-bold py-1 px-2 rounded-lg transition-colors cursor-pointer"
                          title="Restore back to gallery"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPermanentDeletingItem(item)}
                          className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 text-xs font-semibold py-1 px-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Permanently erase from disk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Purge</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 1. Upload Modal ── */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-slate-100 animate-[fadeIn_0.2s_ease-out]">
            <button
              onClick={() => {
                setIsUploadOpen(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                setUploadError("");
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00B05F] flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Upload Image</h3>
                <p className="text-xs text-slate-500">Supported: .png, .jpg, .jpeg, .webp (Max 3 MB)</p>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${previewUrl
                  ? "border-emerald-400 bg-emerald-50/20"
                  : "border-slate-300 hover:border-[#00B05F] bg-slate-50/50 hover:bg-slate-50"
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {previewUrl ? (
                  <div className="flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Upload Preview"
                      className="max-h-40 rounded-xl object-contain shadow-xs mb-3"
                    />
                    <p className="text-xs font-bold text-slate-700 truncate max-w-xs">
                      {selectedFile?.name} ({formatSize(selectedFile?.size || 0)})
                    </p>
                    <span className="text-[11px] text-[#00B05F] font-bold mt-1 hover:underline">
                      Click to choose another image
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-4">
                    <UploadCloud className="w-10 h-10 text-slate-400 mb-2 stroke-[1.5]" />
                    <p className="text-sm font-bold text-slate-700">Click to browse or drop an image here</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 3MB</p>
                  </div>
                )}
              </div>

              {/* Custom Filename */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Custom Image Slug / Name (Optional)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. maha-ganapathi-homa"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B05F]/20 focus:border-[#00B05F]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Will be formatted as a safe clean URL slug (e.g. <code>/api/images/my-image.png</code>)
                </p>
              </div>

              {/* Overwrite Toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={allowOverwrite}
                  onChange={(e) => setAllowOverwrite(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00B05F] focus:ring-[#00B05F]"
                />
                <span className="text-xs font-medium text-slate-700">
                  Overwrite file if an image with the same name already exists
                </span>
              </label>

              {/* Error Box */}
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="inline-flex items-center gap-2 bg-[#00B05F] hover:bg-[#008F4C] active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md shadow-[#00B05F]/20 transition-all cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Upload &amp; Generate Link</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 2. Edit / Rename Modal ── */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit / Rename Image</h3>
                <p className="text-xs text-slate-500">Current: {editingItem.filename}</p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Filename (Without Extension)
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. shani-shanti-puja"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Extension <code>.{editingItem.filename.split(".").pop()}</code> will be automatically preserved.
                </p>
              </div>

              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editingLoading || !newName.trim()}
                  className="inline-flex items-center gap-2 bg-[#00B05F] hover:bg-[#008F4C] active:scale-95 disabled:opacity-50 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  {editingLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 3. Soft Delete Confirmation Modal ── */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <ArchiveRestore className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Move to Trash?</h3>
            <p className="text-xs text-slate-500 mb-4 px-2 leading-relaxed">
              Image <strong className="text-slate-800 break-all">{deletingItem.filename}</strong> will be moved to the Trash. The physical file will <strong>not</strong> be deleted and you can restore it anytime.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
              >
                {actionLoading ? "Moving..." : "Move to Trash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Permanent Delete Modal ── */}
      {permanentDeletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Permanently Delete File?</h3>
            <p className="text-xs text-slate-500 mb-4 px-2 leading-relaxed">
              Are you sure you want to permanently erase <strong className="text-slate-800 break-all">{permanentDeletingItem.filename}</strong> from disk storage? This cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPermanentDeletingItem(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePermanentDeleteConfirm}
                disabled={actionLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
              >
                {actionLoading ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Delete All Confirmation Modal ── */}
      {isDeleteAllOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-slate-100 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Delete All Images?</h3>
            <p className="text-xs text-slate-500 mb-4 px-4 leading-relaxed">
              This will <strong>permanently delete all {mediaList.length} image files</strong> from server storage. Any pages referencing these URLs might display broken images.
            </p>

            <div className="mb-4 text-left">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 text-center">
                Type <span className="text-rose-600 font-black">DELETE ALL</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteAllConfirmInput}
                onChange={(e) => setDeleteAllConfirmInput(e.target.value)}
                placeholder="DELETE ALL"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center text-sm font-bold tracking-wider text-rose-600 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteAllOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAllConfirm}
                disabled={deleteAllConfirmInput !== "DELETE ALL" || actionLoading}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
              >
                {actionLoading ? "Deleting All..." : "Permanently Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
