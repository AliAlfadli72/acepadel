import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Icon } from "@iconify/react";

/* ============================================================
   ANIMATED COUNTER HOOK
   ============================================================ */
function useCounter(target, duration = 2000, trigger = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, trigger]);
  return count;
}

/* ============================================================
   FADE-IN SECTION WRAPPER
   ============================================================ */
function FadeIn({ children, delay = 0, direction = "up", className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
      x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0 },
  };
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   STAT COUNTER CARD
   ============================================================ */
function StatCard({ value, suffix = "", label, icon, isArabic }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const count = useCounter(parseInt(value), 2000, inView);
  return (
    <div ref={ref} className="flex flex-col items-center text-center p-8">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-gray-200 flex items-center justify-center mb-4">
        <Icon icon={icon} className="w-7 h-7 text-primary" />
      </div>
      <div className="font-display font-black text-5xl text-primary leading-none mb-1">
        {count}{suffix}
      </div>
      <div className={`text-gray-500 text-xs uppercase tracking-widest mt-1 ${isArabic ? "font-arabic tracking-normal" : ""}`}>
        {label}
      </div>
    </div>
  );
}

/* ============================================================
   SERVICE BENTO CARD
   ============================================================ */
function BentoCard({ icon, tag, title, desc, link, accentClass = "", isArabic }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white rounded-3xl border border-gray-200 p-8 group flex flex-col h-full"
      style={{ boxShadow: "0 2px 20px rgba(15,26,19,0.06)" }}
    >
      <div className="flex items-start justify-between mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accentClass}`}>
          <Icon icon={icon} className="w-6 h-6" />
        </div>
        <span className={`text-[10px] uppercase tracking-[0.18em] text-gray-500 border border-gray-200 px-3 py-1 rounded-full font-bold ${isArabic ? "font-arabic tracking-normal text-xs" : ""}`}>
          {tag}
        </span>
      </div>
      <h3 className={`text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors ${isArabic ? "font-arabic" : "font-display text-2xl"}`}>
        {title}
      </h3>
      <p className={`text-gray-500 text-sm leading-relaxed flex-grow ${isArabic ? "font-arabic" : ""}`}>{desc}</p>
      <Link
        to={link}
        className="mt-6 flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest hover:gap-3 transition-all"
      >
        {isArabic ? "اكتشف المزيد" : "Learn More"}
        <Icon icon="mdi:arrow-right" className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}

/* ============================================================
   TESTIMONIAL CARD
   ============================================================ */
function TestimonialCard({ name, role, text, rating = 5, isArabic }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8" style={{ boxShadow: "0 2px 20px rgba(15,26,19,0.06)" }}>
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Icon key={i} icon="mdi:star" className="w-4 h-4 text-accent" />
        ))}
      </div>
      <p className={`text-gray-600 text-sm leading-relaxed mb-6 ${isArabic ? "font-arabic" : ""}`}>
        "{text}"
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-forest-gradient flex items-center justify-center">
          <span className="text-accent font-bold text-sm">{name[0]}</span>
        </div>
        <div>
          <p className={`font-bold text-gray-900 text-sm ${isArabic ? "font-arabic" : ""}`}>{name}</p>
          <p className={`text-gray-500 text-xs ${isArabic ? "font-arabic" : ""}`}>{role}</p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN HOME PAGE
   ============================================================ */
