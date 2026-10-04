/*
 * Фонові ефекти секцій у стилі гайдлайну: приціли, топографічні лінії, логотип з частинок.
 * Кожен canvas малюється лише поки секція у вʼюпорті; з prefers-reduced-motion — один статичний кадр.
 */
(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ACCENT = '181, 213, 83';
    const WHITE = '255, 255, 255';

    /* ---------- REVEAL ON SCROLL ---------- */

    function initReveal() {
        const items = [...document.querySelectorAll('.reveal')];
        if (reduced || !('IntersectionObserver' in window)) {
            items.forEach((el) => el.classList.add('is-in'));
            return;
        }
        items.forEach((el) => {
            const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
            el.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(el), 6) * 70}ms`);
        });
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                io.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        items.forEach((el) => io.observe(el));
        document.documentElement.classList.add('reveal-ready');
    }

    /* ---------- COUNTERS ---------- */

    function initCounters() {
        const els = document.querySelectorAll('[data-count-to]');
        if (reduced) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                io.unobserve(entry.target);
                const el = entry.target;
                const to = Number(el.dataset.countTo);
                const t0 = performance.now();
                const step = (t) => {
                    const p = Math.min((t - t0) / 1400, 1);
                    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
                    if (p < 1) requestAnimationFrame(step);
                };
                el.textContent = '0';
                requestAnimationFrame(step);
            });
        }, { threshold: 0.6 });
        els.forEach((el) => io.observe(el));
    }

    /* ---------- CANVAS RUNNER ---------- */

    function mountCanvas(canvas, effect, fps = 60) {
        const ctx = canvas.getContext('2d');
        const host = canvas.parentElement;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const state = { w: 0, h: 0, pointer: { x: -9999, y: -9999, active: false } };
        const fx = effect(ctx, state);
        let raf = 0, visible = false, last = 0;
        const minDelta = 1000 / fps;

        const resize = () => {
            const r = canvas.getBoundingClientRect();
            if (!r.width || !r.height) return;
            state.w = r.width;
            state.h = r.height;
            canvas.width = Math.round(r.width * dpr);
            canvas.height = Math.round(r.height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            fx.resize?.();
            if (reduced) fx.draw(0);
        };

        const loop = (t) => {
            raf = requestAnimationFrame(loop);
            if (t - last < minDelta) return;
            last = t;
            fx.draw(t);
        };
        const start = () => { if (!raf && !reduced && visible && !document.hidden) raf = requestAnimationFrame(loop); };
        const stop = () => { cancelAnimationFrame(raf); raf = 0; };

        new ResizeObserver(resize).observe(canvas);
        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) { fx.enter?.(); start(); } else stop();
        }, { rootMargin: '80px' }).observe(canvas);
        document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

        host.addEventListener('pointermove', (e) => {
            const r = canvas.getBoundingClientRect();
            state.pointer.x = e.clientX - r.left;
            state.pointer.y = e.clientY - r.top;
            state.pointer.active = e.pointerType === 'mouse';
        });
        host.addEventListener('pointerleave', () => { state.pointer.active = false; });
        resize();
    }

    /* ---------- NOISE ---------- */

    const perm = new Uint8Array(512);
    (() => {
        const p = [...Array(256).keys()];
        for (let i = 255; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
        for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    })();
    const fade = (t) => t * t * (3 - 2 * t);
    const lerp = (a, b, t) => a + (b - a) * t;
    const h3 = (x, y, z) => perm[perm[perm[x & 255] + (y & 255)] + (z & 255)] / 255;
    function noise3(x, y, z) {
        const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
        const u = fade(x - xi), v = fade(y - yi), w = fade(z - zi);
        const a = lerp(lerp(h3(xi, yi, zi), h3(xi + 1, yi, zi), u), lerp(h3(xi, yi + 1, zi), h3(xi + 1, yi + 1, zi), u), v);
        const b = lerp(lerp(h3(xi, yi, zi + 1), h3(xi + 1, yi, zi + 1), u), lerp(h3(xi, yi + 1, zi + 1), h3(xi + 1, yi + 1, zi + 1), u), v);
        return lerp(a, b, w);
    }

    /* ---------- EFFECT: HERO RETICLE ---------- */

    const reticle = (ctx, s) => {
        const pos = { x: 0, y: 0 };
        let lockT = 0, lastMove = 0;
        const prev = { x: 0, y: 0 };
        return {
            resize() { pos.x = s.w * 0.68; pos.y = s.h * 0.42; },
            draw(t) {
                const { w, h, pointer } = s;
                ctx.clearRect(0, 0, w, h);
                const target = pointer.active
                    ? pointer
                    : { x: w * (0.66 + Math.sin(t / 5200) * 0.16), y: h * (0.44 + Math.sin(t / 3700) * 0.18) };
                pos.x += (target.x - pos.x) * 0.08;
                pos.y += (target.y - pos.y) * 0.08;

                const moved = Math.hypot(pos.x - prev.x, pos.y - prev.y);
                prev.x = pos.x; prev.y = pos.y;
                if (moved > 0.6) lastMove = t;
                lockT += ((t - lastMove > 450 ? 1 : 0) - lockT) * 0.1;

                // Перехрестя на всю ширину
                ctx.strokeStyle = `rgba(${WHITE}, 0.10)`;
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 6]);
                ctx.beginPath();
                ctx.moveTo(0, pos.y); ctx.lineTo(w, pos.y);
                ctx.moveTo(pos.x, 0); ctx.lineTo(pos.x, h);
                ctx.stroke();
                ctx.setLineDash([]);

                // Кутові дужки прицілу, що стискаються при «захопленні»
                const r = 46 - lockT * 14;
                const k = 12;
                ctx.strokeStyle = `rgba(${ACCENT}, ${0.5 + lockT * 0.4})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
                    const cx = pos.x + sx * r, cy = pos.y + sy * r;
                    ctx.moveTo(cx, cy - sy * k); ctx.lineTo(cx, cy); ctx.lineTo(cx - sx * k, cy);
                });
                ctx.stroke();

                ctx.strokeStyle = `rgba(${WHITE}, 0.35)`;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 18 + Math.sin(t / 400) * 1.5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = `rgb(${ACCENT})`;
                ctx.fillRect(pos.x - 2, pos.y - 2, 4, 4);

                ctx.font = '11px "Inter Tight", sans-serif';
                ctx.fillStyle = `rgba(${ACCENT}, 0.85)`;
                const lat = (52.3 - (pos.y / h) * 7.9).toFixed(4);
                const lng = (22.1 + (pos.x / w) * 18.1).toFixed(4);
                ctx.fillText(`${lat}° N  ${lng}° E`, pos.x + r + 10, pos.y - r + 10);
                if (lockT > 0.6) {
                    ctx.fillStyle = `rgba(${WHITE}, ${(lockT - 0.6) * 1.8})`;
                    ctx.fillText('ЦІЛЬ: ЄДНІСТЬ', pos.x + r + 10, pos.y - r + 26);
                }

                // Повільна лінія сканування
                const scanY = ((t / 22) % (h + 200)) - 100;
                const g = ctx.createLinearGradient(0, scanY - 60, 0, scanY);
                g.addColorStop(0, `rgba(${ACCENT}, 0)`);
                g.addColorStop(1, `rgba(${ACCENT}, 0.06)`);
                ctx.fillStyle = g;
                ctx.fillRect(0, scanY - 60, w, 60);
            }
        };
    };

    /* ---------- EFFECT: TOPOGRAPHIC CONTOURS ---------- */

    const topo = (ctx, s) => {
        const cell = 18;
        const levels = [0.3, 0.38, 0.46, 0.54, 0.62, 0.7];
        let cols = 0, rows = 0, field = new Float32Array(0);

        const sample = (t) => {
            const z = t * 0.00005;
            const { pointer } = s;
            for (let j = 0; j <= rows; j++) {
                for (let i = 0; i <= cols; i++) {
                    const x = i * cell, y = j * cell;
                    let v = noise3(x * 0.0035, y * 0.0035, z) * 0.7 + noise3(x * 0.009 + 40, y * 0.009, z * 1.6) * 0.3;
                    if (pointer.active) {
                        const d2 = (x - pointer.x) ** 2 + (y - pointer.y) ** 2;
                        v += 0.22 * Math.exp(-d2 / 16000);
                    }
                    field[j * (cols + 1) + i] = v;
                }
            }
        };

        const seg = (ctx, ax, ay, bx, by) => { ctx.moveTo(ax, ay); ctx.lineTo(bx, by); };

        return {
            resize() {
                cols = Math.ceil(s.w / cell);
                rows = Math.ceil(s.h / cell);
                field = new Float32Array((cols + 1) * (rows + 1));
            },
            draw(t) {
                const { w, h } = s;
                ctx.clearRect(0, 0, w, h);
                sample(t || 0);
                const W = cols + 1;
                levels.forEach((lv, li) => {
                    const major = li === 3;
                    ctx.strokeStyle = major ? `rgba(${ACCENT}, 0.22)` : `rgba(${WHITE}, 0.07)`;
                    ctx.lineWidth = major ? 1.2 : 1;
                    ctx.beginPath();
                    for (let j = 0; j < rows; j++) {
                        for (let i = 0; i < cols; i++) {
                            const a = field[j * W + i], b = field[j * W + i + 1];
                            const c = field[(j + 1) * W + i + 1], d = field[(j + 1) * W + i];
                            const idx = (a > lv ? 8 : 0) | (b > lv ? 4 : 0) | (c > lv ? 2 : 0) | (d > lv ? 1 : 0);
                            if (idx === 0 || idx === 15) continue;
                            const x = i * cell, y = j * cell;
                            const top = [x + cell * ((lv - a) / (b - a)), y];
                            const right = [x + cell, y + cell * ((lv - b) / (c - b))];
                            const bottom = [x + cell * ((lv - d) / (c - d)), y + cell];
                            const left = [x, y + cell * ((lv - a) / (d - a))];
                            switch (idx) {
                                case 1: case 14: seg(ctx, ...left, ...bottom); break;
                                case 2: case 13: seg(ctx, ...bottom, ...right); break;
                                case 3: case 12: seg(ctx, ...left, ...right); break;
                                case 4: case 11: seg(ctx, ...top, ...right); break;
                                case 5: seg(ctx, ...left, ...top); seg(ctx, ...bottom, ...right); break;
                                case 6: case 9: seg(ctx, ...top, ...bottom); break;
                                case 7: case 8: seg(ctx, ...left, ...top); break;
                                case 10: seg(ctx, ...left, ...bottom); seg(ctx, ...top, ...right); break;
                            }
                        }
                    }
                    ctx.stroke();
                });
            }
        };
    };

    /* ---------- EFFECT: LOGO FROM PARTICLES ---------- */

    const LOGO_PATHS = [
        'M73.7656 79.3613L39.6816 113.468L49.1775 122.964L73.8345 98.3071L98.4455 122.895L107.873 113.468L73.7656 79.3613Z',
        'M147.552 73.7875L100.44 26.6754L80.5538 46.8827V23.5561L87.8706 31.3086L96.449 22.7074L73.7645 0L51.103 22.7074L59.6813 31.3086L66.9753 23.5561V46.8827L47.112 26.6754L0 73.7875L9.31231 83.0998L46.9514 45.4377L63.5118 61.998L25.8496 99.6372L35.6896 109.454L73.7645 71.3562L111.862 109.454L121.679 99.6372L84.0401 61.998L100.601 45.4377L138.24 83.0998L147.552 73.7875Z'
    ];

    const particles = (ctx, s) => {
        let parts = [];
        let assembled = false;

        const build = () => {
            const size = Math.min(s.w * 0.78, s.h * 0.78 * (148 / 123));
            const scale = size / 148;
            const ox = (s.w - 148 * scale) / 2;
            const oy = (s.h - 123 * scale) / 2;
            const off = document.createElement('canvas');
            off.width = Math.ceil(s.w);
            off.height = Math.ceil(s.h);
            const octx = off.getContext('2d');
            octx.setTransform(scale, 0, 0, scale, ox, oy);
            octx.fillStyle = '#fff';
            LOGO_PATHS.forEach((d) => octx.fill(new Path2D(d)));
            const data = octx.getImageData(0, 0, off.width, off.height).data;
            const step = Math.max(4, Math.round(size / 70));
            const next = [];
            for (let y = 0; y < off.height; y += step) {
                for (let x = 0; x < off.width; x += step) {
                    if (data[(y * off.width + x) * 4 + 3] < 128) continue;
                    const old = parts[next.length];
                    next.push({
                        hx: x, hy: y,
                        x: old ? old.x : Math.random() * s.w,
                        y: old ? old.y : Math.random() * s.h,
                        vx: 0, vy: 0,
                        accent: Math.random() < 0.18,
                        seed: Math.random() * 1000
                    });
                }
            }
            parts = next;
            if (reduced || assembled) parts.forEach((p) => { p.x = p.hx; p.y = p.hy; });
        };

        return {
            resize: build,
            enter() { setTimeout(() => { assembled = true; }, 1600); },
            draw(t) {
                const { w, h, pointer } = s;
                ctx.clearRect(0, 0, w, h);
                const R = 70;
                for (const p of parts) {
                    const jitter = Math.sin(t / 900 + p.seed) * 0.6;
                    let ax = (p.hx + jitter - p.x) * 0.045;
                    let ay = (p.hy + Math.cos(t / 1100 + p.seed) * 0.6 - p.y) * 0.045;
                    if (pointer.active) {
                        const dx = p.x - pointer.x, dy = p.y - pointer.y;
                        const d2 = dx * dx + dy * dy;
                        if (d2 < R * R) {
                            const f = (1 - Math.sqrt(d2) / R) * 3.2;
                            const d = Math.sqrt(d2) || 1;
                            ax += (dx / d) * f;
                            ay += (dy / d) * f;
                        }
                    }
                    p.vx = (p.vx + ax) * 0.82;
                    p.vy = (p.vy + ay) * 0.82;
                    p.x += p.vx;
                    p.y += p.vy;
                    const speed = Math.min(Math.abs(p.vx) + Math.abs(p.vy), 6);
                    ctx.fillStyle = p.accent || speed > 2.2 ? `rgba(${ACCENT}, 0.95)` : `rgba(${WHITE}, ${0.55 + speed * 0.07})`;
                    ctx.fillRect(p.x, p.y, 2, 2);
                }
            }
        };
    };

    /* ---------- EFFECT: CROSSHAIR GRID ---------- */

    const crosshair = (ctx, s) => {
        const gap = 30;
        const targets = [];
        let nextTarget = 0;
        const smooth = { x: -9999, y: -9999 };

        return {
            draw(t) {
                const { w, h, pointer } = s;
                ctx.clearRect(0, 0, w, h);
                if (pointer.active) {
                    smooth.x += (pointer.x - smooth.x) * (smooth.x < -9000 ? 1 : 0.15);
                    smooth.y += (pointer.y - smooth.y) * (smooth.y < -9000 ? 1 : 0.15);
                } else {
                    smooth.x = w * (0.5 + Math.sin(t / 6000) * 0.35);
                    smooth.y = h * (0.5 + Math.cos(t / 4500) * 0.3);
                }
                const R = 200;
                for (let y = gap; y < h; y += gap) {
                    for (let x = gap; x < w; x += gap) {
                        const d = Math.hypot(x - smooth.x, y - smooth.y);
                        const near = Math.max(0, 1 - d / R);
                        const a = 0.07 + near * 0.55;
                        const len = 2.5 + near * 3;
                        ctx.strokeStyle = near > 0.05 ? `rgba(${ACCENT}, ${a})` : `rgba(${WHITE}, ${a})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(x - len, y); ctx.lineTo(x + len, y);
                        ctx.moveTo(x, y - len); ctx.lineTo(x, y + len);
                        ctx.stroke();
                    }
                }

                // Випадкові «захоплення цілі» на вузлах сітки
                if (t > nextTarget) {
                    nextTarget = t + 1400 + Math.random() * 1600;
                    targets.push({
                        x: gap * (1 + Math.floor(Math.random() * (w / gap - 2))),
                        y: gap * (1 + Math.floor(Math.random() * (h / gap - 2))),
                        born: t
                    });
                }
                for (let i = targets.length - 1; i >= 0; i--) {
                    const tg = targets[i];
                    const age = (t - tg.born) / 2600;
                    if (age > 1) { targets.splice(i, 1); continue; }
                    const close = Math.min(age * 3, 1);
                    const alpha = age < 0.7 ? 0.8 : (1 - age) / 0.3 * 0.8;
                    const r = 30 - close * 16;
                    ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
                        const cx = tg.x + sx * r, cy = tg.y + sy * r;
                        ctx.moveTo(cx, cy + sy * -8); ctx.lineTo(cx, cy); ctx.lineTo(cx - sx * 8, cy);
                    });
                    ctx.stroke();
                    ctx.fillStyle = `rgba(${ACCENT}, ${alpha})`;
                    ctx.font = '10px "Inter Tight", sans-serif';
                    ctx.fillText(`${String(Math.round(tg.x)).padStart(4, '0')}:${String(Math.round(tg.y)).padStart(4, '0')}`, tg.x + r + 6, tg.y - r + 8);
                }
            }
        };
    };

    /* ---------- PARALLAX ---------- */

    function initParallax() {
        const els = [...document.querySelectorAll('[data-parallax]')];
        if (reduced || !els.length) return;
        let ticking = false;
        const update = () => {
            ticking = false;
            const vh = window.innerHeight;
            els.forEach((el) => {
                const r = el.parentElement.getBoundingClientRect();
                if (r.bottom < 0 || r.top > vh) return;
                const progress = (r.top + r.height / 2 - vh / 2) / vh;
                el.style.setProperty('--parallax', `${(progress * Number(el.dataset.parallax) * 100).toFixed(1)}px`);
            });
        };
        window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
        update();
    }

    /* ---------- BOOT ---------- */

    const effects = { reticle, topo, particles, crosshair };
    const fpsFor = { topo: 24, crosshair: 40 };
    document.querySelectorAll('canvas[data-fx]').forEach((canvas) => {
        const name = canvas.dataset.fx;
        if (effects[name]) mountCanvas(canvas, effects[name], fpsFor[name] || 60);
    });
    initReveal();
    initCounters();
    initParallax();
})();
