document.addEventListener('DOMContentLoaded', () => {
    const langList = document.getElementById('langList');
    const matterContainer = document.getElementById('langMatterContainer');
    const matterClose = document.getElementById('langMatterClose');
    const canvas = document.getElementById('langMatterCanvas');

    if (!langList || !matterContainer || !matterClose || !canvas || typeof Matter === 'undefined') {
        return;
    }

    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events } = Matter;

    const CANVAS_HEIGHT = 600;

    const items = Array.from(langList.querySelectorAll('.lang-item'))
        .map((item) => ({
            src: item.querySelector('img')?.getAttribute('src') || '',
            name: item.querySelector('h4')?.textContent.trim() || '',
            description: item.querySelector('p')?.textContent.trim() || '',
            naturalWidth: 256,
            naturalHeight: 256
        }))
        .filter((item) => item.src);

    function loadImageSize(item) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                item.naturalWidth = img.naturalWidth || 256;
                item.naturalHeight = img.naturalHeight || 256;
                resolve();
            };
            img.onerror = () => resolve();
            img.src = item.src;
        });
    }

    const imagesReady = Promise.all(items.map(loadImageSize));

    let engine = null;
    let render = null;
    let runner = null;
    let running = false;

    function wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let line = '';
        words.forEach((word) => {
            const test = line ? line + ' ' + word : word;
            if (ctx.measureText(test).width > maxWidth && line) {
                lines.push(line);
                line = word;
            } else {
                line = test;
            }
        });
        if (line) lines.push(line);
        return lines;
    }

    function drawTextBodies(render) {
        const ctx = render.context;
        const bodies = Composite.allBodies(render.engine.world).filter((b) => b.plugin && b.plugin.textBlock);

        bodies.forEach((body) => {
            const { text, fontSize, color, maxWidth } = body.plugin.textBlock;
            ctx.save();
            ctx.translate(body.position.x, body.position.y);
            ctx.rotate(body.angle);
            ctx.font = `600 ${fontSize}px "Poppins", "Segoe UI", sans-serif`;
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const lines = wrapText(ctx, text, maxWidth);
            const lineHeight = fontSize * 1.25;
            const totalHeight = lines.length * lineHeight;

            lines.forEach((line, i) => {
                ctx.fillText(line, 0, -totalHeight / 2 + lineHeight / 2 + i * lineHeight);
            });
            ctx.restore();
        });
    }

    function makeTextBlock(x, y, width, height, text, options) {
        const body = Bodies.rectangle(x, y, width, height, {
            chamfer: { radius: 10 },
            restitution: 0.45,
            friction: 0.25,
            frictionAir: 0.015,
            angle: (Math.random() - 0.5) * 0.6,
            render: {
                fillStyle: options.background,
                strokeStyle: options.border || 'transparent',
                lineWidth: options.border ? 1 : 0
            }
        });
        body.plugin.textBlock = {
            text,
            fontSize: options.fontSize,
            color: options.color,
            maxWidth: width - 16
        };
        return body;
    }

    function startMatter() {
        if (running) return;
        running = true;

        const wrapper = matterContainer.parentElement;
        const width = wrapper.getBoundingClientRect().width || 320;
        const height = CANVAS_HEIGHT;

        matterContainer.style.height = height + 'px';
        canvas.width = width;
        canvas.height = height;

        engine = Engine.create();

        render = Render.create({
            canvas,
            engine,
            options: {
                width,
                height,
                background: 'transparent',
                wireframes: false,
                pixelRatio: window.devicePixelRatio || 1
            }
        });

        const wallOptions = { isStatic: true, render: { visible: false } };
        Composite.add(engine.world, [
            Bodies.rectangle(width / 2, height + 25, width * 2, 50, wallOptions),
            Bodies.rectangle(-25, height / 2, 50, height * 2, wallOptions),
            Bodies.rectangle(width + 25, height / 2, 50, height * 2, wallOptions)
        ]);

        const iconSize = 56;
        const nameWidth = 150;
        const nameHeight = 44;
        const descWidth = 230;
        const descHeight = 78;

        const bodies = [];
        let dropOrder = 0;

        items.forEach((item) => {
            const iconX = iconSize + Math.random() * (width - iconSize * 2);
            const iconY = -100 - dropOrder * 70;
            dropOrder++;
            bodies.push(
                Bodies.circle(iconX, iconY, iconSize / 2, {
                    restitution: 0.55,
                    friction: 0.2,
                    frictionAir: 0.01,
                    angle: (Math.random() - 0.5) * 1.2,
                    render: {
                        sprite: {
                            texture: item.src,
                            xScale: iconSize / item.naturalWidth,
                            yScale: iconSize / item.naturalHeight
                        }
                    }
                })
            );

            const nameX = nameWidth / 2 + 10 + Math.random() * (width - nameWidth - 20);
            const nameY = -100 - dropOrder * 70;
            dropOrder++;
            bodies.push(
                makeTextBlock(nameX, nameY, nameWidth, nameHeight, item.name, {
                    background: '#0f172a',
                    color: '#ffffff',
                    fontSize: 16
                })
            );

            const descX = descWidth / 2 + 10 + Math.random() * (width - descWidth - 20);
            const descY = -100 - dropOrder * 70;
            dropOrder++;
            bodies.push(
                makeTextBlock(descX, descY, descWidth, descHeight, item.description, {
                    background: '#e2e8f0',
                    border: '#cbd5e1',
                    color: '#0f172a',
                    fontSize: 13
                })
            );
        });

        Composite.add(engine.world, bodies);

        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });
        Composite.add(engine.world, mouseConstraint);
        render.mouse = mouse;

        Events.on(render, 'afterRender', () => drawTextBodies(render));

        runner = Runner.create();
        Runner.run(runner, engine);
        Render.run(render);
    }

    function stopMatter() {
        if (!running) return;
        running = false;

        if (render) {
            Render.stop(render);
            render.canvas = null;
            render.context = null;
            render.textures = {};
        }
        if (runner) {
            Runner.stop(runner);
        }
        if (engine) {
            Composite.clear(engine.world, false);
            Engine.clear(engine);
        }

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        engine = null;
        render = null;
        runner = null;
    }

    langList.addEventListener('click', () => {
        imagesReady.then(() => {
            langList.style.display = 'none';
            matterContainer.style.display = 'block';
            startMatter();
        });
    });

    matterClose.addEventListener('click', (event) => {
        event.stopPropagation();
        stopMatter();
        matterContainer.style.display = 'none';
        langList.style.display = 'flex';
    });
});
