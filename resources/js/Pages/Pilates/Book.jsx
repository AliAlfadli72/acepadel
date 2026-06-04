import AppLayout, { LangContext } from '../../Layouts/AppLayout';
import { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { router, usePage, Link, Head } from "@inertiajs/react";
import Swal from "sweetalert2";
import { resolveAsset } from '../../utils';

const { errors } = usePage().props;


export default function Book({ sessions = [], walletBalance = 0, activePackages = [], packages = [] }) {
  const { lang } = useContext(LangContext);
  const { auth } = usePage().props;
  const isAr = lang === "ar";
  const user = auth?.user;

  const [activeMainTab, setActiveMainTab] = useState("sessions");

  // Selected session for booking
  const [selectedSession, setSelectedSession] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [submitting, setSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const handleBuyPackage = (packageId) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;

    Swal.fire({
      title: isAr ? 'تأكيد الاشتراك في الباقة؟' : 'Confirm Subscription?',
      text: isAr 
        ? `هل ترغب في الاشتراك في "${pkg.name}" بقيمة ${parseFloat(pkg.price).toLocaleString()} ل.س؟ سيتم خصم المبلغ من محفظتك مباشرة.`
        : `Do you want to subscribe to "${pkg.name}" for ${parseFloat(pkg.price).toLocaleString()} SYP? The amount will be deducted from your wallet.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#393D40',
      cancelButtonColor: '#d33',
      confirmButtonText: isAr ? 'تأكيد الاشتراك' : 'Confirm Subscription',
      cancelButtonText: isAr ? 'إلغاء' : 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setSubmitting(true);
        router.post(route('pilates.packages.buy'), {
          pilates_package_id: packageId
        }, {
          onSuccess: () => {
            setSubmitting(false);
            Swal.fire({
              icon: 'success',
              title: isAr ? 'تم الاشتراك بنجاح!' : 'Subscribed Successfully!',
              text: isAr ? 'تم تفعيل باقتك بنجاح، يمكنك الآن حجز الجلسات باستخدام رصيد الباقة.' : 'Your package has been activated, you can now book sessions using your package balance.',
              confirmButtonColor: '#393D40',
              confirmButtonText: isAr ? 'حسناً' : 'OK'
            });
          },
          onError: (errors) => {
            setSubmitting(false);
            Swal.fire({
              icon: 'error',
              title: isAr ? 'فشل الاشتراك' : 'Subscription Failed',
              text: errors.error || (isAr ? 'حدث خطأ غير متوقع.' : 'An unexpected error occurred.'),
              confirmButtonColor: '#393D40',
              confirmButtonText: isAr ? 'حسناً' : 'OK'
            });
          }
        });
      }
    });
  };

  // Real-time updates via Laravel Echo
  useEffect(() => {
    if (window.Echo) {
      window.Echo.channel('pilates-bookings')
        .listen('PilatesBookingStatusUpdated', (e) => {
          console.log('Real-time Pilates booking update:', e);
          router.reload({ 
            only: ['sessions', 'walletBalance'],
            preserveScroll: true,
            preserveState: true
          });
        });

      return () => {
        window.Echo.leaveChannel('pilates-bookings');
      };
    }
  }, []);

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    let cleanDateStr = dateStr;
    if (cleanDateStr.includes('T')) {
      cleanDateStr = cleanDateStr.split('T')[0];
    } else if (cleanDateStr.includes(' ')) {
      cleanDateStr = cleanDateStr.split(' ')[0];
    }
    const parts = cleanDateStr.split('-');
    let date;
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const day = parseInt(parts[2], 10);
      date = new Date(year, month, day);
    } else {
      date = new Date(dateStr);
    }
    if (isNaN(date.getTime())) return dateStr;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(isAr ? 'ar-SY-u-nu-latn' : 'en-US', options);
  };

  // Format time helper (removes seconds)
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  };

  const handleOpenBooking = (session) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedSession(session);
    if (activePackages.length > 0) {
      setPaymentMethod("package");
    } else if (walletBalance >= parseFloat(session.price_per_session)) {
      setPaymentMethod("wallet");
    } else {
      setPaymentMethod("cash");
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedSession) return;
    setSubmitting(true);

    router.post(route('pilates.book'), {
      pilates_session_id: selectedSession.id,
      payment_method: paymentMethod,
    }, {
      onSuccess: (page) => {
        setSubmitting(false);
        setSelectedSession(null);
        
        Swal.fire({
          icon: 'success',
          title: isAr ? 'تم طلب الحجز بنجاح!' : 'Booking Request Sent!',
          text: paymentMethod === 'wallet' 
            ? (isAr ? 'تم تأكيد حجزك وخصم المبلغ من محفظتك بنجاح.' : 'Your booking has been confirmed and the amount deducted from your wallet.')
            : (isAr ? 'تم تسجيل طلب حجزك بنجاح. يرجى تأكيد الدفع نقداً مع الإدارة.' : 'Your booking request is pending admin cash confirmation.'),
          confirmButtonColor: '#393D40',
          confirmButtonText: isAr ? 'حسناً' : 'OK'
        });
      },
      onError: (errors) => {
        setSubmitting(false);
        const errorMsg = errors.error || (isAr ? 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.' : 'An unexpected error occurred. Please try again.');
        
        Swal.fire({
          icon: 'error',
          title: isAr ? 'فشل إتمام الحجز' : 'Booking Failed',
          text: errorMsg,
          confirmButtonColor: '#393D40',
          confirmButtonText: isAr ? 'حسناً' : 'OK'
        });
      }
    });
  };

  // Entrance animations config
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="bg-[#F4F4F4]/50 min-h-screen pb-24 overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      <Head>
        <title>{isAr ? "استوديو ذا ريفورمر روم - بيلاتس" : "The Reformer Room - Pilates Studio"}</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Boutique Logo/Header Block */}
      <div className="max-w-7xl mx-auto px-6 pt-12 flex justify-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center text-center"
        >
          <div className="w-14 h-14 rounded-full bg-[#393D40]/5 border border-[#393D40]/10 flex items-center justify-center mb-3">
            <Icon icon="mdi:yoga" className="w-7 h-7 text-[#393D40]" />
          </div>
          <h2 className="font-display font-light uppercase tracking-[0.25em] text-[#393D40] text-3xl md:text-4xl leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
            THE REFORMER ROOM
          </h2>
          <span className="text-[9px] uppercase tracking-[0.4em] text-[#62686B] font-bold mt-2 font-arabic">
            {isAr ? "استوديو البيلاتس المتطور" : "PILATES STUDIO"}
          </span>
        </motion.div>
      </div>

      {/* Editorial Luxury Hero Section */}
      <section className="relative py-12 px-6 overflow-hidden">
        {/* Soft background luxury glows */}
        <div className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] bg-[#62686B]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[5%] right-[-5%] w-[350px] h-[350px] bg-[#393D40]/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero Left Column (Content) */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: isAr ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >


              {/* Main Headline */}
              <h1 className={`font-display font-light text-[#393D40] tracking-tight leading-[1.15] ${isAr ? "font-arabic text-4xl md:text-5xl lg:text-6xl font-black" : "text-5xl md:text-6xl font-normal"}`}>
                {isAr ? (
                  <>
                    توازن العقل والجسد.<br />
                    <span className="font-serif italic font-light text-[#62686B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      قوة داخلية، مرونة مطلقة
                    </span>
                  </>
                ) : (
                  <>
                    Mind-Body Alignment.<br />
                    <span className="font-serif italic font-light text-[#62686B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Softness Meeting Strength
                    </span>
                  </>
                )}
              </h1>

              {/* Description */}
              <p className={`text-[#62686B] leading-relaxed max-w-xl text-sm md:text-base ${isAr ? "font-arabic font-normal" : "font-light"}`}>
                {isAr 
                  ? "مفهوم راقٍ لنادٍ متميز للبيلاتس، يعكس القوة الداخلية والنعومة المتكاملة من خلال هوية بصرية تجمع بين الانسيابية والانسجام. يجسد استوديو ذا ريفورمر روم جوهر البيلاتس كمساحة للتوازن بين الجسد والعقل، لتتحول كل حركة إلى تجربة مفعمة بالثقة والحيوية." 
                  : "A premium Pilates studio concept reflecting your inner strength and alignment through a refined visual identity of softness and energy. The Reformer Room embodies the essence of Pilates as a space for mental and physical harmony."}
              </p>

              {/* Dynamic Feature Row */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#393D40]/10 max-w-lg">
                {[
                  { value: isAr ? "10 لاعبين" : "10 Max", label: isAr ? "السعة القصوى للحصة" : "Class Capacity", icon: "mdi:account-group-outline" },
                  { value: isAr ? "مدربين معتمدين" : "Certified", label: isAr ? "إشراف احترافي كامل" : "Expert Coaching", icon: "mdi:badge-account-outline" },
                  { value: isAr ? "ريفورمر" : "Reformer", label: isAr ? "أحدث الأجهزة المتطورة" : "Premium Beds", icon: "mdi:leaf-circle-outline" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[#393D40]">
                      <Icon icon={item.icon} className="w-4.5 h-4.5 text-[#62686B]" />
                      <span className="text-xs font-bold uppercase font-arabic">{item.value}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-arabic font-bold">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Hero Right Column (Premium Styled Image) */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative w-full max-w-sm lg:max-w-full"
            >
              {/* Backing decorative grey border frame */}
              <div className="absolute inset-0 border border-[#393D40]/15 rounded-[40px] transform translate-x-4 translate-y-4 pointer-events-none" />

              {/* Main image container */}
              <div className="relative rounded-[40px] overflow-hidden border-8 border-white shadow-xl aspect-[4/3] lg:aspect-[1.1] bg-white">
                <img 
                  src={resolveAsset('/pilates-studio.png')} 
                  alt="The Reformer Room Pilates Studio" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                />
                
                {/* Visual glass overlay card */}
                <div className="absolute bottom-6 left-6 right-6 glass p-4 rounded-[20px] border border-white/20 flex justify-between items-center text-left" dir="ltr">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#62686B] font-bold">Est. 2026</p>
                    <h4 className="text-xs font-black text-[#393D40] tracking-wider uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
                      THE REFORMER ROOM
                    </h4>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#393D40] flex items-center justify-center shadow-md">
                    <Icon icon="mdi:spa" className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Main Mode Tabs (Sessions vs Packages) */}
      <div className="max-w-7xl mx-auto px-6 mb-12 flex justify-center border-b border-gray-200/60 pb-px font-arabic">
        <div className="flex gap-10">
          <button
            onClick={() => setActiveMainTab("sessions")}
            className={`pb-4 text-xs font-black uppercase tracking-wider relative transition-colors ${
              activeMainTab === "sessions" ? "text-[#393D40] border-b-2 border-[#393D40]" : "text-gray-400 hover:text-[#393D40]"
            }`}
          >
            {isAr ? "حجز الحصص الفردية" : "Book Class Sessions"}
          </button>
          <button
            onClick={() => setActiveMainTab("packages")}
            className={`pb-4 text-xs font-black uppercase tracking-wider relative transition-colors ${
              activeMainTab === "packages" ? "text-[#393D40] border-b-2 border-[#393D40]" : "text-gray-400 hover:text-[#393D40]"
            }`}
          >
            {isAr ? "باقات كلاسات بيلاتس" : "Pilates Class Packages"}
          </button>
        </div>
      </div>

      {activeMainTab === "sessions" && (
        <>
          {/* Category Filters */}
          {sessions.length > 0 && (
            <div className="max-w-7xl mx-auto px-6 mb-8 flex justify-end">
              <div className="flex bg-[#393D40]/5 p-1 rounded-full border border-[#393D40]/5 w-fit font-arabic shadow-sm">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4.5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                    activeFilter === 'all'
                      ? "bg-[#393D40] text-white shadow-sm"
                      : "text-[#62686B] hover:text-[#393D40]"
                  }`}
                >
                  {isAr ? "جميع الحصص" : "All Classes"}
                </button>
                <button
                  onClick={() => setActiveFilter('indoor')}
                  className={`px-4.5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                    activeFilter === 'indoor'
                      ? "bg-[#393D40] text-white shadow-sm"
                      : "text-[#62686B] hover:text-[#393D40]"
                  }`}
                >
                  {isAr ? "داخل الاستوديو (Indoor)" : "Studio Sessions"}
                </button>
                <button
                  onClick={() => setActiveFilter('outdoor')}
                  className={`px-4.5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                    activeFilter === 'outdoor'
                      ? "bg-[#393D40] text-white shadow-sm"
                      : "text-[#62686B] hover:text-[#393D40]"
                  }`}
                >
                  {isAr ? "حصص خارجية (Outdoor)" : "Outdoor Sessions"}
                </button>
              </div>
            </div>
          )}

          {/* SESSIONS LIST */}
          <div className="max-w-7xl mx-auto px-6">
            {sessions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white rounded-[32px] border border-[#393D40]/5 shadow-sm"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Icon icon="mdi:calendar-blank" className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className={`text-lg font-bold text-[#393D40] mb-2 ${isAr ? "font-arabic" : ""}`}>
                  {isAr ? "لا توجد حصص بيلاتس مجدولة" : "No Sessions Scheduled"}
                </h3>
                <p className={`text-gray-400 text-xs max-w-sm mx-auto leading-relaxed ${isAr ? "font-arabic" : ""}`}>
                  {isAr 
                    ? "أخصائيو البيلاتس يعملون حالياً على جدولة حصص جديدة. يرجى زيارة الصفحة لاحقاً." 
                    : "All coaches are preparing new schedules. Please check back soon or contact support."}
                </p>
              </motion.div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {(() => {
                  const filteredSessions = sessions.filter(session => {
                    if (activeFilter === 'all') return true;
                    return session.session_type === activeFilter;
                  });

                  if (filteredSessions.length === 0) {
                    return (
                      <div className="col-span-full text-center py-20 bg-white rounded-[32px] border border-[#393D40]/5 shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                          <Icon icon="mdi:calendar-remove" className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className={`text-lg font-bold text-[#393D40] mb-2 ${isAr ? "font-arabic" : ""}`}>
                          {isAr ? "لا توجد حصص في هذا القسم" : "No Sessions in this Section"}
                        </h3>
                        <p className={`text-gray-400 text-xs max-w-sm mx-auto ${isAr ? "font-arabic" : ""}`}>
                          {isAr 
                            ? "لم نجد أي حصص مجدولة ضمن هذه الفئة حالياً." 
                            : "No sessions have been scheduled for this category yet."}
                        </p>
                      </div>
                    );
                  }

                  return filteredSessions.map((session) => {
                  const remaining = session.available_slots;
                  const isFull = remaining <= 0;
                  const hasBooked = session.has_booked;
                  const isCanceled = session.status === 'canceled';

                  // Calculate fill percent
                  const bookedCount = session.capacity - remaining;
                  const fillPercent = Math.min(100, Math.round((bookedCount / session.capacity) * 100));

                  return (
                    <motion.div
                      key={session.id}
                      variants={itemVariants}
                      whileHover={{ y: -6, boxShadow: "0 16px 32px rgba(57,61,64,0.06)" }}
                      className={`bg-white rounded-[30px] border ${hasBooked ? 'border-[#393D40]' : 'border-gray-200/70'} overflow-hidden flex flex-col justify-between transition-all duration-300 relative`}
                      style={{ boxShadow: "0 8px 24px rgba(57,61,64,0.02)" }}
                    >
                      {/* Brand highlight strip */}
                      {hasBooked && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-[#393D40]" />
                      )}

                      {/* Header content */}
                      <div className="p-7 border-b border-gray-100 bg-gradient-to-b from-[#F4F4F4]/30 to-transparent">
                        <div className="flex justify-between items-center mb-4">
                          <span className={`text-[9px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full border ${
                            isCanceled 
                              ? "bg-red-50 text-red-700 border-red-100" 
                              : isFull 
                              ? "bg-gray-50 text-gray-500 border-gray-100" 
                              : "bg-[#393D40]/5 text-[#393D40] border-[#393D40]/10"
                          } ${isAr ? "font-arabic" : ""}`}>
                            {isCanceled 
                              ? (isAr ? "جلسة ملغاة" : "Canceled") 
                              : isFull 
                              ? (isAr ? "مكتملة العدد" : "Fully Booked") 
                              : (isAr ? `${remaining} شاغر` : `${remaining} spots left`)}
                          </span>
                          
                          <span className="font-display font-bold text-xl text-[#393D40] flex items-baseline">
                            {parseFloat(session.price_per_session).toLocaleString("en-US")}
                            <span className={`text-[10px] font-normal text-gray-400 ms-1 uppercase ${isAr ? "font-arabic" : ""}`}>
                              {isAr ? "ل.س" : "SYP"}
                            </span>
                          </span>
                        </div>

                        <h3 className={`text-xl font-bold text-gray-900 leading-tight mb-2 ${isAr ? "font-arabic" : "font-display"}`}>
                          {session.title}
                        </h3>

                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#393D40]/5 flex items-center justify-center shrink-0">
                            <Icon icon="mdi:yoga" className="w-4 h-4 text-[#393D40]" />
                          </div>
                          <span className={`text-xs text-gray-500 ${isAr ? "font-arabic" : ""}`}>
                            {isAr ? "المدرب:" : "Coach:"} <span className="font-bold text-gray-800">{session.coach ? session.coach.name : 'غير محدد'}</span>
                            <span className="mx-1.5 text-gray-300">|</span>
                            <span className="text-[10px] text-gray-400 font-bold bg-[#F4F4F4] px-1.5 py-0.5 rounded capitalize">
                              {isAr 
                                ? (session.session_type === 'indoor' ? 'صالة داخلية' : 'خارجية')
                                : (session.session_type || 'indoor')}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Body details */}
                      <div className="p-7 space-y-5 flex-grow">
                        {session.description && (
                          <p className={`text-xs text-gray-500 leading-relaxed ${isAr ? "font-arabic font-normal" : "font-light"}`}>
                            {session.description}
                          </p>
                        )}

                        <div className="space-y-3 bg-[#F4F4F4]/50 rounded-2xl p-4 border border-gray-200/50">
                          <div className="flex items-center gap-2.5 text-xs text-[#393D40] font-bold">
                            <Icon icon="mdi:calendar" className="w-4.5 h-4.5 text-[#62686B]" />
                            <span className={isAr ? "font-arabic" : ""}>{formatDate(session.session_date)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2.5 text-xs text-[#393D40] font-bold">
                            <Icon icon="mdi:clock-outline" className="w-4.5 h-4.5 text-[#62686B]" />
                            <span className="font-mono" dir="ltr">
                              {formatTime(session.start_time)} - {formatTime(session.end_time)}
                            </span>
                          </div>

                          {/* Capacity usage meter */}
                          <div className="space-y-1.5 pt-1 border-t border-gray-200/40">
                            <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-wider font-arabic">
                              <span>{isAr ? "المقاعد المحجوزة" : "Booked Slots"}</span>
                              <span>{bookedCount}/{session.capacity}</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isFull ? 'bg-gray-400' : 'bg-[#393D40]'
                                }`}
                                style={{ width: `${fillPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer button section */}
                      <div className="p-7 bg-[#F4F4F4]/20 border-t border-gray-100 flex items-center justify-between">
                        {hasBooked ? (
                          <div className="w-full text-center py-3.5 px-4 rounded-xl bg-emerald-50 border border-emerald-100 text-[#393D40] font-bold text-xs flex items-center justify-center gap-1.5 font-arabic">
                            <Icon icon="mdi:check-decagram" className="w-4.5 h-4.5 text-emerald-600" />
                            <span>{isAr ? "لقد تم حجزك بنجاح" : "Your Spot is Confirmed"}</span>
                          </div>
                        ) : isCanceled ? (
                          <button disabled className="w-full py-3.5 rounded-xl border border-red-150 text-red-500 bg-red-50/20 font-bold text-xs cursor-not-allowed font-arabic">
                            {isAr ? "تم إلغاء هذه الجلسة" : "Session Canceled"}
                          </button>
                        ) : isFull ? (
                          <button disabled className="w-full py-3.5 rounded-xl border border-gray-200 text-gray-400 font-bold text-xs bg-gray-50 cursor-not-allowed font-arabic">
                            {isAr ? "مكتمل العدد (قائمة الانتظار)" : "Fully Booked"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenBooking(session)}
                            className="w-full bg-[#393D40] hover:bg-[#222831] text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 shadow-sm font-arabic"
                          >
                            <Icon icon="mdi:calendar-plus" className="w-4.5 h-4.5" />
                            <span>{isAr ? "احجز مكانكِ الآن" : "Book This Session"}</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                });
               })()}
              </motion.div>
            )}
          </div>
        </>
      )}

      {activeMainTab === "packages" && (
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => {
              const hasActivePackage = activePackages.some(ap => ap.pilates_package_id === pkg.id);
              const remaining = activePackages.find(ap => ap.pilates_package_id === pkg.id)?.remaining_classes || 0;
              const hasEnoughWallet = walletBalance >= parseFloat(pkg.price);

              return (
                <motion.div
                  key={pkg.id}
                  whileHover={{ y: -6, boxShadow: "0 16px 32px rgba(57,61,64,0.06)" }}
                  className="bg-white rounded-[30px] border border-gray-200/70 overflow-hidden flex flex-col justify-between transition-all duration-300 relative p-7"
                  style={{ boxShadow: "0 8px 24px rgba(57,61,64,0.02)" }}
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-11 h-11 rounded-xl bg-[#393D40]/5 flex items-center justify-center">
                      <Icon icon="mdi:ticket" className="w-6 h-6 text-[#393D40]" />
                    </div>
                    {hasActivePackage && (
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-extrabold px-2.5 py-1.5 rounded-full uppercase tracking-wider font-arabic">
                        {isAr ? `نشطة (${remaining} حصص)` : `Active (${remaining} left)`}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2 font-arabic">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-5 font-arabic leading-relaxed">
                      {isAr 
                        ? `باقة اشتراك مخصصة لتمارين البيلاتس ريفورمر، تتيح لكِ حجز الجلسات في الأوقات التي تناسب جدولكِ.`
                        : `A custom Pilates class package. Allows you to book sessions during the validity period.`}
                    </p>

                    <div className="space-y-3 bg-[#F4F4F4]/50 rounded-2xl p-4 border border-gray-200/50 mb-6 font-arabic text-xs text-gray-600">
                      <div className="flex items-center gap-2.5">
                        <Icon icon="mdi:calendar-check" className="w-4.5 h-4.5 text-[#62686B] shrink-0" />
                        <span className="font-bold">{isAr ? `العدد الإجمالي: ${pkg.total_classes} جلسات` : `Total: ${pkg.total_classes} classes`}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Icon icon="mdi:clock-outline" className="w-4.5 h-4.5 text-[#62686B] shrink-0" />
                        <span className="font-bold">{isAr ? `فترة الصلاحية: ${pkg.valid_days} يوماً` : `Validity: ${pkg.valid_days} days`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-5 mt-auto">
                    <div className="flex justify-between items-baseline mb-5 font-arabic">
                      <span className="text-gray-400 text-xs font-bold">{isAr ? "قيمة الباقة" : "Package Price"}</span>
                      <span className="font-display font-bold text-xl text-[#393D40] flex items-baseline">
                        {parseFloat(pkg.price).toLocaleString("en-US")}
                        <span className="text-[10px] font-normal text-gray-400 ms-1 uppercase">{isAr ? "ل.س" : "SYP"}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleBuyPackage(pkg.id)}
                      disabled={submitting || (!hasEnoughWallet && !hasActivePackage)}
                      className="w-full bg-[#393D40] hover:bg-[#222831] text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-arabic"
                    >
                      <Icon icon="mdi:credit-card" className="w-4.5 h-4.5" />
                      {submitting ? (
                        isAr ? "جاري المعالجة..." : "Processing..."
                      ) : !hasEnoughWallet && !hasActivePackage ? (
                        isAr ? "الرصيد غير كافٍ" : "Insufficient Balance"
                      ) : hasActivePackage ? (
                        isAr ? "شراء باقة إضافية" : "Buy Additional"
                      ) : (
                        isAr ? "شراء الاشتراك" : "Subscribe Now"
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONFIRMATION CHECKOUT MODAL */}
      <AnimatePresence>
        {selectedSession && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#121614]/65 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-[26px] w-full max-w-lg overflow-hidden border border-gray-100 shadow-2xl p-[30px]"
              dir={isAr ? "rtl" : "ltr"}
            >
              {/* Header */}
              <div className="p-6.5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#F4F4F4]/50 to-transparent">
                <div>
                  <h3 className={`text-lg font-bold text-[#393D40] ${isAr ? "font-arabic" : "font-display"}`}>
                    {isAr ? "تأكيد حجز الحصة" : "Confirm Session Booking"}
                  </h3>
                  <p className={`text-xs text-gray-400 mt-0.5 ${isAr ? "font-arabic" : ""}`}>
                    {isAr ? "يرجى مراجعة التفاصيل لتأكيد التسجيل" : "Review details to confirm registration"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Icon icon="mdi:close" className="w-5.5 h-5.5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6.5 space-y-6">
                {errors?.error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <div className="flex gap-3">

                        <Icon
                            icon="mdi:alert-circle"
                            className="w-5 h-5 text-red-500 shrink-0"
                        />

                        <div>
                            <p className="font-bold text-red-800 text-sm">
                                خطأ في الحجز
                            </p>

                            <p className="text-red-700 text-sm mt-1">
                                {errors.error}
                            </p>
                        </div>

                    </div>
                </div>
            )}
                {/* Details Recap Panel */}
                <div className="rounded-3xl bg-gradient-to-br from-[#393D40] to-[#222831] p-5 text-white">
                    <div className="flex justify-between items-start">

                        <div>
                            <h4 className="font-bold text-lg">
                                {selectedSession.title}
                            </h4>

                            <p className="text-white/70 text-sm mt-1">
                                {selectedSession.coach?.name}
                            </p>

                            <p className="text-white/50 text-xs mt-1">
                                {selectedSession.session_type === 'indoor'
                                    ? 'جلسة داخلية'
                                    : 'جلسة خارجية'}
                            </p>
                        </div>

                        <div className="text-left">
                            <p className="text-white/60 text-xs">
                                السعر
                            </p>

                            <p className="text-3xl font-black">
                                {parseFloat(
                                    selectedSession.price_per_session
                                ).toLocaleString()}
                            </p>

                            <p className="text-white/60 text-xs">
                                ل.س
                            </p>
                        </div>

                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/10">

                        <div className="flex items-center gap-2 text-sm">
                            <Icon icon="mdi:calendar" />
                            {formatDate(selectedSession.session_date)}
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <Icon icon="mdi:clock-outline" />
                            {formatTime(selectedSession.start_time)}
                        </div>

                    </div>
                </div>

                {/* Checkout Method Selector */}
                <div className="space-y-3">
                  <label className={`block text-xs font-bold text-[#393D40] uppercase tracking-wide font-arabic`}>
                    {isAr ? "اختر طريقة الدفع" : "Select Payment Method"}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Package Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("package")}
                      disabled={activePackages.length === 0}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 text-center transition-all ${
                        activePackages.length === 0 ? "opacity-30 cursor-not-allowed border-gray-100" :
                        paymentMethod === 'package'
                          ? "border-[#393D40] bg-[#393D40]/5 shadow-sm"
                          : "border-gray-100 hover:border-[#393D40]/30"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${
                        paymentMethod === 'package' ? 'bg-[#393D40]/10' : 'bg-gray-50'
                      }`}>
                        <Icon icon="mdi:ticket-percent" className={`w-5 h-5 ${paymentMethod === 'package' ? "text-[#393D40]" : "text-gray-400"}`} />
                      </div>
                      <span className={`text-[11px] font-bold text-gray-900 ${isAr ? "font-arabic" : ""}`}>
                        {isAr ? "الاشتراك بالباقة" : "Class Package"}
                      </span>
                      <span className="text-[8px] text-gray-400 mt-0.5 font-bold">
                        {activePackages.length > 0 
                          ? (isAr ? `${activePackages[0].remaining_classes} حصة` : `${activePackages[0].remaining_classes} left`)
                          : (isAr ? 'لا يوجد باقة' : 'No package')}
                      </span>
                    </button>

                    {/* Wallet Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("wallet")}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 text-center transition-all ${
                        paymentMethod === 'wallet'
                          ? "border-[#393D40] bg-[#393D40]/5 shadow-sm"
                          : "border-gray-100 hover:border-[#393D40]/30"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${
                        paymentMethod === 'wallet' ? 'bg-[#393D40]/10' : 'bg-gray-50'
                      }`}>
                        <Icon icon="mdi:wallet" className={`w-5 h-5 ${paymentMethod === 'wallet' ? "text-[#393D40]" : "text-gray-400"}`} />
                      </div>
                      <span className={`text-[11px] font-bold text-gray-900 ${isAr ? "font-arabic" : ""}`}>
                        {isAr ? "المحفظة" : "E-Wallet"}
                      </span>
                      <span className="text-[8px] text-gray-400 mt-0.5 font-bold">
                        {isAr ? `${walletBalance.toLocaleString("en-US")} ل.س` : `${walletBalance.toLocaleString("en-US")} SYP`}
                      </span>
                    </button>

                    {/* Cash Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 text-center transition-all ${
                        paymentMethod === 'cash'
                          ? "border-[#393D40] bg-[#393D40]/5 shadow-sm"
                          : "border-gray-100 hover:border-[#393D40]/30"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${
                        paymentMethod === 'cash' ? 'bg-[#393D40]/10' : 'bg-gray-50'
                      }`}>
                        <Icon icon="mdi:cash" className={`w-5 h-5 ${paymentMethod === 'cash' ? "text-[#393D40]" : "text-gray-400"}`} />
                      </div>
                      <span className={`text-[11px] font-bold text-gray-900 ${isAr ? "font-arabic" : ""}`}>
                        {isAr ? "نقداً بالمركز" : "Cash at Center"}
                      </span>
                      <span className={`text-[8px] text-gray-400 mt-0.5 ${isAr ? "font-arabic" : ""}`}>
                        {isAr ? "موافقة الإدارة" : "Needs Approval"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Wallet Balance Warning */}
                {paymentMethod === 'wallet' && walletBalance < parseFloat(selectedSession.price_per_session) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-amber-50 border border-amber-100/60 p-4 flex gap-3.5"
                  >
                    <Icon icon="mdi:alert-circle-outline" className="w-5.5 h-5.5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className={`text-xs font-bold text-amber-900 ${isAr ? "font-arabic" : ""}`}>
                        {isAr ? "رصيد المحفظة غير كافٍ" : "Insufficient Wallet Balance"}
                      </p>
                      <p className={`text-[11px] text-amber-700/90 leading-relaxed ${isAr ? "font-arabic" : ""}`}>
                        {isAr 
                          ? "رصيدك المتوفر في المحفظة غير كافٍ لإتمام حجز الحصة. يرجى اختيار الدفع نقداً أو شحن محفظتك." 
                          : "Your available balance is below the price. Please switch to cash payment or contact support to recharge."}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Package Warning */}
                {paymentMethod === 'package' && activePackages.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-amber-50 border border-amber-100/60 p-4 flex gap-3.5"
                  >
                    <Icon icon="mdi:alert-circle-outline" className="w-5.5 h-5.5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className={`text-xs font-bold text-amber-900 ${isAr ? "font-arabic" : ""}`}>
                        {isAr ? "لا توجد باقة اشتراك نشطة" : "No Active Package Subscription"}
                      </p>
                      <p className={`text-[11px] text-amber-700/90 leading-relaxed ${isAr ? "font-arabic" : ""}`}>
                        {isAr 
                          ? "لم نجد أي باقة اشتراك نشطة صالحة في حسابك. يرجى اختيار وسيلة دفع أخرى أو مراجعة الإدارة لشراء باقة." 
                          : "We could not find any active package subscription in your account. Please select another payment method."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-[10px] p-6.5 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className={`border border-gray-200 hover:bg-gray-150 py-2.5 px-5 rounded-xl font-bold text-xs ${isAr ? "font-arabic" : ""}`}
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={submitting || (paymentMethod === 'wallet' && walletBalance < parseFloat(selectedSession.price_per_session)) || (paymentMethod === 'package' && activePackages.length === 0)}
                  className="bg-[#393D40] hover:bg-[#222831] text-white py-2.5 px-6 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  {submitting ? (
                    <Icon icon="mdi:loading" className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <Icon icon="mdi:check-circle" className="w-4.5 h-4.5" />
                  )}
                  <span className={isAr ? "font-arabic" : ""}>
                    {submitting 
                      ? (isAr ? "جاري الحجز..." : "Processing...") 
                      : (isAr ? "تأكيد طلب الحجز" : "Confirm Booking")}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GUEST REQUIRED AUTH MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#121614]/65 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="bg-white rounded-[26px] w-full max-w-md overflow-hidden border border-gray-100 shadow-2xl p-7 text-center"
              dir={isAr ? "rtl" : "ltr"}
            >
              <div className="w-14 h-14 rounded-full bg-[#393D40]/5 text-[#393D40] flex items-center justify-center mx-auto mb-5">
                <Icon icon="mdi:account-lock-outline" className="w-7 h-7" />
              </div>
              
              <h3 className={`text-lg font-bold text-[#393D40] mb-2.5 ${isAr ? "font-arabic" : "font-display"}`}>
                {isAr ? "يلزم تسجيل الدخول أولاً" : "Membership Required"}
              </h3>
              
              <p className={`text-xs text-gray-500 mb-6.5 leading-relaxed ${isAr ? "font-arabic" : ""}`}>
                {isAr 
                  ? "لحجز حصص البيلاتس والتحقق من حسابك ومحفظتك، يجب تسجيل الدخول أو إنشاء حساب جديد على أكاديميتنا." 
                  : "To book a wellness session and track payments, you must have an active member account. Please log in to proceed."}
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  href={route('login')}
                  className="bg-[#393D40] hover:bg-[#222831] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Icon icon="mdi:login" className="w-4.5 h-4.5" />
                  <span className={isAr ? "font-arabic" : ""}>{isAr ? "تسجيل الدخول" : "Log In to Account"}</span>
                </Link>
                
                <Link
                  href={route('register')}
                  className="border border-gray-200 hover:bg-gray-100 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-[#393D40]"
                >
                  <Icon icon="mdi:account-plus" className="w-4.5 h-4.5" />
                  <span className={isAr ? "font-arabic" : ""}>{isAr ? "إنشاء حساب عضوية جديد" : "Create Free Account"}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className={`text-gray-400 hover:text-gray-600 text-[10px] font-bold mt-3.5 transition-colors ${isAr ? "font-arabic" : ""}`}
                >
                  {isAr ? "تصفح الحصص أولاً" : "Just Browse Sessions"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

Book.layout = page => <AppLayout children={page} />;
