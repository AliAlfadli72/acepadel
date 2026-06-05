import AppLayout, { LangContext } from '../Layouts/AppLayout';
import { useContext } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

export default function Terms() {
  const { lang } = useContext(LangContext);
  const isArabic = lang === "ar";

  const sections = [
    {
      icon: "mdi:gavel",
      title: { ar: "1. قبول الشروط", en: "1. Acceptance of Terms" },
      content: {
        ar: "بمجرد دخولك إلى موقع أكاديمية آيس بادل أو استخدام تطبيق الموبايل، فإنك توافق على الالتزام بشروط الاستخدام هذه وجميع القوانين واللوائح المعمول بها.",
        en: "By accessing the Ace Padel Academy website or mobile application, you agree to be bound by these terms of use and all applicable laws and regulations."
      }
    },
    {
      icon: "mdi:calendar-clock",
      title: { ar: "2. سياسة الحجز والإلغاء", en: "2. Booking & Cancellation Policy" },
      content: {
        ar: "يجب تأكيد حجوزات الملاعب عبر الدفع المسبق من المحفظة أو نقدًا في الأكاديمية. يمكن إلغاء الحجز أو تعديله قبل 24 ساعة على الأقل من موعد اللعب لاسترداد القيمة بالكامل إلى محفظتك الإلكترونية. الإلغاء في غضون أقل من 24 ساعة غير قابل للاسترداد.",
        en: "Court bookings must be confirmed via wallet pre-payment or cash at the academy. Bookings can be cancelled or rescheduled at least 24 hours prior to the slot for a full refund to your e-wallet. Cancellations within less than 24 hours are non-refundable."
      }
    },
    {
      icon: "mdi:card-account-details-outline",
      title: { ar: "3. باقات بيلاتس والاشتراكات", en: "3. Pilates Packages & Subscriptions" },
      content: {
        ar: "باقات اشتراك البيلاتس صالحة للاستخدام للفترة المحددة عند الشراء (عادةً 30 يومًا). لا يمكن تمديد الباقات أو استرداد قيمتها نقدًا بعد الشراء. يلتزم المشترك بحضور الجلسات المحجوزة، وتخضع الجلسات لسياسة الإلغاء الخاصة بالبيلاتس.",
        en: "Pilates subscription packages are valid only for the duration specified at purchase (typically 30 days). Packages cannot be extended or refunded in cash after purchase. Subscribed players are responsible for attending booked sessions."
      }
    },
    {
      icon: "mdi:wallet-outline",
      title: { ar: "4. المحفظة الإلكترونية", en: "4. E-Wallet Usage" },
      content: {
        ar: "المبالغ المشحونة في المحفظة الإلكترونية مخصصة حصرياً لاستخدامها في حجز الملاعب وباقات البيلاتس داخل أكاديمية آيس بادل. الرصيد المشحون غير قابل للسحب النقدي أو التحويل لحسابات أخرى.",
        en: "Funds deposited in the e-wallet are exclusively for booking courts and Pilates packages at Ace Padel Academy. Deposited balances cannot be withdrawn in cash or transferred to other user accounts."
      }
    },
    {
      icon: "mdi:shield-alert-outline",
      title: { ar: "5. السلامة والمسؤولية", en: "5. Safety & Liability" },
      content: {
        ar: "أكاديمية آيس بادل غير مسؤولة عن أي إصابات جسدية تحدث للاعبين أثناء استخدام الملاعب أو المشاركة في جلسات البيلاتس والفعاليات. ننصح جميع اللاعبين بالقيام بالإحماء المناسب والتأكد من لياقتهم البدنية قبل اللعب. كما نخلي مسؤوليتنا عن فقدان أو تلف الممتلكات الشخصية داخل مرافقنا.",
        en: "Ace Padel Academy is not liable for any physical injuries sustained by players while using the courts or participating in Pilates sessions and events. We advise all players to warm up properly. We are also not responsible for the loss or damage of any personal belongings inside our facilities."
      }
    },
    {
      icon: "mdi:shield-lock-outline",
      title: { ar: "6. تعديل الشروط", en: "6. Modifications of Terms" },
      content: {
        ar: "تحتفظ الأكاديمية بالحق في مراجعة وتحديث شروط الاستخدام هذه في أي وقت دون إشعار مسبق. استمرارك في استخدام الموقع أو التطبيق بعد تعديل الشروط يعتبر قبولاً منك بالشروط الجديدة.",
        en: "The Academy reserves the right to revise and update these terms of use at any time without prior notice. Continued use of the website or mobile app after any changes constitutes acceptance of the new terms."
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
              <Icon icon="mdi:gavel" className="w-4 h-4 text-accent" />
              {isArabic ? "شروط الاستخدام" : "Terms & Conditions"}
            </span>
            <h1 className={`font-display font-black text-primary mt-6 mb-4 ${isArabic ? "font-arabic text-4xl md:text-5xl" : "text-5xl md:text-6xl"}`}>
              {isArabic ? "الشروط والأحكام" : "Terms & Conditions"}
            </h1>
            <p className={`text-gray-500 max-w-xl mx-auto text-sm md:text-base ${isArabic ? "font-arabic" : ""}`}>
              {isArabic
                ? "يرجى قراءة شروط استخدام مرافق أكاديمية آيس بادل بعناية قبل حجز الملاعب أو شراء الاشتراكات."
                : "Please read the terms and conditions of using Ace Padel Academy facilities carefully before booking courts or purchasing subscriptions."}
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
              {isArabic ? "هل لديك استفسارات بخصوص الشروط؟" : "Have Questions About Our Terms?"}
            </h4>
            <p className={`text-white/60 text-sm mt-2 ${isArabic ? "font-arabic" : ""}`}>
              {isArabic ? "فريق الدعم لدينا متواجد دائماً للإجابة على تساؤلاتك." : "Our support team is always ready to answer your inquiries."}
            </p>
          </div>
          <a
            href="tel:+963945000365"
            className="bg-accent text-primary px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-accent/80 transition-colors shrink-0 flex items-center gap-2"
          >
            <Icon icon="mdi:phone" className="w-4 h-4" />
            {isArabic ? "اتصل بالدعم" : "Call Support"}
          </a>
        </div>
      </div>
    </div>
  );
}

Terms.layout = page => <AppLayout children={page} />;
