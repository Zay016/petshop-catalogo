# Panel de administración · instalación

El panel es privado: los datos viven en una planilla de Google de **gzaylene@gmail.com** y solo los ve quien tenga esa planilla compartida.

| Archivo      | Qué es |
|--------------|--------|
| `Codigo.gs`  | Lógica: arma las hojas, registra ventas, compras y gastos, y actualiza el catálogo público |
| `Panel.html` | El panel: resumen con métricas, nueva venta, stock y mercadería/gastos |

## 1. Crear la planilla

1. Entrá a https://sheets.new con **gzaylene@gmail.com**.
2. Ponele de nombre **Azabache Pet · Gestión**.

## 2. Pegar el código

1. En la planilla: **Extensiones → Apps Script**.
2. Arriba a la izquierda, cambiá "Proyecto sin título" por **Azabache Pet Admin**.
3. En el archivo `Código.gs` borrá todo y pegá el contenido de `Codigo.gs`.
4. Al lado de **Archivos**, tocá **+ → HTML**, ponele de nombre `Panel` (sin `.html`) y pegá el contenido de `Panel.html`.
5. Guardá con el ícono del disquete.

## 3. Crear las hojas

1. Arriba, en el selector de funciones, elegí **instalar** y tocá **Ejecutar**.
2. Google pide permisos. Como el script es tuyo y no está verificado, aparece un aviso: **Configuración avanzada → Ir a Azabache Pet Admin (no seguro) → Permitir**.
3. Volvé a la planilla: tienen que aparecer las hojas **Productos, Ventas, Compras, Gastos, Config y Catalogo**, y un menú **🐾 Azabache Pet**.
4. Para verificar, elegí la función **probar** y ejecutala: en el registro tiene que decir `Productos: 15 · Ventas (líneas): 0 · …`.

## 4. Publicar el panel

1. En Apps Script: **Implementar → Nueva implementación**.
2. En el engranaje de "Tipo", elegí **Aplicación web**.
3. Completá:
   - **Ejecutar como:** Usuario que accede a la aplicación web
   - **Quién tiene acceso:** Cualquier usuario con una cuenta de Google
4. **Implementar**, y copiá la URL que termina en `/exec`. Esa es la dirección del panel: guardala en favoritos y, en el celular, agregala a la pantalla de inicio.

**Por qué es seguro aunque diga "cualquier usuario":** el panel se ejecuta con la cuenta de quien lo abre. Si esa cuenta no tiene la planilla compartida, no ve ningún dato, solo un mensaje de que no tiene acceso.

**Para sumar a otra persona:** compartí la planilla como **Editor** con su Gmail. La primera vez que abra el panel, Google le va a pedir los mismos permisos.

## 5. Cargar los datos reales

1. **Config:** revisá `capital_inicial` (lo que invirtieron al arrancar), los barrios y las formas de pago.
2. **Productos:** reemplazá los 15 de ejemplo por los reales. Una fila por producto:
   - `id`: texto único sin espacios, por ejemplo `dogui-adulto-15`. No lo cambies después.
   - `mascota`: perro, gato o ambos. `categoria`: alimento, humedo, piedritas, panos o accesorios.
   - `precio`: precio de venta. `stock_minimo`: desde cuántas unidades avisa "stock bajo".
   - `activo`: sí o no. Con "no", el producto desaparece del catálogo sin borrarlo.
   - `costo` y `stock` se completan solos con **Ingreso de mercadería**, pero también se pueden corregir a mano (por ejemplo, después de contar el stock).
3. En el panel, **Mercadería y gastos → Ingreso de mercadería**: cargá la compra inicial de cada producto. Así quedan el stock, el costo y la "Caja estimada" bien calculados.

## 6. Conectar el catálogo web (opcional, recomendado)

Así el catálogo toma precios y disponibilidad de la planilla y no hay que editar `productos.js`.

1. En la planilla: **Archivo → Compartir → Publicar en la Web**.
2. Elegí **solo la hoja "Catalogo"** (¡no "Documento completo"!) y el formato **Valores separados por comas (.csv)**. Tocá **Publicar**.
3. Copiá el enlace y pegalo en `config.js` del catálogo, en `catalogoCSV: "…"`, y subí el cambio.

La hoja Catalogo no tiene costos ni cantidades: solo nombre, precio y si hay stock (sí/no). Se actualiza sola con cada venta, compra o cambio en Productos. Google tarda hasta 5 minutos en refrescar la versión publicada.

## Cómo se usa en el día a día

- **Llega un pedido por WhatsApp:** copiá el mensaje, pegalo en **Nueva venta → Pegar el pedido de WhatsApp** y tocá **Completar desde el mensaje**. Revisá y **Registrar venta**: se descuenta el stock.
- **Te equivocaste en una venta:** en **Resumen → Últimas ventas**, **Anular**. La fila queda marcada como anulada y el stock vuelve.
- **Llega mercadería:** **Ingreso de mercadería**. El costo se recalcula como promedio entre lo que había y lo que entra.
- **Pagaste algo que no es mercadería** (bolsas, nafta, publicidad): **Gasto**.

## Si cambia el código

Pegá la versión nueva en Apps Script y después **Implementar → Gestionar implementaciones → lápiz → Versión: Nueva versión → Implementar**. La URL del panel no cambia.
