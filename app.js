// The API link to your Google Apps Script
const scriptURL = 'https://script.google.com/macros/s/AKfycbweIJLcyZTR619HQgD3IJvHI2Dn-3EnT7WEo3g0pKeCsPdPZCeSnhyonP_1QQjd5pQw/exec';

// Grab the form element from the HTML
const form = document.getElementById('bookingForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const loadingIcon = document.getElementById('loadingIcon');

// Listen for when the user clicks 'Transmit to Database'
form.addEventListener('submit', async (e) => {
    // Prevent the page from refreshing when the form is submitted
    e.preventDefault();
    
    // UI Update: Show loading state
    btnText.innerText = "Transmitting...";
    loadingIcon.classList.remove('hidden');
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-50', 'cursor-not-allowed');

    // Gather the data from the inputs
    const formData = {
        awb: document.getElementById('awb').value,
        branchId: "HQ-01", // Hardcoded for now, will be dynamic later based on login
        senderName: document.getElementById('senderName').value,
        senderPhone: document.getElementById('senderPhone').value,
        receiverName: document.getElementById('receiverName').value,
        receiverPhone: document.getElementById('receiverPhone').value,
        pincode: document.getElementById('pincode').value,
        weight: document.getElementById('weight').value
    };

    try {
        // Send the data securely to Google Apps Script
        const response = await fetch(scriptURL, {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                // Using text/plain avoids tricky CORS errors with Google servers
                'Content-Type': 'text/plain;charset=utf-8', 
            }
        });
        
        const result = await response.json();
        
        if(result.result === 'success') {
            alert('Success! Booking securely saved to the database.');
            form.reset(); // Clear the form for the next booking
        } else {
            alert('Error from server: ' + result.error);
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        alert('Transmission failed. Check your internet connection.');
    } finally {
        // UI Update: Revert button to normal state
        btnText.innerText = "Transmit to Database";
        loadingIcon.classList.add('hidden');
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
});