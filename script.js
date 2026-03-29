/* ============================================
   OCEAN DEPTHS — script.js
   GSAP + ScrollTrigger + Custom Interactions
   ============================================ */

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/* ============================================
   PARTICLE CANVAS — Bubbles & Particles
   ============================================ */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.r = Math.random() * 3 + 1;
        this.speed = Math.random() * 0.6 + 0.2;
        this.drift = (Math.random() - 0.5) * 0.4;
        this.alpha = Math.random() * 0.5 + 0.1;
        this.hue = Math.random() > 0.5 ? '180,216' : '0,245,212';
    }
    update() {
        this.y -= this.speed;
        this.x += this.drift;
        this.alpha = Math.max(0, this.alpha - 0.0005);
        if (this.y < -20 || this.alpha <= 0) this.reset();
    }
    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${this.hue},${this.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }
}

for (let i = 0; i < 80; i++) {
    const p = new Particle();
    p.y = Math.random() * canvas.height; // start spread out
    particles.push(p);
}

function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateCanvas);
}
animateCanvas();

/* ============================================
   LOADER
   ============================================ */
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.classList.add('hidden');
        // show depth meter
        setTimeout(() => {
            document.getElementById('depth-meter').classList.add('visible');
            // animate hero stats counter
            animateCounters();
        }, 700);
    }, 2200);
});

/* ============================================
   NAVBAR — scroll + mobile toggle
   ============================================ */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const mobileNav = document.getElementById('mobile-nav');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    updateDepthMeter();
    updateActiveNav();
});

navToggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
});

document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    });
});

function updateActiveNav() {
    const sections = ['surface', 'sunlight', 'twilight', 'midnight', 'abyss', 'surface-return'];
    const scrollY = window.scrollY + window.innerHeight / 2;
    sections.forEach(id => {
        const el = document.getElementById(id);
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (!el || !link) return;
        const top = el.offsetTop, bot = top + el.offsetHeight;
        link.classList.toggle('active', scrollY >= top && scrollY < bot);
    });
}

/* ============================================
   DEPTH METER
   ============================================ */
const depthZones = [
    { id: 'surface', depth: 0, label: 'Surface', pct: 0 },
    { id: 'sunlight', depth: 200, label: 'Sunlight Zone', pct: 16 },
    { id: 'twilight', depth: 1000, label: 'Twilight Zone', pct: 35 },
    { id: 'midnight', depth: 4000, label: 'Midnight Zone', pct: 62 },
    { id: 'abyss', depth: 11034, label: 'Abyss', pct: 85 },
    { id: 'surface-return', depth: 0, label: 'Surfacing', pct: 100 },
];

function updateDepthMeter() {
    const scrollY = window.scrollY;
    const docH = document.body.scrollHeight - window.innerHeight;
    const progress = Math.min(scrollY / docH, 1);

    // Interpolate depth
    const totalDepth = 11034;
    let depth = 0;
    if (progress < 0.83) {
        depth = Math.round(progress * (1 / 0.83) * totalDepth);
    } else {
        depth = Math.round((1 - progress) / 0.17 * totalDepth);
    }
    depth = Math.max(0, Math.min(totalDepth, depth));

    document.getElementById('depth-value').textContent = depth.toLocaleString();

    // dot position
    const linePct = Math.min(progress * 120, 100);
    document.querySelector('.depth-line').style.height = linePct + '%';
    document.querySelector('.depth-dot').style.top = linePct + '%';

    // Zone label
    let label = 'Surface';
    depthZones.forEach(z => {
        if (progress * 100 >= z.pct) label = z.label;
    });
    document.getElementById('zone-label').textContent = label;
}

/* ============================================
   HERO STAT COUNTERS
   ============================================ */
function animateCounters() {
    document.querySelectorAll('.stat-num').forEach(el => {
        const target = +el.dataset.count;
        const obj = { val: 0 };
        gsap.to(obj, {
            val: target, duration: 2.2, delay: 0.5, ease: 'power2.out',
            onUpdate() { el.textContent = Math.round(obj.val); }
        });
    });
}

/* ============================================
   DIVE BUTTON
   ============================================ */
