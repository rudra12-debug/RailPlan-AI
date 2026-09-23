import {
  RailwayCorridor,
  CorridorAsset,
  LiveTrain,
  MaintenanceBlockRequest,
  StatutoryT806Sanction,
  DepartmentId
} from "./types";
import { BHOPAL_ITARSI_CORRIDOR, MOCK_CORRIDOR_ASSETS, MOCK_LIVE_TRAINS, MOCK_BLOCK_REQUESTS, MOCK_T806_SANCTIONS } from "./bhopalItarsiData";

// ========================================================
// 1. EXPANDED INDIAN RAILWAYS TRUNK & FREIGHT CORRIDORS (10+)
// ========================================================
export const ALL_EXPANDED_CORRIDORS: RailwayCorridor[] = [
  BHOPAL_ITARSI_CORRIDOR,
  {
    id: "NDLS-MMCT",
    name: "Delhi - Mumbai Central Golden Trunk Route (1384 KM)",
    zone: "Northern & Western Railway",
    route: "New Delhi - Mathura - Kota - Ratlam - Vadodara - Surat - Mumbai Central",
    totalLengthKm: 1384,
    status: "CRITICAL",
    activeMaintenanceCount: 14,
    activeTrainsCount: 22,
    delayedProjectsCount: 2,
    criticalSpotsCount: 4,
    stations: [
      { name: "New Delhi", code: "NDLS", km: 0, hasActiveBlock: false, status: "NORMAL", platformsCount: 16, interlockingType: "SSI", lat: 28.6143, lng: 77.2088 },
      { name: "Mathura Junction", code: "MTJ", km: 141, hasActiveBlock: true, status: "CRITICAL", platformsCount: 10, interlockingType: "RRI + Kavach", lat: 27.4924, lng: 77.6737 },
      { name: "Kota Junction", code: "KOTA", km: 465, hasActiveBlock: false, status: "NORMAL", platformsCount: 6, interlockingType: "EI", lat: 25.1834, lng: 75.8333 },
      { name: "Ratlam Junction", code: "RTM", km: 730, hasActiveBlock: false, status: "ATTENTION", platformsCount: 7, interlockingType: "EI", lat: 23.3315, lng: 75.0367 },
      { name: "Vadodara Junction", code: "BRC", km: 991, hasActiveBlock: true, status: "MEDIUM_RISK", platformsCount: 8, interlockingType: "RRI", lat: 22.3072, lng: 73.1812 },
      { name: "Surat", code: "ST", km: 1120, hasActiveBlock: false, status: "NORMAL", platformsCount: 6, interlockingType: "EI", lat: 21.1702, lng: 72.8311 },
      { name: "Mumbai Central", code: "MMCT", km: 1384, hasActiveBlock: false, status: "NORMAL", platformsCount: 10, interlockingType: "SSI", lat: 18.9696, lng: 72.8193 },
    ],
    coordinates: [
      { x: 330, y: 110 },
      { x: 335, y: 150 },
      { x: 295, y: 205 },
      { x: 255, y: 265 },
      { x: 215, y: 315 },
      { x: 210, y: 345 },
      { x: 210, y: 380 }
    ],
    geoCoordinates: [
      [28.6143, 77.2088],
      [27.4924, 77.6737],
      [25.1834, 75.8333],
      [23.3315, 75.0367],
      [22.3072, 73.1812],
      [21.1702, 72.8311],
      [18.9696, 72.8193]
    ],
  },
  {
    id: "NDLS-HWH",
    name: "Delhi - Howrah Grand Chord Rajdhani Route (1445 KM)",
    zone: "Northern, NCR & Eastern Railway",
    route: "New Delhi - Kanpur Central - Prayagraj - Pt. Deen Dayal Upadhyaya - Dhanbad - Howrah",
    totalLengthKm: 1445,
    status: "MEDIUM_RISK",
    activeMaintenanceCount: 12,
    activeTrainsCount: 20,
    delayedProjectsCount: 1,
    criticalSpotsCount: 3,
    stations: [
      { name: "New Delhi", code: "NDLS", km: 0, hasActiveBlock: false, status: "NORMAL", platformsCount: 16, interlockingType: "SSI", lat: 28.6143, lng: 77.2088 },
      { name: "Kanpur Central", code: "CNB", km: 440, hasActiveBlock: true, status: "MEDIUM_RISK", platformsCount: 10, interlockingType: "RRI", lat: 26.4499, lng: 80.3319 },
      { name: "Prayagraj Junction", code: "PRYJ", km: 635, hasActiveBlock: false, status: "NORMAL", platformsCount: 10, interlockingType: "EI", lat: 25.4358, lng: 81.8463 },
      { name: "Pt. Deen Dayal Upadhyaya", code: "DDU", km: 785, hasActiveBlock: true, status: "ATTENTION", platformsCount: 8, interlockingType: "RRI", lat: 25.2818, lng: 83.1197 },
      { name: "Dhanbad Junction", code: "DHN", km: 1185, hasActiveBlock: false, status: "NORMAL", platformsCount: 8, interlockingType: "EI", lat: 23.7957, lng: 86.4304 },
      { name: "Howrah Junction", code: "HWH", km: 1445, hasActiveBlock: false, status: "NORMAL", platformsCount: 23, interlockingType: "RRI", lat: 22.5851, lng: 88.3426 },
    ],
    coordinates: [
      { x: 330, y: 110 },
      { x: 470, y: 185 },
      { x: 530, y: 215 },
      { x: 580, y: 235 },
      { x: 640, y: 255 },
      { x: 690, y: 275 }
    ],
    geoCoordinates: [
      [28.6143, 77.2088],
      [26.4499, 80.3319],
      [25.4358, 81.8463],
      [25.2818, 83.1197],
      [23.7957, 86.4304],
      [22.5851, 88.3426]
    ],
  },
  {
    id: "WDFC-01",
    name: "Western Dedicated Freight Corridor (WDFC) (1504 KM)",
    zone: "DFCCIL (Dedicated Freight Corridor)",
    route: "Dadri (UP) - Rewari - Phulera/Jaipur - Palanpur - Sanand - JNPT (Navi Mumbai)",
    totalLengthKm: 1504,
    status: "ATTENTION",
    activeMaintenanceCount: 9,
    activeTrainsCount: 24,
    delayedProjectsCount: 1,
    criticalSpotsCount: 2,
    stations: [
      { name: "Dadri Junction (DFCCIL)", code: "DER", km: 0, hasActiveBlock: false, status: "NORMAL", platformsCount: 4, interlockingType: "Automated Dispatch", lat: 28.5526, lng: 77.5539 },
      { name: "Rewari Junction", code: "RE", km: 142, hasActiveBlock: true, status: "ATTENTION", platformsCount: 6, interlockingType: "EI", lat: 28.1920, lng: 76.6191 },
      { name: "Phulera Junction", code: "FL", km: 380, hasActiveBlock: false, status: "NORMAL", platformsCount: 5, interlockingType: "EI", lat: 26.8719, lng: 75.2415 },
      { name: "Palanpur Junction", code: "PNU", km: 740, hasActiveBlock: true, status: "CRITICAL", platformsCount: 6, interlockingType: "EI", lat: 24.1724, lng: 72.4346 },
      { name: "Sanand Industrial", code: "SAU", km: 890, hasActiveBlock: false, status: "NORMAL", platformsCount: 4, interlockingType: "EI", lat: 22.9900, lng: 72.3800 },
      { name: "Vadodara South Yard", code: "BRCY", km: 1020, hasActiveBlock: true, status: "MEDIUM_RISK", platformsCount: 8, interlockingType: "RRI", lat: 22.2500, lng: 73.2000 },
      { name: "JNPT Terminal (Navi Mumbai)", code: "JNPT", km: 1504, hasActiveBlock: false, status: "NORMAL", platformsCount: 6, interlockingType: "Automated Yard", lat: 18.9482, lng: 72.9510 },
    ],
    coordinates: [
      { x: 345, y: 115 },
      { x: 310, y: 135 },
      { x: 275, y: 185 },
      { x: 230, y: 250 },
      { x: 215, y: 280 },
      { x: 220, y: 325 },
      { x: 215, y: 390 }
    ],
    geoCoordinates: [
      [28.5526, 77.5539],
      [28.1920, 76.6191],
      [26.8719, 75.2415],
      [24.1724, 72.4346],
      [22.9900, 72.3800],
      [22.2500, 73.2000],
      [18.9482, 72.9510]
    ],
  },
  {
    id: "EDFC-01",
    name: "Eastern Dedicated Freight Corridor (EDFC) (1875 KM)",
    zone: "DFCCIL (Eastern Corridor)",
    route: "Sahnewal (Ludhiana) - Khurja - Kanpur - DDU - Sonnagar - Dankuni (Kolkata)",
    totalLengthKm: 1875,
    status: "NORMAL",
    activeMaintenanceCount: 7,
    activeTrainsCount: 28,
    delayedProjectsCount: 0,
    criticalSpotsCount: 2,
    stations: [
      { name: "Sahnewal (Ludhiana)", code: "SNL", km: 0, hasActiveBlock: false, status: "NORMAL", platformsCount: 4, interlockingType: "Automatic", lat: 30.9010, lng: 75.8573 },
      { name: "Khurja Junction", code: "KRJ", km: 380, hasActiveBlock: true, status: "ATTENTION", platformsCount: 5, interlockingType: "Automatic", lat: 28.2562, lng: 77.8571 },
      { name: "Bhaupur (Kanpur)", code: "BPU", km: 720, hasActiveBlock: false, status: "NORMAL", platformsCount: 4, interlockingType: "Automatic", lat: 26.5100, lng: 80.1200 },
      { name: "Deen Dayal Upadhyaya Yard", code: "DDU-F", km: 1120, hasActiveBlock: true, status: "NORMAL", platformsCount: 8, interlockingType: "Automatic", lat: 25.2818, lng: 83.1197 },
      { name: "Sonnagar Junction", code: "SEB", km: 1320, hasActiveBlock: false, status: "NORMAL", platformsCount: 4, interlockingType: "Automatic", lat: 24.9300, lng: 84.1800 },
      { name: "Dankuni Terminal (Kolkata)", code: "DKAE", km: 1875, hasActiveBlock: false, status: "NORMAL", platformsCount: 6, interlockingType: "Automatic", lat: 22.6841, lng: 88.2936 },
    ],
    coordinates: [
      { x: 270, y: 75 },
      { x: 355, y: 135 },
      { x: 480, y: 180 },
      { x: 590, y: 230 },
      { x: 630, y: 245 },
      { x: 700, y: 270 }
    ],
    geoCoordinates: [
      [30.9010, 75.8573],
      [28.2562, 77.8571],
      [26.5100, 80.1200],
      [25.2818, 83.1197],
      [24.9300, 84.1800],
      [22.6841, 88.2936]
    ],
  },
  {
    id: "CSMT-MAS",
    name: "Mumbai CSMT - Chennai Central Mainline (1281 KM)",
    zone: "Central & Southern Railway",
    route: "Mumbai CSMT - Pune - Solapur - Wadi - Guntakal - Renigunta - Chennai Central",
    totalLengthKm: 1281,
    status: "NORMAL",
    activeMaintenanceCount: 8,
    activeTrainsCount: 18,
    delayedProjectsCount: 0,
    criticalSpotsCount: 2,
    stations: [
      { name: "Mumbai CSMT", code: "CSMT", km: 0, hasActiveBlock: false, status: "NORMAL", platformsCount: 18, interlockingType: "RRI", lat: 18.9401, lng: 72.8354 },
      { name: "Pune Junction", code: "PUNE", km: 192, hasActiveBlock: false, status: "NORMAL", platformsCount: 6, interlockingType: "EI", lat: 18.5289, lng: 73.8744 },
      { name: "Solapur Junction", code: "SUR", km: 455, hasActiveBlock: true, status: "ATTENTION", platformsCount: 5, interlockingType: "EI", lat: 17.6599, lng: 75.9064 },
      { name: "Wadi Junction", code: "WADI", km: 605, hasActiveBlock: false, status: "NORMAL", platformsCount: 4, interlockingType: "EI", lat: 17.0500, lng: 76.9900 },
      { name: "Guntakal Junction", code: "GTL", km: 835, hasActiveBlock: true, status: "MEDIUM_RISK", platformsCount: 7, interlockingType: "RRI", lat: 15.1667, lng: 77.3667 },
      { name: "Renigunta Junction", code: "RU", km: 1145, hasActiveBlock: false, status: "NORMAL", platformsCount: 5, interlockingType: "EI", lat: 13.6333, lng: 79.5167 },
      { name: "Chennai Central", code: "MAS", km: 1281, hasActiveBlock: false, status: "NORMAL", platformsCount: 12, interlockingType: "RRI", lat: 13.0827, lng: 80.2707 },
    ],
    coordinates: [
      { x: 210, y: 380 },
      { x: 240, y: 400 },
      { x: 295, y: 420 },
      { x: 345, y: 435 },
      { x: 385, y: 470 },
      { x: 425, y: 495 },
      { x: 450, y: 510 }
    ],
    geoCoordinates: [
      [18.9401, 72.8354],
      [18.5289, 73.8744],
      [17.6599, 75.9064],
      [17.0500, 76.9900],
      [15.1667, 77.3667],
      [13.6333, 79.5167],
      [13.0827, 80.2707]
    ],
  },
  {
    id: "MAS-SBC",
    name: "Chennai Central - Bengaluru City High-Speed Corridor (358 KM)",
    zone: "Southern & South Western Railway",
    route: "Chennai Central - Arakkonam - Katpadi - Jolarpettai - Bangarapet - KSR Bengaluru",
    totalLengthKm: 358,
    status: "ATTENTION",
    activeMaintenanceCount: 7,
    activeTrainsCount: 19,
    delayedProjectsCount: 1,
    criticalSpotsCount: 2,
    stations: [
      { name: "Chennai Central", code: "MAS", km: 0, hasActiveBlock: false, status: "NORMAL", platformsCount: 12, interlockingType: "RRI", lat: 13.0827, lng: 80.2707 },
      { name: "Arakkonam Junction", code: "AJJ", km: 69, hasActiveBlock: false, status: "NORMAL", platformsCount: 5, interlockingType: "EI", lat: 13.0789, lng: 79.6681 },
      { name: "Katpadi Junction", code: "KPD", km: 130, hasActiveBlock: true, status: "ATTENTION", platformsCount: 5, interlockingType: "EI", lat: 12.9782, lng: 79.1378 },
      { name: "Jolarpettai Junction", code: "JTJ", km: 214, hasActiveBlock: true, status: "CRITICAL", platformsCount: 5, interlockingType: "RRI + Kavach", lat: 12.5564, lng: 78.5806 },
      { name: "Bangarapet Junction", code: "BWT", km: 289, hasActiveBlock: false, status: "NORMAL", platformsCount: 4, interlockingType: "EI", lat: 12.9833, lng: 78.2000 },
      { name: "Bengaluru Cantt", code: "BNC", km: 354, hasActiveBlock: false, status: "NORMAL", platformsCount: 4, interlockingType: "EI", lat: 12.9930, lng: 77.5980 },
      { name: "KSR Bengaluru City", code: "SBC", km: 358, hasActiveBlock: false, status: "NORMAL", platformsCount: 10, interlockingType: "SSI", lat: 12.9784, lng: 77.5684 },
    ],
    coordinates: [
      { x: 450, y: 510 },
      { x: 430, y: 515 },
      { x: 415, y: 520 },
      { x: 400, y: 525 },
      { x: 385, y: 530 },
      { x: 375, y: 535 },
      { x: 370, y: 537 }
    ],
    geoCoordinates: [
      [13.0827, 80.2707],
      [13.0789, 79.6681],
      [12.9782, 79.1378],
      [12.5564, 78.5806],
      [12.9833, 78.2000],
      [12.9930, 77.5980],
      [12.9784, 77.5684]
    ],
  },
  {
    id: "HWH-MAS",
    name: "Howrah - Chennai East Coast Mainline (1661 KM)",
    zone: "South Eastern & East Coast Railway",
    route: "Howrah - Kharagpur - Balasore - Cuttack - Bhubaneswar - Visakhapatnam - Vijayawada - Chennai",
    totalLengthKm: 1661,
    status: "MEDIUM_RISK",
    activeMaintenanceCount: 11,
    activeTrainsCount: 25,
    delayedProjectsCount: 1,
    criticalSpotsCount: 3,
    stations: [
      { name: "Howrah Junction", code: "HWH", km: 0, hasActiveBlock: false, status: "NORMAL", platformsCount: 23, interlockingType: "RRI", lat: 22.5851, lng: 88.3426 },
      { name: "Kharagpur Junction", code: "KGP", km: 115, hasActiveBlock: true, status: "ATTENTION", platformsCount: 12, interlockingType: "RRI", lat: 22.3400, lng: 87.3200 },
      { name: "Balasore", code: "BLS", km: 231, hasActiveBlock: false, status: "NORMAL", platformsCount: 4, interlockingType: "EI", lat: 21.4934, lng: 86.9317 },
      { name: "Cuttack Junction", code: "CTC", km: 409, hasActiveBlock: true, status: "CRITICAL", platformsCount: 6, interlockingType: "EI", lat: 20.4625, lng: 85.8828 },
      { name: "Bhubaneswar", code: "BBS", km: 437, hasActiveBlock: false, status: "NORMAL", platformsCount: 6, interlockingType: "SSI", lat: 20.2961, lng: 85.8245 },
      { name: "Visakhapatnam", code: "VSKP", km: 881, hasActiveBlock: true, status: "MEDIUM_RISK", platformsCount: 8, interlockingType: "RRI", lat: 17.6868, lng: 83.2185 },
      { name: "Vijayawada Junction", code: "BZA", km: 1230, hasActiveBlock: false, status: "NORMAL", platformsCount: 10, interlockingType: "RRI", lat: 16.5062, lng: 80.6480 },
      { name: "Chennai Central", code: "MAS", km: 1661, hasActiveBlock: false, status: "NORMAL", platformsCount: 12, interlockingType: "RRI", lat: 13.0827, lng: 80.2707 },
    ],
    coordinates: [
      { x: 690, y: 275 },
      { x: 660, y: 295 },
      { x: 635, y: 325 },
      { x: 620, y: 355 },
      { x: 615, y: 370 },
      { x: 560, y: 425 },
      { x: 490, y: 465 },
      { x: 450, y: 510 }
    ],
    geoCoordinates: [
      [22.5851, 88.3426],
      [22.3400, 87.3200],
      [21.4934, 86.9317],
      [20.4625, 85.8828],
      [20.2961, 85.8245],
      [17.6868, 83.2185],
      [16.5062, 80.6480],
      [13.0827, 80.2707]
    ],
  },
  {
    id: "ADI-MMCT",
    name: "Ahmedabad - Mumbai Central High-Speed Trunk Route (491 KM)",
    zone: "Western Railway (WR)",
    route: "Ahmedabad - Vadodara - Bharuch - Surat - Vapi - Borivali - Mumbai Central",
    totalLengthKm: 491,
    status: "ATTENTION",
    activeMaintenanceCount: 8,
    activeTrainsCount: 24,
    delayedProjectsCount: 0,
    criticalSpotsCount: 2,
    stations: [
      { name: "Ahmedabad Junction", code: "ADI", km: 0, hasActiveBlock: false, status: "NORMAL", platformsCount: 12, interlockingType: "RRI", lat: 23.0225, lng: 72.5714 },
      { name: "Vadodara Junction", code: "BRC", km: 100, hasActiveBlock: true, status: "MEDIUM_RISK", platformsCount: 8, interlockingType: "RRI", lat: 22.3072, lng: 73.1812 },
      { name: "Bharuch Junction", code: "BH", km: 171, hasActiveBlock: false, status: "NORMAL", platformsCount: 4, interlockingType: "EI", lat: 21.7051, lng: 72.9959 },
      { name: "Surat", code: "ST", km: 230, hasActiveBlock: false, status: "NORMAL", platformsCount: 6, interlockingType: "EI", lat: 21.1702, lng: 72.8311 },
      { name: "Vapi", code: "VAPI", km: 325, hasActiveBlock: true, status: "ATTENTION", platformsCount: 4, interlockingType: "EI", lat: 20.3893, lng: 72.9106 },
      { name: "Borivali", code: "BVI", km: 457, hasActiveBlock: false, status: "NORMAL", platformsCount: 10, interlockingType: "SSI", lat: 19.2290, lng: 72.8573 },
      { name: "Mumbai Central", code: "MMCT", km: 491, hasActiveBlock: false, status: "NORMAL", platformsCount: 10, interlockingType: "SSI", lat: 18.9696, lng: 72.8193 },
    ],
    coordinates: [
      { x: 195, y: 260 },
      { x: 215, y: 315 },
      { x: 212, y: 330 },
      { x: 210, y: 345 },
      { x: 208, y: 360 },
      { x: 208, y: 372 },
      { x: 210, y: 380 }
    ],
    geoCoordinates: [
      [23.0225, 72.5714],
      [22.3072, 73.1812],
      [21.7051, 72.9959],
      [21.1702, 72.8311],
      [20.3893, 72.9106],
      [19.2290, 72.8573],
      [18.9696, 72.8193]
    ],
  },
  {
    id: "KONKAN-01",
    name: "Konkan Coastal Railway (741 KM)",
    zone: "Konkan Railway Corporation (KRCL)",
    route: "Roha - Chiplun - Ratnagiri - Madgaon (Goa) - Karwar - Udupi - Thokur (Mangaluru)",
    totalLengthKm: 741,
    status: "ATTENTION",
    activeMaintenanceCount: 7,
    activeTrainsCount: 16,
    delayedProjectsCount: 1,
    criticalSpotsCount: 3,
    stations: [
      { name: "Roha", code: "ROHA", km: 0, hasActiveBlock: false, status: "NORMAL", platformsCount: 3, interlockingType: "EI", lat: 18.4367, lng: 73.1189 },
      { name: "Chiplun", code: "CHI", km: 145, hasActiveBlock: true, status: "ATTENTION", platformsCount: 3, interlockingType: "EI", lat: 17.5323, lng: 73.5186 },
      { name: "Ratnagiri", code: "RN", km: 240, hasActiveBlock: false, status: "NORMAL", platformsCount: 4, interlockingType: "EI", lat: 16.9902, lng: 73.3120 },
      { name: "Madgaon Junction (Goa)", code: "MAO", km: 450, hasActiveBlock: false, status: "NORMAL", platformsCount: 5, interlockingType: "EI", lat: 15.2736, lng: 73.9582 },
      { name: "Karwar", code: "KAWR", km: 535, hasActiveBlock: true, status: "CRITICAL", platformsCount: 3, interlockingType: "EI", lat: 14.8185, lng: 74.1350 },
      { name: "Udupi", code: "UD", km: 680, hasActiveBlock: false, status: "NORMAL", platformsCount: 3, interlockingType: "EI", lat: 13.3409, lng: 74.7421 },
      { name: "Thokur (Mangaluru)", code: "TOK", km: 741, hasActiveBlock: false, status: "NORMAL", platformsCount: 2, interlockingType: "EI", lat: 12.9644, lng: 74.8359 },
    ],
    coordinates: [
      { x: 215, y: 395 },
      { x: 220, y: 425 },
      { x: 225, y: 455 },
      { x: 230, y: 485 },
      { x: 235, y: 505 },
      { x: 240, y: 535 },
      { x: 245, y: 555 }
    ],
    geoCoordinates: [
      [18.4367, 73.1189],
      [17.5323, 73.5186],
      [16.9902, 73.3120],
      [15.2736, 73.9582],
      [14.8185, 74.1350],
      [13.3409, 74.7421],
      [12.9644, 74.8359]
    ],
  },
];

