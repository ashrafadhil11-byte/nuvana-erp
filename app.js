// ==========================================
// CONFIGURATION
// ==========================================
const scriptURL = 'https://script.google.com/macros/s/AKfycbweIJLcyZTR619HQgD3IJvHI2Dn-3EnT7WEo3g0pKeCsPdPZCeSnhyonP_1QQjd5pQw/exec';

// ==========================================
// VIEW SWITCHING LOGIC
// ==========================================
const domView = document.getElementById('domesticView');
const intView = document.getElementById('internationalView');
const procView = document.getElementById('processingView');
const headerTitle = document.getElementById('headerTitle');

function hideAllViews() {
    domView.classList.add('hidden');
    intView.classList.add('hidden');
    procView.classList.add('hidden');
}

document.getElementById('nav-domestic').addEventListener('click', () => {
    hideAllViews();
    domView.classList.remove('hidden');
    headerTitle.innerText = "Domestic Booking";
});

document.getElementById('nav-international').addEventListener('click', () => {
    hideAllViews();
    intView.classList.remove('hidden');
    headerTitle.innerText = "International Booking";
});

document.getElementById('nav-processing').addEventListener('click', () => {
    hideAllViews();
    procView.classList.remove('hidden');
    headerTitle.innerText = "Manage Bookings";
    // Auto-fetch data when opening the view
    fetchDomesticBookings(); 
});

// Show Domestic by default on load
domView.classList.remove('hidden');

// ==========================================
// FETCH & DISPLAY DATA (PROCESSING MODULE)
// ==========================================
const tableBody = document.getElementById('bookingsTableBody');
const refreshBtn = document.getElementById('refreshTableBtn');

async function fetchDomesticBookings() {
    tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-slate-400 animate-pulse">Fetching live data from Google Sheets...</td></tr>';
    
    try {
        // We append ?action=getDomestic to tell the GET function what we want
        const response = await fetch(`${scriptURL}?action=getDomestic`);
        const result = await response.json();
        
        if (result.result === 'success') {
            const data = result.data;
            tableBody.innerHTML = ''; // Clear table
            
            // Start loop at 1 to skip the header row in Google Sheets
            if (data.length <= 1) {
                tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-slate-500">No bookings found in database.</td></tr>';
                return;
            }

            // Loop backwards to show newest bookings at the top
            for (let i = data.length - 1; i > 0; i--) {
                let row = data[i];
                // Map columns based on our Sheet structure: 
                // [0]Timestamp, [1]AWB, [2]Branch, [3]SenderName, [4]SenderPhone, [5]RecName, [6]RecPhone, [7]Pin, [8]Weight, [9]Status
                
                // Format the timestamp cleanly
                let dateStr = new Date(row[0]).toLocaleDateString() || row[0];
                let statusColor = row[9] === 'Pending' ? 'text-yellow-400 bg-yellow-400/10' : 'text-teal-400 bg-teal-400/10';

                let tr = document.createElement('tr');
                tr.className = 'hover:bg-slate-800 transition cursor-pointer';
                tr.innerHTML = `
                    <td class="p-4 border-b border-slate-800 whitespace-nowrap">${dateStr}</td>
                    <td class="p-4 border-b border-slate-800 font-mono text-blue-400">${row[1]}</td>
                    <td class="p-4 border-b border-slate-800">${row[3]}</td>
                    <td class="p-4 border-b border-slate-800">${row[5]}</td>
                    <td class="p-4 border-b border-slate-800">${row[7]}</td>
                    <td class="p-4 border-b border-slate-800">
                        <span class="px-2 py-1 rounded text-xs font-semibold ${statusColor}">${row[9]}</span>
                    </td>
                `;
                tableBody.appendChild(tr);
            }
        } else {
            tableBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-red-400">Error: ${result.message}</td></tr>`;
        }
    } catch (error) {
        console.error("Fetch error:", error);
        tableBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-red-400">Failed to fetch data. Check console.</td></tr>`;
    }
}

refreshBtn.addEventListener('click', fetchDomesticBookings);

// ==========================================
// DOMESTIC BOOKING MODULE (WRITE)
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
        formType: "domestic",
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
            method: 'POST', body: JSON.stringify(formData),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        const result = await response.json();
        if(result.result === 'success') {
            alert('Success! Domestic Booking saved.');
            formDom.reset(); 
        } else alert('Error: ' + result.error);
    } catch (error) {
        alert('Transmission failed.');
    } finally {
        btnTextDom.innerText = "Transmit to Database";
        loadingIconDom.classList.add('hidden');
        submitBtnDom.disabled = false;
        submitBtnDom.classList.remove('opacity-50', 'cursor-not-allowed');
    }
});

