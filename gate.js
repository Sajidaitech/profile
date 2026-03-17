// ============================================
// GATE OVERLAY LOGIC
// Sajid Mehmood · sajidmk.com
// ============================================

(function () {

    var TG_TOKEN   = '8716049751:AAGInSyDf0cwRJW95nc-9YlLc6dBTzrx6AU';
    var TG_CHAT_ID = '8235795754';

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

        // Send Telegram, then reveal immediately when done
        sendTelegramNotification(name, revealPortfolio);
    };

    // ── Skip handler ────────────────────────────
    window.gateSkip = function () {
        document.getElementById('gateOverlay').classList.add('gate-hidden');
        document.body.classList.remove('gate-active');
        window.scrollTo(0, 0);
    };

    // ── Telegram notification ───────────────────
    function sendTelegramNotification(name, callback) {
        var ua = navigator.userAgent;

        // ── Device type ─────────────────────────────
        var device = '💻 Desktop';
        if      (/iPhone/i.test(ua))          device = '📱 iPhone';
        else if (/iPad/i.test(ua))            device = '📱 iPad';
        else if (/Android.*Mobile/i.test(ua)) device = '📱 Android Phone';
        else if (/Android/i.test(ua))         device = '📱 Android Tablet';

        // ── Operating system (iPhone/iPad MUST come before Mac OS X check) ──
        var os = 'Unknown OS';
        var _iosMatch     = ua.match(/iPhone OS ([\d_]+)/i);
        var _ipadMatch    = ua.match(/CPU OS ([\d_]+)/i);        // iPad user agent
        var _androidMatch = ua.match(/Android ([\d.]+)/i);
        var _winMatch     = ua.match(/Windows NT ([\d.]+)/i);
        var _macMatch     = ua.match(/Mac OS X ([\d_.]+)/i);

        if (_iosMatch) {
            // iPhone — e.g. "iPhone OS 18_0" → "iOS 18.0"
            os = 'iOS ' + _iosMatch[1].replace(/_/g, '.');
        } else if (_ipadMatch && /iPad/i.test(ua)) {
            // iPad — e.g. "CPU OS 17_4" → "iPadOS 17.4"
            os = 'iPadOS ' + _ipadMatch[1].replace(/_/g, '.');
        } else if (_androidMatch) {
            // Android — e.g. "Android 14" → "Android 14"
            os = 'Android ' + _androidMatch[1];
        } else if (_winMatch) {
            // Windows NT version map
            var _ntVer = parseFloat(_winMatch[1]);
            if      (_ntVer >= 10)  os = 'Windows 10/11';
            else if (_ntVer === 6.3) os = 'Windows 8.1';
            else if (_ntVer === 6.2) os = 'Windows 8';
            else if (_ntVer === 6.1) os = 'Windows 7';
            else                     os = 'Windows (older)';
        } else if (_macMatch) {
            // macOS — e.g. "Mac OS X 10_15_7" → "macOS 10.15.7"
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

        var screen_res = window.screen.width + 'x' + window.screen.height;
        var lang       = navigator.language || 'Unknown';
        var referrer   = document.referrer  || 'Direct / Bookmark';
        var time       = new Date().toLocaleString('en-US', {
            timeZone:  'Asia/Qatar',
            weekday:   'short',
            year:      'numeric',
            month:     'short',
            day:       'numeric',
            hour:      '2-digit',
            minute:    '2-digit'
        });

        // Build and send message once IP/geo is resolved
        function sendMsg(ip, city, country, isp) {
            var msg =
                '🎯 *' + name + ' is viewing your Portfolio!*\n' +
                '━━━━━━━━━━━━━━━━━━━━\n' +
                '👤 *Visitor:* '         + name     + '\n' +
                '🔗 *Referrer:* '        + referrer + '\n' +
                '━━━━━━━━━━━━━━━━━━━━\n' +
                '📍 *IP:* `'             + ip       + '`\n' +
                '🌍 *Location:* '        + city     + ', ' + country + '\n' +
                '🏢 *ISP:* '             + isp      + '\n' +
                '━━━━━━━━━━━━━━━━━━━━\n' +
                '🖥️ *Device:* '          + device   + '\n' +
                '⚙️ *OS:* '              + os       + '\n' +
                '🌐 *Browser:* '         + browser  + '\n' +
                '📐 *Screen:* '          + screen_res + '\n' +
                '🗣️ *Language:* '        + lang     + '\n' +
                '━━━━━━━━━━━━━━━━━━━━\n' +
                '🕐 *Time (Qatar):* '    + time     + '\n' +
                '━━━━━━━━━━━━━━━━━━━━';

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

        // Step 1 — get visitor IP
        fetch('https://api.ipify.org?format=json')
            .then(function (r) { return r.json(); })
            .then(function (d) {
                var ip = d.ip || 'Unknown';
                // Step 2 — get geo info
                fetch('https://ipapi.co/' + ip + '/json/')
                    .then(function (r) { return r.json(); })
                    .then(function (g) {
                        sendMsg(
                            ip,
                            g.city         || 'Unknown',
                            g.country_name || 'Unknown',
                            g.org          || 'Unknown ISP'
                        );
                    })
                    .catch(function () { sendMsg(ip, 'Unknown', 'Unknown', 'Unknown ISP'); });
            })
            .catch(function () { sendMsg('Unknown', 'Unknown', 'Unknown', 'Unknown ISP'); });
    }

})();
