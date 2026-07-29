// --- State & Multi-Tenant Data Management ---
let surveyData = [];
let currentUser = null;
let activeTenantKey = 'guest1';

function loadTenantData(tenantUsername) {
    activeTenantKey = tenantUsername;
    try {
        const raw = localStorage.getItem('arborSurveyData_' + tenantUsername);
        if (raw) {
            surveyData = JSON.parse(raw);
        } else {
            // Initial sample data for guest1, fresh empty space for guest2..guest4
            if (tenantUsername === 'guest1') {
                surveyData = JSON.parse(JSON.stringify(SAMPLE_SURVEY_DATA));
            } else {
                surveyData = [];
            }
            saveToLocal();
        }
    } catch(e) {
        console.warn("Error loading tenant data:", e);
        surveyData = [];
    }
}

function loadConsolidatedSuperadminData() {
    activeTenantKey = 'all';
    surveyData = [];
    ['guest1', 'guest2', 'guest3', 'guest4'].forEach(g => {
        try {
            const raw = localStorage.getItem('arborSurveyData_' + g);
            if (raw) {
                const items = JSON.parse(raw);
                items.forEach(item => {
                    surveyData.push({
                        ...item,
                        id: `[${g.toUpperCase()}] ${item.id}`
                    });
                });
            }
        } catch(e) {
            console.warn(e);
        }
    });
}

function saveToLocal() {
    if (!currentUser) return;
    try {
        if (currentUser.isSuperadmin && activeTenantKey !== 'all') {
            localStorage.setItem('arborSurveyData_' + activeTenantKey, JSON.stringify(surveyData));
        } else if (!currentUser.isSuperadmin) {
            localStorage.setItem('arborSurveyData_' + currentUser.username, JSON.stringify(surveyData));
        }
    } catch(e) {
        console.warn("LocalStorage error:", e);
    }
}

// --- Navigation Logic ---
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.agent-view').forEach(v => v.classList.remove('active'));
        
        item.classList.add('active');
        const target = item.getAttribute('data-target');
        document.getElementById(target).classList.add('active');
        if (target === 'dashboard-view') {
            renderDashboard();
        }
    });
});

// --- Formatting Helpers ---
const formatRp = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num || 0);
};

// --- Sample Data Set (Realistis Proyek Pertamanan) ---
const SAMPLE_SURVEY_DATA = [
    { id: "Mahoni #01 - Jl. Sudirman", diameter: 45, kondisi: "normal", tindakanManual: "auto", jumlah: 3 },
    { id: "Trembesi #02 - RTH Kota", diameter: 115, kondisi: "sulit", tindakanManual: "auto", jumlah: 1 },
    { id: "Angsana #03 - Pedestrian Utama", diameter: 28, kondisi: "normal", tindakanManual: "perampingan", jumlah: 5 },
    { id: "Beringin #04 - Alun-Alun Utara", diameter: 85, kondisi: "sulit", tindakanManual: "auto", jumlah: 2 },
    { id: "Glodokan #05 - Median Jalan", diameter: 12, kondisi: "normal", tindakanManual: "auto", jumlah: 8 },
    { id: "Mahoni Kering #06 - Area Publik", diameter: 65, kondisi: "mati", tindakanManual: "pemotongan", jumlah: 2 },
    { id: "Palem Raja #07 - Depan Kantor", diameter: 35, kondisi: "sulit", tindakanManual: "auto", jumlah: 4 },
    { id: "Akasia #08 - Perumahan Asri", diameter: 95, kondisi: "mati", tindakanManual: "auto", jumlah: 1 }
];

// --- Surveyor Agent Logic ---
const formSurvey = document.getElementById('form-survey');
const surveyTableBody = document.getElementById('survey-table-body');
const surveyEmpty = document.getElementById('survey-empty');

formSurvey.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('pohon-id').value;
    const diameter = parseFloat(document.getElementById('pohon-diameter').value);
    const kondisi = document.getElementById('pohon-kondisi').value;
    const tindakanManual = document.getElementById('pohon-tindakan').value; // 'auto', 'perampingan', 'pemotongan'
    const jumlah = parseInt(document.getElementById('pohon-jumlah').value) || 1;
    
    surveyData.push({ id, diameter, kondisi, tindakanManual, jumlah });
    saveToLocal();
    
    formSurvey.reset();
    document.getElementById('pohon-tindakan').value = 'auto'; // default back to auto
    document.getElementById('pohon-jumlah').value = '1';
    
    renderSurveyTable();
    renderArboristTable();
    if (typeof generateRAB === 'function') generateRAB();
    renderDashboard();
});

