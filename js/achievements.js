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
            desc: "Hiciste sonar un pato"
        },
        {
            id: "quack-expert",
            icon: "goldenegg",
            title: "Quack experto",
            desc: "Pulsaste todos los patos escondidos por la web"
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
        },
        {
            id: "completionist",
            icon: "achivement",
            title: "Completista",
            desc: "Desbloqueaste todos los demás logros"
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

    // --- Patos escondidos: cuenta cuántos distintos se han pulsado, para "Quack experto" ---
    const DUCKS_STORAGE_KEY = "cesarsobrino_ducks_clicked";
    const ALL_DUCK_IDS = ["hero-desk", "hero-shelf", "languages", "projects", "footer", "ai-chat"];

    function loadClickedDucks() {
        try {
            const raw = window.localStorage.getItem(DUCKS_STORAGE_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            return new Set(Array.isArray(arr) ? arr.filter(function (id) { return ALL_DUCK_IDS.indexOf(id) !== -1; }) : []);
        } catch (e) {
            return new Set();
        }
    }

    let clickedDucks = loadClickedDucks();

    function saveClickedDucks() {
        try {
            window.localStorage.setItem(DUCKS_STORAGE_KEY, JSON.stringify(Array.from(clickedDucks)));
        } catch (e) {
            // localStorage no disponible: el progreso solo dura la sesión
        }
    }

    function registerDuckClick(duckId) {
        unlockAchievement("duck-click");

        if (ALL_DUCK_IDS.indexOf(duckId) !== -1 && !clickedDucks.has(duckId)) {
            clickedDucks.add(duckId);
            saveClickedDucks();
            renderPanel();
        }

        if (clickedDucks.size >= ALL_DUCK_IDS.length) {
            unlockAchievement("quack-expert");
        }
    }

    window.registerDuckClick = registerDuckClick;

    // --- Pistas: revela el título/descripción de un logro bloqueado sin desbloquearlo ---
    const HINTS_STORAGE_KEY = "cesarsobrino_achievements_hints";

    function loadRevealedHints() {
        try {
            const raw = window.localStorage.getItem(HINTS_STORAGE_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            return new Set(Array.isArray(arr) ? arr : []);
        } catch (e) {
            return new Set();
        }
    }

    let revealedHints = loadRevealedHints();

    function saveRevealedHints() {
        try {
            window.localStorage.setItem(HINTS_STORAGE_KEY, JSON.stringify(Array.from(revealedHints)));
        } catch (e) {
            // localStorage no disponible: la pista solo dura la sesión
        }
    }

    function toggleHint(id) {
        if (revealedHints.has(id)) {
            revealedHints.delete(id);
        } else {
            revealedHints.add(id);
        }
        saveRevealedHints();
        renderPanel();
    }

    const EYE_OPEN_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
    const EYE_OFF_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.62 21.62 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 7 11 7a21.6 21.6 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>';

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
            const hinted = revealedHints.has(achievement.id);
            const revealed = got || hinted;

            const item = document.createElement("div");
            item.className = "achievement-item" + (got ? " achievement-item-unlocked" : " achievement-item-locked");

            const main = document.createElement("div");
            main.className = "achievement-main";

            const icon = document.createElement("img");
            icon.className = "achievement-icon";
            icon.src = iconPath(achievement);
            icon.alt = revealed ? achievement.title : "Logro bloqueado";
            icon.loading = "lazy";
            icon.draggable = false;

            const text = document.createElement("div");
            text.className = "achievement-text";

            const title = document.createElement("p");
            title.className = "achievement-title";
            title.textContent = revealed ? achievement.title : "???";

            const desc = document.createElement("p");
            desc.className = "achievement-desc";
            desc.textContent = revealed ? achievement.desc : "Logro bloqueado";

            text.appendChild(title);
            text.appendChild(desc);

            if (achievement.id === "quack-expert" && !got) {
                const progress = document.createElement("p");
                progress.className = "achievement-progress";
                progress.textContent = clickedDucks.size + " / " + ALL_DUCK_IDS.length + " patos encontrados";
                text.appendChild(progress);
            }

            main.appendChild(icon);
            main.appendChild(text);
            item.appendChild(main);

            if (!got) {
                const hintBtn = document.createElement("button");
                hintBtn.type = "button";
                hintBtn.className = "achievement-hint-btn";
                hintBtn.setAttribute("aria-label", hinted ? "Ocultar pista" : "Ver pista");
                hintBtn.setAttribute("aria-pressed", String(hinted));
                hintBtn.innerHTML = hinted ? EYE_OFF_SVG : EYE_OPEN_SVG;
                hintBtn.addEventListener("click", function (event) {
                    event.stopPropagation();
                    toggleHint(achievement.id);
                });
                item.appendChild(hintBtn);
            }

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

    const CONFETTI_COLORS = ["#f59e0b", "#fbbf24", "#f97316", "#facc15", "#eab308", "#ffffff"];

    // Ráfaga de confeti a los lados del toast, puramente decorativa
    function spawnConfetti(container) {
        const pieceCount = 20;
        for (let i = 0; i < pieceCount; i++) {
            const piece = document.createElement("span");
            piece.className = "achievement-confetti";

            const side = i % 2 === 0 ? -1 : 1;
            const distance = 70 + Math.random() * 90;
            const x = side * distance;
            const y = (Math.random() * 120 - 60);
            const rot = Math.random() * 720 - 360;
            const size = 8 + Math.random() * 6;
            const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
            const delay = Math.random() * 150;

            piece.style.setProperty("--x", x + "px");
            piece.style.setProperty("--y", y + "px");
            piece.style.setProperty("--rot", rot + "deg");
            piece.style.width = size + "px";
            piece.style.height = size + "px";
            piece.style.background = color;
            piece.style.animationDelay = delay + "ms";

            container.appendChild(piece);
        }

        window.setTimeout(function () {
            container.querySelectorAll(".achievement-confetti").forEach(function (piece) {
                piece.remove();
            });
        }, 1900);
    }

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

        spawnConfetti(toast);

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

        if (id !== "completionist") {
            checkCompletion();
        }
    }

    // "Completista": se desbloquea solo al conseguir todos los demás logros
    function checkCompletion() {
        const allOthersUnlocked = ACHIEVEMENTS.every(function (a) {
            return a.id === "completionist" || isUnlocked(a.id);
        });
        if (allOthersUnlocked) {
            unlockAchievement("completionist");
        }
    }

    window.unlockAchievement = unlockAchievement;

    // --- Reiniciar logros: borra el progreso como si no se hubiera desbloqueado nada ---
    function resetAchievements() {
        unlocked = {};
        saveUnlocked();

        clickedDucks = new Set();
        saveClickedDucks();

        unreadCount = 0;
        saveUnreadCount();
        renderBadge();

        renderPanel();
    }

    // --- Panel toggle ---
    const toggleBtn = document.getElementById("achievementsToggle");
    const closeBtn = document.getElementById("achievementsClose");
    const resetBtn = document.getElementById("achievementsReset");
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

        if (resetBtn) {
            resetBtn.addEventListener("click", function () {
                openConfirmDialog(resetAchievements);
            });
        }
    }

    // --- Diálogo de confirmación propio (reemplaza al confirm() nativo del navegador) ---
    const confirmOverlay = document.getElementById("resetConfirmOverlay");
    const confirmCancelBtn = document.getElementById("resetConfirmCancel");
    const confirmAcceptBtn = document.getElementById("resetConfirmAccept");
    let confirmDialogOnAccept = null;

    function closeConfirmDialog() {
        if (!confirmOverlay) return;
        confirmOverlay.classList.remove("open");
        confirmOverlay.setAttribute("aria-hidden", "true");
        confirmDialogOnAccept = null;
    }

    function openConfirmDialog(onAccept) {
        if (!confirmOverlay) {
            // Sin diálogo en el DOM (no debería pasar): ejecuta directamente como último recurso
            onAccept();
            return;
        }
        confirmDialogOnAccept = onAccept;
        confirmOverlay.classList.add("open");
        confirmOverlay.setAttribute("aria-hidden", "false");
        if (confirmAcceptBtn) confirmAcceptBtn.focus();
    }

    if (confirmOverlay) {
        confirmOverlay.addEventListener("click", function (event) {
            if (event.target === confirmOverlay) closeConfirmDialog();
        });

        window.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && confirmOverlay.classList.contains("open")) {
                closeConfirmDialog();
            }
        });

        if (confirmCancelBtn) {
            confirmCancelBtn.addEventListener("click", closeConfirmDialog);
        }

        if (confirmAcceptBtn) {
            confirmAcceptBtn.addEventListener("click", function () {
                const onAccept = confirmDialogOnAccept;
                closeConfirmDialog();
                if (onAccept) onAccept();
            });
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
