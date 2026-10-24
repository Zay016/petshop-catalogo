# Catálogo pet shop con pedidos por WhatsApp

Catálogo web para un pet shop que vende online y entrega con reparto propio en Caballito, Flores, Villa Crespo, Palermo y Microcentro.

El cliente elige productos, arma el carrito, completa sus datos y envía el pedido por WhatsApp con un mensaje ya armado. El negocio confirma stock, total, horario y forma de pago por chat.

Es HTML, CSS y JavaScript puro: no tiene backend, build ni dependencias.

## Funcionalidades

- Productos con foto, marca, presentación, precio y disponibilidad.
- Filtros por mascota (perros / gatos), por categoría y búsqueda por texto (ignora tildes).
- Carrito con cantidades, subtotal, costo de envío según barrio y envío gratis desde cierto monto.
- Formulario con nombre, teléfono, barrio, dirección, forma de pago y notas, con validación.
- El botón **Enviar pedido por WhatsApp** abre `wa.me` con el detalle del pedido.
- El carrito y los datos del cliente se guardan en el navegador (`localStorage`) para el próximo pedido. Si el navegador lo bloquea, el sitio funciona igual.
- Sección de zonas, días y costo de entrega.
- Pensado primero para celular, con una barra flotante del pedido.

## Estructura

| Archivo        | Para qué sirve |
|----------------|----------------|
| `config.js`    | Nombre del negocio, número de WhatsApp, zonas y días de entrega, costos de envío, formas de pago |
| `productos.js` | Lista de productos y nombres de las categorías |
| `index.html`   | Estructura de la página |
| `styles.css`   | Estilos |
| `app.js`       | Filtros, carrito, validación y armado del mensaje |
| `img/`         | Fotos de los productos |

## Cómo usarlo

### 1. Datos del negocio

Editá `config.js`:

```js
whatsapp: "5491112345678",   // 54 9 + código de área sin 0 + número sin 15
```

### 2. Productos

Editá `productos.js`. Los productos que trae son **de ejemplo** (marcas y precios inventados). Cada producto es una línea:

```js
{ id: "bal-perro-adulto-15", nombre: "Alimento perro adulto", marca: "Marca A", tamano: "15 kg",
  precio: 38500, mascota: "perro", categoria: "alimento", stock: true, foto: "img/perro-adulto-15.jpg" },
```

- Para marcar un producto **sin stock**, poné `stock: false`. Se sigue viendo, pero no se puede agregar al carrito.
- Para la foto, guardá la imagen en `img/` y poné la ruta en `foto`. Si la dejás vacía, se muestra un ícono.
- No cambies el `id` de un producto ya publicado: es lo que usa el carrito guardado de los clientes.

### 3. Probarlo en tu compu

Abrí `index.html` en el navegador, o levantá un servidor local:

```bash
python -m http.server 8000
```

y entrá a http://localhost:8000.

## Publicarlo gratis con GitHub Pages

1. Subí el repositorio a GitHub.
2. En el repositorio, entrá a **Settings → Pages**.
3. En **Source**, elegí **Deploy from a branch**, la rama `main` y la carpeta `/ (root)`.
4. En uno o dos minutos queda publicado en `https://<usuario>.github.io/<repositorio>/`.

Cada vez que hagas push con cambios de precios o stock, la página se actualiza sola.

## Próximos pasos posibles

- Cargar productos desde un Google Sheet publicado como CSV, para editar precios sin tocar código.
- Backend en Node.js con base de datos para guardar pedidos y descontar stock.
- Pagos online con Mercado Pago cuando haya clientes recurrentes.
