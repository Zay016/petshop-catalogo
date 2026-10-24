// Datos del negocio. Editá este archivo para cambiar nombre, WhatsApp y entregas.
window.CONFIG = {
  nombre: "Patitas a Casa",            // nombre provisorio
  eslogan: "Alimento y accesorios para tu mascota, con entrega en tu barrio",

  // Número de WhatsApp en formato internacional, sin +, espacios ni guiones.
  // Ejemplo Argentina celular: 54 9 11 1234-5678  ->  "5491112345678"
  whatsapp: "5491100000000",

  instagram: "",                       // ej: "patitasacasa" (vacío = no se muestra)

  // Zonas de entrega propias. costo = envío en pesos (0 = gratis).
  zonas: [
    { barrio: "Caballito",    dias: "Lunes y jueves",     costo: 2500 },
    { barrio: "Flores",       dias: "Lunes y jueves",     costo: 2500 },
    { barrio: "Villa Crespo", dias: "Martes y viernes",   costo: 3000 },
    { barrio: "Palermo",      dias: "Martes y viernes",   costo: 3500 },
    { barrio: "Microcentro",  dias: "Miércoles",          costo: 3500 },
  ],

  // Pedido mínimo para envío gratis (0 = sin envío gratis).
  envioGratisDesde: 60000,

  horarioEntrega: "de 10 a 19 h",
  formasDePago: ["Efectivo", "Transferencia", "Mercado Pago"],
};
