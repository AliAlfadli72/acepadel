import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        phone: '',
        password: '',
        remember: false,
    });
    const [lang, setLang] = useState('ar');
    const [showPassword, setShowPassword] = useState(false);
    const isAr = lang === 'ar';

    const t = {
        pageTitle:  isAr ? 'تسجيل الدخول — آيس بادل' : 'Login — Ace Padel Club',
        heading1:   isAr ? 'أهلاً' : 'WELCOME',
        heading2:   isAr ? 'بعودتك.' : 'BACK.',
        subtitle:   isAr ? 'سجّل دخولك إلى حسابك في آيس بادل.' : 'Sign in to your Ace Padel Club account.',
        phoneLabel: isAr ? 'رقم الهاتف' : 'Phone Number',
        phonePH: isAr ? 'مثال: +963... أو +966... أو 09...' : 'e.g. +963... or +966... or 09...',
        passLabel:  isAr ? 'كلمة المرور' : 'Password',
        remember:   isAr ? 'تذكّرني' : 'Remember me',
        forgot:     isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?',
        signIn:     isAr ? 'تسجيل الدخول' : 'Sign In',
        signingIn:  isAr ? 'جارٍ الدخول...' : 'Signing In...',
        or:         isAr ? 'أو' : 'or',
        noAccount:  isAr ? 'ليس لديك حساب؟' : "Don't have an account?",
        register:   isAr ? 'إنشاء حساب جديد' : 'Create new account',
        backSite:   isAr ? 'العودة للموقع' : 'Back to Website',
        footer:     isAr ? `آيس بادل كلوب © ${new Date().getFullYear()} · دمشق، سوريا` : `ACE PADEL CLUB © ${new Date().getFullYear()} · Damascus, Syria`,
    };

const submit = (e) => {
    e.preventDefault();

    post(route('login'), {
        onFinish: () => reset('password'),
    });
};

    const inputBase = {
        backgroundColor: '#FFFFFF',
        color: '#1a1d20',
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
                        style={{ fontFamily: "'Cairo', sans-serif", color: '#222831', fontSize: '2.4rem', lineHeight: '1.2' }}>
                        {t.heading1} {t.heading2}
                    </h1>
                ) : (
                    <h1 className="font-black text-4xl mb-2"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#222831', lineHeight: '0.95' }}>
                        {t.heading1}<br /><span style={{ color: '#1a1d20' }}>{t.heading2}</span>
                    </h1>
                )}
                <p className="text-sm mt-3"
                    style={{ color: '#616161', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif' }}>
                    {t.subtitle}
                </p>
            </div>

            {/* Status */}
            {status && (
                <div className="mb-6 text-sm font-medium px-4 py-3 rounded-xl border"
                    style={{ color: '#222831', backgroundColor: '#eeeeee', borderColor: '#e0e0e0', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif' }}>
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">

                <div>
                    <label
                        htmlFor="phone"
                        className="block text-xs font-bold mb-2"
                        style={{
                            color: '#222831',
                            fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif',
                        }}
                    >
                        {t.phoneLabel}
                    </label>

                    <input
                        id="phone"
                        type="text"
                        name="phone"
                        autoFocus
                        value={data.phone}
                        autoComplete="off"
                        onChange={(e) => {
                            const val = e.target.value;
                            const cleaned = val.replace(/[^\d+]/g, '');
                            setData('phone', cleaned);
                        }}
                        placeholder={t.phonePH}
                        dir="ltr"
                        className="block w-full rounded-xl px-4 py-3.5 text-sm transition-all"
                        style={{ ...inputBase, border: errors.phone ? '1.5px solid #ef4444' : '1.5px solid #e0e0e0' }}
                        onFocus={e => e.target.style.borderColor = '#222831'}
                        onBlur={e => e.target.style.borderColor = errors.phone ? '#ef4444' : '#e0e0e0'}
                    />

                    <InputError message={errors.phone} className="mt-1.5" />
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-xs font-bold mb-2"
                        style={{ color: '#222831', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif', textTransform: isAr ? 'none' : 'uppercase', letterSpacing: isAr ? '0' : '0.12em' }}>
                        {t.passLabel}
                    </label>
                    <div className="relative">
                        <input
                            id="password" type={showPassword ? 'text' : 'password'} name="password"
                            value={data.password} autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            dir="ltr"
                            className={`block w-full rounded-xl px-4 py-3.5 text-sm transition-all ${isAr ? 'pl-12' : 'pr-12'}`}
                            style={{ ...inputBase, border: errors.password ? '1.5px solid #ef4444' : '1.5px solid #e0e0e0' }}
                            onFocus={e => e.target.style.borderColor = '#222831'}
                            onBlur={e => e.target.style.borderColor = errors.password ? '#ef4444' : '#e0e0e0'}
                        />
                        <button type="button" tabIndex={-1}
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute ${isAr ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 p-1.5 rounded-lg`}
                            style={{ color: '#616161' }}>
                            {showPassword
                                ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            }
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                        <Checkbox name="remember" checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)} />
                        <span className="text-sm" style={{ color: '#616161', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif' }}>
                            {t.remember}
                        </span>
                    </label>
                    {canResetPassword && (
                        <Link href={route('password.request')}
                            className="text-xs font-bold"
                            style={{ color: '#222831', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                            {t.forgot}
                        </Link>
                    )}
                </div>

                {/* Submit */}
                <button type="submit" disabled={processing}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-sm transition-all"
                    style={{
                        backgroundColor: processing ? '#616161' : '#222831',
                        color: '#FFFFFF',
                        fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif',
                        letterSpacing: isAr ? '0' : '0.12em',
                        textTransform: isAr ? 'none' : 'uppercase',
                        boxShadow: processing ? 'none' : '0 8px 30px rgba(34,40,49,0.35)',
                        cursor: processing ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={e => { if (!processing) { e.currentTarget.style.backgroundColor = '#1a1f26'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                    onMouseLeave={e => { if (!processing) { e.currentTarget.style.backgroundColor = '#222831'; e.currentTarget.style.transform = 'none'; } }}
                >
                    {processing ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            {t.signingIn}
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            {t.signIn}
                        </>
                    )}
                </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px" style={{ backgroundColor: '#e0e0e0' }} />
                <span className="text-xs" style={{ color: '#616161', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif' }}>
                    {t.or}
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: '#e0e0e0' }} />
            </div>

            {/* Create account */}
            <div className="flex justify-center items-center gap-2 mb-6 text-sm" style={{ fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif' }}>
                <span style={{ color: '#616161' }}>{t.noAccount}</span>
                <Link href={route('register')} className="font-bold hover:underline" style={{ color: '#222831', textUnderlineOffset: '3px' }}>
                    {t.register}
                </Link>
            </div>

            {/* Back to website */}
            <Link href={route('home')}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm transition-all border-2"
                style={{ borderColor: '#222831', color: '#222831', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif', letterSpacing: isAr ? '0' : '0.1em', textTransform: isAr ? 'none' : 'uppercase', backgroundColor: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#222831'; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#222831'; }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {t.backSite}
            </Link>

            {/* Footer */}
            <p className="text-center text-xs mt-6"
                style={{ color: '#616161', fontFamily: isAr ? "'Cairo', sans-serif" : 'Inter, sans-serif' }}>
                {t.footer}
            </p>
        </GuestLayout>
    );
}