// ========================================================
// 2. 500+ ASSETS & TELEMETRY ENGINE
// Generates realistic telemetry for all corridors
// ========================================================
export function generateLargeScaleAssets(): CorridorAsset[] {
  const allAssets: CorridorAsset[] = [...MOCK_CORRIDOR_ASSETS]; // Start with 130 Bhopal-Itarsi assets

  const extraCorridorIds = [
    "NDLS-MMCT",
    "NDLS-HWH",
    "WDFC-01",
    "EDFC-01",
    "CSMT-MAS",
    "MAS-SBC",
    "HWH-MAS",
    "ADI-MMCT",
    "KONKAN-01"
  ];

  extraCorridorIds.forEach((corrId) => {
    const corr = ALL_EXPANDED_CORRIDORS.find((c) => c.id === corrId);
    const maxKm = corr?.totalLengthKm || 500;

    // Add 45 assets per corridor (20 Track, 15 OHE, 10 Signal)
    // 9 corridors * 45 = 405 additional assets -> Total 535 Assets!
    for (let i = 1; i <= 20; i++) {
      const km = Number(((maxKm / 21) * i).toFixed(1));
      const railTemp = Number((34.0 + Math.random() * 22.0).toFixed(1));
      const vibration = Number((1.2 + Math.random() * 4.5).toFixed(2));
      const gaugeDev = Number((-1.5 + Math.random() * 6.0).toFixed(1));
      const tqi = Math.floor(22 + Math.random() * 24);
      let risk = Math.min(95, Math.floor(
        (railTemp > 50 ? (railTemp - 50) * 3 : 0) +
        (vibration > 4.0 ? (vibration - 4.0) * 10 : 0) +
        (Math.abs(gaugeDev) > 4 ? 25 : 5) + 10
      ));
      const status = risk >= 80 ? "CRITICAL" : risk >= 50 ? "ATTENTION" : "NORMAL";

      allAssets.push({
        id: `TRK-${corrId.slice(0, 3)}-${100 + i}`,
        name: `60kg UIC Track Rail Section #${100 + i} (${corr?.name.split("(")[0].trim()})`,
        type: "RAIL_JOINT",
        corridorId: corrId,
        locationKm: `KM ${km} (${i % 2 === 0 ? "Up Line" : "Down Line"})`,
        status,
        failureRisk: risk,
        lastMaintenanceDate: "2026-07-20",
        nextRecommendedInspection: "2026-09-30",
        telemetry: {
          railTemperature: railTemp,
          temperature: railTemp,
          vibrationAmplitude: vibration,
          vibration: vibration,
          trackGeometryGaugeDeviation: gaugeDev,
          tqiScore: tqi,
          stressLevel: Math.floor(190 + vibration * 20),
          dynamicRiskScore: risk,
        },
        departmentResponsible: "ENG",
      });
    }

    // OHE Portals
    for (let i = 1; i <= 15; i++) {
      const km = Number(((maxKm / 16) * i).toFixed(1));
      const tension = Number((9.0 + Math.random() * 5.0).toFixed(1));
      const wear = Number((1.0 + Math.random() * 3.4).toFixed(1));
      let risk = Math.min(92, Math.floor(
        (tension < 10.0 ? (10.0 - tension) * 15 : 0) +
        (wear > 3.5 ? 30 : 5) + 12
      ));
      const status = risk >= 80 ? "CRITICAL" : risk >= 50 ? "ATTENTION" : "NORMAL";

      allAssets.push({
        id: `OHE-${corrId.slice(0, 3)}-${200 + i}`,
        name: `25kV Catenary Portal #${200 + i} (${corr?.name.split("(")[0].trim()})`,
        type: "OHE_CATENARY",
        corridorId: corrId,
        locationKm: `KM ${km}`,
        status,
        failureRisk: risk,
        lastMaintenanceDate: "2026-06-15",
        nextRecommendedInspection: "2026-10-05",
        telemetry: {
          voltage: 25100 + Math.floor(Math.random() * 400),
          temperature: Number((32 + Math.random() * 14).toFixed(1)),
          oheContactWireTension: tension,
          pantographContactWear: wear,
          catenaryStaggerMm: Math.floor(-160 + Math.random() * 320),
          dynamicRiskScore: risk,
        },
        departmentResponsible: "ELEC",
      });
    }

    // Signal & Kavach
    for (let i = 1; i <= 10; i++) {
      const km = Number(((maxKm / 11) * i).toFixed(1));
      const switchOpen = Number((113.0 + Math.random() * 4.0).toFixed(1));
      let risk = Math.min(88, Math.floor(
        (Math.abs(switchOpen - 115) > 2 ? 25 : 5) + 8
      ));
      const status = risk >= 80 ? "CRITICAL" : risk >= 50 ? "ATTENTION" : "NORMAL";

      allAssets.push({
        id: `SIG-${corrId.slice(0, 3)}-${300 + i}`,
        name: `Kavach Unit & Interlocking Point #${300 + i}`,
        type: i % 2 === 0 ? "POINT_MACHINE" : "SIGNAL",
        corridorId: corrId,
        locationKm: `KM ${km}`,
        status,
        failureRisk: risk,
        lastMaintenanceDate: "2026-08-05",
        nextRecommendedInspection: "2026-10-15",
        telemetry: {
          voltage: Number((23.8 + Math.random() * 0.8).toFixed(1)),
          switchOpeningMm: switchOpen,
          cyclesCount: Math.floor(8000 + Math.random() * 6000),
          dynamicRiskScore: risk,
        },
        departmentResponsible: "SNT",
      });
    }
  });

  return allAssets;
}