function renderSurveyTable() {
    surveyTableBody.innerHTML = '';
    
    if (surveyData.length === 0) {
        surveyEmpty.style.display = 'block';
        return;
    }
    
    surveyEmpty.style.display = 'none';
    
    surveyData.forEach((item, index) => {
        const manualBadge = item.tindakanManual === 'auto' 
            ? '<span style="opacity:0.5;">Auto</span>' 
            : `<span class="val-badge" style="background:var(--clr-accent); color:#fff;">Paksa ${item.tindakanManual}</span>`;
            
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.id}</strong></td>
            <td>${item.diameter} cm</td>
            <td><span class="val-badge">${item.kondisi.toUpperCase()}</span></td>
            <td>${manualBadge}</td>
            <td>${item.jumlah || 1}</td>
            <td class="text-center">
                <div class="action-row" style="justify-content: center;">
                    <button class="btn-icon delete" onclick="deleteSurvey(${index})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        `;
        surveyTableBody.appendChild(tr);
    });
}

window.deleteSurvey = (index) => {
    surveyData.splice(index, 1);
    saveToLocal();
    renderSurveyTable();
    renderArboristTable();
    if (typeof generateRAB === 'function') generateRAB();
    renderDashboard();
};

// --- Arborist Agent Logic ---
const arboristTableBody = document.getElementById('arborist-table-body');
const arboristEmpty = document.getElementById('arborist-empty');

function analyzeTree(tree) {
    let action = 'perampingan';
    let category = '';
    
    // Arborist Rules (Default)
    if (tree.kondisi === 'mati') {
        action = 'pemotongan';
    }
    
    // Manual Override
    if (tree.tindakanManual && tree.tindakanManual !== 'auto') {
        action = tree.tindakanManual;
    }
    
    // Determine Category based on diameter
    if (tree.diameter < 15) category = action === 'perampingan' ? "5-15" : "<15";
    else if (tree.diameter <= 30) category = "15-30";
    else if (tree.diameter <= 50) category = "30-50";
    else if (tree.diameter <= 75) category = "50-75";
    else if (tree.diameter <= 100) category = action === 'perampingan' ? ">75" : "75-100";
    else category = action === 'perampingan' ? ">100" : ">100";
    
    const ahspRef = window.ahspData && window.ahspData[action] ? window.ahspData[action][category] : null;
    
    return {
        ...tree,
        action,
        category,
        ahsp: ahspRef
    };
}

