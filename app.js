// ==========================================
// CONFIGURATION
// ==========================================
const scriptURL = 'https://script.google.com/macros/s/AKfycbweIJLcyZTR619HQgD3IJvHI2Dn-3EnT7WEo3g0pKeCsPdPZCeSnhyonP_1QQjd5pQw/exec';

// ==========================================
// 1. SECURITY & AUTHENTICATION CHECK
// ==========================================
const isLoginPage = window.location.href.includes('login.html');
const rawUser = sessionStorage.getItem('erp_user');

if (!rawUser && !isLoginPage) window.location.replace('login.html');

let activeUser = null;

if (rawUser && !isLoginPage) {
    activeUser = JSON.parse(rawUser);
    
    // Restrict access for non-admins
    if (activeUser.role !== 'Admin') {
        const restrictedLinks = ['accounts.html', 'reports.html', 'customers.html'];
        const links = document.querySelectorAll('nav a');
        links.forEach(link => {
            restrictedLinks.forEach(restricted => { if (link.href.includes(restricted)) link.style.display = 'none'; });
        });
    }
}

// ==========================================
// 2. LOGIN PROCESSOR
// ==========================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    const loginBtn = document.getElementById('loginBtn'); const loginBtnText = document.getElementById('loginBtnText'); const loginLoadingIcon = document.getElementById('loginLoadingIcon');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginBtnText.innerText = "Authenticating..."; loginLoadingIcon.classList.remove('hidden'); loginBtn.disabled = true; loginBtn.classList.add('opacity-50');
        const payload = { formType: "login", username: document.getElementById('loginUser').value, password: document.getElementById('loginPass').value };
        try {
            const response = await fetch(scriptURL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
            const result = await response.json();
            if(result.result === 'success') {
                sessionStorage.setItem('erp_user', JSON.stringify({ 
                    userId: result.userId,
                    username: result.username, 
                    name: result.name, 
                    role: result.role, 
                    branchId: result.branchId,
                    branchName: result.branchName,
                    phone: result.phone || '',
                    email: result.email || '',
                    dob: result.dob || ''
                }));
                window.location.replace('index.html'); 
            } else { alert(result.error); loginForm.reset(); }
        } catch (error) { alert('Connection failed.'); } finally {
            loginBtnText.innerText = "Secure Login"; loginLoadingIcon.classList.add('hidden'); loginBtn.disabled = false; loginBtn.classList.remove('opacity-50');
        }
    });
}

