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
        y: 50,
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
            end: "+=250%",
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
            y: 20,
            duration: 1
        }, 0)

        // 2. Face the camera and zoom
        .to(laptop, {
            rotateX: 75, // Base points mostly OUT and DOWN
            scale: () => {
                const scaleX = window.innerWidth / laptop.offsetWidth;
                const scaleY = window.innerHeight / laptop.offsetHeight;
                return Math.max(scaleX, scaleY) * 1.05; // Slight overscale to hide edges
            },
            y: () => {
                // Center the screen in the viewport
                const scale = Math.max(window.innerWidth / laptop.offsetWidth, window.innerHeight / laptop.offsetHeight) * 1.05;
                return (laptop.offsetHeight / 2) * 1.25 * scale; 
            },
            duration: 1.5
        }, 1.2)
        .to(laptopLid, {
            rotateX: 105, // Keep it at 105 so absolute is 180 (75 + 105 = 180)
            duration: 1.5
        }, 1.2)

        // 3. Square off screen
        .to(screenWrap, {
            borderRadius: 0,
            padding: 0,
            duration: 0.5
        }, 2.2)
        .to(laptopBase, {
            autoAlpha: 0,
            duration: 0.3
        }, 1.8); // Hide base before it gets too weird
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
