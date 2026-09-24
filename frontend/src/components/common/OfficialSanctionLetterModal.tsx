"use client";

import React, { useEffect } from "react";
import { ServiceRequest, BundledMaintenanceOrder } from "@/lib/types";
import { formatFullINR } from "@/lib/formatters";
import { 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  FileText,
  Lock,
  Building2
} from "lucide-react";

interface OfficialSanctionProps {
  request?: ServiceRequest | null;
  bundle?: BundledMaintenanceOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialSanctionLetterModal: React.FC<OfficialSanctionProps> = ({
  request,
  bundle,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || (!request && !bundle)) return null;

  const orderNumber = request?.sanctionOrderNumber || (bundle ? `RB/O&M/2026/MEGA-${bundle.id}` : `RB/SANCTION/2026/814`);

  // Approval timestamp: exact date and time
  const approvalHistoryItem = request?.history?.slice().reverse().find(h => 
    h.action.toLowerCase().includes("approved") || 
    h.action.toLowerCase().includes("sanction")
  );

  const sanctionTimestamp = request?.sanctionTimestamp 
    ? request.sanctionTimestamp 
    : approvalHistoryItem 
    ? `${request?.submissionDate || "12 Sep 2026"}, ${approvalHistoryItem.timestamp}`
    : `${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })} IST`;

  const title = request ? request.title : bundle?.title || "Track Maintenance Sanction";
  const corridor = request ? request.corridorId : bundle?.corridorId || "NDLS-MMCT";
  const locationKm = request ? request.locationKm : bundle?.locationKm || "KM 148.0 - 156.0";
  const reqDept = request ? request.requestingDepartment : bundle?.participatingDepartments.join(", ") || "ENG";
  const targetDept = request ? request.targetDepartment : "MULTI-DEPARTMENT";
  const costVal = request ? request.estimatedCost : bundle?.financialSavingsINR || 450000;

  // Single-Page Clean Printable Document HTML
  const generateCleanDocumentHtml = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Official Sanction Order - ${orderNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 14mm 10mm 14mm;
    }
    * { 
      box-sizing: border-box; 
      margin: 0;
      padding: 0;
    }
    html, body { 
      background: #ffffff !important;
      color: #0f172a !important; 
      font-family: 'Times New Roman', Times, serif; 
      line-height: 1.38;
      font-size: 10pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .document-page {
      width: 100%;
      max-width: 760px;
      margin: 0 auto;
      padding: 6px 12px;
    }
    .header { 
      text-align: center; 
      border-bottom: 2px solid #0f172a; 
      padding-bottom: 6px; 
      margin-bottom: 8px; 
    }
    .emblem {
      width: 38px;
      height: 38px;
      margin: 0 auto 3px auto;
      border: 2px solid #0f172a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Arial, Helvetica, sans-serif;
      font-weight: bold;
      font-size: 15px;
      background: #f8fafc;
      color: #0f172a;
    }
    .header h2 { 
      font-size: 10.5pt; 
      text-transform: uppercase; 
      font-family: Arial, Helvetica, sans-serif; 
      letter-spacing: 1.2px;
      color: #1e293b;
      margin-bottom: 1px;
    }
    .header h1 { 
      font-size: 13pt; 
      text-transform: uppercase; 
      font-weight: 900; 
      font-family: Arial, Helvetica, sans-serif; 
      color: #0f172a;
      margin-bottom: 1px;
    }
    .header p { 
      font-size: 8.5pt; 
      font-family: Arial, Helvetica, sans-serif; 
      color: #334155; 
    }
    .header .address {
      font-size: 7.5pt;
      color: #64748b;
      font-family: Arial, Helvetica, sans-serif;
    }
    .meta-grid { 
      display: table;
      width: 100%;
      border-bottom: 1px solid #94a3b8; 
      padding-bottom: 6px; 
      margin-bottom: 8px; 
      font-family: 'Courier New', Courier, monospace; 
      font-size: 8.5pt; 
    }
    .meta-left {
      display: table-cell;
      width: 50%;
      vertical-align: top;
      text-align: left;
      line-height: 1.45;
    }
    .meta-right {
      display: table-cell;
      width: 50%;
      vertical-align: top;
      text-align: right;
      line-height: 1.45;
    }
    .subject-box { 
      background: #f1f5f9; 
      padding: 6px 10px; 
      border: 1px solid #cbd5e1; 
      border-left: 4px solid #0f172a;
      margin-bottom: 8px; 
      font-family: Arial, Helvetica, sans-serif;
    }
    .subject-title { 
      font-weight: bold; 
      font-size: 9pt; 
      text-transform: uppercase; 
      color: #0f172a; 
      line-height: 1.25;
    }
    .subject-meta { 
      font-size: 8pt; 
      color: #475569; 
      margin-top: 2px; 
    }
    .clause { 
      margin: 6px 0; 
      text-align: justify; 
      font-size: 9.5pt; 
      line-height: 1.35;
    }
    table.data-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 6px 0; 
      font-family: Arial, Helvetica, sans-serif; 
      font-size: 8.5pt; 
    }
    table.data-table th, table.data-table td { 
      border: 1px solid #cbd5e1; 
      padding: 4px 7px; 
      text-align: left; 
    }
    table.data-table th { 
      background: #f8fafc; 
      font-weight: bold; 
      width: 32%; 
      color: #1e293b; 
    }
    table.data-table td { 
      font-weight: 500; 
    }
    .footer-section { 
      display: table;
      width: 100%;
      margin-top: 10px; 
      border-top: 2px solid #0f172a; 
      padding-top: 6px; 
      font-family: Arial, Helvetica, sans-serif;
    }
    .seal-cell {
      display: table-cell;
      width: 50%;
      vertical-align: middle;
      text-align: left;
    }
    .seal-badge {
      display: inline-block;
      border: 1px solid #94a3b8;
      background: #f8fafc;
      padding: 3px 6px;
      border-radius: 4px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 7pt;
      line-height: 1.2;
      color: #334155;
    }
    .sign-cell {
      display: table-cell;
      width: 50%;
      vertical-align: middle;
      text-align: right;
    }
    .signature-name { 
      font-family: 'Times New Roman', Times, serif; 
      font-style: italic; 
      font-size: 13pt; 
      font-weight: bold; 
      color: #0f172a; 
      border-bottom: 1px solid #64748b; 
      padding-bottom: 1px; 
      display: inline-block; 
    }
    .signature-title { 
      font-weight: bold; 
      font-size: 8.5pt; 
      color: #0f172a; 
      margin-top: 2px; 
    }
    .signature-sub { 
      font-size: 7pt; 
      color: #64748b; 
      margin-top: 1px; 
    }
    @media print { 
      .no-print { display: none !important; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="document-page">
    <div class="header">
      <div class="emblem">IR</div>
      <h2>भारत सरकार / GOVERNMENT OF INDIA</h2>
      <h1>रेल मंत्रालय / MINISTRY OF RAILWAYS</h1>
      <p>रेलवे बोर्ड / RAILWAY BOARD (OPERATIONS & MAINTENANCE DIRECTORATE)</p>
      <p class="address">Rail Bhavan, Raisina Road, New Delhi – 110001</p>
    </div>

    <div class="meta-grid">
      <div class="meta-left">
        <div><strong>Sanction Dispatch No:</strong> ${orderNumber}</div>
        <div><strong>G&SR Rule Authority:</strong> Para 15.06 & 17.03 (Special Block Working)</div>
        <div><strong>Security Digital Digest:</strong> SHA-256: 8f4a9c1e...7b2d (Verified)</div>
      </div>
      <div class="meta-right">
        <div><strong>Date & Time of Sanction:</strong> ${sanctionTimestamp}</div>
        <div><strong>Corridor Zone:</strong> ${corridor} (Trunk Line)</div>
        <div><strong>Classification:</strong> <span style="color: #b91c1c; font-weight: bold;">OFFICIAL SANCTION ORDER</span></div>
      </div>
    </div>

    <div class="subject-box">
      <div class="subject-title">SUBJECT: OFFICIAL SANCTION FOR INTEGRATED TRACK MAINTENANCE BLOCK & 25kV TRACTION POWER ISOLATION (FORM T/806)</div>
      <div class="subject-meta">Reference Service Order ID: <strong>${request?.id || bundle?.id}</strong> | Location: <strong>${locationKm}</strong></div>
    </div>

    <p class="clause">1. <strong>SANCTION IS HEREBY ACCORDED</strong> by the Central Authority (Railway Board / Executive Director O&M) for the execution of integrated railway maintenance works detailed hereunder on the <strong>${corridor}</strong> corridor between <strong>${locationKm}</strong>.</p>

    <table class="data-table">
      <tr><th>Work Order Title:</th><td>${title}</td></tr>
      <tr><th>Requesting Department:</th><td>${reqDept} Department</td></tr>
      <tr><th>Assigned Execution Unit:</th><td>${targetDept} Directorate</td></tr>
      <tr><th>Sanctioned Financial Grant:</th><td style="font-family: 'Courier New', monospace; font-weight: bold;">₹${costVal.toLocaleString("en-IN")}</td></tr>
      <tr><th>Permitted Block Window:</th><td style="font-family: 'Courier New', monospace; font-weight: bold;">01:30 hrs to 05:30 hrs (4.0 Hours Night Slot)</td></tr>
      <tr><th>Caution Speed Restriction:</th><td style="color: #b91c1c; font-weight: bold;">30 km/h Caution Order enforced on adjacent line</td></tr>
    </table>

    <p class="clause">2. <strong>25kV TRACTION POWER ISOLATION:</strong> Chief Electrical Distribution Controller (TPC) is instructed to issue Permit-To-Work (PTW) and earth discharge rod certificate before commencement of physical work on site.</p>
    <p class="clause">3. <strong>TRAFFIC REGULATION:</strong> Chief Operating Manager (COM) / Section Traffic Controller shall regulate incoming freight rakes and issue advance Caution Orders (Form T/409) to Loco Pilots of all express trains passing the adjoining line.</p>
    <p class="clause">4. <strong>SAFETY CERTIFICATION:</strong> Prior to cancellation of block and restoration of normal sectional speed, a joint Track Fitness Certificate (Form T/1518) must be physically signed by Senior Section Engineer (P-Way) and Senior Section Engineer (Signal/OHE).</p>

    <div class="footer-section">
      <div class="seal-cell">
        <div class="seal-badge">
          <strong>IR-RAMS VERIFIED E-SIGN</strong><br/>
          Govt. of India Certified<br/>
          Auth Ref: RB-2026-881
        </div>
      </div>
      <div class="sign-cell">
        <div class="signature-name">Rajesh Verma</div>
        <div class="signature-title">Executive Director (Operations & Maintenance)</div>
        <div class="signature-sub">For Member (Operations & Infrastructure), Railway Board</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const handlePrint = () => {
    // Generate clean printable document isolated inside a hidden iframe
    const html = generateCleanDocumentHtml();
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("title", "Print Frame");
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }, 250);
    } else {
      window.print();
    }
  };

