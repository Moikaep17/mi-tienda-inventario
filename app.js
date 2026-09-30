// ==========================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================
let productos = JSON.parse(localStorage.getItem('productos')) || [];
let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
let urlGoogleSheets = localStorage.getItem('urlGoogleSheets') || '';

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    // Fecha actual en la cabecera
    const fechaDiv = document.getElementById('fechaActual');
    if (fechaDiv) {
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        fechaDiv.innerText = new Date().toLocaleDateString('es-ES', opciones);
    }

    const hoy = new Date().toISOString().split('T')[0];
    if (document.getElementById('fechaVenta')) document.getElementById('fechaVenta').value = hoy;
    if (document.getElementById('fechaAbono')) document.getElementById('fechaAbono').value = hoy;

    // Escuchadores de eventos para cálculo de costos/ganancia en tiempo real
    ['valorProducto', 'impuestosProducto', 'costosVarios', 'costosIntroduccion', 'gananciaProducto'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.addEventListener('input', calcularTotalesProducto);
    });

    document.getElementById('formProducto').addEventListener('submit', guardarProducto);
    document.getElementById('cancelarEdicion').addEventListener('click', limpiarFormularioProducto);
    document.getElementById('buscarProducto').addEventListener('input', filtrarProductos);
    
    // Escuchadores de Ventas
    document.getElementById('productoVenta').addEventListener('change', actualizarPrecioVenta);
    document.getElementById('cantidadVenta').addEventListener('input', calcularTotalVenta);
    document.getElementById('formVenta').addEventListener('submit', registrarVenta);

    // Cargar URL guardada
    const inputUrl = document.getElementById('urlGoogleSheets');
    if (inputUrl && urlGoogleSheets) {
        inputUrl.value = urlGoogleSheets;
        await cargarDatosGoogleSheets();
    } else {
        actualizarTodo();
    }
});

