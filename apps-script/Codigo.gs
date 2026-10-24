/**
 * Azabache Pet · Panel de administración
 *
 * Se pega en Extensiones → Apps Script de la planilla de gestión (ver INSTALAR.md).
 * La planilla es la base de datos; el panel (Panel.html) la lee y escribe con estas funciones.
 *
 * Acceso: se implementa como "Ejecutar como: usuario que accede", así cada persona
 * usa su propia cuenta de Google y solo entra quien tenga la planilla compartida.
 */

// Solo si el proyecto se creó suelto (desde script.google.com y no desde Extensiones → Apps Script):
// el ID de la planilla, que es la parte de su URL entre /d/ y /edit.
const ID_PLANILLA = '';

// Columnas de cada hoja. El orden solo importa al crear la hoja: después se lee y escribe por nombre.
const HOJAS = {
  productos: { nombre: 'Productos', columnas: ['id', 'nombre', 'marca', 'tamano', 'mascota', 'categoria', 'costo', 'precio', 'stock', 'stock_minimo', 'foto', 'activo'] },
  ventas:    { nombre: 'Ventas',    columnas: ['venta_id', 'fecha', 'cliente', 'telefono', 'barrio', 'direccion', 'pago', 'producto_id', 'producto', 'cantidad', 'precio_unit', 'costo_unit', 'total_linea', 'ganancia_linea', 'estado', 'notas', 'registrado_por'] },
  compras:   { nombre: 'Compras',   columnas: ['fecha', 'producto_id', 'producto', 'cantidad', 'costo_unit', 'total', 'proveedor', 'registrado_por'] },
  gastos:    { nombre: 'Gastos',    columnas: ['fecha', 'concepto', 'categoria', 'monto', 'notas', 'registrado_por'] },
  config:    { nombre: 'Config',    columnas: ['clave', 'valor', 'descripcion'] },
  // Única hoja que se publica en la web: la lee el catálogo. No tiene costos ni cantidades.
  catalogo:  { nombre: 'Catalogo',  columnas: ['id', 'nombre', 'marca', 'tamano', 'precio', 'mascota', 'categoria', 'stock', 'foto'] },
};

const CONFIG_INICIAL = [
  ['nombre', 'Azabache Pet', 'Nombre del negocio'],
  ['capital_inicial', 1800000, 'Plata invertida al arrancar (para medir cuánto se recuperó)'],
  ['barrios', 'Caballito, Flores, Villa Crespo, Palermo, Microcentro', 'Separados por coma'],
  ['formas_pago', 'Efectivo, Transferencia, Mercado Pago', 'Separadas por coma'],
  ['categorias_gasto', 'Envíos y embalaje, Publicidad, Web y herramientas, Otros', 'Separadas por coma'],
  ['dias_cobertura', 14, 'Para cuántos días de ventas se sugiere reponer'],
];

// Productos de ejemplo (los mismos del catálogo). Stock y costo arrancan en 0:
// se completan con "Ingreso de mercadería" desde el panel.
const PRODUCTOS_EJEMPLO = [
  ['bal-perro-adulto-15', 'Alimento perro adulto', 'Marca A', '15 kg', 'perro', 'alimento', 38500, 2],
  ['bal-perro-adulto-3', 'Alimento perro adulto', 'Marca A', '3 kg', 'perro', 'alimento', 9800, 3],
  ['bal-perro-cachorro-8', 'Alimento cachorro', 'Marca B', '8 kg', 'perro', 'alimento', 27400, 2],
  ['bal-perro-premium-15', 'Alimento premium raza mediana', 'Marca C', '15 kg', 'perro', 'alimento', 62900, 1],
  ['bal-gato-adulto-10', 'Alimento gato adulto', 'Marca A', '10 kg', 'gato', 'alimento', 34200, 2],
  ['bal-gato-castrado-3', 'Alimento gato castrado', 'Marca C', '3 kg', 'gato', 'alimento', 15600, 3],
  ['bal-gato-kitten-1', 'Alimento gatito', 'Marca B', '1 kg', 'gato', 'alimento', 5900, 3],
  ['hum-gato-pouch-85', 'Pouch gato carne', 'Marca D', '85 g', 'gato', 'humedo', 1100, 12],
  ['hum-gato-lata-340', 'Lata gato pescado', 'Marca D', '340 g', 'gato', 'humedo', 2900, 6],
  ['hum-perro-lata-340', 'Lata perro pollo', 'Marca E', '340 g', 'perro', 'humedo', 2700, 6],
  ['pied-bentonita-4', 'Piedritas aglomerantes', 'Marca F', '4 kg', 'gato', 'piedritas', 6200, 5],
  ['pied-silica-38', 'Piedritas sílica', 'Marca F', '3,8 L', 'gato', 'piedritas', 9400, 3],
  ['pied-comun-10', 'Piedritas comunes', 'Marca G', '10 kg', 'gato', 'piedritas', 7800, 3],
  ['panos-60x60-30', 'Paños absorbentes 60x60', 'Marca H', 'x30 u', 'perro', 'panos', 11500, 3],
  ['panos-60x90-15', 'Paños absorbentes 60x90', 'Marca H', 'x15 u', 'perro', 'panos', 9900, 3],
];

