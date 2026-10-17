/* BRADAR CLIENT site configuration.
   Add your actual invite/download URLs here when they are ready.
   Leave them empty to keep those actions safely disabled rather than linking to placeholders. */
const SITE_CONFIG = {
  discordInviteUrl: "",
  githubUrl: "https://github.com/Veyrix73/Bradar-client",
  releaseUrl: "",
  releaseDate: {
    year: 2026,
    month: 10, // JavaScript-style month is not used here; month is 1–12.
    day: 24,
    hour: 0,
    minute: 0,
    second: 0,
    timeZone: "Europe/Riga"
  },
  versions: {
    "1.21": ["1.21.1", "1.21.2", "1.21.3", "1.21.4", "1.21.5", "1.21.6", "1.21.7", "1.21.8", "1.21.9", "1.21.10", "1.21.11"],
    "26": ["26.1", "26.2"]
  }
};

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const releaseTimestamp = zonedTimeToUtc(SITE_CONFIG.releaseDate);
  const countdownRoots = [...document.querySelectorAll("[data-countdown]")];
  const discordButtons = [...document.querySelectorAll("[data-discord-button]")];
  const releaseButtons = [...document.querySelectorAll("[data-release-link]")];
  const releaseNotes = [...document.querySelectorAll("[data-release-config-note]")];
  const navToggle = document.querySelector(".nav__toggle");
  const navMenu = document.querySelector(".nav__menu");
  const navLinks = [...document.querySelectorAll(".nav__link")];

  // Version targets are configured above so they can be updated in one place.
  document.querySelectorAll("[data-version-list]").forEach((list) => {
    const key = list.dataset.versionList;
    const versions = SITE_CONFIG.versions[key] || [];
    const fragment = document.createDocumentFragment();
    versions.forEach((version) => {
      const badge = document.createElement("span");
      badge.className = "version-badge";
      badge.textContent = version;
      badge.title = version + " — planned target, not yet verified";
      fragment.appendChild(badge);
    });
    list.replaceChildren(fragment);
    const counter = document.querySelector('[data-version-count="' + key + '"]');
    if (counter) counter.textContent = versions.length + (versions.length === 1 ? " TARGET" : " TARGETS");
  });

  // Only configure destinations that have been supplied; never use a fake invite or download URL.
  discordButtons.forEach((button) => {
    if (isConfiguredUrl(SITE_CONFIG.discordInviteUrl)) {
      button.disabled = false;
      button.removeAttribute("title");
      button.addEventListener("click", () => window.open(SITE_CONFIG.discordInviteUrl, "_blank", "noopener,noreferrer"));
    } else {
      button.disabled = true;
      button.setAttribute("title", "Add your Discord invite in SITE_CONFIG in script.js");
      button.setAttribute("aria-label", "Discord invite not configured yet");
    }
  });

  releaseButtons.forEach((button) => {
    button.disabled = !isConfiguredUrl(SITE_CONFIG.releaseUrl);
    button.textContent = "Check release";
    if (button.disabled) button.title = "Add the official release URL in SITE_CONFIG in script.js";
    else button.removeAttribute("title");
    const arrow = document.createElement("span");
    arrow.className = "button__arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    if (!button.disabled) button.appendChild(arrow);
    button.addEventListener("click", () => {
      if (!button.disabled && isConfiguredUrl(SITE_CONFIG.releaseUrl)) {
        window.location.assign(SITE_CONFIG.releaseUrl);
      }
    });
  });
  releaseNotes.forEach((note) => {
    note.textContent = isConfiguredUrl(SITE_CONFIG.releaseUrl)
      ? "Official release destination configured."
      : "Official download link will be added here when configured.";
  });

  const githubLinks = [...document.querySelectorAll("[data-github-link]")];
  githubLinks.forEach((link) => {
    if (isConfiguredUrl(SITE_CONFIG.githubUrl)) link.href = SITE_CONFIG.githubUrl;
    else {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("tabindex", "-1");
    }
  });

  function renderCountdown(now = Date.now()) {
    const distance = Math.max(0, releaseTimestamp.getTime() - now);
    const released = distance === 0;
    const totalSeconds = Math.floor(distance / 1000);
    const values = {
      days: String(Math.floor(totalSeconds / 86400)).padStart(2, "0"),
      hours: String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0"),
      minutes: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0"),
      seconds: String(totalSeconds % 60).padStart(2, "0")
    };

    countdownRoots.forEach((root) => {
      const countdown = root.querySelector(".countdown");
      const ready = root.querySelector(".countdown-ready");
      if (!countdown || !ready) return;
      countdown.hidden = released;
      ready.hidden = !released;

      Object.entries(values).forEach(([unit, value]) => {
        const number = root.querySelector("[data-" + unit + "]");
        if (!number || number.textContent === value) return;
        number.textContent = value;
        if (!reduceMotion) {
          number.classList.remove("is-ticking");
          // Reflow only this changed digit to replay its small transition.
          void number.offsetWidth;
          number.classList.add("is-ticking");
        }
      });
    });
  }

  // One timer drives both displays, keeping them synchronized without duplicating intervals.
  function startAlignedCountdown() {
    renderCountdown();
    const scheduleNextTick = () => {
      const delay = 1000 - (Date.now() % 1000);
      window.setTimeout(() => {
        renderCountdown();
        scheduleNextTick();
      }, delay);
    };
    scheduleNextTick();
  }
  startAlignedCountdown();

  // Mobile navigation: keyboard-accessible button, Escape handling, and close-on-navigation.
  function closeMenu(returnFocus = false) {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
    navMenu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    if (returnFocus) navToggle.focus();
  }
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      navMenu.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
    });
    navLinks.forEach((link) => link.addEventListener("click", () => closeMenu()));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") closeMenu(true);
    });
    window.matchMedia("(min-width: 801px)").addEventListener("change", (event) => {
      if (event.matches) closeMenu();
    });
  }

  // Section reveal animation, with a graceful fallback where IntersectionObserver is unavailable.
  const revealItems = [...document.querySelectorAll(".reveal")];
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  // Keep the active navigation item in sync with the section currently in view.
  if ("IntersectionObserver" in window) {
    const sections = ["home", "features", "compatibility", "release"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === "#" + visible.target.id;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-25% 0px -60% 0px", threshold: [0, .15, .35, .6] });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  // Lightweight ambient particles; no canvas work is performed when reduced motion is requested.
  const canvas = document.querySelector(".hero__particles");
  if (canvas && !reduceMotion) {
    const context = canvas.getContext("2d");
    if (context) {
      let width = 0;
      let height = 0;
      let frame = 0;
      let particles = [];
      const createParticles = () => Array.from({ length: Math.min(38, Math.max(18, Math.floor(width / 28))) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.2 + .25,
        speed: Math.random() * .13 + .035,
        alpha: Math.random() * .44 + .12
      }));
      const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        width = rect.width;
        height = rect.height;
        canvas.width = Math.floor(width * ratio);
        canvas.height = Math.floor(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        particles = createParticles();
      };
      const draw = () => {
        context.clearRect(0, 0, width, height);
        particles.forEach((particle) => {
          particle.y -= particle.speed;
          if (particle.y < -4) {
            particle.y = height + 4;
            particle.x = Math.random() * width;
          }
          context.beginPath();
          context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          context.fillStyle = "rgba(199, 154, 255, " + particle.alpha + ")";
          context.fill();
        });
        frame = window.requestAnimationFrame(draw);
      };
      resizeCanvas();
      draw();
      window.addEventListener("resize", resizeCanvas, { passive: true });
      document.addEventListener("visibilitychange", () => {
        if (document.hidden && frame) {
          window.cancelAnimationFrame(frame);
          frame = 0;
        } else if (!document.hidden && frame === 0) draw();
      });
    }
  }

  // Local timezone-aware conversion. Intl supplies Riga's actual offset for the target date,
  // so the target remains correct when daylight-saving time rules change.
  function zonedTimeToUtc(config) {
    const targetWallClock = Date.UTC(config.year, config.month - 1, config.day, config.hour, config.minute, config.second);
    let guess = targetWallClock;
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: config.timeZone,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hourCycle: "h23"
    });
    for (let i = 0; i < 4; i += 1) {
      const parts = Object.fromEntries(formatter.formatToParts(new Date(guess)).map((part) => [part.type, part.value]));
      const representedAsUtc = Date.UTC(
        Number(parts.year), Number(parts.month) - 1, Number(parts.day),
        Number(parts.hour), Number(parts.minute), Number(parts.second)
      );
      const adjustment = targetWallClock - representedAsUtc;
      guess += adjustment;
      if (adjustment === 0) break;
    }
    return new Date(guess);
  }

  function isConfiguredUrl(value) {
    if (typeof value !== "string" || !value.trim()) return false;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.hostname.endsWith(".invalid") && !url.hostname.includes("REPLACE_WITH");
    } catch {
      return false;
    }
  }
})();
