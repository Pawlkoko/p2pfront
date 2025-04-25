const API_URL = "https://p2p-pzh0.onrender.com/api";

function register() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Uzupełnij oba pola!");
        return;
    }

    fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    }).then(res => {
        if (res.ok) {
            alert("Zarejestrowano! Możesz się zalogować.");
        } else {
            res.text().then(msg => alert("Błąd rejestracji: " + msg));
        }
    }).catch(err => alert("Błąd połączenia z serwerem."));
}

function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Uzupełnij oba pola!");
        return;
    }

    fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    }).then(res => {
        if (res.ok) {
            localStorage.setItem("username", username);
            window.location.href = "chat.html";
        } else {
            res.text().then(msg => alert("Błąd logowania: " + msg));
        }
    }).catch(err => alert("Błąd połączenia z serwerem."));
}
