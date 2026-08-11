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

// Mensajes rotativos del splash screen para dar sensación de progreso
const splashMessages = [
    'Preparando todo',
    'Cargando recursos',
    'Ya casi está listo',
    'Falta un poquito más',
    'Afinando los últimos detalles'
];
let splashMessageInterval = null;

function startSplashMessages() {
    const textEl = document.getElementById('splashLoadingText');
    if (!textEl) return;

    let index = 0;
    splashMessageInterval = setInterval(() => {
        index = (index + 1) % splashMessages.length;
        textEl.classList.add('text-swap');
        setTimeout(() => {
            textEl.textContent = splashMessages[index];
            textEl.classList.remove('text-swap');
        }, 350);
    }, 5000);
}

function stopSplashMessages() {
    if (splashMessageInterval) {
        clearInterval(splashMessageInterval);
        splashMessageInterval = null;
    }
}

document.addEventListener('DOMContentLoaded', startSplashMessages);

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
                    stopSplashMessages();

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
        stopSplashMessages();
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

    // --- Presets de iluminación: día / tarde / noche ---
    // Cada preset define el color y la intensidad de las luces de three.js,
    // más la clase CSS que cambia el fondo del hero y el color/glow del título.
    const LIGHT_PRESETS = {
        day: {
            hemiSky: 0xffffff,
            hemiGround: 0x9aa3b2,
            hemiIntensity: 0.7,
            dirColor: 0xffffff,
            dirIntensity: 0.8,
            bodyClass: "lighting-day"
        },
        afternoon: {
            hemiSky: 0xffb37b,
            hemiGround: 0x4a3a2a,
            hemiIntensity: 0.6,
            dirColor: 0xff9d5c,
            dirIntensity: 0.95,
            bodyClass: "lighting-afternoon"
        },
        night: {
            hemiSky: 0x3b4d8f,
            hemiGround: 0x0a0a12,
            hemiIntensity: 0.35,
            dirColor: 0xaec6ff,
            dirIntensity: 0.45,
            bodyClass: "lighting-night"
        }
    };
    const LIGHTING_CLASSES = Object.values(LIGHT_PRESETS).map((p) => p.bodyClass);
    let currentLightingMode = "day";

    const setLightingMode = (mode) => {
        const preset = LIGHT_PRESETS[mode];
        if (!preset) return;

        hemiLight.color.setHex(preset.hemiSky);
        hemiLight.groundColor.setHex(preset.hemiGround);
        hemiLight.intensity = preset.hemiIntensity;

        dirLight.color.setHex(preset.dirColor);
        dirLight.intensity = preset.dirIntensity;

        if (heroStage) {
            heroStage.classList.remove(...LIGHTING_CLASSES);
            heroStage.classList.add(preset.bodyClass);
        }

        currentLightingMode = mode;
    };

    // Modo por defecto (se puede cambiar luego con window.heroLighting.setMode("day"|"afternoon"|"night"))
    setLightingMode("day");

    // Suelo que solo recibe sombras
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.ShadowMaterial({ opacity: 0.2 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02; // ligeramente por debajo del suelo real de la habitacion, evita z-fighting
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

    // Referencia a los patos (escritorio y estantería): son dos patos distintos, cada uno con su propio logro
    let deskDuckMeshes = [];
    let shelfDuckMeshes = [];
    const isDeskDuckHit = (clientX, clientY) => {
        if (!deskDuckMeshes.length) return false;
        const rect = heroCanvas.getBoundingClientRect();
        pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointerNDC, camera);
        return raycaster.intersectObjects(deskDuckMeshes, true).length > 0;
    };
    const isShelfDuckHit = (clientX, clientY) => {
        if (!shelfDuckMeshes.length) return false;
        const rect = heroCanvas.getBoundingClientRect();
        pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointerNDC, camera);
        return raycaster.intersectObjects(shelfDuckMeshes, true).length > 0;
    };

    // Referencia a las tazas (escritorio y estanteria): al hacer click, suena un "sorbo"
    let cupMeshes = [];
    const isCupHit = (clientX, clientY) => {
        if (!cupMeshes.length) return false;
        const rect = heroCanvas.getBoundingClientRect();
        pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointerNDC, camera);
        return raycaster.intersectObjects(cupMeshes, true).length > 0;
    };

    // Referencia al papel del CV que sostiene la persona: al hacer click, abre el PDF
    let paperMesh = null;
    const isPaperHit = (clientX, clientY) => {
        if (!paperMesh) return false;
        const rect = heroCanvas.getBoundingClientRect();
        pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointerNDC, camera);
        return raycaster.intersectObject(paperMesh, true).length > 0;
    };

    // Interruptores de luz en la pared de la derecha: uno por modo (dia/tarde/noche)
    let switchMeshes = [];
    const isSwitchHit = (clientX, clientY) => {
        if (!switchMeshes.length) return null;
        const rect = heroCanvas.getBoundingClientRect();
        pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointerNDC, camera);
        const hit = raycaster.intersectObjects(switchMeshes, true)[0];
        return hit ? hit.object.userData.lightingMode || null : null;
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
        group.position.y = 0.15;
        group.position.z = 0.5;
        group.rotation.y = 0.35;
        objectsGroup.add(group);

        // Papel del CV que sostiene la persona en la mano: al hacer click, se abre el PDF
        paperMesh = personaModel.getObjectByName("papel_cv");

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
            camEnd.copy(screenCenter).addScaledVector(forward, 0.72);

            objectsGroup.rotation.set(prevRotX, prevRotY, 0);
            objectsGroup.updateMatrixWorld(true);
        }

        // Piezas del pato del escritorio, para detectar el click sobre el
        deskDuckMeshes = ["pato_cuerpo", "pato_cola", "pato_cabeza", "pato_pico", "pato_ojo_izq", "pato_ojo_der"]
            .map((name) => group.getObjectByName(name))
            .filter(Boolean);

        // Piezas de la taza de cafe del escritorio, para detectar el click sobre ella
        const deskCupMeshes = ["taza_cafe", "taza", "cafe", "asa"]
            .map((name) => group.getObjectByName(name))
            .filter(Boolean);
        cupMeshes = cupMeshes.concat(deskCupMeshes);
    });

    // Habitacion de fondo, detras de la persona y el escritorio
    loader.load("assets/objects/habitacion-programador.glb", (gltf) => {
        const group = new THREE.Group();
        const roomModel = prepareModel(gltf, 4.16); // escala el cuarto (2.6 de alto original) para que englobe a los dos modelos
        roomModel.traverse((child) => {
            if (child.isMesh) child.castShadow = false; // que no proyecte sombras raras de las paredes sobre el suelo
        });
        group.add(roomModel);
        group.position.x = 0.3;
        group.position.z = 0.1;
        group.rotation.y = -0.5;
        objectsGroup.add(group);

        // Piezas del pato de la estanteria, para detectar el click sobre el (pato distinto al del escritorio)
        shelfDuckMeshes = ["pato_cuerpo", "pato_cabeza", "pato_pico"]
            .map((name) => roomModel.getObjectByName(name))
            .filter(Boolean);

        // Taza de la estanteria: se suma a la del escritorio para que tambien suene al clickarla
        const shelfCupMeshes = ["taza", "taza_asa"]
            .map((name) => roomModel.getObjectByName(name))
            .filter(Boolean);
        cupMeshes = cupMeshes.concat(shelfCupMeshes);
    });

    // Interruptores de luz en la pared de la derecha (dia / tarde / noche).
    // Todo lo que puedas necesitar ajustar esta aqui: posicion, rotacion (en grados) y tamaño.
    const SWITCH_WALL_X = 2.6;  // Distancia hacia la derecha (mas alla del escritorio, pegado a la pared)
    const SWITCH_WALL_Y = 1.8;   // Altura del interruptor (igual para los 3, pegados a la pared)
    const SWITCH_WALL_Z = -1.2;    // Posicion a lo largo de la pared (adelante/atras), punto central de la fila
    const SWITCH_SPACING = 0.33; // Separacion entre los 3 interruptores
    const SWITCH_SIZE = 0.06;    // Tamaño (altura objetivo en unidades de la escena)
    const SWITCH_ROTATION_DEG = { x: 90, y: 0, z: 40 }; // Rotacion en grados sobre cada eje
    // Angulo de la fila de interruptores respecto al eje Z (en grados). La pared esta en angulo
    // (misma rotacion que la habitacion, -0.5 rad), asi que la fila sigue esa misma direccion
    // para que los 3 queden a la misma distancia de la pared en vez de ir "adelantandose" uno a otro.
    const SWITCH_ROW_ANGLE_DEG = -28.65;

    const SWITCH_MODELS = [
        { file: "interruptor-de-pared-dia.glb", mode: "day" },
        { file: "interruptor-de-pared-tarde.glb", mode: "afternoon" },
        { file: "interruptor-de-pared-noche.glb", mode: "night" }
    ];

    const degToRad = (deg) => (deg * Math.PI) / 180;
    // Vector "a lo largo de la pared" (lado a lado). Si siguen sin quedar en fila, prueba a sumar/restar
    // 90 a SWITCH_ROW_ANGLE_DEG en vez de tocar este vector.
    const switchRowDir = new THREE.Vector3(1, 0, 0).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        degToRad(SWITCH_ROW_ANGLE_DEG)
    );

    SWITCH_MODELS.forEach(({ file, mode }, index) => {
        loader.load(`assets/objects/${file}`, (gltf) => {
            const group = new THREE.Group();
            const switchModel = prepareModel(gltf, SWITCH_SIZE);
            switchModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = false;
                    child.userData.lightingMode = mode;
                    switchMeshes.push(child);
                }
            });
            group.add(switchModel);
            const offset = (index - 1) * SWITCH_SPACING;
            group.position.set(
                SWITCH_WALL_X + switchRowDir.x * offset,
                SWITCH_WALL_Y,
                SWITCH_WALL_Z + switchRowDir.z * offset
            );
            group.rotation.set(
                degToRad(SWITCH_ROTATION_DEG.x),
                degToRad(SWITCH_ROTATION_DEG.y),
                degToRad(SWITCH_ROTATION_DEG.z)
            );
            objectsGroup.add(group);
        });
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

    return {
        zoom, renderer, scene, camera, objectsGroup, mouseParallax, isScreenHit, isDeskDuckHit, isShelfDuckHit, isCupHit, isSwitchHit, isPaperHit,
        setLightingMode,
        getLightingMode: () => currentLightingMode,
        lightingModes: Object.keys(LIGHT_PRESETS)
    };
})();

