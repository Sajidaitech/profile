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

        // Device type
        var device = '💻 Desktop';
        if      (/iPhone/i.test(ua))           device = '📱 iPhone';
        else if (/iPad/i.test(ua))             device = '📱 iPad';
        else if (/Android.*Mobile/i.test(ua))  device = '📱 Android Phone';
        else if (/Android/i.test(ua))          device = '📱 Android Tablet';

        // Operating system
        var os = 'Unknown OS';
        if      (/Windows NT 10/i.test(ua))        os = 'Windows 10/11';
        else if (/Windows NT 6/i.test(ua))         os = 'Windows (older)';
        else if (/Mac OS X/i.test(ua))             os = 'macOS';
        else if (/iPhone OS ([\d_]+)/i.test(ua))   os = 'iOS ' + ua.match(/iPhone OS ([\d_]+)/i)[1].replace(/_/g, '.');
        else if (/Android ([\d.]+)/i.test(ua))     os = 'Android ' + ua.match(/Android ([\d.]+)/i)[1];
        else if (/Linux/i.test(ua))                os = 'Linux';

        // Browser
        var browser = 'Unknown';
        if      (/Edg\//i.test(ua))     browser = 'Microsoft Edge';
        else if (/OPR\//i.test(ua))     browser = 'Opera';
        else if (/Chrome\//i.test(ua))  browser = 'Chrome';
        else if (/Firefox\//i.test(ua)) browser = 'Firefox';
        else if (/Safari\//i.test(ua))  browser = 'Safari';

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

        // ── HTML-safe escape (prevents Telegram parse errors) ──
        function esc(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }

        // ── Build & fire the Telegram message (HTML parse_mode) ──
        function sendMsg(ip, city, country, isp) {
            var msg =
                '🎯 <b>' + esc(name) + ' is viewing your Portfolio!</b>\n' +
                '━━━━━━━━━━━━━━━━━━━━\n' +
                '👤 <b>Visitor:</b> '       + esc(name)     + '\n' +
                '🔗 <b>Referrer:</b> '      + esc(referrer) + '\n' +
                '━━━━━━━━━━━━━━━━━━━━\n' +
                '📍 <b>IP:</b> <code>'      + esc(ip)       + '</code>\n' +
                '🌍 <b>Location:</b> '      + esc(city)     + ', ' + esc(country) + '\n' +
                '🏢 <b>ISP:</b> '           + esc(isp)      + '\n' +
                '━━━━━━━━━━━━━━━━━━━━\n' +
                '🖥️ <b>Device:</b> '        + esc(device)   + '\n' +
                '⚙️ <b>OS:</b> '            + esc(os)       + '\n' +
                '🌐 <b>Browser:</b> '       + esc(browser)  + '\n' +
                '📐 <b>Screen:</b> '        + esc(screen_res) + '\n' +
                '🗣️ <b>Language:</b> '      + esc(lang)     + '\n' +
                '━━━━━━━━━━━━━━━━━━━━\n' +
                '🕐 <b>Time (Qatar):</b> '  + esc(time)     + '\n' +
                '━━━━━━━━━━━━━━━━━━━━';

            fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    chat_id:    TG_CHAT_ID,
                    text:       msg,
                    parse_mode: 'HTML'          // ← changed from 'Markdown' to 'HTML'
                })
            })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                if (!d.ok) {
                    console.error('Telegram error:', d.description);
                    // Last-resort: retry with plain text so you always get notified
                    fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
                        method:  'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body:    JSON.stringify({
                            chat_id: TG_CHAT_ID,
                            text:    '[Portfolio Visit] ' + name + ' — ' + ip + ' — ' + city + ', ' + country + ' — ' + time
                        })
                    }).catch(function () {});
                }
            })
            .catch(function (e) { console.error('Telegram fetch error:', e); })
            .finally(function () { callback(); });
        }

        // ── Step 1: get visitor IP ──────────────────────────────
        fetch('https://api.ipify.org?format=json')
            .then(function (r) { return r.json(); })
            .then(function (d) {
                var ip = d.ip || 'Unknown';

                // ── Step 2a: try ipapi.co ───────────────────────
                fetch('https://ipapi.co/' + ip + '/json/')
                    .then(function (r) { return r.json(); })
                    .then(function (g) {
                        // ipapi.co returns an error field when rate-limited
                        if (g.error) throw new Error(g.reason || 'ipapi error');
                        sendMsg(
                            ip,
                            g.city         || 'Unknown',
                            g.country_name || 'Unknown',
                            g.org          || 'Unknown ISP'
                        );
                    })
                    .catch(function () {
                        // ── Step 2b: fallback to ip-api.com ────────
                        fetch('https://ip-api.com/json/' + ip + '?fields=status,city,country,isp')
                            .then(function (r) { return r.json(); })
                            .then(function (g) {
                                sendMsg(
                                    ip,
                                    g.city    || 'Unknown',
                                    g.country || 'Unknown',
                                    g.isp     || 'Unknown ISP'
                                );
                            })
                            .catch(function () { sendMsg(ip, 'Unknown', 'Unknown', 'Unknown ISP'); });
                    });
            })
            .catch(function () { sendMsg('Unknown', 'Unknown', 'Unknown', 'Unknown ISP'); });
    }

})();
