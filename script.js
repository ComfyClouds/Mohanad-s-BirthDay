const CONFIG = {
  fianceName: "Mohanad",
  relationshipStartDate: "2025-08-22T00:00:00",
  googleAppsScriptUrl: "https://script.google.com/macros/s/AKfycbxiVbmKvc924DMI39FAe2NhXDNBAYdNEWxUhvzPYXFcuvK9Rss6ZaQb5Rjhik3wFiQ3RA/exec",
  voiceMessageUrl: "https://www.dropbox.com/scl/fi/pyrcinl7xlsqpz10g2sf6/Mahmoud-El-Esseily-Kol-Sana-_-Wadi-Degla-_.mp3?rlkey=nkk9oheykjef4cj4z5yjrgti0&st=s7dqbj1d&raw=1",
  finaleSongUrl: "kol-sana.mp3",
  event: {
    title: "Mohanad's Birthday Dinner",
    dateISO: "2026-06-01T20:00:00",
    endISO: "2026-06-01T23:30:00",
    location: "Ski Egypt & Dinner",
    mapsQuery: "Ski Egypt Mall of Egypt",
    details: "A soft nude and burgundy birthday date made only for us."
  }
};


const timelineItems = [
  ["First Meeting", "The day you entered the plot."],
  ["First Date", "Cute nerves, good laughs, instant favorite memory."],
  ["First Trip", "Us outside the usual routine, still feeling like home."],
  ["Engagement", "The easiest yes. No notes."],
  ["Favorite Memories", "All the tiny moments that live rent free in my heart."]
];

