gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// Configurar scroll suave con Lenis
const lenis = new Lenis({
    duration: 1.2, // Duración del suavizado
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Curva de easing
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Sincronizar Lenis con ScrollTrigger de GSAP
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Detener el scroll inicialmente para el splash screen
lenis.stop();

// Forzar scroll al inicio sin animación al cargar la página
window.scrollTo(0, 0);

window.addEventListener('load', () => {
    // Asegurarnos de que estamos arriba del todo
    window.scrollTo(0, 0);
    
    const splashScreen = document.getElementById('splash-screen');
    const progressBar = document.getElementById('splashProgressBar');
    const heroTitle = document.querySelector('.hero-title');
    
    if (splashScreen && progressBar) {
        // Simular progreso de carga
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15; // Incremento aleatorio
            if (progress > 100) progress = 100;
            
            progressBar.style.width = `${progress}%`;
            
            if (progress === 100) {
                clearInterval(progressInterval);
                
                // Pequeño retraso después de llegar al 100% antes de abrir
                setTimeout(() => {
                    splashScreen.classList.add('loaded');
                    
                    // Iniciar la animación de escritura del título justo cuando empieza a abrirse el splash screen
                    if (heroTitle) {
                        heroTitle.classList.add('start-typing');
                    }
                    
                    // Permitir scroll después de que termine la animación (1.2s)
                    setTimeout(() => {
                        lenis.start();
                        document.body.classList.remove('no-scroll');
                        splashScreen.classList.add('hidden');
                    }, 1200);
                }, 400);
            }
        }, 100); // Actualizar cada 100ms
        
    } else {
        lenis.start();
        document.body.classList.remove('no-scroll');
        if (heroTitle) {
            heroTitle.classList.add('start-typing');
        }
    }
});

const laptop = document.getElementById("laptop");
const laptopLid = document.getElementById("laptopLid");
const screenWrap = document.getElementById("screenWrap");
const screen = document.getElementById("screen");
const laptopBase = document.getElementById("laptopBase");
const scrollHint = document.querySelector(".scroll-hint");
const heroTitleWrapper = document.getElementById("heroTitleWrapper");

const debounce = (fn, delay = 120) => {
    let timer;
    return (...args) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => fn(...args), delay);
    };
};