// ==========================================
// NAVEGACIÓN Y MENÚ MÓVIL
// ==========================================
function mostrarSeccion(idSeccion, botonClick) {
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(sec => sec.classList.remove('activa'));

    const seccionTarget = document.getElementById(idSeccion);
    if (seccionTarget) seccionTarget.classList.add('activa');

    const botonesMenu = document.querySelectorAll('.sidebar nav button');
    botonesMenu.forEach(btn => btn.classList.remove('active'));

    if (botonClick) {
        botonClick.classList.add('active');
    }

    const titulo = document.getElementById('tituloPagina');
    const subtitulo = document.getElementById('subtituloPagina');
    
    const titulos = {
        'inicio': { t: 'Mi Tienda', s: 'Panel principal de control' },
        'inventario': { t: 'Inventario', s: 'Gestión y control de productos' },
        'ventas': { t: 'Ventas', s: 'Registro de cobros y abonos' },
        'reportes': { t: 'Reportes', s: 'Resumen financiero e informes' },
        'configuracion': { t: 'Configuración', s: 'Ajustes y sincronización' }
    };

    if (titulos[idSeccion]) {
        titulo.innerText = titulos[idSeccion].t;
        subtitulo.innerText = titulos[idSeccion].s;
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
}

function toggleSidebarMobile() {
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

// ==========================================
// CÁLCULO EN TIEMPO REAL - INVENTARIO
// ==========================================
function calcularTotalesProducto() {
    const valor = parseFloat(document.getElementById('valorProducto').value) || 0;
    const impuestos = parseFloat(document.getElementById('impuestosProducto').value) || 0;
    const varios = parseFloat(document.getElementById('costosVarios').value) || 0;
    const introduccion = parseFloat(document.getElementById('costosIntroduccion').value) || 0;
    const ganancia = parseFloat(document.getElementById('gananciaProducto').value) || 0;

    const subtotal = valor + impuestos + varios + introduccion;
    const total = subtotal + ganancia;

    document.getElementById('subtotalProducto').innerText = `L. ${subtotal.toFixed(2)}`;
    document.getElementById('totalProducto').innerText = `L. ${total.toFixed(2)}`;

    return { subtotal, total };
}

// ==========================================
// GESTIÓN DE PRODUCTOS
// ==========================================
async function guardarProducto(e) {
    e.preventDefault();

    const idInput = document.getElementById('productoID').value;
    const nombre = document.getElementById('nombreProducto').value.trim();
    const marca = document.getElementById('marcaProducto').value.trim();
    const detalle = document.getElementById('detalleProducto').value.trim();
    
    const valor = parseFloat(document.getElementById('valorProducto').value) || 0;
    const impuestos = parseFloat(document.getElementById('impuestosProducto').value) || 0;
    const varios = parseFloat(document.getElementById('costosVarios').value) || 0;
    const introduccion = parseFloat(document.getElementById('costosIntroduccion').value) || 0;
    const ganancia = parseFloat(document.getElementById('gananciaProducto').value) || 0;
    
    const { subtotal, total } = calcularTotalesProducto();
    const cantidad = parseInt(document.getElementById('cantidadProducto').value, 10) || 0;

    const productoData = {
        id: idInput || '',
        nombre,
        marca,
        detalle,
        valor,
        impuestos,
        varios,
        introduccion,
        subtotal,
        ganancia,
        precio: total,
        cantidad
    };

    const accion = idInput ? 'editarProducto' : 'guardarProducto';

    if (idInput) {
        const index = productos.findIndex(p => p.id === idInput);
        if (index !== -1) productos[index] = productoData;
        mostrarNotificacion('Producto actualizado correctamente');
    } else {
        productoData.id = 'PRD' + String(productos.length + 1).padStart(3, '0');
        productos.push(productoData);
        mostrarNotificacion('Producto guardado con éxito');
    }

    guardarEnLocalStorage();
    limpiarFormularioProducto();
    actualizarTodo();

    await enviarAGoogleSheets({ action: accion, producto: productoData });
}

function editarProducto(id) {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;

    document.getElementById('productoID').value = prod.id;
    document.getElementById('nombreProducto').value = prod.nombre;
    document.getElementById('marcaProducto').value = prod.marca;
    document.getElementById('detalleProducto').value = prod.detalle || '';
    document.getElementById('valorProducto').value = prod.valor || 0;
    document.getElementById('impuestosProducto').value = prod.impuestos || 0;
    document.getElementById('costosVarios').value = prod.varios || 0;
    document.getElementById('costosIntroduccion').value = prod.introduccion || 0;
    document.getElementById('gananciaProducto').value = prod.ganancia || 0;
    document.getElementById('cantidadProducto').value = prod.cantidad || prod.stock || 0;

    calcularTotalesProducto();
    document.getElementById('cancelarEdicion').classList.remove('oculto');
    mostrarSeccion('inventario');
}

async function eliminarProducto(id) {
    if (confirm('¿Deseas eliminar este producto permanentemente?')) {
        productos = productos.filter(p => p.id !== id);
        guardarEnLocalStorage();
        actualizarTodo();
        mostrarNotificacion('Producto eliminado');

        await enviarAGoogleSheets({ action: 'eliminarProducto', id });
    }
}

function limpiarFormularioProducto() {
    document.getElementById('formProducto').reset();
    document.getElementById('productoID').value = '';
    document.getElementById('subtotalProducto').innerText = 'L. 0.00';
    document.getElementById('totalProducto').innerText = 'L. 0.00';
    document.getElementById('cancelarEdicion').classList.add('oculto');
}

function filtrarProductos() {
    const termino = document.getElementById('buscarProducto').value.toLowerCase();
    const filtrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(termino) ||
        p.marca.toLowerCase().includes(termino) ||
        p.id.toLowerCase().includes(termino)
    );
    renderTablaInventario(filtrados);
}

// ==========================================
// GESTIÓN DE VENTAS Y ABONOS
// ==========================================
function toggleSeccionAbono() {
    const estado = document.getElementById('estadoPago').value;
    const seccion = document.getElementById('seccionAbono');
    if (estado === 'Abono') {
        seccion.classList.remove('oculto');
    } else {
        seccion.classList.add('oculto');
    }
}

function actualizarPrecioVenta() {
    calcularTotalVenta();
}

function calcularTotalVenta() {
    const idProd = document.getElementById('productoVenta').value;
    const cantidad = parseInt(document.getElementById('cantidadVenta').value, 10) || 0;
    const prod = productos.find(p => p.id === idProd);

    if (prod && cantidad > 0) {
        const total = prod.precio * cantidad;
        document.getElementById('totalVenta').innerText = `L. ${total.toFixed(2)}`;
    } else {
        document.getElementById('totalVenta').innerText = 'L. 0.00';
    }
}

async function registrarVenta(e) {
    e.preventDefault();

    const idProd = document.getElementById('productoVenta').value;
    const cantidad = parseInt(document.getElementById('cantidadVenta').value, 10);
    const cliente = document.getElementById('clienteVenta').value.trim();
    const metodo = document.getElementById('metodoPago').value;
    let estado = document.getElementById('estadoPago').value;
    const fecha = document.getElementById('fechaVenta').value;

    const prodIndex = productos.findIndex(p => p.id === idProd);
    if (prodIndex === -1) return alert('Selecciona un producto válido.');

    const prod = productos[prodIndex];
    if (prod.cantidad < cantidad) return alert(`Stock insuficiente (${prod.cantidad} unidades disponibles).`);

    const totalVenta = prod.precio * cantidad;
    let abonosHistorial = [];
    let totalAbonado = 0;

    if (estado === 'Abono') {
        const montoAbono = parseFloat(document.getElementById('montoAbono').value) || 0;
        const fechaAbono = document.getElementById('fechaAbono').value || fecha;

        if (montoAbono <= 0) return alert('Ingresa un monto de abono válido.');
        if (montoAbono >= totalVenta) {
            estado = 'Pagado';
            totalAbonado = totalVenta;
        } else {
            totalAbonado = montoAbono;
        }

        abonosHistorial.push({ fecha: fechaAbono, monto: totalAbonado });
    } else if (estado === 'Pagado') {
        totalAbonado = totalVenta;
        abonosHistorial.push({ fecha, monto: totalVenta });
    }

    productos[prodIndex].cantidad -= cantidad;

    const nuevaVenta = {
        id: 'V' + String(ventas.length + 1).padStart(3, '0'),
        fecha,
        productoId: prod.id,
        productoNombre: prod.nombre,
        cliente,
        cantidad,
        precioUnitario: prod.precio,
        total: totalVenta,
        totalAbonado,
        saldoPendiente: totalVenta - totalAbonado,
        metodo,
        estado,
        abonos: abonosHistorial
    };

    ventas.push(nuevaVenta);

    guardarEnLocalStorage();
    actualizarTodo();
    document.getElementById('formVenta').reset();
    document.getElementById('seccionAbono').classList.add('oculto');
    document.getElementById('fechaVenta').value = new Date().toISOString().split('T')[0];
    mostrarNotificacion('¡Venta registrada con éxito!');

    await enviarAGoogleSheets({ action: 'registrarVenta', venta: nuevaVenta });
}

async function agregarAbonoExistente(ventaId) {
    const venta = ventas.find(v => v.id === ventaId);
    if (!venta) return;

    const monto = parseFloat(prompt(`Saldo pendiente actual: L. ${venta.saldoPendiente.toFixed(2)}\nIngrese el monto del nuevo abono:`));
    if (!monto || monto <= 0) return;
    if (monto > venta.saldoPendiente) return alert('El abono ingresado supera el saldo pendiente.');

    const fechaAbono = new Date().toISOString().split('T')[0];
    venta.totalAbonado += monto;
    venta.saldoPendiente -= monto;
    if (!venta.abonos) venta.abonos = [];
    venta.abonos.push({ fecha: fechaAbono, monto });

    if (venta.saldoPendiente <= 0) {
        venta.estado = 'Pagado';
    } else {
        venta.estado = 'Abono';
    }

    guardarEnLocalStorage();
    actualizarTodo();
    mostrarNotificacion('Abono registrado correctamente');

    await enviarAGoogleSheets({ action: 'actualizarAbonoVenta', venta });
}

// ==========================================
// RENDERIZADO Y TABLAS
// ==========================================
function actualizarTodo() {
    renderTablaInventario(productos);
    renderSelectProductosVenta();
    renderTablaVentas();
    renderTablaInicioProductos();
    renderTablaInicioVentas();
    renderTablaBajoStock();
    actualizarTarjetasYReportes();
}

function renderTablaInventario(lista) {
    const tbody = document.getElementById('tablaProductos');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 20px; color: var(--text-muted);">No se encontraron productos.</td></tr>`;
        return;
    }

    lista.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td><small style="color:var(--text-muted);">${p.id}</small></td>
                <td><strong>${p.nombre}</strong></td>
                <td>${p.marca}</td>
                <td>L. ${(p.subtotal || 0).toFixed(2)}</td>
                <td>L. ${(p.ganancia || 0).toFixed(2)}</td>
                <td><strong>L. ${(p.precio || 0).toFixed(2)}</strong></td>
                <td>${p.cantidad || p.stock || 0}</td>
                <td>
                    <button class="boton-sm primario" onclick="editarProducto('${p.id}')">✏️</button>
                    <button class="boton-sm peligro" onclick="eliminarProducto('${p.id}')">🗑️</button>
                </td>
            </tr>
        `;
    });
}

function renderTablaVentas() {
    const tbody = document.getElementById('tablaVentas');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (ventas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color: var(--text-muted);">No hay ventas registradas.</td></tr>`;
        return;
    }

    ventas.slice().reverse().forEach(v => {
        let badgeClass = 'success';
        if (v.estado === 'Pendiente') badgeClass = 'danger';
        if (v.estado === 'Abono') badgeClass = 'warning';

        let detalleAbonos = 'Sin abonos';
        if (v.abonos && v.abonos.length > 0) {
            detalleAbonos = v.abonos.map(a => `<small style="color:var(--text-muted);">${a.fecha}: L. ${a.monto.toFixed(2)}</small>`).join('<br>');
        } else if (v.abonosTexto) {
            detalleAbonos = `<small style="color:var(--text-muted);">${v.abonosTexto}</small>`;
        }

        tbody.innerHTML += `
            <tr>
                <td>${v.fecha}</td>
                <td><strong>${v.productoNombre || v.producto}</strong> <span style="color:var(--text-muted);">(${v.cantidad})</span></td>
                <td>${v.cliente}</td>
                <td>Total: L. ${(v.total || 0).toFixed(2)}<br><small style="color:var(--success);">Abonado: L. ${(v.totalAbonado || 0).toFixed(2)}</small></td>
                <td><span class="badge ${badgeClass}">${v.estado}</span><br><small style="color:var(--danger);">Pend: L. ${(v.saldoPendiente || 0).toFixed(2)}</small></td>
                <td>${detalleAbonos}</td>
                <td>
                    ${(v.saldoPendiente || 0) > 0 ? `<button class="boton-sm primario" onclick="agregarAbonoExistente('${v.id}')">+ Abono</button>` : '✅ Pagado'}
                </td>
            </tr>
        `;
    });
}

