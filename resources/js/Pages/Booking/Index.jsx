import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { resolveAsset } from '../../utils';

const typeLabel = (type) => type === 'indoor' ? 'داخلي' : 'خارجي';
const typeColor = (type) => type === 'indoor'
    ? { bg: '#eeeeee', color: '#222831', border: '#e0e0e0' }
    : { bg: '#FFF8E1', color: '#7A5F00', border: '#FFE082' };

const statusLabel = (s) => ({
    pending:   { label: 'معلّق',    bg: '#FFF8E1', color: '#7A5F00' },
    approved:  { label: 'مقبول',   bg: '#eeeeee', color: '#222831' },
    rejected:  { label: 'مرفوض',   bg: '#FEE2E2', color: '#991B1B' },
    cancelled: { label: 'ملغي',    bg: '#F3F4F6', color: '#6B7280' },
    completed: { label: 'مكتمل',   bg: '#EDE9FE', color: '#5B21B6' },
}[s?.toLowerCase()] || { label: s, bg: '#F3F4F6', color: '#6B7280' });

const DURATIONS = [
    { value: '1',   label: 'ساعة واحدة',  hours: 1   },
    { value: '1.5', label: 'ساعة ونصف',   hours: 1.5 },
    { value: '2',   label: 'ساعتان',      hours: 2   },
    { value: '3',   label: 'ثلاث ساعات',  hours: 3   },
];

