import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

const COURTS = [
  { id: 1, name: { ar: "ملعب 1 — الماس", en: "Court 1 — Diamond" }, type: { ar: "مغطى", en: "Indoor" } },
  { id: 2, name: { ar: "ملعب 2 — زمرد",  en: "Court 2 — Emerald"  }, type: { ar: "مغطى", en: "Indoor" } },
  { id: 3, name: { ar: "ملعب 3 — عقيق",  en: "Court 3 — Ruby"    }, type: { ar: "مغطى", en: "Indoor" } },
  { id: 4, name: { ar: "ملعب 4 — ذهب",   en: "Court 4 — Gold"    }, type: { ar: "خارجي", en: "Outdoor"} },
  { id: 5, name: { ar: "ملعب 5 — فضة",   en: "Court 5 — Silver"  }, type: { ar: "خارجي", en: "Outdoor"} },
  { id: 6, name: { ar: "ملعب 6 — بلاتين",en: "Court 6 — Platinum"}, type: { ar: "مغطى", en: "Indoor" } },
];

const SLOTS = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
  "19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00",
];

// Randomly mark some slots as booked for realism
const BOOKED = new Set(["09:00-1", "10:00-2", "17:00-1", "18:00-3", "20:00-2", "21:00-4"]);

const DAYS = [
  { date: "2026-04-20", label: { ar: "الإثنين 20", en: "Mon 20" } },
  { date: "2026-04-21", label: { ar: "الثلاثاء 21", en: "Tue 21" } },
  { date: "2026-04-22", label: { ar: "الأربعاء 22", en: "Wed 22" } },
  { date: "2026-04-23", label: { ar: "الخميس 23", en: "Thu 23" } },
  { date: "2026-04-24", label: { ar: "الجمعة 24", en: "Fri 24" } },
  { date: "2026-04-25", label: { ar: "السبت 25", en: "Sat 25" } },
  { date: "2026-04-26", label: { ar: "الأحد 26", en: "Sun 26" } },
];

