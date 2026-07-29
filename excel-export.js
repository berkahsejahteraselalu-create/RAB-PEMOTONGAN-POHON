// excel-export.js — AHSP 2026 Template Excel Export
// Dipanggil dari app.js via btnExportExcel click

window.exportToExcel = function exportToExcel() {
    if (typeof surveyData === "undefined" || surveyData.length === 0) {
        return alert("Belum ada data RAB untuk diekspor!");
    }
    const fnAnalyze = typeof analyzeTree === "function" ? analyzeTree : (window.analyzeTree || function(tree) {
        let action = 'perampingan';
        let category = '';
        if (tree.kondisi === 'mati') action = 'pemotongan';
        if (tree.tindakanManual && tree.tindakanManual !== 'auto') action = tree.tindakanManual;
        if (tree.diameter < 15) category = action === 'perampingan' ? "5-15" : "<15";
        else if (tree.diameter <= 30) category = "15-30";
        else if (tree.diameter <= 50) category = "30-50";
        else if (tree.diameter <= 75) category = "50-75";
        else if (tree.diameter <= 100) category = action === 'perampingan' ? ">75" : "75-100";
        else category = action === 'perampingan' ? ">100" : ">100";
        const ahspRef = window.ahspData && window.ahspData[action] ? window.ahspData[action][category] : null;
        return { ...tree, action, category, ahsp: ahspRef };
    });

    const analyzedData = surveyData.map(fnAnalyze);
    const summaryA = {};
    const summaryB = {};
    if (window.ahspData && window.ahspData.perampingan) {
        Object.keys(window.ahspData.perampingan).forEach(k => {
            summaryA[k] = { ahsp: window.ahspData.perampingan[k], qty: 0 };
        });
    }
    if (window.ahspData && window.ahspData.pemotongan) {
        Object.keys(window.ahspData.pemotongan).forEach(k => {
            summaryB[k] = { ahsp: window.ahspData.pemotongan[k], qty: 0 };
        });
    }
    analyzedData.forEach(item => {
        if (!item.ahsp) return;
        if (item.action === "perampingan" && summaryA[item.category]) {
            summaryA[item.category].qty += (item.jumlah || 1);
        } else if (item.action === "pemotongan" && summaryB[item.category]) {
            summaryB[item.category].qty += (item.jumlah || 1);
        }
    });

    if (typeof XLSX === "undefined") {
        return alert("Library Excel belum siap. Silakan refresh halaman.");
    }

    const wb = XLSX.utils.book_new();
    buildSheetCover(wb);
    buildSheetAHSP(wb, summaryA, summaryB);
    buildSheetRAB(wb, summaryA, summaryB);
    XLSX.writeFile(wb, "RAB_Pemotongan_Pohon_AHSP2026.xlsx");
    alert("File Excel Eksekutif berhasil diunduh!\n\nNama File: RAB_Pemotongan_Pohon_AHSP2026.xlsx\nSheet: Cover | AHSP Detail | RAB Rekapitulasi");
};

const FMT_RP   = "_(\"Rp\"* #,##0_);_(\"Rp\"* -#,##0_);_(\"Rp\"* \"-\"_);_(@_)";
const FMT_COEF = "0.000";
const FMT_INT  = "#,##0";

