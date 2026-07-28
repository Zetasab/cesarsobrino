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

// Iniciar animación indeterminada ni bien el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.getElementById('splashProgressBar');
    if (progressBar) {
        progressBar.classList.add('loading-anim');
    }
});

window.addEventListener('load', () => {
    // Asegurarnos de que estamos arriba del todo
    window.scrollTo(0, 0);

    const splashScreen = document.getElementById('splash-screen');
    const progressBar = document.getElementById('splashProgressBar');
    const progressText = document.getElementById('splashProgressText');
    const heroTitle = document.querySelector('.hero-title');

    if (splashScreen && progressBar) {
        // Al terminar el "load" real, quitamos la animación indeterminada y progresamos a 100
        progressBar.classList.remove('loading-anim');
        progressBar.style.left = '0';
        
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15; // Incremento aleatorio
            if (progress > 100) progress = 100;

            progressBar.style.width = `${progress}%`;
            if (progressText) {
                progressText.textContent = `${Math.floor(progress)}%`;
            }

            if (progress >= 100) {
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
        }, 40); // Actualizamos cada 40ms para que complete la carga rápida

    } else {
        lenis.start();
        document.body.classList.remove('no-scroll');
        if (heroTitle) {
            heroTitle.classList.add('start-typing');
        }
    }
});

const hero3d = document.getElementById("hero3d");
const heroCanvas = document.getElementById("heroCanvas");
const screenOverlay = document.getElementById("screenOverlay");
const heroStage = document.querySelector(".hero-stage");
const scrollHint = document.querySelector(".scroll-hint");
const heroTitleWrapper = document.getElementById("heroTitleWrapper");

const debounce = (fn, delay = 120) => {
    let timer;
    return (...args) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => fn(...args), delay);
    };
};

