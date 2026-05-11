import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ACCOMMODATIONS } from './data'
import { Star, MapPin, ArrowRight, ArrowLeft, Heart, SlidersHorizontal, ChevronDown, ChevronRight, Check, Calendar, Users, Plus, Minus, ChevronsUpDown, Lock, ShieldCheck, Hotel, Eye, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

// Map controller for smooth camera flyTo
// Map controller - REMOVED Auto-Pan
function MapController({ activeId, accommodations }) {
    // Static view, highlighting happens via marker state only
    return null;
}

const DateDropdown = ({ setRange, close }) => {
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
            className="bg-white/80 backdrop-blur-[24px] p-4 rounded-[32px] shadow-[0_24px_48px_rgba(0,0,0,0.15)] border border-white/50 z-[1000] w-72 flex flex-col gap-4 ring-1 ring-black/5 overflow-hidden"
        >
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Date</span>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">2026</span>
            </div>

            <div className="flex gap-6 overflow-x-auto scrollbar-hide py-1 mask-linear-fade">
                {months.map((m, i) => (
                    <button key={m} className={clsx("text-xs font-black tracking-widest shrink-0 transition-colors active-scale transition-tactile", i === 0 ? "text-slate-900" : "text-slate-300 hover:text-slate-500")}>
                        {m}
                    </button>
                ))}
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 snap-x">
                {days.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => { setRange(`Feb ${item.d}`); close(); }}
                        className={clsx(
                            "w-12 h-16 shrink-0 rounded-2xl flex flex-col items-center justify-center gap-1 snap-center transition-all active-scale transition-tactile",
                            i === 0 ? "bg-slate-900/60 text-white shadow-lg shadow-black/10 border border-white/15 backdrop-blur-md" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        )}
                    >
                        <span className={clsx("text-[9px] font-bold", i === 0 ? "text-white/60" : "text-slate-400")}>{item.day}</span>
                        <span className={clsx("text-base font-black leading-none", i === 0 ? "text-white" : "text-slate-900")}>{item.d}</span>
                    </button>
                ))}
            </div>
        </motion.div>
    );
}
const GuestDropdown = ({ count, setCount, close }) => (
    <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        className="bg-white/80 backdrop-blur-[24px] p-4 rounded-[32px] shadow-[0_24px_48px_rgba(0,0,0,0.15)] border border-white/50 z-[1000] w-64 ring-1 ring-black/5"
    >
        <div className="flex items-center justify-between bg-white/50 rounded-2xl p-2 mb-4">
            <button onClick={() => setCount(Math.max(1, count - 1))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-slate-600 font-bold transition-all active-scale">-</button>
            <span className="text-sm font-bold text-slate-900">{count} Guests</span>
            <button onClick={() => setCount(count + 1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-slate-600 font-bold transition-all active-scale">+</button>
        </div>
        <button onClick={close} className="w-full py-3 bg-slate-900/70 text-white hover:bg-slate-900/80 rounded-2xl text-xs font-bold transition-all shadow-sm active-scale">Apply</button>
    </motion.div>
)

const FilterDropdown = ({ selected, setSelected, close }) => (
    <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        className="bg-white/80 backdrop-blur-[24px] p-2 rounded-[32px] shadow-[0_24px_48px_rgba(0,0,0,0.15)] border border-white/50 z-[1000] w-56 overflow-hidden ring-1 ring-black/5"
    >
        {['Top Rated', 'Rice Fields Nearby', 'Sea View Villas', 'Private Pool'].map(f => (
            <button
                key={f}
                onClick={() => { setSelected(f); close(); }}
                className={clsx(
                    "w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between active-scale transition-tactile mb-1 last:mb-0",
                    selected === f ? "bg-slate-900/70 text-white shadow-sm" : "text-[#1A1A1A] hover:bg-white/50"
                )}
            >
                {f}
                {selected === f && <Check size={12} className="text-white" />}
            </button>
        ))}
    </motion.div>
)

// Concierge Overlay Component
function ConciergeOverlay({ hotel, onClose }) {
    const [progress, setProgress] = useState(0);
    const [displayedPrice, setDisplayedPrice] = useState(Math.floor(hotel.price * 0.85));
    const [stage, setStage] = useState('concierge'); // 'concierge' | 'whiteout'

    useEffect(() => {
        // Animation sequence
        const duration = 2500;
        const startTime = Date.now();
        const startPrice = Math.floor(hotel.price * 0.85);

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const p = Math.min(elapsed / duration, 1);

            // Progress bar
            setProgress(p * 100);

            // Price rolling
            if (p < 1) {
                // Random jumping numbers that get closer to target
                const noise = (Math.random() - 0.5) * 50 * (1 - p);
                const currentFn = startPrice + (hotel.price - startPrice) * p;
                setDisplayedPrice(Math.floor(currentFn + noise));
            } else {
                setDisplayedPrice(hotel.price);
                clearInterval(interval);
                // Trigger Whiteout
                setTimeout(() => setStage('whiteout'), 200);
            }
        }, 30);

        return () => clearInterval(interval);
    }, [hotel.price]);

    // Handle Whiteout logic
    useEffect(() => {
        if (stage === 'whiteout') {
            const timer = setTimeout(() => {
                onClose();
            }, 4500);
            return () => clearTimeout(timer);
        }
    }, [stage, onClose]);

    // Render Whiteout
    if (stage === 'whiteout') {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center font-sans"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center"
                >
                    {/* Placeholder Logo Text if no asset */}
                    <h1 className="text-4xl font-black text-[#003580] tracking-tighter mb-4">Booking.com</h1>
                    <p className="text-[#1A1A1A] text-lg font-medium animate-pulse">Opening Booking.com in a new tab...</p>
                </motion.div>
            </motion.div>
        )
    }

    // Render Concierge
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-xl backdrop-saturate-150 flex flex-col items-center justify-center font-sans p-6 border border-black/5"
        >
            <div className="flex flex-col items-center max-w-sm w-full text-center">
                {/* Success Icon Only */}
                <div className="w-12 h-12 bg-white text-zinc-900 rounded-full border border-black/5 shadow-sm flex items-center justify-center mb-10">
                    <Check size={16} strokeWidth={3.5} />
                </div>

                {/* Value Stack */}
                <div className="flex flex-col items-center gap-3 mb-8">
                    <div className="flex items-center gap-1.5 text-[#003580] bg-white px-3 py-1 rounded-full border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                        <ShieldCheck size={12} strokeWidth={2.5} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Price Matched</span>
                    </div>
                    <span className="text-6xl font-normal text-zinc-900 tabular-nums tracking-tighter font-lora">
                        ${displayedPrice}
                    </span>
                </div>

                {/* Precision Divider */}
                <div className="w-full bg-zinc-100 h-1.5 rounded-full mb-10 relative overflow-hidden">
                    <motion.div
                        className="h-full bg-[#003580] rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Narrative Stack */}
                <p className="text-[#1A1A1A] text-lg font-medium animate-pulse mt-2">
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
        <div className="absolute top-[160px] left-5 z-[400] flex flex-col gap-1.5">
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
                <div className="text-xl leading-none font-light pb-1">-</div>
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
    const [dateRange, setDateRange] = useState('Dates');
    const [guestCount, setGuestCount] = useState(2);
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
                    // Precision alignment: Get the relative X position of the button's left edge
                    // We subtract 48 to roughly center it or at least keep it within the dock visual
                    // But to be "right under", we'll match the left edge and just nudge slightly
                    let left = rect.left - dockRect.left;

                    // Safety: Don't let it overflow the right side of the dock
                    // Dock width is usually around 95% of viewport
                    const dropdownWidth = 280; // approx w-72
                    const dockWidth = dockRect.width;
                    if (left + dropdownWidth > dockWidth) {
                        left = dockWidth - dropdownWidth - 8;
                    }
                    setDropdownLeft(Math.max(8, left));
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

    // 1. Scroll-Sync: Observer to detect which card is centered -> Update Active Pin
    useEffect(() => {
        const container = cardsContainerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver((entries) => {
            // Skip observer updates if we are scrolling programmatically (from pin click)
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

    // 2. Map Pin Click -> Scroll Card into View
    const handlePinClick = (id) => {
        const card = cardRefs.current[id];
        if (card && cardsContainerRef.current) {
            isProgrammaticScroll.current = true;
            setActiveId(id);

            card.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });

            // Reset the lock after scrolling finishes (approximate)
            setTimeout(() => {
                isProgrammaticScroll.current = false;
            }, 800);
        }
    };

    const handleBook = (e, id) => {
        e.stopPropagation();
        if (bookingState !== 'idle') return;

        setBookingState('concierge');
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-typography-primary">

            {/* Blog Intro - Reduced Top Padding by 75% (12 -> 3) */}
            <article className="blog-intro-content max-w-[680px] mx-auto px-6 pt-3 pb-2">
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

            {/* IMMERSIVE WIDGET CONTAINER - Reduced Bottom Margin by 75% (20 -> 5) */}
            <div className="w-full max-w-[680px] mx-auto px-4 mb-5 isolate">
                <div className="w-full h-[85vh] md:h-[850px] bg-slate-100 md:rounded-[2.5rem] overflow-hidden shadow-2xl relative md:border-8 md:border-white box-border ring-1 ring-gray-900/5">

                    {/* MAP LAYER - ZOOM 10 */}
                    <div className="absolute inset-0 z-0">
                        <MapContainer
                            center={[-8.45, 115.26]}
                            zoom={10}
                            zoomControl={false} // Custom control used instead
                            scrollWheelZoom={true}
                            className="h-full w-full outline-none bg-[#e5e7eb]"
                            attributionControl={false}
                        >
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

                            <MapController activeId={activeId} accommodations={ACCOMMODATIONS} />
                            <CustomZoomControl />

                            {ACCOMMODATIONS.map((place) => {
                                const isActive = place.id === activeId;

                                // MARKER HTML: Blue Brand Color
                                const iconHtml = isActive
                                    ? `
                      <div class="relative flex flex-col items-center drop-shadow-xl transition-all duration-300 scale-110 z-[9999]">
                        <div class="marker-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full z-[-1]"></div>
                        <div class="bg-[#135bec] text-white px-4 py-2 rounded-full flex items-center gap-2 border-[3px] border-white shadow-sm">
                           <span class="text-sm font-extrabold">$${place.price}</span>
                        </div>
                      </div>
                    `
                                    : `
                      <div class="bg-white hover:bg-gray-50 text-slate-900 px-3 py-1.5 rounded-full shadow-lg border border-gray-100 font-bold text-xs transition-transform hover:scale-110 flex items-center justify-center min-w-[3rem]">
                        $${place.price}
                      </div>
                    `;

                                const icon = L.divIcon({
                                    className: 'custom-marker-div',
                                    html: iconHtml,
                                    iconSize: [60, 40],
                                    iconAnchor: [30, 42]
                                });

                                return (
                                    <Marker
                                        key={place.id}
                                        position={[place.lat, place.lng]}
                                        icon={icon}
                                        eventHandlers={{
                                            click: () => handlePinClick(place.id)
                                        }}
                                    />
                                )
                            })}
                        </MapContainer>
                    </div>

                    {/* UNIFIED TOP UI (Floating Dock) - 75% closer to edge (6 -> 1.5) */}
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-[95%] z-[500] pointer-events-none">
                        <div className="bg-white/95 backdrop-blur-xl rounded-[24px] shadow-xl border border-white/50 p-2 pointer-events-auto relative" ref={dropdownRef}>

                            {/* Unified Single Row */}
                            <div className="flex items-center gap-3 px-2 py-1.5">
                                {/* Location (Input) - Condensing for Single Line */}
                                <div className="flex items-center gap-1.5 shrink-0 border-r border-gray-100 pr-2 max-w-[120px]">
                                    <button className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                        <MapPin size={12} />
                                    </button>
                                    <div className="flex flex-col justify-center min-w-0 gap-1">
                                        <label className="text-[8px] font-black text-[#007E8F] uppercase tracking-wider leading-none truncate">Let's go to</label>
                                        <input
                                            type="text"
                                            defaultValue="Ubud, Bali"
                                            className="text-[11px] font-bold text-slate-900 leading-tight bg-transparent border-none p-0 w-full focus:ring-0 placeholder-gray-400 outline-none truncate"
                                        />
                                    </div>
                                </div>

                                {/* Filters (Scrollable, Tactile Row) */}
                                <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto scrollbar-hide py-0.5 carousel-momentum mask-linear-fade">
                                    {/* Dates */}
                                    <div className="relative shrink-0">
                                        <button
                                            onClick={(e) => toggleDropdown('dates', e)}
                                            className={clsx(
                                                "whitespace-nowrap px-2.5 py-1.5 rounded-full text-[10px] font-bold shadow-sm border flex items-center gap-1 active-scale transition-tactile",
                                                openDropdown === 'dates' ? "bg-slate-100 text-[#1A1A1A] border-gray-300" : "bg-[#1A1A1A]/5 text-[#1A1A1A] border-gray-200 hover:bg-[#1A1A1A]/10"
                                            )}
                                        >
                                            <Calendar size={10} className="text-slate-400" /> {dateRange} <ChevronDown size={10} className="text-[#1A1A1A]" />
                                        </button>
                                    </div>

                                    {/* Guests */}
                                    <div className="relative shrink-0">
                                        <button
                                            onClick={(e) => toggleDropdown('guests', e)}
                                            className={clsx(
                                                "whitespace-nowrap px-2.5 py-1.5 rounded-full text-[10px] font-bold shadow-sm border flex items-center gap-1 active-scale transition-tactile",
                                                openDropdown === 'guests' ? "bg-slate-100 text-[#1A1A1A] border-gray-300" : "bg-[#1A1A1A]/5 text-[#1A1A1A] border-gray-200 hover:bg-[#1A1A1A]/10"
                                            )}
                                        >
                                            <Users size={10} className="text-slate-400" /> {guestCount} <ChevronDown size={10} className="text-[#1A1A1A]" />
                                        </button>
                                    </div>

                                    {/* Filters */}
                                    <div className="relative shrink-0">
                                        <button
                                            onClick={(e) => toggleDropdown('filters', e)}
                                            className="whitespace-nowrap bg-slate-900/60 text-white px-2.5 py-1.5 rounded-full text-[10px] font-bold border border-white/10 backdrop-blur-md flex items-center gap-1 active-scale transition-tactile"
                                        >
                                            <Star size={10} fill="currentColor" className="text-white" /> {selectedFilter} <ChevronDown size={10} className="text-white" />
                                        </button>
                                    </div>

                                    <div className="relative shrink-0 pr-4">
                                        <button className="whitespace-nowrap px-2.5 py-1.5 rounded-full text-[10px] font-bold shadow-sm border bg-[#1A1A1A]/5 text-[#1A1A1A] border-gray-200 flex items-center gap-1 active-scale transition-tactile hover:bg-[#1A1A1A]/10 shrink-0">
                                            <SlidersHorizontal size={10} className="text-slate-400" /> More
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* FLOATING DROPDOWN LAYER (Absolute positioned, no height change) */}
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
                                            {openDropdown === 'dates' && <DateDropdown setRange={setDateRange} close={() => setOpenDropdown(null)} />}
                                            {openDropdown === 'guests' && <GuestDropdown count={guestCount} setCount={setGuestCount} close={() => setOpenDropdown(null)} />}
                                            {openDropdown === 'filters' && <FilterDropdown selected={selectedFilter} setSelected={setSelectedFilter} close={() => setOpenDropdown(null)} />}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* CAROUSEL LAYER - 75% closer to edge (4 -> 1) */}
                    <div className="absolute bottom-1 left-0 w-full z-[100] h-[340px] pb-2 pointer-events-none">
                        <div 
                            className="absolute left-0 top-[56px] z-[140] pointer-events-auto"
                        >
                            <button
                                onClick={() => setIsCardsVisible(open => !open)}
                                className="h-8 px-3 flex items-center justify-center text-slate-800 bg-white/85 backdrop-blur-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] border-y border-r border-white/80 rounded-r-[24px] active-scale transition-all hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#135bec]/25 focus:ring-offset-2"
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
                                            <X size={16} strokeWidth={2.5} />
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
                                    className="absolute inset-0 pointer-events-auto"
                                >
                                    <div
                                        ref={cardsContainerRef}
                                        className="flex overflow-x-auto snap-x snap-mandatory pl-11 pr-4 gap-4 scrollbar-hide pb-2 items-end h-full carousel-momentum"
                                        style={{ scrollPaddingLeft: '2.75rem' }}
                                    >
                                        {ACCOMMODATIONS.map((place) => {
                                            const isActive = place.id === activeId;
                                            return (
                                                <div
                                                    key={place.id}
                                                    ref={el => cardRefs.current[place.id] = el}
                                                    data-id={place.id}
                                                    className={clsx(
                                                        "snap-center shrink-0 w-[65%] transition-all duration-300 relative group",
                                                        isActive ? "scale-100 z-10" : "scale-95 z-0"
                                                    )}
                                                    onClick={() => {
                                                        if (!isActive) handlePinClick(place.id);
                                                    }}
                                                >
                                                    {/* Card Content - WHITE FROSTED GLASS */}
                                                    <div className={clsx(
                                                        "relative rounded-[24px] overflow-hidden backdrop-blur-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-white/80 p-2.5 flex flex-col gap-2 transition-colors duration-500",
                                                        "bg-white/85"
                                                    )}>
                                                        {/* Progress Shimmer */}
                                                        {isActive && bookingState !== 'idle' && (
                                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#135bec] to-transparent animate-pulse opacity-80 z-50"></div>
                                                        )}

                                                        {/* Image */}
                                                        <div className="h-32 w-full relative rounded-xl overflow-hidden shadow-sm shrink-0">
                                                            <img src={place.image} alt={place.name} className="w-full h-full object-cover transform decoration-0 group-hover:scale-105 transition-transform duration-700" />
                                                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                                                <Star size={9} className="text-yellow-500" fill="currentColor" />
                                                                <span className="text-[9px] font-bold text-slate-900">{place.rating}</span>
                                                            </div>

                                                            {place.tag && (
                                                                <div className={clsx(
                                                                    "absolute bottom-2 left-2 -rotate-6 px-2.5 py-1 shadow-lg transform origin-bottom-left z-20",
                                                                    place.tagClass || "bg-yellow-400 text-black"
                                                                )}>
                                                                    <span style={{ fontFamily: 'Caveat, cursive' }} className="text-xs font-bold leading-none block pt-0.5">{place.tag}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Info */}
                                                        <div className="px-1 pb-0.5">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <h3 className="text-sm font-bold text-slate-900 leading-tight tracking-tight line-clamp-1">{place.name}</h3>
                                                                    <p className="text-[10px] text-slate-500 flex items-center mt-0.5 font-medium line-clamp-1">
                                                                        <MapPin size={10} className="mr-0.5 text-slate-400" /> {place.distance}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right shrink-0">
                                                                    <span className="text-[10px] font-bold text-slate-500">from </span>
                                                                    <span className="text-sm font-black text-[#135bec]">${place.price}</span>
                                                                    <span className="text-[10px] font-bold text-slate-500">/night</span>
                                                                </div>
                                                            </div>

                                                            {/* Booking Button */}
                                                            <div className="flex flex-col items-center">
                                                                <button
                                                                    onClick={(e) => handleBook(e, place.id)}
                                                                    disabled={bookingState !== 'idle' || !isActive}
                                                                    style={{ borderRadius: '32px' }}
                                                                    className={clsx(
                                                                        "w-full py-2.5 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 relative overflow-hidden active-scale transition-tactile",
                                                                        bookingState === 'idle'
                                                                            ? (isActive ? "bg-[#135bec] hover:bg-blue-600 text-white shadow-blue-500/20 active:scale-[0.98]" : "bg-gray-100 text-gray-400")
                                                                            : "bg-slate-900 text-white cursor-wait"
                                                                    )}
                                                                >
                                                                    <AnimatePresence mode='wait'>
                                                                        {bookingState === 'idle' && (
                                                                            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                                                                                Book Now <ArrowRight size={14} />
                                                                            </motion.span>
                                                                        )}
                                                                        {bookingState === 'securing' && (
                                                                            <motion.span key="securing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2">
                                                                                <div className="w-2.5 h-2.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                                                                Securing...
                                                                            </motion.span>
                                                                        )}
                                                                        {bookingState === 'redirecting' && (
                                                                            <motion.span key="redirecting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2">
                                                                                Redirecting...
                                                                            </motion.span>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </button>
                                                                <p className="text-[11px] text-gray-500 text-center mt-1.5 font-bold tracking-wide">
                                                                    Secure booking. Free cancellation.
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
            <div className="max-w-[680px] mx-auto px-6 pb-[122px] text-[17px] leading-[1.6] text-typography-primary">
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
