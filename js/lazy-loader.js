// Carga diferida de librerias/recursos pesados (three.js, GLTFLoader, Vanta, Matter.js,
// videos de proyectos) para que el primer render/splash no dependa de ellos.
// Se dispara en window 'load' (cuando ya cargo todo lo necesario), justo cuando el
// splash screen empieza a cerrarse, y trae el resto en segundo plano.
(function () {
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    function lazyLoadProjectVideos() {
        const videos = document.querySelectorAll('video.project-gif[data-src]');
        if (!videos.length) return;

        const startVideo = (video) => {
            video.src = video.dataset.src;
            video.load();
            video.play().catch(() => { /* autoplay puede requerir interaccion en algunos navegadores */ });
        };

        if (!('IntersectionObserver' in window)) {
            videos.forEach(startVideo);
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    startVideo(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '300px' });

        videos.forEach((video) => observer.observe(video));
    }

    function loadHeavyAssets() {
        lazyLoadProjectVideos();

        loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
            .then(() => loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/loaders/GLTFLoader.js'))
            .then(() => {
                if (typeof window.initHeroScene === 'function') {
                    window.initHeroScene();
                }
                return loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js');
            })
            .then(() => {
                if (typeof window.initVantaBirds === 'function') {
                    window.initVantaBirds();
                }
            })
            .catch(() => { /* si falla el CDN, la web sigue funcionando sin estos extras decorativos */ });

        loadScript('https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js')
            .then(() => {
                if (typeof window.initLanguagesMatter === 'function') {
                    window.initLanguagesMatter();
                }
            })
            .catch(() => { /* si falla el CDN, el comparador de lenguajes se queda en modo lista */ });
    }

    if (document.readyState === 'complete') {
        loadHeavyAssets();
    } else {
        window.addEventListener('load', loadHeavyAssets);
    }
})();
