import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Icon } from "@iconify/react";
import { useState } from 'react';
import Swal from 'sweetalert2';

const Field = ({ label, children }) => (
    <div className="space-y-1">
        <label className="block text-xs font-bold text-gray-600">{label}</label>
        {children}
    </div>
);

export default function Packages({ packages }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        total_classes: 6,
        price: 120000,
        valid_days: 30,
    });

    const openAdd = () => {
        clearErrors();
        reset();
        setEditingPackage(null);
        setIsModalOpen(true);
    };

    const openEdit = (pkg) => {
        clearErrors();
        setEditingPackage(pkg);
        setData({
            name: pkg.name,
            total_classes: pkg.total_classes,
            price: parseFloat(pkg.price),
            valid_days: pkg.valid_days,
        });
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingPackage) {
            router.post(route('admin.pilates.packages.update', editingPackage.id), {
                _method: 'PUT',
                ...data
            }, {
                onSuccess: () => { 
                    setIsModalOpen(false); 
                    reset(); 
                    Swal.fire({
                        icon: 'success',
                        title: 'تم بنجاح',
                        text: 'تم تحديث باقة البيلاتس بنجاح.',
                        confirmButtonText: 'حسناً',
                        confirmButtonColor: '#1d3922'
                    });
                },
                onError: (errs) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'خطأ في المدخلات',
                        text: Object.values(errs).join('\n'),
                        confirmButtonText: 'حسناً',
                        confirmButtonColor: '#d33'
                    });
                }
            });
        } else {
            post(route('admin.pilates.packages.store'), {
                onSuccess: () => { 
                    setIsModalOpen(false); 
                    reset(); 
                    Swal.fire({
                        icon: 'success',
                        title: 'تم بنجاح',
                        text: 'تم إنشاء باقة البيلاتس بنجاح.',
                        confirmButtonText: 'حسناً',
                        confirmButtonColor: '#1d3922'
                    });
                },
                onError: (errs) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'حدث خطأ ما',
                        text: Object.values(errs).join('\n'),
                        confirmButtonText: 'حسناً',
                        confirmButtonColor: '#d33'
                    });
                }
            });
        }
    };

    const handleDelete = (pkg) => {
        Swal.fire({
            title: 'هل أنت متأكد؟',
            text: `هل ترغب فعلاً في حذف باقة "${pkg.name}"؟ لا يمكن التراجع عن هذا الإجراء.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'نعم، احذفها',
            cancelButtonText: 'إلغاء'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.pilates.packages.destroy', pkg.id), {
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'تم الحذف',
                            text: 'تم حذف الباقة بنجاح.',
                            confirmButtonText: 'حسناً',
                            confirmButtonColor: '#1d3922'
                        });
                    },
                    onError: (errs) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'عذراً لا يمكن الحذف',
                            text: errs.error || 'حدث خطأ أثناء محاولة الحذف.',
                            confirmButtonText: 'حسناً',
                            confirmButtonColor: '#d33'
                        });
                    }
                });
            }
        });
    };

    return (
        <AdminLayout header="إدارة باقات البيلاتس">
            <Head title="إدارة باقات البيلاتس" />

            <div className="space-y-6 font-arabic" dir="rtl">
                {/* Header & Add Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">باقات كلاسات البيلاتس المتاحة</h2>
                        <p className="text-xs text-slate-500 mt-1">قم بإنشاء وتعديل باقات الاشتراك الشهري لجلسات البيلاتس لتمكين اللاعبين من الحجز بها.</p>
                    </div>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#1d3922] hover:bg-[#112214] text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                    >
                        <Icon icon="mdi:ticket-percent" className="w-5 h-5" />
                        <span>إنشاء باقة جديدة</span>
                    </button>
                </div>

                {/* Packages Table Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">اسم الباقة</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">عدد الحصص (الكلاسات)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">سعر الباقة</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">صلاحية الباقة (بالأيام)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-left">العمليات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {packages.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm">
                                            <Icon icon="mdi:ticket-percent-outline" className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                                            <span>لا توجد باقات بيلاتس مضافة حالياً.</span>
                                        </td>
                                    </tr>
                                ) : (
                                    packages.data.map((pkg) => (
                                        <tr key={pkg.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-800">{pkg.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg">
                                                    <Icon icon="mdi:yoga" className="w-4 h-4" />
                                                    {pkg.total_classes} حصص
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-700">{parseFloat(pkg.price).toLocaleString()} ل.س</td>
                                            <td className="px-6 py-4 text-slate-500">{pkg.valid_days} يوم (شهر تقريباً)</td>
                                            <td className="px-6 py-4 text-left">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(pkg)}
                                                        className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                                                        title="تعديل الباقة"
                                                    >
                                                        <Icon icon="mdi:pencil-outline" className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(pkg)}
                                                        className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                                        title="حذف الباقة"
                                                    >
                                                        <Icon icon="mdi:trash-can-outline" className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {packages.links && packages.links.length > 3 && (
                        <div className="p-4 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                                عرض {packages.from} إلى {packages.to} من أصل {packages.total} باقات
                            </span>
                            <div className="flex gap-1">
                                {packages.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (link.url) router.get(link.url);
                                        }}
                                        disabled={!link.url}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            link.active 
                                                ? 'bg-[#1d3922] text-white' 
                                                : 'text-slate-600 hover:bg-slate-50 disabled:opacity-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-arabic" dir="rtl">
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 text-lg">
                                {editingPackage ? 'تعديل باقة البيلاتس' : 'إنشاء باقة بيلاتس جديدة'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <Icon icon="mdi:close" className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={submit} className="p-6 space-y-4">
                            <Field label="اسم الباقة (مثل: باقة الفضة - 6 حصص)">
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="أدخل اسم الباقة..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1d3922] text-sm text-slate-700"
                                    required
                                />
                                {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="عدد الحصص (الزيارات)">
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.total_classes}
                                        onChange={e => setData('total_classes', parseInt(e.target.value))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1d3922] text-sm text-slate-700"
                                        required
                                    />
                                    {errors.total_classes && <p className="text-xs text-red-500 font-medium">{errors.total_classes}</p>}
                                </Field>

                                <Field label="صلاحية الباقة (بالأيام)">
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.valid_days}
                                        onChange={e => setData('valid_days', parseInt(e.target.value))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1d3922] text-sm text-slate-700"
                                        required
                                    />
                                    {errors.valid_days && <p className="text-xs text-red-500 font-medium">{errors.valid_days}</p>}
                                </Field>
                            </div>

                            <Field label="سعر الباقة (ل.س)">
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={data.price}
                                        onChange={e => setData('price', parseFloat(e.target.value))}
                                        className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1d3922] text-sm text-slate-700 font-bold"
                                        required
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">ل.س</span>
                                </div>
                                {errors.price && <p className="text-xs text-red-500 font-medium">{errors.price}</p>}
                            </Field>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-[#1d3922] hover:bg-[#112214] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60"
                                >
                                    {processing ? 'جاري الحفظ...' : (editingPackage ? 'تحديث الباقة' : 'حفظ الباقة')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
