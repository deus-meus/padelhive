<script lang="ts">
import { MapPin, Navigation } from "lucide-svelte";
import { onMount } from "svelte";

interface Props {
  location: string;
  city: string;
  venueName?: string;
  height?: string;
  lat?: number | null;
  lng?: number | null;
}

let {
  location,
  city,
  venueName = "",
  height = "320px",
  lat: propLat = null,
  lng: propLng = null,
}: Props = $props();

let mapContainer = $state<HTMLDivElement | null>(null);
let isMapLoading = $state(true);
let leafletMap: any = null;

// City fallback coordinates
function getCityCoordinates(cityName: string): [number, number] {
  const normalized = cityName.toLowerCase();
  if (
    normalized.includes("bali") ||
    normalized.includes("seminyak") ||
    normalized.includes("canggu") ||
    normalized.includes("kuta")
  ) {
    return [-8.6905, 115.1686]; // Seminyak / Bali
  }
  if (normalized.includes("bandung")) {
    return [-6.9175, 107.6191];
  }
  if (normalized.includes("surabaya")) {
    return [-7.2575, 112.7521];
  }
  // Default Jakarta / South Jakarta
  return [-6.2297, 106.8074];
}

onMount(() => {
  let activeMap: any = null;

  async function initMap() {
    if (!mapContainer) return;

    try {
      // Dynamic import to support SvelteKit SSR
      const L = (await import("leaflet")).default;

      let [lat, lng] = getCityCoordinates(city);

      if (
        typeof propLat === "number" &&
        typeof propLng === "number" &&
        !Number.isNaN(propLat) &&
        !Number.isNaN(propLng)
      ) {
        lat = propLat;
        lng = propLng;
      } else {
        // Geocode using OpenStreetMap Nominatim
        try {
          const query = encodeURIComponent(`${location}, ${city}, Indonesia`);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
            {
              headers: {
                "User-Agent": "Padelhive-App/1.0",
              },
            },
          );
          const data = await response.json();
          if (data && data.length > 0) {
            lat = parseFloat(data[0].lat);
            lng = parseFloat(data[0].lon);
          }
        } catch (geocodeErr) {
          console.warn("Geocoding fallback used:", geocodeErr);
        }
      }

      // Initialize Leaflet Map
      leafletMap = L.map(mapContainer, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });
      activeMap = leafletMap;

      // OpenStreetMap Tile Layer with CSS Dark Filter (100% Free, No API Key required)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        subdomains: "abc",
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(leafletMap);

      // Custom Zoom Control placed at top right
      L.control.zoom({ position: "topright" }).addTo(leafletMap);

      // Custom Glowing Cyan HTML Pin Icon
      const customIcon = L.divIcon({
        className: "custom-dark-map-pin",
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <span class="absolute inline-flex h-10 w-10 animate-ping rounded-full bg-[#50C8C8]/40 opacity-75"></span>
            <div class="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#50C8C8] bg-[#071521] text-[#50C8C8] shadow-[0_0_20px_rgba(80,200,200,0.6)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -42],
      });

      // Add Marker with Dark Theme Popup
      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(
        leafletMap,
      );

      if (venueName) {
        marker.bindPopup(
          `
          <div class="p-2 font-sans text-left min-w-[200px]">
            <div class="flex items-center gap-1.5 text-[#50C8C8] font-bold text-[10px] uppercase tracking-wider mb-1">
              <span class="h-1.5 w-1.5 rounded-full bg-[#50C8C8] animate-pulse"></span>
              Venue Location
            </div>
            <p class="font-bold text-sm text-[#F7F7F7] leading-tight">${venueName}</p>
            <p class="text-xs text-[#50C8C8] font-medium mt-1">${location}</p>
            <p class="text-[11px] text-[#F7F7F7]/50 mt-0.5">${city}, Indonesia</p>
          </div>
          `,
          {
            className: "custom-dark-popup",
          },
        );
      }

      isMapLoading = false;
    } catch (e) {
      console.error("Leaflet map initialization error:", e);
      isMapLoading = false;
    }
  }

  initMap();

  return () => {
    if (activeMap) {
      activeMap.remove();
    }
  };
});
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""
  />
</svelte:head>

<div
  class="relative w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-[#071521] shadow-xl"
  style="height: {height};"
>
  {#if isMapLoading}
    <div class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0C1B26] p-6 text-center">
      <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#50C8C8]/10 text-[#50C8C8] animate-pulse">
        <Navigation class="h-6 w-6" />
      </div>
      <p class="body-sm font-semibold text-[#F7F7F7]">{location}</p>
      <p class="caption text-[#F7F7F7]/40 mt-0.5">{city}, Indonesia</p>
    </div>
  {/if}

  <div bind:this={mapContainer} class="h-full w-full"></div>
</div>

<style>
  :global(.leaflet-container) {
    background-color: #071521 !important;
    font-family: inherit;
  }
  :global(.leaflet-tile-pane) {
    filter: invert(100%) hue-rotate(180deg) brightness(0.85) contrast(1.15);
  }
  :global(.custom-dark-map-pin) {
    background: transparent !important;
    border: none !important;
  }
  :global(.leaflet-control-zoom) {
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    background: rgba(7, 21, 33, 0.85) !important;
    backdrop-filter: blur(8px);
    border-radius: 12px !important;
    overflow: hidden;
    margin-top: 12px !important;
    margin-right: 12px !important;
  }
  :global(.leaflet-control-zoom-in),
  :global(.leaflet-control-zoom-out) {
    background: transparent !important;
    color: #f7f7f7 !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  }
  :global(.leaflet-control-zoom-in:hover),
  :global(.leaflet-control-zoom-out:hover) {
    background: rgba(80, 200, 200, 0.15) !important;
    color: #50c8c8 !important;
  }
  :global(.leaflet-popup-content-wrapper) {
    background: #0c1b26 !important;
    border: 1px solid rgba(80, 200, 200, 0.4) !important;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7) !important;
    border-radius: 16px !important;
    color: #f7f7f7 !important;
    padding: 2px !important;
  }
  :global(.leaflet-popup-content) {
    margin: 10px 14px !important;
    line-height: 1.4 !important;
  }
  :global(.leaflet-container a.leaflet-popup-close-button) {
    color: rgba(247, 247, 247, 0.5) !important;
    padding: 8px 10px 0 0 !important;
    font-size: 16px !important;
    font-weight: bold;
    transition: color 0.2s ease;
  }
  :global(.leaflet-container a.leaflet-popup-close-button:hover) {
    color: #50c8c8 !important;
    background: transparent !important;
  }
  :global(.leaflet-popup-tip) {
    background: #0c1b26 !important;
    border: 1px solid rgba(80, 200, 200, 0.4) !important;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5) !important;
  }
</style>
