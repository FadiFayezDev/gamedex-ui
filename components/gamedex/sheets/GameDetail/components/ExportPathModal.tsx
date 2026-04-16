"use client";

import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FolderIcon, Loader2, X } from "lucide-react";

type ExportPathModalProps = {
  open: boolean;
  onConfirm: (path: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export function ExportPathModal({
  open,
  onConfirm,
  onCancel,
  isLoading = false,
}: ExportPathModalProps) {
  const [path, setPath] = useState("C:\\Users\\fadyf\\Desktop");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onCancel]);

  if (!open || !mounted) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-auto"
    >
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onCancel}
      />

      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-[#111318] p-6 shadow-2xl transition-all animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <FolderIcon className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-white">Export Location</h3>
          </div>
          <button
            onClick={onCancel}
            className="rounded-full p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 text-xs text-zinc-500 leading-relaxed">
          Please specify the directory path where you want to save the game package file. 
          The backend will save it directly to this location.
        </p>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Destination Path
          </label>
          <input
            autoFocus
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
            placeholder="C:\Paths\To\Export"
          />
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(path)}
            disabled={isLoading || !path.trim()}
            className="flex items-center gap-2 rounded-lg bg-zinc-100 px-6 py-2 text-sm font-bold text-zinc-950 transition-all hover:bg-white active:scale-95 disabled:opacity-50"
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isLoading ? "Exporting..." : "Start Export"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
