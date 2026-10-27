// Datos del negocio. Editá este archivo para cambiar nombre, WhatsApp y entregas.
window.CONFIG = {
  nombre: "Azabache Pet",              // la última palabra se muestra en verde, como en el logo
  lema: "Pet shop & delivery",
  eslogan: "Alimentos y accesorios para tu mascota, con entrega en tu barrio",

  // Número de WhatsApp en formato internacional, sin +, espacios ni guiones.
  // Ejemplo Argentina celular: 54 9 11 1234-5678  ->  "5491112345678"
  whatsapp: "5491154880092",

  instagram: "",                       // ej: "azabachepet" (vacío = no se muestra)

  // Dirección CSV de la hoja "Catalogo" publicada desde la planilla de gestión
  // (Archivo → Compartir → Publicar en la web). Vacío = se usan los productos de productos.js.
  catalogoCSV: "",

  // Zonas de entrega propias. costo = envío en pesos (0 = gratis).
  zonas: [
    { barrio: "Caballito",    dias: "Lunes a sábados", costo: 0 },
    { barrio: "Flores",       dias: "Lunes a sábados", costo: 0 },
    { barrio: "Villa Crespo", dias: "Lunes a sábados", costo: 0 },
    { barrio: "Palermo",      dias: "Lunes a sábados", costo: 0 },
    { barrio: "Microcentro",  dias: "Lunes a sábados", costo: 0 },
  ],

  // Pedido mínimo para envío gratis (0 = no se aplica; usalo si algún barrio tiene costo).
  envioGratisDesde: 0,

  horarioEntrega: "de 10 a 19 h",
  formasDePago: ["Efectivo", "Transferencia", "Mercado Pago"],
};
