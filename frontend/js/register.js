
const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    // Get the values entered by the user
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const message = document.getElementById("registerMessage");

    // Check whether passwords match
    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match!";
        return;
    }

    try {
        // Send registration details to the backend
        const response = await fetch("http://localhost:5000/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName,
                email,
                phone,
                password
            })
        });

        const data = await response.json();

        // Display the backend response
        message.textContent = data.message;

        if (response.ok) {
            message.style.color = "green";
            registerForm.reset();

            // Redirect to login after a short delay
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } else {
            message.style.color = "red";
        }

    } catch (error) {
        console.error("Registration error:", error);
        message.style.color = "red";
        message.textContent = "Unable to connect to the server.";
    }
});
