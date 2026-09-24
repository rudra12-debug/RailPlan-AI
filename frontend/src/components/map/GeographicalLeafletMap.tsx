"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { RailwayCorridor, RiskLevel } from "@/lib/types";
import { LiveTrain, MaintenanceBlockZone } from "./LiveCorridorMap";
import { EngineeringCautionZone, CautionZoneType } from "@/lib/cautionZonesData";
import { 
  Layers, 
  MapPin, 
  Radio, 
  Navigation, 
  Maximize2, 
  Compass, 
  Train, 
  ShieldAlert, 
  Sparkles,
  ExternalLink,
  Waves,
  Mountain,
  Gauge,
  AlertOctagon,
  Filter
} from "lucide-react";

interface GeographicalLeafletMapProps {
  corridors: RailwayCorridor[];
  activeCorridor: RailwayCorridor;
  selectedCorridorId: string;
  trains: LiveTrain[];
  maintenanceBlocks: MaintenanceBlockZone[];
  cautionZones: EngineeringCautionZone[];
  selectedCautionZone: EngineeringCautionZone | null;
  activeLayer: "ALL" | "TRAFFIC" | "MAINTENANCE" | "TRACTION" | "KAVACH";
  selectedTrain: LiveTrain | null;
  selectedBlock: MaintenanceBlockZone | null;
  selectedStation: any | null;
  cautionFilter?: "ALL" | CautionZoneType;
  onSelectCorridor: (corridor: RailwayCorridor) => void;
  onSelectStation: (stn: any) => void;
  onSelectTrain: (train: LiveTrain) => void;
  onSelectBlock: (block: MaintenanceBlockZone) => void;
  onSelectCautionZone: (zone: EngineeringCautionZone | null) => void;
}

type TileProvider = "DARK" | "SATELLITE" | "STREET";

// Strict Geographic Boundaries for India: Locks Leaflet so user cannot pan outside the subcontinent
const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [6.0, 67.5],  // Southwest: Indian Ocean / Lakshadweep Sea
  [37.5, 97.8], // Northeast: Jammu & Kashmir / Ladakh / Arunachal Pradesh
];

