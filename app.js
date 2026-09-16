/* =====================================================
   MI TIENDA
   Sistema de inventario y ventas
   ===================================================== */


/* ================= DATOS ================= */

let productos = JSON.parse(
    localStorage.getItem("productos") || "[]"
);


let ventas = JSON.parse(
    localStorage.getItem("ventas") || "[]"
);



/* ================= GUARDAR ================= */

function guardarDatos() {

    localStorage.setItem(
        "productos",
        JSON.stringify(productos)
    );

    localStorage.setItem(
        "ventas",
        JSON.stringify(ventas)
    );

}



/* ================= MONEDA ================= */

function dinero(numero) {

    return "L. " + Number(numero || 0).toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}



/* ================= FECHA ================= */

function fechaHoy() {

    const fecha = new Date();

    return fecha.toISOString().split("T")[0];

}


document.getElementById("fechaVenta").value = fechaHoy();



/* ================= NAVEGACION ================= */

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

        document.getElementById(
            "tituloPagina"
        ).textContent = titulos[nombre][0];


        document.getElementById(
            "subtituloPagina"
        ).textContent = titulos[nombre][1];

    }


    actualizarTodo();

}



/* ================= MENSAJE ================= */

function mostrarMensaje(texto) {

    const mensaje =
        document.getElementById("mensaje");

    mensaje.textContent = texto;

    mensaje.classList.add("mostrar");


    setTimeout(function() {

        mensaje.classList.remove("mostrar");

    }, 2500);

}



/* ================= PRODUCTOS ================= */

document
    .getElementById("formProducto")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const id =
            document.getElementById("productoID").value;


        const nombre =
            document.getElementById("nombreProducto").value.trim();


        const marca =
            document.getElementById("marcaProducto").value.trim();


        const detalle =
            document.getElementById("detalleProducto").value.trim();


        const precio =
            Number(
                document.getElementById("precioProducto").value
            );


        const cantidad =
            Number(
                document.getElementById("cantidadProducto").value
            );



        /* EDITAR */

        if (id) {

            const posicion =
                productos.findIndex(
                    producto => producto.id === id
                );


            if (posicion !== -1) {

                productos[posicion] = {

                    id: id,

                    nombre: nombre,

                    marca: marca,

                    detalle: detalle,

                    precio: precio,

                    stock: cantidad

                };

            }


            mostrarMensaje(
                "Producto actualizado correctamente"
            );

        }


        /* NUEVO */

        else {

            const nuevoID =
                "PRD" +
                String(productos.length + 1)
                    .padStart(3, "0");


            productos.push({

                id: nuevoID,

                nombre: nombre,

                marca: marca,

                detalle: detalle,

                precio: precio,

                stock: cantidad

            });


            mostrarMensaje(
                "Producto registrado correctamente"
            );

        }


        guardarDatos();

        limpiarFormularioProducto();

        actualizarTodo();

    });



/* ================= LIMPIAR PRODUCTO ================= */

function limpiarFormularioProducto() {

    document
        .getElementById("formProducto")
        .reset();


    document.getElementById(
        "productoID"
    ).value = "";


    document
        .getElementById("cancelarEdicion")
        .classList.add("oculto");

}



/* ================= EDITAR PRODUCTO ================= */

function editarProducto(id) {

    const producto =
        productos.find(
            producto => producto.id === id
        );


    if (!producto) {
        return;
    }


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


    document
        .getElementById("cancelarEdicion")
        .classList.remove("oculto");


    mostrarSeccion("inventario");

}



/* ================= CANCELAR EDICION ================= */

document
    .getElementById("cancelarEdicion")
    .addEventListener(
        "click",
        limpiarFormularioProducto
    );



/* ================= ELIMINAR PRODUCTO ================= */

function eliminarProducto(id) {

    const confirmar =
        confirm(
            "¿Seguro que deseas eliminar este producto?"
        );


    if (!confirmar) {
        return;
    }


    productos =
        productos.filter(
            producto => producto.id !== id
        );


    guardarDatos();

    actualizarTodo();

    mostrarMensaje(
        "Producto eliminado"
    );

}



/* ================= MOSTRAR PRODUCTOS ================= */

