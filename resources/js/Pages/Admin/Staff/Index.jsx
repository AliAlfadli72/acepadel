import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Icon } from "@iconify/react";
import { useState } from 'react';
import Swal from 'sweetalert2';

export default function StaffIndex({ staff, eligiblePlayers, filters }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.staff.index'), { search: searchQuery }, { preserveState: true, replace: true });
    };

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        user_id: '',
        name: '',
        email: '',
        phone: '',
        password: '',
        image: null,
        role: 'Receptionist',
        position: '',
        shift_name: '',
        working_days: [],
    });

    const openAddModal = () => {
        clearErrors();
        reset();
        setEditingStaff(null);
        setIsAddModalOpen(true);
    };

    const openEditModal = (staffMember) => {
        clearErrors();
        setEditingStaff(staffMember);
        const profile = staffMember.staff_profile || {};
        const role = staffMember.roles?.[0]?.name || 'Receptionist';
        
        let workingDays = [];
        if (Array.isArray(profile.working_days)) {
            workingDays = profile.working_days.map(wd => {
                if (typeof wd === 'string') {
                    return { day: wd, start: '', end: '' };
                }
                return wd;
            });
        }

        setData({
            user_id: staffMember.id,
            name: staffMember.name || '',
            email: staffMember.email || '',
            phone: staffMember.phone || '',
            password: '',
            image: null,
            role: role,
            position: profile.position || '',
            shift_name: profile.shift_name || '',
            working_days: workingDays,
        });
        setIsEditModalOpen(true);
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        reset();
        setEditingStaff(null);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        post(route('admin.staff.store'), {
            onSuccess: () => closeModal(),
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        router.post(route('admin.staff.update', editingStaff.id), {
            _method: 'PUT',
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: data.password,
            image: data.image,
            role: data.role,
            position: data.position,
            shift_name: data.shift_name,
            working_days: data.working_days,
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: (errs) => console.error('Staff update errors:', errs),
        });
    };

    const deleteStaff = (id) => {
        Swal.fire({
            title: 'تأكيد إزالة الصلاحيات',
            text: 'هل أنت متأكد من رغبتك في إزالة صلاحيات الموظف؟ (سيعود كلاعب عادي ولن يُحذف حسابه)',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'نعم، إزالة الصلاحية',
            cancelButtonText: 'إلغاء'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.staff.destroy', id));
            }
        });
    };

    const handleWorkingDaysToggle = (dayValue) => {
        const isSelected = data.working_days.some(d => d.day === dayValue);
        if (isSelected) {
            setData('working_days', data.working_days.filter(d => d.day !== dayValue));
        } else {
            setData('working_days', [...data.working_days, { day: dayValue, start: '', end: '' }]);
        }
    };

    const handleDayTimeChange = (dayValue, field, value) => {
        setData('working_days', data.working_days.map(d => 
            d.day === dayValue ? { ...d, [field]: value } : d
        ));
    };

    const daysOfWeek = [
        { label: 'الأحد', value: 'Sunday' },
        { label: 'الإثنين', value: 'Monday' },
        { label: 'الثلاثاء', value: 'Tuesday' },
        { label: 'الأربعاء', value: 'Wednesday' },
        { label: 'الخميس', value: 'Thursday' },
        { label: 'الجمعة', value: 'Friday' },
        { label: 'السبت', value: 'Saturday' },
    ];

    const getDayLabel = (dayValue) => {
        return daysOfWeek.find(d => d.value === dayValue)?.label || dayValue;
    };

    const renderShiftScheduleSection = () => (
        <div className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h4 className="font-bold text-sm text-blue-800 flex items-center gap-2 mb-2">
                <Icon icon="mdi:clock-outline" className="w-5 h-5 text-blue-600" />
                أوقات العمل لكل يوم
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700">المسمى الوظيفي</label>
                    <input 
                        type="text" 
                        value={data.position}
                        onChange={e => setData('position', e.target.value)}
                        className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm"
                    />
                </div>
                <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700">اسم الشفت (مثال: صباحي)</label>
                    <input 
                        type="text" 
                        value={data.shift_name}
                        onChange={e => setData('shift_name', e.target.value)}
                        className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm"
                    />
                </div>
            </div>

            <div className="space-y-2 mt-4">
                <label className="block text-xs font-bold text-gray-700 mb-2">أيام العمل المتاحة</label>
                <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => {
                        const isSelected = data.working_days.some(d => d.day === day.value);
                        return (
                            <button
                                key={day.value}
                                type="button"
                                onClick={() => handleWorkingDaysToggle(day.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                    isSelected
                                        ? 'bg-[#cbfb45] text-primary shadow-sm border border-[#cbfb45]'
                                        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {day.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {data.working_days.length > 0 && (
                <div className="mt-4 space-y-3">
                    <label className="block text-xs font-bold text-gray-700 mb-2">تحديد الساعات للأيام المختارة</label>
                    {data.working_days.map((wd) => (
                        <div key={wd.day} className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                            <span className="w-24 font-bold text-sm text-primary">{getDayLabel(wd.day)}</span>
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-xs text-gray-400">من</span>
                                <input 
                                    type="time" 
                                    step="60"
                                    value={wd.start}
                                    onChange={e => handleDayTimeChange(wd.day, 'start', e.target.value)}
                                    className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm p-1.5"
                                />
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-xs text-gray-400">إلى</span>
                                <input 
                                    type="time" 
                                    step="60"
                                    value={wd.end}
                                    onChange={e => handleDayTimeChange(wd.day, 'end', e.target.value)}
                                    className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm p-1.5"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <AdminLayout header="إدارة الموظفين">
            <Head title="إدارة الموظفين" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl">
                    
                    {/* رأس الصفحة */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-primary">فريق العمل (الموظفين)</h3>
                            <p className="text-gray-500 text-sm">إدارة حسابات الموظفين، الصلاحيات، والشفتات</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                                <input 
                                    type="text" 
                                    placeholder="بحث بالاسم، الجوال، البريد..." 
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-primary focus:border-primary"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
                                    <Icon icon="mdi:magnify" className="w-5 h-5" />
                                </button>
                            </form>
                            <button 
                                onClick={openAddModal}
                                className="w-full sm:w-auto bg-[#cbfb45] text-primary px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#b5e03e] transition-colors whitespace-nowrap"
                            >
                                <Icon icon="mdi:badge-account-outline" className="w-5 h-5" />
                                <span>ترقية لاعب لموظف</span>
                            </button>
                        </div>
                    </div>

                    {/* شبكة الموظفين */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {staff.data.map((staffMember) => {
                            const workingDaysArray = Array.isArray(staffMember.staff_profile?.working_days) 
                                ? staffMember.staff_profile.working_days 
                                : [];
                            
                            return (
                                <div key={staffMember.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group">
                                    {/* الغلاف والصورة الشخصية */}
                                    <div className="h-20 bg-[#111111] relative">
                                        <div className="absolute top-2 right-2">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                                                staffMember.roles?.[0]?.name === 'Staff' 
                                                ? 'bg-[#cbfb45]/20 text-[#6a871d] border-[#cbfb45]/50'
                                                : 'bg-blue-100 text-blue-700 border-blue-200'
                                            }`}>
                                                {staffMember.roles?.[0]?.name === 'Staff' ? 'موظف' : 'مستقبل'}
                                            </span>
                                        </div>
                                        <div className="absolute -bottom-8 inset-x-0 flex justify-center">
                                            <div className="w-16 h-16 rounded-full border-4 border-white bg-white overflow-hidden flex items-center justify-center shadow-sm">
                                                {staffMember.image_path ? (
                                                    <img src={`/storage/${staffMember.image_path}`} alt={staffMember.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Icon icon="mdi:account" className="w-8 h-8 text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* إجراءات تظهر عند التمرير */}
                                        <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px] flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                            <button 
                                                onClick={() => openEditModal(staffMember)}
                                                className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                                title="تعديل"
                                            >
                                                <Icon icon="mdi:pencil" className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => deleteStaff(staffMember.id)}
                                                className="w-8 h-8 rounded-full bg-white text-red-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                                title="إزالة الصلاحية"
                                            >
                                                <Icon icon="mdi:account-minus" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* بيانات الموظف */}
                                    <div className="pt-10 p-4 text-center">
                                        <h4 className="text-lg font-bold text-primary mb-1">{staffMember.name}</h4>
                                        <p className="text-xs text-gray-500 mb-3">{staffMember.staff_profile?.position || 'بدون مسمى وظيفي'}</p>
                                        
                                        <div className="flex justify-center items-center gap-1 text-sm text-gray-500 mb-4">
                                            <Icon icon="mdi:phone-outline" className="w-4 h-4" />
                                            <span dir="ltr" className="text-xs">{staffMember.phone || 'غير محدد'}</span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 text-xs border-t border-gray-100 pt-3">
                                            <div className="bg-gray-50 rounded-lg p-2 text-center flex justify-between items-center px-4">
                                                <span className="block text-gray-400">الشفت</span>
                                                <span className="font-bold text-primary text-sm flex items-center gap-1">
                                                    <Icon icon="mdi:clock-outline" />
                                                    {staffMember.staff_profile?.shift_name || 'غير محدد'}
                                                </span>
                                            </div>
                                            {workingDaysArray.length > 0 ? (
                                                <div className="bg-gray-50 rounded-lg p-2 text-right">
                                                    <span className="block text-gray-400 mb-2">جدول العمل</span>
                                                    <div className="space-y-1">
                                                        {workingDaysArray.slice(0, 3).map((wd, i) => (
                                                            <div key={i} className="flex justify-between items-center bg-white p-1 rounded border border-gray-100">
                                                                <span className="text-[10px] font-bold text-primary">{getDayLabel(wd.day || wd)}</span>
                                                                {(wd.start && wd.end) ? (
                                                                    <span className="text-[10px] text-gray-500" dir="ltr">{wd.start} - {wd.end}</span>
                                                                ) : (
                                                                    <span className="text-[10px] text-gray-400">--:--</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {workingDaysArray.length > 3 && (
                                                            <div className="text-center text-[10px] text-gray-400 mt-1">
                                                                +{workingDaysArray.length - 3} أيام أخرى
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 rounded-lg p-3 text-center text-gray-400 text-xs">
                                                    لم يتم تحديد جدول عمل
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {staff.data.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
                                <Icon icon="mdi:badge-account-outline" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h4 className="text-lg font-bold text-gray-500">لا يوجد موظفين مسجلين</h4>
                            </div>
                        )}
                    </div>

                    {/* التصفح Pagination */}
                    {staff.meta && staff.meta.last_page > 1 ? (
                        <div className="mt-8 flex justify-center">
                            <div className="flex gap-1 bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex-wrap justify-center">
                                {staff.meta.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true })}
                                        disabled={!link.url || link.active}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                                            link.active 
                                            ? 'bg-primary text-white' 
                                            : link.url 
                                                ? 'text-gray-600 hover:bg-gray-100' 
                                                : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : staff.last_page > 1 && (
                        <div className="mt-8 flex justify-center">
                            <div className="flex gap-1 bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex-wrap justify-center">
                                {staff.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true })}
                                        disabled={!link.url || link.active}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                                            link.active 
                                            ? 'bg-primary text-white' 
                                            : link.url 
                                                ? 'text-gray-600 hover:bg-gray-100' 
                                                : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* نافذة الترقية للإضافة (Modal) */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-20">
                            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                                <Icon icon="mdi:badge-account-outline" className="w-6 h-6 text-[#cbfb45]" />
                                ترقية لاعب إلى موظف
                            </h3>
                            <button type="button" onClick={closeModal} className="text-gray-400 hover:text-red-500 transition-colors">
                                <Icon icon="mdi:close" className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddSubmit} className="p-6 space-y-6">
                            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2 mb-2">
                                    <Icon icon="mdi:account-arrow-up" className="w-5 h-5 text-gray-400" />
                                    اختيار اللاعب
                                </h4>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-700">اللاعب المراد ترقيته</label>
                                    <select
                                        value={data.user_id}
                                        onChange={e => setData('user_id', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm"
                                    >
                                        <option value="">-- اختر اللاعب --</option>
                                        {eligiblePlayers.map(player => (
                                            <option key={player.id} value={player.id}>
                                                {player.name} ({player.phone || player.email})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.user_id && <p className="text-red-500 text-xs">{errors.user_id}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-gray-700">الصلاحية / الدور</label>
                                    <select
                                        value={data.role}
                                        onChange={e => setData('role', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm"
                                    >
                                        <option value="Receptionist">مستقبل (Receptionist)</option>
                                        <option value="Staff">موظف (Staff)</option>
                                    </select>
                                    {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}
                                </div>
                            </div>

                            {renderShiftScheduleSection()}

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                                    disabled={processing}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl font-bold bg-[#cbfb45] text-primary hover:bg-[#b5e03e] transition-colors flex items-center gap-2 text-sm shadow-sm"
                                    disabled={processing}
                                >
                                    {processing && <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />}
                                    ترقية اللاعب
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* نافذة التعديل (Modal) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl relative z-10 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-20">
                            <h3 className="text-xl font-bold text-primary">تعديل بيانات الموظف</h3>
                            <button type="button" onClick={closeModal} className="text-gray-400 hover:text-red-500 transition-colors">
                                <Icon icon="mdi:close" className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                            
                            {/* الصورة الشخصية */}
                            <div className="flex flex-col items-center justify-center mb-2">
                                <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden mb-2 relative group cursor-pointer hover:border-primary transition-colors">
                                    {data.image ? (
                                        <img src={URL.createObjectURL(data.image)} className="w-full h-full object-cover" />
                                    ) : (editingStaff && editingStaff.image_path) ? (
                                        <img src={`/storage/${editingStaff.image_path}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <Icon icon="mdi:camera-plus" className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                                    )}
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                        accept="image/*"
                                        onChange={e => setData('image', e.target.files[0])}
                                    />
                                </div>
                                <span className="text-xs text-gray-500">تحديث الصورة</span>
                                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* البيانات الأساسية */}
                                <div className="space-y-4 md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2 mb-2">
                                        <Icon icon="mdi:account-details" className="w-5 h-5 text-gray-400" />
                                        البيانات الأساسية
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-gray-700">الاسم الكامل</label>
                                            <input 
                                                type="text" 
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm"
                                            />
                                            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-gray-700">البريد الإلكتروني (أو الجوال)</label>
                                            <input 
                                                type="email" 
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm text-left"
                                                dir="ltr"
                                            />
                                            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-gray-700">رقم الجوال (أو البريد)</label>
                                            <input 
                                                type="text" 
                                                value={data.phone}
                                                onChange={e => setData('phone', e.target.value)}
                                                className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm text-left"
                                                dir="ltr"
                                            />
                                            {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-gray-700">كلمة المرور (للتغيير فقط)</label>
                                            <input 
                                                type="password" 
                                                value={data.password}
                                                onChange={e => setData('password', e.target.value)}
                                                className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm text-left"
                                                dir="ltr"
                                            />
                                            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-700">الصلاحية / الدور</label>
                                            <select
                                                value={data.role}
                                                onChange={e => setData('role', e.target.value)}
                                                className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm"
                                            >
                                                <option value="Receptionist">مستقبل (Receptionist)</option>
                                                <option value="Staff">موظف (Staff)</option>
                                            </select>
                                            {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* معلومات الشفت - تم دمج دالة التصيير هنا */}
                                <div className="md:col-span-2">
                                    {renderShiftScheduleSection()}
                                </div>
                            </div>

                            {/* أزرار الحفظ */}
                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                                    disabled={processing}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
                                    disabled={processing}
                                >
                                    {processing && <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />}
                                    حفظ التعديلات
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}