const setupHeroAnimation = () => {
    // Initial Closed State (Image 1)
    gsap.set(laptop, {
        rotateX: 60, // Tilted back so we see the top (logo)
        rotateY: 0,
        rotateZ: 0,
        scale: 0.8,
        y: 180, // Bajado un poco más por debajo del centro
        transformOrigin: "center center"
    });
    gsap.set(laptopLid, { rotateX: 0 }); // Closed flat on base
    gsap.set(laptopBase, { autoAlpha: 1 });
    gsap.set(screenWrap, { borderRadius: "20px", padding: "6px" });

    const timeline = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom bottom", // End when the bottom of .hero reaches the bottom of the viewport
            scrub: 0.5
        },
        onUpdate: function() {
            if (this.time() >= 2.7) {
                laptop.classList.add('expanded');
            } else {
                laptop.classList.remove('expanded');
            }
        }
    });

    timeline
        // Hide scroll hint early
        .to(scrollHint, {
            autoAlpha: 0,
            duration: 0.5
        }, 0)
        // Hide title when scrolling down
        .to(heroTitleWrapper, {
            autoAlpha: 0,
            y: -50,
            duration: 0.8
        }, 0)
        // 1. Open the lid (Image 2)
        .to(laptopLid, {
            rotateX: 105, // Open past 90deg
            duration: 1
        }, 0)
        .to(laptop, {
            rotateX: 65, // Tilt base slightly more to see keyboard
            scale: 0.9,
            y: 140, // Mantiene la posición un poco más baja al abrirse
            duration: 1
        }, 0)

        // 2. Face the camera and expand to 100vw/100vh
        .to(laptop, {
            rotateX: 0, // Flatten the laptop base
            scale: 1, // Reset scale so width/height take full effect
            width: "100vw",
            height: "100vh",
            maxWidth: "100vw",
            maxHeight: "100vh",
            y: () => window.innerHeight, // Push base down so the flipped-up lid centers on screen
            duration: 1.5
        }, 1.2)
        .to(laptopLid, {
            rotateX: 180, // Open fully flat (180deg). Since lid-front is 180deg, total is 360deg (facing camera)
            duration: 1.5
        }, 1.2)

        // 3. Square off screen and hide everything else
        .to(screenWrap, {
            borderRadius: 0,
            padding: 0,
            duration: 0.5
        }, 2.2)
        .to(".laptop-screen", {
            borderRadius: 0,
            duration: 0.5
        }, 2.2)
        .to(laptopBase, {
            autoAlpha: 0,
            duration: 0.3
        }, 1.8)
        .to(".lid-back", {
            autoAlpha: 0,
            duration: 0.3
        }, 1.8)

        // 4. Loading sequence (after screen is fully open at 2.7s)
        // Hide button, show progress bar
        .to(".btn-entrar", {
            autoAlpha: 0,
            duration: 0.2
        }, 2.8)
        .to(".progress-bar-container", {
            autoAlpha: 1,
            duration: 0.2
        }, 2.8)
        .to(".progress-bar-fill", {
            width: "100%",
            duration: 1.2
        }, 2.8)

        // Hide progress bar, show tick (after some scroll distance)
        .to(".progress-bar-container", {
            autoAlpha: 0,
            duration: 0.2
        }, 4.0)
        .to(".tick", {
            autoAlpha: 1,
            duration: 0.2
        }, 4.0)

        // Hold the tick for a moment
        .to(".tick", {
            scale: 1.2,
            duration: 0.5
        }, 4.2)

        // Hide logo and tick
        .to(".login-container", {
            autoAlpha: 0,
            duration: 0.5
        }, 4.7)

        // Turn background black
        .to(".screen-wallpaper", {
            autoAlpha: 0,
            duration: 0.5
        }, 5.2)
        .to(".laptop-screen", {
            backgroundColor: "#000000",
            duration: 0.5
        }, 5.2);

    // Añadir evento click al portátil para hacer scroll hasta que el fondo esté full
    laptop.addEventListener('click', () => {
        if (laptop.classList.contains('expanded')) return; // No hacer nada si ya está expandido

        const st = timeline.scrollTrigger;
        if (st) {
            // El momento en el que el fondo está full y cuadrado es a los 2.7s
            // La duración total de la línea de tiempo es 5.7s
            const targetProgress = 2.7 / timeline.duration();
            const targetScroll = st.start + (st.end - st.start) * targetProgress;
            
            // Usar lenis para hacer scroll suave hasta esa posición
            lenis.scrollTo(targetScroll, {
                duration: 3.5, // Aumentado para que tarde más
                easing: (t) => {
                    // Easing easeOutQuart
                    return 1 - Math.pow(1 - t, 4);
                }
            });
        }
    });

    // Añadir evento click al botón "Entrar" para hacer scroll hasta la sección "Sobre mí"
    const btnEntrar = document.querySelector('.btn-entrar');
    if (btnEntrar) {
        btnEntrar.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que el click se propague al portátil
            
            // Hacer scroll hasta la sección "Sobre mí" (id="portfolio" o clase ".intro")
            lenis.scrollTo('.intro', {
                duration: 3.5,
                easing: (t) => {
                    // Easing easeOutQuart
                    return 1 - Math.pow(1 - t, 4);
                }
            });
        });
    }
};

setupHeroAnimation();

// --- Scrollbar Color Adaptation ---
// El fondo se vuelve negro al final de la animación del hero y vuelve a ser blanco en el footer
ScrollTrigger.create({
    trigger: ".hero",
    start: "73% top", // Se activa cuando el fondo del portátil se vuelve negro (aprox 91% del scroll del hero)
    endTrigger: ".page",
    end: "bottom bottom", // Se desactiva cuando el footer (fondo blanco) empieza a verse
    toggleClass: { targets: "html", className: "dark-scrollbar" }
});

