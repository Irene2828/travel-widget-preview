import image1 from './image1.jpeg';
import image2 from './image2.jpeg';
import image3 from './image3.jpeg';
import image4 from './image4.jpeg';

export const ACCOMMODATIONS = [
    {
        id: 1,
        name: "Sanctuary Cove Resort",
        location: "Ubud, Bali",
        price: 350,
        rating: 4.9,
        distance: "1.2 km",
        image: image1,
        lat: -8.5069,
        lng: 115.2625,
        tag: "Traveller's Favorite",
        tagClass: "bg-yellow-400 text-black"
    },
    {
        id: 2,
        name: "Bamboo Haven Villa",
        location: "Tegallalang",
        price: 280,
        rating: 4.8,
        distance: "2.5 km",
        image: image2,
        lat: -8.4523,
        lng: 115.2801,
        tag: "Romantic Escape",
        tagClass: "bg-rose-400 text-white"
    },
    {
        id: 3,
        name: "Jungle Oases",
        location: "Payangan",
        price: 420,
        rating: 5.0,
        distance: "5.0 km",
        image: image3,
        lat: -8.4116,
        lng: 115.2497,
        tag: "Rare Find",
        tagClass: "bg-emerald-500 text-white"
    },
    {
        id: 4,
        name: "Rice Terrace Retreat",
        location: "Sebatu",
        price: 195,
        rating: 4.7,
        distance: "7.8 km",
        image: image4,
        lat: -8.3846,
        lng: 115.2863,
        tag: "New Concept",
        tagClass: "bg-indigo-600 text-white"
    },
    {
        id: 5,
        name: "Hidden Valley Glamping",
        location: "Kenderan",
        price: 150,
        rating: 4.6,
        distance: "3.2 km",
        image: image1,
        lat: -8.4688,
        lng: 115.2755,
        tag: "Eco-Design",
        tagClass: "bg-lime-200 text-lime-900"
    }
];
