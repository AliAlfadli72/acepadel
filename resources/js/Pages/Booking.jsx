import AppLayout, { LangContext } from '../Layouts/AppLayout';
import { useState, useContext, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import Swal from "sweetalert2";

// Generate next 7 days dynamically
const generateDays = (lang) => {
  const days = [];
  const dayNamesAr = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  const dayNamesEn = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayAr = dayNamesAr[d.getDay()];
    const dayEn = dayNamesEn[d.getDay()];
    const num   = d.getDate();
    
    // Use local time instead of toISOString() which returns UTC
    const pad = (n) => n.toString().padStart(2, '0');
    const localDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    days.push({
      date:  localDateStr,
      label: { ar: `${dayAr} ${num}`, en: `${dayEn} ${num}` },
    });
  }
  return days;
};

const SLOTS = [
  "07:00","08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00",
  "19:00","20:00","21:00","22:00","23:00","00:00","01:00",
];

const DURATIONS = [
  { value: 1,   ar: "ساعة واحدة",  en: "1 Hour"   },
  { value: 1.5, ar: "ساعة ونصف",   en: "1.5 Hours" },
  { value: 2,   ar: "ساعتان",      en: "2 Hours"  },
  { value: 3,   ar: "ثلاث ساعات",  en: "3 Hours"  },
];

