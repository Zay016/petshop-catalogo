(function () {
  const C = window.CONFIG;
  const PRODUCTOS = window.PRODUCTOS;
  const CATEGORIAS = window.CATEGORIAS;
  const byId = Object.fromEntries(PRODUCTOS.map(p => [p.id, p]));
  const $ = sel => document.querySelector(sel);

  const pesos = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
  const fmt = n => pesos.format(n);

  // localStorage puede fallar (modo privado, cookies bloqueadas): el sitio sigue funcionando sin él.
  const store = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sin persistencia */ }
    },
  };

  // Carrito: { idProducto: cantidad }. Al cargar se descartan productos borrados o sin stock.
  let cart = {};
  for (const [id, qty] of Object.entries(store.get("cart", {}))) {
    if (byId[id] && byId[id].stock && qty > 0) cart[id] = Math.min(qty, 99);
  }
  const filtros = { mascota: "todos", categoria: "todas", texto: "" };

  // ---------- Contenido fijo desde config ----------
  document.title = `${C.nombre} · ${C.lema}`;
  // "Azabache Pet" -> "Azabache <em>Pet</em>", como en el logo
  const palabras = C.nombre.split(" ");
  const ultima = palabras.length > 1 ? palabras.pop() : "";
  $("#brand-name").innerHTML = palabras.join(" ") + (ultima ? ` <em>${ultima}</em>` : "");
  $("#brand").setAttribute("aria-label", C.nombre);
  $("#hero-logo").alt = `Logo de ${C.nombre}`;
  $("#hero-title").textContent = C.eslogan;
  $("#hero-zonas").innerHTML = C.zonas.map(z => `<li>${z.barrio}</li>`).join("");
  $("#zonas-body").innerHTML = C.zonas.map(z =>
    `<tr><td>${z.barrio}</td><td>${z.dias}</td><td>${z.costo ? fmt(z.costo) : "Gratis"}</td></tr>`
  ).join("");
  const todoGratis = C.zonas.every(z => !z.costo);
  $("#delivery-sub").textContent =
    `Entregamos ${C.horarioEntrega}. ` +
    (todoGratis ? "El envío es gratis en todas las zonas. "
      : C.envioGratisDesde ? `Envío gratis en compras desde ${fmt(C.envioGratisDesde)}. ` : "") +
    `Pagás con ${C.formasDePago.join(", ").replace(/, ([^,]*)$/, " o $1")}.`;
  $("#barrio").innerHTML = `<option value="">Elegí tu barrio</option>` +
    C.zonas.map(z => `<option>${z.barrio}</option>`).join("");
  $("#pago").innerHTML = C.formasDePago.map(f => `<option>${f}</option>`).join("");
  $("#footer").innerHTML =
    `© ${new Date().getFullYear()} ${C.nombre} · Pedidos por <a href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>` +
    (C.instagram ? ` · <a href="https://instagram.com/${C.instagram}" target="_blank" rel="noopener">Instagram</a>` : "");

  // ---------- Filtros ----------
  const catsUsadas = Object.keys(CATEGORIAS).filter(c => PRODUCTOS.some(p => p.categoria === c));
  $("#f-categoria").innerHTML =
    `<button data-v="todas" aria-pressed="true">Todo</button>` +
    catsUsadas.map(c => `<button data-v="${c}" aria-pressed="false">${CATEGORIAS[c]}</button>`).join("");

  $("#f-mascota").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    filtros.mascota = b.dataset.v;
    for (const x of $("#f-mascota").children) x.setAttribute("aria-selected", x === b);
    renderGrid();
  });
  $("#f-categoria").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    filtros.categoria = b.dataset.v;
    for (const x of $("#f-categoria").children) x.setAttribute("aria-pressed", x === b);
    renderGrid();
  });
  $("#f-texto").addEventListener("input", e => { filtros.texto = e.target.value; renderGrid(); });

  const normalizar = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  function visibles() {
    const q = normalizar(filtros.texto.trim());
    return PRODUCTOS
      .filter(p => filtros.mascota === "todos" || p.mascota === filtros.mascota || p.mascota === "ambos")
      .filter(p => filtros.categoria === "todas" || p.categoria === filtros.categoria)
      .filter(p => !q || normalizar(`${p.nombre} ${p.marca} ${p.tamano}`).includes(q))
      // con stock primero, sin cambiar el orden del archivo dentro de cada grupo
      .sort((a, b) => b.stock - a.stock);
  }

  // ---------- Grilla ----------
  function controlHTML(p) {
    if (!p.stock) return `<button class="add" disabled>Sin stock</button>`;
    const q = cart[p.id];
    if (!q) return `<button class="add" data-act="add" data-id="${p.id}">Agregar</button>`;
    return `<div class="stepper">
      <button data-act="dec" data-id="${p.id}" aria-label="Quitar uno">−</button>
      <span>${q}</span>
      <button data-act="inc" data-id="${p.id}" aria-label="Agregar uno">+</button>
    </div>`;
  }

  function cardHTML(p) {
    const foto = p.foto
      ? `<img src="${p.foto}" alt="${p.nombre} ${p.marca} ${p.tamano}" loading="lazy">`
      : `<svg class="ph" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-paw"/></svg>`;
    return `<article class="card${p.stock ? "" : " off"}">
      <div class="thumb">${foto}
        <span class="tag ${p.stock ? "ok" : "no"}">${p.stock ? "Disponible" : "Sin stock"}</span>
      </div>
      <div class="card-body">
        <span class="brand-line">${p.marca}</span>
        <h3>${p.nombre}</h3>
        <span class="size">${p.tamano}</span>
        <div class="card-foot">
          <span class="price">${fmt(p.precio)}</span>
          <div class="ctrl" data-ctrl="${p.id}">${controlHTML(p)}</div>
        </div>
      </div>
    </article>`;
  }

  function renderGrid() {
    const lista = visibles();
    $("#grid").innerHTML = lista.map(cardHTML).join("");
    $("#empty").hidden = lista.length > 0;
    $("#result-count").textContent = `${lista.length} producto${lista.length === 1 ? "" : "s"}`;
  }

  // Actualiza solo el botón de un producto (no re-dibuja la grilla, así no se pierde el foco).
  function refreshCtrl(id) {
    const el = document.querySelector(`[data-ctrl="${id}"]`);
    if (el) el.innerHTML = controlHTML(byId[id]);
  }

  function setQty(id, qty) {
    if (qty <= 0) delete cart[id]; else cart[id] = Math.min(qty, 99);
    store.set("cart", cart);
    refreshCtrl(id);
    renderCart();
  }

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const id = b.dataset.id, q = cart[id] || 0;
    if (b.dataset.act === "add" || b.dataset.act === "inc") setQty(id, q + 1);
    if (b.dataset.act === "dec") setQty(id, q - 1);
    if (b.dataset.act === "del") setQty(id, 0);
  });

  // ---------- Carrito ----------
  const form = $("#order-form");
  const lineas = () => Object.entries(cart).map(([id, qty]) => ({ p: byId[id], qty }));
  const subtotal = () => lineas().reduce((s, l) => s + l.p.precio * l.qty, 0);

  function envio(sub) {
    const zona = C.zonas.find(z => z.barrio === form.barrio.value);
    if (!zona) return null;
    if (C.envioGratisDesde && sub >= C.envioGratisDesde) return 0;
    return zona.costo;
  }

  function renderCart() {
    const ls = lineas();
    const unidades = ls.reduce((s, l) => s + l.qty, 0);
    const sub = subtotal();
    const env = envio(sub);

    $("#cart-count").textContent = unidades;
    $("#cart-count").hidden = unidades === 0;
    $("#cart-bar").hidden = unidades === 0;
    $("#cart-bar-items").textContent = `${unidades} ${unidades === 1 ? "producto" : "productos"}`;
    $("#cart-bar-total").textContent = fmt(sub);

    $("#empty-cart").hidden = ls.length > 0;
    form.hidden = ls.length === 0;
    $("#lines").innerHTML = ls.map(({ p, qty }) => `<li>
      <div><div class="line-name">${p.nombre}</div><div class="line-meta">${p.marca} · ${p.tamano} · ${fmt(p.precio)} c/u</div></div>
      <div class="line-total">${fmt(p.precio * qty)}</div>
      <div class="line-actions">
        <div class="stepper">
          <button data-act="dec" data-id="${p.id}" aria-label="Quitar uno">−</button>
          <span>${qty}</span>
          <button data-act="inc" data-id="${p.id}" aria-label="Agregar uno">+</button>
        </div>
        <button class="remove" data-act="del" data-id="${p.id}">Quitar</button>
      </div>
    </li>`).join("");

    $("#t-sub").textContent = fmt(sub);
    $("#t-envio-label").textContent = form.barrio.value ? `Envío (${form.barrio.value})` : "Envío";
    $("#t-envio").textContent = env === null ? "Elegí barrio" : env === 0 ? "Gratis" : fmt(env);
    $("#t-total").textContent = fmt(sub + (env || 0));

    const falta = C.envioGratisDesde - sub;
    $("#free-hint").textContent = C.envioGratisDesde && sub > 0
      ? (falta > 0 ? `Te faltan ${fmt(falta)} para el envío gratis.` : "¡Tenés envío gratis!")
      : "";
    $("#send").disabled = ls.length === 0;
  }

  // Datos del cliente: se recuerdan para el próximo pedido.
  const guardado = store.get("cliente", {});
  for (const [k, v] of Object.entries(guardado)) if (form.elements[k] && k !== "notas") form.elements[k].value = v;
  form.addEventListener("input", e => {
    e.target.classList.remove("invalid");
    store.set("cliente", Object.fromEntries(new FormData(form)));
    if (e.target.name === "barrio") renderCart();
  });

  function validar() {
    let primero = null;
    for (const el of form.querySelectorAll("[required]")) {
      const ok = el.value.trim() !== "" && (el.name !== "telefono" || el.value.replace(/\D/g, "").length >= 8);
      el.classList.toggle("invalid", !ok);
      if (!ok && !primero) primero = el;
    }
    return primero;
  }

  function mensaje() {
    const d = Object.fromEntries(new FormData(form));
    const sub = subtotal(), env = envio(sub);
    const items = lineas().map(({ p, qty }) => `• ${qty} x ${p.nombre} (${p.marca}, ${p.tamano}) — ${fmt(p.precio * qty)}`);
    return [
      `¡Hola ${C.nombre}! Quiero hacer este pedido:`,
      "",
      ...items,
      "",
      `Subtotal: ${fmt(sub)}`,
      `Envío (${d.barrio}): ${env === 0 ? "Gratis" : fmt(env)}`,
      `*Total estimado: ${fmt(sub + env)}*`,
      "",
      `Nombre: ${d.nombre.trim()}`,
      `Teléfono: ${d.telefono.trim()}`,
      `Barrio: ${d.barrio}`,
      `Dirección: ${d.direccion.trim()}`,
      `Pago: ${d.pago}`,
      d.notas.trim() ? `Notas: ${d.notas.trim()}` : null,
    ].filter(l => l !== null).join("\n");
  }

  $("#send").addEventListener("click", () => {
    const err = $("#form-error");
    const malo = validar();
    if (malo) {
      err.textContent = "Completá los datos marcados para enviar el pedido.";
      err.hidden = false;
      malo.focus();
      return;
    }
    err.hidden = true;
    window.open(`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(mensaje())}`, "_blank", "noopener");
  });

  // ---------- Abrir / cerrar ----------
  const drawer = $("#drawer"), overlay = $("#overlay");
  function abrir() {
    overlay.hidden = false;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $("#close-cart").focus();
  }
  function cerrar() {
    overlay.hidden = true;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  $("#open-cart").addEventListener("click", abrir);
  $("#cart-bar").addEventListener("click", abrir);
  $("#close-cart").addEventListener("click", cerrar);
  overlay.addEventListener("click", cerrar);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && drawer.classList.contains("open")) cerrar(); });

  renderGrid();
  renderCart();
})();
