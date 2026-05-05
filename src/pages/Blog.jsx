import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

const POSTS = [
  {
    id: 1,
    category: { ar: "تقنيات البادل", en: "Padel Techniques" },
    title: { ar: "أسرار الـ Bandeja: الضربة التي تغير المباريات", en: "Mastering the Bandeja: The Game-Changing Shot" },
    excerpt: { ar: "ضربة الـ Bandeja هي أحد أكثر الأسلحة فعالية في رياضة البادل. تعلم كيف تتقنها خطوة بخطوة مع مدربينا.", en: "The Bandeja is one of the most effective weapons in padel. Learn how to master it step by step with our coaches." },
    readTime: { ar: "5 دقائق", en: "5 min read" },
    date: { ar: "15 أبريل 2026", en: "Apr 15, 2026" },
    icon: "mdi:tennis-ball",
  },
  {
    id: 2,
    category: { ar: "نصائح صحية", en: "Health Tips" },
    title: { ar: "التغذية المثالية لرياضي البادل قبل المباراة وبعدها", en: "Optimal Nutrition for Padel Athletes: Before & After Match" },
    excerpt: { ar: "التغذية الصحيحة تحدث فرقاً كبيراً في أدائك على الملعب. اكتشف الوجبات المثالية التي يوصي بها خبراؤنا.", en: "Proper nutrition makes a huge difference in your court performance. Discover the optimal meals recommended by our experts." },
    readTime: { ar: "7 دقائق", en: "7 min read" },
    date: { ar: "10 أبريل 2026", en: "Apr 10, 2026" },
    icon: "mdi:food-apple",
  },
  {
    id: 3,
    category: { ar: "البيلاتس", en: "Pilates" },
    title: { ar: "كيف يساعد البيلاتس في تحسين أدائك في البادل", en: "How Pilates Enhances Your Padel Performance" },
    excerpt: { ar: "العلاقة بين البيلاتس والبادل أعمق مما تتخيل. تقوية العضلات الأساسية (Core) تعني تحكماً أفضل في الضربات.", en: "The connection between Pilates and padel is deeper than you think. Strengthening core muscles means better shot control." },
    readTime: { ar: "6 دقائق", en: "6 min read" },
    date: { ar: "05 أبريل 2026", en: "Apr 05, 2026" },
    icon: "mdi:yoga",
  },
  {
    id: 4,
    category: { ar: "الأكاديمية", en: "Academy" },
    title: { ar: "Ace Juniors: كيف نبني أبطال المستقبل في دمشق", en: "Ace Juniors: How We Build Tomorrow's Champions in Damascus" },
    excerpt: { ar: "برنامج Ace Juniors ليس مجرد تدريب، بل هو منهج متكامل لبناء الشخصية والمهارات الرياضية معاً.", en: "Ace Juniors isn't just training—it's a complete curriculum for building character and athletic skills together." },
    readTime: { ar: "8 دقائق", en: "8 min read" },
    date: { ar: "01 أبريل 2026", en: "Apr 01, 2026" },
    icon: "mdi:whistle",
  },
  {
    id: 5,
    category: { ar: "تقنيات البادل", en: "Padel Techniques" },
    title: { ar: "فهم اللعب بالجدار: عمق رياضة البادل", en: "Understanding Wall Play: The Depth of Padel" },
    excerpt: { ar: "الجدران في رياضة البادل ليست عائقاً، بل هي أداة تكتيكية رائعة. تعلم كيف تحوّل الجدار إلى سلاحك الأمضى.", en: "Walls in padel aren't obstacles—they're a powerful tactical tool. Learn how to turn the wall into your most effective weapon." },
    readTime: { ar: "6 دقائق", en: "6 min read" },
    date: { ar: "28 مارس 2026", en: "Mar 28, 2026" },
    icon: "mdi:tennis-ball",
  },
  {
    id: 6,
    category: { ar: "نمط الحياة", en: "Lifestyle" },
    title: { ar: "ثقافة البادل: أكثر من مجرد رياضة في سوريا", en: "Padel Culture: More Than Just a Sport in Syria" },
    excerpt: { ar: "رياضة البادل تتحول إلى ظاهرة اجتماعية في دمشق. كيف تساهم آيس بادل أكاديمي في هذا التحول؟", en: "Padel is becoming a social phenomenon in Damascus. How is Ace Padel Academy contributing to this transformation?" },
    readTime: { ar: "5 دقائق", en: "5 min read" },
    date: { ar: "22 مارس 2026", en: "Mar 22, 2026" },
    icon: "mdi:account-group",
  },
];

