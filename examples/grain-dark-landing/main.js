// Scroll interactions for the demo landing page. These are the JS fallbacks the
// DESIGN_SPEC describes for the scroll-driven utilities (progress, parallax,
// reveal) — robust across browsers. All respect prefers-reduced-motion.
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// 1) Scroll progress bar (spec: scaleX = scrollY / (scrollHeight - innerHeight))
const progress = document.getElementById("progress");
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? window.scrollY / max : 0;
  if (progress) progress.style.width = (p * 100).toFixed(2) + "%";

  if (!reduce) {
    // 2) Parallax — hero mesh + floating card drift slower than scroll (subtle).
    const y = window.scrollY;
    const mesh = document.getElementById("mesh");
    const card = document.getElementById("heroCard");
    if (mesh) mesh.style.transform = `translateY(${y * 0.18}px)`;
    if (card) card.style.transform = `translateY(${y * -0.06}px)`;
  }
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// 3) Scroll reveal — fade/rise sections as they enter the viewport.
const targets = document.querySelectorAll("[data-reveal]");
if (reduce || !("IntersectionObserver" in window)) {
  targets.forEach((el) => el.classList.add("is-visible"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.15 },
  );
  targets.forEach((el) => io.observe(el));
}
