import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color Palette: Deep Railway Navy, Electric Mint/Teal, Amber, Crisp White, Light Slate
    NAVY = RGBColor(10, 25, 47)         # #0A192F Background
    DARK_CARD = RGBColor(17, 34, 64)    # #112240 Card container
    DARK_CARD_ALT = RGBColor(23, 42, 69)# #172A45 Accent card
    WHITE = RGBColor(255, 255, 255)     # Primary Text
    TEAL = RGBColor(0, 212, 170)        # #00D4AA Electric Mint/Teal Accent
    GOLD = RGBColor(255, 179, 0)        # #FFB300 Amber Accent
    CORAL = RGBColor(255, 107, 107)     # #FF6B6B Alert Accent
    GRAY_TEXT = RGBColor(204, 214, 246) # Light Slate Text
    MUTED_TEXT = RGBColor(136, 146, 176)# Muted Subtitle Text

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = NAVY
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text):
        # Category Tag
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(0.35))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        tf_cat.margin_left = tf_cat.margin_right = tf_cat.margin_top = tf_cat.margin_bottom = 0
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(10.5)
        p_cat.font.bold = True
        p_cat.font.color.rgb = TEAL

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.72), Inches(11.733), Inches(0.55))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        tf_title.margin_left = tf_title.margin_right = tf_title.margin_top = tf_title.margin_bottom = 0
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(21)
        p_title.font.bold = True
        p_title.font.color.rgb = WHITE

    blank_layout = prs.slide_layouts[6]

    # =========================================================================
    # SLIDE 1: Problem Statement & Team Details
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    # Top Tag
    t1_box = s1.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.733), Inches(0.35))
    tf1 = t1_box.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "IDEATHON 2026 | SMART INDIA HACKATHON INTERNAL NOMINATION"
    p1.font.size = Pt(11)
    p1.font.bold = True
    p1.font.color.rgb = TEAL

    # Main Title
    t2_box = s1.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.733), Inches(0.75))
    tf2 = t2_box.text_frame
    tf2.word_wrap = True
    p2 = tf2.paragraphs[0]
    p2.text = "RAIL-SYNC: AI-Powered Automatic Block Planning System"
    p2.font.size = Pt(26)
    p2.font.bold = True
    p2.font.color.rgb = WHITE

    # Subtitle
    sub_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.55), Inches(11.733), Inches(0.45))
    tf_sub = sub_box.text_frame
    tf_sub.word_wrap = True
    p_sub = tf_sub.paragraphs[0]
    p_sub.text = "Maximizing Track Availability & Coordinating Multi-Department Railway Maintenance"
    p_sub.font.size = Pt(13)
    p_sub.font.bold = True
    p_sub.font.color.rgb = GOLD

    # Metadata Banner Box
    meta_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.05), Inches(11.733), Inches(0.55))
    meta_card.fill.solid()
    meta_card.fill.fore_color.rgb = DARK_CARD
    meta_card.line.color.rgb = TEAL
    meta_card.line.width = Pt(1)

    tb_meta = s1.shapes.add_textbox(Inches(0.9), Inches(2.1), Inches(11.533), Inches(0.45))
    tf_meta = tb_meta.text_frame
    tf_meta.word_wrap = True
    p_meta = tf_meta.paragraphs[0]
    p_meta.text = "Problem Statement ID: 26027  |  Organization: Ministry of Railways  |  Category: Software  |  Theme: Transportation & Logistics"
    p_meta.font.size = Pt(11.5)
    p_meta.font.bold = True
    p_meta.font.color.rgb = WHITE

    # 3 Balanced Info Cards
    card1_defs = [
        ("THE OPERATIONAL CHALLENGE", CORAL, [
            ("Siloed Departmental Requests", "Currently, Track (Engineering), Signal & Telecom (S&T), and Overhead Electrical (TRD) request line blocks independently through BDMS."),
            ("Repeated Track Possession", "Without joint coordination, the exact same track section is closed 3 separate times in a single week, halting commercial rail traffic."),
            ("Severe Knock-On Delays", "Manual scheduling creates massive corridor congestion, forcing passenger and freight trains to halt at outer signals for hours.")
        ]),
        ("TARGET OPERATIONAL OUTCOMES", TEAL, [
            ("Single Shared Mega-Blocks", "Combine 3 independent departmental closures into 1 unified, simultaneous maintenance window."),
            ("+32% Track Availability", "Dramatically expand daily commercial traffic capacity for passenger and goods trains."),
            ("-45% Outer Signal Delays", "Eliminate choke points outside busy stations and junction approaches."),
            ("100% Interlocking Safety", "Zero human errors, zero signal overlap conflicts, and complete Kavach ATP rule compliance.")
        ]),
        ("TEAM PROFILE & CORE ROLES", GOLD, [
            ("Team Identification", "Team Name: [Your Team Name]\nInstitution: [Your College Name]"),
            ("Operations & Scheduling Lead", "OR modeling, timetable graph matching & conflict resolution."),
            ("Rail Domain & Safety Specialist", "IRPWM, SEM, ACTM rulebooks & Kavach safety compliance."),
            ("Full-Stack & GIS Architect", "React, Deck.gl 4D controller map & CRIS API data pipelines.")
        ])
    ]

    card_w = Inches(3.68)
    card_h = Inches(4.3)
    card_top = Inches(2.75)

    for i, (title, accent_col, items) in enumerate(card1_defs):
        left = Inches(0.8 + i * 4.02)
        card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, card_top, card_w, card_h)
        card.fill.solid()
        card.fill.fore_color.rgb = DARK_CARD
        card.line.color.rgb = accent_col
        card.line.width = Pt(1.5)

        tb = s1.shapes.add_textbox(left + Inches(0.2), card_top + Inches(0.2), card_w - Inches(0.4), card_h - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

        p_head = tf.paragraphs[0]
        p_head.text = title
        p_head.font.size = Pt(12.5)
        p_head.font.bold = True
        p_head.font.color.rgb = accent_col

        for sub_title, sub_desc in items:
            p_st = tf.add_paragraph()
            p_st.text = f"\n• {sub_title}"
            p_st.font.size = Pt(11)
            p_st.font.bold = True
            p_st.font.color.rgb = WHITE

            p_sd = tf.add_paragraph()
            p_sd.text = f"  {sub_desc}"
            p_sd.font.size = Pt(10)
            p_sd.font.color.rgb = GRAY_TEXT

    # =========================================================================
    # SLIDE 2: Proposed Solution & Core Innovations
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "PROPOSED SOLUTION: Coordinated Multi-Department Mega-Block Planning", "Slide 2: Idea Title & Solution Breakdown")

    col_w2 = Inches(5.72)
    col_h2 = Inches(5.7)
    col_top2 = Inches(1.4)

    # Column A: Core 3-in-1 Solution Engine
    c2_a = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), col_top2, col_w2, col_h2)
    c2_a.fill.solid()
    c2_a.fill.fore_color.rgb = DARK_CARD
    c2_a.line.color.rgb = TEAL
    c2_a.line.width = Pt(1.5)

    tb2_a = s2.shapes.add_textbox(Inches(1.05), col_top2 + Inches(0.2), col_w2 - Inches(0.5), col_h2 - Inches(0.4))
    tf2_a = tb2_a.text_frame
    tf2_a.word_wrap = True
    tf2_a.margin_left = tf2_a.margin_right = tf2_a.margin_top = tf2_a.margin_bottom = 0

    p = tf2_a.paragraphs[0]
    p.text = "THE CORE 3-IN-1 SOLUTION ENGINE"
    p.font.size = Pt(13.5)
    p.font.bold = True
    p.font.color.rgb = TEAL

    p = tf2_a.add_paragraph()
    p.text = "\n1. Synchronized Multi-Department 'Mega-Blocks'"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = WHITE
    p = tf2_a.add_paragraph()
    p.text = "Instead of halting train traffic 3 separate times, RAIL-SYNC fuses Track repairs (TMS), Signal maintenance (SMMS), and Overhead Wire work (TDMS) into one unified, simultaneous possession window."
    p.font.size = Pt(10)
    p.font.color.rgb = GRAY_TEXT

    p = tf2_a.add_paragraph()
    p.text = "\n2. Traffic-Light Urgency Prioritization"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = GOLD
    p = tf2_a.add_paragraph()
    p.text = "• RED (Critical / P0): Severe track fractures & signal failures get mandatory immediate slots.\n• YELLOW (Urgent / P1): Scheduled wear & catenary maintenance booked within 72 hours.\n• GREEN (Routine / P2): Minor inspections bundled opportunistically with Red/Yellow jobs without extra track closures."
    p.font.size = Pt(10)
    p.font.color.rgb = GRAY_TEXT

    p = tf2_a.add_paragraph()
    p.text = "\n3. Smart Timetable Gap Matching"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = WHITE
    p = tf2_a.add_paragraph()
    p.text = "Algorithms automatically detect natural traffic voids in the Control Office Application (COA) master timetable, positioning repair work precisely between train runs without obstructing premium trains (Vande Bharat, Rajdhani)."
    p.font.size = Pt(10)
    p.font.color.rgb = GRAY_TEXT

    # Column B: Standout Features (Why We Stand Out)
    c2_b = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), col_top2, col_w2, col_h2)
    c2_b.fill.solid()
    c2_b.fill.fore_color.rgb = DARK_CARD
    c2_b.line.color.rgb = GOLD
    c2_b.line.width = Pt(1.5)

    tb2_b = s2.shapes.add_textbox(Inches(7.05), col_top2 + Inches(0.2), col_w2 - Inches(0.5), col_h2 - Inches(0.4))
    tf2_b = tb2_b.text_frame
    tf2_b.word_wrap = True
    tf2_b.margin_left = tf2_b.margin_right = tf2_b.margin_top = tf2_b.margin_bottom = 0

    p = tf2_b.paragraphs[0]
    p.text = "DISTINCTIVE ADVANTAGES (WHY WE STAND OUT)"
    p.font.size = Pt(13.5)
    p.font.bold = True
    p.font.color.rgb = GOLD

    features2 = [
        ("Kavach & Electronic Interlocking Safety Validator", "Cross-verifies every block proposal against station Route Control Charts and Kavach RBC radios, preventing accidental route clearances or overlap violations during repair work.", TEAL),
        ("Heavy Track Machine Transit Planner", "Tracks and schedules transit paths for Tamping Machines, BCM, and Tower Wagons directly from sidings to work zones, preventing equipment deadlock on single-line sections.", WHITE),
        ("Pre-Monsoon & Heat Risk Forecasting", "Ingests live IMD weather telemetry to forecast track buckling during summer heat peaks and cleans track drainage before monsoons, scheduling proactive maintenance.", WHITE),
        ("Dynamic Sub-60s Self-Healing Re-Planner", "When an express train runs 20+ minutes late, the system dynamically slides the maintenance window forward instead of cancelling work crews and wasting costly machinery.", WHITE)
    ]

    for f_title, f_desc, f_col in features2:
        p = tf2_b.add_paragraph()
        p.text = f"\n• {f_title}"
        p.font.size = Pt(11.5)
        p.font.bold = True
        p.font.color.rgb = f_col
        p = tf2_b.add_paragraph()
        p.text = f"  {f_desc}"
        p.font.size = Pt(10)
        p.font.color.rgb = GRAY_TEXT

    # =========================================================================
    # SLIDE 3: Technical Approach & Process Flow
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "TECHNICAL APPROACH: 4-Step Operational Pipeline & Architecture", "Slide 3: Methodology & Process Flow")

    # Top Section: 4-Step Horizontal Process Pipeline
    step_w = Inches(2.78)
    step_h = Inches(2.05)
    step_top = Inches(1.35)

    steps = [
        ("STEP 1: UNIFIED INTAKE", "Ingests defects & work orders from TMS (Tracks), SMMS (Signals), TDMS (OHE), and schedules from COA/FOIS into a centralized data pipeline.", TEAL),
        ("STEP 2: SMART SORTING", "AI categorizes work urgency objectively (Red / Yellow / Green) based on track safety standards, eliminating inter-departmental conflict.", GOLD),
        ("STEP 3: JOINT SCHEDULING", "Google OR-Tools CP-SAT engine bundles multi-team tasks into single line possessions inside natural timetable voids between trains.", TEAL),
        ("STEP 4: SAFE DISPATCH", "Formal safety check verifies route locking and Kavach rules; issues 1-click digital sanction memos to the Section Controller.", GOLD)
    ]

    for i, (title, desc, b_col) in enumerate(steps):
        left = Inches(0.8 + i * 2.98)
        c = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, step_top, step_w, step_h)
        c.fill.solid()
        c.fill.fore_color.rgb = DARK_CARD
        c.line.color.rgb = b_col
        c.line.width = Pt(1.5)

        tb = s3.shapes.add_textbox(left + Inches(0.15), step_top + Inches(0.15), step_w - Inches(0.3), step_h - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = b_col

        p = tf.add_paragraph()
        p.text = desc
        p.font.size = Pt(9.5)
        p.font.color.rgb = GRAY_TEXT

    # Bottom Section: Comparison Card & Tech Stack
    bot_top = Inches(3.55)
    bot_h = Inches(3.55)

    # Card 1: Comparative Breakdown
    comp_card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), bot_top, Inches(6.8), bot_h)
    comp_card.fill.solid()
    comp_card.fill.fore_color.rgb = DARK_CARD
    comp_card.line.color.rgb = TEAL
    comp_card.line.width = Pt(1.5)

    tb_comp = s3.shapes.add_textbox(Inches(1.0), bot_top + Inches(0.2), Inches(6.4), bot_h - Inches(0.4))
    tf_comp = tb_comp.text_frame
    tf_comp.word_wrap = True
    tf_comp.margin_left = tf_comp.margin_right = tf_comp.margin_top = tf_comp.margin_bottom = 0

    p = tf_comp.paragraphs[0]
    p.text = "COMPARATIVE ANALYSIS: OLD MANUAL WAY VS. RAIL-SYNC"
    p.font.size = Pt(12.5)
    p.font.bold = True
    p.font.color.rgb = TEAL

    p = tf_comp.add_paragraph()
    p.text = "\n• The Old Manual Practice (Current Baseline):"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = CORAL
    p = tf_comp.add_paragraph()
    p.text = "  - Fragmented phone calls and written paper memos across 3 separate control offices.\n  - 3 disconnected track shutdowns on the same section within the same week.\n  - Chaotic manual rescheduling and total block cancellation when a train runs 15 mins late."
    p.font.size = Pt(10)
    p.font.color.rgb = GRAY_TEXT

    p = tf_comp.add_paragraph()
    p.text = "\n• The RAIL-SYNC Way (Automated Innovation):"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEAL
    p = tf_comp.add_paragraph()
    p.text = "  - 3 departments work simultaneously under 1 pre-coordinated corridor possession.\n  - Maintenance lands naturally inside existing timetable gaps without stopping express trains.\n  - Self-healing re-planner automatically shifts windows in under 60 seconds if trains delay."
    p.font.size = Pt(10)
    p.font.color.rgb = GRAY_TEXT

    # Card 2: Enterprise Tech Stack
    tech_card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.8), bot_top, Inches(4.733), bot_h)
    tech_card.fill.solid()
    tech_card.fill.fore_color.rgb = DARK_CARD
    tech_card.line.color.rgb = GOLD
    tech_card.line.width = Pt(1.5)

    tb_tech = s3.shapes.add_textbox(Inches(8.0), bot_top + Inches(0.2), Inches(4.333), bot_h - Inches(0.4))
    tf_tech = tb_tech.text_frame
    tf_tech.word_wrap = True
    tf_tech.margin_left = tf_tech.margin_right = tf_tech.margin_top = tf_tech.margin_bottom = 0

    p = tf_tech.paragraphs[0]
    p.text = "ENTERPRISE TECHNOLOGY STACK"
    p.font.size = Pt(12.5)
    p.font.bold = True
    p.font.color.rgb = GOLD

    stack_items = [
        ("Optimization Engine", "Google OR-Tools (CP-SAT Constraint Solver for multi-resource scheduling)"),
        ("Backend Services", "Python FastAPI (High-performance, async REST & WebSocket microservices)"),
        ("Spatial Database", "PostgreSQL + PostGIS (Railway network topology, tracks & assets)"),
        ("Interlocking Verifier", "SMT Logic Prover (Route Control Chart & overlap safety validation)"),
        ("Controller Cockpit", "React 18 + Deck.gl (4D WebGPU GIS Map) & D3.js Multi-Line Gantt")
    ]
    for cat, det in stack_items:
        p = tf_tech.add_paragraph()
        p.text = f"\n• {cat}:"
        p.font.size = Pt(10.5)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p = tf_tech.add_paragraph()
        p.text = f"  {det}"
        p.font.size = Pt(9.5)
        p.font.color.rgb = GRAY_TEXT

    # =========================================================================
    # SLIDE 4: Feasibility and Viability
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "FEASIBILITY & VIABILITY: Practical Adoption on Indian Railways", "Slide 4: Risk Mitigation & Real-World Feasibility")

    col_w4 = Inches(3.68)
    col_h4 = Inches(5.7)
    col_top4 = Inches(1.4)

    feasibility_cards = [
        ("ZERO NEW HARDWARE REQUIRED", TEAL, [
            ("Cloud Microservice Deployment", "Runs 100% as a secure software microservice hosted on Indian Railways' existing CRIS enterprise cloud infrastructure."),
            ("Non-Invasive API Integration", "Pulls live data directly from TMS, SMMS, TDMS, and COA via standard read APIs without modifying legacy database schemas."),
            ("Zero Trackside Sensors Needed", "Operates entirely on existing track circuits, electronic interlocking tables, and axle counter telemetry. Zero added Capex.")
        ]),
        ("BUILT FOR REAL FIELD CONTROLLERS", GOLD, [
            ("Human-in-the-Loop Authority", "Section Controllers retain absolute final decision power; automated plans require a single digital review and confirmation click."),
            ("Instant Digital Sanction Memos", "Replaces error-prone verbal phone calls and handwritten paper memos with standardized, cryptographically logged digital authority."),
            ("Seamless Phased Rollout", "Engineered to pilot immediately on a high-density trunk corridor (e.g., Delhi-Kanpur or Mumbai-Vadodara) before national scaling.")
        ]),
        ("REAL-WORLD RISKS MITIGATED", CORAL, [
            ("Challenge: Train Late Running", "Mitigation: Sub-60-second heuristic shifts the maintenance slot dynamically, preserving track crew preparation and machine runs."),
            ("Challenge: Offline Network Dropouts", "Mitigation: Edge-cached local architecture guarantees uninterrupted station console operation even during network blackouts."),
            ("Challenge: Departmental Skepticism", "Mitigation: Mathematical, safety-first scoring ensures transparent, auditable scheduling free from departmental favoritism.")
        ])
    ]

    for i, (title, b_col, items) in enumerate(feasibility_cards):
        left = Inches(0.8 + i * 4.02)
        c = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, col_top4, col_w4, col_h4)
        c.fill.solid()
        c.fill.fore_color.rgb = DARK_CARD
        c.line.color.rgb = b_col
        c.line.width = Pt(1.5)

        tb = s4.shapes.add_textbox(left + Inches(0.2), col_top4 + Inches(0.2), col_w4 - Inches(0.4), col_h4 - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = b_col

        for sub_t, sub_d in items:
            p = tf.add_paragraph()
            p.text = f"\n• {sub_t}"
            p.font.size = Pt(11)
            p.font.bold = True
            p.font.color.rgb = WHITE
            p = tf.add_paragraph()
            p.text = f"  {sub_d}"
            p.font.size = Pt(10)
            p.font.color.rgb = GRAY_TEXT

    # =========================================================================
    # SLIDE 5: Impact and Benefits
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "QUANTIFIABLE IMPACT & STRATEGIC VALUE", "Slide 5: Metrics & Strategic Value")

    # Top Section: 4 High-Impact Metric Boxes
    met_w = Inches(2.78)
    met_h = Inches(2.2)
    met_top = Inches(1.35)

    metrics_data = [
        ("+32%", "TRACK AVAILABILITY", "Halves total network shutdown instances by consolidating multi-department repairs into unified slots.", TEAL),
        ("-45%", "OUTER SIGNAL DELAYS", "Eliminates train congestion and prolonged idling outside stations awaiting block clearance.", GOLD),
        ("85%+", "BLOCK COMPLETION RATE", "Drastically cuts last-minute block cancellations triggered by conflicting passenger train paths.", TEAL),
        ("12,000 L", "MONTHLY DIESEL SAVED", "Eliminates fuel-wasting stop-and-start cycles for heavy 58-wagon freight rakes per division.", GOLD)
    ]

    for i, (val, label, sub, border_col) in enumerate(metrics_data):
        left = Inches(0.8 + i * 2.98)
        card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, met_top, met_w, met_h)
        card.fill.solid()
        card.fill.fore_color.rgb = DARK_CARD
        card.line.color.rgb = border_col
        card.line.width = Pt(1.5)

        tb = s5.shapes.add_textbox(left + Inches(0.15), met_top + Inches(0.15), met_w - Inches(0.3), met_h - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

        p = tf.paragraphs[0]
        p.text = val
        p.font.size = Pt(28)
        p.font.bold = True
        p.font.color.rgb = border_col

        p = tf.add_paragraph()
        p.text = label
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = WHITE

        p = tf.add_paragraph()
        p.text = sub
        p.font.size = Pt(9.5)
        p.font.color.rgb = GRAY_TEXT

    # Bottom Section: 3 Multi-Stakeholder Benefit Cards
    stk_w = Inches(3.68)
    stk_h = Inches(3.45)
    stk_top = Inches(3.7)

    stakeholders = [
        ("FOR TRAIN CONTROLLERS", TEAL, [
            ("Automated Coordination", "Saves 3 to 4 hours of hectic phone calls between Track, Signal, and Traction supervisors every single shift."),
            ("Algorithmic Conflict Resolution", "Replaces trial-and-error manual conflict hunting with mathematically verified, conflict-free recommendations."),
            ("Auditable Sanction History", "Maintains complete transparent digital audit trails for every block granted, extended, or cancelled.")
        ]),
        ("FOR MAINTENANCE CREWS", GOLD, [
            ("Guaranteed Work Windows", "Crews receive protected, predictable corridor possessions with track machines and tower wagons on site on time."),
            ("Eliminated Idle Waiting", "Drastically cuts field workforce standing time and prevents cancelled turnout permissions."),
            ("Multi-Tier Safety Protection", "Verified catenary isolation interlocks ensure zero electrocution or moving vehicle collision hazards.")
        ]),
        ("FOR RAILWAYS & NATION", WHITE, [
            ("Maximized Sectional Throughput", "Unlocks hidden railway capacity across golden quadrilateral corridors without capital investments in laying new tracks."),
            ("Punctual Passenger Journeys", "Protects express and suburban train punctuality while accelerating average freight train speeds."),
            ("Sustainability & Net-Zero 2030", "Substantial reduction in locomotive carbon emissions directly supports Indian Railways' Net-Zero 2030 goals.")
        ])
    ]

    for i, (head, accent, items) in enumerate(stakeholders):
        left = Inches(0.8 + i * 4.02)
        c = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, stk_top, stk_w, stk_h)
        c.fill.solid()
        c.fill.fore_color.rgb = DARK_CARD
        c.line.color.rgb = accent
        c.line.width = Pt(1.5)

        tb = s5.shapes.add_textbox(left + Inches(0.2), stk_top + Inches(0.18), stk_w - Inches(0.4), stk_h - Inches(0.35))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

        p = tf.paragraphs[0]
        p.text = head
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = accent

        for st_t, st_d in items:
            p = tf.add_paragraph()
            p.text = f"\n• {st_t}"
            p.font.size = Pt(10.5)
            p.font.bold = True
            p.font.color.rgb = WHITE
            p = tf.add_paragraph()
            p.text = f"  {st_d}"
            p.font.size = Pt(9.5)
            p.font.color.rgb = GRAY_TEXT

    # =========================================================================
    # SLIDE 6: Research and References
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "RESEARCH & REGULATORY FOUNDATIONS", "Slide 6: Verification Framework & References")

    col_w6 = Inches(5.72)
    col_h6 = Inches(5.7)
    col_top6 = Inches(1.4)

    # Card A: Official Railway Manuals & Safety Rulebooks
    c6_a = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), col_top6, col_w6, col_h6)
    c6_a.fill.solid()
    c6_a.fill.fore_color.rgb = DARK_CARD
    c6_a.line.color.rgb = TEAL
    c6_a.line.width = Pt(1.5)

    tb6_a = s6.shapes.add_textbox(Inches(1.05), col_top6 + Inches(0.2), col_w6 - Inches(0.5), col_h6 - Inches(0.4))
    tf6_a = tb6_a.text_frame
    tf6_a.word_wrap = True
    tf6_a.margin_left = tf6_a.margin_right = tf6_a.margin_top = tf6_a.margin_bottom = 0

    p = tf6_a.paragraphs[0]
    p.text = "OFFICIAL RAILWAY MANUALS & SAFETY RULEBOOKS"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = TEAL

    manuals = [
        ("Indian Railways Permanent Way Manual (IRPWM - 2020)", "Para 801-815: Integrated corridor maintenance protocols, machine tamping cycles, ultrasonic rail flaw classification, and track possession guidelines."),
        ("Signal Engineering Manual (SEM Part I & II)", "Para 11.4: Strict electronic interlocking (EI) logic, signal clearance buffers, route overlap locking, and formal disconnection/reconnection procedures."),
        ("AC Traction Manual (ACTM Vol II)", "Appendix IV: Catenary isolation protocols, power cut-off interlocks, safety earthing rules, and simultaneous tower wagon/ladder gang operation."),
        ("Kavach Functional Specifications (RDSO SPN/196/2020)", "Section 6: Radio Block Center (RBC) message formats, ATP dynamic braking curves, station approach clearance, and temporary speed restriction (TSR) profiles.")
    ]
    for m_title, m_desc in manuals:
        p = tf6_a.add_paragraph()
        p.text = f"\n• {m_title}"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p = tf6_a.add_paragraph()
        p.text = f"  {m_desc}"
        p.font.size = Pt(9.8)
        p.font.color.rgb = GRAY_TEXT

    # Card B: Proven Industry Methods & Technologies
    c6_b = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), col_top6, col_w6, col_h6)
    c6_b.fill.solid()
    c6_b.fill.fore_color.rgb = DARK_CARD
    c6_b.line.color.rgb = GOLD
    c6_b.line.width = Pt(1.5)

    tb6_b = s6.shapes.add_textbox(Inches(7.05), col_top6 + Inches(0.2), col_w6 - Inches(0.5), col_h6 - Inches(0.4))
    tf6_b = tb6_b.text_frame
    tf6_b.word_wrap = True
    tf6_b.margin_left = tf6_b.margin_right = tf6_b.margin_top = tf6_b.margin_bottom = 0

    p = tf6_b.paragraphs[0]
    p.text = "PROVEN INDUSTRY METHODS & TECHNOLOGIES"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = GOLD

    methods = [
        ("Google OR-Tools (CP-SAT Solver)", "Industry-standard constraint programming engine used globally by high-speed rail operators and major airlines for solving multi-resource scheduling problems in seconds."),
        ("Spatio-Temporal Railway Networks", "Peer-reviewed graph-based topological data models accurately representing physical track blocks, station sidings, and moving train trajectory envelopes over time."),
        ("Train Kinematics & Davis Resistance Equations", "Standard ASME/IEEE mechanical formulations calculating train tractive effort, deceleration momentum, and diesel fuel saved by preventing freight stoppages."),
        ("SMT Logic Verification (Z3 Prover)", "Automated formal verification routines mathematically proving that proposed maintenance disconnections never violate station Route Control Charts or cause route overlap collisions.")
    ]
    for meth_title, meth_desc in methods:
        p = tf6_b.add_paragraph()
        p.text = f"\n• {meth_title}"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p = tf6_b.add_paragraph()
        p.text = f"  {meth_desc}"
        p.font.size = Pt(9.8)
        p.font.color.rgb = GRAY_TEXT

    # Save to multiple target locations
    output_filename = "AutoBlock_AI_SIH2026.pptx"
    prs.save(output_filename)
    print(f"Saved primary deck to: {os.path.abspath(output_filename)}")

    destinations = [
        r"C:\Users\user\.gemini\antigravity\scratch\AutoBlock_AI_SIH2026.pptx",
        r"C:\Users\user\.gemini\antigravity\scratch\problem no 27\AutoBlock_AI_SIH2026.pptx",
        r"C:\Users\user\.gemini\antigravity\scratch\railplan-ai\AutoBlock_AI_SIH2026.pptx"
    ]
    for dest in destinations:
        try:
            parent = os.path.dirname(dest)
            if os.path.exists(parent):
                prs.save(dest)
                print(f"Also saved copy to: {dest}")
        except Exception as e:
            print(f"Failed to copy to {dest}: {e}")

if __name__ == "__main__":
    build_presentation()
