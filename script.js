// script.js

/* =========================================================
   1. MODO OSCURO (por defecto) + memoria en localStorage
   ========================================================= */

const botonTema = document.getElementById("modo-oscuro");

function aplicarTema(tema, guardar = true) {
  document.documentElement.setAttribute("data-tema", tema);
  if (botonTema) {
    const esOscuro = tema === "oscuro";
    botonTema.setAttribute("aria-pressed", String(esOscuro));
    botonTema.textContent = esOscuro ? "☀️ Modo claro" : "🌙 Modo oscuro";
  }
  if (guardar) {
    try { localStorage.setItem("tema", tema); }
    catch (error) { console.warn("No se pudo guardar el tema:", error); }
  }
}

const temaInicial =
  document.documentElement.getAttribute("data-tema") ||
  localStorage.getItem("tema") ||
  "oscuro";
aplicarTema(temaInicial, false);

if (botonTema) {
  botonTema.addEventListener("click", () => {
    const actual = document.documentElement.getAttribute("data-tema");
    aplicarTema(actual === "oscuro" ? "claro" : "oscuro");
  });
}


/* =========================================================
   2. ACTUALIZAR EL AÑO DEL PIE DE PÁGINA
   ========================================================= */

const anio = document.getElementById("anio");
if (anio) anio.textContent = new Date().getFullYear();


/* =========================================================
   3. RASTRO BRILLANTE DEL CURSOR
   ========================================================= */

const reduceMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lienzo = document.getElementById("estela");

if (lienzo && !reduceMovimiento) {
  const ctx = lienzo.getContext("2d");
  const rastro = []; // puntos del camino: { x, y, t0 }

  const MANTENER = 3000;    // ms brillante antes de empezar a apagarse
  const DESVANECER = 2000;  // ms de desvanecimiento lento
  const VIDA = MANTENER + DESVANECER;

  // Elementos donde NO queremos ver el rastro (cuadros, botones, ficha...)
  const INTERACTIVO = ".tarjeta, .lista article, .boton, .boton-secundario, " +
    ".email-boton, .form-boton, .modo-oscuro-boton, .hero-ficha, .ficha-avatar, " +
    ".barra, .pie, .panel-contador, .boton-contador, .toast, .modal, .subir, " +
    ".marca, .etiqueta, .nav a";

  const colorTema = () =>
    document.documentElement.getAttribute("data-tema") === "claro"
      ? { r: 139, g: 92, b: 246 }
      : { r: 196, g: 181, b: 253 };
        // El canvas mide todo el documento, no solo la ventana
  function ajustarLienzo() {
    lienzo.width = document.documentElement.clientWidth;
    lienzo.height = document.documentElement.scrollHeight;
  }
  ajustarLienzo();
  window.addEventListener("resize", ajustarLienzo);
  // Al cambiar el alto (contenido que aparece), lo recalculamos también
  window.addEventListener("load", ajustarLienzo);
    // Guardamos el punto en coordenadas de DOCUMENTO (y + scroll),
  // así el rastro se queda "anclado" a la página y baja al hacer scroll.
  let ultimoT = 0;
  window.addEventListener("pointermove", (e) => {
    if (e.target.closest && e.target.closest(INTERACTIVO)) {
      rastro.length = 0;
      return;
    }
    const ahora = performance.now();
    if (ahora - ultimoT < 24) return;
    ultimoT = ahora;
    rastro.push({
      x: e.clientX,
      y: e.clientY + window.scrollY, // ✔ coordenada de documento
      t0: ahora
    });
    if (rastro.length > 200) rastro.shift();
  }, { passive: true });

    function dibujar() {
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    const modoClaro = document.documentElement.getAttribute("data-tema") === "claro";
    const ahora = performance.now();

    // Quitamos los puntos que ya murieron
    while (rastro.length && ahora - rastro[0].t0 > VIDA) rastro.shift();
    if (rastro.length < 2) { requestAnimationFrame(dibujar); return; }

    // La línea entera se apaga si el ratón lleva parado más de 3 s
    const edadCabeza = ahora - rastro[rastro.length - 1].t0;
    let vivo = 1;
    if (edadCabeza > MANTENER) {
      vivo = Math.max(0, 1 - (edadCabeza - MANTENER) / DESVANECER);
    }
    if (vivo <= 0) { requestAnimationFrame(dibujar); return; }

    const cola = rastro[0];
    const cabeza = rastro[rastro.length - 1];

    // ✔ Gradiente suave y apagado: cola transparente -> cabeza apenas marcada
    //    (termina en un morado suave, NO en blanco brillante)
    const grad = ctx.createLinearGradient(cola.x, cola.y, cabeza.x, cabeza.y);
    if (modoClaro) {
      grad.addColorStop(0.0, "rgba(59,130,246,0.00)");
      grad.addColorStop(0.5, "rgba(99,102,241,0.06)");
      grad.addColorStop(1.0, "rgba(124,58,237,0.16)");
    } else {
      grad.addColorStop(0.0, "rgba(96,165,250,0.00)");
      grad.addColorStop(0.5, "rgba(139,92,246,0.10)");
      grad.addColorStop(1.0, "rgba(167,139,250,0.22)");
    }

    // Una ÚNICA pasada = línea suave difuminada, sin "núcleo" duro por encima
    ctx.beginPath();
    ctx.moveTo(cola.x, cola.y);
    for (let i = 1; i < rastro.length; i++) ctx.lineTo(rastro[i].x, rastro[i].y);

    ctx.globalAlpha = vivo;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = grad;
    ctx.globalCompositeOperation = modoClaro ? "source-over" : "lighter";

    // ✔ Difuminado medio (no exagerado): el glow se fusiona con la línea
    ctx.shadowColor = modoClaro ? "rgba(124,58,237,0.25)" : "rgba(139,92,246,0.35)";
    ctx.shadowBlur = 22;        // ✔ suave (antes 45)
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.lineWidth = 6;          // ✔ ancho medio: se difumina sin verse "línea"
    ctx.stroke();

    // Reset
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    requestAnimationFrame(dibujar);
  }
  requestAnimationFrame(dibujar);
}
/* =========================================================
   4. ANIMACIÓN DE APARICIÓN DE SECCIONES (scroll reveal)
   ========================================================= */