function xCell(ws, col, row, value, style, numFmt) {
    const ref = XLSX.utils.encode_cell({ c: col, r: row });
    const t   = (typeof value === "number") ? "n" : (value === null || value === undefined || value === "") ? "s" : "s";
    ws[ref]   = { v: value === null || value === undefined ? "" : value, t, s: style || {} };
    if (typeof value === "number") ws[ref].t = "n";
    if (numFmt) ws[ref].z = numFmt;
}
function xFormula(ws, col, row, formula, style, numFmt) {
    const ref = XLSX.utils.encode_cell({ c: col, r: row });
    ws[ref] = { f: formula, t: "n", s: style || {} };
    if (numFmt) ws[ref].z = numFmt;
}
function xMerge(merges, c1, r1, c2, r2) {
    merges.push({ s: { c: c1, r: r1 }, e: { c: c2, r: r2 } });
}
function xRange(ws, maxCol, maxRow) {
    ws["!ref"] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: maxCol, r: maxRow } });
}
function fill(rgb) { return { patternType: "solid", fgColor: { rgb: (rgb||"FFFFFF").replace('#','') } }; }
function xfont(opts) { return { name: "Segoe UI", sz: opts.sz||10, bold: !!opts.bold, italic: !!opts.italic, color: { rgb: (opts.color||"000000").replace('#','') } }; }
function xalign(h, v, wrap) { return { horizontal: h||"left", vertical: v||"center", wrapText: !!wrap }; }
function bdr(s,c) { return { style: s||"thin", color: { rgb: (c||"000000").replace('#','') } }; }
const B_OUTER = { top: bdr("medium","1E4D2B"), bottom: bdr("medium","1E4D2B"), left: bdr("medium","1E4D2B"), right: bdr("medium","1E4D2B") };
const B_THIN  = { top: bdr("thin","D0D7D1"), bottom: bdr("thin","D0D7D1"), left: bdr("thin","D0D7D1"), right: bdr("thin","D0D7D1") };
const B_GREY  = { top: bdr("thin","D0D7D1"), bottom: bdr("thin","D0D7D1"), left: bdr("thin","D0D7D1"), right: bdr("thin","D0D7D1") };

function sTitle(bg)     { return { font: xfont({sz:14,bold:true,color:"FFFFFF"}), fill: fill(bg||"1E4D2B"), alignment: xalign("center","center",true), border: B_OUTER }; }
function sSubtitle(bg)  { return { font: xfont({sz:10,bold:true,color:"FFFFFF"}), fill: fill(bg||"2D6A4F"), alignment: xalign("center","center",true), border: { top:bdr("thin"), bottom:bdr("thin"), left:bdr("medium"), right:bdr("medium") } }; }
function sColHdr()      { return { font: xfont({sz:10,bold:true,color:"FFFFFF"}), fill: fill("1E4D2B"), alignment: xalign("center","center",true), border: B_OUTER }; }
function sSectionHdr()  { return { font: xfont({sz:10,bold:true,color:"081C15"}), fill: fill("D8F3DC"), alignment: xalign("left","center"), border: { top:bdr("medium"), bottom:bdr("medium"), left:bdr("medium"), right:bdr("medium") } }; }
function sData(h)       { return { font: xfont({sz:9.5}), alignment: xalign(h||"left","center",true), border: B_GREY }; }
function sRupiah()      { return { font: xfont({sz:9.5}), alignment: xalign("right","center"), border: B_GREY }; }
function sSubTotalLbl() { return { font: xfont({sz:9.5,bold:true,color:"1B4332"}), fill: fill("E9F5EC"), alignment: xalign("left","center"), border: B_OUTER }; }
function sSubTotalVal() { return { font: xfont({sz:9.5,bold:true,color:"1B4332"}), fill: fill("E9F5EC"), alignment: xalign("right","center"), border: B_OUTER }; }
function sGrandLbl()    { return { font: xfont({sz:11,bold:true,color:"FFFFFF"}), fill: fill("1E4D2B"), alignment: xalign("left","center"), border: B_OUTER }; }
function sGrandVal()    { return { font: xfont({sz:11,bold:true,color:"FFFFFF"}), fill: fill("1E4D2B"), alignment: xalign("right","center"), border: B_OUTER }; }
function sSumLbl()      { return { font: xfont({sz:10,bold:true,color:"081C15"}), fill: fill("D8F3DC"), alignment: xalign("left","center"), border: B_OUTER }; }
function sSumVal()      { return { font: xfont({sz:10,bold:true,color:"081C15"}), fill: fill("D8F3DC"), alignment: xalign("right","center"), border: B_OUTER }; }
function sAHSPHdr()     { return { font: xfont({sz:12,bold:true,color:"FFFFFF"}), fill: fill("1E4D2B"), alignment: xalign("center","center",true), border: B_OUTER }; }
function sAHSPItem()    { return { font: xfont({sz:10,bold:true,color:"FFFFFF"}), fill: fill("2D6A4F"), alignment: xalign("left","center",true), border: B_THIN }; }
function sAHSPGrp()     { return { font: xfont({sz:9.5,bold:true,color:"1B4332"}), fill: fill("E9F5EC"), alignment: xalign("left","center"), border: B_THIN }; }
function sAHSPData(h)   { return { font: xfont({sz:9.5}), alignment: xalign(h||"left","center",true), border: B_GREY }; }
function sAHSPRp()      { return { font: xfont({sz:9.5}), alignment: xalign("right","center"), border: B_GREY }; }
function sAHSPSubL()    { return { font: xfont({sz:9.5,bold:true,color:"1B4332"}), fill: fill("F8FBF9"), alignment: xalign("left","center"), border: B_THIN }; }
function sAHSPSubV()    { return { font: xfont({sz:9.5,bold:true,color:"1B4332"}), fill: fill("F8FBF9"), alignment: xalign("right","center"), border: B_THIN }; }
function sInfoLbl()     { return { font: xfont({sz:9.5,bold:true,color:"1B4332"}), fill: fill("F4F9F5"), alignment: xalign("left","center"), border: { top:bdr("thin","D0D7D1"), bottom:bdr("thin","D0D7D1"), left:bdr("medium","2D6A4F"), right:bdr("thin","D0D7D1") } }; }
function sInfoVal()     { return { font: xfont({sz:9.5}), alignment: xalign("left","center"), border: { top:bdr("thin","D0D7D1"), bottom:bdr("thin","D0D7D1"), left:bdr("thin","D0D7D1"), right:bdr("medium","2D6A4F") } }; }

