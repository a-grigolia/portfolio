import "./globals.css";
import { ThemeProvider } from "./theme-provider";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Avto — Founding Designer",
  description:
    "Founding designer who codes. I build 0→1 products end to end.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
