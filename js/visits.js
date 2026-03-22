(function () {
    const VISIT_ENDPOINT = "https://cesarsobapi-csa-workspace.up.railway.app/api/Visits/addvisit";

    async function registerVisit() {
        try {
            await fetch(VISIT_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                // Campos basicos para que el backend pueda trazar la visita si los necesita.
                body: JSON.stringify({
                    path: window.location.pathname,
                    referrer: document.referrer || null,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                }),
                keepalive: true
            });
        } catch (error) {
            console.warn("No se pudo registrar la visita:", error);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", registerVisit, { once: true });
        return;
    }

    registerVisit();
})();