function renderArboristTable() {
    arboristTableBody.innerHTML = '';
    
    if (surveyData.length === 0) {
        arboristEmpty.style.display = 'block';
        return;
    }
    
    arboristEmpty.style.display = 'none';
    
    surveyData.forEach(item => {
        const analyzed = analyzeTree(item);
        let actionColor = analyzed.action === 'pemotongan' ? 'var(--clr-danger)' : 'var(--clr-success)';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${analyzed.id}</strong></td>
            <td>${analyzed.diameter} cm</td>
            <td><strong style="color: ${actionColor}; text-transform: uppercase;">${analyzed.action}</strong></td>
            <td>${analyzed.jumlah || 1}</td>
            <td>${analyzed.ahsp ? analyzed.ahsp.id + ' (' + analyzed.ahsp.label + ')' : 'Tidak Ditemukan'}</td>
        `;
        arboristTableBody.appendChild(tr);
    });
}

// --- Estimator Agent (RAB) Logic ---
const btnGenerate = document.getElementById('btn-generate-rab');
const rabTableBody = document.getElementById('rab-table-body');
const rabEmpty = document.getElementById('rab-empty');
const rabSummaryBox = document.getElementById('rab-summary-box');

if (btnGenerate) {
    btnGenerate.addEventListener('click', () => {
        generateRAB();
        renderDashboard();
    });
}

function generateRAB() {
    if (surveyData.length === 0) {
        if (rabEmpty) rabEmpty.style.display = 'block';
        if (rabSummaryBox) rabSummaryBox.style.display = 'none';
        if (rabTableBody) rabTableBody.innerHTML = '';
        return;
    }
    
    if (rabEmpty) rabEmpty.style.display = 'none';
    if (rabSummaryBox) rabSummaryBox.style.display = 'grid';
    if (rabTableBody) rabTableBody.innerHTML = '';
    const btnExport = document.getElementById('btn-export-excel');
    if (btnExport) btnExport.style.display = 'inline-flex';
    
    const analyzedData = surveyData.map(analyzeTree);
    const summary = {};
    
    analyzedData.forEach(item => {
        if (!item.ahsp) return;
        const key = `${item.action}_${item.category}`;
        if (!summary[key]) {
            summary[key] = {
                ahsp: item.ahsp,
                action: item.action,
                qty: 0
            };
        }
        summary[key].qty += (item.jumlah || 1);
    });
    
    let totalBiayaLangsung = 0;
    
    Object.values(summary).forEach((row, idx) => {
        const total = row.qty * row.ahsp.price;
        totalBiayaLangsung += total;
        
        let prefix = row.action === 'perampingan' ? '[Perampingan] ' : '[Pemotongan] ';
        
        // Main Row
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <strong>${row.ahsp.id}</strong> - ${prefix}${row.ahsp.label}
                <br><span style="font-size:0.8rem; color:var(--clr-text-muted);">${row.ahsp.desc}</span>
            </td>
            <td class="text-center"><strong>${row.qty}</strong></td>
            <td class="text-center">Btg</td>
            <td class="text-right">
                <div style="display:flex; justify-content:flex-end; align-items:center; gap:8px;">
                    ${formatRp(row.ahsp.price)}
                    <button class="btn-icon info" onclick="toggleBreakdown('bd-${idx}')" title="Lihat rincian alat/bahan"><i class="fa-solid fa-circle-info"></i></button>
                </div>
            </td>
            <td class="text-right"><strong>${formatRp(total)}</strong></td>
        `;
        rabTableBody.appendChild(tr);
        
        // Breakdown Row (Hidden by default)
        const trBd = document.createElement('tr');
        trBd.id = `bd-${idx}`;
        trBd.className = 'rab-breakdown';
        trBd.style.display = 'none';
        
        let bdHtml = `<ul>`;
        if (row.ahsp.breakdown) {
            row.ahsp.breakdown.forEach(b => {
                bdHtml += `<li><span>${b.name}</span> <strong>${formatRp(b.val)}</strong></li>`;
            });
        }
        bdHtml += `</ul>`;
        
        trBd.innerHTML = `<td colspan="5"><strong>Rincian Komponen per Batang:</strong><br>${bdHtml}</td>`;
        rabTableBody.appendChild(trBd);
    });
    
    const smkk = totalBiayaLangsung * (window.ahspData ? window.ahspData.smkkRate : 0.025);
    const directAndSmkk = totalBiayaLangsung + smkk;
    const ppn = directAndSmkk * (window.ahspData ? window.ahspData.ppnRate : 0.11);
    const grandTotal = directAndSmkk + ppn;
    
    document.getElementById('sum-direct').innerText = formatRp(totalBiayaLangsung);
    document.getElementById('sum-smkk').innerText = formatRp(smkk);
    document.getElementById('sum-ppn').innerText = formatRp(ppn);
    document.getElementById('sum-total').innerText = formatRp(grandTotal);
}

window.toggleBreakdown = (id) => {
    const el = document.getElementById(id);
    if (el) {
        if (el.style.display === 'none') el.style.display = 'table-row';
        else el.style.display = 'none';
    }
};

// --- Edit Harga Logic ---
const btnEditHarga = document.getElementById('btn-edit-harga');
const modalEditHarga = document.getElementById('modal-edit-harga');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnSaveHarga = document.getElementById('btn-save-harga');
const containerEdit = document.getElementById('edit-harga-container');

