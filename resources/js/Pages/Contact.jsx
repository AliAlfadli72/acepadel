
import AppLayout, { LangContext } from '../Layouts/AppLayout';
import {  useState , useContext } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Link } from "@inertiajs/react";

export default function Contact() {
  const { lang } = useContext(LangContext);

  const isArabic = lang === "ar";
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "", subject: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const messageText = isArabic
      ? `مرحباً الدعم الفني،\n\nأود إرسال رسالة تواصل:\n• الاسم: ${formData.name}\n• البريد: ${formData.email}\n• الهاتف: ${formData.phone || 'N/A'}\n• الموضوع: ${formData.subject}\n• الرسالة: ${formData.message}`
      : `Hello Support,\n\nI want to send a contact message:\n• Name: ${formData.name}\n• Email: ${formData.email}\n• Phone: ${formData.phone || 'N/A'}\n• Subject: ${formData.subject}\n• Message: ${formData.message}`;

    const encodedMessage = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/963945000365?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    setSent(true);
  };

  const contactCards = [
    {
      icon: "mdi:phone",
      title: { ar: "الهاتف", en: "Phone" },
      lines: [
        { label: { ar: "الخط الساخن", en: "Hotline" }, val: "0945 000 365", href: "tel:0945000365" },
        { label: { ar: "دعم فني", en: "Support" },      val: "0943 030 362", href: "tel:0943030362" },
        { label: { ar: "دعم فني", en: "Support" },      val: "0959 776 423", href: "tel:0959776423" },
      ],
      color: "bg-primary/10 text-primary",
    },
    {
      icon: "mdi:map-marker",
      title: { ar: "الموقع", en: "Location" },
      lines: [
        { label: { ar: "العنوان", en: "Address" }, val: isArabic ? "دمشق - أوتوستراد الفيحاء" : "Damascus — AlFayha Highway", href: "#map" },
        { label: { ar: "المجمع", en: "Complex" }, val: isArabic ? "الاتحاد الرياضي العسكري" : "Military Sports Union", href: "#map" },
      ],
      color: "bg-accent/20 text-primary",
    },
    {
      icon: "mdi:clock-outline",
      title: { ar: "ساعات العمل", en: "Opening Hours" },
      lines: [
        { label: { ar: "يومياً", en: "Daily" }, val: isArabic ? "7:00 صباحاً" : "7:00 AM", href: null },
        { label: { ar: "حتى",   en: "Until" }, val: isArabic ? "2:00 فجراً" : "2:00 AM",  href: null },
      ],
      color: "bg-green-100 text-primary",
    },
    {
      icon: "mdi:email-outline",
      title: { ar: "البريد الإلكتروني", en: "Email" },
      lines: [
        { label: { ar: "معلومات عامة", en: "General" }, val: "info@ace-academy.sy",    href: "mailto:info@ace-academy.sy"    },
        { label: { ar: "الحجوزات",     en: "Booking"  }, val: "booking@ace-academy.sy", href: "mailto:booking@ace-academy.sy" },
      ],
      color: "bg-primary/5 text-primary",
    },
  ];

  return (
    <div className="bg-white" dir={isArabic ? "rtl" : "ltr"}>
      {/* HERO */}
      <section className="border-b border-gray-200 py-20 px-6" style={{backgroundColor:'#F8FAF8'}}>
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-label mb-6">
              <Icon icon="mdi:message-outline" className="w-3.5 h-3.5" />
              {isArabic ? "تواصل معنا" : "Contact Us"}
            </span>
            <h1 className={`font-display font-black text-primary mt-6 mb-4 ${isArabic ? "font-arabic text-4xl md:text-5xl" : "text-5xl md:text-6xl"}`}>
              {isArabic ? "نحن هنا لخدمتك" : "We're Here For You"}
            </h1>
            <p className={`text-gray-500 max-w-xl mx-auto ${isArabic ? "font-arabic" : ""}`}>
              {isArabic
                ? "سواء كانت لديك استفسارات عن الحجز، الأكاديمية أو أي خدمة أخرى — فريقنا جاهز للمساعدة."
                : "Whether you have questions about booking, the academy, or any service — our team is ready to help."}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Contact Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {contactCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-gray-200 rounded-3xl p-6"
              style={{boxShadow:'0 2px 12px rgba(15,26,19,0.05)'}}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${card.color}`}>
                <Icon icon={card.icon} className="w-6 h-6" />
              </div>
              <h3 className={`font-bold text-gray-900 text-sm mb-4 ${isArabic ? "font-arabic" : ""}`}>
                {isArabic ? card.title.ar : card.title.en}
              </h3>
              <ul className="space-y-3">
                {card.lines.map(({ label, val, href }) => (
                  <li key={val}>
                    <p className={`text-[10px] uppercase text-gray-500 mb-0.5 ${isArabic ? "font-arabic tracking-normal" : "tracking-widest"}`}>
                      {isArabic ? label.ar : label.en}
                    </p>
                    {href ? (
                      <a href={href} className={`text-primary font-semibold text-sm hover:underline ${isArabic ? "font-arabic" : ""}`} dir="ltr">
                        {val}
                      </a>
                    ) : (
                      <p className={`text-gray-800 font-semibold text-sm ${isArabic ? "font-arabic" : ""}`} dir="ltr">{val}</p>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Map + Form */}
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Map */}
          <div className="lg:col-span-3">
            <h2 className={`font-display font-black text-primary text-3xl mb-6 ${isArabic ? "font-arabic" : ""}`}>
              {isArabic ? "موقعنا على الخريطة" : "Find Us on the Map"}
            </h2>
            <div id="map" className="w-full h-80 rounded-3xl overflow-hidden border border-gray-200 shadow-card" style={{backgroundColor:'#E8F0E8'}}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3326.5!2d36.28!3d33.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDMwJzAwLjAiTiAzNsKwMTYnNDguMCJF!5e0!3m2!1sen!2ssy!4v1713531000000"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "saturate(0.8) contrast(1.1)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ace Padel Academy Location"
              />
            </div>

            {/* Direction card */}
            <div className="mt-5 p-6 rounded-2xl border border-gray-200 flex items-center gap-4" style={{backgroundColor:'#F8FAF8'}}>
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <Icon icon="mdi:navigation" className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`font-bold text-gray-900 text-sm ${isArabic ? "font-arabic" : ""}`}>
                  {isArabic ? "أوتوستراد الفيحاء، الاتحاد الرياضي العسكري، دمشق" : "AlFayha Highway, Military Sports Union, Damascus"}
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-primary text-xs font-semibold hover:underline ${isArabic ? "font-arabic" : ""}`}
                >
                  {isArabic ? "فتح في خرائط جوجل ←" : "Open in Google Maps →"}
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <h2 className={`font-display font-black text-primary text-3xl mb-6 ${isArabic ? "font-arabic" : ""}`}>
              {isArabic ? "أرسل رسالة" : "Send a Message"}
            </h2>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4 shadow-accent-glow">
                  <Icon icon="mdi:check" className="w-8 h-8 text-primary" />
                </div>
                <h3 className={`font-bold text-primary text-xl mb-2 ${isArabic ? "font-arabic" : ""}`}>
                  {isArabic ? "تم إرسال رسالتك!" : "Message Sent!"}
                </h3>
                <p className={`text-gray-600 text-sm ${isArabic ? "font-arabic" : ""}`}>
                  {isArabic ? "سنرد عليك في أقرب وقت ممكن." : "We'll get back to you as soon as possible."}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {[
                  { name: "name",    type: "text",  placeholder: { ar: "الاسم الكامل", en: "Full Name" } },
                  { name: "email",   type: "email", placeholder: { ar: "البريد الإلكتروني", en: "Email Address" } },
                  { name: "phone",   type: "tel",   placeholder: { ar: "رقم الهاتف", en: "Phone Number" } },
                  { name: "subject", type: "text",  placeholder: { ar: "موضوع الرسالة", en: "Subject" } },
                ].map(({ name, type, placeholder }) => (
                  <input
                    key={name}
                    name={name}
                    type={type}
                    required={name !== "phone"}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={isArabic ? placeholder.ar : placeholder.en}
                    className={`w-full border border-gray-300 bg-white rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-gray-400 ${isArabic ? "font-arabic" : ""}`}
                  />
                ))}
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={isArabic ? "رسالتك..." : "Your message..."}
                  className={`w-full border border-gray-300 bg-white rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none placeholder:text-gray-400 ${isArabic ? "font-arabic" : ""}`}
                />
                <button type="submit" className="btn-primary w-full justify-center">
                  <Icon icon="mdi:send" className="w-5 h-5" />
                  {isArabic ? "إرسال الرسالة" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="mt-12 bg-forest-gradient rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#25D366] flex items-center justify-center shadow-lg shrink-0">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <p className={`text-white font-bold text-lg ${isArabic ? "font-arabic" : ""}`}>
                {isArabic ? "تواصل معنا على واتساب فوراً" : "Chat With Us on WhatsApp Now"}
              </p>
              <p className={`text-white/60 text-sm ${isArabic ? "font-arabic" : ""}`}>
                {isArabic ? "نرد في أقل من دقيقة" : "We reply in under a minute"}
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/963945000365"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent shrink-0"
          >
            <Icon icon="mdi:whatsapp" className="w-5 h-5" />
            {isArabic ? "ابدأ المحادثة" : "Start Chat"}
          </a>
        </div>
      </div>
    </div>
  );
}
Contact.layout = page => <AppLayout children={page} />;
