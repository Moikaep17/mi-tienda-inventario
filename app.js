/* =====================================================
   MI TIENDA
   Sistema de inventario y ventas
   Google Sheets como base de datos
   ===================================================== */


/* =====================================================
   CONFIGURACIÓN
   ===================================================== */

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxpDOWQIMwi-v_-lI2xiIUzqtP1j_ujOXT8SYn9K0ffqVCG2tSzxv5EBhE3B2kEvAAPNQ/exec;
    "PEGA_AQUI_TU_URL_DE_APPS_SCRIPT";


/* =====================================================
   DATOS LOCALES
   ===================================================== */

let productos = [];
let ventas = [];


/* =====================================================
   MONEDA
   ===================================================== */

function dinero(numero) {

    return "L. " + Number(numero || 0).toLocaleString("en-US", {

        minimumFractionDigits: 2,

        maximumFractionDigits: 2

    });

}


/* =====================================================
   FECHA
   ===================================================== */

function fechaHoy() {

    const fecha = new Date();

    return fecha.toISOString().split("T")[0];

}


const inputFechaVenta =
    document.getElementById("fechaVenta");

if (inputFechaVenta) {

    inputFechaVenta.value = fechaHoy();

}


/* =====================================================
   MENSAJES
   ===================================================== */

function mostrarMensaje(texto) {

    const mensaje =
        document.getElementById("mensaje");

    if (!mensaje) return;

    mensaje.textContent = texto;

    mensaje.classList.add("mostrar");


    setTimeout(function() {

        mensaje.classList.remove("mostrar");

    }, 2500);

}


/* =====================================================
   CONEXIÓN CON GOOGLE SHEETS
   ===================================================== */


/*
    Cargar todos los datos desde Google Sheets
*/

async function cargarDatosGoogleSheets() {

    if (
        !GOOGLE_SCRIPT_URL ||
        GOOGLE_SCRIPT_URL.includes("PEGA_AQUI")
    ) {

        console.warn(
            "No se ha configurado la URL de Google Apps Script."
        );

        actualizarTodo();

        return;

    }


    try {

        const respuesta =
            await fetch(GOOGLE_SCRIPT_URL);


        const datos =
            await respuesta.json();


        if (!datos.success) {

            throw new Error(
                datos.message ||
                "No se pudieron cargar los datos."
            );

        }


        productos =
            Array.isArray(datos.productos)
                ? datos.productos
                : [];


        ventas =
            Array.isArray(datos.ventas)
                ? datos.ventas
                : [];


        actualizarTodo();


        console.log(
            "Datos cargados correctamente desde Google Sheets."
        );


    } catch (error) {

        console.error(
            "Error cargando Google Sheets:",
            error
        );


        mostrarMensaje(
            "No se pudo conectar con Google Sheets"
        );


        actualizarTodo();

    }

}


/*
    Enviar información al Apps Script
*/

async function enviarGoogleSheets(payload) {

    try {

        const respuesta = await fetch(
            GOOGLE_SCRIPT_URL,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body: JSON.stringify(payload)

            }
        );


        const datos =
            await respuesta.json();


        return datos;


    } catch (error) {

        console.error(
            "Error enviando información:",
            error
        );


        return {

            success: false,

            message: error.message

        };

    }

}


/* =====================================================
   NAVEGACIÓN
   ===================================================== */

function mostrarSeccion(nombre, boton) {

    const secciones =
        document.querySelectorAll(".seccion");


    secciones.forEach(function(seccion) {

        seccion.classList.remove("activa");

    });


    const seleccion =
        document.getElementById(nombre);


    if (seleccion) {

        seleccion.classList.add("activa");

    }


    document
        .querySelectorAll(".menu")
        .forEach(function(menu) {

            menu.classList.remove("active");

        });


    if (boton) {

        boton.classList.add("active");

    }


    const titulos = {

        inicio: [
            "Mi Tienda",
            "Panel principal"
        ],

        inventario: [
            "Inventario",
            "Administración de productos"
        ],

        ventas: [
            "Ventas",
            "Registro de ventas"
        ],

        reportes: [
            "Reportes",
            "Resumen de la tienda"
        ],

        configuracion: [
            "Configuración",
            "Configuración del sistema"
        ]

    };


    if (titulos[nombre]) {

        const tPagina =
            document.getElementById(
                "tituloPagina"
            );


        const subPagina =
            document.getElementById(
                "subtituloPagina"
            );


        if (tPagina) {

            tPagina.textContent =
                titulos[nombre][0];

        }


        if (subPagina) {

            subPagina.textContent =
                titulos[nombre][1];

        }

    }


    actualizarTodo();

}


