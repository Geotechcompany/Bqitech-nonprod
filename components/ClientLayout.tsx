"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import { usePathname } from 'next/navigation';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  
  // Exclude header/footer from auth pages and ALL admin pages
  const isAuthPage = ['/login', '/sign-up', '/forgot-password', '/auth/verify-email'].some(path => pathname?.startsWith(path));
  const isAdminPage = pathname?.startsWith('/admin');
  const shouldHideHeaderFooter = isAuthPage || isAdminPage;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {shouldHideHeaderFooter ? null : <Header />}
          <main className="flex-grow">{children}</main>
          {shouldHideHeaderFooter ? null : <Footer />}
        </>
      )}
    </div>
  );
}
