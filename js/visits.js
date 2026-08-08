(function () {
    console.log("v2");
    const PROD_API_BASE = "https://cesarsobapigateway.up.railway.app";
    const DEV_API_BASE = "http://localhost:5112";
    const BOT_UA_PATTERN = /(bot|crawler|spider|slurp|curl|wget|python-requests|headless|phantom|scrapy|httpclient|monitor|uptime)/i;
    const DEV_HOSTNAME_PATTERN = /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$/i;

    function isDevEnvironment() {
        return window.location.protocol === "file:" ||
            DEV_HOSTNAME_PATTERN.test(window.location.hostname) ||
            window.location.hostname.endsWith(".local");
    }

    const API_BASE = isDevEnvironment() ? DEV_API_BASE : PROD_API_BASE;
    const VISIT_ENDPOINT = API_BASE + "/api/Visits/addvisit";
    const PROJECT_VISIT_ENDPOINT = API_BASE + "/api/Visits/addvisitingproyect";

    const MAX_VISIT_RETRIES = 3;

    let hasRegisteredVisit = false;
    let visitAttempts = 0;
    let hasInteraction = false;
    let visibleStartedAt = document.visibilityState === "visible" ? Date.now() : 0;
    let visibleAccumulatedMs = 0;

    function getVisitParam() {
        const queryParam = new URLSearchParams(window.location.search).get("visitparams");
        if (queryParam) {
            return queryParam;
        }

        const segments = window.location.pathname.split("/").filter(Boolean);
        const visitParamsIndex = segments.findIndex(function (segment) {
            return segment.toLowerCase() === "visitparams";
        });

        if (visitParamsIndex !== -1 && segments[visitParamsIndex + 1]) {
            return decodeURIComponent(segments[visitParamsIndex + 1]);
        }

        return null;
    }

    function isLikelyBot() {
        const userAgent = navigator.userAgent || "";
        const webdriver = navigator.webdriver === true;

        return webdriver || BOT_UA_PATTERN.test(userAgent);
    }

    function getVisibleElapsedMs() {
        if (document.visibilityState === "visible" && visibleStartedAt > 0) {
            return visibleAccumulatedMs + (Date.now() - visibleStartedAt);
        }

        return visibleAccumulatedMs;
    }

    function onVisibilityChange() {
        if (document.visibilityState === "visible") {
            visibleStartedAt = Date.now();
        } else if (visibleStartedAt > 0) {
            visibleAccumulatedMs += Date.now() - visibleStartedAt;
            visibleStartedAt = 0;
        }

        tryRegisterVisit();
    }

    function markInteraction() {
        hasInteraction = true;
        tryRegisterVisit();
    }

    async function registerVisit() {
        try {
            const visitParam = getVisitParam();
            const endpointUrl = new URL(VISIT_ENDPOINT);

            if (visitParam) {
                endpointUrl.searchParams.set("visitparams", visitParam);
            }

            await fetch(endpointUrl.toString(), {
                method: "POST",
                mode: "cors",
                credentials: "omit",
                cache: "no-store"
            });
        } catch (error) {
            visitAttempts += 1;

            if (visitAttempts >= MAX_VISIT_RETRIES) {
                console.warn("No se pudo registrar la visita tras " + visitAttempts + " intentos, se deja de reintentar:", error);
                return;
            }

            console.warn("No se pudo registrar la visita (intento " + visitAttempts + "/" + MAX_VISIT_RETRIES + "):", error);
            hasRegisteredVisit = false;
        }
    }

    function canRegisterVisit() {
        if (hasRegisteredVisit || isLikelyBot()) {
            return false;
        }

        const visibleMs = getVisibleElapsedMs();
        const engagedByTime = visibleMs >= 12000;
        const engagedByInteraction = hasInteraction && visibleMs >= 2500;

        return engagedByTime || engagedByInteraction;
    }

    function cleanupSignals() {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        window.removeEventListener("pointerdown", markInteraction);
        window.removeEventListener("keydown", markInteraction);
        window.removeEventListener("scroll", markInteraction);
        window.removeEventListener("touchstart", markInteraction);
    }

    function tryRegisterVisit() {
        if (!canRegisterVisit()) {
            return;
        }

        hasRegisteredVisit = true;
        cleanupSignals();
        registerVisit();
    }

    function scheduleRegisterVisit() {
        document.addEventListener("visibilitychange", onVisibilityChange);
        window.addEventListener("pointerdown", markInteraction, { passive: true });
        window.addEventListener("keydown", markInteraction, { passive: true });
        window.addEventListener("scroll", markInteraction, { passive: true });
        window.addEventListener("touchstart", markInteraction, { passive: true });

        // Periodically re-check in case the user only reads without interacting.
        const recheckId = window.setInterval(function () {
            if (hasRegisteredVisit) {
                window.clearInterval(recheckId);
                return;
            }

            tryRegisterVisit();
        }, 3000);

        // Initial check after load.
        window.setTimeout(tryRegisterVisit, 4000);
    }

    if (document.readyState === "complete") {
        scheduleRegisterVisit();
    } else {
        window.addEventListener("load", scheduleRegisterVisit, { once: true });
    }

    function registerProjectVisit(proyect) {
        try {
            const visitParam = getVisitParam();
            const endpointUrl = new URL(PROJECT_VISIT_ENDPOINT);

            if (visitParam) {
                endpointUrl.searchParams.set("visitparams", visitParam);
            }
            endpointUrl.searchParams.set("proyect", proyect);

            fetch(endpointUrl.toString(), {
                method: "POST",
                mode: "cors",
                credentials: "omit",
                cache: "no-store"
            }).catch(function (error) {
                console.warn("No se pudo registrar la visita al proyecto:", error);
            });
        } catch (error) {
            console.warn("No se pudo registrar la visita al proyecto:", error);
        }
    }

    function setupProjectVisitTracking() {
        document.querySelectorAll(".project-link").forEach(function (link) {
            link.addEventListener("click", function () {
                const proyect = link.dataset.cursorText || link.href;
                registerProjectVisit(proyect);
            });
        });
    }

    if (document.readyState === "complete") {
        setupProjectVisitTracking();
    } else {
        window.addEventListener("load", setupProjectVisitTracking, { once: true });
    }
})();
