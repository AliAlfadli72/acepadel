import AppLayout, { LangContext } from '../Layouts/AppLayout';
import { motion, AnimatePresence } from "framer-motion";
import { useContext, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { router, usePage } from "@inertiajs/react";
import { resolveAsset } from '../utils';

// Animated Counter Component using English/Latin numerals
function AnimatedCounter({ value }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = parseInt(value, 10) || 0;
        if (end === 0) {
            setCount(0);
            return;
        }
        const duration = 0.8; // 0.8 seconds
        const stepTime = 16; // ~60fps
        const totalSteps = Math.ceil((duration * 1000) / stepTime);
        const increment = end / totalSteps;
        let currentStep = 0;
        
        const timer = setInterval(() => {
            currentStep++;
            if (currentStep >= totalSteps) {
                setCount(end);
                clearInterval(timer);
            } else {
                start += increment;
                setCount(Math.floor(start));
            }
        }, stepTime);
        
        return () => clearInterval(timer);
    }, [value]);
    
    return <span>{count.toLocaleString('en-US')}</span>;
}

// Circular SVG Progress Ring Component (English digits)
function CircularProgress({ percentage }) {
    const pct = Math.min(100, Math.max(0, parseInt(percentage, 10) || 0));
    const radius = 32;
    const strokeWidth = 6;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (pct / 100) * circumference;
    
    return (
        <div className="relative inline-flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
                {/* Background Ring */}
                <circle
                    className="text-slate-100"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="40"
                    cy="40"
                />
                {/* Foreground Ring */}
                <circle
                    className="text-[#CCFF00] stroke-[6px]"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="#CCFF00"
                    fill="transparent"
                    r={radius}
                    cx="40"
                    cy="40"
                />
            </svg>
            <span className="absolute text-sm font-black text-[#1E293B] font-mono">
                {pct}%
            </span>
        </div>
    );
}

