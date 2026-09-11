/* Trupti Bhoir — portfolio interactions (vanilla, no dependencies) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const body = document.body;

  /* ---------- Warli figures (Trupti Bhoir Filmss emblem style) ---------- */
  // Round head, two triangles, stick limbs. Each limb sits in a group translated to its
  // shoulder/hip so the CSS rotation pivots there.
  const fig = (reach) =>
    `<g class="wf"><circle cx="0" cy="-19.5" r="4.2"/><path d="M-7 -14.5H7L0 0Z"/><path d="M0 0L-6 11H6Z"/>` +
    `<g transform="translate(-6 -13.5)"><path class="al" d="M0 0L${-reach / 2} 4L${-reach} 0"/></g>` +
    `<g transform="translate(6 -13.5)"><path class="ar" d="M0 0L${reach / 2} 4L${reach} 0"/></g>` +
    `<g transform="translate(-4 10)"><path class="ll" d="M0 0L-4 7L-3 14L-6.5 14"/></g>` +
    `<g transform="translate(4 10)"><path class="lr" d="M0 0L4 7L3 14L6.5 14"/></g></g>`;
  const S = 30; // chain spacing; arms reach halfway so neighbours hold hands
  const chain = (n) => Array.from({ length: n }, (_, i) =>
    `<g transform="translate(${S / 2 + i * S} 30)" style="--wd:${(-i * 0.06).toFixed(2)}s">${fig(S / 2 - 6)}</g>`).join("");
  const ring = (n, R, cls) => {
    const reach = R * Math.sin(Math.PI / n) - 6;
    let s = "";
    for (let i = 0; i < n; i++) s += `<g transform="rotate(${((360 / n) * i).toFixed(2)}) translate(0 ${-R})" style="--wd:${i % 2 ? -0.4 : 0}s">${fig(reach)}</g>`;
    return `<g class="ring ${cls}">${s}</g>`;
  };
  $$("[data-warli]").forEach((svg) => {
    if (svg.dataset.warli === "tarpa") {
      svg.innerHTML = ring(18, 104, "ring--out") + ring(11, 56, "ring--in") +
        `<g transform="translate(0 4)">${fig(7)}<path class="horn" d="M3 -17L19 -4M17 -7L23 -9L21 -1Z"/></g>`;
      return;
    }
    const n = svg.dataset.fill ? Math.ceil(Math.max(innerWidth, screen.width) / (S * 58 / 56)) + 1 : +svg.dataset.count;
    svg.setAttribute("viewBox", `0 0 ${n * S} 56`);
    svg.innerHTML = chain(n);
  });
  // Film strip: word frames alternate with single-dancer frames, doubled for a seamless loop
  $$("[data-strip]").forEach((track) => {
    const once = track.dataset.strip.split("|").map((w, i) =>
      `<span class="frame">${w}</span><span class="frame frame--dancer"><svg class="wsvg" viewBox="-16 -26 32 54"><g style="--wd:${(-i * 0.13).toFixed(2)}s">${fig(9)}</g></svg></span>`).join("");
    track.innerHTML = once + once;
  });
  // Spiral-sun emblem from the Trupti Bhoir Filmss logo: 2.5-turn spiral, rays over the top, sun core
  $$("[data-emblem]").forEach((svg) => {
    const turns = Math.PI * 5;
    let d = "";
    for (let t = 0; t <= turns; t += 0.12) {
      const r = 3 + (27 * t) / turns;
      d += (d ? "L" : "M") + (r * Math.cos(t)).toFixed(2) + " " + (r * Math.sin(t)).toFixed(2);
    }
    let rays = "";
    for (let i = 0; i < 11; i++) {
      const a = ((-195 + i * 21) * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
      rays += `<g class="ray" style="--i:${i}"><path d="M${(37 * c).toFixed(1)} ${(37 * s).toFixed(1)}L${(45 * c).toFixed(1)} ${(45 * s).toFixed(1)}"/>` +
        (i % 2 ? "" : `<circle cx="${(50 * c).toFixed(1)}" cy="${(50 * s).toFixed(1)}" r="1.8"/>`) + "</g>";
    }
    svg.innerHTML = `<path class="spiral" pathLength="1" d="${d}"/>${rays}<circle class="core" r="5"/>`;
  });
  // Stop the dancing while it is off-screen
  const wIO = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("w-paused", !e.isIntersecting)));
  $$("[data-warli], .filmstrip").forEach((el) => wIO.observe(el));

  /* ---------- Clapperboards on section labels ---------- */
  const clapSVG = `<svg class="clap" viewBox="0 0 24 20" aria-hidden="true"><rect x="2" y="8" width="20" height="11" rx="1.5"/><path d="M2 12h20M7 8l-2 4M12 8l-2 4M17 8l-2 4M22 8l-2 4"/><g class="clap__stick"><rect x="2" y="3.5" width="20" height="4.5" rx="1"/><path d="M7.5 3.5l-2 4.5M12.5 3.5l-2 4.5M17.5 3.5l-2 4.5"/></g></svg>`;
  $$(".eyebrow").forEach((e) => { e.insertAdjacentHTML("afterbegin", clapSVG); e.classList.add("has-clap"); });

  /* ---------- Preloader: 3-2-1 film leader → Trupti Bhoir Filmss emblem, every load ---------- */
  const loader = $(".loader");
  const num = $(".leader__num");
  let loaded = document.readyState === "complete", introDone = false, finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    loader.classList.add("is-done");
    body.classList.remove("is-locked");
    body.classList.add("is-ready");
    setTimeout(() => loader.remove(), 1200);
  };
  const tryFinish = () => { if (loaded && introDone) finish(); };
  const ident = (hold) => {
    loader.classList.add("is-ident");
    setTimeout(() => { introDone = true; tryFinish(); }, hold);
  };
  addEventListener("load", () => { loaded = true; tryFinish(); });
  if (reduced) { introDone = true; tryFinish(); }
  else {
    const STEP = 300; // ms per countdown number
    [3, 2, 1].forEach((n, i) => setTimeout(() => {
      num.textContent = n;
      num.classList.remove("tick"); void num.offsetWidth; num.classList.add("tick");
    }, i * STEP));
    setTimeout(() => ident(2200), 3 * STEP);
  }
  $(".loader__skip").addEventListener("click", () => { loaded = introDone = true; finish(); });
  setTimeout(() => { loaded = introDone = true; tryFinish(); }, 7000); // never hold the page hostage

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
      $$(":scope > .reveal--clip, :scope > .reveal--iris", e.target).forEach((c) => c.classList.add("in"));
      clipIO.unobserve(e.target);
    }),
    { threshold: 0.1 }
  );
  new Set($$(".reveal--clip, .reveal--iris").map((el) => el.parentElement)).forEach((p) => clipIO.observe(p));

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
  const reel = $(".timeline__reel"), reelSvg = reel && $("svg", reel);
  const tc = $(".timecode b"), tcReel = $(".timecode span"), secs = $$("main section");
  const tcMQ = matchMedia("(min-width: 1024px) and (pointer: fine)");
  const pad = (n) => String(n).padStart(2, "0");
  let ticking = false;
  const frame = () => {
    onScroll();
    if (tc && tcMQ.matches) {
      // Scroll distance as 24fps timecode; reel number = section under the middle of the screen
      const f = Math.floor(scrollY / 2);
      tc.textContent = `${pad(Math.floor(f / 86400))}:${pad(Math.floor(f / 1440) % 60)}:${pad(Math.floor(f / 24) % 60)}:${pad(f % 24)}`;
      let r = 1;
      secs.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight / 2) r = i + 1; });
      tcReel.textContent = "REEL " + pad(r);
    }
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
      if (reel) {
        reel.style.top = p * 100 + "%";
        reelSvg.style.transform = `rotate(${(p * 1440).toFixed(1)}deg)`;
      }
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
