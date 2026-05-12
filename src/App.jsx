import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ACCOMMODATIONS } from './data'
import { Star, MapPin, ArrowRight, ArrowLeft, Heart, SlidersHorizontal, ChevronDown, ChevronRight, Check, Calendar, Users, Plus, Minus, ChevronsUpDown, Lock, ShieldCheck, Hotel, Eye, EyeOff, X, Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

// Map controller for smooth camera flyTo
// Map controller - REMOVED Auto-Pan
function MapController({ activeId, accommodations }) {
    // Static view, highlighting happens via marker state only
    return null;
}

const DateDropdown = ({ dateRange, setRange, close }) => {
    const months = ['FEB', 'MAR', 'APR', 'MAY', 'JUN'];
    const days = [
        { d: 24, day: 'FRI' }, { d: 25, day: 'SAT' }, { d: 26, day: 'SUN' },
        { d: 27, day: 'MON' }, { d: 28, day: 'TUE' }, { d: 1, day: 'WED' },
        { d: 2, day: 'THU' }, { d: 3, day: 'FRI' }, { d: 4, day: 'SAT' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="bg-white/90 backdrop-blur-xl p-6 rounded-[40px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border-[3px] border-white/80 z-[1000] w-72 flex flex-col gap-4 ring-1 ring-black/5 overflow-hidden"
        >
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Date</span>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">2026</span>
            </div>

            <div className="flex gap-6 overflow-x-auto scrollbar-hide py-1">
                {months.map((m, i) => (
                    <button 
                        key={m} 
                        onClick={() => setRange(m === 'FEB' ? 'Dates' : `${m} 2026`)}
                        className={clsx(
                            "text-xs font-bold tracking-widest shrink-0 transition-colors active-scale transition-tactile", 
                            (dateRange.toUpperCase().includes(m) || (m === 'FEB' && dateRange === 'Dates')) ? "text-slate-900" : "text-slate-500 hover:text-slate-600"
                        )}
                    >
                        {m}
                    </button>
                ))}
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 snap-x">
                {days.map((item, i) => {
                    const label = `Feb ${item.d}`;
                    const isSelected = dateRange === label;
                    return (
                        <button
                            key={i}
                            onClick={() => { setRange(label); }}
                            className={clsx(
                                "w-12 h-16 shrink-0 rounded-2xl flex flex-col items-center justify-center gap-1 snap-center transition-all active-scale transition-tactile",
                                isSelected ? "bg-transparent text-slate-900 shadow-sm shadow-slate-900/5 border border-slate-900/60" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                            )}
                        >
                            <span className={clsx("text-[9px] font-bold uppercase", isSelected ? "text-slate-500" : "text-slate-400")}>{item.day}</span>
                            <span className={clsx("text-base font-bold leading-none", isSelected ? "text-slate-900" : "text-slate-900")}>{item.d}</span>
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
}
const GuestDropdown = ({ count, setCount, close }) => (
    <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        className="bg-white/90 backdrop-blur-xl p-6 rounded-[40px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border-[3px] border-white/80 z-[1000] w-64 ring-1 ring-black/5"
    >
        <div className="flex items-center justify-between bg-white/50 rounded-2xl p-2">
            <button onClick={() => setCount(Math.max(1, count - 1))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-slate-600 font-bold transition-all active-scale">-</button>
            <span className="text-sm font-bold text-slate-900">{count} Guests</span>
            <button onClick={() => setCount(count + 1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-slate-600 font-bold transition-all active-scale">+</button>
        </div>
    </motion.div>
)

const FilterDropdown = ({ selected, setSelected, close }) => (
    <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        className="bg-white/90 backdrop-blur-xl p-2 rounded-[40px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border-[3px] border-white/80 z-[1000] w-56 overflow-hidden ring-1 ring-black/5"
    >
        {['Top Rated', 'Rice Fields Nearby', 'Sea View Villas', 'Private Pool'].map(f => (
            <button
                key={f}
                onClick={() => { setSelected(f); }}
                className={clsx(
                    "w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between active-scale transition-tactile mb-1 last:mb-0",
                    selected === f ? "bg-slate-900/40 text-white shadow-md shadow-slate-900/10" : "text-[#1A1A1A] hover:bg-slate-50"
                )}
            >
                {f}
                {selected === f && <Check size={12} className="text-white" />}
            </button>
        ))}
        <div className="px-2 pt-1 pb-2">
            <button onClick={close} className="w-full py-3 bg-transparent border border-slate-900/60 text-slate-900 hover:bg-slate-50 hover:border-slate-900/80 rounded-2xl text-xs font-bold transition-all active-scale">Apply Filter</button>
        </div>
    </motion.div>
)

// Concierge Overlay Component
const ConciergeOverlay = ({ hotel, onClose }) => {
    const [progress, setProgress] = useState(0);
    const [displayedPrice, setDisplayedPrice] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [stage, setStage] = useState('concierge');

    useEffect(() => {
        const duration = 1000; 
        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const p = Math.min(elapsed / duration, 1);
            
            // Staged easing: cubic ease out
            const easedP = 1 - Math.pow(1 - p, 3);
            
            setProgress(p * 100);
            setDisplayedPrice(Math.round(easedP * hotel.price));

            if (p < 1) {
                requestAnimationFrame(animate);
            } else {
                setProgress(100);
                setDisplayedPrice(hotel.price);
                setIsComplete(true);
                setTimeout(() => setStage('redirect'), 400);
            }
        };

        requestAnimationFrame(animate);
    }, [hotel.price]);

    useEffect(() => {
        if (stage === 'redirect') {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [stage, onClose]);

    if (stage === 'redirect') {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center font-sans"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center"
                >
                    <p className="text-[#1A1A1A] text-lg font-medium animate-pulse mb-2">Opening...</p>
                    <h1 className="text-4xl font-bold text-[#003580] tracking-tight">booking.com</h1>
                </motion.div>
            </motion.div>
        )
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-white/90 backdrop-blur-[20px] flex flex-col items-center justify-center p-8 text-center"
        >
            <div className="max-w-md w-full">
                {/* Success Icon - Self-drawing SVG */}
                <div className="mb-8 relative">
                    <div className="w-20 h-20 flex items-center justify-center mx-auto">
                        <motion.svg 
                            viewBox="0 0 24 24" 
                            className="w-12 h-12 text-lime-500"
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            {isComplete && (
                                <motion.path 
                                    d="M20 6L9 17l-5-5"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            )}
                        </motion.svg>
                    </div>
                </div>

                {/* Precision Divider */}
                <div className="w-full bg-zinc-100 h-1.5 rounded-full mb-6 relative overflow-hidden">
                    <motion.div
                        className="h-full bg-lime-500 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Narrative Stack */}
                <p className="text-[#1A1A1A] text-lg font-medium animate-pulse">
                    Securing your exclusive rate...
                </p>
            </div>
        </motion.div>
    )
}

// Zoom Control Component
function CustomZoomControl() {
    const map = useMap();

    return (
        <div className="absolute top-[80px] left-5 z-[400] flex flex-col gap-1.5">
            <button
                onClick={() => map.zoomIn()}
                className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-white/50 flex items-center justify-center text-slate-700 active:scale-95 transition-all hover:bg-white"
            >
                <div className="text-xl leading-none font-light">+</div>
            </button>
            <button
                onClick={() => map.zoomOut()}
                className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-white/50 flex items-center justify-center text-slate-700 active:scale-95 transition-all hover:bg-white"
            >
                <div className="text-2xl leading-none font-light pb-1">-</div>
            </button>
        </div>
    )
}

export default function App() {
    const [activeId, setActiveId] = useState(ACCOMMODATIONS[0]?.id || 1);
    const [bookingState, setBookingState] = useState('idle'); // idle, securing, redirecting, done

    // Dropdown States
    const [openDropdown, setOpenDropdown] = useState(null); // 'dates', 'guests', 'filters'
    const [dropdownLeft, setDropdownLeft] = useState(0);
    const [dateRange, setDateRange] = useState('May 11');
    const [guestCount, setGuestCount] = useState(1);
    const [selectedFilter, setSelectedFilter] = useState('Top Rated');
    const [isCardsVisible, setIsCardsVisible] = useState(true);

    const toggleDropdown = (name, event) => {
        if (openDropdown === name) {
            setOpenDropdown(null);
        } else {
            if (event) {
                const rect = event.currentTarget.getBoundingClientRect();
                const dockRect = dropdownRef.current?.getBoundingClientRect();
                if (dockRect) {
                    // Determine dropdown width based on name
                    const widths = { dates: 288, guests: 256, filters: 224 };
                    const dropdownWidth = widths[name] || 280;
                    
                    // Calculate centered position relative to the clicked button
                    let left = (rect.left + rect.width / 2) - dockRect.left - (dropdownWidth / 2);
                    
                    // Clamp to dock boundaries (8px padding)
                    const dockWidth = dockRect.width;
                    left = Math.max(8, Math.min(left, dockWidth - dropdownWidth - 8));
                    
                    setDropdownLeft(left);
                }
            }
            setOpenDropdown(name);
        }
    };

    // Click Away Logic
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };
        if (openDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdown]);

    // Refs for scroll syncing
    const cardsContainerRef = useRef(null);
    const cardRefs = useRef({});
    const isProgrammaticScroll = useRef(false);

    // 1. Scroll-Sync: Observer
    useEffect(() => {
        const container = cardsContainerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver((entries) => {
            if (isProgrammaticScroll.current) return;
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = Number(entry.target.dataset.id);
                    setActiveId(id);
                }
            });
        }, {
            root: container,
            threshold: 0.6
        });

        Object.values(cardRefs.current).forEach(card => {
            if (card) observer.observe(card);
        });

        return () => observer.disconnect();
    }, []);
    // 2. Map Pin Click
    const handlePinClick = (id) => {
        setIsCardsVisible(true);
        setActiveId(id);
        
        // Ensure the gallery is rendered before scrolling
        setTimeout(() => {
            const card = cardRefs.current[id];
            if (card && cardsContainerRef.current) {
                isProgrammaticScroll.current = true;
                card.scrollIntoView({
                    behavior: 'smooth',
                    inline: 'center',
                    block: 'nearest'
                });
                setTimeout(() => {
                    isProgrammaticScroll.current = false;
                }, 800);
            }
        }, 150);
    };



    const handleBook = (e, id) => {
        e.stopPropagation();
        if (bookingState !== 'idle') return;
        setBookingState('concierge');
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-typography-primary">

            <article className="blog-intro-content max-w-[680px] mx-auto px-[18px] pt-3 pb-2">
                <a
                    href="/"
                    aria-label="Back to homepage"
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[11px] font-bold text-[#757575] shadow-sm shadow-slate-900/5 backdrop-blur-md transition-all hover:border-slate-300 hover:bg-white hover:text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#135bec]/25 focus:ring-offset-2 active:scale-[0.98] mb-5"
                >
                    <ArrowLeft size={13} strokeWidth={2.5} aria-hidden="true" />
                    Home
                </a>
                <span className="category-tag text-xs font-bold text-[#757575] uppercase tracking-widest mb-3 block">Bali, Indonesia</span>
                <h1 className="blog-title text-3xl md:text-3xl font-bold text-[#1A1A1A] leading-[1.15] tracking-tight mb-6">
                    Escaping the Noise: My Secret Spots in Ubud
                </h1>
                <div className="author-meta flex items-center gap-3 mb-8">
                    <div className="author-avatar-placeholder w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-black/5">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="" className="w-full h-full object-cover opacity-90" />
                    </div>
                    <div className="author-details flex flex-col justify-center">
                        <span className="text-sm font-medium text-[#1A1A1A]">
                            <span className="author-name font-semibold">By Alex</span> <span className="text-[#757575] mx-1">•</span> <span className="read-time text-[#757575]">4 min read</span>
                        </span>
                    </div>
                </div>
                <div className="blog-body text-[#1A1A1A] text-[17px] leading-[1.6] mb-4 antialiased">
                    <p className="mb-5">
                        Ubud has changed a lot in the last decade, but if you know where to look, you can still find that magical silence where the only sound is the rustling of coconut palms.
                    </p>
                    <p>
                        I’ve spent the last month scouring the rice paddies for the most serene, high-design stays. Below is my curated map of personal favorites.
                    </p>
                </div>
            </article>

            <div className="w-full max-w-[680px] mx-auto px-[18px] mb-5 isolate">
                <div className="w-full h-[75vh] md:h-[850px] bg-slate-100 md:rounded-[2.5rem] overflow-hidden shadow-[0_11px_22px_rgba(0,0,0,0.12)] relative md:border-8 md:border-white box-border ring-1 ring-gray-900/5">

                    <div className="absolute inset-0 z-0">
                        <MapContainer
                            center={[-8.45, 115.26]}
                            zoom={10}
                            zoomControl={false}
                            scrollWheelZoom={true}
                            className="h-full w-full outline-none bg-white"
                            attributionControl={false}
                        >
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

                            <MapController activeId={activeId} accommodations={ACCOMMODATIONS} />
                            <CustomZoomControl />

                            {ACCOMMODATIONS.map((place) => {
                                const isActive = place.id === activeId;
                                const icon = L.divIcon({
                                    className: 'custom-marker-div',
                                    html: `
                                        <div class="group relative flex flex-col items-center">
                                            <div class="bg-white px-3 py-1.5 rounded-full shadow-lg border border-gray-100 transition-all duration-300 transform group-hover:scale-110 group-hover:shadow-yellow-400/20 active:scale-95 active:shadow-[0_0_15px_rgba(250,204,21,0.5)] ${isActive ? 'ring-4 ring-yellow-400/20 scale-110 border-yellow-200/40 shadow-[0_0_30px_rgba(250,204,21,0.5)]' : ''}">
                                                <span class="text-[11px] font-bold text-gray-900">$${place.price}</span>
                                            </div>
                                        </div>
                                    `,
                                    iconSize: [60, 40],
                                    iconAnchor: [30, 42]
                                });
                                return (
                                    <Marker
                                        key={`${place.id}-${isActive}`}
                                        position={[place.lat, place.lng]}
                                        icon={icon}
                                        eventHandlers={{
                                            click: () => handlePinClick(place.id),
                                            mouseover: () => handlePinClick(place.id)
                                        }}
                                    />
                                );
                            })}
                        </MapContainer>
                    </div>

                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-[95%] z-[500] pointer-events-none">
                        <div className="bg-white/95 backdrop-blur-xl rounded-[40px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border-[3px] border-white/80 py-1 px-2 pointer-events-auto relative" ref={dropdownRef}>
                            <div className="flex items-center gap-1.5">
                                <div className="flex items-center gap-1 shrink-0 border-r border-white/60 pr-0.5 max-w-[110px]">
                                    <button className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                        <MapPin size={12} />
                                    </button>
                                    <div className="flex flex-col justify-center min-w-0 gap-0.5">
                                        <label className="text-[11px] font-black text-[#007E8F] uppercase tracking-wider leading-none truncate">Let's go to</label>
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="text"
                                                defaultValue="Ubud, Bali"
                                                className="text-[11px] font-bold text-slate-900 leading-tight bg-transparent border-none p-0 w-full focus:ring-0 placeholder-gray-400 outline-none truncate"
                                            />
                                            <Pencil size={9} className="text-slate-400 shrink-0" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto scrollbar-hide py-1.5 carousel-momentum [mask-image:linear-gradient(to_right,black_92%,transparent)]">
                                    <div className="relative shrink-0">
                                        <button
                                            onClick={(e) => toggleDropdown('dates', e)}
                                            aria-label="Select dates"
                                            aria-expanded={openDropdown === 'dates'}
                                            className={clsx(
                                                "whitespace-nowrap px-2.5 py-2.5 rounded-full text-[10px] font-bold shadow-sm border flex items-center gap-1 active-scale transition-tactile",
                                                openDropdown === 'dates' ? "bg-white/80 backdrop-blur-md text-[#1A1A1A] border-slate-300" : "bg-white/40 backdrop-blur-md text-[#1A1A1A] border-slate-200 hover:bg-white/60"
                                            )}
                                        >
                                            <Calendar size={10} className="text-slate-600" aria-hidden="true" /> {dateRange} <ChevronDown size={10} className="text-[#1A1A1A]" />
                                        </button>
                                    </div>

                                    <div className="relative shrink-0">
                                        <button
                                            onClick={(e) => toggleDropdown('guests', e)}
                                            aria-label="Select guests"
                                            aria-expanded={openDropdown === 'guests'}
                                            className={clsx(
                                                "whitespace-nowrap px-2.5 py-2.5 rounded-full text-[10px] font-bold shadow-sm border flex items-center gap-1 active-scale transition-tactile",
                                                openDropdown === 'guests' ? "bg-white/80 backdrop-blur-md text-[#1A1A1A] border-slate-300" : "bg-white/40 backdrop-blur-md text-[#1A1A1A] border-slate-200 hover:bg-white/60"
                                            )}
                                        >
                                            <Users size={10} className="text-slate-600" aria-hidden="true" /> {guestCount} <ChevronDown size={10} className="text-[#1A1A1A]" />
                                        </button>
                                    </div>

                                    <div className="relative shrink-0">
                                        <button
                                            onClick={(e) => toggleDropdown('filters', e)}
                                            className="whitespace-nowrap bg-slate-900/50 text-white px-2.5 py-2.5 rounded-full text-[10px] font-bold border border-white/10 backdrop-blur-md flex items-center gap-1 active-scale transition-tactile"
                                        >
                                            <Star size={10} fill="currentColor" className="text-white" /> {selectedFilter} <ChevronDown size={10} className="text-white" />
                                        </button>
                                    </div>

                                    <div className="relative shrink-0 pr-12">
                                        <button className="whitespace-nowrap px-2.5 py-2.5 rounded-full text-[10px] font-bold shadow-sm border bg-[#1A1A1A]/5 text-[#1A1A1A] border-gray-200 flex items-center gap-1 active-scale transition-tactile hover:bg-[#1A1A1A]/10 shrink-0">
                                            <SlidersHorizontal size={10} className="text-slate-400" /> More
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {openDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 w-full z-[1000] pointer-events-none pt-3"
                                    >
                                        <div
                                            className="relative pointer-events-auto origin-top"
                                            style={{ left: `${dropdownLeft}px` }}
                                        >
                                            {openDropdown === 'dates' && <DateDropdown dateRange={dateRange} setRange={setDateRange} close={() => setOpenDropdown(null)} />}
                                            {openDropdown === 'guests' && <GuestDropdown count={guestCount} setCount={setGuestCount} close={() => setOpenDropdown(null)} />}
                                            {openDropdown === 'filters' && <FilterDropdown selected={selectedFilter} setSelected={setSelectedFilter} close={() => setOpenDropdown(null)} />}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full z-[100] h-[340px] pointer-events-none">
                        <div 
                            className="absolute left-0 bottom-[24px] z-[500] pointer-events-auto"
                        >
                            <button
                                onClick={() => setIsCardsVisible(open => !open)}
                                className="h-8 px-3 flex items-center justify-center text-slate-800 bg-white/85 backdrop-blur-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] border-y border-r border-white/80 rounded-r-[24px] active-scale transition-all hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#135bec]/25"
                                title={isCardsVisible ? "Minimize visuals" : "Expand visuals"}
                                aria-label="Toggle hotel visuals"
                            >
                                <AnimatePresence mode="wait">
                                    {isCardsVisible ? (
                                        <motion.div
                                            key="close"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                        >
                                            <EyeOff size={16} strokeWidth={2.5} />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="open"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="flex items-center gap-1.5"
                                        >
                                            <Hotel size={15} strokeWidth={2} />
                                            <Eye size={15} strokeWidth={2} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>

                        <AnimatePresence>
                            {isCardsVisible && (
                                <motion.div
                                    id="hotel-cards-row"
                                    initial={{ opacity: 0, y: 52, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 52, scale: 0.98 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="absolute bottom-0 left-0 right-0 pointer-events-auto h-[295px]"
                                >
                                    <div
                                        ref={cardsContainerRef}
                                        className="flex overflow-x-auto snap-x snap-mandatory pl-11 pr-4 gap-6 scrollbar-hide items-stretch h-full carousel-momentum"
                                        style={{ scrollPaddingLeft: '2.75rem' }}
                                    >
                                        {ACCOMMODATIONS.map((place) => {
                                            const isActive = place.id === activeId;
                                            return (
                                                <div
                                                    key={place.id}
                                                    id={`hotel-card-${place.id}`}
                                                    ref={el => cardRefs.current[place.id] = el}
                                                    data-id={place.id}
                                                    className={clsx(
                                                        "snap-center shrink-0 w-[86%] h-full relative group",
                                                        isActive ? "z-10" : "z-0"
                                                    )}
                                                    onClick={() => {
                                                        if (!isActive) handlePinClick(place.id);
                                                    }}
                                                >
                                                    <div className={clsx(
                                                        "relative h-full rounded-[24px] overflow-hidden border border-white/80 p-2.5 flex flex-col transition-all duration-500",
                                                        isActive ? "shadow-[0_12px_32px_rgba(0,0,0,0.18)] bg-white" : "shadow-[0_8px_24px_rgba(0,0,0,0.12)] bg-white"
                                                    )}>
                                                        {isActive && bookingState !== 'idle' && (
                                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#135bec] to-transparent animate-pulse opacity-80 z-50"></div>
                                                        )}

                                                        <div className="h-[141px] w-full relative rounded-xl overflow-hidden shadow-sm shrink-0">
                                                            <motion.img 
                                                                src={place.image} 
                                                                alt={place.name} 
                                                                animate={{
                                                                    scale: isActive ? 1.12 : 1,
                                                                    filter: isActive ? 'brightness(1.1)' : 'brightness(1)'
                                                                }}
                                                                transition={{
                                                                    type: 'spring',
                                                                    stiffness: 260,
                                                                    damping: 20
                                                                }}
                                                                className={clsx(
                                                                    "w-full h-full object-cover transform origin-bottom transition-all duration-1000 ease-out",
                                                                    "group-hover:scale-[1.18] active:scale-[1.25] active:brightness-110"
                                                                )} 
                                                            />
                                                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                                                <Star size={9} className="text-amber-500" fill="currentColor" />
                                                                <span className="text-[11px] font-bold text-slate-900">{place.rating}</span>
                                                            </div>
                                                            {place.tag && (
                                                                <div className={clsx(
                                                                    "absolute top-4 left-4 px-3 py-1 md:px-4 md:py-2 shadow-lg transform -rotate-3 z-10",
                                                                    place.tagClass
                                                                )}>
                                                                    <span className="text-[14px] md:text-[18px] font-bold tracking-normal leading-none" style={{ fontFamily: "'Caveat', cursive" }}>
                                                                        {place.tag}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-grow flex flex-col justify-start pt-3 pb-0 px-0.5">
                                                            <div className="mb-0">
                                                                <h3 className="text-[15px] md:text-[16.5px] font-bold text-slate-900 leading-tight tracking-tight line-clamp-2">{place.name}</h3>
                                                            </div>
                                                            <div className="flex justify-between items-baseline mt-1 mb-0">
                                                                <p className="text-[11px] md:text-[12px] text-slate-500 flex items-center font-medium line-clamp-1">
                                                                    <MapPin size={11} className="mr-0.5 text-slate-400" /> {place.distance}
                                                                </p>
                                                                <div className="flex items-baseline gap-1 shrink-0">
                                                                    <span className="text-[11px] font-bold text-slate-900 leading-none">from</span>
                                                                    <span className="text-[13px] md:text-[15px] font-bold text-[#135bec] leading-none">${place.price}</span>
                                                                    <span className="text-[11px] font-bold text-slate-900 leading-none"> / night</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col items-center mt-auto">
                                                                <button
                                                                    onClick={(e) => handleBook(e, place.id)}
                                                                    disabled={bookingState !== 'idle' || !isActive}
                                                                    style={{ borderRadius: '32px' }}
                                                                    className={clsx(
                                                                        "w-full py-2 md:py-2.5 text-[11px] md:text-[13px] font-bold shadow-md transition-all flex items-center justify-center gap-2 relative overflow-hidden active-scale transition-tactile",
                                                                        bookingState === 'idle'
                                                                            ? (isActive ? "bg-[#135bec] hover:bg-blue-600 text-white shadow-blue-500/20 active:scale-[0.98]" : "bg-gray-100 text-gray-400")
                                                                            : "bg-[#135bec] text-white cursor-wait"
                                                                    )}
                                                                >
                                                                    <AnimatePresence mode="wait">
                                                                        {bookingState === 'idle' ? (
                                                                            <motion.span
                                                                                key="idle"
                                                                                initial={{ opacity: 0, y: 10 }}
                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                exit={{ opacity: 0, y: -10 }}
                                                                                className="flex items-center gap-2"
                                                                            >
                                                                                Book Now <ArrowRight size={14} />
                                                                            </motion.span>
                                                                        ) : (
                                                                            <motion.span
                                                                                key="loading"
                                                                                initial={{ opacity: 0, y: 10 }}
                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                exit={{ opacity: 0, y: -10 }}
                                                                            >
                                                                                Redirecting...
                                                                            </motion.span>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </button>
                                                                <p className="text-[10px] md:text-[12px] text-gray-500 text-center mt-1.5 font-bold tracking-wide">
                                                                    Free cancellation.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* CONCIERGE OVERLAY */}
            <AnimatePresence>
                {bookingState === 'concierge' && (
                    <ConciergeOverlay
                        hotel={ACCOMMODATIONS.find(h => h.id === activeId)}
                        onClose={() => setBookingState('idle')}
                    />
                )}
            </AnimatePresence>

            {/* Footer Content */}
            <div className="max-w-[680px] mx-auto px-[18px] pb-[122px] text-[17px] leading-[1.6] text-typography-primary">
                <h3 className="text-xl font-bold mb-3">Why this area matters</h3>
                <p className="text-typography-secondary mb-6">
                    Staying in these specific coordinates puts you exactly 10 minutes from the Monkey Forest but far enough to avoid the tour bus crowds. It’s the sweet spot for digital nomads and peace-seekers alike.
                </p>
                <p className="text-typography-secondary mb-5">
                    If you go, give yourself one slow morning with nowhere to be. Wake up before the scooters, follow the small roads until they turn to green, and let Ubud become quiet again in its own time. That is the version I keep coming back for.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                    {['Bali Travel', 'Ubud Guide', 'Boutique Stays', 'Rice Fields', 'Slow Travel'].map(tag => (
                        <a
                            key={tag}
                            href="/"
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#757575] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
                        >
                            #{tag}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    )
}
