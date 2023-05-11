const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-form-submit");
const loginErrorMsg = document.getElementById("login-error-msg");

async function connection(message, url) {
    return new Promise((resolve, reject) => {
        var socket = new WebSocket(url);
        socket.onopen = () => {
            socket.send(message);
        };
        socket.onmessage = (event) => {
            resolve(event.data);
        };
        socket.onerror = (error) => {
            reject(error);
        };
    });
}

loginButton.addEventListener("click", async(e) => {
    e.preventDefault();
    const username = loginForm.username.value;
    const password = loginForm.password.value;
    const name = loginForm.name.value;
    const email = loginForm.email.value
    var url //= location.host
    url = `${location.hostname}:5002`
    await connection(JSON.stringify({
        type: 'signUp',
        username,
        password,
        name,
        email
    }), `ws://${url}`)


})