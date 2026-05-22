import { Link, usePage } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

export default function Footer({ lang }) {
  const { logo_url, icon_url } = usePage().props;
  const isArabic = lang === "ar";

  const links = [
    { routeName: "home",        label: { ar: "الرئيسية",   en: "Home"    } },
    { routeName: "services",    label: { ar: "الخدمات",    en: "Services"} },
    { routeName: "booking.guest", label: { ar: "حجز الملاعب",en: "Booking" } },
    { routeName: "events",      label: { ar: "الفعاليات",  en: "Events"  } },
    { routeName: "about",       label: { ar: "من نحن",    en: "About Us"  } },
    { routeName: "contact",     label: { ar: "تواصل",     en: "Contact" } },
  ];

  return (
    <footer className="bg-primary text-white mt-0">

      {/* Top CTA Band */}
      <div className="bg-accent py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className={`text-primary font-display font-black text-3xl md:text-4xl ${isArabic ? "font-arabic" : ""}`}>
              {isArabic ? "جاهز للعب؟" : "Ready to Play?"}
            </p>
            <p className={`text-gray-800 font-bold text-sm mt-2 ${isArabic ? "font-arabic" : ""}`}>
              {isArabic ? "احجز ملعبك اليوم واكتشف تجربة البادل الحقيقية" : "Book your court today and experience world-class padel"}
            </p>
          </div>
          <Link
            href={route('booking.guest')}
            className="shrink-0 bg-primary text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg"
          >
            <Icon icon="mdi:calendar-check" className="w-5 h-5" />
            {isArabic ? "احجز الآن" : "Book Now"}
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* Brand */}
        <div className="space-y-5 lg:col-span-2">
          <Link href={route('home')} className="flex items-center gap-3 group">
            <img
              src={logo_url || "/logo.png"}
              alt="Ace Padel"
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform brightness-0 invert"
            />
          </Link>
          <p className={`text-white/60 text-sm leading-relaxed max-w-xs ${isArabic ? "font-arabic" : ""}`}>
            {isArabic
              ? "الوجهة الرياضية الأولى في دمشق. نجمع بين التميز الرياضي ومعايير الاتحاد الدولي للبادل في تجربة متكاملة لا مثيل لها."
              : "Damascus' premier sports destination combining athletic excellence with International Padel Federation standards."}
          </p>
          <p className={`text-accent font-bold text-xs uppercase tracking-widest ${isArabic ? "font-arabic" : ""}`}>
            {isArabic ? "حيث يلتقي الشغف بالاحتراف" : "Where Passion Meets Professionalism"}
          </p>
          {/* Socials */}
          <div className="flex gap-3 pt-2">
            {[
              { icon: "mdi:instagram", href: "#" },
              { icon: "mdi:facebook",  href: "#" },
              { icon: "mdi:youtube",   href: "#" },
              { icon: "mdi:twitter",   href: "#" },
            ].map(({ icon, href }) => (
              <a
                key={icon}
                href={href}
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:bg-accent hover:text-primary hover:border-accent transition-all"
              >
                <Icon icon={icon} className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className={`text-white font-bold text-xs uppercase tracking-widest mb-6 flex items-center gap-2 ${isArabic ? "font-arabic" : ""}`}>
            <span className="w-4 h-[2px] bg-accent rounded-full"></span>
            {isArabic ? "تصفح الأكاديمية" : "Explore"}
          </h3>
          <ul className="space-y-3">
            {links.map((link) => (
              <li key={link.routeName}>
                <Link
                  href={route(link.routeName)}
                  className={`text-white/60 text-sm hover:text-accent transition-colors flex items-center gap-2 ${isArabic ? "font-arabic" : ""}`}
                >
                  <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5 text-accent/50" />
                  {isArabic ? link.label.ar : link.label.en}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className={`text-white font-bold text-xs uppercase tracking-widest mb-6 flex items-center gap-2 ${isArabic ? "font-arabic" : ""}`}>
            <span className="w-4 h-[2px] bg-accent rounded-full"></span>
            {isArabic ? "اتصل بنا" : "Contact"}
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Icon icon="mdi:phone" className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <div>
                <p className={`text-[10px] text-white/40 uppercase mb-0.5 ${isArabic ? "font-arabic" : ""}`}>{isArabic ? "الخط الساخن" : "Hotline"}</p>
                <a href="tel:0945000365" className="text-white font-mono text-sm hover:text-accent transition-colors" dir="ltr">0945 000 365</a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Icon icon="mdi:map-marker" className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <div>
                <p className={`text-[10px] text-white/40 uppercase mb-0.5 ${isArabic ? "font-arabic" : ""}`}>{isArabic ? "الموقع" : "Location"}</p>
                <p className={`text-white/70 text-sm ${isArabic ? "font-arabic" : ""}`}>
                  {isArabic ? "دمشق - أوتوستراد الفيحاء" : "Damascus, AlFayha Highway"}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Icon icon="mdi:clock-outline" className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <div>
                <p className={`text-[10px] text-white/40 uppercase mb-0.5 ${isArabic ? "font-arabic" : ""}`}>{isArabic ? "ساعات العمل" : "Hours"}</p>
                <p className={`text-white/70 text-sm ${isArabic ? "font-arabic" : ""}`}>
                  {isArabic ? "يومياً 7 ص – 2 ص" : "Daily 7 AM – 2 AM"}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className={`text-white/30 text-[11px] font-mono uppercase tracking-widest ${isArabic ? "font-arabic" : ""}`}>
              © 2026 ACE PADEL ACADEMY — ALL RIGHTS RESERVED
            </p>
            <p className={`text-white/30 text-[10px] tracking-widest ${isArabic ? "font-arabic" : ""}`}>
              {isArabic ? "من تطوير " : "Developed by "}
              <a href="https://nuwasoftware.com/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors font-bold text-white/50">
                Nuwa Software
              </a>
            </p>
          </div>
          <div className="flex gap-6">
            {[
              { ar: "الشروط", en: "Terms" },
              { ar: "الخصوصية", en: "Privacy" },
            ].map((item) => (
              <a
                key={item.en}
                href="#"
                className={`text-white/30 text-[11px] uppercase tracking-widest hover:text-accent transition-colors ${isArabic ? "font-arabic" : ""}`}
              >
                {isArabic ? item.ar : item.en}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}