if (btnEditHarga) {
    btnEditHarga.addEventListener('click', () => {
        containerEdit.innerHTML = '';
        
        // Build Perampingan Editor
        let html = `
            <h4 style="margin: 15px 0 10px; color: var(--clr-primary);">Kelompok A (Perampingan)</h4>
            <div class="form-grid">
        `;
        Object.keys(window.ahspData.perampingan).forEach(k => {
            const item = window.ahspData.perampingan[k];
            html += `
                <div class="form-group">
                    <label class="form-label">${item.id} - ${item.label}</label>
                    <input type="number" class="form-control" data-group="perampingan" data-key="${k}" value="${item.price}">
                </div>
            `;
        });
        html += `</div>`;
        
        // Build Pemotongan Editor
        html += `
            <h4 style="margin: 25px 0 10px; color: var(--clr-primary);">Kelompok B (Pemotongan)</h4>
            <div class="form-grid">
        `;
        Object.keys(window.ahspData.pemotongan).forEach(k => {
            const item = window.ahspData.pemotongan[k];
            html += `
                <div class="form-group">
                    <label class="form-label">${item.id} - ${item.label}</label>
                    <input type="number" class="form-control" data-group="pemotongan" data-key="${k}" value="${item.price}">
                </div>
            `;
        });
        html += `</div>`;
        
        containerEdit.innerHTML = html;
        modalEditHarga.style.display = 'flex';
    });
}

if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
        modalEditHarga.style.display = 'none';
    });
}

if (btnSaveHarga) {
    btnSaveHarga.addEventListener('click', () => {
        const inputs = containerEdit.querySelectorAll('input');
        const customPrices = { perampingan: {}, pemotongan: {} };
        
        inputs.forEach(input => {
            const group = input.getAttribute('data-group');
            const key = input.getAttribute('data-key');
            const val = parseFloat(input.value);
            if (!isNaN(val)) {
                customPrices[group][key] = val;
                window.ahspData[group][key].price = val; // update local memory instantly
            }
        });
        
        try {
            localStorage.setItem('ahspCustomPrices', JSON.stringify(customPrices));
        } catch (e) {
            console.warn("LocalStorage not available:", e);
        }
        modalEditHarga.style.display = 'none';
        
        if (surveyData.length > 0) generateRAB();
        renderDashboard();
        alert('Harga satuan berhasil diperbarui!');
    });
}

// ==========================================================================
// DASHBOARD ANALYTICS & CHART.JS LOGIC
// ==========================================================================

let chartTindakanInstance = null;
let chartDiameterInstance = null;
let chartKondisiInstance = null;