export const EXPANDED_ASSETS_DATA = generateLargeScaleAssets();

// ========================================================
// 3. 50+ LIVE MOVING TRAINS
// Across All High-Density Trunk Routes
// ========================================================
export function generateLargeScaleTrains(): LiveTrain[] {
  const allTrains: LiveTrain[] = [...MOCK_LIVE_TRAINS]; // 15 on Bhopal-Itarsi

  const extraTrainDefs = [
    // Delhi - Mumbai
    { num: "12952", name: "Mumbai Rajdhani Express", prio: 1, type: "PREMIUM_SUPERFAST" as const, corr: "NDLS-MMCT", spd: 130, dir: "DOWN" as const, km: 320, del: 0, from: "NDLS", to: "MMCT" },
    { num: "12954", name: "August Kranti Rajdhani", prio: 1, type: "PREMIUM_SUPERFAST" as const, corr: "NDLS-MMCT", spd: 125, dir: "UP" as const, km: 810, del: 4, from: "MMCT", to: "NDLS" },
    { num: "12010", name: "Ahmedabad Shatabdi", prio: 1, type: "PREMIUM_SUPERFAST" as const, corr: "NDLS-MMCT", spd: 115, dir: "DOWN" as const, km: 980, del: 0, from: "ADI", to: "MMCT" },
    { num: "12903", name: "Golden Temple Mail", prio: 2, type: "EXPRESS" as const, corr: "NDLS-MMCT", spd: 90, dir: "UP" as const, km: 540, del: 12, from: "MMCT", to: "ASR" },
    { num: "19038", name: "Avadh Express", prio: 3, type: "EXPRESS" as const, corr: "NDLS-MMCT", spd: 82, dir: "DOWN" as const, km: 680, del: 28, from: "BJU", to: "BDTS" },
    
    // Delhi - Howrah
    { num: "12302", name: "Howrah Rajdhani Express", prio: 1, type: "PREMIUM_SUPERFAST" as const, corr: "NDLS-HWH", spd: 130, dir: "DOWN" as const, km: 510, del: 0, from: "NDLS", to: "HWH" },
    { num: "22436", name: "Vande Bharat (Varanasi - NDLS)", prio: 1, type: "PREMIUM_SUPERFAST" as const, corr: "NDLS-HWH", spd: 130, dir: "UP" as const, km: 740, del: 0, from: "BSB", to: "NDLS" },
    { num: "12314", name: "Sealdah Rajdhani Express", prio: 1, type: "PREMIUM_SUPERFAST" as const, corr: "NDLS-HWH", spd: 128, dir: "DOWN" as const, km: 920, del: 6, from: "NDLS", to: "SDAH" },
    { num: "12398", name: "Mahabodhi Express", prio: 2, type: "EXPRESS" as const, corr: "NDLS-HWH", spd: 88, dir: "UP" as const, km: 380, del: 15, from: "GAYA", to: "NDLS" },
    { num: "12802", name: "Purushottam Express", prio: 2, type: "EXPRESS" as const, corr: "NDLS-HWH", spd: 85, dir: "DOWN" as const, km: 1120, del: 18, from: "NDLS", to: "PURI" },

    // Western Dedicated Freight (WDFC)
    { num: "DFCC-101", name: "Double-Stack Container Rake (Mundra Port)", prio: 4, type: "FREIGHT_CONTAINER" as const, corr: "WDFC-01", spd: 95, dir: "DOWN" as const, km: 420, del: 0, from: "DER", to: "JNPT" },
    { num: "DFCC-102", name: "Automobile Ro-Ro Freight Train (Maruti Suzuki)", prio: 4, type: "FREIGHT_CONTAINER" as const, corr: "WDFC-01", spd: 90, dir: "DOWN" as const, km: 760, del: 0, from: "RE", to: "JNPT" },
    { num: "DFCC-103", name: "Export Heavy Cotton Container Rake", prio: 4, type: "FREIGHT_CONTAINER" as const, corr: "WDFC-01", spd: 88, dir: "UP" as const, km: 1040, del: 0, from: "JNPT", to: "FL" },
    { num: "DFCC-104", name: "Heavy Steel Coil Freight Special", prio: 4, type: "FREIGHT_HEAVY" as const, corr: "WDFC-01", spd: 85, dir: "UP" as const, km: 280, del: 0, from: "SAU", to: "DER" },

    // Eastern Dedicated Freight (EDFC)
    { num: "EDFC-201", name: "Heavy Coal Rake (Jharkhand Coal to Punjab Thermal)", prio: 4, type: "FREIGHT_HEAVY" as const, corr: "EDFC-01", spd: 85, dir: "UP" as const, km: 820, del: 0, from: "SEB", to: "SNL" },
    { num: "EDFC-202", name: "Rapid Fertilizer Bulk Freight Train", prio: 4, type: "FREIGHT_HEAVY" as const, corr: "EDFC-01", spd: 80, dir: "DOWN" as const, km: 460, del: 0, from: "KRJ", to: "DKAE" },
    { num: "EDFC-203", name: "Power Plant Thermal Coal Express", prio: 4, type: "FREIGHT_HEAVY" as const, corr: "EDFC-01", spd: 85, dir: "UP" as const, km: 1350, del: 0, from: "DKAE", to: "BPU" },

    // Chennai - Bengaluru
    { num: "20607", name: "Vande Bharat Express (MAS - MYS)", prio: 1, type: "PREMIUM_SUPERFAST" as const, corr: "MAS-SBC", spd: 125, dir: "DOWN" as const, km: 140, del: 0, from: "MAS", to: "MYS" },
    { num: "12027", name: "Shatabdi Express (Chennai - Bengaluru)", prio: 1, type: "PREMIUM_SUPERFAST" as const, corr: "MAS-SBC", spd: 110, dir: "UP" as const, km: 280, del: 0, from: "SBC", to: "MAS" },
    { num: "12639", name: "Brindavan Superfast Express", prio: 2, type: "EXPRESS" as const, corr: "MAS-SBC", spd: 90, dir: "DOWN" as const, km: 210, del: 5, from: "MAS", to: "SBC" },
    { num: "12608", name: "Lalbagh Express", prio: 2, type: "EXPRESS" as const, corr: "MAS-SBC", spd: 85, dir: "UP" as const, km: 85, del: 0, from: "SBC", to: "MAS" },

    // Howrah - Chennai East Coast
    { num: "12841", name: "Coromandel Express", prio: 2, type: "PREMIUM_SUPERFAST" as const, corr: "HWH-MAS", spd: 110, dir: "DOWN" as const, km: 420, del: 8, from: "HWH", to: "MAS" },
    { num: "12839", name: "Howrah - Chennai Mail", prio: 2, type: "EXPRESS" as const, corr: "HWH-MAS", spd: 95, dir: "DOWN" as const, km: 860, del: 14, from: "HWH", to: "MAS" },
    { num: "22807", name: "Santragachi - Chennai AC SF", prio: 2, type: "EXPRESS" as const, corr: "HWH-MAS", spd: 90, dir: "UP" as const, km: 1180, del: 0, from: "MAS", to: "SRC" },

    // Ahmedabad - Mumbai
    { num: "20901", name: "Vande Bharat Express (Mumbai - Gandhinagar)", prio: 1, type: "PREMIUM_SUPERFAST" as const, corr: "ADI-MMCT", spd: 130, dir: "UP" as const, km: 210, del: 0, from: "MMCT", to: "GNC" },
    { num: "12932", name: "Double Decker Express", prio: 2, type: "EXPRESS" as const, corr: "ADI-MMCT", spd: 100, dir: "DOWN" as const, km: 360, del: 4, from: "ADI", to: "MMCT" },
    { num: "12010-B", name: "Karnavati Express", prio: 2, type: "EXPRESS" as const, corr: "ADI-MMCT", spd: 95, dir: "UP" as const, km: 110, del: 0, from: "MMCT", to: "ADI" },

    // Konkan Railway
    { num: "10103", name: "Mandovi Express", prio: 3, type: "EXPRESS" as const, corr: "KONKAN-01", spd: 75, dir: "DOWN" as const, km: 260, del: 12, from: "CSMT", to: "MAO" },
    { num: "12618", name: "Mangala Lakshadweep Express", prio: 2, type: "EXPRESS" as const, corr: "KONKAN-01", spd: 80, dir: "UP" as const, km: 510, del: 22, from: "ERS", to: "NZM" },
    { num: "22119", name: "Tejas Express (CSMT - Karmali)", prio: 1, type: "PREMIUM_SUPERFAST" as const, corr: "KONKAN-01", spd: 110, dir: "DOWN" as const, km: 175, del: 0, from: "CSMT", to: "KRMI" },
    { num: "RORO-01", name: "Konkan Railway Ro-Ro Truck Carrier", prio: 4, type: "FREIGHT_CONTAINER" as const, corr: "KONKAN-01", spd: 70, dir: "UP" as const, km: 640, del: 0, from: "SURAT", to: "UD" },

    // Mumbai - Chennai
    { num: "12163", name: "LTT - Chennai Central Superfast", prio: 2, type: "EXPRESS" as const, corr: "CSMT-MAS", spd: 88, dir: "DOWN" as const, km: 410, del: 10, from: "LTT", to: "MAS" },
    { num: "22159", name: "CSMT - Chennai Central Express", prio: 3, type: "EXPRESS" as const, corr: "CSMT-MAS", spd: 82, dir: "DOWN" as const, km: 790, del: 16, from: "CSMT", to: "MAS" },
    { num: "12164", name: "Chennai - LTT SF Express", prio: 2, type: "EXPRESS" as const, corr: "CSMT-MAS", spd: 85, dir: "UP" as const, km: 620, del: 5, from: "MAS", to: "LTT" }
  ];

  extraTrainDefs.forEach((t, i) => {
    allTrains.push({
      id: `TRN-${t.num}`,
      trainNumber: t.num,
      trainName: t.name,
      priority: t.prio as 1 | 2 | 3 | 4 | 5,
      trainType: t.type,
      currentKm: t.km,
      currentSpeedKmph: t.spd,
      maxSpeedKmph: t.spd + 10,
      direction: t.dir,
      trackLine: t.dir === "UP" ? "UP_LINE" : "DOWN_LINE",
      nextBlockSection: `Section KM ${t.km + (t.dir === "DOWN" ? 15 : -15)}`,
      delayMinutes: t.del,
      origin: t.from,
      destination: t.to,
      locoNumber: `WAP-7 #${30000 + i * 47}`,
      status: t.del > 15 ? "DELAYED" : "RUNNING_ON_TIME",
    });
  });

  return allTrains;
}