const FORMATO_PESOS = '"$"#,##0';

// ───────────────────────── Web app ─────────────────────────

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Panel')
    .setTitle('Azabache Pet · Administración')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setFaviconUrl('https://zay016.github.io/petshop-catalogo/img/favicon.png');
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🐾 Azabache Pet')
    .addItem('Actualizar catálogo público', 'actualizarCatalogo')
    .addItem('Instalar / reparar hojas', 'instalar')
    .addToUi();
}

// Cada cambio hecho a mano en Productos se refleja en la hoja pública del catálogo.
function onEdit(e) {
  if (e && e.range && e.range.getSheet().getName() === HOJAS.productos.nombre) actualizarCatalogo();
}

// ───────────────────────── Instalación ─────────────────────────

/** Crea las hojas que falten, con encabezados, formatos y listas desplegables. Se puede correr de nuevo sin perder datos. */
function instalar() {
  const vinculado = SpreadsheetApp.getActive();
  const ss = vinculado || libro_();
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', ss.getId());

  for (const def of Object.values(HOJAS)) {
    const sh = ss.getSheetByName(def.nombre) || ss.insertSheet(def.nombre);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, def.columnas.length).setValues([def.columnas])
        .setFontWeight('bold').setBackground('#eef0e2').setFontColor('#1b1a16');
      sh.setFrozenRows(1);
    }
  }

  const config = hoja_('config');
  if (config.getLastRow() === 1) config.getRange(2, 1, CONFIG_INICIAL.length, 3).setValues(CONFIG_INICIAL);

  const productos = hoja_('productos');
  if (productos.getLastRow() === 1) {
    const filas = PRODUCTOS_EJEMPLO.map(([id, nombre, marca, tamano, mascota, categoria, precio, minimo]) =>
      [id, nombre, marca, tamano, mascota, categoria, 0, precio, 0, minimo, '', 'sí']);
    productos.getRange(2, 1, filas.length, filas[0].length).setValues(filas);
  }

  formatear_();

  // La hoja vacía que trae toda planilla nueva ("Hoja 1" / "Sheet1").
  for (const sh of ss.getSheets()) {
    const nuestra = Object.values(HOJAS).some(d => d.nombre === sh.getName());
    if (!nuestra && sh.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(sh);
  }

  // Un proyecto suelto no recibe onOpen/onEdit de la planilla: se crean como activadores instalables.
  if (!vinculado) instalarActivadores_(ss);

  actualizarCatalogo();
  return 'Listo: hojas creadas y catálogo actualizado.';
}

function instalarActivadores_(ss) {
  const existentes = ScriptApp.getProjectTriggers().map(t => t.getHandlerFunction());
  if (!existentes.includes('onOpen')) ScriptApp.newTrigger('onOpen').forSpreadsheet(ss).onOpen().create();
  if (!existentes.includes('onEdit')) ScriptApp.newTrigger('onEdit').forSpreadsheet(ss).onEdit().create();
}