  const handleDownloadFile = () => {
    const htmlContent = generateCleanDocumentHtml();
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Sanction_Order_Form_T806_${orderNumber.replace(/[\/\\]/g, "_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden no-print">
      <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col max-h-[92vh] animate-scale-up">
        {/* Pinned Top Header Control Bar (Always Visible on screen, excluded from print) */}
        <div className="p-2.5 sm:p-3.5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0 select-none no-print">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Form T/806
              </h3>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Ref: {orderNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              onClick={handlePrint}
              className="px-2 sm:px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1 sm:space-x-1.5 transition shadow active:scale-95 cursor-pointer"
              title="Print Clean 1-Page Sanction Document (PDF)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Order</span>
            </button>

            <button
              onClick={handleDownloadFile}
              className="px-2 sm:px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1 sm:space-x-1.5 transition shadow active:scale-95 cursor-pointer"
              title="Download Sanction Document (.html)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={onClose}
              className="px-2 sm:px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1 sm:space-x-1.5 transition shadow active:scale-95 cursor-pointer"
              title="Close Sanction View (Esc)"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Official Stationery Content */}
        <div id="official-sanction-print-area" className="flex-1 overflow-y-auto p-3 sm:p-10 space-y-4 text-slate-900 text-xs font-serif leading-relaxed bg-white select-text">
          {/* Government of India Official Header */}
          <div className="text-center space-y-1 border-b-2 border-slate-900 pb-3">
            <div className="flex justify-center mb-1">
              <div className="w-11 h-11 rounded-full border-2 border-slate-900 flex items-center justify-center font-bold text-base font-sans bg-slate-50">
                IR
              </div>
            </div>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-800 font-sans">
              भारत सरकार / GOVERNMENT OF INDIA
            </h2>
            <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-950 font-sans">
              रेल मंत्रालय / MINISTRY OF RAILWAYS
            </h1>
            <p className="text-[11px] font-sans text-slate-600">
              रेलवे बोर्ड / RAILWAY BOARD (OPERATIONS & MAINTENANCE DIRECTORATE)
            </p>
            <p className="text-[10px] font-mono text-slate-500">
              Rail Bhavan, Raisina Road, New Delhi – 110001
            </p>
          </div>

          {/* Reference & Metadata Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start pt-1 font-mono text-[10px] sm:text-[11px] border-b border-slate-300 pb-3 gap-2">
            <div>
              <p><strong>Sanction Dispatch No:</strong> {orderNumber}</p>
              <p><strong>G&SR Rule Authority:</strong> Para 15.06 & 17.03 (Special Block Working)</p>
              <p><strong>Security Digital Digest:</strong> SHA-256: 8f4a9c1e...7b2d (Verified)</p>
            </div>
            <div className="text-left sm:text-right">
              <p><strong>Date & Time of Sanction:</strong> <span className="font-bold text-slate-950">{sanctionTimestamp}</span></p>
              <p><strong>Corridor Zone:</strong> {corridor} (Trunk Line)</p>
              <p><strong>Classification:</strong> <span className="uppercase font-bold text-red-700">Official Sanction Order</span></p>
            </div>
          </div>

          {/* Subject Header */}
          <div className="bg-slate-100 p-3 rounded border border-slate-300 font-sans">
            <p className="font-bold text-xs uppercase text-slate-950">
              SUBJECT: OFFICIAL SANCTION FOR INTEGRATED TRACK MAINTENANCE BLOCK & 25kV TRACTION POWER ISOLATION (FORM T/806)
            </p>
            <p className="text-[11px] text-slate-700 mt-0.5">
              Reference Service Order ID: <strong>{request?.id || bundle?.id}</strong> | Location: <strong>{locationKm}</strong>
            </p>
          </div>

          {/* Sanction Clauses */}
          <div className="space-y-2.5 text-justify text-[11px]">
            <p>
              1. <strong>SANCTION IS HEREBY ACCORDED</strong> by the Central Authority (Railway Board / Executive Director O&M) for the execution of integrated railway maintenance works detailed hereunder on the <strong>{corridor}</strong> corridor between <strong>{locationKm}</strong>.
            </p>

            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full min-w-[320px] border-collapse border border-slate-400 text-[10px] font-sans my-1.5">
                <tbody>
                  <tr className="border-b border-slate-300 bg-slate-50">
                    <td className="p-1.5 border-r border-slate-300 font-bold w-1/3">Work Order Title:</td>
                    <td className="p-1.5 font-semibold">{title}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-1.5 border-r border-slate-300 font-bold">Requesting Department:</td>
                    <td className="p-1.5">{reqDept} Department</td>
                  </tr>
                  <tr className="border-b border-slate-300 bg-slate-50">
                    <td className="p-1.5 border-r border-slate-300 font-bold">Assigned Execution Unit:</td>
                    <td className="p-1.5">{targetDept} Directorate</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-1.5 border-r border-slate-300 font-bold">Sanctioned Financial Grant:</td>
                    <td className="p-1.5 font-mono font-bold text-slate-900">{formatFullINR(costVal)}</td>
                  </tr>
                  <tr className="border-b border-slate-300 bg-slate-50">
                    <td className="p-1.5 border-r border-slate-300 font-bold">Permitted Block Window:</td>
                    <td className="p-1.5 font-mono font-bold text-slate-900">01:30 hrs to 05:30 hrs (4.0 Hours Night Slot)</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border-r border-slate-300 font-bold">Caution Speed Restriction:</td>
                    <td className="p-1.5 font-bold text-red-700">30 km/h Caution Order enforced on adjacent line</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              2. <strong>25kV TRACTION POWER ISOLATION:</strong> Chief Electrical Distribution Controller (TPC) is instructed to issue Permit-To-Work (PTW) and earth discharge rod certificate before commencement of physical work on site.
            </p>

            <p>
              3. <strong>TRAFFIC REGULATION:</strong> Chief Operating Manager (COM) / Section Traffic Controller shall regulate incoming freight rakes and issue advance Caution Orders (Form T/409) to Loco Pilots of all express trains passing the adjoining line.
            </p>

            <p>
              4. <strong>SAFETY CERTIFICATION:</strong> Prior to cancellation of block and restoration of normal sectional speed, a joint Track Fitness Certificate (Form T/1518) must be physically signed by Senior Section Engineer (P-Way) and Senior Section Engineer (Signal/OHE).
            </p>
          </div>

          {/* Signatures & Seal Box */}
          <div className="pt-3 border-t-2 border-slate-900 flex flex-col sm:flex-row justify-between items-center sm:items-end font-sans text-[11px] gap-3">
            {/* QR Code & Digital Stamp */}
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="w-14 h-14 border border-slate-400 p-1 flex items-center justify-center bg-slate-50 shrink-0">
                <QrCode className="w-12 h-12 text-slate-900" />
              </div>
              <div className="text-[9px] font-mono text-slate-600">
                <p className="font-bold text-slate-800">IR-RAMS VERIFIED</p>
                <p>Govt. of India E-Sign</p>
                <p>Auth Ref: RB-2026-881</p>
              </div>
            </div>

            {/* Signature Block */}
            <div className="text-center sm:text-right space-y-0.5 w-full sm:w-auto">
              <div className="inline-block border-b border-slate-700 pb-0.5 px-4">
                <p className="font-serif italic font-bold text-sm text-slate-800">Rajesh Verma</p>
              </div>
              <p className="font-bold text-xs text-slate-900">Executive Director (O&M)</p>
              <p className="text-[10px] text-slate-600">For Member (Operations & Infrastructure), Railway Board</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
