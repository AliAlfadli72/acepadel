import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Icon } from "@iconify/react";
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import usePermissions from "@/hooks/usePermissions";
import { resolveAsset } from '../../../utils';

const RANKS = ['مبتدئ', 'متوسط', 'متقدم', 'محترف', 'نخبة'];
const rankTranslation = {
    'Beginner': 'مبتدئ',
    'Intermediate': 'متوسط',
    'Advanced': 'متقدم',
    'Professional': 'محترف',
    'Elite': 'نخبة',
};
const getRank = (r) => rankTranslation[r] || r;

const rankColor = (r) => {
    const m = { 'مبتدئ':'bg-gray-100 text-gray-600', 'متوسط':'bg-blue-100 text-blue-700', 'متقدم':'bg-yellow-100 text-yellow-700', 'محترف':'bg-orange-100 text-orange-700', 'نخبة':'bg-purple-100 text-purple-700' };
    return m[getRank(r)] || 'bg-gray-100 text-gray-500';
};

const Field = ({ label, children }) => (
    <div className="space-y-1">
        <label className="block text-xs font-bold text-gray-600">{label}</label>
        {children}
    </div>
);

export default function PlayersIndex({ players, filters, stats }) {
    const { can } = usePermissions();
    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [editingPlayer, setEditingPlayer] = useState(null);
    const [search, setSearch]             = useState(filters?.search || '');
    const [rank,   setRank]               = useState(filters?.rank   || '');
    const { auth, roles } = usePage().props;

    const canManagePlayer = (targetPlayer) => {
        const userRoles = (roles || []).map(r => r.toLowerCase());
        const targetRoles = (targetPlayer.roles || []).map(r => r.name.toLowerCase());

        const isTargetAdmin = targetRoles.includes('admin');
        const isTargetManager = targetRoles.includes('manager');
        const isTargetReceptionist = targetRoles.includes('receptionist');

        if (userRoles.includes('receptionist')) {
            if (isTargetAdmin || isTargetManager || isTargetReceptionist) {
                return false;
            }
        }

        if (userRoles.includes('manager')) {
            if (isTargetAdmin) {
                return false;
            }
        }

        return true;
    };

    const applyFilters = (overrides = {}) => {
        const p = { search: overrides.search ?? search, rank: overrides.rank ?? rank };
        Object.keys(p).forEach(k => { if (!p[k]) delete p[k]; });
        router.get(route('admin.players.index'), p, { preserveState: true, replace: true });
    };

    const resetFilters = () => { setSearch(''); setRank(''); router.get(route('admin.players.index')); };

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        phone: '',
        image: null,
        rank_level: 'مبتدئ',
        points: 0,
        wallet_balance: 0,
        pilates_wallet_balance: 0,
        matches_played: 0,
        matches_won: 0,
        password: '',
    });

    const openAdd = () => { 
            if (!can('players.create')) {
                return;
            }
        clearErrors(); reset(); setEditingPlayer(null); setIsModalOpen(true); };

    const openEdit = (p) => {

        if (!can('players.edit') || !canManagePlayer(p)) {
            return;
        }
        clearErrors();
        setEditingPlayer(p);
        setData({
            name: p.name, phone: p.phone||'',
            image:null,
            rank_level: p.player_profile?.rank_level || 'مبتدئ',
            points:                 p.player_profile?.points         || 0,
            wallet_balance:         Math.round(p.wallet?.balance || 0),
            pilates_wallet_balance: Math.round(p.wallet?.pilates_balance || 0),
            matches_played:         p.player_profile?.matches_played || 0,
            matches_won:            p.player_profile?.matches_won    || 0,
            password: '',
        });
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingPlayer) {
            router.post(route('admin.players.update', editingPlayer.id), {
                _method:'PUT', name:data.name, phone:data.phone,
                image:data.image, rank_level:data.rank_level, points:data.points,
                wallet_balance:data.wallet_balance, pilates_wallet_balance:data.pilates_wallet_balance,
                matches_played:data.matches_played, matches_won:data.matches_won,
                password:data.password,
            }, { 
                forceFormData:true, 
                onSuccess:() => { setIsModalOpen(false); reset(); },
                onError: (errs) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'يوجد خطأ في المدخلات',
                        text: Object.values(errs).join('\n'),
                        confirmButtonText: 'حسناً',
                        confirmButtonColor: '#222831'
                    });
                }
            });
        } else {
            post(route('admin.players.store'), { onSuccess:() => { setIsModalOpen(false); reset(); } });
        }
    };

    const deletePlayer = (id) => {
            if (!can('players.delete')) {
                return;
            }
        Swal.fire({
            title: 'تأكيد الحذف',
            text: 'حذف هذا اللاعب نهائياً؟',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.players.destroy', id));
            }
        });
    };

    return (
        <AdminLayout header="اللاعبين">
            <Head title="اللاعبين" />
            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label:'إجمالي اللاعبين',  value: stats.total,       icon:'mdi:account-group',   color:'text-primary bg-primary/10' },
                            ...(can('players.edit') ? [{ label:'لديهم رصيد',        value: stats.with_wallet, icon:'mdi:wallet',          color:'text-green-600 bg-green-50' }] : []),
                            { label:'المستوى الأعلى',    value: stats.rank_counts?.['نخبة'] || 0, icon:'mdi:trophy', color:'text-purple-600 bg-purple-50' },
                            { label:'الصفحة الحالية',    value: `${players.from||0}–${players.to||0}`, icon:'mdi:format-list-numbered', color:'text-blue-600 bg-blue-50' },
                        ].map(c => (
                            <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.color}`}>
                                    <Icon icon={c.icon} className="w-5 h-5" />
                                </div>
                                <div><p className="text-xl font-black text-gray-900">{c.value}</p><p className="text-xs text-gray-400">{c.label}</p></div>
                            </div>
                        ))}
                    </div>

                    {/* Header + Add */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-primary">اللاعبين المسجلين</h3>
                            <p className="text-gray-400 text-sm">{players.total} لاعب{(search||rank) && <span className="text-primary font-bold"> · فلتر مفعّل</span>}</p>
                        </div>
                        {can('players.create') && (
                        <button onClick={openAdd}
                        className="bg-[#d6e02e] text-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#b8c21a] transition-colors">
                            <Icon icon="mdi:account-plus" className="w-5 h-5" />إضافة لاعب
                        </button>
                        )}
                    </div>

                    {/* Filter bar */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px]">
                                <Icon icon="mdi:magnify" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input type="text" placeholder="بحث بالاسم، جوال، بريد..." value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key==='Enter' && applyFilters({ search: e.target.value })}
                                    className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-primary focus:border-primary" />
                            </div>

                            {/* Rank filter chips */}
                            <div className="flex gap-1.5 flex-wrap">
                                {['', ...RANKS].map(r => (
                                    <button key={r||'all'} onClick={() => { setRank(r); applyFilters({ rank: r }); }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${rank===r ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                                        {r || 'الكل'}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => applyFilters()} className="px-3 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 flex items-center gap-1">
                                    <Icon icon="mdi:magnify" className="w-4 h-4" />بحث
                                </button>
                                {(search||rank) && (
                                    <button onClick={resetFilters} className="px-3 py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl text-xs font-bold flex items-center gap-1">
                                        <Icon icon="mdi:close" className="w-4 h-4" />مسح
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-5 py-3.5">اللاعب</th>
                                        <th className="px-5 py-3.5">التواصل</th>
                                        <th className="px-5 py-3.5">المستوى</th>
                                        <th className="px-5 py-3.5">النقاط</th>
                                        <th className="px-5 py-3.5">المباريات</th>
                                        {can('players.create') && (
                                        <>
                                            <th className="px-5 py-3.5">رصيد بادل</th>
                                            <th className="px-5 py-3.5">رصيد بيلاتس</th>
                                        </>
                                        )}
                                       {can('players.create') && (

                                        <th className="px-5 py-3.5">إجراءات</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {players.data.map(p => {
                                        const profile  = p.player_profile;
                                        const winRate  = profile?.matches_played > 0
                                            ? Math.round((profile.matches_won / profile.matches_played) * 100) : 0;
                                        return (
                                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                                {/* Player */}
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                            {p.image_path ? <img src={resolveAsset(`/storage/${p.image_path}`)} className="w-full h-full object-cover" /> : <Icon icon="mdi:account" className="w-5 h-5 text-gray-400" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-primary">{p.name}</div>
                                                            <div className="text-xs text-gray-400">#{p.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Contact */}
                                                <td className="px-5 py-3.5">
                                                    <div className="text-xs text-gray-600" dir="ltr">{p.phone || p.email || '—'}</div>
                                                    {p.phone && p.email && <div className="text-xs text-gray-400 truncate max-w-[140px]">{p.email}</div>}
                                                </td>
                                                {/* Rank */}
                                                <td className="px-5 py-3.5">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${rankColor(profile?.rank_level)}`}>
                                                        {getRank(profile?.rank_level) || '—'}
                                                    </span>
                                                </td>
                                                {/* Points */}
                                                <td className="px-5 py-3.5 font-bold text-gray-800">{profile?.points || 0}</td>
                                                {/* Matches */}
                                                <td className="px-5 py-3.5">
                                                    <div className="text-xs text-gray-600">{profile?.matches_played || 0} مباراة</div>
                                                    <div className="text-xs text-green-600 font-bold">{winRate}% فوز</div>
                                                </td>
                                                   {can('players.edit') && (
                                                    <>
                                                        <td className="px-5 py-3.5">
                                                            <span className={`font-bold text-sm ${(p.wallet?.balance||0) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                                                {parseInt(p.wallet?.balance||0).toLocaleString('en-US')} <span className="text-xs font-normal text-gray-400">ل.س</span>
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <span className={`font-bold text-sm ${(p.wallet?.pilates_balance||0) > 0 ? 'text-purple-600' : 'text-gray-400'}`}>
                                                                {parseInt(p.wallet?.pilates_balance||0).toLocaleString('en-US')} <span className="text-xs font-normal text-gray-400">ل.س</span>
                                                            </span>
                                                        </td>
                                                    </>
                                                    )}
                                                    {(can('players.edit') || can('players.delete')) && (
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-1.5">

                                                            {can('players.edit') && canManagePlayer(p) && (
                                                                <button
                                                                    onClick={() => openEdit(p)}
                                                                    className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                                    title="تعديل"
                                                                >
                                                                    <Icon icon="mdi:pencil" className="w-4 h-4" />
                                                                </button>
                                                            )}

                                                                {can('players.delete') && auth.user.id !== p.id && canManagePlayer(p) && (
                                                                    <button
                                                                        onClick={() => deletePlayer(p.id)}
                                                                        className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                                                        title="حذف"
                                                                    >
                                                                        <Icon icon="mdi:delete-outline" className="w-4 h-4" />
                                                                    </button>
                                                                )}

                                                        </div>
                                                    </td>
                                                    )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {players.data.length === 0 && (
                                <div className="py-16 text-center">
                                    <Icon icon="mdi:account-search" className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-400 font-bold">لا يوجد لاعبون مطابقون</p>
                                    {(search||rank) && <button onClick={resetFilters} className="mt-2 text-primary text-sm font-bold hover:underline">مسح الفلاتر</button>}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {players.last_page > 1 && (
                            <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <p className="text-xs text-gray-400">
                                    عرض <b>{players.from}</b>–<b>{players.to}</b> من <b>{players.total}</b> لاعب
                                </p>
                                <div className="flex gap-1 flex-wrap justify-center">
                                    {players.links.map((link, i) => (
                                        <button key={i}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveState:true, replace:true })}
                                            disabled={!link.url || link.active}
                                            className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-bold border transition-colors ${
                                                link.active ? 'bg-primary text-white border-primary'
                                                : link.url  ? 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                                                            : 'bg-white text-gray-300 border-gray-100 cursor-not-allowed'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-20">
                            <h3 className="text-lg font-bold text-primary">{editingPlayer ? 'تعديل بيانات اللاعب' : 'إضافة لاعب جديد'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><Icon icon="mdi:close" className="w-6 h-6" /></button>
                        </div>

                        <form onSubmit={submit} className="p-5 space-y-4">
                            {Object.keys(errors).length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon
                                            icon="mdi:alert-circle"
                                            className="w-5 h-5 text-red-500"
                                        />
                                        <h4 className="font-bold text-red-700">
                                            يرجى تصحيح الأخطاء التالية
                                        </h4>
                                    </div>

                                    <ul className="space-y-1 text-sm text-red-600">
                                        {Object.values(errors).map((error, index) => (
                                            <li key={index}>• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {/* Image */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                                    {data.image ? <img src={URL.createObjectURL(data.image)} className="w-full h-full object-cover" />
                                        : editingPlayer?.image_path ? <img src={resolveAsset(`/storage/${editingPlayer.image_path}`)} className="w-full h-full object-cover" />
                                        : <Icon icon="mdi:camera" className="w-6 h-6 text-gray-300" />}
                                    <input type="file" accept="image/*" onChange={e => setData('image', e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">

                                        <Field label="الاسم الكامل *">
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                placeholder="اسم اللاعب"
                                                className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm"
                                            />
                                        </Field>

                                        <Field label="رقم الجوال *">
                                            <input
                                                type="text"
                                                value={data.phone}
                                                onChange={e => setData('phone', e.target.value)}
                                                placeholder="+963XXXXXXXXX"
                                                dir="ltr"
                                                className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm"
                                            />
                                        </Field>

                                        <Field label={editingPlayer ? "كلمة المرور (اتركها فارغة لعدم التغيير)" : "كلمة المرور"}>
                                            <input
                                                type="password"
                                                value={data.password}
                                                onChange={e => setData('password', e.target.value)}
                                                placeholder={editingPlayer ? "••••••••" : "تعيين كلمة مرور للاعب"}
                                                dir="ltr"
                                                className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm"
                                            />
                                        </Field>

                                        {/* ملاحظة للأدمن: الدخول عبر OTP واتساب فقط */}
                                        <div className="col-span-2 bg-blue-50 rounded-lg p-3 text-xs text-blue-700 flex items-center gap-2">
                                            <span>ℹ️</span>
                                            <span>يدخل اللاعب عبر رمز واتساب على رقم الجوال المدخل — أو يمكنه استخدام كلمة المرور لتسجيل الدخول.</span>
                                        </div>

                                    </div>
                            </div>



                            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                <Field label="المستوى">
                                    <select value={data.rank_level} onChange={e => setData('rank_level', e.target.value)} className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm">
                                        {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </Field>
                            </div> */}

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {[
                                    { label:'النقاط',         field:'points' },
                                    { label:'رصيد بادل (ل.س)', field:'wallet_balance' },
                                    { label:'رصيد بيلاتس (ل.س)', field:'pilates_wallet_balance' },
                                    { label:'عدد المباريات',  field:'matches_played' },
                                    { label:'عدد الانتصارات', field:'matches_won' },
                                ].map(f => (
                                    <Field key={f.field} label={f.label}>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            step="1"
                                            value={data[f.field]} 
                                            onFocus={e => e.target.select()}
                                            onChange={e => {
                                                let val = e.target.value;
                                                if (val.length > 1 && val.startsWith('0')) {
                                                    val = val.replace(/^0+/, '');
                                                    if (val === '') val = '0';
                                                }
                                                setData(f.field, val);
                                            }}
                                            className="w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm" 
                                        />
                                    {errors[f.field] && <p className="text-red-500 text-xs">{errors[f.field]}</p>}
                                    </Field>
                                ))}
                            </div>

                            <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 text-sm" disabled={processing}>إلغاء</button>
                                <button type="submit" disabled={processing} className="px-5 py-2 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 text-sm flex items-center gap-2">
                                    {processing && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
                                    {editingPlayer ? 'حفظ التعديلات' : 'إضافة اللاعب'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