document.getElementById('dive-btn').addEventListener('click', () => {
    gsap.to(window, { duration: 1.2, scrollTo: { y: '#sunlight', offsetY: 80 }, ease: 'power3.inOut' });
});

/* ============================================
   GSAP SCROLL ANIMATIONS — Reveal Elements
   ============================================ */
function initRevealAnimations() {
    // Generic reveal-up
    gsap.utils.toArray('.reveal-up').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 60 },
            {
                opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
            }
        );
    });

    // Reveal left
    gsap.utils.toArray('.reveal-left').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, x: -80 },
            {
                opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' }
            }
        );
    });

    // Reveal right
    gsap.utils.toArray('.reveal-right').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, x: 80 },
            {
                opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' }
            }
        );
    });

    // Staggered creature cards
    gsap.utils.toArray('.creature-card').forEach((card, i) => {
        gsap.fromTo(card,
            { opacity: 0, y: 50, scale: 0.95 },
            {
                opacity: 1, y: 0, scale: 1, duration: 0.7, delay: i * 0.12, ease: 'back.out(1.4)',
                scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' }
            }
        );
    });

    // Impact cards stagger
    gsap.utils.toArray('.impact-card').forEach((card, i) => {
        gsap.fromTo(card,
            { opacity: 0, y: 40 },
            {
                opacity: 1, y: 0, duration: 0.7, delay: i * 0.15, ease: 'power3.out',
                scrollTrigger: {
                    trigger: card, start: 'top 88%', toggleActions: 'play none none reverse',
                    onEnter() {
                        card.querySelectorAll('.impact-bar-fill').forEach(bar => bar.classList.add('animated'));
                    }
                }
            }
        );
    });
}

/* ============================================
   PARALLAX EFFECTS (Scroll-based)
   ============================================ */
function initParallax() {
    // Hero surface light parallax
    gsap.to('.surface-light', {
        y: -100,
        ease: 'none',
        scrollTrigger: { trigger: '#surface', start: 'top top', end: 'bottom top', scrub: 1 }
    });

    // Sun rays parallax
    gsap.to('.sunlight-rays', {
        y: 80,
        ease: 'none',
        scrollTrigger: { trigger: '#sunlight', start: 'top bottom', end: 'bottom top', scrub: 0.5 }
    });

    // Coral bed parallax (moves slower = depth effect)
    gsap.to('.coral-bed', {
        y: -60,
        ease: 'none',
        scrollTrigger: { trigger: '#sunlight', start: 'top bottom', end: 'bottom top', scrub: 1 }
    });

    // Sea creatures horizontal drift
    gsap.to('.fish-1', {
        x: 40, y: -30,
        ease: 'none',
        scrollTrigger: { trigger: '#surface', start: 'top top', end: 'bottom top', scrub: 1 }
    });
    gsap.to('.fish-2', {
        x: -40, y: -50,
        ease: 'none',
        scrollTrigger: { trigger: '#surface', start: 'top top', end: 'bottom top', scrub: 1.5 }
    });

    // Trench shape reveal
    gsap.fromTo('#trench-shape',
        { scaleY: 0, transformOrigin: 'bottom' },
        {
            scaleY: 1, duration: 1, ease: 'power2.out',
            scrollTrigger: { trigger: '#abyss', start: 'top 70%' }
        }
    );
}

/* ============================================
   SECTION-SPECIFIC SCROLL TRIGGERS
   ============================================ */
function initSectionTriggers() {

    // Sunlight zone effects on enter
    ScrollTrigger.create({
        trigger: '#sunlight',
        start: 'top 60%',
        onEnter() {
            document.querySelectorAll('.fact-bar-fill').forEach(bar => bar.classList.add('animated'));
            document.querySelector('.sunlight-rays').classList.add('active');
        },
        onLeave() { document.querySelector('.sunlight-rays').classList.remove('active'); },
        onEnterBack() { document.querySelector('.sunlight-rays').classList.add('active'); },
        onLeaveBack() { document.querySelector('.sunlight-rays').classList.remove('active'); }
    });

    // Twilight depth bar animate
    ScrollTrigger.create({
        trigger: '#twilight',
        start: 'top 60%',
        onEnter() { document.querySelector('.dd-bar').classList.add('animated'); }
    });

    // Midnight pressure arc
    ScrollTrigger.create({
        trigger: '#midnight',
        start: 'top 70%',
        onEnter() { animatePressureArc(); }
    });

    // Return section bars
    ScrollTrigger.create({
        trigger: '#surface-return',
        start: 'top 70%',
        onEnter() {
            document.querySelectorAll('.impact-bar-fill').forEach(bar => bar.classList.add('animated'));
        }
    });

    // Midnight background section darkens canvas particles
    ScrollTrigger.create({
        trigger: '#midnight',
        start: 'top center',
        end: 'bottom center',
        onEnter() { canvas.style.opacity = 0.9; },
        onLeave() { canvas.style.opacity = 0.5; },
        onEnterBack() { canvas.style.opacity = 0.9; },
        onLeaveBack() { canvas.style.opacity = 0.5; }
    });
}