/* =====================================================
   PRODUCTOS
   ===================================================== */

const formProducto =
    document.getElementById("formProducto");


if (formProducto) {

    formProducto.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const id =
                document.getElementById(
                    "productoID"
                ).value;


            const nombre =
                document.getElementById(
                    "nombreProducto"
                ).value.trim();


            const marca =
                document.getElementById(
                    "marcaProducto"
                ).value.trim();


            const detalle =
                document.getElementById(
                    "detalleProducto"
                ).value.trim();


            const precio =
                Number(
                    document.getElementById(
                        "precioProducto"
                    ).value
                );


            const cantidad =
                Number(
                    document.getElementById(
                        "cantidadProducto"
                    ).value
                );


            if (!nombre || !marca || !detalle) {

                mostrarMensaje(
                    "Completa todos los campos."
                );

                return;

            }


            /* =========================================
               EDITAR
               ========================================= */

            if (id) {

                const respuesta =
                    await enviarGoogleSheets({

                        action:
                            "editarProducto",

                        id: id,

                        nombre: nombre,

                        marca: marca,

                        detalle: detalle,

                        categoria:
                            "General",

                        precio: precio,

                        stock: cantidad

                    });


                if (!respuesta.success) {

                    mostrarMensaje(
                        respuesta.message ||
                        "No se pudo actualizar."
                    );

                    return;

                }


                mostrarMensaje(
                    "Producto actualizado correctamente."
                );


            }

            /* =========================================
               NUEVO
               ========================================= */

            else {

                const respuesta =
                    await enviarGoogleSheets({

                        action:
                            "guardarProducto",

                        nombre: nombre,

                        marca: marca,

                        detalle: detalle,

                        categoria:
                            "General",

                        precio: precio,

                        stockInicial:
                            cantidad

                    });


                if (!respuesta.success) {

                    mostrarMensaje(
                        respuesta.message ||
                        "No se pudo guardar."
                    );

                    return;

                }


                mostrarMensaje(
                    "Producto registrado correctamente."
                );

            }


            limpiarFormularioProducto();


            await cargarDatosGoogleSheets();

        }

    );

}


/* =====================================================
   LIMPIAR FORMULARIO PRODUCTO
   ===================================================== */

function limpiarFormularioProducto() {

    const form =
        document.getElementById(
            "formProducto"
        );


    if (form) {

        form.reset();

    }


    const idInput =
        document.getElementById(
            "productoID"
        );


    if (idInput) {

        idInput.value = "";

    }


    const btnCancelar =
        document.getElementById(
            "cancelarEdicion"
        );


    if (btnCancelar) {

        btnCancelar.classList.add(
            "oculto"
        );

    }

}


/* =====================================================
   EDITAR PRODUCTO
   ===================================================== */

function editarProducto(id) {

    const producto =
        productos.find(
            producto =>
                producto.id === id
        );


    if (!producto) return;


    document.getElementById(
        "productoID"
    ).value = producto.id;


    document.getElementById(
        "nombreProducto"
    ).value = producto.nombre;


    document.getElementById(
        "marcaProducto"
    ).value = producto.marca;


    document.getElementById(
        "detalleProducto"
    ).value = producto.detalle;


    document.getElementById(
        "precioProducto"
    ).value = producto.precio;


    document.getElementById(
        "cantidadProducto"
    ).value = producto.stock;


    const btnCancelar =
        document.getElementById(
            "cancelarEdicion"
        );


    if (btnCancelar) {

        btnCancelar.classList.remove(
            "oculto"
        );

    }


    mostrarSeccion("inventario");

}


