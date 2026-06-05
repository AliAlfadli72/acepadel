import AppLayout, { LangContext } from '../Layouts/AppLayout';
import { useContext } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

export default function Privacy() {
  const { lang } = useContext(LangContext);
  const isArabic = lang === "ar";

  const sections = [
    {
      icon: "mdi:account-box-multiple-outline",
      title: { ar: "1. البيانات التي نجمعها", en: "1. Information We Collect" },
      content: {
        ar: "نقوم بجمع البيانات الشخصية اللازمة لتقديم وتحسين خدماتنا، بما في ذلك الاسم، رقم الهاتف، البريد الإلكتروني، رمز جهاز الإشعارات (FCM Token)، صورة الملف الشخصي، وتفاصيل الحجوزات والمعاملات المالية للمحفظة.",
        en: "We collect personal information necessary to deliver and improve our services, including name, phone number, email address, push notification token (FCM Token), profile avatar, booking history, and e-wallet transactions."
      }
    },
    {
      icon: "mdi:file-cog-outline",
      title: { ar: "2. كيف نستخدم بياناتك", en: "2. How We Use Your Data" },
      content: {
        ar: "نستخدم بياناتك لتسهيل عملية حجز الملاعب وجلسات البيلاتس، وإدارة معاملات المحفظة الإلكترونية، وإرسال تنبيهات حالة الحجوزات والعروض والفعاليات عبر إشعارات الموبايل والرسائل.",
        en: "We use your data to facilitate court and Pilates bookings, manage e-wallet transactions, and send real-time notification alerts regarding booking confirmations, special offers, and upcoming events."
      }
    },
    {
      icon: "mdi:shield-key-outline",
      title: { ar: "3. أمان وحماية البيانات", en: "3. Data Security & Protection" },
      content: {
        ar: "نحن نولي أمان بياناتك أهمية قصوى. نقوم بتشفير كلمات المرور وحماية كافة البيانات الحساسة على خوادم آمنة لمنع الوصول غير المصرح به أو تعديل أو كشف البيانات الشخصية للمشتركين.",
        en: "We take your data security seriously. We encrypt passwords and store all sensitive data on secure servers to prevent unauthorized access, alteration, disclosure, or destruction of personal player records."
      }
    },
    {
      icon: "mdi:account-cancel-outline",
      title: { ar: "4. الاحتفاظ بالبيانات وحذف الحساب", en: "4. Data Retention & Account Deletion" },
      content: {
        ar: "نحتفظ ببياناتك طالما كان حسابك نشطاً. يمكنك طلب تعديل بيانات ملفك الشخصي أو إرسال طلب لحذف حسابك وبياناتك نهائياً من أنظمتنا في أي وقت عبر إعدادات التطبيق أو بالتواصل مع الإدارة.",
        en: "We retain your data as long as your account is active. You can request to edit your profile details or request to delete your account and associated records permanently from our systems at any time via the app settings or by contacting our administration."
      }
    },
    {
      icon: "mdi:handshake-outline",
      title: { ar: "5. مشاركة البيانات مع أطراف ثالثة", en: "5. Third-Party Sharing" },
      content: {
        ar: "أكاديمية آيس بادل لا تبيع ولا تتاجر ولا تشارك بياناتك الشخصية مع أي جهات خارجية أو أطراف ثالثة لأغراض تسويقية. يتم استخدامها حصرياً لتشغيل التطبيق والموقع وخدمات الأكاديمية.",
        en: "Ace Padel Academy does not sell, trade, or share your personal data with any external third parties for marketing purposes. Your data is used exclusively to operate the application, website, and academy booking services."
      }
    }
  ];

  return (
    <div className="bg-white min-h-screen pb-20" dir={isArabic ? "rtl" : "ltr"}>
      {/* HERO */}
      <section className="border-b border-gray-200 py-20 px-6" style={{ backgroundColor: '#F8FAF8' }}>
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-label mb-6 flex items-center justify-center gap-2 max-w-max mx-auto px-4 py-2 bg-primary/5 rounded-full text-xs text-primary font-bold">
              <Icon icon="mdi:shield-check-outline" className="w-4 h-4 text-accent" />
              {isArabic ? "خصوصيتك محمية" : "Privacy Protected"}
            </span>
            <h1 className={`font-display font-black text-primary mt-6 mb-4 ${isArabic ? "font-arabic text-4xl md:text-5xl" : "text-5xl md:text-6xl"}`}>
              {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
            </h1>
            <p className={`text-gray-500 max-w-xl mx-auto text-sm md:text-base ${isArabic ? "font-arabic" : ""}`}>
              {isArabic
                ? "نحن ملتزمون بحماية خصوصية بياناتك الشخصية وتوفير تجربة استخدام آمنة وموثوقة لجميع مستخدمينا."
                : "We are committed to protecting the privacy of your personal data and providing a safe, reliable user experience for all our players."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-12">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="flex gap-5 items-start bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                <Icon icon={section.icon} className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className={`text-lg md:text-xl font-bold text-primary mb-3 ${isArabic ? "font-arabic" : ""}`}>
                  {isArabic ? section.title.ar : section.title.en}
                </h3>
                <p className={`text-gray-600 text-sm md:text-base leading-relaxed ${isArabic ? "font-arabic text-justify" : "text-justify"}`}>
                  {isArabic ? section.content.ar : section.content.en}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Contact Note */}
        <div className="mt-16 bg-primary text-white rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div>
            <h4 className={`text-lg font-bold ${isArabic ? "font-arabic" : ""}`}>
              {isArabic ? "لديك أي استفسار حول الخصوصية؟" : "Have Questions About Your Privacy?"}
            </h4>
            <p className={`text-white/60 text-sm mt-2 ${isArabic ? "font-arabic" : ""}`}>
              {isArabic ? "راسلنا في أي وقت وسنقوم بمراجعة استفسارك في أقرب وقت." : "Write to us at any time and we will review your inquiries as soon as possible."}
            </p>
          </div>
          <a
            href="mailto:privacy@ace-academy.sy"
            className="bg-accent text-primary px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-accent/80 transition-colors shrink-0 flex items-center gap-2"
          >
            <Icon icon="mdi:email-outline" className="w-4 h-4" />
            {isArabic ? "راسل مسؤول الخصوصية" : "Email Privacy Officer"}
          </a>
        </div>
      </div>
    </div>
  );
}

Privacy.layout = page => <AppLayout children={page} />;
