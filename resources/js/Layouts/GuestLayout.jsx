import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, lang = 'ar', setLang }) {
    const isAr = lang === 'ar';

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
        <div className="min-h-screen flex overflow-hidden" style={{ backgroundColor: '#F8FAF8' }} dir={isAr ? 'rtl' : 'ltr'}>

            {/* ─── BRANDING PANEL ─── */}
            <div
                className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
                style={{ backgroundColor: '#2C5234' }}
            >
                {/* Blobs */}
                <div className="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
                    style={{ backgroundColor: '#DFFF00' }} />
                <div className="absolute bottom-[-60px] left-[-60px] w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
                    style={{ backgroundColor: '#DFFF00' }} />

                {/* Logo */}
                <Link href="/" className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0"
                        style={{ backgroundColor: '#DFFF00', color: '#2C5234', fontFamily: "'Barlow Condensed', sans-serif" }}>
                        A
                    </div>
                    <span className="font-black text-white text-xl"
                        style={{ fontFamily: isAr ? "'Cairo', sans-serif" : "'Barlow Condensed', sans-serif", letterSpacing: isAr ? '0' : '0.08em' }}>
                        {t.brandName}
                    </span>
                </Link>

                {/* Center */}
                <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
                    <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border w-fit mb-8"
                        style={{ color: '#DFFF00', borderColor: 'rgba(223,255,0,0.3)', backgroundColor: 'rgba(223,255,0,0.08)', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif' }}>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {t.location}
                    </div>

                    <h2 className="font-black text-white mb-6"
                        style={{
                            fontFamily: isAr ? "'Cairo', sans-serif" : "'Barlow Condensed', sans-serif",
                            fontSize: 'clamp(2.8rem, 4.5vw, 4.8rem)',
                            lineHeight: isAr ? '1.35' : '0.95',
                        }}>
                        {t.slogan1}<br />
                        <span style={{ color: '#DFFF00' }}>{t.slogan2}</span><br />
                        {t.slogan3}
                    </h2>

                    <p className="text-white/70 text-sm leading-relaxed max-w-sm"
                        style={{ fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif' }}>
                        {t.desc}
                    </p>

                    {/* Stats */}
                    <div className="flex gap-8 mt-10 pt-10 border-t" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                        {[
                            { v: '8',    l: t.courts },
                            { v: '500+', l: t.members },
                            { v: 'FIP',  l: t.certified },
                        ].map(({ v, l }) => (
                            <div key={l}>
                                <div className="font-black text-white text-2xl" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{v}</div>
                                <div className="text-white/50 text-xs" style={{ fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif', textTransform: isAr ? 'none' : 'uppercase', letterSpacing: isAr ? '0' : '0.15em' }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10">
                    <p className="text-white/40 text-xs" style={{ fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif', textTransform: isAr ? 'none' : 'uppercase', letterSpacing: isAr ? '0' : '0.2em' }}>
                        {t.openDaily}
                    </p>
                </div>
            </div>

            {/* ─── FORM PANEL ─── */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 relative">

                {/* Lang Toggle */}
                {setLang && (
                    <div className="absolute top-6" style={{ [isAr ? 'left' : 'right']: '1.5rem' }}>
                        <button
                            onClick={() => setLang(isAr ? 'en' : 'ar')}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border font-bold text-xs transition-all"
                            style={{ borderColor: '#D9E8D9', color: '#2C5234', backgroundColor: '#FFFFFF', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif' }}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                            {t.toggleBtn}
                        </button>
                    </div>
                )}

                {/* Mobile logo */}
                <Link href="/" className="flex lg:hidden items-center gap-3 mb-10">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-base shrink-0"
                        style={{ backgroundColor: '#2C5234', color: '#DFFF00', fontFamily: "'Barlow Condensed', sans-serif" }}>
                        A
                    </div>
                    <span className="font-black text-lg" style={{ color: '#2C5234', fontFamily: isAr ? "'Cairo', sans-serif" : "'Barlow Condensed', sans-serif" }}>
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
