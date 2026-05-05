import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [lang, setLang] = useState('ar');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const isAr = lang === 'ar';

    const t = {
        pageTitle:  isAr ? 'إنشاء حساب — آيس بادل' : 'Register — Ace Padel Academy',
        heading1:   isAr ? 'حساب' : 'CREATE',
        heading2:   isAr ? 'جديد.' : 'ACCOUNT.',
        subtitle:   isAr ? 'انضم إلينا وابدأ حجز ملاعبك بسهولة.' : 'Join us and start booking your courts easily.',
        nameLabel:  isAr ? 'الاسم الكامل' : 'Full Name',
        namePH:     isAr ? 'أدخل اسمك الكامل' : 'Enter your full name',
        emailLabel: isAr ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email Address or Phone Number',
        emailPH:    isAr ? 'بريدك الإلكتروني أو رقم هاتفك' : 'your@email.com or phone number',
        passLabel:  isAr ? 'كلمة المرور' : 'Password',
        passConfirm:isAr ? 'تأكيد كلمة المرور' : 'Confirm Password',
        register:   isAr ? 'إنشاء الحساب' : 'Create Account',
        registering:isAr ? 'جارٍ الإنشاء...' : 'Creating...',
        already:    isAr ? 'لديك حساب بالفعل؟ سجل دخولك' : 'Already registered? Sign in',
        or:         isAr ? 'أو' : 'or',
        backSite:   isAr ? 'العودة للموقع' : 'Back to Website',
        footer:     isAr ? `آيس بادل أكاديمي © ${new Date().getFullYear()} · دمشق، سوريا` : `ACE PADEL ACADEMY © ${new Date().getFullYear()} · Damascus, Syria`,
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const inputBase = {
        backgroundColor: '#FFFFFF',
        color: '#0F1A13',
        fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif',
        boxShadow: '0 1px 4px rgba(15,26,19,0.04)',
        outline: 'none',
    };

    return (
        <GuestLayout lang={lang} setLang={setLang}>
            <Head title={t.pageTitle} />

            {/* Heading */}
            <div className="mb-8">
                {isAr ? (
                    <h1 className="font-black mb-2"
                        style={{ fontFamily: "'Cairo', sans-serif", color: '#2C5234', fontSize: '2.4rem', lineHeight: '1.2' }}>
                        {t.heading1} <span style={{ color: '#0F1A13' }}>{t.heading2}</span>
                    </h1>
                ) : (
                    <h1 className="font-black text-4xl mb-2"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#2C5234', lineHeight: '0.95' }}>
                        {t.heading1}<br /><span style={{ color: '#0F1A13' }}>{t.heading2}</span>
                    </h1>
                )}
                <p className="text-sm mt-3"
                    style={{ color: '#637060', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif' }}>
                    {t.subtitle}
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">

                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-xs font-bold mb-2"
                        style={{ color: '#2C5234', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif', textTransform: isAr ? 'none' : 'uppercase', letterSpacing: isAr ? '0' : '0.12em' }}>
                        {t.nameLabel}
                    </label>
                    <input
                        id="name" type="text" name="name"
                        value={data.name} autoComplete="name" autoFocus
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder={t.namePH}
                        dir={isAr ? "rtl" : "ltr"}
                        className="block w-full rounded-xl px-4 py-3.5 text-sm transition-all"
                        style={{ ...inputBase, border: errors.name ? '1.5px solid #ef4444' : '1.5px solid #D9E8D9' }}
                        onFocus={e => e.target.style.borderColor = '#2C5234'}
                        onBlur={e => e.target.style.borderColor = errors.name ? '#ef4444' : '#D9E8D9'}
                    />
                    <InputError message={errors.name} className="mt-1.5" />
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-xs font-bold mb-2"
                        style={{ color: '#2C5234', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif', textTransform: isAr ? 'none' : 'uppercase', letterSpacing: isAr ? '0' : '0.12em' }}>
                        {t.emailLabel}
                    </label>
                    <input
                        id="email" type="text" name="email"
                        value={data.email} autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder={t.emailPH}
                        dir="ltr"
                        className="block w-full rounded-xl px-4 py-3.5 text-sm transition-all"
                        style={{ ...inputBase, border: errors.email ? '1.5px solid #ef4444' : '1.5px solid #D9E8D9' }}
                        onFocus={e => e.target.style.borderColor = '#2C5234'}
                        onBlur={e => e.target.style.borderColor = errors.email ? '#ef4444' : '#D9E8D9'}
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-xs font-bold mb-2"
                        style={{ color: '#2C5234', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif', textTransform: isAr ? 'none' : 'uppercase', letterSpacing: isAr ? '0' : '0.12em' }}>
                        {t.passLabel}
                    </label>
                    <div className="relative">
                        <input
                            id="password" type={showPassword ? 'text' : 'password'} name="password"
                            value={data.password} autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            dir="ltr"
                            className={`block w-full rounded-xl px-4 py-3.5 text-sm transition-all ${isAr ? 'pl-12' : 'pr-12'}`}
                            style={{ ...inputBase, border: errors.password ? '1.5px solid #ef4444' : '1.5px solid #D9E8D9' }}
                            onFocus={e => e.target.style.borderColor = '#2C5234'}
                            onBlur={e => e.target.style.borderColor = errors.password ? '#ef4444' : '#D9E8D9'}
                        />
                        <button type="button" tabIndex={-1}
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute ${isAr ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 p-1.5 rounded-lg`}
                            style={{ color: '#637060' }}>
                            {showPassword
                                ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            }
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="password_confirmation" className="block text-xs font-bold mb-2"
                        style={{ color: '#2C5234', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif', textTransform: isAr ? 'none' : 'uppercase', letterSpacing: isAr ? '0' : '0.12em' }}>
                        {t.passConfirm}
                    </label>
                    <div className="relative">
                        <input
                            id="password_confirmation" type={showConfirmPassword ? 'text' : 'password'} name="password_confirmation"
                            value={data.password_confirmation} autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="••••••••"
                            dir="ltr"
                            className={`block w-full rounded-xl px-4 py-3.5 text-sm transition-all ${isAr ? 'pl-12' : 'pr-12'}`}
                            style={{ ...inputBase, border: errors.password_confirmation ? '1.5px solid #ef4444' : '1.5px solid #D9E8D9' }}
                            onFocus={e => e.target.style.borderColor = '#2C5234'}
                            onBlur={e => e.target.style.borderColor = errors.password_confirmation ? '#ef4444' : '#D9E8D9'}
                        />
                        <button type="button" tabIndex={-1}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className={`absolute ${isAr ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 p-1.5 rounded-lg`}
                            style={{ color: '#637060' }}>
                            {showConfirmPassword
                                ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            }
                        </button>
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>

                {/* Link to Login */}
                <div className="pt-1">
                    <Link href={route('login')}
                        className="text-xs font-bold"
                        style={{ color: '#2C5234', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                        {t.already}
                    </Link>
                </div>

                {/* Submit */}
                <button type="submit" disabled={processing}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-sm transition-all mt-2"
                    style={{
                        backgroundColor: processing ? '#637060' : '#2C5234',
                        color: '#FFFFFF',
                        fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif',
                        letterSpacing: isAr ? '0' : '0.12em',
                        textTransform: isAr ? 'none' : 'uppercase',
                        boxShadow: processing ? 'none' : '0 8px 30px rgba(44,82,52,0.35)',
                        cursor: processing ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={e => { if (!processing) { e.currentTarget.style.backgroundColor = '#1E3A24'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                    onMouseLeave={e => { if (!processing) { e.currentTarget.style.backgroundColor = '#2C5234'; e.currentTarget.style.transform = 'none'; } }}
                >
                    {processing ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            {t.registering}
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            {t.register}
                        </>
                    )}
                </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px" style={{ backgroundColor: '#D9E8D9' }} />
                <span className="text-xs" style={{ color: '#637060', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif' }}>
                    {t.or}
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: '#D9E8D9' }} />
            </div>

            {/* Back to website */}
            <Link href="/"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm transition-all border-2"
                style={{ borderColor: '#2C5234', color: '#2C5234', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif', letterSpacing: isAr ? '0' : '0.1em', textTransform: isAr ? 'none' : 'uppercase', backgroundColor: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2C5234'; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#2C5234'; }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {t.backSite}
            </Link>

            {/* Footer */}
            <p className="text-center text-xs mt-6"
                style={{ color: '#637060', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif' }}>
                {t.footer}
            </p>
        </GuestLayout>
    );
}