const debouncedRefresh = debounce(() => ScrollTrigger.refresh(), 180);
window.addEventListener("resize", debouncedRefresh);

// Animación para el título "Sobre mí"
gsap.from(".intro .eyebrow", {
    x: -100,
    autoAlpha: 0,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: {
        trigger: ".intro",
        start: "top 80%", // Empieza a mostrarse cuando la sección entra en el viewport
        toggleActions: "play none none reverse"
    }
});

// Animación para el título "Lenguajes utilizados"
gsap.from(".languages-title", {
    x: 100,
    autoAlpha: 0,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: {
        trigger: ".languages",
        start: "top 80%", // Empieza a mostrarse cuando la sección entra en el viewport
        toggleActions: "play none none reverse"
    }
});

// Animación para el saludo "Buenas,"
gsap.from(".greeting", {
    y: 60,
    autoAlpha: 0,
    duration: 1,
    ease: "power2.out",
    scrollTrigger: {
        trigger: ".greeting",
        start: "top 100%", // Empieza a animarse en cuanto toca el borde inferior de la pantalla
        end: "top 50%",
        scrub: 1
    }
});

// Animación para los párrafos grandes (se revelan línea por línea con el scroll)
const introParagraphs = gsap.utils.toArray(".intro-p");
introParagraphs.forEach((p) => {
    // Dividimos el texto en líneas usando SplitType
    const splitText = new SplitType(p, { types: 'lines' });

    // Animamos cada línea individualmente
    gsap.from(splitText.lines, {
        y: 40,
        autoAlpha: 0,
        stagger: 0.1, // Retraso entre cada línea para el efecto cascada
        ease: "power2.out",
        scrollTrigger: {
            trigger: p,
            start: "top 100%", // Empieza a animarse en cuanto toca el borde inferior de la pantalla
            end: "top 40%",   // Termina la animación cuando llega al 40%
            scrub: 1          // Hace que la animación esté vinculada al scroll
        }
    });
});

// Animación para el título de lenguajes (aparece antes de pinear)
gsap.from(".languages-right .eyebrow, .languages-title", {
    y: 30,
    autoAlpha: 0,
    stagger: 0.2,
    duration: 1,
    ease: "power2.out",
    scrollTrigger: {
        trigger: ".block.languages",
        start: "top 70%"
    }
});

// Animación para los lenguajes de programación (Pinned)
const langCategories = gsap.utils.toArray(".lang-category");
const langItems = gsap.utils.toArray(".lang-item");

// Usar matchMedia para aplicar diferentes configuraciones según el tamaño de pantalla
let mm = gsap.matchMedia();

mm.add("(min-width: 768px)", () => {
    // En lugar de ocultar con set, usamos from() en la timeline para que GSAP maneje el estado inicial
    // Asegurarnos de que el contenedor izquierdo esté en su posición original
    gsap.set(".languages-left", { y: 0 });

    // Configuración para Desktop
    const langTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".block.languages",
            start: "center center", // Pinear cuando el centro de la sección llega al centro de la pantalla
            end: "+=3000", // Aumentado el tiempo de pin para dar cabida a las categorías
            pin: ".languages-layout",
            scrub: 1
        }
    });

    // Si la lista de lenguajes es más alta que la ventana, la desplazamos hacia arriba mientras hacemos scroll
    langTl.to(".languages-left", {
        y: () => {
            const leftEl = document.querySelector(".languages-left");
            if (!leftEl) return 0;
            const leftHeight = leftEl.offsetHeight;
            const windowHeight = window.innerHeight;
            // Si es más alto que el 80% de la ventana, lo subimos para que se vea todo
            return leftHeight > windowHeight * 0.8 ? -(leftHeight - windowHeight * 0.8) : 0;
        },
        ease: "none",
        duration: (langItems.length + langCategories.length) * 0.5
    }, 0);

    // Animar categorías y sus items
    let timeOffset = 0;
    langCategories.forEach((category) => {
        // Animar el título de la categoría desde oculto
        langTl.from(category, {
            autoAlpha: 0,
            y: 30,
            duration: 0.8,
            ease: "power2.out"
        }, timeOffset);

        timeOffset += 0.4;

        // Animar los items dentro de esta categoría desde oculto
        const itemsInCategory = category.querySelectorAll(".lang-item");
        itemsInCategory.forEach((item) => {
            langTl.from(item, {
                autoAlpha: 0,
                y: 50,
                duration: 1,
                ease: "power2.out"
            }, timeOffset);
            timeOffset += 0.5;
        });

        timeOffset += 0.2; // Pequeña pausa entre categorías
    });

    // Añadir un poco de espacio al final para que el último elemento se lea bien antes de soltar el pin
    langTl.to({}, { duration: 1 });

    return () => {
        langTl.kill();
    };
});

