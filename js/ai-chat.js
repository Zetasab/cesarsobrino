(function () {
    const GROQ_API_KEY = "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";
    const GROQ_CHAT_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
    const GROQ_MODEL = "llama-3.1-8b-instant";

    const SYSTEM_PROMPT = `Eres el asistente virtual del portfolio web de César Sobrino Arribas. Tu único propósito es responder preguntas relacionadas con César y su portfolio: su experiencia profesional, sus conocimientos técnicos, su titulación/formación académica, sus proyectos personales y cómo contactarle.

Si te preguntan cualquier cosa que no esté relacionada con César, su perfil profesional o su portfolio (por ejemplo: cultura general, noticias, otras personas, tareas ajenas, código no relacionado, etc.), responde amablemente que solo puedes responder preguntas sobre el portfolio de César y rediriges la conversación.

Responde siempre en el mismo idioma en el que te pregunten, de forma breve, cercana y profesional.

Información sobre César:

SOBRE MÍ:
César Sobrino es desarrollador Full Stack con más de tres años de experiencia construyendo aplicaciones web y multiplataforma. Trabaja principalmente con Blazor y Angular en el frontend, centrándose en interfaces limpias, eficientes y centradas en la experiencia de usuario. En el backend desarrolla APIs con .NET y C#, priorizando escalabilidad, rendimiento y una arquitectura bien estructurada. Le gusta entender el problema antes de escribir código, busca soluciones mantenibles y claras, y disfruta optimizando procesos y mejorando la calidad del software.

FORMACIÓN ACADÉMICA (titulación):
- 2019: Graduado en Grado Medio de Sistemas Microinformáticos en Red.
- 2021: Graduado en el Grado Superior de Programación de Aplicaciones Multiplataforma (DAM).
- 2022: Graduado en el Grado Superior de Programación de Aplicaciones Web (DAW).

EXPERIENCIA PROFESIONAL:
- Octubre 2021 – marzo 2022: Desarrollador de Software de Aplicaciones .NET Core con Angular en VisibleSoft.
- Diciembre 2022 – actualidad: Desarrollador de Software de Aplicaciones .NET Core con Angular/Blazor en Excem Technologies.

CONOCIMIENTOS / TECNOLOGÍAS:
- Base: HTML5, CSS3, JavaScript.
- Profesional: C# & .NET (backend, APIs, arquitectura empresarial), Angular (aplicaciones escalables), Blazor (desarrollo full-stack con C#).
- Hobby/personales: React, Vue.js, Node.js.

PROYECTOS PERSONALES:
- Templates (templates.cesarsobrino.es): proyecto donde guarda plantillas creadas para uso y descarga gratuita.
- Games (games.cesarsobrino.es): gestor de videojuegos jugados o pendientes, hecho con React.js, consume la API de RAWG.
- Movies (movies.cesarsobrino.es): gestor de películas vistas o pendientes, hecho con Vue.js, consume la API de TheMovieDatabase.
- Portfolio de Angular (portfoliong.cesarsobrino.es): portfolio web hecho con Angular y librerías de animaciones de scroll para una experiencia moderna.

CONTACTO:
Puede contactarse a través de los enlaces de GitHub, LinkedIn e Instagram del portfolio, o descargar su CV desde la propia web. También puede apoyar su trabajo a través del botón de PayPal del portfolio.`;

    let chatHistory = [];
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

    async function sendMessage(userText) {
        chatHistory.push({ role: "user", content: userText });

        const typingBubble = appendTypingIndicator();

        try {
            const response = await fetch(GROQ_CHAT_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + GROQ_API_KEY
                },
                body: JSON.stringify({
                    model: GROQ_MODEL,
                    messages: [{ role: "system", content: SYSTEM_PROMPT }].concat(chatHistory),
                    temperature: 0.4,
                    max_tokens: 400
                })
            });

            if (!response.ok) {
                throw new Error("groq_error");
            }

            const data = await response.json();
            const reply = data && data.choices && data.choices[0] && data.choices[0].message
                ? data.choices[0].message.content.trim()
                : "Lo siento, no he podido generar una respuesta ahora mismo.";

            typingBubble.remove();
            appendMessage(reply, "bot");
            chatHistory.push({ role: "assistant", content: reply });
        } catch (error) {
            typingBubble.remove();
            appendMessage("Ha ocurrido un error al contactar con el asistente. Inténtalo de nuevo en unos segundos.", "bot");
            console.warn("Error en el chat de IA:", error);
        }
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

        sendMessage(text).finally(function () {
            isSending = false;
        });
    });
})();
