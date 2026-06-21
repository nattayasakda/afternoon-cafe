const SUPABASE_URL = 'https://foqtfwjzjcmdirbhypxi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcXRmd2p6amNtZGlyYmh5cHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMTEzNzksImV4cCI6MjA5NzU4NzM3OX0.2CKYjU3siIkClPtwN8V7xits7citfOq_Qp9mpS4kG9s';

let supabaseClient = null;
if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    showError("Supabase script is not loaded! Please check your network or ad blocker.");
}

document.addEventListener('DOMContentLoaded', () => {
    fetchReservations();
});

function showLoading() {
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('dataState').style.display = 'none';
}

function showError(message) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('dataState').style.display = 'none';
    if(message) {
        document.getElementById('errorMessage').innerText = message;
    }
}

function showEmpty() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('dataState').style.display = 'none';
}

function showData(reservations) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('dataState').style.display = 'block';
    
    const tbody = document.getElementById('reservationsTableBody');
    tbody.innerHTML = '';
    
    reservations.forEach(res => {
        const tr = document.createElement('tr');
        
        // Status badge styling
        let statusClass = 'status-booked';
        if(res.status === 'Cancelled') statusClass = 'status-cancelled';
        if(res.status === 'Arrived') statusClass = 'status-arrived';
        
        tr.innerHTML = `
            <td><strong>${res.reference_code}</strong></td>
            <td>${res.booking_date}</td>
            <td>${res.time_slot.substring(0,5)}</td>
            <td>${res.customer_name}</td>
            <td>${res.phone_number}</td>
            <td>${res.pax}</td>
            <td><span class="status-badge ${statusClass}">${res.status || 'Booked'}</span></td>
            <td>${res.note || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

async function fetchReservations() {
    if (!supabaseClient) return;
    
    showLoading();
    
    try {
        const { data, error } = await supabaseClient
            .from('reservations')
            .select('*')
            .order('booking_date', { ascending: false })
            .order('time_slot', { ascending: false });
            
        if (error) {
            throw error;
        }
        
        if (!data || data.length === 0) {
            showEmpty();
        } else {
            showData(data);
        }
        
    } catch (err) {
        console.error('Fetch error:', err);
        showError('ไม่สามารถดึงข้อมูลได้: ' + err.message);
    }
}