export const EXPANDED_TRAINS_DATA = generateLargeScaleTrains();

// ========================================================
// 4. 100+ MAINTENANCE BLOCK REQUESTS
// Spanning Multiple Corridors & Departments
// ========================================================
export function generateLargeScaleBlockRequests(): MaintenanceBlockRequest[] {
  const allReqs: MaintenanceBlockRequest[] = [...MOCK_BLOCK_REQUESTS]; // 28 on Bhopal-Itarsi

  const extraCorridors = [
    { id: "NDLS-MMCT", name: "Mathura - Bharatpur Section", kmStart: 138, kmEnd: 145 },
    { id: "NDLS-HWH", name: "Kanpur Central Approach", kmStart: 435, kmEnd: 442 },
    { id: "WDFC-01", name: "Palanpur - Sanand Freight Sector", kmStart: 735, kmEnd: 742 },
    { id: "EDFC-01", name: "Khurja Heavy Haul Sector", kmStart: 375, kmEnd: 382 },
    { id: "MAS-SBC", name: "Katpadi - Jolarpettai Ghat Section", kmStart: 210, kmEnd: 218 },
    { id: "HWH-MAS", name: "Cuttack Mahanadi Viaduct Approach", kmStart: 405, kmEnd: 412 },
    { id: "ADI-MMCT", name: "Vadodara South High-Speed Section", kmStart: 95, kmEnd: 102 },
    { id: "CSMT-MAS", name: "Guntakal Junction Crossing", kmStart: 830, kmEnd: 838 },
    { id: "KONKAN-01", name: "Chiplun Coastal Tunnel Section", kmStart: 140, kmEnd: 148 },
  ];

  const depts: { name: 'Civil' | 'Electrical/OHE' | 'Signal & Traffic' | 'Safety'; id: DepartmentId; title: string; dur: number; ohe: boolean }[] = [
    { name: "Civil", id: "ENG", title: "Continuous Welded Rail (CWR) De-stressing & Tamping", dur: 2.5, ohe: false },
    { name: "Electrical/OHE", id: "ELEC", title: "25kV Contact Wire Replacement & Stagger Realignment", dur: 2.0, ohe: true },
    { name: "Signal & Traffic", id: "SNT", title: "Electronic Interlocking & Kavach RFID Loop Calibration", dur: 2.0, ohe: false },
    { name: "Safety", id: "SFTY", title: "Comprehensive Track Geometry Car & CRS Compliance Audit", dur: 2.0, ohe: false },
    { name: "Civil", id: "ENG", title: "Turnout 1:12 Thick Web Switch Curve Tamping", dur: 2.0, ohe: false },
    { name: "Electrical/OHE", id: "ELEC", title: "Auto-Tensioning Device (ATD) Counterweight Overhaul", dur: 2.0, ohe: true },
    { name: "Signal & Traffic", id: "SNT", title: "Axle Counter Resynchronization & Point Motor Testing", dur: 1.5, ohe: false },
    { name: "Civil", id: "ENG", title: "Bridge Pier Expansion Bearing Torquing & Lubrication", dur: 3.0, ohe: false },
  ];

  let reqCount = 101;
  extraCorridors.forEach((c) => {
    depts.forEach((d, idx) => {
      reqCount++;
      const fromKm = Number((c.kmStart + (idx * 0.8)).toFixed(1));
      const toKm = Number((fromKm + 2.5).toFixed(1));
      const statusList: MaintenanceBlockRequest["status"][] = ["Submitted", "Draft", "Submitted", "Bundled", "Sanctioned", "Active", "Closed"];
      const status = statusList[idx % statusList.length];

      allReqs.push({
        id: `REQ-${c.id.slice(0, 3)}-${reqCount}`,
        blockId: `BLK-${c.id.slice(0, 3)}-${reqCount}`,
        title: `${d.title} at ${c.name}`,
        department: d.name,
        departmentId: d.id,
        corridorId: c.id,
        fromKm,
        toKm,
        locationSection: `${c.name} (KM ${fromKm} - ${toKm})`,
        trackLine: idx % 2 === 0 ? "DOWN_LINE" : "UP_LINE",
        requestedWindow: `0${3 + (idx % 4)}:00 - 0${5 + (idx % 4)}:30 IST`,
        durationHours: d.dur,
        scheduledDate: "Tomorrow",
        resourceRequirements: d.ohe ? ["Tower Wagon #105", "Earthing Rods"] : ["Tamping Machine", "P-Way Gang"],
        cautionSpeedRequiredKmph: 30,
        requiresOHEPowerCut: d.ohe,
        status,
        riskScore: Math.floor(60 + Math.random() * 32),
        description: `Scheduled maintenance request on ${c.id}: ${d.title}. Evaluated for corridor bundling under G&SR 15.06.`,
        requestedBy: "Divisional Senior Engineer",
      });
    });
  });

  return allReqs;
}

