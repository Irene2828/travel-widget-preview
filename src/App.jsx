import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ACCOMMODATIONS } from './data'
import { Star, MapPin, ArrowRight, Heart, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

// Map controller for smooth camera flyTo
// Map controller - REMOVED Auto-Pan
function MapController({ activeId, accommodations }) {
    // Static view, highlighting happens via marker state only
    return null;
}

const DateDropdown = ({ setRange, close }) => (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-9 left-0 bg-white p-3 rounded-2xl shadow-xl border border-gray-100 z-50 w-60 flex flex-col gap-2 ring-1 ring-black/5">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Quick Select</div>
        <div className="flex flex-col gap-1">
            <button onClick={() => { setRange('Feb 24 - 26'); close(); }} className="text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 flex justify-between items-center group transition-colors">
                This Weekend <span className="text-slate-400 font-normal group-hover:text-slate-500">Feb 24</span>
            </button>
            <button onClick={() => { setRange('Mar 03 - 05'); close(); }} className="text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 flex justify-between items-center group transition-colors">
                Next Weekend <span className="text-slate-400 font-normal group-hover:text-slate-500">Mar 03</span>
            </button>
        </div>
    </motion.div>
)

const GuestDropdown = ({ count, setCount, close }) => (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-9 left-0 bg-white p-3 rounded-2xl shadow-xl border border-gray-100 z-50 w-40 flex flex-col gap-2 ring-1 ring-black/5">
        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-1">
            <button onClick={() => setCount(Math.max(1, count - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white shadow-sm text-slate-600 font-bold transition-all">-</button>
            <span className="text-sm font-bold text-slate-900">{count}</span>
            <button onClick={() => setCount(count + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white shadow-sm text-slate-600 font-bold transition-all">+</button>
        </div>
        <button onClick={close} className="w-full py-2 bg-[#135bec] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">Apply</button>
    </motion.div>
)

const FilterDropdown = ({ selected, setSelected, close }) => (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-9 left-0 bg-white p-2 rounded-2xl shadow-xl border border-gray-100 z-50 w-48 flex flex-col gap-1 ring-1 ring-black/5">
        {['Top Rated', 'Rice Fields Nearby', 'Sea View Villas', 'Private Pool'].map(f => (
            <button key={f} onClick={() => { setSelected(f); close(); }} className={clsx("text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-between", selected === f ? "bg-[#007E8F]/10 text-[#007E8F]" : "text-slate-600 hover:bg-slate-50")}>
                {f}
                {selected === f && <div className="w-1.5 h-1.5 rounded-full bg-[#007E8F]" />}
            </button>
        ))}
    </motion.div>
)

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
    const [dateRange, setDateRange] = useState('Dates');
    const [guestCount, setGuestCount] = useState(2);
    const [selectedFilter, setSelectedFilter] = useState('Top Rated');

    const toggleDropdown = (name) => setOpenDropdown(curr => curr === name ? null : name);

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

        setBookingState('securing');

        // Step 1: Securing Rate (2s)
        setTimeout(() => {
            setBookingState('redirecting');

            // Step 2: Handoff (1.5s)
            setTimeout(() => {
                setBookingState('done');
                console.log("Redirecting to Affiliate Link...");
            }, 1500);
        }, 2000);
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-typography-primary pb-[100px]">

            {/* Blog Intro */}
            <article className="blog-intro-content max-w-[680px] mx-auto px-6 pt-12 pb-8">
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

            {/* IMMERSIVE WIDGET CONTAINER - ALIGNED WITH BLOG TEXT */}
            <div className="w-full max-w-[680px] mx-auto h-[85vh] md:h-[850px] bg-slate-100 md:rounded-[2.5rem] overflow-hidden shadow-2xl relative md:border-8 md:border-white box-border ring-1 ring-gray-900/5 mb-20 isolate">

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
                        <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-[#135bec] -mt-[2px]"></div>
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

                {/* UNIFIED TOP UI (Floating Dock) */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] z-30 pointer-events-none">
                    <div className="bg-white/95 backdrop-blur-xl rounded-[24px] shadow-xl border border-white/50 p-2 pointer-events-auto flex flex-col gap-3">

                        {/* Row 1: Search Header */}
                        <div className="flex items-center gap-3 px-2 pt-1">
                            <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 active:scale-95 transition-transform">
                                <MapPin size={16} />
                            </button>
                            <div className="flex-1">
                                <h2 className="text-[10px] font-extrabold text-[#007E8F] uppercase tracking-wider leading-none mb-1.5">Where would you stay?</h2>
                                <p className="text-sm font-bold text-slate-900 leading-none">Ubud, Bali</p>
                            </div>
                            <button className="w-8 h-8 rounded-full bg-[#135bec]/10 flex items-center justify-center text-[#135bec] active:scale-95 transition-transform">
                                <SlidersHorizontal size={14} />
                            </button>
                        </div>

                        {/* Row 2: Divider */}
                        <div className="h-px w-full bg-gray-100"></div>

                        {/* Row 3: Filters (Integrated) */}
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 px-1 relative">
                            {/* Dates */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown('dates')}
                                    className={clsx(
                                        "whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm border flex items-center gap-1 active:scale-95 transition-transform hover:bg-gray-50",
                                        openDropdown === 'dates' ? "bg-slate-100 text-slate-900 border-gray-300" : "bg-white text-slate-700 border-gray-200"
                                    )}
                                >
                                    {dateRange} <ChevronDown size={12} className="text-slate-400" />
                                </button>
                                <AnimatePresence>
                                    {openDropdown === 'dates' && <DateDropdown setRange={setDateRange} close={() => setOpenDropdown(null)} />}
                                </AnimatePresence>
                            </div>

                            {/* Guests */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown('guests')}
                                    className={clsx(
                                        "whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm border flex items-center gap-1 active:scale-95 transition-transform hover:bg-gray-50",
                                        openDropdown === 'guests' ? "bg-slate-100 text-slate-900 border-gray-300" : "bg-white text-slate-700 border-gray-200"
                                    )}
                                >
                                    {guestCount} Guests <ChevronDown size={12} className="text-slate-400" />
                                </button>
                                <AnimatePresence>
                                    {openDropdown === 'guests' && <GuestDropdown count={guestCount} setCount={setGuestCount} close={() => setOpenDropdown(null)} />}
                                </AnimatePresence>
                            </div>

                            {/* Filters */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown('filters')}
                                    className="whitespace-nowrap bg-[#007E8F]/10 px-3 py-1.5 rounded-full text-[11px] font-bold text-[#007E8F] border border-[#007E8F]/20 flex items-center gap-1 active:scale-95 transition-transform"
                                >
                                    <Star size={10} fill="currentColor" /> {selectedFilter} <ChevronDown size={12} />
                                </button>
                                <AnimatePresence>
                                    {openDropdown === 'filters' && <FilterDropdown selected={selectedFilter} setSelected={setSelectedFilter} close={() => setOpenDropdown(null)} />}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM CARDS CAROUSEL */}
                <div className="absolute bottom-4 left-0 w-full z-[100] pb-2">
                    <div
                        ref={cardsContainerRef}
                        className="flex overflow-x-auto snap-x snap-mandatory px-4 gap-4 scrollbar-hide pb-2 items-end h-[340px]"
                        style={{ scrollPaddingLeft: '17.5%' }}
                    >
                        {ACCOMMODATIONS.map((place) => {
                            const isActive = place.id === activeId;
                            return (
                                <div
                                    key={place.id}
                                    ref={el => cardRefs.current[place.id] = el}
                                    data-id={place.id}
                                    className={clsx(
                                        "snap-center shrink-0 w-[65%] transition-all duration-300 relative group", // Shorter Width
                                        isActive ? "scale-100 z-10" : "scale-95 z-0"
                                    )}
                                    onClick={() => {
                                        if (!isActive) handlePinClick(place.id);
                                    }}
                                >
                                    {/* Card Content - WHITE FROSTED GLASS */}
                                    <div className={clsx(
                                        "relative rounded-[20px] overflow-hidden backdrop-blur-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-white/80 p-2.5 flex flex-col gap-2 transition-colors duration-500",
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

                                            {place.id === 1 && (
                                                <div className="absolute bottom-2 left-2 -rotate-6 bg-yellow-400 text-black px-2.5 py-1 shadow-lg transform origin-bottom-left z-20">
                                                    <span style={{ fontFamily: 'Caveat, cursive' }} className="text-xs font-bold leading-none block pt-0.5">Traveller's Favorite</span>
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

                                            {/* Booking Button - PREMIUM BLUE ROUNDED 32px */}
                                            <div className="flex flex-col items-center">
                                                <button
                                                    onClick={(e) => handleBook(e, place.id)}
                                                    disabled={bookingState !== 'idle' || !isActive}
                                                    style={{ borderRadius: '32px' }}
                                                    className={clsx(
                                                        "w-full py-2.5 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 relative overflow-hidden",
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

                                                <p className="text-[9px] text-slate-800 text-center mt-1.5 font-bold italic tracking-wide opacity-90">
                                                    Rooms like this get sold out quickly
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-400/50 rounded-full z-[200] opacity-50 backdrop-blur-sm"></div>

                {/* Whiteout Overlay */}
                <AnimatePresence>
                    {bookingState === 'done' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 z-[9999] bg-white pointer-events-none flex items-center justify-center"
                        />
                    )}
                </AnimatePresence>
            </div>

            <div className="max-w-[680px] mx-auto px-6 pb-24 text-[17px] leading-[1.6] text-typography-primary">
                <h3 className="text-xl font-bold mb-3">Why this area matters</h3>
                <p className="text-typography-secondary mb-6">
                    Staying in these specific coordinates puts you exactly 10 minutes from the Monkey Forest but far enough to avoid the tour bus crowds. It’s the sweet spot for digital nomads and peace-seekers alike.
                </p>
            </div>

        </div>
    )
}
