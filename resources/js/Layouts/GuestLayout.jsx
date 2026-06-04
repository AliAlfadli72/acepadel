import { Link, usePage } from '@inertiajs/react';

export default function GuestLayout({ children, lang = 'ar', setLang }) {
    const isAr = lang === 'ar';
    const { icon_url } = usePage().props;

    const t = {
        location:  isAr ? 'دمشق — أوتوستراد الفيحاء' : 'Damascus — AlFayha Highway',
        slogan1:   isAr ? 'العَب.'    : 'PLAY.',
        slogan2:   isAr ? 'تَدرَّب.'  : 'TRAIN.',
        slogan3:   isAr ? 'تَفَوَّق.' : 'EXCEL.',
        desc:      isAr
            ? 'الوجهة الرياضية الأولى في دمشق. ملاعب معتمدة FIP وتدريب على أعلى مستوى.'
            : "Damascus' premier padel destination. FIP-certified courts & world-class coaching.",
        courts:    isAr ? 'ملعب'   : 'Courts',
        members:   isAr ? 'عضو'    : 'Members',
        certified: isAr ? 'معتمد'  : 'Certified',
        openDaily: isAr ? 'مفتوح يومياً · 7:00 ص — 2:00 ص' : 'Open Daily · 7:00 AM — 2:00 AM',
        brandName: isAr ? 'آيس بادل أكاديمي' : 'ACE PADEL ACADEMY',
        toggleBtn: isAr ? 'English' : 'العربية',
    };

    return (
        <div className="min-h-screen flex overflow-hidden" style={{ backgroundColor: '#F9F9F9' }} dir={isAr ? 'rtl' : 'ltr'}>

            {/* ─── BRANDING PANEL ─── */}
            <div
                className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
                style={{ backgroundColor: '#222831' }}
            >
                {/* Blobs */}
                <div className="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
                    style={{ backgroundColor: '#d6e02e' }} />
                <div className="absolute bottom-[-60px] left-[-60px] w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
                    style={{ backgroundColor: '#d6e02e' }} />

                {/* Logo */}
                <Link href={route('home')} className="relative z-10 flex items-center gap-3">
                    <img src={icon_url || "/icon.png"} alt="Ace Padel Icon" className="w-10 h-10 object-contain brightness-0 invert" />
                    <span className="font-black text-white text-xl"
                        style={{ fontFamily: isAr ? "'Cairo', sans-serif" : "'Barlow Condensed', sans-serif", letterSpacing: isAr ? '0' : '0.08em' }}>
                        {t.brandName}
                    </span>
                </Link>

                {/* Center */}
                <div className="relative z-10 flex-grow flex flex-col justify-center py-12">
                    <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border w-fit mb-8"
                        style={{ color: '#d6e02e', borderColor: 'rgba(214,224,46,0.3)', backgroundColor: 'rgba(214,224,46,0.08)', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif' }}>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {t.location}
                    </div>

                    <h1 className="text-white font-black leading-[0.9] mb-6 flex flex-col"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                        <span className="text-5xl md:text-7xl">{t.slogan1}</span>
                        <span className="text-5xl md:text-7xl" style={{ color: '#d6e02e' }}>{t.slogan2}</span>
                        <span className="text-5xl md:text-7xl">{t.slogan3}</span>
                    </h1>

                    <p className="text-white/80 max-w-sm mb-12 leading-relaxed"
                        style={{ fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif', fontSize: isAr ? '14px' : '16px' }}>
                        {t.desc}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/10 max-w-md">
                        <div>
                            <p className="text-white font-black text-2xl md:text-3xl leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>8</p>
                            <p className="text-white/60 text-xs mt-1" style={{ fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif' }}>{t.courts} {t.certified}</p>
                        </div>
                        <div>
                            <p className="text-white font-black text-2xl md:text-3xl leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>500+</p>
                            <p className="text-white/60 text-xs mt-1" style={{ fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif' }}>{t.members}</p>
                        </div>
                        <div>
                            <p className="text-white font-black text-2xl md:text-3xl leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>7/7</p>
                            <p className="text-white/60 text-xs mt-1" style={{ fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif' }}>{t.openDaily}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 flex items-center justify-between text-white/50 text-xs pt-6 border-t border-white/5">
                    <span>© {new Date().getFullYear()} {t.brandName}</span>
                    <span>Nuwa Software</span>
                </div>
            </div>

            {/* ─── FORM PANEL ─── */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 relative">
                
                {/* Language switcher */}
                {setLang && (
                    <div className="absolute top-8 left-8">
                        <button
                            onClick={() => setLang(isAr ? 'en' : 'ar')}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border font-bold text-xs transition-all"
                            style={{ borderColor: '#E0E0E0', color: '#222831', backgroundColor: '#FFFFFF', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif' }}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                            {t.toggleBtn}
                        </button>
                    </div>
                )}

                {/* Mobile logo */}
                <Link href={route('home')} className="flex lg:hidden items-center gap-3 mb-10">
                    <img src={icon_url || "/icon.png"} alt="Ace Padel Icon" className="w-9 h-9 object-contain" />
                    <span className="font-black text-lg" style={{ color: '#222831', fontFamily: isAr ? "'Cairo', sans-serif" : "'Barlow Condensed', sans-serif" }}>
                        {t.brandName}
                    </span>
                </Link>

                {/* Form content */}
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
}