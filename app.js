/* =====================================================
   MI TIENDA
   Sistema de inventario y ventas conectado a Google Sheets
   ===================================================== */

// URL de tu Google Apps Script desplegado (reemplaza con la tuya si cambia)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwJCxmfzwVg_7OvdnAhuyBVYgwC88W7PiOzNTBKhJdvthbs7d7zam18JlU4OrA_ShCZ/exec"; // PEGA AQUÍ LA URL QUE OBTUVISTE EN APPS SCRIPT

/* ================= DATOS ================= */

let productos = JSON.parse(
    localStorage.getItem("productos") || "[]"
);

let ventas = JSON.parse(
    localStorage.getItem("ventas") || "[]"
);

/* ================= GUARDAR LOCALMENTE ================= */

function guardarDatos() {
    localStorage.setItem("productos", JSON.stringify(productos));
    localStorage.setItem("ventas", JSON.stringify(ventas));
}

/* ================= ENVIAR DATOS A GOOGLE SHEETS ================= */

// Función para registrar un nuevo producto en Google Sheets
async function syncProductoGoogleSheets(producto, esNuevo) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("AKfycby...")) return;

    try {
        const payload = {
            action: "guardarProducto",
            nombre: producto.nombre,
            marca: producto.marca,
            detalle: producto.detalle,
            categoria: "General",
            precio: producto.precio,
            stockInicial: producto.stock
        };

        await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
        });
        console.log("Producto sincronizado con Google Sheets");
    } catch (error) {
        console.error("Error al sincronizar producto con Google Sheets:", error);
    }
}

// Función para registrar una venta en Google Sheets
async function syncVentaGoogleSheets(venta) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("AKfycby...")) return;

    try {
        const payload = {
            action: "guardarVenta",
            producto: venta.producto,
            comprador: venta.cliente || "Cliente General",
            cantidad: venta.cantidad
        };

        await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
        });
        console.log("Venta sincronizada con Google Sheets");
    } catch (error) {
        console.error("Error al sincronizar venta con Google Sheets:", error);
    }
}

/* ================= MONEDA ================= */

