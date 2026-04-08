(function () {
    console.log("v1");
    const VISIT_ENDPOINT = "https://cesarapi.up.railway.app/api/Visits/addvisit";
    // const VISIT_ENDPOINT = "http://localhost:5112/api/Visits/addvisit";

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
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", registerVisit, { once: true });
} else {
    registerVisit();
}
})();
