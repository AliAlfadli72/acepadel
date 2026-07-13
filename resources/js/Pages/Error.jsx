import { Head, Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';

const errors = {
    401: {
        title: 'يرجى تسجيل الدخول',
        description: 'يجب تسجيل الدخول للوصول إلى هذه الصفحة.',
        icon: 'mdi:account-lock',
        bg: 'bg-blue-50',
        color: 'text-blue-600',
    },
    403: {
        title: 'غير مصرح لك بالوصول',
        description: 'عذراً، ليس لديك الصلاحيات الكافية لعرض هذه الصفحة.',
        icon: 'mdi:shield-alert',
        bg: 'bg-amber-50',
        color: 'text-amber-600',
    },
    404: {
        title: 'الصفحة غير موجودة',
        description: 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.',
        icon: 'mdi:file-search',
        bg: 'bg-rose-50',
        color: 'text-rose-600',
    },
    419: {
        title: 'انتهت صلاحية الجلسة',
        description: 'يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى.',
        icon: 'mdi:clock-alert',
        bg: 'bg-orange-50',
        color: 'text-orange-600',
    },
    429: {
        title: 'طلبات كثيرة جداً',
        description: 'يرجى الانتظار قليلاً قبل المحاولة مرة أخرى.',
        icon: 'mdi:speedometer',
        bg: 'bg-purple-50',
        color: 'text-purple-600',
    },
    500: {
        title: 'خطأ في الخادم',
        description: 'حدث خطأ غير متوقع في خوادمنا. نحن نعمل على إصلاحه حالياً.',
        icon: 'mdi:server-off',
        bg: 'bg-red-50',
        color: 'text-red-600',
    },
    503: {
        title: 'النظام تحت الصيانة',
        description: 'نقوم حالياً بإجراء بعض التحديثات لتحسين الخدمة. سنعود قريباً.',
        icon: 'mdi:tools',
        bg: 'bg-emerald-50',
        color: 'text-emerald-600',
    },
};

export default function Error({ status }) {
    const error = errors[status] || errors[500];

    return (
        <>
            <Head title={`${status} - ${error.title}`} />

            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="w-full max-w-3xl">

                    {/* Main Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

                        {/* Header */}
                        <div className="relative bg-primary px-8 py-10 text-center overflow-hidden">

                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white" />
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white" />
                            </div>

                            <div className="relative">
                                <h1 className="text-8xl md:text-9xl font-black text-white">
                                    {status}
                                </h1>

                                <p className="text-white/80 mt-2 font-medium">
                                    Ace Padel Club
                                </p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8 text-center">

                            <div
                                className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-6 ${error.bg}`}
                            >
                                <Icon
                                    icon={error.icon}
                                    className={`w-12 h-12 ${error.color}`}
                                />
                            </div>

                            <h2 className="text-3xl font-black text-gray-900 mb-3">
                                {error.title}
                            </h2>

                            <p className="text-gray-500 max-w-lg mx-auto leading-7">
                                {error.description}
                            </p>

                            {/* Buttons */}
                            <div className="mt-10 flex flex-col md:flex-row gap-3 justify-center">

                                <button
                                    onClick={() => window.history.back()}
                                    className="px-6 py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 transition-all"
                                >
                                    <span className="flex items-center gap-2 justify-center">
                                        <Icon icon="mdi:arrow-right" />
                                        رجوع للخلف
                                    </span>
                                </button>

                                <Link
                                    href="/"
                                    className="px-6 py-3 rounded-2xl bg-primary text-white font-bold hover:opacity-90 transition-all"
                                >
                                    <span className="flex items-center gap-2 justify-center">
                                        <Icon icon="mdi:home-outline" />
                                        الصفحة الرئيسية
                                    </span>
                                </Link>
                            </div>

                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 text-center text-xs text-gray-400">
                        Ace Padel Club © {new Date().getFullYear()}
                    </div>

                </div>
            </div>
        </>
    );
}