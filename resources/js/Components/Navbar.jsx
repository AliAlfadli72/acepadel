import { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { resolveAsset } from "../utils";

export default function Navbar({ lang, setLang }) {
  const { url, logo_url, icon_url } = usePage().props;
  const isArabic   = lang === "ar";
  const [scrolled,  setScrolled]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [url]);

  const links = [
    { routeName: "home",        label: { ar: "الرئيسية",  en: "Home"    } },
    { routeName: "services",    label: { ar: "الخدمات",   en: "Services"} },
    { routeName: "events",      label: { ar: "الفعاليات", en: "Events"  } },
    { routeName: "players.index", label: { ar: "اللاعبين",  en: "Players" } },
    { routeName: "pilates.booking.page", label: { ar: "بيلاتس",   en: "Pilates"  } },
    { routeName: "contact",     label: { ar: "تواصل",    en: "Contact" } },
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

          <Link href={route('home')} className="flex items-center gap-3 group shrink-0">
            {route().current('pilates.booking.page') ? (
              <img src={resolveAsset('/pilates-logo.png')} alt="The Reformer Room" className="h-14 w-auto object-contain group-hover:scale-105 transition-transform" />
            ) : (
              <img src={logo_url || resolveAsset('/logo.png')} alt="Ace Padel" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
            )}
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-8">
            {links.map((link) => {
              const isActive = route().current(link.routeName) || (link.routeName === 'events' && route().current('events.*')) || (link.routeName === 'players.index' && route().current('players.*'));
              return (
                <Link
                  key={link.routeName}
                  href={route(link.routeName)}
                  className={`relative text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
                    isActive 
                      ? (route().current('pilates.booking.page') ? "text-[#393D40]" : "text-primary") 
                      : (route().current('pilates.booking.page') ? "text-gray-400 hover:text-[#393D40]" : "text-gray-500 hover:text-primary")
                  } ${isArabic ? "font-arabic text-sm tracking-normal" : ""}`}
                >
                  {isArabic ? link.label.ar : link.label.en}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className={`absolute -bottom-[2px] left-0 right-0 h-[2px] rounded-full ${
                        route().current('pilates.booking.page') ? "bg-[#393D40]" : "bg-accent"
                      }`}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">


            {/* Auth Link */}
            {usePage().props.auth?.user ? (
              <Link
                href={route('dashboard')}
                className="hidden md:flex items-center gap-2 text-xs font-semibold text-primary bg-emerald-50 border border-gray-200 px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
              >
                <Icon icon="mdi:account" className="w-4 h-4" />
                <span>{usePage().props.auth.user.name}</span>
              </Link>
            ) : (
              <Link
                href={route('login')}
                className="hidden md:flex items-center gap-2 text-xs font-semibold text-primary bg-emerald-50 border border-gray-200 px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
              >
                <Icon icon="mdi:login" className="w-4 h-4" />
                <span>{isArabic ? "تسجيل الدخول" : "Login"}</span>
              </Link>
            )}

            {/* Language toggle */}
            <button
              onClick={() => setLang(isArabic ? "en" : "ar")}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-[10px] font-black text-gray-500 hover:border-primary hover:text-primary transition-all"
            >
              {isArabic ? "EN" : "AR"}
            </button>

            {/* Book CTA */}
            <Link
              href={route('booking.guest')}
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
                const isActive = route().current(link.routeName) || (link.routeName === 'events' && route().current('events.*')) || (link.routeName === 'players.index' && route().current('players.*'));
                return (
                  <Link
                    key={link.routeName}
                    href={route(link.routeName)}
                    className={`text-sm font-semibold py-2 border-b border-gray-100 flex items-center justify-between ${
                      isActive ? "text-primary" : "text-gray-600"
                    } ${isArabic ? "font-arabic" : ""}`}
                  >
                    {isArabic ? link.label.ar : link.label.en}
                    {isActive && <Icon icon="mdi:chevron-right" className="w-4 h-4 text-accent" />}
                  </Link>
                );
              })}
              <Link href={route('booking.guest')} className="btn-primary text-center justify-center mt-2">
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