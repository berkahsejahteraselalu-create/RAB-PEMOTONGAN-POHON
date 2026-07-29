// data-ahsp.js
// Referensi: SE Dirjen Bina Konstruksi No. 47/SE/Dk/2026 (AHSP 2026)

window.ahspData = {
    // A. Perampingan / Pemangkasan (Pohon Tetap Hidup)
    perampingan: {
        "5-15": { id: "A.1", label: "Perampingan Ø 5-15 cm", price: 42000, desc: "Pohon kecil / perdu", breakdown: [ {name: "Pekerja Biasa (0.05 OH)", val: 6000}, {name: "Tukang (0.08 OH)", val: 12800}, {name: "Mandor (0.008 OH)", val: 1480}, {name: "Chainsaw Kecil (0.3 Jam)", val: 13500}, {name: "Alat Bantu", val: 750}, {name: "Cat Luka", val: 1900} ] },
        "15-30": { id: "A.2", label: "Perampingan Ø 15-30 cm", price: 68000, desc: "Pohon sedang kecil", breakdown: [ {name: "Pekerja Biasa (0.08 OH)", val: 9600}, {name: "Tukang (0.12 OH)", val: 19200}, {name: "Mandor (0.01 OH)", val: 1850}, {name: "Chainsaw Kecil (0.5 Jam)", val: 22500}, {name: "Alat Bantu", val: 1125}, {name: "Cat Luka", val: 4750} ] },
        "30-50": { id: "A.3", label: "Perampingan Ø 30-50 cm", price: 133500, desc: "Pohon sedang", breakdown: [ {name: "Pekerja Biasa (0.15 OH)", val: 18000}, {name: "Tukang (0.2 OH)", val: 32000}, {name: "Mandor (0.015 OH)", val: 2775}, {name: "Chainsaw Sedang (0.8 Jam)", val: 52000}, {name: "Alat Bantu", val: 1500}, {name: "Cat Luka", val: 9500} ] },
        "50-75": { id: "A.4", label: "Perampingan Ø 50-75 cm", price: 413000, desc: "Pohon besar", breakdown: [ {name: "Pekerja Biasa (0.25 OH)", val: 30000}, {name: "Tukang (0.35 OH)", val: 56000}, {name: "Mandor (0.02 OH)", val: 3700}, {name: "Chainsaw Sedang (1.2 Jam)", val: 78000}, {name: "Dump Truck - Angkut Limbah (0.5 Jam)", val: 175000}, {name: "Alat Bantu", val: 1875}, {name: "Cat Luka", val: 14250} ] },
        ">75": { id: "A.5", label: "Perampingan Ø > 75 cm", price: 841000, desc: "Pohon sangat besar", breakdown: [ {name: "Pekerja Biasa (0.35 OH)", val: 42000}, {name: "Tukang (0.5 OH)", val: 80000}, {name: "Mandor (0.03 OH)", val: 5550}, {name: "Chainsaw Besar (1.8 Jam)", val: 162000}, {name: "Dump Truck - Angkut Limbah (1.2 Jam)", val: 420000}, {name: "Alat Bantu", val: 2625}, {name: "Cat Luka", val: 19000} ] },
        ">100": { id: "A.6", label: "Perampingan Ø > 100 cm", price: 1221000, desc: "Pohon raksasa", breakdown: [ {name: "Pekerja Biasa (0.50 OH)", val: 60000}, {name: "Tukang (0.70 OH)", val: 112000}, {name: "Mandor (0.04 OH)", val: 7400}, {name: "Chainsaw Besar (2.5 Jam)", val: 225000}, {name: "Dump Truck - Angkut Limbah (1.8 Jam)", val: 630000}, {name: "Alat Bantu", val: 3500}, {name: "Cat Luka", val: 23750} ] }
    },
    
    // B. Pemotongan / Penebangan (Habis)
    pemotongan: {
        "<15": { id: "B.1", label: "Pemotongan Ø < 15 cm", price: 36000, desc: "Pohon kecil / perdu", breakdown: [ {name: "Pekerja Biasa (0.06 OH)", val: 7200}, {name: "Tukang (0.08 OH)", val: 12800}, {name: "Mandor (0.008 OH)", val: 1480}, {name: "Chainsaw Kecil (0.2 Jam)", val: 9000}, {name: "Alat Bantu", val: 750} ] },
        "15-30": { id: "B.2", label: "Pemotongan Ø 15-30 cm", price: 64000, desc: "Pohon sedang kecil", breakdown: [ {name: "Pekerja Biasa (0.09 OH)", val: 10800}, {name: "Tukang (0.12 OH)", val: 19200}, {name: "Mandor (0.01 OH)", val: 1850}, {name: "Chainsaw Kecil (0.5 Jam)", val: 22500}, {name: "Alat Bantu", val: 1125} ] },
        "30-50": { id: "B.3", label: "Pemotongan Ø 30-50 cm", price: 243000, desc: "Pohon sedang", breakdown: [ {name: "Pekerja Biasa (0.15 OH)", val: 18000}, {name: "Tukang (0.2 OH)", val: 32000}, {name: "Mandor (0.015 OH)", val: 2775}, {name: "Chainsaw Sedang (0.8 Jam)", val: 52000}, {name: "Dump Truck - Angkut Limbah (0.3 Jam)", val: 105000}, {name: "Alat Bantu", val: 1500} ] },
        "50-75": { id: "B.4", label: "Pemotongan Ø 50-75 cm", price: 519500, desc: "Pohon besar", breakdown: [ {name: "Pekerja Biasa (0.25 OH)", val: 30000}, {name: "Tukang (0.35 OH)", val: 56000}, {name: "Mandor (0.02 OH)", val: 3700}, {name: "Chainsaw Sedang (1.5 Jam)", val: 97500}, {name: "Dump Truck - Angkut Limbah (0.75 Jam)", val: 262500}, {name: "Alat Bantu", val: 1875} ] },
        "75-100": { id: "B.5", label: "Pemotongan Ø 75-100 cm", price: 927000, desc: "Pohon sangat besar", breakdown: [ {name: "Pekerja Biasa (0.4 OH)", val: 48000}, {name: "Tukang (0.5 OH)", val: 80000}, {name: "Mandor (0.03 OH)", val: 5550}, {name: "Chainsaw Besar (2 Jam)", val: 180000}, {name: "Dump Truck - Angkut Limbah (1.4 Jam)", val: 490000}, {name: "Alat Bantu", val: 2250} ] },
        ">100": { id: "B.6", label: "Pemotongan Ø > 100 cm", price: 1492500, desc: "Pohon raksasa", breakdown: [ {name: "Pekerja Biasa (0.6 OH)", val: 72000}, {name: "Tukang (0.75 OH)", val: 120000}, {name: "Mandor (0.05 OH)", val: 9250}, {name: "Chainsaw Besar (3 Jam)", val: 270000}, {name: "Dump Truck - Angkut Limbah (2.35 Jam)", val: 822500}, {name: "Alat Bantu", val: 3750} ] }
    },

    // Koefisien Tambahan
    smkkRate: 0.025, // 2.5% dari Total Biaya Langsung
    ppnRate: 0.11    // PPN 11%
};

// Check if there are custom prices in localStorage
let savedPrices = null;
try {
    savedPrices = localStorage.getItem('ahspCustomPrices');
} catch (e) {
    console.warn("LocalStorage not available:", e);
}
if (savedPrices) {
    try {
        const customData = JSON.parse(savedPrices);
        // Merge custom prices
        Object.keys(customData.perampingan || {}).forEach(k => {
            if (window.ahspData.perampingan[k]) window.ahspData.perampingan[k].price = customData.perampingan[k];
        });
        Object.keys(customData.pemotongan || {}).forEach(k => {
            if (window.ahspData.pemotongan[k]) window.ahspData.pemotongan[k].price = customData.pemotongan[k];
        });
    } catch (e) {
        console.error("Error loading custom prices", e);
    }
}
