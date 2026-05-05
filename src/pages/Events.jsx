import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

const EVENTS = [
  {
    id: 1,
    date: { day: "25", month: { ar: "أبريل", en: "Apr" }, year: "2026" },
    title: { ar: "بطولة آيس بادل السنوية", en: "Ace Padel Annual Championship" },
    category: { ar: "بطولة", en: "Tournament" },
    level: { ar: "مفتوح", en: "Open" },
    time: "09:00 AM",
    prize: { ar: "جائزة مالية", en: "Prize Money" },
    participants: 64,
    desc: {
      ar: "البطولة السنوية الكبرى لآيس بادل أكاديمي. منافسات في فئات متعددة (رجال، سيدات، مزدوج) بمشاركة أبرز اللاعبين في سوريا.",
      en: "The grand annual championship of Ace Padel Academy. Competition across multiple categories with Syria's top players."
    },
    status: "upcoming",
    color: "bg-primary text-white",
  },
  {
    id: 2,
    date: { day: "01", month: { ar: "مايو", en: "May" }, year: "2026" },
    title: { ar: "كأس الفيحاء الأول", en: "Al-Fayha Cup I" },
    category: { ar: "كأس", en: "Cup" },
    level: { ar: "متقدم", en: "Advanced" },
    time: "10:00 AM",
    prize: { ar: "كأس + جوائز", en: "Cup + Prizes" },
    participants: 32,
    desc: {
      ar: "منافسة قوية لأصحاب المستوى المتقدم في رياضة البادل. فرصة ذهبية لإبراز موهبتك.",
      en: "Intense competition for advanced padel players. A golden opportunity to showcase your talent."
    },
    status: "upcoming",
    color: "bg-accent text-primary",
  },
  {
    id: 3,
    date: { day: "10", month: { ar: "مايو", en: "May" }, year: "2026" },
    title: { ar: "يوم البادل المفتوح", en: "Open Padel Day" },
    category: { ar: "حدث", en: "Event" },
    level: { ar: "جميع المستويات", en: "All Levels" },
    time: "08:00 AM",
    prize: { ar: "مجاني", en: "Free Entry" },
    participants: 120,
    desc: {
      ar: "يوم خاص مفتوح للجميع. تجرب رياضة البادل لأول مرة؟ هذا هو يومك! مع مدربين يرافقونك.",
      en: "A special day open to everyone. Trying padel for the first time? This is your day! With coaches by your side."
    },
    status: "upcoming",
    color: "bg-green-100 text-primary",
  },
  {
    id: 4,
    date: { day: "20", month: { ar: "مايو", en: "May" }, year: "2026" },
    title: { ar: "بطولة Ace Juniors", en: "Ace Juniors Tournament" },
    category: { ar: "بطولة", en: "Tournament" },
    level: { ar: "ناشئين", en: "Juniors" },
    time: "09:00 AM",
    prize: { ar: "ميداليات + جوائز", en: "Medals + Prizes" },
    participants: 40,
    desc: {
      ar: "بطولة خاصة للناشئين في برنامج Ace Juniors. المرحلة الأولى نحو بناء أبطال المستقبل.",
      en: "Special tournament for Ace Juniors program participants. The first step toward building future champions."
    },
    status: "upcoming",
    color: "bg-primary/10 text-primary",
  },
];

export default function Events({ lang }) {
  const isArabic = lang === "ar";
  const [filter, setFilter] = useState("all");

  const categories = [
    { key: "all",        ar: "الكل",      en: "All"         },
    { key: "Tournament", ar: "بطولات",   en: "Tournaments" },
    { key: "Cup",        ar: "كؤوس",     en: "Cups"        },
    { key: "Event",      ar: "أحداث",    en: "Events"      },
  ];

  const filtered = filter === "all"
    ? EVENTS
    : EVENTS.filter(e => e.category.en === filter);

  return (
    <div className="bg-white" dir={isArabic ? "rtl" : "ltr"}>
      {/* HERO */}
      <section className="border-b border-gray-200 py-20 px-6" style={{backgroundColor:'#F8FAF8'}}>
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-label mb-6">
              <Icon icon="mdi:trophy" className="w-3.5 h-3.5" />
              {isArabic ? "الفعاليات" : "Events"}
            </span>
            <h1 className={`font-display font-black text-primary mt-6 mb-4 ${isArabic ? "font-arabic text-4xl md:text-5xl" : "text-5xl md:text-6xl"}`}>
              {isArabic ? "جدول الفعاليات والبطولات" : "Events & Tournaments"}
            </h1>
            <p className={`text-gray-500 max-w-2xl mx-auto ${isArabic ? "font-arabic" : ""}`}>
              {isArabic
                ? "تابع أحدث الفعاليات والبطولات في آيس بادل أكاديمي. سجل مشاركتك وكن جزءاً من التاريخ."
                : "Follow the latest events and tournaments at Ace Padel Academy. Register and be part of history."}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
                filter === cat.key
                  ? "bg-primary text-white border-primary"
                  : "border-gray-200 text-gray-500 hover:border-primary hover:text-primary"
              } ${isArabic ? "font-arabic" : ""}`}
            >
              {isArabic ? cat.ar : cat.en}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {filtered.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="premium-card overflow-hidden group bg-white rounded-3xl border border-gray-200"
            >
              <div className="p-8">
                <div className="flex items-start gap-6 mb-6">
                  {/* Date block */}
                  <div className={`shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center ${event.color}`}>
                    <span className="font-display font-black text-3xl leading-none">{event.date.day}</span>
                    <span className={`text-[11px] font-bold uppercase mt-1 ${isArabic ? "font-arabic" : ""}`}>
                      {isArabic ? event.date.month.ar : event.date.month.en}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] uppercase font-bold border border-gray-200 px-3 py-1 rounded-full text-gray-500 ${isArabic ? "font-arabic tracking-normal" : "tracking-widest"}`}>
                        {isArabic ? event.category.ar : event.category.en}
                      </span>
                      <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-bold">
                        {isArabic ? event.level.ar : event.level.en}
                      </span>
                    </div>
                    <h3 className={`font-bold text-gray-900 group-hover:text-primary transition-colors ${isArabic ? "font-arabic text-lg" : "text-xl"}`}>
                      {isArabic ? event.title.ar : event.title.en}
                    </h3>
                  </div>
                </div>

                <p className={`text-gray-600 text-sm leading-relaxed mb-6 ${isArabic ? "font-arabic" : ""}`}>
                  {isArabic ? event.desc.ar : event.desc.en}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6 border-y border-gray-200 py-5">
                  {[
                    { icon: "mdi:clock-outline",       val: event.time },
                    { icon: "mdi:account-group",        val: `${event.participants}+` },
                    { icon: "mdi:trophy-outline",       val: isArabic ? event.prize.ar : event.prize.en },
                  ].map(({ icon, val }) => (
                    <div key={icon} className="text-center">
                      <Icon icon={icon} className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className={`text-xs text-gray-600 font-semibold ${isArabic ? "font-arabic" : ""}`}>{val}</p>
                    </div>
                  ))}
                </div>

                <Link to="/contact" className="btn-primary w-full justify-center">
                  <Icon icon="mdi:account-plus" className="w-5 h-5" />
                  {isArabic ? "سجل مشاركتك" : "Register Now"}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}