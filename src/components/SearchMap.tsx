"use client";

import { useEffect, useRef } from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export function SearchMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [8.5622, 50.0379], // Frankfurt Airport coordinates [lng, lat]
      zoom: 13
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Example parking spots with properly typed coordinates
    const parkingSpots: { coordinates: [number, number]; title: string }[] = [
      { coordinates: [8.5622, 50.0379], title: "Airport Premium Parking" },
      { coordinates: [8.5602, 50.0359], title: "Value Park & Fly" },
    ];

    // Add markers
    parkingSpots.forEach(spot => {
      const marker = new mapboxgl.Marker()
        .setLngLat(spot.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<h3>${spot.title}</h3>`))
        .addTo(map.current!);
      
      markers.current.push(marker);
    });

    // Cleanup
    return () => {
      markers.current.forEach(marker => marker.remove());
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg p-4">
      <div
        ref={mapContainer}
        className="w-full h-[calc(100vh-12rem)] rounded-lg"
      />
    </div>
  );
} 