function renderSelectProductosVenta() {
    const select = document.getElementById('productoVenta');
    if (!select) return;
    select.innerHTML = '<option value="">-- Selecciona un producto --</option>';
    productos.forEach(p => {
        const stockActual = p.cantidad !== undefined ? p.cantidad : p.stock;
        if (stockActual > 0) {
            select.innerHTML += `<option value="${p.id}">${p.nombre} (${p.marca}) - L. ${(p.precio || 0).toFixed(2)} [Stock: ${stockActual}]</option>`;
        }
    });
}

function renderTablaInicioProductos() {
    const tbody = document.getElementById('tablaInicioProductos');
    if (!tbody) return;
    tbody.innerHTML = '';
    productos.slice(-5).reverse().forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td><small>${p.id}</small></td>
                <td><strong>${p.nombre}</strong></td>
                <td>L. ${(p.precio || 0).toFixed(2)}</td>
                <td>${p.cantidad !== undefined ? p.cantidad : p.stock}</td>
            </tr>
        `;
    });
}

function renderTablaInicioVentas() {
    const tbody = document.getElementById('tablaInicioVentas');
    if (!tbody) return;
    tbody.innerHTML = '';
    ventas.slice(-5).reverse().forEach(v => {
        tbody.innerHTML += `
            <tr>
                <td>${v.fecha}</td>
                <td>${v.productoNombre || v.producto}</td>
                <td>${v.cliente}</td>
                <td>L. ${(v.total || 0).toFixed(2)}</td>
            </tr>
        `;
    });
}

function renderTablaBajoStock() {
    const tbody = document.getElementById('tablaBajoStock');
    if (!tbody) return;
    tbody.innerHTML = '';
    const pocoStock = productos.filter(p => (p.cantidad !== undefined ? p.cantidad : p.stock) <= 3);

    if (pocoStock.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2" style="text-align:center; padding: 20px; color: var(--success);">¡Excelente! No hay productos con bajo stock.</td></tr>`;
        return;
    }

    pocoStock.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${p.nombre}</strong> (${p.marca})</td>
                <td><span class="badge warning">${p.cantidad !== undefined ? p.cantidad : p.stock} unidades</span></td>
            </tr>
        `;
    });
}

function actualizarTarjetasYReportes() {
    const hoyStr = new Date().toISOString().split('T')[0];
    
    const ventasHoyMonto = ventas
        .filter(v => v.fecha === hoyStr)
        .reduce((acc, v) => acc + (v.totalAbonado || v.total || 0), 0);

    const pendientesMonto = ventas
        .reduce((acc, v) => acc + (v.saldoPendiente || 0), 0);

    const totalVendidoHistorico = ventas
        .reduce((acc, v) => acc + (v.totalAbonado || v.total || 0), 0);

    if (document.getElementById('totalProductos')) document.getElementById('totalProductos').innerText = productos.length;
    if (document.getElementById('ventasHoy')) document.getElementById('ventasHoy').innerText = `L. ${ventasHoyMonto.toFixed(2)}`;
    if (document.getElementById('bajoStock')) document.getElementById('bajoStock').innerText = productos.filter(p => (p.cantidad !== undefined ? p.cantidad : p.stock) <= 3).length;
    if (document.getElementById('pendientes')) document.getElementById('pendientes').innerText = `L. ${pendientesMonto.toFixed(2)}`;

    if (document.getElementById('reporteTotal')) document.getElementById('reporteTotal').innerText = `L. ${totalVendidoHistorico.toFixed(2)}`;
    if (document.getElementById('reportePendiente')) document.getElementById('reportePendiente').innerText = `L. ${pendientesMonto.toFixed(2)}`;
}

// ==========================================
// GOOGLE SHEETS & PERSISTENCIA
// ==========================================
async function guardarConfiguracion() {
    const url = document.getElementById('urlGoogleSheets').value.trim();
    localStorage.setItem('urlGoogleSheets', url);
    urlGoogleSheets = url;
    mostrarNotificacion('Configuración guardada correctamente');
    if (url) await cargarDatosGoogleSheets();
}

async function cargarDatosGoogleSheets() {
    if (!urlGoogleSheets) return;
    try {
        const res = await fetch(urlGoogleSheets);
        const data = await res.json();
        if (data.success) {
            if (Array.isArray(data.productos)) productos = data.productos;
            if (Array.isArray(data.ventas)) ventas = data.ventas;
            guardarEnLocalStorage();
            actualizarTodo();
        }
    } catch (e) {
        console.error('Error al cargar datos desde Google Sheets:', e);
    }
}

async function enviarAGoogleSheets(datos) {
    if (!urlGoogleSheets) return;

    try {
        await fetch(urlGoogleSheets, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(datos)
        });
        console.log('Sincronizado con Google Sheets');
    } catch (err) {
        console.error('Error al sincronizar:', err);
    }
}

function guardarEnLocalStorage() {
    localStorage.setItem('productos', JSON.stringify(productos));
    localStorage.setItem('ventas', JSON.stringify(ventas));
}

function mostrarNotificacion(msj) {
    const contenedor = document.getElementById('mensaje');
    if (!contenedor) return;
    contenedor.innerText = msj;
    contenedor.classList.add('mostrar');
    setTimeout(() => contenedor.classList.remove('mostrar'), 3000);
}