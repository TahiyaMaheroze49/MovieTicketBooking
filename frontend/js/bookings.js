
// Get the booking container
const bookingContainer = document.getElementById("bookingContainer");

// Read the latest confirmed booking from browser storage
const bookingData = localStorage.getItem("confirmedBooking");


// Display booking details
function displayBooking() {

    if (!bookingData) {
        bookingContainer.innerHTML = `
            <h2>No bookings found!</h2>
            <p>You have not booked any movie tickets yet.</p>
            <a href="index.html" class="hero-btn">Book a Movie</a>
        `;
        return;
    }

    const booking = JSON.parse(bookingData);

    // Read customer and show details
    const details = booking.bookingDetails || booking;
    const show = details.show || details;
    const seats = details.seats || booking.seats || [];

    const customerName =
        booking.customerName ||
        booking.fullName ||
        booking.customer?.fullName ||
        "Customer";

    const ticketId =
        booking.ticketId ||
        booking.ticket_id ||
        "Not available";

    const movieName =
        show.movieName ||
        booking.movieName ||
        "Not available";

    const cinema =
        show.cinema ||
        booking.cinema ||
        "Not available";

    const date =
        show.date ||
        booking.date ||
        "Not available";

    const time =
        show.time ||
        booking.time ||
        "Not available";

    const totalAmount =
        details.totalAmount ??
        booking.totalAmount ??
        booking.total_amount ??
        0;

    // Display the booking card
    bookingContainer.innerHTML = `
        <div class="details-card">
            <div class="details-info">

                <h2>${movieName}</h2>

                <p><strong>Ticket ID:</strong> ${ticketId}</p>
                <p><strong>Customer:</strong> ${customerName}</p>
                <p><strong>Cinema:</strong> ${cinema}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Show Time:</strong> ${time}</p>
                <p><strong>Seats:</strong> ${
                    Array.isArray(seats) ? seats.join(", ") : seats
                }</p>
                <p><strong>Total Amount:</strong> ₹${totalAmount}</p>

                <p class="rating">Booking Confirmed</p>

            </div>
        </div>

        <a href="index.html" class="hero-btn">Book Another Movie</a>
    `;
}

// Run the function when the page opens
displayBooking();
