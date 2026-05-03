"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { BookmarkPlus, Check, Loader2, BookmarkCheck } from "lucide-react";
import {
  listPlaylists,
  getPlaylist,
  addGameToPlaylist,
  removeGameFromPlaylist,
  PlaylistSummary,
} from "@/lib/services/playlist";

type Props = {
  gameId: string;
};

export function AddToPlaylistButton({ gameId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [linkedIds, setLinkedIds] = useState<Set<string>>(new Set()); // playlists that already contain this game
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // When dropdown opens or component mounts: (1) fetch playlists, (2) check which ones contain this game
  const loadData = async () => {
    // Only set loading if not already loaded or if opening dropdown
    setIsLoading(true);
    try {
      const summaries = await listPlaylists();
      setPlaylists(summaries);

      // Check membership concurrently
      const results = await Promise.allSettled(
        summaries.map((p) => getPlaylist(p.id!))
      );

      const alreadyIn = new Set<string>();
      results.forEach((result, i) => {
        if (result.status === "fulfilled") {
          const games = (result.value.games ?? []) as Array<{ id?: string }>;
          if (games.some((g) => g?.id === gameId)) {
            alreadyIn.add(summaries[i].id!);
          }
        }
      });
      setLinkedIds(alreadyIn);
    } catch (err) {
      console.error("Failed to load playlist data", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial state on mount
  useEffect(() => {
    loadData();
  }, [gameId]);

  const openDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    
    // Check if dropdown would go off screen
    const dropdownWidth = 224; // w-56
    let left = rect.left;
    if (left + dropdownWidth > window.innerWidth - 16) {
      left = rect.right - dropdownWidth;
    }
    
    setDropdownPos({ top: rect.top, left });
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = async (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation();
    if (adding) return;
    
    const isAlready = linkedIds.has(playlistId);
    setAdding(playlistId);
    
    try {
      if (isAlready) {
        await removeGameFromPlaylist(playlistId, gameId);
        setLinkedIds((prev) => {
          const next = new Set(prev);
          next.delete(playlistId);
          return next;
        });
      } else {
        await addGameToPlaylist(playlistId, gameId);
        setLinkedIds((prev) => new Set([...prev, playlistId]));
        setAdded(playlistId);
        setTimeout(() => setAdded(null), 800);
      }
      
      // Notify PlaylistSelector to update counts
      window.dispatchEvent(new Event("playlist-updated"));
    } catch (err) {
      console.error("Failed to toggle game in playlist", err);
    } finally {
      setAdding(null);
    }
  };

  // Is the game in any playlist at all?
  const isInAnyPlaylist = linkedIds.size > 0;

  const dropdown = isOpen
    ? ReactDOM.createPortal(
        <div
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            top: dropdownPos.top,
            left: dropdownPos.left,
            transform: "translateY(-100%) translateY(-8px)",
            zIndex: 9999,
          }}
          className="w-56 rounded-xl border border-zinc-800 bg-[#161b22] py-1.5 shadow-2xl"
        >
          <p className="px-3 pb-1.5 pt-1 text-[9px] font-bold tracking-widest text-zinc-600 uppercase">
            Add to Playlist
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
            </div>
          ) : playlists.length === 0 ? (
            <p className="px-3 py-2 text-xs italic text-zinc-600">No playlists yet</p>
          ) : (
            <div className="max-h-52 overflow-y-auto">
              {playlists.map((playlist) => {
                const isAdding = adding === playlist.id;
                const isJustAdded = added === playlist.id;
                const isAlready = linkedIds.has(playlist.id!);

                return (
                  <button
                    key={playlist.id}
                    onClick={(e) => handleToggle(e, playlist.id!)}
                    disabled={!!adding}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                      isAlready
                        ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                        : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                    }`}
                  >
                    <span className="truncate">{playlist.name}</span>

                    <span className="ml-2 shrink-0">
                      {isAdding ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500" />
                      ) : isJustAdded || isAlready ? (
                        <Check className={`h-3.5 w-3.5 ${isJustAdded ? "text-emerald-400" : "text-zinc-600"}`} />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>,
        document.body
      )
    : null;

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <button
        ref={btnRef}
        onClick={openDropdown}
        title="Add to playlist"
        className={`flex h-7 w-7 items-center justify-center rounded-md backdrop-blur-sm transition-all ${
          isInAnyPlaylist
            ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
            : "bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        }`}
      >
        {isInAnyPlaylist ? (
          <BookmarkCheck className="h-3.5 w-3.5" />
        ) : (
          <BookmarkPlus className="h-3.5 w-3.5" />
        )}
      </button>

      {dropdown}
    </div>
  );
}
