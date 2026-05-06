// "use client";

// import { useEffect } from "react";

// export function TauriWindowReady() {
//   useEffect(() => {
//     // Disable right-click context menu
//     const handleContextMenu = (e: MouseEvent) => {
//       e.preventDefault();
//     };

//     // Disable dragging images and links
//     const handleDragStart = (e: DragEvent) => {
//       if ((e.target as HTMLElement).tagName === "IMG" || (e.target as HTMLElement).tagName === "A") {
//         e.preventDefault();
//       }
//     };

//     // Disable zooming with keyboard shortcuts
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=" || e.key === "-" || e.key === "_" || e.key === "0")) {
//         e.preventDefault();
//       }
//     };

//     document.addEventListener("contextmenu", handleContextMenu);
//     document.addEventListener("dragstart", handleDragStart);
//     document.addEventListener("keydown", handleKeyDown);

//     const init = async () => {
//       if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
//         try {
//           const { getCurrentWindow } = await import("@tauri-apps/api/window");
//           const appWindow = getCurrentWindow();
          
//           // Small delay to ensure rendering is stable and fonts are loaded
//           setTimeout(async () => {
//              await appWindow.show();
//              await appWindow.setFocus();
//           }, 150);
//         } catch (e) {
//           console.error("Failed to show Tauri window:", e);
//         }
//       }
//     };
//     init();

//     return () => {
//       document.removeEventListener("contextmenu", handleContextMenu);
//       document.removeEventListener("dragstart", handleDragStart);
//       document.removeEventListener("keydown", handleKeyDown);
//     };

//   }, []);

//   return null;
// }