function fillMerge(ws, style, c1, r1, c2, r2) {
    for (let cc = c1; cc <= c2; cc++) {
        for (let rr = r1; rr <= r2; rr++) {
            if (cc === c1 && rr === r1) continue;
            const ref = XLSX.utils.encode_cell({ c: cc, r: rr });
            ws[ref] = { v: "", t: "s", s: style || {} };
        }
    }
}

function buildSheetCover(wb) {
    const ws = {}, merges = [];
    const today = new Date().toLocaleDateString("id-ID", {day:"numeric",month:"long",year:"numeric"});
    let r = 0;
    const LC = 5;
    function mRow(row, style) { xMerge(merges,0,row,LC,row); fillMerge(ws,style,0,row,LC,row); }

    xCell(ws, 0, r, "RENCANA ANGGARAN BIAYA (RAB)", sTitle()); mRow(r, sTitle()); r++;
    xCell(ws, 0, r, "PEKERJAAN PEMOTONGAN / PERAMPINGAN POHON", sSubtitle()); mRow(r, sSubtitle()); r++;
    xCell(ws, 0, r, "Berdasarkan SE Ditjen Bina Konstruksi No. 47/SE/Dk/2026 (AHSP PUPR 2026)", sSectionHdr()); mRow(r, sSectionHdr()); r++;
    xCell(ws, 0, r, "", {}); r++;

    // Section Sub-headers
    xCell(ws, 0, r, "📌 INFORMASI PROYEK & REGULASI", sSubTotalLbl()); xMerge(merges, 0, r, 2, r); fillMerge(ws, sSubTotalLbl(), 0, r, 2, r);
    xCell(ws, 3, r, "📊 RINGKASAN ESTIMASI BIAYA (SUMMARY)", sSubTotalLbl()); xMerge(merges, 3, r, LC, r); fillMerge(ws, sSubTotalLbl(), 3, r, LC, r);
    r++;

    const infos = [
        ["Nama Pekerjaan",     "Pemeliharaan Pohon Jalan / Ruang Terbuka Hijau (RTH)"],
        ["Nomor Dokumen",      "RAB-PPH-2026-001"],
        ["Tahun Anggaran",     "2026"],
        ["Tanggal RAB",        today],
        ["Satuan Biaya",       "Rupiah (Rp)"],
        ["Dasar Acuan",        "SE Ditjen BK No. 47/SE/Dk/2026"],
        ["Biaya SMKK (K3)",    "2,5% dari Biaya Fisik (Permen PUPR 10/2021)"],
        ["Pajak (PPN)",        "11% (UU HPP No. 7/2021)"],
        ["Overhead & Profit",  "15% dari Biaya Langsung (AHSP 2026)"],
        ["Standar Ukur DBH",   "DBH = 1,30 m dari permukaan tanah"],
    ];

    const summaries = [
        ["Sub-Total Perampingan (Kelompok A)", "='RAB Rekapitulasi'!G11"],
        ["Sub-Total Pemotongan (Kelompok B)",  "='RAB Rekapitulasi'!G19"],
        ["Total Biaya Langsung Fisik",         "='RAB Rekapitulasi'!G20"],
        ["Biaya Penerapan SMKK (2.5%)",        "='RAB Rekapitulasi'!G21"],
        ["Jumlah Fisik + SMKK",                "='RAB Rekapitulasi'!G22"],
        ["PPN (11%)",                          "='RAB Rekapitulasi'!G23"],
        ["GRAND TOTAL RAB",                    "='RAB Rekapitulasi'!G24"],
    ];

    const startR = r;
    infos.forEach(function([lbl, val], idx) {
        const cr = startR + idx;
        xCell(ws, 0, cr, lbl, sInfoLbl());
        xCell(ws, 1, cr, val, sInfoVal()); xMerge(merges, 1, cr, 2, cr); fillMerge(ws, sInfoVal(), 1, cr, 2, cr);
    });

    summaries.forEach(function([lbl, formula], idx) {
        const cr = startR + idx;
        const styleLbl = idx < 6 ? sInfoLbl() : sGrandLbl();
        const styleVal = idx < 6 ? sRupiah()  : sGrandVal();

        xCell(ws, 3, cr, lbl, styleLbl); xMerge(merges, 3, cr, 4, cr); fillMerge(ws, styleLbl, 3, cr, 4, cr);
        xFormula(ws, 5, cr, formula, styleVal, FMT_RP);
    });

    r = startR + Math.max(infos.length, summaries.length) + 1;

    // Signature Block
    xCell(ws, 0, r, "Disetujui Oleh:", sSubTotalLbl()); xMerge(merges, 0, r, 2, r); fillMerge(ws, sSubTotalLbl(), 0, r, 2, r);
    xCell(ws, 3, r, "Dibuat Oleh:", sSubTotalLbl()); xMerge(merges, 3, r, LC, r); fillMerge(ws, sSubTotalLbl(), 3, r, LC, r);
    r++;
    xCell(ws, 0, r, "Pejabat Pembuat Komitmen (PPK)", sData()); xMerge(merges, 0, r, 2, r); fillMerge(ws, sData(), 0, r, 2, r);
    xCell(ws, 3, r, "Konsultan Perencana / Tim Teknik", sData()); xMerge(merges, 3, r, LC, r); fillMerge(ws, sData(), 3, r, LC, r);
    r += 4;
    xCell(ws, 0, r, "( _______________________________ )", sData("center")); xMerge(merges, 0, r, 2, r); fillMerge(ws, sData("center"), 0, r, 2, r);
    xCell(ws, 3, r, "( _______________________________ )", sData("center")); xMerge(merges, 3, r, LC, r); fillMerge(ws, sData("center"), 3, r, LC, r);
    r++;

    ws["!merges"] = merges;
    ws["!cols"]   = [{wch:24},{wch:20},{wch:28},{wch:26},{wch:16},{wch:24}];
    ws["!rows"]   = [{hpt:36},{hpt:24},{hpt:20},{hpt:12}];
    ws["!views"]  = [{ showGridLines: true }];
    xRange(ws, LC, r);
    XLSX.utils.book_append_sheet(wb, ws, "Cover");
}

