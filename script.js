// ============================================================
// SAJID MEHMOOD · IT SYSTEMS ENGINEER
// script.js — Complete Rewrite with Advanced Gate Validation
// ============================================================


// ============================================================
// SECTION 0 · SMOOTH SCROLL
// ============================================================

(function () {
  var navH = function () {
    var nav = document.getElementById('topNav');
    return nav ? nav.offsetHeight : 68;
  };

  function scrollTo(href) {
    if (!href || href === '#') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    var target = document.querySelector(href);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.pageYOffset - navH() - 16;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  function closeMobileDrawer() {
    if (window.mobileNav && typeof window.mobileNav.close === 'function') {
      window.mobileNav.close();
    }
  }

  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('.nav-anchor');
    if (!anchor) return;
    var href = anchor.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    closeMobileDrawer();
    scrollTo(href);
  }, true);
})();


// ============================================================
// SECTION 0B · SCROLL PROGRESS BAR
// ============================================================

(function () {
  var bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', function () {
    var pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
})();


// ============================================================
// SECTION 0C · INTERACTIVE HERO BACKGROUND — Advanced Canvas
// ============================================================

(function () {
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, mouse = { x: -999, y: -999 }, time = 0;
  var isMobile = window.innerWidth < 768;
  var COUNT = isMobile ? 55 : 120;
  var particles = [], waves = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', function () { resize(); isMobile = window.innerWidth < 768; }, { passive: true });
  window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    if (e.touches[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }
  }, { passive: true });

  function Particle() { this.reset(true); }
  Particle.prototype.reset = function (randomY) {
    this.x  = Math.random() * (W || 1200);
    this.y  = randomY ? Math.random() * (H || 800) : H + 20;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -(Math.random() * 0.5 + 0.1);
    this.r  = Math.random() * 2 + 0.5;
    this.life = Math.random() * 0.5 + 0.2;
    this.maxLife = this.life;
    this.hue = [195, 215, 255, 270][Math.floor(Math.random() * 4)];
    this.sat = Math.floor(Math.random() * 30) + 50;
    this.lit = Math.floor(Math.random() * 20) + 60;
    this.twinkle = Math.random() * Math.PI * 2;
    this.twinkleSpeed = Math.random() * 0.04 + 0.01;
    this.type = Math.random() > 0.85 ? 'diamond' : 'circle';
  };
  Particle.prototype.update = function () {
    this.twinkle += this.twinkleSpeed;
    var dx = this.x - mouse.x, dy = this.y - mouse.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 160 && dist > 0) {
      var f = (160 - dist) / 160 * 0.7;
      this.vx += (dx / dist) * f * 0.08;
      this.vy += (dy / dist) * f * 0.08;
    }
    this.vx *= 0.97; this.vy *= 0.97;
    this.x += this.vx; this.y += this.vy;
    this.life -= 0.001;
    if (this.life <= 0 || this.x < -30 || this.x > W + 30 || this.y < -30) this.reset(false);
  };
  Particle.prototype.draw = function () {
    var twinkleAlpha = (Math.sin(this.twinkle) * 0.3 + 0.7) * (this.life / this.maxLife);
    ctx.save();
    if (this.type === 'diamond') {
      var grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 6);
      grd.addColorStop(0, 'hsla(' + this.hue + ',' + this.sat + '%,' + this.lit + '%,' + (twinkleAlpha * 0.4) + ')');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r * 6, 0, Math.PI * 2); ctx.fill();
      ctx.translate(this.x, this.y); ctx.rotate(Math.PI / 4 + this.twinkle * 0.1);
      ctx.fillStyle = 'hsla(' + this.hue + ',' + this.sat + '%,' + this.lit + '%,' + twinkleAlpha + ')';
      ctx.fillRect(-this.r * 1.2, -this.r * 1.2, this.r * 2.4, this.r * 2.4);
    } else {
      var grd2 = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 4);
      grd2.addColorStop(0, 'hsla(' + this.hue + ',' + this.sat + '%,' + this.lit + '%,' + (twinkleAlpha * 0.25) + ')');
      grd2.addColorStop(1, 'transparent');
      ctx.fillStyle = grd2;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r * 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'hsla(' + this.hue + ',' + this.sat + '%,' + this.lit + '%,' + twinkleAlpha + ')';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  function Wave(y, amp, speed, color, opacity) {
    this.y = y; this.amp = amp; this.speed = speed;
    this.color = color; this.opacity = opacity; this.offset = Math.random() * Math.PI * 2;
  }
  Wave.prototype.draw = function (t) {
    ctx.beginPath();
    ctx.moveTo(0, this.y);
    for (var x = 0; x <= W; x += 4) {
      var mouseInfluence = 0;
      if (Math.abs(mouse.y - this.y) < 120) {
        var mdx = x - mouse.x;
        mouseInfluence = Math.exp(-mdx * mdx / 20000) * (120 - Math.abs(mouse.y - this.y)) * 0.3;
      }
      ctx.lineTo(x, this.y + Math.sin(x * 0.008 + t * this.speed + this.offset) * this.amp
                    + Math.sin(x * 0.015 + t * this.speed * 0.7 + this.offset) * this.amp * 0.4
                    + mouseInfluence);
    }
    ctx.strokeStyle = this.color.replace('OPACITY', this.opacity);
    ctx.lineWidth = 1.2;
    ctx.stroke();
  };

  function DataStream() {
    this.x = Math.random() * (W || 1200);
    this.y = Math.random() * (H || 800);
    this.speed = Math.random() * 1.5 + 0.5;
    this.chars = '01'.split('');
    this.length = Math.floor(Math.random() * 10) + 5;
    this.opacity = Math.random() * 0.08 + 0.02;
    this.hue = Math.random() > 0.5 ? 195 : 255;
    this.fontSize = Math.floor(Math.random() * 5) + 8;
  }
  DataStream.prototype.update = function () {
    this.y += this.speed;
    if (this.y > H + this.length * this.fontSize) {
      this.y = -this.length * this.fontSize;
      this.x = Math.random() * W;
    }
  };
  DataStream.prototype.draw = function () {
    ctx.font = this.fontSize + 'px "DM Mono", monospace';
    for (var i = 0; i < this.length; i++) {
      var alpha = this.opacity * (1 - i / this.length) * (i === 0 ? 3 : 1);
      ctx.fillStyle = 'hsla(' + this.hue + ',70%,70%,' + Math.min(alpha, 0.25) + ')';
      ctx.fillText(this.chars[Math.floor(Math.random() * this.chars.length)], this.x, this.y - i * this.fontSize);
    }
  };

  for (var i = 0; i < COUNT; i++) particles.push(new Particle());
  var LINK_DIST = isMobile ? 80 : 120;

  var waveColors = [
    'hsla(195,60%,65%,OPACITY)',
    'hsla(255,55%,70%,OPACITY)',
    'hsla(210,65%,65%,OPACITY)'
  ];
  waves.push(new Wave(0, 22, 0.25, waveColors[0], 0.06));
  waves.push(new Wave(0, 16, -0.18, waveColors[1], 0.05));
  waves.push(new Wave(0, 12, 0.32, waveColors[2], 0.04));

  function updateWavePositions() {
    waves[0].y = H * 0.55;
    waves[1].y = H * 0.65;
    waves[2].y = H * 0.72;
  }
  updateWavePositions();
  window.addEventListener('resize', updateWavePositions, { passive: true });

  var streams = [];
  if (!isMobile) {
    for (var s = 0; s < 18; s++) streams.push(new DataStream());
  }

  function drawConnections() {
    for (var a = 0; a < particles.length; a++) {
      for (var b = a + 1; b < particles.length; b++) {
        var dx = particles[a].x - particles[b].x;
        var dy = particles[a].y - particles[b].y;
        var d  = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK_DIST) {
          var op = (1 - d / LINK_DIST) * 0.18;
          var midHue = (particles[a].hue + particles[b].hue) / 2;
          var life = Math.min(particles[a].life / particles[a].maxLife, particles[b].life / particles[b].maxLife);
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.strokeStyle = 'hsla(' + midHue + ',60%,68%,' + (op * life) + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function drawAurora(t) {
    var aurora1 = ctx.createLinearGradient(0, H * 0.2, W, H * 0.8);
    aurora1.addColorStop(0,   'hsla(195,80%,40%,0)');
    aurora1.addColorStop(0.3, 'hsla(215,70%,45%,' + (0.035 + 0.02 * Math.sin(t * 0.003)) + ')');
    aurora1.addColorStop(0.6, 'hsla(255,75%,50%,' + (0.025 + 0.015 * Math.cos(t * 0.004)) + ')');
    aurora1.addColorStop(1,   'hsla(280,60%,40%,0)');
    ctx.fillStyle = aurora1;
    ctx.fillRect(0, 0, W, H);

    if (mouse.x > 0) {
      var grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 280);
      grd.addColorStop(0, 'hsla(195,70%,60%,0.06)');
      grd.addColorStop(0.5, 'hsla(255,65%,65%,0.03)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawHexGrid(t) {
    if (isMobile) return;
    var size = 45, cols = Math.ceil(W / (size * 1.75)) + 1, rows = Math.ceil(H / (size * 1.5)) + 1;
    ctx.lineWidth = 0.4;
    for (var row = -1; row < rows; row++) {
      for (var col = -1; col < cols; col++) {
        var cx = col * size * 1.73 + (row % 2 === 0 ? 0 : size * 0.865);
        var cy = row * size * 1.5;
        var dx = cx - mouse.x, dy = cy - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var pulse = Math.sin(t * 0.008 + cx * 0.008 + cy * 0.006) * 0.5 + 0.5;
        var alpha = 0.025 + pulse * 0.02;
        if (dist < 220) alpha += (1 - dist / 220) * 0.04;
        ctx.beginPath();
        for (var k = 0; k < 6; k++) {
          var angle = (Math.PI / 3) * k;
          var hx = cx + size * Math.cos(angle), hy = cy + size * Math.sin(angle);
          k === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.strokeStyle = 'hsla(195,60%,65%,' + alpha + ')';
        ctx.stroke();
      }
    }
  }

  function frame() {
    time++;
    ctx.clearRect(0, 0, W, H);
    drawAurora(time);
    drawHexGrid(time);
    if (!isMobile) { streams.forEach(function (s) { s.update(); s.draw(); }); }
    waves.forEach(function (w) { w.draw(time); });
    drawConnections();
    particles.forEach(function (p) { p.update(); p.draw(); });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();


// ============================================================
// SECTION 1 · GATE OVERLAY — Advanced Name Validation
// ============================================================

(function () {
  'use strict';

  var TG_TOKEN   = '8716049751:AAGInSyDf0cwRJW95nc-9YlLc6dBTzrx6AU';
  var TG_CHAT_ID = '8235795754';

  document.body.style.overflow = 'hidden';

  // ----------------------------------------------------------
  // 1A · VALIDATION RULES
  // ----------------------------------------------------------

  var MIN_LEN = 2;
  var MAX_LEN = 30;

  // Letters-only, no spaces, no digits, no symbols
  var FORMAT_RE = /^[a-zA-Z]{2,30}$/;

  // Leet-speak decoder: normalise before checking blocked lists
  // e.g. "4ss" → "ass", "sh1t" → "shit"
  var LEET_MAP = {
    '0': 'o', '1': 'i', '3': 'e', '4': 'a',
    '5': 's', '6': 'g', '7': 't', '8': 'b', '9': 'g',
    '@': 'a', '$': 's', '!': 'i', '+': 't'
  };

  function decodeLeet(str) {
    return str.toLowerCase().split('').map(function (c) {
      return LEET_MAP[c] || c;
    }).join('');
  }

  function normalize(str) {
    return decodeLeet(str)
      .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u').replace(/[ñ]/g, 'n')
      .replace(/[^a-z]/g, '');
  }

  // ----------------------------------------------------------
  // 1B · BLOCKED: PROFANITY — English + Roman Urdu/Hindi
  // ----------------------------------------------------------

  var PROFANITY = [
    // English
    'fuck','fucker','fucking','fucked','fuckoff','fuk','fck',
    'shit','shitt','sht',
    'bitch','btch','biatch',
    'bastard','bastar',
    'asshole','ashole','asshl','ass',
    'cunt','cnt',
    'dick','dik','dck',
    'cock','cok','kok',
    'pussy','psy',
    'whore','whor',
    'slut','slt',
    'faggot','fagot','fag',
    'nigger','niger','nigga','niga',
    'retard','retrd',
    'prick','prck',
    'twat','twt',
    'wanker','wnker',
    'bollocks','bolocks',
    'bugger',
    'tosser',
    'arsehole','arshole',
    'rape','rapist',
    'satan','devil','demon',
    'sex','sexy','sexxx',
    'porn','prn',
    'nude','nud',
    'penis','pnis',
    'vagina','vgina',
    'boobs','boob','bobs',

    // Roman Urdu / Roman Hindi
    'gandu','gaandu','gand','gnd',
    'gaand','gaandmara',
    'chutiya','chutiye','chuti','chut','choot',
    'maderchod','madarchod','maderchud','mchd','mc',
    'behenchod','bhenchod','bhanchod','bhnchd','bc',
    'bhosdike','bhosdiwale','bhosda','bhosdi',
    'bsdk','bkl',
    'kutta','kutte','kutti','kutiya',
    'suar','suwar','swine',
    'randi','randwa','rand',
    'launda','laundi',
    'chakka','chkka',
    'hijra','hizra','khusra',
    'lavde','lavda','loda','lund','lnd',
    'harami','haraamzaada','haramzada','haramzadi','haramkhor',
    'khabees','zaleel','kameena','kameeni','kamina','kamine',
    'beghairat','besharram','besharam','besharm',
    'jahil','jaheel','bewakoof','bewaqoof','bewaquf',
    'nalayak','duffer','ullu','ulluka','bakwas','bakwaas',
    'gandi','ganda',
    'sala','saala','sali','saali',
    'badmaash','badmash',
    'lanati','lanat',
    'pagal','paagal',
    'madar','teri','teriamma','teri maa',
    'maaki','terimaaki',
    'madarchod'
  ];

  // ----------------------------------------------------------
  // 1C · BLOCKED: ANIMAL NAMES (never used as human names)
  // ----------------------------------------------------------

  var ANIMALS = [
    'dog','cat','cow','pig','monkey','donkey','goat','horse',
    'chicken','rat','snake','lion','tiger','bear','wolf','fox',
    'rabbit','fish','bird','elephant','camel','buffalo','sheep',
    'duck','hen','rooster','crow','parrot','mouse','hamster',
    'turtle','lizard','crocodile','frog','bat','fly','ant','bee',
    'bull','mule','pony','colt','mare','stallion','heifer',
    'cub','kitten','puppy','piglet','calf','lamb','foal',
    'chick','drake','gander','doe','buck','ram','ewe',
    'giraffe','zebra','hippo','rhino','gorilla','chimp',
    'orangutan','baboon','lemur','panda','koala','kangaroo',
    'wombat','platypus','emu','ostrich','penguin','flamingo',
    'toucan','parrakeet','macaw','cockatoo','canary','finch',
    'sparrow','pigeon','hawk','eagle','falcon','owl','vulture',
    'shark','whale','dolphin','seal','walrus','otter','beaver',
    'mink','ferret','weasel','badger','hedgehog','mole','shrew',
    'vole','gerbil','chinchilla','guinea','degu','capybara',
    'sloth','armadillo','anteater','aardvark','tapir','llama',
    'alpaca','bison','moose','elk','deer','antelope','gazelle',
    'impala','wildebeest','hyena','cheetah','leopard','jaguar',
    'panther','puma','cougar','lynx','bobcat','ocelot',
    'mongoose','meerkat','suricate','warthog','boar',
    'scorpion','tarantula','gecko','iguana','chameleon',
    'python','cobra','viper','mamba','boa','anaconda',
    'alligator','tortoise','salamander','newt','toad',
    'goldfish','catfish','salmon','tuna','cod','trout',
    'lobster','crab','shrimp','squid','octopus','jellyfish',
    'starfish','seahorse','clam','oyster','mussel','snail',
    'slug','worm','beetle','moth','butterfly','dragonfly',
    'mosquito','wasp','hornet','termite','cockroach','locust'
  ];

  // ----------------------------------------------------------
  // 1D · BLOCKED: KEYBOARD SPAM / DICTIONARY NONSENSE
  // ----------------------------------------------------------

  var NONSENSE = [
    // Keyboard patterns
    'asdf','asdff','asdfg','asdfgh','qwerty','qwert','qwertyuiop',
    'zxcv','zxcvb','zxcvbn','hjkl','uiop','tyui','erty',
    'aaaa','bbbb','cccc','dddd','eeee','ffff','gggg','hhhh',
    'iiii','jjjj','kkkk','llll','mmmm','nnnn','oooo','pppp',
    'qqqq','rrrr','ssss','tttt','uuuu','vvvv','wwww','xxxx',
    'yyyy','zzzz','abcd','abcde','abcdef','efgh','ijkl','mnop',
    'abababab','ababab','xoxo','xoxoxo',
    // Generic filler words
    'test','testing','tester','tested',
    'user','users','username','userid',
    'guest','admin','administrator','root','superuser',
    'hello','helo','hi','hey','yo','yoyo',
    'lol','lmao','haha','hehe','hihi','hoho','hahaha',
    'ok','okay','okk','okok','fine','sure','yep','nope',
    'yes','no','none','nah','yah','ya','na',
    'null','undefined','nan','void','false','true',
    'anon','anonymous','noname','noone','nobody','someone',
    'anyone','everyone','person','people',
    'name','myname','yourname','firstname','lastname',
    'fake','faker','fakeuser','fakeaccount',
    'unknown','notknown','random','randomuser',
    'nothing','something','anything','everything',
    'blah','blahblah','bla','blab',
    'spam','spammer','bot','botuser','robot','robo',
    'aaa','bbb','ccc','ddd','eee','fff','ggg','hhh',
    'iii','jjj','kkk','lll','mmm','nnn','ooo','ppp',
    'qqq','rrr','sss','ttt','uuu','vvv','www','xxx','yyy','zzz',
    // Common words that are NOT names
    'good','bad','nice','best','cool','smart','rich','poor',
    'big','small','tall','short','fast','slow','hot','cold',
    'happy','sad','mad','glad','angry','lucky','sorry',
    'real','fake','true','love','hate','life','dead','kill',
    'money','food','water','fire','earth','wind','sky','star',
    'sun','moon','cloud','rain','snow','day','night',
    'home','house','room','door','window','car','road',
    'city','town','place','world','country','land','sea',
    'king','queen','prince','princess','lord','god','master',
    'boss','chief','leader','hero','villain','ninja','warrior',
    'super','mega','ultra','hyper','epic','elite','pro','max',
    'dark','black','white','red','blue','green','gold','silver'
  ];

  // ----------------------------------------------------------
  // 1E · ALLOWED OVERRIDE — common single-word names that might
  //      accidentally match a blocked pattern (e.g. "Ali" won't
  //      match anything, but edge-cases like "Bilal" containing
  //      nothing bad — kept as safety net whitelist)
  // ----------------------------------------------------------

  var WHITELIST = [
    // Muslim / Arabic
    'muhammad','mohammed','ahmad','ahmed','ali','hassan','hussain',
    'ibrahim','ismail','yusuf','omar','umar','uthman','bilal',
    'khalid','tariq','zaid','zayed','hamza','anas','salam','salim',
    'salman','sufyan','saad','sajid','sameer','sami','saqib',
    'sarfraz','shahid','shakeel','shehzad','shoaib','sohail',
    'suleman','tahir','talha','tariq','usman','waseem','waqar',
    'yasir','zubair','zulfiqar','aamir','aasim','adeel','adnan',
    'afzal','ahsan','akbar','akram','amir','arif','arslan',
    'asad','asif','atif','awais','ayaz','ayub','azhar','aziz',
    'babar','danish','faisal','farhan','farooq','fawad','feroz',
    'furqan','ghulam','habib','hammad','humayun','imran','irfan',
    'ishaq','jahangir','jalal','jamil','junaid','kamran','kashif',
    'khurram','majid','mansoor','manzoor','masood','mubarak',
    'mudassar','mujahid','mukhtar','muneer','murad','musab',
    'mushtaq','muzaffar','naeem','naveed','nawaz','noman','owais',
    'qasim','rahat','raheel','rahim','rashid','rauf','rehan',
    'rizwan','saeed','safdar','sahil','sajjad','shafiq','shafqat',
    // Female Muslim / Arabic
    'aisha','fatima','khadija','maryam','zainab','ruqayyah',
    'hafsa','safiyyah','asma','sumayyah','ramlah','khawlah',
    'umm','juwayriyyah','sawdah','maymunah','lubna','layla',
    'noor','nur','hana','hanan','rania','rana','dina','dalia',
    'sara','sarah','sana','sanam','sadia','rabia','rahima',
    'naila','nadia','munira','muna','mariam','madiha','lina',
    'leila','laila','kiran','khushbu','iram','hira','huma',
    'farah','fariha','farida','farzana','fozia','ghazala',
    'gulnaz','iram','iqra','isra','javeria','maham','mahira',
    'maryam','mehwish','memoona','mishal','muniba','nadia',
    'naila','nayab','nida','nimra','nosheen','parveen','rabia',
    'ramsha','rida','rimsha','ruba','rubab','rukhsar','saba',
    'sabahat','sabeen','safia','saima','saiqa','sajida',
    'salma','samia','samira','sana','saniya','sara','sehar',
    'shabana','shagufta','shaista','shazia','shirin','sidra',
    'sitara','sofia','sonia','sumaira','tabassum','tahreem',
    'tayyaba','tooba','ulfat','urwa','uzma','warisha','yumna',
    'zahra','zara','zeba','zunaira',
    // South Asian (Hindu / Sikh)
    'aarav','aditya','akash','amit','ananya','ankit','arjun',
    'aryan','deepak','divya','gaurav','ishaan','karan','kavya',
    'manish','meera','mohit','neha','nikhil','priya','rahul',
    'rajesh','ravi','rohit','sachin','sakshi','shreya','sumit',
    'sunita','suresh','tanvi','varun','vikas','vikram','vishal',
    'vivek','yash','zara','gurpreet','harpreet','jaspreet',
    'kuldeep','manpreet','navjot','parminder','rajvir','sandeep',
    'simran','sukhwinder','tejinder',
    // Western
    'adam','alex','alexander','andrew','anna','benjamin','bradley',
    'brandon','brian','caleb','cameron','charles','charlotte',
    'christian','christopher','claire','daniel','david','dylan',
    'edward','elizabeth','emily','emma','ethan','evan','gabriel',
    'grace','hannah','henry','isabella','jacob','james','jason',
    'jessica','john','jonathan','jordan','joseph','joshua','julia',
    'julian','kevin','laura','liam','lucas','lucy','madison',
    'mark','matthew','michael','nathan','nicholas','noah','olivia',
    'patrick','peter','rebecca','richard','robert','ryan','samuel',
    'sarah','sebastian','sophia','stephen','thomas','tyler',
    'victoria','william','zachary','aaron','abigail','aiden',
    'alice','amber','amelia','andrea','angela','ashley','austin',
    'avery','bella','blake','brianna','brooke','caden','caitlin',
    'caroline','cassandra','chloe','claire','cole','colin',
    'connor','courtney','crystal','dakota','danielle','diana',
    'dominic','drew','elijah','ellie','eric','erin','faith',
    'gavin','genesis','gianna','grant','hailey','haley','hayden',
    'heather','holly','hunter','ian','jacqueline','jade','jake',
    'jared','jayden','jennifer','jeremiah','jessica','joel',
    'jody','kaylee','kelly','kendall','kennedy','kyle','kylie',
    'landon','leah','lena','leo','lexi','lila','lily','lindsey',
    'logan','luke','madeleine','mariah','mason','megan','melanie',
    'melissa','mia','miranda','molly','morgan','natalie','nicole',
    'paige','peyton','rachel','ricky','riley','samantha','savannah',
    'scott','sean','sierra','skylar','sophie','spencer','stefanie',
    'stephanie','sydney','taylor','tiffany','timothy','toby',
    'travis','trevor','trinity','troy','tucker','tyler','vanessa',
    'veronica','whitney','wyatt','xavier','zoe'
  ];

  var _whitelistSet = {};
  WHITELIST.forEach(function (w) { _whitelistSet[w.toLowerCase()] = true; });

  // Build a Set-like object for O(1) lookup
  var _profanitySet   = {};
  var _animalSet      = {};
  var _nonsenseSet    = {};

  PROFANITY.forEach(function (w) { _profanitySet[normalize(w)]  = true; });
  ANIMALS.forEach(function   (w) { _animalSet[w.toLowerCase()]   = true; });
  NONSENSE.forEach(function  (w) { _nonsenseSet[w.toLowerCase()] = true; });

  // ----------------------------------------------------------
  // 1F · REPETITION / KEYBOARD-MASH DETECTOR
  // ----------------------------------------------------------

  function isRepetitive(str) {
    var s = str.toLowerCase();
    // All same character: "aaaa", "ssss"
    if (/^(.)\1+$/.test(s)) return true;
    // Simple alternating: "ababab", "xyxyxy"
    if (s.length >= 4 && /^(.{1,2})\1{2,}$/.test(s)) return true;
    // Sequential alphabet forward or backward: "abcde", "edcba"
    var forward = 'abcdefghijklmnopqrstuvwxyz';
    var backward = 'zyxwvutsrqponmlkjihgfedcba';
    if (s.length >= 4 && (forward.indexOf(s) !== -1 || backward.indexOf(s) !== -1)) return true;
    return false;
  }

  // ----------------------------------------------------------
  // 1G · MAIN VALIDATE FUNCTION — returns {ok, reason}
  // ----------------------------------------------------------

  function validateName(raw) {
    var trimmed = raw.trim();

    // Rule 1: Not empty
    if (!trimmed) {
      return { ok: false, reason: 'Please enter your name before continuing.' };
    }

    // Rule 2: No spaces — single word only
    if (/\s/.test(trimmed)) {
      return { ok: false, reason: 'Please enter a single name only — no spaces.' };
    }

    // Rule 3: Letters only (a-z / A-Z), no digits or symbols
    if (/[^a-zA-Z]/.test(trimmed)) {
      return { ok: false, reason: 'Your name should contain letters only — no numbers or symbols.' };
    }

    // Rule 4: Minimum length
    if (trimmed.length < MIN_LEN) {
      return { ok: false, reason: 'Name is too short. Please enter at least ' + MIN_LEN + ' characters.' };
    }

    // Rule 5: Maximum length
    if (trimmed.length > MAX_LEN) {
      return { ok: false, reason: 'Name is too long. Please enter a name under ' + MAX_LEN + ' characters.' };
    }

    var lower     = trimmed.toLowerCase();
    var normed    = normalize(trimmed);

    // Rule 6: Whitelisted names bypass all further checks
    if (_whitelistSet[lower]) {
      return { ok: true };
    }

    // Rule 7: Repetitive / keyboard-mash pattern
    if (isRepetitive(lower)) {
      return { ok: false, reason: 'That doesn\'t look like a real name. Please enter your actual name.' };
    }

    // Rule 8: Keyboard-spam / dictionary nonsense (exact match)
    if (_nonsenseSet[lower]) {
      return { ok: false, reason: 'That doesn\'t look like a real name. Please enter your actual name.' };
    }

    // Rule 9: Animal names (exact match)
    if (_animalSet[lower]) {
      return { ok: false, reason: 'Please enter your real name — animal names are not accepted.' };
    }

    // Rule 10: Profanity — exact normalised match
    if (_profanitySet[normed]) {
      return { ok: false, reason: 'That name is not acceptable. Please enter your real name.' };
    }

    // Rule 11: Profanity — substring check on normalised string
    //          (catches "assgood", "shitbag" style combos)
    var PROFANITY_KEYS = Object.keys(_profanitySet);
    for (var pi = 0; pi < PROFANITY_KEYS.length; pi++) {
      var bad = PROFANITY_KEYS[pi];
      if (bad.length >= 4 && normed.indexOf(bad) !== -1) {
        return { ok: false, reason: 'That name is not acceptable. Please enter your real name.' };
      }
    }

    // Passed all checks
    return { ok: true };
  }

  // ----------------------------------------------------------
  // 1H · UI HELPERS
  // ----------------------------------------------------------

  function showError(msg) {
    var errorEl = document.getElementById('gErrorMsg');
    var input   = document.getElementById('gVisitorName');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.add('show');
    }
    if (input) {
      input.focus();
      input.style.borderColor = '#e74c3c';
      setTimeout(function () {
        input.style.borderColor = '';
        if (errorEl) errorEl.classList.remove('show');
      }, 3500);
    }
  }

  function clearError() {
    var errorEl = document.getElementById('gErrorMsg');
    var input   = document.getElementById('gVisitorName');
    if (errorEl) errorEl.classList.remove('show');
    if (input)   input.style.borderColor = '';
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // ----------------------------------------------------------
  // 1I · INPUT FIELD ENFORCEMENT
  // ----------------------------------------------------------

  var nameInput = document.getElementById('gVisitorName');

  if (nameInput) {
    // Keydown: block disallowed characters immediately
    nameInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { gateSubmit(); return; }

      var controlKeys = [
        'Backspace','Delete','Tab','Escape','Enter',
        'ArrowLeft','ArrowRight','ArrowUp','ArrowDown',
        'Home','End','Shift','Control','Alt','Meta','CapsLock'
      ];
      if (controlKeys.indexOf(e.key) !== -1) return;
      if (e.ctrlKey || e.metaKey) return; // Allow Ctrl+C, Ctrl+V etc.

      // Accept letters only — NO space, NO digit, NO symbol
      if (!/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
      }
    });

    // Input: sanitise on paste or autofill
    nameInput.addEventListener('input', function () {
      var cursor   = nameInput.selectionStart;
      var original = nameInput.value;
      // Strip everything except letters (no spaces, no digits)
      var cleaned  = original.replace(/[^a-zA-Z]/g, '');
      if (cleaned !== original) {
        var removed = original.length - cleaned.length;
        nameInput.value = cleaned;
        nameInput.setSelectionRange(
          Math.max(0, cursor - removed),
          Math.max(0, cursor - removed)
        );
      }
    });

    // Clear stale error as user types
    nameInput.addEventListener('input', clearError);
  }

  // Focus input after gate loads
  window.addEventListener('load', function () {
    setTimeout(function () {
      if (nameInput) nameInput.focus();
    }, 400);
  });

  // ----------------------------------------------------------
  // 1J · GATE SUBMIT
  // ----------------------------------------------------------

  window.gateSubmit = function () {
    var input = document.getElementById('gVisitorName');
    var name  = input ? input.value : '';
    var btn   = document.getElementById('gSubmitBtn');

    var result = validateName(name);

    if (!result.ok) {
      showError(result.reason);
      return;
    }

    // Validation passed
    clearError();
    if (btn) btn.classList.add('loading');

    var displayName = capitalize(name.trim());
    var successName = document.getElementById('gSuccessName');
    var successEl   = document.getElementById('gSuccess');
    if (successName) successName.textContent = 'Welcome, ' + displayName + '!';
    if (successEl)   successEl.classList.add('show');

    var revealed = false;
    function revealPortfolio() {
      if (revealed) return;
      revealed = true;
      var overlay = document.getElementById('gateOverlay');
      if (overlay) overlay.classList.add('hidden');
      document.body.style.overflow = '';
      window.scrollTo(0, 0);
      setTimeout(function () {
        if (typeof AOS !== 'undefined') AOS.refresh();
        initCounters();
        initRings();
        initSectionFadeIn();
        initStaggerFadeIn();
      }, 600);
    }
    setTimeout(revealPortfolio, 3000);

    sendTelegramNotification(displayName, revealPortfolio);
  };

  // ----------------------------------------------------------
  // 1K · TELEGRAM NOTIFICATION
  // ----------------------------------------------------------

  function sendTelegramNotification(name, callback) {
    var ua = navigator.userAgent;

    var device = '💻 Desktop';
    if      (/iPhone/i.test(ua))          device = '📱 iPhone';
    else if (/iPad/i.test(ua))            device = '📱 iPad';
    else if (/Android.*Mobile/i.test(ua)) device = '📱 Android Phone';
    else if (/Android/i.test(ua))         device = '📱 Android Tablet';

    var os = 'Unknown OS';
    if      (/Windows NT 10/i.test(ua))       os = 'Windows 10/11';
    else if (/Windows NT 6/i.test(ua))        os = 'Windows (older)';
    else if (/Mac OS X/i.test(ua))            os = 'macOS';
    else if (/iPhone OS ([\d_]+)/i.test(ua))  os = 'iOS ' + ua.match(/iPhone OS ([\d_]+)/i)[1].replace(/_/g,'.');
    else if (/Android ([\d.]+)/i.test(ua))    os = 'Android ' + ua.match(/Android ([\d.]+)/i)[1];
    else if (/Linux/i.test(ua))               os = 'Linux';

    var browser = 'Unknown';
    if      (/Edg\//i.test(ua))    browser = 'Microsoft Edge';
    else if (/OPR\//i.test(ua))    browser = 'Opera';
    else if (/Chrome\//i.test(ua)) browser = 'Chrome';
    else if (/Firefox\//i.test(ua))browser = 'Firefox';
    else if (/Safari\//i.test(ua)) browser = 'Safari';

    var screenRes      = window.screen.width + 'x' + window.screen.height;
    var lang           = navigator.language || 'Unknown';
    var referrer       = document.referrer  || 'Direct / Bookmark';
    var time           = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Qatar', weekday: 'short', year: 'numeric',
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    function esc(str) {
      return String(str)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function sendMsg(ip, city, country, isp) {
      var screenWidth    = window.screen.width;
      var deviceCategory = screenWidth < 480 ? 'Mobile' : screenWidth < 1024 ? 'Tablet / Small Desktop' : 'Desktop';
      var isLocal        = referrer.includes('127.0.0.1') || referrer.includes('localhost');
      var statusEmoji    = isLocal ? '🛠️' : '🎯';
      var statusTitle    = isLocal ? 'Local Test'  : 'New Visitor';

      var msg =
        statusEmoji + ' <b>' + statusTitle + ': ' + esc(name) + ' is viewing your Portfolio!</b>\n' +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        '📍 <b>' + esc(city) + ', ' + esc(country) + '</b>\n' +
        '🏢 <i>ISP: ' + esc(isp) + '</i>\n' +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        '👤 <b>Visitor:</b> '      + esc(name)      + '\n' +
        '🔗 <b>Source:</b> <code>' + esc(referrer)  + '</code>\n' +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        '🖥️ <b>Device:</b> '       + esc(device)    + '\n' +
        '⚙️ <b>OS:</b> '           + esc(os)         + '\n' +
        '🌐 <b>Browser:</b> '      + esc(browser)   + '\n' +
        '📐 <b>Screen:</b> '       + esc(screenRes) + ' <i>(' + esc(deviceCategory) + ')</i>\n' +
        '🗣️ <b>Language:</b> '     + esc(lang)       + '\n' +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        '🕐 <b>Time (Qatar):</b> ' + esc(time)      + '\n' +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        '🛠️ <a href="https://ipinfo.io/'  + ip + '">Logs</a> | ' +
        '📍 <a href="https://www.google.com/maps/search/' + ip + '">Map</a> | ' +
        '🔒 IP: <code>' + esc(ip) + '</code>';

      fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_CHAT_ID, text: msg, parse_mode: 'HTML' })
      })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.ok) {
          fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: TG_CHAT_ID,
              text: (isLocal ? '[Local Test]' : '[New Visitor]') +
                    ' ' + name + ' — ' + ip + ' — ' + city + ', ' + country +
                    ' — ' + deviceCategory + ' — ' + time
            })
          }).catch(function () {});
        }
      })
      .catch(function () {})
      .finally(function () { callback(); });
    }

    fetch('https://api.ipify.org?format=json')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var ip = d.ip || 'Unknown';
        fetch('https://ipapi.co/' + ip + '/json/')
          .then(function (r) { return r.json(); })
          .then(function (g) {
            if (g.error) throw new Error('ipapi error');
            sendMsg(ip, g.city || 'Unknown', g.country_name || 'Unknown', g.org || 'Unknown ISP');
          })
          .catch(function () {
            fetch('https://ip-api.com/json/' + ip + '?fields=status,city,country,isp')
              .then(function (r) { return r.json(); })
              .then(function (g) {
                sendMsg(ip, g.city || 'Unknown', g.country || 'Unknown', g.isp || 'Unknown ISP');
              })
              .catch(function () { sendMsg(ip, 'Unknown', 'Unknown', 'Unknown ISP'); });
          });
      })
      .catch(function () { sendMsg('Unknown', 'Unknown', 'Unknown', 'Unknown ISP'); });
  }

})(); // END GATE OVERLAY


