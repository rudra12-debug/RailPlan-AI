export type CautionZoneType = 
  | 'RIVER_BRIDGE' 
  | 'GHAT_SLOPE' 
  | 'SPEED_LIMIT' 
  | 'CRITICAL_HAZARD';

export interface EngineeringCautionZone {
  id: string;
  corridorId: string;
  name: string;
  type: CautionZoneType;
  severity: 'CRITICAL' | 'WARNING' | 'CAUTION' | 'MONITORING';
  locationKm: string;
  speedLimitKmph: number;
  normalSpeedKmph: number;
  conditionDescription: string;
  environmentalCondition: string; // e.g. "Over Narmada River", "1:80 Falling Mountain Slope", etc.
  departmentResponsible: 'Civil (ENG)' | 'Electrical (ELEC)' | 'Signal & Traffic (SNT)' | 'Safety (SFTY)';
  statutoryRule: string; // e.g. "G&SR 4.09 / IRPWM Para 804"
  startCoord: [number, number]; // [lat, lng]
  endCoord: [number, number];   // [lat, lng]
  centerCoord: [number, number];// [lat, lng]
  sensorTelemetry?: {
    sensorName: string;
    reading: string;
    status: 'NORMAL' | 'ALERT' | 'TRIPPED';
  }[];
}

