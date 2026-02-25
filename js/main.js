gsap.registerPlugin(ScrollTrigger);

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
    y: 20,
    autoAlpha: 0,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: {
        trigger: ".intro",
        start: "top 95%" // Empieza a mostrarse casi en cuanto asoma
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
const langItems = gsap.utils.toArray(".lang-item");

// Ocultar inicialmente los lenguajes
gsap.set(langItems, { autoAlpha: 0, y: 50 });

const langTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".block.languages",
        start: "center center", // Pinear cuando el centro de la sección llega al centro de la pantalla
        end: "+=2500", // Mantener pineado durante 2500px de scroll
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
    duration: langItems.length * 0.5
}, 0);

// Hacer que los lenguajes aparezcan uno por uno
langItems.forEach((item, i) => {
    langTl.to(item, {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        ease: "power2.out"
    }, i * 0.5);
});

// Añadir un poco de espacio al final para que el último elemento se lea bien antes de soltar el pin
langTl.to({}, { duration: 1 });

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
