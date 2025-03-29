document.addEventListener("DOMContentLoaded", function () {
    let form = document.getElementById("login-form");
    let mensaje = document.createElement("p"); // Para mostrar mensajes
    mensaje.style.color = "red"; // Estilo inicial para errores
    form.appendChild(mensaje);

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        let usuario = document.getElementById("usuario").value.trim();
        let contrasena = document.getElementById("contrasena").value.trim();

        let datos = { usuario, contrasena };

        try {
            let response = await fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos),
            });

            let resultado = await response.json();

            if (response.ok) {
                mensaje.textContent = "Inicio de sesión exitoso!";
                mensaje.style.color = "green"; // Mensaje en verde

                // Guardar en localStorage
                localStorage.setItem("token", resultado.token);
                localStorage.setItem("usuario", resultado.nombre);
                localStorage.setItem("usuario_id", resultado.usuario_id); // Guarda el ID también

                // Redirigir después de 1 segundo
                setTimeout(() => {
                    window.location.href = "productos.html";
                }, 1000);
            } else {
                mensaje.textContent = "Datos incorrectos. Intenta de nuevo.";
            }
        } catch (error) {
            mensaje.textContent = "Error en el servidor.";
        }
    });
});
