// script.js
document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     1. MODO OSCURO / CLARO
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
      try { localStorage.setItem("tema", tema); } catch (e) {}
    }
  }
  const temaInicial = document.documentElement.getAttribute("data-tema") || localStorage.getItem("tema") || "oscuro";
  aplicarTema(temaInicial, false);
  if (botonTema) {
    botonTema.addEventListener("click", () => {
      const actual = document.documentElement.getAttribute("data-tema");
      aplicarTema(actual === "oscuro" ? "claro" : "oscuro");
    });
  }

  /* =========================================================
     2. AÑO DEL FOOTER
     ========================================================= */
  const anio = document.getElementById("anio");
  if (anio) anio.textContent = new Date().getFullYear();

  /* =========================================================
     3. RASTRO DEL CURSOR (optimizado para Lighthouse)
     ========================================================= */
  const reduceMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lienzo = document.getElementById("estela");
  let animationFrameId;

  if (lienzo && !reduceMovimiento) {
    const ctx = lienzo.getContext("2d");
    const rastro = [];
    const MANTENER = 3000, DESVANECER = 2000, VIDA = MANTENER + DESVANECER;
    const INTERACTIVO = ".tarjeta, .lista article, .boton, .email-boton, .form-boton, .modo-oscuro-boton, .hero-ficha, .barra, .pie, .modal, .subir, .marca, .nav a, .celda, .pal-btn";

    function ajustarLienzo() {
      lienzo.width = document.documentElement.clientWidth;
      lienzo.height = document.documentElement.scrollHeight;
    }
    ajustarLienzo();
    window.addEventListener("resize", ajustarLienzo, { passive: true });

    let ultimoT = 0;
    window.addEventListener("pointermove", (e) => {
      if (e.target.closest && e.target.closest(INTERACTIVO)) { rastro.length = 0; return; }
      const ahora = performance.now();
      if (ahora - ultimoT < 24) return;
      ultimoT = ahora;
      rastro.push({ x: e.clientX, y: e.clientY + window.scrollY, t0: ahora });
      if (rastro.length > 200) rastro.shift();
    }, { passive: true });

    function dibujar() {
      ctx.clearRect(0, 0, lienzo.width, lienzo.height);
      const modoClaro = document.documentElement.getAttribute("data-tema") === "claro";
      const ahora = performance.now();
      while (rastro.length && ahora - rastro[0].t0 > VIDA) rastro.shift();
      if (rastro.length < 2) { animationFrameId = requestAnimationFrame(dibujar); return; }

      const edadCabeza = ahora - rastro[rastro.length - 1].t0;
      let vivo = 1;
      if (edadCabeza > MANTENER) vivo = Math.max(0, 1 - (edadCabeza - MANTENER) / DESVANECER);
      if (vivo <= 0) { animationFrameId = requestAnimationFrame(dibujar); return; }

      const cola = rastro[0], cabeza = rastro[rastro.length - 1];
      const grad = ctx.createLinearGradient(cola.x, cola.y, cabeza.x, cabeza.y);
      if (modoClaro) {
        grad.addColorStop(0.0, "rgba(59,130,246,0.00)");
        grad.addColorStop(1.0, "rgba(124,58,237,0.16)");
      } else {
        grad.addColorStop(0.0, "rgba(96,165,250,0.00)");
        grad.addColorStop(1.0, "rgba(167,139,250,0.22)");
      }

      ctx.beginPath(); ctx.moveTo(cola.x, cola.y);
      for (let i = 1; i < rastro.length; i++) ctx.lineTo(rastro[i].x, rastro[i].y);
      ctx.globalAlpha = vivo; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = grad; ctx.globalCompositeOperation = modoClaro ? "source-over" : "lighter";
      ctx.shadowColor = modoClaro ? "rgba(124,58,237,0.25)" : "rgba(139,92,246,0.35)";
      ctx.shadowBlur = 22; ctx.lineWidth = 6; ctx.stroke();
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(dibujar);
    }
    animationFrameId = requestAnimationFrame(dibujar);

    // OPTIMIZACIÓN LIGHTHOUSE: pausar si la pestaña no está visible
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(animationFrameId);
      else animationFrameId = requestAnimationFrame(dibujar);
    });
  }

  /* =========================================================
     4. ANIMACIÓN DE APARICIÓN DE SECCIONES
     ========================================================= */
  const secciones = document.querySelectorAll(".seccion");
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.15 });
  secciones.forEach((s) => { s.classList.add("oculto"); observador.observe(s); });

  /* =========================================================
     5. BOTÓN VOLVER ARRIBA
     ========================================================= */
  const botonSubir = document.getElementById("subir");
  if (botonSubir) {
    const alScroll = () => botonSubir.classList.toggle("visible", window.scrollY > 400);
    window.addEventListener("scroll", alScroll, { passive: true });
    alScroll();
    botonSubir.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* =========================================================
     6. SPLIT DEL TÍTULO (solo en index)
     ========================================================= */
  const titulo = document.getElementById("titulo");
  if (titulo) {
    const palabras = titulo.textContent.trim().split(" ");
    titulo.textContent = "";
    palabras.forEach((palabra, i) => {
      const span = document.createElement("span");
      span.className = "palabra"; span.textContent = palabra;
      span.style.animationDelay = `${0.15 + i * 0.12}s`;
      titulo.appendChild(span);
      if (i < palabras.length - 1) titulo.appendChild(document.createTextNode(" "));
    });
  }

  /* =========================================================
     7. COMPONENTE REUTILIZABLE: TARJETAS DE "ME GUSTA" (req 6)
     Se generan desde un array → componente reutilizable
     ========================================================= */
  const gustosGrid = document.getElementById("gustos-grid");
  if (gustosGrid) {
    const gustos = [
      { emoji: "🎵", titulo: "Música", texto: "La música forma parte de mi día a día y me ayuda a concentrarme, relajarme y disfrutar." },
      { emoji: "🎬", titulo: "Series y películas", texto: "Me gusta ver series y películas para desconectar, aprender y disfrutar de buenas historias." },
      { emoji: "💻", titulo: "Informática", texto: "La informática me llama la atención, especialmente el trabajo que hay detrás de aplicaciones y páginas web." },
      { emoji: "⛰️", titulo: "Montaña", texto: "Disfruto de la montaña, el aire libre y las experiencias relacionadas con la naturaleza." }
    ];
    // Componente reutilizable: función que crea una tarjeta
    function crearTarjetaGusto(dato) {
      const art = document.createElement("article");
      art.className = "tarjeta";
      art.dataset.emoji = dato.emoji;
      art.innerHTML = `<h3>${dato.titulo}</h3><p>${dato.texto}</p>`;
      return art;
    }
    gustos.forEach(dato => gustosGrid.appendChild(crearTarjetaGusto(dato)));
  }

  /* =========================================================
     8. COMPONENTE REUTILIZABLE: TIMELINE "MI VIAJE" (req 7)
     Camufla el historial v1→v2 como una historia personal
     ========================================================= */
  const timeline = document.getElementById("timeline");
  if (timeline) {
    const hitos = [
  { lenguaje: "Python" },
  { lenguaje: "Java" },
  { lenguaje: "PHP" },
  { lenguaje: "HTML / CSS" },
  { lenguaje: "JavaScript" }
];
    // Componente reutilizable: función que crea un hito del timeline
    function crearHito(hito, index) {
  const div = document.createElement("div");
  div.className = "timeline-item";
  div.style.animationDelay = (0.1 * index) + "s";
  div.innerHTML = `
    <div class="timeline-fecha">${hito.lenguaje}</div>
  `;
  return div;
}
    hitos.forEach((hito, i) => timeline.appendChild(crearHito(hito, i)));
  }

  /* =========================================================
     9. "MI RINCÓN" - Zona privada camuflada (req 5)
     Login demo con localStorage
     ========================================================= */
  const rinconBox = document.getElementById("rincon-contenido");
  if (rinconBox) {
    const estaDentro = localStorage.getItem("rincon_acceso") === "si";

    if (estaDentro) {
      rinconBox.classList.add("desbloqueado");
      rinconBox.innerHTML = `
        <div class="rincon-header">
          <h3>Mi rincón personal</h3>
          <button type="button" class="rincon-salir" id="rincon-salir">Salir</button>
        </div>
        <div class="rincon-notas">
          <article class="nota">
            <h4>Mis metas</h4>
            <ul>
              <li>Sácarme DAM</li>
              <li>Trabajar</li>
              <li>Viajar</li>
            </ul>
          </article>
          <article class="nota">
            <h4>Reflexión</h4>
            <p>"Cada línea de código que escribo me acerca un poco más a donde quiero estar. No tengo prisa, pero no me detengo."</p>
          </article>
          <article class="nota">
            <h4>Canciones favoritas</h4>
            <ul>
              <li>Aquella Noche - Bardero$</li>
              <li>Cuantas veces - C.R.O</li>
              <li>Otra Vez Te Soñé . C.R.O</li>
            </ul>
          </article>
        </div>
      `;
      document.getElementById("rincon-salir").addEventListener("click", () => {
        localStorage.removeItem("rincon_acceso");
        location.reload();
      });
    } else {
      rinconBox.innerHTML = `
        <div class="rincon-bloqueado">
          <span class="rincon-candado">🔒</span>
          <h3>Este es mi espacio personal</h3>
          <p>Guardo aquí mis metas, reflexiones y cosas que estoy aprendiendo. Es un rincón solo para mí.</p>
          <button type="button" class="boton" id="rincon-entrar">Soy yo, quiero entrar</button>
          <p class="rincon-hint">Es una demo: no hace falta contraseña.</p>
        </div>
      `;
      document.getElementById("rincon-entrar").addEventListener("click", () => {
        localStorage.setItem("rincon_acceso", "si");
        location.reload();
      });
    }
  }

  /* =========================================================
     10. EMAIL + TOAST
     ========================================================= */
  const CORREO = "vanetayg@alu.edu.gva.es";
  const emailBoton = document.getElementById("email-boton");
  const toast = document.getElementById("toast");
  let temporizadorToast;
  async function copiarTexto(texto) {
    try { await navigator.clipboard.writeText(texto); return true; }
    catch (error) {
      const area = document.createElement("textarea"); area.value = texto;
      area.style.position = "fixed"; area.style.opacity = "0";
      document.body.appendChild(area); area.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(area); return ok;
    }
  }
  function mostrarToast(mensaje) {
    if (!toast) return; toast.textContent = mensaje; toast.classList.add("visible");
    clearTimeout(temporizadorToast);
    temporizadorToast = setTimeout(() => toast.classList.remove("visible"), 4000);
  }
  if (emailBoton) {
    emailBoton.addEventListener("click", async () => {
      const copiado = await copiarTexto(CORREO);
      mostrarToast(copiado ? `✉️ ${CORREO} — copiado` : `✉️ ${CORREO}`);
    });
  }

  /* =========================================================
     11. FORMULARIO GITHUB (req 1)
     ========================================================= */
  const REPO = "neesaa12/mi-web"; // ⚠️ CAMBIA POR TU REPO REAL
  const formBoton = document.getElementById("form-boton");
  const modalFondo = document.getElementById("modal-fondo");
  const modalCerrar = document.getElementById("modal-cerrar");
  const formGithub = document.getElementById("form-github");

  function abrirModal() {
    if (!modalFondo) return; modalFondo.hidden = false;
    requestAnimationFrame(() => modalFondo.classList.add("abierto"));
    const primerCampo = document.getElementById("campo-titulo");
    if (primerCampo) primerCampo.focus();
  }
  function cerrarModal() {
    if (!modalFondo) return; modalFondo.classList.remove("abierto");
    setTimeout(() => { modalFondo.hidden = true; if (formBoton) formBoton.focus(); }, 300);
  }
  if (formBoton) formBoton.addEventListener("click", abrirModal);
  if (modalCerrar) modalCerrar.addEventListener("click", cerrarModal);
  if (modalFondo) modalFondo.addEventListener("click", (e) => { if (e.target === modalFondo) cerrarModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modalFondo && !modalFondo.hidden) cerrarModal(); });

  if (formGithub) {
    formGithub.addEventListener("change", () => {
      formGithub.querySelectorAll(".pills label").forEach((pill) => {
        const input = pill.querySelector("input");
        pill.classList.toggle("activa", input && input.checked);
      });
    });
    formGithub.addEventListener("submit", (e) => {
      e.preventDefault();
      const datos = new FormData(formGithub);
      const tipo = datos.get("tipo");
      const titulo = encodeURIComponent((datos.get("titulo") || "").trim());
      const cuerpo = encodeURIComponent((datos.get("descripcion") || "").trim());
      const etiqueta = encodeURIComponent(datos.get("etiqueta") || "");
      const url = tipo === "pr"
        ? `https://github.com/${REPO}/compare?expand=1&title=${titulo}&body=${cuerpo}&labels=${etiqueta}`
        : `https://github.com/${REPO}/issues/new?title=${titulo}&body=${cuerpo}&labels=${etiqueta}`;
      window.open(url, "_blank", "noopener");
      cerrarModal();
    });
  }

  /* =========================================================
     12. SUDOKU
     ========================================================= */
  (function () {
    const grid = document.getElementById("sudoku-grid");
    const palette = document.getElementById("sudoku-palette");
    if (!grid || !palette) return;
    const fallosEl = document.getElementById("sudoku-fallos");
    const vidasBox = document.getElementById("sudoku-vidas");
    const overlay = document.getElementById("sudoku-overlay");
    const mensaje = document.getElementById("sudoku-mensaje");
    const btnReiniciar = document.getElementById("sudoku-reiniciar");
    const btnOtra = document.getElementById("sudoku-otra");
    const MAX_FALLOS = 3, PISTAS = 25;
    let sol, pistas, tablero, givens, sel, fallos, bloqueado;

    function barajar(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
    function generarSolucion() {
      const base = [[1,2,3,4,5,6,7,8,9],[4,5,6,7,8,9,1,2,3],[7,8,9,1,2,3,4,5,6],[2,3,4,5,6,7,8,9,1],[5,6,7,8,9,1,2,3,4],[8,9,1,2,3,4,5,6,7],[3,4,5,6,7,8,9,1,2],[6,7,8,9,1,2,3,4,5],[9,1,2,3,4,5,6,7,8]];
      let g = base.map((r) => r.slice());
      const mapa = barajar([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      g = g.map((r) => r.map((v) => mapa[v - 1]));
      for (let b = 0; b < 3; b++) { const orden = barajar([0, 1, 2]); const banda = [0, 1, 2].map((i) => g[b * 3 + orden[i]]); for (let i = 0; i < 3; i++) g[b * 3 + i] = banda[i]; }
      const oB = barajar([0, 1, 2]); const bandas = []; for (const b of oB) bandas.push(g.slice(b * 3, b * 3 + 3)); g = bandas.flat();
      for (let p = 0; p < 3; p++) { const orden = barajar([0, 1, 2]); for (let r = 0; r < 9; r++) { const col = [0, 1, 2].map((i) => g[r][p * 3 + orden[i]]); for (let i = 0; i < 3; i++) g[r][p * 3 + i] = col[i]; } }
      const oP = barajar([0, 1, 2]); for (let r = 0; r < 9; r++) { const nuevas = []; for (const p of oP) nuevas.push(g[r].slice(p * 3, p * 3 + 3)); g[r] = nuevas.flat(); }
      if (Math.random() < 0.5) g = g[0].map((_, i) => g.map((fila) => fila[i]));
      return g;
    }
    function generarPistas(s, n) { const p = s.map((r) => r.slice()); const pos = barajar([...Array(81).keys()]); for (let i = 0; i < 81 - n; i++) { const idx = pos[i]; p[idx / 9 | 0][idx % 9] = 0; } return p; }
    function render() {
      grid.innerHTML = "";
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const cell = document.createElement("div");
          cell.className = "celda";
          if ((Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 1) cell.classList.add("caja-alt");
          if ((c + 1) % 3 === 0 && c !== 8) cell.classList.add("b-d");
          if ((r + 1) % 3 === 0 && r !== 8) cell.classList.add("b-b");
          cell.dataset.r = r; cell.dataset.c = c;
          if (pistas[r][c]) { cell.classList.add("given"); cell.textContent = pistas[r][c]; }
          else { cell.classList.add("empty"); }
          cell.addEventListener("click", () => seleccionar(r, c));
          grid.appendChild(cell);
        }
      }
      renderPalette();
    }
    function renderPalette() {
      palette.innerHTML = "";
      const usados = Array(10).fill(0);
      for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) { const v = tablero[r][c]; if (v) usados[v]++; }
      for (let d = 1; d <= 9; d++) {
        const quedan = 9 - usados[d];
        const btn = document.createElement("button");
        btn.type = "button"; btn.className = "pal-btn" + (quedan <= 0 ? " agotado" : "");
        btn.dataset.d = d; btn.innerHTML = `${d}<span class="pal-count">${quedan}</span>`;
        btn.addEventListener("click", () => colocar(d));
        palette.appendChild(btn);
      }
      const del = document.createElement("button"); del.type = "button"; del.className = "sudoku-borrar"; del.textContent = "⌫";
      del.addEventListener("click", borrar); palette.appendChild(del);
    }
    function celdaEl(r, c) { return grid.children[r * 9 + c]; }
    function seleccionar(r, c) {
      if (bloqueado) return; sel = { r, c };
      [...grid.children].forEach((e) => e.classList.remove("sel", "fila-sel", "col-sel"));
      for (let k = 0; k < 9; k++) { celdaEl(r, k).classList.add("fila-sel"); celdaEl(k, c).classList.add("col-sel"); }
      celdaEl(r, c).classList.add("sel");
    }
    function colocar(d) {
      if (bloqueado || !sel) return; const { r, c } = sel;
      if (givens[r][c] || tablero[r][c] === d) return;
      if (sol[r][c] === d) {
        tablero[r][c] = d; const el = celdaEl(r, c); el.textContent = d; el.classList.remove("empty"); el.classList.add("filled");
        renderPalette(); comprobarVictoria();
      } else {
        fallos++; fallosEl.textContent = fallos; const el = celdaEl(r, c); el.classList.add("error");
        setTimeout(() => el.classList.remove("error"), 400);
        if (fallos >= MAX_FALLOS) bloquear();
      }
    }
    function borrar() {
      if (bloqueado || !sel) return; const { r, c } = sel;
      if (givens[r][c] || !tablero[r][c]) return;
      tablero[r][c] = 0; const el = celdaEl(r, c); el.textContent = ""; el.classList.remove("filled"); el.classList.add("empty");
      renderPalette();
    }
    function comprobarVictoria() {
      for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (!tablero[r][c]) return;
      mostrarOverlay("¡Sudoku resuelto! Sin fallos: " + fallos + "/3");
    }
    function bloquear() { bloqueado = true; vidasBox.classList.add("perder"); mostrarOverlay("Fin del juego: has agotado los 3 fallos."); }
    function mostrarOverlay(texto) { mensaje.textContent = texto; overlay.hidden = false; }
    function iniciar() {
      sol = generarSolucion(); pistas = generarPistas(sol, PISTAS); tablero = pistas.map((r) => r.slice());
      givens = pistas.map((r) => r.map((v) => v !== 0)); sel = null; fallos = 0; bloqueado = false;
      fallosEl.textContent = "0"; vidasBox.classList.remove("perder"); overlay.hidden = true; render();
    }
    if (btnReiniciar) btnReiniciar.addEventListener("click", iniciar);
    if (btnOtra) btnOtra.addEventListener("click", iniciar);
    document.addEventListener("keydown", (e) => {
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      if (bloqueado || !sel) return;
      if (e.key >= "1" && e.key <= "9") colocar(Number(e.key));
      else if (e.key === "Backspace" || e.key === "Delete") borrar();
    });
    iniciar();
  })();

  /* =========================================================
     13. API GITHUB (req 5)
     ========================================================= */
  (function () {
    const USUARIO = "neesaa12";
    const API_URL = `https://api.github.com/users/${USUARIO}/repos?sort=updated&per_page=100`;
    const LANG_COLORS = { JavaScript: "#f1e05a", TypeScript: "#3178c6", HTML: "#e34c26", CSS: "#563d7c", Python: "#3572A5", Java: "#b07219" };
    const grid = document.getElementById("proyectos-grid");
    const estadoBox = document.getElementById("proyectos-estado");
    const resumen = document.getElementById("proyectos-resumen");
    const btnRecargar = document.getElementById("proyectos-recargar");
    if (!grid) return;

    // Componente reutilizable: tarjeta de repo
    function crearTarjetaRepo(repo, i) {
      const art = document.createElement("article");
      art.className = "tarjeta-repo";
      art.style.animation = "aparecer 0.5s cubic-bezier(0.22,1,0.36,1) both";
      art.style.animationDelay = (0.08 * i) + "s";
      const color = LANG_COLORS[repo.language] || "#a78bfa";
      const fecha = new Date(repo.updated_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
      art.innerHTML = `
        <h3 class="repo-nombre">${escapar(repo.name)}</h3>
        <p class="repo-desc">${repo.description ? escapar(repo.description) : "Sin descripción."}</p>
        <div class="repo-meta">
          ${repo.language ? `<span class="repo-lang"><i style="background:${color}"></i>${escapar(repo.language)}</span>` : ""}
          <span>⭐ ${formato(repo.stargazers_count)}</span>
          <span>🔱 ${formato(repo.forks_count)}</span>
          <span>↻ ${fecha}</span>
        </div>
        <a class="repo-enlace" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">Ver en GitHub ↗</a>
      `;
      return art;
    }
    function escapar(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
    function formato(n) { return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : n; }
    function renderResumen(repos) {
      const stars = repos.reduce((a, r) => a + r.stargazers_count, 0);
      const forks = repos.reduce((a, r) => a + r.forks_count, 0);
      resumen.textContent = `${repos.length} repositorios · ⭐ ${formato(stars)} · 🔱 ${formato(forks)}`;
    }
    function pintarLoading() {
      estadoBox.hidden = false; estadoBox.className = "proyectos-estado";
      let sk = ""; for (let i = 0; i < 4; i++) sk += `<div class="skeleton"><div class="sk-line titulo"></div><div class="sk-line corta"></div><div class="sk-line mini"></div></div>`;
      estadoBox.innerHTML = sk; grid.innerHTML = "";
    }
    function pintarError(mensaje) {
      estadoBox.hidden = false; estadoBox.className = "proyectos-estado error";
      estadoBox.innerHTML = `<p>${escapar(mensaje)}</p>`; grid.innerHTML = ""; resumen.textContent = "Métricas no disponibles.";
    }
    function pintarVacio() {
      estadoBox.hidden = false; estadoBox.className = "proyectos-estado";
      estadoBox.innerHTML = `<p>Aún no hay repositorios públicos.</p>`; grid.innerHTML = ""; resumen.textContent = "0 repositorios.";
    }
    function pintarRepos(repos) {
      estadoBox.hidden = true; grid.innerHTML = "";
      repos.forEach((repo, i) => grid.appendChild(crearTarjetaRepo(repo, i)));
    }
    async function cargarRepos() {
      pintarLoading();
      try {
        const res = await fetch(API_URL, { headers: { Accept: "application/vnd.github+json" } });
        if (res.status === 403) throw new Error("Límite de peticiones de GitHub alcanzado.");
        if (res.status === 404) throw new Error(`No se encontró el usuario "${USUARIO}".`);
        if (!res.ok) throw new Error("No se pudo cargar la lista de proyectos.");
        const datos = await res.json();
        if (!Array.isArray(datos) || datos.length === 0) { pintarVacio(); return; }
        renderResumen(datos); pintarRepos(datos);
      } catch (e) { pintarError(e.message); }
    }
    if (btnRecargar) btnRecargar.addEventListener("click", cargarRepos);
    cargarRepos();
  })();

});