function dinero(numero) {
    return "L. " + Number(numero || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/* ================= FECHA ================= */

function fechaHoy() {
    const fecha = new Date();
    return fecha.toISOString().split("T")[0];
}

const inputFechaVenta = document.getElementById("fechaVenta");
if (inputFechaVenta) inputFechaVenta.value = fechaHoy();

/* ================= NAVEGACION ================= */

function mostrarSeccion(nombre, boton) {
    const secciones = document.querySelectorAll(".seccion");
    secciones.forEach(function(seccion) {
        seccion.classList.remove("activa");
    });

    const seleccion = document.getElementById(nombre);
    if (seleccion) {
        seleccion.classList.add("activa");
    }

    document.querySelectorAll(".menu").forEach(function(menu) {
        menu.classList.remove("active");
    });

    if (boton) {
        boton.classList.add("active");
    }

    const titulos = {
        inicio: ["Mi Tienda", "Panel principal"],
        inventario: ["Inventario", "Administración de productos"],
        ventas: ["Ventas", "Registro de ventas"],
        reportes: ["Reportes", "Resumen de la tienda"],
        configuracion: ["Configuración", "Configuración del sistema"]
    };

    if (titulos[nombre]) {
        const tPagina = document.getElementById("tituloPagina");
        const subPagina = document.getElementById("subtituloPagina");
        if (tPagina) tPagina.textContent = titulos[nombre][0];
        if (subPagina) subPagina.textContent = titulos[nombre][1];
    }

    actualizarTodo();
}

/* ================= MENSAJE ================= */

function mostrarMensaje(texto) {
    const mensaje = document.getElementById("mensaje");
    if (!mensaje) return;
    mensaje.textContent = texto;
    mensaje.classList.add("mostrar");

    setTimeout(function() {
        mensaje.classList.remove("mostrar");
    }, 2500);
}

/* ================= PRODUCTOS ================= */

const formProducto = document.getElementById("formProducto");
if (formProducto) {
    formProducto.addEventListener("submit", function(event) {
        event.preventDefault();

        const id = document.getElementById("productoID").value;
        const nombre = document.getElementById("nombreProducto").value.trim();
        const marca = document.getElementById("marcaProducto").value.trim();
        const detalle = document.getElementById("detalleProducto").value.trim();
        const precio = Number(document.getElementById("precioProducto").value);
        const cantidad = Number(document.getElementById("cantidadProducto").value);

        let productoGuardado;

        /* EDITAR */
        if (id) {
            const posicion = productos.findIndex(producto => producto.id === id);

            if (posicion !== -1) {
                productos[posicion] = {
                    id: id,
                    nombre: nombre,
                    marca: marca,
                    detalle: detalle,
                    precio: precio,
                    stock: cantidad
                };
                productoGuardado = productos[posicion];
            }
            mostrarMensaje("Producto actualizado correctamente");
        } 
        /* NUEVO */
        else {
            const nuevoID = "PRD" + String(productos.length + 1).padStart(3, "0");
            productoGuardado = {
                id: nuevoID,
                nombre: nombre,
                marca: marca,
                detalle: detalle,
                precio: precio,
                stock: cantidad
            };
            productos.push(productoGuardado);

            // Sincronizar nuevo producto a Google Sheets
            syncProductoGoogleSheets(productoGuardado, true);

            mostrarMensaje("Producto registrado correctamente y enviado a Google Sheets");
        }

        guardarDatos();
        limpiarFormularioProducto();
        actualizarTodo();
    });
}

/* ================= LIMPIAR PRODUCTO ================= */

function limpiarFormularioProducto() {
    const form = document.getElementById("formProducto");
    if (form) form.reset();

    const idInput = document.getElementById("productoID");
    if (idInput) idInput.value = "";

    const btnCancelar = document.getElementById("cancelarEdicion");
    if (btnCancelar) btnCancelar.classList.add("oculto");
}

/* ================= EDITAR PRODUCTO ================= */

function editarProducto(id) {
    const producto = productos.find(producto => producto.id === id);
    if (!producto) return;

    document.getElementById("productoID").value = producto.id;
    document.getElementById("nombreProducto").value = producto.nombre;
    document.getElementById("marcaProducto").value = producto.marca;
    document.getElementById("detalleProducto").value = producto.detalle;
    document.getElementById("precioProducto").value = producto.precio;
    document.getElementById("cantidadProducto").value = producto.stock;

    const btnCancelar = document.getElementById("cancelarEdicion");
    if (btnCancelar) btnCancelar.classList.remove("oculto");

    mostrarSeccion("inventario");
}

/* ================= CANCELAR EDICION ================= */

const btnCancelarEdicion = document.getElementById("cancelarEdicion");
if (btnCancelarEdicion) {
    btnCancelarEdicion.addEventListener("click", limpiarFormularioProducto);
}

/* ================= ELIMINAR PRODUCTO ================= */

function eliminarProducto(id) {
    const confirmar = confirm("¿Seguro que deseas eliminar este producto?");
    if (!confirmar) return;

    productos = productos.filter(producto => producto.id !== id);
    guardarDatos();
    actualizarTodo();
    mostrarMensaje("Producto eliminado");
}

/* ================= MOSTRAR PRODUCTOS ================= */

function mostrarProductos() {
    const tabla = document.getElementById("tablaProductos");
    if (!tabla) return;

    const inputBuscar = document.getElementById("buscarProducto");
    const busqueda = inputBuscar ? inputBuscar.value.toLowerCase() : "";

    const filtrados = productos.filter(function(producto) {
        return (
            producto.nombre.toLowerCase().includes(busqueda) ||
            producto.marca.toLowerCase().includes(busqueda) ||
            producto.id.toLowerCase().includes(busqueda)
        );
    });

    tabla.innerHTML = "";

    filtrados.forEach(function(producto) {
        let estado = "";
        if (producto.stock === 0) {
            estado = '<span class="estado agotado">Agotado</span>';
        } else if (producto.stock <= 3) {
            estado = '<span class="estado bajo">' + producto.stock + '</span>';
        } else {
            estado = '<span class="estado pagado">' + producto.stock + '</span>';
        }

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${producto.id}</td>
            <td><strong>${producto.nombre}</strong></td>
            <td>${producto.marca}</td>
            <td>${producto.detalle}</td>
            <td>${dinero(producto.precio)}</td>
            <td>${estado}</td>
            <td>
                <button class="accion" onclick="editarProducto('${producto.id}')">✏️</button>
                <button class="accion eliminar" onclick="eliminarProducto('${producto.id}')">🗑️</button>
            </td>
        `;
        tabla.appendChild(fila);
    });

    if (filtrados.length === 0) {
        tabla.innerHTML = `<tr><td colspan="7">No hay productos registrados.</td></tr>`;
    }
}

/* ================= BUSCAR ================= */

const inputBuscar = document.getElementById("buscarProducto");
if (inputBuscar) {
    inputBuscar.addEventListener("input", mostrarProductos);
}

/* ================= PRODUCTOS PARA VENTA ================= */

function cargarProductosVenta() {
    const select = document.getElementById("productoVenta");
    if (!select) return;

    const valorActual = select.value;
    select.innerHTML = `<option value="">Selecciona un producto</option>`;

    productos
        .filter(producto => producto.stock > 0)
        .forEach(function(producto) {
            const opcion = document.createElement("option");
            opcion.value = producto.id;
            opcion.textContent = producto.nombre + " — " + dinero(producto.precio) + " (" + producto.stock + " disponibles)";
            select.appendChild(opcion);
        });

    if (productos.some(producto => producto.id === valorActual && producto.stock > 0)) {
        select.value = valorActual;
    }

    calcularVenta();
}

/* ================= CALCULAR VENTA ================= */

function calcularVenta() {
    const pSelect = document.getElementById("productoVenta");
    const cInput = document.getElementById("cantidadVenta");
    if (!pSelect || !cInput) return;

    const id = pSelect.value;
    const cantidad = Number(cInput.value) || 0;
    const producto = productos.find(producto => producto.id === id);

    let precio = 0;
    if (producto) precio = producto.precio;

    const pVenta = document.getElementById("precioVenta");
    const tVenta = document.getElementById("totalVenta");

    if (pVenta) pVenta.value = dinero(precio);
    if (tVenta) tVenta.textContent = dinero(precio * cantidad);
}

const selectPVenta = document.getElementById("productoVenta");
if (selectPVenta) selectPVenta.addEventListener("change", calcularVenta);

const inputCVenta = document.getElementById("cantidadVenta");
if (inputCVenta) inputCVenta.addEventListener("input", calcularVenta);

/* ================= REGISTRAR VENTA ================= */

const formVenta = document.getElementById("formVenta");
if (formVenta) {
    formVenta.addEventListener("submit", function(event) {
        event.preventDefault();

        const productoID = document.getElementById("productoVenta").value;
        const cantidad = Number(document.getElementById("cantidadVenta").value);
        const cliente = document.getElementById("clienteVenta").value.trim();
        const metodo = document.getElementById("metodoPago").value;
        const estado = document.getElementById("estadoPago").value;
        const fecha = document.getElementById("fechaVenta").value;

        const producto = productos.find(p => p.id === productoID);

        if (!producto) {
            mostrarMensaje("Selecciona un producto");
            return;
        }

        if (cantidad <= 0) {
            mostrarMensaje("La cantidad no es válida");
            return;
        }

        if (cantidad > producto.stock) {
            mostrarMensaje("No hay suficiente stock");
            return;
        }

        const total = producto.precio * cantidad;

        /* DESCONTAR STOCK LOCALMENTE */
        producto.stock -= cantidad;

        /* CREAR VENTA */
        const nuevaVenta = {
            id: "V" + Date.now(),
            fecha: fecha,
            productoID: producto.id,
            producto: producto.nombre,
            cantidad: cantidad,
            precio: producto.precio,
            total: total,
            cliente: cliente,
            metodo: metodo,
            estado: estado
        };

        ventas.push(nuevaVenta);

        /* SINCRONIZAR A GOOGLE SHEETS */
        syncVentaGoogleSheets(nuevaVenta);

        guardarDatos();

        mostrarMensaje("Venta registrada y enviada a Google Sheets");

        document.getElementById("formVenta").reset();
        if (inputFechaVenta) inputFechaVenta.value = fechaHoy();
        if (inputCVenta) inputCVenta.value = 1;

        actualizarTodo();
    });
}

/* ================= TABLA VENTAS ================= */

function mostrarVentas() {
    const tabla = document.getElementById("tablaVentas");
    if (!tabla) return;

    tabla.innerHTML = "";
    const ventasOrdenadas = [...ventas].reverse();

    ventasOrdenadas.forEach(function(venta) {
        const fila = document.createElement("tr");
        const claseMetodo = venta.metodo === "Transferencia" ? "transferencia" : "";
        const claseEstado = venta.estado === "Pendiente" ? "pendiente" : "pagado";

        fila.innerHTML = `
            <td>${venta.fecha}</td>
            <td>${venta.producto}</td>
            <td>${venta.cliente}</td>
            <td><strong>${dinero(venta.total)}</strong></td>
            <td><span class="estado ${claseMetodo}">${venta.metodo}</span></td>
            <td><span class="estado ${claseEstado}">${venta.estado}</span></td>
        `;
        tabla.appendChild(fila);
    });

    if (ventas.length === 0) {
        tabla.innerHTML = `<tr><td colspan="6">Aún no hay ventas registradas.</td></tr>`;
    }
}

/* ================= DASHBOARD ================= */

function actualizarDashboard() {
    const hoy = fechaHoy();

    const ventasHoy = ventas.filter(venta => venta.fecha === hoy);
    const totalHoy = ventasHoy.reduce((total, venta) => total + venta.total, 0);

    const pendientes = ventas
        .filter(venta => venta.estado === "Pendiente")
        .reduce((total, venta) => total + venta.total, 0);

    const bajo = productos.filter(producto => producto.stock <= 3);
    const unidades = productos.reduce((total, producto) => total + producto.stock, 0);
    const totalVendido = ventas.reduce((total, venta) => total + venta.total, 0);

    const eTotProd = document.getElementById("totalProductos");
    const eVenHoy = document.getElementById("ventasHoy");
    const eBajoStk = document.getElementById("bajoStock");
    const ePendientes = document.getElementById("pendientes");
    const eRepTot = document.getElementById("reporteTotal");
    const eRepPend = document.getElementById("reportePendiente");
    const eRepUni = document.getElementById("reporteUnidades");

    if (eTotProd) eTotProd.textContent = productos.length;
    if (eVenHoy) eVenHoy.textContent = dinero(totalHoy);
    if (eBajoStk) eBajoStk.textContent = bajo.length;
    if (ePendientes) ePendientes.textContent = dinero(pendientes);
    if (eRepTot) eRepTot.textContent = dinero(totalVendido);
    if (eRepPend) eRepPend.textContent = dinero(pendientes);
    if (eRepUni) eRepUni.textContent = unidades;
}

/* ================= PRODUCTOS INICIO ================= */

function mostrarProductosInicio() {
    const tabla = document.getElementById("tablaInicioProductos");
    if (!tabla) return;

    tabla.innerHTML = "";

    productos.slice(-6).reverse().forEach(function(producto) {
        let clase = "";
        if (producto.stock === 0) clase = "agotado";
        else if (producto.stock <= 3) clase = "bajo";

        tabla.innerHTML += `
            <tr>
                <td>${producto.id}</td>
                <td>${producto.nombre}</td>
                <td>${producto.marca}</td>
                <td>${dinero(producto.precio)}</td>
                <td><span class="estado ${clase}">${producto.stock}</span></td>
            </tr>
        `;
    });

    if (productos.length === 0) {
        tabla.innerHTML = `<tr><td colspan="5">Aún no hay productos.</td></tr>`;
    }
}

/* ================= VENTAS INICIO ================= */

function mostrarVentasInicio() {
    const tabla = document.getElementById("tablaInicioVentas");
    if (!tabla) return;

    tabla.innerHTML = "";

    ventas.slice(-6).reverse().forEach(function(venta) {
        tabla.innerHTML += `
            <tr>
                <td>${venta.fecha}</td>
                <td>${venta.producto}</td>
                <td>${venta.cliente}</td>
                <td>${dinero(venta.total)}</td>
            </tr>
        `;
    });

    if (ventas.length === 0) {
        tabla.innerHTML = `<tr><td colspan="4">Aún no hay ventas.</td></tr>`;
    }
}

/* ================= BAJO STOCK ================= */

function mostrarBajoStock() {
    const tabla = document.getElementById("tablaBajoStock");
    if (!tabla) return;

    tabla.innerHTML = "";

    productos
        .filter(producto => producto.stock <= 3)
        .sort((a, b) => a.stock - b.stock)
        .forEach(function(producto) {
            const clase = producto.stock === 0 ? "agotado" : "bajo";

            tabla.innerHTML += `
                <tr>
                    <td>${producto.nombre}</td>
                    <td>${producto.marca}</td>
                    <td><span class="estado ${clase}">${producto.stock}</span></td>
                </tr>
            `;
        });

    if (!productos.some(producto => producto.stock <= 3)) {
        tabla.innerHTML = `<tr><td colspan="3">No hay productos con poco stock.</td></tr>`;
    }
}

/* ================= CONFIGURACION ================= */

function guardarConfiguracion() {
    const inputUrl = document.getElementById("urlGoogleSheets");
    if (!inputUrl) return;
    const url = inputUrl.value.trim();

    localStorage.setItem("googleSheetsURL", url);
    mostrarMensaje("Configuración guardada");
}

const urlGuardada = localStorage.getItem("googleSheetsURL");
if (urlGuardada) {
    const inputUrl = document.getElementById("urlGoogleSheets");
    if (inputUrl) inputUrl.value = urlGuardada;
}

/* ================= ACTUALIZAR TODO ================= */

function actualizarTodo() {
    mostrarProductos();
    cargarProductosVenta();
    mostrarVentas();
    actualizarDashboard();
    mostrarProductosInicio();
    mostrarVentasInicio();
    mostrarBajoStock();
}

/* ================= RELOJ ================= */

function actualizarFecha() {
    const elFecha = document.getElementById("fechaActual");
    if (!elFecha) return;

    const ahora = new Date();
    elFecha.textContent = ahora.toLocaleString("es-HN", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

setInterval(actualizarFecha, 1000);
actualizarFecha();

/* ================= INICIAR ================= */

actualizarTodo();
