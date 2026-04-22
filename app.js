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
    
    const branchSpans = document.querySelectorAll('.text-sm.text-slate-400');
    branchSpans.forEach(span => { if(span.innerText.includes('Branch:')) span.innerText = `Branch: ${activeUser.branchId}`; });

    const avatars = document.querySelectorAll('.w-8.h-8.rounded-full');
    avatars.forEach(av => { av.innerText = activeUser.name.charAt(0).toUpperCase(); });

    const headers = document.querySelectorAll('header .flex.items-center.space-x-4');
    headers.forEach(h => {
        const logoutBtn = document.createElement('button');
        logoutBtn.innerText = 'Logout';
        logoutBtn.className = 'ml-4 text-xs text-rose-400 hover:text-rose-300 transition uppercase tracking-wider font-bold';
        logoutBtn.onclick = () => { sessionStorage.removeItem('erp_user'); window.location.replace('login.html'); };
        h.appendChild(logoutBtn);
    });

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
                sessionStorage.setItem('erp_user', JSON.stringify({ name: result.name, role: result.role, branchId: result.branchId }));
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
    const boxContainer = document.getElementById('boxContainer'); const addBoxBtn = document.getElementById('addBoxBtn'); let boxCount = 0; const MAX_BOXES = 10;
    window.addBox = function() {
        if (boxCount >= MAX_BOXES) return alert("Max 10 boxes."); boxCount++; const row = document.createElement('div'); row.className = 'grid grid-cols-6 gap-2 animate-fade-in';
        row.innerHTML = `<div class="flex items-center justify-center text-slate-400 font-mono text-sm bg-slate-900 rounded border border-slate-700">Box ${boxCount}</div><input type="number" step="0.01" id="b${boxCount}W" placeholder="0.0" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-center text-white focus:outline-none focus:border-purple-500" oninput="calculateTotals()"><input type="number" step="0.01" id="b${boxCount}L" placeholder="L" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-center text-white focus:outline-none focus:border-purple-500" oninput="calculateTotals()"><input type="number" step="0.01" id="b${boxCount}Wi" placeholder="W" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-center text-white focus:outline-none focus:border-purple-500" oninput="calculateTotals()"><input type="number" step="0.01" id="b${boxCount}H" placeholder="H" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-center text-white focus:outline-none focus:border-purple-500" oninput="calculateTotals()"><input type="number" step="0.01" id="b${boxCount}CW" readonly placeholder="0.0" class="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-sm text-center text-purple-300 font-bold focus:outline-none">`;
        boxContainer.appendChild(row); window.calculateTotals();
    }
    window.calculateTotals = function() {
        let totalActual = 0; let totalCW = 0;
        for (let i = 1; i <= boxCount; i++) {
            let actW = parseFloat(document.getElementById(`b${i}W`).value) || 0; let l = parseFloat(document.getElementById(`b${i}L`).value) || 0; let w = parseFloat(document.getElementById(`b${i}Wi`).value) || 0; let h = parseFloat(document.getElementById(`b${i}H`).value) || 0;
            let cw = Math.max(actW, (l * w * h) / 5000); document.getElementById(`b${i}CW`).value = cw > 0 ? cw.toFixed(2) : ""; totalActual += actW; totalCW += cw;
        }
        document.getElementById('lblTotalBoxes').innerText = boxCount; document.getElementById('lblTotalActual').innerText = totalActual.toFixed(2); document.getElementById('lblTotalCW').innerText = totalCW.toFixed(2);
        let rate = parseFloat(document.getElementById('rate').value) || 0; let pack = parseFloat(document.getElementById('packingCharges').value) || 0; let add = parseFloat(document.getElementById('additionalCharges').value) || 0;
        if(rate > 0) document.getElementById('grandTotal').value = ((totalCW * rate) + pack + add).toFixed(2); else document.getElementById('grandTotal').value = "";
    }
    ['rate', 'packingCharges', 'additionalCharges'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).addEventListener('input', window.calculateTotals); });
    addBox(); addBoxBtn.addEventListener('click', addBox);
    intForm.addEventListener('submit', async (e) => {
        e.preventDefault(); const btnTextInt = document.getElementById('btnTextInt'); const loadingIconInt = document.getElementById('loadingIconInt'); const submitIntBtn = document.getElementById('submitIntBtn');
        btnTextInt.innerText = "Transmitting..."; loadingIconInt.classList.remove('hidden'); submitIntBtn.disabled = true; submitIntBtn.classList.add('opacity-50');
        const getVal = (id) => document.getElementById(id) ? document.getElementById(id).value : "";
        const getDim = (i) => { let l = getVal(`b${i}L`), w = getVal(`b${i}Wi`), h = getVal(`b${i}H`); return (l && w && h) ? `${l}x${w}x${h}` : ""; };
        const payload = { formType: "international", shipperName: getVal('shipperName'), contactNumber: getVal('contactNumber'), altNumber: getVal('altNumber'), shipperAddress: getVal('shipperAddress'), originCountry: getVal('originCountry'), postalCode: getVal('postalCode'), receiverName: getVal('receiverNameInt'), receiverPhone: getVal('receiverPhoneInt'), receiverAlt: getVal('receiverAltInt'), receiverAddress: getVal('receiverAddress'), destCountry: getVal('destCountry'), zipCode: getVal('zipCode'), shipmentType: getVal('shipmentType'), cargoType: getVal('cargoType'), commodity: getVal('commodity'), description: getVal('description'), shipmentValue: getVal('shipmentValue'), totalBoxes: boxCount, totalWeight: getVal('lblTotalActual'), totalChargeableWeight: getVal('lblTotalCW'), rate: getVal('rate'), packingCharges: getVal('packingCharges'), additionalCharges: getVal('additionalCharges'), grandTotal: getVal('grandTotal'), b1W: getVal('b1W'), b1D: getDim(1), b1CW: getVal('b1CW'), b2W: getVal('b2W'), b2D: getDim(2), b2CW: getVal('b2CW'), b3W: getVal('b3W'), b3D: getDim(3), b3CW: getVal('b3CW'), b4W: getVal('b4W'), b4D: getDim(4), b4CW: getVal('b4CW'), b5W: getVal('b5W'), b5D: getDim(5), b5CW: getVal('b5CW'), b6W: getVal('b6W'), b6D: getDim(6), b6CW: getVal('b6CW'), b7W: getVal('b7W'), b7D: getDim(7), b7CW: getVal('b7CW'), b8W: getVal('b8W'), b8D: getDim(8), b8CW: getVal('b8CW'), b9W: getVal('b9W'), b9D: getDim(9), b9CW: getVal('b9CW'), b10W: getVal('b10W'), b10D: getDim(10), b10CW: getVal('b10CW') };
        try {
            const response = await fetch(scriptURL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
            const result = await response.json();
            if(result.result === 'success') { alert(`Success! Order ID: ${result.orderId}`); intForm.reset(); boxContainer.innerHTML = ''; boxCount = 0; addBox(); window.calculateTotals(); } else alert('Error: ' + result.error);
        } catch (error) { alert('Transmission failed.'); } finally {
            btnTextInt.innerText = "Transmit International Booking"; loadingIconInt.classList.add('hidden'); submitIntBtn.disabled = false; submitIntBtn.classList.remove('opacity-50');
        }
    });
}