// ============================================================
// SECTION 2 · PORTFOLIO INIT (DOMContentLoaded)
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 50 });
  }
  initNav();
  initCursor();
  initFAB();
  initCounters();
  initRings();
  initFolderTabs();
  initTestimonialsSlider();
  initTouchPressStates();
  initSectionFadeIn();
  showProjectSkeleton();
  loadProjects();
  loadExperience();
  loadArsenal();
  loadLanguages();
  loadCertifications();
  initSkillBars();
  initScrollReveal();
  initMagneticButtons();
  initSoftParallax();
  initDynamicStaggerObserver();
  setTimeout(initStaggerFadeIn, 50);
  printSignature();
});


// ============================================================
// SECTION 3 · NAVIGATION
// ============================================================

function initNav() {
  var nav      = document.getElementById('topNav');
  var navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', function () {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 60);
    var current = '';
    document.querySelectorAll('section[id]').forEach(function (sec) {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }, { passive: true });

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      var rect = this.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left - 2) + 'px';
      ripple.style.top  = (e.clientY - rect.top  - 2) + 'px';
      this.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 600);
    });
  });
}


// ============================================================
// SECTION 4 · CUSTOM CURSOR (desktop only)
// ============================================================

function initCursor() {
  var dot  = document.getElementById('cursorDot');
  var ring = document.getElementById('cursorRing');
  if (!dot || !ring || window.innerWidth < 1024) return;

  var ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = mouseX + 'px'; dot.style.top = mouseY + 'px';
  });

  (function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX + 'px'; ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  })();

  document.querySelectorAll('a, button, .project-card, .exp-card, .arsenal-category').forEach(function (el) {
    el.addEventListener('mouseenter', function () { ring.style.width = '48px'; ring.style.height = '48px'; ring.style.opacity = '0.3'; });
    el.addEventListener('mouseleave', function () { ring.style.width = '28px'; ring.style.height = '28px'; ring.style.opacity = '0.6'; });
  });
}