/* =====================================================
   CANCELAR EDICIÓN
   ===================================================== */

const btnCancelarEdicion =
    document.getElementById(
        "cancelarEdicion"
    );


if (btnCancelarEdicion) {

    btnCancelarEdicion.addEventListener(
        "click",
        limpiarFormularioProducto
    );

}


/* =====================================================
   ELIMINAR PRODUCTO
   ===================================================== */

async function eliminarProducto(id) {

    const confirmar =
        confirm(
            "¿Seguro que deseas eliminar este producto?"
        );


    if (!confirmar) return;


    const respuesta =
        await enviarGoogleSheets({

            action:
                "eliminarProducto",

            id: id

        });


    if (!respuesta.success) {

        mostrarMensaje(
            respuesta.message ||
            "No se pudo eliminar."
        );

        return;

    }


    mostrarMensaje(
        "Producto eliminado correctamente."
    );


    await cargarDatosGoogleSheets();

}


/* =====================================================
   MOSTRAR PRODUCTOS
   ===================================================== */

function mostrarProductos() {

    const tabla =
        document.getElementById(
            "tablaProductos"
        );


    if (!tabla) return;


    const inputBuscar =
        document.getElementById(
            "buscarProducto"
        );


    const busqueda =
        inputBuscar
            ? inputBuscar.value.toLowerCase()
            : "";


    const filtrados =
        productos.filter(
            function(producto) {

                return (

                    String(producto.nombre)
                        .toLowerCase()
                        .includes(busqueda)

                    ||

                    String(producto.marca)
                        .toLowerCase()
                        .includes(busqueda)

                    ||

                    String(producto.id)
                        .toLowerCase()
                        .includes(busqueda)

                );

            }
        );


    tabla.innerHTML = "";


    filtrados.forEach(
        function(producto) {

            let estado = "";


            if (producto.stock === 0) {

                estado =
                    '<span class="estado agotado">Agotado</span>';

            }

            else if (producto.stock <= 3) {

                estado =
                    '<span class="estado bajo">'
                    + producto.stock +
                    '</span>';

            }

            else {

                estado =
                    '<span class="estado pagado">'
                    + producto.stock +
                    '</span>';

            }


            const fila =
                document.createElement("tr");


            fila.innerHTML = `

                <td>${producto.id}</td>

                <td>
                    <strong>
                        ${producto.nombre}
                    </strong>
                </td>

                <td>
                    ${producto.marca}
                </td>

                <td>
                    ${producto.detalle}
                </td>

                <td>
                    ${dinero(producto.precio)}
                </td>

                <td>
                    ${estado}
                </td>

                <td>

                    <button
                        class="accion"
                        onclick="editarProducto('${producto.id}')"
                    >
                        ✏️
                    </button>

                    <button
                        class="accion eliminar"
                        onclick="eliminarProducto('${producto.id}')"
                    >
                        🗑️
                    </button>

                </td>

            `;


            tabla.appendChild(fila);

        }
    );


    if (filtrados.length === 0) {

        tabla.innerHTML =
            `<tr>
                <td colspan="7">
                    No hay productos registrados.
                </td>
            </tr>`;

    }

}


/* =====================================================
   BUSCAR PRODUCTOS
   ===================================================== */

const inputBuscar =
    document.getElementById(
        "buscarProducto"
    );


if (inputBuscar) {

    inputBuscar.addEventListener(
        "input",
        mostrarProductos
    );

}


/* =====================================================
   PRODUCTOS PARA VENTA
   ===================================================== */

function cargarProductosVenta() {

    const select =
        document.getElementById(
            "productoVenta"
        );


    if (!select) return;


    const valorActual =
        select.value;


    select.innerHTML =
        `<option value="">
            Selecciona un producto
        </option>`;


    productos
        .filter(
            producto =>
                Number(producto.stock) > 0
        )
        .forEach(
            function(producto) {

                const opcion =
                    document.createElement(
                        "option"
                    );


                opcion.value =
                    producto.id;


                opcion.textContent =
                    producto.nombre
                    + " — "
                    + dinero(producto.precio)
                    + " ("
                    + producto.stock
                    + " disponibles)";


                select.appendChild(opcion);

            }
        );


    if (
        productos.some(
            producto =>
                producto.id === valorActual &&
                Number(producto.stock) > 0
        )
    ) {

        select.value =
            valorActual;

    }


    calcularVenta();

}