window.__heroScene = heroScene;

// API pública para el futuro botón de día/tarde/noche:
// window.heroLighting.setMode("day" | "afternoon" | "night")
// window.heroLighting.getMode() / window.heroLighting.modes
window.heroLighting = {
    setMode: (mode) => heroScene && heroScene.setLightingMode(mode),
    getMode: () => (heroScene ? heroScene.getLightingMode() : "day"),
    modes: heroScene ? heroScene.lightingModes : ["day", "afternoon", "night"]
};

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
            const expanded = this.time() >= 7;
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

        // 1. Zoom de camara hacia la pantalla del monitor (muy alargado: se acerca mucho antes de que salga la pantalla de inicio)
        .to(zoomProxy, {
            progress: 1,
            duration: 7
        }, 0)

        // 2. La pantalla de login crece desde el centro hasta ocupar todo el viewport (retrasada al final del acercamiento)
        .to(screenOverlay, {
            autoAlpha: 1,
            duration: 0.7
        }, 6.3)
        .to(screenOverlay, {
            scale: 1,
            duration: 0.8
        }, 6.3)
        .to(".laptop-screen", {
            borderRadius: 0,
            duration: 0.5
        }, 6.6)

        // 3. Loading sequence (after screen is fully open at 7s)
        // Hide button, show progress bar
        .to(".btn-entrar", {
            autoAlpha: 0,
            duration: 0.2
        }, 7.1)
        .to(".progress-bar-container", {
            autoAlpha: 1,
            duration: 0.2
        }, 7.1)
        .to(".progress-bar-fill", {
            width: "100%",
            duration: 1.2
        }, 7.1)

        // Hide progress bar, show tick (after some scroll distance)
        .to(".progress-bar-container", {
            autoAlpha: 0,
            duration: 0.2
        }, 8.3)
        .to(".tick", {
            autoAlpha: 1,
            duration: 0.2
        }, 8.3)

        // Hold the tick for a moment
        .to(".tick", {
            scale: 1.2,
            duration: 0.5
        }, 8.5)

        // Hide logo and tick
        .to(".login-container", {
            autoAlpha: 0,
            duration: 0.5
        }, 9.0)

        // Turn background black
        .to(".screen-wallpaper", {
            autoAlpha: 0,
            duration: 0.5
        }, 9.5)
        .to(".laptop-screen", {
            backgroundColor: "#000000",
            duration: 0.5
        }, 9.5);

    // Añadir evento click SOLO sobre la pantalla del monitor para hacer scroll hasta que esté full
    hero3d.addEventListener('click', (e) => {
        if (hero3d.classList.contains('expanded')) return; // No hacer nada si ya está expandido
        if (!heroScene || !heroScene.isScreenHit(e.clientX, e.clientY)) return; // Solo si el click cae en la pantalla

        const st = timeline.scrollTrigger;
        if (st) {
            // El momento en el que la pantalla está full y cuadrada es a los 7s (el boton empieza a
            // desvanecerse en el 7.1s). Apuntamos un poco mas alla del 7 para asegurar que el scroll
            // no se quede unos pixeles corto y el boton "Entrar" quede clicable.
            const targetProgress = 7.05 / timeline.duration();
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

    // Mostrar cursor de "pointer" cuando el mouse esta sobre la pantalla, el pato, una taza o un interruptor de luz
    hero3d.addEventListener('mousemove', (e) => {
        if (hero3d.classList.contains('expanded') || !heroScene) return;
        const hover = heroScene.isScreenHit(e.clientX, e.clientY)
            || heroScene.isDeskDuckHit(e.clientX, e.clientY)
            || heroScene.isShelfDuckHit(e.clientX, e.clientY)
            || heroScene.isCupHit(e.clientX, e.clientY)
            || heroScene.isPaperHit(e.clientX, e.clientY)
            || !!heroScene.isSwitchHit(e.clientX, e.clientY);
        hero3d.classList.toggle('hero-3d--pointer', hover);
    });
    hero3d.addEventListener('mouseleave', () => {
        hero3d.classList.remove('hero-3d--pointer');
    });

    // Añadir evento click sobre los patos del escritorio y de la estanteria: son dos patos distintos
    hero3d.addEventListener('click', (e) => {
        if (hero3d.classList.contains('expanded') || !heroScene || !window.triggerDuckClick) return;

        if (heroScene.isDeskDuckHit(e.clientX, e.clientY)) {
            window.triggerDuckClick('hero-desk');
        } else if (heroScene.isShelfDuckHit(e.clientX, e.clientY)) {
            window.triggerDuckClick('hero-shelf');
        }
    });

    // Añadir evento click sobre las tazas (escritorio y estanteria): reproduce un "sorbo"
    const cupSip = new Audio('assets/objects/sorbo.mp3');
    hero3d.addEventListener('click', (e) => {
        if (hero3d.classList.contains('expanded') || !heroScene) return;
        if (!heroScene.isCupHit(e.clientX, e.clientY)) return;

        cupSip.currentTime = 0;
        cupSip.play().catch(() => {});

        if (window.unlockAchievement) window.unlockAchievement('cup-sip');
    });

    // Añadir evento click sobre el papel del CV que sostiene la persona: abre el PDF en una pestaña nueva
    hero3d.addEventListener('click', (e) => {
        if (hero3d.classList.contains('expanded') || !heroScene) return;
        if (!heroScene.isPaperHit(e.clientX, e.clientY)) return;

        window.open('assets/cv/Cesar_SobrinoArribas_CV.pdf', '_blank', 'noopener,noreferrer');

        if (window.unlockAchievement) window.unlockAchievement('cv-download');
    });

    // Añadir evento click sobre los interruptores de la pared: cambian la iluminación (día/tarde/noche)
    const switchSound = new Audio('assets/objects/interruptor.mp3');
    const triedLightingModes = new Set();
    hero3d.addEventListener('click', (e) => {
        if (hero3d.classList.contains('expanded') || !heroScene) return;
        const mode = heroScene.isSwitchHit(e.clientX, e.clientY);
        if (!mode) return;

        switchSound.currentTime = 0;
        switchSound.play().catch(() => {});

        window.heroLighting.setMode(mode);

        triedLightingModes.add(mode);
        if (triedLightingModes.size >= 3 && window.unlockAchievement) {
            window.unlockAchievement('lighting-explorer');
        }
    });

    // Añadir evento click al botón "Entrar" para hacer scroll hasta la sección "Sobre mí"
    const btnEntrar = document.querySelector('.btn-entrar');
    if (btnEntrar) {
        btnEntrar.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que el click se propague al portátil

            // Si ya está en marcha el scroll (o ya hicimos click antes), ignoramos clicks repetidos:
            // cada llamada a lenis.scrollTo() cancela la animación anterior y empieza de cero,
            // por eso varios clicks seguidos hacían que solo "funcionara" el último.
            if (btnEntrar.disabled) return;

            btnEntrar.disabled = true;
            btnEntrar.classList.add('is-loading');

            let settled = false;
            let safetyTimer = null;

            // onComplete solo salta si el scroll termina de forma natural: si el usuario lo
            // interrumpe (rueda del ratón, touch, u otro scroll manual) o si por lo que sea
            // nunca llega a completarse, el botón se quedaba bloqueado para siempre.
            // Por eso lo reactivamos también ante cualquier señal de scroll manual o, como
            // último recurso, con un temporizador de seguridad.
            const reenableBtn = () => {
                if (settled) return;
                settled = true;
                btnEntrar.disabled = false;
                btnEntrar.classList.remove('is-loading');
                clearTimeout(safetyTimer);
                window.removeEventListener('wheel', reenableBtn);
                window.removeEventListener('touchstart', reenableBtn);
                window.removeEventListener('keydown', reenableBtn);
            };

            window.addEventListener('wheel', reenableBtn, { passive: true, once: true });
            window.addEventListener('touchstart', reenableBtn, { passive: true, once: true });
            window.addEventListener('keydown', reenableBtn, { once: true });
            safetyTimer = setTimeout(reenableBtn, 4000); // Red de seguridad (duracion + margen)

            // Hacer scroll hasta la sección "Sobre mí" (id="portfolio" o clase ".intro")
            lenis.scrollTo('.intro', {
                duration: 3.5,
                easing: (t) => {
                    // Easing custom: arranca algo más rápido y acelera al final (easeInCubic)
                    return t * t * t;
                },
                onComplete: reenableBtn
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
const introParagraphSplits = introParagraphs.map((p) => {
    // Dividimos el texto en líneas y letras usando SplitType (una sola pasada)
    const splitText = new SplitType(p, { types: 'lines, chars' });

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

    return { p, splitText };
});

// Efecto "lupa al revés": las letras del texto de "Sobre mí" se repelen del cursor al pasar por encima
const setupIntroRepelEffect = () => {
    const repelMM = gsap.matchMedia();

    repelMM.add("(hover: hover) and (pointer: fine)", () => {
        const container = document.querySelector(".intro-right");
        if (!container || introParagraphSplits.length === 0) return;

        const RADIUS = 200; // Radio de influencia del cursor en px
        const RADIUS_SQ = RADIUS * RADIUS;
        const MAX_PUSH = 110; // Desplazamiento máximo de cada letra en px

        // Agrupamos las letras por línea para poder descartar de golpe (broad-phase)
        // las líneas que están lejos del cursor, en vez de comprobar las ~500 letras siempre.
        let lines = [];
        let activeChars = new Set();

        const buildChars = () => {
            lines = [];
            activeChars = new Set();
            introParagraphSplits.forEach(({ splitText }) => {
                splitText.lines.forEach((lineEl) => {
                    const lineChars = lineEl.querySelectorAll(".char");
                    if (!lineChars.length) return;

                    const charsData = Array.from(lineChars).map((char) => {
                        gsap.set(char, { x: 0, y: 0 });
                        const rect = char.getBoundingClientRect();
                        return {
                            cx: rect.left + window.scrollX + rect.width / 2,
                            cy: rect.top + window.scrollY + rect.height / 2,
                            moveX: gsap.quickTo(char, "x", { duration: 0.5, ease: "power3.out" }),
                            moveY: gsap.quickTo(char, "y", { duration: 0.5, ease: "power3.out" })
                        };
                    });

                    const lineRect = lineEl.getBoundingClientRect();
                    lines.push({
                        top: lineRect.top + window.scrollY - RADIUS,
                        bottom: lineRect.bottom + window.scrollY + RADIUS,
                        chars: charsData
                    });
                });
            });
        };

        buildChars();

        let pendingEvent = null;
        let rafId = null;

        const processMove = () => {
            rafId = null;
            if (!pendingEvent) return;

            const pointerX = pendingEvent.clientX + window.scrollX;
            const pointerY = pendingEvent.clientY + window.scrollY;
            pendingEvent = null;

            const nextActive = new Set();

            lines.forEach((line) => {
                // Descarte rápido: si el cursor no está cerca verticalmente de esta línea, saltamos todas sus letras
                if (pointerY < line.top || pointerY > line.bottom) return;

                line.chars.forEach((char) => {
                    const dx = char.cx - pointerX;
                    const dy = char.cy - pointerY;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < RADIUS_SQ) {
                        const distance = Math.sqrt(distSq) || 1;
                        const strength = 1 - distance / RADIUS;
                        char.moveX((dx / distance) * strength * MAX_PUSH);
                        char.moveY((dy / distance) * strength * MAX_PUSH);
                        nextActive.add(char);
                    }
                });
            });

            // Solo reseteamos las letras que dejan de estar activas (no todas cada frame)
            activeChars.forEach((char) => {
                if (!nextActive.has(char)) {
                    char.moveX(0);
                    char.moveY(0);
                }
            });
            activeChars = nextActive;
        };

        const onMove = (event) => {
            pendingEvent = event;
            if (rafId === null) {
                rafId = requestAnimationFrame(processMove);
            }
        };

        const onLeave = () => {
            pendingEvent = null;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            activeChars.forEach((char) => {
                char.moveX(0);
                char.moveY(0);
            });
            activeChars = new Set();
        };

        const debouncedRemeasure = debounce(buildChars, 200);

        container.addEventListener("mousemove", onMove, { passive: true });
        container.addEventListener("mouseleave", onLeave);
        window.addEventListener("resize", debouncedRemeasure);

        return () => {
            container.removeEventListener("mousemove", onMove);
            container.removeEventListener("mouseleave", onLeave);
            window.removeEventListener("resize", debouncedRemeasure);
            if (rafId !== null) cancelAnimationFrame(rafId);
            introParagraphSplits.forEach(({ splitText }) => {
                gsap.set(splitText.chars, { x: 0, y: 0 });
            });
        };
    });
};

setupIntroRepelEffect();

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

// Calcular y mostrar la experiencia (años/meses) desde data-since
document.querySelectorAll(".lang-info[data-since]").forEach((info) => {
    const since = new Date(info.dataset.since);
    const now = new Date();
    let months = (now.getFullYear() - since.getFullYear()) * 12 + (now.getMonth() - since.getMonth());
    if (now.getDate() < since.getDate()) months--;
    months = Math.max(months, 0);

    const experienceEl = info.querySelector(".lang-experience");
    if (!experienceEl) return;

    if (months < 12) {
        experienceEl.textContent = months <= 1 ? "1 mes" : `${months} meses`;
    } else {
        const years = Math.floor(months / 12);
        experienceEl.textContent = years === 1 ? "1 año" : `${years} años`;
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

// Pinear el título de "Sobre mí" solo a partir de la mitad del scroll de la sección
const introMM = gsap.matchMedia();

introMM.add("(min-width: 768px)", () => {
    const introSection = document.querySelector(".block.intro");
    const introTitle = document.querySelector(".intro-left .sticky-wrapper");
    if (!introSection || !introTitle) return;

    const introTrigger = ScrollTrigger.create({
        trigger: introSection,
        start: () => {
            // Mitad del recorrido de la sección a través del viewport
            // (desde que empieza a entrar por abajo hasta que sale por abajo),
            // así el rango siempre es positivo aunque la sección sea más baja que la pantalla.
            const top = introSection.getBoundingClientRect().top + window.scrollY;
            const height = introSection.offsetHeight;
            return top - window.innerHeight + height / 2;
        },
        end: "bottom+=200 bottom", // Se libera un poco más tarde del final de la sección
        pin: introTitle,
        pinSpacing: false,
        invalidateOnRefresh: true
    });

    return () => {
        introTrigger.kill();
    };
});

// Subrayado que se rellena según el progreso de scroll del propio contenedor (reutilizable)
const setupContainerUnderline = (sectionSelector, fillId, earlyFinish = 1) => {
    const section = document.querySelector(sectionSelector);
    const underlineFill = document.getElementById(fillId);
    if (!section || !underlineFill) return;

    ScrollTrigger.create({
        trigger: section,
        start: "top bottom", // La sección empieza a entrar por abajo
        end: "bottom top",   // La sección termina de salir por arriba
        scrub: true,
        onUpdate: (self) => {
            const adjusted = Math.min(1, self.progress / earlyFinish);
            underlineFill.style.width = `${adjusted * 100}%`;
        }
    });
};

// Línea bajo "Sobre mí": se completa al llegar al 75% del recorrido
setupContainerUnderline(".block.intro", "introUnderlineFill", 0.75);

// Línea bajo "Lenguajes utilizados" en escritorio se controla desde el propio pin (langTl, más abajo),
// ya que su scroll real es mucho más largo que la sección en sí.

// Usar matchMedia para aplicar diferentes configuraciones según el tamaño de pantalla
let mm = gsap.matchMedia();

mm.add("(min-width: 768px)", () => {
    // En lugar de ocultar con set, usamos from() en la timeline para que GSAP maneje el estado inicial
    // Asegurarnos de que el contenedor izquierdo esté en su posición original
    gsap.set(".languages-left", { y: 0 });

    // Configuración para Desktop
    const languagesUnderlineFill = document.getElementById("languagesUnderlineFill");

    const langTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".block.languages",
            start: "center center", // Pinear cuando el centro de la sección llega al centro de la pantalla
            end: "+=3000", // Aumentado el tiempo de pin para dar cabida a las categorías
            pin: ".languages-layout",
            scrub: 1,
            onUpdate: (self) => {
                // El subrayado sigue el progreso real del scroll pineado (mucho más largo que la sección en sí)
                if (languagesUnderlineFill) {
                    languagesUnderlineFill.style.width = `${self.progress * 100}%`;
                }
            }
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
    // En móvil no hay pin, así que el subrayado sigue el progreso geométrico normal de la sección
    setupContainerUnderline(".block.languages", "languagesUnderlineFill");

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

// Hacer scroll hacia arriba suavemente al hacer clic.
// La web usa Lenis para el scroll suave: Lenis controla la posición real
// en su propio rAF, así que un window.scrollTo() nativo se pisa en cuanto
// hay inercia o scroll en curso. Hay que pedírselo a Lenis directamente.
scrollToTopBtn.addEventListener("click", () => {
    lenis.scrollTo(0, {
        duration: 1.2,
    });
});

// --- Timeline Animation ---
// Fase 1: scroll que hace zoom sobre la "p" de "Experiencia" hasta "entrar" por ella.
// Fase 2: timeline 3D tumbado que se recorre en el eje Z (dolly de cámara) mientras
// cada evento aparece y desaparece al cruzar el punto de enfoque.
const setupTimelineAnimation = () => {
    const heroP = document.getElementById("timelineHeroP");
    const zoomStage = document.getElementById("timelineZoomStage");
    const zoomTitle = document.getElementById("timelineZoomTitle");
    const sceneStage = document.getElementById("timelineSceneStage");
    const scene = document.getElementById("timelineScene");
    const underlineFill = document.getElementById("timelineUnderlineFill");
    const roadDashes = gsap.utils.toArray(".timeline-road-dash");
    const ROAD_TOP = 38;
    const ROAD_BOTTOM = 120;
    const events = gsap.utils.toArray(".scene-event");
    const timelineSection = document.querySelector(".timeline-section");
    // Card "anclada" al lateral (Formación/Experiencia) que corresponde a cada card 3D,
    // por índice de orden en la escena (data-dock-index).
    const dockCards = gsap.utils.toArray(".timeline-dock-card");
    const getDockCard = (index) => dockCards.find((card) => Number(card.dataset.dockIndex) === index);

    if (!heroP || !zoomStage || !zoomTitle || !sceneStage || !scene || events.length === 0 || !timelineSection) return;

    const ZOOM_UNITS = 30;
    // EVENT_UNITS: duración total de la animación de cada card (entrada + acercamiento + salida), lenta.
    // STAGGER_UNITS: separación real entre el inicio de una card y la siguiente (menor que
    // EVENT_UNITS a propósito, para que se solapen y no tarden tanto en salir una tras otra).
    const EVENT_UNITS = 130;
    const STAGGER_UNITS = 65;

    let mm = gsap.matchMedia();

    const buildTimeline = (desktop) => {
        const eventDepth = desktop ? 2400 : 1500;

        // La palabra entera hace zoom convergiendo hacia el "ojo" (contraforma) de la "p".
        // Usamos la línea base real del texto + las métricas tight del glifo (canvas
        // measureText) en vez de un porcentaje fijo del bounding box, que varía según
        // el line-height y no coincide con el centro real del agujero de la letra.
        gsap.set(zoomTitle, { transformOrigin: "50% 50%" });
        const titleRect = zoomTitle.getBoundingClientRect();
        const pRect = heroP.getBoundingClientRect();

        const baselineMarker = document.createElement("span");
        baselineMarker.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline;";
        heroP.appendChild(baselineMarker);
        const baselineY = baselineMarker.getBoundingClientRect().top;
        baselineMarker.remove();

        const heroStyle = getComputedStyle(heroP);
        const measureCanvas = document.createElement("canvas");
        const ctx = measureCanvas.getContext("2d");
        ctx.font = `${heroStyle.fontStyle} ${heroStyle.fontWeight} ${heroStyle.fontSize} ${heroStyle.fontFamily}`;
        const metrics = ctx.measureText("p");
        const bowlHeight = metrics.actualBoundingBoxAscent || parseFloat(heroStyle.fontSize) * 0.5;
        const holeCenterY = baselineY - bowlHeight * 0.5;

        if (titleRect.width && titleRect.height) {
            const originX = ((pRect.left + pRect.width / 2 - titleRect.left) / titleRect.width) * 100;
            const originY = ((holeCenterY - titleRect.top) / titleRect.height) * 100;
            gsap.set(zoomTitle, { transformOrigin: `${originX}% ${originY}%` });
        }

        gsap.set(sceneStage, { autoAlpha: 0 });
        gsap.set(scene, { z: 0 });

        const ROAD_SPAN = ROAD_BOTTOM - ROAD_TOP;
        const drawDash = (dash, travel) => {
            const baseY = parseFloat(dash.dataset.y);
            // La raya viaja hacia abajo (hacia la cámara) y, al salir por el borde
            // inferior, reaparece arriba: sensación de recorrido infinito por el eje Z.
            const y = ROAD_TOP + (((baseY - ROAD_TOP + travel) % ROAD_SPAN) + ROAD_SPAN) % ROAD_SPAN;
            const ratio = (y - ROAD_TOP) / ROAD_SPAN;
            const len = 4 + ratio * ratio * 30;
            // El borde superior de la raya es el que marca su posición: así nunca
            // sobresale por encima del horizonte al reaparecer arriba.
            dash.setAttribute("y1", y);
            dash.setAttribute("y2", y + len);
        };

        roadDashes.forEach((dash) => drawDash(dash, 0));

        gsap.set(dockCards, { autoAlpha: 0, y: 12, scale: 0.94 });

        events.forEach((el, index) => {
            const side = index % 2 === 0 ? -1 : 1;
            const restX = desktop ? side * 50 : 0;
            // Corrección manual: la card de "Julio 2026" quedaba visualmente más abajo que
            // el resto por el efecto de perspectiva (la distancia cámara-card en ese punto
            // del scroll no coincide exactamente con la del resto), así que se sube un poco.
            const restY = el.querySelector(".node-date")?.textContent.trim() === "Julio 2026" ? 30 : 90;
            gsap.set(el, {
                z: -index * eventDepth,
                x: restX,
                y: restY - (desktop ? 320 : 200),
                autoAlpha: 0,
                scale: 0.08
            });
        });

        // La última card no se solapa con ninguna siguiente, así que con EVENT_UNITS
        // completo se quedaba con un tramo de scroll "muerto" tras desaparecer, antes de
        // soltar el pin. Se usa una duración propia más corta solo para ella.
        const LAST_EVENT_UNITS = EVENT_UNITS * 0.55;
        const totalUnits = ZOOM_UNITS + (events.length - 1) * STAGGER_UNITS + LAST_EVENT_UNITS;
        const addPinnedClass = () => timelineSection.classList.add("is-pinned");
        const removePinnedClass = () => timelineSection.classList.remove("is-pinned");

        const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
                trigger: timelineSection,
                start: "top top",
                end: `+=${totalUnits * 45}`,
                scrub: 0.6,
                pin: true,
                anticipatePin: 1,
                onEnter: addPinnedClass,
                onEnterBack: addPinnedClass,
                onLeave: removePinnedClass,
                onLeaveBack: removePinnedClass,
                onUpdate: (self) => {
                    if (underlineFill) {
                        // El subrayado solo avanza durante la fase 2 (escena 3D), una vez
                        // termina el zoom sobre la "p" y el div de la escena queda fijo.
                        const sceneProgress = gsap.utils.clamp(
                            0,
                            1,
                            (self.progress * totalUnits - ZOOM_UNITS) / (totalUnits - ZOOM_UNITS)
                        );
                        underlineFill.style.width = `${sceneProgress * 100}%`;
                    }

                    // Pocas rayas centrales, pero grandes: viajan hacia abajo (hacia la
                    // cámara) mientras el scroll avanza, alargándose por perspectiva a
                    // medida que se acercan, y vuelven a aparecer arriba al salir por abajo.
                    const travel = self.progress * ROAD_SPAN * 2.5;
                    roadDashes.forEach((dash) => drawDash(dash, travel));
                }
            }
        });

        // Fase 1: zoom sobre toda la palabra, convergiendo hacia la "p"
        tl.to(zoomTitle, { scale: 130, duration: ZOOM_UNITS * 0.75, ease: "power1.in" }, 0)
            .to(zoomStage.querySelector(".eyebrow"), { autoAlpha: 0, duration: ZOOM_UNITS * 0.5 }, 0)
            .to(zoomStage, { autoAlpha: 0, duration: ZOOM_UNITS * 0.25 }, ZOOM_UNITS * 0.75)
            .to(sceneStage, { autoAlpha: 1, duration: ZOOM_UNITS * 0.25 }, ZOOM_UNITS * 0.75);

        // Fase 2: dolly de cámara por el timeline 3D
        events.forEach((el, index) => {
            const isLast = index === events.length - 1;
            const cardUnits = isLast ? LAST_EVENT_UNITS : EVENT_UNITS;
            const start = ZOOM_UNITS + index * STAGGER_UNITS;
            const restY = el.querySelector(".node-date")?.textContent.trim() === "Julio 2026" ? 30 : 90;
            const enterY = restY - (desktop ? 320 : 200);

            tl.to(scene, { z: (index + 1) * eventDepth, duration: STAGGER_UNITS }, start);

            // La opacidad entra muy pronto (casi al empezar el segmento) y el crecimiento
            // (escala+bajada) ocupa casi todo el segmento, muy lento y gradual, para dar
            // sensación real de que la card viene acercándose desde muy lejos.
            tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: cardUnits * 0.15, ease: "power1.out" }, start)
                .fromTo(
                    el,
                    { scale: 0.08, y: enterY },
                    { scale: 1, y: restY, duration: cardUnits * 0.82, ease: "power1.out" },
                    start
                )
                .to(el, { autoAlpha: 0, scale: 1.15, duration: cardUnits * 0.18 }, start + cardUnits * 0.82);

            // En el mismo instante en que la card 3D "pasa de largo" y empieza a desvanecerse,
            // se revela su versión anclada en el lateral correspondiente (Formación/Experiencia),
            // como si se hubiera quedado fija ahí tras pasar por la cámara.
            const dockCard = getDockCard(index);
            if (dockCard) {
                tl.to(dockCard, {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    duration: cardUnits * 0.3,
                    ease: "power2.out"
                }, start + cardUnits * 0.22);
            }
        });

        return tl;
    };

    // En móvil no se construye la animación de zoom/3D: se muestra el timeline
    // estático normal (.timeline-fallback-list), ya visible por CSS en ese breakpoint.
    mm.add("(min-width: 769px)", () => {
        const tl = buildTimeline(true);
        return () => { tl.kill(); };
    });
};

// Call the setup function
setupTimelineAnimation();

// --- Projects Horizontal Scroll Animation ---
const setupProjectsGallery = () => {
    const track = document.querySelector(".projects-track");
    const gallery = document.querySelector(".projects-gallery");
    const underlineFill = document.getElementById("projectsUnderlineFill");

    if (!track || !gallery) return;

    // Un color de subrayado por proyecto, en el mismo orden que aparecen en el track
    const PROJECT_COLORS = ["#a855f7", "#f97316", "#38bdf8", "#ffffff"];

    const setUnderlineColor = (index) => {
        if (!underlineFill) return;
        const color = PROJECT_COLORS[index] || PROJECT_COLORS[0];
        underlineFill.style.background = color;
        underlineFill.style.boxShadow = `0 0 12px ${color}99`;
    };

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
        fastScrollEnd: true,
        onUpdate: (self) => {
            if (underlineFill) underlineFill.style.width = `${self.progress * 100}%`;
        }
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
        if (index >= 0) setUnderlineColor(index);
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

// --- Interacción de ratón (elevación 2D, sin tilt 3D) en las cards del timeline ---
// Se evita rotateX/rotateY/perspective aquí a propósito: anidaba un segundo contexto 3D
// dentro del que ya anima GSAP en la card y rompía el hit-testing de los enlaces internos.
const setupTimelineCardsPointerReaction = () => {
    const cardsMM = gsap.matchMedia();

    cardsMM.add("(min-width: 769px) and (hover: hover) and (pointer: fine)", () => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        const cards = gsap.utils.toArray(".scene-event");
        if (cards.length === 0) return;

        const listeners = [];

        cards.forEach((card) => {
            const onMouseEnter = () => card.classList.add("is-interactive");
            const onMouseLeave = () => card.classList.remove("is-interactive");

            card.addEventListener("mouseenter", onMouseEnter);
            card.addEventListener("mouseleave", onMouseLeave);

            listeners.push(() => {
                card.removeEventListener("mouseenter", onMouseEnter);
                card.removeEventListener("mouseleave", onMouseLeave);
                onMouseLeave();
            });
        });

        return () => {
            listeners.forEach((teardown) => teardown());
        };
    });
};

setupTimelineCardsPointerReaction();

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

    let clearCursorImageTimeout;

    const setCursorImage = (src) => {
        if (!src) return;
        window.clearTimeout(clearCursorImageTimeout);
        customCursorDot.style.setProperty('--cursor-img', `url("${src}")`);
        customCursorDot.classList.add('is-image');
    };

    const clearCursorImage = () => {
        customCursorDot.classList.remove('is-image');
        window.clearTimeout(clearCursorImageTimeout);
        clearCursorImageTimeout = window.setTimeout(() => {
            if (!customCursorDot.classList.contains('is-image')) {
                customCursorDot.style.removeProperty('--cursor-img');
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

    const cursorImageTargets = document.querySelectorAll('[data-cursor-image]');
    cursorImageTargets.forEach((target) => {
        const updateCursorImageState = () => {
            const src = target.getAttribute('data-cursor-image');
            if (!src) {
                clearCursorImage();
                return;
            }

            setCursorImage(src);
        };

        target.addEventListener('mouseenter', updateCursorImageState);
        target.addEventListener('mousemove', updateCursorImageState);
        target.addEventListener('mouseleave', clearCursorImage);
    });
}

// Iconos animados (Lottie) del nav: estáticos en reposo, se animan al hacer hover.
// Se pilotan manualmente frame a frame con un ease-out (rápido al empezar, lento al
// acabar) para que el efecto se note nada más pasar el ratón por encima.
function setupHoverLottieIcon(containerId, jsonPath, hoverTargetSelector, options = {}) {
    const container = document.getElementById(containerId);
    if (!container || typeof lottie === 'undefined') return;

    const anim = lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: jsonPath,
    });

    const hoverTarget = hoverTargetSelector ? container.closest(hoverTargetSelector) : container.closest('a, button');
    if (!hoverTarget) return;

    const HOVER_DURATION = options.duration || 900;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    let totalFrames = 0;
    let rafId = null;
    let startTime = null;

    anim.addEventListener('DOMLoaded', () => {
        totalFrames = anim.totalFrames;
    });

    const stepAnim = (timestamp) => {
        if (startTime === null) startTime = timestamp;
        const t = Math.min((timestamp - startTime) / HOVER_DURATION, 1);
        anim.goToAndStop(easeOutCubic(t) * (totalFrames - 1), true);
        rafId = t < 1 ? requestAnimationFrame(stepAnim) : null;
    };

    hoverTarget.addEventListener('mouseenter', () => {
        if (!totalFrames) return;
        if (rafId) cancelAnimationFrame(rafId);
        startTime = null;
        rafId = requestAnimationFrame(stepAnim);
    });

    hoverTarget.addEventListener('mouseleave', () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        startTime = null;
        anim.goToAndStop(0, true);
    });
}

setupHoverLottieIcon('navHomeIcon', 'assets/icons/home-button.json', 'a');
setupHoverLottieIcon('navStatsIcon', 'assets/icons/pie-chart.json', 'button');
setupHoverLottieIcon('paypalIcon', 'assets/icons/paypal-logo.json', 'a');
setupHoverLottieIcon('chatIcon', 'assets/icons/chat.json', 'button');
setupHoverLottieIcon('githubIcon', 'assets/icons/github.json', 'a');
setupHoverLottieIcon('linkedinIcon', 'assets/icons/linkedin.json', 'a');
setupHoverLottieIcon('cvIcon', 'assets/icons/file.json', 'a');
setupHoverLottieIcon('aiChatSendIcon', 'assets/icons/email.json', 'button', { duration: 1400 });
setupHoverLottieIcon('aiChatCloseIcon', 'assets/icons/close.json', 'button', { duration: 1400 });
setupHoverLottieIcon('scrollToTopIcon', 'assets/icons/up-arrow.json', 'button');
setupHoverLottieIcon('achievementsIcon', 'assets/icons/trophy.json', 'button');
setupHoverLottieIcon('achievementsCloseIcon', 'assets/icons/close.json', 'button', { duration: 1400 });
setupHoverLottieIcon('achievementsResetIcon', 'assets/icons/refresh.json', 'button', { duration: 1400 });

// Expuesto para achievements.js, que crea botones de cierre (con icono Lottie) dinámicamente
window.setupHoverLottieIcon = setupHoverLottieIcon;

// --- Patos escondidos por la web: mismo sonido y logro para todos ---
// duckId identifica a cada pato individual, para el logro "Quack experto" (pulsarlos todos)
const siteDuckQuak = new Audio('assets/objects/quak.mp3');
function triggerDuckClick(duckId) {
    siteDuckQuak.currentTime = 0;
    siteDuckQuak.play().catch(() => {});

    if (window.registerDuckClick) {
        window.registerDuckClick(duckId);
    } else if (window.unlockAchievement) {
        window.unlockAchievement('duck-click');
    }
}
window.triggerDuckClick = triggerDuckClick;

const DECORATIVE_DUCKS = {
    projectDuck: 'projects',
    footerDuck: 'footer',
    aiChatDuckBtn: 'ai-chat'
};

Object.keys(DECORATIVE_DUCKS).forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const duckId = DECORATIVE_DUCKS[id];
    el.addEventListener('click', () => triggerDuckClick(duckId));

    // Los patos que no son <button> nativo (div/img con role="button") necesitan soporte de teclado a mano
    if (el.getAttribute('role') === 'button') {
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerDuckClick(duckId);
            }
        });
    }
});

