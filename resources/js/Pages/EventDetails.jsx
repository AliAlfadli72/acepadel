import AppLayout, { LangContext } from '../Layouts/AppLayout';
import { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Link, usePage, router } from "@inertiajs/react";
import Swal from 'sweetalert2';
import dayjs from "dayjs";
import 'dayjs/locale/en';
import { resolveAsset } from '../utils';

export default function EventDetails({ event, is_registered, user_registration }) {
    const { lang } = useContext(LangContext);
    const { auth, flash } = usePage().props;
    const isArabic = lang === "ar";

    // Brutalist styling helper for SweetAlert in Light Mode
    const swalCustomClass = {
        popup: 'rounded-none bg-white border-2 border-[#222831] text-[#222831] shadow-[6px_6px_0px_rgba(34,40,49,0.15)]',
        title: 'text-[#222831] font-display font-black uppercase tracking-wider',
        htmlContainer: 'text-gray-600 font-medium font-arabic',
        confirmButton: 'bg-[#d6e02e] text-[#222831] rounded-none border-2 border-[#d6e02e] px-8 py-3 font-black font-arabic uppercase hover:bg-[#222831] hover:text-white transition-colors duration-300 mx-2',
        cancelButton: 'bg-transparent text-gray-600 rounded-none border-2 border-gray-200 px-8 py-3 font-black font-arabic uppercase hover:bg-gray-50 transition-colors duration-300 mx-2'
    };

    useEffect(() => {
        if (flash.success) {
            Swal.fire({
                title: isArabic ? 'تم بنجاح' : 'Success',
                text: flash.success,
                icon: 'success',
                iconColor: '#d6e02e',
                buttonsStyling: false,
                confirmButtonText: isArabic ? 'موافق' : 'OK',
                customClass: swalCustomClass
            });
        }
        if (flash.error) {
            Swal.fire({
                title: isArabic ? 'خطأ' : 'Error',
                text: flash.error,
                icon: 'error',
                iconColor: '#f43f5e',
                buttonsStyling: false,
                confirmButtonText: isArabic ? 'موافق' : 'OK',
                customClass: swalCustomClass
            });
        }
    }, [flash]);

    const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const dateObj = dayjs(event.date);
    const month = isArabic ? arabicMonths[dateObj.month()] : dateObj.locale('en').format('MMM');
    const day = dateObj.format('DD');
    const year = dateObj.format('YYYY');

    const getCategoryName = (cat) => {
        if (!cat) return '';
        const map = {
            'tournament': { ar: 'بطولة', en: 'Tournament' },
            'cup': { ar: 'كأس', en: 'Cup' },
            'event': { ar: 'فعالية اجتماعية', en: 'Social Event' }
        };
        const c = map[cat.toLowerCase()];
        return c ? (isArabic ? c.ar : c.en) : cat;
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'upcoming': return isArabic ? 'قريباً' : 'Soon';
            case 'ongoing': return isArabic ? 'مفتوح الآن' : 'Open Now';
            case 'completed': return isArabic ? 'مكتملة' : 'Completed';
            default: return status;
        }
    };

    const handleRegistration = () => {
        Swal.fire({
            title: isArabic ? 'تأكيد التسجيل' : 'Confirm Registration',
            text: isArabic ? 'هل أنت متأكد أنك تريد التسجيل في هذه الفعالية؟' : 'Are you sure you want to register for this event?',
            icon: 'question',
            iconColor: '#d6e02e',
            showCancelButton: true,
            buttonsStyling: false,
            confirmButtonText: isArabic ? 'تأكيد التسجيل' : 'Register Now',
            cancelButtonText: isArabic ? 'إلغاء' : 'Cancel',
            customClass: swalCustomClass
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
            iconColor: '#f43f5e',
            showCancelButton: true,
            buttonsStyling: false,
            confirmButtonText: isArabic ? 'نعم، إلغاء' : 'Yes, Cancel',
            cancelButtonText: isArabic ? 'تراجع' : 'Back',
            customClass: swalCustomClass
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('events.cancel_registration', event.id));
            }
        });
    };

    const defaultHeroImage = "https://images.unsplash.com/photo-1592919505780-303950717480?q=80&w=1200";

    return (
        <div className="min-h-screen bg-[#F8FAF8] text-[#222831] pb-24 relative overflow-hidden" dir={isArabic ? "rtl" : "ltr"}>
            {/* Background Grid & Accent Lighting */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
            <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-[#d6e02e]/6 blur-[130px] pointer-events-none" />
            
            {/* main container */}
            <div className="max-w-7xl mx-auto px-6 pt-32 relative z-10">
                {/* 60/40 Asymmetric Split Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Left 60% Presentation (7 cols on lg) */}
                    <div className="lg:col-span-7 space-y-12">
                        {/* Cinematic Dark Hero Frame */}
                        <div className="relative w-full h-[400px] md:h-[500px] border-2 border-gray-200 overflow-hidden group">
                            <img 
                                src={event.image_path ? resolveAsset(`/storage/${event.image_path}`) : defaultHeroImage} 
                                className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-102 transition-transform duration-700 ease-out" 
                                alt={isArabic ? event.title_ar : event.title_en} 
                            />
                            {/* Deep Dark Sports Texture Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent z-10" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10" />
                            
                            {/* Top Controls Overlay */}
                            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
                                <Link 
                                    href={route('events')} 
                                    className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-all text-xs font-black bg-black/60 backdrop-blur-md px-5 py-2.5 border border-white/10 hover:border-[#d6e02e]"
                                >
                                    <Icon icon={isArabic ? "solar:arrow-right-linear" : "solar:arrow-left-linear"} className="w-4 h-4" />
                                    <span className={isArabic ? "font-arabic" : ""}>{isArabic ? "العودة" : "Back"}</span>
                                </Link>
                                <div className="flex gap-2">
                                    <span className="px-4 py-2 bg-black border border-[#d6e02e] text-[#d6e02e] text-xs font-black uppercase tracking-wider">
                                        {getCategoryName(event.category)}
                                    </span>
                                    <span className={`px-4 py-2 bg-black border text-white text-xs font-black uppercase tracking-wider ${
                                        event.status === 'completed' ? 'border-gray-600 text-gray-400' : 'border-emerald-500 text-emerald-400 pulse-neon-yellow'
                                    }`}>
                                        {getStatusText(event.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Massive Cinematic Event Title Overlay */}
                            <div className="absolute bottom-8 left-8 right-8 z-20 text-right rtl:text-right ltr:text-left">
                                <h1 className={`text-4xl md:text-5xl lg:text-6xl font-display font-black text-white uppercase tracking-tighter leading-tight drop-shadow-2xl ${isArabic ? "font-arabic" : ""}`}>
                                    {isArabic ? event.title_ar : event.title_en}
                                </h1>
                            </div>
                        </div>

                        {/* Description Panel */}
                        <div className="space-y-6">
                            <h3 className={`text-2xl font-display font-black text-[#222831] uppercase tracking-wider flex items-center gap-3 border-b border-gray-200 pb-4 ${isArabic ? "font-arabic" : ""}`}>
                                <Icon icon="solar:document-text-linear" className="w-6 h-6 text-[#d6e02e]" />
                                {isArabic ? "تفاصيل الفعالية" : "Event Description"}
                            </h3>
                            <div className={`text-gray-600 leading-relaxed text-lg bg-white border-2 border-gray-200 p-8 md:p-10 shadow-[4px_4px_0px_rgba(34,40,49,0.08)] ${isArabic ? "font-arabic font-medium" : "font-medium"}`}>
                                {isArabic ? event.desc_ar : event.desc_en}
                            </div>
                        </div>

                        {/* Redesigned Winners Section for Completed Events */}
                        {event.status === 'completed' && event.registrations?.length > 0 && (
                            <div className="bg-white border-2 border-gray-200 p-8 md:p-10 shadow-[4px_4px_0px_rgba(34,40,49,0.08)] relative overflow-hidden">
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#d6e02e]/5 rounded-full blur-[80px]" />
                                
                                <h3 className={`text-2xl font-display font-black text-[#222831] uppercase tracking-wider flex items-center gap-3 border-b border-gray-200 pb-4 relative z-10 ${isArabic ? "font-arabic" : ""}`}>
                                    <Icon icon="solar:cup-first-linear" className="w-6 h-6 text-[#d6e02e]" />
                                    {isArabic ? "أبطال الفعالية" : "Event Champions"}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 relative z-10">
                                    {event.registrations.map((reg) => (
                                        <div key={reg.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 hover:border-[#222831] transition-colors duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 relative bg-white">
                                                    {reg.user?.image_path ? (
                                                        <img src={resolveAsset(`/storage/${reg.user.image_path}`)} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Icon icon="solar:user-linear" className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`font-black text-[#222831] text-base ${isArabic ? "font-arabic" : ""}`}>{reg.user?.name}</p>
                                                    <p className={`text-[10px] text-[#222831] font-black uppercase tracking-wider ${isArabic ? "font-arabic" : ""}`}>{reg.user?.category || (isArabic ? 'لاعب' : 'Player')}</p>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                {reg.placement ? (
                                                    <div className={`w-10 h-10 flex items-center justify-center border font-black text-lg ${
                                                        reg.placement == 1 ? 'bg-[#d6e02e] text-[#222831] border-[#d6e02e] shadow-[0_0_10px_rgba(214,224,46,0.3)]' :
                                                        reg.placement == 2 ? 'bg-gray-200 text-gray-700 border-gray-300' :
                                                        reg.placement == 3 ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                                                        'bg-white text-gray-500 border-gray-200'
                                                    }`}>
                                                        {reg.placement}
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 border border-gray-200 text-gray-300">
                                                        <Icon icon="solar:medal-star-linear" className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Sticky 40% Card (5 cols on lg) */}
                    <div className="lg:col-span-5 lg:sticky lg:top-28 z-20">
                        <div className="bg-white border-2 border-gray-200 p-8 shadow-xl relative overflow-hidden rounded-none">
                            <h4 className={`text-xl font-display font-black text-[#222831] uppercase tracking-wider mb-8 border-b border-gray-200 pb-4 flex items-center gap-3 ${isArabic ? "font-arabic" : ""}`}>
                                <Icon icon="solar:ticket-linear" className="text-[#d6e02e] w-6 h-6" />
                                {isArabic ? "تفاصيل التسجيل" : "Registration Details"}
                            </h4>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors duration-300">
                                    <div className="w-12 h-12 bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow-sm shrink-0">
                                        <Icon icon="solar:calendar-date-linear" className="w-6 h-6 text-[#d6e02e]" />
                                    </div>
                                    <div>
                                        <p className={`text-[10px] text-gray-400 font-black uppercase tracking-wider mb-0.5 ${isArabic ? "font-arabic" : ""}`}>{isArabic ? "التاريخ" : "Date"}</p>
                                        <p className="font-black text-[#222831] text-base font-arabic">
                                            {day} {month} {year}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors duration-300">
                                    <div className="w-12 h-12 bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow-sm shrink-0">
                                        <Icon icon="solar:clock-circle-linear" className="w-6 h-6 text-[#d6e02e]" />
                                    </div>
                                    <div>
                                        <p className={`text-[10px] text-gray-400 font-black uppercase tracking-wider mb-0.5 ${isArabic ? "font-arabic" : ""}`}>{isArabic ? "الوقت" : "Time"}</p>
                                        <p className="font-black text-[#222831] text-base font-arabic">
                                            {dayjs(event.time).locale('en').format('hh:mm A')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors duration-300">
                                    <div className="w-12 h-12 bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow-sm shrink-0">
                                        <Icon icon="solar:ticket-linear" className="w-6 h-6 text-[#d6e02e]" />
                                    </div>
                                    <div>
                                        <p className={`text-[10px] text-gray-400 font-black uppercase tracking-wider mb-0.5 ${isArabic ? "font-arabic" : ""}`}>{isArabic ? "رسوم التسجيل" : "Registration Fee"}</p>
                                        <p className="font-black text-[#222831] text-base font-arabic">
                                            {event.fee > 0 ? (
                                                <>{Number(event.fee).toLocaleString('en-US')} <span className="text-xs font-bold text-gray-400">{isArabic ? 'ل.س' : 'SYP'}</span></>
                                            ) : (
                                                <span className="text-[#222831] font-black">{isArabic ? 'مجاني' : 'Free'}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors duration-300">
                                    <div className="w-12 h-12 bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow-sm shrink-0">
                                        <Icon icon="solar:users-group-two-rounded-linear" className="w-6 h-6 text-[#d6e02e]" />
                                    </div>
                                    <div>
                                        <p className={`text-[10px] text-gray-400 font-black uppercase tracking-wider mb-0.5 ${isArabic ? "font-arabic" : ""}`}>{isArabic ? "المشاركون المقبولون" : "Approved Participants"}</p>
                                        <p className="font-black text-[#222831] text-base font-arabic">
                                            {Number(event.registrations?.length || 0).toLocaleString('en-US')} / {event.max_participants ? Number(event.max_participants).toLocaleString('en-US') : '∞'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Registration actions for Desktop */}
                            <div className="relative z-10 hidden lg:block">
                                {event.status !== 'completed' && auth.user ? (
                                    user_registration ? (
                                        <div className="space-y-4">
                                            {user_registration.status === 'pending' ? (
                                                <div className="bg-amber-50 border border-amber-250 text-amber-700 font-black py-4 px-4 text-center flex items-center justify-center gap-3">
                                                    <Icon icon="solar:clock-circle-linear" className="w-6 h-6 text-amber-500 animate-pulse" />
                                                    <span className={isArabic ? "font-arabic text-xs" : "text-xs"}>
                                                        {isArabic ? "تم إرسال طلبك وبانتظار موافقة الإدارة ⏳" : "Request sent, pending admin approval ⏳"}
                                                    </span>
                                                </div>
                                            ) : user_registration.status === 'approved' ? (
                                                <div className="bg-emerald-50 border border-emerald-250 text-emerald-700 font-black py-4 px-4 text-center flex items-center justify-center gap-3">
                                                    <Icon icon="solar:check-circle-linear" className="w-6 h-6 text-emerald-600" />
                                                    <span className={isArabic ? "font-arabic text-xs" : "text-xs"}>
                                                        {isArabic ? "لقد تم تسجيلك بنجاح ✅" : "Successfully registered ✅"}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="bg-rose-50 border border-rose-250 text-rose-700 font-black py-4 px-4 text-center flex items-center justify-center gap-3">
                                                    <Icon icon="solar:close-circle-linear" className="w-6 h-6 text-rose-500" />
                                                    <span className={isArabic ? "font-arabic text-xs" : "text-xs"}>
                                                        {isArabic ? "تم رفض طلب تسجيلك من الإدارة" : "Your registration request was rejected"}
                                                    </span>
                                                </div>
                                            )}
                                            <button 
                                                onClick={handleCancelRegistration} 
                                                className="w-full text-center text-xs font-black uppercase text-gray-500 hover:text-rose-600 py-3.5 transition-colors border border-transparent"
                                            >
                                                {isArabic ? "إلغاء التسجيل" : "Cancel Registration"}
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={handleRegistration} 
                                            className="btn-sport-liquid w-full justify-center py-4 text-base font-black tracking-wider shadow-[0_4px_20px_rgba(214,224,46,0.25)] hover:shadow-[0_4px_30px_rgba(214,224,46,0.4)]"
                                        >
                                            <Icon icon="solar:user-plus-linear" className="w-6 h-6" />
                                            {isArabic ? "التسجيل في الفعالية" : "Register for Event"}
                                        </button>
                                    )
                                ) : event.status !== 'completed' && !auth.user ? (
                                    <Link 
                                        href={route('login')} 
                                        className="btn-sport-liquid w-full justify-center py-4 text-base font-black tracking-wider shadow-[0_4px_20px_rgba(214,224,46,0.25)]"
                                    >
                                        <Icon icon="solar:login-2-linear" className="w-6 h-6" />
                                        <span className={isArabic ? "font-arabic" : ""}>
                                            {isArabic ? "تسجيل الدخول للمشاركة" : "Login to Register"}
                                        </span>
                                    </Link>
                                ) : (
                                    <div className="bg-gray-100 text-gray-400 font-black py-4 px-4 border border-gray-200 text-center flex items-center justify-center gap-3">
                                        <Icon icon="solar:lock-keyhole-linear" className="w-6 h-6" />
                                        <span className={isArabic ? "font-arabic text-base" : "text-base"}>
                                            {isArabic ? "التسجيل مغلق - الفعالية مكتملة" : "Registration Closed"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Ergonomic Floating Bottom Sheet/Action Bar for Mobile devices */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t-2 border-gray-200 p-4 backdrop-blur-lg shadow-2xl flex items-center justify-between gap-4">
                <div className="flex flex-col text-left rtl:text-right">
                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider">{isArabic ? "الرسوم" : "Registration Fee"}</span>
                    <span className="font-black text-[#222831] text-sm font-arabic mt-0.5">
                        {event.fee > 0 ? (
                            <>{Number(event.fee).toLocaleString('en-US')} <span className="text-[10px] text-gray-400">{isArabic ? 'ل.س' : 'SYP'}</span></>
                        ) : (
                            <span className="text-[#222831] font-black">{isArabic ? 'مجاني' : 'Free'}</span>
                        )}
                    </span>
                </div>
                <div className="flex-1 max-w-[240px]">
                    {event.status !== 'completed' && auth.user ? (
                        user_registration ? (
                            <button 
                                onClick={handleCancelRegistration}
                                className="w-full bg-rose-50 border border-rose-200 text-rose-600 py-3.5 text-xs font-black uppercase"
                            >
                                {isArabic ? "إلغاء التسجيل" : "Cancel"}
                            </button>
                        ) : (
                            <button 
                                onClick={handleRegistration} 
                                className="btn-sport-liquid w-full justify-center py-3.5 text-xs font-black tracking-wider"
                            >
                                {isArabic ? "تسجيل" : "Register"}
                            </button>
                        )
                    ) : event.status !== 'completed' && !auth.user ? (
                        <Link 
                            href={route('login')} 
                            className="btn-sport-liquid w-full justify-center py-3.5 text-xs font-black tracking-wider"
                        >
                            {isArabic ? "تسجيل الدخول" : "Login"}
                        </Link>
                    ) : (
                        <span className="w-full block text-center text-xs font-black text-gray-450 border border-gray-200 py-3.5 bg-gray-50">
                            {isArabic ? "مغلق" : "Closed"}
                        </span>
                    )}
                </div>
            </div>

        </div>
    );
}

EventDetails.layout = page => <AppLayout children={page} />;