export default function Booking({ lang }) {
  const isArabic = lang === "ar";
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDay,   setSelectedDay]   = useState(DAYS[0].date);
  const [selectedSlot,  setSelectedSlot]  = useState(null);
  const [step,          setStep]          = useState(1);
  const [name,          setName]          = useState("");
  const [phone,         setPhone]         = useState("");
  const [confirmed,     setConfirmed]     = useState(false);

  function handleConfirm() {
    if (!selectedCourt || !selectedSlot || !name || !phone) return;
    setConfirmed(true);
    setStep(3);
  }

  return (
    <div className="bg-white min-h-screen" dir={isArabic ? "rtl" : "ltr"}>
      {/* HERO */}
      <section className="border-b border-gray-200 py-20 px-6" style={{backgroundColor:'#F8FAF8'}}>
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-label mb-6">
              <Icon icon="mdi:calendar-check" className="w-3.5 h-3.5" />
              {isArabic ? "نظام الحجز" : "Booking System"}
            </span>
            <h1 className={`font-display font-black text-primary mt-6 mb-4 ${isArabic ? "font-arabic text-4xl md:text-5xl" : "text-5xl md:text-6xl"}`}>
              {isArabic ? "احجز ملعبك الآن" : "Book Your Court Now"}
            </h1>
            <p className={`text-gray-500 max-w-xl mx-auto ${isArabic ? "font-arabic" : ""}`}>
              {isArabic ? "اختر ملعبك، حدد الوقت المناسب واحجز في ثوانٍ" : "Choose your court, pick your time, and book in seconds"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* STEPS INDICATOR */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-center gap-4 mb-12">
          {[
            { n: 1, ar: "الملعب والوقت", en: "Court & Time" },
            { n: 2, ar: "بياناتك", en: "Your Details" },
            { n: 3, ar: "تأكيد", en: "Confirmed" },
          ].map(({ n, ar, en }) => (
            <div key={n} className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step >= n ? "bg-primary text-white" : "bg-gray-100 border border-gray-200 text-gray-500"
                }`}
              >
                {step > n ? <Icon icon="mdi:check" className="w-4 h-4" /> : n}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${step >= n ? "text-primary" : "text-gray-500"} ${isArabic ? "font-arabic" : ""}`}>
                {isArabic ? ar : en}
              </span>
              {n < 3 && <div className={`w-12 h-[2px] ${step > n ? "bg-primary" : "bg-gray-200"} transition-all`} />}
            </div>
          ))}
        </div>

        {/* STEP 1 — COURT & TIME */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Select Court */}
            <div className="mb-10">
              <h2 className={`font-bold text-gray-900 mb-5 ${isArabic ? "font-arabic text-xl" : "text-lg"}`}>
                {isArabic ? "1. اختر الملعب" : "1. Select a Court"}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {COURTS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCourt(c.id)}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      selectedCourt === c.id
                        ? "border-primary bg-primary/5 shadow-green-glow"
                        : "border-gray-200 hover:border-primary/50 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedCourt === c.id ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>
                        <span className="text-sm font-bold">{c.id}</span>
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${isArabic ? "font-arabic" : ""} ${
                        isArabic ? c.type.ar === "مغطى" : c.type.en === "Indoor"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-accent/20 text-primary border-accent/30"
                      }`}>
                        {isArabic ? c.type.ar : c.type.en}
                      </span>
                    </div>
                    <p className={`font-bold text-gray-900 text-sm ${isArabic ? "font-arabic" : ""}`}>
                      {isArabic ? c.name.ar : c.name.en}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Day */}
            <div className="mb-10">
              <h2 className={`font-bold text-gray-900 mb-5 ${isArabic ? "font-arabic text-xl" : "text-lg"}`}>
                {isArabic ? "2. اختر اليوم" : "2. Select a Day"}
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {DAYS.map((d) => (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDay(d.date)}
                    className={`shrink-0 px-5 py-3 rounded-xl border text-sm font-semibold transition-all ${
                      selectedDay === d.date
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 hover:border-primary/50 text-gray-600"
                    } ${isArabic ? "font-arabic" : ""}`}
                  >
                    {isArabic ? d.label.ar : d.label.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Time */}
            <div className="mb-10">
              <h2 className={`font-bold text-gray-900 mb-5 ${isArabic ? "font-arabic text-xl" : "text-lg"}`}>
                {isArabic ? "3. اختر الوقت (7 ص – 2 ص)" : "3. Select Time (7 AM – 2 AM)"}
              </h2>
              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
                {SLOTS.map((slot) => {
                  const key = `${slot}-${selectedCourt}`;
                  const isBooked = BOOKED.has(key);
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      disabled={isBooked}
                      onClick={() => !isBooked && setSelectedSlot(slot)}
                      className={`time-slot text-center ${isSelected ? "selected" : ""} ${isBooked ? "booked" : ""}`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-6 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary/10 border border-primary/30" />
                  <span className={isArabic ? "font-arabic" : ""}>{isArabic ? "متاح" : "Available"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary border-primary" />
                  <span className={isArabic ? "font-arabic" : ""}>{isArabic ? "مختار" : "Selected"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200 opacity-50" />
                  <span className={isArabic ? "font-arabic" : ""}>{isArabic ? "محجوز" : "Booked"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => selectedCourt && selectedSlot && setStep(2)}
              disabled={!selectedCourt || !selectedSlot}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon icon="mdi:arrow-right" className="w-5 h-5" />
              {isArabic ? "التالي" : "Next Step"}
            </button>
          </motion.div>
        )}

        {/* STEP 2 — DETAILS */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className={`font-bold text-gray-900 text-xl mb-8 ${isArabic ? "font-arabic" : ""}`}>
              {isArabic ? "بياناتك الشخصية" : "Your Details"}
            </h2>

            {/* Summary */}
            <div className="rounded-2xl border border-gray-200 p-6 mb-8" style={{backgroundColor:'#F8FAF8'}}>
              <h3 className={`text-xs uppercase tracking-widest text-gray-500 mb-4 ${isArabic ? "font-arabic tracking-normal" : ""}`}>
                {isArabic ? "ملخص الحجز" : "Booking Summary"}
              </h3>
              {[
                { icon: "mdi:tennis-ball", label: isArabic ? "الملعب" : "Court", val: COURTS.find(c => c.id === selectedCourt)?.[isArabic ? "name" : "name"]?.[lang] },
                { icon: "mdi:calendar", label: isArabic ? "التاريخ" : "Date", val: DAYS.find(d => d.date === selectedDay)?.label?.[lang] },
                { icon: "mdi:clock", label: isArabic ? "الوقت" : "Time", val: selectedSlot },
              ].map(({ icon, label, val }) => (
                <div key={label} className="flex items-center gap-3 py-3 border-b border-gray-200 last:border-0">
                  <Icon icon={icon} className="w-5 h-5 text-primary" />
                  <span className={`text-gray-500 text-sm ${isArabic ? "font-arabic" : ""}`}>{label}:</span>
                  <span className={`font-bold text-gray-900 text-sm ${isArabic ? "font-arabic" : ""}`}>{val}</span>
                </div>
              ))}
            </div>

            <div className="space-y-5">
              <div>
                <label className={`block text-sm font-semibold text-gray-800 mb-2 ${isArabic ? "font-arabic" : ""}`}>
                  {isArabic ? "الاسم الكامل" : "Full Name"}
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isArabic ? "أدخل اسمك الكامل" : "Enter your full name"}
                  className={`w-full border border-gray-300 bg-white rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm ${isArabic ? "font-arabic" : ""}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold text-gray-800 mb-2 ${isArabic ? "font-arabic" : ""}`}>
                  {isArabic ? "رقم الهاتف" : "Phone Number"}
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+963 XXX XXX XXX"
                  dir="ltr"
                  className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-mono"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep(1)} className="btn-outline">
                <Icon icon="mdi:arrow-left" className="w-5 h-5" />
                {isArabic ? "السابق" : "Back"}
              </button>
              <button
                onClick={handleConfirm}
                disabled={!name || !phone}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon icon="mdi:check-circle" className="w-5 h-5" />
                {isArabic ? "تأكيد الحجز" : "Confirm Booking"}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3 — CONFIRMED */}
        {step === 3 && confirmed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mx-auto mb-8 shadow-accent-glow">
              <Icon icon="mdi:check-decagram" className="w-12 h-12 text-primary" />
            </div>
            <h2 className={`font-display font-black text-primary text-4xl mb-4 ${isArabic ? "font-arabic" : ""}`}>
              {isArabic ? "تم الحجز بنجاح!" : "Booking Confirmed!"}
            </h2>
            <p className={`text-gray-600 mb-8 max-w-md mx-auto ${isArabic ? "font-arabic" : ""}`}>
              {isArabic
                ? `مرحباً ${name}! حجزك لملعب رقم ${selectedCourt} في ${selectedSlot} تم تأكيده. سنتصل بك على رقم ${phone}.`
                : `Hello ${name}! Your booking for Court ${selectedCourt} at ${selectedSlot} is confirmed. We'll contact you at ${phone}.`}
            </p>
            <div className="rounded-3xl border border-gray-200 p-8 inline-block mb-8 text-left" style={{backgroundColor:'#F8FAF8'}}>
              <p className={`text-xs uppercase tracking-widest text-gray-500 mb-3 ${isArabic ? "font-arabic tracking-normal" : ""}`}>
                {isArabic ? "رقم الحجز" : "Booking Reference"}
              </p>
              <p className="font-mono font-black text-primary text-3xl">
                ACE-{Math.random().toString(36).substring(2, 8).toUpperCase()}
              </p>
            </div>
            <div>
              <a href="tel:0945000365" className="btn-primary mx-auto">
                <Icon icon="mdi:phone" className="w-5 h-5" />
                {isArabic ? "اتصل للتأكيد" : "Call to Confirm"}
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}