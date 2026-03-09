import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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