const CATS = [
  { key: "all",              ar: "الكل",           en: "All" },
  { key: "Padel Techniques", ar: "تقنيات البادل",  en: "Padel Techniques" },
  { key: "Health Tips",      ar: "نصائح صحية",     en: "Health Tips" },
  { key: "Pilates",          ar: "البيلاتس",       en: "Pilates" },
  { key: "Academy",          ar: "الأكاديمية",     en: "Academy" },
  { key: "Lifestyle",        ar: "نمط الحياة",     en: "Lifestyle" },
];

export default function Blog({ lang }) {
  const isArabic = lang === "ar";
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all"
    ? POSTS
    : POSTS.filter(p => p.category.en === filter);

  return (
    <div className="bg-white" dir={isArabic ? "rtl" : "ltr"}>
      {/* HERO */}
      <section className="border-b border-gray-200 py-20 px-6" style={{backgroundColor:'#F8FAF8'}}>
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-label mb-6">
              <Icon icon="mdi:post-outline" className="w-3.5 h-3.5" />
              {isArabic ? "المدونة" : "Blog & Insights"}
            </span>
            <h1 className={`font-display font-black text-primary mt-6 mb-4 ${isArabic ? "font-arabic text-4xl md:text-5xl" : "text-5xl md:text-6xl"}`}>
              {isArabic ? "معرفة ورياضة" : "Knowledge & Sport"}
            </h1>
            <p className={`text-gray-500 max-w-2xl mx-auto ${isArabic ? "font-arabic" : ""}`}>
              {isArabic
                ? "نصائح من مدربينا، تقنيات البادل، وإرشادات العافية لتطوير مستواك ورفع جودة حياتك."
                : "Tips from our coaches, padel techniques, and wellness insights to elevate your game and quality of life."}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Filter */}
        <div className="flex flex-wrap gap-3 mb-12 overflow-x-auto pb-2">
          {CATS.map((cat) => (
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

        {/* Featured Post (first) */}
        {filter === "all" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-3xl mb-10 overflow-hidden grid md:grid-cols-2"
            style={{boxShadow:'0 2px 20px rgba(15,26,19,0.06)'}}
          >
            <div className="bg-forest-gradient p-12 flex flex-col justify-center">
              <span className={`text-accent text-xs font-bold uppercase tracking-widest mb-4 ${isArabic ? "font-arabic tracking-normal" : ""}`}>
                {isArabic ? "مميز" : "Featured"}
              </span>
              <h2 className={`text-white font-display font-black text-3xl mb-4 ${isArabic ? "font-arabic" : ""}`}>
                {isArabic ? POSTS[0].title.ar : POSTS[0].title.en}
              </h2>
              <p className={`text-white/70 text-sm leading-relaxed mb-8 ${isArabic ? "font-arabic" : ""}`}>
                {isArabic ? POSTS[0].excerpt.ar : POSTS[0].excerpt.en}
              </p>
              <button className="btn-accent self-start">
                <Icon icon="mdi:arrow-right" className="w-4 h-4" />
                {isArabic ? "اقرأ المقالة" : "Read Article"}
              </button>
            </div>
            <div className="flex items-center justify-center p-12" style={{backgroundColor:'#F8FAF8'}}>
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon icon="mdi:tennis-ball" className="w-16 h-16 text-primary" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filter === "all" ? filtered.slice(1) : filtered).map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white border border-gray-200 rounded-3xl p-8 group flex flex-col"
              style={{boxShadow:'0 2px 12px rgba(15,26,19,0.05)'}}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Icon icon={post.icon} className="w-7 h-7 text-primary" />
              </div>
              <span className={`text-xs font-bold text-primary uppercase mb-3 ${isArabic ? "font-arabic tracking-normal" : "tracking-widest"}`}>
                {isArabic ? post.category.ar : post.category.en}
              </span>
              <h3 className={`font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors flex-grow ${isArabic ? "font-arabic text-lg" : "text-xl"}`}>
                {isArabic ? post.title.ar : post.title.en}
              </h3>
              <p className={`text-gray-600 text-sm leading-relaxed mb-6 ${isArabic ? "font-arabic" : ""}`}>
                {isArabic ? post.excerpt.ar : post.excerpt.en}
              </p>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Icon icon="mdi:clock-outline" className="w-3.5 h-3.5" />
                  <span className={isArabic ? "font-arabic" : ""}>{isArabic ? post.readTime.ar : post.readTime.en}</span>
                </div>
                <button className={`text-primary text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all ${isArabic ? "font-arabic" : ""}`}>
                  {isArabic ? "اقرأ المزيد" : "Read More"}
                  <Icon icon="mdi:arrow-right" className="w-4 h-4" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}