const reasons = [
  ["Your smile", "Immediate mood booster. Actually unfair."],
  ["Your laugh", "My favorite notification sound, honestly."],
  ["Your kindness", "You make soft love feel real."],
  ["Your brain", "Smart, funny, and slightly too charming."],
  ["Your support", "You make me feel picked, safe, and understood."],
  ["Your energy", "Everything is more fun when you are there."]
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

// ── Background music (MP3) ──────────────────────────────────────
let bgMusic = null;

function getBgMusic() {
  if (!bgMusic) {
    bgMusic = new Audio(CONFIG.finaleSongUrl);
    bgMusic.loop = true;
    bgMusic.volume = 0.35;
  }
  return bgMusic;
}

function init() {
  document.body.classList.add("is-locked");
  setTextContent();
  createHearts();
  initLoader();
  initAmbientCanvas();
  initMusic();
  initCounter();
  initVoicePlayer();
  initInvitation();
  initFlipbook();
  initGallery();
  initLetter();
  initFinale();
  initScrollAnimations();
}

function setTextContent() {
  $("#eventLocationText").textContent = CONFIG.event.location;
  $("#mapsLink").href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.event.mapsQuery || CONFIG.event.location)}`;
  const calEl = $("#calendarLink");
  if (calEl) calEl.href = createGoogleCalendarUrl();
}

function initLoader() {
  const enter = $("#enterExperience");
  const reveal = () => {
    document.body.classList.remove("is-locked");
    $("#loader").animate(
      [{ opacity: 1, filter: "blur(0)" }, { opacity: 0, filter: "blur(18px)" }],
      { duration: 950, easing: "cubic-bezier(.19,1,.22,1)", fill: "forwards" }
    ).onfinish = () => $("#loader").remove();
    if (localStorage.getItem("birthday-music") === "on") startAmbientSound();
  };
  enter.addEventListener("click", reveal);
  setTimeout(() => enter.focus(), 1400);
}

function initMusic() {
  const toggle = $("#musicToggle");
  const stored = localStorage.getItem("birthday-music") || "off";
  updateMusicUi(stored === "on");
  toggle.addEventListener("click", () => {
    const shouldPlay = toggle.getAttribute("aria-pressed") !== "true";
    if (shouldPlay) startAmbientSound();
    else stopAmbientSound();
    localStorage.setItem("birthday-music", shouldPlay ? "on" : "off");
    updateMusicUi(shouldPlay);
  });
}

function startAmbientSound() {
  const music = getBgMusic();
  music.play().catch(() => {});
  updateMusicUi(true);
}

function stopAmbientSound() {
  if (bgMusic) {
    bgMusic.pause();
  }
  updateMusicUi(false);
}

function updateMusicUi(isPlaying) {
  $("#musicToggle").setAttribute("aria-pressed", String(isPlaying));
  $("#musicLabel").textContent = isPlaying ? "Music On" : "Music";
}

function initCounter() {
  const labels = ["Years", "Months", "Days", "Hours", "Minutes", "Seconds"];
  const grid = $("#relationshipCounter");
  labels.forEach((label) => {
    const card = document.createElement("article");
    card.className = "counter-card reveal";
    card.innerHTML = `<strong data-unit="${label.toLowerCase()}">0</strong><span>${label}</span>`;
    grid.appendChild(card);
  });

  const tick = () => {
    const start = new Date(CONFIG.relationshipStartDate);
    const now = new Date();
    const values = getCalendarDuration(start, now);
    Object.entries(values).forEach(([unit, value]) => {
      const el = document.querySelector(`[data-unit="${unit}"]`);
      if (el && el.textContent !== String(value)) el.textContent = value.toLocaleString();
    });
  };
  tick();
  setInterval(tick, 1000);
}

function getCalendarDuration(start, end) {
  if (end < start) {
    return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  let cursor = new Date(start);
  let years = end.getFullYear() - cursor.getFullYear();
  cursor.setFullYear(cursor.getFullYear() + years);
  if (cursor > end) {
    years -= 1;
    cursor = new Date(start);
    cursor.setFullYear(cursor.getFullYear() + years);
  }

  let months = (end.getFullYear() - cursor.getFullYear()) * 12 + end.getMonth() - cursor.getMonth();
  cursor.setMonth(cursor.getMonth() + months);
  if (cursor > end) {
    months -= 1;
    cursor.setMonth(cursor.getMonth() - 1);
  }

  const remaining = end - cursor;
  return {
    years,
    months,
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining % 86400000) / 3600000),
    minutes: Math.floor((remaining % 3600000) / 60000),
    seconds: Math.floor((remaining % 60000) / 1000)
  };
}

function initVoicePlayer() {
  const audio = $("#voiceAudio");
  const button = $("#voiceToggle");
  const canvas = $("#waveform");
  const ctx = canvas.getContext("2d");
  if (CONFIG.voiceMessageUrl) audio.src = CONFIG.voiceMessageUrl;

  button.addEventListener("click", () => {
    if (!CONFIG.voiceMessageUrl) {
      $("#voiceStatus").textContent = "Add your audio URL in script.js";
      pulse(button);
      return;
    }
    if (audio.paused) audio.play();
    else audio.pause();
  });

  audio.addEventListener("play", () => button.classList.add("is-playing"));
  audio.addEventListener("pause", () => button.classList.remove("is-playing"));
  audio.addEventListener("timeupdate", () => {
    $("#voiceTime").textContent = formatTime(audio.currentTime);
  });

  const draw = () => {
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    const progress = audio.duration ? audio.currentTime / audio.duration : 0.18;
    for (let i = 0; i < 86; i++) {
      const x = (i / 86) * width;
      const active = i / 86 < progress;
      const wave = Math.sin(i * 0.55 + performance.now() * 0.002) * 0.5 + 0.5;
      const barHeight = 18 + wave * 70 * (audio.paused ? 0.45 : 1);
      ctx.fillStyle = active ? "#6f1d2f" : "rgba(111,29,47,.22)";
      ctx.fillRect(x, height / 2 - barHeight / 2, 4, barHeight);
    }
    requestAnimationFrame(draw);
  };
  draw();
}

function initInvitation() {
  $("#openEnvelope").addEventListener("click", () => {
    $("#envelope").classList.add("is-open");
    $("#openEnvelope").setAttribute("aria-expanded", "true");
  });
  $("#rsvpOpen").addEventListener("click", () => $("#rsvpModal").showModal());
}

async function initGallery() {
  const status  = $("#galleryStatus");
  const gallery = $("#memoryGallery");

  // Always fetch fresh — no localStorage cache
  localStorage.removeItem("birthday-memories-cache");

  let memories = null;

  if (CONFIG.googleAppsScriptUrl) {
    status.textContent = "Loading memories\u2026";
    try {
      memories = await loadFromSheet(CONFIG.googleAppsScriptUrl);
      if (memories && memories.length > 0) {
        status.textContent = "Our Best Moments";
      } else {
        status.textContent = "Sheet is empty \u2014 add rows to the Memories sheet.";
        memories = sampleMemories;
      }
    } catch (err) {
      status.textContent = "Could not reach sheet \u2014 showing samples.";
      console.error("Gallery load failed:", err.message);
      memories = sampleMemories;
    }
  }

  if (!memories) {
    memories = sampleMemories;
    status.textContent = "Showing sample memories.";
  }

  gallery.innerHTML = "";
  memories.forEach((memory) => {
    const figure = document.createElement("figure");
    figure.className = "memory-card reveal";
    figure.innerHTML = `
      <img src="${escapeHtml(memory.image_url)}" alt="${escapeHtml(memory.caption)}" loading="lazy">
      <figcaption>
        <strong>${escapeHtml(memory.caption)}</strong>
        <span>${escapeHtml(memory.date || memory.category || "")}</span>
      </figcaption>
    `;
    figure.addEventListener("click", () => openGalleryModal(memory));
    gallery.appendChild(figure);
  });
}

// Fetch memories directly — JSONP removed (Apps Script doesn't support it)
function loadFromSheet(url) {
  return fetchViaHttp(url);
}

async function fetchViaHttp(url) {
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch (_) {
    // Apps Script may have wrapped in HTML — try to extract JSON
    const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (match) data = JSON.parse(match[1]);
    else throw new Error("Response not JSON. Deployment access may not be set to Anyone.");
  }
  if (!Array.isArray(data)) throw new Error(data.error || "Unexpected response from sheet");
  return data;
}

// Delete a memory row from the sheet by its image_url
async function deleteMemory(image_url) {
  if (!CONFIG.googleAppsScriptUrl) throw new Error("No Apps Script URL configured.");
  const res = await fetch(CONFIG.googleAppsScriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", image_url }),
    redirect: "follow"
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Delete failed.");
  return true;
}
function initTimeline() {
  const timeline = $("#timeline");
  timelineItems.forEach(([title, copy]) => {
    const item = document.createElement("article");
    item.className = "timeline__item reveal";
    item.innerHTML = `<div class="timeline__card"><h3>${title}</h3><p>${copy}</p></div>`;
    timeline.appendChild(item);
  });
}

function initLetter() {
  $("#openLetter").addEventListener("click", () => {
    $("#letterPaper").classList.add("is-open");
    $("#openLetter").setAttribute("aria-expanded", "true");
    gsap.fromTo("#letterPaper p", { opacity: 0, y: 18 }, { opacity: 1, y: 0, stagger: 0.18, duration: 0.9, ease: "power3.out" });
  });
}

function initReasons() {
  const grid = $("#reasonsGrid");
  reasons.forEach(([title, copy]) => {
    const card = document.createElement("article");
    card.className = "reason-card reveal";
    card.innerHTML = `<h3>${title}</h3><p>${copy}</p>`;
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "rotateY(0) rotateX(0)";
    });
    grid.appendChild(card);
  });
}

function initFinale() {
  $("#celebrateBtn").addEventListener("click", () => {
    playFinaleSong();
    burstConfetti(170);
    launchFireworks();
    floatCelebrationWords();
    startAmbientSound();
  });
}

function playFinaleSong() {
  const hint = $("#finaleSongHint");
  const music = getBgMusic();
  music.currentTime = 0;
  music.volume = 0.9;
  music.play()
    .then(() => {
      updateMusicUi(true);
      localStorage.setItem("birthday-music", "on");
      if (hint) hint.textContent = "Happy Birthday Handoshyyy";
    })
    .catch(() => {
      if (hint) hint.innerHTML = "Place <code>kol-sana.mp3</code> next to <code>index.html</code>, then press again.";
    });
}

function burstConfetti(amount = 120) {
  for (let i = 0; i < amount; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = ["#6f1d2f", "#9f3149", "#e9c5b5", "#fff0d9", "#d8bbc4"][i % 5];
    piece.style.animationDelay = `${Math.random() * 1.4}s`;
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4200);
  }
}

function floatCelebrationWords() {
  const words = ["Kol Sana W Enta Habibi", "Happy Birthday Mohanad", "You are loved", "Tonight is yours"];
  words.forEach((word, index) => {
    setTimeout(() => {
      const el = document.createElement("span");
      el.className = "celebration-float";
      el.textContent = word;
      el.style.setProperty("--drift", `${(Math.random() - 0.5) * 220}px`);
      el.style.left = `${28 + Math.random() * 44}%`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4300);
    }, index * 720);
  });
}

function launchFireworks() {
  const canvas = $("#fireworksCanvas");
  const ctx = canvas.getContext("2d");
  const colors = ["#6f1d2f", "#9f3149", "#e9c5b5", "#fff0d9", "#d8bbc4"];
  let particles = [];
  let running = true;
  let lastBurst = 0;
  let start = performance.now();

  const resize = () => {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
  };

  const addBurst = (x = Math.random() * canvas.width, y = Math.random() * canvas.height * 0.55) => {
    const count = 50 + Math.floor(Math.random() * 34);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = (Math.random() * 4.8 + 2.1) * devicePixelRatio;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: Math.random() * 0.014 + 0.01,
        size: (Math.random() * 2.4 + 1.2) * devicePixelRatio,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  };

  const draw = (time) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";

    if (time - lastBurst > 520 && time - start < 8500) {
      addBurst();
      lastBurst = time;
      if (Math.random() > 0.45) burstConfetti(24);
    }

    particles = particles.filter((particle) => particle.life > 0);
    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.045 * devicePixelRatio;
      particle.vx *= 0.988;
      particle.vy *= 0.988;
      particle.life -= particle.decay;

      ctx.beginPath();
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = Math.max(0, particle.life);
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 20;
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    if (running && (time - start < 9500 || particles.length)) {
      requestAnimationFrame(draw);
    } else {
      canvas.classList.remove("is-active");
      running = false;
    }
  };

  resize();
  canvas.classList.add("is-active");
  addBurst(canvas.width * 0.5, canvas.height * 0.34);
  requestAnimationFrame(draw);
}

function initFlipbook() {
  const pages         = [...document.querySelectorAll(".book-page")];
  const dotsContainer = document.getElementById("flipDots");
  const prevBtn       = document.getElementById("flipPrev");
  const nextBtn       = document.getElementById("flipNext");
  const folio         = document.getElementById("bookFolio");
  if (!pages.length || !dotsContainer) return;

  let current = 0;

  // Build dots
  pages.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "book-dot" + (i === 0 ? " is-active" : "");
    dot.type = "button";
    dot.setAttribute("aria-label", `Page ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function updateUi() {
    dotsContainer.querySelectorAll(".book-dot").forEach((dot, i) => {
      dot.classList.toggle("is-active", i === current);
    });
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === pages.length - 1;
    if (folio) folio.textContent = current + 1;
  }

  function goTo(index) {
    if (index === current || index < 0 || index >= pages.length) return;
    const direction = index > current ? 1 : -1;

    const prev = pages[current];
    prev.classList.remove("book-page--active");
    prev.classList.add("book-page--exit");
    setTimeout(() => prev.classList.remove("book-page--exit"), 480);

    current = index;
    const next = pages[current];
    next.style.transform = `translateX(${direction * 28}px)`;
    next.style.opacity = "0";
    void next.offsetWidth;
    next.classList.add("book-page--active");
    next.style.transform = "";
    next.style.opacity = "";

    updateUi();
  }

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));

  // Swipe support
  let touchStartX = 0;
  const area = document.getElementById("bookPageArea");
  if (area) {
    area.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    area.addEventListener("touchend", (e) => {
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) goTo(delta < 0 ? current + 1 : current - 1);
    }, { passive: true });
  }

  updateUi();
}

function initScrollAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.utils.toArray(".reveal").forEach((element) => {
    gsap.fromTo(
      element,
      { autoAlpha: 0, y: 46, filter: "blur(10px)" },
      {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 84%" }
      }
    );
  });
  gsap.to(".hero__media img", {
    yPercent: 9,
    ease: "none",
    scrollTrigger: { trigger: ".hero", scrub: true }
  });
}

function initAmbientCanvas() {
  const canvas = $("#ambientCanvas");
  const ctx = canvas.getContext("2d");
  let particles = [];
  const resize = () => {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    particles = Array.from({ length: Math.min(120, Math.floor(innerWidth / 10)) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.6 + 0.8,
      s: Math.random() * 0.38 + 0.08,
      a: Math.random() * 0.6 + 0.2
    }));
  };
  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.y -= p.s * devicePixelRatio;
      if (p.y < -10) p.y = canvas.height + 10;
      ctx.beginPath();
      ctx.fillStyle = `rgba(111,29,47,${p.a})`;
      ctx.shadowColor = "rgba(159,49,73,.62)";
      ctx.shadowBlur = 14;
      ctx.arc(p.x, p.y, p.r * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(render);
  };
  addEventListener("resize", resize);
  resize();
  render();
}

function createHearts() {
  const container = $(".floating-hearts");
  for (let i = 0; i < 20; i++) {
    const heart = document.createElement("span");
    heart.textContent = "♥";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.bottom = `${Math.random() * 40 - 30}%`;
    heart.style.fontSize = `${Math.random() * 1.8 + 0.8}rem`;
    heart.style.animationDuration = `${Math.random() * 9 + 8}s`;
    heart.style.animationDelay = `${Math.random() * 8}s`;
    container.appendChild(heart);
  }
}

function openGalleryModal(memory) {
  $("#galleryPreview").src = memory.image_url;
  $("#galleryPreview").alt = memory.caption;
  $("#galleryCaption").textContent = `${memory.caption}${memory.date ? ` · ${memory.date}` : ""}`;
  $("#galleryModal").showModal();
}

$("#galleryClose")?.addEventListener("click", () => $("#galleryModal").close());

function createGoogleCalendarUrl() {
  const format = (date) => new Date(date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: CONFIG.event.title,
    dates: `${format(CONFIG.event.dateISO)}/${format(CONFIG.event.endISO)}`,
    details: CONFIG.event.details,
    location: CONFIG.event.location
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function pulse(element) {
  element.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }],
    { duration: 520, easing: "ease-out" }
  );
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

document.addEventListener("DOMContentLoaded", init);