function renderDashboard() {
    let totalBatang = 0;
    let totalPerampingan = 0;
    let totalPemotongan = 0;
    let countKritis = 0;

    let diameterBins = { "<15": 0, "15-30": 0, "30-50": 0, "50-75": 0, "75-100": 0, ">100": 0 };
    let kondisiCounts = { normal: 0, sulit: 0, mati: 0 };
    let criticalList = [];

    let summaryAhsp = {};
    let totalBiayaLangsung = 0;

    surveyData.forEach(item => {
        const qty = item.jumlah || 1;
        totalBatang += qty;

        const analyzed = analyzeTree(item);
        if (analyzed.action === 'pemotongan') totalPemotongan += qty;
        else totalPerampingan += qty;

        if (item.kondisi === 'sulit' || item.kondisi === 'mati' || analyzed.action === 'pemotongan') {
            countKritis += qty;
            criticalList.push(analyzed);
        }

        // Bins diameter
        const d = item.diameter;
        if (d < 15) diameterBins["<15"] += qty;
        else if (d <= 30) diameterBins["15-30"] += qty;
        else if (d <= 50) diameterBins["30-50"] += qty;
        else if (d <= 75) diameterBins["50-75"] += qty;
        else if (d <= 100) diameterBins["75-100"] += qty;
        else diameterBins[">100"] += qty;

        // Kondisi
        kondisiCounts[item.kondisi] = (kondisiCounts[item.kondisi] || 0) + qty;

        // Hitung biaya
        if (analyzed.ahsp) {
            const key = `${analyzed.action}_${analyzed.category}`;
            if (!summaryAhsp[key]) {
                summaryAhsp[key] = { ahsp: analyzed.ahsp, qty: 0 };
            }
            summaryAhsp[key].qty += qty;
            totalBiayaLangsung += (qty * analyzed.ahsp.price);
        }
    });

    const smkkCost = totalBiayaLangsung * (window.ahspData ? window.ahspData.smkkRate : 0.025);
    const directAndSmkk = totalBiayaLangsung + smkkCost;
    const ppnCost = directAndSmkk * (window.ahspData ? window.ahspData.ppnRate : 0.11);
    const grandTotal = directAndSmkk + ppnCost;

    // Update KPI Elements
    const kpiTotal = document.getElementById('dash-kpi-total');
    if (kpiTotal) kpiTotal.innerText = `${totalBatang} Batang`;

    const kpiSub = document.getElementById('dash-kpi-species-sub');
    if (kpiSub) kpiSub.innerText = `${surveyData.length} varietas / lokasi survei`;

    const kpiRab = document.getElementById('dash-kpi-rab');
    if (kpiRab) kpiRab.innerText = formatRp(grandTotal);

    const kpiTindakan = document.getElementById('dash-kpi-tindakan');
    if (kpiTindakan) kpiTindakan.innerText = `${totalPerampingan} / ${totalPemotongan}`;

    const totalActions = totalPerampingan + totalPemotongan;
    const pctPerampingan = totalActions > 0 ? Math.round((totalPerampingan / totalActions) * 100) : 0;
    const pctPemotongan = totalActions > 0 ? Math.round((totalPemotongan / totalActions) * 100) : 0;
    const kpiTindakanSub = document.getElementById('dash-kpi-tindakan-sub');
    if (kpiTindakanSub) kpiTindakanSub.innerText = `${pctPerampingan}% Perampingan · ${pctPemotongan}% Pemotongan`;

    const kpiRisiko = document.getElementById('dash-kpi-risiko');
    if (kpiRisiko) kpiRisiko.innerText = `${countKritis} Batang`;

    // Cost Breakdown Progress Bars
    const elDirect = document.getElementById('dash-cost-direct');
    if (elDirect) elDirect.innerText = formatRp(totalBiayaLangsung);

    const elSmkk = document.getElementById('dash-cost-smkk');
    if (elSmkk) elSmkk.innerText = formatRp(smkkCost);

    const elPpn = document.getElementById('dash-cost-ppn');
    if (elPpn) elPpn.innerText = formatRp(ppnCost);

    const elTotal = document.getElementById('dash-cost-total');
    if (elTotal) elTotal.innerText = formatRp(grandTotal);

    const pbDirect = document.getElementById('pbar-direct');
    const pbSmkk = document.getElementById('pbar-smkk');
    const pbPpn = document.getElementById('pbar-ppn');

    if (grandTotal > 0) {
        if (pbDirect) pbDirect.style.width = `${Math.round((totalBiayaLangsung / grandTotal) * 100)}%`;
        if (pbSmkk) pbSmkk.style.width = `${Math.round((smkkCost / grandTotal) * 100)}%`;
        if (pbPpn) pbPpn.style.width = `${Math.round((ppnCost / grandTotal) * 100)}%`;
    } else {
        if (pbDirect) pbDirect.style.width = '0%';
        if (pbSmkk) pbSmkk.style.width = '0%';
        if (pbPpn) pbPpn.style.width = '0%';
    }

    // Table Critical Trees
    const critBody = document.getElementById('dash-critical-table-body');
    const critEmpty = document.getElementById('dash-critical-empty');
    const badgeCrit = document.getElementById('badge-critical-count');

    if (critBody) {
        critBody.innerHTML = '';
        if (criticalList.length === 0) {
            if (critEmpty) critEmpty.style.display = 'block';
            if (badgeCrit) badgeCrit.innerText = '0 Lokasi Kritis';
        } else {
            if (critEmpty) critEmpty.style.display = 'none';
            if (badgeCrit) badgeCrit.innerText = `${criticalList.length} Lokasi Kritis`;

            criticalList.forEach(item => {
                const tr = document.createElement('tr');
                const actionColor = item.action === 'pemotongan' ? 'var(--clr-danger)' : 'var(--clr-success)';
                const priceText = item.ahsp ? formatRp(item.ahsp.price) : '-';
                
                tr.innerHTML = `
                    <td><strong>${item.id}</strong></td>
                    <td>${item.diameter} cm</td>
                    <td><span class="val-badge" style="background: ${item.kondisi === 'mati' ? 'rgba(201,68,68,0.15)' : 'rgba(229,158,42,0.15)'}; color: ${item.kondisi === 'mati' ? 'var(--clr-danger)' : 'var(--clr-accent)'}">${item.kondisi.toUpperCase()}</span></td>
                    <td><strong style="color:${actionColor}; text-transform:uppercase;">${item.action}</strong></td>
                    <td>${item.ahsp ? item.ahsp.id : '-'}</td>
                    <td class="text-right"><strong>${priceText}</strong></td>
                `;
                critBody.appendChild(tr);
            });
        }
    }

    // Render Charts
    renderTindakanChart(totalPerampingan, totalPemotongan);
    renderDiameterChart(diameterBins);
    renderKondisiChart(kondisiCounts);
}

