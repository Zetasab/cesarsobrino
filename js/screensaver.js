(function () {
    var IDLE_TIME = 1 * 60 * 1000; // 5 minutos

    var overlay = document.createElement('div');
    overlay.className = 'screensaver-overlay';
    overlay.id = 'screensaverOverlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
        '<div class="screensaver-clock-wrap">' +
            '<svg class="screensaver-clock" viewBox="0 0 200 200" aria-hidden="true">' +
                '<circle class="clock-face" cx="100" cy="100" r="96"></circle>' +
                '<g class="clock-ticks" id="screensaverTicks"></g>' +
                '<g class="clock-numbers" id="screensaverNumbers"></g>' +
                '<line id="clockHourHand" class="clock-hand clock-hand-hour" x1="100" y1="100" x2="100" y2="58"></line>' +
                '<line id="clockMinuteHand" class="clock-hand clock-hand-minute" x1="100" y1="100" x2="100" y2="34"></line>' +
                '<line id="clockSecondHand" class="clock-hand clock-hand-second" x1="100" y1="112" x2="100" y2="24"></line>' +
                '<circle class="clock-center" cx="100" cy="100" r="4"></circle>' +
            '</svg>' +
            '<div class="screensaver-date" id="screensaverDate"></div>' +
            '<div class="screensaver-hint">Mueve el ratón, haz scroll o pulsa una tecla para continuar</div>' +
        '</div>';
    document.body.appendChild(overlay);

    // Marcas de las horas y números
    var ticksGroup = overlay.querySelector('#screensaverTicks');
    var numbersGroup = overlay.querySelector('#screensaverNumbers');
    for (var i = 0; i < 60; i++) {
        var angle = (i * 6) * (Math.PI / 180);
        var isHour = i % 5 === 0;
        var r1 = isHour ? 82 : 88;
        var r2 = 92;
        var x1 = 100 + r1 * Math.sin(angle);
        var y1 = 100 - r1 * Math.cos(angle);
        var x2 = 100 + r2 * Math.sin(angle);
        var y2 = 100 - r2 * Math.cos(angle);
        var tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tick.setAttribute('x1', x1.toFixed(2));
        tick.setAttribute('y1', y1.toFixed(2));
        tick.setAttribute('x2', x2.toFixed(2));
        tick.setAttribute('y2', y2.toFixed(2));
        tick.setAttribute('class', isHour ? 'clock-tick clock-tick-hour' : 'clock-tick');
        ticksGroup.appendChild(tick);
    }
    for (var h = 1; h <= 12; h++) {
        var na = (h * 30) * (Math.PI / 180);
        var nr = 70;
        var nx = 100 + nr * Math.sin(na);
        var ny = 100 - nr * Math.cos(na);
        var num = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        num.setAttribute('x', nx.toFixed(2));
        num.setAttribute('y', ny.toFixed(2));
        num.setAttribute('class', 'clock-number');
        num.textContent = h;
        numbersGroup.appendChild(num);
    }

    var hourHand = overlay.querySelector('#clockHourHand');
    var minuteHand = overlay.querySelector('#clockMinuteHand');
    var secondHand = overlay.querySelector('#clockSecondHand');
    var dateEl = overlay.querySelector('#screensaverDate');

    var weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    var months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    var clockInterval = null;

    function updateClock() {
        var now = new Date();
        var h = now.getHours() % 12;
        var m = now.getMinutes();
        var s = now.getSeconds();

        var hourDeg = (h * 30) + (m * 0.5);
        var minuteDeg = (m * 6) + (s * 0.1);
        var secondDeg = s * 6;

        hourHand.style.transform = 'rotate(' + hourDeg + 'deg)';
        minuteHand.style.transform = 'rotate(' + minuteDeg + 'deg)';
        secondHand.style.transform = 'rotate(' + secondDeg + 'deg)';

        dateEl.textContent = weekdays[now.getDay()] + ', ' + now.getDate() + ' de ' + months[now.getMonth()];
    }

    function showScreensaver() {
        if (overlay.classList.contains('active')) return;
        updateClock();
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        clockInterval = setInterval(updateClock, 1000);
    }

    function hideScreensaver() {
        if (!overlay.classList.contains('active')) return;
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        if (clockInterval) {
            clearInterval(clockInterval);
            clockInterval = null;
        }
    }

    var idleTimer = null;

    function resetIdleTimer() {
        hideScreensaver();
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(showScreensaver, IDLE_TIME);
    }

    ['mousemove', 'mousedown', 'keydown', 'scroll', 'wheel', 'touchstart', 'touchmove'].forEach(function (evt) {
        window.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            resetIdleTimer();
        }
    });

    resetIdleTimer();
})();