const secciones = document.querySelectorAll(".seccion");
const observador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.15 }
);
secciones.forEach((s) => { s.classList.add("oculto"); observador.observe(s); });


/* =========================================================
   5. SCROLLSPY: resaltar el enlace del menú según la sección
   ========================================================= */

const enlacesNav = document.querySelectorAll('.nav a[href^="#"]');
const observadorNav = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        const id = entrada.target.id;
        enlacesNav.forEach((enlace) => {
          enlace.classList.toggle("activo", enlace.getAttribute("href") === `#${id}`);
        });
      }
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("main section[id], footer[id]").forEach((s) => observadorNav.observe(s));


/* =========================================================
   6. SPLIT DEL TÍTULO EN PALABRAS (animación escalonada)
   ========================================================= */

const titulo = document.getElementById("titulo");
if (titulo) {
  const palabras = titulo.textContent.trim().split(" ");
  titulo.textContent = "";
  palabras.forEach((palabra, i) => {
    const span = document.createElement("span");
    span.className = "palabra";
    span.textContent = palabra;
    span.style.animationDelay = `${0.15 + i * 0.12}s`;
    titulo.appendChild(span);
    if (i < palabras.length - 1) titulo.appendChild(document.createTextNode(" "));
  });
}


/* =========================================================
   7. BOTÓN "VOLVER ARRIBA"
   ========================================================= */

const botonSubir = document.getElementById("subir");
if (botonSubir) {
  const alScroll = () => botonSubir.classList.toggle("visible", window.scrollY > 400);
  window.addEventListener("scroll", alScroll, { passive: true });
  alScroll();
  botonSubir.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}


/* =========================================================
   8. CONTADOR DESPLEGABLE DE "COSAS QUE HE HECHO"
   ========================================================= */

const botonContador = document.getElementById("boton-contador");
const panelContador = document.getElementById("panel-contador");
const contadorNumero = document.getElementById("contador-numero");

function animarContador(elemento, valorFinal, duracion = 900) {
  const inicio = performance.now();
  function paso(tiempoActual) {
    const progreso = Math.min((tiempoActual - inicio) / duracion, 1);
    elemento.textContent = Math.round(valorFinal * progreso);
    if (progreso < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}

function obtenerTotalCosasHechas() {
  return document.querySelectorAll("#hecho .lista > li").length;
}

if (botonContador && panelContador && contadorNumero) {
  botonContador.addEventListener("click", () => {
    const estaOculto = panelContador.classList.contains("oculto-panel");
    if (estaOculto) {
      panelContador.classList.remove("oculto-panel");
      panelContador.classList.add("visible-panel");
      botonContador.setAttribute("aria-expanded", "true");
      animarContador(contadorNumero, obtenerTotalCosasHechas());
    } else {
      panelContador.classList.remove("visible-panel");
      panelContador.classList.add("oculto-panel");
      botonContador.setAttribute("aria-expanded", "false");
      contadorNumero.textContent = "0";
    }
  });
}


/* =========================================================
   9. ENLACES DE ANCLA CON SCROLL SUAVE
   Evita el error "file: URLs are treated as unique origins"
   al abrir el HTML con doble clic (file://): no navegamos al
   #..., solo hacemos scroll a la sección (respeta el sticky).
   ========================================================= */

document.querySelectorAll('a[href^="#"]').forEach((enlace) => {
  const destino = document.querySelector(enlace.getAttribute("href"));
  if (destino) {
    enlace.addEventListener("click", (e) => {
      e.preventDefault();
      destino.scrollIntoView({ behavior: "smooth" });
    });
  }
});



/* =========================================================
   10. ✔ NUEVO · BOTÓN DE EMAIL
   Al pulsar "Email" se muestra el correo en el toast flotante
   y se intenta copiar al portapapeles.
   ========================================================= */

const CORREO = "vanetayg@alu.edu.gva.es";
const emailBoton = document.getElementById("email-boton");
const toast = document.getElementById("toast");
let temporizadorToast;

// Función para copiar texto (con copia de seguridad para file://)
async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto); // requiere contexto seguro
    return true;
  } catch (error) {
    // Alternativa: textarea oculto + execCommand (funciona en file://)
    const area = document.createElement("textarea");
    area.value = texto;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }
}

