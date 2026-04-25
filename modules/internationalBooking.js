/**
 * modules/internationalBooking.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Nuvana ERP — International Booking Module (Refactored)
 *
 * Architecture: IIFE module pattern with clear section separation.
 * No global pollution — only InternationalBookingModule is exposed.
 *
 * Sections:
 *  1. Configuration
 *  2. State Management
 *  3. Data Engine / Utilities
 *  4. Validators
 *  5. API Handler
 *  6. UI Controller
 *  7. Event Setup
 *  8. Public API
 * ─────────────────────────────────────────────────────────────────────────────
 */

const InternationalBookingModule = (() => {

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 1 — CONFIGURATION
  // All form field IDs and constants in one place for easy maintenance.
  // ═══════════════════════════════════════════════════════════════════════════

  const CONFIG = {
    // Shipper fields
    SHIPPER_NAME:        'shipperName',
    SHIPPER_PHONE:       'contactNumber',
    SHIPPER_PHONE_CODE:  'shipperPhoneCode',
    SHIPPER_ALT:         'altNumber',
    SHIPPER_ADDRESS:     'shipperAddress',
    SHIPPER_CITY:        'shipperCity',
    SHIPPER_STATE:       'shipperState',
    ORIGIN_COUNTRY:      'originCountry',
    POSTAL_CODE:         'postalCode',
    SHIPPER_ID_TYPE:     'shipperIdType',
    SHIPPER_ID_NUMBER:   'shipperIdNumber',
    SHIPPER_ID_EXPIRY:   'shipperIdExpiry',

    // Consignee fields
    CONSIGNEE_NAME:      'receiverNameInt',
    CONSIGNEE_PHONE:     'receiverPhoneInt',
    CONSIGNEE_PHONE_CODE:'consigneePhoneCode',
    CONSIGNEE_ALT:       'receiverAltInt',
    CONSIGNEE_ADDRESS:   'receiverAddress',
    CONSIGNEE_CITY:      'consigneeCity',
    CONSIGNEE_STATE:     'consigneeState',
    DEST_COUNTRY:        'destCountry',
    ZIP_CODE:            'zipCode',
    CONSIGNEE_ID_TYPE:   'consigneeIdType',
    CONSIGNEE_ID_NUMBER: 'consigneeIdNumber',
    CONSIGNEE_ID_EXPIRY: 'consigneeIdExpiry',

    // Shipment detail fields
    SHIPMENT_TYPE:       'shipmentType',
    CARGO_TYPE:          'cargoType',
    COMMODITY:           'commodity',
    SHIPMENT_VALUE:      'shipmentValue',
    DESCRIPTION:         'description',

    // Pricing fields
    RATE:                'rate',
    PACKING_CHARGES:     'packingCharges',
    ADDITIONAL_CHARGES:  'additionalCharges',
    GRAND_TOTAL:         'grandTotal',

    // Box management
    BOX_CONTAINER:       'boxContainer',
    ADD_BOX_BTN:         'addBoxBtn',
    LBL_TOTAL_BOXES:     'lblTotalBoxes',
    LBL_TOTAL_ACTUAL:    'lblTotalActual',
    LBL_TOTAL_CW:        'lblTotalCW',

    // Form & submit
    FORM_ID:             'internationalForm',
    SUBMIT_BTN:          'submitIntBtn',
    SUBMIT_BTN_TEXT:     'btnTextInt',
    LOADING_ICON:        'loadingIconInt',

    // Modals
    SUCCESS_MODAL:       'successModal',
    WAYBILL_MODAL:       'waybillModal',

    // Constants
    MAX_BOXES:           20,
    VOLUMETRIC_DIVISOR:  5000,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 2 — STATE MANAGEMENT
  // Single source of truth for all module state.
  // ═══════════════════════════════════════════════════════════════════════════

  const state = {
    scriptURL: '',
    boxCount: 0,
    boxes: [],          // Array of { actual, l, w, h, cw } per box
    totals: {
      boxes: 0,
      actualWeight: 0,
      chargeableWeight: 0,
      grandTotal: 0,
    },
    lastBooking: null,  // Stores last successful booking response for modal
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 3 — DATA ENGINE / UTILITIES
  // Pure helper functions with no side effects.
  // ═══════════════════════════════════════════════════════════════════════════

  const DataEngine = {

    /**
     * Calculates chargeable weight for a single box.
     * Chargeable = max(actual weight, volumetric weight)
     * Volumetric = (L × W × H) / 5000
     */
    chargeableWeight(actual, l, w, h) {
      const volumetric = (l * w * h) / CONFIG.VOLUMETRIC_DIVISOR;
      return Math.max(actual, volumetric);
    },

    /**
     * Generates a master AWB number from current timestamp + counter.
     * Format: AWB-YYYYMMDD-XXXXXXXX
     */
    generateMasterAWB() {
      const now = new Date();
      const date = now.toISOString().slice(0, 10).replace(/-/g, '');
      const rand = Math.floor(1000 + Math.random() * 9000);
      const ts   = now.getTime().toString().slice(-4);
      return `AWB-${date}-${ts}${rand}`;
    },

    /**
     * Generates child AWB for a box given master AWB and box index (1-based).
     * Format: {masterAWB}B01, {masterAWB}B02 …
     */
    generateChildAWB(masterAWB, boxIndex) {
      return `${masterAWB}B${String(boxIndex).padStart(2, '0')}`;
    },

    /**
     * Generates all AWBs: master + one child per box.
     * @param {number} boxCount
     * @returns {{ master: string, children: string[] }}
     */
    generateAllAWBs(boxCount) {
      const master = this.generateMasterAWB();
      const children = [];
      for (let i = 1; i <= boxCount; i++) {
        children.push(this.generateChildAWB(master, i));
      }
      return { master, children };
    },

    /**
     * Recalculates all box totals from current state.boxes array.
     * Updates state.totals in place.
     */
    recalculateTotals() {
      let totalActual = 0;
      let totalCW = 0;

      state.boxes.forEach((box, i) => {
        const cw = this.chargeableWeight(box.actual, box.l, box.w, box.h);
        state.boxes[i].cw = cw;
        totalActual += box.actual;
        totalCW     += cw;
      });

      const rate    = parseFloat(UIController.getFieldValue(CONFIG.RATE))             || 0;
      const packing = parseFloat(UIController.getFieldValue(CONFIG.PACKING_CHARGES))  || 0;
      const extra   = parseFloat(UIController.getFieldValue(CONFIG.ADDITIONAL_CHARGES))|| 0;

      state.totals.boxes            = state.boxes.length;
      state.totals.actualWeight     = totalActual;
      state.totals.chargeableWeight = totalCW;
      state.totals.grandTotal       = rate > 0 ? ((totalCW * rate) + packing + extra) : 0;
    },

    /**
     * Builds the full payload object for API submission.
     * @returns {object} Payload ready to JSON.stringify
     */
    buildPayload(awbs) {
      const boxData = state.boxes.map((box, i) => ({
        boxNumber:    i + 1,
        childAWB:     awbs.children[i],
        actualWeight: box.actual,
        length:       box.l,
        width:        box.w,
        height:       box.h,
        cw:           box.cw,
      }));

      return {
        formType: 'internationalBooking',
        masterAWB: awbs.master,
        childAWBs: JSON.stringify(awbs.children),

        // Shipper
        shipperName:       UIController.getFieldValue(CONFIG.SHIPPER_NAME),
        contactNumber:     UIController.getFieldValue(CONFIG.SHIPPER_PHONE_CODE) + UIController.getFieldValue(CONFIG.SHIPPER_PHONE),
        altNumber:         UIController.getFieldValue(CONFIG.SHIPPER_ALT),
        shipperAddress:    UIController.getFieldValue(CONFIG.SHIPPER_ADDRESS),
        shipperCity:       UIController.getFieldValue(CONFIG.SHIPPER_CITY),
        shipperState:      UIController.getFieldValue(CONFIG.SHIPPER_STATE),
        originCountry:     UIController.getFieldValue(CONFIG.ORIGIN_COUNTRY),
        postalCode:        UIController.getFieldValue(CONFIG.POSTAL_CODE),
        shipperIdType:     UIController.getFieldValue(CONFIG.SHIPPER_ID_TYPE),
        shipperIdNumber:   UIController.getFieldValue(CONFIG.SHIPPER_ID_NUMBER),
        shipperIdExpiry:   UIController.getFieldValue(CONFIG.SHIPPER_ID_EXPIRY),

        // Consignee
        receiverNameInt:   UIController.getFieldValue(CONFIG.CONSIGNEE_NAME),
        receiverPhoneInt:  UIController.getFieldValue(CONFIG.CONSIGNEE_PHONE_CODE) + UIController.getFieldValue(CONFIG.CONSIGNEE_PHONE),
        receiverAltInt:    UIController.getFieldValue(CONFIG.CONSIGNEE_ALT),
        receiverAddress:   UIController.getFieldValue(CONFIG.CONSIGNEE_ADDRESS),
        consigneeCity:     UIController.getFieldValue(CONFIG.CONSIGNEE_CITY),
        consigneeState:    UIController.getFieldValue(CONFIG.CONSIGNEE_STATE),
        destCountry:       UIController.getFieldValue(CONFIG.DEST_COUNTRY),
        zipCode:           UIController.getFieldValue(CONFIG.ZIP_CODE),
        consigneeIdType:   UIController.getFieldValue(CONFIG.CONSIGNEE_ID_TYPE),
        consigneeIdNumber: UIController.getFieldValue(CONFIG.CONSIGNEE_ID_NUMBER),
        consigneeIdExpiry: UIController.getFieldValue(CONFIG.CONSIGNEE_ID_EXPIRY),

        // Shipment details
        shipmentType:    UIController.getFieldValue(CONFIG.SHIPMENT_TYPE),
        cargoType:       UIController.getFieldValue(CONFIG.CARGO_TYPE),
        commodity:       UIController.getFieldValue(CONFIG.COMMODITY),
        shipmentValue:   UIController.getFieldValue(CONFIG.SHIPMENT_VALUE),
        description:     UIController.getFieldValue(CONFIG.DESCRIPTION),

        // Pricing
        rate:              UIController.getFieldValue(CONFIG.RATE),
        packingCharges:    UIController.getFieldValue(CONFIG.PACKING_CHARGES),
        additionalCharges: UIController.getFieldValue(CONFIG.ADDITIONAL_CHARGES),
        grandTotal:        state.totals.grandTotal.toFixed(2),

        // Boxes
        totalBoxes:        state.totals.boxes,
        totalActualWeight: state.totals.actualWeight.toFixed(2),
        totalCW:           state.totals.chargeableWeight.toFixed(2),
        boxes:             JSON.stringify(boxData),
      };
    },
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 4 — VALIDATORS
  // Field and form-level validation. Returns { valid, errors }.
  // ═══════════════════════════════════════════════════════════════════════════

  const Validators = {

    /**
     * Validates that a field has a non-empty value.
     */
    required(id, label) {
      const val = UIController.getFieldValue(id).trim();
      if (!val) return `${label} is required.`;
      return null;
    },

    /**
     * Validates that a date field is not in the past.
     */
    notInPast(id, label) {
      const val = UIController.getFieldValue(id);
      if (!val) return null; // Optional field
      const date = new Date(val);
      if (isNaN(date.getTime())) return `${label} is not a valid date.`;
      if (date < new Date()) return `${label} must be a future date.`;
      return null;
    },

    /**
     * Validates full form before submission.
     * @returns {{ valid: boolean, errors: string[] }}
     */
    validateForm() {
      const errors = [];

      // Required shipper fields
      const shipperChecks = [
        [CONFIG.SHIPPER_NAME,    'Shipper Name'],
        [CONFIG.SHIPPER_PHONE,   'Shipper Phone'],
        [CONFIG.SHIPPER_CITY,    'Shipper City'],
        [CONFIG.SHIPPER_STATE,   'Shipper State'],
        [CONFIG.ORIGIN_COUNTRY,  'Origin Country'],
        [CONFIG.CONSIGNEE_NAME,  'Consignee Name'],
        [CONFIG.CONSIGNEE_PHONE, 'Consignee Phone'],
        [CONFIG.CONSIGNEE_CITY,  'Consignee City'],
        [CONFIG.CONSIGNEE_STATE, 'Consignee State/Province'],
        [CONFIG.DEST_COUNTRY,    'Destination Country'],
      ];

      shipperChecks.forEach(([id, label]) => {
        const err = this.required(id, label);
        if (err) errors.push(err);
      });

      // Optional ID expiry dates must be future if filled
      const expiryChecks = [
        [CONFIG.SHIPPER_ID_EXPIRY,   'Shipper ID Expiry'],
        [CONFIG.CONSIGNEE_ID_EXPIRY, 'Consignee ID Expiry'],
      ];
      expiryChecks.forEach(([id, label]) => {
        const err = this.notInPast(id, label);
        if (err) errors.push(err);
      });

      // At least one box required
      if (state.boxes.length === 0) {
        errors.push('At least one box must be added.');
      }

      // All boxes must have actual weight
      state.boxes.forEach((box, i) => {
        if (!box.actual || box.actual <= 0) {
          errors.push(`Box ${i + 1}: Actual weight is required.`);
        }
      });

      return { valid: errors.length === 0, errors };
    },
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 5 — API HANDLER
  // All communication with Google Apps Script backend.
  // ═══════════════════════════════════════════════════════════════════════════

  const APIHandler = {

    /**
     * Submits booking payload to Google Apps Script.
     * @param {object} payload
     * @returns {Promise<object>} Parsed response
     */
    async submit(payload) {
      const response = await fetch(state.scriptURL, {
        method:  'POST',
        body:    JSON.stringify(payload),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      return response.json();
    },
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 6 — UI CONTROLLER
  // All DOM reads/writes. No business logic here.
  // ═══════════════════════════════════════════════════════════════════════════

  const UIController = {

    /** Reads the current value of a form field by ID. */
    getFieldValue(id) {
      const el = document.getElementById(id);
      return el ? el.value : '';
    },

    /** Sets the value of a form field by ID. */
    setFieldValue(id, value) {
      const el = document.getElementById(id);
      if (el) el.value = value;
    },

    /** Populates a <select> with options. Clears existing options first. */
    populateSelect(id, options, placeholder = 'Select…') {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
      options.forEach(opt => {
        const o = document.createElement('option');
        o.value       = opt.value || opt;
        o.textContent = opt.label || opt;
        el.appendChild(o);
      });
    },

    /** Builds and renders all country dropdowns from COUNTRY_MASTER. */
    populateCountryDropdowns() {
      const countries = getAllCountries().map(c => ({ value: c.code, label: c.name }));
      this.populateSelect(CONFIG.ORIGIN_COUNTRY, countries, 'Select origin country…');
      this.populateSelect(CONFIG.DEST_COUNTRY,   countries, 'Select destination country…');
    },

    /** Populates ID type dropdowns for shipper and consignee. */
    populateIdTypeDropdowns() {
      this.populateSelect(CONFIG.SHIPPER_ID_TYPE,   ID_TYPES, 'Select ID type…');
      this.populateSelect(CONFIG.CONSIGNEE_ID_TYPE, ID_TYPES, 'Select ID type…');
    },

    /** Updates the phone code prefix display and hidden field. */
    updatePhoneCode(countryCode, phoneCodeFieldId, displayId) {
      const code = getPhoneCode(countryCode);
      this.setFieldValue(phoneCodeFieldId, code);
      const display = document.getElementById(displayId);
      if (display) display.textContent = code || '—';
    },

    /** Repopulates state dropdown when country changes. */
    updateStateDropdown(countryCode, stateSelectId) {
      const states = getStates(countryCode);
      if (states.length === 0) {
        this.populateSelect(stateSelectId, [], 'N/A — not available');
      } else {
        this.populateSelect(stateSelectId, states, 'Select state/province…');
      }
    },

    /** Adds a new box row to the DOM and pushes to state.boxes. */
    addBoxRow() {
      if (state.boxCount >= CONFIG.MAX_BOXES) {
        alert(`Maximum ${CONFIG.MAX_BOXES} boxes allowed.`);
        return;
      }

      state.boxCount++;
      const i = state.boxCount;

      state.boxes.push({ actual: 0, l: 0, w: 0, h: 0, cw: 0 });

      const row = document.createElement('div');
      row.id        = `boxRow${i}`;
      row.className = 'box-row';
      row.innerHTML = `
        <div class="box-num">${i}</div>
        <input type="number" step="0.01" min="0" id="b${i}W"  placeholder="0.00" class="box-input" data-box="${i}" data-field="actual">
        <input type="number" step="0.01" min="0" id="b${i}L"  placeholder="0"    class="box-input" data-box="${i}" data-field="l">
        <input type="number" step="0.01" min="0" id="b${i}Wi" placeholder="0"    class="box-input" data-box="${i}" data-field="w">
        <input type="number" step="0.01" min="0" id="b${i}H"  placeholder="0"    class="box-input" data-box="${i}" data-field="h">
        <input type="number" step="0.01" min="0" id="b${i}CW" readonly placeholder="—" class="box-input readonly-cw">
      `;

      // Attach input listeners to recalculate on change
      row.querySelectorAll('[data-box]').forEach(input => {
        input.addEventListener('input', () => {
          this.syncBoxStateFromDOM(i);
          DataEngine.recalculateTotals();
          this.renderTotals();
          this.updateBoxCW(i);
        });
      });

      document.getElementById(CONFIG.BOX_CONTAINER).appendChild(row);

      if (i >= CONFIG.MAX_BOXES) {
        document.getElementById(CONFIG.ADD_BOX_BTN).disabled = true;
      }
    },

    /** Reads box inputs from DOM into state.boxes[i-1]. */
    syncBoxStateFromDOM(boxIndex) {
      const idx = boxIndex - 1;
      state.boxes[idx].actual = parseFloat(document.getElementById(`b${boxIndex}W`)?.value)  || 0;
      state.boxes[idx].l      = parseFloat(document.getElementById(`b${boxIndex}L`)?.value)  || 0;
      state.boxes[idx].w      = parseFloat(document.getElementById(`b${boxIndex}Wi`)?.value) || 0;
      state.boxes[idx].h      = parseFloat(document.getElementById(`b${boxIndex}H`)?.value)  || 0;
    },

    /** Updates the readonly CW field for a single box row. */
    updateBoxCW(boxIndex) {
      const box = state.boxes[boxIndex - 1];
      const cwEl = document.getElementById(`b${boxIndex}CW`);
      if (cwEl && box) {
        cwEl.value = box.cw > 0 ? box.cw.toFixed(2) : '';
      }
    },

    /** Renders the totals bar below the box table. */
    renderTotals() {
      const t = state.totals;
      const el = id => document.getElementById(id);
      if (el(CONFIG.LBL_TOTAL_BOXES))  el(CONFIG.LBL_TOTAL_BOXES).textContent  = t.boxes;
      if (el(CONFIG.LBL_TOTAL_ACTUAL)) el(CONFIG.LBL_TOTAL_ACTUAL).textContent = t.actualWeight.toFixed(2) + ' kg';
      if (el(CONFIG.LBL_TOTAL_CW))     el(CONFIG.LBL_TOTAL_CW).textContent     = t.chargeableWeight.toFixed(2) + ' kg';
      if (el(CONFIG.GRAND_TOTAL))       el(CONFIG.GRAND_TOTAL).value             = t.grandTotal > 0 ? t.grandTotal.toFixed(2) : '';
    },

    /** Sets submit button to loading state. */
    setSubmitLoading(isLoading) {
      const btn     = document.getElementById(CONFIG.SUBMIT_BTN);
      const txtEl   = document.getElementById(CONFIG.SUBMIT_BTN_TEXT);
      const iconEl  = document.getElementById(CONFIG.LOADING_ICON);
      if (btn)   btn.disabled   = isLoading;
      if (txtEl) txtEl.textContent = isLoading ? 'Transmitting…' : 'Transmit International Booking';
      if (iconEl) iconEl.classList.toggle('hidden', !isLoading);
    },

    /** Shows validation errors in the error summary banner. */
    showValidationErrors(errors) {
      let banner = document.getElementById('validationBanner');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'validationBanner';
        banner.className = 'validation-banner';
        const form = document.getElementById(CONFIG.FORM_ID);
        form.insertBefore(banner, form.firstChild);
      }
      banner.innerHTML = `
        <div class="val-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd"/></svg>
          <strong>Please fix ${errors.length} error${errors.length !== 1 ? 's' : ''} before submitting</strong>
        </div>
        <ul>${errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
      banner.style.display = 'block';
      banner.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    /** Hides the validation error banner. */
    hideValidationErrors() {
      const banner = document.getElementById('validationBanner');
      if (banner) banner.style.display = 'none';
    },

    /** Opens the success modal with booking details and AWBs. */
    showSuccessModal(booking) {
      state.lastBooking = booking;

      // Populate modal fields
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

      set('modalMasterAWB',    booking.masterAWB);
      set('modalShipper',      booking.shipperName);
      set('modalConsignee',    booking.consigneeName);
      set('modalOrigin',       booking.originCountry);
      set('modalDest',         booking.destCountry);
      set('modalTotalBoxes',   booking.totalBoxes);
      set('modalTotalWeight',  booking.totalActualWeight + ' kg');
      set('modalCW',           booking.totalCW + ' kg');
      set('modalGrandTotal',   'OMR ' + booking.grandTotal);

      // Render child AWBs list
      const awbList = document.getElementById('modalChildAWBs');
      if (awbList) {
        awbList.innerHTML = booking.childAWBs
          ? JSON.parse(booking.childAWBs).map((awb, i) =>
              `<div class="child-awb-row"><span class="child-awb-label">Box ${i + 1}</span><span class="child-awb-val">${awb}</span></div>`
            ).join('')
          : '';
      }

      document.getElementById(CONFIG.SUCCESS_MODAL)?.classList.add('active');
    },

    /** Closes the success modal and resets the form. */
    closeSuccessModal() {
      document.getElementById(CONFIG.SUCCESS_MODAL)?.classList.remove('active');
      this.resetForm();
    },

    /** Resets the booking form and module state. */
    resetForm() {
      document.getElementById(CONFIG.FORM_ID)?.reset();
      document.getElementById(CONFIG.BOX_CONTAINER).innerHTML = '';
      state.boxCount = 0;
      state.boxes    = [];
      state.totals   = { boxes: 0, actualWeight: 0, chargeableWeight: 0, grandTotal: 0 };
      const addBtn = document.getElementById(CONFIG.ADD_BOX_BTN);
      if (addBtn) addBtn.disabled = false;
      this.renderTotals();
      this.hideValidationErrors();
      // Re-add first box for convenience
      this.addBoxRow();
    },

    /** Prints the invoice for the last booking using the print modal. */
    printInvoice() {
      if (!state.lastBooking) return;
      // Open print for success modal section
      window.print();
    },
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 7 — EVENT SETUP
  // Attaches all DOM event listeners. Called once during init().
  // ═══════════════════════════════════════════════════════════════════════════

  const EventSetup = {

    setup() {
      this.bindCountryChange();
      this.bindPricingChange();
      this.bindAddBox();
      this.bindFormSubmit();
      this.bindModalButtons();
    },

    /** Listens to origin/destination country selects and cascades changes. */
    bindCountryChange() {
      const originEl = document.getElementById(CONFIG.ORIGIN_COUNTRY);
      const destEl   = document.getElementById(CONFIG.DEST_COUNTRY);

      originEl?.addEventListener('change', (e) => {
        const code = e.target.value;
        UIController.updatePhoneCode(code, CONFIG.SHIPPER_PHONE_CODE, 'shipperPhoneCodeDisplay');
        UIController.updateStateDropdown(code, CONFIG.SHIPPER_STATE);
      });

      destEl?.addEventListener('change', (e) => {
        const code = e.target.value;
        UIController.updatePhoneCode(code, CONFIG.CONSIGNEE_PHONE_CODE, 'consigneePhoneCodeDisplay');
        UIController.updateStateDropdown(code, CONFIG.CONSIGNEE_STATE);
      });
    },

    /** Recalculates grand total when pricing inputs change. */
    bindPricingChange() {
      [CONFIG.RATE, CONFIG.PACKING_CHARGES, CONFIG.ADDITIONAL_CHARGES].forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => {
          DataEngine.recalculateTotals();
          UIController.renderTotals();
        });
      });
    },

    /** Add box button click. */
    bindAddBox() {
      document.getElementById(CONFIG.ADD_BOX_BTN)?.addEventListener('click', () => {
        UIController.addBoxRow();
      });
    },

    /** Form submit handler — validates, generates AWBs, submits to API. */
    bindFormSubmit() {
      const form = document.getElementById(CONFIG.FORM_ID);
      if (!form) return;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Sync all box states from DOM before validating
        state.boxes.forEach((_, i) => UIController.syncBoxStateFromDOM(i + 1));
        DataEngine.recalculateTotals();

        // Validate
        const { valid, errors } = Validators.validateForm();
        if (!valid) {
          UIController.showValidationErrors(errors);
          return;
        }
        UIController.hideValidationErrors();

        // Generate AWBs
        const awbs = DataEngine.generateAllAWBs(state.boxes.length);

        // Build payload
        const payload = DataEngine.buildPayload(awbs);

        // Submit
        UIController.setSubmitLoading(true);
        try {
          const result = await APIHandler.submit(payload);

          if (result.result === 'success') {
            // Merge AWBs into booking details for modal display
            const bookingDetails = {
              ...payload,
              masterAWB:    awbs.master,
              childAWBs:    JSON.stringify(awbs.children),
              shipperName:  payload.shipperName,
              consigneeName:payload.receiverNameInt,
              originCountry:document.getElementById(CONFIG.ORIGIN_COUNTRY)?.options[document.getElementById(CONFIG.ORIGIN_COUNTRY).selectedIndex]?.text,
              destCountry:  document.getElementById(CONFIG.DEST_COUNTRY)?.options[document.getElementById(CONFIG.DEST_COUNTRY).selectedIndex]?.text,
            };
            UIController.showSuccessModal(bookingDetails);
          } else {
            alert('Booking failed: ' + (result.error || 'Unknown error from server.'));
          }
        } catch (err) {
          console.error('Booking submission error:', err);
          alert('Connection failed. Please check your network and try again.');
        } finally {
          UIController.setSubmitLoading(false);
        }
      });
    },

    /** Wires up success modal buttons. */
    bindModalButtons() {
      // Close / reset
      document.getElementById('modalCloseBtn')?.addEventListener('click', () => {
        UIController.closeSuccessModal();
      });

      // Print invoice
      document.getElementById('modalPrintInvoiceBtn')?.addEventListener('click', () => {
        UIController.printInvoice();
      });

      // Print waybill labels
      document.getElementById('modalPrintLabelBtn')?.addEventListener('click', () => {
        WaybillLabel.printAll(state.lastBooking);
      });

      // Close on overlay click
      document.getElementById(CONFIG.SUCCESS_MODAL)?.addEventListener('click', (e) => {
        if (e.target.id === CONFIG.SUCCESS_MODAL) UIController.closeSuccessModal();
      });
    },
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // WAYBILL LABEL ENGINE
  // Generates 4×6 inch thermal-printer-compatible labels.
  // ═══════════════════════════════════════════════════════════════════════════

  const WaybillLabel = {

    /**
     * Generates HTML for a single waybill label.
     * @param {object} booking - Booking details
     * @param {string} childAWB - AWB for this specific box
     * @param {number} boxIndex - 1-based box number
     * @param {number} totalBoxes - Total number of boxes
     */
    generateLabelHTML(booking, childAWB, boxIndex, totalBoxes) {
      const boxes = JSON.parse(booking.boxes || '[]');
      const box   = boxes[boxIndex - 1] || {};

      return `
        <div class="waybill-label">
          <div class="wl-header">
            <div class="wl-brand">NUVANA EXPRESS</div>
            <div class="wl-service">${booking.shipmentType || 'International'}</div>
          </div>

          <div class="wl-awb">
            <div class="wl-awb-label">AWB Number</div>
            <div class="wl-awb-value">${childAWB}</div>
            <div class="wl-awb-sub">Box ${boxIndex} of ${totalBoxes} | Master: ${booking.masterAWB}</div>
          </div>

          <div class="wl-parties">
            <div class="wl-section">
              <div class="wl-section-title">FROM (Shipper)</div>
              <div class="wl-name">${booking.shipperName}</div>
              <div class="wl-address">${booking.shipperAddress || ''}, ${booking.shipperCity || ''}</div>
              <div class="wl-address">${booking.shipperState || ''}, ${booking.originCountry || ''} ${booking.postalCode || ''}</div>
              <div class="wl-phone">${booking.contactNumber || ''}</div>
            </div>

            <div class="wl-divider"></div>

            <div class="wl-section">
              <div class="wl-section-title">TO (Consignee)</div>
              <div class="wl-name">${booking.receiverNameInt}</div>
              <div class="wl-address">${booking.receiverAddress || ''}, ${booking.consigneeCity || ''}</div>
              <div class="wl-address">${booking.consigneeState || ''}, ${booking.destCountry || ''} ${booking.zipCode || ''}</div>
              <div class="wl-phone">${booking.receiverPhoneInt || ''}</div>
            </div>
          </div>

          <div class="wl-details">
            <div class="wl-detail-row">
              <span>Weight:</span><strong>${box.actualWeight || 0} kg actual / ${box.cw || 0} kg chargeable</strong>
            </div>
            <div class="wl-detail-row">
              <span>Dimensions:</span><strong>${box.length || 0}×${box.width || 0}×${box.height || 0} cm</strong>
            </div>
            <div class="wl-detail-row">
              <span>Commodity:</span><strong>${booking.commodity || '—'}</strong>
            </div>
            <div class="wl-detail-row">
              <span>Declared Value:</span><strong>USD ${booking.shipmentValue || '0'}</strong>
            </div>
          </div>

          <div class="wl-footer">
            <div class="wl-dest-badge">${booking.destCountry || 'DESTINATION'}</div>
            <div class="wl-date">Date: ${new Date().toLocaleDateString('en-GB')}</div>
          </div>
        </div>`;
    },

    /**
     * Opens a new print window with all waybill labels.
     * @param {object} booking - Full booking details
     */
    printAll(booking) {
      if (!booking) return;

      const childAWBs   = JSON.parse(booking.childAWBs || '[]');
      const totalBoxes  = childAWBs.length || 1;

      const labelsHTML = childAWBs.length > 0
        ? childAWBs.map((awb, i) => this.generateLabelHTML(booking, awb, i + 1, totalBoxes)).join('')
        : this.generateLabelHTML(booking, booking.masterAWB, 1, 1);

      const printWindow = window.open('', '_blank', 'width=500,height=700');
      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Waybill Labels — ${booking.masterAWB}</title>
  <style>
    @media print {
      @page { size: 4in 6in; margin: 0; }
      body  { margin: 0; }
      .waybill-label { page-break-after: always; }
      .waybill-label:last-child { page-break-after: auto; }
    }
    * { box-sizing: border-box; }
    body { font-family: 'Arial Narrow', Arial, sans-serif; margin: 0; padding: 0; background: white; }
    .waybill-label { width: 4in; height: 6in; padding: 0.2in; border: 2px solid #000; display: flex; flex-direction: column; gap: 0.1in; overflow: hidden; }
    .wl-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 0.08in; }
    .wl-brand  { font-size: 14pt; font-weight: 900; letter-spacing: 0.04em; }
    .wl-service{ font-size: 8pt; font-weight: 700; text-transform: uppercase; background: #000; color: #fff; padding: 2px 6px; border-radius: 3px; }
    .wl-awb    { text-align: center; padding: 0.1in 0; border-bottom: 1.5px solid #000; }
    .wl-awb-label { font-size: 7pt; text-transform: uppercase; letter-spacing: 0.06em; color: #555; }
    .wl-awb-value { font-size: 18pt; font-weight: 900; letter-spacing: 0.06em; line-height: 1.1; font-family: 'Courier New', monospace; }
    .wl-awb-sub   { font-size: 6.5pt; color: #666; margin-top: 2px; }
    .wl-parties { display: flex; flex-direction: column; gap: 0.06in; flex: 1; }
    .wl-section { padding: 0.06in; border: 1px solid #ccc; border-radius: 3px; }
    .wl-section-title { font-size: 6.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #555; margin-bottom: 2px; }
    .wl-name    { font-size: 10pt; font-weight: 700; }
    .wl-address { font-size: 7.5pt; line-height: 1.3; color: #333; }
    .wl-phone   { font-size: 7.5pt; color: #444; margin-top: 2px; }
    .wl-divider { height: 1px; background: #ccc; }
    .wl-details { border-top: 1.5px solid #000; padding-top: 0.06in; }
    .wl-detail-row { display: flex; justify-content: space-between; font-size: 7.5pt; line-height: 1.5; }
    .wl-detail-row span { color: #555; }
    .wl-footer  { display: flex; justify-content: space-between; align-items: center; border-top: 1.5px solid #000; padding-top: 0.06in; margin-top: auto; }
    .wl-dest-badge { font-size: 12pt; font-weight: 900; background: #000; color: #fff; padding: 2px 10px; border-radius: 3px; letter-spacing: 0.04em; }
    .wl-date    { font-size: 7pt; color: #555; }
  </style>
</head>
<body>${labelsHTML}</body>
</html>`);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 400);
    },
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 8 — PUBLIC API
  // Only expose what external code needs.
  // ═══════════════════════════════════════════════════════════════════════════

  return {

    /**
     * Initializes the International Booking module.
     * Must be called once the DOM is ready.
     * @param {string} scriptURL - Google Apps Script URL
     */
    init(scriptURL) {
      if (!scriptURL) {
        console.error('[InternationalBookingModule] scriptURL is required.');
        return;
      }
      state.scriptURL = scriptURL;

      // Populate dropdowns from country master data
      UIController.populateCountryDropdowns();
      UIController.populateIdTypeDropdowns();

      // Add initial box row
      UIController.addBoxRow();

      // Bind all events
      EventSetup.setup();

      console.log('[InternationalBookingModule] Initialized.');
    },

    // Exposed for external call if needed (e.g., app.js reset)
    reset() {
      UIController.resetForm();
    },
  };

})();