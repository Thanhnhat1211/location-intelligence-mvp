
/**
 * Map Preview Card Component
 * Hiển thị bản đồ xem trước địa điểm và doanh nghiệp lân cận
 */

"use client";

import { Location } from "@/types/location";
import { NearbyBusiness } from "@/types/analysis";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation } from "lucide-react";

interface MapPreviewCardProps {
  location: Location;
  nearbyBusinesses?: NearbyBusiness[];
}

export function MapPreviewCard({ location, nearbyBusinesses = [] }: MapPreviewCardProps) {
  const { coordinates, address } = location;

  const placeholderMap = (
    <div className="w-full h-[300px] bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center rounded-lg">
      <div className="text-center">
        <MapPin className="w-12 h-12 mx-auto mb-2 text-primary" />
        <p className="text-sm font-medium">Bản đồ địa điểm</p>
        <p className="text-xs text-muted-foreground mt-1">
          {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
        </p>
      </div>
    </div>
  );

  const competitorCount = nearbyBusinesses.filter((b) => b.type === "competitor").length;
  const complementaryCount = nearbyBusinesses.filter((b) => b.type === "complementary").length;

  return (
    <Card className="overflow-hidden">
      {/* Map Display */}
      <div className="relative">
        {placeholderMap}
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur">
            <Navigation className="w-3 h-3 mr-1" />
            {nearbyBusinesses.length} doanh nghiệp lân cận
          </Badge>
        </div>
      </div>

      {/* Location Info */}
      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">{address.full}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {address.ward}, {address.district}, {address.city}
              </p>
            </div>
          </div>
        </div>

        {/* Coordinates */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Tọa độ:</span>
          <code className="px-2 py-1 bg-muted rounded text-xs">
            {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </code>
        </div>

        {/* Nearby Business Summary */}
        {nearbyBusinesses.length > 0 && (
          <div className="flex gap-2 pt-2 border-t">
            <Badge variant="destructive" className="text-xs">
              {competitorCount} đối thủ
            </Badge>
            <Badge variant="default" className="text-xs bg-green-600">
              {complementaryCount} bổ trợ
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {nearbyBusinesses.length - competitorCount - complementaryCount} khác
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