// ==========================================
// 5. PROCESSING MODULE (DUAL TOGGLE)
// ==========================================
const tableBody = document.getElementById('bookingsTableBody');
if (tableBody) {
    const refreshBtn = document.getElementById('refreshTableBtn');
    const toggleDomBtn = document.getElementById('toggleDomBtn');
    const toggleIntBtn = document.getElementById('toggleIntBtn');
    const tableHeaderRow = document.getElementById('tableHeaderRow');
    
    let currentView = 'domestic';

    // Toggle styling functions
    toggleDomBtn.addEventListener('click', () => {
        currentView = 'domestic';
        toggleDomBtn.className = 'px-4 py-1.5 rounded text-sm font-semibold bg-teal-600 text-white transition shadow';
        toggleIntBtn.className = 'px-4 py-1.5 rounded text-sm font-semibold text-slate-400 hover:text-white transition';
        window.fetchBookings();
    });

    toggleIntBtn.addEventListener('click', () => {
        currentView = 'international';
        toggleIntBtn.className = 'px-4 py-1.5 rounded text-sm font-semibold bg-purple-600 text-white transition shadow';
        toggleDomBtn.className = 'px-4 py-1.5 rounded text-sm font-semibold text-slate-400 hover:text-white transition';
        window.fetchBookings();
    });

    window.fetchBookings = async function() {
        tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-slate-400 animate-pulse">Fetching live data...</td></tr>';
        
        // Update Headers based on view
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
                        // International Array Mapping
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
    refreshBtn.addEventListener('click', window.fetchBookings); window.fetchBookings(); 
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
    refreshLedgerBtn.addEventListener('click', window.fetchLedger); window.fetchLedger(); 
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
    refreshCustBtn.addEventListener('click', window.fetchCustomers); window.fetchCustomers(); 
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
                
                // Create custom Deep Teal to Vibrant Orange Gradient
                let gradientFill = ctxLogistics.createLinearGradient(0, 0, 0, 400);
                gradientFill.addColorStop(0, '#027385'); // Deep Teal
                gradientFill.addColorStop(1, '#F99523'); // Vibrant Orange

                logisticsChartInstance = new Chart(ctxLogistics, { 
                    type: 'bar', 
                    data: { 
                        labels: Object.keys(statusCounts), 
                        datasets: [{ 
                            label: 'Number of Shipments', 
                            data: Object.values(statusCounts), 
                            backgroundColor: gradientFill, 
                            borderWidth: 0, 
                            borderRadius: 6 
                        }] 
                    }, 
                    options: { 
                        responsive: true, 
                        maintainAspectRatio: false, 
                        plugins: { legend: { display: false } }, 
                        scales: { 
                            y: { beginAtZero: true, grid: { color: 'rgba(2, 115, 133, 0.1)' } }, 
                            x: { grid: { display: false } } 
                        } 
                    } 
                });
            }
        } catch (error) { console.error(error); alert("Failed to load analytics data."); } finally { loadingOverlay.classList.add('hidden'); }
    }
    generateReportsBtn.addEventListener('click', window.generateAnalytics); window.generateAnalytics(); 
}