// ==========================================
// 3. DOMESTIC BOOKING MODULE
// ==========================================
const formDom = document.getElementById('bookingForm');
if (formDom) {
    const submitBtnDom = document.getElementById('submitBtn'); const btnTextDom = document.getElementById('btnText'); const loadingIconDom = document.getElementById('loadingIcon');
    formDom.addEventListener('submit', async (e) => {
        e.preventDefault();
        btnTextDom.innerText = "Transmitting..."; loadingIconDom.classList.remove('hidden'); submitBtnDom.disabled = true; submitBtnDom.classList.add('opacity-50');
        const formData = { formType: "domestic", awb: document.getElementById('awb').value, branchId: activeUser.branchId, senderName: document.getElementById('senderName').value, senderPhone: document.getElementById('senderPhone').value, receiverName: document.getElementById('receiverName').value, receiverPhone: document.getElementById('receiverPhone').value, pincode: document.getElementById('pincode').value, weight: document.getElementById('weight').value };
        try {
            const response = await fetch(scriptURL, { method: 'POST', body: JSON.stringify(formData), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
            const result = await response.json();
            if(result.result === 'success') { alert('Success! Domestic Booking saved.'); formDom.reset(); } else alert('Error: ' + result.error);
        } catch (error) { alert('Transmission failed.'); } finally {
            btnTextDom.innerText = "Transmit to Database"; loadingIconDom.classList.add('hidden'); submitBtnDom.disabled = false; submitBtnDom.classList.remove('opacity-50');
        }
    });
}

// ==========================================
// 4. INTERNATIONAL BOOKING MODULE 
// ==========================================
const intForm = document.getElementById('internationalForm');
if (intForm) {
    const boxContainer = document.getElementById('boxContainer'); 
    const addBoxBtn = document.getElementById('addBoxBtn'); 
    let boxCount = 0; 
    const MAX_BOXES = 10;
    
    window.addBox = function() {
        if (boxCount >= MAX_BOXES) return alert("Max 10 boxes."); 
        boxCount++; 
        const row = document.createElement('div'); 
        row.className = 'grid grid-cols-6 gap-2 animate-fade-in mb-2';
        
        row.innerHTML = `<div class="flex items-center justify-center text-teal/70 dark:text-beige/60 font-mono text-sm bg-slate-50 dark:bg-charcoal/50 rounded-lg border border-teal/10 dark:border-white/10">Box ${boxCount}</div>
        <input type="number" step="0.01" id="b${boxCount}W" placeholder="0.0" class="w-full bg-white dark:bg-charcoal/50 border border-teal/10 dark:border-white/10 rounded-lg p-2 text-sm text-center text-charcoal dark:text-white focus:outline-none focus:border-orange transition" oninput="window.calculateTotals()">
        <input type="number" step="0.01" id="b${boxCount}L" placeholder="L" class="w-full bg-white dark:bg-charcoal/50 border border-teal/10 dark:border-white/10 rounded-lg p-2 text-sm text-center text-charcoal dark:text-white focus:outline-none focus:border-orange transition" oninput="window.calculateTotals()">
        <input type="number" step="0.01" id="b${boxCount}Wi" placeholder="W" class="w-full bg-white dark:bg-charcoal/50 border border-teal/10 dark:border-white/10 rounded-lg p-2 text-sm text-center text-charcoal dark:text-white focus:outline-none focus:border-orange transition" oninput="window.calculateTotals()">
        <input type="number" step="0.01" id="b${boxCount}H" placeholder="H" class="w-full bg-white dark:bg-charcoal/50 border border-teal/10 dark:border-white/10 rounded-lg p-2 text-sm text-center text-charcoal dark:text-white focus:outline-none focus:border-orange transition" oninput="window.calculateTotals()">
        <input type="number" step="0.01" id="b${boxCount}CW" readonly placeholder="0.0" class="w-full bg-orange/5 border border-orange/20 rounded-lg p-2 text-sm text-center text-orange font-bold focus:outline-none">`;
        
        boxContainer.appendChild(row); 
        window.calculateTotals();
    };

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
        
        if(document.getElementById('lblTotalBoxes')) document.getElementById('lblTotalBoxes').innerText = boxCount; 
        if(document.getElementById('lblTotalActual')) document.getElementById('lblTotalActual').innerText = totalActual.toFixed(2); 
        if(document.getElementById('lblTotalCW')) document.getElementById('lblTotalCW').innerText = totalCW.toFixed(2);
        
        let rate = parseFloat(document.getElementById('rate') ? document.getElementById('rate').value : 0) || 0; 
        let pack = parseFloat(document.getElementById('packingCharges') ? document.getElementById('packingCharges').value : 0) || 0; 
        let add = parseFloat(document.getElementById('additionalCharges') ? document.getElementById('additionalCharges').value : 0) || 0;
        
        if(document.getElementById('grandTotal')) {
            if(rate > 0) document.getElementById('grandTotal').value = ((totalCW * rate) + pack + add).toFixed(2); 
            else document.getElementById('grandTotal').value = "";
        }
    };

    ['rate', 'packingCharges', 'additionalCharges'].forEach(id => { 
        if(document.getElementById(id)) {
            document.getElementById(id).addEventListener('input', window.calculateTotals); 
        }
    });

    addBox(); 
    if(addBoxBtn) addBoxBtn.addEventListener('click', addBox);
    
    intForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const btnTextInt = document.getElementById('btnTextInt'); 
        const loadingIconInt = document.getElementById('loadingIconInt'); 
        const submitIntBtn = document.getElementById('submitIntBtn');
        
        btnTextInt.innerText = "Transmitting..."; 
        if(loadingIconInt) loadingIconInt.classList.remove('hidden'); 
        submitIntBtn.disabled = true; submitIntBtn.classList.add('opacity-50');
        
        const getVal = (id) => document.getElementById(id) ? document.getElementById(id).value : "";
        const getDim = (i) => { let l = getVal(`b${i}L`), w = getVal(`b${i}Wi`), h = getVal(`b${i}H`); return (l && w && h) ? `${l}x${w}x${h}` : ""; };
        
        const payload = { 
            formType: "international", branchId: activeUser.branchId, shipperName: getVal('shipperName'), contactNumber: getVal('contactNumber'), altNumber: getVal('altNumber'), shipperAddress: getVal('shipperAddress'), originCountry: getVal('originCountry'), postalCode: getVal('postalCode'), receiverName: getVal('receiverNameInt'), receiverPhone: getVal('receiverPhoneInt'), receiverAlt: getVal('receiverAltInt'), receiverAddress: getVal('receiverAddress'), destCountry: getVal('destCountry'), zipCode: getVal('zipCode'), shipmentType: getVal('shipmentType'), cargoType: getVal('cargoType'), commodity: getVal('commodity'), description: getVal('description'), shipmentValue: getVal('shipmentValue'), totalBoxes: boxCount, totalWeight: getVal('lblTotalActual'), totalChargeableWeight: getVal('lblTotalCW'), rate: getVal('rate'), packingCharges: getVal('packingCharges'), additionalCharges: getVal('additionalCharges'), grandTotal: getVal('grandTotal'), b1W: getVal('b1W'), b1D: getDim(1), b1CW: getVal('b1CW'), b2W: getVal('b2W'), b2D: getDim(2), b2CW: getVal('b2CW'), b3W: getVal('b3W'), b3D: getDim(3), b3CW: getVal('b3CW'), b4W: getVal('b4W'), b4D: getDim(4), b4CW: getVal('b4CW'), b5W: getVal('b5W'), b5D: getDim(5), b5CW: getVal('b5CW'), b6W: getVal('b6W'), b6D: getDim(6), b6CW: getVal('b6CW'), b7W: getVal('b7W'), b7D: getDim(7), b7CW: getVal('b7CW'), b8W: getVal('b8W'), b8D: getDim(8), b8CW: getVal('b8CW'), b9W: getVal('b9W'), b9D: getDim(9), b9CW: getVal('b9CW'), b10W: getVal('b10W'), b10D: getDim(10), b10CW: getVal('b10CW') 
        };
        
        try {
            const response = await fetch(scriptURL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
            const result = await response.json();
            if(result.result === 'success') { 
                alert(`Success! AWB Generated: ${result.masterAWB}`); 
                intForm.reset(); boxContainer.innerHTML = ''; boxCount = 0; addBox(); window.calculateTotals(); 
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) { 
            alert('Transmission failed.'); 
        } finally {
            btnTextInt.innerText = "Transmit International Booking"; 
            if(loadingIconInt) loadingIconInt.classList.add('hidden'); 
            submitIntBtn.disabled = false; submitIntBtn.classList.remove('opacity-50');
        }
    });
}

// ==========================================
// 5. PROCESSING MODULE (SAFETY CHECKED)
// ==========================================
// FIX: We strictly check for tableHeaderRow to avoid crashing on the new layout
const tableBody = document.getElementById('bookingsTableBody');
const tableHeaderRow = document.getElementById('tableHeaderRow');

if (tableBody && tableHeaderRow) {
    const refreshBtn = document.getElementById('refreshTableBtn');
    const toggleDomBtn = document.getElementById('toggleDomBtn');
    const toggleIntBtn = document.getElementById('toggleIntBtn');
    
    let currentView = 'domestic';

    if(toggleDomBtn && toggleIntBtn) {
        toggleDomBtn.addEventListener('click', () => {
            currentView = 'domestic';
            toggleDomBtn.className = 'px-4 py-1.5 rounded text-sm font-semibold bg-teal text-white transition shadow';
            toggleIntBtn.className = 'px-4 py-1.5 rounded text-sm font-semibold text-slate-400 hover:text-white transition';
            window.fetchBookings();
        });

        toggleIntBtn.addEventListener('click', () => {
            currentView = 'international';
            toggleIntBtn.className = 'px-4 py-1.5 rounded text-sm font-semibold bg-orange text-white transition shadow';
            toggleDomBtn.className = 'px-4 py-1.5 rounded text-sm font-semibold text-slate-400 hover:text-white transition';
            window.fetchBookings();
        });
    }

    window.fetchBookings = async function() {
        tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-slate-400 animate-pulse">Fetching live data...</td></tr>';
        
        if (currentView === 'domestic') {
            tableHeaderRow.innerHTML = `<tr><th class="p-4 border-b border-slate-700">Date</th><th class="p-4 border-b border-slate-700">AWB</th><th class="p-4 border-b border-slate-700">Sender</th><th class="p-4 border-b border-slate-700">Receiver</th><th class="p-4 border-b border-slate-700">Dest. Pin</th><th class="p-4 border-b border-slate-700">Status</th></tr>`;
        } else {
            tableHeaderRow.innerHTML = `<tr><th class="p-4 border-b border-slate-700">Date</th><th class="p-4 border-b border-slate-700">Order ID</th><th class="p-4 border-b border-slate-700">Shipper</th><th class="p-4 border-b border-slate-700">Receiver</th><th class="p-4 border-b border-slate-700">Destination</th><th class="p-4 border-b border-slate-700">Status</th></tr>`;
        }

        try {
            const endpoint = currentView === 'domestic' ? 'getDomestic' : 'getInternational';
            const response = await fetch(`${scriptURL}?action=${endpoint}`); 
            const result = await response.json();
            
            if (result.result === 'success') {
                const data = result.data; tableBody.innerHTML = ''; 
                if (data.length <= 1) { tableBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-500">No ${currentView} bookings found.</td></tr>`; return; }
                
                for (let i = data.length - 1; i > 0; i--) {
                    let row = data[i]; 
                    let dateStr, trackingId, sender, receiver, dest, status;

                    if (currentView === 'domestic') {
                        dateStr = new Date(row[0]).toLocaleDateString() || row[0]; trackingId = row[1]; sender = row[3]; receiver = row[5]; dest = row[7]; status = row[9];
                    } else {
                        trackingId = row[0]; dateStr = new Date(row[1]).toLocaleDateString() || row[1]; sender = row[2]; receiver = row[9]; dest = row[14]; status = row[61];
                    }

                    let statusColor = 'text-slate-400 bg-slate-400/10';
                    if(status === 'Pending') statusColor = 'text-yellow-400 bg-yellow-400/10';
                    if(status === 'In Transit' || status === 'Dispatched to Hub') statusColor = 'text-blue-400 bg-blue-400/10';
                    if(status === 'Out for Delivery') statusColor = 'text-purple-400 bg-purple-400/10';
                    if(status === 'Delivered') statusColor = 'text-green-400 bg-green-400/10';
                    
                    let tr = document.createElement('tr'); tr.className = 'hover:bg-slate-800 transition cursor-pointer';
                    tr.innerHTML = `<td class="p-4 border-b border-slate-800 whitespace-nowrap">${dateStr}</td><td class="p-4 border-b border-slate-800 font-mono text-blue-400">${trackingId}</td><td class="p-4 border-b border-slate-800">${sender}</td><td class="p-4 border-b border-slate-800">${receiver}</td><td class="p-4 border-b border-slate-800">${dest}</td><td class="p-4 border-b border-slate-800"><span class="px-2 py-1 rounded text-xs font-semibold ${statusColor}">${status}</span></td>`;
                    tableBody.appendChild(tr);
                }
            } else tableBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-red-400">Error: ${result.message}</td></tr>`;
        } catch (error) { tableBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-red-400">Failed to fetch data.</td></tr>`; }
    }
    if(refreshBtn) refreshBtn.addEventListener('click', window.fetchBookings); 
    window.fetchBookings(); 
}

// ==========================================
// 6. PROCESS UPDATE (CHANGE STATUS)
// ==========================================
const updateForm = document.getElementById('updateStatusForm');
if (updateForm) {
    const updateBtn = document.getElementById('updateBtn'); const updateBtnText = document.getElementById('updateBtnText'); const updateLoadingIcon = document.getElementById('updateLoadingIcon');
    updateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        updateBtnText.innerText = "Updating..."; updateLoadingIcon.classList.remove('hidden'); updateBtn.disabled = true; updateBtn.classList.add('opacity-50');
        const payload = { formType: "updateStatus", awb: document.getElementById('scanAwb').value, status: document.getElementById('newStatus').value };
        try {
            const response = await fetch(scriptURL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
            const result = await response.json();
            if(result.result === 'success') { alert(result.message); updateForm.reset(); document.getElementById('scanAwb').focus(); } else alert('Error: ' + result.error);
        } catch (error) { alert('Transmission failed.'); } finally {
            updateBtnText.innerText = "Update Database"; updateLoadingIcon.classList.add('hidden'); updateBtn.disabled = false; updateBtn.classList.remove('opacity-50');
        }
    });
}

// ==========================================
// 7. ACCOUNTS MODULE
// ==========================================
const transForm = document.getElementById('transactionForm');
if (transForm) {
    const transBtn = document.getElementById('transBtn'); const transBtnText = document.getElementById('transBtnText'); const ledgerTableBody = document.getElementById('ledgerTableBody'); const refreshLedgerBtn = document.getElementById('refreshLedgerBtn');
    transForm.addEventListener('submit', async (e) => {
        e.preventDefault(); transBtnText.innerText = "Saving..."; transBtn.disabled = true; transBtn.classList.add('opacity-50');
        const payload = { formType: "addTransaction", branchId: activeUser.branchId, type: document.getElementById('transType').value, category: document.getElementById('transCategory').value, amount: document.getElementById('transAmount').value, referenceAwb: document.getElementById('transAwb').value, description: document.getElementById('transDesc').value };
        try {
            const response = await fetch(scriptURL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
            const result = await response.json();
            if(result.result === 'success') { alert('Record saved.'); transForm.reset(); window.fetchLedger(); } else { alert('Error: ' + result.error); }
        } catch (error) { alert('Transmission failed.'); } finally { transBtnText.innerText = "Save Record"; transBtn.disabled = false; transBtn.classList.remove('opacity-50'); }
    });
    window.fetchLedger = async function() {
        ledgerTableBody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-slate-400 animate-pulse">Loading financial data...</td></tr>';
        try {
            const response = await fetch(`${scriptURL}?action=getLedger`); const result = await response.json();
            if (result.result === 'success') {
                const data = result.data; ledgerTableBody.innerHTML = ''; 
                if (data.length <= 1) { ledgerTableBody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-slate-500">No transactions recorded yet.</td></tr>'; return; }
                for (let i = data.length - 1; i > 0; i--) {
                    let row = data[i]; let dateStr = new Date(row[0]).toLocaleDateString() || row[0]; let isIncome = row[3] === 'Income'; let typeColor = isIncome ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'; let amtSign = isIncome ? '+' : '-'; let amtColor = isIncome ? 'text-emerald-400' : 'text-rose-400';
                    let tr = document.createElement('tr'); tr.className = 'hover:bg-slate-800 transition cursor-pointer border-b border-slate-800';
                    tr.innerHTML = `<td class="p-4 whitespace-nowrap">${dateStr}</td><td class="p-4"><span class="px-2 py-1 rounded text-xs font-semibold ${typeColor}">${row[3]}</span></td><td class="p-4 text-slate-300">${row[4]}</td><td class="p-4 text-right font-mono font-bold ${amtColor}">${amtSign}${parseFloat(row[5]).toFixed(2)}</td><td class="p-4 font-mono text-xs text-blue-400">${row[6] || '-'}</td>`;
                    ledgerTableBody.appendChild(tr);
                }
            } else ledgerTableBody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-red-400">Error: ${result.message}</td></tr>`;
        } catch (error) { ledgerTableBody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-red-400">Failed to fetch data.</td></tr>`; }
    }
    if(refreshLedgerBtn) refreshLedgerBtn.addEventListener('click', window.fetchLedger); 
    window.fetchLedger(); 
}

// ==========================================
// 8. CUSTOMER CRM MODULE
// ==========================================
const custForm = document.getElementById('customerForm');
if (custForm) {
    const custBtn = document.getElementById('custBtn'); const custBtnText = document.getElementById('custBtnText'); const customerTableBody = document.getElementById('customerTableBody'); const refreshCustBtn = document.getElementById('refreshCustBtn');
    custForm.addEventListener('submit', async (e) => {
        e.preventDefault(); custBtnText.innerText = "Saving..."; custBtn.disabled = true; custBtn.classList.add('opacity-50');
        const payload = { formType: "addCustomer", fullName: document.getElementById('custName').value, phone: document.getElementById('custPhone').value, email: document.getElementById('custEmail').value, address: document.getElementById('custAddress').value };
        try {
            const response = await fetch(scriptURL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
            const result = await response.json();
            if(result.result === 'success') { alert('Customer Profile Saved.'); custForm.reset(); window.fetchCustomers(); } else { alert('Error: ' + result.error); }
        } catch (error) { alert('Transmission failed.'); } finally { custBtnText.innerText = "Save Profile"; custBtn.disabled = false; custBtn.classList.remove('opacity-50'); }
    });
    window.fetchCustomers = async function() {
        customerTableBody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-slate-400 animate-pulse">Loading customer data...</td></tr>';
        try {
            const response = await fetch(`${scriptURL}?action=getCustomers`); const result = await response.json();
            if (result.result === 'success') {
                const data = result.data; customerTableBody.innerHTML = ''; 
                if (data.length <= 1) { customerTableBody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-slate-500">No customers found.</td></tr>'; return; }
                for (let i = data.length - 1; i > 0; i--) {
                    let row = data[i]; let tr = document.createElement('tr'); tr.className = 'hover:bg-slate-800 transition cursor-pointer border-b border-slate-800';
                    tr.innerHTML = `<td class="p-4 font-mono text-indigo-400">${row[1]}</td><td class="p-4 text-white font-semibold">${row[2]}</td><td class="p-4 text-slate-300">${row[3]}</td><td class="p-4 text-right pr-8"><span class="bg-indigo-900 bg-opacity-50 text-indigo-300 px-3 py-1 rounded-full font-bold text-xs border border-indigo-700 shadow-inner">${row[6]} pts</span></td>`;
                    customerTableBody.appendChild(tr);
                }
            } else customerTableBody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-red-400">Error: ${result.message}</td></tr>`;
        } catch (error) { customerTableBody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-red-400">Failed to fetch data.</td></tr>`; }
    }
    if(refreshCustBtn) refreshCustBtn.addEventListener('click', window.fetchCustomers); 
    window.fetchCustomers(); 
}

// ==========================================
// 9. REPORTS & ANALYTICS
// ==========================================
const reportsDashboard = document.getElementById('reportsDashboard');
if (reportsDashboard) {
    const generateReportsBtn = document.getElementById('generateReportsBtn'); const loadingOverlay = document.getElementById('loadingOverlay');
    let financeChartInstance = null; let logisticsChartInstance = null;
    if (typeof Chart !== 'undefined') { Chart.defaults.color = '#94a3b8'; Chart.defaults.font.family = 'Poppins'; }

    window.generateAnalytics = async function() {
        loadingOverlay.classList.remove('hidden');
        try {
            const [ledgerRes, bookingsRes] = await Promise.all([ fetch(`${scriptURL}?action=getLedger`), fetch(`${scriptURL}?action=getDomestic`) ]);
            const ledgerJson = await ledgerRes.json(); const bookingsJson = await bookingsRes.json();

            let totalIncome = 0; let totalExpense = 0;
            if (ledgerJson.result === 'success' && ledgerJson.data.length > 1) {
                const ledgerData = ledgerJson.data;
                for (let i = 1; i < ledgerData.length; i++) {
                    let type = ledgerData[i][3]; let amount = parseFloat(ledgerData[i][5]) || 0;
                    if (type === 'Income') totalIncome += amount; if (type === 'Expense') totalExpense += amount;
                }
            }
            let netProfit = totalIncome - totalExpense;
            document.getElementById('statIncome').innerText = `${totalIncome.toFixed(2)}`; document.getElementById('statExpense').innerText = `${totalExpense.toFixed(2)}`; document.getElementById('statProfit').innerText = `${netProfit.toFixed(2)}`; document.getElementById('statProfit').className = netProfit >= 0 ? "text-2xl font-bold text-emerald-400" : "text-2xl font-bold text-rose-400";

            if (document.getElementById('financeChart')) {
                const ctxFinance = document.getElementById('financeChart').getContext('2d');
                if (financeChartInstance) financeChartInstance.destroy(); 
                financeChartInstance = new Chart(ctxFinance, { type: 'doughnut', data: { labels: ['Income', 'Expenses'], datasets: [{ data: [totalIncome, totalExpense], backgroundColor: ['rgba(52, 211, 153, 0.8)', 'rgba(251, 113, 133, 0.8)'], borderColor: ['#0f172a', '#0f172a'], borderWidth: 4, hoverOffset: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } } });
            }

            let statusCounts = { 'Pending': 0, 'In Transit': 0, 'Dispatched to Hub': 0, 'Out for Delivery': 0, 'Delivered': 0 };
            let totalShipments = 0;
            if (bookingsJson.result === 'success' && bookingsJson.data.length > 1) {
                const bookingsData = bookingsJson.data; totalShipments = bookingsData.length - 1; 
                for (let i = 1; i < bookingsData.length; i++) {
                    let status = bookingsData[i][9]; 
                    if (statusCounts[status] !== undefined) statusCounts[status]++; else statusCounts[status] = 1; 
                }
            }
            document.getElementById('statShipments').innerText = totalShipments;

            if (document.getElementById('logisticsChart')) {
                const ctxLogistics = document.getElementById('logisticsChart').getContext('2d');
                if (logisticsChartInstance) logisticsChartInstance.destroy();
                
                let gradientFill = ctxLogistics.createLinearGradient(0, 0, 0, 400);
                gradientFill.addColorStop(0, '#027385');
                gradientFill.addColorStop(1, '#F99523');

                logisticsChartInstance = new Chart(ctxLogistics, { 
                    type: 'bar', 
                    data: { labels: Object.keys(statusCounts), datasets: [{ label: 'Number of Shipments', data: Object.values(statusCounts), backgroundColor: gradientFill, borderWidth: 0, borderRadius: 6 }] }, 
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(2, 115, 133, 0.1)' } }, x: { grid: { display: false } } } } 
                });
            }
        } catch (error) { console.error(error); alert("Failed to load analytics data."); } finally { loadingOverlay.classList.add('hidden'); }
    }
    if(generateReportsBtn) generateReportsBtn.addEventListener('click', window.generateAnalytics); 
    if(reportsDashboard) window.generateAnalytics(); 
}

// ==========================================
// 10. DYNAMIC MAIN DASHBOARD (index.html)
// ==========================================
const mainDashboardView = document.getElementById('mainDashboardView');
if (mainDashboardView && activeUser) {
    window.loadDashboardStats = async function() {
        try {
            const [domRes, intRes, custRes] = await Promise.all([ fetch(`${scriptURL}?action=getDomestic`), fetch(`${scriptURL}?action=getInternational`), fetch(`${scriptURL}?action=getCustomers`) ]);
            const domJson = await domRes.json(); const intJson = await intRes.json(); const custJson = await custRes.json();

            let totalDom = domJson.result === 'success' ? Math.max(0, domJson.data.length - 1) : 0;
            let totalInt = intJson.result === 'success' ? Math.max(0, intJson.data.length - 1) : 0;
            let totalCust = custJson.result === 'success' ? Math.max(0, custJson.data.length - 1) : 0;

            if(document.getElementById('dashDom')) document.getElementById('dashDom').innerText = totalDom; 
            if(document.getElementById('dashInt')) document.getElementById('dashInt').innerText = totalInt; 
            if(document.getElementById('dashCust')) document.getElementById('dashCust').innerText = totalCust;

            const liveStatusContainer = document.getElementById('liveStatusContainer');
            if (liveStatusContainer) {
                liveStatusContainer.innerHTML = ''; 
                let hasData = false;

                if (domJson.result === 'success' && domJson.data.length > 1) {
                    let row = domJson.data[domJson.data.length - 1]; 
                    let awb = row[1]; let dest = row[7]; let status = row[22] || row[9];
                    let pClass = status === 'Delivered' ? 'bg-success/10 text-success border-success/20' : 'bg-teal/10 text-teal dark:bg-teal/20 dark:text-teal border-teal/20';
                    liveStatusContainer.innerHTML += `
                        <div class="flex justify-between items-center pb-4 border-b border-teal/10 dark:border-white/5">
                            <div><p class="text-xs text-teal/70 dark:text-beige/60 font-lexend">${awb}</p><p class="text-sm font-medium text-charcoal dark:text-white mt-1">Dest: ${dest}</p></div>
                            <span class="${pClass} border px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full">${status}</span>
                        </div>`;
                    hasData = true;
                }

                if (intJson.result === 'success' && intJson.data.length > 1) {
                    let row = intJson.data[intJson.data.length - 1];
                    let orderId = row[0]; let dest = row[17] || row[14]; let status = row[34] || row[61];
                    let pClass = status === 'Delivered' ? 'bg-success/10 text-success border-success/20' : 'bg-orange/10 text-orange dark:bg-orange/20 dark:text-orange border-orange/20';
                    liveStatusContainer.innerHTML += `
                        <div class="flex justify-between items-center pb-4 border-b border-teal/10 dark:border-white/5">
                            <div><p class="text-xs text-teal/70 dark:text-beige/60 font-lexend">${orderId}</p><p class="text-sm font-medium text-charcoal dark:text-white mt-1">Dest: ${dest}</p></div>
                            <span class="${pClass} border px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full">${status}</span>
                        </div>`;
                    hasData = true;
                }

                if(!hasData) liveStatusContainer.innerHTML = '<p class="text-sm text-teal/70 dark:text-beige/60">No recent shipments found.</p>';
            }
        } catch (error) { 
            console.error(error);
            if(document.getElementById('dashDom')) document.getElementById('dashDom').innerText = "Error"; 
        }
    }
    window.loadDashboardStats();
}

// ==========================================
// 11. THEME TOGGLE (GLOBAL)
// ==========================================
const themeToggleBtnGlobal = document.getElementById('themeToggleBtn');
if (themeToggleBtnGlobal) {
    themeToggleBtnGlobal.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        if (document.documentElement.classList.contains('dark')) {
            localStorage.theme = 'dark';
        } else {
            localStorage.theme = 'light';
        }
    });
}

// ==========================================
// 12. GLOBAL SIDEBAR & PROFILE MODAL INJECTION
// ==========================================
function loadGlobalSidebar() {
    const container = document.getElementById('global-sidebar-container');
    if (!container) return; 

    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    const isActive = (p) => page === p ? 'active' : '';
    const isLogistics = ['international.html', 'domestic.html'].includes(page);
    const isProcessing = ['processing.html', 'update.html'].includes(page);

    container.innerHTML = `
    <style>
        .sidebar-nav-item {
            display: flex; align-items: center; gap: 10px;
            padding: 9px 12px; border-radius: 11px;
            cursor: pointer; transition: all .2s;
            font-size: 13px; color: rgba(239,231,220,.45);
            text-decoration: none;
        }
        .sidebar-nav-item:hover { background: rgba(255,255,255,.05); color: rgba(239,231,220,.85); }
        .sidebar-nav-item.active {
            background: rgba(249,149,35,.13);
            border-left: 3px solid #F99523;
            color: #F99523; font-weight: 600;
            padding-left: 9px;
        }
        .sidebar-section-label { font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(239,231,220,.28); padding: 6px 12px 4px; }
        .sidebar-divider { height: 1px; background: rgba(255,255,255,.06); margin: 8px 0; }
        
        .global-modal-overlay { position:fixed; inset:0; background:rgba(13,35,48,.65); backdrop-filter:blur(6px); z-index:200; display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition:opacity .25s; padding:20px; }
        .global-modal-overlay.active { opacity:1; pointer-events:all; }
        .global-modal-box { background:white; border-radius:20px; width:100%; max-width:600px; box-shadow:0 24px 60px rgba(13,35,48,.18); transform:translateY(20px) scale(.97); transition:transform .35s; overflow:hidden; }
        .global-modal-overlay.active .global-modal-box { transform:translateY(0) scale(1); }
        .global-field { width:100%; background:rgba(2,115,133,.03); border:1px solid rgba(2,115,133,.15); border-radius:10px; padding:.65rem 1rem; font-family:'Poppins',sans-serif; font-size:.8125rem; color:#0D2330; outline:none; transition:border-color .2s; }
        .global-field:focus { border-color:#F99523; box-shadow:0 0 0 3px rgba(249,149,35,.1); background:#fff; }
        .global-field-label { display:block; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:rgba(2,115,133,.6); margin-bottom:5px; }
    </style>

    <aside class="w-[220px] bg-[#0D2330] flex flex-col flex-shrink-0 z-20 h-screen">
        <div class="px-5 py-4 border-b border-white/[0.06] flex items-center">
            <img src="assets/nuvana-ex logo long.svg" alt="Nuvana.ex" class="h-10 w-auto object-contain" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
            <div style="display:none">
                <div class="font-lexend text-[15px] font-bold tracking-[.14em] text-[#EFE7DC]">NUVANA<span class="text-[#F99523]">.EX</span></div>
                <div class="text-[9px] tracking-[.1em] text-[#EFE7DC]/25 mt-0.5 uppercase">Enterprise Platform</div>
            </div>
        </div>
        <nav class="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
            <a href="index.html" class="sidebar-nav-item ${isActive('index.html')}"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.47 3.84a.75.75 0 011.06 0l8.69 7.962a.75.75 0 01-.023 1.08l-.013.01A.75.75 0 0120 13.5v5.25A2.25 2.25 0 0117.75 21h-3a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-2.5a.75.75 0 00-.75.75V20.25a.75.75 0 01-.75.75h-3A2.25 2.25 0 014 18.75V13.5a.75.75 0 01-.19-.516l-.012-.01A.75.75 0 013.82 11.8l8.69-7.962z"/></svg>Command Center</a>
            <div class="sidebar-section-label mt-3">Logistics</div>
            <div class="group">
                <div class="sidebar-nav-item justify-between ${isLogistics ? 'text-[#F99523] font-semibold' : ''}">
                    <div class="flex items-center gap-2.5"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zM12.75 12a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V18a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V12z" clip-rule="evenodd"/></svg>New Booking</div>
                    <svg class="w-3 h-3 transition-transform group-hover:rotate-180" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clip-rule="evenodd"/></svg>
                </div>
                <div class="${isLogistics ? 'flex' : 'hidden group-hover:flex'} flex-col pl-9 pr-3 pb-1 gap-0.5">
                    <a href="international.html" class="text-[12px] py-1.5 px-2 rounded-lg hover:bg-white/5 transition flex items-center gap-2 ${isActive('international.html') ? 'text-[#F99523] font-semibold bg-white/10' : 'text-[#EFE7DC]/40 hover:text-[#F99523]'}">International</a>
                    <a href="domestic.html" class="text-[12px] py-1.5 px-2 rounded-lg hover:bg-white/5 transition flex items-center gap-2 ${isActive('domestic.html') ? 'text-[#F99523] font-semibold bg-white/10' : 'text-[#EFE7DC]/40 hover:text-[#F99523]'}">Domestic</a>
                </div>
            </div>
            <div class="group">
                <div class="sidebar-nav-item justify-between ${isProcessing ? 'text-[#F99523] font-semibold' : ''}">
                    <div class="flex items-center gap-2.5"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z"/><path fill-rule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.622 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087z" clip-rule="evenodd"/></svg>Processing</div>
                    <svg class="w-3 h-3 transition-transform group-hover:rotate-180" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clip-rule="evenodd"/></svg>
                </div>
                <div class="${isProcessing ? 'flex' : 'hidden group-hover:flex'} flex-col pl-9 pr-3 pb-1 gap-0.5">
                    <a href="processing.html" class="text-[12px] py-1.5 px-2 rounded-lg hover:bg-white/5 transition ${isActive('processing.html') ? 'text-[#F99523] font-semibold bg-white/10' : 'text-[#EFE7DC]/40 hover:text-[#F99523]'}">Manage Bookings</a>
                    <a href="update.html" class="text-[12px] py-1.5 px-2 rounded-lg hover:bg-white/5 transition ${isActive('update.html') ? 'text-[#F99523] font-semibold bg-white/10' : 'text-[#EFE7DC]/40 hover:text-[#F99523]'}">Process Update</a>
                </div>
            </div>
            <div class="sidebar-section-label mt-3">Finance & CRM</div>
            <a href="accounts.html" class="sidebar-nav-item ${isActive('accounts.html')}"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M2.25 6A2.25 2.25 0 014.5 3.75h15A2.25 2.25 0 0121.75 6v1.5H2.25V6zM2.25 9v11.25A2.25 2.25 0 004.5 22.5h15a2.25 2.25 0 002.25-2.25V9H2.25zm11.25 5.625a.75.75 0 01.75-.75h2.25a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-2.25a.75.75 0 01-.75-.75v-1.5z"/></svg>Accounts</a>
            <a href="customers.html" class="sidebar-nav-item ${isActive('customers.html')}"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd"/></svg>CRM</a>
            <a href="reports.html" class="sidebar-nav-item ${isActive('reports.html')}"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clip-rule="evenodd"/></svg>Analytics</a>
            <div class="sidebar-divider"></div>
            <a href="admin.html" id="globalNavAdminLink" class="sidebar-nav-item hidden ${isActive('admin.html')}"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.89-.777.89-2.038 0-2.813zM12 15.75a.75.75 0 000 1.5h.008a.75.75 0 000-1.5H12z" clip-rule="evenodd"/></svg>Master Control</a>
        </nav>
        <div class="px-3 py-4 border-t border-white/[0.06]">
            <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] cursor-pointer hover:bg-white/[0.07] transition" id="globalSidebarProfileBtn">
                <div class="w-7 h-7 rounded-[9px] bg-[#F99523] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" id="globalSidebarAvatarText">U</div>
                <div class="overflow-hidden flex-1">
                    <div class="text-[11px] font-semibold text-[#EFE7DC]/90 truncate" id="globalSidebarUserName">Loading...</div>
                    <div class="text-[9px] text-[#EFE7DC]/40" id="globalSidebarUserRole">—</div>
                </div>
                <svg class="w-3 h-3 text-[#EFE7DC]/25 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M4.5 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clip-rule="evenodd"/></svg>
            </div>
        </div>
    </aside>

    <div class="global-modal-overlay" id="globalProfileModal">
        <div class="global-modal-box flex flex-col">
            <div style="padding:20px 24px;border-bottom:1px solid #f0ece6;background:#faf8f5;display:flex;align-items:center;justify-content:space-between;">
                <div style="display:flex;align-items:center;gap:12px;">
                    <div style="width:36px;height:36px;border-radius:10px;background:rgba(2,115,133,.1);display:flex;align-items:center;justify-content:center;">
                        <svg style="width:18px;height:18px;color:#027385;" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd"/></svg>
                    </div>
                    <div>
                        <h3 class="font-lexend text-[15px] font-bold text-charcoal">Account Settings</h3>
                        <p class="text-[10px] text-teal/60 uppercase tracking-widest font-semibold mt-0.5" id="gpRoleBranch">Loading...</p>
                    </div>
                </div>
                <button type="button" id="closeGlobalProfileBtn" style="width:30px;height:30px;border-radius:50%;background:rgba(13,35,48,.06);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;">
                    <svg style="width:14px;height:14px;color:#0D2330;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            
            <form id="globalProfileForm" style="padding:24px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
                    <div>
                        <label class="global-field-label">Full Name</label>
                        <input type="text" id="gpName" required class="global-field">
                    </div>
                    <div>
                        <label class="global-field-label">Username</label>
                        <input type="text" id="gpUsername" required class="global-field">
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
                    <div>
                        <label class="global-field-label">Phone Number</label>
                        <input type="text" id="gpPhone" class="global-field" placeholder="+968 XXXXXXXX">
                    </div>
                    <div>
                        <label class="global-field-label">Email ID</label>
                        <input type="email" id="gpEmail" class="global-field" placeholder="user@nuvana.com">
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px;">
                    <div>
                        <label class="global-field-label">Date of Birth</label>
                        <input type="date" id="gpDob" class="global-field text-charcoal/70">
                    </div>
                    <div>
                        <label class="global-field-label">Reset Password</label>
                        <input type="password" id="gpPass" class="global-field" placeholder="Leave blank to keep current">
                    </div>
                </div>

                <div class="flex gap-3">
                    <button type="button" id="gpLogoutBtn" style="padding:12px 24px;border-radius:12px;background:rgba(239,68,68,.1);color:#dc2626;font-family:'Lexend',sans-serif;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:background .2s;" class="hover:bg-red-500/20">Sign Out</button>
                    <button type="submit" id="gpSaveBtn" style="flex:1;padding:12px;border-radius:12px;background:#0D2330;color:white;font-family:'Lexend',sans-serif;font-size:13px;font-weight:700;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(13,35,48,.2);display:flex;align-items:center;justify-content:center;gap:8px;">
                        <span id="gpSaveText">Save Changes</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
    `;

    // 3. Populate User Details Securely from SessionStorage
    if (activeUser) {
        try {
            const firstChar = (activeUser.name || 'U').charAt(0).toUpperCase();
            
            document.getElementById('globalSidebarAvatarText').textContent = firstChar;
            document.getElementById('globalSidebarUserName').textContent = activeUser.name;
            
            // Set Role and Branch Name exactly as requested
            document.getElementById('globalSidebarUserRole').textContent = `${activeUser.role} • ${activeUser.branchName || activeUser.branchId}`;
            
            if (activeUser.role === 'Admin') {
                const adminLink = document.getElementById('globalNavAdminLink');
                if (adminLink) {
                    adminLink.classList.remove('hidden');
                    adminLink.style.display = 'flex';
                }
            }
        } catch(e) { console.error("Error parsing user session data.", e); }
    }

    // 4. Connect the Profile Modal Router
    document.getElementById('globalSidebarProfileBtn')?.addEventListener('click', () => {
        const modal = document.getElementById('globalProfileModal');
        if (modal) {
            document.getElementById('gpRoleBranch').textContent = `${activeUser.role} • ${activeUser.branchName || activeUser.branchId}`;
            document.getElementById('gpName').value = activeUser.name || '';
            document.getElementById('gpUsername').value = activeUser.username || '';
            document.getElementById('gpPhone').value = activeUser.phone || '';
            document.getElementById('gpEmail').value = activeUser.email || '';
            
            let dobValue = '';
            if (activeUser.dob) {
                try {
                    const d = new Date(activeUser.dob);
                    if (!isNaN(d.getTime())) dobValue = d.toISOString().split('T')[0];
                } catch(e) {}
            }
            document.getElementById('gpDob').value = dobValue;
            document.getElementById('gpPass').value = '';
            
            modal.classList.add('active');
        }
    });

    document.getElementById('closeGlobalProfileBtn')?.addEventListener('click', () => {
        document.getElementById('globalProfileModal').classList.remove('active');
    });

    document.getElementById('gpLogoutBtn')?.addEventListener('click', () => {
        sessionStorage.removeItem('erp_user');
        window.location.href = 'login.html';
    });

    document.getElementById('globalProfileForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('gpSaveBtn');
        const text = document.getElementById('gpSaveText');
        
        text.textContent = "Saving..."; btn.disabled = true; btn.classList.add('opacity-50');

        const payload = {
            formType: "updateProfile",
            userId: activeUser.userId, 
            newName: document.getElementById('gpName').value.trim(),
            newUsername: document.getElementById('gpUsername').value.trim(),
            newPhone: document.getElementById('gpPhone').value.trim(),
            newEmail: document.getElementById('gpEmail').value.trim(),
            newDob: document.getElementById('gpDob').value,
            newPassword: document.getElementById('gpPass').value.trim()
        };

        try {
            const response = await fetch(scriptURL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
            const result = await response.json();
            
            if (result.result === 'success') {
                activeUser.name = payload.newName;
                activeUser.username = payload.newUsername;
                activeUser.phone = payload.newPhone;
                activeUser.email = payload.newEmail;
                activeUser.dob = payload.newDob;
                
                sessionStorage.setItem('erp_user', JSON.stringify(activeUser));
                
                document.getElementById('globalSidebarAvatarText').textContent = activeUser.name.charAt(0).toUpperCase();
                document.getElementById('globalSidebarUserName').textContent = activeUser.name;
                
                document.getElementById('globalProfileModal').classList.remove('active');
                alert('Profile updated successfully!');
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            alert('Connection failed. Could not update profile.');
        } finally {
            text.textContent = "Save Changes"; btn.disabled = false; btn.classList.remove('opacity-50');
        }
    });
}

// ==========================================
// INITIALIZATION LISTENER
// ==========================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGlobalSidebar);
} else {
    loadGlobalSidebar();
}