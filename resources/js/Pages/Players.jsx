import AppLayout, { LangContext } from '../Layouts/AppLayout';
import { motion, useInView } from "framer-motion";
import { useRef, useContext, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { router } from "@inertiajs/react";
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

        const colors = {
            Beginner: "bg-gray-100 text-gray-700",
            D: "bg-blue-100 text-blue-700",
            C: "bg-green-100 text-green-700",
            B: "bg-yellow-100 text-yellow-700",
            A: "bg-red-100 text-red-700",
        };

        return colors[rank] || "bg-gray-100 text-gray-700";
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
                                        className={`bg-white rounded-[28px] border overflow-hidden transition-all duration-300 relative ${
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
                                                        src={`/storage/${player.image_path}`}
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

                                                {player.player_profile?.rank_level}
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
                                        className="bg-white rounded-[28px] border border-gray-100 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
                                    >

                                        <div className="p-7">

                                            <div className="flex items-center gap-4 mb-6">

                                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100">

                                                    {player.image_path ? (

                                                        <img
                                                            src={`/storage/${player.image_path}`}
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

                                                {player.player_profile?.rank_level}
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
        </div>
    );
}

Players.layout = page => <AppLayout children={page} />;