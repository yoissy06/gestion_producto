document.addEventListener("DOMContentLoaded", function () {
    let usuario_id = localStorage.getItem("usuario_id");
    let usuario_nombre = localStorage.getItem("usuario");

    if (!usuario_id) {
        mostrarMensaje("Debes iniciar sesión primero.");
        window.location.href = "index.html";
        return;
    }

    document.getElementById("bienvenida").textContent = `Bienvenido, ${usuario_nombre}`;
    cargarProductos(usuario_id);

    document.getElementById("agregarProductoForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        let nombre = document.getElementById("nombreProducto").value.trim();
        let descripcion = document.getElementById("descripcionProducto").value.trim();
        let precio = parseFloat(document.getElementById("precioProducto").value.trim());

        if (!nombre || !descripcion || isNaN(precio)) {
            mostrarMensaje("Todos los campos son obligatorios y el precio debe ser un número.");
            return;
        }

        let datos = { nombre, descripcion, precio, usuario_id };

        try {
            let response = await fetch("http://localhost:5000/productos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos),
            });

            let resultado = await response.json();
            mostrarMensaje(resultado.mensaje);
            cargarProductos(usuario_id);
        } catch (error) {
            mostrarMensaje("Error al agregar producto.");
            console.error(error);
        }
    });

    document.getElementById("cerrarSesion").addEventListener("click", function () {
        localStorage.clear();
        window.location.href = "index.html";
    });
});

async function cargarProductos(usuario_id) {
    try {
        let response = await fetch(`http://localhost:5000/productos/${usuario_id}`);
        let productos = await response.json();

        let tabla = document.getElementById("tablaProductos");
        tabla.innerHTML = "";

        if (!Array.isArray(productos) || productos.length === 0) {
            tabla.innerHTML = "<tr><td colspan='5'>No hay productos</td></tr>";
            return;
        }

        productos.forEach(prod => {
            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${prod.id}</td>
                <td contenteditable="false">${prod.nombre}</td>
                <td contenteditable="false">${prod.descripcion}</td>
                <td contenteditable="false">${prod.precio}</td>
                <td>
                    <button onclick="editarProducto(${prod.id}, this)">Editar</button>
                    <button onclick="eliminarProducto(${prod.id})">Eliminar</button>
                </td>
            `;
            tabla.appendChild(fila);
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

async function eliminarProducto(id) {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

    try {
        let response = await fetch(`http://localhost:5000/productos/${id}`, {
            method: "DELETE",
        });

        let resultado = await response.json();
        mostrarMensaje(resultado.mensaje);
        cargarProductos(localStorage.getItem("usuario_id"));
    } catch (error) {
        mostrarMensaje("Error al eliminar producto.");
        console.error(error);
    }
}

function editarProducto(id, boton) {
    let fila = boton.closest("tr");
    let celdas = fila.querySelectorAll("td:not(:last-child)");

    if (boton.textContent === "Editar") {
        celdas.forEach(td => td.setAttribute("contenteditable", "true"));
        boton.textContent = "Guardar";
    } else {
        let nombre = celdas[1].textContent.trim();
        let descripcion = celdas[2].textContent.trim();
        let precio = Number(celdas[3].textContent.trim());

        actualizarProducto(id, { nombre, descripcion, precio })
            .then(() => {
                celdas.forEach(td => td.removeAttribute("contenteditable"));
                boton.textContent = "Editar";
                cargarProductos(localStorage.getItem("usuario_id"));
            })
            .catch(error => console.error("Error al actualizar:", error));
    }
}

async function actualizarProducto(id, datos) {
    try {
        let response = await fetch(`http://localhost:5000/productos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos),
        });

        let data = await response.json();
        mostrarMensaje(data.mensaje);
        return data;
    } catch (error) {
        console.error("Error en la solicitud:", error);
        mostrarMensaje("Error al actualizar el producto.");
    }
}

function mostrarMensaje(mensaje) {
    let p = document.createElement("p");
    p.textContent = mensaje;
    document.body.appendChild(p);

    setTimeout(() => {
        p.remove();
    }, 1000);
}