mm.add("(max-width: 767px)", () => {
    // En móvil, nos aseguramos de que estén visibles y en su posición original
    // para evitar problemas si el ScrollTrigger no se dispara correctamente
    gsap.set(langCategories, { autoAlpha: 1, y: 0 });
    gsap.set(langItems, { autoAlpha: 1, y: 0 });

    // Configuración para Móvil (sin pin, animación normal al hacer scroll)
    langCategories.forEach((category) => {
        gsap.from(category, {
            autoAlpha: 0,
            y: 30,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: category,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    });

    langItems.forEach((item) => {
        gsap.from(item, {
            autoAlpha: 0,
            y: 50,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: item,
                start: "top 85%", // Aparece cuando el elemento entra en el 85% de la pantalla
                toggleActions: "play none none reverse" // Se reproduce al entrar, se revierte al salir hacia arriba
            }
        });
    });

    // Return a cleanup function if needed, though simple to() tweens with scrollTriggers usually clean themselves up
    return () => {
        ScrollTrigger.getAll().forEach(st => {
            if (st.trigger && (st.trigger.classList.contains('lang-category') || st.trigger.classList.contains('lang-item'))) {
                st.kill();
            }
        });
    };
});

const revealCards = gsap.utils.toArray(".card");
revealCards.forEach((card) => {
    gsap.from(card, {
        y: 24,
        autoAlpha: 0,
        duration: 0.65,
        ease: "power2.out",
        scrollTrigger: {
            trigger: card,
            start: "top 88%"
        }
    });
});

// --- Scroll to Top Button ---
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

// Mostrar/ocultar el botón basado en el scroll
window.addEventListener("scroll", () => {
    if (window.scrollY > 300) { // Mostrar después de 300px de scroll
        scrollToTopBtn.classList.add("visible");
    } else {
        scrollToTopBtn.classList.remove("visible");
    }
});

// Hacer scroll hacia arriba suavemente al hacer clic
scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

// --- Timeline Animation ---
const setupTimelineAnimation = () => {
    const path = document.getElementById("timeline-path");
    const logo = document.getElementById("timeline-logo");
    const nodes = gsap.utils.toArray(".timeline-node");
    const svg = document.querySelector(".timeline-svg");

    if (!path || !logo || nodes.length === 0 || !svg) return;

    let mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
        // Desktop Setup
        svg.setAttribute("viewBox", "0 0 1000 1000");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        path.setAttribute("d", "M 750 100 L 750 310 Q 750 350 710 350 L 290 350 Q 250 350 250 390 L 250 760 Q 250 800 290 800 L 750 800");

        gsap.set(nodes[0], { left: "75%", top: "10%" });
        gsap.set(nodes[1], { left: "74%", top: "34%" });
        gsap.set(nodes[2], { left: "26%", top: "36%" });
        gsap.set(nodes[3], { left: "26%", top: "79%" });
        gsap.set(nodes[4], { left: "75%", top: "80%" });

        const pathLength = path.getTotalLength();
        gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
        gsap.set(logo, { opacity: 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".timeline-section",
                start: "top top",
                end: "+=2000",
                scrub: 1,
                pin: true,
                anticipatePin: 1
            }
        });

        tl.to(logo, { opacity: 1, duration: 0.05 });
        tl.to(path, { strokeDashoffset: 0, duration: 1, ease: "none" }, 0);
        tl.to(logo, {
            motionPath: { path: path, align: path, alignOrigin: [0.5, 0.5], autoRotate: false },
            duration: 1, ease: "none"
        }, 0);

        const nodeProgress = [0, 0.15, 0.45, 0.72, 1];
        nodes.forEach((node, index) => {
            gsap.set(node, { xPercent: -50, yPercent: -50, y: 20, opacity: 0 });
            tl.to(node, { opacity: 1, y: 0, duration: 0.05, ease: "power1.out" }, nodeProgress[index]);
        });

        return () => { tl.kill(); };
    });

    mm.add("(max-width: 768px)", () => {
        // Mobile Setup
        svg.setAttribute("viewBox", "0 0 100 1000");
        svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
        path.setAttribute("d", "M 50 100 L 50 900");

        gsap.set(nodes[0], { left: "50px", top: "10%" });
        gsap.set(nodes[1], { left: "50px", top: "30%" });
        gsap.set(nodes[2], { left: "50px", top: "50%" });
        gsap.set(nodes[3], { left: "50px", top: "70%" });
        gsap.set(nodes[4], { left: "50px", top: "90%" });

        const pathLength = path.getTotalLength();
        gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
        gsap.set(logo, { opacity: 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".timeline-section",
                start: "top top",
                end: "+=1500", // Slightly shorter scroll for mobile
                scrub: 1,
                pin: true,
                anticipatePin: 1
            }
        });

        tl.to(logo, { opacity: 1, duration: 0.05 });
        tl.to(path, { strokeDashoffset: 0, duration: 1, ease: "none" }, 0);
        tl.to(logo, {
            motionPath: { path: path, align: path, alignOrigin: [0.5, 0.5], autoRotate: false },
            duration: 1, ease: "none"
        }, 0);

        const nodeProgress = [0, 0.25, 0.5, 0.75, 1];
        nodes.forEach((node, index) => {
            gsap.set(node, { xPercent: -50, yPercent: -50, y: 20, opacity: 0 });
            tl.to(node, { opacity: 1, y: 0, duration: 0.05, ease: "power1.out" }, nodeProgress[index]);
        });

        return () => { tl.kill(); };
    });
};

