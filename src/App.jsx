import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ACCOMMODATIONS } from './data'
import { Star, MapPin, ArrowRight, ArrowLeft, Heart, SlidersHorizontal, ChevronDown, ChevronUp, ChevronRight, Check, Calendar, Users, Plus, Minus, ChevronsUpDown, Lock, Hotel, Eye, EyeOff, X, Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

const BALI_MAP_CENTER = [-8.43, 115.18];
const BALI_MAP_ZOOM = 9;

function MapController({ isCardsVisible }) {
    const map = useMap();

    useEffect(() => {
        let frameId;
        const container = map.getContainer();

        const syncBaliView = () => {
            cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(() => {
                map.invalidateSize({ pan: false });
                map.setView(BALI_MAP_CENTER, BALI_MAP_ZOOM, { animate: false });
            });
        };

        syncBaliView();
        const timers = [120, 360, 900].map(delay => setTimeout(syncBaliView, delay));
        const observer = new ResizeObserver(syncBaliView);
        observer.observe(container);

        window.addEventListener('resize', syncBaliView);
        window.visualViewport?.addEventListener('resize', syncBaliView);

        return () => {
            cancelAnimationFrame(frameId);
            timers.forEach(clearTimeout);
            observer.disconnect();
            window.removeEventListener('resize', syncBaliView);
            window.visualViewport?.removeEventListener('resize', syncBaliView);
        };
    }, [map, isCardsVisible]);

    return null;
}

const DateDropdown = ({ dateRange, selectedMonth, setMonth, setRange, close }) => {
    const months = ['FEB', 'MAR', 'APR', 'MAY', 'JUN'];
    const days = [
        { d: 24, day: 'FRI' }, { d: 25, day: 'SAT' }, { d: 26, day: 'SUN' },
        { d: 27, day: 'MON' }, { d: 28, day: 'TUE' }, { d: 1, day: 'WED' },
        { d: 2, day: 'THU' }, { d: 3, day: 'FRI' }, { d: 4, day: 'SAT' }
    ];

    const formatMonthLabel = (month) => month.charAt(0) + month.slice(1).toLowerCase();

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="bg-white p-5 rounded-[40px] shadow-[0_18px_40px_rgba(15,23,42,0.14)] border-[3px] border-white z-[1000] w-72 flex flex-col gap-4 ring-1 ring-black/5 overflow-hidden"
        >
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Date</span>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">2026</span>
            </div>

            <div className="flex gap-6 overflow-x-auto scrollbar-hide py-1">
                {months.map((m, i) => (
                    <button 
                        key={m} 
                        onClick={() => {
                            setMonth(m);
                            setRange(m === 'FEB' ? 'Dates' : `${m} 2026`);
                            close();
                        }}
                        className={clsx(
                            "text-xs font-bold tracking-widest shrink-0 transition-colors active-scale transition-tactile", 
                            selectedMonth === m ? "text-slate-900" : "text-slate-500 hover:text-slate-600"
                        )}
                    >
                        {m}
                    </button>
                ))}
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 snap-x">
                {days.map((item, i) => {
                    const label = `${formatMonthLabel(selectedMonth)} ${item.d}`;
                    const isSelected = dateRange === label;
                    return (
                        <button
                            key={i}
                            onClick={() => {
                                setRange(label);
                                close();
                            }}
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
        className="bg-white p-5 rounded-[40px] shadow-[0_18px_40px_rgba(15,23,42,0.14)] border-[3px] border-white z-[1000] w-64 ring-1 ring-black/5"
    >
        <div className="flex items-center justify-between bg-white/50 rounded-2xl p-2">
            <button onClick={() => { setCount(Math.max(1, count - 1)); close(); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-slate-600 font-bold transition-all active-scale">-</button>
            <span className="text-sm font-bold text-slate-900">{count} Guests</span>
            <button onClick={() => { setCount(count + 1); close(); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-slate-600 font-bold transition-all active-scale">+</button>
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
                    selected === f ? "bg-[#135bec] text-white shadow-md shadow-blue-500/10" : "text-[#1A1A1A] hover:bg-slate-50"
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
    const [stage, setStage] = useState('concierge');

    useEffect(() => {
        const duration = 1000; 
        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const p = Math.min(elapsed / duration, 1);
            const easedP = 1 - Math.pow(1 - p, 2.2);

            setProgress(easedP * 100);

            if (p < 1) {
                requestAnimationFrame(animate);
            } else {
                setProgress(100);
                setTimeout(() => setStage('redirect'), 1400);
            }
        };

        requestAnimationFrame(animate);
    }, []);

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
                aria-live="polite"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center"
                >
                    <p className="text-[#1A1A1A] text-lg font-medium animate-pulse mb-2">opening...</p>
                    <h1 className="text-4xl font-bold text-[#003580] tracking-tight">booking.com</h1>
                </motion.div>
            </motion.div>
        )
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] overflow-hidden bg-[#eef6f8]/90 backdrop-blur-[24px] flex flex-col items-center justify-center p-6 text-center"
            aria-live="polite"
        >
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-[-8%] top-[10%] h-44 w-44 rounded-full bg-[#d8efdf]/80 blur-3xl" />
                <div className="absolute right-[-10%] top-[24%] h-52 w-52 rounded-full bg-[#dce9ff]/80 blur-3xl" />
                <div className="absolute left-[18%] bottom-[12%] h-56 w-56 rounded-full bg-[#f3dcc2]/70 blur-3xl" />
                <div className="absolute right-[8%] bottom-[18%] h-44 w-44 rounded-full bg-[#f6dee5]/65 blur-3xl" />
                <div className="absolute inset-0 bg-white/50" />
            </div>

            <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative z-10 max-w-md w-full"
            >
                <div className="mb-5 relative flex justify-center">
                    <div className="relative">
                        <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-[0_16px_36px_rgba(15,23,42,0.14)]">
                            <img
                                src={hotel.image}
                                alt={hotel.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white bg-[#34c759] shadow-[0_10px_22px_rgba(52,199,89,0.28)]">
                            <Check size={18} className="text-white" strokeWidth={3} />
                        </div>
                    </div>
                </div>

                <div className="relative mx-auto max-w-[360px] px-4 py-5 min-[390px]:px-6">
                    <div className="pointer-events-none absolute inset-x-[-34px] top-[-28px] bottom-[-34px] rounded-full bg-white/70 blur-2xl" />
                    <div className="pointer-events-none absolute inset-x-[-10px] top-[-6px] bottom-[-12px] rounded-full bg-white/42 blur-xl" />

                    <div className="relative">
                        <div className="mx-auto max-w-[18ch] text-balance text-[20px] font-bold leading-[1.14] tracking-tight text-[#171717] min-[390px]:text-[22px]">
                            Securing this rate at {hotel.name}
                        </div>

                        <p className="mx-auto mt-5 max-w-[28ch] text-[15px] font-medium leading-[1.45] text-slate-500 min-[390px]:text-[16px]">
                            Connecting you to our partner for the best available rate.
                        </p>

                        <div className="mx-auto mt-8 h-1.5 w-full max-w-[250px] overflow-hidden rounded-full bg-[#34c759]/18">
                            <motion.div
                                className="h-full rounded-full bg-[#34c759]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-5">
                            <div className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#bcefc8] bg-white px-5 text-[13px] font-bold text-[#23a34a]">
                                Price matched
                            </div>
                            <div className="min-w-[5ch] text-left text-[32px] font-semibold tabular-nums tracking-tight text-[#171717] min-[390px]:text-[34px]">
                                ${hotel.price}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
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
    const [selectedMonth, setSelectedMonth] = useState('MAY');
    const [guestCount, setGuestCount] = useState(1);
    const [selectedFilter, setSelectedFilter] = useState('Top Rated');
    const [isCardsVisible, setIsCardsVisible] = useState(true);
    const [expandedImageCardId, setExpandedImageCardId] = useState(null);

    const handleDateRangeChange = (value) => {
        setDateRange(value);
        setIsCardsVisible(false);
    };

    const handleGuestCountChange = (value) => {
        setGuestCount(value);
        setIsCardsVisible(false);
    };

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
    const cardsStageRef = useRef(null);
    const [cardsToggleTop, setCardsToggleTop] = useState(8);

    // 1. Scroll-Sync: Observer
    useEffect(() => {
        const container = cardsContainerRef.current;
        if (!container) return;

        let syncFrame;
        const observer = new IntersectionObserver((entries) => {
            if (isProgrammaticScroll.current) return;
            const mostVisible = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (!mostVisible) return;

            cancelAnimationFrame(syncFrame);
            syncFrame = requestAnimationFrame(() => {
                const id = Number(mostVisible.target.dataset.id);
                setActiveId(current => current === id ? current : id);
            });
        }, {
            root: container,
            threshold: 0.6
        });

        Object.values(cardRefs.current).forEach(card => {
            if (card) observer.observe(card);
        });

        return () => {
            cancelAnimationFrame(syncFrame);
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!isCardsVisible) return;

        let frameId;
        let resizeObserver;
        let activeShell;

        const measureToggleTop = () => {
            const stage = cardsStageRef.current;
            const activeCard = cardRefs.current[activeId];
            activeShell = activeCard?.firstElementChild;

            if (!stage || !activeShell) return;

            const nextTop = Math.max(0, Math.round(
                activeShell.getBoundingClientRect().top - stage.getBoundingClientRect().top
            ));

            setCardsToggleTop(current => current === nextTop ? current : nextTop);
        };

        measureToggleTop();
        frameId = requestAnimationFrame(measureToggleTop);
        const timers = [80, 220, 420].map(delay => setTimeout(measureToggleTop, delay));

        resizeObserver = new ResizeObserver(measureToggleTop);
        if (cardsStageRef.current) resizeObserver.observe(cardsStageRef.current);
        if (activeShell) resizeObserver.observe(activeShell);

        window.addEventListener('resize', measureToggleTop);
        window.visualViewport?.addEventListener('resize', measureToggleTop);

        return () => {
            cancelAnimationFrame(frameId);
            timers.forEach(clearTimeout);
            resizeObserver?.disconnect();
            window.removeEventListener('resize', measureToggleTop);
            window.visualViewport?.removeEventListener('resize', measureToggleTop);
        };
    }, [activeId, expandedImageCardId, isCardsVisible]);
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

    const handleImageToggle = (event, id) => {
        event.stopPropagation();
        if (!expandedImageCardId && !isCardsVisible) {
            setIsCardsVisible(true);
        }
        if (activeId !== id) {
            handlePinClick(id);
        }
        setExpandedImageCardId((current) => current === id ? null : id);
    };



    const handleBook = (e, id) => {
        e.stopPropagation();
        if (bookingState !== 'idle') return;
        setBookingState('concierge');
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-typography-primary">
            <article className="max-w-[680px] mx-auto w-full">
            <div className="blog-intro-content px-[18px] pt-3 pb-2">
                <a
                    href="/"
                    aria-label="Back to homepage"
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[11px] font-bold text-[#757575] shadow-sm shadow-slate-900/5 backdrop-blur-md transition-all hover:border-slate-300 hover:bg-white hover:text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#135bec]/25 focus:ring-offset-2 active:scale-[0.98] mb-5"
                >
                    <ArrowLeft size={13} strokeWidth={2.5} aria-hidden="true" />
                    Home
                </a>
                <span className="category-tag text-xs font-bold text-[#757575] uppercase tracking-widest mb-3 block">Bali, Indonesia</span>
                <h1 className="blog-title text-[34px] min-[390px]:text-3xl md:text-3xl font-bold text-[#1A1A1A] leading-[1.12] tracking-tight mb-6">
                    Escaping the Noise:
                    <br className="md:hidden" />
                    {' '}My Secret Spots in Ubud
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
                    <p className="mb-4">
                        I've stayed in places that are impossible to forget — they make me want to go back again and again.
                    </p>
                    <p>
                        These coordinates are more than just a map; they are the fragments of a Bali that still knows how to be quiet.
                    </p>
                </div>
            </div>

            <div className="w-full px-[18px] my-5 isolate">
                <div className="flex h-[75dvh] min-h-[430px] w-full min-w-0 flex-col bg-slate-100 overflow-hidden shadow-[0_11px_22px_rgba(0,0,0,0.12)] relative md:h-[min(850px,calc(100dvh-24px))] md:rounded-[2.5rem] md:border-8 md:border-white box-border ring-1 ring-gray-900/5">

                    <div className="absolute inset-0 z-0">
                        <MapContainer
                            center={BALI_MAP_CENTER}
                            zoom={BALI_MAP_ZOOM}
                            zoomControl={false}
                            scrollWheelZoom={true}
                            className="h-full w-full outline-none bg-white"
                            attributionControl={false}
                        >
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

                            <MapController isCardsVisible={isCardsVisible} />
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
                        <div className="bg-white/90 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-[3px] border-white/80 p-1 pl-3 pr-3 flex items-center pointer-events-auto relative" ref={dropdownRef}>
                            <div className="flex items-center gap-3 w-full overflow-hidden rounded-full">
                                <div className="flex items-center gap-1 shrink-0 border-r border-slate-200 pr-3 max-w-[110px]">
                                    <button className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                        <MapPin size={12} />
                                    </button>
                                    <div className="flex flex-col justify-center min-w-0 gap-0.5">
                                        <label className="text-[11px] font-black text-[#007E8F] uppercase tracking-wider leading-none truncate">Let's go to</label>
                                        <div className="flex items-center">
                                            <input
                                                type="text"
                                                defaultValue="Ubud, Bali"
                                                className="text-[11px] font-bold text-slate-900 leading-tight bg-transparent border-none p-0 w-full focus:ring-0 placeholder-gray-400 outline-none truncate"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto scrollbar-hide py-1.5 carousel-momentum [mask-image:linear-gradient(to_right,black_92%,transparent)]">
                                    <div className="relative shrink-0">
                                        <button
                                            onClick={(e) => toggleDropdown('dates', e)}
                                            aria-label="Select dates"
                                            aria-expanded={openDropdown === 'dates'}
                                            className={clsx(
                                                "whitespace-nowrap px-2 py-2.5 rounded-full text-[10px] font-bold shadow-sm border flex items-center gap-1 active-scale transition-tactile",
                                                openDropdown === 'dates' ? "bg-white/80 backdrop-blur-md text-[#1A1A1A] border-slate-300" : "bg-white/70 backdrop-blur-md text-[#1A1A1A] border-slate-200 hover:bg-white/80"
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
                                                "whitespace-nowrap px-2 py-2.5 rounded-full text-[10px] font-bold shadow-sm border flex items-center gap-1 active-scale transition-tactile",
                                                openDropdown === 'guests' ? "bg-white/80 backdrop-blur-md text-[#1A1A1A] border-slate-300" : "bg-white/70 backdrop-blur-md text-[#1A1A1A] border-slate-200 hover:bg-white/80"
                                            )}
                                        >
                                            <Users size={10} className="text-slate-600" aria-hidden="true" /> {guestCount} <ChevronDown size={10} className="text-[#1A1A1A]" />
                                        </button>
                                    </div>

                                    <div className="relative shrink-0">
                                        <button
                                            onClick={(e) => toggleDropdown('filters', e)}
                                            className="whitespace-nowrap bg-slate-900/50 text-white px-2 py-2.5 rounded-full text-[10px] font-bold border border-white/10 backdrop-blur-md flex items-center gap-1 active-scale transition-tactile"
                                        >
                                            <Star size={10} fill="currentColor" className="text-white" /> {selectedFilter} <ChevronDown size={10} className="text-white" />
                                        </button>
                                    </div>

                                    <div className="relative shrink-0">
                                        <button className="whitespace-nowrap px-3 py-2.5 rounded-full text-[10px] font-bold shadow-sm border bg-[#1A1A1A]/5 text-[#1A1A1A] border-gray-200 flex items-center gap-1 active-scale transition-tactile hover:bg-[#1A1A1A]/10 shrink-0">
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
                                            {openDropdown === 'dates' && <DateDropdown dateRange={dateRange} selectedMonth={selectedMonth} setMonth={setSelectedMonth} setRange={handleDateRangeChange} close={() => setOpenDropdown(null)} />}
                                            {openDropdown === 'guests' && <GuestDropdown count={guestCount} setCount={handleGuestCountChange} close={() => setOpenDropdown(null)} />}
                                            {openDropdown === 'filters' && <FilterDropdown selected={selectedFilter} setSelected={setSelectedFilter} close={() => setOpenDropdown(null)} />}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div ref={cardsStageRef} className="hotel-cards-stage absolute bottom-0 left-0 z-[100] w-full pointer-events-none">
                        <div 
                            className="hotel-cards-toggle absolute left-0 z-[500] pointer-events-auto"
                            style={{ top: `${cardsToggleTop}px` }}
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
                                    className="absolute bottom-0 left-0 right-0 h-full pointer-events-auto overflow-visible px-0 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2"
                                >
                                    <div
                                        ref={cardsContainerRef}
                                        className="flex h-full gap-3.5 overflow-x-auto overflow-y-visible snap-x snap-mandatory pl-11 pr-4 scrollbar-hide items-stretch overscroll-contain carousel-momentum"
                                        style={{ scrollPaddingLeft: '2.75rem' }}
                                    >
                                        {ACCOMMODATIONS.map((place) => {
                                            const isActive = place.id === activeId;
                                            const isImageExpanded = expandedImageCardId === place.id;
                                            return (
                                                <div
                                                    key={place.id}
                                                    id={`hotel-card-${place.id}`}
                                                    ref={el => cardRefs.current[place.id] = el}
                                                    data-id={place.id}
                                                    className={clsx(
                                                        "snap-center shrink-0 w-[95%] h-full relative group flex items-end",
                                                        isActive ? "z-10" : "z-0"
                                                    )}
                                                    onClick={() => {
                                                        if (!isActive) handlePinClick(place.id);
                                                    }}
                                                >
                                                    <div className={clsx(
                                                        "desktop-window-safe-card relative h-fit max-h-full w-full rounded-[24px] overflow-hidden border border-white/80 pt-[7.5px] px-[7.5px] pb-2 flex flex-col transition-all duration-500",
                                                        isActive ? "shadow-[0_12px_32px_rgba(0,0,0,0.18)] bg-white" : "shadow-[0_8px_24px_rgba(0,0,0,0.12)] bg-white"
                                                    )}>
                                                        {isActive && bookingState !== 'idle' && (
                                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#135bec] to-transparent animate-pulse opacity-80 z-50"></div>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={(event) => handleImageToggle(event, place.id)}
                                                            className="desktop-window-safe-image h-[103px] min-[390px]:h-[150px] min-[430px]:h-[168px] md:h-[182px] w-full relative rounded-xl min-[390px]:rounded-[18px] overflow-hidden shadow-sm shrink-0 text-left focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/80"
                                                            aria-label={isImageExpanded ? `Collapse ${place.name} image` : `Expand ${place.name} image`}
                                                        >
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
                                                                className="w-full h-full object-cover object-[center_55%] md:object-center origin-bottom"
                                                            />
                                                            <div className={clsx(
                                                                "absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-300",
                                                                isImageExpanded ? "opacity-100" : "opacity-0"
                                                            )} />
                                                            <div className="absolute top-2 left-2 bg-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
                                                                <Star size={10} className="text-yellow-500 fill-yellow-500" />
                                                                <span className="text-[11px] font-bold text-slate-900">{place.rating}</span>
                                                            </div>
                                                            {place.tag && (
                                                                <div className={clsx(
                                                                    "absolute top-2 right-2 px-3 py-1 min-[390px]:px-3.5 min-[390px]:py-1.5 md:px-4 md:py-2 shadow-lg transform -rotate-3 z-10",
                                                                    place.tagClass
                                                                )}>
                                                                    <span className="text-[14px] min-[390px]:text-[15px] md:text-[18px] font-bold tracking-normal leading-none" style={{ fontFamily: "'Caveat', cursive" }}>
                                                                        {place.tag}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="absolute bottom-2 right-2 z-10 rounded-full bg-white/44 px-2.5 py-1.5 min-[390px]:px-3 shadow-[0_8px_18px_rgba(255,255,255,0.18)] backdrop-blur-xl ring-1 ring-white/28">
                                                                <div className="h-1 w-6 min-[390px]:w-7 rounded-full bg-white/95" />
                                                            </div>
                                                        </button>

                                                        <AnimatePresence>
                                                            {isImageExpanded && (
                                                                <motion.button
                                                                    type="button"
                                                                    onClick={(event) => handleImageToggle(event, place.id)}
                                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    exit={{ opacity: 0, scale: 0.98 }}
                                                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                                                    className="absolute inset-[7.5px] z-30 overflow-hidden rounded-xl text-left focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/80"
                                                                    aria-label={`Collapse ${place.name} image`}
                                                                >
                                                                    <motion.img
                                                                        src={place.image}
                                                                        alt={place.name}
                                                                        animate={{ scale: 1.06 }}
                                                                        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                                                                        className="h-full w-full object-cover object-[center_55%] md:object-center"
                                                                    />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                                                                    <div className="absolute top-3 left-3 bg-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                                                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                                                                        <span className="text-[11px] font-bold text-slate-900">{place.rating}</span>
                                                                    </div>
                                                                    {place.tag && (
                                                                        <div className={clsx(
                                                                            "absolute top-3 right-3 px-3 py-1 shadow-lg transform -rotate-3",
                                                                            place.tagClass
                                                                        )}>
                                                                            <span className="text-[14px] font-bold leading-none" style={{ fontFamily: "'Caveat', cursive" }}>
                                                                                {place.tag}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    <div className="absolute bottom-3 left-3 right-3">
                                                                        <p className="text-[18px] min-[390px]:text-[20px] font-bold text-white tracking-tight">{place.name}</p>
                                                                        <div className="mt-2 flex justify-center">
                                                                            <div className="rounded-full bg-white/48 px-3 py-2 min-[390px]:px-3.5 shadow-[0_8px_24px_rgba(255,255,255,0.22)] backdrop-blur-xl ring-1 ring-white/30">
                                                                                <div className="h-1 w-10 min-[390px]:w-12 rounded-full bg-white/95" />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/30 p-2 shadow-[0_10px_26px_rgba(255,255,255,0.18)] backdrop-blur-xl ring-1 ring-white/28">
                                                                        <ChevronRight size={14} className="text-white" />
                                                                    </div>
                                                                </motion.button>
                                                            )}
                                                        </AnimatePresence>

                                                        <div className="desktop-window-safe-copy flex flex-1 min-h-0 flex-col justify-start pt-2 pb-0 px-0.5">
                                                            <div className="mb-0">
                                                                <h3 className="text-[14px] min-[390px]:text-[16px] md:text-[16.5px] font-bold text-slate-900 leading-tight tracking-tight line-clamp-1">{place.name}</h3>
                                                            </div>
                                                            <div className="flex justify-between items-baseline mt-0.5 mb-0 border-t border-slate-50 pt-0.5">
                                                                <p className="text-[11px] min-[390px]:text-[12px] md:text-[12px] text-slate-500 inline-flex items-baseline font-medium leading-none line-clamp-1">
                                                                    <MapPin size={11} className="mr-0.5 translate-y-[1px] text-slate-400" /> {place.distance}
                                                                </p>
                                                                <div className="flex items-baseline gap-1 shrink-0">
                                                                    <span className="text-[11px] font-bold text-slate-900 leading-none">from</span>
                                                                    <span className="text-[13px] min-[390px]:text-[16px] md:text-[15px] font-bold text-[#135bec] leading-none">${place.price}</span>
                                                                    <span className="text-[11px] font-bold text-slate-900 leading-none"> / night</span>
                                                                </div>
                                                            </div>

                                                            <div className="desktop-window-safe-cta-wrap mt-1 flex flex-col items-center pt-1 min-[390px]:pt-1.5">
                                                                <button
                                                                    onClick={(e) => handleBook(e, place.id)}
                                                                    disabled={bookingState !== 'idle' || !isActive}
                                                                    style={{ borderRadius: '32px' }}
                                                                    className={clsx(
                                                                        "desktop-window-safe-cta h-[42px] max-h-[46px] w-full py-0 text-[12px] min-[390px]:h-[46px] min-[390px]:text-[14px] font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 relative overflow-hidden active-scale transition-tactile",
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
                                                                                className="flex items-center gap-2.5"
                                                                            >
                                                                                Book Now <ArrowRight size={15} className="min-[390px]:size-4" />
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
                                                                <p className="desktop-window-safe-cancel text-[10px] min-[390px]:text-[11px] md:text-[12px] text-gray-500 text-center mt-1 min-[390px]:mt-1.5 font-semibold tracking-wide leading-none">
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

            <div className="px-[18px] pb-[61px] text-[17px] leading-[1.6] text-typography-primary">
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
            </article>

            {/* CONCIERGE OVERLAY */}
            <AnimatePresence>
                {bookingState === 'concierge' && (
                    <ConciergeOverlay
                        hotel={ACCOMMODATIONS.find(h => h.id === activeId)}
                        onClose={() => setBookingState('idle')}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
