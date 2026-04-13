"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Coordinates } from "@/types/location";

interface LocationMapProps {
  coordinates: Coordinates | null;
  onLocationSelect: (coords: Coordinates, address: string) => void;
  nearbyBusinesses?: Array<{
    name: string;
    type: string;
    coordinates: Coordinates;
    distance: number;
  }>;
}

// District centers for HCMC
const DISTRICT_CENTERS: Record<string, { lat: number; lng: number; name: string }> = {
  "quan-1": { lat: 10.7756, lng: 106.7019, name: "Quận 1" },
  "quan-3": { lat: 10.7866, lng: 106.6839, name: "Quận 3" },
  "binh-thanh": { lat: 10.8050, lng: 106.7138, name: "Bình Thạnh" },
  "phu-nhuan": { lat: 10.7990, lng: 106.6825, name: "Phú Nhuận" },
  "go-vap": { lat: 10.8376, lng: 106.6717, name: "Gò Vấp" },
  "thu-duc": { lat: 10.8509, lng: 106.7623, name: "Thủ Đức" },
  "quan-2": { lat: 10.7868, lng: 106.7512, name: "Quận 2" },
  "quan-4": { lat: 10.7578, lng: 106.7012, name: "Quận 4" },
  "quan-5": { lat: 10.7558, lng: 106.6636, name: "Quận 5" },
  "quan-6": { lat: 10.7469, lng: 106.6353, name: "Quận 6" },
  "quan-7": { lat: 10.7340, lng: 106.7218, name: "Quận 7" },
  "quan-8": { lat: 10.7402, lng: 106.6284, name: "Quận 8" },
  "quan-10": { lat: 10.7735, lng: 106.6683, name: "Quận 10" },
  "quan-11": { lat: 10.7632, lng: 106.6501, name: "Quận 11" },
  "tan-binh": { lat: 10.8015, lng: 106.6528, name: "Tân Bình" },
  "tan-phu": { lat: 10.7920, lng: 106.6285, name: "Tân Phú" },
  "binh-tan": { lat: 10.7653, lng: 106.6037, name: "Bình Tân" },
};

export function LocationMap({ coordinates, onLocationSelect, nearbyBusinesses = [] }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet (client-side only)
    import("leaflet").then((L) => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const defaultCenter: [number, number] = coordinates
        ? [coordinates.lat, coordinates.lng]
        : [10.7756, 106.7019]; // HCMC center

      const map = L.map(mapRef.current!, {
        center: defaultCenter,
        zoom: coordinates ? 16 : 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add click handler
      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;

        // Update or create marker
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
          markerRef.current.on("dragend", async (ev: any) => {
            const pos = ev.target.getLatLng();
            const addr = await reverseGeocode(pos.lat, pos.lng);
            setSelectedAddress(addr);
            onLocationSelect({ lat: pos.lat, lng: pos.lng }, addr);
          });
        }

        const addr = await reverseGeocode(lat, lng);
        setSelectedAddress(addr);
        onLocationSelect({ lat, lng }, addr);

        markerRef.current.bindPopup(`<b>${addr}</b><br/>Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`).openPopup();
      });

      // If coordinates provided, add marker
      if (coordinates) {
        markerRef.current = L.marker([coordinates.lat, coordinates.lng], { draggable: true }).addTo(map);
        markerRef.current.on("dragend", async (ev: any) => {
          const pos = ev.target.getLatLng();
          const addr = await reverseGeocode(pos.lat, pos.lng);
          setSelectedAddress(addr);
          onLocationSelect({ lat: pos.lat, lng: pos.lng }, addr);
        });
      }

      mapInstanceRef.current = map;
      setIsMapReady(true);

      // Fix map size on next tick
      setTimeout(() => map.invalidateSize(), 100);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update map when coordinates change externally
  useEffect(() => {
    if (!mapInstanceRef.current || !coordinates) return;

    mapInstanceRef.current.setView([coordinates.lat, coordinates.lng], 16, { animate: true });

    if (markerRef.current) {
      markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
    } else {
      import("leaflet").then((L) => {
        markerRef.current = L.marker([coordinates.lat, coordinates.lng], { draggable: true }).addTo(mapInstanceRef.current);
      });
    }
  }, [coordinates]);

  // Add nearby business markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || nearbyBusinesses.length === 0) return;

    import("leaflet").then((L) => {
      const typeColors: Record<string, string> = {
        competitor: "#dc2626",
        complementary: "#16a34a",
        neutral: "#6b7280",
      };

      nearbyBusinesses.slice(0, 20).forEach((biz) => {
        const color = typeColors[biz.type] || "#6b7280";
        const circleMarker = L.circleMarker([biz.coordinates.lat, biz.coordinates.lng], {
          radius: 6,
          fillColor: color,
          color: "#fff",
          weight: 2,
          fillOpacity: 0.8,
        }).addTo(mapInstanceRef.current);

        circleMarker.bindPopup(`<b>${biz.name}</b><br/>${biz.distance}m`);
      });
    });
  }, [nearbyBusinesses, isMapReady]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const addr = await reverseGeocode(lat, lng);
        setSelectedAddress(addr);
        onLocationSelect({ lat, lng }, addr);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
        }
      },
      () => {
        alert("Không thể lấy vị trí. Vui lòng cho phép truy cập vị trí.");
      }
    );
  };

  return (
    <Card className="overflow-hidden">
      {/* Map */}
      <div className="relative">
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        />
        <div
          ref={mapRef}
          className="w-full h-[350px] z-0"
          style={{ background: "#e8e4df" }}
        />

        {/* Overlay buttons */}
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 backdrop-blur shadow-md"
            onClick={handleLocateMe}
          >
            <Crosshair className="w-4 h-4 mr-1.5" />
            Vị trí của tôi
          </Button>
        </div>

        {!coordinates && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-black/10 pointer-events-none">
            <div className="bg-white/95 backdrop-blur rounded-xl px-5 py-3 shadow-lg text-center">
              <MapPin className="w-6 h-6 mx-auto mb-1 text-[#344F3C]" />
              <p className="text-sm font-medium">Click vào bản đồ để chọn địa điểm</p>
              <p className="text-xs text-muted-foreground">hoặc kéo thả marker để điều chỉnh</p>
            </div>
          </div>
        )}
      </div>

      {/* Location info */}
      {coordinates && (
        <div className="p-4 space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-1 text-[#344F3C] flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">
                {selectedAddress || "Đang xác định địa chỉ..."}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </p>
            </div>
          </div>
          {nearbyBusinesses.length > 0 && (
            <div className="flex gap-2 pt-2 border-t border-border/60">
              <Badge variant="destructive" className="text-xs">
                {nearbyBusinesses.filter(b => b.type === "competitor").length} đối thủ
              </Badge>
              <Badge className="text-xs bg-emerald-600 border-0">
                {nearbyBusinesses.filter(b => b.type === "complementary").length} bổ trợ
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {nearbyBusinesses.filter(b => b.type === "neutral").length} khác
              </Badge>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=vi`,
      { headers: { "User-Agent": "LocationIntelligenceMVP/1.0" } }
    );
    if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const data = await res.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}
