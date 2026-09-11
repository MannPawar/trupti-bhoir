/* Trupti Bhoir — portfolio interactions (vanilla, no dependencies) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const body = document.body;

  /* ---------- Preloader ---------- */
  const loader = $(".loader");
  const bar = $(".loader__bar i");
  const count = $(".loader__count");
  let pct = 0;
  const tick = setInterval(() => {
    pct = Math.min(pct + Math.random() * 14, 92);
    bar.style.width = pct + "%";
    count.textContent = String(Math.round(pct)).padStart(3, "0");
  }, 90);
  const finish = () => {
    clearInterval(tick);
    bar.style.width = "100%";
    count.textContent = "100";
    setTimeout(() => {
      loader.classList.add("is-done");
      body.classList.remove("is-locked");
      body.classList.add("is-ready");
    }, reduced ? 0 : 350);
  };
  if (document.readyState === "complete") setTimeout(finish, 600);
  else window.addEventListener("load", () => setTimeout(finish, 300));
  setTimeout(finish, 3500); // never hold the page hostage

  /* ---------- Split text into words ---------- */
  $$("[data-split]").forEach((el) => {
    const words = el.innerHTML.trim().split(/(\s+|<[^>]+>)/).filter(Boolean);
    let i = 0;
    el.innerHTML = words
      .map((w) => (/^\s+$/.test(w) || w.startsWith("<") ? w : `<span class="w"><span style="--i:${i++}">${w}</span></span>`))
      .join("");
    el.classList.add("split");
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }),
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  $$(".reveal:not(.reveal--clip), .split, .journey li, .tl").forEach((el) => io.observe(el));

  // A fully clipped element never reports as intersecting, so watch its parent instead
  const clipIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      $$(":scope > .reveal--clip", e.target).forEach((c) => c.classList.add("in"));
      clipIO.unobserve(e.target);
    }),
    { threshold: 0.1 }
  );
  new Set($$(".reveal--clip").map((el) => el.parentElement)).forEach((p) => clipIO.observe(p));

  // Stagger children of [data-stagger]
  $$("[data-stagger]").forEach((wrap) => {
    const step = parseFloat(wrap.dataset.stagger) || 0.08;
    [...wrap.children].forEach((c, i) => c.style.setProperty("--d", (i * step).toFixed(2) + "s"));
  });

  /* ---------- Count up ---------- */
  const countIO = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, to = +el.dataset.count, dur = reduced ? 0 : 1800, t0 = performance.now();
    const fmt = (n) => n.toLocaleString("en-IN");
    const step = (t) => {
      const p = dur ? Math.min((t - t0) / dur, 1) : 1;
      el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 4))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    countIO.unobserve(el);
  }), { threshold: 0.6 });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* ---------- Rotating roles ---------- */
  const rot = $(".rot");
  if (rot) {
    const items = $$("span", rot);
    let k = 0;
    const fit = () => (rot.style.width = items[k].offsetWidth + "px");
    items[0].classList.add("on");
    fit();
    document.fonts?.ready.then(fit);
    addEventListener("resize", fit);
    setInterval(() => {
      items[k].classList.replace("on", "off");
      const prev = items[k];
      setTimeout(() => prev.classList.remove("off"), 800);
      k = (k + 1) % items.length;
      items[k].classList.add("on");
      fit();
    }, 2400);
  }

  /* ---------- Nav: scrolled / hide on scroll down / active link ---------- */
  const nav = $(".nav");
  const progress = $(".progress");
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle("is-scrolled", y > 30);
    nav.classList.toggle("is-hidden", y > lastY && y > 500 && !menu.classList.contains("is-open"));
    lastY = y;
    const h = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  };

  const links = $$(".nav__links a");
  const secIO = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => secIO.observe(s));

  /* ---------- Mobile menu ---------- */
  const burger = $(".burger");
  const menu = $(".menu");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", open);
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", !open);
    body.classList.toggle("is-locked", open);
  };
  burger.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("is-open")) setMenu(false); });

  /* ---------- Parallax + timeline fill (single rAF loop) ---------- */
  const para = $$("[data-parallax]");
  const tl = $(".timeline"), fill = $(".timeline__fill");
  let ticking = false;
  const frame = () => {
    onScroll();
    if (!reduced) {
      para.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const speed = parseFloat(el.dataset.parallax);
        const off = (r.top + r.height / 2 - innerHeight / 2) * speed;
        el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
      });
    }
    if (tl) {
      const r = tl.getBoundingClientRect();
      const p = Math.min(Math.max((innerHeight * 0.6 - r.top) / r.height, 0), 1);
      fill.style.height = p * 100 + "%";
    }
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener("resize", frame);
  frame();

  /* ---------- Pointer-only flourishes ---------- */
  if (finePointer && !reduced) {
    // Custom cursor
    const c = $(".cursor"), d = $(".cursor-dot");
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    body.classList.add("has-cursor");
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; d.style.transform = `translate(${mx}px, ${my}px)`; });
    const loop = () => {
      cx += (mx - cx) * 0.16; cy += (my - cy) * 0.16;
      c.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener("mouseover", (e) => c.classList.toggle("is-hover", !!e.target.closest("a, button, .film, .cert")));
    document.addEventListener("mouseleave", () => { c.style.opacity = 0; d.style.opacity = 0; });
    document.addEventListener("mouseenter", () => { c.style.opacity = ""; d.style.opacity = ""; });

    // Magnetic buttons
    $$(".btn, .social").forEach((b) => {
      b.addEventListener("mousemove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      b.addEventListener("mouseleave", () => (b.style.transform = ""));
    });

    // 3D tilt
    $$("[data-tilt]").forEach((el) => {
      const max = parseFloat(el.dataset.tilt) || 6;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateY(-6px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });

    // Spotlight glow on pillars
    $$(".pillar").forEach((p) => p.addEventListener("mousemove", (e) => {
      const r = p.getBoundingClientRect();
      p.style.setProperty("--mx", e.clientX - r.left + "px");
      p.style.setProperty("--my", e.clientY - r.top + "px");
    }));
  }

  /* ---------- Certificate carousel (buttons + drag) ---------- */
  const certs = $(".certs");
  if (certs) {
    const by = () => (certs.firstElementChild?.getBoundingClientRect().width || 280) + 19;
    $(".carousel-ctrl .prev").addEventListener("click", () => certs.scrollBy({ left: -by(), behavior: "smooth" }));
    $(".carousel-ctrl .next").addEventListener("click", () => certs.scrollBy({ left: by(), behavior: "smooth" }));
    let down = false, sx = 0, sl = 0, moved = false;
    certs.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      down = true; moved = false; sx = e.clientX; sl = certs.scrollLeft;
    });
    addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 5) { moved = true; certs.classList.add("is-drag"); }
      certs.scrollLeft = sl - dx;
    });
    addEventListener("pointerup", () => { down = false; certs.classList.remove("is-drag"); });
    certs.addEventListener("click", (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  }

  /* ---------- Gallery filters ---------- */
  const fBtns = $$(".filters button");
  fBtns.forEach((btn) => btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    fBtns.forEach((b) => b.setAttribute("aria-pressed", b === btn));
    $$(".g-item").forEach((it, i) => {
      const show = f === "all" || it.dataset.cat === f;
      it.classList.toggle("is-out", !show);
      it.classList.remove("is-in");
      if (show) { void it.offsetWidth; it.style.animationDelay = (i % 12) * 40 + "ms"; it.classList.add("is-in"); }
    });
  }));

  /* ---------- Lightbox (groups by data-group; keyboard + swipe) ---------- */
  const lb = $(".lightbox"), lbImg = $("img", lb), lbCap = $("figcaption", lb), lbCount = $(".lb-count", lb);
  let group = [], idx = 0, lastFocus = null;
  const show = (i) => {
    idx = (i + group.length) % group.length;
    const el = group[idx];
    lbImg.classList.remove("loaded");
    const src = el.dataset.full || $("img", el).src;
    const img = new Image();
    img.onload = () => { lbImg.src = src; lbImg.alt = $("img", el).alt; requestAnimationFrame(() => lbImg.classList.add("loaded")); };
    img.src = src;
    lbCap.textContent = el.dataset.caption || $("img", el).alt || "";
    lbCount.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(group.length).padStart(2, "0")}`;
  };
  const open = (el) => {
    const g = el.dataset.group;
    group = $$(`[data-lightbox][data-group="${g}"]`).filter((x) => !x.classList.contains("is-out"));
    lastFocus = el;
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    body.classList.add("is-locked");
    show(group.indexOf(el));
    $(".lb-close", lb).focus();
  };
  const close = () => {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    body.classList.remove("is-locked");
    lastFocus?.focus();
  };
  $$("[data-lightbox]").forEach((el) => el.addEventListener("click", () => open(el)));
  $(".lb-close", lb).addEventListener("click", close);
  $(".lb-prev", lb).addEventListener("click", () => show(idx - 1));
  $(".lb-next", lb).addEventListener("click", () => show(idx + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
  let tx = 0;
  lb.addEventListener("touchstart", (e) => (tx = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  });

  /* ---------- Year ---------- */
  const yr = $("#yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
