// Construyendo Sueños — interacciones globales

// Señala que hay JS activo: el estado inicial oculto de .reveal
// solo se aplica bajo .js, así el contenido nunca queda invisible sin script
document.documentElement.classList.add("js");

// Menú móvil: los dos grupos de la barra se abren y cierran juntos
const toggle = document.querySelector(".nav-toggle");
const navGroups = document.querySelectorAll(".nav-group");

if (toggle && navGroups.length) {
  const setMenu = (open) => {
    navGroups.forEach((g) => g.classList.toggle("open", open));
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  toggle.addEventListener("click", () => {
    setMenu(!navGroups[0].classList.contains("open"));
  });

  navGroups.forEach((g) =>
    g.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)))
  );
}

// La barra flota transparente sobre la portada y se vuelve sólida al bajar,
// porque sobre el fondo claro el texto blanco sería ilegible.
const header = document.querySelector(".site-header");

if (header) {
  const syncHeader = () => {
    header.classList.toggle("is-solid", window.scrollY > 60);
  };
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}

// Aparición suave de secciones al hacer scroll
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Año actual en el pie de página
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ==================================================
   Vídeo
   ================================================== */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Los vídeos secundarios llevan data-src: el archivo solo se descarga
// cuando el bloque se acerca a la pantalla, no al abrir la página.
const lazyVideos = document.querySelectorAll("video[data-src]");

if (lazyVideos.length) {
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting) {
          if (!video.dataset.loaded) {
            video.src = video.dataset.src;
            video.dataset.loaded = "1";
          }
          if (!reduceMotion) {
            const play = video.play();
            if (play) play.catch(() => {});
            const reel = video.closest("[data-reel]");
            if (reel) reel.classList.add("is-playing");
          }
        } else if (video.dataset.loaded) {
          // Fuera de pantalla no tiene sentido seguir decodificando fotogramas
          video.pause();
          const reel = video.closest("[data-reel]");
          if (reel) reel.classList.remove("is-playing");
        }
      });
    },
    { rootMargin: "200px 0px", threshold: 0.25 }
  );

  lazyVideos.forEach((video) => videoObserver.observe(video));
}

// Al empezar a reproducirse, el póster estático deja paso al vídeo
document.querySelectorAll("[data-reel] video").forEach((video) => {
  video.addEventListener("playing", () => {
    const poster = video.parentElement.querySelector("[data-poster]");
    if (poster) poster.style.opacity = "0";
  });
});

// Portada: pausar o reanudar el vídeo
const heroVideo = document.getElementById("hero-video");
const heroToggle = document.getElementById("hero-toggle");

const ICON_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h3v14H8zm5 0h3v14h-3z"/></svg>';
const ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

if (heroVideo && heroToggle) {
  if (reduceMotion) heroVideo.pause();

  const sync = () => {
    const paused = heroVideo.paused;
    heroToggle.innerHTML = paused ? ICON_PLAY : ICON_PAUSE;
    heroToggle.setAttribute("aria-label", paused ? "Reproducir vídeo de portada" : "Pausar vídeo de portada");
  };

  heroToggle.addEventListener("click", () => {
    if (heroVideo.paused) {
      const play = heroVideo.play();
      if (play) play.catch(() => {});
    } else {
      heroVideo.pause();
    }
  });

  heroVideo.addEventListener("play", sync);
  heroVideo.addEventListener("pause", sync);
  sync();
}
