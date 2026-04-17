(function () {
    console.log("v2");
    const VISIT_ENDPOINT = "https://cesarsobapigateway.up.railway.app/api/Visits/addvisit";
    // const VISIT_ENDPOINT = "http://localhost:5112/api/Visits/addvisit";
    const BOT_UA_PATTERN = /(bot|crawler|spider|slurp|curl|wget|python-requests|headless|phantom|scrapy|httpclient|monitor|uptime)/i;

    let hasRegisteredVisit = false;
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
            console.warn("No se pudo registrar la visita:", error);
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
})();