export default function BookingIndex({ auth, courts, userBookings, flash, errors }) {
    const [selectedCourt, setSelectedCourt] = useState(courts.length > 0 ? courts[0] : null);
    const [duration, setDuration] = useState('1');
    const [cancelConfirm, setCancelConfirm] = useState(null);

    const getLocalFormattedDate = () => {
        const d = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    const { data, setData, post, processing, reset } = useForm({
        court_id:   selectedCourt?.id || '',
        date:       getLocalFormattedDate(),
        start_time: '18:00',
        coach_id: '',
    });

    const [availableCoaches, setAvailableCoaches] = useState([]);
    const [isFetchingCoaches, setIsFetchingCoaches] = useState(false);
    const [selectedCoach, setSelectedCoach] = useState(null);

    const [bookedSlots, setBookedSlots] = useState([]);
    const [isFetchingSlots, setIsFetchingSlots] = useState(false);

    // Fetch Booked Slots with auto-polling (every 10 seconds)
    useEffect(() => {
        if (!selectedCourt || !data.date) {
            setBookedSlots([]);
            return;
        }

        const fetchSlots = (showSpinner = false) => {
            if (showSpinner) setIsFetchingSlots(true);
            axios.get(route('api.courts.availability', selectedCourt.id), {
                params: { date: data.date }
            }).then(res => {
                setBookedSlots(res.data.booked_slots || []);
                // If currently selected time is now booked, clear it
                setData(currentData => {
                    if (res.data.booked_slots.includes(currentData.start_time)) {
                        return { ...currentData, start_time: '' };
                    }
                    return currentData;
                });
            }).catch(err => console.error(err))
              .finally(() => {
                  if (showSpinner) setIsFetchingSlots(false);
              });
        };

        // Initial load with spinner
        fetchSlots(true);

        // Background polling every 10 seconds (silent)
        const interval = setInterval(() => {
            fetchSlots(false);
        }, 10000);

        return () => clearInterval(interval);
    }, [selectedCourt, data.date]);

    // Auto-polling for player's booking history (every 15 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['userBookings'],
                preserveScroll: true,
                preserveState: true
            });
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    // Fetch Coaches

    useEffect(() => {
        if (!selectedCourt || !data.date || !data.start_time) {
            setAvailableCoaches([]);
            setSelectedCoach(null);
            setData('coach_id', '');
            return;
        }

        setIsFetchingCoaches(true);
        axios.get(route('api.courts.coaches', selectedCourt.id), {
            params: { date: data.date, time: data.start_time }
        }).then(res => {
            setAvailableCoaches(res.data.coaches || []);
            // If the currently selected coach is not in the new list, deselect
            if (selectedCoach && !res.data.coaches.find(c => c.id === selectedCoach.id)) {
                setSelectedCoach(null);
                setData('coach_id', '');
            }
        }).catch(err => {
            console.error('Error fetching coaches', err);
        }).finally(() => {
            setIsFetchingCoaches(false);
        });
    }, [selectedCourt, data.date, data.start_time]);

    const estimatedPrice = useMemo(() => {
        if (!selectedCourt) return 0;
        const hrs = parseFloat(duration) || 1;
        let basePrice = selectedCourt.price * hrs;
        if (selectedCoach) {
            basePrice += (selectedCoach.hourly_rate * hrs);
        }
        return Math.round(basePrice);
    }, [selectedCourt, duration, selectedCoach]);

    const selectCourt = (court) => {
        setSelectedCourt(court);
        setData('court_id', court.id);
    };

    const submitBooking = (e) => {
        e.preventDefault();
        const startDateTime = `${data.date} ${data.start_time}:00`;
        const startObj = new Date(startDateTime);
        const endObj   = new Date(startObj.getTime() + parseFloat(duration) * 3600000);
        const pad = (n) => n.toString().padStart(2, '0');
        const endDateTime = `${endObj.getFullYear()}-${pad(endObj.getMonth()+1)}-${pad(endObj.getDate())} ${pad(endObj.getHours())}:${pad(endObj.getMinutes())}:00`;

        post(route('booking.store'), {
            preserveScroll: true,
            data: { court_id: data.court_id, start_time: startDateTime, end_time: endDateTime, coach_id: data.coach_id },
            onSuccess: () => reset('start_time'),
        });
    };

    const cancelBooking = (bookingId) => {
        router.post(route('booking.cancel', bookingId));
        setCancelConfirm(null);
    };

    const V = { '--primary': '#222831', '--accent': '#d6e02e' };

    return (
        <AppLayout>
            <Head title="حجز الملاعب — آيس بادل" />

            <div dir="rtl" className="min-h-screen" style={{ backgroundColor: '#F9F9F9', fontFamily: "'Cairo', sans-serif" }}>

                {/* ── Hero ── */}
                <div className="relative overflow-hidden py-16 px-6 text-center"
                    style={{ background: 'linear-gradient(135deg, #222831 0%, #1a1f26 100%)' }}>
                    <div className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, #d6e02e 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <span className="inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-4"
                            style={{ backgroundColor: 'rgba(214,224,46,0.15)', color: '#d6e02e', letterSpacing: '0.15em' }}>
                            آيس بادل أكاديمي
                        </span>
                        <h1 className="text-4xl font-black text-white mb-3">احجز ملعبك الآن</h1>
                        <p className="text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
                            اختر الملعب المناسب، حدد التاريخ والوقت، وانطلق.
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">

                    {/* ── Flash Messages ── */}
                    {flash?.success && (
                        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border"
                            style={{ backgroundColor: '#eeeeee', borderColor: '#e0e0e0', color: '#222831' }}>
                            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-bold">{flash.success}</span>
                        </div>
                    )}
                    {errors?.error && (
                        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border"
                            style={{ backgroundColor: '#FEE2E2', borderColor: '#FECACA', color: '#991B1B' }}>
                            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-bold">{errors.error}</span>
                        </div>
                    )}

                    {/* ── Courts Grid + Form ── */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                        {/* Courts Grid (2/3 width) */}
                        <div className="xl:col-span-2">
                            <h2 className="text-xl font-black mb-5" style={{ color: '#0F1A13' }}>
                                اختر الملعب
                            </h2>

                            {courts.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed" style={{ borderColor: '#e0e0e0' }}>
                                    <div className="text-5xl mb-3">🏸</div>
                                    <p className="font-bold text-gray-500">لا توجد ملاعب متاحة حالياً</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {courts.map(court => {
                                        const isSelected = selectedCourt?.id === court.id;
                                        const tc = typeColor(court.type);
                                        return (
                                            <button key={court.id} type="button"
                                                onClick={() => selectCourt(court)}
                                                className="text-right rounded-2xl overflow-hidden border-2 transition-all duration-200"
                                                style={{
                                                    borderColor: isSelected ? '#222831' : '#E8F0E8',
                                                    backgroundColor: '#FFFFFF',
                                                    boxShadow: isSelected ? '0 0 0 3px rgba(34, 40, 49, 0.15)' : '0 1px 4px rgba(0,0,0,0.05)',
                                                    transform: isSelected ? 'translateY(-2px)' : 'none',
                                                }}>

                                                {/* Court Image */}
                                                <div className="relative h-36 overflow-hidden"
                                                    style={{ backgroundColor: '#eeeeee' }}>
                                                    {court.image_path ? (
                                                        <img src={resolveAsset(`/storage/${court.image_path}`)}
                                                            alt={court.name}
                                                            className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                                            <svg className="w-10 h-10" style={{ color: '#A7C4A7' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                                            </svg>
                                                            <span className="text-xs" style={{ color: '#A7C4A7' }}>لا توجد صورة</span>
                                                        </div>
                                                    )}

                                                    {/* Type Badge */}
                                                    <span className="absolute top-2.5 right-2.5 text-[10px] font-black px-2.5 py-1 rounded-full"
                                                        style={{ backgroundColor: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                                                        {typeLabel(court.type)}
                                                    </span>

                                                    {/* Selected Checkmark */}
                                                    {isSelected && (
                                                        <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full flex items-center justify-center"
                                                            style={{ backgroundColor: '#222831' }}>
                                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Court Info */}
                                                <div className="p-4">
                                                    <h3 className="font-black text-base mb-1" style={{ color: '#0F1A13' }}>{court.name}</h3>
                                                    {court.description && (
                                                        <p className="text-xs mb-3 leading-relaxed" style={{ color: '#637060' }}
                                                            title={court.description}>
                                                            {court.description.length > 55 ? court.description.slice(0, 55) + '…' : court.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold" style={{ color: '#637060' }}>السعر / ساعة</span>
                                                        <span className="font-black text-sm" style={{ color: '#222831' }}>
                                                            {court.price.toLocaleString('en-US')} ل.س
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Booking Form (1/3 width) */}
                        <div className="xl:col-span-1">
                            <h2 className="text-xl font-black mb-5" style={{ color: '#1a1d20' }}>
                                تفاصيل الحجز
                            </h2>

                            <div className="rounded-3xl overflow-hidden border"
                                style={{ backgroundColor: '#FFFFFF', borderColor: '#e0e0e0', boxShadow: '0 4px 24px rgba(34,40,49,0.08)' }}>

                                {/* Selected Court Preview */}
                                {selectedCourt && (
                                    <div className="px-5 py-4 border-b flex items-center gap-3"
                                        style={{ borderColor: '#e0e0e0', backgroundColor: '#eeeeee' }}>
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: '#FFFFFF' }}>
                                            <svg className="w-5 h-5" style={{ color: '#222831' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold" style={{ color: '#616161' }}>الملعب المختار</p>
                                            <p className="font-black text-sm" style={{ color: '#1a1d20' }}>{selectedCourt.name}</p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={submitBooking} className="p-5 space-y-5">

                                    {/* Date */}
                                    <div>
                                        <label className="block text-xs font-bold mb-2" style={{ color: '#222831' }}>
                                            📅 التاريخ
                                        </label>
                                        <input type="date"
                                            value={data.date}
                                            onChange={e => setData('date', e.target.value)}
                                            min={getLocalFormattedDate()}
                                            required
                                            className="block w-full rounded-xl px-4 py-3 text-sm border transition-all"
                                            style={{ borderColor: '#e0e0e0', color: '#0F1A13', outline: 'none', fontFamily: "'Cairo', sans-serif" }}
                                        />
                                    </div>

                                    {/* Start Time */}
                                    <div>
                                        <label className="block text-xs font-bold mb-2" style={{ color: '#222831' }}>
                                            🕐 وقت البدء
                                        </label>
                                        {isFetchingSlots ? (
                                            <p className="text-xs text-gray-500 py-4 text-center">جاري التحقق من الأوقات المتاحة...</p>
                                        ) : (
                                            <div className="grid grid-cols-4 gap-2" dir="ltr">
                                                {['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00','00:00','01:00'].map(slot => {
                                                    const isBooked = bookedSlots.includes(slot);
                                                    const isSelected = data.start_time === slot;
                                                    return (
                                                        <button key={slot} type="button"
                                                            disabled={isBooked}
                                                            onClick={() => setData('start_time', slot)}
                                                            className="py-2 rounded-xl text-xs font-bold transition-all border"
                                                            style={{
                                                                opacity: isBooked ? 0.4 : 1,
                                                                cursor: isBooked ? 'not-allowed' : 'pointer',
                                                                borderColor: isSelected ? '#222831' : isBooked ? '#F3F4F6' : '#e0e0e0',
                                                                backgroundColor: isSelected ? '#222831' : isBooked ? '#F9FAFB' : '#FFFFFF',
                                                                color: isSelected ? '#FFFFFF' : isBooked ? '#9CA3AF' : '#0F1A13',
                                                            }}>
                                                            {slot}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {!data.start_time && !isFetchingSlots && (
                                            <p className="text-xs text-red-500 mt-2 text-right">يرجى اختيار وقت البدء</p>
                                        )}
                                    </div>

                                    {/* Duration */}
                                    <div>
                                        <label className="block text-xs font-bold mb-2" style={{ color: '#222831' }}>
                                            ⏱ المدة
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {DURATIONS.map(d => (
                                                <button key={d.value} type="button"
                                                    onClick={() => setDuration(d.value)}
                                                    className="py-2.5 rounded-xl text-xs font-bold border-2 transition-all"
                                                    style={{
                                                        borderColor:     duration === d.value ? '#222831' : '#e0e0e0',
                                                        backgroundColor: duration === d.value ? '#222831' : '#FFFFFF',
                                                        color:           duration === d.value ? '#FFFFFF' : '#637060',
                                                    }}>
                                                    {d.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Coach Selection */}
                                    {availableCoaches.length > 0 && (
                                        <div>
                                            <label className="block text-xs font-bold mb-2" style={{ color: '#222831' }}>
                                                👨‍🏫 إضافة مدرب (اختياري)
                                            </label>
                                            {isFetchingCoaches ? (
                                                <p className="text-xs text-gray-500">جاري البحث عن مدربين...</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {availableCoaches.map(coach => {
                                                        const isSelected = selectedCoach?.id === coach.id;
                                                        return (
                                                            <div key={coach.id}
                                                                onClick={() => {
                                                                    if (isSelected) {
                                                                        setSelectedCoach(null);
                                                                        setData('coach_id', '');
                                                                    } else {
                                                                        setSelectedCoach(coach);
                                                                        setData('coach_id', coach.id);
                                                                    }
                                                                }}
                                                                className="flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all"
                                                                style={{
                                                                    borderColor: isSelected ? '#222831' : '#E8F0E8',
                                                                    backgroundColor: isSelected ? '#F8FAF8' : '#FFFFFF',
                                                                    boxShadow: isSelected ? '0 0 0 2px #222831' : 'none'
                                                                }}>
                                                                <div>
                                                                    <p className="text-sm font-bold" style={{ color: '#0F1A13' }}>
                                                                        كابتن {coach.user?.name}
                                                                    </p>
                                                                    <p className="text-xs" style={{ color: '#637060' }}>
                                                                        {coach.specialty}
                                                                    </p>
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="text-sm font-black" style={{ color: '#222831' }}>
                                                                        +{parseFloat(coach.hourly_rate).toLocaleString('en-US')}
                                                                    </p>
                                                                    <p className="text-[10px]" style={{ color: '#637060' }}>ل.س / ساعة</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Price Estimate */}
                                    {selectedCourt && (
                                        <div className="rounded-2xl p-4 border" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs" style={{ color: '#637060' }}>
                                                    الملعب: {selectedCourt.price.toLocaleString('en-US')} × {DURATIONS.find(d=>d.value===duration)?.label}
                                                </span>
                                            </div>
                                            {selectedCoach && (
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs" style={{ color: '#637060' }}>
                                                        المدرب: {parseFloat(selectedCoach.hourly_rate).toLocaleString('en-US')} × {DURATIONS.find(d=>d.value===duration)?.label}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="border-t pt-3 mt-2 flex justify-between items-center">
                                                <span className="font-bold text-sm" style={{ color: '#222831' }}>الإجمالي</span>
                                                <span className="font-black text-lg" style={{ color: '#222831' }}>
                                                    {estimatedPrice.toLocaleString('en-US')} ل.س
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <button type="submit" disabled={processing || !selectedCourt || !data.start_time}
                                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all"
                                        style={{
                                            backgroundColor: processing || !selectedCourt || !data.start_time ? '#637060' : '#222831',
                                            color: '#FFFFFF',
                                            boxShadow: processing || !selectedCourt || !data.start_time ? 'none' : '0 6px 24px rgba(34,40,49,0.3)',
                                            cursor: processing || !selectedCourt || !data.start_time ? 'not-allowed' : 'pointer',
                                        }}>
                                        {processing ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                                </svg>
                                                جاري الإرسال...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                                </svg>
                                                تأكيد الحجز
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* ── Booking History ── */}
                    <div>
                        <h2 className="text-xl font-black mb-5" style={{ color: '#0F1A13' }}>
                            حجوزاتي
                        </h2>

                        {userBookings.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed" style={{ borderColor: '#e0e0e0' }}>
                                <div className="text-5xl mb-3">📋</div>
                                <p className="font-bold" style={{ color: '#637060' }}>لم تقم بأي حجز بعد</p>
                                <p className="text-sm mt-1" style={{ color: '#A7C4A7' }}>اختر ملعبك من الأعلى وابدأ الآن!</p>
                            </div>
                        ) : (
                            <div className="rounded-3xl overflow-hidden border" style={{ borderColor: '#E8F0E8' }}>
                                {/* Table Header */}
                                <div className="hidden md:grid grid-cols-5 px-6 py-3 text-xs font-black"
                                    style={{ backgroundColor: '#eeeeee', color: '#637060', borderBottom: '1px solid #E8F0E8' }}>
                                    <span>الملعب</span>
                                    <span>التاريخ والوقت</span>
                                    <span>المدة</span>
                                    <span>التكلفة</span>
                                    <span className="text-center">الحالة / الإجراء</span>
                                </div>

                                {/* Rows */}
                                <div className="divide-y" style={{ backgroundColor: '#FFFFFF', borderColor: '#E8F0E8' }}>
                                    {userBookings.map((booking) => {
                                        const st = new Date(booking.start_time);
                                        const et = new Date(booking.end_time);
                                        const diffMs = et - st;
                                        const diffH  = diffMs / 3600000;
                                        const durText = diffH === 1 ? 'ساعة' : diffH === 1.5 ? 'ساعة ونصف' : diffH === 2 ? 'ساعتان' : `${diffH} ساعات`;
                                        const s = statusLabel(booking.status);

                                        return (
                                            <div key={booking.id} className="grid grid-cols-1 md:grid-cols-5 px-6 py-4 items-center gap-2">
                                                {/* Court name */}
                                                <div>
                                                    <span className="font-black text-sm" style={{ color: '#0F1A13' }}>
                                                        {booking.court?.name || '—'}
                                                    </span>
                                                    <span className="md:hidden block text-xs mt-0.5" style={{ color: '#637060' }}>
                                                        {st.toLocaleDateString('en-GB')} {st.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                {/* Date */}
                                                <div className="hidden md:block">
                                                    <p className="text-sm font-bold" style={{ color: '#0F1A13' }}>
                                                        {st.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-xs" style={{ color: '#637060' }}>
                                                        {st.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} — {et.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>

                                                {/* Duration */}
                                                <div className="hidden md:block text-sm" style={{ color: '#637060' }}>
                                                    {durText}
                                                </div>

                                                {/* Price */}
                                                <div className="text-sm font-black" style={{ color: '#222831' }}>
                                                    {parseFloat(booking.total_price).toLocaleString('en-US')} ل.س
                                                </div>

                                                {/* Status + Action */}
                                                <div className="flex items-center gap-2 md:justify-center">
                                                    <span className="text-xs font-black px-3 py-1 rounded-full"
                                                        style={{ backgroundColor: s.bg, color: s.color }}>
                                                        {s.label}
                                                    </span>
                                                    {['pending', 'approved'].includes(booking.status) && (
                                                        cancelConfirm === booking.id ? (
                                                            <div className="flex gap-1.5">
                                                                <button onClick={() => cancelBooking(booking.id)}
                                                                    className="text-xs font-bold px-3 py-1 rounded-full"
                                                                    style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                                                                    تأكيد
                                                                </button>
                                                                <button onClick={() => setCancelConfirm(null)}
                                                                    className="text-xs font-bold px-3 py-1 rounded-full"
                                                                    style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                                                                    لا
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => setCancelConfirm(booking.id)}
                                                                className="text-xs font-bold underline"
                                                                style={{ color: '#DC2626', textUnderlineOffset: '3px' }}>
                                                                إلغاء
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