/* ============================================
   PRESSURE ARC ANIMATION
   ============================================ */
function animatePressureArc() {
    const arc = document.getElementById('pressure-arc');
    const counter = document.getElementById('pressure-counter');
    const total = 565;
    let val = 0;

    gsap.to({ v: 0 }, {
        v: 1,
        duration: 2,
        ease: 'power2.out',
        onUpdate() {
            const progress = this.targets()[0].v;
            arc.style.strokeDashoffset = total - total * progress;
            counter.textContent = Math.round(progress * 400);
        }
    });
}

/* ============================================
   MIDNIGHT PARTICLES
   ============================================ */
function createMidnightParticles() {
    const container = document.getElementById('midnight-particles');
    for (let i = 0; i < 60; i++) {
        const dot = document.createElement('div');
        dot.className = 'midnight-particle';
        const size = Math.random() * 4 + 1;
        const left = Math.random() * 100;
        const delay = Math.random() * 8;
        const dur = Math.random() * 8 + 5;
        const r = Math.random();
        const color = r > 0.66 ? '#00f5d4' : r > 0.33 ? '#90e0ef' : '#7b2fff';
        dot.style.cssText = `
      width:${size}px; height:${size}px;
      left:${left}%; background:${color};
      animation-duration:${dur}s; animation-delay:${delay}s;
      box-shadow: 0 0 ${size * 3}px ${color};
    `;
        container.appendChild(dot);
    }
}

/* ============================================
   RETURN SECTION BUBBLES
   ============================================ */
function createReturnBubbles() {
    const container = document.getElementById('return-bubbles');
    for (let i = 0; i < 20; i++) {
        const b = document.createElement('div');
        b.className = 'r-bubble';
        const size = Math.random() * 30 + 10;
        const left = Math.random() * 100;
        const delay = Math.random() * 6;
        const dur = Math.random() * 6 + 4;
        b.style.cssText = `
      width:${size}px; height:${size}px;
      left:${left}%; animation-duration:${dur}s; animation-delay:${delay}s;
    `;
        container.appendChild(b);
    }
}

/* ============================================
   CREATURE CARDS — click to expand
   ============================================ */
function initCreatureCards() {
    document.querySelectorAll('.creature-card').forEach(card => {
        card.addEventListener('click', () => {
            const text = card.querySelector('.card-text');
            text.style.maxHeight = text.style.maxHeight ? '' : '200px';
        });
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
        });
    });
}

/* ============================================
   ADAPTATION ACCORDIONS
   ============================================ */
function initAdaptations() {
    document.querySelectorAll('.adaptation-item').forEach(item => {
        item.addEventListener('click', () => {
            const expanded = item.getAttribute('aria-expanded') === 'true';
            document.querySelectorAll('.adaptation-item').forEach(i => i.setAttribute('aria-expanded', 'false'));
            item.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        });
        item.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
        });
    });
}

/* ============================================
   TWILIGHT CREATURE CAROUSEL
   ============================================ */
function initTwilightCarousel() {
    const creatures = document.querySelectorAll('.tc-creature');
    const buttons = document.querySelectorAll('.tc-btn');
    let current = 0;

    function show(idx) {
        creatures.forEach(c => c.classList.remove('active'));
        buttons.forEach(b => b.classList.remove('active'));
        creatures[idx].classList.add('active');
        buttons[idx].classList.add('active');
        current = idx;
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => show(+btn.dataset.target));
    });

    // Auto-rotate
    setInterval(() => show((current + 1) % creatures.length), 4000);
}