// Call the setup function
setupTimelineAnimation();

// --- Projects Horizontal Scroll Animation ---
const setupProjectsGallery = () => {
    const track = document.querySelector(".projects-track");
    const gallery = document.querySelector(".projects-gallery");

    if (!track || !gallery) return;

    // Calculate the total scroll distance
    // It's the track width plus the viewport width to allow full entry and exit
    let getScrollAmount = () => {
        let trackWidth = track.scrollWidth;
        return trackWidth + window.innerWidth;
    };

    const tween = gsap.fromTo(track,
        { x: () => window.innerWidth },
        {
            x: () => -track.scrollWidth,
            ease: "none",
            id: "projectsTween"
        }
    );

    ScrollTrigger.create({
        trigger: gallery,
        start: "top top",
        end: () => `+=${getScrollAmount()}`,
        pin: true,
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true
    });

    // Background change logic
    const bgs = gsap.utils.toArray(".project-bg");
    const wrappers = gsap.utils.toArray(".project-wrapper");

    wrappers.forEach((wrapper, i) => {
        ScrollTrigger.create({
            trigger: wrapper,
            containerAnimation: tween,
            start: "left 65%", // Cuando el lado izquierdo del proyecto llega al 65% de la pantalla
            end: "right 35%",  // Cuando el lado derecho del proyecto llega al 35% de la pantalla
            onEnter: () => changeBg(i),
            onEnterBack: () => changeBg(i),
        });
    });

    // Trigger especial para cuando el último proyecto sale por la izquierda
    ScrollTrigger.create({
        trigger: wrappers[wrappers.length - 1],
        containerAnimation: tween,
        start: "right 35%", // Cuando el lado derecho del último proyecto pasa el 35% (saliendo)
        onEnter: () => changeBg(-1), // -1 para ocultar todos los fondos
        onLeaveBack: () => changeBg(wrappers.length - 1) // Volver a mostrar el último fondo si se hace scroll hacia arriba
    });

    function changeBg(index) {
        bgs.forEach((bg, i) => {
            gsap.to(bg, {
                opacity: i === index ? 1 : 0,
                duration: 0.8,
                ease: "power2.inOut",
                overwrite: "auto"
            });
        });
    }

    // Video hover logic
    const projectWrappers = document.querySelectorAll(".project-wrapper");
    projectWrappers.forEach(wrapper => {
        const video = wrapper.querySelector("video");
        if (video) {
            wrapper.addEventListener("mouseenter", () => {
                video.play().catch(e => console.log("Video play prevented:", e));
            });
            wrapper.addEventListener("mouseleave", () => {
                video.pause();
                video.currentTime = 0; // Opcional: reiniciar el video al quitar el ratón
            });
        }
    });
};