export default function Booking({ courts = [] }) {
  const { lang } = useContext(LangContext);
  const { auth } = usePage().props;
  const isAr = lang === "ar";
  const DAYS = useMemo(() => generateDays(lang), [lang]);

  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDay,   setSelectedDay]   = useState(DAYS[0].date);
  const [selectedSlot,  setSelectedSlot]  = useState(null);
  const [duration,      setDuration]      = useState(1);
  const [step,          setStep]          = useState(1);
  const [name,          setName]          = useState(auth?.user?.name || "");
  const [phone,         setPhone]         = useState(auth?.user?.phone || "");
  const [confirmed,     setConfirmed]     = useState(false);

  const [submitting,    setSubmitting]  = useState(false);
  const [bookingRef,    setBookingRef]  = useState('');
  const [bookedSlots,   setBookedSlots] = useState([]);

  // Coach state
  const [availableCoaches,   setAvailableCoaches]   = useState([]);
  const [isFetchingCoaches,  setIsFetchingCoaches]  = useState(false);
  const [selectedCoach,      setSelectedCoach]      = useState(null);
  const [email, setEmail] = useState(auth?.user?.email || "");

  const chosenCourt = courts.find(c => c.id === selectedCourt);
  const coachExtraCost = selectedCoach ? parseFloat(selectedCoach.hourly_rate) * duration : 0;
  const estimatedPrice = chosenCourt ? Math.round(chosenCourt.price * duration + coachExtraCost) : 0;

  // Fetch availability when court or day changes
  useEffect(() => {
    if (selectedCourt && selectedDay) {
      fetch(`/api/courts/${selectedCourt}/availability?date=${selectedDay}`)
        .then(res => res.json())
        .then(data => setBookedSlots(data.booked_slots || []))
        .catch(err => console.error("Failed to fetch availability", err));
    } else {
      setBookedSlots([]);
    }
  }, [selectedCourt, selectedDay]);

  // Fetch coaches when court + day + slot are all selected
  useEffect(() => {
    if (!selectedCourt || !selectedDay || !selectedSlot) {
      setAvailableCoaches([]);
      setSelectedCoach(null);
      return;
    }
    setIsFetchingCoaches(true);
    axios.get(`/api/courts/${selectedCourt}/available-coaches`, {
      params: { date: selectedDay, time: selectedSlot }
    }).then(res => {
      const coaches = res.data.coaches || [];
      setAvailableCoaches(coaches);
      // Deselect coach if no longer available
      if (selectedCoach && !coaches.find(c => c.id === selectedCoach.id)) {
        setSelectedCoach(null);
      }
    }).catch(err => console.error("Failed to fetch coaches", err))
      .finally(() => setIsFetchingCoaches(false));
  }, [selectedCourt, selectedDay, selectedSlot]);

  // Helper to check if a slot (or consecutive slots for >1hr duration) is unavailable
  const isSlotDisabled = (slot) => {
    if (bookedSlots.includes(slot)) return true;
    if (duration > 1) {
      const startIndex = SLOTS.indexOf(slot);
      if (startIndex === -1) return true;
      for (let i = 0; i < duration; i++) {
        const slotIndex = startIndex + i;
        if (slotIndex >= SLOTS.length) return true;
        if (bookedSlots.includes(SLOTS[slotIndex])) return true;
      }
    }
    return false;
  };

  // If the currently selected slot becomes booked (e.g. after switching to a court where it's unavailable), clear it
  useEffect(() => {
    if (selectedSlot && isSlotDisabled(selectedSlot)) {
      setSelectedSlot(null);
    }
  }, [bookedSlots, selectedSlot, duration]);

  // Build start/end datetime strings for the backend
  function buildDatetimes() {
    const [h] = selectedSlot.split(':').map(Number);
    let base = selectedDay;
    // Midnight slots (00:xx, 01:xx) belong to the day after the selected calendar day
    if (h < 7) {
      const d = new Date(selectedDay);
      d.setDate(d.getDate() + 1);
      base = d.toISOString().split('T')[0];
    }
    const start = new Date(`${base}T${selectedSlot}:00`);
    const end   = new Date(start.getTime() + duration * 3600 * 1000);
    const fmt = (dt) => {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      const h = String(dt.getHours()).padStart(2, '0');
      const min = String(dt.getMinutes()).padStart(2, '0');
      const s = String(dt.getSeconds()).padStart(2, '0');
      return `${y}-${m}-${d} ${h}:${min}:${s}`;
    };
    return { start_time: fmt(start), end_time: fmt(end) };
  }

  function goToStep(n) {
    setStep(n);
    setTimeout(() => {
      const el = document.getElementById(`step-${n}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  function handleConfirm() {
    if (!selectedCourt || !selectedSlot) return;

    // We no longer redirect to login. Guests can book.
    const { start_time, end_time } = buildDatetimes();
    setSubmitting(true);

    router.post('/book-court', {
      court_id:    selectedCourt,
      start_time,
      end_time,
      guest_name:  name,
      guest_email: email,
      guest_phone: phone,
      coach_id:    selectedCoach?.id || null,
    }, {
      onSuccess: (page) => {
        const bId = page?.props?.flash?.booking_id;
        const ref = bId ? `#${bId}` : ('ACE-' + Math.random().toString(36).substring(2, 8).toUpperCase());
        setBookingRef(ref);
        setSubmitting(false);
        setConfirmed(true);
        goToStep(3);
      },
      onError: (errors) => {
        console.error("Booking error:", errors);
        setSubmitting(false);
        const errorMessages = Object.values(errors).map(err => {
          const errStr = Array.isArray(err) ? err[0] : err;
          if (errStr && typeof errStr === 'string' && errStr.includes(' / ')) {
            const parts = errStr.split(' / ');
            return isAr ? parts[1] : parts[0];
          }
          return errStr;
        }).join('\n');

        Swal.fire({
          icon: 'error',
          title: isAr ? 'حدث خطأ أثناء الحجز' : 'Booking failed',
          text: errorMessages,
          confirmButtonColor: '#2C5234',
          confirmButtonText: isAr ? 'حسناً' : 'OK'
        });
      },
    });
  }

  const typeLabel = (type) => isAr
    ? (type === "indoor" ? "داخلي" : "خارجي")
    : (type === "indoor" ? "Indoor" : "Outdoor");
  const typeStyle = (type) => type === "indoor"
    ? "bg-primary/10 text-primary border-primary/20"
    : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <div className="bg-white min-h-screen" dir={isAr ? "rtl" : "ltr"}>

      {/* HERO */}
      <section className="border-b border-gray-200 py-20 px-6" style={{ backgroundColor: "#F8FAF8" }}>
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-label mb-6">
              <Icon icon="mdi:calendar-check" className="w-3.5 h-3.5" />
              {isAr ? "نظام الحجز" : "Booking System"}
            </span>
            <h1 className={`font-display font-black text-primary mt-6 mb-4 ${isAr ? "font-arabic text-4xl md:text-5xl" : "text-5xl md:text-6xl"}`}>
              {isAr ? "احجز ملعبك الآن" : "Book Your Court Now"}
            </h1>
            <p className={`text-gray-500 max-w-xl mx-auto ${isAr ? "font-arabic" : ""}`}>
              {isAr ? "اختر ملعبك، حدد الوقت المناسب واحجز في ثوانٍ" : "Choose your court, pick your time, and book in seconds"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* STEPS INDICATOR */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-center gap-4 mb-12">
          {[
            { n: 1, ar: "الملعب والوقت", en: "Court & Time" },
            { n: 2, ar: "بياناتك",        en: "Your Details" },
            { n: 3, ar: "تأكيد",          en: "Confirmed"    },
          ].map(({ n, ar, en }) => (
            <div key={n} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= n ? "bg-primary text-white" : "bg-gray-100 border border-gray-200 text-gray-500"}`}>
                {step > n ? <Icon icon="mdi:check" className="w-4 h-4" /> : n}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${step >= n ? "text-primary" : "text-gray-500"} ${isAr ? "font-arabic" : ""}`}>
                {isAr ? ar : en}
              </span>
              {n < 3 && <div className={`w-12 h-[2px] ${step > n ? "bg-primary" : "bg-gray-200"} transition-all`} />}
            </div>
          ))}
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <motion.div id="step-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            {/* SELECT COURT */}
            <div className="mb-10">
              <h2 className={`font-bold text-gray-900 mb-5 ${isAr ? "font-arabic text-xl" : "text-lg"}`}>
                {isAr ? "1. اختر الملعب" : "1. Select a Court"}
              </h2>

              {courts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <Icon icon="mdi:tennis" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className={`text-gray-500 font-bold ${isAr ? "font-arabic" : ""}`}>
                    {isAr ? "لا توجد ملاعب متاحة حالياً" : "No courts available at the moment"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {courts.map((c) => {
                    const isSelected = selectedCourt === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCourt(c.id)}
                        className={`rounded-2xl border-2 text-right overflow-hidden transition-all duration-200 ${
                          isSelected
                            ? "border-primary shadow-[0_0_0_3px_rgba(44,82,52,0.15)]"
                            : "border-gray-200 hover:border-primary/50"
                        } bg-white`}
                      >
                        {/* Court Image */}
                        <div className="relative h-36 bg-gray-100">
                          {c.image_path ? (
                            <img src={`/storage/${c.image_path}`} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-[#EEF4EE]">
                              <Icon icon="mdi:image-outline" className="w-10 h-10 text-[#A7C4A7]" />
                              <span className={`text-xs text-[#A7C4A7] ${isAr ? "font-arabic" : ""}`}>
                                {isAr ? "لا توجد صورة" : "No image"}
                              </span>
                            </div>
                          )}
                          {/* Type badge */}
                          <span className={`absolute top-2.5 right-2.5 text-[10px] font-black px-2.5 py-1 rounded-full border ${typeStyle(c.type)} ${isAr ? "font-arabic" : ""}`}>
                            {typeLabel(c.type)}
                          </span>
                          {/* Selected check */}
                          {isSelected && (
                            <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Icon icon="mdi:check" className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Court Info */}
                        <div className="p-4">
                          <p className={`font-black text-sm text-gray-900 mb-1 ${isAr ? "font-arabic" : ""}`}>{c.name}</p>
                          {c.description && (
                            <p className={`text-xs text-gray-500 leading-relaxed mb-2 ${isAr ? "font-arabic" : ""}`}>
                              {c.description.length > 60 ? c.description.slice(0, 60) + "…" : c.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className={`text-[10px] text-gray-400 ${isAr ? "font-arabic" : ""}`}>
                              {isAr ? "السعر / ساعة" : "Price / hr"}
                            </span>
                            <span className="font-black text-sm text-primary">
                              {c.price.toLocaleString("en-US")}
                              <span className={`text-[10px] font-normal text-gray-500 mr-1 ${isAr ? "font-arabic" : ""}`}>
                                {isAr ? "ل.س" : "SYP"}
                              </span>
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Duration picker — shown after court selection */}
            {selectedCourt && (
              <div className="mb-10">
                <h2 className={`font-bold text-gray-900 mb-5 ${isAr ? "font-arabic text-xl" : "text-lg"}`}>
                  {isAr ? "2. اختر المدة" : "2. Select Duration"}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value)}
                      className={`px-5 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                        duration === d.value ? "border-primary bg-primary text-white" : "border-gray-200 text-gray-600 hover:border-primary/50"
                      } ${isAr ? "font-arabic" : ""}`}
                    >
                      {isAr ? d.ar : d.en}
                    </button>
                  ))}
                </div>
                {chosenCourt && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ backgroundColor: "#EEF4EE" }}>
                    <Icon icon="mdi:cash" className="w-4 h-4 text-primary" />
                    <span className={`text-sm font-black text-primary ${isAr ? "font-arabic" : ""}`}>
                      {isAr ? `التكلفة المتوقعة: ${estimatedPrice.toLocaleString("en-US")} ل.س` : `Estimated: ${estimatedPrice.toLocaleString("en-US")} SYP`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* SELECT DAY */}
            <div className="mb-10">
              <h2 className={`font-bold text-gray-900 mb-5 ${isAr ? "font-arabic text-xl" : "text-lg"}`}>
                {isAr ? "3. اختر اليوم" : "3. Select a Day"}
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
                    } ${isAr ? "font-arabic" : ""}`}
                  >
                    {isAr ? d.label.ar : d.label.en}
                  </button>
                ))}
              </div>
            </div>

            {/* SELECT TIME */}
            <div className="mb-10">
              <h2 className={`font-bold text-gray-900 mb-5 ${isAr ? "font-arabic text-xl" : "text-lg"}`}>
                {isAr ? "4. اختر الوقت" : "4. Select Time"}
              </h2>
              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
                {SLOTS.map((slot, index) => {
                  const isSelected = selectedSlot === slot;
                  const disabled = isSlotDisabled(slot);
                  return (
                    <button
                      key={slot}
                      onClick={() => !disabled && setSelectedSlot(slot)}
                      disabled={disabled}
                      className={`time-slot text-center ${isSelected ? "selected" : ""} ${disabled ? "opacity-30 cursor-not-allowed line-through" : ""}`}
                      title={disabled ? (isAr ? "غير متاح" : "Unavailable") : ""}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-6 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary/10 border border-primary/30" />
                  <span className={isAr ? "font-arabic" : ""}>{isAr ? "متاح" : "Available"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary" />
                  <span className={isAr ? "font-arabic" : ""}>{isAr ? "مختار" : "Selected"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300" />
                  <span className={isAr ? "font-arabic" : ""}>{isAr ? "محجوز" : "Booked"}</span>
                </div>
              </div>
            </div>

            {/* ── COACH SELECTION ── */}
            {selectedCourt && selectedSlot && (
              <div className="mb-10">
                <h2 className={`font-bold text-gray-900 mb-2 ${isAr ? "font-arabic text-xl" : "text-lg"}`}>
                  {isAr ? "5. إضافة مدرب (اختياري)" : "5. Add a Coach (Optional)"}
                </h2>
                <p className={`text-sm text-gray-500 mb-5 ${isAr ? "font-arabic" : ""}`}>
                  {isAr ? "يمكنك إضافة مدرب متاح لتحسين تجربتك في الملعب" : "You can add an available coach to enhance your court experience"}
                </p>

                {isFetchingCoaches ? (
                  <div className="flex items-center gap-3 py-6 text-gray-500">
                    <Icon icon="mdi:loading" className="w-5 h-5 animate-spin text-primary" />
                    <span className={`text-sm ${isAr ? "font-arabic" : ""}`}>
                      {isAr ? "جاري البحث عن مدربين..." : "Looking for available coaches..."}
                    </span>
                  </div>
                ) : availableCoaches.length === 0 ? (
                  <div className="flex items-center gap-3 py-5 px-4 rounded-xl bg-gray-50 border border-dashed border-gray-200">
                    <Icon icon="mdi:account-off-outline" className="w-5 h-5 text-gray-400" />
                    <span className={`text-sm text-gray-500 ${isAr ? "font-arabic" : ""}`}>
                      {isAr ? "لا يوجد مدربون متاحون في هذا الوقت" : "No coaches available at this time"}
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableCoaches.map(coach => {
                      const isSelected = selectedCoach?.id === coach.id;
                      return (
                        <button
                          key={coach.id}
                          type="button"
                          onClick={() => setSelectedCoach(isSelected ? null : coach)}
                          className={`flex items-center justify-between p-4 rounded-2xl border-2 text-right transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-[0_0_0_3px_rgba(44,82,52,0.1)]"
                              : "border-gray-200 hover:border-primary/50 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-primary" : "bg-gray-100"
                            }`}>
                              <Icon icon="mdi:whistle" className={`w-5 h-5 ${isSelected ? "text-white" : "text-gray-500"}`} />
                            </div>
                            <div className="text-right">
                              <p className={`font-bold text-sm text-gray-900 ${isAr ? "font-arabic" : ""}`}>
                                {isAr ? `كابتن ${coach.user?.name}` : `Coach ${coach.user?.name}`}
                              </p>
                              {coach.specialty && (
                                <p className={`text-xs text-gray-500 ${isAr ? "font-arabic" : ""}`}>{coach.specialty}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-left shrink-0">
                            <p className="font-black text-sm text-primary">
                              +{parseFloat(coach.hourly_rate).toLocaleString("en-US")}
                            </p>
                            <p className={`text-[10px] text-gray-400 ${isAr ? "font-arabic" : ""}`}>
                              {isAr ? "ل.س / ساعة" : "SYP / hr"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedCoach && (
                  <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ backgroundColor: "#EEF4EE" }}>
                    <Icon icon="mdi:check-circle" className="w-4 h-4 text-primary" />
                    <span className={`text-sm font-black text-primary ${isAr ? "font-arabic" : ""}`}>
                      {isAr
                        ? `تم اختيار كابتن ${selectedCoach.user?.name} (+${parseFloat(selectedCoach.hourly_rate * duration).toLocaleString("en-US")} ل.س)`
                        : `Coach ${selectedCoach.user?.name} selected (+${parseFloat(selectedCoach.hourly_rate * duration).toLocaleString("en-US")} SYP)`
                      }
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => selectedCourt && selectedSlot && goToStep(2)}
              disabled={!selectedCourt || !selectedSlot}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon icon="mdi:arrow-right" className="w-5 h-5" />
              {isAr ? "التالي" : "Next Step"}
            </button>
          </motion.div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <motion.div id="step-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className={`font-bold text-gray-900 text-xl mb-8 ${isAr ? "font-arabic" : ""}`}>
              {isAr ? "بياناتك الشخصية" : "Your Details"}
            </h2>

            {/* Summary */}
            <div className="rounded-2xl border border-gray-200 p-6 mb-8" style={{ backgroundColor: "#F8FAF8" }}>
              <h3 className={`text-xs uppercase tracking-widest text-gray-500 mb-4 ${isAr ? "font-arabic tracking-normal" : ""}`}>
                {isAr ? "ملخص الحجز" : "Booking Summary"}
              </h3>
              {[
                { icon: "mdi:tennis-ball", label: isAr ? "الملعب"  : "Court",    val: chosenCourt?.name || "—" },
                { icon: "mdi:tag",         label: isAr ? "النوع"   : "Type",     val: chosenCourt ? typeLabel(chosenCourt.type) : "—" },
                { icon: "mdi:calendar",    label: isAr ? "التاريخ" : "Date",     val: DAYS.find(d => d.date === selectedDay)?.label?.[lang] },
                { icon: "mdi:clock",       label: isAr ? "الوقت"   : "Time",     val: selectedSlot },
                { icon: "mdi:timer",       label: isAr ? "المدة"   : "Duration", val: isAr ? DURATIONS.find(d=>d.value===duration)?.ar : DURATIONS.find(d=>d.value===duration)?.en },
                ...(selectedCoach ? [{ icon: "mdi:whistle", label: isAr ? "المدرب" : "Coach", val: isAr ? `كابتن ${selectedCoach.user?.name}` : `Coach ${selectedCoach.user?.name}` }] : []),
                { icon: "mdi:cash",        label: isAr ? "التكلفة الإجمالية" : "Total Price",    val: `${estimatedPrice.toLocaleString("en-US")} ${isAr ? "ل.س" : "SYP"}` },
              ].map(({ icon, label, val }) => (
                <div key={label} className="flex items-center gap-3 py-3 border-b border-gray-200 last:border-0">
                  <Icon icon={icon} className="w-5 h-5 text-primary" />
                  <span className={`text-gray-500 text-sm ${isAr ? "font-arabic" : ""}`}>{label}:</span>
                  <span className={`font-bold text-gray-900 text-sm ${isAr ? "font-arabic" : ""}`}>{val}</span>
                </div>
              ))}
            </div>

            <div className="space-y-5">
              {!auth?.user && (
                <>
                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 mb-4 flex gap-3">
                    <Icon icon="mdi:information" className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className={`text-sm text-blue-800 ${isAr ? "font-arabic" : ""}`}>
                      {isAr ? "أنت تحجز كزائر. سيتم تسجيل طلبك للمراجعة وسيتصل بك أحد موظفينا لتأكيد الحجز." : "You are booking as a guest. Your request will be recorded and our staff will contact you to confirm."}
                    </p>
                  </div>
                    <div className="space-y-5">

                      {/* FULL NAME */}
                      <div>
                        <label className={`block text-sm font-semibold text-gray-800 mb-2 ${isAr ? "font-arabic" : ""}`}>
                          {isAr ? "الاسم الكامل" : "Full Name"}
                        </label>

                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={isAr ? "أدخل اسمك الكامل" : "Enter your full name"}
                          className={`w-full border border-gray-300 bg-white rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm ${isAr ? "font-arabic" : ""}`}
                        />
                      </div>

                      {/* EMAIL */}
                      <div>
                        <label className={`block text-sm font-semibold text-gray-800 mb-2 ${isAr ? "font-arabic" : ""}`}>
                          {isAr ? "البريد الإلكتروني" : "Email Address"}
                        </label>

                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="example@email.com"
                          type="email"
                          className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        />
                      </div>

                      {/* PHONE */}
                      <div>
                        <label className={`block text-sm font-semibold text-gray-800 mb-2 ${isAr ? "font-arabic" : ""}`}>
                          {isAr ? "رقم الهاتف" : "Phone Number"}
                        </label>

                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+963 XXX XXX XXX"
                          className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        />
                      </div>

                    </div>
                </>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => goToStep(1)} className="btn-outline">
                <Icon icon="mdi:arrow-left" className="w-5 h-5" />
                {isAr ? "السابق" : "Back"}
              </button>
              <button
                onClick={handleConfirm}
                disabled={(!auth?.user && (!name || !phone)) || submitting}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting
                  ? <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                  : <Icon icon="mdi:check-circle" className="w-5 h-5" />
                }
                {isAr ? (submitting ? 'جاري الحجز...' : 'تأكيد الحجز') : (submitting ? 'Booking...' : 'Confirm Booking')}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && confirmed && (
          <motion.div
            id="step-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mx-auto mb-8 shadow-accent-glow">
              <Icon icon="mdi:check-decagram" className="w-12 h-12 text-primary" />
            </div>
            <h2 className={`font-display font-black text-primary text-4xl mb-4 ${isAr ? "font-arabic" : ""}`}>
              {isAr ? "تم الحجز بنجاح!" : "Booking Confirmed!"}
            </h2>
            <p className={`text-gray-600 mb-8 max-w-md mx-auto ${isAr ? "font-arabic" : ""}`}>
              {isAr
                ? `مرحباً ${name}! حجزك لـ${chosenCourt?.name} في ${selectedSlot} تم تأكيده. سنتصل بك على ${phone}.`
                : `Hello ${name}! Your booking for ${chosenCourt?.name} at ${selectedSlot} is confirmed. We'll contact you at ${phone}.`}
            </p>
            <div className="rounded-3xl border border-gray-200 p-8 inline-block mb-8 text-left" style={{ backgroundColor: "#F8FAF8" }}>
              <p className={`text-xs uppercase tracking-widest text-gray-500 mb-3 ${isAr ? "font-arabic tracking-normal" : ""}`}>
                {isAr ? "رقم الحجز" : "Booking Reference"}
              </p>
              <p className="font-mono font-black text-primary text-3xl">
                {bookingRef || 'ACE-PENDING'}
              </p>
            </div>
            <div>
              <a href="tel:0945000365" className="btn-primary mx-auto">
                <Icon icon="mdi:phone" className="w-5 h-5" />
                {isAr ? "اتصل للتأكيد" : "Call to Confirm"}
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

Booking.layout = page => <AppLayout children={page} />;
