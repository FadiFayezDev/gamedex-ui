import { Geist, Geist_Mono, Merriweather } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { SettingsProvider } from "@/components/contexts/SettingsContext"
import { ToastProvider } from "@/components/contexts/ToastContext"

const merriweather = Merriweather({subsets:['latin'],variable:'--font-serif'});

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        fontMono.variable,
        merriweather.variable,
        "font-sans"
      )}
    >
      <body>
        <ThemeProvider>
          <SettingsProvider>
            <ToastProvider>{children}</ToastProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
