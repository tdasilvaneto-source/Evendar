import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="container">
          <h1>DoubleTree Brussels City — Event Intelligence</h1>
          <nav>
            <Link href="/">Dashboard</Link>
            <Link href="/shortlist">Shortlist</Link>
            <a href="/api/export/csv">Export CSV</a>
            <a href="/api/export/xlsx">Export XLSX</a>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
