
import AppLayout, { LangContext } from '../Layouts/AppLayout';
import { motion } from "framer-motion";
import {  useRef , useContext } from "react";
import { useInView } from "framer-motion";
import { Icon } from "@iconify/react";
import { Link } from "@inertiajs/react";

function FadeIn({ children, delay = 0, direction = "up", className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: direction === "up" ? 30 : direction === "down" ? -30 : 0, x: direction === "left" ? 30 : direction === "right" ? -30 : 0 }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const SERVICES = [
  {
    id: "courts",
    icon: "mdi:tennis-ball",
    tag: { ar: "FIP معتمد", en: "FIP Certified" },
    title: { ar: "ملاعب البادل الاحترافية", en: "Professional Padel Courts" },
    description: {
      ar: "ملاعبنا مصممة وفق أعلى المواصفات العالمية وتحمل اعتماد الاتحاد الدولي للبادل (FIP). كل تفصيل مدروس لضمان أفضل تجربة لعب ممكنة.",
      en: "Our courts are designed to the highest global standards and carry FIP certification. Every detail is considered to ensure the best possible playing experience.",
    },
    features: [
      { icon: "mdi:grass", ar: "عشب صناعي من الجيل الثالث", en: "3rd-generation artificial turf" },
      { icon: "mdi:lightbulb-on", ar: "إضاءة LED تمنع الوهج", en: "Anti-glare LED lighting" },
      { icon: "mdi:shield-check", ar: "مطابق لمعايير FIP", en: "FIP standards compliant" },
      { icon: "mdi:thermometer", ar: "تهوية مثالية", en: "Optimal ventilation" },
    ],
    price: { ar: "من 2000 ل.س / ساعة", en: "From 2,000 SYP/hour" },
    image: "/hero-court.png",
    color: "bg-primary/10 text-primary",
  },
  {
    id: "academy",
    icon: "mdi:whistle",
    tag: { ar: "تدريب", en: "Training" },
    title: { ar: "أكاديمية آيس للتدريب", en: "Ace Training Academy" },
    description: {
      ar: "برامج تدريبية متخصصة تناسب كل المستويات، من Ace Juniors للناشئين إلى دروس متقدمة للمحترفين، بإشراف مدربين معتمدين دولياً.",
      en: "Specialized training programs for all levels, from Ace Juniors for beginners to advanced lessons for professionals, led by internationally certified coaches.",
    },
    features: [
      { icon: "mdi:account-group", ar: "برنامج Ace Juniors للناشئين", en: "Ace Juniors program" },
      { icon: "mdi:star-circle", ar: "دروس للمحترفين", en: "Professional-level lessons" },
      { icon: "mdi:account-multiple", ar: "حصص جماعية تفاعلية", en: "Interactive group sessions" },
      { icon: "mdi:certificate", ar: "مدربون معتمدون دولياً", en: "Internationally certified coaches" },
    ],
    price: { ar: "من 1500 ل.س / حصة", en: "From 1,500 SYP/session" },
    image: "/hero-court.png",
    color: "bg-accent/20 text-primary",
  },
  {
    id: "pilates",
    icon: "mdi:yoga",
    tag: { ar: "عافية", en: "Wellness" },
    title: { ar: "استوديو البيلاتس", en: "Pilates Studio" },
    description: {
      ar: "استوديو مصمم خصيصاً لتكملة رياضة البادل، بالتركيز على القوة الذهنية والثبات العضلي وتقليل الإصابات بأسلوب متطور وبيئة هادئة.",
      en: "Studio specially designed to complement padel sports, focusing on mental strength, muscle stability, and injury reduction through advanced techniques.",
    },
    features: [
      { icon: "mdi:brain", ar: "تقوية التركيز الذهني", en: "Mental focus training" },
      { icon: "mdi:arm-flex", ar: "تحسين الثبات العضلي", en: "Muscle stability improvement" },
      { icon: "mdi:shield-check", ar: "الوقاية من الإصابات", en: "Injury prevention" },
      { icon: "mdi:leaf", ar: "تمارين مكملة لرياضيي البادل", en: "Complementary padel workouts" },
    ],
    price: { ar: "من 1000 ل.س / جلسة", en: "From 1,000 SYP/session" },
    image: "/pilates-studio.png",
    color: "bg-green-100 text-primary",
  },
  {
    id: "social",
    icon: "mdi:food-fork-drink",
    tag: { ar: "اجتماعي", en: "Social" },
    title: { ar: "الركن الاجتماعي", en: "Social Corner" },
    description: {
      ar: "فود كورت يقدم قائمة طعام صحية متنوعة وتيراس خارجي بإطلالة خلابة على الملاعب، لتجربة اجتماعية راقية بعد اللعب أو لمشاهدة المباريات.",
      en: "A healthy food court with a diverse menu and an open terrace with stunning views of the courts, for a premium social experience after games.",
    },
    features: [
      { icon: "mdi:leaf", ar: "قائمة طعام صحية ومتنوعة", en: "Healthy & diverse menu" },
      { icon: "mdi:sofa", ar: "تيراس خارجي مريح", en: "Comfortable outdoor terrace" },
      { icon: "mdi:eye", ar: "إطلالة مباشرة على الملاعب", en: "Direct court views" },
      { icon: "mdi:wifi", ar: "واي فاي مجاني وسريع", en: "Free high-speed Wi-Fi" },
    ],
    price: { ar: "يفتح للجميع", en: "Open to all" },
    image: "/social-terrace.png",
    color: "bg-emerald-50 text-primary",
  },
];

export default function Services() {
  const { lang } = useContext(LangContext);

  const isArabic = lang === "ar";

  return (
    <div className="bg-white" dir={isArabic ? "rtl" : "ltr"}>
      {/* PAGE HERO */}
      <section className="border-b border-gray-200 py-20 px-6" style={{backgroundColor:'#F8FAF8'}}>
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label mb-6">
              <Icon icon="mdi:view-grid" className="w-3.5 h-3.5" />
              {isArabic ? "خدماتنا" : "Our Services"}
            </span>
            <h1 className={`font-display font-black text-primary mt-6 mb-4 ${isArabic ? "font-arabic text-4xl md:text-5xl" : "text-5xl md:text-6xl"}`}>
              {isArabic ? "منظومة خدمات متكاملة" : "Complete Service Ecosystem"}
            </h1>
            <p className={`text-gray-500 max-w-2xl mx-auto ${isArabic ? "font-arabic" : ""}`}>
              {isArabic
                ? "تجربة شاملة تدمج الرياضة بالعافية والتواصل الاجتماعي. كل شيء تحتاجه في مكان واحد."
                : "A comprehensive experience combining sports, wellness, and social connection. Everything you need in one place."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* SERVICES LIST */}
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-32">
        {SERVICES.map((svc, idx) => (
          <FadeIn key={svc.id} delay={0.05}>
            <div className={`grid lg:grid-cols-2 gap-16 items-center ${idx % 2 !== 0 ? "lg:flex-row-reverse" : ""}`}>
              {/* Image */}
              <div className={idx % 2 !== 0 ? "lg:order-2" : ""}>
                <div className="relative rounded-[28px] overflow-hidden shadow-card-hover aspect-[4/3]">
                  <img
                    src={svc.image}
                    alt={isArabic ? svc.title.ar : svc.title.en}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-5 left-5">
                    <span className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full ${svc.color} border border-black/10`}>
                      {isArabic ? svc.tag.ar : svc.tag.en}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={idx % 2 !== 0 ? "lg:order-1" : ""}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${svc.color}`}>
                  <Icon icon={svc.icon} className="w-7 h-7" />
                </div>

                <h2 className={`font-display font-black text-primary mb-4 ${isArabic ? "font-arabic text-3xl md:text-4xl" : "text-4xl md:text-5xl"}`}>
                  {isArabic ? svc.title.ar : svc.title.en}
                </h2>
                <p className={`text-gray-600 leading-relaxed mb-8 ${isArabic ? "font-arabic" : ""}`}>
                  {isArabic ? svc.description.ar : svc.description.en}
                </p>

                <ul className="space-y-3 mb-8">
                  {svc.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon icon={f.icon} className="w-4 h-4 text-primary" />
                      </div>
                      <span className={`text-gray-600 text-sm ${isArabic ? "font-arabic" : ""}`}>
                        {isArabic ? f.ar : f.en}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-4 flex-wrap">
                  <Link href="/book-court" className="btn-primary">
                    <Icon icon="mdi:calendar-check" className="w-5 h-5" />
                    {isArabic ? "احجز الآن" : "Book Now"}
                  </Link>
                  <div className={`text-sm font-bold text-primary ${isArabic ? "font-arabic" : ""}`}>
                    {isArabic ? svc.price.ar : svc.price.en}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
Services.layout = page => <AppLayout children={page} />;
