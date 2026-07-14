import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Icon } from "@iconify/react";
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import usePermissions from "@/hooks/usePermissions";
import { resolveAsset } from '../../../utils';
import 'dayjs/locale/ar';

dayjs.locale('ar');

const DAYS_OF_WEEK = [
    { id: 0, name: 'الأحد' },
    { id: 1, name: 'الإثنين' },
    { id: 2, name: 'الثلاثاء' },
    { id: 3, name: 'الأربعاء' },
    { id: 4, name: 'الخميس' },
    { id: 5, name: 'الجمعة' },
    { id: 6, name: 'السبت' },
];

export default function CoachesIndex({ coaches, courts, eligiblePlayers }) {

    const { can } = usePermissions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoach, setEditingCoach] = useState(null);
    const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
    const [analyticsCoach, setAnalyticsCoach] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        user_id: '',
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        image: null,
        bio: '',
        specialty: '',
        hourly_rate: 0,
        courts: [],
        availabilities: [],
    });

    const openModal = (coach = null) => {

        if (coach && !can('coaches.edit')) {
            return;
        }

        if (!coach && !can('coaches.create')) {
            return;
        }   
         clearErrors();
        if (coach) {
            setEditingCoach(coach);
            setData({
                user_id: coach.id,
                name: coach.name,
                email: coach.email || '',
                phone: coach.phone || '',
                password: '',
                password_confirmation: '',
                image: null,
                bio: coach.coach_profile?.bio || '',
                specialty: coach.coach_profile?.specialty || '',
                hourly_rate: coach.coach_profile?.hourly_rate ? parseInt(coach.coach_profile.hourly_rate, 10) : 0,
                courts: coach.coach_profile?.courts ? coach.coach_profile.courts.map(c => c.id) : [],
                availabilities: coach.coach_profile?.availabilities ? coach.coach_profile.availabilities.map(a => ({
                    day_of_week: a.day_of_week,
                    start_time: a.start_time.substring(0, 5),
                    end_time: a.end_time.substring(0, 5)
                })) : [],
            });
        } else {
            setEditingCoach(null);
            reset();
            setData('availabilities', []);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setEditingCoach(null);
    };

    const submit = (e) => {
        e.preventDefault();

        if (editingCoach) {
            // Use router.post with _method:'PUT' for Laravel method spoofing
            // forceFormData is needed so the file (image) is included correctly
            router.post(route('admin.coaches.update', editingCoach.id), {
                _method: 'PUT',
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: data.password,
                password_confirmation: data.password_confirmation,
                image: data.image,
                bio: data.bio,
                specialty: data.specialty,
                hourly_rate: data.hourly_rate,
                courts: data.courts,
                availabilities: data.availabilities,
            }, {
                forceFormData: true,
                onSuccess: () => closeModal(),
                onError: (errs) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'يوجد خطأ في المدخلات',
                        text: Object.values(errs).join('\n'),
                        confirmButtonText: 'حسناً',
                        confirmButtonColor: '#222831'
                    });
                },
            });
        } else {
            post(route('admin.coaches.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

        const deleteCoach = (id) => {

            if (!can('coaches.delete')) {
                return;
            }
            Swal.fire({
            title: 'تأكيد الحذف',
            text: 'هل أنت متأكد من رغبتك في حذف هذا المدرب؟ سيتم إزالة حسابه من النظام بشكل نهائي.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.coaches.destroy', id), {

                    onError: (errors) => {

                        Swal.fire({
                            icon: 'error',
                            title: 'تعذر حذف المدرب',
                            text: errors.error || 'حدث خطأ غير متوقع',
                            confirmButtonText: 'حسناً',
                            confirmButtonColor: '#d33',
                        });
                    },

                    onSuccess: () => {

                        Swal.fire({
                            icon: 'success',
                            title: 'تم الحذف',
                            text: 'تم حذف المدرب بنجاح.',
                            confirmButtonColor: '#10b981',
                        });
                    }
                });           
             }
        });
    };

    const openAnalytics = (coach) => {
        setAnalyticsCoach(coach);
        setIsAnalyticsModalOpen(true);
    };

    const closeAnalytics = () => {
        setIsAnalyticsModalOpen(false);
        setAnalyticsCoach(null);
    };

    // إحصائيات عامة
    const totalCoaches = coaches.length;
    const totalSessions = coaches.reduce((sum, c) => sum + (Number(c.coach_profile?.total_sessions) || 0), 0);
    const currentMonthRevenue = coaches.reduce((sum, c) => sum + (Number(c.coach_profile?.monthly_revenue) || 0), 0);

    // Chart Data calculations for Analytics Modal
    const chartData = useMemo(() => {
        if (!analyticsCoach || !analyticsCoach.coach_profile?.bookings) return [];
        
        const last6Months = Array.from({ length: 6 }).map((_, i) => {
            const d = dayjs().subtract(5 - i, 'month');
            return {
                monthIndex: d.month(),
                year: d.year(),
                label: d.format('MMMM YYYY'),
                revenue: 0,
                sessions: 0
            };
        });

        analyticsCoach.coach_profile.bookings.forEach(booking => {
            const d = dayjs(booking.start_time);
            const monthData = last6Months.find(m => m.monthIndex === d.month() && m.year === d.year());
            if (monthData) {
                monthData.sessions += 1;
                monthData.revenue += Number(booking.total_price || 0);
            }
        });

        return last6Months;
    }, [analyticsCoach]);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <>
        <AdminLayout header=" المدربين">
            <Head title=" المدربين" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl">
                    
                    {/* رأس الصفحة */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-primary">المدربين المسجلين</h3>
                            <p className="text-gray-500 text-sm">إدارة حسابات المدربين وتحليل أدائهم في النادي</p>
                        </div>
                        {can('coaches.create') && (
                        <button 
                            onClick={() => openModal()}
                            className="bg-[#d6e02e] text-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#b8c21a] transition-colors"
                        >
                            <Icon icon="mdi:account-plus" className="w-5 h-5" />
                            <span>تعيين مدرب جديد</span>
                        </button>
                        )}
                    </div>

                    {/* الإحصائيات العامة */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Icon icon="mdi:account-tie" className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-500 mb-1">إجمالي المدربين</div>
                                <div className="text-xl font-black text-gray-900">{totalCoaches}</div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                <Icon icon="mdi:calendar-check-outline" className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-500 mb-1">إجمالي الحصص التدريبية</div>
                                <div className="text-xl font-black text-gray-900">{new Intl.NumberFormat('en-US').format(totalSessions)}</div>
                            </div>
                        </div>
                        {can('finance.view') && (
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <Icon icon="mdi:cash-multiple" className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-500 mb-1">عائدات التدريب للشهر الحالي</div>
                                <div className="text-xl font-black text-emerald-600">{new Intl.NumberFormat('en-US').format(currentMonthRevenue)} <span className="text-[10px] text-gray-400">ل.س</span></div>
                            </div>
                        </div>
                        )}
                    </div>

                    {/* قائمة المدربين (جدول) */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="py-4 px-6 text-sm font-bold text-gray-500 w-1/3">المدرب</th>
                                        <th className="py-4 px-6 text-sm font-bold text-gray-500">التواصل</th>
                                        <th className="py-4 px-6 text-sm font-bold text-gray-500">التخصص / التسعيرة</th>
                                        <th className="py-4 px-6 text-sm font-bold text-gray-500">الإحصائيات</th>
                                        <th className="py-4 px-6 text-sm font-bold text-gray-500">أوقات العمل</th>
                                        <th className="py-4 px-6 text-sm font-bold text-gray-500 text-center w-32">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {coaches.map((coach) => (
                                            <motion.tr 
                                                key={coach.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                                            >
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-50 shrink-0 relative group/image">
                                                            {coach.image_path ? (
                                                                <img
                                                                    src={resolveAsset(`/storage/${coach.image_path}`)}
                                                                    alt={coach.name}
                                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <Icon icon="mdi:account-tie" className="w-6 h-6" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">{coach.name}</div>
                                                            <div className="text-xs text-gray-500 font-bold" dir="ltr">#{coach.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-bold text-gray-600 text-right" dir="ltr">{coach.phone || '—'}</span>
                                                        <span className="text-xs text-gray-400 font-medium text-right" dir="ltr">{coach.email || '—'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
                                                            {coach.coach_profile?.specialty || 'مدرب عام'}
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-500 flex items-center gap-1" dir="ltr">
                                                            {new Intl.NumberFormat('en-US').format(coach.coach_profile?.hourly_rate || 0)} ل.س/س
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-black text-gray-800 text-right" dir="ltr">
                                                            {coach.coach_profile?.total_sessions || 0} جلسة
                                                        </span>
                                                        {can('finance.view') && (
                                                        <span className="text-xs font-bold text-emerald-600 text-right" dir="ltr">
                                                            {new Intl.NumberFormat('en-US').format(coach.coach_profile?.total_revenue || 0)} ل.س
                                                        </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-sm font-bold text-gray-600">
                                                        {coach.coach_profile?.availabilities?.length > 0 
                                                            ? `${coach.coach_profile.availabilities.length} فترات عمل` 
                                                            : 'دوام كامل'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {can('finance.view') && (
                                                            <button 
                                                                onClick={() => openAnalytics(coach)}
                                                                className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                                                                title="إحصائيات المدرب"
                                                            >
                                                                <Icon icon="mdi:chart-box-outline" className="w-4 h-4" />
                                                            </button>
                                                        )}

                                                        {can('coaches.edit') && (
                                                            <button 
                                                                onClick={() => openModal(coach)}
                                                                className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                                                                title="تعديل"
                                                            >
                                                                <Icon icon="mdi:pencil" className="w-4 h-4" />
                                                            </button>
                                                        )}

                                                        {can('coaches.delete') && (
                                                            <button 
                                                                onClick={() => deleteCoach(coach.id)}
                                                                className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                                                                title="حذف"
                                                            >
                                                                <Icon icon="mdi:trash-can-outline" className="w-4 h-4" />
                                                            </button>
                                                        )}

                                                        {!can('coaches.edit') && !can('coaches.delete') && !can('finance.view') && (
                                                            <span className="text-xs text-gray-300">عرض فقط</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>

                                    {coaches.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center border-b border-gray-50 border-dashed">
                                                <Icon icon="mdi:whistle" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <h4 className="text-base font-bold text-gray-500">لا يوجد مدربين مضافين حالياً</h4>
                                                
                                                {can('coaches.create') && (
                                                    <button 
                                                        onClick={() => openModal()}
                                                        className="mt-2 text-sm text-primary font-bold hover:underline"
                                                    >
                                                        تعيين أول مدرب
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* نافذة الإضافة/التعديل (Modal) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl relative z-10 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-20">
                            <h3 className="text-xl font-bold text-primary">
                                {editingCoach ? 'تعديل بيانات المدرب' : 'ترقية لاعب لمدرب'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500 transition-colors">
                                <Icon icon="mdi:close" className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={submit} className="p-6 space-y-5">
                            
                            {!editingCoach ? (
                                /* شاشة اختيار اللاعب للترقية */
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
                                        <Icon icon="mdi:information" className="w-6 h-6 text-blue-500 shrink-0" />
                                        <p className="text-sm text-blue-800">
                                            المدرب هو في الأساس لاعب في النظام. يرجى اختيار اللاعب الذي تريد ترقيته ليكون مدرباً.
                                            اللاعبون المتاحون في القائمة هم اللاعبون الذين لم يتم ترقيتهم كمدربين بعد.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-700">اختر اللاعب <span className="text-red-500">*</span></label>
                                        <select 
                                            value={data.user_id}
                                            onChange={e => setData('user_id', e.target.value)}
                                            className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                                        >
                                            <option value="">-- اختر لاعب --</option>
                                            {eligiblePlayers && eligiblePlayers.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} - {p.phone || p.email}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.user_id && <p className="text-red-500 text-xs mt-1">{errors.user_id}</p>}
                                    </div>
                                </div>
                            ) : (
                                /* شاشة تعديل بيانات المدرب (الأساسية) */
                                <>
                                    {/* الصورة الشخصية */}
                                    <div className="flex flex-col items-center justify-center mb-6">
                                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden mb-2 relative group cursor-pointer hover:border-primary transition-colors">
                                            {data.image ? (
                                                <img src={URL.createObjectURL(data.image)} className="w-full h-full object-cover" />
                                            ) : (editingCoach && editingCoach.image_path) ? (
                                                <img src={resolveAsset(`/storage/${editingCoach.image_path}`)} className="w-full h-full object-cover" />
                                            ) : (
                                                <Icon icon="mdi:camera-plus" className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                                            )}
                                            <input 
                                                type="file" 
                                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                                accept="image/*"
                                                onChange={e => setData('image', e.target.files[0])}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500">تحديث الصورة الشخصية</span>
                                        {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* الاسم */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700">الاسم الكامل</label>
                                            <input 
                                                type="text" 
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                                                placeholder="مثال: أحمد محمد"
                                            />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>

                                        {/* رقم الجوال */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700">رقم الجوال</label>
                                            <input 
                                                type="text" 
                                                value={data.phone}
                                                onChange={e => setData('phone', e.target.value)}
                                                className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary text-left"
                                                placeholder="09XXXXXXXX"
                                                dir="ltr"
                                            />
                                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                        </div>

                                        {/* البريد الإلكتروني */}
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700">البريد الإلكتروني</label>
                                            <input 
                                                type="email" 
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary text-left"
                                                placeholder="coach@acepadel.com"
                                                dir="ltr"
                                            />
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                        </div>

                                        {/* كلمة المرور */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700">
                                                كلمة المرور {editingCoach && <span className="text-gray-400 font-normal text-xs">(اتركها فارغة إذا لم ترد تغييرها)</span>}
                                            </label>
                                            <input 
                                                type="password" 
                                                value={data.password}
                                                onChange={e => setData('password', e.target.value)}
                                                className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary text-left"
                                                dir="ltr"
                                            />
                                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                        </div>

                                        {/* تأكيد كلمة المرور */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700">تأكيد كلمة المرور</label>
                                            <input 
                                                type="password" 
                                                value={data.password_confirmation}
                                                onChange={e => setData('password_confirmation', e.target.value)}
                                                className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary text-left"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <hr className="border-gray-100 my-4" />
                            <h4 className="font-bold text-primary mb-2">معلومات التدريب</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* التخصص */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">التخصص / المسمى</label>
                                    <input 
                                        type="text" 
                                        value={data.specialty}
                                        onChange={e => setData('specialty', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                                        placeholder="مثال: مدرب لياقة بدنية"
                                    />
                                    {errors.specialty && <p className="text-red-500 text-xs mt-1">{errors.specialty}</p>}
                                </div>

                                {/* التسعيرة */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">التسعيرة الإضافية (ل.س / للساعة)</label>
                                    <input 
                                        type="text" 
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={data.hourly_rate}
                                        onFocus={e => e.target.select()}
                                        onChange={e => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length > 1 && val.startsWith('0')) {
                                                val = val.replace(/^0+/, '');
                                            }
                                            setData('hourly_rate', val);
                                        }}
                                        className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary text-left"
                                        dir="ltr"
                                    />
                                    {errors.hourly_rate && <p className="text-red-500 text-xs mt-1">{errors.hourly_rate}</p>}
                                </div>

                                {/* الملاعب المخصصة */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700">الملاعب التي يشرف عليها</label>
                                    <div className="flex flex-wrap gap-2">
                                        {courts.map(court => (
                                            <label key={court.id} className="inline-flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                                    checked={data.courts.includes(court.id)}
                                                    onChange={e => {
                                                        const newCourts = e.target.checked 
                                                            ? [...data.courts, court.id]
                                                            : data.courts.filter(id => id !== court.id);
                                                        setData('courts', newCourts);
                                                    }}
                                                />
                                                <span className="text-sm font-medium">{court.name}</span>
                                            </label>
                                        ))}
                                        {courts.length === 0 && <span className="text-sm text-red-500">لا يوجد ملاعب مفعلة حالياً.</span>}
                                    </div>
                                    {errors.courts && <p className="text-red-500 text-xs mt-1">{errors.courts}</p>}
                                </div>

                                {/* أوقات العمل */}
                                <div className="space-y-4 md:col-span-2">
                                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <label className="block text-sm font-bold text-gray-700">أوقات توفر المدرب</label>
                                        <button 
                                            type="button" 
                                            onClick={() => setData('availabilities', [...data.availabilities, {day_of_week: 0, start_time: '09:00', end_time: '17:00'}])} 
                                            className="text-xs bg-white border border-gray-200 text-primary px-3 py-1.5 rounded-lg shadow-sm font-bold hover:bg-gray-50 flex items-center gap-1"
                                        >
                                            <Icon icon="mdi:plus" className="w-4 h-4" />
                                            <span>إضافة فترة دوام</span>
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {data.availabilities.map((avail, idx) => (
                                            <div key={idx} className="flex flex-wrap md:flex-nowrap gap-3 items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm relative group">
                                                <div className="w-full md:w-1/3">
                                                    <select 
                                                        value={avail.day_of_week}
                                                        onChange={e => {
                                                            const newAvail = [...data.availabilities];
                                                            newAvail[idx].day_of_week = parseInt(e.target.value);
                                                            setData('availabilities', newAvail);
                                                        }}
                                                        className="w-full rounded-lg border-gray-200 text-sm focus:border-primary focus:ring-primary"
                                                    >
                                                        {DAYS_OF_WEEK.map(day => (
                                                            <option key={day.id} value={day.id}>{day.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="w-full md:w-1/3 flex items-center gap-2">
                                                    <span className="text-xs text-gray-500 w-8">من:</span>
                                                    <input 
                                                        type="time" 
                                                        value={avail.start_time}
                                                        onChange={e => {
                                                            const newAvail = [...data.availabilities];
                                                            newAvail[idx].start_time = e.target.value;
                                                            setData('availabilities', newAvail);
                                                        }}
                                                        className="flex-1 rounded-lg border-gray-200 text-sm focus:border-primary focus:ring-primary"
                                                    />
                                                </div>
                                                <div className="w-full md:w-1/3 flex items-center gap-2">
                                                    <span className="text-xs text-gray-500 w-8">إلى:</span>
                                                    <input 
                                                        type="time" 
                                                        value={avail.end_time}
                                                        onChange={e => {
                                                            const newAvail = [...data.availabilities];
                                                            newAvail[idx].end_time = e.target.value;
                                                            setData('availabilities', newAvail);
                                                        }}
                                                        className="flex-1 rounded-lg border-gray-200 text-sm focus:border-primary focus:ring-primary"
                                                    />
                                                </div>
                                                <button type="button" onClick={() => {
                                                    const newAvail = data.availabilities.filter((_, i) => i !== idx);
                                                    setData('availabilities', newAvail);
                                                }} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                                    <Icon icon="mdi:close" className="w-4 h-4" />
                                                </button>
                                                
                                                {/* Error message for this specific availability if any */}
                                                {errors[`availabilities.${idx}.end_time`] && (
                                                    <p className="w-full text-red-500 text-xs mt-1 block">يجب أن يكون وقت الانتهاء بعد البدء.</p>
                                                )}
                                            </div>
                                        ))}
                                        {data.availabilities.length === 0 && (
                                            <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <Icon icon="mdi:calendar-clock" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-600 font-medium">لم يتم تحديد أوقات عمل محددة</p>
                                                <p className="text-xs text-gray-500">سيكون المدرب متاحاً في كافة أوقات عمل النادي (أو حسب أوقات الملاعب).</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* نبذة */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700">نبذة تعريفية</label>
                                    <textarea 
                                        value={data.bio}
                                        onChange={e => setData('bio', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                                        rows="3"
                                        placeholder="اكتب نبذة مختصرة عن خبرات المدرب..."
                                    ></textarea>
                                    {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
                                </div>
                            </div>

                            {/* أزرار الحفظ */}
                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                    disabled={processing}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
                                    disabled={processing}
                                >
                                    {processing && <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />}
                                    {editingCoach ? 'حفظ التعديلات' : 'تعيين كمدرب'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </AdminLayout>

        {/* نافذة الإحصائيات (Analytics Modal) */}
        <AnimatePresence>
            {isAnalyticsModalOpen && analyticsCoach && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" 
                        onClick={closeAnalytics}
                    ></motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-emerald-900 to-primary p-6 shrink-0 flex items-center gap-5">
                            <button onClick={closeAnalytics} className="absolute top-6 left-6 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full p-2 backdrop-blur-sm">
                                <Icon icon="mdi:close" className="w-5 h-5" />
                            </button>
                            
                            <div className="w-16 h-16 rounded-full border-2 border-white/20 bg-white overflow-hidden shadow-lg shrink-0">
                                {analyticsCoach.image_path ? (
                                    <img src={resolveAsset(`/storage/${analyticsCoach.image_path}`)} alt={analyticsCoach.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Icon icon="mdi:account-tie" className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="text-white flex-1">
                                <h3 className="text-2xl font-black">{analyticsCoach.name}</h3>
                                <p className="text-white/80 text-sm flex items-center gap-1 mt-1 font-medium">
                                    <Icon icon="mdi:star-circle" className="w-4 h-4 text-[#d6e02e]" />
                                    {analyticsCoach.coach_profile?.specialty || 'مدرب'}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-colors">
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 mb-1">إجمالي الحصص المنجزة</div>
                                        <div className="text-2xl font-black text-primary">{analyticsCoach.coach_profile?.total_sessions || 0}</div>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                        <Icon icon="mdi:clock-check-outline" className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-colors">
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 mb-1">إجمالي العوائد المرتبطة (ل.س)</div>
                                        <div className="text-2xl font-black text-emerald-600">{Number(analyticsCoach.coach_profile?.total_revenue || 0).toLocaleString('en-US')}</div>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                        <Icon icon="mdi:cash-check" className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <h4 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <Icon icon="mdi:chart-timeline-variant" className="w-5 h-5 text-primary" />
                                        أداء المدرب (آخر 6 أشهر)
                                    </h4>
                                    <div className="h-72" dir="ltr">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#d6e02e" stopOpacity={0.4}/>
                                                        <stop offset="95%" stopColor="#d6e02e" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                                    labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                                                />
                                                <Area 
                                                    name="عدد الحصص"
                                                    type="monotone" 
                                                    dataKey="sessions" 
                                                    stroke="#8bc34a" 
                                                    strokeWidth={3}
                                                    fillOpacity={1} 
                                                    fill="url(#colorSessions)" 
                                                    activeDot={{ r: 6, fill: '#111827', stroke: '#d6e02e', strokeWidth: 2 }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </>
    );
}