export const EXPANDED_BLOCK_REQUESTS_DATA = generateLargeScaleBlockRequests();

// ========================================================
// 5. 15+ STATUTORY FORM T/806 SANCTIONS
// Across Major Divisions & Corridors
// ========================================================
export function generateLargeScaleSanctions(): StatutoryT806Sanction[] {
  const allSanctions: StatutoryT806Sanction[] = [...MOCK_T806_SANCTIONS];

  const extraSanctionSpecs = [
    { corr: "NDLS-MMCT", name: "Delhi - Mumbai Central Trunk Route", from: 141.0, to: 144.5, line: "DOWN_LINE" as const, num: "NR/MTJ/T806/2026/102", step: 4 as const, status: "ACTIVE_BLOCK" as const },
    { corr: "NDLS-HWH", name: "Delhi - Howrah Rajdhani Route", from: 438.0, to: 442.0, line: "UP_LINE" as const, num: "NCR/CNB/T806/2026/054", step: 3 as const, status: "SANCTIONED" as const },
    { corr: "WDFC-01", name: "Western Dedicated Freight Corridor", from: 738.0, to: 742.0, line: "DOWN_LINE" as const, num: "DFCC/PNU/T806/2026/029", step: 2 as const, status: "ISOLATION_CONFIRMED" as const },
    { corr: "MAS-SBC", name: "Chennai - Bengaluru High-Speed Corridor", from: 212.0, to: 216.5, line: "BOTH_LINES" as const, num: "SR/JTJ/T806/2026/077", step: 4 as const, status: "ACTIVE_BLOCK" as const },
    { corr: "HWH-MAS", name: "Howrah - Chennai East Coast Mainline", from: 406.0, to: 410.5, line: "DOWN_LINE" as const, num: "ECOR/CTC/T806/2026/088", step: 3 as const, status: "SANCTIONED" as const },
    { corr: "ADI-MMCT", name: "Ahmedabad - Mumbai Central Route", from: 97.0, to: 101.5, line: "UP_LINE" as const, num: "WR/BRC/T806/2026/115", step: 2 as const, status: "ISOLATION_CONFIRMED" as const },
    { corr: "EDFC-01", name: "Eastern Dedicated Freight Corridor", from: 377.0, to: 381.0, line: "DOWN_LINE" as const, num: "DFCC/KRJ/T806/2026/041", step: 4 as const, status: "ACTIVE_BLOCK" as const },
    { corr: "KONKAN-01", name: "Konkan Coastal Railway", from: 142.0, to: 146.0, line: "BOTH_LINES" as const, num: "KRCL/CHI/T806/2026/019", step: 1 as const, status: "DRAFT" as const },
  ];

  extraSanctionSpecs.forEach((spec, i) => {
    allSanctions.push({
      id: `SANCTION-T806-${spec.corr.slice(0, 3)}-${100 + i}`,
      sanctionNumber: spec.num,
      blockId: `BLK-${spec.corr.slice(0, 3)}-${200 + i}`,
      corridorId: spec.corr,
      corridorName: spec.name,
      fromKm: spec.from,
      toKm: spec.to,
      trackLine: spec.line,
      sanctionedWindow: "03:30 - 06:30 IST",
      durationHours: 3.0,
      cautionSpeedKmph: 30,
      tractionPowerCutoff: true,
      ohePermitToWorkNumber: `PTW-${spec.corr.slice(0, 3)}-2026-${300 + i}`,
      tpcIsolationCertificateNumber: `TIC-${spec.corr.slice(0, 3)}-2026-${400 + i}`,
      gsrRulesCited: [
        "G&SR 15.06 (Imposition of Line Block on Running Track)",
        "G&SR 17.08 (25kV Electric Traction Power Isolation)",
        "IRPWM 2020 Para 804 (Track Safety Clearance)"
      ],
      signoffPipeline: {
        step1DeptSubmission: { completed: true, by: "Divisional P-Way & OHE Engineers", timestamp: "2026-09-22 18:00:00 IST" },
        step2PowerIsolation: { completed: spec.step >= 2, by: "Traction Power Controller", certificate: `TIC-${spec.corr.slice(0, 3)}-400`, timestamp: "2026-09-23 03:00:00 IST" },
        step3TrafficSanction: { completed: spec.step >= 3, by: "Chief Traffic Controller (OCC)", timestamp: "2026-09-23 03:15:00 IST" },
        step4T806Issued: { completed: spec.step >= 4, by: "Chief Safety Officer (CRS)", timestamp: "2026-09-23 03:30:00 IST", qrCodeHash: `sha256_${spec.num.replace(/\//g, "_")}` },
      },
      currentStep: spec.step,
      status: spec.status,
      issuingOfficer: "Chief Controller (OCC) & Chief Safety Officer",
      issuingDesignation: "Operations & Safety Directorate",
      participatingDepartments: ["Civil (P-Way)", "Electrical (OHE)", "Signal & Kavach"],
      digitalSignatureHash: `sha256_${spec.num.replace(/\//g, "_")}_gov_seal`,
      previousHash: `sha256_prev_${i}`,
      issuedAt: "23 Sep 2026, 03:30:00 IST",
      cautionOrderSummary: `TSR 30 km/h between KM ${spec.from} and KM ${spec.to}; 25kV traction isolated.`,
    });
  });

  return allSanctions;
}

export const EXPANDED_SANCTIONS_DATA = generateLargeScaleSanctions();
