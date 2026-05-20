import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth/context"
import { QueryProvider } from "@/lib/api/query-provider"
import { I18nProvider } from "@/lib/i18n/context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Task Management",
  description: "Ứng dụng quản lý công việc theo dự án",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <I18nProvider>
            <AuthProvider>
              <QueryProvider>{children}</QueryProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

