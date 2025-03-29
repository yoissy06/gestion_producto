document.getElementById("registroForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const nombre = document.getElementById("nombre").value.trim();
    const usuario = document.getElementById("usuario").value.trim();
    const contrasena = document.getElementById("contraseña").value;

    try {
        const response = await fetch("http://127.0.0.1:5000/registro", {  
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, usuario, contrasena })  
        });

        if (response.ok) {
            window.location.href = "index.html";  // Redirige después del registro exitoso
        }
    } catch (error) {
        console.error("Error en la conexión con el servidor.");
    }
});