// --- Escena 3D del hero (persona sentada + escritorio) ---
const heroScene = (() => {
    if (typeof THREE === "undefined" || typeof THREE.GLTFLoader === "undefined" || !heroCanvas) {
        return null;
    }

    const renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 100);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x9aa3b2, 1.0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.15);
    dirLight.position.set(4, 7, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.camera.left = -6;
    dirLight.shadow.camera.right = 6;
    dirLight.shadow.camera.top = 6;
    dirLight.shadow.camera.bottom = -6;
    scene.add(dirLight);

    // Suelo que solo recibe sombras
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.ShadowMaterial({ opacity: 0.2 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grupo con los modelos: se inclina levemente siguiendo el mouse para dar sensacion de vida
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);

    const mouseParallax = { targetX: 0, targetY: 0, curX: 0, curY: 0 };
    window.addEventListener("pointermove", (e) => {
        mouseParallax.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseParallax.targetY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    // Recorrido de camara: plano general -> pegado a la pantalla del monitor
    const camStart = new THREE.Vector3(0, 1.95, 7.2);
    const baseCamStartZ = camStart.z; // distancia de referencia en pantallas anchas
    const lookStart = new THREE.Vector3(0, 1.35, 0);
    const camEnd = new THREE.Vector3(1.7, 1.35, 1.2);
    const lookEnd = new THREE.Vector3(1.7, 1.35, 0);
    const zoom = { progress: 0 };

    const tmpCam = new THREE.Vector3();
    const tmpLook = new THREE.Vector3();

    const loader = new THREE.GLTFLoader();

    // Referencia al brazo izquierdo para animar el saludo (se rellena cuando termina de cargar)
    let waveArm = null;
    const waveAxis = new THREE.Vector3(0, 0, 1);
    const waveQuat = new THREE.Quaternion();

    // Referencia a la pantalla del monitor: solo un click sobre ella activa el zoom
    let screenMesh = null;
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();
    const isScreenHit = (clientX, clientY) => {
        if (!screenMesh) return false;
        const rect = heroCanvas.getBoundingClientRect();
        pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointerNDC, camera);
        return raycaster.intersectObject(screenMesh, true).length > 0;
    };

    // Referencia al pato del escritorio: al hacer click sobre el, suena un "quak"
    let duckMeshes = [];
    const isDuckHit = (clientX, clientY) => {
        if (!duckMeshes.length) return false;
        const rect = heroCanvas.getBoundingClientRect();
        pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointerNDC, camera);
        return raycaster.intersectObjects(duckMeshes, true).length > 0;
    };

    // Normaliza el modelo: altura objetivo, apoyado en el suelo y centrado en su grupo
    const prepareModel = (gltf, targetHeight) => {
        const model = gltf.scene;
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const scale = targetHeight / (size.y || 1);
        model.scale.setScalar(scale);
        const scaledBox = new THREE.Box3().setFromObject(model);
        const center = scaledBox.getCenter(new THREE.Vector3());
        model.position.x -= center.x;
        model.position.z -= center.z;
        model.position.y -= scaledBox.min.y;
        return model;
    };

    // Persona sentada a la izquierda, mirando hacia el escritorio
    loader.load("assets/objects/persona-sentada.glb", (gltf) => {
        const group = new THREE.Group();
        const personaModel = prepareModel(gltf, 2.0);
        group.add(personaModel);
        group.position.x = -0.9;
        group.position.z = 0.5;
        group.rotation.y = 0.35;
        objectsGroup.add(group);

        // El modelo no trae brazo izquierdo: usamos brazo.glb, reflejando en X la pose del brazo derecho
        loader.load("assets/objects/brazo.glb", (armGltf) => {
            const arm = armGltf.scene;
            arm.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            // El brazo sale del hombro izquierdo y apunta hacia arriba y un poco hacia fuera, como saludando
            const shoulderPoint = new THREE.Vector3(-0.18, 0.833, 0.025);
            const armDir = new THREE.Vector3(0.02, 1, 0.1).normalize();
            arm.scale.x = -1; // Refleja la geometria del brazo (era el derecho) para usarla como izquierdo
            arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), armDir);
            arm.position.copy(shoulderPoint);
            arm.userData.baseQuaternion = arm.quaternion.clone();
            personaModel.add(arm);
            waveArm = arm; // A partir de aqui el ticker anima el saludo pivotando sobre el hombro
        });
    });

    // Escritorio con ordenador a la derecha
    loader.load("assets/objects/escritorio-informatico.glb", (gltf) => {
        const group = new THREE.Group();
        group.add(prepareModel(gltf, 2.0));
        group.position.x = 0.9;
        group.rotation.y = -0.35;
        objectsGroup.add(group);

        screenMesh = group.getObjectByName("pantalla_cristal");

        // Punto de la pantalla del monitor: hacia el se hace el zoom (centro real del cristal, no una estimacion).
        // Se mide con el parallax del mouse neutralizado, para que el objetivo no quede desviado
        // segun donde estuviera el mouse justo cuando termino de cargar el modelo.
        if (screenMesh) {
            const prevRotX = objectsGroup.rotation.x;
            const prevRotY = objectsGroup.rotation.y;
            objectsGroup.rotation.set(0, 0, 0);
            objectsGroup.updateMatrixWorld(true);

            const screenBox = new THREE.Box3().setFromObject(screenMesh);
            const screenCenter = screenBox.getCenter(new THREE.Vector3());
            const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(group.quaternion);
            lookEnd.copy(screenCenter);
            camEnd.copy(screenCenter).addScaledVector(forward, 0.85);

            objectsGroup.rotation.set(prevRotX, prevRotY, 0);
            objectsGroup.updateMatrixWorld(true);
        }

        // Piezas del pato, para detectar el click sobre el
        duckMeshes = ["pato_cuerpo", "pato_cola", "pato_cabeza", "pato_pico", "pato_ojo_izq", "pato_ojo_der"]
            .map((name) => group.getObjectByName(name))
            .filter(Boolean);
    });

    const resize = () => {
        const width = heroCanvas.clientWidth || window.innerWidth;
        const height = heroCanvas.clientHeight || window.innerHeight;
        renderer.setSize(width, height, false);
        const aspect = width / height;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();

        // En pantallas estrechas (movil) alejamos la camara de partida para que la persona
        // y el escritorio entren enteros en el encuadre, sin tocar el FOV ni el resto de la animacion.
        const referenceAspect = 1.3; // por debajo de esto empezamos a compensar (moviles/tablets en vertical)
        const maxDistanceScale = 2.3; // limite para no alejar demasiado en pantallas muy estrechas
        const distanceScale = THREE.MathUtils.clamp(referenceAspect / aspect, 1, maxDistanceScale);
        camStart.z = baseCamStartZ * distanceScale;
    };
    resize();
    window.addEventListener("resize", resize);

    gsap.ticker.add((time) => {
        if (heroStage && heroStage.style.display === "none") return;
        const p = zoom.progress;
        // Balanceo suave de camara en reposo que desaparece al hacer zoom
        const sway = (1 - p) * 0.12;
        tmpCam.lerpVectors(camStart, camEnd, p);
        tmpCam.x += Math.sin(time * 0.4) * sway;
        tmpCam.y += Math.sin(time * 0.7) * sway * 0.4;
        tmpLook.lerpVectors(lookStart, lookEnd, p);
        camera.position.copy(tmpCam);
        camera.lookAt(tmpLook);

        // Los modelos siguen el mouse con una rotacion leve; se apaga al hacer zoom en la pantalla
        mouseParallax.curX += (mouseParallax.targetX - mouseParallax.curX) * 0.05;
        mouseParallax.curY += (mouseParallax.targetY - mouseParallax.curY) * 0.05;
        // Se apaga muy rapido en cuanto empieza el scroll, para no desviar la puntería del zoom hacia la pantalla
        const parallaxFade = Math.max(0, 1 - p * 8);
        objectsGroup.rotation.y = mouseParallax.curX * 0.05 * parallaxFade;
        objectsGroup.rotation.x = mouseParallax.curY * 0.03 * parallaxFade;

        // El brazo izquierdo saluda: pivota sobre el hombro (posicion fija), solo se mueve la mano
        if (waveArm) {
            const waveAngle = Math.sin(time * 3) * 0.26;
            waveQuat.setFromAxisAngle(waveAxis, waveAngle);
            waveArm.quaternion.copy(waveArm.userData.baseQuaternion).multiply(waveQuat);
        }

        renderer.render(scene, camera);
    });

    return { zoom, renderer, scene, camera, objectsGroup, mouseParallax, isScreenHit, isDuckHit };
})();