function mostrarProductos() {

    const tabla =
        document.getElementById(
            "tablaProductos"
        );


    const busqueda =
        document
            .getElementById("buscarProducto")
            .value
            .toLowerCase();


    const filtrados =
        productos.filter(function(producto) {

            return (

                producto.nombre
                    .toLowerCase()
                    .includes(busqueda)

                ||

                producto.marca
                    .toLowerCase()
                    .includes(busqueda)

                ||

                producto.id
                    .toLowerCase()
                    .includes(busqueda)

            );

        });


    tabla.innerHTML = "";



    filtrados.forEach(function(producto) {

        let estado = "";


        if (producto.stock === 0) {

            estado =
                '<span class="estado agotado">Agotado</span>';

        }

        else if (producto.stock <= 3) {

            estado =
                '<span class="estado bajo">' +
                producto.stock +
                "</span>";

        }

        else {

            estado =
                '<span class="estado pagado">' +
                producto.stock +
                "</span>";

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

            <td>${producto.marca}</td>

            <td>${producto.detalle}</td>

            <td>${dinero(producto.precio)}</td>

            <td>${estado}</td>

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

    });


    if (filtrados.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="7">
                    No hay productos registrados.
                </td>
            </tr>
        `;

    }

}



/* ================= BUSCAR ================= */

document
    .getElementById("buscarProducto")
    .addEventListener(
        "input",
        mostrarProductos
    );



/* ================= PRODUCTOS PARA VENTA ================= */

function cargarProductosVenta() {

    const select =
        document.getElementById(
            "productoVenta"
        );


    const valorActual =
        select.value;


    select.innerHTML = `

        <option value="">
            Selecciona un producto
        </option>

    `;


    productos
        .filter(producto => producto.stock > 0)
        .forEach(function(producto) {

            const opcion =
                document.createElement("option");


            opcion.value =
                producto.id;


            opcion.textContent =
                producto.nombre +
                " — " +
                dinero(producto.precio) +
                " (" +
                producto.stock +
                " disponibles)";


            select.appendChild(opcion);

        });


    if (
        productos.some(
            producto =>
                producto.id === valorActual &&
                producto.stock > 0
        )
    ) {

        select.value = valorActual;

    }


    calcularVenta();

}



/* ================= CALCULAR VENTA ================= */

function calcularVenta() {

    const id =
        document.getElementById(
            "productoVenta"
        ).value;


    const cantidad =
        Number(
            document.getElementById(
                "cantidadVenta"
            ).value
        ) || 0;


    const producto =
        productos.find(
            producto => producto.id === id
        );


    let precio = 0;


    if (producto) {

        precio = producto.precio;

    }


    document.getElementById(
        "precioVenta"
    ).value = dinero(precio);


    document.getElementById(
        "totalVenta"
    ).textContent =
        dinero(precio * cantidad);

}



document
    .getElementById("productoVenta")
    .addEventListener(
        "change",
        calcularVenta
    );


document
    .getElementById("cantidadVenta")
    .addEventListener(
        "input",
        calcularVenta
    );



/* ================= REGISTRAR VENTA ================= */

document
    .getElementById("formVenta")
    .addEventListener(
        "submit",
        function(event) {

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
                    producto =>
                        producto.id === productoID
                );


            if (!producto) {

                mostrarMensaje(
                    "Selecciona un producto"
                );

                return;

            }


            if (cantidad <= 0) {

                mostrarMensaje(
                    "La cantidad no es válida"
                );

                return;

            }


            if (cantidad > producto.stock) {

                mostrarMensaje(
                    "No hay suficiente stock"
                );

                return;

            }



            const total =
                producto.precio * cantidad;



            /* DESCONTAR STOCK */

            producto.stock -= cantidad;



            /* CREAR VENTA */

            const nuevaVenta = {

                id:
                    "V" +
                    Date.now(),

                fecha: fecha,

                productoID:
                    producto.id,

                producto:
                    producto.nombre,

                cantidad:
                    cantidad,

                precio:
                    producto.precio,

                total:
                    total,

                cliente:
                    cliente,

                metodo:
                    metodo,

                estado:
                    estado

            };


            ventas.push(
                nuevaVenta
            );


            guardarDatos();


            mostrarMensaje(
                "Venta registrada correctamente"
            );


            document
                .getElementById(
                    "formVenta"
                )
                .reset();


            document.getElementById(
                "fechaVenta"
            ).value = fechaHoy();


            document.getElementById(
                "cantidadVenta"
            ).value = 1;


            actualizarTodo();

        });



/* ================= TABLA VENTAS ================= */

function mostrarVentas() {

    const tabla =
        document.getElementById(
            "tablaVentas"
        );


    tabla.innerHTML = "";


    const ventasOrdenadas =
        [...ventas].reverse();


    ventasOrdenadas.forEach(function(venta) {

        const fila =
            document.createElement("tr");


        const claseMetodo =
            venta.metodo === "Transferencia"
                ? "transferencia"
                : "";


        const claseEstado =
            venta.estado === "Pendiente"
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

    });


    if (ventas.length === 0) {

        tabla.innerHTML = `

            <tr>

                <td colspan="6">
                    Aún no hay ventas registradas.
                </td>

            </tr>

        `;

    }

}



/* ================= DASHBOARD ================= */

function actualizarDashboard() {

    const hoy =
        fechaHoy();


    const ventasHoy =
        ventas.filter(
            venta => venta.fecha === hoy
        );


    const totalHoy =
        ventasHoy.reduce(
            (total, venta) =>
                total + venta.total,
            0
        );


    const pendientes =
        ventas
            .filter(
                venta =>
                    venta.estado === "Pendiente"
            )
            .reduce(
                (total, venta) =>
                    total + venta.total,
                0
            );


    const bajo =
        productos.filter(
            producto =>
                producto.stock <= 3
        );


    const unidades =
        productos.reduce(
            (total, producto) =>
                total + producto.stock,
            0
        );


    const totalVendido =
        ventas.reduce(
            (total, venta) =>
                total + venta.total,
            0
        );



    document.getElementById(
        "totalProductos"
    ).textContent =
        productos.length;


    document.getElementById(
        "ventasHoy"
    ).textContent =
        dinero(totalHoy);


    document.getElementById(
        "bajoStock"
    ).textContent =
        bajo.length;


    document.getElementById(
        "pendientes"
    ).textContent =
        dinero(pendientes);


    document.getElementById(
        "reporteTotal"
    ).textContent =
        dinero(totalVendido);


    document.getElementById(
        "reportePendiente"
    ).textContent =
        dinero(pendientes);


    document.getElementById(
        "reporteUnidades"
    ).textContent =
        unidades;

}



/* ================= PRODUCTOS INICIO ================= */

function mostrarProductosInicio() {

    const tabla =
        document.getElementById(
            "tablaInicioProductos"
        );


    tabla.innerHTML = "";


    productos
        .slice(-6)
        .reverse()
        .forEach(function(producto) {

            let clase = "";


            if (producto.stock === 0) {

                clase = "agotado";

            }

            else if (producto.stock <= 3) {

                clase = "bajo";

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

        });


    if (productos.length === 0) {

        tabla.innerHTML = `

            <tr>

                <td colspan="5">
                    Aún no hay productos.
                </td>

            </tr>

        `;

    }

}



/* ================= VENTAS INICIO ================= */

function mostrarVentasInicio() {

    const tabla =
        document.getElementById(
            "tablaInicioVentas"
        );


    tabla.innerHTML = "";


    ventas
        .slice(-6)
        .reverse()
        .forEach(function(venta) {

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

        });


    if (ventas.length === 0) {

        tabla.innerHTML = `

            <tr>

                <td colspan="4">
                    Aún no hay ventas.
                </td>

            </tr>

        `;

    }

}



/* ================= BAJO STOCK ================= */

function mostrarBajoStock() {

    const tabla =
        document.getElementById(
            "tablaBajoStock"
        );


    tabla.innerHTML = "";


    productos
        .filter(
            producto =>
                producto.stock <= 3
        )
        .sort(
            (a, b) =>
                a.stock - b.stock
        )
        .forEach(function(producto) {

            const clase =
                producto.stock === 0
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

        });


    if (
        !productos.some(
            producto =>
                producto.stock <= 3
        )
    ) {

        tabla.innerHTML = `

            <tr>

                <td colspan="3">
                    No hay productos con poco stock.
                </td>

            </tr>

        `;

    }

}



/* ================= CONFIGURACION ================= */

function guardarConfiguracion() {

    const url =
        document.getElementById(
            "urlGoogleSheets"
        ).value.trim();


    localStorage.setItem(
        "googleSheetsURL",
        url
    );


    mostrarMensaje(
        "Configuración guardada"
    );

}


const urlGuardada =
    localStorage.getItem(
        "googleSheetsURL"
    );


if (urlGuardada) {

    document.getElementById(
        "urlGoogleSheets"
    ).value =
        urlGuardada;

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

    const ahora =
        new Date();


    document.getElementById(
        "fechaActual"
    ).textContent =
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



/* ================= INICIAR ================= */

actualizarTodo();