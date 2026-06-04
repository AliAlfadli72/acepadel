import { Link, usePage } from '@inertiajs/react';

export default function Error({ status, lang = 'ar' }) {
    const isAr = lang === 'ar';

    const errors = {
        401: {
            title: isAr ? 'يرجى تسجيل الدخول' : 'Login Required',
            description: isAr
                ? 'يجب تسجيل الدخول للوصول إلى هذه الصفحة.'
                : 'You must be logged in to access this page.',
            icon: 'mdi:account-lock',
        },
        404: {
            title: isAr ? 'الصفحة غير موجودة' : 'Page Not Found',
            description: isAr
                ? 'عذراً، الصفحة التي تبحث عنها غير موجودة.'
                : 'Sorry, the page you are looking for does not exist.',
            icon: 'mdi:file-search',
        },
        419: {
            title: isAr ? 'انتهت صلاحية الجلسة' : 'Session Expired',
            description: isAr
                ? 'يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى.'
                : 'Please refresh the page and try again.',
            icon: 'mdi:clock-alert',
        },
        429: {
            title: isAr ? 'طلبات كثيرة جداً' : 'Too Many Requests',
            description: isAr
                ? 'يرجى الانتظار قليلاً قبل المحاولة مرة أخرى.'
                : 'Please wait a moment before trying again.',
            icon: 'mdi:speedometer',
        },
        500: {
            title: isAr ? 'خطأ في الخادم' : 'Server Error',
            description: isAr
                ? 'حدث خطأ غير متوقع.'
                : 'An unexpected error occurred.',
            icon: 'mdi:server-off',
        },
        503: {
            title: isAr ? 'النظام تحت الصيانة' : 'Maintenance Mode',
            description: isAr
                ? 'نقوم حالياً بإجراء بعض التحديثات.'
                : 'We are currently performing maintenance.',
            icon: 'mdi:tools',
        },
    };

    const error = errors[status] || errors[500];

    return (
        <>
            <Head title={`${status} - ${error.title}`} />

            <div
                dir={isAr ? 'rtl' : 'ltr'}
                className="min-h-screen flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: '#222831' }}
            >
                {/* Background Effects */}
                <div
                    className="absolute top-[-120px] right-[-120px] w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
                    style={{ backgroundColor: '#d6e02e' }}
                />

                <div
                    className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full blur-3xl opacity-10"
                    style={{ backgroundColor: '#d6e02e' }}
                />

                <div className="relative z-10 max-w-3xl w-full px-6 text-center">

                    {/* Brand */}
                    <div className="mb-10">
                        <img
                            src="/icon.png"
                            alt="Ace Padel"
                            className="w-16 h-16 mx-auto mb-4 brightness-0 invert"
                        />

                        <h2
                            className="text-white font-black text-2xl"
                            style={{
                                fontFamily: isAr
                                    ? "'Cairo', sans-serif"
                                    : "'Barlow Condensed', sans-serif"
                            }}
                        >
                            {isAr
                                ? 'آيس بادل أكاديمي'
                                : 'ACE PADEL ACADEMY'}
                        </h2>
                    </div>

                    {/* Error Code */}
                    <h1
                        className="font-black text-[140px] md:text-[220px] leading-none"
                        style={{
                            color: '#d6e02e',
                            fontFamily: "'Barlow Condensed', sans-serif"
                        }}
                    >
                        {status}
                    </h1>

                    {/* Icon */}
                    <div className="mb-6">
                        <Icon
                            icon={error.icon}
                            className="w-16 h-16 mx-auto text-white"
                        />
                    </div>

                    {/* Title */}
                    <h3
                        className="text-3xl md:text-4xl font-black text-white mb-4"
                        style={{
                            fontFamily: isAr
                                ? "'Cairo', sans-serif"
                                : "'Barlow Condensed', sans-serif"
                        }}
                    >
                        {error.title}
                    </h3>

                    {/* Description */}
                    <p
                        className="text-white/70 text-lg max-w-xl mx-auto mb-10"
                        style={{
                            fontFamily: isAr
                                ? "'Cairo', sans-serif"
                                : 'Inter, sans-serif'
                        }}
                    >
                        {error.description}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">

                        <button
                            onClick={() => window.history.back()}
                            className="px-6 py-3 rounded-xl font-bold transition-all"
                            style={{
                                backgroundColor: 'rgba(255,255,255,.08)',
                                color: '#fff'
                            }}
                        >
                            {isAr ? 'رجوع للخلف' : 'Go Back'}
                        </button>

                        <Link
                            href="/"
                            className="px-6 py-3 rounded-xl font-bold transition-all"
                            style={{
                                backgroundColor: '#d6e02e',
                                color: '#222831'
                            }}
                        >
                            {isAr ? 'الصفحة الرئيسية' : 'Home Page'}
                        </Link>
                    </div>

                    <div className="mt-12 text-white/40 text-xs">
                        © {new Date().getFullYear()} Ace Padel Academy
                    </div>

                </div>
            </div>
        </>
    );
}