window.__heroScene = heroScene;

const setupHeroAnimation = () => {
    const zoomProxy = heroScene ? heroScene.zoom : { progress: 0 };

    // Estado inicial: overlay de la pantalla oculto y pequeño (como si fuera el monitor)
    gsap.set(screenOverlay, { autoAlpha: 0, scale: 0.22, transformOrigin: "50% 50%" });
    gsap.set(".laptop-screen", { borderRadius: "22px" });

    const timeline = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom bottom", // End when the bottom of .hero reaches the bottom of the viewport
            scrub: 0.5
        },
        onUpdate: function () {
            const expanded = this.time() >= 2.7;
            hero3d.classList.toggle("expanded", expanded);
            screenOverlay.classList.toggle("expanded", expanded);
        }
    });

    timeline
        // Hide title when scrolling down
        .to(heroTitleWrapper, {
            autoAlpha: 0,
            y: -50,
            duration: 0.8
        }, 0)

        // 1. Zoom de camara hacia la pantalla del monitor
        .to(zoomProxy, {
            progress: 1,
            duration: 2.7
        }, 0)

        // 2. La pantalla de login crece desde el centro hasta ocupar todo el viewport
        .to(screenOverlay, {
            autoAlpha: 1,
            duration: 0.7
        }, 1.9)
        .to(screenOverlay, {
            scale: 1,
            duration: 0.8
        }, 1.9)
        .to(".laptop-screen", {
            borderRadius: 0,
            duration: 0.5
        }, 2.2)

        // 3. Loading sequence (after screen is fully open at 2.7s)
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

    // Añadir evento click SOLO sobre la pantalla del monitor para hacer scroll hasta que esté full
    hero3d.addEventListener('click', (e) => {
        if (hero3d.classList.contains('expanded')) return; // No hacer nada si ya está expandido
        if (!heroScene || !heroScene.isScreenHit(e.clientX, e.clientY)) return; // Solo si el click cae en la pantalla

        const st = timeline.scrollTrigger;
        if (st) {
            // El momento en el que la pantalla está full y cuadrada es a los 2.7s (el boton empieza a
            // desvanecerse en el 2.8s). Apuntamos un poco mas alla del 2.7 para asegurar que el scroll
            // no se quede unos pixeles corto y el boton "Entrar" quede clicable.
            const targetProgress = 2.75 / timeline.duration();
            const targetScroll = st.start + (st.end - st.start) * targetProgress;

            // Usar lenis para hacer scroll suave hasta esa posición
            lenis.scrollTo(targetScroll, {
                duration: 3.5, // Aumentado para que tarde más
                easing: (t) => {
                    // Easing custom: rápido al principio, muy lento al final (easeOutExpo)
                    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
                }
            });
        }
    });

    // Mostrar cursor de "pointer" cuando el mouse esta sobre la pantalla del monitor o sobre el pato
    hero3d.addEventListener('mousemove', (e) => {
        if (hero3d.classList.contains('expanded') || !heroScene) return;
        const hover = heroScene.isScreenHit(e.clientX, e.clientY) || heroScene.isDuckHit(e.clientX, e.clientY);
        hero3d.classList.toggle('hero-3d--pointer', hover);
    });
    hero3d.addEventListener('mouseleave', () => {
        hero3d.classList.remove('hero-3d--pointer');
    });

    // Añadir evento click sobre el pato del escritorio: reproduce un "quak"
    const duckQuak = new Audio('assets/objects/quak.mp3');
    hero3d.addEventListener('click', (e) => {
        if (hero3d.classList.contains('expanded') || !heroScene) return;
        if (!heroScene.isDuckHit(e.clientX, e.clientY)) return;

        duckQuak.currentTime = 0;
        duckQuak.play().catch(() => {});
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
                    // Easing custom: arranca algo más rápido y acelera al final (easeInCubic)
                    return t * t * t;
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
        start: "top 70%",
        toggleActions: "play none none reverse"
    }
});

