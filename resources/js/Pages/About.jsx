import AppLayout, { LangContext } from '../Layouts/AppLayout';
import { useContext } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

export default function About() {
  const { lang } = useContext(LangContext);
  const isArabic = lang === "ar";

  const features = [
    {
      id: 1,
      title: { ar: "معايير عالمية", en: "World-Class Standards" },
      desc: { ar: "ملاعب مجهزة بأحدث التقنيات وأرضيات معتمدة من الاتحاد الدولي للبادل.", en: "Courts equipped with the latest technology and IPF-approved surfaces." },
      icon: "mdi:stadium-variant"
    },
    {
      id: 2,
      title: { ar: "مدربون محترفون", en: "Professional Coaches" },
      desc: { ar: "نخبة من المدربين المعتمدين لرفع مستواك سواء كنت مبتدئاً أو محترفاً.", en: "Elite certified coaches to elevate your game whether you're a beginner or a pro." },
      icon: "mdi:whistle"
    },
    {
      id: 3,
      title: { ar: "مجتمع رياضي راقي", en: "Premium Community" },
      desc: { ar: "بيئة اجتماعية استثنائية تجمع بين الشغف الرياضي والرفاهية العالية.", en: "An exceptional social environment combining sports passion with high luxury." },
      icon: "mdi:account-group-outline"
    }
  ];

  return (
    <div className="bg-white" dir={isArabic ? "rtl" : "ltr"}>
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 bg-[#F8FAF8] border-b border-gray-200 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="currentColor" strokeWidth="2" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6">
              <Icon icon="mdi:information-variant" className="w-4 h-4" />
              {isArabic ? "آيس بادل أكاديمي" : "Ace Padel Academy"}
            </span>
            <h1 className={`font-display font-black text-primary mb-6 ${isArabic ? "font-arabic text-4xl md:text-5xl lg:text-6xl" : "text-5xl md:text-6xl lg:text-7xl"}`}>
              {isArabic ? "نصنع أبطالاً" : "Building Champions"}
              <br className="hidden md:block" />
              <span className="text-accent"> {isArabic ? "ونبني مجتمعاً" : "and Community"}</span>
            </h1>
            <p className={`text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed ${isArabic ? "font-arabic" : ""}`}>
              {isArabic
                ? "وجهتك الأولى لاحتراف رياضة البادل في دمشق. نجمع بين المرافق الرياضية المتطورة والتدريب الاحترافي لنقدم لك تجربة لا مثيل لها."
                : "Your premier destination for professional padel in Damascus. We combine cutting-edge facilities with expert coaching to offer an unparalleled experience."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: isArabic ? 30 : -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-6">
              <Icon icon="mdi:target-arrow" className="w-8 h-8 text-primary" />
            </div>
            <h2 className={`font-display font-black text-3xl md:text-4xl text-primary mb-6 ${isArabic ? "font-arabic" : ""}`}>
              {isArabic ? "رؤيتنا" : "Our Vision"}
            </h2>
            <p className={`text-gray-600 leading-relaxed text-lg mb-8 ${isArabic ? "font-arabic" : ""}`}>
              {isArabic
                ? "نهدف إلى نشر ثقافة البادل في سوريا والمنطقة، وبناء مجتمع رياضي متكامل يجمع بين الصحة، الاحتراف، والمنافسة الشريفة. نسعى لأن نكون الأكاديمية الرائدة التي تخرّج أبطالاً يمثلوننا في المحافل الدولية."
                : "We aim to spread the culture of padel in Syria and the region, building a comprehensive sports community that combines health, professionalism, and fair competition. We strive to be the leading academy that graduates champions representing us in international arenas."}
            </p>
            <div className="flex gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex-1">
                <h4 className={`font-black text-primary text-2xl mb-1 ${isArabic ? "font-arabic" : ""}`}>10K+</h4>
                <p className={`text-xs text-gray-500 uppercase tracking-widest ${isArabic ? "font-arabic tracking-normal font-bold" : ""}`}>
                  {isArabic ? "لاعب نشط" : "Active Players"}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex-1">
                <h4 className={`font-black text-primary text-2xl mb-1 ${isArabic ? "font-arabic" : ""}`}>15+</h4>
                <p className={`text-xs text-gray-500 uppercase tracking-widest ${isArabic ? "font-arabic tracking-normal font-bold" : ""}`}>
                  {isArabic ? "مدرب محترف" : "Pro Coaches"}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: isArabic ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
            <div className="aspect-square rounded-[3rem] bg-forest-gradient overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-primary mix-blend-multiply opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Icon icon="mdi:tennis-ball" className="w-32 h-32 text-accent opacity-50 drop-shadow-2xl" />
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent rounded-full blur-3xl opacity-30 z-[-1]"></div>
          </motion.div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="py-24 px-6 bg-primary text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`font-display font-black text-3xl md:text-4xl mb-4 ${isArabic ? "font-arabic" : ""}`}>
              {isArabic ? "لماذا تختار آيس بادل؟" : "Why Choose Ace Padel?"}
            </h2>
            <p className={`text-white/60 max-w-2xl mx-auto ${isArabic ? "font-arabic" : ""}`}>
              {isArabic ? "نقدم لك تجربة متكاملة تتجاوز حدود الملعب لتصل إلى أسلوب حياة رياضي راقي." : "We offer a complete experience that goes beyond the court into a premium athletic lifestyle."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-6">
                  <Icon icon={feature.icon} className="w-7 h-7 text-primary" />
                </div>
                <h3 className={`font-bold text-xl mb-4 ${isArabic ? "font-arabic text-2xl" : ""}`}>
                  {isArabic ? feature.title.ar : feature.title.en}
                </h3>
                <p className={`text-white/60 leading-relaxed text-sm ${isArabic ? "font-arabic" : ""}`}>
                  {isArabic ? feature.desc.ar : feature.desc.en}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

About.layout = page => <AppLayout children={page} />;
