"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight, X, Maximize2, Minimize2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

type ImageGalleryModalProps = {
  images: string[]
  initialIndex: number
  onClose: () => void
}

export function ImageGalleryModal({
  images,
  initialIndex,
  onClose,
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [mounted, setMounted] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    setMounted(true)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") handlePrevious()
      if (e.key === "ArrowRight") handleNext()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  useEffect(() => {
    // Scroll active thumbnail into view
    const activeThumb = thumbnailRefs.current[currentIndex]
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      })
    }
  }, [currentIndex])

  const handlePrevious = () => {
    setIsZoomed(false)
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNext = () => {
    setIsZoomed(false)
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  if (!mounted) return null

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex flex-col bg-black/95 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 z-10">
        <div className="flex items-center gap-4">
           <span className="text-xs font-medium tracking-widest text-zinc-400 uppercase">
             Media Gallery — {currentIndex + 1} / {images.length}
           </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsZoomed(!isZoomed)
            }}
            className="rounded-full bg-white/5 p-2 text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
          >
            {isZoomed ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-white/5 p-2 text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 0.9, x: 100 }}
            animate={{ 
              opacity: 1, 
              scale: isZoomed ? 1.25 : 1, 
              x: 0 
            }}
            exit={{ opacity: 0, scale: 1.1, x: -100 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 26,
            }}
            className={`max-h-[82vh] max-w-[92vw] object-contain shadow-2xl transition-transform duration-500 will-change-transform ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            onClick={(e) => {
              e.stopPropagation()
              setIsZoomed(!isZoomed)
            }}
          />
        </AnimatePresence>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePrevious()
              }}
              className="absolute left-6 rounded-full bg-black/50 p-5 text-white backdrop-blur-md border border-white/5 transition-all hover:bg-black/80 hover:scale-110 active:scale-90"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              className="absolute right-6 rounded-full bg-black/50 p-5 text-white backdrop-blur-md border border-white/5 transition-all hover:bg-black/80 hover:scale-110 active:scale-90"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Strip */}
      <div className="scrollbar-none flex h-28 shrink-0 items-center justify-start gap-3 overflow-x-auto px-8 py-4 bg-black/60 backdrop-blur-xl border-t border-white/5">
        <div className="flex mx-auto items-center gap-3">
          {images.map((img, idx) => (
            <button
              key={idx}
              ref={(el) => { thumbnailRefs.current[idx] = el }}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(idx)
              }}
              className={`relative h-full aspect-video overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                idx === currentIndex 
                  ? 'border-sky-500 ring-4 ring-sky-500/20 scale-105 opacity-100 shadow-lg shadow-sky-500/20' 
                  : 'border-transparent opacity-40 hover:opacity-80 hover:scale-102'
              }`}
            >
              <img src={img} className="h-full w-full object-cover" alt="" />
              {idx === currentIndex && (
                <div className="absolute inset-0 bg-sky-500/10 pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      </div>
    </motion.div>,
    document.body
  )
}

