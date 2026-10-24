// Catálogo. PRECIOS Y PRODUCTOS DE EJEMPLO: reemplazalos por los reales.
//
// Campos:
//   id         texto único, sin espacios (no lo cambies una vez publicado)
//   nombre     nombre a mostrar
//   marca      marca
//   tamano     presentación: "15 kg", "85 g", etc.
//   precio     precio en pesos, solo números
//   mascota    "perro" | "gato" | "ambos"
//   categoria  "alimento" | "humedo" | "piedritas" | "panos" | "accesorios"
//   stock      true = disponible, false = sin stock (se ve pero no se puede pedir)
//   foto       ruta a la imagen, ej: "img/dogui-15kg.jpg" (vacío = ícono genérico)
window.PRODUCTOS = [
  // Balanceado perro
  { id: "bal-perro-adulto-15", nombre: "Alimento perro adulto", marca: "Marca A", tamano: "15 kg", precio: 38500, mascota: "perro", categoria: "alimento", stock: true, foto: "" },
  { id: "bal-perro-adulto-3",  nombre: "Alimento perro adulto", marca: "Marca A", tamano: "3 kg",  precio: 9800,  mascota: "perro", categoria: "alimento", stock: true, foto: "" },
  { id: "bal-perro-cachorro-8", nombre: "Alimento cachorro",    marca: "Marca B", tamano: "8 kg",  precio: 27400, mascota: "perro", categoria: "alimento", stock: true, foto: "" },
  { id: "bal-perro-premium-15", nombre: "Alimento premium raza mediana", marca: "Marca C", tamano: "15 kg", precio: 62900, mascota: "perro", categoria: "alimento", stock: false, foto: "" },

  // Balanceado gato
  { id: "bal-gato-adulto-10",   nombre: "Alimento gato adulto",   marca: "Marca A", tamano: "10 kg", precio: 34200, mascota: "gato", categoria: "alimento", stock: true, foto: "" },
  { id: "bal-gato-castrado-3",  nombre: "Alimento gato castrado", marca: "Marca C", tamano: "3 kg",  precio: 15600, mascota: "gato", categoria: "alimento", stock: true, foto: "" },
  { id: "bal-gato-kitten-1",    nombre: "Alimento gatito",        marca: "Marca B", tamano: "1 kg",  precio: 5900,  mascota: "gato", categoria: "alimento", stock: true, foto: "" },

  // Húmedos
  { id: "hum-gato-pouch-85",  nombre: "Pouch gato carne",   marca: "Marca D", tamano: "85 g",  precio: 1100, mascota: "gato",  categoria: "humedo", stock: true, foto: "" },
  { id: "hum-gato-lata-340",  nombre: "Lata gato pescado",  marca: "Marca D", tamano: "340 g", precio: 2900, mascota: "gato",  categoria: "humedo", stock: true, foto: "" },
  { id: "hum-perro-lata-340", nombre: "Lata perro pollo",   marca: "Marca E", tamano: "340 g", precio: 2700, mascota: "perro", categoria: "humedo", stock: true, foto: "" },

  // Piedritas
  { id: "pied-bentonita-4",  nombre: "Piedritas aglomerantes", marca: "Marca F", tamano: "4 kg",  precio: 6200, mascota: "gato", categoria: "piedritas", stock: true, foto: "" },
  { id: "pied-silica-38",    nombre: "Piedritas sílica",       marca: "Marca F", tamano: "3,8 L", precio: 9400, mascota: "gato", categoria: "piedritas", stock: true, foto: "" },
  { id: "pied-comun-10",     nombre: "Piedritas comunes",      marca: "Marca G", tamano: "10 kg", precio: 7800, mascota: "gato", categoria: "piedritas", stock: false, foto: "" },

  // Paños
  { id: "panos-60x60-30", nombre: "Paños absorbentes 60x60", marca: "Marca H", tamano: "x30 u", precio: 11500, mascota: "perro", categoria: "panos", stock: true, foto: "" },
  { id: "panos-60x90-15", nombre: "Paños absorbentes 60x90", marca: "Marca H", tamano: "x15 u", precio: 9900,  mascota: "perro", categoria: "panos", stock: true, foto: "" },
];

// Nombres que se muestran para cada categoría (el orden define el orden de los filtros).
window.CATEGORIAS = {
  alimento:   "Balanceado",
  humedo:     "Alimento húmedo",
  piedritas:  "Piedritas",
  panos:      "Paños",
  accesorios: "Accesorios",
};