export default function Home({ lang }) {
  const isArabic = lang === "ar";

  const services = [
    {
      icon: "mdi:tennis-ball",
      tag: isArabic ? "FIP معتمد" : "FIP Certified",
      title: isArabic ? "ملاعب البادل الاحترافية" : "Padel Courts",
      desc: isArabic
        ? "ملاعب بمواصفات الاتحاد الدولي (FIP) مع عشب صناعي من الجيل الثالث وإضاءة LED تمنع الوهج."
        : "FIP-spec courts with 3rd-gen artificial turf and anti-glare LED lighting for an unbeatable game.",
      link: "/services",
      accentClass: "bg-primary/10 text-primary",
    },
    {
      icon: "mdi:whistle",
      tag: isArabic ? "تدريب" : "Training",
      title: isArabic ? "نادي آيس" : "Ace Club",
      desc: isArabic
        ? "برامج Ace Juniors للناشئين، دروس للمحترفين، وحصص جماعية بإشراف مدربين معتمدين دولياً."
        : "Ace Juniors programs, pro-level coaching, and group sessions with internationally certified trainers.",
      link: "/services",
      accentClass: "bg-accent/20 text-primary",
    },
    {
      icon: "mdi:yoga",
      tag: isArabic ? "عافية" : "Wellness",
      title: isArabic ? "استوديو البيلاتس" : "Pilates Studio",
      desc: isArabic
        ? "تمارين مكملة تركز على القوة الذهنية والثبات العضلي وتقليل الإصابات بأسلوب متطور."
        : "Complementary training focused on mental strength, muscle stability, and injury prevention.",
      link: "/services",
      accentClass: "bg-green-100 text-primary",
    },
    {
      icon: "mdi:food-fork-drink",
      tag: isArabic ? "اجتماعي" : "Social",
      title: isArabic ? "الركن الاجتماعي" : "Social Corner",
      desc: isArabic
        ? "فود كورت يقدم قائمة طعام صحية وتيراس خارجي بإطلالة حيوية على الملاعب لجلسات لا تُنسى."
        : "A healthy food court and open terrace with vibrant views of the courts for unforgettable moments.",
      link: "/services",
      accentClass: "bg-emerald-50 text-primary",
    },
  ];

  const stats = [
    { value: 500, suffix: "+", label: isArabic ? "لاعب نشط" : "Active Players",     icon: "mdi:account-group" },
    { value: 8,   suffix: "",  label: isArabic ? "ملاعب" : "Premium Courts",        icon: "mdi:tennis-ball"   },
    { value: 20,  suffix: "+", label: isArabic ? "مدرب معتمد" : "Certified Coaches", icon: "mdi:whistle"       },
    { value: 50,  suffix: "+", label: isArabic ? "فعالية سنوياً" : "Events Yearly",  icon: "mdi:trophy"        },
  ];

  const testimonials = [
    {
      name: isArabic ? "أحمد الخطيب" : "Ahmad Khatib",
      role: isArabic ? "لاعب بادل محترف" : "Professional Padel Player",
      text: isArabic
        ? "الملاعب مذهلة ومطابقة تماماً لمعايير الاتحاد الدولي. أفضل مكان للتدريب في دمشق بلا منافس."
        : "The courts are stunning and fully comply with international standards. Best training facility in Damascus.",
    },
    {
      name: isArabic ? "سارة المصري" : "Sara Al-Masri",
      role: isArabic ? "عضو في نادي آيس" : "Ace Club Member",
      text: isArabic
        ? "جربت استوديو البيلاتس وكان تجربة رائعة. المدربون محترفون جداً والأجواء هادئة ومريحة."
        : "The Pilates studio is a wonderful experience. Professional trainers and a wonderfully calming atmosphere.",
    },
    {
      name: isArabic ? "عمر فاروق" : "Omar Farouk",
      role: isArabic ? "أب وعضو عائلي" : "Family Member",
      text: isArabic
        ? "مكان مثالي للعائلة. الأطفال يتدربون مع Ace Juniors ونحن نستمتع بالتيراس. تجربة كاملة!"
        : "Perfect family spot. Kids train with Ace Juniors while we enjoy the terrace. A complete experience!",
    },
  ];

  return (
    <div style={{ backgroundColor: "#ffffff", color: "#0F1A13" }} className="overflow-x-hidden" dir={isArabic ? "rtl" : "ltr"}>

      {/* ================================================
          HERO SECTION
          ================================================ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden" style={{ backgroundColor: "#F8FAF8" }}>

        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-court.png')" }}
        >
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(255,255,255,0.78)" }} />
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-1/4 right-[10%] w-80 h-80 bg-accent/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-[5%] w-60 h-60 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Hero Text */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="section-label mb-8 w-fit"
              >
                <Icon icon="mdi:map-marker" className="w-3.5 h-3.5 text-primary" />
                 {isArabic ? "دمشق — أوتوستراد المزة - نادي الوحدة الرياضي" : "Damascus — Mezzeh Highway, Al-Wahda Sports Club"}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`font-display font-black leading-[0.9] text-primary mb-6 ${isArabic ? "font-arabic text-5xl md:text-7xl leading-tight" : "text-6xl md:text-8xl"}`}
              >
                {isArabic ? (
                  <>
                    آيس<br />
                    <span className="text-[#2C5234]">بادل</span>{" "}
                    <span className="relative inline-block">
                      <span className="relative z-10">كلوب</span>
                      <span className="absolute bottom-0 left-0 right-0 h-3 bg-accent/50 -rotate-1 z-0" />
                    </span>
                  </>
                ) : (
                  <>
                    ACE<br />
                    <span className="text-[#2C5234]">PADEL</span>{" "}
                    <span className="relative inline-block">
                      <span className="relative z-10">CLUB</span>
                      <span className="absolute bottom-1 left-0 right-0 h-3 bg-accent/50 -rotate-1 z-0" />
                    </span>
                  </>
                )}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className={`text-gray-600 text-lg leading-relaxed mb-10 max-w-lg ${isArabic ? "font-arabic" : ""}`}
              >
                {isArabic
                  ? "الوجهة الرياضية والاجتماعية الأولى في قلب دمشق. نجمع بين التميز الرياضي ومعايير الاتحاد الدولي (FIP) لنقدم تجربة لا تضاهى."
                  : "Damascus' premier sports and social destination. We combine athletic excellence with International Padel Federation (FIP) standards for an unrivaled experience."}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/booking" className="btn-primary">
                  <Icon icon="mdi:calendar-check" className="w-5 h-5" />
                  {isArabic ? "احجز ملعبك الآن" : "Book Your Court"}
                </Link>
                <Link to="/services" className="btn-outline">
                  <Icon icon="mdi:information-outline" className="w-5 h-5" />
                  {isArabic ? "اكتشف خدماتنا" : "Our Services"}
                </Link>
              </motion.div>

              {/* Quick stats strip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="flex flex-wrap gap-6 mt-12 pt-10 border-t border-gray-200"
              >
                {[
                  { v: "7 AM", l: isArabic ? "يفتح" : "Opens" },
                  { v: "2 AM", l: isArabic ? "يغلق" : "Closes" },
                  { v: "FIP", l: isArabic ? "معتمد" : "Certified" },
                ].map(({ v, l }) => (
                  <div key={l} className="flex items-center gap-2">
                    <span className="font-display font-black text-primary text-xl">{v}</span>
                    <span className={`text-gray-500 text-xs uppercase ${isArabic ? "font-arabic tracking-normal" : "tracking-widest"}`}>{l}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero Image Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-[32px] overflow-hidden shadow-[0_24px_80px_rgba(44,82,52,0.25)] aspect-[4/3]">
                <img
                  src="/hero-court.png"
                  alt="Professional Padel Court — Ace Padel Club Damascus"
                  className="w-full h-full object-cover"
                />
                {/* Overlay badge */}
                <div className="absolute bottom-6 left-6 right-6 glass rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                    <Icon icon="mdi:check-decagram" className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className={`font-bold text-gray-900 text-sm ${isArabic ? "font-arabic" : ""}`}>
                      {isArabic ? "معتمد من الاتحاد الدولي" : "FIP Certified Facility"}
                    </p>
                    <p className={`text-gray-500 text-xs ${isArabic ? "font-arabic" : ""}`}>
                      {isArabic ? "معايير عالمية في قلب دمشق" : "International standards in Damascus"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating accent card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 bg-accent rounded-2xl p-4 shadow-accent-glow"
              >
                <p className={`font-bold text-primary text-sm ${isArabic ? "font-arabic" : "font-display"}`}>
                  {isArabic ? "مفتوح يومياً" : "Open Daily"}
                </p>
                <p className="font-mono text-primary/70 text-xs" dir="ltr">7:00 AM — 2:00 AM</p>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400"
        >
          <span className={`text-[10px] uppercase tracking-widest ${isArabic ? "font-arabic tracking-normal" : ""}`}>
            {isArabic ? "اسحب لأسفل" : "Scroll"}
          </span>
          <Icon icon="mdi:chevron-down" className="w-5 h-5" />
        </motion.div>
      </section>

      {/* ================================================
          STATS SECTION
          ================================================ */}
      <section className="border-y border-gray-200" style={{ backgroundColor: "#F8FAF8" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
            {stats.map((s, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <StatCard {...s} isArabic={isArabic} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          SERVICES BENTO GRID
          ================================================ */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="section-label mb-4">
                <Icon icon="mdi:view-grid" className="w-3.5 h-3.5" />
                {isArabic ? "خدماتنا" : "Our Services"}
              </span>
              <h2 className={`mt-4 font-display font-black text-primary ${isArabic ? "font-arabic text-4xl md:text-5xl" : "text-5xl md:text-6xl"}`}>
                {isArabic ? "منظومة خدمات متكاملة" : "Integrated Service Ecosystem"}
              </h2>
              <p className={`mt-4 text-gray-500 max-w-2xl mx-auto ${isArabic ? "font-arabic" : ""}`}>
                {isArabic
                  ? "تجربة شاملة تجمع بين الرياضة والعافية والتواصل الاجتماعي في مكان واحد"
                  : "A comprehensive experience combining sports, wellness, and social connection in one place"}
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <BentoCard {...svc} isArabic={isArabic} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          COURTS FEATURE SECTION
          ================================================ */}
      <section className="py-20" style={{ backgroundColor: "#F8FAF8" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <div className="relative rounded-[28px] overflow-hidden shadow-card-hover aspect-[4/3]">
                <img
                  src="/hero-court.png"
                  alt="FIP certified padel court"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 left-6 bg-accent rounded-xl px-4 py-2 font-bold text-primary text-sm shadow-accent-glow">
                  FIP Certified
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="left" delay={0.15}>
              <span className="section-label mb-6">
                <Icon icon="mdi:tennis-ball" className="w-3.5 h-3.5" />
                {isArabic ? "ملاعبنا" : "Our Courts"}
              </span>

              <h2 className={`font-display font-black text-primary mt-4 mb-6 ${isArabic ? "font-arabic text-4xl" : "text-5xl"}`}>
                {isArabic ? "معايير عالمية في قلب دمشق" : "World-Class Standards"}
              </h2>
              <p className={`text-gray-600 mb-8 leading-relaxed ${isArabic ? "font-arabic" : ""}`}>
                {isArabic
                  ? "ملاعبنا مصممة وفق أدق المواصفات التقنية للاتحاد الدولي للبادل (FIP)، مما يضمن لك تجربة لعب احترافية."
                  : "Our courts are designed to the exacting technical specifications of the International Padel Federation (FIP), guaranteeing a professional playing experience."}
              </p>

              <ul className="space-y-4">
                {[
                  { icon: "mdi:grass",          text: { ar: "عشب صناعي من الجيل الثالث لامتصاص الصدمات المثالي",    en: "3rd-gen artificial turf for optimal shock absorption" } },
                  { icon: "mdi:lightbulb-on",   text: { ar: "إضاءة LED متطورة تمنع الوهج أثناء اللعب الليلي",      en: "Advanced LED lighting preventing glare during night play" } },
                  { icon: "mdi:check-decagram", text: { ar: "تصميم مطابق لمواصفات الاتحاد الدولي للبادل (FIP)",    en: "Design compliant with International Padel Federation specs" } },
                  { icon: "mdi:calendar-clock", text: { ar: "نظام حجز رقمي سريع وسهل على مدار الساعة",             en: "Fast & easy digital booking system, 24/7 access" } },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon icon={item.icon} className="w-5 h-5 text-primary" />
                    </div>
                    <span className={`text-gray-600 text-sm leading-relaxed pt-2 ${isArabic ? "font-arabic" : ""}`}>
                      {isArabic ? item.text.ar : item.text.en}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex gap-4">
                <Link to="/booking" className="btn-primary">
                  <Icon icon="mdi:calendar-plus" className="w-5 h-5" />
                  {isArabic ? "احجز الآن" : "Book a Court"}
                </Link>
                <Link to="/services" className="btn-outline">
                  {isArabic ? "معرفة المزيد" : "Learn More"}
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ================================================
          PILATES STUDIO SECTION
          ================================================ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <span className="section-label mb-6">
                <Icon icon="mdi:yoga" className="w-3.5 h-3.5" />
                {isArabic ? "استوديو البيلاتس" : "Pilates Studio"}
              </span>
              <h2 className={`font-display font-black text-primary mt-4 mb-6 ${isArabic ? "font-arabic text-4xl" : "text-5xl"}`}>
                {isArabic ? "أكثر من مجرد بادل" : "Beyond Padel"}
              </h2>
              <p className={`text-gray-600 mb-8 leading-relaxed ${isArabic ? "font-arabic" : ""}`}>
                {isArabic
                  ? "استوديو البيلاتس في آيس كلوب مصمم خصيصاً لتكملة رياضة البادل، مع التركيز على القوة الذهنية، الثبات العضلي، وتقليل الإصابات."
                  : "The Ace Pilates Studio is specially designed to complement padel, focusing on mental strength, muscle stability, and injury prevention."}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: "mdi:brain",       label: isArabic ? "التركيز الذهني" : "Mental Focus" },
                  { icon: "mdi:arm-flex",    label: isArabic ? "الثبات العضلي" : "Muscle Stability" },
                  { icon: "mdi:shield-check",label: isArabic ? "الوقاية" : "Prevention" },
                ].map(({ icon, label }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5 text-center" style={{ boxShadow: "0 2px 12px rgba(15,26,19,0.05)" }}>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                      <Icon icon={icon} className="w-5 h-5 text-primary" />
                    </div>
                    <p className={`text-gray-900 font-bold text-xs ${isArabic ? "font-arabic" : ""}`}>{label}</p>
                  </div>
                ))}
              </div>

              <Link to="/services" className="btn-primary">
                <Icon icon="mdi:arrow-right" className="w-5 h-5" />
                {isArabic ? "احجز جلسة بيلاتس" : "Book Pilates Session"}
              </Link>
            </FadeIn>

            <FadeIn direction="left" delay={0.15}>
              <div className="relative rounded-[28px] overflow-hidden shadow-card-hover aspect-[4/3]">
                <img
                  src="/pilates-studio.png"
                  alt="Ace Pilates Studio — serene wellness experience"
                  className="w-full h-full object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ================================================
          SOCIAL TERRACE SECTION (Forest Green BG)
          ================================================ */}
      <section className="py-20 text-white overflow-hidden relative" style={{ backgroundColor: "#2C5234" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('/social-terrace.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(44,82,52,0.8)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3">
              <FadeIn>
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-accent px-4 py-2 rounded-full border border-accent/30 bg-accent/10 mb-6">
                  <Icon icon="mdi:food-fork-drink" className="w-3.5 h-3.5" />
                  {isArabic ? "الركن الاجتماعي" : "Social Corner"}
                </span>
                <h2 className={`font-display font-black text-white mt-4 mb-6 ${isArabic ? "font-arabic text-4xl" : "text-5xl md:text-6xl"}`}>
                  {isArabic ? "تجربة اجتماعية راقية" : "Premium Social Experience"}
                </h2>
                <p className={`text-white/80 mb-8 leading-relaxed text-lg ${isArabic ? "font-arabic" : ""}`}>
                  {isArabic
                    ? "فود كورت يقدم قائمة طعام صحية متنوعة، وتيراس خارجي بإطلالة خلابة على الملاعب لجلسات لا تُنسى مع الأصدقاء والعائلة."
                    : "A healthy food court with a diverse menu and an open terrace with stunning views of the courts for unforgettable moments."}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: "mdi:leaf",  label: isArabic ? "قائمة صحية" : "Healthy Menu" },
                    { icon: "mdi:sofa",  label: isArabic ? "تيراس مريح" : "Cozy Terrace" },
                    { icon: "mdi:eye",   label: isArabic ? "إطلالة على الملاعب" : "Court Views" },
                    { icon: "mdi:wifi",  label: isArabic ? "واي فاي مجاني" : "Free Wi-Fi" },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Icon icon={icon} className="w-4 h-4 text-accent" />
                      </div>
                      <span className={`text-white/90 text-sm ${isArabic ? "font-arabic" : ""}`}>{label}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            <FadeIn className="lg:col-span-2" direction="left" delay={0.2}>
              <div className="relative rounded-[28px] overflow-hidden shadow-2xl aspect-[3/4]">
                <img
                  src="/social-terrace.png"
                  alt="Ace Padel Social Corner and Terrace"
                  className="w-full h-full object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ================================================
          TESTIMONIALS
          ================================================ */}
      <section className="py-28 px-6" style={{ backgroundColor: "#F8FAF8" }}>
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="section-label mb-4">
                <Icon icon="mdi:comment-quote" className="w-3.5 h-3.5" />
                {isArabic ? "آراء أعضائنا" : "Member Reviews"}
              </span>
              <h2 className={`mt-4 font-display font-black text-primary ${isArabic ? "font-arabic text-4xl md:text-5xl" : "text-5xl"}`}>
                {isArabic ? "ماذا يقول لاعبونا" : "What Our Players Say"}
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <TestimonialCard {...t} isArabic={isArabic} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          LOCATION / CTA BAND
          ================================================ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[40px] p-10 md:p-16 overflow-hidden relative" style={{ backgroundColor: "#2C5234" }}>
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-[80px]" />
            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className={`font-display font-black text-white text-4xl md:text-5xl mb-4 ${isArabic ? "font-arabic" : ""}`}>
                  {isArabic ? "تفضل بزيارتنا اليوم" : "Visit Us Today"}
                </h2>
                <p className={`text-white/70 mb-8 leading-relaxed ${isArabic ? "font-arabic" : ""}`}>
                  {isArabic
                    ? "نحن في قلب دمشق، على أوتوستراد المزة، في نادي الوحدة الرياضي."
                    : "We're in the heart of Damascus, on Mezzeh Highway, inside Al-Wahda Sports Club."}
                </p>
                <div className="space-y-4">
                  {[
                    { icon: "mdi:phone",      val: "0945 000 365", href: "tel:0945000365", isPhone: true },
                    { icon: "mdi:map-marker", val: isArabic ? "دمشق - أوتوستراد المزة - نادي الوحدة الرياضي" : "Damascus, Mezzeh Highway, Al-Wahda Sports Club", href: "https://www.google.com/maps/place//data=!4m2!3m1!1s0x1518e7001fffdb7d:0xef61ec4bc8d792c6?sa=X&ved=1t:8290&ictx=111" },
                    { icon: "mdi:clock",      val: isArabic ? "يومياً من 7:00 صباحاً حتى 2:00 فجراً" : "Daily: 7:00 AM — 2:00 AM", href: null },
                  ].map(({ icon, val, href, isPhone }, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <Icon icon={icon} className="w-5 h-5 text-accent" />
                      </div>
                      {href ? (
                        <a
                          href={href}
                          className={`text-white/90 text-sm hover:text-white transition-colors pt-2 ${isPhone ? "font-mono" : isArabic ? "font-arabic" : ""}`}
                          dir={isPhone ? "ltr" : undefined}
                        >
                          {val}
                        </a>
                      ) : (
                        <span className={`text-white/90 text-sm pt-2 ${isArabic ? "font-arabic" : ""}`}>{val}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Link to="/booking" className="btn-accent text-center justify-center text-base">
                  <Icon icon="mdi:calendar-check" className="w-5 h-5" />
                  {isArabic ? "احجز ملعبك الآن" : "Book Your Court Now"}
                </Link>
                <Link to="/contact" className="flex items-center justify-center gap-2 text-white/80 border border-white/20 rounded-full px-8 py-4 font-bold text-sm uppercase tracking-widest hover:border-white hover:text-white transition-all">
                  <Icon icon="mdi:message-outline" className="w-5 h-5" />
                  {isArabic ? "تواصل معنا" : "Contact Us"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
