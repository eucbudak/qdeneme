"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Mobil + tablet için aşağı kaydırınca alttan beliren ön kayıt butonu.
 * Hero görünür durumdayken gizlenir, sayfanın aşağısına inince görünür olur.
 */
export function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onScroll() {
      // Hero ~60vh yüksekliğinde; o noktayı geçince göster.
      setShow(window.scrollY > Math.min(window.innerHeight * 0.6, 480));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 shadow-lg backdrop-blur transition-all duration-300 lg:hidden ${
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0"
      }`}
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
      }}
    >
      <Link
        href="#basvuru"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md transition-transform active:scale-[0.98]"
      >
        Hemen ön kayıt yap
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