/* ============================================
   BIOLUMINESCENCE TOGGLE
   ============================================ */
function initBioToggle() {
    const toggle = document.getElementById('bio-switch');
    const display = document.getElementById('bio-display');

    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            display.classList.add('active');
            display.querySelectorAll('.bio-orb').forEach(o => o.classList.add('active'));
        } else {
            display.classList.remove('active');
            display.querySelectorAll('.bio-orb').forEach(o => o.classList.remove('active'));
        }
    });
}

/* ============================================
   CREATURE SLIDER (Midnight Zone)
   ============================================ */
function initSlider() {
    const track = document.getElementById('slider-track');
    const dots = document.querySelectorAll('.dot');
    const prev = document.getElementById('prev-btn');
    const next = document.getElementById('next-btn');
    const slides = document.querySelectorAll('.slide');
    let current = 0;

    function goTo(idx) {
        current = (idx + slides.length) % slides.length;
        gsap.to(track, { x: -current * 100 + '%', duration: 0.5, ease: 'power3.out' });
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === current);
            d.setAttribute('aria-selected', i === current);
        });
    }

    prev.addEventListener('click', () => goTo(current - 1));
    next.addEventListener('click', () => goTo(current + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    // Keyboard nav
    document.getElementById('slider-viewport').addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
    });

    // Auto advance
    let autoTimer = setInterval(() => goTo(current + 1), 4500);
    [prev, next, ...dots].forEach(el => {
        el.addEventListener('click', () => {
            clearInterval(autoTimer);
            autoTimer = setInterval(() => goTo(current + 1), 4500);
        });
    });

    // Touch / swipe
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    });
}

/* ============================================
   VENT CARD INTERACTION
   ============================================ */
function initVentCard() {
    const vc = document.querySelector('.vent-card');
    vc.addEventListener('click', () => {
        gsap.to(vc, { scale: 1.03, duration: 0.2, yoyo: true, repeat: 1 });
    });
    vc.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); vc.click(); }
    });
}

/* ============================================
   QUIZ (Abyss section)
   ============================================ */
const quizData = [
    {
        q: 'What percentage of the ocean has been explored by humans?',
        opts: ['About 50%', 'About 30%', 'Less than 5%', 'About 80%'],
        correct: 2,
        fact: 'Despite covering 71% of Earth, less than 5% of the ocean has been explored. The deep sea remains one of Earth\'s greatest frontiers.'
    },
    {
        q: 'How deep is the Mariana Trench — the deepest point on Earth?',
        opts: ['7,200 meters', '9,500 meters', '11,034 meters', '13,000 meters'],
        correct: 2,
        fact: 'Challenger Deep in the Mariana Trench reaches 11,034 meters — deeper than Mount Everest is tall.'
    },
    {
        q: 'What percentage of deep sea creatures produce bioluminescence?',
        opts: ['About 10%', 'About 40%', 'About 76%', 'Nearly 100%'],
        correct: 2,
        fact: 'An estimated 76% of deep sea animals can produce their own light, making the dark ocean a spectacular light show.'
    },
    {
        q: 'How much of Earth\'s oxygen is produced by ocean phytoplankton?',
        opts: ['20%', '35%', '50%', '70%'],
        correct: 2,
        fact: 'The ocean produces about 50% of Earth\'s oxygen — more than all the world\'s rainforests combined.'
    }
];

let qIndex = 0;

function loadQuestion(index) {
    const data = quizData[index];
    const qEl = document.getElementById('quiz-question');
    const optsEl = document.getElementById('quiz-options');
    const feedback = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('quiz-next');

    qEl.textContent = data.q;
    feedback.textContent = '';
    nextBtn.style.display = 'none';
    optsEl.innerHTML = '';

    data.opts.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt';
        btn.textContent = opt;
        btn.addEventListener('click', () => {
            optsEl.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
            if (i === data.correct) {
                btn.classList.add('correct');
                feedback.style.color = '#00f5d4';
                feedback.textContent = '✅ Correct! ' + data.fact;
            } else {
                btn.classList.add('wrong');
                optsEl.querySelectorAll('.quiz-opt')[data.correct].classList.add('correct');
                feedback.style.color = '#ff8080';
                feedback.textContent = '❌ Not quite. ' + data.fact;
            }
            if (index < quizData.length - 1) {
                nextBtn.style.display = 'inline-flex';
            } else {
                nextBtn.innerHTML = `
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                  Restart Quiz
                `;
                nextBtn.style.display = 'inline-flex';
                nextBtn.dataset.restart = 'true';
            }
        });
        optsEl.appendChild(btn);
    });
}