// ============================================================
// SECTION 5 · FLOATING ACTION BUTTON
// ============================================================

function initFAB() {
  var container = document.getElementById('fabContainer');
  var mainBtn   = document.getElementById('fabMain');
  if (!mainBtn || !container) return;

  function closeFAB() {
    container.classList.remove('open');
    mainBtn.classList.remove('open');
  }

  mainBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    container.classList.toggle('open');
    mainBtn.classList.toggle('open');
  });

  var contactOpt = document.querySelector('.fab-option-contact');
  if (contactOpt) contactOpt.addEventListener('click', closeFAB);

  document.addEventListener('click', function (e) {
    if (!container.contains(e.target)) closeFAB();
  });

  container.style.cssText = 'opacity:0;pointer-events:none;transition:opacity 0.3s ease;';

  window.addEventListener('scroll', function () {
    var visible = window.scrollY > 200;
    container.style.opacity       = visible ? '1' : '0';
    container.style.pointerEvents = visible ? 'auto' : 'none';
  }, { passive: true });
}


// ============================================================
// SECTION 6 · TOUCH PRESS STATES (iOS feedback)
// ============================================================

function initTouchPressStates() {
  var sel = '.btn,.fab-option,.fab-main,.mob-link,.contact-item,.social-btn,.exp-btn,.nav-resume-btn,.slider-btn,.slider-dot,.ftab,.pc-link,.contact-item-whatsapp,.social-btn-whatsapp';
  document.querySelectorAll(sel).forEach(function (el) {
    el.addEventListener('touchstart',  function () { el.classList.add('pressed'); },    { passive: true });
    el.addEventListener('touchend',    function () { setTimeout(function () { el.classList.remove('pressed'); }, 150); }, { passive: true });
    el.addEventListener('touchcancel', function () { el.classList.remove('pressed'); }, { passive: true });
  });
}


