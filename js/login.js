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

    //var url = location.hostname
    var url = "192.168.0.16:5002"
    var res = await connection(JSON.stringify({ type: 'login', username, password }), `ws://${url}`)
    if (res === "BadPassword") {
        loginErrorMsg.style.opacity = 1;
    }else{
        sessionStorage.setItem("sessionId", res);

    }
    console.log(res)
})