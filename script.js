// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Intersection Observer for scroll animations (fade up on scroll)
const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Apply staggered animation to menu cards
document.querySelectorAll('.menu-card').forEach((card, index) => {
    // Stagger the animation delay based on card index
    card.style.transitionDelay = `${index * 0.15}s`;
    observer.observe(card);
});

// --- Supabase Booking Logic ---
const SUPABASE_URL = 'https://foqtfwjzjcmdirbhypxi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcXRmd2p6amNtZGlyYmh5cHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMTEzNzksImV4cCI6MjA5NzU4NzM3OX0.2CKYjU3siIkClPtwN8V7xits7citfOq_Qp9mpS4kG9s';

let supabaseClient = null;
if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error("Supabase script is not loaded! Please check your network or ad blocker.");
}

function openBookingModal() {
    document.getElementById('bookingModal').classList.add('active');
    
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').min = today;
    if(!document.getElementById('bookingDate').value) {
        document.getElementById('bookingDate').value = today;
    }
    
    // Reset forms
    document.getElementById('bookingForm').reset();
    document.getElementById('bookingFormSection').style.display = 'block';
    document.getElementById('successSection').style.display = 'none';
    document.getElementById('errorMessage').innerText = '';
}

function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('active');
}

// Generate random reference code
function generateRefCode() {
    return 'BNC-' + Math.floor(1000 + Math.random() * 9000);
}

async function handleBookingSubmit(event) {
    event.preventDefault();
    
    if (!supabaseClient) {
        alert("ระบบจองไม่พร้อมใช้งาน (Supabase ไม่ได้โหลด) กรุณารีเฟรชหน้าเว็บ");
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const errorMsg = document.getElementById('errorMessage');
    
    submitBtn.disabled = true;
    submitBtn.innerText = 'Processing...';
    errorMsg.innerText = '';
    
    const date = document.getElementById('bookingDate').value;
    const timeSlot = document.querySelector('input[name="timeSlot"]:checked').value;
    const pax = document.getElementById('pax').value;
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('phoneNumber').value;
    const note = document.getElementById('note').value;
    
    const refCode = generateRefCode();
    
    const bookingData = {
        reference_code: refCode,
        customer_name: name,
        phone_number: phone,
        booking_date: date,
        time_slot: timeSlot,
        pax: parseInt(pax),
        note: note || null,
        status: 'Booked'
    };
    
    try {
        const { data, error } = await supabaseClient
            .from('reservations')
            .insert([bookingData]);
            
        if (error) {
            console.error('Supabase error:', error);
            throw new Error(error.message);
        }
        
        // Show success
        document.getElementById('bookingFormSection').style.display = 'none';
        document.getElementById('successSection').style.display = 'block';
        
        // Populate receipt
        document.getElementById('refCodeDisplay').innerText = refCode;
        document.getElementById('rName').innerText = name;
        document.getElementById('rPhone').innerText = phone;
        document.getElementById('rDate').innerText = date;
        document.getElementById('rTime').innerText = timeSlot.substring(0, 5);
        document.getElementById('rPax').innerText = pax + ' People';
        document.getElementById('rNote').innerText = note || '-';
        
    } catch (err) {
        console.error('Booking Error:', err);
        errorMsg.innerText = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง (' + err.message + ')';
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Confirm Booking';
    }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateRefCode,
        openBookingModal,
        closeBookingModal,
        handleBookingSubmit
    };
}