// ==========================================
// INTERNATIONAL BOOKING MODULE (WRITE)
// ==========================================
const boxContainer = document.getElementById('boxContainer');
const addBoxBtn = document.getElementById('addBoxBtn');
let boxCount = 0; const MAX_BOXES = 10;

function addBox() {
    if (boxCount >= MAX_BOXES) return alert("Max 10 boxes.");
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
    boxContainer.appendChild(row); calculateTotals();
}

function calculateTotals() {
    let totalActual = 0; let totalCW = 0;
    for (let i = 1; i <= boxCount; i++) {
        let actW = parseFloat(document.getElementById(`b${i}W`).value) || 0;
        let l = parseFloat(document.getElementById(`b${i}L`).value) || 0;
        let w = parseFloat(document.getElementById(`b${i}Wi`).value) || 0;
        let h = parseFloat(document.getElementById(`b${i}H`).value) || 0;
        let volW = (l * w * h) / 5000; 
        let cw = Math.max(actW, volW);
        document.getElementById(`b${i}CW`).value = cw > 0 ? cw.toFixed(2) : "";
        totalActual += actW; totalCW += cw;
    }
    document.getElementById('lblTotalBoxes').innerText = boxCount;
    document.getElementById('lblTotalActual').innerText = totalActual.toFixed(2);
    document.getElementById('lblTotalCW').innerText = totalCW.toFixed(2);
    
    let rate = parseFloat(document.getElementById('rate').value) || 0;
    let pack = parseFloat(document.getElementById('packingCharges').value) || 0;
    let add = parseFloat(document.getElementById('additionalCharges').value) || 0;
    if(rate > 0) document.getElementById('grandTotal').value = ((totalCW * rate) + pack + add).toFixed(2);
    else document.getElementById('grandTotal').value = "";
}

['rate', 'packingCharges', 'additionalCharges'].forEach(id => {
    if(document.getElementById(id)) document.getElementById(id).addEventListener('input', calculateTotals);
});

addBox();
addBoxBtn.addEventListener('click', addBox);

document.getElementById('internationalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnTextInt = document.getElementById('btnTextInt');
    const loadingIconInt = document.getElementById('loadingIconInt');
    const submitIntBtn = document.getElementById('submitIntBtn');
    
    btnTextInt.innerText = "Transmitting..."; loadingIconInt.classList.remove('hidden');
    submitIntBtn.disabled = true; submitIntBtn.classList.add('opacity-50', 'cursor-not-allowed');

    const getVal = (id) => document.getElementById(id) ? document.getElementById(id).value : "";
    const getDim = (i) => {
        let l = getVal(`b${i}L`), w = getVal(`b${i}Wi`), h = getVal(`b${i}H`);
        return (l && w && h) ? `${l}x${w}x${h}` : "";
    };

    const payload = {
        formType: "international",
        shipperName: getVal('shipperName'), contactNumber: getVal('contactNumber'),
        altNumber: getVal('altNumber'), shipperAddress: getVal('shipperAddress'),
        originCountry: getVal('originCountry'), postalCode: getVal('postalCode'),
        receiverName: getVal('receiverNameInt'), receiverPhone: getVal('receiverPhoneInt'),
        receiverAlt: getVal('receiverAltInt'), receiverAddress: getVal('receiverAddress'),
        destCountry: getVal('destCountry'), zipCode: getVal('zipCode'),
        shipmentType: getVal('shipmentType'), cargoType: getVal('cargoType'),
        commodity: getVal('commodity'), description: getVal('description'), shipmentValue: getVal('shipmentValue'),
        totalBoxes: boxCount, totalWeight: getVal('lblTotalActual'), totalChargeableWeight: getVal('lblTotalCW'),
        rate: getVal('rate'), packingCharges: getVal('packingCharges'), additionalCharges: getVal('additionalCharges'),
        grandTotal: getVal('grandTotal'),
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
        const response = await fetch(scriptURL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
        const result = await response.json();
        if(result.result === 'success') {
            alert(`Success! Order ID Generated: ${result.orderId}`);
            document.getElementById('internationalForm').reset();
            boxContainer.innerHTML = ''; boxCount = 0; addBox(); calculateTotals();
        } else alert('Error: ' + result.error);
    } catch (error) {
        alert('Transmission failed.');
    } finally {
        btnTextInt.innerText = "Transmit International Booking"; loadingIconInt.classList.add('hidden');
        submitIntBtn.disabled = false; submitIntBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
});