function formatear_() {
  const filas = 1000;
  const col = (clave, nombre) => HOJAS[clave].columnas.indexOf(nombre) + 1;
  const formato = (clave, nombres, fmt) => nombres.forEach(n => hoja_(clave).getRange(2, col(clave, n), filas, 1).setNumberFormat(fmt));

  formato('productos', ['costo', 'precio'], FORMATO_PESOS);
  formato('ventas', ['precio_unit', 'costo_unit', 'total_linea', 'ganancia_linea'], FORMATO_PESOS);
  formato('ventas', ['fecha'], 'dd/mm/yyyy hh:mm');
  formato('ventas', ['telefono'], '@');
  formato('compras', ['costo_unit', 'total'], FORMATO_PESOS);
  formato('compras', ['fecha'], 'dd/mm/yyyy hh:mm');
  formato('gastos', ['monto'], FORMATO_PESOS);
  formato('gastos', ['fecha'], 'dd/mm/yyyy');
  formato('catalogo', ['precio'], '0');

  const lista = valores => SpreadsheetApp.newDataValidation().requireValueInList(valores, true).setAllowInvalid(false).build();
  const p = hoja_('productos');
  p.getRange(2, col('productos', 'mascota'), filas, 1).setDataValidation(lista(['perro', 'gato', 'ambos']));
  p.getRange(2, col('productos', 'categoria'), filas, 1).setDataValidation(lista(['alimento', 'humedo', 'piedritas', 'panos', 'accesorios']));
  p.getRange(2, col('productos', 'activo'), filas, 1).setDataValidation(lista(['sí', 'no']));
}

// ───────────────────────── Lectura ─────────────────────────

/** Todo lo que necesita el panel, en una sola llamada. Las fechas viajan como texto ISO. */
function getDatos() {
  const datos = {};
  for (const clave of ['productos', 'ventas', 'compras', 'gastos']) datos[clave] = leer_(clave).map(serializar_);
  datos.config = config_();
  datos.usuario = Session.getActiveUser().getEmail();
  datos.planilla = libro_().getUrl();
  return datos;
}

/** Hoja pública que lee el catálogo web: solo productos activos, y stock como disponible sí/no. */
function actualizarCatalogo() {
  const filas = leer_('productos')
    .filter(p => p.id && esVerdadero_(p.activo))
    .map(p => [p.id, p.nombre, p.marca, p.tamano, Number(p.precio) || 0, p.mascota, p.categoria, Number(p.stock) > 0, p.foto || '']);
  const sh = hoja_('catalogo');
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, HOJAS.catalogo.columnas.length).clearContent();
  if (filas.length) sh.getRange(2, 1, filas.length, filas[0].length).setValues(filas);
}

// ───────────────────────── Escritura (las llama el panel) ─────────────────────────

/**
 * venta = { fecha?, cliente, telefono, barrio, direccion, pago, notas, permitirSinStock,
 *           items: [{ id, cantidad, precio? }] }   (precio vacío = precio de lista)
 */
function registrarVenta(venta) {
  return conLock_(() => {
    const items = (venta.items || []).filter(it => it && it.id);
    if (!items.length) throw new Error('La venta no tiene productos.');
    if (!String(venta.cliente || '').trim()) throw new Error('Falta el nombre del cliente.');

    const productos = porId_(leer_('productos'));
    const pedido = {};
    for (const it of items) {
      const p = productos[it.id];
      if (!p) throw new Error(`El producto ${it.id} no existe en la planilla.`);
      it.cantidad = Math.round(Number(it.cantidad));
      if (!(it.cantidad > 0)) throw new Error(`Cantidad inválida para ${nombreProducto_(p)}.`);
      pedido[it.id] = (pedido[it.id] || 0) + it.cantidad;
    }
    if (!venta.permitirSinStock) {
      for (const [id, cant] of Object.entries(pedido)) {
        const p = productos[id];
        if ((Number(p.stock) || 0) < cant) throw new Error(`No alcanza el stock de ${nombreProducto_(p)}: quedan ${Number(p.stock) || 0}.`);
      }
    }

    const ventaId = siguienteIdVenta_();
    const fecha = venta.fecha ? new Date(venta.fecha) : new Date();
    const usuario = Session.getActiveUser().getEmail();
    const filas = items.map(it => {
      const p = productos[it.id];
      const precio = it.precio === undefined || it.precio === null || it.precio === '' ? Number(p.precio) || 0 : Number(it.precio);
      const costo = Number(p.costo) || 0;
      return {
        venta_id: ventaId, fecha, cliente: texto_(venta.cliente), telefono: texto_(venta.telefono),
        barrio: texto_(venta.barrio), direccion: texto_(venta.direccion), pago: texto_(venta.pago),
        producto_id: p.id, producto: nombreProducto_(p), cantidad: it.cantidad,
        precio_unit: precio, costo_unit: costo, total_linea: precio * it.cantidad,
        ganancia_linea: (precio - costo) * it.cantidad, estado: 'Confirmada', notas: texto_(venta.notas),
        registrado_por: usuario,
      };
    });
    agregar_('ventas', filas);

    for (const [id, cant] of Object.entries(pedido)) setCampo_('productos', productos[id], 'stock', (Number(productos[id].stock) || 0) - cant);
    actualizarCatalogo();
    return { mensaje: `Venta ${ventaId} registrada.`, datos: getDatos() };
  });
}

