import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

export default function Navbar({ lang, setLang }) {
  const location   = useLocation();
  const isArabic   = lang === "ar";
  const [scrolled,  setScrolled]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  const links = [
    { path: "/",        label: { ar: "الرئيسية",  en: "Home"    } },
    { path: "/services",label: { ar: "الخدمات",   en: "Services"} },
    { path: "/booking", label: { ar: "الحجز",     en: "Booking" } },
    { path: "/events",  label: { ar: "الفعاليات", en: "Events"  } },
    { path: "/blog",    label: { ar: "المدونة",  en: "Blog"    } },
    { path: "/contact", label: { ar: "تواصل",    en: "Contact" } },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-[100] transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-[0_2px_20px_rgba(15,26,19,0.08)] border-b border-gray-200"
            : "bg-white border-b border-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-[72px] flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-green-glow group-hover:scale-105 transition-transform">
              <span className="text-accent font-display font-black text-sm leading-none">A</span>
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className={`font-display font-black text-xl tracking-tight text-primary ${isArabic ? "font-arabic" : ""}`}>
                {isArabic ? "آيس بادل" : "ACE PADEL"}
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-gray-500">Club</span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-8">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-xs font-semibold uppercase tracking-[0.12em] transition-colors hover-underline ${
                    isActive ? "text-primary" : "text-gray-500 hover:text-primary"
                  } ${isArabic ? "font-arabic text-sm tracking-normal" : ""}`}
                >
                  {isArabic ? link.label.ar : link.label.en}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-accent rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">

            {/* Phone shortcut */}
            <a
              href="tel:0945000365"
              className="hidden md:flex items-center gap-2 text-xs font-mono text-primary bg-emerald-50 border border-gray-200 px-3 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
              dir="ltr"
            >
              <Icon icon="mdi:phone" className="w-3.5 h-3.5" />
              <span>0945 000 365</span>
            </a>

            {/* Language toggle */}
            <button
              onClick={() => setLang(isArabic ? "en" : "ar")}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-[10px] font-black text-gray-500 hover:border-primary hover:text-primary transition-all"
            >
              {isArabic ? "EN" : "AR"}
            </button>

            {/* Book CTA */}
            <Link
              to="/booking"
              className="hidden sm:flex btn-accent text-xs py-2.5 px-5"
            >
              <Icon icon="mdi:calendar-check" className="w-4 h-4" />
              {isArabic ? "احجز الآن" : "Book Now"}
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-all"
              aria-label="Toggle menu"
            >
              <Icon icon={mobileOpen ? "mdi:close" : "mdi:menu"} className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[72px] left-0 right-0 z-[99] bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-card-hover lg:hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-4">
              {links.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-semibold py-2 border-b border-gray-100 flex items-center justify-between ${
                      isActive ? "text-primary" : "text-gray-600"
                    } ${isArabic ? "font-arabic" : ""}`}
                  >
                    {isArabic ? link.label.ar : link.label.en}
                    {isActive && <Icon icon="mdi:chevron-right" className="w-4 h-4 text-accent" />}
                  </Link>
                );
              })}
              <Link to="/booking" className="btn-primary text-center justify-center mt-2">
                <Icon icon="mdi:calendar-check" className="w-4 h-4" />
                {isArabic ? "احجز الآن" : "Book Your Court"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}