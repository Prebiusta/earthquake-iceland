import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface IMapProps {
    markers: Marker[];
}

export type Marker = {
    lon: number;
    lat: number;
    popupContent?: string;
    color: string;
    radius: number;
};

const Map = (props: IMapProps) => {
    useEffect(() => {
        // Initialize the map
        const map = L.map('map', { preferCanvas: true }).setView([64.9631, -19.0208], 7);

        // Create a tile layer (you can use different tile providers)
        L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
            attribution:
                'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
            maxZoom: 14,
        }).addTo(map);

        // Create a marker and add it to the map

        for (const marker of props.markers) {
            let circleMarker = L.circleMarker([marker.lat, marker.lon], {
                radius: marker.radius,
                color: marker.color,
            });

            if (marker.popupContent) {
                circleMarker = circleMarker.bindPopup(marker.popupContent);
            }

            circleMarker.addTo(map);
        }

        // Clean up the map when the component is unmounted
        return () => {
            map.remove();
        };
    }, [props]);

    return <div id='map' style={{ height: '700px', maxHeight: '80vh' }}></div>;
};

export default Map;
