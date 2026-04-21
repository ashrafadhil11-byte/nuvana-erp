// ==========================================
// CONFIGURATION
// ==========================================
const scriptURL = 'https://script.google.com/macros/s/AKfycbweIJLcyZTR619HQgD3IJvHI2Dn-3EnT7WEo3g0pKeCsPdPZCeSnhyonP_1QQjd5pQw/exec';

// ==========================================
// VIEW SWITCHING LOGIC
// ==========================================
const domView = document.getElementById('domesticView');
const intView = document.getElementById('internationalView');

document.getElementById('nav-domestic').addEventListener('click', () => {
    domView.classList.remove('hidden');
    intView.classList.add('hidden');
});

document.getElementById('nav-international').addEventListener('click', () => {
    intView.classList.remove('hidden');
    domView.classList.add('hidden');
});

// Show Domestic by default on load
domView.classList.remove('hidden');

// ==========================================
// DOMESTIC BOOKING MODULE
// ==========================================
const formDom = document.getElementById('bookingForm');
const submitBtnDom = document.getElementById('submitBtn');
const btnTextDom = document.getElementById('btnText');
const loadingIconDom = document.getElementById('loadingIcon');

formDom.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    btnTextDom.innerText = "Transmitting...";
    loadingIconDom.classList.remove('hidden');
    submitBtnDom.disabled = true;
    submitBtnDom.classList.add('opacity-50', 'cursor-not-allowed');

    const formData = {
        formType: "domestic", // CRUCIAL: Tells GAS which tab to use
        awb: document.getElementById('awb').value,
        branchId: "HQ-01", 
        senderName: document.getElementById('senderName').value,
        senderPhone: document.getElementById('senderPhone').value,
        receiverName: document.getElementById('receiverName').value,
        receiverPhone: document.getElementById('receiverPhone').value,
        pincode: document.getElementById('pincode').value,
        weight: document.getElementById('weight').value
    };

    try {
        const response = await fetch(scriptURL, {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        
        const result = await response.json();
        
        if(result.result === 'success') {
            alert('Success! Domestic Booking securely saved to the database.');
            formDom.reset(); 
        } else {
            alert('Error from server: ' + result.error);
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        alert('Transmission failed. Check your internet connection.');
    } finally {
        btnTextDom.innerText = "Transmit to Database";
        loadingIconDom.classList.add('hidden');
        submitBtnDom.disabled = false;
        submitBtnDom.classList.remove('opacity-50', 'cursor-not-allowed');
    }
});

// ==========================================
// INTERNATIONAL BOOKING MODULE (DYNAMIC ENGINE)
// ==========================================
const boxContainer = document.getElementById('boxContainer');
const addBoxBtn = document.getElementById('addBoxBtn');
let boxCount = 0;
const MAX_BOXES = 10;

// Add a new box row
function addBox() {
    if (boxCount >= MAX_BOXES) return alert("Maximum 10 boxes allowed per AWB.");
    boxCount++;
    
    const row = document.createElement('div');
    row.className = 'grid grid-cols-6 gap-2 animate-fade-in';
    row.innerHTML = `
        <div class="flex items-center justify-center text-slate-400 font-mono text-sm bg-slate-900 rounded border border-slate-700">Box ${boxCount}</div>
        <input type="number" step="0.01" id="b${boxCount}W" placeholder="0.0" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-center text-white focus:outline-none focus:border-purple-500" oninput="calculateTotals()">
        <input type="number" step="0.01" id="b${boxCount}L" placeholder="L" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-center text-white focus:outline-none focus:border-purple-500" oninput="calculateTotals()">
        <input type="number" step="0.01" id="b${boxCount}Wi" placeholder="W" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-center text-white focus:outline-none focus:border-purple-500" oninput="calculateTotals()">
        <input type="number" step="0.01" id="b${boxCount}H" placeholder="H" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-center text-white focus:outline-none focus:border-purple-500" oninput="calculateTotals()">
        <input type="number" step="0.01" id="b${boxCount}CW" readonly placeholder="0.0" class="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-sm text-center text-purple-300 font-bold focus:outline-none">
    `;
    boxContainer.appendChild(row);
    calculateTotals();
}

// Calculate Volumetric Weights and Grand Totals
function calculateTotals() {
    let totalActual = 0;
    let totalCW = 0;

    for (let i = 1; i <= boxCount; i++) {
        let actW = parseFloat(document.getElementById(`b${i}W`).value) || 0;
        let l = parseFloat(document.getElementById(`b${i}L`).value) || 0;
        let w = parseFloat(document.getElementById(`b${i}Wi`).value) || 0;
        let h = parseFloat(document.getElementById(`b${i}H`).value) || 0;
        
        // Volumetric Weight Formula
        let volW = (l * w * h) / 5000; 
        
        // Chargeable weight is highest of Actual vs Volumetric
        let cw = Math.max(actW, volW);
        document.getElementById(`b${i}CW`).value = cw > 0 ? cw.toFixed(2) : "";

        totalActual += actW;
        totalCW += cw;
    }

    document.getElementById('lblTotalBoxes').innerText = boxCount;
    document.getElementById('lblTotalActual').innerText = totalActual.toFixed(2);
    document.getElementById('lblTotalCW').innerText = totalCW.toFixed(2);
    
    // Auto-calculate Grand Total
    let rate = parseFloat(document.getElementById('rate').value) || 0;
    let pack = parseFloat(document.getElementById('packingCharges').value) || 0;
    let add = parseFloat(document.getElementById('additionalCharges').value) || 0;
    
    if(rate > 0) {
        document.getElementById('grandTotal').value = ((totalCW * rate) + pack + add).toFixed(2);
    } else {
        document.getElementById('grandTotal').value = "";
    }
}

// Attach listeners for financial inputs
['rate', 'packingCharges', 'additionalCharges'].forEach(id => {
    document.getElementById(id).addEventListener('input', calculateTotals);
});

// Init first box
addBox();
addBoxBtn.addEventListener('click', addBox);

// Handle International Submit
document.getElementById('internationalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btnTextInt = document.getElementById('btnTextInt');
    const loadingIconInt = document.getElementById('loadingIconInt');
    const submitIntBtn = document.getElementById('submitIntBtn');
    
    btnTextInt.innerText = "Transmitting...";
    loadingIconInt.classList.remove('hidden');
    submitIntBtn.disabled = true;
    submitIntBtn.classList.add('opacity-50', 'cursor-not-allowed');

    // Helper functions for data extraction
    const getVal = (id) => document.getElementById(id) ? document.getElementById(id).value : "";
    const getDim = (i) => {
        let l = getVal(`b${i}L`), w = getVal(`b${i}Wi`), h = getVal(`b${i}H`);
        return (l && w && h) ? `${l}x${w}x${h}` : "";
    };

    const payload = {
        formType: "international",
        shipperName: getVal('shipperName'),
        contactNumber: getVal('contactNumber'),
        altNumber: getVal('altNumber'),
        shipperAddress: getVal('shipperAddress'),
        originCountry: getVal('originCountry'),
        postalCode: getVal('postalCode'),
        shipperState: "", 
        receiverName: getVal('receiverNameInt'),
        receiverPhone: getVal('receiverPhoneInt'),
        receiverAlt: getVal('receiverAltInt'),
        receiverAddress: getVal('receiverAddress'),
        destCountry: getVal('destCountry'),
        zipCode: getVal('zipCode'),
        receiverState: "", 
        city: "", 
        shipmentType: getVal('shipmentType'),
        cargoType: getVal('cargoType'),
        commodity: getVal('commodity'),
        description: getVal('description'),
        shipmentValue: getVal('shipmentValue'),
        
        totalBoxes: boxCount,
        totalWeight: getVal('lblTotalActual'),
        totalChargeableWeight: getVal('lblTotalCW'),
        
        rate: getVal('rate'),
        packingCharges: getVal('packingCharges'),
        additionalCharges: getVal('additionalCharges'),
        grandTotal: getVal('grandTotal'),
        miscCodes: "", 

        b1W: getVal('b1W'), b1D: getDim(1), b1CW: getVal('b1CW'),
        b2W: getVal('b2W'), b2D: getDim(2), b2CW: getVal('b2CW'),
        b3W: getVal('b3W'), b3D: getDim(3), b3CW: getVal('b3CW'),
        b4W: getVal('b4W'), b4D: getDim(4), b4CW: getVal('b4CW'),
        b5W: getVal('b5W'), b5D: getDim(5), b5CW: getVal('b5CW'),
        b6W: getVal('b6W'), b6D: getDim(6), b6CW: getVal('b6CW'),
        b7W: getVal('b7W'), b7D: getDim(7), b7CW: getVal('b7CW'),
        b8W: getVal('b8W'), b8D: getDim(8), b8CW: getVal('b8CW'),
        b9W: getVal('b9W'), b9D: getDim(9), b9CW: getVal('b9CW'),
        b10W: getVal('b10W'), b10D: getDim(10), b10CW: getVal('b10CW'),
    };

    try {
        const response = await fetch(scriptURL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        
        const result = await response.json();
        
        if(result.result === 'success') {
            alert(`Success! Order ID Generated: ${result.orderId}`);
            document.getElementById('internationalForm').reset();
            boxContainer.innerHTML = '';
            boxCount = 0;
            addBox(); // Reset to 1 box
            calculateTotals(); // Reset totals
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error(error);
        alert('Transmission failed.');
    } finally {
        btnTextInt.innerText = "Transmit International Booking";
        loadingIconInt.classList.add('hidden');
        submitIntBtn.disabled = false;
        submitIntBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
});