function renderTindakanChart(perampingan, pemotongan) {
    const ctx = document.getElementById('chart-tindakan');
    if (!ctx) return;

    if (chartTindakanInstance) {
        chartTindakanInstance.destroy();
    }

    chartTindakanInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Perampingan (Pangkas)', 'Pemotongan (Tebang)'],
            datasets: [{
                data: [perampingan, pemotongan],
                backgroundColor: ['#2d8a54', '#c94444'],
                hoverBackgroundColor: ['#1e4d3a', '#a32a2a'],
                borderWidth: 3,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { family: 'Plus Jakarta Sans', size: 12 }, padding: 15 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` ${context.label}: ${context.raw} Batang`;
                        }
                    }
                }
            },
            cutout: '68%'
        }
    });
}

function renderDiameterChart(bins) {
    const ctx = document.getElementById('chart-diameter');
    if (!ctx) return;

    if (chartDiameterInstance) {
        chartDiameterInstance.destroy();
    }

    chartDiameterInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['<15 cm', '15-30 cm', '30-50 cm', '50-75 cm', '75-100 cm', '>100 cm'],
            datasets: [{
                label: 'Jumlah Pohon (Batang)',
                data: [bins["<15"], bins["15-30"], bins["30-50"], bins["50-75"], bins["75-100"], bins[">100"]],
                backgroundColor: 'rgba(30, 77, 58, 0.85)',
                hoverBackgroundColor: '#1e4d3a',
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` Total: ${context.raw} Batang`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, font: { family: 'Plus Jakarta Sans' } },
                    grid: { color: 'rgba(30,77,58,0.06)' }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Plus Jakarta Sans' } }
                }
            }
        }
    });
}

function renderKondisiChart(counts) {
    const ctx = document.getElementById('chart-kondisi');
    if (!ctx) return;

    if (chartKondisiInstance) {
        chartKondisiInstance.destroy();
    }

    chartKondisiInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Normal / Terbuka', 'Dekat Kabel Listrik / Sulit', 'Mati / Kering'],
            datasets: [{
                data: [counts.normal || 0, counts.sulit || 0, counts.mati || 0],
                backgroundColor: ['#2d8a54', '#e59e2a', '#c94444'],
                borderWidth: 3,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { family: 'Plus Jakarta Sans', size: 12 }, padding: 15 }
                }
            }
        }
    });
}

// Sample Data & Reset Handlers
const btnLoadSample = document.getElementById('btn-load-sample');
const btnResetData = document.getElementById('btn-reset-data');

if (btnLoadSample) {
    btnLoadSample.addEventListener('click', () => {
        surveyData = JSON.parse(JSON.stringify(SAMPLE_SURVEY_DATA));
        saveToLocal();
        renderSurveyTable();
        renderArboristTable();
        if (typeof generateRAB === 'function') generateRAB();
        renderDashboard();
    });
}

if (btnResetData) {
    btnResetData.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin me-reset seluruh data survei dan RAB?')) {
            surveyData = [];
            saveToLocal();
            renderSurveyTable();
            renderArboristTable();
            if (typeof generateRAB === 'function') generateRAB();
            renderDashboard();
        }
    });
}

// Auto load sample data on first run if surveyData is empty
if (surveyData.length === 0) {
    surveyData = JSON.parse(JSON.stringify(SAMPLE_SURVEY_DATA));
    saveToLocal();
}

// --- Initialize On Load ---
renderSurveyTable();
renderArboristTable();
if (typeof generateRAB === 'function') generateRAB();
renderDashboard();

// --- Excel Export Logic ---
const btnExportExcel = document.getElementById('btn-export-excel');
if (btnExportExcel) {
    btnExportExcel.addEventListener('click', function() {
        if (typeof window.exportToExcel === 'function') {
            window.exportToExcel();
        } else {
            alert('Modul export belum dimuat. Refresh halaman dan coba lagi.');
        }
    });
}