function buildSheetAHSP(wb, summaryA, summaryB) {
    const ws = {}, merges = [];
    let r = 0;
    const LC = 5;
    function mRow(row, style) { xMerge(merges,0,row,LC,row); fillMerge(ws,style,0,row,LC,row); }

    xCell(ws,0,r,"ANALISIS HARGA SATUAN PEKERJAAN (AHSP) — PEMOTONGAN / PERAMPINGAN POHON",sAHSPHdr()); mRow(r,sAHSPHdr()); r++;
    xCell(ws,0,r,"Acuan: SE Ditjen BK No. 47/SE/Dk/2026  |  Overhead & Profit 15%  |  Satuan per Batang Pohon",sSubtitle()); mRow(r,sSubtitle()); r++;
    ["No.","Uraian Komponen / Pekerjaan","Sat.","Koefisien","H. Satuan (Rp)","Jumlah (Rp)"].forEach(function(h,c){xCell(ws,c,r,h,sColHdr());}); r++;

    function writeItem(ahsp, label) {
        xCell(ws,0,r,label,sAHSPItem()); mRow(r,sAHSPItem()); r++;
        const bds = ahsp.breakdown || [];
        const labor=[], equip=[], mat=[];
        bds.forEach(function(bd) {
            const nm = bd.name.toLowerCase();
            const cm = bd.name.match(/\(([\d.]+)/);
            const coef = cm ? parseFloat(cm[1]) : 1;
            const hSat = coef>0 ? Math.round(bd.val/coef) : bd.val;
            const cleanName = bd.name.replace(/\s*\([^)]+\)/g,"").trim();
            const sat = (nm.includes("oh")||nm.includes("pekerja")||nm.includes("tukang")||nm.includes("mandor")) ? "OH"
                      : (nm.includes("jam")||nm.includes("chainsaw")||nm.includes("dump")||nm.includes("angkut")) ? "Jam"
                      : "LS";
            const entry = {name:cleanName, sat, coef, hSat};
            if (nm.includes("pekerja")||nm.includes("tukang")||nm.includes("mandor")) labor.push(entry);
            else if (nm.includes("chainsaw")||nm.includes("dump")||nm.includes("angkut")||nm.includes("alat bantu")) equip.push(entry);
            else mat.push(entry);
        });

        function writeSub(label, rows) {
            xCell(ws,0,r,label,sAHSPGrp()); mRow(r,sAHSPGrp()); r++;
            const refs=[];
            rows.forEach(function(row) {
                const er=r+1;
                xCell(ws,0,r,"",sAHSPData("center"));
                xCell(ws,1,r,row.name,sAHSPData());
                xCell(ws,2,r,row.sat,sAHSPData("center"));
                xCell(ws,3,r,row.coef,sAHSPData("center")); ws[XLSX.utils.encode_cell({c:3,r})].z=FMT_COEF;
                xCell(ws,4,r,row.hSat,sAHSPRp()); ws[XLSX.utils.encode_cell({c:4,r})].z=FMT_RP;
                xFormula(ws,5,r,"D"+er+"*E"+er,sAHSPRp(),FMT_RP);
                refs.push(er); r++;
            });
            const er=r+1;
            const f = refs.length ? refs.map(function(ri){return "F"+ri;}).join("+") : "0";
            xCell(ws,0,r,"",sAHSPSubL()); xCell(ws,1,r,"JUMLAH "+label,sAHSPSubL()); xMerge(merges,1,r,4,r); fillMerge(ws,sAHSPSubL(),1,r,4,r);
            xFormula(ws,5,r,f,sAHSPSubV(),FMT_RP);
            r++;
            return er;
        }

        const rA = writeSub("A. TENAGA KERJA", labor);
        const rB = writeSub("B. PERALATAN", equip);
        const rC = writeSub("C. BAHAN / MATERIAL", mat);

        // D: total langsung
        xCell(ws,0,r,"D",sSumLbl()); xCell(ws,1,r,"JUMLAH BIAYA LANGSUNG  (A + B + C)",sSumLbl()); xMerge(merges,1,r,4,r); fillMerge(ws,sSumLbl(),1,r,4,r);
        xFormula(ws,5,r,"F"+rA+"+F"+rB+"+F"+rC,sSumVal(),FMT_RP); const rD=r+1; r++;
        // E: overhead
        xCell(ws,0,r,"E",sData("center")); xCell(ws,1,r,"OVERHEAD & PROFIT  (15% x D)",sData()); xMerge(merges,1,r,4,r); fillMerge(ws,sData(),1,r,4,r);
        xFormula(ws,5,r,"F"+rD+"*0.15",sRupiah(),FMT_RP); const rE=r+1; r++;
        // F: harga satuan
        xCell(ws,0,r,"F",sGrandLbl()); xCell(ws,1,r,"HARGA SATUAN PEKERJAAN  (D + E)  — per Batang",sGrandLbl()); xMerge(merges,1,r,4,r); fillMerge(ws,sGrandLbl(),1,r,4,r);
        xFormula(ws,5,r,"F"+rD+"+F"+rE,sGrandVal(),FMT_RP); r++;
        for(let c=0;c<=LC;c++) xCell(ws,c,r,"",{}); r++;
    }

    function writeGroup(lbl) { xCell(ws,0,r,lbl,sSectionHdr()); mRow(r,sSectionHdr()); r++; }

    writeGroup("KELOMPOK A — PERAMPINGAN / PEMANGKASAN POHON  (Pohon Tetap Berdiri / Hidup)");
    Object.values(summaryA).forEach(function(row) { writeItem(row.ahsp, row.ahsp.id+".  "+row.ahsp.label+"  |  "+row.ahsp.desc+"  |  Satuan: Batang"); });
    writeGroup("KELOMPOK B — PEMOTONGAN / PENEBANGAN POHON  (Ditebang Habis + Angkut Limbah)");
    Object.values(summaryB).forEach(function(row) { writeItem(row.ahsp, row.ahsp.id+".  "+row.ahsp.label+"  |  "+row.ahsp.desc+"  |  Satuan: Batang"); });

    ws["!merges"] = merges;
    ws["!cols"]   = [{wch:6},{wch:46},{wch:10},{wch:14},{wch:18},{wch:20}];
    ws["!rows"]   = [{hpt:34},{hpt:22},{hpt:28}];
    ws["!views"]  = [{ showGridLines: true }];
    xRange(ws, LC, r);
    XLSX.utils.book_append_sheet(wb, ws, "AHSP Detail");
}