/* =====================================================
   CALCULAR VENTA
   ===================================================== */

function calcularVenta() {

    const pSelect =
        document.getElementById(
            "productoVenta"
        );


    const cInput =
        document.getElementById(
            "cantidadVenta"
        );


    if (!pSelect || !cInput) return;


    const id =
        pSelect.value;


    const cantidad =
        Number(cInput.value) || 0;


    const producto =
        productos.find(
            producto =>
                producto.id === id
        );


    let precio = 0;


    if (producto) {

        precio =
            Number(producto.precio) || 0;

    }


    const pVenta =
        document.getElementById(
            "precioVenta"
        );


    const tVenta =
        document.getElementById(
            "totalVenta"
        );


    if (pVenta) {

        pVenta.value =
            dinero(precio);

    }


    if (tVenta) {

        tVenta.textContent =
            dinero(precio * cantidad);

    }

}


/* =====================================================
   EVENTOS DE VENTA
   ===================================================== */

const selectPVenta =
    document.getElementById(
        "productoVenta"
    );


if (selectPVenta) {

    selectPVenta.addEventListener(
        "change",
        calcularVenta
    );

}


const inputCVenta =
    document.getElementById(
        "cantidadVenta"
    );


if (inputCVenta) {

    inputCVenta.addEventListener(
        "input",
        calcularVenta
    );

}


/* =====================================================
   REGISTRAR VENTA
   ===================================================== */

const formVenta =
    document.getElementById(
        "formVenta"
    );


if (formVenta) {

    formVenta.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const productoID =
                document.getElementById(
                    "productoVenta"
                ).value;


            const cantidad =
                Number(
                    document.getElementById(
                        "cantidadVenta"
                    ).value
                );


            const cliente =
                document.getElementById(
                    "clienteVenta"
                ).value.trim();


            const metodo =
                document.getElementById(
                    "metodoPago"
                ).value;


            const estado =
                document.getElementById(
                    "estadoPago"
                ).value;


            const fecha =
                document.getElementById(
                    "fechaVenta"
                ).value;


            const producto =
                productos.find(
                    p =>
                        p.id === productoID
                );


            if (!producto) {

                mostrarMensaje(
                    "Selecciona un producto."
                );

                return;

            }


            if (cantidad <= 0) {

                mostrarMensaje(
                    "La cantidad no es válida."
                );

                return;

            }


            if (
                cantidad >
                Number(producto.stock)
            ) {

                mostrarMensaje(
                    "No hay suficiente stock."
                );

                return;

            }


            /*
                Enviamos la venta directamente
                a Google Sheets.
            */

            const respuesta =
                await enviarGoogleSheets({

                    action:
                        "guardarVenta",

                    productoID:
                        productoID,

                    cantidad:
                        cantidad,

                    cliente:
                        cliente,

                    comprador:
                        cliente,

                    metodo:
                        metodo,

                    estado:
                        estado,

                    fecha:
                        fecha

                });


            if (!respuesta.success) {

                mostrarMensaje(
                    respuesta.message ||
                    "No se pudo registrar la venta."
                );

                return;

            }


            mostrarMensaje(
                "Venta registrada correctamente."
            );


            formVenta.reset();


            if (inputFechaVenta) {

                inputFechaVenta.value =
                    fechaHoy();

            }


            if (inputCVenta) {

                inputCVenta.value = 1;

            }


            /*
                Volvemos a cargar los datos
                actualizados desde Sheets.
            */

            await cargarDatosGoogleSheets();

        }

    );

}


/* =====================================================
   TABLA DE VENTAS
   ===================================================== */

