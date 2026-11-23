
const API_URL = "http://https://movieticketbooking-0amx.onrender.com/bookings";

// Get booking details from seat selection
const bookingDetails = JSON.parse(
    localStorage.getItem("bookingDetails") || "null"
);

// Get HTML elements
const checkoutMovie = document.getElementById("checkoutMovie");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutMessage = document.getElementById("checkoutMessage");
const confirmationBox = document.getElementById("confirmationBox");

// Display booking summary
if (bookingDetails) {

    checkoutMovie.innerHTML = `
        <p><strong>Movie:</strong> ${bookingDetails.movieName}</p>
        <p><strong>Cinema:</strong> ${bookingDetails.cinema}</p>
        <p><strong>Date:</strong> ${bookingDetails.date}</p>
        <p><strong>Showtime:</strong> ${bookingDetails.time}</p>
        <p><strong>Seats:</strong> ${bookingDetails.seats.join(", ")}</p>
    `;

    checkoutTotal.textContent = bookingDetails.totalAmount;

} else {

    checkoutMovie.innerHTML = `
        <p>No booking details found.</p>
        <p>Please select a movie and seats first.</p>
    `;

    checkoutForm.style.display = "none";
}


// Confirm booking
checkoutForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    if (!bookingDetails) {
        checkoutMessage.textContent =
            "Please select a movie and seats first.";
        return;
    }

    const customerName =
        document.getElementById("customerName").value.trim();

    const customerEmail =
        document.getElementById("customerEmail").value.trim();

    const customerPhone =
        document.getElementById("customerPhone").value.trim();

    const paymentMethod =
        document.getElementById("paymentMethod").value;

    // Validate payment method
    if (!paymentMethod) {
        checkoutMessage.textContent =
            "Please select a payment method.";
        return;
    }

    // Validate phone number
    if (!/^\d{10}$/.test(customerPhone)) {
        checkoutMessage.textContent =
            "Please enter a valid 10-digit mobile number.";
        return;
    }

    // Validate show ID
    if (!bookingDetails.showId) {
        checkoutMessage.textContent =
            "Show information is missing. Please select your show again.";
        return;
    }

    const loggedInUser = JSON.parse(
        localStorage.getItem("loggedInUser") || "null"
    );

    // Prepare booking data
    const bookingData = {
        userId: loggedInUser ? loggedInUser.user_id : null,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        showId: bookingDetails.showId,
        seats: bookingDetails.seats,
        paymentMethod: paymentMethod
    };

    const confirmButton =
        checkoutForm.querySelector('button[type="submit"]');

    try {

        checkoutMessage.textContent = "Processing your booking...";
        confirmButton.disabled = true;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Booking failed."
            );
        }

        // Save confirmed booking
        const confirmedBooking = {
            ticketId: result.ticketId,
            bookingId: result.bookingId,
            customerName: customerName,
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            movieName: bookingDetails.movieName,
            cinema: bookingDetails.cinema,
            date: bookingDetails.date,
            time: bookingDetails.time,
            seats: result.seats,
            totalAmount: result.totalAmount,
            paymentMethod: paymentMethod,
            bookingDate: new Date().toLocaleString()
        };

        localStorage.setItem(
            "confirmedBooking",
            JSON.stringify(confirmedBooking)
        );

        // Display confirmation
        document.getElementById("ticketId").textContent =
            result.ticketId;

        document.getElementById("confirmationDetails").textContent =
            "Movie: " + bookingDetails.movieName +
            " | Cinema: " + bookingDetails.cinema +
            " | Seats: " + result.seats.join(", ") +
            " | Total: ₹" + result.totalAmount;

        confirmationBox.style.display = "block";
        checkoutForm.style.display = "none";

        checkoutMessage.textContent = "";

        confirmationBox.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error("Booking error:", error);

        checkoutMessage.textContent = error.message;

        confirmButton.disabled = false;
    }
});