// Efecto "máquina de escribir" en los enlaces de texto del nav al hacer hover:
// se parte el texto en letras y se revelan en cascada, como si se tecleasen.
document.querySelectorAll('.nav-links > li > a:not(.nav-icon)').forEach((link) => {
    const chars = Array.from(link.textContent).map((ch) => {
        const span = document.createElement('span');
        span.textContent = ch === ' ' ? ' ' : ch;
        span.style.display = 'inline-block';
        return span;
    });

    link.textContent = '';
    chars.forEach((span) => link.appendChild(span));

    let tween = null;

    link.addEventListener('mouseenter', () => {
        if (tween) tween.kill();
        tween = gsap.fromTo(
            chars,
            { opacity: 0 },
            { opacity: 1, duration: 0.02, stagger: 0.035, ease: 'none' }
        );
    });

    link.addEventListener('mouseleave', () => {
        if (tween) tween.kill();
        gsap.set(chars, { opacity: 1 });
    });
});

// Overlay de aviso en móvil: recomienda ver la web desde ordenador.
(function setupMobileWarningOverlay() {
    const overlay = document.getElementById('mobileWarningOverlay');
    const btn = document.getElementById('mobileWarningBtn');
    if (!overlay || !btn) return;

    btn.addEventListener('click', () => {
        overlay.classList.add('is-hidden');
    });
})();

// Scrollspy: resalta en el nav el enlace de la sección actualmente visible.
(function setupNavScrollSpy() {
    const navLinks = Array.from(document.querySelectorAll('.nav-links > li > a[href^="#"]'));
    if (navLinks.length === 0) return;

    const sections = navLinks
        .map((link) => {
            const id = link.getAttribute('href').slice(1);
            const section = document.getElementById(id);
            return section ? { link, section } : null;
        })
        .filter(Boolean);

    if (sections.length === 0) return;

    const setActiveLink = (activeLink) => {
        navLinks.forEach((link) => link.classList.toggle('active', link === activeLink));
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const match = sections.find((s) => s.section === entry.target);
            if (match) setActiveLink(match.link);
        });
    }, {
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0
    });

    sections.forEach(({ section }) => observer.observe(section));
})();