export default function Players({
    players,
    allPlayers = [],
    topPlayers,
    showTopPlayers,
    filters
}) {
    const { lang } = useContext(LangContext);
    const isArabic = lang === "ar";

    const [search, setSearch] = useState(filters.search || '');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    // Live Client-Side Search Filter (0ms reload lag)
    useEffect(() => {
        if (!search.trim()) {
            setSearchResults([]);
            setSearching(false);
            return;
        }

        setSearching(true);
        const delayDebounce = setTimeout(() => {
            const clean = search.trim().toLowerCase();
            
            // Limit rank level matches to explicit search keywords/codes or prefixes (>= 3 chars)
            // to avoid partial text matching like "te" incorrectly mapping to "intermediate" or "elite"
            const rankKeywords = [
                'elite', 'professional', 'advanced', 'intermediate', 'beginner',
                'نخبة', 'محترف', 'متقدم', 'متوسط', 'مبتدئ',
                'el', 'pr', 'ad', 'in', 'bg'
            ];
            
            const isRankSearch = rankKeywords.some(keyword => 
                keyword === clean || (clean.length >= 3 && keyword.startsWith(clean))
            );

            const rankMap = {
                'نخبة': 'elite',
                'محترف': 'professional',
                'متقدم': 'advanced',
                'متوسط': 'intermediate',
                'مبتدئ': 'beginner',
            };
            const englishRank = rankMap[clean] || clean;

            const filtered = (allPlayers || []).filter(player => {
                const nameMatch = player.name.toLowerCase().includes(clean);
                const phoneMatch = player.phone && player.phone.includes(clean);
                
                let rankMatch = false;
                if (isRankSearch) {
                    const rankLevel = (player.player_profile?.rank_level || '').toLowerCase();
                    rankMatch = rankLevel.includes(englishRank) ||
                                      getRankLabel(rankLevel).toLowerCase().includes(clean) ||
                                      getRankCode(rankLevel).toLowerCase().includes(clean);
                }
                
                return nameMatch || phoneMatch || rankMatch;
            });

            setSearchResults(filtered);
            setSearching(false);
        }, 150);

        return () => clearTimeout(delayDebounce);
    }, [search, allPlayers]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const clearSearch = () => {
        setSearch('');
    };

    // Rank border coloring helper
    const avatarBorderColor = (rank) => {
        if (!rank) return "border-slate-200";
        const r = rank.toString().trim().toLowerCase();
        const borders = {
            d: "border-slate-200",
            beginner: "border-slate-200",
            "مبتدئ": "border-slate-200",
            c: "border-blue-300",
            intermediate: "border-blue-300",
            "متوسط": "border-blue-300",
            b: "border-emerald-300",
            advanced: "border-emerald-300",
            "متقدم": "border-emerald-300",
            a: "border-rose-300",
            professional: "border-rose-300",
            "محترف": "border-rose-300",
            s: "border-[#CCFF00] ring-4 ring-[#CCFF00]/15",
            elite: "border-[#CCFF00] ring-4 ring-[#CCFF00]/15",
            "نخبة": "border-[#CCFF00] ring-4 ring-[#CCFF00]/15",
        };
        return borders[r] || "border-slate-200";
    };

    // Rank badge backgrounds helper
    const rankBadgeColor = (rank) => {
        if (!rank) return "bg-slate-100 text-slate-600";
        const r = rank.toString().trim().toLowerCase();
        const bgColors = {
            d: "bg-slate-100 text-slate-600",
            beginner: "bg-slate-100 text-slate-600",
            "مبتدئ": "bg-slate-100 text-slate-600",
            c: "bg-blue-50 text-blue-600 border border-blue-100",
            intermediate: "bg-blue-50 text-blue-600 border border-blue-100",
            "متوسط": "bg-blue-50 text-blue-600 border border-blue-100",
            b: "bg-emerald-50 text-emerald-600 border border-emerald-100",
            advanced: "bg-emerald-50 text-emerald-600 border border-emerald-100",
            "متقدم": "bg-emerald-50 text-emerald-600 border border-emerald-100",
            a: "bg-rose-50 text-rose-600 border border-rose-100",
            professional: "bg-rose-50 text-rose-600 border border-rose-100",
            "محترف": "bg-rose-50 text-rose-600 border border-rose-100",
            s: "bg-[#CCFF00]/15 text-[#1E293B] border border-[#CCFF00]/30",
            elite: "bg-[#CCFF00]/15 text-[#1E293B] border border-[#CCFF00]/30",
            "نخبة": "bg-[#CCFF00]/15 text-[#1E293B] border border-[#CCFF00]/30",
        };
        return bgColors[r] || "bg-slate-100 text-slate-600";
    };

    // Hover dynamic classes
    const rankHoverColorClass = (rank) => {
        if (!rank) return "hover:border-slate-350 hover:shadow-[0_15px_30px_-10px_rgba(148,163,184,0.15)]";
        const r = rank.toString().trim().toLowerCase();
        const classes = {
            d: "hover:border-slate-300 hover:shadow-[0_15px_30px_-10px_rgba(148,163,184,0.15)]",
            beginner: "hover:border-slate-300 hover:shadow-[0_15px_30px_-10px_rgba(148,163,184,0.15)]",
            "مبتدئ": "hover:border-slate-300 hover:shadow-[0_15px_30px_-10px_rgba(148,163,184,0.15)]",
            c: "hover:border-blue-300 hover:shadow-[0_15px_30px_-10px_rgba(147,197,253,0.15)]",
            intermediate: "hover:border-blue-300 hover:shadow-[0_15px_30px_-10px_rgba(147,197,253,0.15)]",
            "متوسط": "hover:border-blue-300 hover:shadow-[0_15px_30px_-10px_rgba(147,197,253,0.15)]",
            b: "hover:border-emerald-300 hover:shadow-[0_15px_30px_-10px_rgba(110,231,183,0.15)]",
            advanced: "hover:border-emerald-300 hover:shadow-[0_15px_30px_-10px_rgba(110,231,183,0.15)]",
            "متقدم": "hover:border-emerald-300 hover:shadow-[0_15px_30px_-10px_rgba(110,231,183,0.15)]",
            a: "hover:border-rose-300 hover:shadow-[0_15px_30px_-10px_rgba(252,165,165,0.15)]",
            professional: "hover:border-rose-300 hover:shadow-[0_15px_30px_-10px_rgba(252,165,165,0.15)]",
            "محترف": "hover:border-rose-300 hover:shadow-[0_15px_30px_-10px_rgba(252,165,165,0.15)]",
            s: "hover:border-[#CCFF00] hover:shadow-[0_15px_30px_-10px_rgba(204,255,0,0.25)]",
            elite: "hover:border-[#CCFF00] hover:shadow-[0_15px_30px_-10px_rgba(204,255,0,0.25)]",
            "نخبة": "hover:border-[#CCFF00] hover:shadow-[0_15px_30px_-10px_rgba(204,255,0,0.25)]",
        };
        return classes[r] || "hover:border-slate-350 hover:shadow-[0_15px_30px_-10px_rgba(148,163,184,0.15)]";
    };

    const getRankLabel = (rank) => {
        if (!rank) return isArabic ? "مبتدئ" : "Beginner";
        const r = rank.toString().trim();
        const translations = {
            ar: {
                D: "مبتدئ", Beginner: "مبتدئ", "مبتدئ": "مبتدئ",
                C: "متوسط", Intermediate: "متوسط", "متوسط": "متوسط",
                B: "متقدم", Advanced: "متقدم", "متقدم": "متقدم",
                A: "محترف", Professional: "محترف", "محترف": "محترف",
                S: "نخبة", Elite: "نخبة", "نخبة": "نخبة",
            },
            en: {
                D: "Beginner", Beginner: "Beginner", "مبتدئ": "Beginner",
                C: "Intermediate", Intermediate: "Intermediate", "متوسط": "Intermediate",
                B: "Advanced", Advanced: "Advanced", "متقدم": "Advanced",
                A: "Professional", Professional: "Professional", "محترف": "Professional",
                S: "Elite", Elite: "Elite", "نخبة": "Elite",
            }
        };
        const langKey = isArabic ? 'ar' : 'en';
        return translations[langKey][r] || r;
    };

    const getRankCode = (rank) => {
        if (!rank) return "BG";
        const r = rank.toString().trim().toLowerCase();
        const codes = {
            d: "BG", beginner: "BG", "مبتدئ": "BG",
            c: "IN", intermediate: "IN", "متوسط": "IN",
            b: "AD", advanced: "AD", "متقدم": "AD",
            a: "PR", professional: "PR", "محترف": "PR",
            s: "EL", elite: "EL", "نخبة": "EL",
        };
        return codes[r] || "BG";
    };

    // Quick filter configurations
    const quickFilters = [
        { key: "All", ar: "الكل", en: "All", val: "" },
        { key: "Elite", ar: "نخبة", en: "Elite", val: isArabic ? "نخبة" : "Elite" },
        { key: "Intermediate", ar: "متوسط", en: "Intermediate", val: isArabic ? "متوسط" : "Intermediate" },
        { key: "Beginner", ar: "مبتدئ", en: "Beginner", val: isArabic ? "مبتدئ" : "Beginner" }
    ];

    // Select exactly 3 unique suggestions from players.data that are not in the top 3
    const topThreeIds = new Set(topPlayers.slice(0, 3).map(p => p.id));
    let suggestedPlayers = players.data.filter(p => !topThreeIds.has(p.id)).slice(0, 3);
    if (suggestedPlayers.length < 3) {
        const remaining = players.data.filter(p => !suggestedPlayers.some(sp => sp.id === p.id)).slice(0, 3 - suggestedPlayers.length);
        suggestedPlayers = [...suggestedPlayers, ...remaining].slice(0, 3);
    }

    // Splitting Top 3 players
    const championPlayer = topPlayers[0];
    const secondPlayer = topPlayers[1];
    const thirdPlayer = topPlayers[2];



    // Stagger entrance transitions
    const pageContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12
            }
        }
    };

    const sectionEntrance = {
        hidden: { opacity: 0, y: 30 },
        show: { 
            opacity: 1, 
            y: 0,
            transition: { type: "spring", stiffness: 80, damping: 16 }
        }
    };

    // Custom cubic-bezier timing transitions
    const smoothTransition = "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)";

    return (
        <div className="bg-[#F8FAF8] text-[#1E293B] min-h-screen" dir={isArabic ? "rtl" : "ltr"}>
            {/* HERO SECTION */}
            <section className="bg-gradient-to-b from-white to-[#F8FAF8] border-b border-slate-100 pt-32 pb-12 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000001_1px,transparent_1px),linear-gradient(to_bottom,#00000001_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                <div className="absolute top-10 left-10 w-72 h-72 bg-[#CCFF00]/5 rounded-full blur-3xl" />
                
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-full text-xs font-black uppercase tracking-widest text-[#1E293B] mb-5">
                            <Icon icon="solar:ranking-linear" className="w-4 h-4 text-[#1E293B]" />
                            {isArabic ? "مجتمع آيس" : "ACE PLAYERS"}
                        </span>
                        
                        <h1 className={`font-black text-[#1E293B] uppercase tracking-tighter leading-none mb-5 text-4xl md:text-6xl ${isArabic ? "font-arabic" : "font-display"}`}>
                            {isArabic ? "مجتمع لاعبي آيس" : "Ace Players Community"}
                        </h1>
                    </motion.div>
                </div>
            </section>

            {/* STAGGERED LAYOUT */}
            <motion.div 
                variants={pageContainer}
                initial="hidden"
                animate="show"
                className="max-w-7xl mx-auto px-6 pb-24"
            >
                {/* 1. THE TOP 3 PODIUM GRID SECTION */}
                {showTopPlayers && topPlayers.length > 0 && (
                    <motion.div variants={sectionEntrance} className="py-12">
                        <div className="text-center mb-10">
                            <h2 className={`font-black text-[#1E293B] text-3xl uppercase tracking-tight ${isArabic ? "font-arabic" : "font-display"}`}>
                                {isArabic ? "أفضل 3 لاعبين" : "Top 3 Players"}
                            </h2>
                            <p className="text-slate-400 font-medium text-sm mt-1">
                                {isArabic ? "أبطال الأكاديمية المتصدرين للأسبوع" : "The leading champions of the academy this week"}
                            </p>
                        </div>

                        {/* Podium Container - Mobile: swipe layout (Champion first), Desktop: stepped flanking */}
                        <div className="flex flex-row items-end justify-start lg:justify-center gap-6 lg:gap-8 overflow-x-auto lg:overflow-x-visible pb-10 pt-6 snap-x snap-mandatory scrollbar-none max-w-full lg:max-w-5xl mx-auto">
                            
                            {/* SECOND PLACE CARD */}
                            {secondPlayer && (
                                <div className="order-2 lg:order-1 flex flex-col items-center snap-center shrink-0 w-[280px] lg:w-[290px]">
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        onClick={() => setSelectedPlayer(secondPlayer)}
                                        style={{ transition: smoothTransition }}
                                        className="w-full bg-white rounded-[32px] border border-slate-100 p-6 flex flex-col justify-between relative cursor-pointer h-[380px] lg:h-[415px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:bg-slate-50/50"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-4xl font-mono font-black text-slate-100 select-none">#02</span>
                                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                                                <Icon icon="solar:star-bold" className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{isArabic ? "المركز الثاني" : "RUNNER-UP"}</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col justify-center items-center">
                                            <div className="relative w-20 h-20 mb-4">
                                                <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-slate-200 p-0.5 flex items-center justify-center bg-gradient-to-tr from-slate-300 via-slate-100 to-slate-400 shadow-[0_4px_12px_rgba(148,163,184,0.1)]">
                                                    {secondPlayer.image_path ? (
                                                        <img
                                                            src={resolveAsset(`/storage/${secondPlayer.image_path}`)}
                                                            className="w-full h-full object-cover rounded-full"
                                                            alt={secondPlayer.name}
                                                        />
                                                    ) : (
                                                        <Icon icon="solar:user-linear" className="w-10 h-10 text-slate-400" />
                                                    )}
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border border-white flex items-center justify-center text-[9px] font-black uppercase ${rankBadgeColor(secondPlayer.player_profile?.rank_level)} shadow-sm`}>
                                                    {getRankCode(secondPlayer.player_profile?.rank_level)}
                                                </div>
                                            </div>

                                            <h3 className="font-display font-black text-[#1E293B] text-lg tracking-tight uppercase truncate max-w-[200px] text-center mb-1">
                                                {secondPlayer.name}
                                            </h3>

                                            <div className={`inline-flex px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md ${rankBadgeColor(secondPlayer.player_profile?.rank_level)}`}>
                                                {getRankLabel(secondPlayer.player_profile?.rank_level)}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-center gap-8 border-t border-slate-100 pt-4">
                                            <div className="text-center">
                                                <div className="font-black text-[#1E293B] text-base leading-none font-mono">
                                                    <AnimatedCounter value={secondPlayer.player_profile?.points || 0} />
                                                </div>
                                                <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                                                    {isArabic ? "النقاط" : "Points"}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-black text-[#1E293B] text-base leading-none font-mono">
                                                    <AnimatedCounter value={secondPlayer.player_profile?.matches_won || 0} />
                                                </div>
                                                <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                                                    {isArabic ? "الفوز" : "Wins"}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <div className="bg-slate-200/30 blur-md rounded-full w-24 h-1.5 mt-3 pointer-events-none mx-auto hidden lg:block" />
                                </div>
                            )}

                            {/* CHAMPION CARD (#01) - CENTER PILLAR */}
                            {championPlayer && (
                                <div className="order-1 lg:order-2 flex flex-col items-center snap-center shrink-0 w-[290px] lg:w-[320px]">
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        onClick={() => setSelectedPlayer(championPlayer)}
                                        style={{ transition: smoothTransition }}
                                        className="w-full bg-white rounded-[32px] border border-slate-100 p-6 flex flex-col justify-between relative cursor-pointer h-[380px] lg:h-[450px] shadow-[0_15px_35px_rgba(245,158,11,0.06),0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_rgba(245,158,11,0.12)] hover:bg-slate-50/50"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-4xl font-mono font-black text-amber-200 select-none">#01</span>
                                            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/40 px-3 py-1 rounded-full">
                                                <Icon icon="solar:crown-bold" className="w-3.5 h-3.5 text-amber-500" />
                                                <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest leading-none mt-0.5">{isArabic ? "البطل" : "CHAMPION"}</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col justify-center items-center">
                                            <div className="relative w-24 h-24 mb-4">
                                                <Icon icon="solar:crown-bold" className="w-8 h-8 text-[#F59E0B] absolute -top-6 left-1/2 -translate-x-1/2 drop-shadow-[0_2px_4px_rgba(245,158,11,0.3)] z-10" />
                                                <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white p-0.5 flex items-center justify-center bg-gradient-to-tr from-amber-400 via-yellow-250 to-amber-500 shadow-[0_4px_15px_rgba(245,158,11,0.18)]">
                                                    {championPlayer.image_path ? (
                                                        <img
                                                            src={resolveAsset(`/storage/${championPlayer.image_path}`)}
                                                            className="w-full h-full object-cover rounded-full"
                                                            alt={championPlayer.name}
                                                        />
                                                    ) : (
                                                        <Icon icon="solar:user-linear" className="w-12 h-12 text-slate-400" />
                                                    )}
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border border-white flex items-center justify-center text-[9px] font-black uppercase ${rankBadgeColor(championPlayer.player_profile?.rank_level)} shadow-sm`}>
                                                    {getRankCode(championPlayer.player_profile?.rank_level)}
                                                </div>
                                            </div>

                                            <h3 className="font-display font-black text-[#1E293B] text-xl tracking-tight uppercase truncate max-w-[220px] text-center mb-1">
                                                {championPlayer.name}
                                            </h3>

                                            <div className={`inline-flex px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-md ${rankBadgeColor(championPlayer.player_profile?.rank_level)}`}>
                                                {getRankLabel(championPlayer.player_profile?.rank_level)}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-center gap-10 border-t border-slate-100 pt-4">
                                            <div className="text-center">
                                                <div className="font-black text-[#1E293B] text-lg leading-none font-mono">
                                                    <AnimatedCounter value={championPlayer.player_profile?.points || 0} />
                                                </div>
                                                <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                                                    {isArabic ? "النقاط" : "Points"}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-black text-[#1E293B] text-lg leading-none font-mono">
                                                    <AnimatedCounter value={championPlayer.player_profile?.matches_won || 0} />
                                                </div>
                                                <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                                                    {isArabic ? "الفوز" : "Wins"}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <div className="bg-amber-500/10 blur-md rounded-full w-28 h-1.5 mt-3 pointer-events-none mx-auto hidden lg:block" />
                                </div>
                            )}

                            {/* THIRD PLACE CARD */}
                            {thirdPlayer && (
                                <div className="order-3 lg:order-3 flex flex-col items-center snap-center shrink-0 w-[280px] lg:w-[290px]">
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        onClick={() => setSelectedPlayer(thirdPlayer)}
                                        style={{ transition: smoothTransition }}
                                        className="w-full bg-white rounded-[32px] border border-slate-100 p-6 flex flex-col justify-between relative cursor-pointer h-[380px] lg:h-[385px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:bg-slate-50/50"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-4xl font-mono font-black text-amber-100 select-none">#03</span>
                                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                                                <Icon icon="solar:star-bold" className="w-3.5 h-3.5 text-amber-700" />
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{isArabic ? "المركز الثالث" : "THIRD PLACE"}</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col justify-center items-center">
                                            <div className="relative w-20 h-20 mb-4">
                                                <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-slate-200 p-0.5 flex items-center justify-center bg-gradient-to-tr from-amber-700 via-amber-250 to-amber-800 shadow-[0_4px_12px_rgba(180,83,9,0.08)]">
                                                    {thirdPlayer.image_path ? (
                                                        <img
                                                            src={resolveAsset(`/storage/${thirdPlayer.image_path}`)}
                                                            className="w-full h-full object-cover rounded-full"
                                                            alt={thirdPlayer.name}
                                                        />
                                                    ) : (
                                                        <Icon icon="solar:user-linear" className="w-10 h-10 text-slate-400" />
                                                    )}
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border border-white flex items-center justify-center text-[9px] font-black uppercase ${rankBadgeColor(thirdPlayer.player_profile?.rank_level)} shadow-sm`}>
                                                    {getRankCode(thirdPlayer.player_profile?.rank_level)}
                                                </div>
                                            </div>

                                            <h3 className="font-display font-black text-[#1E293B] text-lg tracking-tight uppercase truncate max-w-[200px] text-center mb-1">
                                                {thirdPlayer.name}
                                            </h3>

                                            <div className={`inline-flex px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md ${rankBadgeColor(thirdPlayer.player_profile?.rank_level)}`}>
                                                {getRankLabel(thirdPlayer.player_profile?.rank_level)}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-center gap-8 border-t border-slate-100 pt-4">
                                            <div className="text-center">
                                                <div className="font-black text-[#1E293B] text-base leading-none font-mono">
                                                    <AnimatedCounter value={thirdPlayer.player_profile?.points || 0} />
                                                </div>
                                                <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                                                    {isArabic ? "النقاط" : "Points"}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-black text-[#1E293B] text-base leading-none font-mono">
                                                    <AnimatedCounter value={thirdPlayer.player_profile?.matches_won || 0} />
                                                </div>
                                                <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                                                    {isArabic ? "الفوز" : "Wins"}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <div className="bg-slate-200/30 blur-md rounded-full w-24 h-1.5 mt-3 pointer-events-none mx-auto hidden lg:block" />
                                </div>
                            )}

                        </div>
                    </motion.div>
                )}

                {/* 2. DYNAMIC SEARCH BAR SECTION */}
                <motion.div variants={sectionEntrance} className="py-6">
                    <div className="max-w-3xl mx-auto bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500">
                        <div className="text-center mb-5">
                            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1.5">
                                {isArabic ? "محرك البحث الذكي" : "SMART COMMUNITY ENGINE"}
                            </h3>
                            <div className="w-12 h-1 bg-[#CCFF00] rounded-full mx-auto" />
                        </div>

                        <div className="relative px-2">
                            {/* Centered pill search bar with yellow focus glow */}
                            <div className="relative">
                                <div className={`absolute top-1/2 -translate-y-1/2 z-10 ${isArabic ? "right-5" : "left-5"}`}>
                                    {searching ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                            <Icon icon="solar:spinner-linear" className="w-5.5 h-5.5 text-[#1E293B]" />
                                        </motion.div>
                                    ) : (
                                        <Icon icon="solar:magnifer-linear" className={`w-5.5 h-5.5 transition-colors duration-300 ${search ? 'text-[#1E293B]' : 'text-slate-400'}`} />
                                    )}
                                </div>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={handleSearch}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                        }
                                    }}
                                    placeholder={isArabic ? "ابحث باسم اللاعب، المستوى، أو الهاتف..." : "Search by player, level, or phone number..."}
                                    className={`w-full h-14 border border-[#E2E8F0] rounded-full bg-[#F8FAFC] transition-all duration-300 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#CCFF00]/25 focus:border-[#CCFF00] text-[14px] font-semibold text-[#1E293B] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] ${
                                        isArabic ? "pr-14 pl-36 text-right font-arabic" : "pl-14 pr-36"
                                    }`}
                                />

                                {/* Interactive Inline Deck */}
                                <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-2 ${isArabic ? "left-3" : "right-3"}`}>
                                    {/* Live Count Indicator */}
                                    <span className="bg-slate-200/70 text-slate-700 font-mono font-black text-[9px] uppercase px-3 py-1.5 rounded-full select-none leading-none">
                                        {search ? (
                                            <span>
                                                {searchResults.length} {isArabic ? "مطابقة" : "MATCH"}
                                            </span>
                                        ) : (
                                            <span>
                                                {allPlayers.length} {isArabic ? "لاعب" : "PLAYERS"}
                                            </span>
                                        )}
                                    </span>

                                    {/* Clear Button */}
                                    <AnimatePresence>
                                        {search && (
                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                onClick={clearSearch}
                                                className="h-8 px-3 rounded-full bg-slate-200 hover:bg-slate-350 transition-all text-[9.5px] font-black uppercase text-slate-700 flex items-center justify-center gap-1"
                                            >
                                                <Icon icon="solar:close-circle-bold" className="w-3.5 h-3.5" />
                                                <span>{isArabic ? "إلغاء" : "Clear"}</span>
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Animated Quick-Filter badges with Custom Icons */}
                            <div className="flex flex-wrap gap-1.5 mt-5 justify-center bg-slate-100/60 p-1.5 rounded-full border border-slate-200/40 max-w-max mx-auto relative">
                                {quickFilters.map((f) => {
                                    const isActive = search === f.val;
                                    
                                    // Custom icons for filter options
                                    let filterIcon = "solar:users-group-rounded-linear";
                                    if (f.key === "Elite") filterIcon = "solar:crown-linear";
                                    if (f.key === "Intermediate") filterIcon = "solar:star-linear";
                                    if (f.key === "Beginner") filterIcon = "solar:shield-linear";
                                    
                                    if (isActive) {
                                        if (f.key === "Elite") filterIcon = "solar:crown-bold";
                                        if (f.key === "Intermediate") filterIcon = "solar:star-bold";
                                        if (f.key === "Beginner") filterIcon = "solar:shield-bold";
                                        if (f.key === "All") filterIcon = "solar:users-group-rounded-bold";
                                    }

                                    return (
                                        <button
                                            key={f.key}
                                            onClick={() => setSearch(f.val)}
                                            className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-200 relative z-10 flex items-center gap-1.5 ${
                                                isActive ? "text-[#1E293B]" : "text-slate-500 hover:text-slate-900"
                                            } ${isArabic ? "font-arabic" : ""}`}
                                        >
                                            <Icon icon={filterIcon} className={`w-4 h-4 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
                                            <span>{isArabic ? f.ar : f.en}</span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeFilterPill"
                                                    className="absolute inset-0 bg-[#CCFF00] rounded-full shadow-[0_4px_12px_rgba(204,255,0,0.25)] z-[-1] border border-[#CCFF00]"
                                                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 4. SEARCH RESULTS GRID (Only visible when search or filter is active) */}
                {search && (
                    <motion.div variants={sectionEntrance} className="py-8">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="font-black text-[#1E293B] text-2xl uppercase tracking-tight">
                                    {isArabic ? "نتائج البحث" : "Search Results"}
                                </h3>
                                <p className="text-slate-400 font-medium text-xs mt-0.5">
                                    {isArabic ? "اللاعبين المطابقين للبحث" : "Players matching your search query"}
                                </p>
                            </div>
                            <div className="bg-white border border-slate-100 rounded-2xl px-5 py-2.5 flex items-center gap-2.5 shadow-sm max-w-max">
                                <Icon icon="solar:user-circle-linear" className="w-5 h-5 text-slate-400" />
                                <div className="leading-none">
                                    <span className="font-mono font-black text-[#1E293B] text-lg block">
                                        {searchResults.length.toLocaleString('en-US')}
                                    </span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 block">{isArabic ? "اللاعبين المطابقين" : "Matching Players"}</span>
                                </div>
                            </div>
                        </div>

                        {/* General Grid of Cards with fluid layout transitions */}
                        {searchResults.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <Icon icon="solar:user-block-linear" className="w-12 h-12 text-slate-350 mx-auto mb-3" />
                                <h3 className={`text-xl font-black text-[#1E293B] mb-1.5 ${isArabic ? "font-arabic" : ""}`}>
                                    {isArabic ? "لم يتم العثور على لاعبين" : "No Players Found"}
                                </h3>
                                <p className={`text-slate-400 max-w-sm mx-auto text-sm ${isArabic ? "font-arabic" : ""}`}>
                                    {isArabic ? "جرّب البحث باسم مختلف أو مستوى آخر." : "Try searching with another player name or ranking level."}
                                </p>
                            </div>
                        ) : (
                            <motion.div 
                                layout
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                            >
                                <AnimatePresence mode="popLayout">
                                    {searchResults.slice(0, 4).map((player) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                                            key={player.id}
                                            whileHover={{ y: -6 }}
                                            onClick={() => setSelectedPlayer(player)}
                                            style={{ transition: smoothTransition }}
                                            className={`bg-white rounded-2xl border border-slate-100 p-5 flex flex-col justify-between cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.01)] hover:shadow-lg overflow-hidden relative bg-gradient-to-br from-white to-slate-50/20 transition-all duration-300 ${rankHoverColorClass(player.player_profile?.rank_level)}`}
                                        >
                                            <div>
                                                <div className="flex items-center gap-3.5 mb-4 relative z-10">
                                                    {/* Avatar */}
                                                    <div className="relative w-12 h-12 shrink-0">
                                                        <div className={`w-full h-full rounded-full overflow-hidden bg-white border-2 p-0.5 flex items-center justify-center ${avatarBorderColor(player.player_profile?.rank_level)} shadow-sm`}>
                                                            {player.image_path ? (
                                                                <img
                                                                    src={resolveAsset(`/storage/${player.image_path}`)}
                                                                    className="w-full h-full object-cover rounded-full"
                                                                    alt={player.name}
                                                                />
                                                            ) : (
                                                                <Icon icon="solar:user-linear" className="w-5.5 h-5.5 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <div className={`absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full border border-white flex items-center justify-center text-[6px] font-black uppercase ${rankBadgeColor(player.player_profile?.rank_level)} shadow-sm`}>
                                                            {getRankCode(player.player_profile?.rank_level)}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-[#1E293B] truncate text-sm leading-snug">{player.name}</h3>
                                                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{player.phone}</p>
                                                    </div>
                                                </div>

                                                <div className={`inline-flex px-2 py-0.5 text-[8px] font-black uppercase mb-4 tracking-wider ${rankBadgeColor(player.player_profile?.rank_level)} border border-slate-100 rounded-md relative z-10`}>
                                                    {getRankLabel(player.player_profile?.rank_level)}
                                                </div>
                                            </div>

                                            {/* Stats grid */}
                                            <div className="grid grid-cols-3 gap-1.5 text-center border-t border-slate-100 pt-3.5 mt-auto relative z-10 font-mono">
                                                <div>
                                                    <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">{isArabic ? "النقاط" : "Points"}</span>
                                                    <span className="font-black text-[#1E293B] text-sm block mt-0.5">
                                                        {(player.player_profile?.points || 0).toLocaleString('en-US')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">{isArabic ? "لعب" : "Played"}</span>
                                                    <span className="font-black text-[#1E293B] text-sm block mt-0.5">
                                                        {(player.player_profile?.matches_played || 0).toLocaleString('en-US')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">{isArabic ? "فوز" : "Wins"}</span>
                                                    <span className="font-black text-[#1E293B] text-sm block mt-0.5">
                                                        {(player.player_profile?.matches_won || 0).toLocaleString('en-US')}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* 3. RANDOM PLAYER SUGGESTIONS ROW (EXACTLY 3 CARDS) */}
                {suggestedPlayers.length > 0 && (
                    <motion.div variants={sectionEntrance} className="py-10">
                        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="font-black text-[#1E293B] text-xl uppercase tracking-tight">
                                    {isArabic ? "اقتراحات عشوائية" : "Explore Dynamic Players"}
                                </h3>
                                <p className="text-slate-400 font-medium text-xs mt-0.5">
                                    {isArabic ? "لاعبين نشطين للتحدي ومتابعة التطور" : "Active athletic members ready to challenge"}
                                </p>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                                EXACTLY 3 MATCHES
                            </span>
                        </div>

                        {/* Responsive grid: stacks on mobile, 3 side-by-side on desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
                            {suggestedPlayers.map((player) => (
                                <motion.div
                                    key={player.id}
                                    whileHover={{ y: -4 }}
                                    onClick={() => setSelectedPlayer(player)}
                                    style={{ transition: smoothTransition }}
                                    className="hover:bg-slate-50/50 hover:border-slate-200 hover:shadow-[0_12px_25px_-10px_rgba(0,0,0,0.05)] bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between cursor-pointer"
                                >
                                    {/* Left: Athletic Avatar */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="relative w-12 h-12 shrink-0">
                                            <div className={`w-full h-full rounded-full overflow-hidden bg-white border-2 p-0.5 flex items-center justify-center ${avatarBorderColor(player.player_profile?.rank_level)} shadow-sm`}>
                                                {player.image_path ? (
                                                    <img
                                                        src={resolveAsset(`/storage/${player.image_path}`)}
                                                        className="w-full h-full object-cover rounded-full"
                                                        alt={player.name}
                                                    />
                                                ) : (
                                                    <Icon icon="solar:user-linear" className="w-5.5 h-5.5 text-slate-400" />
                                                )}
                                            </div>
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border border-white flex items-center justify-center text-[7px] font-black uppercase ${rankBadgeColor(player.player_profile?.rank_level)} shadow-sm`}>
                                                {getRankCode(player.player_profile?.rank_level)}
                                            </div>
                                        </div>

                                        {/* Center: Info */}
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-[#1E293B] text-sm truncate leading-snug">{player.name}</h4>
                                            <span className={`inline-flex px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md mt-1 border border-slate-100 ${rankBadgeColor(player.player_profile?.rank_level)}`}>
                                                {getRankLabel(player.player_profile?.rank_level)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: Points and Wins */}
                                    <div className="flex items-center gap-3 shrink-0 text-right rtl:text-left pl-3 rtl:pl-0 rtl:pr-3 border-l border-slate-100/80 rtl:border-l-0 rtl:border-r">
                                        <div className="text-center min-w-[45px]">
                                            <span className="font-mono font-black text-sm text-[#1E293B] block leading-none">
                                                {(player.player_profile?.points || 0).toLocaleString('en-US')}
                                            </span>
                                            <span className="text-[8px] text-slate-400 font-bold uppercase mt-1 block tracking-wider">
                                                {isArabic ? "النقاط" : "PTS"}
                                            </span>
                                        </div>
                                        <div className="text-center min-w-[45px]">
                                            <span className="font-mono font-black text-sm text-[#1E293B] block leading-none">
                                                {(player.player_profile?.matches_won || 0).toLocaleString('en-US')}
                                            </span>
                                            <span className="text-[8px] text-slate-400 font-bold uppercase mt-1 block tracking-wider">
                                                {isArabic ? "الفوز" : "WINS"}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* PLAYER PROFILE STATS MODAL */}
            <AnimatePresence>
                {selectedPlayer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPlayer(null)}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.96, y: 10, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.96, y: 10, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 280, damping: 22 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[32px] border border-slate-100 w-full max-w-[420px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.08)] flex flex-col max-h-[82vh] relative text-right rtl:text-right ltr:text-left"
                        >
                            {/* Modal Header Banner (Fixed & Compact) */}
                            <div className="bg-slate-50 p-6 pb-5 relative overflow-hidden shrink-0 border-b border-slate-100">
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000001_1px,transparent_1px),linear-gradient(to_bottom,#00000001_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/5 rounded-full blur-2xl pointer-events-none" />
                                
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedPlayer(null)}
                                    className={`absolute top-5 ${isArabic ? "left-5" : "right-5"} text-slate-400 hover:text-slate-800 rounded-full p-1.5 transition-all z-20 border border-slate-200 bg-white`}
                                >
                                    <Icon icon="solar:close-circle-linear" className="w-5 h-5" />
                                </button>

                                <div className="text-center flex flex-col items-center relative z-10">
                                    <div className={`w-20 h-20 rounded-full overflow-hidden bg-white border-4 p-0.5 flex items-center justify-center ${avatarBorderColor(selectedPlayer.player_profile?.rank_level)} shadow-md shrink-0`}>
                                        {selectedPlayer.image_path ? (
                                            <img
                                                src={resolveAsset(`/storage/${selectedPlayer.image_path}`)}
                                                className="w-full h-full object-cover rounded-full"
                                                alt={selectedPlayer.name}
                                            />
                                        ) : (
                                            <Icon icon="solar:user-linear" className="w-10 h-10 text-slate-400" />
                                        )}
                                    </div>

                                    <h3 className={`font-black text-[#1E293B] text-lg mt-3 tracking-tight uppercase ${isArabic ? "font-arabic" : "font-display"}`}>
                                        {selectedPlayer.name}
                                    </h3>
                                    
                                    {selectedPlayer.phone && (
                                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{selectedPlayer.phone}</p>
                                    )}

                                    <div className="mt-2">
                                        <span className={`inline-flex px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${rankBadgeColor(selectedPlayer.player_profile?.rank_level)} border border-slate-100 rounded-md`}>
                                            {isArabic ? "المستوى" : "Level"}: {getRankLabel(selectedPlayer.player_profile?.rank_level)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Scroll Container (Tighter Paddings) */}
                            <div className="overflow-y-auto p-5 pb-6 custom-scrollbar flex-1 bg-white">
                                {/* Stats High-Tech Grid & Circular Win Rate */}
                                <div className="pb-5 border-b border-slate-100">
                                    <h4 className={`font-black text-[#1E293B] text-sm uppercase tracking-tight mb-4 flex items-center gap-2 border-b border-slate-100 pb-1.5 ${isArabic ? "font-arabic" : "font-display"}`}>
                                        <Icon icon="solar:ranking-linear" className="w-4 h-4 text-slate-500" />
                                        {isArabic ? "الإحصائيات الشخصية" : "Personal Statistics"}
                                    </h4>

                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Points card */}
                                        <div className="bg-white border border-slate-100 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md">
                                            <Icon icon="solar:fire-linear" className="w-5 h-5 text-slate-500 mb-1.5" />
                                            <div className="font-black text-lg text-[#1E293B] leading-none font-mono">
                                                <AnimatedCounter value={selectedPlayer.player_profile?.points || 0} />
                                            </div>
                                            <div className="text-[8px] text-slate-400 font-bold uppercase mt-1.5">{isArabic ? "النقاط" : "Points"}</div>
                                        </div>

                                        {/* Matches card */}
                                        <div className="bg-white border border-slate-100 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md">
                                            <Icon icon="solar:grid-linear" className="w-5 h-5 text-slate-500 mb-1.5" />
                                            <div className="font-black text-lg text-[#1E293B] leading-none font-mono">
                                                {(selectedPlayer.player_profile?.matches_played || 0).toLocaleString('en-US')}
                                            </div>
                                            <div className="text-[8px] text-slate-400 font-bold uppercase mt-1.5">{isArabic ? "المباريات" : "Matches"}</div>
                                        </div>

                                        {/* Wins card */}
                                        <div className="bg-white border border-slate-100 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md">
                                            <Icon icon="solar:cup-first-linear" className="w-5 h-5 text-slate-500 mb-1.5" />
                                            <div className="font-black text-lg text-[#1E293B] leading-none font-mono">
                                                {(selectedPlayer.player_profile?.matches_won || 0).toLocaleString('en-US')}
                                            </div>
                                            <div className="text-[8px] text-slate-400 font-bold uppercase mt-1.5">{isArabic ? "الفوز" : "Wins"}</div>
                                        </div>

                                        {/* Win Rate Progress Ring card */}
                                        {(() => {
                                            const played = selectedPlayer.player_profile?.matches_played || 0;
                                            const won = selectedPlayer.player_profile?.matches_won || 0;
                                            const rate = played > 0 ? Math.round((won / played) * 100) : 0;
                                            return (
                                                <div className="bg-white border border-slate-150 rounded-2xl p-2.5 text-center flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all">
                                                    <CircularProgress percentage={rate} />
                                                    <div className="text-[8px] text-slate-400 font-bold uppercase mt-1.5">{isArabic ? "نسبة الفوز" : "Win Rate"}</div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Event Registrations */}
                                <div className="pt-5">
                                    <h4 className={`font-black text-[#1E293B] text-sm uppercase tracking-tight mb-4 flex items-center gap-2 border-b border-slate-100 pb-1.5 ${isArabic ? "font-arabic" : "font-display"}`}>
                                        <Icon icon="solar:cup-first-linear" className="w-4 h-4 text-slate-500" />
                                        {isArabic ? "البطولات والفعاليات" : "Tournaments & Events"}
                                    </h4>

                                    {selectedPlayer.event_registrations && selectedPlayer.event_registrations.length > 0 ? (
                                        <div className="space-y-2.5">
                                            {[...selectedPlayer.event_registrations]
                                                .filter(reg => reg.event)
                                                .sort((a, b) => {
                                                    const dateA = a.event.date ? new Date(a.event.date) : new Date(0);
                                                    const dateB = b.event.date ? new Date(b.event.date) : new Date(0);
                                                    return dateB - dateA;
                                                })
                                                .slice(0, 4)
                                                .map((reg) => {
                                                    const eventTitle = isArabic ? reg.event.title_ar : reg.event.title_en;
                                                    const eventDate = reg.event.date ? new Date(reg.event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : (isArabic ? 'غير محدد' : 'Not set');
                                                    
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
                                                            pending: 'bg-amber-50 text-amber-600 border border-amber-250/30',
                                                            approved: 'bg-emerald-50 text-emerald-600 border border-emerald-250/30',
                                                            rejected: 'bg-rose-50 text-rose-600 border border-rose-250/30',
                                                        };
                                                        return map[status?.toLowerCase()] || 'bg-slate-100 text-slate-500';
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
                                                        <div key={reg.id} className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex items-center justify-between gap-3">
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <Icon icon="solar:cup-first-linear" className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                                                                <div className="min-w-0">
                                                                     <h5 className="font-bold text-[#1E293B] text-[11px] truncate leading-snug">{eventTitle}</h5>
                                                                     <p className="text-[9px] text-slate-450 mt-0.5 flex items-center gap-1 font-mono">
                                                                         <Icon icon="solar:calendar-date-linear" className="w-3 h-3 text-slate-400" />
                                                                         {eventDate}
                                                                     </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                                <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase ${getStatusColor(reg.status)}`}>
                                                                    {getStatusText(reg.status)}
                                                                </span>
                                                                {reg.placement && (
                                                                    <span className="text-[8.5px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-250">
                                                                        {getPlacementLabel(reg.placement)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                                            <Icon icon="solar:cup-first-linear" className="w-7 h-7 text-slate-350 mx-auto mb-1.5" />
                                            <p className="text-[11px] text-slate-450 font-arabic">
                                                {isArabic ? "لم يشارك هذا اللاعب في أي بطولات بعد." : "No tournament history found."}
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