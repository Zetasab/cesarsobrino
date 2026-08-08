(function () {
    // Sistema de logros: se guardan en localStorage (solo en este navegador).
    // Cada logro tiene un icono propio en assets/img/achievements/<icon>.png
    const STORAGE_KEY = "cesarsobrino_achievements";
    const UNREAD_KEY = "cesarsobrino_achievements_unread";

    const ACHIEVEMENTS = [
        {
            id: "bottom-scroll",
            icon: "bottom",
            title: "¡Has llegado abajo!",
            desc: "Completaste todo el scroll de la web"
        },
        {
            id: "duck-click",
            icon: "duck",
            title: "Cuack curioso",
            desc: "Hiciste sonar el pato del escritorio"
        },
        {
            id: "cup-sip",
            icon: "coffee",
            title: "Sorbo de café",
            desc: "Probaste una de las tazas de café"
        },
        {
            id: "lighting-explorer",
            icon: "lightswitch",
            title: "Interruptor maestro",
            desc: "Probaste los 3 modos de iluminación (día, tarde, noche)"
        },
        {
            id: "chat-opened",
            icon: "ai",
            title: "Rompiendo el hielo",
            desc: "Abriste el asistente de IA"
        },
        {
            id: "cv-download",
            icon: "cv",
            title: "Reclutador al acecho",
            desc: "Descargaste el CV"
        },
        // Pendiente: "Quack esperto" (pulsar todos los patos ocultos de la web).
        // Se añadirá cuando haya más patos repartidos por la página (icono ya disponible: goldenegg.png).
        {
            id: "paypal-donate",
            icon: "paypal",
            title: "Donante",
            desc: "Pulsaste el botón de PayPal"
        },
        {
            id: "project-click",
            icon: "work",
            title: "Trabajador",
            desc: "Abriste uno de los proyectos"
        },
        {
            id: "linkedin-click",
            icon: "linkedin",
            title: "Profesional",
            desc: "Abriste el LinkedIn"
        },
        {
            id: "github-click",
            icon: "github",
            title: "Curioso",
            desc: "Abriste el GitHub"
        }
    ];

    const ACHIEVEMENTS_BY_ID = {};
    ACHIEVEMENTS.forEach(function (a) { ACHIEVEMENTS_BY_ID[a.id] = a; });

    function iconPath(achievement) {
        return "assets/img/achievements/" + achievement.icon + ".png";
    }

    function loadUnlocked() {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    let unlocked = loadUnlocked();

    function saveUnlocked() {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
        } catch (e) {
            // localStorage no disponible (modo privado, etc.): el logro solo dura la sesión
        }
    }

    function isUnlocked(id) {
        return Boolean(unlocked[id]);
    }

    function loadUnreadCount() {
        try {
            const raw = window.localStorage.getItem(UNREAD_KEY);
            const n = raw ? parseInt(raw, 10) : 0;
            return Number.isNaN(n) ? 0 : n;
        } catch (e) {
            return 0;
        }
    }

    let unreadCount = loadUnreadCount();
    let badgeEl = null;

    function saveUnreadCount() {
        try {
            window.localStorage.setItem(UNREAD_KEY, String(unreadCount));
        } catch (e) {
            // localStorage no disponible: el badge solo dura la sesión
        }
    }

    function renderBadge() {
        if (!badgeEl) return;
        if (unreadCount > 0) {
            badgeEl.textContent = unreadCount > 9 ? "9+" : String(unreadCount);
            badgeEl.classList.add("visible");
        } else {
            badgeEl.textContent = "";
            badgeEl.classList.remove("visible");
        }
    }

    function markAsRead() {
        if (unreadCount === 0) return;
        unreadCount = 0;
        saveUnreadCount();
        renderBadge();
    }

    let panelListEl = null;
    let panelCountEl = null;

    function renderPanel() {
        if (!panelListEl) return;

        panelListEl.innerHTML = "";
        ACHIEVEMENTS.forEach(function (achievement) {
            const got = isUnlocked(achievement.id);

            const item = document.createElement("div");
            item.className = "achievement-item" + (got ? " achievement-item-unlocked" : " achievement-item-locked");

            const icon = document.createElement("img");
            icon.className = "achievement-icon";
            icon.src = iconPath(achievement);
            icon.alt = achievement.title;
            icon.loading = "lazy";
            icon.draggable = false;

            const text = document.createElement("div");
            text.className = "achievement-text";

            const title = document.createElement("p");
            title.className = "achievement-title";
            title.textContent = achievement.title;

            const desc = document.createElement("p");
            desc.className = "achievement-desc";
            desc.textContent = achievement.desc;

            text.appendChild(title);
            text.appendChild(desc);
            item.appendChild(icon);
            item.appendChild(text);
            panelListEl.appendChild(item);
        });

        if (panelCountEl) {
            const total = ACHIEVEMENTS.length;
            const gotCount = ACHIEVEMENTS.filter(function (a) { return isUnlocked(a.id); }).length;
            panelCountEl.textContent = gotCount + "/" + total;
        }
    }

    const TOAST_DURATION_MS = 5000;
    let toastSeq = 0;

    function showToast(achievement) {
        const wrapper = document.querySelector(".achievements-btn-wrapper");
        if (!wrapper) return;

        toastSeq += 1;
        const closeIconId = "achievementToastClose-" + toastSeq;

        // Si ya hay una notificación en pantalla, la quitamos de golpe para que no se amontonen
        const existing = wrapper.querySelector(".achievement-toast");
        if (existing) existing.remove();

        const toast = document.createElement("div");
        toast.className = "achievement-toast";
        toast.innerHTML =
            '<img class="achievement-toast-icon" src="' + iconPath(achievement) + '" alt="" draggable="false" />' +
            '<div class="achievement-toast-body">' +
                '<div class="achievement-toast-row">' +
                    '<div class="achievement-toast-text">' +
                        '<p class="achievement-toast-label">Logro desbloqueado</p>' +
                        '<p class="achievement-toast-title">' + achievement.title + '</p>' +
                    '</div>' +
                    '<button type="button" class="achievement-toast-close" aria-label="Cerrar notificación">' +
                        '<span id="' + closeIconId + '" class="ai-chat-icon-lottie" aria-hidden="true"></span>' +
                    '</button>' +
                '</div>' +
                '<div class="achievement-toast-progress">' +
                    '<div class="achievement-toast-progress-fill"></div>' +
                '</div>' +
            '</div>';

        wrapper.appendChild(toast);

        const progressFill = toast.querySelector(".achievement-toast-progress-fill");
        const closeBtn = toast.querySelector(".achievement-toast-close");

        let dismissTimer = null;
        let removeTimer = null;

        function dismiss() {
            if (dismissTimer) window.clearTimeout(dismissTimer);
            if (removeTimer) window.clearTimeout(removeTimer);
            toast.classList.remove("visible");
            removeTimer = window.setTimeout(function () {
                toast.remove();
            }, 400);
        }

        closeBtn.addEventListener("click", function (event) {
            event.stopPropagation();
            dismiss();
        });

        // Pulsar la notificación (fuera del botón de cerrar) abre el menú de logros
        toast.classList.add("achievement-toast-clickable");
        toast.addEventListener("click", function () {
            dismiss();
            openPanel();
        });

        if (window.setupHoverLottieIcon) {
            window.setupHoverLottieIcon(closeIconId, "assets/icons/close.json", "button", { duration: 1400 });
        }

        // Forzamos reflow para que el navegador registre el estado inicial (oculto, barra al 100%)
        // antes de activar las transiciones; así funciona igual en pestañas en segundo plano,
        // donde requestAnimationFrame puede no llegar a dispararse.
        void toast.offsetWidth;
        toast.classList.add("visible");
        if (progressFill) {
            progressFill.style.transitionDuration = TOAST_DURATION_MS + "ms";
            void progressFill.offsetWidth;
            progressFill.style.width = "0%";
        }

        dismissTimer = window.setTimeout(dismiss, TOAST_DURATION_MS);
    }

    function unlockAchievement(id) {
        if (isUnlocked(id)) return;

        const achievement = ACHIEVEMENTS_BY_ID[id];
        if (!achievement) return;

        unlocked[id] = new Date().toISOString();
        saveUnlocked();
        showToast(achievement);
        renderPanel();

        unreadCount += 1;
        saveUnreadCount();
        renderBadge();
    }

    window.unlockAchievement = unlockAchievement;

    // --- Panel toggle ---
    const toggleBtn = document.getElementById("achievementsToggle");
    const closeBtn = document.getElementById("achievementsClose");
    const panel = document.getElementById("achievementsPanel");

    panelListEl = document.getElementById("achievementsList");
    panelCountEl = document.getElementById("achievementsCount");
    badgeEl = document.getElementById("achievementsBadge");

    renderPanel();
    renderBadge();

    let isPanelOpen = false;

    function openPanel() {
        if (!panel || !toggleBtn) return;
        isPanelOpen = true;
        panel.classList.add("open");
        panel.setAttribute("aria-hidden", "false");
        toggleBtn.classList.add("active");
        markAsRead();
    }

    function closePanel() {
        if (!panel || !toggleBtn) return;
        isPanelOpen = false;
        panel.classList.remove("open");
        panel.setAttribute("aria-hidden", "true");
        toggleBtn.classList.remove("active");
    }

    if (toggleBtn && panel) {
        // Lenis intercepta el wheel globalmente; evitamos que se propague desde el panel.
        panel.addEventListener("wheel", function (event) {
            event.stopPropagation();
        }, { passive: true });

        toggleBtn.addEventListener("click", function () {
            if (isPanelOpen) {
                closePanel();
            } else {
                openPanel();
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener("click", closePanel);
        }
    }

    // --- Trigger: llegar al final del scroll ---
    window.addEventListener("scroll", function () {
        const scrolledToBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        if (scrolledToBottom) {
            unlockAchievement("bottom-scroll");
        }
    }, { passive: true });

    // --- Trigger: descarga de CV ---
    const cvLink = document.querySelector('.social-icon.cv');
    if (cvLink) {
        cvLink.addEventListener("click", function () {
            unlockAchievement("cv-download");
        });
    }

    // --- Trigger: botón de PayPal ---
    const paypalLink = document.querySelector('.paypal-btn');
    if (paypalLink) {
        paypalLink.addEventListener("click", function () {
            unlockAchievement("paypal-donate");
        });
    }

    // --- Trigger: abrir un proyecto ---
    document.querySelectorAll('.project-link').forEach(function (link) {
        link.addEventListener("click", function () {
            unlockAchievement("project-click");
        });
    });

    // --- Trigger: LinkedIn ---
    const linkedinLink = document.querySelector('.social-icon.linkedin');
    if (linkedinLink) {
        linkedinLink.addEventListener("click", function () {
            unlockAchievement("linkedin-click");
        });
    }

    // --- Trigger: GitHub ---
    const githubLink = document.querySelector('.social-icon.github');
    if (githubLink) {
        githubLink.addEventListener("click", function () {
            unlockAchievement("github-click");
        });
    }
})();