export const ENGINEERING_CAUTION_ZONES: EngineeringCautionZone[] = [
  // ==========================================
  // 1. BHOPAL - ITARSI CORRIDOR (BPL-ET)
  // ==========================================
  {
    id: "ZONE-RIV-01",
    corridorId: "BPL-ET",
    name: "Narmada River Mega-Bridge No. 248",
    type: "RIVER_BRIDGE",
    severity: "CRITICAL",
    locationKm: "Km 78.4 – 81.2",
    speedLimitKmph: 30,
    normalSpeedKmph: 120,
    environmentalCondition: "Over Narmada River (Deep Basin Crossing)",
    conditionDescription: "14-Span Steel Through-Truss Bridge. High Flood Level (HFL) acoustic sonar active. High-wind anemometer enforces 30 km/h TSR when gusts exceed 55 km/h.",
    departmentResponsible: "Civil (ENG)",
    statutoryRule: "IRPWM Para 804 (Super-Bridge Waterway Safety & TSR Order)",
    startCoord: [22.7580, 77.7250],
    endCoord: [22.7490, 77.7320],
    centerCoord: [22.7535, 77.7285],
    sensorTelemetry: [
      { sensorName: "Water Level Gauge", reading: "298.4m (1.6m below Danger Mark)", status: "NORMAL" },
      { sensorName: "Crosswind Anemometer", reading: "42 km/h East-to-West", status: "ALERT" },
      { sensorName: "Pier 7 Scour Depth", reading: "0.28m (Permissible < 0.6m)", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-SLP-01",
    corridorId: "BPL-ET",
    name: "Barkhera–Budni Vindhyachal Mountain Incline & Catch Siding",
    type: "GHAT_SLOPE",
    severity: "CRITICAL",
    locationKm: "Km 58.0 – 68.5",
    speedLimitKmph: 30,
    normalSpeedKmph: 110,
    environmentalCondition: "1:80 Falling Mountain Gradient & Dense Gorge Cutting",
    conditionDescription: "Continuous falling slope through Vindhyachal Ghats. Mandatory brake test at Barkhera. Midha Catch Siding 1 & 2 armed with runaway train interlock trap points.",
    departmentResponsible: "Safety (SFTY)",
    statutoryRule: "G&SR 4.09 & WCR Special Ghat Operating Manual Para 12",
    startCoord: [22.8250, 77.6780],
    endCoord: [22.7800, 77.7100],
    centerCoord: [22.8025, 77.6940],
    sensorTelemetry: [
      { sensorName: "Incline Runaway Radar", reading: "All Rakes Within Braking Envelope", status: "NORMAL" },
      { sensorName: "Catch Siding Sand Hump", reading: "Armed & Interlocked with Signal Aspect", status: "NORMAL" },
      { sensorName: "Rail Temperature Sensor", reading: "46.2°C (Track Buckling Safe)", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-CRIT-01",
    corridorId: "BPL-ET",
    name: "Itarsi Junction 4-Way Diamond Yard",
    type: "CRITICAL_HAZARD",
    severity: "CRITICAL",
    locationKm: "Km 118.0 – 120.0",
    speedLimitKmph: 15,
    normalSpeedKmph: 30,
    environmentalCondition: "High-Wear Diamond Rail Crossings & Heavy Turnout Fatigue",
    conditionDescription: "Busiest railway junction in Central India intersecting 4 arterial trunk corridors. High tongue-rail wear and point machine stress under 180 trains/day.",
    departmentResponsible: "Signal & Traffic (SNT)",
    statutoryRule: "G&SR 3.38 Facing Point Interlocking Speed Cap",
    startCoord: [22.6200, 77.7580],
    endCoord: [22.6070, 77.7620],
    centerCoord: [22.6133, 77.7600],
    sensorTelemetry: [
      { sensorName: "Point Machine Motor Current", reading: "2.4A (Clean throw)", status: "NORMAL" },
      { sensorName: "Digital Axle Counter (DAC)", reading: "Zero Track Circuit Failures in 72h", status: "NORMAL" }
    ]
  },

  // ==========================================
  // 2. DELHI - MUMBAI CENTRAL (NDLS-MMCT)
  // ==========================================
  {
    id: "ZONE-RIV-02",
    corridorId: "NDLS-MMCT",
    name: "Yamuna River Super-Bridge No. 12 (Mathura)",
    type: "RIVER_BRIDGE",
    severity: "CAUTION",
    locationKm: "Km 142.0 – 144.2",
    speedLimitKmph: 45,
    normalSpeedKmph: 130,
    environmentalCondition: "Over Yamuna River Flood Basin",
    conditionDescription: "Multi-span steel girder bridge. Under-bridge ultrasonic scour sensors active to detect alluvial bed erosion during seasonal monsoon river flow.",
    departmentResponsible: "Civil (ENG)",
    statutoryRule: "IRPWM Chapter 7 (Underwater Bridge Pier Inspection)",
    startCoord: [27.5000, 77.6800],
    endCoord: [27.5050, 77.6900],
    centerCoord: [27.5025, 77.6850],
    sensorTelemetry: [
      { sensorName: "River Current Speed", reading: "2.1 m/s", status: "NORMAL" },
      { sensorName: "Bearing Displacement", reading: "0.8 mm (Thermal Expansion Normal)", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-SLP-04",
    corridorId: "NDLS-MMCT",
    name: "Chambal River Valley & Ravines Incline (Kota)",
    type: "GHAT_SLOPE",
    severity: "WARNING",
    locationKm: "Km 468.0 – 474.0",
    speedLimitKmph: 40,
    normalSpeedKmph: 120,
    environmentalCondition: "Steep Valley Ravine Slope & Sandstone Cliff Cutting",
    conditionDescription: "Approach gradient descending into Chambal river gorge. Constant soil shifting monitored with optical fiber tilt sensors.",
    departmentResponsible: "Civil (ENG)",
    statutoryRule: "WCR Special Operating Rule 18 (Gorge Speed Restriction)",
    startCoord: [25.2000, 75.8400],
    endCoord: [25.2400, 75.8800],
    centerCoord: [25.2200, 75.8600],
    sensorTelemetry: [
      { sensorName: "Ravine Slope Inclinometer", reading: "0.01° displacement (Nominal)", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-SPD-03",
    corridorId: "NDLS-MMCT",
    name: "Ratlam Junction High-Speed Turnout TSR Zone",
    type: "SPEED_LIMIT",
    severity: "CAUTION",
    locationKm: "Km 728.0 – 732.0",
    speedLimitKmph: 30,
    normalSpeedKmph: 110,
    environmentalCondition: "1:12 Thick Web Curved Switch Renewal Under Traffic",
    conditionDescription: "Upgradation to high-speed 160 km/h thick web tongue rails. Temporary speed limit of 30 km/h during switch ballast packing.",
    departmentResponsible: "Civil (ENG)",
    statutoryRule: "Form T/409 Caution Order",
    startCoord: [23.3250, 75.0300],
    endCoord: [23.3380, 75.0450],
    centerCoord: [23.3315, 75.0367],
    sensorTelemetry: [
      { sensorName: "Switch Detection Gauge", reading: "Locked at 2.8mm gap (Normal)", status: "NORMAL" }
    ]
  },

  // ==========================================
  // 3. DELHI - HOWRAH MAINLINE (NDLS-HWH)
  // ==========================================
  {
    id: "ZONE-RIV-03",
    corridorId: "NDLS-HWH",
    name: "Ganga Rail Super-Bridge No. 80 (Prayagraj)",
    type: "RIVER_BRIDGE",
    severity: "CAUTION",
    locationKm: "Km 628.0 – 631.5",
    speedLimitKmph: 50,
    normalSpeedKmph: 130,
    environmentalCondition: "Over Holy Ganga River (2.4 KM Mega Span)",
    conditionDescription: "Major 2.4-kilometer continuous steel girder bridge. Optical fiber strain gauges monitor long-term deck load fatigue from heavy coal and Rajdhani traffic.",
    departmentResponsible: "Civil (ENG)",
    statutoryRule: "NCR Statutory Bridge Protocol Form B-12",
    startCoord: [25.4380, 81.8860],
    endCoord: [25.4450, 81.8980],
    centerCoord: [25.4415, 81.8920],
    sensorTelemetry: [
      { sensorName: "Deck Fiber Strain Gauge", reading: "142 microstrain (Nominal)", status: "NORMAL" },
      { sensorName: "Thermal Expansion Gap", reading: "24.5 mm", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-RIV-05",
    corridorId: "NDLS-HWH",
    name: "Son River Longest Super-Bridge No. 102 (Dehri-on-Sone)",
    type: "RIVER_BRIDGE",
    severity: "WARNING",
    locationKm: "Km 840.0 – 843.5",
    speedLimitKmph: 40,
    normalSpeedKmph: 120,
    environmentalCondition: "Over Wide Sandy Son River Basin (3.06 KM Span)",
    conditionDescription: "One of the longest rail bridges in India. High alluvial bed seasonal shifting requires underwater ultrasonic hydrophones to inspect pier scour.",
    departmentResponsible: "Civil (ENG)",
    statutoryRule: "ECR Special Bridge Inspection Rule 7.02",
    startCoord: [24.9100, 84.1700],
    endCoord: [24.9300, 84.2100],
    centerCoord: [24.9200, 84.1900],
    sensorTelemetry: [
      { sensorName: "Acoustic Bed Scour Sonar", reading: "0.41m (Alert at 0.75m)", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-SPD-02",
    corridorId: "NDLS-HWH",
    name: "Dhanbad Coal Siding Subsidence Monitoring TSR",
    type: "SPEED_LIMIT",
    severity: "WARNING",
    locationKm: "Km 1180.0 – 1192.0",
    speedLimitKmph: 30,
    normalSpeedKmph: 110,
    environmentalCondition: "Abandoned Deep Underground Coal Seam Subsidence Area",
    conditionDescription: "Geotechnical radar detects micro-shifts in formation soil above underground coal galleries. Caution order 30 km/h enforced until cement grouting completes.",
    departmentResponsible: "Safety (SFTY)",
    statutoryRule: "DGMS Coal Mine Railway Safety Regulation 1957",
    startCoord: [23.7850, 86.4100],
    endCoord: [23.8050, 86.4400],
    centerCoord: [23.7950, 86.4250],
    sensorTelemetry: [
      { sensorName: "Soil Inclinometer", reading: "0.04 mm/day (Stabilizing)", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-CRIT-02",
    corridorId: "NDLS-HWH",
    name: "Pt. Deen Dayal Upadhyaya (DDU) Freight Marshalling Diamond",
    type: "CRITICAL_HAZARD",
    severity: "CRITICAL",
    locationKm: "Km 782.0 – 786.0",
    speedLimitKmph: 15,
    normalSpeedKmph: 30,
    environmentalCondition: "Asia's Largest Railway Hump Yard & 8-Way Scissors Crossover",
    conditionDescription: "Over 220 trains and 40 freight rakes marshalled daily. High friction brake retarder sensors active to prevent hump collisions.",
    departmentResponsible: "Signal & Traffic (SNT)",
    statutoryRule: "ECR Station Working Rules Annexure G",
    startCoord: [25.2750, 83.1100],
    endCoord: [25.2880, 83.1300],
    centerCoord: [25.2818, 83.1197],
    sensorTelemetry: [
      { sensorName: "Hump Retarder Pressure", reading: "125 PSI (Active)", status: "NORMAL" },
      { sensorName: "Axle Counter Wheel Sensor", reading: "100% Count Integrity", status: "NORMAL" }
    ]
  },

  // ==========================================
  // 4. MUMBAI CSMT - CHENNAI CENTRAL (CSMT-MAS)
  // ==========================================
  {
    id: "ZONE-SLP-02",
    corridorId: "CSMT-MAS",
    name: "Bhor Ghat Mountain Incline (Palasdari–Khandala)",
    type: "GHAT_SLOPE",
    severity: "CRITICAL",
    locationKm: "Km 108.0 – 124.5",
    speedLimitKmph: 25,
    normalSpeedKmph: 105,
    environmentalCondition: "Extreme 1:37 Mountain Slope Side & High Cliff Cuttings",
    conditionDescription: "Historic 25-tunnel mountain section. Mandatory attachment of 3 WAG-9 banking locomotives at rear for all uphill trains. Catch sidings for runaway downhill control.",
    departmentResponsible: "Civil (ENG)",
    statutoryRule: "CR Subsidiary Rule 4.15 (Ghat Incline Banker Coupling)",
    startCoord: [18.7500, 73.3350],
    endCoord: [18.7650, 73.3800],
    centerCoord: [18.7575, 73.3575],
    sensorTelemetry: [
      { sensorName: "Banker Telemetry Link", reading: "3 Locos Synchronized via Kavach RF", status: "NORMAL" },
      { sensorName: "Cliff Rockfall Trip Wire", reading: "Tension 120N (No rockfall detected)", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-RIV-07",
    corridorId: "CSMT-MAS",
    name: "Krishna River Super-Bridge (Wadi)",
    type: "RIVER_BRIDGE",
    severity: "WARNING",
    locationKm: "Km 598.0 – 602.0",
    speedLimitKmph: 45,
    normalSpeedKmph: 110,
    environmentalCondition: "Over Wide Deccan Krishna River Gorge",
    conditionDescription: "High seasonal monsoon discharge from Western Ghat reservoirs. Submerged pier tilt gauges active.",
    departmentResponsible: "Civil (ENG)",
    statutoryRule: "SCR Bridge Maintenance Protocol 14",
    startCoord: [17.0300, 76.9700],
    endCoord: [17.0700, 77.0100],
    centerCoord: [17.0500, 76.9900],
    sensorTelemetry: [
      { sensorName: "River Flow Velocity", reading: "3.4 m/s (High current)", status: "ALERT" }
    ]
  },
  {
    id: "ZONE-CRIT-03",
    corridorId: "CSMT-MAS",
    name: "Guntakal Junction 5-Way Rail Diamond",
    type: "CRITICAL_HAZARD",
    severity: "CRITICAL",
    locationKm: "Km 832.0 – 836.0",
    speedLimitKmph: 15,
    normalSpeedKmph: 30,
    environmentalCondition: "5-Direction Arterial Junction Crossing",
    conditionDescription: "Key interchange linking Karnataka, Andhra Pradesh, and Tamil Nadu. Electronic Interlocking route-locking monitored 24/7.",
    departmentResponsible: "Signal & Traffic (SNT)",
    statutoryRule: "SCR Station Working Rule GTL-01",
    startCoord: [15.1600, 77.3550],
    endCoord: [15.1720, 77.3750],
    centerCoord: [15.1667, 77.3667],
    sensorTelemetry: [
      { sensorName: "Electronic Interlocking Relay Bank", reading: "Healthy (0 Alarm)", status: "NORMAL" }
    ]
  },

  // ==========================================
  // 5. CHENNAI - BENGALURU CORRIDOR (MAS-SBC)
  // ==========================================
  {
    id: "ZONE-SLP-07",
    corridorId: "MAS-SBC",
    name: "Kuppam–Jolarpettai Falling Gradient & Catch Siding",
    type: "GHAT_SLOPE",
    severity: "CRITICAL",
    locationKm: "Km 205.0 – 216.0",
    speedLimitKmph: 35,
    normalSpeedKmph: 130,
    environmentalCondition: "1:70 Descending Gradient from Deccan Plateau to Plains",
    conditionDescription: "Steep drop from Bengaluru elevation (900m) to Jolarpettai (300m). Runaway catch sidings equipped with axle speed radar.",
    departmentResponsible: "Safety (SFTY)",
    statutoryRule: "SR Special Operating Rule for Kuppam Incline",
    startCoord: [12.6300, 78.4300],
    endCoord: [12.6700, 78.4700],
    centerCoord: [12.6500, 78.4500],
    sensorTelemetry: [
      { sensorName: "Axle Speed Trap Radar", reading: "Average Rake Velocity 33 km/h", status: "NORMAL" },
      { sensorName: "Catch Siding Sand Density", reading: "Optimal Moisture 4.2%", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-RIV-10",
    corridorId: "MAS-SBC",
    name: "Palar River Dry-Bed Flash Flood Bridge (Katpadi)",
    type: "RIVER_BRIDGE",
    severity: "CAUTION",
    locationKm: "Km 131.0 – 133.5",
    speedLimitKmph: 50,
    normalSpeedKmph: 130,
    environmentalCondition: "Over Palar River Broad Sand Basin",
    conditionDescription: "Vulnerable to sudden cyclonic upstream cloudbursts. Ultrasonic water depth telemetry transmits real-time alerts to Katpadi SM.",
    departmentResponsible: "Civil (ENG)",
    statutoryRule: "SR Flood Action Protocol Para 41",
    startCoord: [12.9700, 79.1200],
    endCoord: [12.9850, 79.1500],
    centerCoord: [12.9782, 79.1378],
    sensorTelemetry: [
      { sensorName: "Flash Flood Sonar", reading: "Dry Bed (Safe)", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-SPD-06",
    corridorId: "MAS-SBC",
    name: "Arakkonam Junction High-Speed Crossover TSR",
    type: "SPEED_LIMIT",
    severity: "CAUTION",
    locationKm: "Km 67.0 – 71.0",
    speedLimitKmph: 40,
    normalSpeedKmph: 130,
    environmentalCondition: "Electronic Interlocking Cabling & OHE Overhaul",
    conditionDescription: "Traction wire renewal and track realignment. Caution order 40 km/h enforced for Vande Bharat and Shatabdi rakes.",
    departmentResponsible: "Electrical (ELEC)",
    statutoryRule: "Form T/409 TSR Directive",
    startCoord: [13.0720, 79.6600],
    endCoord: [13.0850, 79.6750],
    centerCoord: [13.0789, 79.6681],
    sensorTelemetry: [
      { sensorName: "OHE Catenary Tension", reading: "1000 kgf (Nominal)", status: "NORMAL" }
    ]
  },

  // ==========================================
  // 6. HOWRAH - CHENNAI EAST COAST (HWH-MAS)
  // ==========================================
  {
    id: "ZONE-RIV-04",
    corridorId: "HWH-MAS",
    name: "Mahanadi River Coastal Rail Bridge (Cuttack)",
    type: "RIVER_BRIDGE",
    severity: "WARNING",
    locationKm: "Km 412.0 – 414.8",
    speedLimitKmph: 40,
    normalSpeedKmph: 110,
    environmentalCondition: "Over Mahanadi River Tidal Delta",
    conditionDescription: "Estuary crossing vulnerable to Bay of Bengal cyclonic storms. Automatic wind trip relay de-energizes 25kV OHE if gust velocity exceeds 70 km/h.",
    departmentResponsible: "Electrical (ELEC)",
    statutoryRule: "ECoR Cyclone Management Working Rule Para 9",
    startCoord: [20.4800, 85.8700],
    endCoord: [20.4900, 85.8800],
    centerCoord: [20.4850, 85.8750],
    sensorTelemetry: [
      { sensorName: "Coastal Storm Anemometer", reading: "38 km/h Gusts", status: "NORMAL" },
      { sensorName: "Tidal Surge Gauge", reading: "+0.45m Above Mean Tide", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-RIV-06",
    corridorId: "HWH-MAS",
    name: "Godavari River 3-KM Arch Bridge (Rajahmundry)",
    type: "RIVER_BRIDGE",
    severity: "CRITICAL",
    locationKm: "Km 1058.0 – 1061.2",
    speedLimitKmph: 30,
    normalSpeedKmph: 110,
    environmentalCondition: "Over Mighty Godavari River Estuary",
    conditionDescription: "28-span prestressed concrete bowstring arch bridge. Pier base inclinometers actively monitor flood currents and seismic vibration.",
    departmentResponsible: "Civil (ENG)",
    statutoryRule: "SCR Godavari Special Safety Directives 2026",
    startCoord: [17.0100, 81.7600],
    endCoord: [17.0300, 81.8000],
    centerCoord: [17.0200, 81.7800],
    sensorTelemetry: [
      { sensorName: "Pier 14 Tilt Sensor", reading: "0.02° (Rock Solid)", status: "NORMAL" },
      { sensorName: "Water Depth Anomaly", reading: "14.2m Deep Basin", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-SPD-04",
    corridorId: "HWH-MAS",
    name: "Chilika Coastal Lagoon Cyclone High-Wind TSR",
    type: "SPEED_LIMIT",
    severity: "WARNING",
    locationKm: "Km 520.0 – 545.0",
    speedLimitKmph: 35,
    normalSpeedKmph: 120,
    environmentalCondition: "Saline Marsh Coastline & Heavy Crosswinds",
    conditionDescription: "Tracks skirt Chilika lake shoreline. Soil stabilization geotextile blankets installed. Speed capped at 35 km/h during squall weather.",
    departmentResponsible: "Safety (SFTY)",
    statutoryRule: "ECoR Monsoon & Cyclone Circular 2026",
    startCoord: [19.6800, 85.1800],
    endCoord: [19.7200, 85.2200],
    centerCoord: [19.7000, 85.2000],
    sensorTelemetry: [
      { sensorName: "Saline Soil Conductivity", reading: "Normal Range", status: "NORMAL" }
    ]
  },

  // ==========================================
  // 7. MUMBAI - HOWRAH MAINLINE (CSMT-HWH)
  // ==========================================
  {
    id: "ZONE-SLP-06",
    corridorId: "CSMT-HWH",
    name: "Thal Ghat Mountain Incline (Kasara–Igatpuri)",
    type: "GHAT_SLOPE",
    severity: "CRITICAL",
    locationKm: "Km 120.0 – 135.0",
    speedLimitKmph: 25,
    normalSpeedKmph: 105,
    environmentalCondition: "Steep 1:37 Mountain Slope & Sahyadri Cliff Tunnels",
    conditionDescription: "Uphill heavy freight and passenger trains require 3 coupled banking locomotives at Kasara. Downhill trains operate under strict vacuum/air brake test.",
    departmentResponsible: "Civil (ENG)",
    statutoryRule: "CR Special Ghat Working Rules Thal Ghat Section",
    startCoord: [19.6500, 73.5100],
    endCoord: [19.6900, 73.5500],
    centerCoord: [19.6700, 73.5300],
    sensorTelemetry: [
      { sensorName: "Banker Locos Coupler Strain", reading: "280 kN (Synchronized)", status: "NORMAL" },
      { sensorName: "Ghat Tunnel Air Quality", reading: "CO2 420 ppm (Clear)", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-RIV-09",
    corridorId: "CSMT-HWH",
    name: "Wainganga River Super-Bridge (Bhandara)",
    type: "RIVER_BRIDGE",
    severity: "CAUTION",
    locationKm: "Km 885.0 – 887.8",
    speedLimitKmph: 45,
    normalSpeedKmph: 120,
    environmentalCondition: "Over Wainganga Deep River Basin",
    conditionDescription: "Submerged bridge pier scour protection work underway. Optical fiber deflection gauges monitor deck movement.",
    departmentResponsible: "Civil (ENG)",
    statutoryRule: "SECR Bridge Code 19",
    startCoord: [21.1400, 79.6300],
    endCoord: [21.1800, 79.6700],
    centerCoord: [21.1600, 79.6500],
    sensorTelemetry: [
      { sensorName: "Pier Vibration", reading: "0.08 mm/s", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-CRIT-06",
    corridorId: "CSMT-HWH",
    name: "Nagpur Central India Diamond Crossing & Relay Yard",
    type: "CRITICAL_HAZARD",
    severity: "CRITICAL",
    locationKm: "Km 837.0 – 840.0",
    speedLimitKmph: 20,
    normalSpeedKmph: 30,
    environmentalCondition: "Geographic Zero-Mile Diamond Junction of Indian Railways",
    conditionDescription: "Convergence of North-South and East-West trunk routes. Electronic Interlocking and Kavach RFID beacons interlocked with route release timers.",
    departmentResponsible: "Signal & Traffic (SNT)",
    statutoryRule: "CR Nagpur Division Station Working Rules",
    startCoord: [21.1480, 79.0820],
    endCoord: [21.1560, 79.0950],
    centerCoord: [21.1524, 79.0888],
    sensorTelemetry: [
      { sensorName: "Kavach Ground Beacon RF", reading: "Strong 915 MHz Signal", status: "NORMAL" }
    ]
  },

  // ==========================================
  // 8. WESTERN DEDICATED FREIGHT CORRIDOR (WDFC-01)
  // ==========================================
  {
    id: "ZONE-SPD-01",
    corridorId: "WDFC-01",
    name: "Rewari–Ateli Heavy Ballast Deep Screening TSR Zone",
    type: "SPEED_LIMIT",
    severity: "CRITICAL",
    locationKm: "Km 140.0 – 165.0",
    speedLimitKmph: 30,
    normalSpeedKmph: 100,
    environmentalCondition: "Deep Ballast Excavation in Progress (BCM Machine on Track)",
    conditionDescription: "Plasser Ballast Cleaning Machine operating on Up Line. Track consolidated with temporary speed restriction of 30 km/h for 32.5T heavy axle freight trains.",
    departmentResponsible: "Civil (ENG)",
    statutoryRule: "Form T/409 Caution Order Speed Restriction",
    startCoord: [28.1800, 76.6100],
    endCoord: [28.2040, 76.6320],
    centerCoord: [28.1920, 76.6210],
    sensorTelemetry: [
      { sensorName: "Track Geometry Dynamic Deflection", reading: "2.8 mm (Acceptable under TSR)", status: "NORMAL" },
      { sensorName: "Ballast Cushion Depth", reading: "350 mm New Granite Ballast", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-SLP-08",
    corridorId: "WDFC-01",
    name: "Aravalli Mountain Range Deep Rock Cutting",
    type: "GHAT_SLOPE",
    severity: "WARNING",
    locationKm: "Km 540.0 – 555.0",
    speedLimitKmph: 45,
    normalSpeedKmph: 100,
    environmentalCondition: "35-Meter Deep Rock Cutting through Granite Hills",
    conditionDescription: "Designed for double-stack container trains. High cliff rockfall catchment fencing installed with continuous strain sensors.",
    departmentResponsible: "Civil (ENG)",
    statutoryRule: "DFCCIL Safety Guideline Sec 4",
    startCoord: [25.7800, 73.7800],
    endCoord: [25.8200, 73.8200],
    centerCoord: [25.8000, 73.8000],
    sensorTelemetry: [
      { sensorName: "Rock Bolt Tension", reading: "45 kN (Stable)", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-CRIT-05",
    corridorId: "WDFC-01",
    name: "Sanand Double-Stack Container Flyover Crossing",
    type: "CRITICAL_HAZARD",
    severity: "CAUTION",
    locationKm: "Km 888.0 – 892.0",
    speedLimitKmph: 25,
    normalSpeedKmph: 100,
    environmentalCondition: "Grade-Separated Rail Flyover over IR Mainline",
    conditionDescription: "Overhead 7.1-meter high OHE catenary for double-stack container rakes crossing over Ahmedabad-Viramgam passenger mainline.",
    departmentResponsible: "Electrical (ELEC)",
    statutoryRule: "DFCCIL High-Rise OHE Safety Manual",
    startCoord: [22.9800, 72.3700],
    endCoord: [23.0000, 72.3900],
    centerCoord: [22.9900, 72.3800],
    sensorTelemetry: [
      { sensorName: "High-Rise Catenary Height", reading: "7.15m (Within standard)", status: "NORMAL" }
    ]
  },

  // ==========================================
  // 9. EASTERN DEDICATED FREIGHT CORRIDOR (EDFC-01)
  // ==========================================
  {
    id: "ZONE-RIV-12",
    corridorId: "EDFC-01",
    name: "Yamuna Crossing Dedicated Freight Bridge (Khurja)",
    type: "RIVER_BRIDGE",
    severity: "WARNING",
    locationKm: "Km 375.0 – 378.0",
    speedLimitKmph: 45,
    normalSpeedKmph: 100,
    environmentalCondition: "Over Yamuna River Alluvial Basin for 32.5T Heavy Freight",
    conditionDescription: "Heavy axle concrete composite girder bridge designed for 12,000-tonne coal rakes. Pier settlement radar active.",
    departmentResponsible: "Civil (ENG)",
    statutoryRule: "DFCCIL Heavy Haul Bridge Regulation 2026",
    startCoord: [28.2400, 77.8400],
    endCoord: [28.2700, 77.8700],
    centerCoord: [28.2562, 77.8571],
    sensorTelemetry: [
      { sensorName: "Heavy Axle Load Cell", reading: "31.8 Tonne/Axle (Safe)", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-SPD-08",
    corridorId: "EDFC-01",
    name: "Sonnagar Long-Haul Speed Restriction TSR",
    type: "SPEED_LIMIT",
    severity: "CAUTION",
    locationKm: "Km 1315.0 – 1325.0",
    speedLimitKmph: 35,
    normalSpeedKmph: 100,
    environmentalCondition: "Automatic Signalling Block Gap Calibration",
    conditionDescription: "Calibration of moving block axle counting sections. Speed capped at 35 km/h during signal interlocking verification.",
    departmentResponsible: "Signal & Traffic (SNT)",
    statutoryRule: "DFCCIL Signalling Manual Para 9.3",
    startCoord: [24.9200, 84.1600],
    endCoord: [24.9400, 84.2000],
    centerCoord: [24.9300, 84.1800],
    sensorTelemetry: [
      { sensorName: "Digital Track Circuit", reading: "Clear (No dropouts)", status: "NORMAL" }
    ]
  },

  // ==========================================
  // 10. KONKAN COASTAL RAILWAY (KONKAN-01)
  // ==========================================
  {
    id: "ZONE-SLP-03",
    corridorId: "KONKAN-01",
    name: "Panval Nadi Viaduct & Monsoon Rockfall Cutting",
    type: "GHAT_SLOPE",
    severity: "WARNING",
    locationKm: "Km 148.0 – 164.0",
    speedLimitKmph: 40,
    normalSpeedKmph: 110,
    environmentalCondition: "64-Meter High Viaduct over Deep Valley Gorge & Monsoon Cliff",
    conditionDescription: "Tallest concrete hollow-pier railway viaduct in Asia. Monsoon rockfall trip-wire mesh installed along cuttings. Speed restricted to 40 km/h during heavy rainfall.",
    departmentResponsible: "Civil (ENG)",
    statutoryRule: "KRCL Special Monsoon Working Protocol 2026",
    startCoord: [17.0200, 73.3180],
    endCoord: [17.0300, 73.3260],
    centerCoord: [17.0250, 73.3220],
    sensorTelemetry: [
      { sensorName: "Rainfall Precipitation Gauge", reading: "14.2 mm/hr (Caution Threshold)", status: "ALERT" },
      { sensorName: "Viaduct Pier 4 Vibration", reading: "0.12 mm/s (Well within limits)", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-RIV-11",
    corridorId: "KONKAN-01",
    name: "Sharavathi River Estuary Bridge (Honnavar)",
    type: "RIVER_BRIDGE",
    severity: "CAUTION",
    locationKm: "Km 340.0 – 342.2",
    speedLimitKmph: 30,
    normalSpeedKmph: 100,
    environmentalCondition: "2.06 KM Span over Tidal Arabian Sea Estuary",
    conditionDescription: "Longest bridge on Konkan Railway. High saline corrosion environment. Cathodic protection current and wind shear monitored in real-time.",
    departmentResponsible: "Civil (ENG)",
    statutoryRule: "KRCL Coastal Bridge Inspection Order 4",
    startCoord: [14.2700, 74.4400],
    endCoord: [14.2900, 74.4600],
    centerCoord: [14.2800, 74.4500],
    sensorTelemetry: [
      { sensorName: "Cathodic Protection Voltage", reading: "-0.85V (Optimal anti-rust)", status: "NORMAL" },
      { sensorName: "Estuary Crosswind", reading: "28 km/h", status: "NORMAL" }
    ]
  },
  {
    id: "ZONE-SPD-07",
    corridorId: "KONKAN-01",
    name: "Karbude 6.5-KM Deep Mountain Tunnel TSR",
    type: "SPEED_LIMIT",
    severity: "CRITICAL",
    locationKm: "Km 172.0 – 178.5",
    speedLimitKmph: 40,
    normalSpeedKmph: 110,
    environmentalCondition: "6.5-KM Mountain Tunnel with High Subsurface Seepage",
    conditionDescription: "Second longest rail tunnel in India. Continuous tunnel ventilation and drainage sump telemetry active. 40 km/h caution order during tunnel rail grinding.",
    departmentResponsible: "Safety (SFTY)",
    statutoryRule: "KRCL Deep Tunnel Working Rule Para 3",
    startCoord: [17.0700, 73.3200],
    endCoord: [17.0900, 73.3400],
    centerCoord: [17.0800, 73.3300],
    sensorTelemetry: [
      { sensorName: "Tunnel Drainage Sump Water Level", reading: "0.32m (Pumps running)", status: "NORMAL" },
      { sensorName: "Air Velocity Anemometer", reading: "4.5 m/s forced ventilation", status: "NORMAL" }
    ]
  }
];