function initQuiz() {
    loadQuestion(0);
    document.getElementById('quiz-next').addEventListener('click', function () {
        if (this.dataset.restart) {
            qIndex = 0;
            this.textContent = 'Next Question ›';
            delete this.dataset.restart;
            loadQuestion(0);
            return;
        }
        qIndex = Math.min(qIndex + 1, quizData.length - 1);
        loadQuestion(qIndex);
    });
}

/* ============================================
   GSAP SECTION ENTRANCE ANIMATIONS
   ============================================ */
function initSectionAnims() {
    // NOTE: Hero title lines are animated by CSS fadeSlideUp — no GSAP needed here.

    // Sunlight zone: rays shimmer on enter
    ScrollTrigger.create({
        trigger: '#sunlight',
        start: 'top 80%',
        onEnter() {
            gsap.fromTo('.ray', { opacity: 0, scaleX: 0 }, {
                opacity: 0.5, scaleX: 1, stagger: 0.1, duration: 1.2, ease: 'power2.out'
            });
        }
    });

    // Twilight zone title glitch effect
    ScrollTrigger.create({
        trigger: '#twilight',
        start: 'top 70%',
        onEnter() {
            gsap.fromTo('.section-twilight .zone-title', { skewX: 5 }, {
                skewX: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)'
            });
        }
    });

    // Abyss: trench depth line draws down
    ScrollTrigger.create({
        trigger: '#abyss',
        start: 'top 60%',
        onEnter() {
            gsap.fromTo('.trench-line', { scaleY: 0, transformOrigin: 'top' }, {
                scaleY: 1, duration: 1.5, ease: 'power3.out'
            });
            gsap.fromTo('.trench-marker', { opacity: 0, x: -20 }, {
                opacity: 1, x: 0, stagger: 0.25, duration: 0.6, ease: 'power2.out', delay: 0.5
            });
            // animate comparison bars
            gsap.fromTo('.compare-bar.everest', { scaleY: 0, transformOrigin: 'bottom' }, { scaleY: 1, duration: 1, ease: 'power2.out', delay: 0.8 });
            gsap.fromTo('.compare-bar.challenger', { scaleY: 0, transformOrigin: 'bottom' }, { scaleY: 1, duration: 1.2, ease: 'power2.out', delay: 1 });
        }
    });

    // Return section — bubbles fly up
    ScrollTrigger.create({
        trigger: '#surface-return',
        start: 'top 80%',
        onEnter() {
            gsap.fromTo('.return-content h2', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
        }
    });
}

/* ============================================
   PREFERS-REDUCED-MOTION — accessibility
   ============================================ */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
    // Kill all inline CSS animations and disable GSAP ticker
    document.documentElement.style.setProperty('--ease-out', 'linear');
    document.documentElement.style.setProperty('--ease-in-out', 'linear');
    gsap.globalTimeline.timeScale(10); // speed through all animations instantly
}

/* ============================================
   CURSOR GLOW EFFECT
   ============================================ */
