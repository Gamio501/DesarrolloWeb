function getToken() {
    return localStorage.getItem("token");
}

function authHeaders() {
    const token = getToken();
    return token ? { "Authorization": "Bearer " + token } : {};
}

async function esAdmin() {
    const token = getToken();
    if (!token) {
        return false;
    }
    const resp = await fetch("/productos/check-admin", { headers: authHeaders() });
    return resp.ok;
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "/vista/home";
}

async function initNavbar() {
    const token = getToken();
    const linkLogin = document.getElementById("nav-login");
    const linkLogout = document.getElementById("nav-logout");
    const linkAdmin = document.getElementById("nav-admin");
    const linkMiTienda = document.getElementById("nav-mi-tienda");
    const linkRegister = document.getElementById("nav-register");

    if (linkLogin) linkLogin.style.display = token ? "none" : "inline-block";
    if (linkLogout) linkLogout.style.display = token ? "inline-block" : "none";
    if (linkRegister) linkRegister.style.display = token ? "none" : "inline-block";

    const admin = token && await esAdmin();
    if (linkAdmin) linkAdmin.style.display = admin ? "inline-block" : "none";
    if (linkMiTienda) linkMiTienda.style.display = admin ? "inline-block" : "none";
}

function filtrarPorNombre(selector, termino) {
    const q = termino.trim().toLowerCase();
    document.querySelectorAll(selector).forEach(function (el) {
        const nombre = (el.dataset.nombre || "").toLowerCase();
        el.style.display = !q || nombre.includes(q) ? "" : "none";
    });
}

function imagenTienda(nombre) {
  const texto = encodeURIComponent(nombre || "Tienda");
  return "https://ui-avatars.com/api/?name=" + texto + "&size=240&background=e8eef5&color=0056b3&bold=true";
}
