
// API URL to get movies from MySQL
const API_URL = "http://https://movieticketbooking-0amx.onrender.com/movies";

// Store movies fetched from the database
let movies = [];


// Convert duration from minutes into hours and minutes
function formatDuration(minutes) {

    const totalMinutes = Number(minutes);

    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    return `${hours}h ${remainingMinutes}m`;
}


// Fetch movies from the backend
async function fetchMovies() {

    const container = document.getElementById("movieContainer");

    container.innerHTML = "<p>Loading movies...</p>";

    try {

        // Send request to the backend API
        const response = await fetch(API_URL);

        // Check if request was successful
        if (!response.ok) {
            throw new Error("Failed to fetch movies");
        }

        // Convert response into JSON
        const data = await response.json();

        // Convert database fields into the format used by our frontend
        movies = data.map(movie => ({

            id: Number(movie.movie_id),

            name: movie.title,

            genre: movie.genre,

            language: movie.language,

            duration: formatDuration(movie.duration),

            rating: "N/A",

            // Poster images should be placed in frontend/images
            poster: movie.poster
                ? `images/${movie.poster}`
                : "https://placehold.co/400x600/202027/ffffff?text=Movie+Poster"

        }));

        // Display movies on homepage
        displayMovies(movies);

    } catch (error) {

        console.error("Error:", error);

        container.innerHTML =
            "<p>Unable to load movies. Please check your backend server.</p>";

    }

}


// Display movies on the homepage
function displayMovies(movieList) {

    const container = document.getElementById("movieContainer");

    container.innerHTML = "";

    // Display each movie
    movieList.forEach(movie => {

        container.innerHTML += `

            <div class="movie-card">

                <img
                    src="${movie.poster}"
                    alt="${movie.name} poster"
                    onerror="this.onerror=null; this.src='https://placehold.co/400x600/202027/ffffff?text=Movie+Poster'"
                >

                <div class="movie-info">

                    <h3>${movie.name}</h3>

                    <p>${movie.genre}</p>

                    <p>${movie.language} | ${movie.duration}</p>

                    <p class="rating">★ ${movie.rating}</p>

                    <button
                        class="book-btn"
                        onclick="selectMovie(${movie.id})"
                    >
                        Book Now
                    </button>

                </div>

            </div>

        `;

    });

    // Show message if no movies are available
    document.getElementById("noResults").hidden =
        movieList.length !== 0;

}


// Search movies by name, genre or language
function searchMovies() {

    const searchValue = document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    const filteredMovies = movies.filter(movie =>

        movie.name.toLowerCase().includes(searchValue) ||

        movie.genre.toLowerCase().includes(searchValue) ||

        movie.language.toLowerCase().includes(searchValue)

    );

    displayMovies(filteredMovies);

}


// Select a movie and open its details page
function selectMovie(movieId) {

    const selectedMovie = movies.find(movie =>
        movie.id === Number(movieId)
    );

    if (!selectedMovie) {
        alert("Movie not found!");
        return;
    }

    // Save selected movie in browser storage
    localStorage.setItem(
        "selectedMovie",
        JSON.stringify(selectedMovie)
    );

    // Open movie details page
    window.location.href = "movie.html";

}


// Search when Enter key is pressed
document.getElementById("searchInput").addEventListener(
    "keypress",
    function(event) {

        if (event.key === "Enter") {
            searchMovies();
        }

    }
);


// Fetch movies when homepage opens
fetchMovies();