// ==========================================================================
// AUTHENTICATION & STRICT ACCESS CONTROL (MAKSIMAL 5 AKUN TEROTORISASI)
// ==========================================================================

// ==========================================================================
// AUTHENTICATION & STRICT ACCESS CONTROL (5 AKUN KHUSUS TEROTORISASI)
// ==========================================================================

const ALLOWED_USERS = [
    { username: 'admin', pass: '12345Admin', name: 'Superadmin Utama', role: 'Superadmin (Akses Penuh Monitoring)', isSuperadmin: true },
    { username: 'guest1', pass: '123guest1', name: 'Guest Account 1', role: 'Pengguna Terbatas 1', isSuperadmin: false },
    { username: 'guest2', pass: '321guest2', name: 'Guest Account 2', role: 'Pengguna Terbatas 2', isSuperadmin: false },
    { username: 'guest3', pass: '321guest3', name: 'Guest Account 3', role: 'Pengguna Terbatas 3', isSuperadmin: false },
    { username: 'guest4', pass: '321guest4', name: 'Guest Account 4', role: 'Pengguna Terbatas 4', isSuperadmin: false }
];

const loginOverlay = document.getElementById('login-overlay');
const appContainer = document.getElementById('app-container');
const formLogin = document.getElementById('form-login');
const loginAlert = document.getElementById('login-alert');
const loginAlertMsg = document.getElementById('login-alert-msg');
const btnTogglePwd = document.getElementById('btn-toggle-pwd');
const pwdInput = document.getElementById('login-password');
const pwdIcon = document.getElementById('pwd-icon');
const btnQuickDemo = document.getElementById('btn-quick-demo');
const btnLogout = document.getElementById('btn-logout');
const userDisplayName = document.getElementById('user-display-name');
const userDisplayRole = document.getElementById('user-display-role');