// Animación para los lenguajes de programación (Pinned)
const langCategories = gsap.utils.toArray(".lang-category");
const langItems = gsap.utils.toArray(".lang-item");

const setupLanguageIconsFollow = () => {
    const iconMM = gsap.matchMedia();

    iconMM.add("(min-width: 768px) and (hover: hover) and (pointer: fine)", () => {
        const section = document.querySelector(".block.languages");
        const iconNodes = gsap.utils.toArray(".lang-item img");
        if (!section || iconNodes.length === 0) return;

        const maxOffset = 18;
        const iconFollowers = iconNodes.map((icon) => ({
            icon,
            moveX: gsap.quickTo(icon, "x", { duration: 0.35, ease: "power3.out" }),
            moveY: gsap.quickTo(icon, "y", { duration: 0.35, ease: "power3.out" }),
            rotate: gsap.quickTo(icon, "rotation", { duration: 0.35, ease: "power3.out" })
        }));

        const onMove = (event) => {
            iconFollowers.forEach((follower) => {
                const iconRect = follower.icon.getBoundingClientRect();
                const iconCenterX = iconRect.left + iconRect.width / 2;
                const iconCenterY = iconRect.top + iconRect.height / 2;

                const dx = event.clientX - iconCenterX;
                const dy = event.clientY - iconCenterY;
                const distance = Math.hypot(dx, dy) || 1;

                const strength = Math.min(1.35, 220 / (distance + 30));
                const targetX = (dx / distance) * maxOffset * strength;
                const targetY = (dy / distance) * maxOffset * strength;

                follower.moveX(targetX);
                follower.moveY(targetY);
                follower.rotate((targetX / maxOffset) * 10);
            });
        };

        const onLeave = () => {
            iconFollowers.forEach((follower) => {
                follower.moveX(0);
                follower.moveY(0);
                follower.rotate(0);
            });
        };

        section.addEventListener("mousemove", onMove);
        section.addEventListener("mouseleave", onLeave);

        return () => {
            section.removeEventListener("mousemove", onMove);
            section.removeEventListener("mouseleave", onLeave);
            iconFollowers.forEach((follower) => {
                gsap.set(follower.icon, { x: 0, y: 0, rotation: 0 });
            });
        };
    });
};

setupLanguageIconsFollow();

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
                end: "+=1000", // Reducido para que el scroll sea más corto en móvil
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
        invalidateOnRefresh: true,
        // Añadimos un pequeño margen de seguridad para que no se solape con la sección anterior
        fastScrollEnd: true
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

