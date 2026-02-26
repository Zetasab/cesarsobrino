gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const laptop = document.getElementById("laptop");
const laptopLid = document.getElementById("laptopLid");
const screenWrap = document.getElementById("screenWrap");
const screen = document.getElementById("screen");
const laptopBase = document.getElementById("laptopBase");
const scrollHint = document.querySelector(".scroll-hint");

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
        }
    });

    timeline
        // Hide scroll hint early
        .to(scrollHint, {
            autoAlpha: 0,
            duration: 0.5
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
        // Hide button, show spinner
        .to(".btn-entrar", {
            autoAlpha: 0,
            duration: 0.2
        }, 2.8)
        .to(".spinner", {
            autoAlpha: 1,
            duration: 0.2
        }, 2.8)
        
        // Hide spinner, show tick (after some scroll distance)
        .to(".spinner", {
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
};

setupHeroAnimation();

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

const revealTimeline = gsap.timeline({
    defaults: { ease: "power2.out", duration: 0.8 },
    scrollTrigger: {
        trigger: ".projects",
        start: "top 75%"
    }
});

revealTimeline
    .from(".projects", { y: 45, autoAlpha: 0 })
    .from(".contact", { y: 45, autoAlpha: 0 }, "-=0.45");

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

// Ocultar inicialmente los lenguajes y categorías
gsap.set(langCategories, { autoAlpha: 0, y: 30 });
gsap.set(langItems, { autoAlpha: 0, y: 50 });

// Usar matchMedia para aplicar diferentes configuraciones según el tamaño de pantalla
let mm = gsap.matchMedia();

mm.add("(min-width: 768px)", () => {
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
            const leftHeight = document.querySelector(".languages-left").offsetHeight;
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
        // Animar el título de la categoría
        langTl.to(category, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
        }, timeOffset);
        
        timeOffset += 0.4;

        // Animar los items dentro de esta categoría
        const itemsInCategory = category.querySelectorAll(".lang-item");
        itemsInCategory.forEach((item) => {
            langTl.to(item, {
                autoAlpha: 1,
                y: 0,
                duration: 1,
                ease: "power2.out"
            }, timeOffset);
            timeOffset += 0.5;
        });
        
        timeOffset += 0.2; // Pequeña pausa entre categorías
    });

    // Añadir un poco de espacio al final para que el último elemento se lea bien antes de soltar el pin
    langTl.to({}, { duration: 1 });
});

mm.add("(max-width: 767px)", () => {
    // Configuración para Móvil (sin pin, animación normal al hacer scroll)
    langCategories.forEach((category) => {
        gsap.to(category, {
            autoAlpha: 1,
            y: 0,
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
        gsap.to(item, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: item,
                start: "top 85%", // Aparece cuando el elemento entra en el 85% de la pantalla
                toggleActions: "play none none reverse" // Se reproduce al entrar, se revierte al salir hacia arriba
            }
        });
    });
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
    
    if (!path || !logo || nodes.length === 0) return;

    // Get the total length of the path
    const pathLength = path.getTotalLength();
    
    // Set initial state for path
    gsap.set(path, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength
    });

    // Set initial state for logo
    gsap.set(logo, { opacity: 0 });

    // Create a timeline for the scroll animation
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".timeline-section",
            start: "top top",
            end: "+=2000", // Adjust this value to control scroll duration
            scrub: 1,
            pin: true,
            anticipatePin: 1
        }
    });

    // Show logo at the beginning
    tl.to(logo, { opacity: 1, duration: 0.05 });

    // Animate the path drawing
    tl.to(path, {
        strokeDashoffset: 0,
        duration: 1,
        ease: "none"
    }, 0);

    // Animate the logo along the path
    tl.to(logo, {
        motionPath: {
            path: path,
            align: path,
            alignOrigin: [0.5, 0.5],
            autoRotate: false
        },
        duration: 1,
        ease: "none"
    }, 0);

    // Calculate positions for nodes to appear
    // The path is: M 750 100 L 750 350 L 250 350 L 250 800 L 750 800
    // Total length = 250 + 500 + 450 + 500 = 1700
    // Node 1: 0
    // Node 2: 250 / 1700 = 0.147
    // Node 3: (250 + 500) / 1700 = 750 / 1700 = 0.441
    // Node 4: (750 + 450) / 1700 = 1200 / 1700 = 0.706
    // Node 5: 1700 / 1700 = 1.0

    const nodeProgress = [0, 0.147, 0.441, 0.706, 1];

    nodes.forEach((node, index) => {
        // Set initial state for nodes to handle transform correctly
        gsap.set(node, { xPercent: -50, yPercent: -50, y: 20 });

        // We want the node to appear when the line reaches it
        tl.to(node, {
            opacity: 1,
            y: 0, // Move to original position
            duration: 0.05,
            ease: "power1.out"
        }, nodeProgress[index]);
    });
};

// Call the setup function
setupTimelineAnimation();
