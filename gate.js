// ============================================
// GATE OVERLAY LOGIC
// Sajid Mehmood · sajidmk.com
// ============================================

(function () {

    var TG_TOKEN   = '8716049751:AAGInSyDf0cwRJW95nc-9YlLc6dBTzrx6AU';
    var TG_CHAT_ID = '8235795754';
    var PB_TOKEN   = 'o.KLUoBeCohDPoYdPVpfrFxp9lwFTVuaXO';

    // Record page load time to calculate time spent on gate
    var pageLoadTime = Date.now();

    // Lock scroll while gate is visible
    document.body.classList.add('gate-active');

    // Enter key submits
    document.getElementById('gVisitorName').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') gateSubmit();
    });

    // Auto-focus the input after fonts load
    window.addEventListener('load', function () {
        setTimeout(function () {
            document.getElementById('gVisitorName').focus();
        }, 400);
    });

    // ── Submit handler ──────────────────────────
    window.gateSubmit = function () {
        var input   = document.getElementById('gVisitorName');
        var name    = input.value.trim();
        var errorEl = document.getElementById('gErrorMsg');
        var btn     = document.getElementById('gSubmitBtn');

        if (!name) {
            errorEl.classList.add('show');
            input.focus();
            input.style.borderColor = '#e74c3c';
            setTimeout(function () {
                input.style.borderColor = '';
                errorEl.classList.remove('show');
            }, 2500);
            return;
        }

        errorEl.classList.remove('show');
        btn.classList.add('loading');

        // Show welcome message inside the card instantly
        document.getElementById('gSuccessName').textContent = 'Welcome, ' + name + '!';
        document.getElementById('gSuccess').classList.add('show');

        // Reveal portfolio — only fires once, 5s hard fallback
        var revealed = false;
        function revealPortfolio() {
            if (revealed) return;
            revealed = true;
            document.getElementById('gateOverlay').classList.add('gate-hidden');
            document.body.classList.remove('gate-active');
            window.scrollTo(0, 0);
        }
        setTimeout(revealPortfolio, 5000);

        // Send both Telegram + Pushbullet, then reveal
        sendTelegramNotification(name, revealPortfolio);
    };

    // ── Skip handler ────────────────────────────
    window.gateSkip = function () {
        document.getElementById('gateOverlay').classList.add('gate-hidden');
        document.body.classList.remove('gate-active');
        window.scrollTo(0, 0);
    };

    // ════════════════════════════════════════
    // PUSHBULLET — quick glance notification
    // ════════════════════════════════════════
    function sendPushbullet(name, locationFull, browser, os, mapsLink) {
        var body =
            '👤 Visitor: '  + name         + '\n' +
            '🌍 Location: ' + locationFull + '\n' +
            '🌐 Browser: '  + browser      + '\n' +
            '⚙️ OS: '       + os           + '\n' +
            '🗺️ Maps: '     + mapsLink;

        fetch('https://api.pushbullet.com/v2/pushes', {
            method:  'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Token': PB_TOKEN
            },
            body: JSON.stringify({
                type:  'note',
                title: '🎯 ' + name + ' is viewing sajidmk.com!',
                body:  body
            })
        })
        .then(function (r) { return r.json(); })
        .then(function (d) {
            if (d.error) console.error('Pushbullet error:', d.error.message);
        })
        .catch(function (e) { console.error('Pushbullet fetch error:', e); });
    }

    // ════════════════════════════════════════
    // TELEGRAM — full detailed notification
    // ════════════════════════════════════════
    function sendTelegramNotification(name, callback) {
        var ua = navigator.userAgent;

        // ── Device type ─────────────────────────────
        var device = '💻 Desktop';
        if      (/iPhone/i.test(ua))          device = '📱 iPhone';
        else if (/iPad/i.test(ua))            device = '📱 iPad';
        else if (/Android.*Mobile/i.test(ua)) device = '📱 Android Phone';
        else if (/Android/i.test(ua))         device = '📱 Android Tablet';

        // ── Operating system ────────────────────────
        var os = 'Unknown OS';
        var _iosMatch     = ua.match(/iPhone OS ([\d_]+)/i);
        var _ipadMatch    = ua.match(/CPU OS ([\d_]+)/i);
        var _androidMatch = ua.match(/Android ([\d.]+)/i);
        var _winMatch     = ua.match(/Windows NT ([\d.]+)/i);
        var _macMatch     = ua.match(/Mac OS X ([\d_.]+)/i);

        if (_iosMatch) {
            os = 'iOS ' + _iosMatch[1].replace(/_/g, '.');
        } else if (_ipadMatch && /iPad/i.test(ua)) {
            os = 'iPadOS ' + _ipadMatch[1].replace(/_/g, '.');
        } else if (_androidMatch) {
            os = 'Android ' + _androidMatch[1];
        } else if (_winMatch) {
            var _ntVer = parseFloat(_winMatch[1]);
            if      (_ntVer >= 10)   os = 'Windows 10/11';
            else if (_ntVer === 6.3) os = 'Windows 8.1';
            else if (_ntVer === 6.2) os = 'Windows 8';
            else if (_ntVer === 6.1) os = 'Windows 7';
            else                     os = 'Windows (older)';
        } else if (_macMatch) {
            os = 'macOS ' + _macMatch[1].replace(/_/g, '.');
        } else if (/Linux/i.test(ua)) {
            os = 'Linux';
        }

        // ── Browser (with version) ───────────────────
        var browser = 'Unknown';
        var _edgeV    = ua.match(/Edg\/([\d.]+)/i);
        var _operaV   = ua.match(/OPR\/([\d.]+)/i);
        var _chromeV  = ua.match(/Chrome\/([\d.]+)/i);
        var _firefoxV = ua.match(/Firefox\/([\d.]+)/i);
        var _safariV  = ua.match(/Version\/([\d.]+).*Safari/i);

        if      (_edgeV)    browser = 'Microsoft Edge '  + _edgeV[1].split('.')[0];
        else if (_operaV)   browser = 'Opera '           + _operaV[1].split('.')[0];
        else if (_chromeV)  browser = 'Chrome '          + _chromeV[1].split('.')[0];
        else if (_firefoxV) browser = 'Firefox '         + _firefoxV[1].split('.')[0];
        else if (_safariV)  browser = 'Safari '          + _safariV[1].split('.')[0];

        // ── Extra client-side details ────────────────
        var screen_res = window.screen.width + 'x' + window.screen.height;
        var viewport   = window.innerWidth + 'x' + window.innerHeight;
        var lang       = navigator.language || 'Unknown';
        var referrer   = document.referrer  || 'Direct / Bookmark';
        var touchDev   = navigator.maxTouchPoints > 0 ? 'Yes' : 'No';
        var darkMode   = window.matchMedia('(prefers-color-scheme: dark)').matches ? '🌙 Dark' : '☀️ Light';
        var connection = (navigator.connection && navigator.connection.effectiveType)
                            ? navigator.connection.effectiveType.toUpperCase()
                            : 'Unknown';
        var visitSecs  = Math.round((Date.now() - pageLoadTime) / 1000);
        var visitTime  = visitSecs < 60
                            ? visitSecs + 's'
                            : Math.floor(visitSecs / 60) + 'm ' + (visitSecs % 60) + 's';
        var clientTZ   = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';

        // Qatar time
        var time = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Qatar',
            weekday:  'short',
            year:     'numeric',
            month:    'short',
            day:      'numeric',
            hour:     '2-digit',
            minute:   '2-digit'
        });

        // ── Build and send once IP/geo is resolved ───
        function sendMsg(ip, geoData) {
            var city     = geoData.city         || 'Unknown';
            var region   = geoData.region       || '';
            var postal   = geoData.postal       || '';
            var country  = geoData.country_name || 'Unknown';
            var isp      = geoData.org          || 'Unknown ISP';
            var currency = geoData.currency     || 'Unknown';
            var geoTZ    = geoData.timezone     || clientTZ;
            var lat      = geoData.latitude     || null;
            var lon      = geoData.longitude    || null;

            var locationFull = [city, region, postal, country].filter(Boolean).join(', ');
            var mapsLink     = (lat && lon)
                                ? 'https://maps.google.com/?q=' + lat + ',' + lon
                                : 'N/A';

            // ── Fire Pushbullet (quick glance) ───────
            sendPushbullet(name, locationFull, browser, os, mapsLink);

            // ── Build full Telegram message ──────────
            var msg =
                '🎯 *' + name + ' just viewed your Portfolio!*\n' +
                '━━━━━━━━━━━━━━━━━━━━\n' +
                '👤 *Visitor:* '          + name         + '\n' +
                '🔗 *Referrer:* '         + referrer     + '\n' +
                '⏱️ *Time on Gate:* '     + visitTime    + '\n' +
                '━━━━━━━━━━━━━━━━━━━━\n' +
                '📍 *IP Address:* `'      + ip           + '`\n' +
                '🌍 *Location:* '         + locationFull + '\n' +
                '🗺️ *Google Maps:* '      + mapsLink     + '\n' +
                '🏢 *ISP / Org:* '        + isp          + '\n' +
                '💱 *Currency:* '         + currency     + '\n' +
                '🕰️ *Visitor Timezone:* ' + geoTZ        + '\n' +
                '━━━━━━━━━━━━━━━━━━━━\n' +
                '🖥️ *Device:* '           + device       + '\n' +
                '👆 *Touch Screen:* '     + touchDev     + '\n' +
                '⚙️ *OS:* '               + os           + '\n' +
                '🌐 *Browser:* '          + browser      + '\n' +
                '📐 *Screen Res:* '       + screen_res   + '\n' +
                '🪟 *Viewport:* '         + viewport     + '\n' +
                '📶 *Connection:* '       + connection   + '\n' +
                '🎨 *Theme Pref:* '       + darkMode     + '\n' +
                '🗣️ *Language:* '         + lang         + '\n' +
                '━━━━━━━━━━━━━━━━━━━━\n' +
                '🕐 *Time (Qatar):* '     + time         + '\n' +
                '━━━━━━━━━━━━━━━━━━━━';

            // ── Fire Telegram (full details) ─────────
            fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    chat_id:    TG_CHAT_ID,
                    text:       msg,
                    parse_mode: 'Markdown'
                })
            })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                if (!d.ok) console.error('Telegram error:', d.description);
            })
            .catch(function (e) { console.error('Telegram fetch error:', e); })
            .finally(function () { callback(); });
        }

        // ── Step 1: get visitor IP ───────────────────
        fetch('https://api.ipify.org?format=json')
            .then(function (r) { return r.json(); })
            .then(function (d) {
                var ip = d.ip || 'Unknown';
                // ── Step 2: get full geo info ────────
                fetch('https://ipapi.co/' + ip + '/json/')
                    .then(function (r) { return r.json(); })
                    .then(function (g) {
                        sendMsg(ip, g);
                    })
                    .catch(function () {
                        sendMsg(ip, {});
                    });
            })
            .catch(function () {
                sendMsg('Unknown', {});
            });
    }

})();
