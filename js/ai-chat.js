(function () {
    // Asistente local muy sencillo: no llama a ninguna API externa.
    // Busca coincidencias de palabras clave en la pregunta y devuelve
    // una respuesta predefinida sobre el portfolio de César.
    const TOPICS = [
        {
            keywords: ["formacion", "titulo", "titulacion", "estudios", "estudio", "grado", "academic", "carrera"],
            answer: "César tiene formación en:\n- Grado Medio en Sistemas Microinformáticos en Red (2019)\n- Grado Superior en Programación de Aplicaciones Multiplataforma, DAM (2021)\n- Grado Superior en Programación de Aplicaciones Web, DAW (2022)"
        },
        {
            keywords: ["experiencia", "trabajo", "empresa", "laboral", "empleo", "trayectoria"],
            answer: "Experiencia profesional de César:\n- Oct 2021 - Mar 2022: Desarrollador .NET Core con Angular en VisibleSoft.\n- Dic 2022 - actualidad: Desarrollador .NET Core con Angular/Blazor en Excem Technologies.\nEn total, más de 3 años de experiencia como desarrollador Full Stack."
        },
        {
            keywords: ["tecnologia", "tecnologias", "conocimiento", "conocimientos", "lenguaje", "lenguajes", "stack", "skill", "skills", "sabe", "sabes", "dominas", "manejas"],
            answer: "Tecnologías que utiliza César:\n- Base: HTML5, CSS3, JavaScript\n- Profesional: C# & .NET, Angular, Blazor\n- Hobby: React, Vue.js, Node.js"
        },
        {
            keywords: ["proyecto", "proyectos", "portfolio", "templates", "games", "movies"],
            answer: "Proyectos personales de César:\n- Templates: plantillas gratuitas para descargar (templates.cesarsobrino.es)\n- Games: gestor de videojuegos con React.js y la API de RAWG (games.cesarsobrino.es)\n- Movies: gestor de películas con Vue.js y la API de TheMovieDatabase (movies.cesarsobrino.es)\n- Portfolio en Angular con animaciones de scroll (portfoliong.cesarsobrino.es)"
        },
        {
            keywords: ["contacto", "contactar", "email", "correo", "linkedin", "github", "instagram", "cv", "curriculum"],
            answer: "Puedes contactar con César a través de los iconos de GitHub, LinkedIn e Instagram del portfolio, o descargar su CV directamente desde la web."
        },
        {
            keywords: ["paypal", "donar", "donacion", "apoyar", "apoyo"],
            answer: "Si quieres apoyar el trabajo de César, puedes hacerlo con el botón de PayPal flotante en la web."
        },
        {
            keywords: ["quien", "sobre ti", "sobre el", "presentate", "presentacion", "hola", "buenas", "eres"],
            answer: "Soy el asistente del portfolio de César Sobrino, desarrollador Full Stack con más de 3 años de experiencia, especializado en Angular, Blazor, C# y .NET. Pregúntame sobre su formación, experiencia, tecnologías o proyectos."
        }
    ];

    const FALLBACK = "Solo puedo responder preguntas sobre el portfolio de César: su formación, experiencia, tecnologías, proyectos o cómo contactarle. ¿Quieres preguntarme sobre alguno de esos temas?";

    function normalize(text) {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "");
    }

    function getAnswer(userText) {
        const normalized = normalize(userText);

        for (const topic of TOPICS) {
            const match = topic.keywords.some(function (keyword) {
                return normalized.indexOf(keyword) !== -1;
            });
            if (match) {
                return topic.answer;
            }
        }

        return FALLBACK;
    }

    let isOpen = false;
    let isSending = false;

    const toggleBtn = document.getElementById("aiChatToggle");
    const closeBtn = document.getElementById("aiChatClose");
    const chatWindow = document.getElementById("aiChatWindow");
    const messagesEl = document.getElementById("aiChatMessages");
    const form = document.getElementById("aiChatForm");
    const input = document.getElementById("aiChatInput");

    if (!toggleBtn || !chatWindow || !form || !input) {
        return;
    }

    // Lenis intercepta el wheel globalmente; evitamos que se propague
    // desde dentro del chat para que el scroll nativo del panel funcione.
    [messagesEl, chatWindow].forEach(function (el) {
        if (!el) {
            return;
        }
        el.addEventListener("wheel", function (event) {
            event.stopPropagation();
        }, { passive: true });
    });

    function appendMessage(text, role) {
        const bubble = document.createElement("div");
        bubble.className = "ai-chat-msg " + (role === "user" ? "ai-chat-msg-user" : "ai-chat-msg-bot");
        bubble.textContent = text;
        messagesEl.appendChild(bubble);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return bubble;
    }

    function appendTypingIndicator() {
        const bubble = document.createElement("div");
        bubble.className = "ai-chat-msg ai-chat-msg-typing";
        bubble.innerHTML = "<span></span><span></span><span></span>";
        messagesEl.appendChild(bubble);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return bubble;
    }

    function openChat() {
        isOpen = true;
        chatWindow.classList.add("open");
        chatWindow.setAttribute("aria-hidden", "false");
        toggleBtn.classList.add("active");
        window.setTimeout(function () {
            input.focus();
        }, 250);
    }

    function closeChat() {
        isOpen = false;
        chatWindow.classList.remove("open");
        chatWindow.setAttribute("aria-hidden", "true");
        toggleBtn.classList.remove("active");
    }

    toggleBtn.addEventListener("click", function () {
        if (isOpen) {
            closeChat();
        } else {
            openChat();
        }
    });

    closeBtn.addEventListener("click", closeChat);

    function sendMessage(userText) {
        const typingBubble = appendTypingIndicator();

        window.setTimeout(function () {
            typingBubble.remove();
            appendMessage(getAnswer(userText), "bot");
            isSending = false;
        }, 350 + Math.random() * 250);
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (isSending) {
            return;
        }

        const text = input.value.trim();
        if (!text) {
            return;
        }

        appendMessage(text, "user");
        input.value = "";
        isSending = true;

        sendMessage(text);
    });
})();
