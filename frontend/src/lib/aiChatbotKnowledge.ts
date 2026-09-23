import { ServiceRequest, MaintenanceTask, BundledMaintenanceOrder, DepartmentInfo, RailwayCorridor, CorridorAsset, UserProfile } from "./types";

export interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    href: string;
  };
  quickReplies?: string[];
}

export interface BotResponse {
  text: string;
  actionButton?: {
    label: string;
    href: string;
  };
  quickReplies?: string[];
}

export const STARTER_PROMPTS: string[] = [
  "📍 What is scheduled at Mathura Section (KM 148)?",
  "📦 Explain Task Bundling & Mega Blocks in simple words",
  "📜 How do I generate and print Form T/806 Sanction Orders?",
  "🌐 How can my friends connect from multiple devices?",
  "⏱️ How does the 24-Hour Track Occupancy Timeline work?",
  "📋 How does the 9-stage approval workflow work?",
  "🔍 Why is Signal S-204 at 87% failure risk?",
  "⚡ What happens when Emergency Replan is triggered?",
  "🛠️ How do I log field work execution progress?",
  "📖 Explain railway terms like OHE, USFD, MGT, Kavach, AFTC",
];

export function generateChatbotResponse(
  query: string,
  context: {
    user: UserProfile | null;
    requests: ServiceRequest[];
    maintenanceTasks: MaintenanceTask[];
    bundles: BundledMaintenanceOrder[];
    departments: DepartmentInfo[];
    corridors: RailwayCorridor[];
    assets: CorridorAsset[];
  }
): BotResponse {
  const q = query.toLowerCase().trim();

  // 1. Mathura Section & KM 148 Queries (Live Context Search)
  if (
    q.includes("mathura") || 
    q.includes("148") || 
    q.includes("km 148") || 
    q.includes("148 km") || 
    q.includes("148-154") || 
    q.includes("148-156") || 
    q.includes("palwal")
  ) {
    // Find all matching requests and tasks for Mathura section
    const matchingReqs = context.requests.filter((r) =>
      r.locationKm?.toLowerCase().includes("mathura") ||
      r.locationKm?.includes("148") ||
      r.corridorId === "CORR-01" ||
      r.title?.toLowerCase().includes("mathura")
    );

    const matchingTasks = context.maintenanceTasks.filter((t) =>
      t.locationKm?.toLowerCase().includes("mathura") ||
      t.locationKm?.includes("148") ||
      t.corridorId === "CORR-01" ||
      t.title?.toLowerCase().includes("mathura")
    );

    const mathuraBundles = context.bundles.filter((b) =>
      b.corridorId === "CORR-01" ||
      b.locationKm?.toLowerCase().includes("mathura") ||
      b.locationKm?.includes("148")
    );

    let summaryText = `📍 **Mathura Section (KM 148.0 – 156.4) Live Status Analysis**:\n\n`;
    summaryText += `The **Mathura Jn – Palwal section** on the Delhi–Mumbai High-Density Corridor is currently monitored by IR-Sahayak.\n\n`;

    summaryText += `🔹 **Active / Pending Service Requests (${matchingReqs.length})**:\n`;
    if (matchingReqs.length > 0) {
      matchingReqs.slice(0, 4).forEach((r) => {
        summaryText += `• **[${r.id}]** ${r.title} — *${r.requestingDepartment}* (${r.locationKm}, Status: **${r.status}**, Priority: ${r.priority})\n`;
      });
    } else {
      summaryText += `• No unbundled service requests right now.\n`;
    }

    summaryText += `\n🔹 **Scheduled Maintenance Tasks (${matchingTasks.length})**:\n`;
    if (matchingTasks.length > 0) {
      matchingTasks.slice(0, 3).forEach((t) => {
        summaryText += `• **[${t.id}]** ${t.title} — *${t.departmentId}* (${t.locationKm}, ${t.estimatedDurationHours}h, Status: **${t.status}**)\n`;
      });
    }

    if (mathuraBundles.length > 0) {
      summaryText += `\n📦 **Configured Mega Blocks on this stretch (${mathuraBundles.length})**:\n`;
      mathuraBundles.forEach((b) => {
        summaryText += `• **[${b.id}]** ${b.title} (${b.timeWindow}, Status: **${b.status}**, Saved: ${b.timeReductionPercent}% time)\n`;
      });
    }

    summaryText += `\n💡 **AI Bundling Recommendation:** Because multiple departments (Civil Track, Electrical OHE, and S&T) operate on KM 148–154, click below to auto-cluster them into a single 4.5-hour Joint Night Block!`;

    return {
      text: summaryText,
      actionButton: {
        label: "🚀 Open Task Bundler for Mathura Section",
        href: "/central/bundling",
      },
      quickReplies: [
        "📦 Explain Task Bundling",
        "📜 Generate Form T/806 for Mathura",
        "⏱️ View Mathura on 24H Timeline",
      ],
    };
  }

  // 2. Specific Service Request lookup (e.g. "SR-1042", "SR-1045", "SR-1041")
  const srMatch = q.match(/sr-?\s*(\d+)/i);
  if (srMatch) {
    const srId = `SR-${srMatch[1]}`;
    const foundReq = context.requests.find(
      (r) => r.id.toLowerCase() === srId.toLowerCase() || r.id.toLowerCase().includes(srMatch[1])
    );

    if (foundReq) {
      return {
        text: `📋 **Service Request Details: ${foundReq.id}**\n\n` +
          `• **Title:** ${foundReq.title}\n` +
          `• **Requesting Dept:** ${foundReq.requestingDepartment} ➔ **Target Dept:** ${foundReq.targetDepartment}\n` +
          `• **Location:** ${foundReq.locationKm} (Corridor: ${foundReq.corridorId})\n` +
          `• **Status:** **${foundReq.status}**\n` +
          `• **Priority:** ${foundReq.priority} | **AI Risk Score:** ${foundReq.aiRiskScore}%\n` +
          `• **Estimated Budget:** ₹${(foundReq.estimatedCost || foundReq.costBreakdown?.totalEstimated || 0).toLocaleString("en-IN")}\n` +
          `• **Required Resources:** ${(foundReq.resourcesRequired || []).join(", ")}\n` +
          (foundReq.sanctionOrderNumber ? `• **Sanction Order:** ${foundReq.sanctionOrderNumber}\n` : "") +
          (foundReq.progress !== undefined ? `• **Execution Progress:** ${foundReq.progress}%\n` : "") +
          `\n**Description:** ${foundReq.description}`,
        actionButton: {
          label: "🔍 View Request in Approval Center",
          href: "/central/approvals",
        },
        quickReplies: [
          "Explain approval stages",
          "How to bundle this request?",
          "How to log progress?",
        ],
      };
    }
  }

  // 3. Multi-Device & Network Connection (Friends login from other devices)
  if (
    q.includes("multi device") ||
    q.includes("multiple device") ||
    q.includes("connect") ||
    q.includes("network") ||
    q.includes("wifi") ||
    q.includes("friend") ||
    q.includes("friends") ||
    q.includes("dost") ||
    q.includes("ip address") ||
    q.includes("lan")
  ) {
    return {
      text: `🌐 **How to Connect & Simulate with Friends on Multiple Devices**:
      
RAILPLAN AI is configured to run on your local network (**0.0.0.0:3000**) so everyone can collaborate in real-time!

**Quick Setup Steps:**
1. Connect all laptops/phones to the **same Wi-Fi or hotspot network**.
2. On other devices, open the browser and enter:
   👉 **\`http://10.124.42.156:3000\`** *(or your host computer's Wi-Fi IP:3000)*
3. **Role Distribution for Realistic Simulation:**
   - 👑 **You:** Login as **Central Admin (Railway Board Authority)**
   - 🏗️ **Friend 1:** Switch to **Engineering Department (Civil P-Way)**
   - ⚡ **Friend 2:** Switch to **Electrical (OHE)**
   - 🚦 **Friend 3:** Switch to **Signal & Telecom (S&T)**
4. **Test the Real-Time Flow:**
   - Friends create requests for track block at Mathura (KM 148).
   - You receive the live notification on Central Dashboard.
   - You open **Task Bundling** (\`/central/bundling\`) or **Approval Center** (\`/central/approvals\`) to approve/bundle them!
   - All friends get instant push notifications and status updates!`,
      actionButton: {
        label: "🏛️ Switch Roles / View Persona Guide",
        href: "/central/departments",
      },
      quickReplies: [
        "📦 Explain Task Bundling",
        "📋 How does the approval workflow work?",
        "📍 Check Mathura Section status",
      ],
    };
  }

  // 4. Official Sanction Orders (Form T/806, Form T/409, Form T/1518)
  if (
    q.includes("form t/806") || 
    q.includes("t/806") || 
    q.includes("t/409") || 
    q.includes("t/1518") || 
    q.includes("sanction order") || 
    q.includes("gazette") || 
    q.includes("print order") || 
    q.includes("official order")
  ) {
    return {
      text: `📜 **Official Indian Railways Sanction Orders (G&SR Certified)**:

Under the **Indian Railways General Rules & Subsidiary Rules (G&SR)**, all maintenance track possessions and speed restrictions require statutory documentation:

1. **Form T/806 (Block Requisition & 25kV Traction Power Isolation)**:
   - Official sanction issued by Executive Director (O&M) / Railway Board for track closures.
   - Includes QR code, SHA-256 digital signature digest, and 25kV OHE earth discharge certificate.
2. **Form T/409 (Notice of Caution / TSR)**:
   - Issued to Loco Pilots of all express trains traversing adjacent tracks with temporary engineering speed restrictions (e.g. 30 km/h Caution).
3. **Form T/1518 (Track Fitness Certificate)**:
   - Joint physical safety sign-off by SSE (P-Way) and SSE (Signal/OHE) prior to restoring normal line speed.

*You can view and print official Government of India sanction documents directly from the Sanctions portal or inside any approved request!*`,
      actionButton: {
        label: "📜 Open Official Sanctions Portal",
        href: "/central/sanctions",
      },
      quickReplies: [
        "Explain Task Bundling",
        "How does the approval workflow work?",
        "Show 24-Hour Track Timeline",
      ],
    };
  }

  // 5. 24-Hour Track Occupancy Gantt
  if (
    q.includes("gantt") || 
    q.includes("timeline") || 
    q.includes("24 hour") || 
    q.includes("track occupancy") || 
    q.includes("schedule diagram") || 
    q.includes("line 1") || 
    q.includes("up main")
  ) {
    return {
      text: `⏱️ **24-Hour Master Track Occupancy Timeline**:

The Master Section Diagram plots 24 hours of operational railway traffic across all sectional lines:

- **Line 1 (UP Main Track - 160 km/h)**: Passenger express paths (Vande Bharat, Tejas Rajdhani) and scheduled 4-hour night maintenance slots.
- **Line 2 (DOWN Main Track - 160 km/h)**: Southbound express rakes with 30 km/h caution order overlays.
- **Line 3 (Yard Loop / Overtaking Track)**: Goods rakes and precedence loops.
- **Line 4 (DFC Dedicated Freight Line)**: Heavy-haul double-stack container rakes from Mundra and Pipavav ports.

**Zero-Conflict Optimization:** All major maintenance works are synchronized into the **01:30 to 05:30 night mega block**, ensuring zero cancellation of daytime passenger services!`,
      actionButton: {
        label: "⏱️ Open 24H Master Timeline",
        href: "/central/planning",
      },
      quickReplies: [
        "Explain Task Bundling savings",
        "How do I generate Form T/806?",
        "What are the 4 directorates?",
      ],
    };
  }

  // 6. Task Bundling & Mega Blocks (In-Depth + Hinglish)
  if (
    q.includes("bundl") || 
    q.includes("mega block") || 
    q.includes("joint block") || 
    q.includes("combine task") || 
    q.includes("fayda") || 
    q.includes("kya hota hai")
  ) {
    return {
      text: `📦 **Task Bundling & Joint Mega Blocks Explained Simply**:

Normally, when different railway departments (Civil Track, Electrical OHE, and Signal & Telecom) need maintenance on the same track, they block train traffic separately:
- Track Machine wants 4 hours on Monday
- OHE Catenary wants 4 hours on Wednesday
- S&T Kavach testing wants 3 hours on Friday
🚫 **Result:** 11 total hours of track shutdown, delayed trains, and angry passengers!

**How RAILPLAN AI solves this with Task Bundling:**
1. 🧠 **AI Clustering Engine**: Looks at all requests and notices they are all in the same area (e.g. **Mathura KM 148–154**) around the same time.
2. ⚡ **1 Single Joint Window**: Bundles them into **one synchronized 4.5-hour night block** (01:30 AM – 06:00 AM).
3. 🎯 **The Big Wins**:
   - 📉 **35% to 58% reduction** in total track closure time
   - ⏱️ **240+ minutes** of passenger train delay prevented
   - 💰 **₹1,85,000 to ₹3,50,000 saved** in shared safety escorts, power cut permits, and mobilization.
   - 📜 **Auto-Sanction**: Approves all bundled departmental requests and generates the statutory **Form T/806**!`,
      actionButton: {
        label: "🚀 Open AI Task Bundler",
        href: "/central/bundling",
      },
      quickReplies: [
        "📍 Show Mathura Section activities",
        "📜 How do I generate Form T/806?",
        "📋 How does the approval workflow work?",
      ],
    };
  }

  // 7. Hinglish / Hindi assistance for Beginners
  if (
    q.includes("hindi") ||
    q.includes("hinglish") ||
    q.includes("kaise kare") ||
    q.includes("kya hai") ||
    q.includes("samjhao") ||
    q.includes("batao") ||
    q.includes("kaise use kare")
  ) {
    return {
      text: `🇮🇳 **RAILPLAN AI - Simple Hinglish Guide**:

Aapka swagat hai! Ye system Indian Railways ke track maintenance aur train schedules ko smartly manage karta hai:

1. **Service Request (Maang patra)**: Koi bhi department (Track, OHE, Signal) track par kaam karne ke liye permission request daal sakta hai.
2. **Task Bundling (Joda Block)**: Agar Track aur Bijli dono ko Mathura KM 148 par kaam karna hai, to AI dono ko ek hi raat ke 4 ghante ke block me jod deta hai taaki train baar-baar na roke!
3. **Approval (Swikriti)**: Central Admin ek click me request approve karta hai aur official **Form T/806** order generate hota hai.
4. **Work Progress (Kaam ki report)**: Ground staff field se live progress (25% ➔ 50% ➔ 100%) update karte hain.
5. **Dosto ke sath test karein**: Sabhi log alag-alag phone/laptop se jud sakte hain aur ek doosre ko live updates bhej sakte hain!`,
      actionButton: {
        label: "🚀 Try Task Bundling Now",
        href: "/central/bundling",
      },
      quickReplies: [
        "📍 Mathura Section status dekho",
        "🌐 Friends ko kaise connect kare?",
        "📜 Form T/806 kya hota hai?",
      ],
    };
  }

  // 8. 9-Stage Approval Workflow
  if (
    q.includes("workflow") || 
    q.includes("approval") || 
    q.includes("stages") || 
    q.includes("status") || 
    q.includes("sanction")
  ) {
    return {
      text: `📋 **The 9-Stage Service Request & Approval Workflow**:

Every inter-departmental railway maintenance request follows this structured lifecycle to guarantee safety and accountability:

1. **DRAFT**: Prepared by requesting department with estimated costs & resources.
2. **SUBMITTED**: Formally dispatched into the central network.
3. **UNDER REVIEW**: AI risk algorithm evaluates urgency (0-100%) and central authority reviews dependencies.
4. **CENTRAL APPROVAL / MODIFICATION**: Central Admin approves, rejects, or requests changes.
5. **APPROVED**: Official sanction granted by the Railway Board authority (Form T/806 generated).
6. **ASSIGNED**: Delegated to the executing department (e.g. Electrical, Track Machine).
7. **IN PROGRESS**: Field crews execute work and log milestone percentages (25% ➔ 50% ➔ 75%).
8. **COMPLETED**: 100% work finished with inspection certificates & photo proof attached.
9. **VERIFIED & CLOSED**: Central Admin validates safety checks; budget utilization finalized.`,
      actionButton: {
        label: "🔍 Go to Approval Center",
        href: "/central/approvals",
      },
      quickReplies: [
        "How do I create a service request?",
        "How does AI calculate risk score?",
        "What happens during field execution?",
      ],
    };
  }

  // 9. Digital Twin & Asset Telemetry (TQI, Catenary Stagger, Tongue Opening)
  if (
    q.includes("digital twin") || 
    q.includes("sensor") || 
    q.includes("telemetry") || 
    q.includes("signal s-204") || 
    q.includes("s-204") || 
    q.includes("tqi") || 
    q.includes("catenary") || 
    q.includes("stagger") || 
    q.includes("aftc")
  ) {
    const s204 = context.assets.find((a) => a.id === "AST-SIG-204");
    const s204Risk = s204 ? String(s204.failureRisk) : "87";
    const s204Volt = s204?.telemetry.voltage !== undefined ? String(s204.telemetry.voltage) : "108.4";
    const s204Temp = s204?.telemetry.temperature !== undefined ? String(s204.telemetry.temperature) : "44.2";
    const s204Vib = s204?.telemetry.vibration !== undefined ? String(s204.telemetry.vibration) : "3.8";

    return {
      text: `🛰️ **Digital Twin & Railway Engineering Telemetry**:

The Digital Twin captures physical infrastructure parameters across all engineering disciplines:

- **Signal S-204 & Audio Frequency Track Circuit (AFTC)**:
  - *Telemetry*: Voltage = ${s204Volt}V, Core Temp = ${s204Temp}°C, Vibration = ${s204Vib} mm/s, Carrier = 1699Hz.
  - *Risk Factor*: **${s204Risk}%** 🔴 due to thermal micro-fluctuations matching relay burnout profile.
- **25kV OHE Catenary Wire (KM 149-153)**:
  - *Telemetry*: Stagger = **±185mm** (Nominal ±200mm), Tensile Stress = 215 MPa, Voltage = 25,400V.
- **60kg UIC Rail Joint & Track Quality Index (TQI)**:
  - *Telemetry*: TQI Score = **28.4** (Standard < 36), Stress = 310 MPa, Vibration = 5.6 mm/s.`,
      actionButton: {
        label: "🌐 Open 3D Digital Twin View",
        href: "/central/digital-twin",
      },
      quickReplies: [
        "Why is Signal S-204 at 87% failure risk?",
        "What is USFD testing?",
        "What is What-If simulation?",
      ],
    };
  }

  // 10. What-If Scenario Simulator
  if (
    q.includes("what if") || 
    q.includes("simulator") || 
    q.includes("simulation") || 
    q.includes("monsoon") || 
    q.includes("delay slider")
  ) {
    return {
      text: `🎛️ **What-If Scenario Simulator**:

The Simulator lets railway officers test the ripple effects of real-world operational challenges before making high-stakes decisions:

**Adjustable Variables:**
- ⏳ **Maintenance Delay (0 to 30 Days)**: See how delaying track work accelerates asset failure risk non-linearly.
- 👥 **Workforce Availability (20% - 100%)**: Test crew shortages during festive or leave periods.
- 🚜 **Heavy Equipment Uptime (20% - 100%)**: Simulate breakdowns in tamping or crane machinery.
- 🚆 **Freight Traffic Density (20 - 120 MGT)**: Model wear-and-tear under heavy double-stack container traffic.
- 🌧️ **Monsoon Weather Severity**: Low, Medium, High, Extreme flood scenarios.

**Real-Time Computed Outputs:** Failure probability curve, Cost escalation in ₹, Passenger disruption counts, and Train delay minutes.`,
      actionButton: {
        label: "🎛️ Open What-If Simulator",
        href: "/central/what-if",
      },
      quickReplies: [
        "What is an Emergency Replan?",
        "How is cost calculated?",
        "Explain Task Bundling",
      ],
    };
  }

  // 11. Emergency Replan
  if (
    q.includes("emergency") || 
    q.includes("replan") || 
    q.includes("fracture") || 
    q.includes("disaster") || 
    q.includes("rerout")
  ) {
    return {
      text: `🚨 **Emergency Replanning Command**:

When critical incidents occur (such as a sudden **Rail Fracture**, **25kV OHE Catenary Snap**, or **Point Machine Jam**), the Emergency Replan engine coordinates rapid response:

1. **Instant Incident Dispatch**: Logs the exact corridor KM, incident severity, and reporting officer.
2. **Passenger Train Rerouting**: Automatically diverts high-priority trains (e.g. 12951 Mumbai Tejas Rajdhani) via alternative chord lines or loop lines.
3. **Emergency Track & Power Block**: Schedules an immediate 4.5-hour priority repair window.
4. **Heavy Equipment Mobilization**: Dispatches the 140-Tonne Breakdown Crane (CR-01), OHE Tower Wagon, and P-Way Gang Alpha.`,
      actionButton: {
        label: "⚡ View Emergency Command",
        href: "/central/emergency",
      },
      quickReplies: [
        "How do I log work progress?",
        "What are the 4 directorates?",
        "Explain Task Bundling",
      ],
    };
  }

  // 12. Creating Requests & Logging Progress
  if (
    q.includes("create request") || 
    q.includes("new request") || 
    q.includes("log progress") || 
    q.includes("execution") || 
    q.includes("milestone") || 
    q.includes("how to submit")
  ) {
    return {
      text: `🛠️ **Creating Requests & Logging Field Progress**:

**To Create a New Service Request:**
1. Navigate to **"Create Request"** from your department sidebar.
2. Fill in: Target Department, Corridor, Location KM, Priority, Estimated Cost Breakdown, and Equipment Required.
3. Submit for Central Approval — it immediately generates an **SR-XXXX** tracking ID!

**To Log Work Execution (Assigned Department):**
1. Open **"Work Progress"** (\`/department/execution\`).
2. Click the milestone buttons: **0% (Not Started)** ➔ **25% (Mobilized)** ➔ **50% (Halfway)** ➔ **75% (Testing)** ➔ **100% (Completed)**.
3. Enter shift notes, report any delays, and attach inspection photo proof.
4. Central Command receives live progress updates instantly!`,
      actionButton: {
        label: "📝 Create a Service Request",
        href: "/department/create-request",
      },
      quickReplies: [
        "How does approval work?",
        "Show my department tasks",
        "Explain cost breakdown",
      ],
    };
  }

  // 13. Cost Breakdown & Budgets
  if (
    q.includes("cost") || 
    q.includes("budget") || 
    q.includes("financial") || 
    q.includes("breakdown") || 
    q.includes("expense") || 
    q.includes("capex")
  ) {
    return {
      text: `💰 **6-Part Standard Railway Cost Breakdown**:

Every service request transparently items across 6 standardized heads:

1. **Labour Cost**: Technicians, gangmen, linemen, and certified supervisors.
2. **Equipment Charges**: Tamping machines, tower wagons, laser gauges, cranes.
3. **Materials**: Rail sections, sleepers, fishplates, contact wire, epoxy paint.
4. **Logistics & Transport**: Dispatching machinery and workforce squads to the site.
5. **Track Block Opportunity Cost**: Demurrage or passenger regulation cost during closure.
6. **Contingency Reserve (5-10%)**: Buffer for unforeseen site anomalies or weather delays.

*All costs are tracked against annual Railway Board sanctioned grants in real time!*`,
      actionButton: {
        label: "📊 View Cost & Budgets",
        href: "/central/costs",
      },
      quickReplies: [
        "Explain Task Bundling savings",
        "What is What-If simulation?",
        "What are the 4 directorates?",
      ],
    };
  }

  // 14. 4 Railway Directorates Explained (Civil, Electrical/OHE, Signal & Traffic, Safety)
  if (
    q.includes("department") || 
    q.includes("roles") || 
    q.includes("who does what") || 
    q.includes("personas")
  ) {
    return {
      text: `🏢 **The 4 Unified Engineering & Safety Directorates**:

1. **Civil (ENG)**: Permanent Way track infrastructure, rail renewals, ballast tamping, bridges, formation stabilization, and USFD flaw scans.
2. **Electrical/OHE (ELEC)**: 25kV traction catenary lines, substations, neutral sections, pantograph interfaces, and power blocks.
3. **Signal & Traffic (SNT)**: Electronic interlocking, Kavach (TCAS), point machines, axle counters, signals, and optical fiber telecom.
4. **Safety (SFTY)**: Statutory safety audits, CRS certifications, G&SR T/806 sanction governance, and derailment prevention oversight.`,
      actionButton: {
        label: "🏛️ View 4-Directorate Matrix",
        href: "/central/departments",
      },
      quickReplies: [
        "How do I switch personas?",
        "Explain approval workflow",
        "Explain railway terms",
      ],
    };
  }

  // 15. Railway Acronyms Dictionary (Kavach, OHE, USFD, MGT, etc.)
  if (
    q.includes("acronym") || 
    q.includes("ohe") || 
    q.includes("usfd") || 
    q.includes("mgt") || 
    q.includes("kavach") || 
    q.includes("p-way") || 
    q.includes("crs") || 
    q.includes("rdso") || 
    q.includes("terms") || 
    q.includes("meaning")
  ) {
    return {
      text: `📖 **Indian Railways Technical Acronyms Glossary**:

- **OHE**: *Overhead Electrification* (25,000 Volts AC contact wire and catenary system).
- **USFD**: *Ultrasonic Flaw Detection* (High-frequency sound wave testing inside rail steel to catch hidden cracks).
- **MGT**: *Million Gross Tonnes* (Standard measurement of railway traffic density and wear over time).
- **Kavach (TCAS)**: *Train Collision Avoidance System* (Indigenous automatic braking & signal cab protection).
- **P-Way**: *Permanent Way* (The rail track pair, sleepers, ballast bed, and underlying formation).
- **CRS**: *Commission of Railway Safety* (Statutory authority certifying passenger speed clearances).
- **RDSO**: *Research Designs & Standards Organisation* (Ministry of Railways technical R&D body).
- **CWR**: *Continuous Welded Rail* (Long jointless rail strings preventing clickety-clack joint wear).
- **AFTC**: *Audio Frequency Track Circuit* (Jointless coded track occupancy detection).`,
      actionButton: {
        label: "🔍 Open Live Corridor Map",
        href: "/central/map",
      },
      quickReplies: [
        "Explain Task Bundling",
        "Why is Signal S-204 at risk?",
        "How do I log work progress?",
      ],
    };
  }

  // Default fallback answer with helpful dynamic summary
  return {
    text: `👋 **Namaste! I am IR-Sahayak, your Indian Railways AI Assistant.**

I have live visibility across **${context.requests.length} service requests**, **${context.maintenanceTasks.length} maintenance tasks**, and **${context.bundles.length} active Mega Blocks**.

Here is what I can help you with:
- 📍 **Mathura Section (KM 148)**: Check live pending requests & bundling opportunities.
- 📦 **Task Bundling**: How combining tasks saves 35-58% track closure time.
- 📜 **Form T/806 Sanction Orders**: How block requisitions and TSR caution notices are issued.
- 🌐 **Multi-Device Simulation**: How to connect friends from other phones/laptops over Wi-Fi.
- ⏱️ **24H Master Timeline**: How train paths and 4-hour night mega blocks are synchronized.
- 📋 **9-Stage Workflow**: How requests move from Draft to Approval, Execution, and Audit Closure.
- 🛰️ **Engineering Telemetry**: What TQI index, catenary wire stagger (±185mm), and AFTC readings mean.

*What would you like to explore?*`,
    quickReplies: [
      "📍 What is scheduled at Mathura Section (KM 148)?",
      "✨ Explain Task Bundling & Mega Blocks",
      "🌐 How can my friends connect from other devices?",
      "📜 How do I generate and print Form T/806?",
    ],
  };
}

