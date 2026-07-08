"use client";

import { X, Folder, File, Search, Plus, Download, RefreshCw, Eye } from "lucide-react";
import { useEffect, useState } from "react";

interface DocItem {
  _id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  folder: string;
  url: string;
  createdAt: string;
}

interface DocumentsModalProps {
  onClose: () => void;
}

export default function DocumentsModal({ onClose }: DocumentsModalProps) {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState("All");

  // New file upload state
  const [newTitle, setNewTitle] = useState("");
  const [newFolder, setNewFolder] = useState("General");
  const [uploading, setUploading] = useState(false);

  function loadDocs() {
    setLoading(true);
    fetch("/api/documents")
      .then((r) => r.json())
      .then((d) => setDocs(d.documents ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDocs();
  }, []);

  async function handleAddDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setUploading(true);
    const mockFileMap: Record<string, string> = {
      General: "general_report.pdf",
      Contracts: "partnership_agreement.pdf",
      Briefs: "brand_campaign_brief.pdf",
      Invoices: "invoice_invoice.csv",
    };
    const fileName = mockFileMap[newFolder] ?? "document.pdf";

    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        fileName,
        fileType: fileName.endsWith("pdf") ? "pdf" : "csv",
        url: `/uploads/${fileName}`,
        fileSize: 1024 + Math.round(Math.random() * 5000),
        folder: newFolder,
      }),
    });

    setUploading(false);
    if (res.ok) {
      setNewTitle("");
      loadDocs();
    }
  }

  const folders = ["All", "General", "Contracts", "Briefs", "Invoices"];

  const filtered = docs.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = activeFolder === "All" || d.folder === activeFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bb-glass w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h3 className="bb-display text-base font-semibold text-white flex items-center gap-2">
            <Folder size={18} className="text-purple-400" />
            Document Storage Center
          </h3>
          <button onClick={onClose} className="text-white/60 hover:text-white cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Console control toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 border-b border-white/5 bg-white/2 p-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-2.5 text-white/40" />
            <input
              className="bb-input w-full rounded-xl pl-8 pr-3 py-1.5 text-xs"
              placeholder="Search files by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <form onSubmit={handleAddDoc} className="flex gap-2 w-full sm:w-auto">
            <input
              className="bb-input rounded-xl px-3 py-1.5 text-xs flex-1 sm:w-40"
              placeholder="New File Name"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <select
              className="bb-input rounded-xl px-2 py-1.5 text-xs"
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
            >
              <option value="General">General</option>
              <option value="Contracts">Contracts</option>
              <option value="Briefs">Briefs</option>
              <option value="Invoices">Invoices</option>
            </select>
            <button
              type="submit"
              disabled={uploading}
              className="bb-btn-primary flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-semibold cursor-pointer disabled:opacity-40"
            >
              <Plus size={12} /> Upload
            </button>
          </form>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-40 border-r border-white/5 bg-black/10 overflow-y-auto p-4 space-y-1">
            <span className="block text-[10px] text-white/40 font-bold uppercase mb-2">Folders</span>
            {folders.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFolder(f)}
                className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer transition flex items-center gap-1.5 ${
                  activeFolder === f ? "bg-purple-500/20 text-purple-200" : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Folder size={12} className={activeFolder === f ? "text-purple-400" : "text-white/35"} />
                {f}
              </button>
            ))}
          </div>

          {/* Documents list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {loading ? (
              <p className="text-xs text-white/45">Loading document list...</p>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-white/45 py-10 text-center">No documents in this folder.</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between bg-white/3 border border-white/5 rounded-xl p-3.5 hover:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <File size={16} className="text-purple-400" />
                      <div>
                        <h4 className="text-xs font-semibold text-white/90">{doc.title}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-white/40 mt-1">
                          <span className="capitalize">{doc.fileType}</span>
                          <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => alert(`Previewing mock document url: ${doc.url}`)}
                        className="p-1.5 rounded-lg bg-white/3 hover:bg-white/5 text-white/60 hover:text-white cursor-pointer"
                        title="Preview"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => {
                          const csvContent = "mock file data";
                          const blob = new Blob([csvContent], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = doc.fileName;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="p-1.5 rounded-lg bg-white/3 hover:bg-white/5 text-white/60 hover:text-white cursor-pointer"
                        title="Download"
                      >
                        <Download size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
