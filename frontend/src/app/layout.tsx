import Script from "next/script";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  return (
    <html>
      <body>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`}
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
