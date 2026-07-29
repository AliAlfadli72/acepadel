import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2';

export default function TournamentManager({ event, tournament }) {
    const categories = tournament?.categories || [];
    const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || null);

    const activeCat = categories.find(c => c.id === selectedCatId) || categories[0];

    // Approved registered users for this event
    const approvedRegistrations = (event.registrations || []).filter(r => r.status === 'approved');
    const registeredUsers = approvedRegistrations.map(r => r.user).filter(Boolean);

    // Filter out players already assigned to teams in this category
    const teams = activeCat?.teams || [];
    const assignedPlayerIds = new Set();
    teams.forEach(t => {
        if (t.player1_id) assignedPlayerIds.add(String(t.player1_id));
        if (t.player2_id) assignedPlayerIds.add(String(t.player2_id));
    });

    const availableUsers = registeredUsers.filter(u => !assignedPlayerIds.has(String(u.id)));

    // Form state for team pairing
    const [player1Id, setPlayer1Id] = useState('');
    const [player2Id, setPlayer2Id] = useState('');
    const [teamName, setTeamName] = useState('');
    const [isCreatingTeam, setIsCreatingTeam] = useState(false);

    // Score Modal State
    const [editingMatch, setEditingMatch] = useState(null);
    const [winnerId, setWinnerId] = useState('');
    const [score1, setScore1] = useState('');
    const [score2, setScore2] = useState('');

    const handleCreateTeam = (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!activeCat) {
            Swal.fire('خطأ', 'يرجى اختيار الفئة أولاً', 'error');
            return;
        }
        if (!player1Id || !player2Id) {
            Swal.fire('خطأ', 'يرجى اختيار اللاعب الأول واللاعب الثاني بالفريق', 'error');
            return;
        }
        if (player1Id === player2Id) {
            Swal.fire('خطأ', 'لا يمكن اختيار نفس اللاعب مرتين في الفريق نفسه', 'error');
            return;
        }

        setIsCreatingTeam(true);
        router.post(route('admin.events.teams.store', event.id), {
            category_id: activeCat.id,
            player1_id: player1Id,
            player2_id: player2Id,
            team_name: teamName,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setPlayer1Id('');
                setPlayer2Id('');
                setTeamName('');
                setIsCreatingTeam(false);
            },
            onError: () => setIsCreatingTeam(false),
        });
    };

    const handleDeleteTeam = (teamId) => {
        Swal.fire({
            title: 'حذف الفريق',
            text: 'هل أنت متأكد من حذف هذا الفريق؟',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، حذف',
            cancelButtonText: 'إلغاء',
            customClass: {
                popup: 'rounded-3xl',
                confirmButton: 'bg-rose-600 text-white px-6 py-2 rounded-xl font-bold font-arabic',
            }
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(route('admin.events.teams.destroy', [event.id, teamId]), {
                    preserveScroll: true,
                });
            }
        });
    };

    const handleGenerateBracket = () => {
        if (!activeCat) return;

        const teamCount = activeCat.teams?.length || 0;
        if (teamCount < 2) {
            Swal.fire('تنبيه', 'يجب تشكيل فريقين على الأقل لتوليد شجرة البطولة.', 'warning');
            return;
        }

        const hasExistingMatches = matches.length > 0;

        Swal.fire({
            title: hasExistingMatches ? 'تصفير وإعادة توليد الشجرة ⚠️' : 'توليد شجرة البطولة 🏆',
            text: hasExistingMatches 
                ? `تحذير: هناك مباريات ونتائج مسجلة مسبقاً لفئة (${activeCat.name}). إعادة التوليد ستؤدي لمسح وتصفير كافة المباريات والنتائج المسجلة وإعادة البناء من جديد!`
                : `سيتم إنشاء شجرة تصفيات خروج المغلوب لـ ${teamCount} فرق ثنائية في فئة ${activeCat.name}. هل تريد الاستمرار؟`,
            icon: hasExistingMatches ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonText: hasExistingMatches ? 'نعم، مسح وإعادة التوليد ⚠️' : 'نعم، توليد الشجرة ⚡',
            cancelButtonText: 'إلغاء وتراجع',
            customClass: {
                popup: 'rounded-3xl',
                confirmButton: hasExistingMatches ? 'bg-rose-600 text-white px-6 py-2 rounded-xl font-bold font-arabic' : 'bg-slate-900 text-white px-6 py-2 rounded-xl font-bold font-arabic',
            }
        }).then((res) => {
            if (res.isConfirmed) {
                router.post(route('admin.events.bracket.generate', event.id), {
                    category_id: activeCat.id,
                }, {
                    preserveScroll: true,
                });
            }
        });
    };

    const handleSaveMatchResult = (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!editingMatch || !winnerId) {
            Swal.fire('خطأ', 'يرجى اختيار الفريق الفائز بالمباراة', 'error');
            return;
        }

        router.post(route('admin.events.matches.result', [event.id, editingMatch.id]), {
            winner_id: winnerId,
            score_team1: score1,
            score_team2: score2,
        }, {
            preserveScroll: true,
            onSuccess: () => setEditingMatch(null),
        });
    };

    const getTeamLabel = (team) => {
        if (!team) return '';
        if (team.display_name) return team.display_name;
        if (team.displayName) return team.displayName;
        if (team.team_name) return team.team_name;
        const p1 = team.player1?.name || 'اللاعب 1';
        const p2 = team.player2?.name || team.player2_name || 'اللاعب 2';
        return `${p1} + ${p2}`;
    };

    const matches = activeCat?.matches || [];

    return (
        <div className="mt-8 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xl shadow-slate-200/50">
            {/* Header Title & Category Chips */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#d6e02e]/20 border border-[#d6e02e]/30 flex items-center justify-center text-slate-900 shadow-sm">
                        <Icon icon="solar:trophy-bold" className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 font-arabic">إدارة شجرة البطولة وتشكيل الفرق 🏆</h2>
                        <p className="text-xs font-bold text-slate-500 font-arabic">اختر المستوى، كوّن الفرق الثنائية وولّد شجرة التصفيات تلقائياً</p>
                    </div>
                </div>

                {/* Level / Category Selector Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {categories.map((cat) => {
                        const isSelected = activeCat?.id === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCatId(cat.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-extrabold font-arabic transition-all flex items-center gap-1.5 ${
                                    isSelected
                                        ? 'bg-[#d6e02e] text-slate-950 shadow-md shadow-[#d6e02e]/30 scale-105'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <Icon icon="solar:cup-star-bold" className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                                {cat.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 1. Team Formation & Registered Players Form */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pair Form */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
                    <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2 font-arabic">
                        <Icon icon="solar:users-group-two-rounded-bold" className="w-5 h-5 text-slate-900" />
                        تشكيل فريق ثنائي جديد 🎾
                    </h3>

                    <div className="space-y-4 font-arabic">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">اللاعب الأول (Player 1):</label>
                            <select
                                value={player1Id}
                                onChange={(e) => setPlayer1Id(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:border-slate-400 focus:ring-0 transition-all"
                            >
                                <option value="">-- اختر اللاعب الأول --</option>
                                {availableUsers.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.phone})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">اللاعب الثاني / الشريك (Player 2):</label>
                            <select
                                value={player2Id}
                                onChange={(e) => setPlayer2Id(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:border-slate-400 focus:ring-0 transition-all"
                            >
                                <option value="">-- اختر الشريك --</option>
                                {availableUsers.filter(u => String(u.id) !== String(player1Id)).map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.phone})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">اسم الفريق (اختياري):</label>
                            <input
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="مثال: ثنائي الأبطال"
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:border-slate-400 focus:ring-0 transition-all"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleCreateTeam}
                            disabled={isCreatingTeam}
                            className="w-full bg-[#d6e02e] hover:bg-[#c2cc24] text-slate-950 font-black py-3 rounded-xl text-xs transition-all shadow-md shadow-[#d6e02e]/20 flex items-center justify-center gap-2"
                        >
                            <Icon icon="solar:add-circle-bold" className="w-4 h-4 text-slate-950" />
                            تأكيد تشكيل الفريق 🎾
                        </button>
                    </div>
                </div>

                {/* Registered Teams List & Bracket Generation Button */}
                <div className="lg:col-span-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 font-arabic">
                                <Icon icon="solar:shield-star-bold" className="w-5 h-5 text-emerald-600" />
                                الفرق الثنائية المعتمدة - {activeCat?.name} ({teams.length} فريق)
                            </h3>

                            <button
                                type="button"
                                onClick={handleGenerateBracket}
                                className={`font-extrabold px-4 py-2 rounded-xl text-xs transition-all font-arabic flex items-center gap-1.5 shadow-md ${
                                    matches.length > 0
                                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                        : 'bg-slate-900 text-white hover:bg-slate-800'
                                }`}
                            >
                                <Icon icon={matches.length > 0 ? "solar:restart-bold" : "solar:bolt-bold"} className={`w-4 h-4 ${matches.length > 0 ? 'text-rose-600' : 'text-[#d6e02e]'}`} />
                                {matches.length > 0 ? 'إعادة توليد الشجرة ⚠️' : 'توليد شجرة التصفيات تلقائياً ⚡'}
                            </button>
                        </div>

                        {teams.length === 0 ? (
                            <div className="text-center py-10 border border-dashed border-slate-300 rounded-2xl bg-white">
                                <Icon icon="solar:users-group-two-linear" className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-600 font-arabic">لم يتم تشكيل فرق في {activeCat?.name} بعد.</p>
                                <p className="text-[11px] text-slate-400 font-arabic mt-1">اختر لاعبين مقبولين من القائمة الجانبية وتكون فريقهم لـ {activeCat?.name}.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                                {teams.map((t, idx) => {
                                    const p1Name = t.player1?.name || (getTeamLabel(t) ? getTeamLabel(t).split(' + ')[0] : 'اللاعب 1');
                                    const p2Name = t.player2?.name || t.player2_name || (getTeamLabel(t) ? getTeamLabel(t).split(' + ')[1] : 'اللاعب 2');
                                    const isCustomName = t.team_name && !t.team_name.includes('+');

                                    return (
                                        <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <span className="w-7 h-7 rounded-lg bg-[#d6e02e]/20 text-slate-900 font-black text-xs flex items-center justify-center border border-[#d6e02e]/30">
                                                    #{idx + 1}
                                                </span>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 font-arabic">
                                                        {isCustomName ? t.team_name : `${p1Name} + ${p2Name}`}
                                                    </p>
                                                    <p className="text-[11px] font-bold text-slate-500 font-arabic flex items-center gap-1 mt-0.5">
                                                        <span>👤 {p1Name}</span>
                                                        <span className="text-slate-400 font-black">+</span>
                                                        <span>👤 {p2Name}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteTeam(t.id)}
                                                className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-all"
                                            >
                                                <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Matches & Bracket Tree Table */}
            <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2 font-arabic">
                    <Icon icon="solar:sitemap-bold" className="w-5 h-5 text-slate-900" />
                    مباريات شجرة التصفيات ونتائج الأدوار ({activeCat?.name}) 🏆
                </h3>

                {matches.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 border border-slate-200/80 rounded-2xl">
                        <Icon icon="solar:ruler-cross-bold" className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-600 font-arabic">لم يتم توليد مباريات لهذه الفئة بعد.</p>
                        <p className="text-[11px] text-slate-400 font-arabic mt-1">اضغط على زر "توليد شجرة التصفيات تلقائياً" أعلاه لإنشاء المباريات.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                    <table className="w-full text-right text-xs">
                        <thead className="bg-slate-100/80 text-slate-700 font-arabic font-black border-b border-slate-200">
                            <tr>
                                <th className="p-3.5 whitespace-nowrap text-right">المرحلة</th>
                                <th className="p-3.5 whitespace-nowrap text-right">المباراة</th>
                                <th className="p-3.5 whitespace-nowrap text-right">الفريق الأول</th>
                                <th className="p-3.5 whitespace-nowrap text-right">الفريق الثاني</th>
                                <th className="p-3.5 whitespace-nowrap text-right">النتيجة والنتيجة الفائزة</th>
                                <th className="p-3.5 whitespace-nowrap text-center">الحالة</th>
                                <th className="p-3.5 whitespace-nowrap text-center">تحديث النتيجة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-arabic font-bold bg-white">
                            {matches.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50/80 transition-all">
                                    <td className="p-3.5 font-black text-slate-900 whitespace-nowrap">
                                        {m.round === 2 ? 'المباراة النهائية (Final)' : m.round === 4 ? 'نصف النهائي (Semi-Finals)' : m.round === 8 ? 'ربع النهائي (Quarter-Finals)' : `الدور ${m.round}`}
                                    </td>
                                    <td className="p-3.5 text-slate-600 font-extrabold whitespace-nowrap">
                                        {m.round === 2 ? 'المباراة النهائية 🏆' : m.round === 4 ? `نصف النهائي - مباراة ${m.match_number}` : m.round === 8 ? `ربع النهائي - مباراة ${m.match_number}` : `مباراة ${m.match_number}`}
                                    </td>
                                    <td className="p-3.5 text-slate-900 font-bold">
                                        {getTeamLabel(m.team1) || <span className="text-slate-400 italic font-normal">بانتظار التأهل</span>}
                                    </td>
                                    <td className="p-3.5 text-slate-900 font-bold">
                                        {getTeamLabel(m.team2) || <span className="text-slate-400 italic font-normal">بانتظار التأهل</span>}
                                    </td>
                                    <td className="p-3.5 font-bold">
                                        {m.winner ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-700 font-black flex items-center gap-1">
                                                    🏆 {getTeamLabel(m.winner)}
                                                </span>
                                                <span className="bg-emerald-50 text-emerald-800 text-[11px] font-black px-2.5 py-0.5 rounded-md border border-emerald-200/80" style={{ direction: 'ltr' }}>
                                                    ({m.score_team1 || '6'} - {m.score_team2 || '4'})
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 font-normal">لم تنتهِ بعد</span>
                                        )}
                                    </td>
                                    <td className="p-3.5 text-center whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm ${
                                            m.status === 'completed' ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-300/80' : 'bg-amber-100/80 text-amber-800 border border-amber-300/80'
                                        }`}>
                                            {m.status === 'completed' ? 'منتهية ✅' : 'مجدولة ⏳'}
                                        </span>
                                    </td>
                                    <td className="p-3.5 text-center whitespace-nowrap">
                                        {(m.team1 && m.team2) ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingMatch(m);
                                                    setWinnerId(m.winner_id || m.team1_id);
                                                    setScore1(m.score_team1 || '6');
                                                    setScore2(m.score_team2 || '4');
                                                }}
                                                className="bg-slate-900 hover:bg-[#d6e02e] hover:text-slate-950 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 mx-auto shadow-sm"
                                            >
                                                <Icon icon="solar:pen-bold" className="w-3.5 h-3.5" />
                                                تسجيل الفائز 🏆
                                            </button>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 font-bold">بانتظار طرفي المباراة</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Score Edit Modal */}
            {editingMatch && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <h4 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2 font-arabic">
                            <Icon icon="solar:trophy-bold" className="w-5 h-5 text-[#7a8500]" />
                            تسجيل النتيجة وتحديد الفائز للمباراة رقم {editingMatch.match_number}
                        </h4>

                        <div className="space-y-4 font-arabic">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">الفريق الفائز (Winner):</label>
                                <select
                                    value={winnerId}
                                    onChange={(e) => setWinnerId(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:border-slate-400"
                                >
                                    <option value={editingMatch.team1_id}>🏆 {getTeamLabel(editingMatch.team1)}</option>
                                    <option value={editingMatch.team2_id}>🏆 {getTeamLabel(editingMatch.team2)}</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">نتيجة {getTeamLabel(editingMatch.team1)}:</label>
                                    <input
                                        type="text"
                                        value={score1}
                                        onChange={(e) => setScore1(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 text-center font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">نتيجة {getTeamLabel(editingMatch.team2)}:</label>
                                    <input
                                        type="text"
                                        value={score2}
                                        onChange={(e) => setScore2(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 text-center font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={handleSaveMatchResult}
                                    className="flex-1 bg-[#d6e02e] hover:bg-[#c2cc24] text-slate-950 font-black py-2.5 rounded-xl text-xs transition-all shadow-md"
                                >
                                    حفظ وتأهيل الفائز تلقائياً 🚀
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingMatch(null)}
                                    className="bg-slate-100 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-slate-200 transition-all"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