const setupProjectCardsPointerReaction = () => {
    const cardsMM = gsap.matchMedia();

    cardsMM.add("(min-width: 769px) and (hover: hover) and (pointer: fine)", () => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        const projectLinks = gsap.utils.toArray(".project-link");
        if (projectLinks.length === 0) return;

        const rafIds = new WeakMap();
        const listeners = [];

        projectLinks.forEach((link) => {
            const card = link.querySelector(".project-item");
            if (!card) return;

            const maxTilt = 8;

            const onMouseMove = (event) => {
                if (rafIds.get(link)) {
                    cancelAnimationFrame(rafIds.get(link));
                }

                const rafId = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    if (!rect.width || !rect.height) return;

                    const px = gsap.utils.clamp(0, 1, (event.clientX - rect.left) / rect.width);
                    const py = gsap.utils.clamp(0, 1, (event.clientY - rect.top) / rect.height);

                    const rotateY = (px - 0.5) * maxTilt;
                    const rotateX = (0.5 - py) * maxTilt;

                    link.classList.add("is-interactive");
                    link.style.setProperty("--mx", `${(px * 100).toFixed(2)}%`);
                    link.style.setProperty("--my", `${(py * 100).toFixed(2)}%`);
                    link.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
                    link.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);
                });

                rafIds.set(link, rafId);
            };

            const resetCardState = () => {
                link.classList.remove("is-interactive");
                link.style.setProperty("--mx", "50%");
                link.style.setProperty("--my", "50%");
                link.style.setProperty("--rx", "0deg");
                link.style.setProperty("--ry", "0deg");
            };

            const onMouseEnter = () => {
                link.classList.add("is-interactive");
            };

            link.addEventListener("mouseenter", onMouseEnter);
            link.addEventListener("mousemove", onMouseMove);
            link.addEventListener("mouseleave", resetCardState);

            listeners.push(() => {
                link.removeEventListener("mouseenter", onMouseEnter);
                link.removeEventListener("mousemove", onMouseMove);
                link.removeEventListener("mouseleave", resetCardState);

                if (rafIds.get(link)) {
                    cancelAnimationFrame(rafIds.get(link));
                }

                resetCardState();
            });
        });

        return () => {
            listeners.forEach((teardown) => teardown());
        };
    });
};

setupProjectCardsPointerReaction();

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
        console.log(targetId)
        if (targetId && targetId.startsWith('#')) {
            if (targetId === '#inicio') {
                lenis.scrollTo(0, {
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            } else {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    let offset = 0;
                    if (targetId === '#lenguajes') {
                        offset = 800; // Ajusta este valor para que baje más o menos
                    }
                    lenis.scrollTo(targetElement, {
                        offset: offset,
                        duration: 1.5,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                    });
                }
            }
        }
    });
});

// --- Navbar Scroll Effect ---
const navbar = document.querySelector('.navbar');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');

if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            navbar.classList.add('scrolled');
            if (mobileMenuToggle) mobileMenuToggle.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
            if (mobileMenuToggle) mobileMenuToggle.classList.remove('scrolled');
        }
    });
}

// --- Navbar Progress Bar ---
const navProgressFill = document.getElementById('navProgressFill');
const navProgressSlider = document.getElementById('navProgressSlider');

if (navProgressFill && navProgressSlider) {
    // Update progress bar on scroll
    lenis.on('scroll', () => {
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
        
        if (window.innerWidth <= 768) {
            navProgressFill.style.height = `${progress}%`;
            navProgressFill.style.width = '100%';
            
            // Update slider width dynamically based on container height
            const container = document.querySelector('.nav-progress-container');
            if (container) {
                navProgressSlider.style.width = `${container.offsetHeight}px`;
            }
        } else {
            navProgressFill.style.width = `${progress}%`;
            navProgressFill.style.height = '100%';
            navProgressSlider.style.width = '100%';
        }
        navProgressSlider.value = progress;
    });

    // Update scroll position on slider drag
    navProgressSlider.addEventListener('input', (e) => {
        const progress = parseFloat(e.target.value);
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const targetScroll = (progress / 100) * maxScroll;
        
        // Use window.scrollTo for immediate response during drag
        window.scrollTo(0, targetScroll);
    });

    // Handle resize to reset styles
    window.addEventListener('resize', () => {
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
        
        if (window.innerWidth <= 768) {
            navProgressFill.style.height = `${progress}%`;
            navProgressFill.style.width = '100%';
        } else {
            navProgressFill.style.width = `${progress}%`;
            navProgressFill.style.height = '100%';
        }
    });
}