function mostrarVentas() {

    const tabla =
        document.getElementById(
            "tablaVentas"
        );


    if (!tabla) return;


    tabla.innerHTML = "";


    const ventasOrdenadas =
        [...ventas].reverse();


    ventasOrdenadas.forEach(
        function(venta) {

            const fila =
                document.createElement(
                    "tr"
                );


            const claseMetodo =
                venta.metodo ===
                "Transferencia"
                    ? "transferencia"
                    : "";


            const claseEstado =
                venta.estado ===
                "Pendiente"
                    ? "pendiente"
                    : "pagado";


            fila.innerHTML = `

                <td>
                    ${venta.fecha}
                </td>

                <td>
                    ${venta.producto}
                </td>

                <td>
                    ${venta.cliente}
                </td>

                <td>
                    <strong>
                        ${dinero(venta.total)}
                    </strong>
                </td>

                <td>
                    <span
                        class="estado ${claseMetodo}"
                    >
                        ${venta.metodo}
                    </span>
                </td>

                <td>
                    <span
                        class="estado ${claseEstado}"
                    >
                        ${venta.estado}
                    </span>
                </td>

            `;


            tabla.appendChild(fila);

        }
    );


    if (ventas.length === 0) {

        tabla.innerHTML =
            `<tr>
                <td colspan="6">
                    Aún no hay ventas registradas.
                </td>
            </tr>`;

    }

}


/* =====================================================
   DASHBOARD
   ===================================================== */

function actualizarDashboard() {

    const hoy =
        fechaHoy();


    const ventasHoy =
        ventas.filter(
            venta =>
                venta.fecha === hoy
        );


    const totalHoy =
        ventasHoy.reduce(
            (total, venta) =>
                total +
                Number(venta.total || 0),
            0
        );


    const pendientes =
        ventas
            .filter(
                venta =>
                    venta.estado ===
                    "Pendiente"
            )
            .reduce(
                (total, venta) =>
                    total +
                    Number(venta.total || 0),
                0
            );


    const bajo =
        productos.filter(
            producto =>
                Number(producto.stock) <= 3
        );


    const unidades =
        productos.reduce(
            (total, producto) =>
                total +
                Number(producto.stock || 0),
            0
        );


    const totalVendido =
        ventas.reduce(
            (total, venta) =>
                total +
                Number(venta.total || 0),
            0
        );


    const eTotProd =
        document.getElementById(
            "totalProductos"
        );


    const eVenHoy =
        document.getElementById(
            "ventasHoy"
        );


    const eBajoStk =
        document.getElementById(
            "bajoStock"
        );


    const ePendientes =
        document.getElementById(
            "pendientes"
        );


    const eRepTot =
        document.getElementById(
            "reporteTotal"
        );


    const eRepPend =
        document.getElementById(
            "reportePendiente"
        );


    const eRepUni =
        document.getElementById(
            "reporteUnidades"
        );


    if (eTotProd) {

        eTotProd.textContent =
            productos.length;

    }


    if (eVenHoy) {

        eVenHoy.textContent =
            dinero(totalHoy);

    }


    if (eBajoStk) {

        eBajoStk.textContent =
            bajo.length;

    }


    if (ePendientes) {

        ePendientes.textContent =
            dinero(pendientes);

    }


    if (eRepTot) {

        eRepTot.textContent =
            dinero(totalVendido);

    }


    if (eRepPend) {

        eRepPend.textContent =
            dinero(pendientes);

    }


    if (eRepUni) {

        eRepUni.textContent =
            unidades;

    }

}


/* =====================================================
   PRODUCTOS EN INICIO
   ===================================================== */

