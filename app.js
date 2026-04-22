// ==========================================
// CONFIGURATION
// ==========================================
const scriptURL = 'https://script.google.com/macros/s/AKfycbweIJLcyZTR619HQgD3IJvHI2Dn-3EnT7WEo3g0pKeCsPdPZCeSnhyonP_1QQjd5pQw/exec';

// ==========================================
// DOMESTIC BOOKING MODULE
// ==========================================
const formDom = document.getElementById('bookingForm');
if (formDom) {
    const submitBtnDom = document.getElementById('submitBtn');
    const btnTextDom = document.getElementById('btnText');
    const loadingIconDom = document.getElementById('loadingIcon');

    formDom.addEventListener('submit', async (e) => {
        e.preventDefault();
        btnTextDom.innerText = "Transmitting..."; loadingIconDom.classList.remove('hidden');
        submitBtnDom.disabled = true; submitBtnDom.classList.add('opacity-50', 'cursor-not-allowed');

        const formData = {
            formType: "domestic",
            awb: document.getElementById('awb').value,
            branchId: "HQ-01", senderName: document.getElementById('senderName').value,
            senderPhone: document.getElementById('senderPhone').value, receiverName: document.getElementById('receiverName').value,
            receiverPhone: document.getElementById('receiverPhone').value, pincode: document.getElementById('pincode').value,
            weight: document.getElementById('weight').value
        };

        try {
            const response = await fetch(scriptURL, { method: 'POST', body: JSON.stringify(formData), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
            const result = await response.json();
            if(result.result === 'success') { alert('Success! Domestic Booking saved.'); formDom.reset(); } 
            else alert('Error: ' + result.error);
        } catch (error) { alert('Transmission failed.'); } 
        finally {
            btnTextDom.innerText = "Transmit to Database"; loadingIconDom.classList.add('hidden');
            submitBtnDom.disabled = false; submitBtnDom.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
}

// ==========================================
// INTERNATIONAL BOOKING MODULE 
// ==========================================
const intForm = document.getElementById('internationalForm');
if (intForm) {
    const boxContainer = document.getElementById('boxContainer');
    const addBoxBtn = document.getElementById('addBoxBtn');
    let boxCount = 0; const MAX_BOXES = 10;

    window.addBox = function() {
        if (boxCount >= MAX_BOXES) return alert("Max 10 boxes.");
        boxCount++;
        const row = document.createElement('div'); row.className = 'grid grid-cols-6 gap-2 animate-fade-in';
        row.innerHTML = `
            <div class="flex items-center justify-center text-slate-400 font-mono text-sm bg-slate-900 rounded border border-slate-700">Box ${boxCount}</div>
            <input type="number" step="0.01" id="b${boxCount}W" placeholder="0.0" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-center text-white focus:outline-none focus:border-purple-500" oninput="calculateTotals()">
            <input type="number" step="0.01" id="b${boxCount}L" placeholder="L" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-center text-white focus:outline-none focus:border-purple-500" oninput="calculateTotals()">
            <input type="number" step="0.01" id="b${boxCount}Wi" placeholder="W" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-center text-white focus:outline-none focus:border-purple-500" oninput="calculateTotals()">
            <input type="number" step="0.01" id="b${boxCount}H" placeholder="H" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-center text-white focus:outline-none focus:border-purple-500" oninput="calculateTotals()">
            <input type="number" step="0.01" id="b${boxCount}CW" readonly placeholder="0.0" class="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-sm text-center text-purple-300 font-bold focus:outline-none">
        `;
        boxContainer.appendChild(row); window.calculateTotals();
    }

    window.calculateTotals = function() {
        let totalActual = 0; let totalCW = 0;
        for (let i = 1; i <= boxCount; i++) {
            let actW = parseFloat(document.getElementById(`b${i}W`).value) || 0;
            let l = parseFloat(document.getElementById(`b${i}L`).value) || 0;
            let w = parseFloat(document.getElementById(`b${i}Wi`).value) || 0;
            let h = parseFloat(document.getElementById(`b${i}H`).value) || 0;
            let cw = Math.max(actW, (l * w * h) / 5000);
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
        if(document.getElementById(id)) document.getElementById(id).addEventListener('input', window.calculateTotals);
    });

    addBox(); addBoxBtn.addEventListener('click', addBox);

    intForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnTextInt = document.getElementById('btnTextInt'); const loadingIconInt = document.getElementById('loadingIconInt');
        const submitIntBtn = document.getElementById('submitIntBtn');
        btnTextInt.innerText = "Transmitting..."; loadingIconInt.classList.remove('hidden');
        submitIntBtn.disabled = true; submitIntBtn.classList.add('opacity-50', 'cursor-not-allowed');

        const getVal = (id) => document.getElementById(id) ? document.getElementById(id).value : "";
        const getDim = (i) => { let l = getVal(`b${i}L`), w = getVal(`b${i}Wi`), h = getVal(`b${i}H`); return (l && w && h) ? `${l}x${w}x${h}` : ""; };

        const payload = {
            formType: "international", shipperName: getVal('shipperName'), contactNumber: getVal('contactNumber'), altNumber: getVal('altNumber'), shipperAddress: getVal('shipperAddress'), originCountry: getVal('originCountry'), postalCode: getVal('postalCode'), receiverName: getVal('receiverNameInt'), receiverPhone: getVal('receiverPhoneInt'), receiverAlt: getVal('receiverAltInt'), receiverAddress: getVal('receiverAddress'), destCountry: getVal('destCountry'), zipCode: getVal('zipCode'), shipmentType: getVal('shipmentType'), cargoType: getVal('cargoType'), commodity: getVal('commodity'), description: getVal('description'), shipmentValue: getVal('shipmentValue'), totalBoxes: boxCount, totalWeight: getVal('lblTotalActual'), totalChargeableWeight: getVal('lblTotalCW'), rate: getVal('rate'), packingCharges: getVal('packingCharges'), additionalCharges: getVal('additionalCharges'), grandTotal: getVal('grandTotal'),
            b1W: getVal('b1W'), b1D: getDim(1), b1CW: getVal('b1CW'), b2W: getVal('b2W'), b2D: getDim(2), b2CW: getVal('b2CW'), b3W: getVal('b3W'), b3D: getDim(3), b3CW: getVal('b3CW'), b4W: getVal('b4W'), b4D: getDim(4), b4CW: getVal('b4CW'), b5W: getVal('b5W'), b5D: getDim(5), b5CW: getVal('b5CW'), b6W: getVal('b6W'), b6D: getDim(6), b6CW: getVal('b6CW'), b7W: getVal('b7W'), b7D: getDim(7), b7CW: getVal('b7CW'), b8W: getVal('b8W'), b8D: getDim(8), b8CW: getVal('b8CW'), b9W: getVal('b9W'), b9D: getDim(9), b9CW: getVal('b9CW'), b10W: getVal('b10W'), b10D: getDim(10), b10CW: getVal('b10CW'),
        };

        try {
            const response = await fetch(scriptURL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
            const result = await response.json();
            if(result.result === 'success') { alert(`Success! Order ID: ${result.orderId}`); intForm.reset(); boxContainer.innerHTML = ''; boxCount = 0; addBox(); window.calculateTotals(); } 
            else alert('Error: ' + result.error);
        } catch (error) { alert('Transmission failed.'); } 
        finally {
            btnTextInt.innerText = "Transmit International Booking"; loadingIconInt.classList.add('hidden');
            submitIntBtn.disabled = false; submitIntBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
}

// ==========================================
// PROCESSING MODULE (MANAGE BOOKINGS)
// ==========================================
const tableBody = document.getElementById('bookingsTableBody');
if (tableBody) {
    const refreshBtn = document.getElementById('refreshTableBtn');
    window.fetchDomesticBookings = async function() {
        tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-slate-400 animate-pulse">Fetching live data from Google Sheets...</td></tr>';
        try {
            const response = await fetch(`${scriptURL}?action=getDomestic`);
            const result = await response.json();
            if (result.result === 'success') {
                const data = result.data; tableBody.innerHTML = ''; 
                if (data.length <= 1) { tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-slate-500">No bookings found.</td></tr>'; return; }
                for (let i = data.length - 1; i > 0; i--) {
                    let row = data[i]; let dateStr = new Date(row[0]).toLocaleDateString() || row[0];
                    
                    // Dynamic color coding for status
                    let statusColor = 'text-slate-400 bg-slate-400/10';
                    if(row[9] === 'Pending') statusColor = 'text-yellow-400 bg-yellow-400/10';
                    if(row[9] === 'In Transit' || row[9] === 'Dispatched to Hub') statusColor = 'text-blue-400 bg-blue-400/10';
                    if(row[9] === 'Out for Delivery') statusColor = 'text-purple-400 bg-purple-400/10';
                    if(row[9] === 'Delivered') statusColor = 'text-green-400 bg-green-400/10';

                    let tr = document.createElement('tr'); tr.className = 'hover:bg-slate-800 transition cursor-pointer';
                    tr.innerHTML = `<td class="p-4 border-b border-slate-800 whitespace-nowrap">${dateStr}</td><td class="p-4 border-b border-slate-800 font-mono text-blue-400">${row[1]}</td><td class="p-4 border-b border-slate-800">${row[3]}</td><td class="p-4 border-b border-slate-800">${row[5]}</td><td class="p-4 border-b border-slate-800">${row[7]}</td><td class="p-4 border-b border-slate-800"><span class="px-2 py-1 rounded text-xs font-semibold ${statusColor}">${row[9]}</span></td>`;
                    tableBody.appendChild(tr);
                }
            } else tableBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-red-400">Error: ${result.message}</td></tr>`;
        } catch (error) { tableBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-red-400">Failed to fetch data.</td></tr>`; }
    }
    refreshBtn.addEventListener('click', window.fetchDomesticBookings); window.fetchDomesticBookings(); 
}

// ==========================================
// PROCESS UPDATE MODULE (CHANGE STATUS)
// ==========================================
const updateForm = document.getElementById('updateStatusForm');
if (updateForm) {
    const updateBtn = document.getElementById('updateBtn');
    const updateBtnText = document.getElementById('updateBtnText');
    const updateLoadingIcon = document.getElementById('updateLoadingIcon');

    updateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        updateBtnText.innerText = "Updating..."; updateLoadingIcon.classList.remove('hidden');
        updateBtn.disabled = true; updateBtn.classList.add('opacity-50', 'cursor-not-allowed');

        const payload = {
            formType: "updateStatus",
            awb: document.getElementById('scanAwb').value,
            status: document.getElementById('newStatus').value
        };

        try {
            const response = await fetch(scriptURL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
            const result = await response.json();
            
            if(result.result === 'success') {
                alert(result.message);
                updateForm.reset();
                document.getElementById('scanAwb').focus(); // Put cursor back in scanner for next package
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            alert('Transmission failed. Check internet connection.');
        } finally {
            updateBtnText.innerText = "Update Database"; updateLoadingIcon.classList.add('hidden');
            updateBtn.disabled = false; updateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
}