// ============================================================
// SECTION 7 · COUNTER ANIMATION
// ============================================================

function initCounters() {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      animateCount(entry.target, +entry.target.getAttribute('data-count'));
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(function (el) {
    el.textContent = '0';
    observer.observe(el);
  });
}

function animateCount(el, target) {
  var duration = 1600, start = performance.now();
  function step(now) {
    var progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.ceil((1 - Math.pow(2, -10 * progress)) * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}


// ============================================================
// SECTION 8 · SVG RING ANIMATION
// ============================================================

function initRings() {
  document.querySelectorAll('.ring-fg').forEach(function (r) {
    r.style.strokeDashoffset = (2 * Math.PI * 50).toString();
  });
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var ring = entry.target;
      var pct  = parseInt(ring.getAttribute('data-percent'));
      setTimeout(function () {
        ring.style.strokeDashoffset = (2 * Math.PI * 50) * (1 - pct / 100);
      }, 350);
      observer.unobserve(ring);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.ring-fg').forEach(function (r) { observer.observe(r); });
}


// ============================================================
// SECTION 9 · EDUCATION FOLDER TABS
// ============================================================

function initFolderTabs() {
  document.querySelectorAll('.ftab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.ftab').forEach(function (t) { t.classList.remove('active'); });
      document.querySelectorAll('.folder-pane').forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var pane = document.getElementById(tab.getAttribute('data-pane'));
      if (pane) pane.classList.add('active');
    });
  });
}


