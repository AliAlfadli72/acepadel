import AppLayout, { LangContext } from '../Layouts/AppLayout';
import { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Link, usePage, router } from "@inertiajs/react";
import Swal from 'sweetalert2';
import dayjs from "dayjs";
import 'dayjs/locale/en';

export default function EventDetails({ event, is_registered }) {
    const { lang } = useContext(LangContext);
    const { auth, flash } = usePage().props;
    const isArabic = lang === "ar";

    useEffect(() => {
        if (flash.success) {
            Swal.fire({
                title: isArabic ? 'نجاح' : 'Success',
                text: flash.success,
                icon: 'success',
                confirmButtonText: isArabic ? 'حسناً' : 'OK',
                customClass: {
                    popup: 'rounded-3xl',
                    confirmButton: 'bg-primary text-gray-900 px-8 py-3 rounded-xl font-bold font-arabic'
                }
            });
        }
        if (flash.error) {
            Swal.fire({
                title: isArabic ? 'خطأ' : 'Error',
                text: flash.error,
                icon: 'error',
                confirmButtonText: isArabic ? 'حسناً' : 'OK',
                customClass: {
                    popup: 'rounded-3xl',
                    confirmButton: 'bg-rose-500 text-white px-8 py-3 rounded-xl font-bold font-arabic'
                }
            });
        }
    }, [flash]);

    const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const dateObj = dayjs(event.date);
    const month = isArabic ? arabicMonths[dateObj.month()] : dateObj.locale('en').format('MMM');
    const day = dateObj.format('DD'); // Will convert to arabic later
    const year = dateObj.format('YYYY');

    const getCategoryName = (cat) => {
        if (!cat) return '';
        const map = {
            'tournament': { ar: 'بطولة', en: 'Tournament' },
            'cup': { ar: 'كأس', en: 'Cup' },
            'event': { ar: 'حدث', en: 'Event' }
        };
        const c = map[cat.toLowerCase()];
        return c ? (isArabic ? c.ar : c.en) : cat;
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'upcoming': return 'bg-blue-600 text-white border-blue-500';
            case 'ongoing': return 'bg-emerald-600 text-white border-emerald-500';
            case 'completed': return 'bg-[#cbfb45] text-gray-900 border-[#b5e03e]';
            default: return 'bg-gray-600 text-white border-gray-500';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'upcoming': return isArabic ? 'قادمة' : 'Upcoming';
            case 'ongoing': return isArabic ? 'جارية' : 'Ongoing';
            case 'completed': return isArabic ? 'مكتملة' : 'Completed';
            default: return status;
        }
    };

    const handleRegistration = () => {
        Swal.fire({
            title: isArabic ? 'تأكيد التسجيل' : 'Confirm Registration',
            text: isArabic ? 'هل أنت متأكد أنك تريد التسجيل في هذه الفعالية؟' : 'Are you sure you want to register for this event?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: isArabic ? 'نعم، تسجيل' : 'Yes, Register',
            cancelButtonText: isArabic ? 'إلغاء' : 'Cancel',
            customClass: {
                popup: 'rounded-3xl',
                confirmButton: 'bg-primary text-gray-900 px-8 py-3 rounded-xl font-bold font-arabic',
                cancelButton: 'bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-bold font-arabic mx-2'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('events.register', event.id));
            }
        });
    };

    const handleCancelRegistration = () => {
        Swal.fire({
            title: isArabic ? 'إلغاء التسجيل' : 'Cancel Registration',
            text: isArabic ? 'هل أنت متأكد أنك تريد إلغاء تسجيلك في هذه الفعالية؟' : 'Are you sure you want to cancel your registration?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: isArabic ? 'نعم، إلغاء' : 'Yes, Cancel',
            cancelButtonText: isArabic ? 'تراجع' : 'Back',
            customClass: {
                popup: 'rounded-3xl',
                confirmButton: 'bg-rose-500 text-white px-8 py-3 rounded-xl font-bold font-arabic',
                cancelButton: 'bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-bold font-arabic mx-2'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('events.cancel_registration', event.id));
            }
        });
    };

    return (
        <div className="min-h-screen bg-white pb-24" dir={isArabic ? "rtl" : "ltr"}>
            
            {/* Full-Bleed Hero Banner */}
            <div className="relative w-full h-[60vh] min-h-[500px] flex items-end">
                {event.image_path ? (
                    <img src={`/storage/${event.image_path}`} className="absolute inset-0 w-full h-full object-cover" alt={isArabic ? event.title_ar : event.title_en} />
                ) : (
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                        <Icon icon="mdi:trophy-outline" className="w-32 h-32 text-gray-800" />
                    </div>
                )}
                {/* Advanced Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>
                
                {/* Back Button (Floating on Hero) */}
                <div className="absolute top-8 left-8 right-8 max-w-7xl mx-auto px-4 z-20">
                    <Link href={route('events')} className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-all text-sm font-bold bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 hover:bg-white/20">
                        <Icon icon={isArabic ? "mdi:arrow-right" : "mdi:arrow-left"} className="w-5 h-5" />
                        <span className={isArabic ? "font-arabic" : ""}>{isArabic ? "العودة لجميع الفعاليات" : "Back to Events"}</span>
                    </Link>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-3 mb-6">
                                <span className={`px-5 py-2 rounded-full text-xs font-black shadow-lg uppercase tracking-wider ${isArabic ? "font-arabic" : ""} bg-white text-gray-900`}>
                                    {getCategoryName(event.category)}
                                </span>
                                <span className={`px-5 py-2 rounded-full text-xs font-black border shadow-lg uppercase tracking-wider ${getStatusStyle(event.status)} ${isArabic ? "font-arabic" : ""}`}>
                                    {getStatusText(event.status)}
                                </span>
                            </div>
                            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-lg ${isArabic ? "font-arabic" : ""}`}>
                                {isArabic ? event.title_ar : event.title_en}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* Floating Sidebar Registration Card (Desktop: Right, RTL: Right / LTR: Left) */}
                    <div className="lg:col-span-4 lg:order-last">
                        <div className="sticky top-28 bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 transform lg:-translate-y-24">
                            <h4 className={`text-2xl font-black text-gray-900 mb-8 border-b border-gray-100 pb-6 flex items-center gap-3 ${isArabic ? "font-arabic" : ""}`}>
                                <Icon icon="mdi:card-account-details-outline" className="text-primary w-8 h-8" />
                                {isArabic ? "تفاصيل التسجيل" : "Registration Details"}
                            </h4>

                            <div className="space-y-6 mb-10">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-sm shrink-0">
                                        <Icon icon="mdi:calendar-month-outline" className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className={`text-xs text-gray-500 font-bold mb-1 ${isArabic ? "font-arabic" : ""}`}>{isArabic ? "التاريخ" : "Date"}</p>
                                        <p className="font-black text-gray-900 text-lg font-arabic">
                                            {isArabic ? `${Number(day).toLocaleString('ar-EG')} ${month} ${Number(year).toLocaleString('ar-EG')}` : `${day} ${month} ${year}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm shrink-0">
                                        <Icon icon="mdi:clock-outline" className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className={`text-xs text-gray-500 font-bold mb-1 ${isArabic ? "font-arabic" : ""}`}>{isArabic ? "الوقت" : "Time"}</p>
                                        <p className="font-black text-gray-900 text-lg font-arabic">
                                            {dayjs(event.time).locale('en').format('hh:mm A')} {/* Needs custom arabic AM/PM if fully localized, but keeping standard for now */}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-white text-amber-500 flex items-center justify-center shadow-sm shrink-0">
                                        <Icon icon="mdi:ticket-percent-outline" className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className={`text-xs text-gray-500 font-bold mb-1 ${isArabic ? "font-arabic" : ""}`}>{isArabic ? "رسوم التسجيل" : "Registration Fee"}</p>
                                        <p className="font-black text-gray-900 text-lg font-arabic">
                                            {event.fee > 0 ? (
                                                <>{Number(event.fee).toLocaleString(isArabic ? 'ar-EG' : 'en-US')} <span className="text-xs font-bold opacity-70">{isArabic ? 'ل.س' : 'SYP'}</span></>
                                            ) : (
                                                <span>{isArabic ? 'مجاني' : 'Free'}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8">
                                {event.status !== 'completed' && auth.user ? (
                                    is_registered ? (
                                        <div className="space-y-4">
                                            <div className="bg-emerald-50 text-emerald-700 font-black py-4 px-4 rounded-2xl text-center border border-emerald-200 flex items-center justify-center gap-3">
                                                <Icon icon="mdi:check-decagram" className="w-6 h-6" />
                                                <span className={isArabic ? "font-arabic text-sm" : "text-sm"}>
                                                    {isArabic ? "لقد قمت بالتسجيل بنجاح" : "Successfully registered"}
                                                </span>
                                            </div>
                                            <button onClick={handleCancelRegistration} className="w-full text-center text-sm font-bold text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors py-3 rounded-xl border border-transparent">
                                                {isArabic ? "إلغاء التسجيل" : "Cancel Registration"}
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={handleRegistration} className="btn-primary w-full justify-center py-5 text-xl rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all">
                                            <Icon icon="mdi:account-plus" className="w-6 h-6" />
                                            {isArabic ? "التسجيل في الفعالية" : "Register for Event"}
                                        </button>
                                    )
                                ) : event.status !== 'completed' && !auth.user ? (
                                    <Link href={route('login')} className="bg-gray-900 hover:bg-black text-white font-bold py-5 px-4 rounded-2xl text-center flex items-center justify-center gap-3 transition-colors shadow-xl shadow-gray-900/20 hover:-translate-y-1">
                                        <Icon icon="mdi:login" className="w-6 h-6 text-[#cbfb45]" />
                                        <span className={isArabic ? "font-arabic text-lg" : "text-lg"}>
                                            {isArabic ? "تسجيل الدخول للمشاركة" : "Login to Register"}
                                        </span>
                                    </Link>
                                ) : (
                                    <div className="bg-gray-50 text-gray-400 font-black py-5 px-4 rounded-2xl text-center border border-gray-100 flex items-center justify-center gap-3">
                                        <Icon icon="mdi:lock-outline" className="w-6 h-6" />
                                        <span className={isArabic ? "font-arabic text-lg" : "text-lg"}>
                                            {isArabic ? "التسجيل مغلق - الفعالية مكتملة" : "Registration Closed"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8 lg:order-first mt-12 lg:mt-4 space-y-12">
                        
                        {/* Description */}
                        <div className="prose prose-lg max-w-none">
                            <h3 className={`text-2xl font-black text-gray-900 mb-6 flex items-center gap-4 ${isArabic ? "font-arabic" : ""}`}>
                                <Icon icon="mdi:text-box-multiple-outline" className="w-8 h-8 text-gray-300" />
                                {isArabic ? "عن الفعالية" : "About Event"}
                            </h3>
                            <div className={`text-gray-600 leading-relaxed text-lg bg-gray-50 p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm ${isArabic ? "font-arabic" : ""}`}>
                                {isArabic ? event.desc_ar : event.desc_en}
                            </div>
                        </div>

                        {/* Winners Section */}
                        {event.status === 'completed' && event.registrations?.length > 0 && (
                            <div className="relative rounded-[2.5rem] p-8 md:p-12 overflow-hidden border border-gray-800 bg-gray-900">
                                {/* Glassmorphism Backgrounds */}
                                <div className="absolute top-0 right-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50"></div>
                                <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#cbfb45]/20 rounded-full blur-[100px]"></div>
                                
                                <h3 className={`text-3xl font-black text-white mb-10 flex items-center gap-4 relative z-10 ${isArabic ? "font-arabic" : ""}`}>
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                                        <Icon icon="mdi:trophy-variant" className="w-8 h-8" />
                                    </div>
                                    {isArabic ? "أبطال الفعالية" : "Event Champions"}
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                    {event.registrations.map((reg) => (
                                        <div key={reg.id} className="group flex items-center justify-between bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center overflow-hidden shrink-0 shadow-lg relative">
                                                    {reg.user?.image_path ? (
                                                        <img src={`/storage/${reg.user.image_path}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <Icon icon="mdi:account" className="w-6 h-6 text-gray-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`font-black text-white text-lg ${isArabic ? "font-arabic" : ""}`}>{reg.user?.name}</p>
                                                    <p className="text-xs text-gray-400 font-bold">{reg.user?.category || 'لاعب'}</p>
                                                </div>
                                            </div>
                                            <div className="shrink-0 pl-2">
                                                {reg.placement ? (
                                                    <div className={`w-12 h-12 flex flex-col items-center justify-center rounded-2xl font-black shadow-inner font-arabic ${
                                                        reg.placement == 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-yellow-950 border border-yellow-300 shadow-yellow-500/20' :
                                                        reg.placement == 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900 border border-gray-300 shadow-gray-500/20' :
                                                        reg.placement == 3 ? 'bg-gradient-to-br from-orange-400 to-rose-500 text-white border border-orange-400 shadow-orange-500/20' :
                                                        'bg-white/10 text-white border border-white/20'
                                                    }`}>
                                                        <span className="text-xl leading-none">{Number(reg.placement).toLocaleString(isArabic ? 'ar-EG' : 'en-US')}</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                                                        <Icon icon="mdi:medal-outline" className="w-6 h-6 text-gray-600" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

EventDetails.layout = page => <AppLayout children={page} />;