// ==========================================
// 10. DYNAMIC MAIN DASHBOARD
// ==========================================
const mainDashboardView = document.getElementById('mainDashboardView');
if (mainDashboardView && activeUser) {
    const welcomeText = document.getElementById('welcomeText');
    if(welcomeText) welcomeText.innerText = `Welcome back, ${activeUser.name}.`;

    window.loadDashboardStats = async function() {
        try {
            const [domRes, intRes, custRes] = await Promise.all([ fetch(`${scriptURL}?action=getDomestic`), fetch(`${scriptURL}?action=getInternational`), fetch(`${scriptURL}?action=getCustomers`) ]);
            const domJson = await domRes.json(); const intJson = await intRes.json(); const custJson = await custRes.json();

            let totalDom = domJson.result === 'success' ? Math.max(0, domJson.data.length - 1) : 0;
            let totalInt = intJson.result === 'success' ? Math.max(0, intJson.data.length - 1) : 0;
            let totalCust = custJson.result === 'success' ? Math.max(0, custJson.data.length - 1) : 0;

            document.getElementById('dashDom').innerText = totalDom; document.getElementById('dashInt').innerText = totalInt; document.getElementById('dashCust').innerText = totalCust;
        } catch (error) { document.getElementById('dashDom').innerText = "Error"; document.getElementById('dashInt').innerText = "Error"; document.getElementById('dashCust').innerText = "Error"; }
    }
    window.loadDashboardStats();
}
// ==========================================
// 11. THEME TOGGLE (LIGHT/DARK MODE)
// ==========================================
const themeToggleBtn = document.getElementById('themeToggleBtn');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        // Toggle the .dark class on the root HTML element
        document.documentElement.classList.toggle('dark');
        
        // Save preference to localStorage so it remembers across pages
        if (document.documentElement.classList.contains('dark')) {
            localStorage.theme = 'dark';
        } else {
            localStorage.theme = 'light';
        }
    });
}