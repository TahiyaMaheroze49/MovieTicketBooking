
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    // Get the entered login details
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("loginMessage");

    try {
        // Send login details to the backend
        const response = await fetch("http://localhost:5000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            message.style.color = "green";
            message.textContent = data.message;

            // Save the logged-in user's details
            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(data.user)
            );

            // Go to the homepage after successful login
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);

        } else {
            message.style.color = "red";
            message.textContent = data.message;
        }

    } catch (error) {
        console.error("Login error:", error);
        message.style.color = "red";
        message.textContent = "Unable to connect to the server.";
    }
});