/** Marca la venta como anulada y devuelve las unidades al stock. Las filas no se borran. */
function anularVenta(ventaId) {
  return conLock_(() => {
    const lineas = leer_('ventas').filter(v => v.venta_id === ventaId && v.estado !== 'Anulada');
    if (!lineas.length) throw new Error(`No encontré la venta ${ventaId} (o ya estaba anulada).`);
    const productos = porId_(leer_('productos'));
    for (const l of lineas) {
      setCampo_('ventas', l, 'estado', 'Anulada');
      const p = productos[l.producto_id];
      if (p) {
        p.stock = (Number(p.stock) || 0) + (Number(l.cantidad) || 0);
        setCampo_('productos', p, 'stock', p.stock);
      }
    }
    actualizarCatalogo();
    return { mensaje: `Venta ${ventaId} anulada; el stock volvió.`, datos: getDatos() };
  });
}

/**
 * Ingreso de mercadería: suma stock y recalcula el costo como promedio ponderado
 * (lo que ya había a su costo + lo que entra a su costo).
 * compra = { fecha?, producto_id, cantidad, costo_unit, proveedor }
 */
function registrarCompra(compra) {
  return conLock_(() => {
    const p = porId_(leer_('productos'))[compra.producto_id];
    if (!p) throw new Error('Elegí un producto.');
    const cantidad = Math.round(Number(compra.cantidad));
    const costoUnit = Number(compra.costo_unit);
    if (!(cantidad > 0)) throw new Error('La cantidad tiene que ser mayor a 0.');
    if (!(costoUnit >= 0)) throw new Error('Revisá el costo unitario.');

    const stockAntes = Math.max(Number(p.stock) || 0, 0);
    const costoAntes = Number(p.costo) || 0;
    const costoNuevo = stockAntes > 0 ? Math.round((stockAntes * costoAntes + cantidad * costoUnit) / (stockAntes + cantidad)) : costoUnit;

    agregar_('compras', [{
      fecha: compra.fecha ? new Date(compra.fecha) : new Date(), producto_id: p.id, producto: nombreProducto_(p),
      cantidad, costo_unit: costoUnit, total: cantidad * costoUnit, proveedor: texto_(compra.proveedor),
      registrado_por: Session.getActiveUser().getEmail(),
    }]);
    setCampo_('productos', p, 'stock', (Number(p.stock) || 0) + cantidad);
    setCampo_('productos', p, 'costo', costoNuevo);
    actualizarCatalogo();
    return { mensaje: `Entraron ${cantidad} u. de ${nombreProducto_(p)}.`, datos: getDatos() };
  });
}

/** gasto = { fecha?, concepto, categoria, monto, notas } */
function registrarGasto(gasto) {
  return conLock_(() => {
    const monto = Number(gasto.monto);
    if (!String(gasto.concepto || '').trim()) throw new Error('Falta el concepto del gasto.');
    if (!(monto > 0)) throw new Error('El monto tiene que ser mayor a 0.');
    agregar_('gastos', [{
      fecha: gasto.fecha ? new Date(gasto.fecha) : new Date(), concepto: texto_(gasto.concepto),
      categoria: texto_(gasto.categoria), monto, notas: texto_(gasto.notas),
      registrado_por: Session.getActiveUser().getEmail(),
    }]);
    return { mensaje: 'Gasto registrado.', datos: getDatos() };
  });
}