if (mobileMenuToggle && navbar) {
    mobileMenuToggle.addEventListener('click', () => {
        navbar.classList.toggle('open');
        
        // Cambiar el icono del botón
        const svg = mobileMenuToggle.querySelector('svg');
        if (navbar.classList.contains('open')) {
            svg.innerHTML = `
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            `;
        } else {
            svg.innerHTML = `
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            `;
        }
    });

    // Cerrar el menú al hacer clic en un enlace
    const navLinks = navbar.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navbar.classList.remove('open');
                mobileMenuToggle.querySelector('svg').innerHTML = `
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                `;
            }
        });
    });
}

// --- Scroll Hint Logic ---
if (scrollHint) {
    let scrollHintTimeout;
    
    const resetScrollHintTimeout = () => {
        // Limpiar el timeout anterior
        clearTimeout(scrollHintTimeout);
        
        // Configurar un nuevo timeout para mostrar el scroll hint después de 5 segundos de inactividad
        scrollHintTimeout = setTimeout(() => {
            // Solo mostrar si no estamos al final de la página
            if ((window.innerHeight + window.scrollY) < document.body.offsetHeight - 50) {
                scrollHint.classList.remove('hidden');
            }
        }, 2500);
    };

    const handleScrollHint = () => {
        // Ocultar el scroll hint al hacer scroll
        scrollHint.classList.add('hidden');
        resetScrollHintTimeout();
    };

    // Escuchar eventos de scroll
    window.addEventListener('scroll', handleScrollHint);
    
    // Inicializar el timeout por si el usuario no hace scroll al cargar la página
    resetScrollHintTimeout();
}

// --- Custom Cursor Logic ---
const customCursorDot = document.getElementById('customCursorDot');

if (customCursorDot) {
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let cursorOffsetX = 0;
    let cursorOffsetY = 0;
    let clearCursorTextTimeout;

    const setCursorText = (text, dir) => {
        if (!text) return;
        window.clearTimeout(clearCursorTextTimeout);
        const estimatedWidth = Math.max(168, Math.min(window.innerWidth * 0.55, Math.ceil(text.length * 8.4 + 42)));
        customCursorDot.style.setProperty('--cursor-text-width', `${estimatedWidth}px`);
        customCursorDot.setAttribute('data-text', text);
        customCursorDot.dataset.offsetDir = dir || 'default';
        customCursorDot.classList.add('is-text');
    };

    const clearCursorText = () => {
        customCursorDot.classList.remove('is-text');
        delete customCursorDot.dataset.offsetDir;
        window.clearTimeout(clearCursorTextTimeout);
        clearCursorTextTimeout = window.setTimeout(() => {
            if (!customCursorDot.classList.contains('is-text')) {
                customCursorDot.removeAttribute('data-text');
                customCursorDot.style.removeProperty('--cursor-text-width');
            }
        }, 320);
    };

    // Update mouse coordinates
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Animation loop for the delayed cursor
    const animateCursor = () => {
        // Ease the cursor position towards the mouse position (lower value = smoother/more delay)
        cursorX += (mouseX - cursorX) * 0.08;
        cursorY += (mouseY - cursorY) * 0.08;
        const isText = customCursorDot.classList.contains('is-text');
        const isRightUp = isText && customCursorDot.dataset.offsetDir === 'right-up';
        const targetOffsetX = isText ? (isRightUp ? 60 : 28) : 0;
        const targetOffsetY = isText ? (isRightUp ? -18 : 28) : 0;
        cursorOffsetX += (targetOffsetX - cursorOffsetX) * 0.16;
        cursorOffsetY += (targetOffsetY - cursorOffsetY) * 0.16;
        
        customCursorDot.style.transform = `translate(${cursorX + cursorOffsetX}px, ${cursorY + cursorOffsetY}px) translate(-50%, -50%)`;
        
        requestAnimationFrame(animateCursor);
    };
    animateCursor();
    
    // Hide cursor when leaving the window
    document.addEventListener('mouseleave', () => {
        customCursorDot.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        customCursorDot.style.opacity = '1';
    });

    const cursorTextTargets = document.querySelectorAll('[data-cursor-text]');
    cursorTextTargets.forEach((target) => {
        const updateCursorTextState = () => {
            const text = target.getAttribute('data-cursor-text');
            if (!text) {
                clearCursorText();
                return;
            }

            setCursorText(text, target.getAttribute('data-cursor-offset'));
        };

        target.addEventListener('mouseenter', updateCursorTextState);
        target.addEventListener('mousemove', updateCursorTextState);
        target.addEventListener('mouseleave', clearCursorText);
    });
}