function initCursorGlow() {
    const glow = document.createElement('div');
    glow.style.cssText = `
    position:fixed; pointer-events:none; z-index:9998;
    width:300px; height:300px; border-radius:50%;
    background:radial-gradient(circle, rgba(0,180,216,0.06) 0%, transparent 70%);
    transform:translate(-50%,-50%); transition:opacity 0.3s ease;
    top:0; left:0;
  `;
    document.body.appendChild(glow);
    document.addEventListener('mousemove', e => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
}

/* ============================================
   SMOOTH HOVER — Interactive Element Ripple
   ============================================ */
function initRipple() {
    document.querySelectorAll('.btn-dive, .btn-primary, .quiz-opt, .creature-card').forEach(el => {
        el.addEventListener('click', function (e) {
            const rect = el.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.style.cssText = `
        position:absolute; border-radius:50%; background:rgba(255,255,255,0.2);
        pointer-events:none; transform:scale(0);
        width:80px; height:80px; z-index:10;
        left:${e.clientX - rect.left - 40}px;
        top:${e.clientY - rect.top - 40}px;
        animation: ripple 0.6s ease-out forwards;
      `;
            if (!document.querySelector('#ripple-style')) {
                const s = document.createElement('style');
                s.id = 'ripple-style';
                s.textContent = '@keyframes ripple{to{transform:scale(4);opacity:0}}';
                document.head.appendChild(s);
            }
            el.style.position = el.style.position || 'relative';
            el.style.overflow = 'hidden';
            el.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

/* ============================================
   INIT ALL
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    createMidnightParticles();
    createReturnBubbles();
    initCreatureCards();
    initAdaptations();
    initTwilightCarousel();
    initBioToggle();
    initSlider();
    initVentCard();
    initQuiz();
    initCursorGlow();
    initRipple();

    // Delay GSAP inits until after loader
    setTimeout(() => {
        initRevealAnimations();
        initParallax();
        initSectionTriggers();
        initSectionAnims();
        initScrollBg();
        init3DTilt();
        ScrollTrigger.refresh();
    }, 2400);

    initAudio();
    initCertificate();
});

/* ============================================
   BONUS 1: SCROLL-DRIVEN BACKGROUND
   Smoothly blends page bg color by depth
   ============================================ */
function initScrollBg() {
    const bg = document.getElementById('scroll-bg');
    // colour stops keyed to scroll progress 0→1
    const stops = [
        { p: 0.00, r: 0, g: 21, b: 41 },  // surface  #001529
        { p: 0.16, r: 0, g: 119, b: 182 },  // sunlight (darker for contrast)
        { p: 0.33, r: 2, g: 62, b: 138 },  // twilight #023e8a
        { p: 0.55, r: 3, g: 4, b: 94 },  // midnight #03045e
        { p: 0.80, r: 0, g: 8, b: 20 },  // abyss    #000814
        { p: 1.00, r: 0, g: 21, b: 41 },  // return   #001529
    ];

    function lerp(a, b, t) { return a + (b - a) * t; }

    function getColor(progress) {
        let lo = stops[0], hi = stops[stops.length - 1];
        for (let i = 0; i < stops.length - 1; i++) {
            if (progress >= stops[i].p && progress <= stops[i + 1].p) {
                lo = stops[i]; hi = stops[i + 1]; break;
            }
        }
        const t = (progress - lo.p) / (hi.p - lo.p || 1);
        return {
            r: Math.round(lerp(lo.r, hi.r, t)),
            g: Math.round(lerp(lo.g, hi.g, t)),
            b: Math.round(lerp(lo.b, hi.b, t)),
        };
    }

    ScrollTrigger.create({
        start: 0, end: 'max', scrub: true,
        onUpdate(self) {
            const { r, g, b } = getColor(self.progress);
            bg.style.background = `rgb(${r},${g},${b})`;
        }
    });
}

/* ============================================
   BONUS 2: 3D MOUSE-TILT ON CREATURE CARDS
   ============================================ */
function init3DTilt() {
    document.querySelectorAll('.creature-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width / 2);
            const dy = (e.clientY - cy) / (rect.height / 2);
            const rotX = -dy * 12;   // max 12deg tilt
            const rotY = dx * 12;
            gsap.to(card, {
                rotationX: rotX, rotationY: rotY,
                transformPerspective: 900,
                duration: 0.3, ease: 'power2.out',
                overwrite: 'auto'
            });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotationX: 0, rotationY: 0,
                duration: 0.6, ease: 'elastic.out(1, 0.5)',
                overwrite: 'auto'
            });
        });
    });
}

/* ============================================
   BONUS 3: WEB AUDIO — PROCEDURAL OCEAN AMBIANCE
   No external files needed — pure synthesis
   ============================================ */
function initAudio() {
    const btn = document.getElementById('audio-btn');
    const dot = document.getElementById('audio-dot');
    let audioCtx = null;
    let playing = false;
    let nodes = [];

    function buildOcean(ctx) {
        const out = ctx.destination;
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.10;
        masterGain.connect(out);

        // Low rumble
        const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buf; noise.loop = true;
        const loFilter = ctx.createBiquadFilter();
        loFilter.type = 'lowpass'; loFilter.frequency.value = 180;
        noise.connect(loFilter); loFilter.connect(masterGain);
        noise.start();

        // Gentle wave swells (LFO on gain)
        const waveGain = ctx.createGain();
        waveGain.gain.value = 0;
        const lfo = ctx.createOscillator();
        lfo.type = 'sine'; lfo.frequency.value = 0.12;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.2;
        lfo.connect(lfoGain); lfoGain.connect(waveGain.gain);

        const buf2 = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
        const data2 = buf2.getChannelData(0);
        for (let i = 0; i < data2.length; i++) data2[i] = Math.random() * 2 - 1;
        const noise2 = ctx.createBufferSource();
        noise2.buffer = buf2; noise2.loop = true;
        const hiFilter = ctx.createBiquadFilter();
        hiFilter.type = 'bandpass'; hiFilter.frequency.value = 900; hiFilter.Q.value = 0.5;
        noise2.connect(hiFilter); hiFilter.connect(waveGain); waveGain.connect(masterGain);
        lfo.start(); noise2.start();

        return [noise, noise2, lfo];
    }

    btn.addEventListener('click', () => {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (playing) {
            // Fade out
            nodes.forEach(n => { try { n.stop(audioCtx.currentTime + 0.5); } catch (e) { } });
            nodes = []; playing = false;
            dot.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        } else {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            nodes = buildOcean(audioCtx);
            playing = true;
            dot.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        }
    });
}

/* ============================================
   BONUS 4: DIVE CERTIFICATE MODAL
   ============================================ */
function initCertificate() {
    const modal = document.getElementById('cert-modal');
    const openBtn = document.getElementById('certificate-btn');
    const closeBtn = document.getElementById('cert-close');
    const backdrop = modal.querySelector('.cert-backdrop');
    const dateEl = document.getElementById('cert-date');
    const printBtn = document.getElementById('cert-print');

    // Set date
    const now = new Date();
    dateEl.textContent = 'Issued: ' + now.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    function openModal() {
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        setTimeout(() => document.getElementById('cert-name').focus(), 100);
    }
    function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = '';
        openBtn.focus();
    }

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    // Trap focus inside modal
    modal.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'Tab') {
            const focusable = [...modal.querySelectorAll('button, input, [tabindex]')];
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });

    printBtn.addEventListener('click', () => {
        const nameVal = document.getElementById('cert-name').value.trim();
        if (!nameVal) {
            document.getElementById('cert-name').focus();
            gsap.fromTo('#cert-name', { x: -8 }, {
                x: 0, duration: 0.4, ease: 'elastic.out(1,0.3)', clearProps: 'x',
                onStart() { document.getElementById('cert-name').style.borderColor = 'rgba(255,100,100,0.6)'; },
                onComplete() { document.getElementById('cert-name').style.borderColor = 'rgba(0,245,212,0.3)'; }
            });
            return;
        }
        window.print();
    });
}

/* ============================================
   KRAKEN EASTER EGG LOGIC
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    const eye = document.getElementById('kraken-eye');
    let clickCount = 0;

    if (eye) {
        eye.addEventListener('click', () => {
            clickCount++;
            if (clickCount >= 3) {
                // Camera shake effect on body
                document.body.style.animation = 'cameraShake 0.5s ease-in-out infinite';

                // Add camera shake keyframes if not exists
                if (!document.querySelector('#shake-style')) {
                    const s = document.createElement('style');
                    s.id = 'shake-style';
                    s.textContent = '@keyframes cameraShake { 0% { transform: translate(0,0); } 25% { transform: translate(5px,-5px); } 50% { transform: translate(-5px,5px); } 75% { transform: translate(-5px,-5px); } 100% { transform: translate(0,0); } }';
                    document.head.appendChild(s);
                }

                setTimeout(() => {
                    document.body.style.animation = '';
                    clickCount = 0; // reset
                }, 3500);
            }
        });
    }
});

