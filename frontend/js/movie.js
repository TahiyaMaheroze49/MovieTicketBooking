
const CINEMA_API = "http://https://movieticketbooking-0amx.onrender.com/cinemas";
const SHOW_API = "http://https://movieticketbooking-0amx.onrender.com/shows";

// Get selected movie
const movieData = localStorage.getItem("selectedMovie");
const movie = movieData ? JSON.parse(movieData) : null;

// Get HTML elements
const movieDetails = document.getElementById("movieDetails");
const cinemaSelect = document.getElementById("cinemaSelect");
const dateInput = document.getElementById("showDate");
const showTimes = document.getElementById("showTimes");
const message = document.getElementById("bookingMessage");

// Store cinema and show information
let cinemas = [];
let availableShows = [];
let selectedTime = "";
let selectedShowId = null;


// Display movie details
if (movie) {
    movieDetails.innerHTML = `
        <div class="details-card">
            <img src="${movie.poster}"
                 alt="${movie.name}"
                 onerror="this.src='https://placehold.co/400x600/202027/ffffff?text=Movie+Poster'">

            <div class="details-info">
                <h1>${movie.name}</h1>
                <p>Genre: ${movie.genre}</p>
                <p>Language: ${movie.language}</p>
                <p>Duration: ${movie.duration}</p>
                <p class="rating">★ ${movie.rating}</p>
                <p>Choose your preferred cinema and showtime to continue booking.</p>
            </div>
        </div>
    `;
} else {
    movieDetails.innerHTML = `
        <h2>No movie selected!</h2>
        <p>Please go back and select a movie.</p>
        <a href="index.html" class="hero-btn">Browse Movies</a>
    `;
}


// Fetch cinemas from MySQL
async function fetchCinemas() {
    try {
        const response = await fetch(CINEMA_API);

        if (!response.ok) {
            throw new Error("Could not fetch cinemas");
        }

        cinemas = await response.json();

        cinemaSelect.innerHTML =
            '<option value="">Select a cinema</option>';

        cinemas.forEach(cinema => {
            const option = document.createElement("option");

            option.value = cinema.cinema_id;
            option.textContent =
                `${cinema.cinema_name} - ${cinema.location}`;

            cinemaSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Cinema error:", error);

        cinemaSelect.innerHTML =
            '<option value="">Unable to load cinemas</option>';
    }
}


// Fetch showtimes from MySQL
async function fetchShowtimes() {

    // Reset the selected showtime
    selectedTime = "";
    selectedShowId = null;

    const cinemaId = cinemaSelect.value;
    const date = dateInput.value;

    // Check whether cinema and date are selected
    if (!cinemaId || !date || !movie) {
        showTimes.innerHTML =
            "<p>Please select a cinema and date first.</p>";
        return;
    }

    showTimes.innerHTML = "<p>Loading showtimes...</p>";

    try {
        // Send movie, cinema and date to the backend
        const url =
            `${SHOW_API}?movieId=${movie.id}&cinemaId=${cinemaId}&date=${date}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Could not fetch showtimes");
        }

        availableShows = await response.json();

        showTimes.innerHTML = "";

        if (availableShows.length === 0) {
            showTimes.innerHTML =
                "<p>No shows available for this date.</p>";
            return;
        }

        // Create a button for each available show
        availableShows.forEach(show => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "time-btn";
            button.textContent = show.show_time;

            button.addEventListener("click", function() {
                selectTime(button, show);
            });

            showTimes.appendChild(button);
        });

    } catch (error) {
        console.error("Showtime error:", error);

        showTimes.innerHTML =
            "<p>Unable to load showtimes. Please try again.</p>";
    }
}


// Select a showtime
function selectTime(button, show) {

    selectedTime = show.show_time;
    selectedShowId = show.show_id;

    // Remove selection from other buttons
    document.querySelectorAll(".time-btn").forEach(btn => {
        btn.classList.remove("selected-time");
    });

    // Highlight selected button
    button.classList.add("selected-time");
}


// Load showtimes when cinema changes
cinemaSelect.addEventListener("change", fetchShowtimes);

// Load showtimes when date changes
dateInput.addEventListener("change", fetchShowtimes);


// Continue to seat selection
function continueToSeats() {

    const cinemaId = Number(cinemaSelect.value);

    const selectedCinema = cinemas.find(
        cinema => Number(cinema.cinema_id) === cinemaId
    );

    const date = dateInput.value;

    if (!movie) {
        message.textContent = "Please select a movie first.";
        return;
    }

    if (!selectedCinema) {
        message.textContent = "Please select a cinema.";
        return;
    }

    if (!date) {
        message.textContent = "Please select a date.";
        return;
    }

    if (!selectedTime || !selectedShowId) {
        message.textContent = "Please select an available showtime.";
        return;
    }

    // Save all selected show details
    const showDetails = {
        showId: selectedShowId,
        movieId: movie.id,
        movieName: movie.name,
        cinemaId: selectedCinema.cinema_id,
        cinema: selectedCinema.cinema_name,
        location: selectedCinema.location,
        date: date,
        time: selectedTime
    };

    localStorage.setItem(
        "selectedShow",
        JSON.stringify(showDetails)
    );

    // Continue to seat selection
    window.location.href = "seats.html";
}


// Set minimum date to today
const todayDate = new Date();

const year = todayDate.getFullYear();
const month = String(todayDate.getMonth() + 1).padStart(2, "0");
const day = String(todayDate.getDate()).padStart(2, "0");

dateInput.min = `${year}-${month}-${day}`;


// Load cinemas when the page opens
fetchCinemas();
