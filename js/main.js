// Construyendo Sueños — interacciones globales

// Señala que hay JS activo: el estado inicial oculto de .reveal
// solo se aplica bajo .js, así el contenido nunca queda invisible sin script
document.documentElement.classList.add("js");

// Menú móvil
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".main-nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // Cerrar el menú al elegir una opción
  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
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
