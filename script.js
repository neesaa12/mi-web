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
   3. RÁFAGA DE LUZ DEL CURSOR (estela en canvas)
   ========================================================= */

const reduceMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lienzo = document.getElementById("estela");

if (lienzo && !reduceMovimiento) {
  const ctx = lienzo.getContext("2d");
  const puntos = []; // historial de posiciones del cursor
  const largoEstela = 26;

  // Colores según tema (los lee de las variables CSS)
  const colorTema = () =>
    document.documentElement.getAttribute("data-tema") === "claro"
      ? { r: 139, g: 92, b: 246 }
      : { r: 196, g: 181, b: 253 };

  function ajustarLienzo() {
    lienzo.width = window.innerWidth;
    lienzo.height = window.innerHeight;
  }
  ajustarLienzo();
  window.addEventListener("resize", ajustarLienzo);

  window.addEventListener("pointermove", (e) => {
    puntos.push({ x: e.clientX, y: e.clientY });
    if (puntos.length > largoEstela) puntos.shift();
  }, { passive: true });

  function dibujar() {
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    const c = colorTema();
    const modoClaro = document.documentElement.getAttribute("data-tema") === "claro";
    ctx.globalCompositeOperation = modoClaro ? "source-over" : "lighter";

    for (let i = 0; i < puntos.length; i++) {
      const p = puntos[i];
      const t = i / puntos.length; // 0 cola -> 1 cabeza
      const radio = 2 + t * 16;
      const alpha = t * 0.5;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radio);
      g.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${alpha})`);
      g.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radio, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cabeza más nítida
    if (puntos.length) {
      const cab = puntos[puntos.length - 1];
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = modoClaro ? "rgba(91,33,182,0.9)" : "rgba(240,235,255,0.95)";
      ctx.beginPath();
      ctx.arc(cab.x, cab.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // La estela se va apagando sola (fade)
    if (puntos.length) puntos.shift();

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