function buildSheetRAB(wb, summaryA, summaryB) {
    const ws = {}, merges = [];
    let r = 0;
    const LC = 6;
    function mRow(row, style) { xMerge(merges,0,row,LC,row); fillMerge(ws,style,0,row,LC,row); }

    xCell(ws,0,r,"REKAPITULASI RENCANA ANGGARAN BIAYA (RAB)",sTitle()); mRow(r,sTitle()); r++;
    xCell(ws,0,r,"Pekerjaan Pemotongan / Perampingan Pohon  |  AHSP 2026 PUPR  |  SE Ditjen BK No. 47/SE/Dk/2026",sSubtitle()); mRow(r,sSubtitle()); r++;
    ["No.","Kode","Uraian Pekerjaan","Satuan","Volume\n(Batang)","Harga Satuan\n(Rp)","Jumlah Harga\n(Rp)"].forEach(function(h,c){xCell(ws,c,r,h,sColHdr());}); r++;

    function writeSection(lbl) { xCell(ws,0,r,lbl,sSectionHdr()); mRow(r,sSectionHdr()); r++; }

    writeSection("A.  PERAMPINGAN / PEMANGKASAN POHON  (Pohon Tetap Berdiri / Hidup)");
    const rowsA=[]; let noA=1;
    Object.values(summaryA).forEach(function(row) {
        const er=r+1;
        xCell(ws,0,r,noA++,sData("center")); xCell(ws,1,r,row.ahsp.id,sData("center"));
        xCell(ws,2,r,row.ahsp.label+"  —  "+row.ahsp.desc,sData()); xCell(ws,3,r,"Batang",sData("center"));
        xCell(ws,4,r,row.qty,sData("center")); ws[XLSX.utils.encode_cell({c:4,r})].z=FMT_INT;
        xCell(ws,5,r,row.ahsp.price,sRupiah()); ws[XLSX.utils.encode_cell({c:5,r})].z=FMT_RP;
        xFormula(ws,6,r,"E"+er+"*F"+er,sRupiah(),FMT_RP);
        rowsA.push(er); r++;
    });
    const fA = rowsA.length ? rowsA.map(function(ri){return "G"+ri;}).join("+") : "0";
    xCell(ws,0,r,"",sSubTotalLbl()); xCell(ws,1,r,"",sSubTotalLbl());
    xCell(ws,2,r,"Sub-Total Kelompok A (Perampingan / Pemangkasan)",sSubTotalLbl());
    xMerge(merges,2,r,5,r); fillMerge(ws,sSubTotalLbl(),2,r,5,r);
    xFormula(ws,6,r,fA,sSubTotalVal(),FMT_RP);
    const rowSubA=r+1; r++;

    writeSection("B.  PEMOTONGAN / PENEBANGAN POHON  (Ditebang Habis + Angkut Limbah)");
    const rowsB=[]; let noB=1;
    Object.values(summaryB).forEach(function(row) {
        const er=r+1;
        xCell(ws,0,r,noB++,sData("center")); xCell(ws,1,r,row.ahsp.id,sData("center"));
        xCell(ws,2,r,row.ahsp.label+"  —  "+row.ahsp.desc,sData()); xCell(ws,3,r,"Batang",sData("center"));
        xCell(ws,4,r,row.qty,sData("center")); ws[XLSX.utils.encode_cell({c:4,r})].z=FMT_INT;
        xCell(ws,5,r,row.ahsp.price,sRupiah()); ws[XLSX.utils.encode_cell({c:5,r})].z=FMT_RP;
        xFormula(ws,6,r,"E"+er+"*F"+er,sRupiah(),FMT_RP);
        rowsB.push(er); r++;
    });
    const fB = rowsB.length ? rowsB.map(function(ri){return "G"+ri;}).join("+") : "0";
    xCell(ws,0,r,"",sSubTotalLbl()); xCell(ws,1,r,"",sSubTotalLbl());
    xCell(ws,2,r,"Sub-Total Kelompok B (Pemotongan / Penebangan)",sSubTotalLbl());
    xMerge(merges,2,r,5,r); fillMerge(ws,sSubTotalLbl(),2,r,5,r);
    xFormula(ws,6,r,fB,sSubTotalVal(),FMT_RP);
    const rowSubB=r+1; r++;

    writeSection("JUMLAH BIAYA LANGSUNG FISIK  (A + B)");
    xFormula(ws,6,r-1,"G"+rowSubA+"+G"+rowSubB,sSubTotalVal(),FMT_RP);
    const rowTotDir = r;

    xCell(ws,0,r,"",sData()); xCell(ws,1,r,"C.1",sData("center"));
    xCell(ws,2,r,"Biaya Penerapan SMKK / K3  (2,5% dari Total Biaya Fisik)",sData());
    xCell(ws,3,r,"LS",sData("center")); xCell(ws,4,r,1,sData("center")); xCell(ws,5,r,"2.5% x Fisik",sData("center"));
    xFormula(ws,6,r,"(G"+rowSubA+"+G"+rowSubB+")*0.025",sRupiah(),FMT_RP);
    const rowSMKK=r+1; r++;

    xCell(ws,0,r,"",sSubTotalLbl()); xCell(ws,1,r,"",sSubTotalLbl());
    xCell(ws,2,r,"JUMLAH BIAYA FISIK + SMKK",sSubTotalLbl()); xMerge(merges,2,r,5,r); fillMerge(ws,sSubTotalLbl(),2,r,5,r);
    xFormula(ws,6,r,"G"+rowSubA+"+G"+rowSubB+"+G"+rowSMKK,sSubTotalVal(),FMT_RP);
    const rowTot=r+1; r++;

    xCell(ws,0,r,"",sData()); xCell(ws,1,r,"",sData());
    xCell(ws,2,r,"PAJAK PERTAMBAHAN NILAI  (PPN 11%)",sData()); xMerge(merges,2,r,5,r); fillMerge(ws,sData(),2,r,5,r);
    xFormula(ws,6,r,"G"+rowTot+"*0.11",sRupiah(),FMT_RP);
    const rowPPN=r+1; r++;

    xCell(ws,0,r,"",sGrandLbl()); xCell(ws,1,r,"",sGrandLbl());
    xCell(ws,2,r,"GRAND TOTAL RENCANA ANGGARAN BIAYA (RAB)",sGrandLbl()); xMerge(merges,2,r,5,r); fillMerge(ws,sGrandLbl(),2,r,5,r);
    xFormula(ws,6,r,"G"+rowTot+"+G"+rowPPN,sGrandVal(),FMT_RP); r++;

    r++;
    const noteStyle = { font: xfont({sz:9,italic:true,color:"555555"}), alignment: xalign("left","center",true) };
    const notes = [
        "📌 Catatan Teknis & Syarat Pelaksanaan:",
        "1. Regulasi Acuan: SE Ditjen Bina Konstruksi No. 47/SE/Dk/2026 (AHSP PUPR 2026).",
        "2. Harga Satuan Dasar (HSD): Upah dan sewa alat mengacu pada acuan HSD standar. Wajib disesuaikan HSD Pemda setempat untuk tender resmi.",
        "3. Penerapan SMKK (K3): Biaya K3 Konstruksi sebesar 2,5% diperhitungkan sesuai Permen PUPR No. 10/2021.",
        "4. Pajak Pertambahan Nilai: PPN 11% dihitung dari Total Fisik + SMKK sesuai UU HPP No. 7/2021.",
        "5. Komponen Angkut Limbah: Limbah kayu/ranting diangkut menggunakan armada Dump Truck (Angkut Limbah) untuk menjaga kebersihan lokasi kerja.",
    ];
    notes.forEach(function(note) {
        xCell(ws,0,r,note,noteStyle); xMerge(merges,0,r,LC,r); fillMerge(ws,noteStyle,0,r,LC,r); r++;
    });

    r++;
    const tl = { font: xfont({sz:10,bold:true}), alignment: xalign("center","bottom") };
    const ts = { font: xfont({sz:9}), alignment: xalign("center","center") };
    const tln = { font: xfont({sz:10}), alignment: xalign("center","center"), border:{bottom:bdr("medium")} };

    xCell(ws,0,r,"Dibuat Oleh",tl); xMerge(merges,0,r,1,r); xCell(ws,1,r,"",tl);
    xCell(ws,3,r,"Diperiksa Oleh",tl); xMerge(merges,3,r,4,r); xCell(ws,4,r,"",tl);
    xCell(ws,6,r,"Disetujui Oleh",tl); r++;
    xCell(ws,0,r,"Perencana / Konsultan",ts); xMerge(merges,0,r,1,r); xCell(ws,1,r,"",ts);
    xCell(ws,3,r,"PPK / Kepala Bidang",ts); xMerge(merges,3,r,4,r); xCell(ws,4,r,"",ts);
    xCell(ws,6,r,"Kasatker / Kuasa PA",ts); r++; r++; r++; r++;
    xCell(ws,0,r,"( _______________________ )",tln); xMerge(merges,0,r,1,r); xCell(ws,1,r,"",tln);
    xCell(ws,3,r,"( _______________________ )",tln); xMerge(merges,3,r,4,r); xCell(ws,4,r,"",tln);
    xCell(ws,6,r,"( _______________________ )",tln); r++;
    xCell(ws,0,r,"NIP: ___________",ts); xMerge(merges,0,r,1,r); xCell(ws,1,r,"",ts);
    xCell(ws,3,r,"NIP: ___________",ts); xMerge(merges,3,r,4,r); xCell(ws,4,r,"",ts);
    xCell(ws,6,r,"NIP: ___________",ts);

    ws["!merges"] = merges;
    ws["!cols"]   = [{wch:6},{wch:10},{wch:52},{wch:10},{wch:16},{wch:22},{wch:24}];
    ws["!rows"]   = [{hpt:34},{hpt:22},{hpt:30}];
    ws["!views"]  = [{ showGridLines: true }];
    xRange(ws, LC, r);
    XLSX.utils.book_append_sheet(wb, ws, "RAB Rekapitulasi");
}