export const GeographicalLeafletMap: React.FC<GeographicalLeafletMapProps> = ({
  corridors,
  activeCorridor,
  selectedCorridorId,
  trains,
  maintenanceBlocks,
  cautionZones,
  selectedCautionZone,
  cautionFilter: cautionFilterProp,
  activeLayer,
  selectedTrain,
  selectedBlock,
  selectedStation,
  onSelectCorridor,
  onSelectStation,
  onSelectTrain,
  onSelectBlock,
  onSelectCautionZone,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const railOverlayRef = useRef<any>(null);
  const polylinesLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const trainsLayerRef = useRef<any>(null);
  const blocksLayerRef = useRef<any>(null);
  const cautionZonesLayerRef = useRef<any>(null);

  const [activeTile, setActiveTile] = useState<TileProvider>("DARK");
  const [showRailOverlay, setShowRailOverlay] = useState<boolean>(false);
  const [internalCautionFilter, setInternalCautionFilter] = useState<"ALL" | CautionZoneType>("ALL");
  const cautionFilter = cautionFilterProp !== undefined ? cautionFilterProp : internalCautionFilter;
  const [leafletLoaded, setLeafletLoaded] = useState<boolean>(false);
  const [currentZoom, setCurrentZoom] = useState<number>(5);
  const leafletModuleRef = useRef<any>(null);

  // Initialize Leaflet instance on mount with strict India-Only constraints
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;
      leafletModuleRef.current = L.default || L;

      // Fix default Leaflet icon paths in Webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Avoid double initialization
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initial center strictly locked on India [22.5, 79.5]
      const map = L.map(mapContainerRef.current, {
        center: [22.5, 79.5],
        zoom: 5,
        minZoom: 4.8,
        maxZoom: 18,
        maxBounds: INDIA_BOUNDS,
        maxBoundsViscosity: 1.0, // Hard bounce lock: strictly prevents panning outside India
        zoomControl: false,
        attributionControl: false,
      });

      // Custom Zoom Control bottom-left (Keeps right side clean for Hazards Side Legend)
      L.control.zoom({ position: "bottomleft" }).addTo(map);

      // Track zoom level
      map.on("zoomend", () => {
        if (isMounted) setCurrentZoom(map.getZoom());
      });

      // Base Tile Layer (ESRI World Dark Gray Base - Clean, No API Key, No Watermark)
      const baseTile = L.tileLayer(
        "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          maxNativeZoom: 16,
          zIndex: 1,
        }
      );
      baseTile.on("tileerror", () => {});
      baseTile.addTo(map);
      tileLayerRef.current = baseTile;

      // OpenRailwayMap Live Track Infrastructure Overlay (Added on-demand with zIndex 10)
      const railTile = L.tileLayer(
        "https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png",
        {
          subdomains: "abc",
          maxZoom: 19,
          maxNativeZoom: 18,
          opacity: 0.85,
          zIndex: 10,
        }
      );
      railTile.on("tileerror", () => {});
      railOverlayRef.current = railTile;

      // Feature Group Layers
      polylinesLayerRef.current = L.featureGroup().addTo(map);
      cautionZonesLayerRef.current = L.featureGroup().addTo(map);
      blocksLayerRef.current = L.featureGroup().addTo(map);
      markersLayerRef.current = L.featureGroup().addTo(map);
      trainsLayerRef.current = L.featureGroup().addTo(map);

      mapInstanceRef.current = map;
      if (selectedCorridorId !== "ALL" && activeCorridor?.geoCoordinates && activeCorridor.geoCoordinates.length > 0) {
        const bounds = L.latLngBounds(activeCorridor.geoCoordinates as any);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10 });
      }
      setLeafletLoaded(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Switch Tile Provider
  useEffect(() => {
    const L = leafletModuleRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map || !leafletLoaded) return;

    if (tileLayerRef.current) {
      try {
        map.removeLayer(tileLayerRef.current);
      } catch (e) {
        // Safe layer cleanup
      }
    }

    let url = "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
    let tileOptions: any = {
      maxZoom: 19,
      maxNativeZoom: 16,
      zIndex: 1,
    };

    if (activeTile === "SATELLITE") {
      url = "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      tileOptions = {
        maxZoom: 19,
        maxNativeZoom: 18,
        zIndex: 1,
      };
    } else if (activeTile === "STREET") {
      url = "https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
      tileOptions = {
        maxZoom: 19,
        maxNativeZoom: 18,
        zIndex: 1,
      };
    }

    const newLayer = L.tileLayer(url, tileOptions);
    newLayer.on("tileerror", () => {
      // Safe tile error handling
    });
    newLayer.addTo(map);
    tileLayerRef.current = newLayer;

    // Keep railway overlay above base tiles if active
    if (railOverlayRef.current && showRailOverlay && map.hasLayer(railOverlayRef.current)) {
      railOverlayRef.current.setZIndex(10);
    }
  }, [activeTile, leafletLoaded]);

  // Toggle Railway Overlay
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !railOverlayRef.current || !leafletLoaded) return;

    try {
      if (showRailOverlay) {
        if (!map.hasLayer(railOverlayRef.current)) {
          map.addLayer(railOverlayRef.current);
        }
        railOverlayRef.current.setZIndex(10);
      } else {
        if (map.hasLayer(railOverlayRef.current)) {
          map.removeLayer(railOverlayRef.current);
        }
      }
    } catch (e) {
      // Safe layer toggle
    }
  }, [showRailOverlay, leafletLoaded]);

  // Fly Camera when corridor selection changes
  useEffect(() => {
    const L = leafletModuleRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map || !leafletLoaded) return;

    if (selectedCorridorId === "ALL") {
      map.flyTo([22.5, 79.5], 5, { duration: 1.2 });
    } else if (activeCorridor?.geoCoordinates && activeCorridor.geoCoordinates.length > 0) {
      const bounds = L.latLngBounds(activeCorridor.geoCoordinates as any);
      map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 10, duration: 1.2 });
    }
  }, [selectedCorridorId, activeCorridor, leafletLoaded]);

  // Status Color Helper
  const getStatusColor = (status: RiskLevel) => {
    switch (status) {
      case "CRITICAL":
        return "#EF4444";
      case "MEDIUM_RISK":
        return "#F97316";
      case "ATTENTION":
        return "#F59E0B";
      case "PLANNED":
        return "#06B6D4";
      case "NORMAL":
      default:
        return "#10B981";
    }
  };

  // Render Polylines, Caution Zones, and Stations
  useEffect(() => {
    const L = leafletModuleRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map || !leafletLoaded) return;

    // Clear previous vector layers
    polylinesLayerRef.current.clearLayers();
    cautionZonesLayerRef.current.clearLayers();
    markersLayerRef.current.clearLayers();
    blocksLayerRef.current.clearLayers();

    const isNationalView = selectedCorridorId === "ALL";

    // 1. Draw Corridor Polylines
    corridors.forEach((corr) => {
      if (!corr.geoCoordinates || corr.geoCoordinates.length < 2) return;
      const isCurrent = activeCorridor.id === corr.id;

      if (!isNationalView && !isCurrent) {
        L.polyline(corr.geoCoordinates as any, {
          color: "#0F263D",
          weight: 1.5,
          opacity: 0.30,
          dashArray: "3, 5",
        }).addTo(polylinesLayerRef.current);
        return;
      }

      const color = isNationalView ? "#00F2FE" : "#00F2FE";

      // Glow backdrop
      const glowPoly = L.polyline(corr.geoCoordinates as any, {
        color: color,
        weight: isNationalView ? 6 : 9,
        opacity: isNationalView ? 0.35 : 0.45,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(polylinesLayerRef.current);

      // Core rail line
      const linePoly = L.polyline(corr.geoCoordinates as any, {
        color: color,
        weight: isNationalView ? 3 : 4,
        opacity: 1,
      }).addTo(polylinesLayerRef.current);

      linePoly.bindTooltip(
        `<div style="background: #030914; color: #F8FAFC; border: 1.5px solid rgba(0,242,254,0.45); border-radius: 8px; padding: 8px 12px; font-family: ui-monospace, monospace; font-size: 11px; width: 280px; max-width: 88vw; box-sizing: border-box; white-space: normal; word-break: break-word; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.95), 0 0 14px rgba(0,242,254,0.25);">
          <strong style="color: #00F2FE; font-size: 12px;">${corr.id}</strong> • ${corr.name.split("(")[0]}
          <br/><span style="color: #BAC2FF; font-size: 10px;">Route Length: ${corr.totalLengthKm} KM • Zone: ${corr.zone}</span>
          ${isNationalView ? `<br/><span style="color: #10E7B2; font-size: 10px; font-weight: bold; margin-top: 2px; display: inline-block;">👉 Click to focus this corridor</span>` : ""}
        </div>`,
        { sticky: true, className: "custom-leaflet-tooltip" }
      );

      const handlePolyClick = () => {
        onSelectCorridor(corr);
      };

      glowPoly.on("click", handlePolyClick);
      linePoly.on("click", handlePolyClick);
    });

    // 2. Draw Engineering Caution Zones (River Bridges, Mountain Slopes, Speed Restrictions, Critical Bottlenecks)
    const filteredCautionZones = cautionZones.filter((zone) => {
      // Filter by corridor
      if (!isNationalView && zone.corridorId !== activeCorridor.id) return false;
      // Filter by hazard type
      if (cautionFilter !== "ALL" && zone.type !== cautionFilter) return false;
      return true;
    });

    filteredCautionZones.forEach((zone) => {
      const isSelected = selectedCautionZone?.id === zone.id;
      let zoneColor = "#00E5FF";
      let zoneIconEmoji = "🌊";
      let dashPattern = "6, 4";

      if (zone.type === "GHAT_SLOPE") {
        zoneColor = "#F59E0B";
        zoneIconEmoji = "⛰️";
        dashPattern = "8, 3";
      } else if (zone.type === "SPEED_LIMIT") {
        zoneColor = "#FACC15";
        zoneIconEmoji = "⛔";
        dashPattern = "4, 4";
      } else if (zone.type === "CRITICAL_HAZARD") {
        zoneColor = "#EF4444";
        zoneIconEmoji = "🚨";
        dashPattern = "2, 2";
      }

      // Draw highlighted track segment for the hazard
      const hazardPoly = L.polyline([zone.startCoord, zone.centerCoord, zone.endCoord], {
        color: zoneColor,
        weight: isSelected ? 10 : 7,
        opacity: isSelected ? 1 : 0.85,
        dashArray: dashPattern,
        lineCap: "round",
      }).addTo(cautionZonesLayerRef.current);

      // Marker Badge at Center of Hazard
      const isCompact = isNationalView && currentZoom < 7.5;
      
      const badgeHtml = isCompact
        ? `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          ${isSelected ? `<div style="position: absolute; width: 28px; height: 28px; top: -4px; border-radius: 50%; border: 2px solid ${zoneColor}; opacity: 0.8; animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ""}
          <div style="width: 20px; height: 20px; background: #000D18; border: 2px solid ${zoneColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.9), 0 0 6px ${zoneColor}60; transition: transform 0.15s ease;">
            <span style="font-size: 10px; line-height: 1;">${zoneIconEmoji}</span>
          </div>
        </div>
        `
        : `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          ${isSelected ? `<div style="position: absolute; width: 34px; height: 34px; top: -6px; border-radius: 50%; border: 2px solid ${zoneColor}; opacity: 0.7; animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ""}
          <div style="background: #000D18; border: 2px solid ${zoneColor}; border-radius: 6px; padding: 2px 6px; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 14px rgba(0,0,0,0.9), 0 0 8px ${zoneColor}35; white-space: nowrap;">
            <span style="font-size: 11px;">${zoneIconEmoji}</span>
            <span style="font-size: 9px; font-weight: 800; color: ${zoneColor}; font-family: monospace;">${zone.name.split(" ")[0]}</span>
            <span style="background: ${zoneColor}25; color: ${zoneColor}; font-size: 8.5px; font-weight: 800; font-family: monospace; padding: 1px 3px; border-radius: 3px;">
              ${zone.speedLimitKmph}k
            </span>
          </div>
          <div style="width: 7px; height: 7px; background: ${zoneColor}; border: 1.5px solid #000D18; border-radius: 50%; margin-top: 1px;"></div>
        </div>
      `;

      const hazardIcon = L.divIcon({
        html: badgeHtml,
        className: "custom-hazard-marker",
        iconSize: isCompact ? [20, 20] : [80, 28],
        iconAnchor: isCompact ? [10, 10] : [40, 24],
      });

      const hazardMarker = L.marker(zone.centerCoord, { icon: hazardIcon }).addTo(cautionZonesLayerRef.current);

      // Rich Engineering Tooltip (Zero Overflow, Responsive Word-Wrap)
      const tooltipContent = `
        <div style="background: #030914; color: #F8FAFC; border: 1.5px solid ${zoneColor}; border-radius: 8px; padding: 10px 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; width: 320px; max-width: 88vw; box-sizing: border-box; white-space: normal; word-break: break-word; overflow: hidden; box-shadow: 0 16px 36px rgba(0,0,0,0.95), 0 0 16px ${zoneColor}40;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <strong style="color: ${zoneColor}; font-size: 12px; line-height: 1.35; word-break: break-word; flex: 1; min-width: 0;">
              ${zoneIconEmoji} ${zone.name}
            </strong>
            <span style="flex-shrink: 0; background: ${zoneColor}25; color: ${zoneColor}; border: 1px solid ${zoneColor}60; padding: 2px 6px; border-radius: 4px; font-size: 8.5px; font-weight: 800; letter-spacing: 0.05em;">
              ${zone.severity}
            </span>
          </div>
          <div style="color: #00F2FE; font-weight: 700; font-size: 10.5px; margin-bottom: 4px; line-height: 1.35; word-break: break-word;">
            📍 ${zone.environmentalCondition}
          </div>
          <div style="color: #EF4444; font-weight: 800; font-size: 10.5px; margin-bottom: 6px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); border-radius: 4px; padding: 3px 6px; line-height: 1.3; word-break: break-word;">
            ⛔ Speed Restriction: ${zone.speedLimitKmph} km/h <span style="color: #BAC2FF; font-weight: normal; font-size: 9px;">(Normal: ${zone.normalSpeedKmph} km/h)</span>
          </div>
          <p style="color: #E2E8F0; font-size: 10px; line-height: 1.45; margin: 0 0 6px 0; word-break: break-word; white-space: normal;">
            ${zone.conditionDescription}
          </p>
          <div style="border-top: 1px solid rgba(56,189,248,0.15); padding-top: 5px; font-size: 9.5px; color: #BAC2FF; display: flex; flex-direction: column; gap: 2px; line-height: 1.3; word-break: break-word;">
            <div>Dept: <span style="color: #F8FAFC; font-weight: 600;">${zone.departmentResponsible}</span></div>
            <div>Rule: <span style="color: #F59E0B; font-weight: 600;">${zone.statutoryRule}</span></div>
          </div>
          <div style="color: #00F2FE; font-size: 9.5px; margin-top: 6px; font-weight: bold; border-top: 1px dashed rgba(56,189,248,0.25); padding-top: 4px;">
            👉 Click to inspect live sensors in Side Panel
          </div>
        </div>
      `;

      hazardPoly.bindTooltip(tooltipContent, { sticky: true, className: "custom-leaflet-tooltip" });
      hazardMarker.bindTooltip(tooltipContent, { direction: "top", offset: [0, -10], className: "custom-leaflet-tooltip" });

      const handleHazardClick = () => {
        const corr = corridors.find((c) => c.id === zone.corridorId);
        if (corr) onSelectCorridor(corr);
        onSelectCautionZone(zone);
        if (map) {
          map.flyTo(zone.centerCoord, 10, { duration: 1 });
        }
      };

      hazardPoly.on("click", handleHazardClick);
      hazardMarker.on("click", handleHazardClick);
    });

    // 3. Draw Active Maintenance Blocks
    if (activeLayer === "ALL" || activeLayer === "MAINTENANCE") {
      maintenanceBlocks.forEach((block) => {
        const corr = corridors.find((c) => c.id === block.corridorId);
        if (!corr || !corr.geoCoordinates || corr.geoCoordinates.length < 2) return;
        if (!isNationalView && activeCorridor.id !== block.corridorId) return;

        const totalKm = corr.totalLengthKm || 100;
        const startFraction = Math.min(Math.max(block.startKm / totalKm, 0), 1);
        const endFraction = Math.min(Math.max(block.endKm / totalKm, 0), 1);

        const totalPoints = corr.geoCoordinates.length;
        const sIdx = Math.min(Math.floor(startFraction * (totalPoints - 1)), totalPoints - 1);
        const eIdx = Math.min(Math.max(Math.ceil(endFraction * (totalPoints - 1)), sIdx + 1), totalPoints - 1);

        const segmentCoords = corr.geoCoordinates.slice(sIdx, eIdx + 1);
        if (segmentCoords.length >= 2) {
          const blockPoly = L.polyline(segmentCoords as any, {
            color: "#EF4444",
            weight: 7,
            opacity: 0.9,
            dashArray: "6, 6",
          }).addTo(blocksLayerRef.current);

          blockPoly.bindTooltip(
            `<div style="background: #090E1A; color: #F8FAFC; border: 1.5px solid #EF4444; border-radius: 8px; padding: 8px 12px; font-family: ui-monospace, monospace; font-size: 11px; width: 280px; max-width: 88vw; box-sizing: border-box; white-space: normal; word-break: break-word; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.9);">
              <span style="color: #F87171; font-weight: bold; font-size: 11.5px;">⚠️ TSR ${block.speedRestrictionKmph} km/h • ${block.blockType}</span>
              <br/><span style="color: #E2E8F0; font-size: 10.5px; margin-top: 3px; display: inline-block;">${block.name}</span>
              <br/><span style="color: #94A3B8; font-size: 9.5px; margin-top: 2px; display: inline-block;">${block.responsibleDept} • ${block.timeRemaining}</span>
            </div>`,
            { sticky: true, className: "custom-leaflet-tooltip" }
          );

          blockPoly.on("click", () => onSelectBlock(block));
        }
      });
    }

    // 4. Draw Station Markers: ZERO CLUTTER LEVEL-OF-DETAIL
    const MAJOR_TERMINALS = new Set(["NDLS", "MMCT", "CSMT", "HWH", "MAS", "SBC", "BPL", "ADI"]);

    if (isNationalView) {
      // IN PAN-INDIA NATIONAL VIEW:
      // Render ONLY the 8 primary apex junction hubs as subtle glowing dots with tooltips on hover.
      const renderedCodes = new Set<string>();

      corridors.forEach((corr) => {
        corr.stations.forEach((stn) => {
          if (!stn.lat || !stn.lng || !MAJOR_TERMINALS.has(stn.code)) return;
          if (renderedCodes.has(stn.code)) return;
          renderedCodes.add(stn.code);

          const iconHtml = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <div style="width: 10px; height: 10px; border-radius: 50%; background: #06B6D4; border: 2px solid #020617; box-shadow: 0 0 10px #06B6D4;"></div>
            </div>
          `;

          const stationIcon = L.divIcon({
            html: iconHtml,
            className: "custom-station-icon-national",
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });

          const marker = L.marker([stn.lat, stn.lng], { icon: stationIcon }).addTo(markersLayerRef.current);

          marker.bindTooltip(
            `<div style="background: #090E1A; color: #F8FAFC; border: 1.5px solid #06B6D4; border-radius: 8px; padding: 8px 12px; font-family: ui-monospace, monospace; font-size: 11px; width: 260px; max-width: 88vw; box-sizing: border-box; white-space: normal; word-break: break-word; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.9);">
              <span style="color: #22D3EE; font-weight: bold; font-size: 11.5px;">🏢 ${stn.name} (${stn.code})</span>
              <br/><span style="color: #94A3B8; font-size: 10px; margin-top: 2px; display: inline-block;">Major National Junction Terminal</span>
              <br/><span style="color: #F59E0B; font-size: 9.5px; margin-top: 2px; display: inline-block;">👉 Click to view corridor</span>
            </div>`,
            { direction: "top", offset: [0, -6], className: "custom-leaflet-tooltip" }
          );

          marker.on("click", () => {
            onSelectCorridor(corr);
            onSelectStation(stn);
          });
        });
      });
    } else {
      // IN CORRIDOR FOCUS VIEW:
      // Render stations of this specific active corridor. Spaced out cleanly!
      activeCorridor.stations.forEach((stn) => {
        if (!stn.lat || !stn.lng) return;
        const isSelected = selectedStation?.code === stn.code;
        const markerColor = stn.hasActiveBlock ? "#EF4444" : isSelected ? "#06B6D4" : "#10B981";

        const iconHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
            ${stn.hasActiveBlock ? `<div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: #EF4444; opacity: 0.5; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ""}
            <div style="position: absolute; top: -19px; background: #020617; border: 1px solid ${isSelected ? "#06B6D4" : "#334155"}; border-radius: 4px; padding: 1px 5px; font-size: 9px; font-family: monospace; font-weight: bold; color: ${isSelected ? "#22D3EE" : "#F8FAFC"}; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.8);">
              ${stn.code} ${stn.km !== undefined ? `<span style="color: #94A3B8; font-size: 8px;">${stn.km}k</span>` : ""}
            </div>
            <div style="width: ${isSelected ? "12px" : "9px"}; height: ${isSelected ? "12px" : "9px"}; border-radius: 50%; background: ${markerColor}; border: 2px solid #020617; box-shadow: 0 0 8px ${markerColor};"></div>
          </div>
        `;

        const stationIcon = L.divIcon({
          html: iconHtml,
          className: "custom-station-icon-focused",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([stn.lat, stn.lng], { icon: stationIcon }).addTo(markersLayerRef.current);

        marker.bindTooltip(
          `<div style="background: #090E1A; color: #F8FAFC; border: 1.5px solid #10B981; border-radius: 8px; padding: 8px 12px; font-family: ui-monospace, monospace; font-size: 11px; width: 260px; max-width: 88vw; box-sizing: border-box; white-space: normal; word-break: break-word; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.9);">
            <strong style="color: #34D399; font-size: 11.5px;">${stn.name} (${stn.code})</strong>
            <br/><span style="color: #94A3B8; font-size: 10px; margin-top: 2px; display: inline-block;">Station KM: ${stn.km ?? "N/A"} • ${activeCorridor.name.split("(")[0]}</span>
            ${stn.hasActiveBlock ? `<br/><span style="color: #EF4444; font-weight: bold; font-size: 10px; margin-top: 2px; display: inline-block;">⚠️ Active Maintenance Block</span>` : ""}
          </div>`,
          { direction: "top", offset: [0, -12], className: "custom-leaflet-tooltip" }
        );

        marker.on("click", () => {
          onSelectStation(stn);
        });
      });
    }
  }, [
    corridors,
    activeCorridor,
    selectedCorridorId,
    maintenanceBlocks,
    cautionZones,
    selectedCautionZone,
    cautionFilter,
    activeLayer,
    selectedStation,
    leafletLoaded,
    onSelectCorridor,
    onSelectStation,
    onSelectBlock,
    onSelectCautionZone,
  ]);

  // Render Dynamic Live Moving Trains
  useEffect(() => {
    const L = leafletModuleRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map || !leafletLoaded) return;

    trainsLayerRef.current.clearLayers();

    if (activeLayer !== "ALL" && activeLayer !== "TRAFFIC" && activeLayer !== "KAVACH") return;

    const isNationalView = selectedCorridorId === "ALL";

    trains.forEach((trn) => {
      const corr = corridors.find((c) => c.id === trn.corridorId);
      if (!corr || !corr.geoCoordinates || corr.geoCoordinates.length < 2) return;

      const isCurrentCorridor = activeCorridor.id === trn.corridorId;
      const isTrainSelected = selectedTrain?.id === trn.id;
      const trainColor = trn.type === "Vande Bharat" ? "#06B6D4" : trn.type === "Rajdhani Express" ? "#EF4444" : "#F59E0B";

      if (!isNationalView && !isCurrentCorridor) return;

      const coords = corr.geoCoordinates;
      const totalSegs = coords.length - 1;
      const segIndex = Math.min(Math.floor((trn.progressPercent / 100) * totalSegs), totalSegs - 1);
      const segFraction = ((trn.progressPercent / 100) * totalSegs) - segIndex;

      const p1 = coords[segIndex];
      const p2 = coords[segIndex + 1] || p1;

      const currentLat = p1[0] + (p2[0] - p1[0]) * segFraction;
      const currentLng = p1[1] + (p2[1] - p1[1]) * segFraction;

      let iconHtml = "";
      let iconSize: [number, number] = [16, 16];
      let iconAnchor: [number, number] = [8, 8];

      if (isNationalView) {
        iconHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid ${trainColor}; opacity: 0.6; animation: ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${trainColor}; border: 1.5px solid #020617; box-shadow: 0 0 6px ${trainColor};"></div>
          </div>
        `;
        iconSize = [16, 16];
        iconAnchor = [8, 8];
      } else {
        iconHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            ${isTrainSelected ? `<div style="position: absolute; width: 36px; height: 36px; top: -6px; border-radius: 50%; border: 2px solid ${trainColor}; opacity: 0.6; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ""}
            <div style="background: #020617; border: 1.5px solid ${trainColor}; border-radius: 4px; padding: 2px 5px; display: flex; align-items: center; gap: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.8);">
              <span style="font-size: 8.5px; font-weight: bold; color: ${trainColor}; font-family: monospace;">🚆 ${trn.trainNumber}</span>
              <span style="background: ${trainColor}25; color: ${trainColor}; font-size: 7.5px; font-weight: bold; font-family: monospace; padding: 1px 3px; border-radius: 2px;">${trn.speedKmph}k</span>
            </div>
            <div style="width: 7px; height: 7px; background: ${trainColor}; border: 1.5px solid #090E1A; border-radius: 50%; margin-top: 2px;"></div>
          </div>
        `;
        iconSize = [56, 30];
        iconAnchor = [28, 26];
      }

      const trainIcon = L.divIcon({
        html: iconHtml,
        className: "custom-train-marker",
        iconSize,
        iconAnchor,
      });

      const marker = L.marker([currentLat, currentLng], { icon: trainIcon }).addTo(trainsLayerRef.current);

      marker.bindTooltip(
        `<div style="width: 280px; max-width: 88vw; box-sizing: border-box; background: #020617; color: #F8FAFC; border: 1.5px solid ${trainColor}; border-radius: 8px; padding: 8px 10px; font-family: monospace; font-size: 11px; box-shadow: 0 8px 24px rgba(0,0,0,0.9); white-space: normal; word-break: break-word; overflow: hidden;">
          <strong style="color: ${trainColor}; display: block; margin-bottom: 3px; font-size: 12px; word-break: break-word;">🚆 ${trn.trainNumber} • ${trn.name}</strong>
          <div style="color: #94A3B8; margin-bottom: 2px;">Type: ${trn.type} • Speed: <strong style="color: #F8FAFC;">${trn.speedKmph} km/h</strong></div>
          <div style="color: #38BDF8; margin-bottom: 2px; word-break: break-word;">Route: ${corr.name.split("(")[0]}</div>
          <div style="color: #10B981; margin-bottom: 2px;">Section: ${trn.currentStation} ➔ ${trn.nextStation}</div>
          ${trn.delayMinutes > 0 ? `<div style="color: #F59E0B; font-weight: bold;">Delay: +${trn.delayMinutes} min</div>` : `<div style="color: #10B981; font-weight: bold;">Status: Right Time (RT)</div>`}
        </div>`,
        { direction: "top", offset: [0, -10], className: "custom-leaflet-tooltip" }
      );

      marker.on("click", () => {
        if (corr) onSelectCorridor(corr);
        onSelectTrain(trn);
      });
    });
  }, [
    trains,
    corridors,
    activeCorridor,
    selectedCorridorId,
    activeLayer,
    selectedTrain,
    leafletLoaded,
    onSelectCorridor,
    onSelectTrain,
  ]);

  return (
    <div className="relative w-full h-[400px] sm:h-[520px] bg-[#050914] overflow-hidden select-none">
      {/* Real Leaflet Slippy Map Container (Locked to India Bounds) */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Basemap Provider Switcher (Top-Right) */}
      <div className="absolute top-2 right-2 sm:top-3.5 sm:right-3.5 z-[1000] flex flex-wrap items-center justify-end gap-1 sm:space-x-1.5 max-w-[calc(100%-1rem)] bg-[#022642] p-1 sm:p-1.5 rounded-xl border-2 border-black shadow-[3px_3px_0_#000000] text-[10px] sm:text-xs select-none">
        <button
          onClick={() => setActiveTile("DARK")}
          className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-black transition flex items-center space-x-1 border border-black ${
            activeTile === "DARK"
              ? "bg-[#6367FF] text-white shadow-[1px_1px_0_#000000]"
              : "bg-[#000D18] text-[#CABFFF] hover:text-white"
          }`}
          title="ESRI Dark Mode OCC Railway Grid"
        >
          <span>🌙 <span className="hidden sm:inline">Dark </span>OCC</span>
        </button>
        <button
          onClick={() => setActiveTile("SATELLITE")}
          className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-black transition flex items-center space-x-1 border border-black ${
            activeTile === "SATELLITE"
              ? "bg-[#FFFF00] text-black shadow-[1px_1px_0_#000000]"
              : "bg-[#000D18] text-[#CABFFF] hover:text-white"
          }`}
          title="ESRI High-Resolution Photographic Satellite Imagery"
        >
          <span>🛰️ <span className="hidden sm:inline">Satellite</span><span className="sm:hidden">Sat</span></span>
        </button>
        <button
          onClick={() => setActiveTile("STREET")}
          className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-black transition flex items-center space-x-1 border border-black ${
            activeTile === "STREET"
              ? "bg-[#00FFD2] text-black shadow-[1px_1px_0_#000000]"
              : "bg-[#000D18] text-[#CABFFF] hover:text-white"
          }`}
          title="Street View"
        >
          <span>🗺️ <span className="hidden sm:inline">Street</span><span className="sm:hidden">Map</span></span>
        </button>

        {/* Railway Overlay Toggle */}
        <button
          onClick={() => setShowRailOverlay(!showRailOverlay)}
          className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg font-black transition border border-black ${
            showRailOverlay
              ? "bg-[#00FFD2] text-black shadow-[1px_1px_0_#000000]"
              : "bg-[#000D18] text-[#CABFFF] hover:text-white"
          }`}
          title="Toggle OpenRailwayMap Real Track Infrastructure Lines"
        >
          <span>🚆 Tracks: {showRailOverlay ? "ON" : "OFF"}</span>
        </button>
      </div>

      {/* Floating Center Controls (Bottom-Right) */}
      <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-[1000] flex flex-col space-y-1 sm:space-y-1.5">
        <button
          onClick={() => {
            const map = mapInstanceRef.current;
            if (map) map.flyTo([22.5, 79.5], 5, { duration: 1 });
            onSelectCorridor({ id: "ALL" } as any);
            onSelectCautionZone(null);
          }}
          className="p-1.5 sm:p-2 rounded-xl bg-[#022642] hover:bg-[#03345A] border-2 border-black text-white shadow-[2px_2px_0_#000000] sm:shadow-[3px_3px_0_#000000] transition flex items-center space-x-1 sm:space-x-1.5 text-[11px] sm:text-xs font-mono font-bold cursor-pointer"
          title="Reset View to India Boundaries"
        >
          <Compass className="w-3.5 h-3.5 text-[#00FFD2]" />
          <span>India Overview</span>
        </button>
        {activeCorridor?.geoCoordinates && selectedCorridorId !== "ALL" && (
          <button
            onClick={() => {
              const L = leafletModuleRef.current;
              const map = mapInstanceRef.current;
              if (L && map && activeCorridor.geoCoordinates) {
                const bounds = L.latLngBounds(activeCorridor.geoCoordinates as any);
                map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 9, duration: 1 });
              }
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-[#022642] hover:bg-[#03345A] border-2 border-black text-white shadow-[2px_2px_0_#000000] sm:shadow-[3px_3px_0_#000000] transition flex items-center space-x-1 sm:space-x-1.5 text-[11px] sm:text-xs font-mono font-bold cursor-pointer"
            title={`Center on ${activeCorridor.id}`}
          >
            <Navigation className="w-3.5 h-3.5 text-[#00FFD2]" />
            <span>{activeCorridor.id}</span>
          </button>
        )}
      </div>
    </div>
  );
};