setupProjectsGallery();

// --- Ocultar Hero Stage en la sección de proyectos ---
// Lo ocultamos cuando el segundo proyecto (ZetaMovies) entra en pantalla
const projectWrappers = document.querySelectorAll(".project-wrapper");
if (projectWrappers.length > 1) {
    ScrollTrigger.create({
        trigger: projectWrappers[1], // El segundo proyecto (índice 1) es ZetaMovies
        containerAnimation: gsap.getById("projectsTween"), // Necesitamos referenciar el tween horizontal
        start: "left center", // Cuando el lado izquierdo de ZetaMovies llega al centro de la pantalla
        onEnter: () => {
            gsap.set(".hero-stage", { display: "none" });
        },
        onLeaveBack: () => {
            gsap.set(".hero-stage", { display: "grid" });
        }
    });
}

// --- Footer Parallax Landscape ---
function setupFooterParallax() {
    const layers = document.querySelectorAll('.parallax-layer');

    layers.forEach(layer => {
        const speed = parseFloat(layer.getAttribute('data-speed')) || 0;

        // Animamos las capas desde abajo hacia su posición original (0)
        // a medida que el footer se va revelando (cuando .page hace scroll hacia arriba)
        gsap.fromTo(layer,
            { y: `${120 * speed}vh` },
            {
                y: "0vh",
                ease: "none",
                scrollTrigger: {
                    trigger: ".page",
                    start: "bottom bottom", // Cuando el final de .page toca el final de la pantalla (empieza a verse el footer)
                    end: "bottom top",      // Cuando el final de .page toca el inicio de la pantalla (footer 100% visible)
                    scrub: true
                }
            }
        );
    });

    // Inicializar Vanta Birds en el cielo del footer
    if (typeof VANTA !== 'undefined') {
        VANTA.BIRDS({
            el: ".layer-sky",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            backgroundColor: 0x0,
            color1: 0x0,
            color2: 0xffffff,
            colorMode: "lerpGradient",
            birdSize: 0.90,
            wingSpan: 23.00,
            speedLimit: 3.00,
            separation: 88.00,
            alignment: 14.00,
            cohesion: 14.00,
            quantity: 4.00,
            backgroundAlpha: 0.00
        });
    }
}

setupFooterParallax();

// --- Navbar Smooth Scrolling ---
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
            if (targetId === '#inicio') {
                lenis.scrollTo(0, {
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            } else {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    lenis.scrollTo(targetElement, {
                        duration: 1.5,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                    });
                }
            }
        }
    });
});
