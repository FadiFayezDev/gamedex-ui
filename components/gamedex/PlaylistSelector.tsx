"use client";

import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, Plus, Trash2, Check, X, Loader2 } from "lucide-react";
import {
  PlaylistSummary,
  listPlaylists,
  createPlaylist,
  deletePlaylist,
} from "@/lib/services/playlist";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

type Props = {
  selectedPlaylistId: string | null;
  onSelect: (id: string | null) => void;
};

export function PlaylistSelector({ selectedPlaylistId, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const fetchPlaylists = async () => {
    try {
      const data = await listPlaylists();
      setPlaylists(data);
    } catch (error) {
      console.error("Failed to load playlists", error);
    }
  };

  // Fetch on mount and whenever dropdown opens
  useEffect(() => {
    fetchPlaylists();
  }, [isOpen]);

  // Listen for external playlist updates (e.g., game added from GameCard)
  useEffect(() => {
    const handler = () => fetchPlaylists();
    window.addEventListener("playlist-updated", handler);
    return () => window.removeEventListener("playlist-updated", handler);
  }, []);

  // Focus name input when form opens
  useEffect(() => {
    if (showCreateForm) {
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [showCreateForm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCreateForm(false);
        setNewName("");
        setNewDescription("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsSaving(true);
    try {
      await createPlaylist({
        name: newName.trim(),
        description: newDescription.trim() || undefined,
      });
      setNewName("");
      setNewDescription("");
      setShowCreateForm(false);
      await fetchPlaylists();
    } catch (error) {
      console.error("Failed to create playlist", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setConfirmDelete({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      await deletePlaylist(confirmDelete.id);
      if (selectedPlaylistId === confirmDelete.id) onSelect(null);
      await fetchPlaylists();
    } catch (error) {
      console.error("Failed to delete playlist", error);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(null);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setNewName("");
    setNewDescription("");
  };

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);
  const title = selectedPlaylist?.name ?? "All Games";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800/50"
      >
        {title}
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-60 rounded-xl border border-zinc-800 bg-[#161b22] py-1.5 shadow-2xl">
          {/* All Games */}
          <button
            onClick={() => { onSelect(null); setIsOpen(false); }}
            className={`w-full px-3 py-2 text-left text-sm transition-colors ${
              selectedPlaylistId === null
                ? "bg-zinc-700/40 text-white"
                : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
            }`}
          >
            All Games
          </button>

          {playlists.length > 0 && <div className="my-1 h-px bg-zinc-800/60" />}

          {/* Playlist list */}
          <div className="max-h-52 overflow-y-auto">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className={`group flex items-center justify-between px-3 py-2 transition-colors ${
                  selectedPlaylistId === playlist.id
                    ? "bg-zinc-700/40 text-white"
                    : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                }`}
              >
                <button
                  className="min-w-0 flex-1 truncate text-left text-sm"
                  onClick={() => { onSelect(playlist.id!); setIsOpen(false); }}
                >
                  {playlist.name}
                  {playlist.gameCount != null && (
                    <span className="ml-2 text-[10px] text-zinc-500">
                      {playlist.gameCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={(e) => handleDeleteClick(e, playlist.id!, playlist.name!)}
                  className="ml-2 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                  title="Delete playlist"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="my-1 h-px bg-zinc-800/60" />

          {/* Inline Create Form */}
          {showCreateForm ? (
            <div className="flex flex-col gap-1.5 px-3 py-2">
              <input
                ref={nameInputRef}
                type="text"
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                placeholder="Playlist name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") handleCancel();
                }}
              />
              <input
                type="text"
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                placeholder="Description (optional)..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") handleCancel();
                }}
              />
              <div className="flex gap-3 pt-0.5">
                <button
                  onClick={handleCreate}
                  disabled={isSaving || !newName.trim()}
                  className="flex items-center gap-1 text-[10px] text-emerald-400 transition-colors hover:text-emerald-300 disabled:opacity-40"
                >
                  {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 text-[10px] text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  <X className="h-3 w-3" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-800/60 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              New playlist
            </button>
          )}
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={!!confirmDelete}
        danger
        title="Delete Playlist"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