function checkAuthSession() {
    let session = null;
    try {
        session = localStorage.getItem('arborUserSession') || sessionStorage.getItem('arborUserSession');
    } catch(e) {
        console.warn("Storage access restricted:", e);
    }

    if (session) {
        try {
            const user = JSON.parse(session);
            // Verify if stored user still exists in ALLOWED_USERS
            const foundUser = ALLOWED_USERS.find(u => u.username.toLowerCase() === (user.username || '').toLowerCase());
            if (foundUser) {
                activateUserSession(foundUser);
            } else {
                showLoginScreen();
            }
        } catch(e) {
            showLoginScreen();
        }
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    currentUser = null;
    if (loginOverlay) loginOverlay.classList.remove('hidden');
    if (appContainer) appContainer.style.filter = 'blur(8px)';
}

function activateUserSession(user) {
    currentUser = user;
    if (loginOverlay) loginOverlay.classList.add('hidden');
    if (appContainer) appContainer.style.filter = 'none';

    if (userDisplayName) userDisplayName.textContent = user.name || user.username || 'User';
    if (userDisplayRole) userDisplayRole.textContent = user.role || 'Arbor-AI Agent';

    const superadminBar = document.getElementById('superadmin-bar');
    const selectTenantFilter = document.getElementById('select-tenant-filter');

    if (user.isSuperadmin) {
        if (superadminBar) superadminBar.style.display = 'flex';
        if (selectTenantFilter) selectTenantFilter.value = 'all';
        loadConsolidatedSuperadminData();
    } else {
        if (superadminBar) superadminBar.style.display = 'none';
        loadTenantData(user.username);
    }

    renderSurveyTable();
    renderArboristTable();
    if (typeof generateRAB === 'function') generateRAB();
    renderDashboard();
}

// Superadmin Monitoring Filter Change Listener
const selectTenantFilter = document.getElementById('select-tenant-filter');
if (selectTenantFilter) {
    selectTenantFilter.addEventListener('change', function(e) {
        const val = e.target.value;
        if (val === 'all') {
            loadConsolidatedSuperadminData();
        } else {
            loadTenantData(val);
        }
        renderSurveyTable();
        renderArboristTable();
        if (typeof generateRAB === 'function') generateRAB();
        renderDashboard();
    });
}

// Form Submit Handler (STRICT VERIFICATION)
if (formLogin) {
    formLogin.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value.trim();
        const password = pwdInput.value.trim();
        const remember = document.getElementById('login-remember').checked;
        const btnSubmit = document.getElementById('btn-login-submit');

        // STRICT MATCH against ALLOWED_USERS only
        const foundUser = ALLOWED_USERS.find(u => u.username.toLowerCase() === username.toLowerCase() && u.pass === password);

        if (foundUser) {
            // Loading state feedback
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = `<span>Memverifikasi Akun...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
            if (loginAlert) loginAlert.style.display = 'none';

            setTimeout(() => {
                try {
                    const sessionData = JSON.stringify(foundUser);
                    if (remember) {
                        localStorage.setItem('arborUserSession', sessionData);
                    } else {
                        sessionStorage.setItem('arborUserSession', sessionData);
                    }
                } catch(e) {
                    console.warn("Could not save session:", e);
                }

                activateUserSession(foundUser);
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = `<span>Masuk ke Dashboard</span> <i class="fa-solid fa-right-to-bracket"></i>`;
            }, 350);

        } else {
            // REJECT INVALID CREDENTIALS
            if (loginAlert) {
                loginAlert.style.display = 'flex';
                loginAlertMsg.textContent = 'Akses Ditolak! Username atau Password tidak terdaftar.';
            }
            if (pwdInput) pwdInput.value = '';
        }
    });
}

// Password Visibility Toggle
if (btnTogglePwd && pwdInput && pwdIcon) {
    btnTogglePwd.addEventListener('click', function() {
        if (pwdInput.type === 'password') {
            pwdInput.type = 'text';
            pwdIcon.classList.remove('fa-eye');
            pwdIcon.classList.add('fa-eye-slash');
        } else {
            pwdInput.type = 'password';
            pwdIcon.classList.remove('fa-eye-slash');
            pwdIcon.classList.add('fa-eye');
        }
    });
}

// Auto Fill & Quick Demo Login Button (Fills admin / 12345Admin)
if (btnQuickDemo) {
    btnQuickDemo.addEventListener('click', function() {
        const usernameInput = document.getElementById('login-username');
        if (usernameInput) usernameInput.value = 'admin';
        if (pwdInput) pwdInput.value = '12345Admin';
        
        if (formLogin) {
            const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
            formLogin.dispatchEvent(submitEvent);
        }
    });
}

// Logout Handler
if (btnLogout) {
    btnLogout.addEventListener('click', function() {
        if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
            try {
                localStorage.removeItem('arborUserSession');
                sessionStorage.removeItem('arborUserSession');
            } catch(e) {
                console.warn(e);
            }
            showLoginScreen();
        }
    });
}

// Initialize Authentication Check on Page Load
document.addEventListener('DOMContentLoaded', checkAuthSession);
checkAuthSession();

// --- Mobile Sidebar & Drawer Navigation Handler ---
const btnMobileToggle = document.getElementById('btn-mobile-toggle');
const sidebarDrawer = document.querySelector('.sidebar');
const mobileBackdrop = document.getElementById('mobile-backdrop');
const mobileToggleIcon = document.getElementById('mobile-toggle-icon');

function toggleMobileSidebar(show) {
    if (!sidebarDrawer) return;
    const isShowing = show !== undefined ? show : !sidebarDrawer.classList.contains('mobile-open');
    if (isShowing) {
        sidebarDrawer.classList.add('mobile-open');
        if (mobileBackdrop) mobileBackdrop.classList.add('active');
        if (mobileToggleIcon) {
            mobileToggleIcon.classList.remove('fa-bars');
            mobileToggleIcon.classList.add('fa-xmark');
        }
    } else {
        sidebarDrawer.classList.remove('mobile-open');
        if (mobileBackdrop) mobileBackdrop.classList.remove('active');
        if (mobileToggleIcon) {
            mobileToggleIcon.classList.remove('fa-xmark');
            mobileToggleIcon.classList.add('fa-bars');
        }
    }
}

if (btnMobileToggle) {
    btnMobileToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMobileSidebar();
    });
}

if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', function() {
        toggleMobileSidebar(false);
    });
}

// Close drawer automatically on mobile when selecting a nav item
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            toggleMobileSidebar(false);
        }
    });
});



