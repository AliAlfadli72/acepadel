import AppLayout, { LangContext } from '../Layouts/AppLayout';
import { useState, useContext } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Link, usePage, Head } from "@inertiajs/react";
import { resolveAsset } from '../utils';

const fallbackImages = [
  "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000", // Padel motion blur ball close up
  "https://images.unsplash.com/photo-1592919505780-303950717480?q=80&w=1000", // Padel court night lights stadium
  "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000", // Tennis night court lines
  "https://images.unsplash.com/photo-1601647998802-540700d23580?q=80&w=1000", // Sports facility rendering
];

export default function Events({ events }) {
  const { lang } = useContext(LangContext);
  const { auth, flash } = usePage().props;

  const isArabic = lang === "ar";
  const [filter, setFilter] = useState("all");

  const categories = [
    { key: "all",        ar: "الكل",             en: "All"         },
    { key: "tournament", ar: "بطولات",           en: "Tournaments" },
    { key: "cup",        ar: "كؤوس",             en: "Cups"        },
    { key: "event",      ar: "فعاليات اجتماعية",   en: "Social Events" },
  ];

  const filtered = filter === "all"
    ? events
    : events.filter(e => e.category.toLowerCase() === filter.toLowerCase());

  const getCategoryName = (cat) => {
      if (!cat) return '';
      const map = {
          'tournament': { ar: 'بطولة', en: 'Tournament' },
          'cup': { ar: 'كأس', en: 'Cup' },
          'event': { ar: 'فعالية اجتماعية', en: 'Social Event' }
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

  // Entrance animations config
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 14
      }
    }
  };

  return (
    <div className="bg-[#F8FAF8] text-[#222831] min-h-screen relative overflow-hidden" dir={isArabic ? "rtl" : "ltr"}>
      <Head>
        <title>{isArabic ? "البطولات والفعاليات | تحديات بادل دمشق" : "Tournaments & Events | Damascus Padel Challenges"}</title>
        <meta name="description" content={isArabic 
          ? "اكتشف البطولات والفعاليات الجارية والمقبلة في نادي آيس بادل دمشق. سجل في المنافسات، وكن جزءاً من الفعاليات الرياضية المميزة." 
          : "Discover ongoing and upcoming tournaments and events at Ace Padel Club Damascus. Sign up for competitions and be part of outstanding sports events."} />
      </Head>
      {/* Decorative background grid and light-mode glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#d6e02e]/6 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#d6e02e]/6 blur-[120px] pointer-events-none" />

      {/* Flash Messages */}
      {flash.success && (
        <div className="bg-white border-2 border-[#d6e02e] text-[#222831] p-5 fixed top-24 left-1/2 transform -translate-x-1/2 z-50 rounded-none shadow-[4px_4px_0px_rgba(34,40,49,0.1)]">
            <p className={`font-black uppercase tracking-wider flex items-center gap-2 ${isArabic ? "font-arabic" : ""}`}>
                <Icon icon="solar:check-circle-linear" className="w-5 h-5 text-[#d6e02e]" />
                {flash.success}
            </p>
        </div>
      )}
      {flash.error && (
        <div className="bg-white border-2 border-rose-500 text-rose-500 p-5 fixed top-24 left-1/2 transform -translate-x-1/2 z-50 rounded-none shadow-[4px_4px_0px_rgba(34,40,49,0.1)]">
            <p className={`font-black uppercase tracking-wider flex items-center gap-2 ${isArabic ? "font-arabic" : ""}`}>
                <Icon icon="solar:close-circle-linear" className="w-5 h-5" />
                {flash.error}
            </p>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-32 pb-20 px-6 border-b border-gray-200 bg-white">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none select-none font-display font-black text-[12rem] lg:text-[22rem] tracking-tighter leading-none text-stroke-sport-active uppercase">
          {isArabic ? "كلوب" : "CLUB"}
        </div>
        <div className="max-w-7xl mx-auto flex flex-col items-start justify-center relative z-10 text-right rtl:text-right ltr:text-left">
          <motion.div 
            initial={{ opacity: 0, x: isArabic ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#222831] border-b-2 border-[#d6e02e] pb-1.5 mb-6">
              <Icon icon="solar:cup-first-linear" className="w-4 h-4 text-[#d6e02e]" />
              {isArabic ? "الفعاليات والبطولات الحية" : "LIVE EVENTS & TOURNAMENTS"}
            </span>
            <h1 className={`font-display font-black text-[#222831] uppercase tracking-tighter leading-none mb-6 ${isArabic ? "font-arabic text-5xl md:text-7xl" : "text-6xl md:text-8xl"}`}>
              {isArabic ? "جدول الفعاليات والبطولات" : "Events & Tournaments"}
            </h1>
            <p className={`text-gray-500 max-w-2xl font-medium text-lg leading-relaxed ${isArabic ? "font-arabic" : ""}`}>
              {isArabic
                ? "تابع أحدث الفعاليات والبطولات في آيس بادل كلوب. سجل مشاركتك وكن جزءاً من التاريخ."
                : "Follow the latest events and tournaments at Ace Padel Club. Register and be part of history."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        
        {/* Floating Pills-shaped Category Filters */}
        <div className="flex flex-wrap gap-3 mb-16 justify-start items-center">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border backdrop-blur-md ${
                filter === cat.key
                  ? "bg-[#d6e02e] text-[#222831] border-[#d6e02e] shadow-[0_4px_15px_rgba(214,224,46,0.25)]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[#d6e02e] hover:text-[#222831] hover:bg-gray-50"
              } ${isArabic ? "font-arabic" : ""}`}
            >
              {isArabic ? cat.ar : cat.en}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 bg-white border-2 border-gray-200 max-w-xl mx-auto">
            <Icon icon="solar:box-minimalistic-bold-duotone" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className={`text-gray-400 text-lg font-black ${isArabic ? "font-arabic" : ""}`}>
              {isArabic ? "لا توجد فعاليات في هذا القسم حالياً." : "No events available in this section."}
            </p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {filtered.map((event, i) => {
              const dateObj = new Date(event.date);
              const day = dateObj.getDate().toString().padStart(2, '0');
              const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
              const monthAr = arabicMonths[dateObj.getMonth()];
              const monthEn = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(dateObj);
              
              const timeObj = new Date(event.time);
              const timeStr = isNaN(timeObj.getTime()) ? event.time : new Intl.DateTimeFormat(isArabic ? 'ar-EG-u-nu-latn' : 'en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(timeObj);

              // Use seeded fallbacks if local path is empty or placeholder
              const eventImg = event.image_path 
                ? resolveAsset(`/storage/${event.image_path}`)
                : fallbackImages[event.id % fallbackImages.length];

              const isFeatured = i === 0 && filtered.length > 1;

              return (
                <motion.div
                  key={event.id}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02, 
                    rotate: i % 2 === 0 ? 0.5 : -0.5, 
                    boxShadow: "6px 6px 0px #d6e02e",
                    borderColor: "#222831" 
                  }}
                  className={`brutalist-glow-card group overflow-hidden bg-white rounded-none border-2 border-gray-200 flex flex-col relative transition-all duration-300 ${
                    isFeatured ? "lg:col-span-2 flex flex-col lg:flex-row min-h-[440px]" : "flex flex-col min-h-[500px]"
                  }`}
                >
                  {/* Overlapping Date Badge */}
                  <div className={`absolute -top-3 ${isArabic ? "-right-3" : "-left-3"} z-20 w-16 h-20 bg-[#222831] border-2 border-[#222831] shadow-[3px_3px_0px_#d6e02e] flex flex-col items-center justify-center rotate-[-4deg] group-hover:rotate-[2deg] transition-transform duration-300`}>
                    <span className="font-display font-black text-3xl leading-none text-[#d6e02e]">{day}</span>
                    <span className={`text-[10px] font-black uppercase mt-1 text-white tracking-widest ${isArabic ? "font-arabic" : ""}`}>
                      {isArabic ? monthAr : monthEn}
                    </span>
                  </div>

                  {/* Image Section */}
                  <div className={`relative overflow-hidden shrink-0 ${
                    isFeatured ? "w-full lg:w-1/2 h-64 lg:h-auto border-b-2 lg:border-b-0 lg:border-r-2 border-gray-200 group-hover:border-[#222831]" : "h-56 w-full border-b-2 border-gray-200 group-hover:border-[#222831]"
                  } transition-colors duration-300`}>
                    <Link href={route('events.show', event.id)} className="w-full h-full block">
                      <img 
                        src={eventImg} 
                        alt={isArabic ? event.title_ar : event.title_en} 
                        className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </Link>

                    {/* Floating Badges */}
                    <div className="absolute bottom-4 right-4 left-4 flex justify-between items-center z-10 flex-wrap gap-2">
                      <span className="text-[10px] uppercase font-black bg-white border border-[#222831] px-3 py-1 text-[#222831] tracking-wider">
                        {getCategoryName(event.category)}
                      </span>
                      <div className="flex gap-1.5">
                        <span className={`text-[10px] font-black border px-3 py-1 bg-white text-gray-700 ${
                          event.status === 'completed' ? 'border-gray-300 text-gray-400' : 'border-[#d6e02e] text-[#222831] bg-[#d6e02e]/10 pulse-neon-yellow'
                        }`}>
                          {getLevelName(event.level)}
                        </span>
                        {event.status === 'completed' && (
                          <span className="text-[10px] bg-white text-rose-600 border border-rose-200 px-3 py-1 font-black">
                            {isArabic ? 'مكتملة' : 'Completed'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Body Section */}
                  <div className={`p-8 flex flex-col flex-1 bg-white ${
                    isFeatured ? "w-full lg:w-1/2 justify-between" : ""
                  }`}>
                    <div>
                      <Link href={route('events.show', event.id)}>
                        <h3 className={`font-display font-black text-2xl text-[#222831] group-hover:text-[#d6e02e] uppercase tracking-wide leading-tight mb-4 transition-colors ${isArabic ? "font-arabic" : ""}`}>
                          {isArabic ? event.title_ar : event.title_en}
                        </h3>
                      </Link>
                      <p className={`text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 ${isArabic ? "font-arabic font-medium" : "font-medium"}`}>
                        {isArabic ? event.desc_ar : event.desc_en}
                      </p>
                    </div>

                    <div>
                      {/* Grid Stats */}
                      <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-5 mb-6">
                        <div className="flex flex-col items-center py-2 bg-gray-50 border border-gray-100 text-center">
                          <Icon icon="solar:clock-circle-linear" className="w-5 h-5 text-[#222831] mb-1" />
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider">{isArabic ? "الوقت" : "Time"}</span>
                          <p className="text-[11px] text-[#222831] font-bold font-arabic mt-1">{timeStr}</p>
                        </div>
                        <div className="flex flex-col items-center py-2 bg-gray-50 border border-gray-100 text-center">
                          <Icon icon="solar:users-group-two-rounded-linear" className="w-5 h-5 text-[#222831] mb-1" />
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider">{isArabic ? "المقاعد" : "Slots"}</span>
                          <p className="text-[11px] text-[#222831] font-bold font-arabic mt-1">{event.max_participants || '∞'}</p>
                        </div>
                        <div className="flex flex-col items-center py-2 bg-gray-50 border border-gray-100 text-center">
                          <Icon icon="solar:ticket-linear" className="w-5 h-5 text-[#222831] mb-1" />
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider">{isArabic ? "الرسوم" : "Fee"}</span>
                          <p className="text-[11px] text-[#222831] font-bold font-arabic mt-1 truncate max-w-[80px]">
                            {event.fee > 0 ? `${event.fee}` : (isArabic ? 'مجاني' : 'Free')}
                          </p>
                        </div>
                      </div>

                      {/* CTA Section */}
                      <div className="mt-auto">
                        {event.status === 'completed' ? (
                          <Link href={route('events.show', event.id)} className="btn-sport-liquid-dark w-full justify-center py-3.5 text-xs">
                            <Icon icon="solar:cup-first-linear" className="w-4 h-4" />
                            <span className={isArabic ? "font-arabic" : ""}>
                              {isArabic ? "عرض النتائج والتفاصيل" : "View Results & Details"}
                            </span>
                          </Link>
                        ) : (
                          <>
                            {auth.user ? (
                              event.is_registered ? (
                                <div className="space-y-3">
                                  <div className="bg-[#1C2C1D]/5 border border-emerald-500/20 text-emerald-600 font-bold py-3 px-4 text-center flex items-center justify-center gap-2">
                                    <Icon icon="solar:check-circle-linear" className="w-5 h-5 text-emerald-600" />
                                    <span className={isArabic ? "font-arabic text-xs" : "text-xs"}>
                                      {isArabic ? "لقد قمت بالتسجيل مسبقاً" : "You are registered"}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Link href={route('events.show', event.id)} className="btn-sport-liquid-dark flex-1 justify-center py-3 text-xs">
                                      {isArabic ? "التفاصيل" : "Details"}
                                    </Link>
                                    <Link href={route('events.cancel_registration', event.id)} method="post" as="button" className="flex-1 bg-red-50 border border-red-200 text-center text-xs font-black text-red-650 hover:bg-red-100 hover:text-red-700 transition-colors duration-300 py-3">
                                      {isArabic ? "إلغاء التسجيل" : "Cancel"}
                                    </Link>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <Link href={route('events.show', event.id)} className="btn-sport-liquid-dark w-1/3 justify-center py-3 text-xs">
                                    {isArabic ? "التفاصيل" : "Details"}
                                  </Link>
                                  <Link href={route('events.register', event.id)} method="post" as="button" className="btn-sport-liquid w-2/3 justify-center py-3 text-xs">
                                    <Icon icon="solar:user-plus-linear" className="w-4 h-4" />
                                    <span className={isArabic ? "font-arabic" : ""}>
                                      {isArabic ? "سجل مشاركتك" : "Register Now"}
                                    </span>
                                  </Link>
                                </div>
                              )
                            ) : (
                              <div className="flex gap-2">
                                <Link href={route('events.show', event.id)} className="btn-sport-liquid-dark w-1/3 justify-center py-3 text-xs">
                                  {isArabic ? "التفاصيل" : "Details"}
                                </Link>
                                <Link href={route('login')} className="btn-sport-liquid w-2/3 justify-center py-3 text-xs">
                                  <Icon icon="solar:login-2-linear" className="w-4 h-4" />
                                  <span className={isArabic ? "font-arabic" : ""}>
                                    {isArabic ? "سجل دخول للمشاركة" : "Login to Register"}
                                  </span>
                                </Link>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

Events.layout = page => <AppLayout children={page} />;
