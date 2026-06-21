/**
 * @jest-environment jsdom
 */

// Mock IntersectionObserver which does not exist in JSDOM
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Mock Supabase to prevent real network calls
window.supabase = {
    createClient: jest.fn(() => ({
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ data: [], error: null })
    }))
};

// Setup a minimal DOM needed for the tests
document.body.innerHTML = `
    <div id="bookingModal" class="modal-overlay"></div>
    <input type="date" id="bookingDate">
    <form id="bookingForm"></form>
    <div id="bookingFormSection"></div>
    <div id="successSection"></div>
    <div id="errorMessage"></div>
    <button id="submitBtn">Confirm Booking</button>
    <div class="navbar"></div>
    <div class="menu-card"></div>
`;

// Require the script after setting up the mocks and DOM
const { generateRefCode, openBookingModal, closeBookingModal } = require('./script.js');

describe('Coffee Shop Script Unit Tests', () => {
    test('generateRefCode should return correct format BNC-XXXX', () => {
        const code = generateRefCode();
        expect(code).toMatch(/^BNC-\d{4}$/);
    });

    test('openBookingModal should add "active" class and set correct display states', () => {
        openBookingModal();
        expect(document.getElementById('bookingModal').classList.contains('active')).toBe(true);
        expect(document.getElementById('bookingFormSection').style.display).toBe('block');
        expect(document.getElementById('successSection').style.display).toBe('none');
    });

    test('closeBookingModal should remove "active" class', () => {
        document.getElementById('bookingModal').classList.add('active');
        closeBookingModal();
        expect(document.getElementById('bookingModal').classList.contains('active')).toBe(false);
    });
});
