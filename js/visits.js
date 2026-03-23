(function () {
    console.log("v1");
    const VISIT_ENDPOINT = "https://cesarsobapi-csa-workspace.up.railway.app/api/Visits/addvisit";

async function registerVisit() {
    try {
        await fetch(VISIT_ENDPOINT, {
            method: "POST",
            mode: "cors",
            credentials: "omit",
            cache: "no-store"
        });
    } catch (error) {
        console.warn("No se pudo registrar la visita:", error);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", registerVisit, { once: true });
} else {
    registerVisit();
}
})();
