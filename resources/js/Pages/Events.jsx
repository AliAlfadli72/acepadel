import AppLayout, { LangContext } from '../Layouts/AppLayout';
import {  useState , useContext } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Link, usePage } from "@inertiajs/react";
import { resolveAsset } from '../utils';

export default function Events({ events }) {
  const { lang } = useContext(LangContext);
  const { auth, flash } = usePage().props;

  const isArabic = lang === "ar";
  const [filter, setFilter] = useState("all");

  const categories = [
    { key: "all",        ar: "الكل",      en: "All"         },
    { key: "tournament", ar: "بطولات",   en: "Tournaments" },
    { key: "cup",        ar: "كؤوس",     en: "Cups"        },
    { key: "event",      ar: "أحداث",    en: "Events"      },
  ];

  const filtered = filter === "all"
    ? events
    : events.filter(e => e.category.toLowerCase() === filter.toLowerCase());

  const getCategoryName = (cat) => {
      if (!cat) return '';
      const map = {
          'tournament': { ar: 'بطولة', en: 'Tournament' },
          'cup': { ar: 'كأس', en: 'Cup' },
          'event': { ar: 'حدث', en: 'Event' }
      };
      const c = map[cat.toLowerCase()];
      return c ? (isArabic ? c.ar : c.en) : cat;
  };

  const getLevelName = (lvl) => {
      if (!lvl) return isArabic ? 'جميع المستويات' : 'All Levels';
      const map = {
          'open': { ar: 'مفتوح', en: 'Open' },
          'advanced': { ar: 'متقدم', en: 'Advanced' },
          'juniors': { ar: 'ناشئين', en: 'Juniors' },
          'all levels': { ar: 'جميع المستويات', en: 'All Levels' }
      };
      const l = map[lvl.toLowerCase()];
      return l ? (isArabic ? l.ar : l.en) : lvl;
  };

  return (
    <div className="bg-white" dir={isArabic ? "rtl" : "ltr"}>
      {/* Flash Messages */}
      {flash.success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 fixed top-24 left-1/2 transform -translate-x-1/2 z-50 rounded-lg shadow-lg">
            <p className={isArabic ? "font-arabic" : ""}>{flash.success}</p>
        </div>
      )}
      {flash.error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 fixed top-24 left-1/2 transform -translate-x-1/2 z-50 rounded-lg shadow-lg">
            <p className={isArabic ? "font-arabic" : ""}>{flash.error}</p>
        </div>
      )}

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
          {filtered.length === 0 ? (
             <div className="col-span-2 text-center py-12 text-gray-400">
                <Icon icon="solar:box-minimalistic-bold-duotone" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className={isArabic ? "font-arabic text-lg" : "text-lg"}>
                    {isArabic ? "لا توجد فعاليات في هذا القسم حالياً." : "No events available in this section."}
                </p>
            </div>
          ) : filtered.map((event, i) => {
            const dateObj = new Date(event.date);
            const day = dateObj.getDate().toString().padStart(2, '0');
            const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
            const monthAr = arabicMonths[dateObj.getMonth()];
            const monthEn = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(dateObj);
            
            const timeObj = new Date(event.time);
            const timeStr = isNaN(timeObj.getTime()) ? event.time : new Intl.DateTimeFormat(isArabic ? 'ar-EG-u-nu-latn' : 'en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(timeObj);

            return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="premium-card overflow-hidden group bg-white rounded-3xl border border-gray-200 flex flex-col relative"
            >
              {event.image_path && (
                  <Link href={route('events.show', event.id)} className="h-48 w-full bg-gray-100 overflow-hidden shrink-0 block">
                      <img src={resolveAsset(`/storage/${event.image_path}`)} alt={isArabic ? event.title_ar : event.title_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
              )}
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-start gap-6 mb-6">
                  {/* Date block */}
                  <div className={`shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center ${event.status === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-primary/10 text-primary'}`}>
                    <span className="font-display font-black text-3xl leading-none">{day}</span>
                    <span className={`text-[11px] font-bold uppercase mt-1 ${isArabic ? "font-arabic" : ""}`}>
                      {isArabic ? monthAr : monthEn}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] uppercase font-bold border border-gray-200 px-3 py-1 rounded-full text-gray-500 ${isArabic ? "font-arabic tracking-normal" : "tracking-widest"}`}>
                        {getCategoryName(event.category)}
                      </span>
                      <span className={`text-[10px] bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-bold ${isArabic ? "font-arabic" : ""}`}>
                         {getLevelName(event.level)}
                      </span>
                      {event.status === 'completed' && (
                          <span className={`text-[10px] bg-gray-900 text-accent border border-gray-900 px-3 py-1 rounded-full font-bold ${isArabic ? "font-arabic" : ""}`}>
                             {isArabic ? 'مكتملة' : 'Completed'}
                          </span>
                      )}
                    </div>
                    <Link href={route('events.show', event.id)}>
                        <h3 className={`font-bold text-gray-900 group-hover:text-primary transition-colors ${isArabic ? "font-arabic text-lg" : "text-xl"}`}>
                        {isArabic ? event.title_ar : event.title_en}
                        </h3>
                    </Link>
                  </div>
                </div>

                <p className={`text-gray-600 text-sm leading-relaxed mb-6 flex-grow ${isArabic ? "font-arabic line-clamp-3" : "line-clamp-3"}`}>
                  {isArabic ? event.desc_ar : event.desc_en}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6 border-y border-gray-200 py-5">
                  {[
                    { icon: "mdi:clock-outline",       val: timeStr },
                    { icon: "mdi:account-group",       val: `${event.max_participants || '∞'}` },
                    { icon: "mdi:currency-usd",        val: event.fee > 0 ? `${event.fee} SYP` : (isArabic ? 'مجاني' : 'Free') },
                  ].map(({ icon, val }, idx) => (
                    <div key={idx} className="text-center">
                      <Icon icon={icon} className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className={`text-xs text-gray-600 font-semibold ${isArabic ? "font-arabic" : ""}`}>{val}</p>
                    </div>
                  ))}
                </div>

                {event.status === 'completed' ? (
                    <Link href={route('events.show', event.id)} className="bg-gray-900 hover:bg-gray-800 text-white w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-colors mt-auto font-bold">
                        <Icon icon="mdi:trophy-award" className="w-5 h-5 text-primary" />
                        <span className={isArabic ? "font-arabic" : ""}>
                            {isArabic ? "عرض النتائج والتفاصيل" : "View Results & Details"}
                        </span>
                    </Link>
                ) : (
                    <>
                        {auth.user ? (
                        event.is_registered ? (
                                <div className="space-y-3 mt-auto">
                                    <div className="bg-green-50 text-green-600 font-bold py-3 px-4 rounded-xl text-center border border-green-200 flex items-center justify-center gap-2">
                                        <Icon icon="mdi:check-circle" className="w-5 h-5" />
                                        <span className={isArabic ? "font-arabic" : ""}>
                                            {isArabic ? "لقد قمت بالتسجيل مسبقاً" : "You are registered"}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={route('events.show', event.id)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 text-center text-sm font-bold py-2 rounded-xl transition-colors flex justify-center items-center">
                                            {isArabic ? "التفاصيل" : "Details"}
                                        </Link>
                                        <Link href={route('events.cancel_registration', event.id)} method="post" as="button" className="flex-1 bg-red-50 hover:bg-red-100 border border-red-100 text-center text-sm font-bold text-red-600 transition-colors py-2 rounded-xl">
                                            {isArabic ? "إلغاء التسجيل" : "Cancel"}
                                        </Link>
                                    </div>
                                </div>
                        ) : (
                                <div className="flex gap-3 mt-auto">
                                    <Link href={route('events.show', event.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-900 w-1/3 flex items-center justify-center rounded-xl transition-colors font-bold">
                                        {isArabic ? "التفاصيل" : "Details"}
                                    </Link>
                                    <Link href={route('events.register', event.id)} method="post" as="button" className="btn-primary w-2/3 justify-center">
                                        <Icon icon="mdi:account-plus" className="w-5 h-5" />
                                        {isArabic ? "سجل مشاركتك" : "Register Now"}
                                    </Link>
                                </div>
                        )
                        ) : (
                            <div className="flex gap-3 mt-auto">
                                <Link href={route('events.show', event.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-900 w-1/3 flex items-center justify-center rounded-xl transition-colors font-bold">
                                    {isArabic ? "التفاصيل" : "Details"}
                                </Link>
                                <Link href={route('login')} className="bg-gray-900 hover:bg-gray-800 text-white font-bold w-2/3 py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2 transition-colors">
                                    <Icon icon="mdi:login" className="w-5 h-5 text-primary" />
                                    <span className={isArabic ? "font-arabic text-sm" : "text-sm"}>
                                        {isArabic ? "سجل دخول للمشاركة" : "Login to Register"}
                                    </span>
                                </Link>
                            </div>
                        )}
                    </>
                )}
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
Events.layout = page => <AppLayout children={page} />;
