
// Get selected show details
const selectedShow = JSON.parse(
    localStorage.getItem("selectedShow")
);

// Get HTML elements
const seatContainer = document.getElementById("seatContainer");
const showInfo = document.getElementById("showInfo");
const selectedSeatsText = document.getElementById("selectedSeats");
const totalAmountText = document.getElementById("totalAmount");
const seatMessage = document.getElementById("seatMessage");

// Store selected seats and booked seats
let selectedSeats = [];
let bookedSeats = [];

// Seat prices
const seatPrices = {
    A: 150,
    B: 150,
    C: 180,
    D: 180,
    E: 220,
    F: 220
};

// Display selected movie and show details
if (selectedShow) {

    showInfo.innerHTML = `
        <h3>${selectedShow.movieName}</h3>
        <p>${selectedShow.cinema}</p>
        <p>${selectedShow.date} | ${selectedShow.time}</p>
    `;

    // Fetch booked seats from MySQL
    fetchBookedSeats();

} else {

    showInfo.innerHTML =
        "<p>Please select a movie and showtime first.</p>";

    seatContainer.innerHTML = "";
}


// Fetch already-booked seats from backend
async function fetchBookedSeats() {

    try {

        const response = await fetch(
            `http://localhost:5000/shows/${selectedShow.showId}/seats`
        );

        if (!response.ok) {
            throw new Error("Unable to fetch booked seats");
        }

        bookedSeats = await response.json();

        // Create seat layout after getting booked seats
        createSeats();

    } catch (error) {

        console.error("Seat loading error:", error);

        seatMessage.textContent =
            "Unable to load seats. Please check your backend.";

        seatContainer.innerHTML = "";
    }
}


// Create six rows of eight seats
function createSeats() {

    seatContainer.innerHTML = "";

    const rows = ["A", "B", "C", "D", "E", "F"];

    rows.forEach(row => {

        const rowDiv = document.createElement("div");
        rowDiv.className = "seat-row";

        const rowLabel = document.createElement("span");
        rowLabel.className = "row-label";
        rowLabel.textContent = row;

        rowDiv.appendChild(rowLabel);

        for (let number = 1; number <= 8; number++) {

            const seatName = row + number;

            const seat = document.createElement("button");
            seat.type = "button";
            seat.textContent = number;
            seat.className = "seat";

            // Check whether this seat is already booked
            if (bookedSeats.includes(seatName)) {

                seat.classList.add("booked");
                seat.disabled = true;

            } else {

                seat.classList.add("available");

                seat.addEventListener("click", function () {
                    toggleSeat(seatName, seat);
                });
            }

            rowDiv.appendChild(seat);
        }

        seatContainer.appendChild(rowDiv);
    });
}


// Select or deselect seats
function toggleSeat(seatName, seatElement) {

    if (selectedSeats.includes(seatName)) {

        selectedSeats = selectedSeats.filter(
            seat => seat !== seatName
        );

        seatElement.classList.remove("selected");
        seatElement.classList.add("available");

    } else {

        selectedSeats.push(seatName);

        seatElement.classList.remove("available");
        seatElement.classList.add("selected");
    }

    updateSummary();
}


// Calculate total amount
function updateSummary() {

    const total = selectedSeats.reduce((sum, seat) => {
        return sum + seatPrices[seat.charAt(0)];
    }, 0);

    selectedSeatsText.textContent =
        selectedSeats.length > 0
            ? selectedSeats.join(", ")
            : "None";

    totalAmountText.textContent = total;
}


// Continue to checkout
function continueToCheckout() {

    if (!selectedShow) {
        seatMessage.textContent =
            "Please select a movie first.";
        return;
    }

    if (selectedSeats.length === 0) {
        seatMessage.textContent =
            "Please select at least one seat.";
        return;
    }

    const bookingDetails = {
        ...selectedShow,
        seats: selectedSeats,
        totalAmount: Number(totalAmountText.textContent)
    };

    localStorage.setItem(
        "bookingDetails",
        JSON.stringify(bookingDetails)
    );

    window.location.href = "checkout.html";
}