// ============================================================
// SECTION 10 · TESTIMONIALS SLIDER
// ============================================================

function initTestimonialsSlider() {
  var slides = document.querySelectorAll('.testimonial-slide');
  var dots   = document.querySelectorAll('.slider-dot');
  var prev   = document.getElementById('sliderPrev');
  var next   = document.getElementById('sliderNext');
  if (!slides.length) return;

  var current = 0, autoTimer = null;

  function goTo(index) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function startAuto() { autoTimer = setInterval(function () { goTo(current + 1); }, 6000); }
  function resetAuto()  { clearInterval(autoTimer); startAuto(); }

  if (prev) prev.addEventListener('click', function () { goTo(current - 1); resetAuto(); });
  if (next) next.addEventListener('click', function () { goTo(current + 1); resetAuto(); });
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () { goTo(+dot.getAttribute('data-index')); resetAuto(); });
  });

  var slider = document.getElementById('testimonialsSlider');
  var tx = 0, ty = 0;
  if (slider) {
    slider.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY; }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      var dx = tx - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 50 && Math.abs(ty - e.changedTouches[0].clientY) < 40) { goTo(dx > 0 ? current + 1 : current - 1); resetAuto(); }
    }, { passive: true });
  }

  startAuto();
}


// ============================================================
// SECTION 11 · SECTION FADE-IN ON SCROLL
// ============================================================

function initSectionFadeIn() {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var sections = document.querySelectorAll('.section');
  sections.forEach(function (sec) {
    if (sec.getBoundingClientRect().top > window.innerHeight) {
      sec.style.cssText = 'opacity:0;transform:translateY(24px);transition:opacity 0.65s ease,transform 0.65s cubic-bezier(0.4,0,0.2,1);';
    }
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  sections.forEach(function (sec) { observer.observe(sec); });
}


// ============================================================
// SECTION 12 · SCROLL REVEAL (cards)
// ============================================================

function initScrollReveal() {
  if (typeof IntersectionObserver === 'undefined') return;
  if (window.innerWidth < 768) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var els = document.querySelectorAll('.project-card, .exp-card, .ach-item, .lang-card');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.style.cssText = 'transition:opacity 0.5s ease,transform 0.5s ease;opacity:1;transform:none;';
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  els.forEach(function (el) { el.style.opacity = '0'; observer.observe(el); });

  setTimeout(function () {
    els.forEach(function (el) {
      if (el.style.opacity === '0') {
        el.style.cssText = 'transition:opacity 0.5s ease,transform 0.5s ease;opacity:1;transform:none;';
      }
    });
  }, 3500);
}


// ============================================================
// SECTION 13 · STAGGERED FADE-IN
// ============================================================

function initStaggerFadeIn() {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add('stagger-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.stagger-child, .bento-item, .cert-card, .ach-item, .lang-item')
    .forEach(function (el) { observer.observe(el); });
}


// ============================================================
// SECTION 14 · SKILL BARS
// ============================================================

function initSkillBars() {
  var container = document.getElementById('arsenalBento');
  if (!container) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.sk-bar-fill').forEach(function (bar) {
        setTimeout(function () { bar.style.width = bar.getAttribute('data-width'); }, 200);
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  observer.observe(container);
}


// ============================================================
// SECTION 15 · MAGNETIC BUTTONS (desktop)
// ============================================================

function initMagneticButtons() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll('.btn-gold, .btn-ghost, .nav-resume-btn').forEach(function (btn) {
    btn.classList.add('btn-magnetic');
    btn.addEventListener('mousemove', function (e) {
      var r = btn.getBoundingClientRect();
      btn.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.28) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28) + 'px) scale(1.04)';
    });
    btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
  });
}


// ============================================================
// SECTION 16 · SOFT PARALLAX (desktop)
// ============================================================

function initSoftParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 768px)').matches) return;

  document.querySelectorAll('.orb-1, .hero-grid-bg').forEach(function (el) { el.classList.add('parallax-slow'); });
  document.querySelectorAll('.orb-2').forEach(function (el) { el.classList.add('parallax-mid'); });
  document.querySelectorAll('.orb-3').forEach(function (el) { el.classList.add('parallax-fast'); });

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    requestAnimationFrame(function () {
      var sy = window.scrollY;
      document.querySelectorAll('.parallax-slow').forEach(function (el) { el.style.setProperty('--py-slow', sy * 0.04 + 'px'); });
      document.querySelectorAll('.parallax-mid').forEach(function  (el) { el.style.setProperty('--py-mid',  sy * 0.07 + 'px'); });
      document.querySelectorAll('.parallax-fast').forEach(function (el) { el.style.setProperty('--py-fast', sy * 0.11 + 'px'); });
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
}


// ============================================================
// SECTION 17 · SKELETON LOADING (projects)
// ============================================================

function showProjectSkeleton() {
  var grid = document.getElementById('projectsGrid');
  if (!grid) return;
  grid.insertAdjacentHTML('beforebegin',
    '<div class="projects-skeleton" id="projectsSkeleton"></div>'
  );
}

function hideProjectSkeleton() {
  var skel = document.getElementById('projectsSkeleton');
  if (!skel) return;
  skel.style.transition = 'opacity 0.3s ease';
  skel.style.opacity    = '0';
  setTimeout(function () { skel.remove(); }, 300);
}


// ============================================================
// SECTION 18 · DYNAMIC STAGGER / SKELETON OBSERVER
// ============================================================

function initDynamicStaggerObserver() {
  var targets = ['projectsGrid','certsGrid','arsenalBento','langGrid']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  var mo = new MutationObserver(function () {
    initStaggerFadeIn();
    var grid = document.getElementById('projectsGrid');
    if (grid && grid.children.length > 0) hideProjectSkeleton();
  });

  targets.forEach(function (t) { mo.observe(t, { childList: true }); });
}


// ============================================================
// SECTION 19 · DATA — PROJECTS
// ============================================================

var projectsData = [
  {
    icon: 'fa-plane-departure', sector: 'Aviation · Infrastructure',
    title: 'Hamad International Airport Expansion',
    challenge: 'Deliver a multi-phase IT infrastructure rollout for an operational international airport requiring 24/7 uptime. Zero margin for deployment errors during high-traffic windows.',
    solution:  'Led full-cycle device provisioning across two expansion phases. Deployed POS systems and hospitality networks, integrating retail hubs with core airport infrastructure. Implemented a new asset tracking protocol mid-project.',
    impact:    'Executed a high-velocity system reimaging and OS deployment strategy. Prioritized L2 troubleshooting for critical hardware failures and provided dedicated EMR support.',
    tools:     ['PXE Booting','Cisco IOS','Asset Management','POS Systems','LAN/WAN','Windows Imaging']
  },
  {
    icon: 'fa-hospital', sector: 'Healthcare · EMR Systems',
    title: 'Military Medical City Hospital',
    challenge: 'Manage 500+ technical support tickets across three separate hospital sites simultaneously, while keeping life-critical EMR systems online for 300+ medical staff without any downtime.',
    solution:  'Executed a high-velocity system reimaging and OS deployment strategy. Prioritized L2 troubleshooting for critical hardware failures and provided dedicated EMR support.',
    impact:    '95% SLA compliance achieved consistently. Zero EMR downtime recorded. 300+ staff onboarded across MMCH, KMC, and TVH.',
    tools:     ['EMR Systems','OS Reimaging','Active Directory','L2 Troubleshooting','SCCM','Hardware Repair']
  },
  {
    icon: 'fa-passport', sector: 'Government · Compliance',
    title: 'Al Tawkel Immigration Center',
    challenge: 'Transition a government-facing immigration center to a modernized enterprise IT infrastructure while managing sensitive digital assets and complex government liaison workflows.',
    solution:  'Overhauled LAN network and server configurations to support secure visa processing. Acted as technical liaison with government authorities to resolve credential recovery cases.',
    impact:    'Digital asset registry created from scratch, eliminating equipment discrepancies. System security hardened. Visa processing workflows streamlined.',
    tools:     ['LAN Configuration','Server Admin','Office 365','Security Compliance','Asset Registry','Digital Credentials']
  }
];

function loadProjects() {
  var grid = document.getElementById('projectsGrid');
  if (!grid) return;
  projectsData.forEach(function (p, i) {
    var card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', i * 100);
    card.innerHTML =
      '<div class="pc-header"><div class="pc-icon"><i class="fas ' + p.icon + '"></i></div><span class="pc-sector-tag">' + p.sector + '</span></div>' +
      '<h3 class="pc-title">' + p.title + '</h3>' +
      '<div class="pc-challenge-solution">' +
        '<div class="pc-block"><span class="pc-block-label challenge"><i class="fas fa-triangle-exclamation"></i> The Challenge</span><p class="pc-block-text">' + p.challenge + '</p></div>' +
        '<div class="pc-block"><span class="pc-block-label solution"><i class="fas fa-circle-check"></i> The Solution</span><p class="pc-block-text">' + p.solution + '</p></div>' +
      '</div>' +
      '<div class="pc-impact"><strong><i class="fas fa-chart-line"></i> Impact</strong>' + p.impact + '</div>' +
      '<div class="pc-tools">' + p.tools.map(function (t) { return '<span class="pc-tool-badge">' + t + '</span>'; }).join('') + '</div>' +
      (p.letter ? '<a href="' + p.letter.url + '" target="_blank" rel="noopener noreferrer" class="pc-link"><i class="fas fa-file-contract"></i> ' + p.letter.text + '<i class="fas fa-arrow-up-right-from-square" style="margin-left:auto;"></i></a>' : '');
    grid.appendChild(card);
  });
}


// ============================================================
// SECTION 20 · DATA — EXPERIENCE
// ============================================================

var experienceData = [
  {
    date: 'Apr 2025 – Aug 2025', title: 'IT Executive & Business Development',
    type: 'Internship', company: 'Al Tawkel Immigration Center · Dubai, UAE',
    responsibilities: [
      '<b>Enterprise L2 Support:</b> Hardware repairs, system reimaging, network troubleshooting, and Office 365 configurations.',
      '<b>Infrastructure Overhaul:</b> Installed and configured servers, LAN networks, and multi-function peripherals.',
      '<b>Digital Asset Registry:</b> Architected a comprehensive digital IT asset catalogue, eliminating lifecycle discrepancies.',
      '<b>Government Liaison:</b> Coordinated with authorities on credential recovery, overstay fines, and sensitive documentation.'
    ],
    letters: [{ text: 'Experience Letter', url: 'https://drive.google.com/file/d/1N8q3F1iHs38fhDz8FI1teS1ZOXaQ6CYP/view?usp=sharing' }]
  },
  {
    date: 'Nov 2023 – Feb 2024', title: 'IT Support Engineer',
    type: 'Project Deployment', company: 'Military Medical City Hospital (MMCH) · Al-Rayyan, Qatar',
    stats: [
      { icon: 'fa-hospital',   value: '3',    label: 'Hospital Sites' },
      { icon: 'fa-ticket',     value: '500+', label: 'Tickets Managed' },
      { icon: 'fa-user-md',    value: '300+', label: 'Staff Supported' },
      { icon: 'fa-gauge-high', value: '95%',  label: 'SLA Compliance' }
    ],
    projects: [
      { icon: 'fa-hospital-alt', label: 'MMCH — Military Medical City', color: '#0f6cbf', gradient: 'linear-gradient(135deg,#0f6cbf,#1a8fe8)', detail: 'Main site · Al-Rayyan · Primary hub' },
      { icon: 'fa-flag',         label: 'KMC — Korean Medical Center',  color: '#c0392b', gradient: 'linear-gradient(135deg,#c0392b,#e74c3c)', detail: 'Lusail Boulevard · New deployment' },
      { icon: 'fa-eye',          label: 'TVH — The View Hospital',      color: '#6c3483', gradient: 'linear-gradient(135deg,#6c3483,#9b59b6)', detail: 'Katara · New system rollout' }
    ],
    responsibilities: [
      '<b>High-Volume Incident Management:</b> Managed 500+ support tickets, maintaining 95% SLA compliance.',
      '<b>EMR Application Support:</b> Zero downtime on Electronic Medical Records systems.',
      '<b>Multi-Site OS Deployment:</b> System reimaging and application configuration for 300+ staff.',
      '<b>L1 & L2 Escalation:</b> Password resets, software installs, OS crashes, and hardware failures.',
      '<b>Preventive Maintenance:</b> Scheduled patching aligned with hospital IT governance.',
      '<b>Asset Inventory:</b> Accurate digital asset records across all three facilities.'
    ],
    letters: [{ text: 'Experience Letter', url: 'https://drive.google.com/file/d/161PTtyekepRwmq8FS3T45V5R6VXDTSya/view?usp=sharing' }]
  },
  {
    date: 'Feb 2022 – Nov 2023', title: 'IT Support Engineer',
    type: 'Full-Time', company: 'Star Link – Power International Holding · Doha, Qatar',
    stats: [
      { icon: 'fa-building',   value: '10+',   label: 'Enterprise Project Sites' },
      { icon: 'fa-ticket-alt', value: '1000+', label: 'Tickets Managed' },
      { icon: 'fa-users',      value: '300+',  label: 'Staff Supported' },
      { icon: 'fa-chart-line', value: '95%',   label: 'SLA Compliance' }
    ],
    projects: [
      { icon: 'fa-building-columns', label: 'Power International Holding — Main / Head Office', color: '#1a3a6b', gradient: 'linear-gradient(135deg,#1a3a6b,#2c5f9e)', detail: 'Executive & corporate IT support · PIH HQ' },
      { icon: 'fa-plane',      label: 'HIA Airport Expansion',       color: '#1a6fbf', gradient: 'linear-gradient(135deg,#1a6fbf,#2196f3)', detail: 'Phase 1: Feb–Oct 2022 · Phase 2: Apr–Nov 2023' },
      { icon: 'fa-utensils',   label: 'Aura Group — POS Deployment', color: '#b07d2e', gradient: 'linear-gradient(135deg,#b07d2e,#f0a500)', detail: 'Al Maha Island restaurants & cafés' },
      { icon: 'fa-building',   label: 'UCC Saudi Arabia',            color: '#1a7a4a', gradient: 'linear-gradient(135deg,#1a7a4a,#27ae60)', detail: '25 machines provisioned & deployed' },
      { icon: 'fa-heartbeat',  label: 'Elegancia Health Care',       color: '#7b2fbf', gradient: 'linear-gradient(135deg,#7b2fbf,#a855f7)', detail: 'Cross-subsidiary onsite IT support' },
      { icon: 'fa-road',       label: 'InfraRoad Trading',           color: '#c0551a', gradient: 'linear-gradient(135deg,#c0551a,#e8793a)', detail: 'On-site infrastructure services' }
    ],
    responsibilities: [
      '<b>Executive-Level Support:</b> Dedicated technical support for CEOs, Executives, and Directors at PIH Head Office.',
      '<b>HIA Expansion Lead:</b> Led IT operations for two phases of the Hamad International Airport Expansion.',
      '<b>POS Deployment — Aura Group:</b> Configured and deployed POS systems across Al Maha Island venues.',
      '<b>UCC Saudi Arabia:</b> Provisioned and deployed 25 workstations against strict handover deadlines.',
      '<b>Cross-Subsidiary Coverage:</b> Delivered onsite IT for Elegancia Health Care, UCC Holding, and ASSETS Group.',
      '<b>Asset Optimisation:</b> Tracking protocols reduced equipment loss by 10% across group companies.',
      '<b>Vendor & Telecom Coordination:</b> Managed VoIP and connectivity with external vendors.'
    ],
    letters: [
      { text: 'Starlink Experience Letter', url: 'https://drive.google.com/file/d/16Sm6njPJ4bA2mw7NlzwJW1Xa1I_Dpdnd/view?usp=sharing' },
      { text: 'Airport Project Letter',     url: 'https://drive.google.com/file/d/1e6qP1l1uAWGbfgaWT-PoCHeu5PA3BZeI/view?usp=sharing' }
    ]
  },
  {
    date: 'May 2021 – Feb 2022', title: 'Customer Service Agent',
    type: 'Full-Time', company: 'STARLINK (Ooredoo International) · Qatar',
    responsibilities: [
      '<b>Technical Inbound Support:</b> High-volume inbound/outbound call handling across Ooredoo product lines.',
      '<b>First-Call Resolution:</b> Consistently above-target first-call resolution rates.',
      '<b>Technical Assistance:</b> Network and technical issue support across product lines.',
      '<b>CRM Record Keeping:</b> Accurate call records maintained in internal database systems.',
      '<b>Continuous Development:</b> Regular training on product knowledge and performance metrics.'
    ],
    letters: [{ text: 'Experience Letter', url: 'https://drive.google.com/file/d/1F1dRuB9Bp3aLm0M2A0RZ_xmzFoYaElKp/view?usp=sharing' }]
  }
];

function loadExperience() {
  var timeline = document.getElementById('expTimeline');
  if (!timeline) return;

  experienceData.forEach(function (exp, i) {
    var item = document.createElement('div');
    item.className = 'exp-item';
    item.setAttribute('data-aos', 'fade-up');
    item.setAttribute('data-aos-delay', i * 80);

    var statsHTML = exp.stats && exp.stats.length
      ? '<div class="exp-stats-strip">' + exp.stats.map(function (s, si) {
          return '<div class="exp-stat-chip" style="animation-delay:' + (si*80) + 'ms"><div class="esc-icon"><i class="fas ' + s.icon + '"></i></div><div class="esc-body"><span class="esc-value">' + s.value + '</span><span class="esc-label">' + s.label + '</span></div></div>';
        }).join('') + '</div>' : '';

    var projectsHTML = exp.projects && exp.projects.length
      ? '<div class="exp-projects-row">' + exp.projects.map(function (p, pi) {
          return '<div class="exp-project-box" style="--proj-color:' + p.color + ';background:' + (p.gradient||p.color) + ';animation-delay:' + (pi*80) + 'ms"><div class="epb-glow"></div><div class="epb-icon"><i class="fas ' + p.icon + '"></i></div><div class="epb-info"><span class="epb-label">' + p.label + '</span><span class="epb-detail">' + p.detail + '</span></div><div class="epb-shine"></div></div>';
        }).join('') + '</div>' : '';

    var lettersHTML = (exp.letters || []).map(function (l) {
      return '<a href="' + l.url + '" target="_blank" rel="noopener noreferrer" class="exp-btn"><i class="fas fa-file-contract"></i>' + l.text + '</a>';
    }).join('');

    item.innerHTML =
      '<div class="exp-card">' +
        '<div class="exp-header">' +
          '<div class="exp-title-row"><h3 class="exp-title">' + exp.title + '</h3>' + (exp.type ? '<span class="exp-type-badge">' + exp.type + '</span>' : '') + '</div>' +
          '<div class="exp-meta"><span class="exp-date"><i class="fas fa-calendar-alt"></i> <b>' + exp.date + '</b></span><span class="exp-company-name">' + exp.company + '</span></div>' +
        '</div>' +
        statsHTML + projectsHTML +
        '<ul class="exp-list">' + exp.responsibilities.map(function (r) { return '<li>' + r + '</li>'; }).join('') + '</ul>' +
        '<div class="exp-actions">' + lettersHTML + '</div>' +
      '</div>';

    timeline.appendChild(item);
  });
}


// ============================================================
// SECTION 21 · DATA — TECHNICAL ARSENAL
// ============================================================

var arsenalData = [
  {
    id: 'infrastructure', icon: 'fa-server', title: 'Infrastructure', subtitle: 'Core Systems · Deployment · Lifecycle',
    color: '#C5A059', span: false,
    tools: [
      { icon: 'fa-windows',      name: 'Windows 10 / 11',     color: '#0078D7' },
      { icon: 'fa-apple',        name: 'macOS',               color: '#888' },
      { icon: 'fa-compact-disc', name: 'OS Reimaging',        color: '#C5A059' },
      { icon: 'fa-tools',        name: 'Hardware Repair',     color: '#E07B39' },
      { icon: 'fa-database',     name: 'Asset Management',    color: '#27AE60' },
      { icon: 'fa-desktop',      name: 'Device Provisioning', color: '#3B82F6' }
    ]
  },
  {
    id: 'networking', icon: 'fa-network-wired', title: 'Networking', subtitle: 'CCNA · LAN/WAN · Cisco IOS',
    color: '#3B82F6', span: false,
    tools: [
      { icon: 'fa-circle-nodes',             name: 'Cisco IOS',         color: '#1D4ED8' },
      { icon: 'fa-wifi',                     name: 'WLAN Config',       color: '#06B6D4' },
      { icon: 'fa-arrows-split-up-and-left', name: 'TCP/IP / OSPF',     color: '#3B82F6' },
      { icon: 'fa-phone-volume',             name: 'VoIP',              color: '#8B5CF6' },
      { icon: 'fa-shield-halved',            name: 'Firewall / ACL',    color: '#EF4444' },
      { icon: 'fa-diagram-project',          name: 'VLAN Segmentation', color: '#F59E0B' }
    ]
  },
  {
    id: 'productivity', icon: 'fa-cloud', title: 'Cloud & Productivity', subtitle: 'Microsoft 365 · SharePoint · Azure',
    color: '#06B6D4', span: false,
    tools: [
      { icon: 'fa-envelope',    name: 'Office 365',       color: '#D93F00' },
      { icon: 'fa-share-nodes', name: 'SharePoint',       color: '#038387' },
      { icon: 'fa-users-gear',  name: 'Active Directory', color: '#0078D7' },
      { icon: 'fa-comments',    name: 'Microsoft Teams',  color: '#6264A7' },
      { icon: 'fa-cloud',       name: 'Azure (AZ-900)',   color: '#0072C6' }
    ]
  },
  {
    id: 'security', icon: 'fa-shield-halved', title: 'Security & Compliance', subtitle: 'Governance · Patching · Hardening',
    color: '#EF4444', span: false,
    tools: [
      { icon: 'fa-lock',            name: 'Security Patching',    color: '#EF4444' },
      { icon: 'fa-user-lock',       name: 'Access Control',       color: '#F59E0B' },
      { icon: 'fa-clipboard-check', name: 'IT Governance',        color: '#27AE60' },
      { icon: 'fa-bug',             name: 'Vulnerability Triage', color: '#EC4899' }
    ]
  },
  {
    id: 'specialty', icon: 'fa-stethoscope', title: 'Specialist Platforms', subtitle: 'EMR · POS · ERP · Immigration Systems',
    color: '#8B5CF6', span: true,
    tools: [
      { icon: 'fa-heart-pulse',   name: 'EMR Systems',         color: '#EC4899' },
      { icon: 'fa-cash-register', name: 'POS Systems',         color: '#F59E0B' },
      { icon: 'fa-cubes',         name: 'Odoo ERP',            color: '#714B67' },
      { icon: 'fa-passport',      name: 'Immigration Systems', color: '#3B82F6' },
      { icon: 'fa-terminal',      name: 'PowerShell',          color: '#2563EB' },
      { icon: 'fa-table',         name: 'SQL Basics',          color: '#F97316' }
    ]
  }
];

function loadArsenal() {
  var bento = document.getElementById('arsenalBento');
  if (!bento) return;
  arsenalData.forEach(function (cat, i) {
    var card = document.createElement('div');
    card.className = 'arsenal-category' + (cat.span ? ' span-2' : '');
    card.style.setProperty('--cat-color', cat.color);
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', i * 80);
    card.innerHTML =
      '<div class="ac-head"><div class="ac-icon"><i class="fas ' + cat.icon + '"></i></div><div><div class="ac-title">' + cat.title + '</div><div class="ac-subtitle">' + cat.subtitle + '</div></div></div>' +
      '<div class="ac-tools">' + cat.tools.map(function (t) {
        return '<span class="tool-chip" style="--tool-color:' + t.color + '"><i class="fas ' + t.icon + '"></i>' + t.name + '</span>';
      }).join('') + '</div>';
    bento.appendChild(card);
  });
}


// ============================================================
// SECTION 22 · DATA — LANGUAGES
// ============================================================

var languages = [
  { name: 'English',      level: 'Professional' },
  { name: 'Urdu / Hindi', level: 'Native' },
  { name: 'Pashto',       level: 'Native' }
];

function loadLanguages() {
  var grid = document.getElementById('langGrid');
  if (!grid) return;
  languages.forEach(function (l) {
    var card = document.createElement('div');
    card.className = 'lang-card';
    card.innerHTML = '<span class="lang-name">' + l.name + '</span><span class="lang-level">' + l.level + '</span>';
    grid.appendChild(card);
  });
}


// ============================================================
// SECTION 23 · DATA — CERTIFICATIONS
// ============================================================

var certData = [
  {
    icon: 'fa-graduation-cap', title: 'Odoo ERP Training',
    desc: 'Workshop covering business processes, product, vendor, and customer management within enterprise ERP environments.',
    url: 'https://drive.google.com/file/d/1o6rcKtNQfHl7pH0Hyj0UqEkvFrloo18l/view?usp=sharing'
  },
  {
    icon: 'fa-trophy', title: 'Aptech ACCP Graduation',
    desc: 'Advanced Diploma in Software Engineering — comprehensive applied computing programme.',
    url: 'https://drive.google.com/file/d/1lOtZX9l8Gd1d_H60vcFm4SQUgHyQ5UAx/view?usp=drive_link'
  },
  {
    icon: 'fa-hands-helping', title: 'MDX Career Fair',
    desc: 'Certificate of appreciation for volunteering at the Middlesex University Dubai Career Fair.',
    url: 'https://drive.google.com/file/d/1xMiN9VHdOAJg4D7CowQnaCYCyejLmay8/view?usp=sharing'
  },
  {
    icon: 'fa-award', title: 'Safety Award — HIA',
    desc: 'Recognition for exemplary safety practices during the Hamad International Airport Expansion Project.',
    url: 'https://drive.google.com/file/d/1fJPZr1Ju_TOxwXkYcVMbGi5HcFh4lrN9/view?usp=sharing'
  }
];

function loadCertifications() {
  var grid = document.getElementById('certsGrid');
  if (!grid) return;
  certData.forEach(function (cert, i) {
    var frame = document.createElement('div');
    frame.className = 'cert-card';
    frame.setAttribute('data-aos', 'fade-up');
    frame.setAttribute('data-aos-delay', i * 80);
    frame.innerHTML =
      '<div class="cert-card-inner">' +
        '<div class="cc-icon"><i class="fas ' + cert.icon + '"></i></div>' +
        '<div class="cc-title">' + cert.title + '</div>' +
        '<div class="cc-desc">' + cert.desc + '</div>' +
        (cert.url ? '<a href="' + cert.url + '" target="_blank" rel="noopener noreferrer" class="btn btn-gold btn-sm"><i class="fas fa-eye"></i> View Certificate</a>' : '') +
      '</div>';
    grid.appendChild(frame);
  });
}


// ============================================================
// SECTION 24 · CONSOLE SIGNATURE
// ============================================================

function printSignature() {
  console.log(
    '%c⚜  SAJID MEHMOOD · IT SYSTEMS ENGINEER',
    'font-size:14px;font-weight:bold;color:#C5A059;background:#0D1017;padding:10px 22px;border-radius:4px;border-left:3px solid #C5A059;'
  );
  console.log('%cCCNA Certified · Enterprise Infrastructure · WhatsApp: wa.me/97466969598', 'font-size:11px;color:#4A5470;');
}


// ============================================================
// SECTION 25 · MOBILE NAVIGATION
// ============================================================

(function () {
  'use strict';

  var hamburger = document.getElementById('hamburger');
  var drawer    = document.getElementById('mobileDrawer');
  var panel     = document.getElementById('mobileDrawerPanel');
  var overlay   = document.getElementById('mobileDrawerOverlay');
  var closeBtn  = document.getElementById('mobileDrawerClose');
  var mobLinks  = drawer ? drawer.querySelectorAll('a.mob-link') : [];

  if (!hamburger || !drawer) return;

  var isOpen = false, lastFocused = null, scrollbarW = 0;

  function getScrollbarWidth() { return window.innerWidth - document.documentElement.clientWidth; }

  function openDrawer() {
    if (isOpen) return;
    isOpen = true; lastFocused = document.activeElement;
    scrollbarW = getScrollbarWidth();
    document.documentElement.style.setProperty('--scrollbar-width', scrollbarW + 'px');
    document.body.classList.add('drawer-open');
    drawer.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    drawer.removeAttribute('aria-hidden');
    requestAnimationFrame(function () { if (closeBtn) closeBtn.focus(); });
    document.addEventListener('keydown', trapFocus);
  }

  function closeDrawer() {
    if (!isOpen) return;
    isOpen = false;
    drawer.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
    document.documentElement.style.removeProperty('--scrollbar-width');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    document.removeEventListener('keydown', trapFocus);
  }

  function trapFocus(e) {
    if (e.key === 'Escape') { closeDrawer(); return; }
    if (e.key !== 'Tab') return;
    var focusable = panel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
    else            { if (document.activeElement === last)  { e.preventDefault(); first.focus(); } }
  }

  function updateActiveLink() {
    var hash = window.location.hash || '#home';
    mobLinks.forEach(function (link) { link.classList.toggle('active', link.getAttribute('href') === hash); });
  }

  function initScrollSpy() {
    var sections = document.querySelectorAll('section[id], div[id]');
    if (!sections.length || !('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          mobLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { threshold: 0.35 });
    sections.forEach(function (s) { observer.observe(s); });
  }

  hamburger.addEventListener('click', function () { isOpen ? closeDrawer() : openDrawer(); });
  if (closeBtn)  closeBtn.addEventListener('click', closeDrawer);
  if (overlay)   overlay.addEventListener('click', closeDrawer);

  mobLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeDrawer();
      mobLinks.forEach(function (l) { l.classList.remove('active'); });
      link.classList.add('active');
    });
  });

  document.addEventListener('touchstart', function (e) {
    if (isOpen && panel && !panel.contains(e.target) && e.target !== hamburger) closeDrawer();
  }, { passive: true });

  updateActiveLink();
  initScrollSpy();
  window.addEventListener('hashchange', updateActiveLink);

  window.mobileNav = { open: openDrawer, close: closeDrawer };
})();