function mostrarProductosInicio() {

    const tabla =
        document.getElementById(
            "tablaInicioProductos"
        );


    if (!tabla) return;


    tabla.innerHTML = "";


    productos
        .slice(-6)
        .reverse()
        .forEach(
            function(producto) {

                let clase = "";


                if (
                    Number(producto.stock) === 0
                ) {

                    clase =
                        "agotado";

                }

                else if (
                    Number(producto.stock) <= 3
                ) {

                    clase =
                        "bajo";

                }


                tabla.innerHTML += `

                    <tr>

                        <td>
                            ${producto.id}
                        </td>

                        <td>
                            ${producto.nombre}
                        </td>

                        <td>
                            ${producto.marca}
                        </td>

                        <td>
                            ${dinero(producto.precio)}
                        </td>

                        <td>

                            <span
                                class="estado ${clase}"
                            >
                                ${producto.stock}
                            </span>

                        </td>

                    </tr>

                `;

            }
        );


    if (productos.length === 0) {

        tabla.innerHTML =
            `<tr>
                <td colspan="5">
                    Aún no hay productos.
                </td>
            </tr>`;

    }

}


/* =====================================================
   VENTAS EN INICIO
   ===================================================== */

function mostrarVentasInicio() {

    const tabla =
        document.getElementById(
            "tablaInicioVentas"
        );


    if (!tabla) return;


    tabla.innerHTML = "";


    ventas
        .slice(-6)
        .reverse()
        .forEach(
            function(venta) {

                tabla.innerHTML += `

                    <tr>

                        <td>
                            ${venta.fecha}
                        </td>

                        <td>
                            ${venta.producto}
                        </td>

                        <td>
                            ${venta.cliente}
                        </td>

                        <td>
                            ${dinero(venta.total)}
                        </td>

                    </tr>

                `;

            }
        );


    if (ventas.length === 0) {

        tabla.innerHTML =
            `<tr>
                <td colspan="4">
                    Aún no hay ventas.
                </td>
            </tr>`;

    }

}


/* =====================================================
   BAJO STOCK
   ===================================================== */

function mostrarBajoStock() {

    const tabla =
        document.getElementById(
            "tablaBajoStock"
        );


    if (!tabla) return;


    tabla.innerHTML = "";


    productos

        .filter(
            producto =>
                Number(producto.stock) <= 3
        )

        .sort(
            (a, b) =>
                Number(a.stock) -
                Number(b.stock)
        )

        .forEach(
            function(producto) {

                const clase =
                    Number(producto.stock) === 0
                        ? "agotado"
                        : "bajo";


                tabla.innerHTML += `

                    <tr>

                        <td>
                            ${producto.nombre}
                        </td>

                        <td>
                            ${producto.marca}
                        </td>

                        <td>

                            <span
                                class="estado ${clase}"
                            >
                                ${producto.stock}
                            </span>

                        </td>

                    </tr>

                `;

            }
        );


    if (
        !productos.some(
            producto =>
                Number(producto.stock) <= 3
        )
    ) {

        tabla.innerHTML =
            `<tr>
                <td colspan="3">
                    No hay productos con poco stock.
                </td>
            </tr>`;

    }

}


/* =====================================================
   CONFIGURACIÓN
   ===================================================== */

function guardarConfiguracion() {

    const inputUrl =
        document.getElementById(
            "urlGoogleSheets"
        );


    if (!inputUrl) return;


    const url =
        inputUrl.value.trim();


    if (!url) {

        mostrarMensaje(
            "Introduce una URL válida."
        );

        return;

    }


    /*
        Guardamos la URL por si posteriormente
        queremos utilizar configuración dinámica.
    */

    localStorage.setItem(
        "googleSheetsURL",
        url
    );


    mostrarMensaje(
        "Configuración guardada."
    );

}


/* =====================================================
   ACTUALIZAR TODO
   ===================================================== */

function actualizarTodo() {

    mostrarProductos();

    cargarProductosVenta();

    mostrarVentas();

    actualizarDashboard();

    mostrarProductosInicio();

    mostrarVentasInicio();

    mostrarBajoStock();

}


/* =====================================================
   RELOJ
   ===================================================== */

function actualizarFecha() {

    const elFecha =
        document.getElementById(
            "fechaActual"
        );


    if (!elFecha) return;


    const ahora =
        new Date();


    elFecha.textContent =
        ahora.toLocaleString(
            "es-HN",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

}


setInterval(
    actualizarFecha,
    1000
);


actualizarFecha();


/* =====================================================
   INICIAR SISTEMA
   ===================================================== */

cargarDatosGoogleSheets();
