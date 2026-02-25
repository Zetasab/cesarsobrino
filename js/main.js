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
            end: "+=400%", // Increased to allow more scroll for the loading animation
            scrub: 0.5,
            pin: ".hero-stage",
            anticipatePin: 1
        }
    });

    timeline
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
        
        // Hold the tick for a moment before unpinning
        .to(".tick", {
            scale: 1.2,
            duration: 0.5
        }, 4.2);
};

setupHeroAnimation();

const debouncedRefresh = debounce(() => ScrollTrigger.refresh(), 180);
window.addEventListener("resize", debouncedRefresh);

const revealTimeline = gsap.timeline({
    defaults: { ease: "power2.out", duration: 0.8 },
    scrollTrigger: {
        trigger: "#portfolio",
        start: "top 75%"
    }
});

revealTimeline
    .from(".intro", { y: 40, autoAlpha: 0 })
    .from(".projects", { y: 45, autoAlpha: 0 }, "-=0.45")
    .from(".contact", { y: 45, autoAlpha: 0 }, "-=0.45");

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
