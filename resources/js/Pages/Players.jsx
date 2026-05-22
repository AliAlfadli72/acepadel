import AppLayout, { LangContext } from '../Layouts/AppLayout';
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useContext, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { router } from "@inertiajs/react";
import { resolveAsset } from '../utils';
function FadeIn({ children, delay = 0 }) {

    const ref = useRef(null);

    const inView = useInView(ref, {
        once: true,
        margin: "-80px"
    });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
                duration: 0.7,
                delay,
                ease: [0.22, 1, 0.36, 1]
            }}
        >
            {children}
        </motion.div>
    );
}

export default function Players({
    players,
    topPlayers,
    showTopPlayers,
    filters
}) {

    const { lang } = useContext(LangContext);

    const isArabic = lang === "ar";

    const [search, setSearch] = useState(
        filters.search || ''
    );

    const [searching, setSearching] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | Debounced Search
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        setSearching(true);

        const delayDebounce = setTimeout(() => {

            router.get('/players', {
                search
            }, {
                preserveState: true,
                replace: true,
                onFinish: () => setSearching(false)
            });

        }, 400);

        return () => clearTimeout(delayDebounce);

    }, [search]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const clearSearch = () => {

        setSearch('');

        router.get('/players', {}, {
            preserveState: true,
            replace: true
        });
    };

    const rankColor = (rank) => {
        if (!rank) return "bg-gray-50 text-gray-600 border border-gray-200";
        const r = rank.toString().trim();
        const colors = {
            D: "bg-gray-50 text-gray-600 border border-gray-200",
            C: "bg-blue-50 text-blue-600 border border-blue-100",
            B: "bg-green-50 text-green-600 border border-green-100",
            A: "bg-red-50 text-red-600 border border-red-100",
            S: "bg-amber-50 text-amber-600 border border-amber-200",
            Beginner: "bg-gray-50 text-gray-600 border border-gray-200",
            "مبتدئ": "bg-gray-50 text-gray-600 border border-gray-200",
            Intermediate: "bg-blue-50 text-blue-600 border border-blue-100",
            "متوسط": "bg-blue-50 text-blue-600 border border-blue-100",
            Advanced: "bg-green-50 text-green-600 border border-green-100",
            "متقدم": "bg-green-50 text-green-600 border border-green-100",
            Professional: "bg-red-50 text-red-600 border border-red-100",
            "محترف": "bg-red-50 text-red-600 border border-red-100",
            Elite: "bg-amber-50 text-amber-600 border border-amber-200",
            "نخبة": "bg-amber-50 text-amber-600 border border-amber-200",
        };
        return colors[r] || "bg-gray-50 text-gray-600 border border-gray-200";
    };

    const getRankLabel = (rank) => {
        if (!rank) return isArabic ? "مبتدئ" : "Beginner";
        const r = rank.toString().trim();
        const translations = {
            ar: {
                D: "مبتدئ",
                Beginner: "مبتدئ",
                "مبتدئ": "مبتدئ",
                C: "متوسط",
                Intermediate: "متوسط",
                "متوسط": "متوسط",
                B: "متقدم",
                Advanced: "متقدم",
                "متقدم": "متقدم",
                A: "محترف",
                Professional: "محترف",
                "محترف": "محترف",
                S: "نخبة",
                Elite: "نخبة",
                "نخبة": "نخبة",
            },
            en: {
                D: "Beginner",
                Beginner: "Beginner",
                "مبتدئ": "Beginner",
                C: "Intermediate",
                Intermediate: "Intermediate",
                "متوسط": "Intermediate",
                B: "Advanced",
                Advanced: "Advanced",
                "متقدم": "Advanced",
                A: "Professional",
                Professional: "Professional",
                "محترف": "Professional",
                S: "Elite",
                Elite: "Elite",
                "نخبة": "Elite",
            }
        };
        const langKey = isArabic ? 'ar' : 'en';
        return translations[langKey][r] || r;
    };

    return (

        <div
            className="bg-white min-h-screen"
            dir={isArabic ? "rtl" : "ltr"}
        >

            {/* HERO */}

            <section
                className="border-b border-gray-200 py-20 px-6 relative overflow-hidden"
                style={{ backgroundColor: '#F8FAF8' }}
            >

                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">

                    <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />

                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto text-center relative">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >

                        <span className="section-label mb-6">

                            <Icon
                                icon="mdi:trophy"
                                className="w-3.5 h-3.5"
                            />

                            {isArabic
                                ? "أفضل اللاعبين"
                                : "Top Players"}

                        </span>

                        <h1 className={`font-display font-black text-primary mt-6 mb-4 ${
                            isArabic
                                ? "font-arabic text-4xl md:text-5xl"
                                : "text-5xl md:text-6xl"
                        }`}>

                            {isArabic
                                ? "مجتمع لاعبي آيس"
                                : "Ace Players Community"}

                        </h1>

                        <p className={`text-gray-500 max-w-2xl mx-auto ${
                            isArabic ? "font-arabic" : ""
                        }`}>

                            {isArabic
                                ? "اكتشف أفضل لاعبي آيس بادل، تابع التصنيفات والإنجازات وابحث عن اللاعبين بسهولة."
                                : "Discover Ace Padel’s best players, rankings, achievements, and search the community with ease."}

                        </p>

                        <div className="flex justify-center gap-8 mt-10 flex-wrap">

                            <div>

                                <div className="text-3xl font-black text-primary">
                                    {players.total}
                                </div>

                                <div className="text-sm text-gray-400">
                                    {isArabic ? "لاعب" : "Players"}
                                </div>
                            </div>

                            <div>

                                <div className="text-3xl font-black text-primary">
                                    {topPlayers.length}
                                </div>

                                <div className="text-sm text-gray-400">
                                    {isArabic ? "مصنف" : "Ranked"}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* TOP PLAYERS */}

            {showTopPlayers && (

                <section className="py-20 px-6">

                    <div className="max-w-7xl mx-auto">

                        <FadeIn>

                            <div className="flex items-center gap-3 mb-10">

                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">

                                    <Icon
                                        icon="mdi:podium-gold"
                                        className="w-6 h-6 text-primary"
                                    />
                                </div>

                                <div>

                                    <h2 className={`font-black text-primary text-3xl ${
                                        isArabic ? "font-arabic" : ""
                                    }`}>

                                        {isArabic
                                            ? "أفضل 5 لاعبين"
                                            : "Top 5 Players"}

                                    </h2>

                                    <p className={`text-gray-500 ${
                                        isArabic ? "font-arabic" : ""
                                    }`}>

                                        {isArabic
                                            ? "أعلى اللاعبين تصنيفاً ونقاطاً"
                                            : "Highest ranked players"}

                                    </p>
                                </div>
                            </div>
                        </FadeIn>

                        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">

                            {topPlayers.map((player, index) => (

                                <FadeIn
                                    key={player.id}
                                    delay={index * 0.05}
                                >

                                    <motion.div
                                        whileHover={{
                                            y: -8,
                                            scale: 1.02
                                        }}
                                        onClick={() => setSelectedPlayer(player)}
                                        className={`bg-white rounded-[28px] border overflow-hidden transition-all duration-300 relative cursor-pointer ${
                                            index === 0
                                                ? "border-yellow-300 shadow-2xl"
                                                : "border-gray-100 shadow-card hover:shadow-card-hover"
                                        }`}
                                    >

                                        {index === 0 && (

                                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent pointer-events-none" />
                                        )}

                                        <div className="relative p-8 text-center">

                                            {index === 0 && (

                                                <div className="absolute top-4 right-4">

                                                    <Icon
                                                        icon="mdi:crown"
                                                        className="w-7 h-7 text-yellow-500"
                                                    />
                                                </div>
                                            )}

                                            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-5 bg-gray-100 border-4 border-primary/10">

                                                {player.image_path ? (

                                                    <img
                                                        src={resolveAsset(`/storage/${player.image_path}`)}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />

                                                ) : (

                                                    <div className="w-full h-full flex items-center justify-center">

                                                        <Icon
                                                            icon="mdi:account"
                                                            className="w-10 h-10 text-gray-400"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-sm text-gray-400 mb-2">
                                                #{index + 1}
                                            </div>

                                            <h3 className="font-bold text-primary text-lg">
                                                {player.name}
                                            </h3>

                                            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold mt-4 ${
                                                rankColor(player.player_profile?.rank_level)
                                            }`}>

                                                {getRankLabel(player.player_profile?.rank_level)}
                                            </div>

                                            <div className="mt-5 flex justify-center gap-6">

                                                <div>

                                                    <div className="font-black text-primary text-xl">
                                                        {player.player_profile?.points || 0}
                                                    </div>

                                                    <div className="text-xs text-gray-400">
                                                        {isArabic ? "نقطة" : "Points"}
                                                    </div>
                                                </div>

                                                <div>

                                                    <div className="font-black text-primary text-xl">
                                                        {player.player_profile?.matches_won || 0}
                                                    </div>

                                                    <div className="text-xs text-gray-400">
                                                        {isArabic ? "فوز" : "Wins"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* SEARCH */}

            <section className="px-6 pb-14">

                <div className="max-w-7xl mx-auto">

                    <FadeIn>

                        <div className="relative overflow-hidden rounded-[32px] border border-primary/10 bg-gradient-to-br from-[#F8FAF8] via-white to-primary/[0.03] shadow-card">

                            <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative p-6 md:p-8">

                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">

                                    <div>

                                        <div className="flex items-center gap-3 mb-3">

                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">

                                                <Icon
                                                    icon="mdi:account-search"
                                                    className="w-6 h-6 text-primary"
                                                />
                                            </div>

                                            <div>

                                                <h2 className={`font-black text-primary text-2xl ${
                                                    isArabic ? "font-arabic" : ""
                                                }`}>

                                                    {isArabic
                                                        ? "استكشف اللاعبين"
                                                        : "Explore Players"}

                                                </h2>

                                                <p className={`text-gray-500 text-sm ${
                                                    isArabic ? "font-arabic" : ""
                                                }`}>

                                                    {isArabic
                                                        ? "ابحث عن اللاعبين حسب الاسم أو المستوى"
                                                        : "Search by player name or ranking level"}

                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 flex-wrap">

                                        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm">

                                            <div className="text-primary font-black text-2xl">
                                                {players.total}
                                            </div>

                                            <div className="text-xs text-gray-400">
                                                {isArabic ? "إجمالي اللاعبين" : "Total Players"}
                                            </div>
                                        </div>

                                        {search && (

                                            <div className="bg-primary text-white rounded-2xl px-5 py-3">

                                                <div className="text-sm opacity-80">
                                                    {isArabic ? "البحث الحالي" : "Current Search"}
                                                </div>

                                                <div className="font-bold">
                                                    "{search}"
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="relative">

                                    <div className={`absolute top-1/2 -translate-y-1/2 z-10 ${
                                        isArabic ? "right-5" : "left-5"
                                    }`}>

                                        {searching ? (

                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 1,
                                                    ease: "linear"
                                                }}
                                            >

                                                <Icon
                                                    icon="mdi:loading"
                                                    className="w-6 h-6 text-primary"
                                                />
                                            </motion.div>

                                        ) : (

                                            <Icon
                                                icon="mdi:magnify"
                                                className="w-6 h-6 text-gray-400"
                                            />
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={handleSearch}
                                        placeholder={
                                            isArabic
                                                ? "ابحث عن لاعب، مستوى، أو رقم هاتف..."
                                                : "Search by player, level, or phone number..."
                                        }
                                        className={`w-full h-[72px] rounded-[24px] border border-gray-200 bg-white/80 backdrop-blur-xl shadow-inner transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-[15px] ${
                                            isArabic
                                                ? "pr-14 pl-36 text-right font-arabic"
                                                : "pl-14 pr-36"
                                        }`}
                                    />

                                    {search && (

                                        <button
                                            onClick={clearSearch}
                                            className={`absolute top-1/2 -translate-y-1/2 h-11 px-5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all text-sm font-medium text-gray-600 ${
                                                isArabic ? "left-4" : "right-4"
                                            }`}
                                        >

                                            <div className="flex items-center gap-2">

                                                <Icon
                                                    icon="mdi:close"
                                                    className="w-4 h-4"
                                                />

                                                {isArabic ? "مسح" : "Clear"}
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                    </FadeIn>
                </div>
            </section>

            {/* PLAYERS GRID */}

            <section className="px-6 pb-24">

                <div className="max-w-7xl mx-auto">

                    {players.data.length === 0 ? (

                        <FadeIn>

                            <div className="text-center py-24">

                                <div className="w-28 h-28 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-8">

                                    <Icon
                                        icon="mdi:account-search"
                                        className="w-14 h-14 text-primary"
                                    />
                                </div>

                                <h3 className={`text-3xl font-black text-primary mb-4 ${
                                    isArabic ? "font-arabic" : ""
                                }`}>

                                    {isArabic
                                        ? "لم يتم العثور على لاعبين"
                                        : "No Players Found"}

                                </h3>

                                <p className={`text-gray-400 max-w-md mx-auto ${
                                    isArabic ? "font-arabic" : ""
                                }`}>

                                    {isArabic
                                        ? "جرّب البحث باسم مختلف أو مستوى آخر."
                                        : "Try searching with another player name or ranking level."}

                                </p>
                            </div>

                        </FadeIn>

                    ) : (

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                            {players.data.map((player, index) => (

                                <FadeIn
                                    key={player.id}
                                    delay={index * 0.03}
                                >

                                    <motion.div
                                        whileHover={{
                                            y: -6,
                                            scale: 1.02
                                        }}
                                        onClick={() => setSelectedPlayer(player)}
                                        className="bg-white rounded-[28px] border border-gray-100 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
                                    >

                                        <div className="p-7">

                                            <div className="flex items-center gap-4 mb-6">

                                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100">

                                                    {player.image_path ? (

                                                        <img
                                                            src={resolveAsset(`/storage/${player.image_path}`)}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                        />

                                                    ) : (

                                                        <div className="w-full h-full flex items-center justify-center">

                                                            <Icon
                                                                icon="mdi:account"
                                                                className="w-8 h-8 text-gray-400"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div>

                                                    <h3 className="font-bold text-primary">
                                                        {player.name}
                                                    </h3>

                                                    <p className="text-sm text-gray-400">
                                                        {player.phone}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold mb-6 ${
                                                rankColor(player.player_profile?.rank_level)
                                            }`}>

                                                {getRankLabel(player.player_profile?.rank_level)}
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 text-center">

                                                <div>

                                                    <div className="font-black text-primary text-xl">
                                                        {player.player_profile?.points || 0}
                                                    </div>

                                                    <div className="text-xs text-gray-400">
                                                        {isArabic ? "النقاط" : "Points"}
                                                    </div>
                                                </div>

                                                <div>

                                                    <div className="font-black text-primary text-xl">
                                                        {player.player_profile?.matches_played || 0}
                                                    </div>

                                                    <div className="text-xs text-gray-400">
                                                        {isArabic ? "المباريات" : "Matches"}
                                                    </div>
                                                </div>

                                                <div>

                                                    <div className="font-black text-primary text-xl">
                                                        {player.player_profile?.matches_won || 0}
                                                    </div>

                                                    <div className="text-xs text-gray-400">
                                                        {isArabic ? "الفوز" : "Wins"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                </FadeIn>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* PLAYER DETAIL MODAL */}
            <AnimatePresence>
                {selectedPlayer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPlayer(null)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl relative border border-gray-100 flex flex-col max-h-[85vh]"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedPlayer(null)}
                                className={`absolute top-6 ${isArabic ? "left-6" : "right-6"} text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full p-2 transition-all z-10`}
                            >
                                <Icon icon="mdi:close" className="w-6 h-6" />
                            </button>

                            {/* Modal Content Container (Scrollable) */}
                            <div className="overflow-y-auto p-8 md:p-10 custom-scrollbar">
                                {/* Profile Header */}
                                <div className="text-center pb-8 border-b border-gray-100">
                                    <div className="relative inline-block">
                                        <div className="w-28 h-28 rounded-full overflow-hidden mx-auto bg-gray-50 border-4 border-primary/10">
                                            {selectedPlayer.image_path ? (
                                                <img
                                                    src={resolveAsset(`/storage/${selectedPlayer.image_path}`)}
                                                    className="w-full h-full object-cover"
                                                    alt={selectedPlayer.name}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                    <Icon
                                                        icon="mdi:account"
                                                        className="w-14 h-14 text-gray-400"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className={`font-black text-primary text-2xl mt-4 ${isArabic ? "font-arabic" : ""}`}>
                                        {selectedPlayer.name}
                                    </h3>
                                    
                                    {selectedPlayer.phone && (
                                        <p className="text-sm text-gray-400 mt-1">{selectedPlayer.phone}</p>
                                    )}

                                    <div className="mt-4">
                                        <span className={`inline-flex px-4 py-1.5 rounded-full text-xs font-bold ${rankColor(selectedPlayer.player_profile?.rank_level)} ${isArabic ? "font-arabic" : ""}`}>
                                            {isArabic ? "المستوى" : "Level"}: {getRankLabel(selectedPlayer.player_profile?.rank_level)}
                                        </span>
                                    </div>
                                </div>

                                {/* Stats Section */}
                                <div className="py-8">
                                    <h4 className={`text-gray-900 font-bold text-lg mb-6 ${isArabic ? "font-arabic text-right" : "text-left"}`}>
                                        {isArabic ? "الإحصائيات الشخصية" : "Personal Statistics"}
                                    </h4>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {/* Points */}
                                        <div className="bg-[#F8FAF8] rounded-2xl p-5 border border-primary/5 text-center flex flex-col items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                                <Icon icon="mdi:stars" className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="font-black text-2xl text-primary leading-none">
                                                {selectedPlayer.player_profile?.points || 0}
                                            </div>
                                            <div className={`text-xs text-gray-400 mt-2 font-medium ${isArabic ? "font-arabic" : ""}`}>
                                                {isArabic ? "النقاط" : "Points"}
                                            </div>
                                        </div>

                                        {/* Matches */}
                                        <div className="bg-[#F8FAF8] rounded-2xl p-5 border border-primary/5 text-center flex flex-col items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                                                <Icon icon="mdi:sports-tennis" className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div className="font-black text-2xl text-gray-800 leading-none">
                                                {selectedPlayer.player_profile?.matches_played || 0}
                                            </div>
                                            <div className={`text-xs text-gray-400 mt-2 font-medium ${isArabic ? "font-arabic" : ""}`}>
                                                {isArabic ? "المباريات" : "Matches"}
                                            </div>
                                        </div>

                                        {/* Wins */}
                                        <div className="bg-[#F8FAF8] rounded-2xl p-5 border border-primary/5 text-center flex flex-col items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
                                                <Icon icon="mdi:trophy" className="w-5 h-5 text-green-500" />
                                            </div>
                                            <div className="font-black text-2xl text-gray-800 leading-none">
                                                {selectedPlayer.player_profile?.matches_won || 0}
                                            </div>
                                            <div className={`text-xs text-gray-400 mt-2 font-medium ${isArabic ? "font-arabic" : ""}`}>
                                                {isArabic ? "الفوز" : "Wins"}
                                            </div>
                                        </div>

                                        {/* Win Rate */}
                                        <div className="bg-[#F8FAF8] rounded-2xl p-5 border border-primary/5 text-center flex flex-col items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-3">
                                                <Icon icon="mdi:percent" className="w-5 h-5 text-orange-500" />
                                            </div>
                                            <div className="font-black text-2xl text-gray-800 leading-none">
                                                {selectedPlayer.player_profile?.matches_played > 0
                                                    ? ((selectedPlayer.player_profile.matches_won / selectedPlayer.player_profile.matches_played) * 100).toFixed(0)
                                                    : 0}%
                                            </div>
                                            <div className={`text-xs text-gray-400 mt-2 font-medium ${isArabic ? "font-arabic" : ""}`}>
                                                {isArabic ? "نسبة الفوز" : "Win Rate"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Event Registrations Section */}
                                <div className="pt-4">
                                    <h4 className={`text-gray-900 font-bold text-lg mb-6 ${isArabic ? "font-arabic text-right" : "text-left"}`}>
                                        {isArabic ? "البطولات والفعاليات" : "Tournaments & Events"}
                                    </h4>

                                    {selectedPlayer.event_registrations && selectedPlayer.event_registrations.length > 0 ? (
                                        <div className="space-y-4">
                                            {selectedPlayer.event_registrations.map((reg) => {
                                                if (!reg.event) return null;
                                                const eventTitle = isArabic ? reg.event.title_ar : reg.event.title_en;
                                                const eventDate = reg.event.date ? new Date(reg.event.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : (isArabic ? 'غير محدد' : 'Not set');
                                                
                                                // Localization for status
                                                const getStatusText = (status) => {
                                                    const map = {
                                                        pending: { ar: 'قيد الانتظار', en: 'Pending' },
                                                        approved: { ar: 'مقبول', en: 'Approved' },
                                                        rejected: { ar: 'مرفوض', en: 'Rejected' },
                                                    };
                                                    const s = map[status?.toLowerCase()];
                                                    return s ? (isArabic ? s.ar : s.en) : status;
                                                };

                                                const getStatusColor = (status) => {
                                                    const map = {
                                                        pending: 'bg-yellow-50 text-yellow-600 border border-yellow-100',
                                                        approved: 'bg-green-50 text-green-600 border border-green-100',
                                                        rejected: 'bg-red-50 text-red-600 border border-red-100',
                                                    };
                                                    return map[status?.toLowerCase()] || 'bg-gray-50 text-gray-500';
                                                };

                                                const getPlacementLabel = (placement) => {
                                                    if (!placement) return null;
                                                    const p = parseInt(placement, 10);
                                                    if (p === 1) return isArabic ? 'المركز الأول 🥇' : '1st Place 🥇';
                                                    if (p === 2) return isArabic ? 'المركز الثاني 🥈' : '2nd Place 🥈';
                                                    if (p === 3) return isArabic ? 'المركز الثالث 🥉' : '3rd Place 🥉';
                                                    return isArabic ? `المركز ${p}` : `Rank ${p}`;
                                                };

                                                return (
                                                    <div
                                                        key={reg.id}
                                                        className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                                                                <Icon icon="mdi:trophy-outline" className="w-6 h-6 text-primary" />
                                                            </div>
                                                            <div>
                                                                <h5 className={`font-bold text-gray-900 ${isArabic ? "font-arabic" : ""}`}>
                                                                    {eventTitle}
                                                                </h5>
                                                                <p className={`text-xs text-gray-400 mt-1 flex items-center gap-1.5 ${isArabic ? "font-arabic" : ""}`}>
                                                                    <Icon icon="mdi:calendar-range" className="w-3.5 h-3.5 text-gray-400" />
                                                                    {eventDate}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${getStatusColor(reg.status)} ${isArabic ? "font-arabic" : ""}`}>
                                                                {getStatusText(reg.status)}
                                                            </span>
                                                            {reg.placement && (
                                                                <span className={`inline-flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 ${isArabic ? "font-arabic" : ""}`}>
                                                                    <Icon icon="mdi:medal" className="w-4 h-4 text-orange-400" />
                                                                    {getPlacementLabel(reg.placement)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                            <Icon icon="mdi:trophy-off-outline" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className={`text-sm text-gray-400 ${isArabic ? "font-arabic" : ""}`}>
                                                {isArabic ? "لم يشارك هذا اللاعب في أي بطولات بعد." : "This player hasn't participated in any tournaments yet."}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

Players.layout = page => <AppLayout children={page} />;