// Muestra el aviso flotante durante unos segundos
function mostrarToast(mensaje) {
  if (!toast) return;
  toast.textContent = mensaje;
  toast.classList.add("visible");

  // Reinicia el temporizador si se pulsa varias veces seguidas
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => {
    toast.classList.remove("visible");
  }, 4000);
}

// Evento del botón: muestra el correo y lo copia
if (emailBoton) {
  emailBoton.addEventListener("click", async () => {
    const copiado = await copiarTexto(CORREO);
    mostrarToast(
      copiado
        ? `✉️ ${CORREO} — copiado al portapapeles`
        : `✉️ ${CORREO}`
    );
  });
}


/* =========================================================
   11. · FORMULARIO QUE ABRE ISSUE/PR ETIQUETADO
   ========================================================= */

// ⚠ Cambia esto por tu usuario y el nombre real de tu repositorio:
const REPO = "neesaa12/mi-web";

const formBoton = document.getElementById("form-boton");
const modalFondo = document.getElementById("modal-fondo");
const modalCerrar = document.getElementById("modal-cerrar");
const formGithub = document.getElementById("form-github");

// Abrir modal (con animación y foco en el primer campo)
function abrirModal() {
  if (!modalFondo) return;
  modalFondo.hidden = false;
  requestAnimationFrame(() => modalFondo.classList.add("abierto"));
  const primerCampo = document.getElementById("campo-titulo");
  if (primerCampo) primerCampo.focus();
}

// Cerrar modal (espera a la animación antes de ocultar)
function cerrarModal() {
  if (!modalFondo) return;
  modalFondo.classList.remove("abierto");
  setTimeout(() => {
    modalFondo.hidden = true;
    if (formBoton) formBoton.focus(); // devolvemos el foco al botón
  }, 300);
}

if (formBoton) formBoton.addEventListener("click", abrirModal);
if (modalCerrar) modalCerrar.addEventListener("click", cerrarModal);

// Cerrar al pulsar fuera de la tarjeta
if (modalFondo) {
  modalFondo.addEventListener("click", (e) => {
    if (e.target === modalFondo) cerrarModal();
  });
}

// Cerrar con la tecla Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalFondo && !modalFondo.hidden) cerrarModal();
});

// Al cambiar Issue/PR, pintamos la píldora activa
if (formGithub) {
  formGithub.addEventListener("change", () => {
    const pills = formGithub.querySelectorAll(".pills label");
    pills.forEach((pill) => {
      const input = pill.querySelector("input");
      pill.classList.toggle("activa", input && input.checked);
    });
  });

  // Al enviar: construimos la URL de GitHub y la abrimos en otra pestaña
  formGithub.addEventListener("submit", (e) => {
    e.preventDefault();

    const datos = new FormData(formGithub);
    const tipo = datos.get("tipo");
    const titulo = encodeURIComponent((datos.get("titulo") || "").trim());
    const cuerpo = encodeURIComponent((datos.get("descripcion") || "").trim());
    const etiqueta = encodeURIComponent(datos.get("etiqueta") || "");

    const url = tipo === "pr"
      // Pantalla de crear Pull Request, con título/cuerpo/etiqueta rellenos
      ? `https://github.com/${REPO}/compare?expand=1&title=${titulo}&body=${cuerpo}&labels=${etiqueta}`
      // Pantalla de crear Issue, con título/cuerpo/etiqueta rellenos
      : `https://github.com/${REPO}/issues/new?title=${titulo}&body=${cuerpo}&labels=${etiqueta}`;

    window.open(url, "_blank", "noopener");
    cerrarModal();
  });
}