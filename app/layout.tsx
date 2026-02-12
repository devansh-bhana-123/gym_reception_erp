import type { Metadata } from "next";
import { Poppins, Montserrat, Raleway } from "next/font/google";
import "./globals.css";

// Font Configuration
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-montserrat",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  title: "Iconic Gym | Reception Portal",
  description: "Enterprise Resource Planning for Reception",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${montserrat.variable} ${raleway.variable}`}>
        {children}
      </body>
    </html>
  );
}