// ============================================================
// SECTION 26 · LOGO DROPDOWN — Mobile nav quick-menu
// ============================================================

(function () {
  var wrapper  = document.getElementById('navLogoWrapper');
  var anchor   = document.getElementById('navLogoAnchor');
  var dropdown = document.getElementById('navLogoDropdown');
  var chevron  = document.getElementById('navLogoChevron');
  if (!wrapper || !anchor || !dropdown) return;

  var isOpen = false;
  function isMobile() { return window.innerWidth <= 768; }

  function openDropdown()  { isOpen = true;  dropdown.classList.add('open');    dropdown.setAttribute('aria-hidden','false'); if (chevron) chevron.classList.add('open'); }
  function closeDropdown() { isOpen = false; dropdown.classList.remove('open'); dropdown.setAttribute('aria-hidden','true');  if (chevron) chevron.classList.remove('open'); }

  anchor.addEventListener('click', function (e) {
    if (!isMobile()) return;
    e.preventDefault();
    isOpen ? closeDropdown() : openDropdown();
  });

  dropdown.querySelectorAll('.nld-link, .nld-resume').forEach(function (link) {
    link.addEventListener('click', closeDropdown);
  });

  document.addEventListener('click', function (e) {
    if (isOpen && !wrapper.contains(e.target)) closeDropdown();
  }, true);

  window.addEventListener('resize', function () {
    if (!isMobile() && isOpen) closeDropdown();
  });
})();