// ───────────────────────── Prueba ─────────────────────────

/** Correr desde el editor para verificar que la planilla está bien armada. */
function probar() {
  const d = getDatos();
  Logger.log('Productos: %s · Ventas (líneas): %s · Compras: %s · Gastos: %s', d.productos.length, d.ventas.length, d.compras.length, d.gastos.length);
  Logger.log('Config: %s', JSON.stringify(d.config));
  Logger.log('Usuario: %s', d.usuario);
}

// ───────────────────────── Auxiliares ─────────────────────────

function libro_() {
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID') || ID_PLANILLA;
  let ss;
  try {
    ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActive();
  } catch (err) {
    throw new Error('Tu cuenta no tiene acceso a la planilla de gestión. Pedile a quien la administra que te la comparta.');
  }
  if (!ss) throw new Error('El proyecto no está vinculado a ninguna planilla: completá ID_PLANILLA al principio de Codigo.gs.');
  return ss;
}

function hoja_(clave) {
  const sh = libro_().getSheetByName(HOJAS[clave].nombre);
  if (!sh) throw new Error(`Falta la hoja "${HOJAS[clave].nombre}". Corré instalar() desde el editor de Apps Script.`);
  return sh;
}

/** Filas de una hoja como objetos { columna: valor }, con _fila = número de fila real. */
function leer_(clave) {
  const valores = hoja_(clave).getDataRange().getValues();
  const encabezados = valores[0].map(String);
  const filas = [];
  for (let i = 1; i < valores.length; i++) {
    if (valores[i].every(v => v === '' || v === null)) continue;
    const obj = { _fila: i + 1 };
    encabezados.forEach((h, j) => { if (h) obj[h] = valores[i][j]; });
    filas.push(obj);
  }
  return filas;
}

function encabezados_(clave) {
  const sh = hoja_(clave);
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
}

function agregar_(clave, objetos) {
  const sh = hoja_(clave);
  const enc = encabezados_(clave);
  const filas = objetos.map(o => enc.map(h => (o[h] === undefined ? '' : o[h])));
  sh.getRange(sh.getLastRow() + 1, 1, filas.length, enc.length).setValues(filas);
}

function setCampo_(clave, fila, campo, valor) {
  const col = encabezados_(clave).indexOf(campo) + 1;
  if (!col) throw new Error(`Falta la columna "${campo}" en ${HOJAS[clave].nombre}.`);
  hoja_(clave).getRange(fila._fila, col).setValue(valor);
}

function config_() {
  const c = {};
  for (const fila of leer_('config')) if (fila.clave) c[fila.clave] = fila.valor;
  const lista = v => String(v || '').split(',').map(s => s.trim()).filter(Boolean);
  return {
    nombre: c.nombre || 'Azabache Pet',
    capital_inicial: Number(c.capital_inicial) || 0,
    barrios: lista(c.barrios),
    formas_pago: lista(c.formas_pago),
    categorias_gasto: lista(c.categorias_gasto),
    dias_cobertura: Number(c.dias_cobertura) || 14,
  };
}

function siguienteIdVenta_() {
  let max = 0;
  for (const v of leer_('ventas')) {
    const n = parseInt(String(v.venta_id).replace(/\D/g, ''), 10);
    if (n > max) max = n;
  }
  return 'V-' + String(max + 1).padStart(4, '0');
}

function conLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function porId_(filas) {
  const m = {};
  for (const f of filas) if (f.id) m[f.id] = f;
  return m;
}

function serializar_(obj) {
  const o = {};
  for (const [k, v] of Object.entries(obj)) if (k !== '_fila') o[k] = v instanceof Date ? v.toISOString() : v;
  return o;
}

function nombreProducto_(p) { return `${p.nombre} (${p.marca}, ${p.tamano})`; }
function texto_(v) { return String(v === undefined || v === null ? '' : v).trim(); }
function esVerdadero_(v) { return v === true || ['SÍ', 'SI', 'TRUE', 'VERDADERO'].includes(String(v).trim().toUpperCase()); }
