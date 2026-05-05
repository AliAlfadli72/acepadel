import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Icon } from "@iconify/react";
import { useState } from 'react';
import Swal from 'sweetalert2';

export default function CourtsIndex({ courts }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourt, setEditingCourt] = useState(null);
    const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
    const [analyticsCourt, setAnalyticsCourt] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: 'indoor',
        price: '',
        description: '',
        is_active: true,
        image: null,
    });

    const openModal = (court = null) => {
        clearErrors();
        if (court) {
            setEditingCourt(court);
            setData({
                _method: 'put',
                name: court.name,
                type: court.type,
                price: court.price,
                description: court.description || '',
                is_active: court.is_active,
                image: null,
            });
        } else {
            setEditingCourt(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setEditingCourt(null);
    };

    const openAnalytics = (court) => {
        setAnalyticsCourt(court);
        setIsAnalyticsModalOpen(true);
    };

    const closeAnalytics = () => {
        setIsAnalyticsModalOpen(false);
        setAnalyticsCourt(null);
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (editingCourt) {
            // POST + _method:put in data = the reliable Inertia file-upload pattern
            post(route('admin.courts.update', editingCourt.id), {
                forceFormData: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.courts.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const deleteCourt = (id) => {
        Swal.fire({
            title: 'تأكيد الحذف',
            text: 'هل أنت متأكد من رغبتك في حذف هذا الملعب؟',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.courts.destroy', id));
            }
        });
    };

    // إحصائيات عامة
    const totalCourts = courts.length;
    const activeCourts = courts.filter(c => c.is_active).length;
    const currentMonthRevenue = courts.reduce((sum, c) => sum + (Number(c.monthly_revenue) || 0), 0);
    const totalMatches = courts.reduce((sum, c) => sum + (Number(c.total_matches) || 0), 0);

    return (
        <AdminLayout header="إدارة الملاعب">
            <Head title="إدارة الملاعب" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl">
                    
                    {/* رأس الصفحة */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-primary">الملاعب الحالية</h3>
                            <p className="text-gray-500 text-sm">إدارة كافة ملاعب الأكاديمية وإعداداتها</p>
                        </div>
                        <button 
                            onClick={() => openModal()}
                            className="bg-[#cbfb45] text-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#b5e03e] transition-colors"
                        >
                            <Icon icon="mdi:plus" className="w-5 h-5" />
                            <span>إضافة ملعب جديد</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label:'إجمالي الملاعب', value: totalCourts, icon:'mdi:tennis', color:'text-primary bg-primary/10' },
                            { label:'الملاعب المتاحة', value: activeCourts, icon:'mdi:check-decagram-outline', color:'text-emerald-600 bg-emerald-50' },
                            { label:'عائدات الشهر (ل.س)', value: new Intl.NumberFormat('en-US').format(currentMonthRevenue), icon:'mdi:cash-multiple', color:'text-purple-600 bg-purple-50' },
                            { label:'إجمالي الحجوزات', value: new Intl.NumberFormat('en-US').format(totalMatches), icon:'mdi:calendar-check', color:'text-blue-600 bg-blue-50' },
                        ].map(c => (
                            <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.color}`}>
                                    <Icon icon={c.icon} className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-gray-900" dir="ltr">{c.value}</p>
                                    <p className="text-xs text-gray-400">{c.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-5 py-3.5">الملعب</th>
                                        <th className="px-5 py-3.5 text-center">النوع</th>
                                        <th className="px-5 py-3.5 text-center">السعر / ساعة</th>
                                        <th className="px-5 py-3.5 text-center">المباريات</th>
                                        <th className="px-5 py-3.5 text-center">الحالة</th>
                                        <th className="px-5 py-3.5 text-center">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {courts.length > 0 ? courts.map((court) => (
                                        <tr key={court.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                        {court.image_path ? (
                                                            <img src={`/storage/${court.image_path}`} alt={court.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Icon icon="mdi:tennis-court" className="w-5 h-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-primary">{court.name}</div>
                                                        <div className="text-xs text-gray-400 max-w-[200px] truncate">{court.description || 'لا يوجد وصف'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${court.type === 'indoor' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                                                    <Icon icon={court.type === 'indoor' ? "mdi:home-roof" : "mdi:weather-sunny"} className="w-3.5 h-3.5" />
                                                    {court.type === 'indoor' ? 'داخلي' : 'خارجي'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="font-bold text-gray-800" dir="ltr">
                                                    {new Intl.NumberFormat('en-US').format(court.price)} <span className="text-[10px] text-gray-400 font-normal">ل.س</span>
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <div className="text-xs font-bold text-gray-600 flex items-center gap-1" dir="ltr" title="مباريات الشهر / إجمالي المباريات">
                                                        <span>{new Intl.NumberFormat('en-US').format(court.monthly_matches || 0)}</span>
                                                        <span className="text-gray-300">/</span>
                                                        <span>{new Intl.NumberFormat('en-US').format(court.total_matches || 0)}</span>
                                                        <Icon icon="mdi:tennis" className="w-3 h-3 text-emerald-500" />
                                                    </div>
                                                    <button onClick={() => openAnalytics(court)} className="text-[10px] text-blue-600 hover:text-blue-700 hover:underline font-bold">
                                                        عرض الإحصائيات
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${court.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${court.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                                    {court.is_active ? 'متاح' : 'مغلق'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button onClick={() => openModal(court)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="تعديل">
                                                        <Icon icon="mdi:pencil" className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => deleteCourt(court.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors" title="حذف">
                                                        <Icon icon="mdi:delete-outline" className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="py-16 text-center">
                                                <Icon icon="mdi:tennis-court" className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                                                <p className="text-gray-400 font-bold">لا يوجد ملاعب مضافة حالياً</p>
                                                <button onClick={() => openModal()} className="mt-2 text-primary text-sm font-bold hover:underline">
                                                    إضافة الملعب الأول
                                                </button>
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
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-20">
                            <h3 className="text-xl font-bold text-primary">
                                {editingCourt ? 'تعديل بيانات الملعب' : 'إضافة ملعب جديد'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500 transition-colors">
                                <Icon icon="mdi:close" className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={submit} className="p-6 space-y-5">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* اسم الملعب */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">اسم الملعب</label>
                                    <input 
                                        type="text" 
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                                        placeholder="مثال: الملعب الرئيسي"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                {/* نوع الملعب */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">نوع الملعب</label>
                                    <select 
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                                    >
                                        <option value="indoor">داخلي (Indoor)</option>
                                        <option value="outdoor">خارجي (Outdoor)</option>
                                    </select>
                                    {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                                </div>

                                {/* السعر */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">السعر للساعة (ل.س)</label>
                                    <input 
                                        type="text" 
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={data.price}
                                        onFocus={e => e.target.select()}
                                        onChange={e => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length > 1 && val.startsWith('0')) {
                                                val = val.replace(/^0+/, '');
                                            }
                                            setData('price', val);
                                        }}
                                        className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                                        placeholder="مثال: 50000"
                                    />
                                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                                </div>

                                {/* الحالة */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">الحالة</label>
                                    <select 
                                        value={data.is_active ? '1' : '0'}
                                        onChange={e => setData('is_active', e.target.value === '1')}
                                        className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                                    >
                                        <option value="1">نشط (متاح للحجز)</option>
                                        <option value="0">غير نشط (صيانة)</option>
                                    </select>
                                    {errors.is_active && <p className="text-red-500 text-xs mt-1">{errors.is_active}</p>}
                                </div>
                            </div>

                            {/* الوصف */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">وصف الملعب</label>
                                <textarea 
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    rows="3"
                                    className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary resize-none"
                                    placeholder="اكتب وصفاً مختصراً للملعب وميزاته..."
                                ></textarea>
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>

                            {/* الصورة */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">صورة الملعب</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-primary transition-colors">
                                    <div className="space-y-1 text-center">
                                        <Icon icon="mdi:cloud-upload-outline" className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-emerald-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                                <span>رفع صورة</span>
                                                <input 
                                                    type="file" 
                                                    className="sr-only" 
                                                    accept="image/*"
                                                    onChange={e => setData('image', e.target.files[0])}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, WEBP حتى 2MB</p>
                                        {data.image && (
                                            <p className="text-sm font-bold text-emerald-600 mt-2">
                                                تم اختيار الملف: {data.image.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
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
                                    {editingCourt ? 'حفظ التعديلات' : 'إضافة الملعب'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* نافذة الإحصائيات (Analytics Modal) */}
            {isAnalyticsModalOpen && analyticsCourt && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={closeAnalytics}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden">
                        {/* Header with gradient */}
                        <div className="relative h-32 bg-gradient-to-r from-primary to-gray-900 p-6 flex items-end">
                            <button onClick={closeAnalytics} className="absolute top-4 left-4 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full p-2 backdrop-blur-sm">
                                <Icon icon="mdi:close" className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-4 text-white">
                                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                                    <Icon icon="mdi:tennis-court" className="w-8 h-8 text-[#cbfb45]" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">{analyticsCourt.name}</h3>
                                    <p className="text-white/70 text-sm flex items-center gap-1">
                                        <Icon icon="mdi:map-marker-outline" className="w-4 h-4" />
                                        {analyticsCourt.type === 'indoor' ? 'ملعب داخلي' : 'ملعب خارجي'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <h4 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                                <Icon icon="mdi:google-analytics" className="w-6 h-6 text-emerald-500" />
                                الأداء والتحليلات
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Monthly Stats */}
                                <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 relative overflow-hidden group hover:border-emerald-200 transition-colors">
                                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
                                    <h5 className="text-sm font-bold text-emerald-800 mb-4 flex items-center gap-2">
                                        <Icon icon="mdi:calendar-month" className="w-5 h-5" />
                                        إحصائيات هذا الشهر
                                    </h5>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-gray-500 text-sm">عدد المباريات</span>
                                            <span className="text-2xl font-black text-primary">{analyticsCourt.monthly_matches}</span>
                                        </div>
                                        <div className="w-full h-px bg-emerald-200/50"></div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-gray-500 text-sm">العوائد المالية</span>
                                            <div className="text-left">
                                                <span className="text-2xl font-black text-emerald-600">{Number(analyticsCourt.monthly_revenue).toLocaleString('en-US')}</span>
                                                <span className="text-sm text-emerald-600/70 mr-1">ل.س</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* All-Time Stats */}
                                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 relative overflow-hidden group hover:border-blue-200 transition-colors">
                                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
                                    <h5 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
                                        <Icon icon="mdi:infinity" className="w-5 h-5" />
                                        الإحصائيات الإجمالية
                                    </h5>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-gray-500 text-sm">إجمالي المباريات</span>
                                            <span className="text-2xl font-black text-primary">{analyticsCourt.total_matches}</span>
                                        </div>
                                        <div className="w-full h-px bg-blue-200/50"></div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-gray-500 text-sm">إجمالي العوائد</span>
                                            <div className="text-left">
                                                <span className="text-2xl font-black text-blue-600">{Number(analyticsCourt.total_revenue).toLocaleString('en-US')}</span>
                                                <span className="text-sm text-blue-600/70 mr-1">ل.س</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                                    <Icon icon="mdi:cash-multiple" className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <h5 className="font-bold text-primary">سعر الحجز (للساعة)</h5>
                                    <p className="text-gray-500 text-sm">السعر الحالي المعتمد لحجز هذا الملعب هو {Number(analyticsCourt.price).toLocaleString('en-US')} ل.س.</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}
