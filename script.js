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
    try {
      localStorage.setItem("tema", tema);
    } catch (error) {
      console.warn("No se pudo guardar el tema:", error);
    }
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
   3. FONDO INTERACTIVO · glow que sigue al ratón + parallax
   ========================================================= */

const reduceMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const raiz = document.documentElement;
const capaParticulas = document.getElementById("particulas");
const contenedorOrbes = document.querySelector(".orbes");

// Genera las estrellas (solo si no hay "menos movimiento")
if (capaParticulas && !reduceMovimiento) {
  const total = 38;
  for (let i = 0; i < total; i++) {
    const p = document.createElement("span");
    p.className = "particula";
    const tam = Math.random() * 3 + 1;
    p.style.width = tam + "px";
    p.style.height = tam + "px";
    p.style.left = Math.random() * 100 + "%";
    p.style.top = Math.random() * 100 + "%";
    const durDeriva = Math.random() * 8 + 6;
    const durParpadeo = Math.random() * 4 + 2;
    p.style.animationDuration = durDeriva + "s, " + durParpadeo + "s";
    p.style.animationDelay = (-Math.random() * 10) + "s, " + (-Math.random() * 5) + "s";
    capaParticulas.appendChild(p);
  }
}

// Movimiento del fondo con el cursor: glow suave (lerp) + parallax
if (!reduceMovimiento) {
  let objetivoX = window.innerWidth / 2;   // posición real del ratón
  let objetivoY = window.innerHeight / 2;
  let actualX = objetivoX;                 // posición suavizada del glow
  let actualY = objetivoY;
  let parX = 0, parY = 0;                  // parallax objetivo (-0.5..0.5)
  let parCX = 0, parCY = 0;                // parallax suavizado

  window.addEventListener("pointermove", (e) => {
    objetivoX = e.clientX;
    objetivoY = e.clientY;
    parX = e.clientX / window.innerWidth - 0.5;
    parY = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  function animarFondo() {
    // Interpolación (lerp): el glow persigue al cursor con suavidad
    actualX += (objetivoX - actualX) * 0.08;
    actualY += (objetivoY - actualY) * 0.08;
    raiz.style.setProperty("--mx", actualX + "px");
    raiz.style.setProperty("--my", actualY + "px");

    // Parallax: orbes y partículas se desplazan según el cursor
    parCX += (parX - parCX) * 0.05;
    parCY += (parY - parCY) * 0.05;
    if (contenedorOrbes) {
      contenedorOrbes.style.transform =
        `translate(${parCX * 45}px, ${parCY * 45}px)`;
    }
    if (capaParticulas) {
      capaParticulas.style.transform =
        `translate(${parCX * -22}px, ${parCY * -22}px)`;
    }

    requestAnimationFrame(animarFondo);
  }

  requestAnimationFrame(animarFondo);
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

secciones.forEach((seccion) => {
  seccion.classList.add("oculto");
  observador.observe(seccion);
});


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

document.querySelectorAll("main section[id], footer[id]").forEach((seccion) => {
  observadorNav.observe(seccion);
});


/* =========================================================
   6. SPLIT DEL TÍTULO EN PALABRAS (animación escalonada)
   ========================================================= */

const titulo = document.getElementById("titulo");

if (titulo) {
  const texto = titulo.textContent.trim();
  const palabras = texto.split(" ");
  titulo.textContent = "";

  palabras.forEach((palabra, i) => {
    const span = document.createElement("span");
    span.className = "palabra";
    span.textContent = palabra;
    span.style.animationDelay = `${0.3 + i * 0.12}s`;
    titulo.appendChild(span);
    if (i < palabras.length - 1) {
      titulo.appendChild(document.createTextNode(" "));
    }
  });
}


/* =========================================================
   7. SPOTLIGHT: brillo que sigue al cursor en las tarjetas
   ========================================================= */

const tarjetasSpot = document.querySelectorAll(".tarjeta-spot");

tarjetasSpot.forEach((tarjeta) => {
  tarjeta.addEventListener("pointermove", (evento) => {
    const caja = tarjeta.getBoundingClientRect();
    const x = evento.clientX - caja.left;
    const y = evento.clientY - caja.top;
    tarjeta.style.setProperty("--mx", `${x}px`);
    tarjeta.style.setProperty("--my", `${y}px`);
  });
});


/* =========================================================
   8. BOTÓN "VOLVER ARRIBA" (aparece al hacer scroll)
   ========================================================= */

const botonSubir = document.getElementById("subir");

if (botonSubir) {
  const alScroll = () => {
    botonSubir.classList.toggle("visible", window.scrollY > 400);
  };
  window.addEventListener("scroll", alScroll, { passive: true });
  alScroll();
  botonSubir.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}


/* =========================================================
   9. CONTADOR DESPLEGABLE DE "COSAS QUE HE HECHO"
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