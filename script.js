// ============================================================
// SAJID MEHMOOD · IT SYSTEMS ENGINEER
// script.js — Full Rewrite v2.2
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

  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('.nav-anchor');
    if (!anchor) return;
    var href = anchor.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    scrollTo(href);
  }, true);
})();


// ============================================================
// SECTION 0B · SCROLL PROGRESS BAR
// ============================================================

(function () {
  var bar = document.getElementById('scrollProgress');
  if (!bar) return;
  var _raf = false;
  window.addEventListener('scroll', function () {
    if (_raf) return;
    _raf = true;
    requestAnimationFrame(function () {
      _raf = false;
      var pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
      bar.style.width = Math.min(pct, 100) + '%';
    });
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
    // Unified blue palette — no purple/violet noise
    this.hue = [210, 212, 215][Math.floor(Math.random() * 3)];
    this.sat = Math.floor(Math.random() * 15) + 30;  // 30–45% subtle
    this.lit = Math.floor(Math.random() * 10) + 55;  // 55–65% mid
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
    var twinkleAlpha = (Math.sin(this.twinkle) * 0.2 + 0.6) * (this.life / this.maxLife);
    ctx.save();
    if (this.type === 'diamond') {
      var grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 6);
      grd.addColorStop(0, 'hsla(' + this.hue + ',' + this.sat + '%,' + this.lit + '%,' + (twinkleAlpha * 0.25) + ')');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r * 6, 0, Math.PI * 2); ctx.fill();
      ctx.translate(this.x, this.y); ctx.rotate(Math.PI / 4 + this.twinkle * 0.1);
      ctx.fillStyle = 'hsla(' + this.hue + ',' + this.sat + '%,' + this.lit + '%,' + (twinkleAlpha * 0.65) + ')';
      ctx.fillRect(-this.r * 1.2, -this.r * 1.2, this.r * 2.4, this.r * 2.4);
    } else {
      var grd2 = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 4);
      grd2.addColorStop(0, 'hsla(' + this.hue + ',' + this.sat + '%,' + this.lit + '%,' + (twinkleAlpha * 0.15) + ')');
      grd2.addColorStop(1, 'transparent');
      ctx.fillStyle = grd2;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r * 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'hsla(' + this.hue + ',' + this.sat + '%,' + this.lit + '%,' + (twinkleAlpha * 0.7) + ')';
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
    this.opacity = Math.random() * 0.04 + 0.01; // halved — barely visible texture
    this.hue = 210; // single unified blue, no teal/purple split
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
    'hsla(210, 20%, 80%, OPACITY)', // Soft Grey-Blue
    'hsla(0, 0%, 90%, OPACITY)',    // Soft White
    'hsla(210, 30%, 85%, OPACITY)'  // Muted Silver
  ];
  waves.push(new Wave(0, 22, 0.25, waveColors[0], 0.035));
  waves.push(new Wave(0, 16, -0.18, waveColors[1], 0.028));
  waves.push(new Wave(0, 12, 0.32, waveColors[2], 0.022));

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
          var op = (1 - d / LINK_DIST) * 0.10;
          var life = Math.min(particles[a].life / particles[a].maxLife, particles[b].life / particles[b].maxLife);
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.strokeStyle = 'hsla(212, 40%, 65%,' + (op * life) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function drawAurora(t) {
    var aurora1 = ctx.createLinearGradient(0, H * 0.2, W, H * 0.8);
    aurora1.addColorStop(0,   'hsla(210,40%,70%,0)');
    aurora1.addColorStop(0.3, 'hsla(212,35%,72%,' + (0.018 + 0.008 * Math.sin(t * 0.003)) + ')');
    aurora1.addColorStop(0.6, 'hsla(215,30%,75%,' + (0.012 + 0.006 * Math.cos(t * 0.004)) + ')');
    aurora1.addColorStop(1,   'hsla(210,25%,78%,0)');
    ctx.fillStyle = aurora1;
    ctx.fillRect(0, 0, W, H);
    if (mouse.x > 0) {
      var grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 240);
      grd.addColorStop(0, 'hsla(212,40%,68%,0.03)');
      grd.addColorStop(0.5, 'hsla(210,30%,72%,0.015)');
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
        var alpha = 0.015 + pulse * 0.012;
        if (dist < 220) alpha += (1 - dist / 220) * 0.025;
        ctx.beginPath();
        for (var k = 0; k < 6; k++) {
          var angle = (Math.PI / 3) * k;
          var hx = cx + size * Math.cos(angle), hy = cy + size * Math.sin(angle);
          k === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.strokeStyle = 'hsla(212,35%,68%,' + alpha + ')';
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
// SECTION 1 · GATE OVERLAY — Professional Name Validation v2.2
// ============================================================

(function () {
  'use strict';

  // ----------------------------------------------------------
  // NTFY.SH — Push notification endpoint
  // Subscribe to this topic in the ntfy app on your phone.
  // Keep this topic name private — anyone who knows it can publish.
  // ----------------------------------------------------------
  // Rate limit: max 5 attempts per session, 3s cooldown between submits
  var _submitCount      = 0;
  var _lastSubmitMs     = 0;
  var MAX_ATTEMPTS      = 5;
  var SUBMIT_COOLDOWN_MS = 3000;

  document.body.style.overflow = 'hidden';
  document.body.classList.add('gate-active');

  // ----------------------------------------------------------
  // 1A · CONSTANTS
  // ----------------------------------------------------------

  var MIN_LEN = 2;
  var MAX_LEN = 30;

  // ----------------------------------------------------------
  // 1B · LEET-SPEAK + UNICODE NORMALIZER
  // ----------------------------------------------------------

  var LEET_MAP = {
    '0':'o','1':'i','3':'e','4':'a','5':'s','6':'g',
    '7':'t','8':'b','9':'g','@':'a','$':'s','!':'i','+':'t'
  };

  function decodeLeet(str) {
    return str.toLowerCase().split('').map(function (c) {
      return LEET_MAP[c] || c;
    }).join('');
  }

  function normalize(str) {
    return decodeLeet(str)
      .replace(/[àáâãäåā]/g, 'a').replace(/[èéêëē]/g, 'e')
      .replace(/[ìíîïī]/g, 'i').replace(/[òóôõöō]/g, 'o')
      .replace(/[ùúûüū]/g, 'u').replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c').replace(/[ß]/g, 'ss')
      .replace(/[^a-z]/g, '');
  }

  // ----------------------------------------------------------
  // 1C · BLOCKED: PROFANITY — English + Roman Urdu/Hindi
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
    'suar','suwar',
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
    'madar','teriamma',
    'maaki','terimaaki',
    'madarchod'
  ];

  // ----------------------------------------------------------
  // 1D · BLOCKED: ROMANTIC / ENDEARMENT TERMS
  // ----------------------------------------------------------

  var ROMANTIC = [
    // English endearments / pet names
    'sweet','sweety','sweetie','sweetheart','sweetzz','sweetness',
    'honey','honeybee','honeybun','honeypie','honeykins',
    'babe','baby','babygirl','babyboy','babydoll','babyface','babykins',
    'darling','darlingg',
    'lover','loverboy','lovergirl','lovebird','lovebug','loveydovey',
    'lovey','lovie','loveable','lovemaster',
    'cutie','cutiepie','cuteness','cutiecutie',
    'angel','angelface','angelbaby','angelgirl','angelboy',
    'pretty','prettygirl','prettyone','prettyboy','prettyface',
    'gorgeous','gorgeousgirl','gorgeousboy',
    'flirt','flirty','flirter','flirtybabe',
    'romeo','juliet','casanova','lothario','charmer',
    'charm','charming',
    'dreamy','dreamboat','dreamgirl','dreamboy',
    'heartthrob','hearthrob',
    'sugar','sugarplum','sugarbabe','sugarbabes','sugarpie',
    'candy','candygirl','candyboy','candycane',
    'kiss','kissy','kisses','kissme','smooch','smoochy',
    'hugs','hugsy','huggie','hugsandkisses',
    'snuggle','snuggles','snuggly','snugglekins','snugglebear',
    'cuddle','cuddles','cuddly','cuddlebug','cuddlekins',
    'pookie','pookiebear','pookiekins','poohbear','teddybear','teddyboo',
    'wifey','hubby','beau',
    'stud','hunk',
    'seductive','seductress',
    'temptress','tempting',
    'irresistible',
    'myqueen','myking','myprincess','myprince',
    'myangel','myhoney','mybaby','mybabe','mydarling','mysweetheart',
    'mysweetie','mylife','myheart','mysoul','mylove','myworld',
    'dreamlover','secretlover','closetlover',
    'romantic','romance','romantica',
    'passion','passionate',
    'beloved','adored','adore','adorable',
    'flirtatious','crush','crushie',
    'wink','winky','blush','blushy',
    'xoxo','xoxoxo','muah','mwah',
    'heartbeat','butterflies',
    // Roman Urdu romantic terms
    'jaan','jaanu','jaaneman','jaanijaan',
    'pyar','pyari','pyaari','pyaruu',
    'mehboob','mehbooba','mehboobaa',
    'aashiq','aashiqa','aashiqui',
    'dilbar','dilruba','dildaar','dilnasheen',
    'chaand','chand','chandni','chandaa',
    'gul','gulzar','gulabo',
    'shona','shonaaa','shunaaa',
    'babujaan','babujan','babujii',
    'raja','rani',
    'sajna','sajni',
    'hasina','husnpari',
    'paro','devdas',
    'laila','majnu',
    'mishti','misti',
    'mishty'
  ];

  // ----------------------------------------------------------
  // 1E · BLOCKED: ANIMALS
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
    'toucan','parakeet','macaw','cockatoo','canary','finch',
    'sparrow','pigeon','hawk','eagle','falcon','owl','vulture',
    'shark','whale','dolphin','seal','walrus','otter','beaver',
    'mink','ferret','weasel','badger','hedgehog','mole','shrew',
    'vole','gerbil','chinchilla','capybara',
    'sloth','armadillo','anteater','aardvark','tapir','llama',
    'alpaca','bison','moose','elk','deer','antelope','gazelle',
    'impala','wildebeest','hyena','cheetah','leopard','jaguar',
    'panther','puma','cougar','lynx','bobcat','ocelot',
    'mongoose','meerkat','warthog','boar',
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
  // 1F · BLOCKED: KEYBOARD SPAM / FILLER WORDS
  // ----------------------------------------------------------

  var NONSENSE = [
    'asdf','asdff','asdfg','asdfgh','qwerty','qwert','qwertyuiop',
    'zxcv','zxcvb','zxcvbn','hjkl','uiop','tyui','erty',
    'aaaa','bbbb','cccc','dddd','eeee','ffff','gggg','hhhh',
    'iiii','jjjj','kkkk','llll','mmmm','nnnn','oooo','pppp',
    'qqqq','rrrr','ssss','tttt','uuuu','vvvv','wwww','xxxx',
    'yyyy','zzzz','abcd','abcde','abcdef','efgh','ijkl','mnop',
    'abababab','ababab','xoxo','xoxoxo',
    'test','testing','tester','tested','testuser',
    'user','users','username','userid','usertest',
    'guest','guestuser','admin','administrator','root','superuser',
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
    'good','bad','nice','best','cool','smart','rich','poor',
    'big','small','tall','short','fast','slow','hot','cold',
    'happy','sad','mad','glad','angry','lucky','sorry',
    'real','fake','true','love','hate','life','dead','kill',
    'money','food','water','fire','earth','wind','sky','star',
    'sun','moon','cloud','rain','snow','day','night',
    'home','house','room','door','window','car','road',
    'city','town','place','world','country','land','sea',
    'king','queen','lord','god','master',
    'super','mega','ultra','hyper','epic','elite','pro','max',
    'dark','black','white','red','blue','green','gold','silver',
    // Onomatopoeia / toy words not caught by pattern rules
    'blinky','plinky','winky','dinky','zinky','slinky',
    'bubbly','gubbly','wubbly','dubby','lubby','subby','zubby',
    'splishsplash','snipsnap','skrisbkrab','flipflap','glimglam',
    'flipadoo','bloopa','blapa','gripgrab','glubglub'
  ];

  // ----------------------------------------------------------
  // 1G · BLOCKED: JOB TITLES & ROLES
  // ----------------------------------------------------------

  var TITLES = [
    'doctor','dr','nurse','engineer','manager','officer',
    'director','supervisor','coordinator','administrator',
    'teacher','professor','lecturer','principal','dean',
    'ceo','cto','cfo','coo','vp','svp','evp','gm',
    'president','chairman','chairperson','chairwoman',
    'intern','trainee','assistant','associate',
    'analyst','consultant','advisor','specialist',
    'technician','mechanic','operator','agent',
    'sir','maam','madam','miss','mister','mr','mrs','ms',
    'boss','chief','head','lead','senior','junior',
    'captain','general','colonel','major','lieutenant',
    'sergeant','corporal','admiral','commander',
    'clerk','receptionist','secretary','staff',
    'owner','founder','cofounder','partner',
    'volunteer','freelancer','contractor','vendor',
    'developer','programmer','coder','designer',
    'accountant','auditor','lawyer','attorney','barrister',
    'dentist','surgeon','pharmacist','therapist',
    'pilot','driver','guard','security',
    'inspector','detective','investigator'
  ];

  // ----------------------------------------------------------
  // 1H · BLOCKED: FICTIONAL & CELEBRITY CHARACTERS
  // ----------------------------------------------------------

  var FICTIONAL = [
    // Superheroes / comics
    'batman','superman','spiderman','ironman','hulk','thor',
    'deadpool','wolverine','venom','aquaman','flash','cyborg',
    'captainamerica','wonderwoman','blackwidow','hawkeye',
    'antman','blackpanther','doctorstrange','greenlantern',
    'nightwing','robinn','catwoman','penguin','riddler',
    // Anime / manga
    'naruto','goku','vegeta','luffy','sasuke','itachi',
    'zoro','ichigo','eren','levi','mikasa','hinata',
    'deku','bakugo','todoroki','allmight','nezuko',
    'tanjiro','zenitsu','inosuke','gintoki','rukia',
    // Gaming
    'mario','luigi','link','zelda','samus','pikachu',
    'masterchief','kratos','geralt','ezio','altair',
    'cloud','tifa','aerith','noctis','lightning',
    'arthur','trevor','michael','niko','cj','tommy',
    'lara','croft','nathan','drake','joel','ellie',
    // Movies / TV / Books
    'joker','dracula','frankenstein','sherlock',
    'hamlet','tarzan','hercules','achilles','leonidas',
    'thanos','loki','magneto','mystique','xavier',
    'yoda','skywalker','darthvader','chewbacca','gandalf',
    'frodo','bilbo','aragorn','legolas','gimli','sauron',
    'voldemort','dumbledore','hermione','snape',
    'jamesbond','ethan','hunt','jasonbourne',
    'tonystark','steverogers','peterparker',
    'brucewane','clarkkent','dianaprince',
    'jacksparrow',
    // Generic tropes
    'villain','antihero','sidekick','protagonist','antagonist',
    'superhero','supervillain','mastermind',
    // Local pop culture
    'meeraali','bhola','nawabzada',
    'sultan','sikandar','badshah',
    'heer','ranjha','sohni','mahiwal',
    'romeo','juliet'
  ];

  // ----------------------------------------------------------
  // 1I · BLOCKED: FAMILY / RELATION TERMS
  // ----------------------------------------------------------

  var RELATIONS = [
    // English family terms
    'father','dad','daddy','dada','papa','pop','pops',
    'mother','mom','mommy','mama','mum','mummy',
    'son','daughter','sibling',
    'brother','bro','sister','sis',
    'uncle','aunt','auntie','aunty',
    'grandfather','grandpa','grandmother','grandma',
    'grandson','granddaughter',
    'nephew','niece',
    'cousin','cousins',
    'husband','wife',
    'fiance','fiancee',
    // Roman Urdu / Hindi family terms
    'beta','beti','betu','betaa','betaji','uraba','urbab','aba',
    'bhai','bhaia','bhaijaan','bhaisaab',
    'behan','behna','aapa','apa','didi',
    'chacha','chachajaan','kaka','taya','taaya','chachoo',
    'chachi','mami','khala','phupho','phuppi','mamani',
    'nana','daada','nanajaan','dadajaan',
    'nani','daadi','nanijaan','dadijaan',
    'pota','poti','nwasa','nawasa',
    'bhanja','bhanji',
    'abu','abbu','abba','abujaan','walid',
    'ammi','amma','amijan','walidain',
    'baap','maa','bap','pitaji','pitah','maaji','maata',
    'chachu','mamujaan','maamu','mamu',
    'phuppa','phuppajaan',
    'jija','jijaji','bhabhi','bhabhijaan',
    'shohar','biwi',
    'dulha','dulhan',
    'sasur','saas','devar','devrani','jethani','jeth',
    'nanad','nanand','nandoi',
    // Arabic / Islamic family terms
    'abi','ummi','umm','ibn','bint','akhi','ukhti',
    'khalid','walida','zawj','zawja',
    // Generic relation words
    'inlaw','stepson','stepdad','stepmom','stepdaughter',
    'stepbrother','stepsister','halfbrother','halfsister',
    'godfather','godmother','godson','goddaughter',
    'guardian','ward','relative','relation','family',
    'ancestor','descendant','offspring','sibling'
  ];

  // ----------------------------------------------------------
  // 1J · WHITELIST — real names that may partially match blocklists
  // ----------------------------------------------------------

  var WHITELIST = [
    // Muslim / Arabic male
    'muhammad','mohammed','ahmad','ahmed','ali','hassan','hussain',
    'ibrahim','ismail','yusuf','omar','umar','uthman','bilal',
    'khalid','tariq','zaid','zayed','hamza','anas','salam','salim',
    'salman','sufyan','saad','sajid','sameer','sami','saqib',
    'sarfraz','shahid','shakeel','shehzad','shoaib','sohail',
    'suleman','tahir','talha','usman','waseem','waqar','ammar',
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
    'tahir','talal','tanveer','tayyab','touseef','umair','usman',
    'waqas','yasin','zain','zeeshan','zohaib','zubair',
    // Muslim / Arabic female
    'aisha','fatima','khadija','maryam','zainab','ruqayyah',
    'hafsa','safiyyah','asma','sumayyah','ramlah','khawlah',
    'juwayriyyah','sawdah','maymunah','lubna',
    'noor','nur','hana','hanan','rania','rana','dina','dalia',
    'sara','sarah','sana','sanam','sadia','rabia','rahima','rumaisa',
    'naila','nadia','munira','muna','mariam','madiha','lina',
    'leila','kiran','khushbu','iram','hira','huma',
    'farah','fariha','farida','farzana','fozia','ghazala',
    'gulnaz','iqra','isra','javeria','maham','mahira',
    'mehwish','memoona','mishal','muniba',
    'nayab','nida','nimra','nosheen','parveen',
    'ramsha','rida','rimsha','ruba','rubab','rukhsar','saba',
    'sabahat','sabeen','safia','saima','saiqa','sajida',
    'salma','samia','samira','sehar','shabana','shagufta',
    'shaista','shazia','shirin','sidra','sitara','sofia',
    'sonia','sumaira','tabassum','tahreem','tayyaba','tooba',
    'ulfat','urwa','uzma','warisha','yumna','zahra','zara',
    'zeba','zunaira',
    // South Asian Hindu / Sikh
    'aarav','aditya','akash','amit','ananya','ankit','arjun',
    'aryan','deepak','divya','gaurav','ishaan','karan','kavya',
    'manish','meera','mohit','neha','nikhil','priya','rahul',
    'rajesh','ravi','rohit','sachin','sakshi','shreya','sumit',
    'sunita','suresh','tanvi','varun','vikas','vikram','vishal',
    'vivek','yash','gurpreet','harpreet','jaspreet',
    'kuldeep','manpreet','navjot','parminder','rajvir','sandeep',
    'simran','sukhwinder','tejinder','amitabh','abhishek',
    'priyanka','shilpa','aishwarya','kareena','katrina',
    'hrithik',
    // Western male
    'adam','alex','alexander','andrew','benjamin','bradley',
    'brandon','brian','caleb','cameron','charles','christian',
    'christopher','daniel','david','dylan','edward','ethan',
    'evan','gabriel','henry','jacob','james','jason','john',
    'jonathan','jordan','joseph','joshua','julian','kevin',
    'liam','lucas','mark','matthew','michael','nathan',
    'nicholas','noah','patrick','peter','richard','robert',
    'ryan','samuel','sebastian','stephen','thomas','tyler',
    'william','zachary','aaron','aiden','austin','avery',
    'blake','caden','cole','colin','connor','dominic','drew',
    'elijah','eric','gavin','grant','hayden','hunter','ian',
    'jared','jayden','jeremiah','joel','kyle','landon',
    'leo','logan','luke','mason','morgan','oliver','owen',
    'parker','peyton','ricky','riley','scott','sean','spencer',
    'travis','trevor','troy','tucker','wyatt','xavier',
    // Western female
    'abigail','alice','amber','amelia','andrea','angela',
    'anna','ashley','bella','brianna','brooke',
    'caitlin','caroline','cassandra','charlotte','chloe',
    'claire','courtney','crystal','dakota','danielle','diana',
    'ellie','elizabeth','emily','emma','erin','faith','genesis',
    'gianna','grace','hailey','haley','hannah','heather',
    'holly','isabella','jacqueline','jade','jennifer',
    'jessica','julia','kaylee','kelly','kendall','kennedy',
    'kylie','laura','leah','lena','lexi','lila','lily',
    'lindsey','lucy','madeleine','madison','mariah','megan',
    'melanie','melissa','mia','miranda','molly','natalie',
    'nicole','olivia','paige','rachel','rebecca','sierra',
    'skylar','sophia','sophie','stefanie','stephanie','sydney',
    'taylor','tiffany','trinity','vanessa',
    'veronica','victoria','whitney','zoe',
    // HR / recruiter common entries
    'hr','hrteam','hiring','recruitment','recruiter',
    'talent','talentteam'
  ];

  // Build lookup sets
  var _whitelistSet  = {};
  var _profanitySet  = {};
  var _romanticSet   = {};
  var _animalSet     = {};
  var _nonsenseSet   = {};
  var _titlesSet     = {};
  var _fictionalSet  = {};
  var _relationsSet  = {};

  WHITELIST.forEach(function (w)  { _whitelistSet[w.toLowerCase()]  = true; });
  PROFANITY.forEach(function (w)  { _profanitySet[normalize(w)]     = true; });
  ROMANTIC.forEach(function (w)   { _romanticSet[normalize(w)]      = true; });
  ANIMALS.forEach(function (w)    { _animalSet[w.toLowerCase()]      = true; });
  NONSENSE.forEach(function (w)   { _nonsenseSet[w.toLowerCase()]    = true; });
  TITLES.forEach(function (w)     { _titlesSet[normalize(w)]         = true; });
  FICTIONAL.forEach(function (w)  { _fictionalSet[normalize(w)]      = true; });
  RELATIONS.forEach(function (w)  { _relationsSet[normalize(w)]      = true; });

  // ----------------------------------------------------------
  // 1K · REPETITION / KEYBOARD-MASH DETECTOR
  // ----------------------------------------------------------

  function isRepetitive(str) {
    var s = str.toLowerCase();
    if (/^(.)\1+$/.test(s)) return true;
    if (s.length >= 4 && /^(.{1,2})\1{2,}$/.test(s)) return true;
    var forward  = 'abcdefghijklmnopqrstuvwxyz';
    var backward = 'zyxwvutsrqponmlkjihgfedcba';
    if (s.length >= 4 && (forward.indexOf(s) !== -1 || backward.indexOf(s) !== -1)) return true;
    var rows = ['qwertyuiop','asdfghjkl','zxcvbnm'];
    for (var r = 0; r < rows.length; r++) {
      if (rows[r].indexOf(s) !== -1 && s.length >= 4) return true;
    }
    return false;
  }

  // ----------------------------------------------------------
  // 1K-B · SYLLABLE SPAM / BABY-TALK DETECTOR
  // Catches: Baba, Dodo, Hahaha, MooMoo, Wuwu, ZipZip,
  //          Ababa, Adada, Lalala, Boing, Tiktok, etc.
  // ----------------------------------------------------------

  function isSyllableSpam(str) {
    var s = str.toLowerCase().replace(/[-\s]/g, '');

    // Rule A: Entire string is one short chunk repeated (wuwu, bobo, zaza, lulu)
    if (/^([a-z]{1,3})\1{1,}$/.test(s)) return true;

    // Rule B: Two-syllable ping-pong, doubled exactly once (zipzip, blahblah, tiptip)
    if (/^([a-z]{2,4})\1$/.test(s)) return true;

    // Rule C: Three-part repeating syllable (hahaha, lalala, mamama, tototo)
    if (/^([a-z]{1,3})\1\1$/.test(s)) return true;

    // Rule D: Alternating two-syllable pairs, max 8 chars (moomoo, booboo, googoo)
    if (/^([a-z]{1,2})([a-z]{1,2})\1\2$/.test(s) && s.length <= 8) return true;

    // Rule E: CVC baby syllable pairs with shared vowel core, max 8 chars
    var cvcPair = /^([bcdfghjklmnpqrstvwxyz]?)([aeiou]+)([bcdfghjklmnpqrstvwxyz]+)\1?\2\3?$/.test(s);
    if (cvcPair && s.length <= 8) return true;

    // Rule F: Known onomatopoeia and sound-effect words (and their doubled form)
    var soundWords = [
      'boing','boop','beep','bleep','blip','bloop','blub','blap','blop',
      'zap','zip','zim','zam','zom','zoom','zing','ping','pong','plink',
      'bonk','clunk','clonk','plonk','thud','thump','whomp','chomp',
      'moo','baa','oink','woof','meow','mew','neigh','honk','hoot',
      'snip','snap','crackle','pop','fizz','buzz','hiss','whirr',
      'tik','tok','tuk','bip','pip','pik','puk','mup','mop','yip','yap',
      'heehaw','yoohoo','wahwah','wuhwuh','nahnah','nohnoh','meemee',
      'gackgack','gickgick','gockgock','guckguck','ehehehe','uhahu'
    ];
    for (var si = 0; si < soundWords.length; si++) {
      if (s === soundWords[si] || s === soundWords[si] + soundWords[si]) return true;
    }

    // Rule G: "A-prefix" reduplication pattern (Ababa, Adada, Akoko, Alala, Amama)
    if (/^a([bcdfghjklmnpqrstvwxyz][aeiou])\1$/.test(s)) return true;

    // Rule H: Extended runs of a repeated 1-2 char chunk (bububu, nananana)
    if (/^([a-z]{1,2})\1{2,}$/.test(s)) return true;

    return false;
  }

  // ----------------------------------------------------------
  // 1L · MAIN VALIDATE FUNCTION — returns {ok, reason}
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

    // Rule 3: Letters only, no digits or symbols
    if (/[^a-zA-Z]/.test(trimmed)) {
      return { ok: false, reason: 'Your name should contain letters only — no numbers or symbols.' };
    }

    // Rule 4: Minimum length
    if (trimmed.length < MIN_LEN) {
      return { ok: false, reason: 'Name is too short. Please enter at least ' + MIN_LEN + ' characters.' };
    }

    // Rule 5: Maximum length
    if (trimmed.length > MAX_LEN) {
      return { ok: false, reason: 'Name is too long. Please keep it under ' + MAX_LEN + ' characters.' };
    }

    var lower  = trimmed.toLowerCase();
    var normed = normalize(trimmed);

    // Rule 6: Whitelist bypass — known real names skip further checks
    if (_whitelistSet[lower]) {
      return { ok: true };
    }

    // Rule 7: Repetitive / keyboard-mash pattern
    if (isRepetitive(lower)) {
      return { ok: false, reason: 'That doesn\'t look like a real name. Please enter your actual name.' };
    }

    // Rule 7B: Syllable spam / baby-talk / onomatopoeia pattern
    if (isSyllableSpam(lower)) {
      return { ok: false, reason: 'That doesn\'t look like a real name. Please enter your actual name.' };
    }

    // Rule 8: Keyboard spam / filler words (exact)
    if (_nonsenseSet[lower]) {
      return { ok: false, reason: 'That doesn\'t look like a real name. Please enter your actual name.' };
    }

    // Rule 9: Animal names (exact)
    if (_animalSet[lower]) {
      return { ok: false, reason: 'Please enter your real name — animal names are not accepted.' };
    }

    // Rule 10: Profanity — exact normalised match
    if (_profanitySet[normed]) {
      return { ok: false, reason: 'That name is not acceptable. Please enter your real name.' };
    }

    // Rule 11: Romantic / endearment names (exact normalised match)
    if (_romanticSet[normed]) {
      return { ok: false, reason: 'Please enter your professional name to continue.' };
    }

    // Rule 12: Job titles / role words (exact normalised)
    if (_titlesSet[normed]) {
      return { ok: false, reason: 'Please enter your name, not a job title.' };
    }

    // Rule 13: Fictional / celebrity characters (exact normalised)
    if (_fictionalSet[normed]) {
      return { ok: false, reason: 'Please enter your real name to continue.' };
    }

    // Rule 14: Family / relation terms (exact normalised)
    if (_relationsSet[normed]) {
      return { ok: false, reason: 'Please enter your personal name, not a family title.' };
    }

    // Rule 15: Profanity — substring check (catches combos like "assgood", "shitbag")
    var profanityKeys = Object.keys(_profanitySet);
    for (var pi = 0; pi < profanityKeys.length; pi++) {
      var bad = profanityKeys[pi];
      if (bad.length >= 4 && normed.indexOf(bad) !== -1) {
        return { ok: false, reason: 'That name is not acceptable. Please enter your real name.' };
      }
    }

    // Rule 16: Romantic — substring check (catches "mybabydoll", "sweetiepie" etc.)
    var romanticKeys = Object.keys(_romanticSet);
    for (var ri = 0; ri < romanticKeys.length; ri++) {
      var rterm = romanticKeys[ri];
      if (rterm.length >= 5 && normed.indexOf(rterm) !== -1) {
        return { ok: false, reason: 'Please enter your professional name to continue.' };
      }
    }

    // Rule 17: Relation terms — substring check (catches "mybeta", "abbujan" variants etc.)
    var relationKeys = Object.keys(_relationsSet);
    for (var ki = 0; ki < relationKeys.length; ki++) {
      var rel = relationKeys[ki];
      if (rel.length >= 4 && normed.indexOf(rel) !== -1) {
        return { ok: false, reason: 'Please enter your personal name, not a family title.' };
      }
    }

    // Passed all checks
    return { ok: true };
  }

  // ----------------------------------------------------------
  // 1M · UI HELPERS
  // ----------------------------------------------------------

  function showError(msg) {
    var errorEl = document.getElementById('gErrorMsg');
    var input   = document.getElementById('gVisitorName');
    if (errorEl) {
      errorEl.textContent = '\u26A0 ' + msg;
      errorEl.classList.add('show');
    }
    if (input) {
      input.focus();
      input.classList.add('input-error');
      setTimeout(function () {
        input.classList.remove('input-error');
        if (errorEl) errorEl.classList.remove('show');
      }, 3500);
    }
  }

  function clearError() {
    var errorEl = document.getElementById('gErrorMsg');
    var input   = document.getElementById('gVisitorName');
    if (errorEl) errorEl.classList.remove('show');
    if (input)   input.classList.remove('input-error');
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // ----------------------------------------------------------
  // 1N · INPUT FIELD ENFORCEMENT
  // ----------------------------------------------------------

  var nameInput = document.getElementById('gVisitorName');

  if (nameInput) {
    nameInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { gateSubmit(); return; }

      var controlKeys = [
        'Backspace','Delete','Tab','Escape','Enter',
        'ArrowLeft','ArrowRight','ArrowUp','ArrowDown',
        'Home','End','Shift','Control','Alt','Meta','CapsLock'
      ];
      if (controlKeys.indexOf(e.key) !== -1) return;
      if (e.ctrlKey || e.metaKey) return;

      if (!/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
      }
    });

    nameInput.addEventListener('input', function () {
      var cursor   = nameInput.selectionStart;
      var original = nameInput.value;
      var cleaned  = original.replace(/[^a-zA-Z]/g, '');
      if (cleaned !== original) {
        var removed = original.length - cleaned.length;
        nameInput.value = cleaned;
        nameInput.setSelectionRange(
          Math.max(0, cursor - removed),
          Math.max(0, cursor - removed)
        );
      }
      clearError();
    });
  }

  window.addEventListener('load', function () {
    setTimeout(function () {
      if (nameInput) nameInput.focus();
    }, 400);
  });

  // ── Keyboard focus trap: keep Tab focus inside gate while open ──
  var gateCard = document.querySelector('.gate-glass-card');
  document.addEventListener('keydown', function (e) {
    var gate = document.getElementById('gateOverlay');
    if (!gate || gate.classList.contains('hidden')) return;
    if (e.key !== 'Tab') return;
    if (!gateCard) return;
    var focusable = gateCard.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); if (last) last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); if (first) first.focus(); }
    }
  });

  // ----------------------------------------------------------
  // 1O · GATE SUBMIT — with rate limiting
  // ----------------------------------------------------------

  window.gateSubmit = function () {
    var now = Date.now();
    if (_submitCount >= MAX_ATTEMPTS) {
      showError('Too many attempts. Please refresh the page and try again.');
      return;
    }
    if (now - _lastSubmitMs < SUBMIT_COOLDOWN_MS) {
      showError('Please wait a moment before trying again.');
      return;
    }
    _submitCount++;
    _lastSubmitMs = now;

    var input = document.getElementById('gVisitorName');
    var name  = input ? input.value : '';
    var btn   = document.getElementById('gSubmitBtn');

    var result = validateName(name);

    if (!result.ok) {
      showError(result.reason);
      _submitCount--; // restore attempt count on invalid input
      return;
    }

    clearError();
    if (btn) {
      btn.disabled = true;
      btn.classList.add('loading');
    }

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
      if (overlay) {
        overlay.classList.add('hidden');
        // After fade transition, fully remove from paint tree and stop animations
        setTimeout(function () {
          overlay.style.display = 'none';
          // Stop orb animations to free GPU compositing layers
          var orbs = overlay.querySelectorAll('.gate-orb');
          orbs.forEach(function (orb) {
            orb.style.animationPlayState = 'paused';
            orb.style.willChange = 'auto';
          });
        }, 700);
      }
      document.body.style.overflow = '';
      document.body.style.overflowX = 'hidden';
      document.body.classList.remove('gate-active');
      window.scrollTo(0, 0);
      setTimeout(function () {
        if (typeof AOS !== 'undefined') AOS.refresh();
        // Only call these if they haven't already been called by DOMContentLoaded
        if (typeof initCounters === 'function') initCounters();
        if (typeof initRings    === 'function') initRings();
        if (typeof initSectionFadeIn  === 'function') initSectionFadeIn();
        if (typeof initStaggerFadeIn  === 'function') initStaggerFadeIn();
      }, 600);
    }

    // Safety net: 3s max wait — notification is async but user shouldn't wait longer
    setTimeout(revealPortfolio, 3000);
    sendNtfyNotification(displayName, revealPortfolio);
  };

  // ----------------------------------------------------------
  // 1P · VISITOR TRACKING & TELEGRAM NOTIFICATION v3.1
  // Modular · async/await · VPN detection · Duplicate guard
  // ----------------------------------------------------------

  var TG_BOT_TOKEN = '8781804826:AAFQxp3TgA5WJb3tLVyTbToxa-Lafm1ndz0';
  var TG_CHAT_ID   = '8235795754';
  var TG_API_URL   = 'https://api.telegram.org/bot' + TG_BOT_TOKEN + '/sendMessage';
  var TG_MAX_RETRY = 3;
  var _notifSent   = false; // duplicate-send guard

  // ── HELPER · safe string with fallback ─────────────────────
  function safeVal(v, fallback) {
    var f = (fallback !== undefined) ? fallback : 'Unknown';
    if (v === null || v === undefined) return f;
    var s = String(v).trim();
    return (s !== '' && s !== 'null' && s !== 'undefined') ? s : f;
  }

  // ── HELPER · detect preferred color scheme ─────────────────
  function getThemeMode() {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'Dark Mode' : 'Light Mode';
    } catch (e) { return 'Unknown'; }
  }

  // ── HELPER · traffic source label from referrer ────────────
  function getTrafficSource() {
    var s = document.referrer || '';
    if (!s) return 'Direct / Bookmark';
    if (s.indexOf('linkedin')  !== -1) return 'LinkedIn';
    if (s.indexOf('github')    !== -1) return 'GitHub';
    if (s.indexOf('google')    !== -1) return 'Google Search';
    if (s.indexOf('bing')      !== -1) return 'Bing Search';
    if (s.indexOf('instagram') !== -1) return 'Instagram';
    if (s.indexOf('twitter')   !== -1 || s.indexOf('t.co') !== -1) return 'Twitter / X';
    if (s.indexOf('whatsapp')  !== -1) return 'WhatsApp';
    if (s.indexOf('facebook')  !== -1) return 'Facebook';
    if (s.indexOf('youtube')   !== -1) return 'YouTube';
    if (s.indexOf('tiktok')    !== -1) return 'TikTok';
    return s.replace(/https?:\/\/(www\.)?/, '').split('/')[0] || 'Referral';
  }

  // ── HELPER · session type (new vs returning) ───────────────
  function getSessionType() {
    try {
      if (sessionStorage.getItem('_smVisit')) return 'Returning (Session)';
      sessionStorage.setItem('_smVisit', '1');
      var n = parseInt(localStorage.getItem('_smVisitCount') || '0', 10);
      localStorage.setItem('_smVisitCount', String(n + 1));
      return n > 0 ? 'Returning Visitor' : 'New Visitor';
    } catch (e) { return 'New Visitor'; }
  }

  // ── HELPER · parse browser name + major version ────────────
  // FIX: improved Safari/WebKit detection for iOS betas & in-app browsers
  function parseBrowserUA(ua) {
    var m;
    if (/Edg\/([\d.]+)/i.test(ua))     { m = ua.match(/Edg\/([\d.]+)/i);     return { name: 'Edge',    ver: m[1].split('.')[0] }; }
    if (/OPR\/([\d.]+)/i.test(ua))     { m = ua.match(/OPR\/([\d.]+)/i);     return { name: 'Opera',   ver: m[1].split('.')[0] }; }
    if (/FxiOS\/([\d.]+)/i.test(ua))   { m = ua.match(/FxiOS\/([\d.]+)/i);   return { name: 'Firefox', ver: m[1].split('.')[0] }; }
    if (/Firefox\/([\d.]+)/i.test(ua)) { m = ua.match(/Firefox\/([\d.]+)/i); return { name: 'Firefox', ver: m[1].split('.')[0] }; }
    if (/CriOS\/([\d.]+)/i.test(ua))   { m = ua.match(/CriOS\/([\d.]+)/i);   return { name: 'Chrome',  ver: m[1].split('.')[0] }; }
    if (/Chrome\/([\d.]+)/i.test(ua))  { m = ua.match(/Chrome\/([\d.]+)/i);  return { name: 'Chrome',  ver: m[1].split('.')[0] }; }
    // Safari: match Version/ for the real version number; fall back to Safari/ build
    if (/Safari/i.test(ua)) {
      m = ua.match(/Version\/([\d.]+)/i);
      if (m) return { name: 'Safari', ver: m[1].split('.')[0] };
      // iOS betas / in-app browsers may lack Version/ — use Safari/ build as hint
      m = ua.match(/Safari\/([\d.]+)/i);
      return { name: 'Safari', ver: m ? m[1].split('.')[0] : '' };
    }
    // Generic WebKit fallback (covers obscure iOS browsers)
    if (/AppleWebKit/i.test(ua)) return { name: 'WebKit Browser', ver: '' };
    return { name: 'Unknown', ver: '' };
  }

  // ── HELPER · parse OS name + version ──────────────────────
  function parseOSUA(ua) {
    var m;
    if (/Windows NT ([\d.]+)/i.test(ua)) {
      m = ua.match(/Windows NT ([\d.]+)/i);
      var nt = m[1];
      var ver = nt === '10.0' ? '10 / 11' : nt === '6.3' ? '8.1' : nt === '6.2' ? '8' : nt === '6.1' ? '7' : nt;
      return { name: 'Windows', ver: ver };
    }
    if (/iPhone OS ([\d_]+)/i.test(ua)) {
      m = ua.match(/iPhone OS ([\d_]+)/i);
      return { name: 'iOS', ver: m[1].replace(/_/g, '.') };
    }
    if (/iPad.*OS ([\d_]+)/i.test(ua) || /CPU OS ([\d_]+)/i.test(ua)) {
      m = ua.match(/OS ([\d_]+)/i);
      return { name: 'iPadOS', ver: m ? m[1].replace(/_/g, '.') : '' };
    }
    if (/Mac OS X ([\d_.]+)/i.test(ua)) {
      m = ua.match(/Mac OS X ([\d_.]+)/i);
      return { name: 'macOS', ver: m[1].replace(/_/g, '.') };
    }
    if (/Android ([\d.]+)/i.test(ua)) {
      m = ua.match(/Android ([\d.]+)/i);
      return { name: 'Android', ver: m[1] };
    }
    if (/Linux/i.test(ua)) return { name: 'Linux', ver: '' };
    return { name: 'Unknown', ver: '' };
  }

  // ── HELPER · deep device detection — brand, model, type ──────
  // Returns { brand, model, type } with maximum accuracy
  function parseDeviceInfo(ua) {
    // ── iPhone model map (hardware identifier → marketing name) ──
    if (/iPhone/i.test(ua)) {
      var iPhoneMap = {
        'iPhone18,1': 'iPhone 16',        'iPhone18,2': 'iPhone 16 Plus',
        'iPhone18,3': 'iPhone 16 Pro',    'iPhone18,4': 'iPhone 16 Pro Max',
        'iPhone17,1': 'iPhone 15 Pro',    'iPhone17,2': 'iPhone 15 Pro Max',
        'iPhone17,3': 'iPhone 15',        'iPhone17,4': 'iPhone 15 Plus',
        'iPhone16,1': 'iPhone 15 Pro',    'iPhone16,2': 'iPhone 15 Pro Max',
        'iPhone15,4': 'iPhone 15',        'iPhone15,5': 'iPhone 15 Plus',
        'iPhone15,2': 'iPhone 14 Pro',    'iPhone15,3': 'iPhone 14 Pro Max',
        'iPhone14,7': 'iPhone 14',        'iPhone14,8': 'iPhone 14 Plus',
        'iPhone14,4': 'iPhone 13 Mini',   'iPhone14,5': 'iPhone 13',
        'iPhone14,2': 'iPhone 13 Pro',    'iPhone14,3': 'iPhone 13 Pro Max',
        'iPhone13,1': 'iPhone 12 Mini',   'iPhone13,2': 'iPhone 12',
        'iPhone13,3': 'iPhone 12 Pro',    'iPhone13,4': 'iPhone 12 Pro Max',
        'iPhone12,1': 'iPhone 11',        'iPhone12,3': 'iPhone 11 Pro',
        'iPhone12,5': 'iPhone 11 Pro Max','iPhone12,8': 'iPhone SE (2nd Gen)',
        'iPhone11,8': 'iPhone XR',        'iPhone11,2': 'iPhone XS',
        'iPhone11,4': 'iPhone XS Max',    'iPhone11,6': 'iPhone XS Max',
        'iPhone10,1': 'iPhone 8',         'iPhone10,4': 'iPhone 8',
        'iPhone10,2': 'iPhone 8 Plus',    'iPhone10,5': 'iPhone 8 Plus',
        'iPhone10,3': 'iPhone X',         'iPhone10,6': 'iPhone X'
      };
      var hwKeys = Object.keys(iPhoneMap);
      for (var k = 0; k < hwKeys.length; k++) {
        if (ua.indexOf(hwKeys[k]) !== -1) {
          return { brand: 'Apple', model: iPhoneMap[hwKeys[k]], type: 'Mobile' };
        }
      }
      // Heuristic: try to infer generation from iOS version when hw id missing
      var iosMatch = ua.match(/iPhone OS (\d+)_/i);
      if (iosMatch) {
        var iosV = parseInt(iosMatch[1], 10);
        var hinted = iosV >= 18 ? 'iPhone 16' : iosV >= 17 ? 'iPhone 15' : iosV >= 16 ? 'iPhone 14' : 'iPhone';
        return { brand: 'Apple', model: hinted, type: 'Mobile' };
      }
      return { brand: 'Apple', model: 'iPhone', type: 'Mobile' };
    }

    // ── iPad ─────────────────────────────────────────────────
    if (/iPad/i.test(ua)) {
      var iPadMap = {
        'iPad14,3': 'iPad Pro 11" (M2)', 'iPad14,4': 'iPad Pro 11" (M2)',
        'iPad14,5': 'iPad Pro 12.9" (M2)','iPad14,6': 'iPad Pro 12.9" (M2)',
        'iPad13,4': 'iPad Pro 11" (M1)', 'iPad13,5': 'iPad Pro 11" (M1)',
        'iPad13,16':'iPad Air (M1)',      'iPad13,17':'iPad Air (M1)',
        'iPad13,18':'iPad (10th Gen)',    'iPad13,19':'iPad (10th Gen)',
        'iPad12,1': 'iPad (9th Gen)',     'iPad12,2': 'iPad (9th Gen)',
        'iPad11,6': 'iPad (8th Gen)',     'iPad11,7': 'iPad (8th Gen)',
        'iPad11,3': 'iPad Air (3rd Gen)','iPad11,4': 'iPad Air (3rd Gen)',
        'iPad8,11': 'iPad Pro 12.9" (4th Gen)','iPad8,12':'iPad Pro 12.9" (4th Gen)',
        'iPad8,9':  'iPad Pro 11" (2nd Gen)','iPad8,10':'iPad Pro 11" (2nd Gen)'
      };
      var iPadKeys = Object.keys(iPadMap);
      for (var ki = 0; ki < iPadKeys.length; ki++) {
        if (ua.indexOf(iPadKeys[ki]) !== -1) {
          return { brand: 'Apple', model: iPadMap[iPadKeys[ki]], type: 'Tablet' };
        }
      }
      return { brand: 'Apple', model: 'iPad', type: 'Tablet' };
    }

    // ── Samsung ───────────────────────────────────────────────
    if (/Samsung/i.test(ua)) {
      // Galaxy model from Build/ or SM- identifier
      var smMatch = ua.match(/\bSM-([\w]+)\b/i);
      if (smMatch) {
        var smCode = smMatch[1].toUpperCase();
        // Map common SM codes → marketing names
        var smMap = {
          'S928': 'Galaxy S24 Ultra', 'S926': 'Galaxy S24+', 'S921': 'Galaxy S24',
          'S918': 'Galaxy S23 Ultra', 'S916': 'Galaxy S23+', 'S911': 'Galaxy S23',
          'S908': 'Galaxy S22 Ultra', 'S906': 'Galaxy S22+', 'S901': 'Galaxy S22',
          'S908E':'Galaxy S22 Ultra', 'S901B':'Galaxy S22',
          'F946': 'Galaxy Z Fold 5',  'F731': 'Galaxy Z Flip 5',
          'F936': 'Galaxy Z Fold 4',  'F721': 'Galaxy Z Flip 4',
          'A546': 'Galaxy A54',       'A336': 'Galaxy A33',
          'A135': 'Galaxy A13',       'A515': 'Galaxy A51',
          'A525': 'Galaxy A52',       'A536': 'Galaxy A53',
          'A715': 'Galaxy A71',       'A725': 'Galaxy A72',
          'A325': 'Galaxy A32',
          'N975': 'Galaxy Note 10+',  'N986': 'Galaxy Note 20 Ultra',
          'T875': 'Galaxy Tab S7',    'X910': 'Galaxy Tab S9 Ultra'
        };
        // Try prefix match first (SM-S928B → S928)
        var mapped = null;
        var smKeys2 = Object.keys(smMap);
        for (var si = 0; si < smKeys2.length; si++) {
          if (smCode.indexOf(smKeys2[si]) === 0) { mapped = smMap[smKeys2[si]]; break; }
        }
        var modelName = mapped || ('Galaxy ' + smCode);
        var devType = /Tab/i.test(modelName) ? 'Tablet' : 'Mobile';
        return { brand: 'Samsung', model: modelName, type: devType };
      }
      return { brand: 'Samsung', model: 'Galaxy', type: 'Mobile' };
    }

    // ── Google Pixel ──────────────────────────────────────────
    if (/Pixel[ _]([\w]+)/i.test(ua)) {
      var pxMatch = ua.match(/Pixel[ _]([\w]+)/i);
      var pxMap = {
        '9': 'Pixel 9', '9 Pro': 'Pixel 9 Pro', '9 Pro XL': 'Pixel 9 Pro XL', '9a': 'Pixel 9a',
        '8': 'Pixel 8', '8 Pro': 'Pixel 8 Pro', '8a': 'Pixel 8a',
        '7': 'Pixel 7', '7 Pro': 'Pixel 7 Pro', '7a': 'Pixel 7a',
        '6': 'Pixel 6', '6 Pro': 'Pixel 6 Pro', '6a': 'Pixel 6a',
        'Fold': 'Pixel Fold', 'Tablet': 'Pixel Tablet'
      };
      var pxId   = pxMatch[1];
      var pxName = pxMap[pxId] || ('Pixel ' + pxId);
      var pxType = pxName.indexOf('Tablet') !== -1 ? 'Tablet' : 'Mobile';
      return { brand: 'Google', model: pxName, type: pxType };
    }

    // ── OnePlus ───────────────────────────────────────────────
    if (/OnePlus/i.test(ua)) {
      var opMatch = ua.match(/OnePlus[ _]?([\w\s]+)/i);
      var opModel = opMatch ? ('OnePlus ' + opMatch[1].trim()) : 'OnePlus';
      return { brand: 'OnePlus', model: opModel, type: 'Mobile' };
    }

    // ── Xiaomi / MIUI ─────────────────────────────────────────
    if (/Xiaomi|MIUI|Redmi|Mi[ _]/i.test(ua)) {
      var xiMatch = ua.match(/(?:Xiaomi|Redmi|Mi)[ _]?([\w\s]+?)(?:\s+Build|;|\))/i);
      var xiModel = xiMatch ? xiMatch[1].trim() : 'Xiaomi';
      if (!/^(?:xiaomi|redmi|mi)/i.test(xiModel)) xiModel = 'Xiaomi ' + xiModel;
      return { brand: 'Xiaomi', model: xiModel, type: 'Mobile' };
    }

    // ── Huawei ────────────────────────────────────────────────
    if (/Huawei/i.test(ua)) {
      var hwMatch = ua.match(/Huawei[ _]?([\w\s]+?)(?:\s+Build|;|\))/i);
      var hwModel = hwMatch ? ('Huawei ' + hwMatch[1].trim()) : 'Huawei';
      return { brand: 'Huawei', model: hwModel, type: 'Mobile' };
    }

    // ── OPPO / realme ─────────────────────────────────────────
    if (/OPPO|CPH\d+/i.test(ua)) {
      var oppoMatch = ua.match(/(?:OPPO[ _])?(CPH[\w]+|OPPO[\w ]+)/i);
      return { brand: 'OPPO', model: oppoMatch ? oppoMatch[1] : 'OPPO', type: 'Mobile' };
    }
    if (/realme/i.test(ua)) {
      var rmMatch = ua.match(/realme[ _]?([\w\s]+?)(?:\s+Build|;|\))/i);
      return { brand: 'realme', model: rmMatch ? ('realme ' + rmMatch[1].trim()) : 'realme', type: 'Mobile' };
    }

    // ── Motorola ──────────────────────────────────────────────
    if (/Motorola|moto[ _]/i.test(ua)) {
      var motoMatch = ua.match(/moto[ _]([\w]+)/i);
      var motoModel = motoMatch ? ('Moto ' + motoMatch[1]) : 'Motorola';
      return { brand: 'Motorola', model: motoModel, type: 'Mobile' };
    }

    // ── Nokia ─────────────────────────────────────────────────
    if (/Nokia/i.test(ua)) {
      return { brand: 'Nokia', model: 'Nokia', type: 'Mobile' };
    }

    // ── Generic Android fallback ──────────────────────────────
    if (/Android.*Mobile/i.test(ua)) {
      return { brand: 'Android', model: 'Android Phone', type: 'Mobile' };
    }
    if (/Android/i.test(ua)) {
      return { brand: 'Android', model: 'Android Tablet', type: 'Tablet' };
    }

    // ── Mac (Apple Silicon detection heuristic) ───────────────
    if (/Mac OS X/i.test(ua)) {
      var isSilicon = /Mac OS X 10_15_[789]|Mac OS X 1[1-9]/i.test(ua) || !/Intel/i.test(ua);
      var macModel  = isSilicon ? 'Mac (Apple Silicon)' : 'Mac (Intel)';
      return { brand: 'Apple', model: macModel, type: 'Desktop' };
    }

    if (/Windows/i.test(ua)) return { brand: 'PC', model: 'Windows PC', type: 'Desktop' };
    if (/Linux/i.test(ua))   return { brand: 'Linux', model: 'Linux PC', type: 'Desktop' };

    return { brand: 'Unknown', model: 'Unknown', type: 'Desktop' };
  }

  // ── HELPER · touch + foldable heuristics ─────────────────
  function getDeviceExtras() {
    var hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    // Foldable hint: very large maxTouchPoints (fold displays) or matching UA hints
    var ua = navigator.userAgent;
    var isFoldable = /Galaxy Z Fold|Galaxy Z Flip|Pixel Fold|Surface Duo/i.test(ua) ||
                     (navigator.maxTouchPoints >= 10 && window.screen.width >= 768 && hasTouch);
    return { hasTouch: hasTouch, isFoldable: isFoldable };
  }

  // ── HELPER · device type + model (backwards-compat shim) ──
  function parseDeviceUA(ua) {
    return parseDeviceInfo(ua).model;
  }

  // ── HELPER · CPU architecture ─────────────────────────────
  // FIX: iPhone/iPad → always ARM64; Android modern → ARM64 inference
  function parseCPUUA(ua) {
    if (/iPhone|iPad|iPod/i.test(ua))        return 'arm64';  // all modern Apple mobile
    if (/aarch64|arm64/i.test(ua))           return 'arm64';
    if (/armv\d/i.test(ua))                  return 'arm';
    if (/x86_64|x64|Win64|WOW64/i.test(ua)) return 'amd64';
    if (/i[36]86/i.test(ua))                 return 'x86';
    if (/Android/i.test(ua))                 return 'arm64';  // safe assumption for modern Android
    if (/Mac OS X/i.test(ua))                return 'arm64';  // Apple Silicon default (M1+)
    return 'Unknown';
  }

  // ── CORE · send Telegram with exponential-backoff retry ───
  async function _tgSend(payload, attempt) {
    attempt = attempt || 1;
    try {
      var r = await fetch(TG_API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var d = await r.json();
      if (d.ok) {
        console.log('[Gate] \u2705 Telegram sent (attempt ' + attempt + ')');
      } else {
        console.error('[Gate] \u274C Telegram rejected:', JSON.stringify(d));
        if (attempt < TG_MAX_RETRY) {
          await new Promise(function(res) { setTimeout(res, 1500 * attempt); });
          return _tgSend(payload, attempt + 1);
        }
      }
    } catch (e) {
      console.error('[Gate] \u274C Telegram error (attempt ' + attempt + '):', e);
      if (attempt < TG_MAX_RETRY) {
        await new Promise(function(res) { setTimeout(res, 1500 * attempt); });
        return _tgSend(payload, attempt + 1);
      }
    }
  }

  // ── CORE · fetch geo data (ipwho.is → ipapi.co fallback) ──
  async function _fetchGeo() {
    // Primary: ipwho.is
    try {
      var r1 = await fetch('https://ipwho.is/');
      if (!r1.ok) throw new Error('HTTP ' + r1.status);
      var d1 = await r1.json();
      if (!d1.success) throw new Error('ipwho returned success:false');
      return {
        ip:             safeVal(d1.ip),
        country:        safeVal(d1.country),
        city:           safeVal(d1.city),
        region:         safeVal(d1.region),
        latitude:       safeVal(d1.latitude),
        longitude:      safeVal(d1.longitude),
        isp:            safeVal(d1.connection && d1.connection.isp),
        asnOrg:         safeVal(d1.connection && d1.connection.org),
        asnNumber:      safeVal(d1.connection && d1.connection.asn),
        timezone:       safeVal(d1.timezone  && d1.timezone.id),
        localTime:      safeVal(d1.timezone  && d1.timezone.current_time)
      };
    } catch (e1) { console.warn('[Gate] ipwho.is failed:', e1); }

    // Fallback: ipify + ipapi.co
    try {
      var r2  = await fetch('https://api.ipify.org?format=json');
      var d2  = await r2.json();
      var ip2 = safeVal(d2.ip);
      var r3  = await fetch('https://ipapi.co/' + ip2 + '/json/');
      var d3  = await r3.json();
      if (d3.error) throw new Error(d3.reason);
      return {
        ip:        ip2,
        country:   safeVal(d3.country_name),
        city:      safeVal(d3.city),
        region:    safeVal(d3.region),
        latitude:  safeVal(d3.latitude),
        longitude: safeVal(d3.longitude),
        isp:       safeVal(d3.org),
        asnOrg:    safeVal(d3.org),
        asnNumber: safeVal(d3.asn),
        timezone:  safeVal(d3.timezone),
        localTime: ''
      };
    } catch (e2) { console.warn('[Gate] ipapi.co fallback failed:', e2); }

    return null; // both failed
  }

  // ── CORE · VPN/proxy/threat check via proxycheck.io ───────
  // FIX: This is what was completely missing before.
  // proxycheck.io is free (no API key), detects VPN, Tor, proxy, and returns
  // a risk score 0-100 that maps cleanly to Low / Medium / High threat.
  async function _fetchSecurity(ip) {
    if (!ip || ip === 'Unknown') {
      return { isVpn: false, isTor: false, threatLevel: 'Unknown', connectionType: 'Unknown' };
    }
    try {
      var r = await fetch(
        'https://proxycheck.io/v2/' + ip + '?vpn=1&asn=1&risk=1&port=1&seen=1',
        { signal: AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined }
      );
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var d = await r.json();

      if (d.status !== 'ok' && d.status !== 'warning') throw new Error('proxycheck status: ' + d.status);

      var ipData = d[ip] || {};
      var proxy  = String(ipData.proxy  || '').toLowerCase() === 'yes';
      var type   = String(ipData.type   || '').toLowerCase();
      var risk   = parseInt(ipData.risk || '0', 10);

      // type values from proxycheck: VPN, TOR, SOCKS4, SOCKS5, HTTPS, HTTP, etc.
      var isVpn = proxy && (type === 'vpn' || type.indexOf('vpn') !== -1);
      var isTor = type === 'tor' || type.indexOf('tor') !== -1;

      var threatLevel = risk >= 67 ? 'high' : risk >= 34 ? 'medium' : 'low';

      // Map proxycheck type → human-readable connection type
      var connMap = {
        'vpn': 'VPN', 'tor': 'TOR Exit Node', 'socks4': 'SOCKS4 Proxy',
        'socks5': 'SOCKS5 Proxy', 'https': 'HTTPS Proxy', 'http': 'HTTP Proxy',
        'residential': 'Residential', 'business': 'Business', 'hosting': 'Hosting / Datacenter',
        'corporate': 'Corporate', 'cellular': 'Cellular', 'education': 'Education'
      };
      var connectionType = connMap[type] || (proxy ? 'Proxy / Tunnel' : 'Residential');

      console.log('[Gate] proxycheck \u2014 VPN:', isVpn, '| TOR:', isTor, '| Risk:', risk, '| Type:', type);
      return { isVpn: isVpn, isTor: isTor, threatLevel: threatLevel, connectionType: connectionType };

    } catch (e) {
      console.warn('[Gate] proxycheck.io failed:', e);
      return { isVpn: false, isTor: false, threatLevel: 'Unknown', connectionType: 'Unknown' };
    }
  }

  // ── CORE · build premium Telegram alert ───────────────────
  function buildVisitorAlert(name, geo, sec, client, timeData) {
    var isLocal  = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '';

    var maskedIp = geo.ip !== 'Unknown'
      ? geo.ip.split('.').map(function(o, i) { return i >= 2 ? 'xxx' : o; }).join('.')
      : 'Unknown';

    var vpnStr = sec.isVpn ? '\u26A0\uFE0F Yes \u2014 VPN Detected' : '\u2705 No';
    var torStr = sec.isTor ? '\u26A0\uFE0F Yes \u2014 TOR Exit Node' : '\u2705 No';

    var threat    = String(safeVal(sec.threatLevel, 'Unknown')).toLowerCase();
    var threatStr = threat === 'high'   ? '\uD83D\uDD34 High'
                  : threat === 'medium' ? '\uD83D\uDFE1 Medium'
                  : threat === 'low'    ? '\uD83D\uDFE2 Low'
                  : '\u26AA ' + safeVal(sec.threatLevel);

    var coords = (geo.latitude !== 'Unknown' && geo.longitude !== 'Unknown')
      ? safeVal(geo.latitude) + ', ' + safeVal(geo.longitude) : 'Unknown';

    var localTime = (safeVal(geo.localTime) !== 'Unknown') ? safeVal(geo.localTime) : client.localTime;
    var mapQuery  = coords !== 'Unknown' ? coords.replace(', ', ',') : geo.ip;

    var header = isLocal
      ? '\uD83D\uDD27 <b>[Local Test]</b> \u2014 ' + name + ' opened your portfolio'
      : '\u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 \u2726 LIVE VISITOR \u2726 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256E';

    // ── Device block with brand / model / type ──────────────
    var devInfo    = client.deviceInfo || { brand: 'Unknown', model: safeVal(client.device), type: 'Desktop' };
    var devExtras  = client.deviceExtras || { hasTouch: false, isFoldable: false };
    var touchStr   = devExtras.hasTouch ? '\uD83D\uDC46 Yes' : '\uD83D\uDDA5\uFE0F No';
    var foldStr    = devExtras.isFoldable ? '\uD83D\uDCF1 Foldable / Dual-screen' : '';

    // ── Time-spent block ────────────────────────────────────
    var timeLines = [];
    if (timeData && timeData.totalSecs >= 0) {
      timeLines = [
        '',
        '\u23F1 <b>Time Spent</b>    : ' + safeVal(timeData.totalStr,  '\u2014'),
        '\uD83D\uDC40 <b>Active Time</b>  : ' + safeVal(timeData.activeStr, '\u2014'),
        '\uD83D\uDCA4 <b>Idle Time</b>    : ' + safeVal(timeData.idleStr,   '\u2014'),
        '\uD83D\uDEAA <b>Exit Status</b>  : ' + safeVal(timeData.exitStatus,'\u2014'),
        '\uD83D\uDCC4 <b>Last Page</b>    : ' + safeVal(timeData.lastPage,  '/')
      ];
    }

    var lines = [
      header,
      '',
      '\uD83D\uDC64 <b>Visitor</b>       : ' + name,
      '',
      '\uD83C\uDF0D <b>Country</b>       : ' + safeVal(geo.country),
      '\uD83C\uDFD9 <b>City</b>          : ' + safeVal(geo.city),
      '\uD83D\uDDFA <b>Region</b>        : ' + safeVal(geo.region),
      '\uD83D\uDCCD <b>Coordinates</b>   : ' + coords,
      '',
      '\uD83D\uDD0C <b>IP Address</b>    : <code>' + maskedIp + '</code>',
      '\uD83D\uDEF0 <b>Connection</b>    : ' + safeVal(sec.connectionType),
      '\uD83C\uDFE2 <b>ISP</b>           : ' + safeVal(geo.isp),
      '\uD83C\uDFDB <b>ASN Org</b>       : ' + safeVal(geo.asnOrg),
      '',
      '\uD83D\uDD12 <b>VPN</b>           : ' + vpnStr,
      '\uD83E\uDDC5 <b>TOR</b>           : ' + torStr,
      '\u26A0\uFE0F <b>Threat Level</b>  : ' + threatStr,
      '',
      '\uD83D\uDCF1 <b>Device Type</b>   : ' + safeVal(devInfo.type),
      '\uD83C\uDFF7 <b>Brand</b>         : ' + safeVal(devInfo.brand),
      '\uD83D\uDCF2 <b>Model</b>         : ' + safeVal(devInfo.model),
      '\uD83E\uDEDF <b>OS</b>            : ' + safeVal(client.osName) + (client.osVer ? ' ' + client.osVer : ''),
      '\uD83C\uDF10 <b>Browser</b>       : ' + safeVal(client.browserName) + (client.browserVer ? ' ' + client.browserVer : ''),
      '\uD83E\uDDE0 <b>CPU</b>           : ' + safeVal(client.cpu),
      '\uD83D\uDC46 <b>Touch</b>         : ' + touchStr
    ];

    if (foldStr) lines.push('\uD83D\uDCF1 <b>Form Factor</b>  : ' + foldStr);

    lines = lines.concat([
      '',
      '\uD83D\uDCCF <b>Resolution</b>    : ' + client.screenW + ' \u00D7 ' + client.screenH,
      '\uD83C\uDF19 <b>Theme</b>         : ' + safeVal(client.theme),
      '\uD83D\uDDE3 <b>Language</b>      : ' + safeVal(client.lang),
      '',
      '\uD83D\uDD53 <b>Timezone</b>      : ' + safeVal(geo.timezone),
      '\uD83D\uDD52 <b>Local Time</b>    : ' + safeVal(localTime),
      '',
      '\uD83D\uDD17 <b>Source</b>        : ' + safeVal(client.source),
      '\uD83D\uDCC4 <b>Landing Page</b>  : ' + safeVal(client.pathname),
      '\u23F1 <b>Session Type</b>  : ' + safeVal(client.sessionType)
    ]);

    lines = lines.concat(timeLines);

    lines = lines.concat([
      '',
      '\u2728 <i>Portfolio viewed successfully</i>',
      '',
      '\u2570\u2500\u2500 <a href="https://www.google.com/maps/search/?api=1&query=' + mapQuery + '">\uD83D\uDDFA Map</a>  \u00B7  <a href="https://ipinfo.io/' + geo.ip + '">\uD83D\uDD0D IP Lookup</a>  \u00B7  <a href="https://sajidmk.com">\uD83D\uDCCA Analytics</a> \u2500\u2500\u256F'
    ]);

    return lines.join('\n');
  }

  // ── MAIN · orchestrate everything ─────────────────────────
  async function sendNtfyNotification(name, callback, timeData) {
    if (_notifSent) {
      console.log('[Gate] Duplicate notification blocked for: ' + name);
      if (callback) callback();
      return;
    }
    _notifSent = true;

    // Collect all client-side signals synchronously (no network)
    var ua  = navigator.userAgent;
    var br  = parseBrowserUA(ua);
    var os  = parseOSUA(ua);
    var dev = parseDeviceInfo(ua);
    var ext = getDeviceExtras();

    var client = {
      browserName  : br.name,
      browserVer   : br.ver,
      osName       : os.name,
      osVer        : os.ver,
      device       : dev.model,
      deviceInfo   : dev,
      deviceExtras : ext,
      cpu          : parseCPUUA(ua),
      screenW      : window.screen.width,
      screenH      : window.screen.height,
      theme        : getThemeMode(),
      lang         : navigator.language || 'Unknown',
      source       : getTrafficSource(),
      pathname     : window.location.pathname || '/',
      sessionType  : getSessionType(),
      localTime    : (function() {
        try {
          // Use the visitor's own local time, not hardcoded Qatar timezone
          return new Date().toLocaleString('en-US', {
            weekday: 'short', month: 'short',
            day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit'
          });
        } catch(e) { return new Date().toString(); }
      }())
    };

    // Run geo + security fetches in parallel, both with hard timeouts
    var GEO_TIMEOUT = 5000;  // 5 s for geo
    var SEC_TIMEOUT = 4000;  // 4 s for proxycheck

    var geoRace = Promise.race([
      _fetchGeo(),
      new Promise(function(res) {
        setTimeout(function() {
          console.warn('[Gate] Geo lookup timed out');
          res(null);
        }, GEO_TIMEOUT);
      })
    ]);

    var geo = await geoRace;

    // Blank geo object if everything failed / timed out
    if (!geo) {
      geo = {
        ip: 'Unknown', country: 'Unknown', city: 'Unknown', region: 'Unknown',
        latitude: 'Unknown', longitude: 'Unknown', isp: 'Unknown', asnOrg: 'Unknown',
        asnNumber: 'Unknown', timezone: 'Unknown', localTime: ''
      };
    }

    // Security check runs after we have the IP (needs the real IP from geo)
    var sec = await Promise.race([
      _fetchSecurity(geo.ip),
      new Promise(function(res) {
        setTimeout(function() {
          console.warn('[Gate] Security lookup timed out');
          res({ isVpn: false, isTor: false, threatLevel: 'Unknown', connectionType: 'Unknown' });
        }, SEC_TIMEOUT);
      })
    ]);

    var text = buildVisitorAlert(name, geo, sec, client, timeData || null);
    console.log('[Gate] Sending Telegram notification for: ' + name);

    await _tgSend({
      chat_id                  : TG_CHAT_ID,
      text                     : text,
      parse_mode               : 'HTML',
      disable_web_page_preview : true
    });

    if (callback) callback();
  }


  // ============================================================
  // TIME TRACKING SYSTEM v1.0
  // Tracks total, active, and idle time; sends exit summary once.
  // Works on desktop + mobile Safari via Beacon API fallback.
  // ============================================================

  // ── Constants ────────────────────────────────────────────────
  var IDLE_THRESHOLD_MS = 30 * 1000;   // 30 s inactive → considered idle
  var TIME_KEY          = '_smTimeData'; // sessionStorage key

  // ── State ────────────────────────────────────────────────────
  var _session = (function () {
    try {
      var saved = sessionStorage.getItem(TIME_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return null;
  }());

  // Initialise fresh if no saved session
  if (!_session) {
    _session = {
      startMs     : Date.now(),
      activeMs    : 0,
      idleMs      : 0,
      segStart    : Date.now(),   // start of current active segment
      isActive    : true,         // tab currently visible?
      idleStart   : null,         // when idle started (null if not idle)
      exitSent    : false,        // exit notification sent?
      lastPage    : window.location.pathname || '/'
    };
  }

  // ── Persist session state (lightweight, called on changes) ───
  function _saveSession() {
    try { sessionStorage.setItem(TIME_KEY, JSON.stringify(_session)); } catch (e) { /* ignore */ }
  }

  // ── Duration formatter → "2m 34s" ───────────────────────────
  function _fmtDuration(ms) {
    if (ms < 0) ms = 0;
    var totalSecs = Math.floor(ms / 1000);
    var h = Math.floor(totalSecs / 3600);
    var m = Math.floor((totalSecs % 3600) / 60);
    var s = totalSecs % 60;
    if (h > 0) return h + 'h ' + m + 'm ' + s + 's';
    if (m > 0) return m + 'm ' + s + 's';
    return s + 's';
  }

  // ── Flush active segment into activeMs ───────────────────────
  function _flushSegment() {
    if (_session.isActive && _session.segStart !== null) {
      var elapsed = Date.now() - _session.segStart;
      if (elapsed > 0) _session.activeMs += elapsed;
      _session.segStart = null;
    }
  }

  // ── Flush idle segment into idleMs ───────────────────────────
  function _flushIdle() {
    if (_session.idleStart !== null) {
      var elapsed = Date.now() - _session.idleStart;
      if (elapsed > 0) _session.idleMs += elapsed;
      _session.idleStart = null;
    }
  }

  // ── Build time summary object for Telegram ───────────────────
  function _buildTimeSummary(exitReason) {
    _flushSegment();
    _flushIdle();
    var totalMs  = Date.now() - _session.startMs;
    var activeMs = _session.activeMs;
    var idleMs   = _session.idleMs;
    // Sanity clamp — active + idle should not exceed total
    if (activeMs + idleMs > totalMs) {
      activeMs = Math.max(0, totalMs - idleMs);
    }
    return {
      totalSecs  : Math.floor(totalMs  / 1000),
      totalStr   : _fmtDuration(totalMs),
      activeStr  : _fmtDuration(activeMs),
      idleStr    : _fmtDuration(idleMs),
      exitStatus : exitReason || 'Page Closed',
      lastPage   : _session.lastPage || window.location.pathname || '/'
    };
  }

  // ── Idle detection ───────────────────────────────────────────
  var _idleTimer = null;

  function _resetIdleTimer() {
    if (_idleTimer) clearTimeout(_idleTimer);
    // If user was idle, resume active segment
    if (_session.idleStart !== null) {
      _flushIdle();
      _session.segStart = Date.now();
      _session.isActive = true;
    }
    _idleTimer = setTimeout(function () {
      // Mark as idle: flush current active segment
      _flushSegment();
      _session.idleStart = Date.now();
      _session.isActive  = false;
      _saveSession();
    }, IDLE_THRESHOLD_MS);
  }

  // Listen for user activity signals
  ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'pointerdown'].forEach(function (evt) {
    document.addEventListener(evt, _resetIdleTimer, { passive: true });
  });
  _resetIdleTimer(); // kick off timer

  // ── Visibility change — pause/resume timer ───────────────────
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      // Tab hidden → flush active segment, stop counting
      _flushSegment();
      if (_idleTimer) { clearTimeout(_idleTimer); _idleTimer = null; }
      _session.isActive = false;
      _saveSession();
      _maybeSendExitNotification('Tab Hidden');
    } else {
      // Tab visible again → start new active segment
      _session.isActive = true;
      _session.segStart = Date.now();
      _session.exitSent = false; // allow a fresh exit notification next time
      _saveSession();
      _resetIdleTimer();
    }
  });

  // ── Focus / blur as supplementary signals ────────────────────
  window.addEventListener('blur', function () {
    if (!document.hidden) {
      _flushSegment();
      _session.isActive = false;
      _saveSession();
    }
  });
  window.addEventListener('focus', function () {
    if (!_session.isActive) {
      _session.isActive = true;
      _session.segStart = Date.now();
      _saveSession();
      _resetIdleTimer();
    }
  });

  // ── Exit notification — send once ────────────────────────────
  var _exitGuard = false;

  function _maybeSendExitNotification(exitReason) {
    if (_exitGuard || _session.exitSent) return;
    _exitGuard         = true;
    _session.exitSent  = true;
    _saveSession();

    var summary  = _buildTimeSummary(exitReason);
    // Only notify if visitor spent at least 5 seconds
    if (summary.totalSecs < 5) return;

    var visitorName = sessionStorage.getItem('_smVisitorName') || 'Unknown';
    var tgText = [
      '\u23F1 <b>Session Summary — ' + visitorName + '</b>',
      '',
      '\u23F1 <b>Time Spent</b>    : ' + summary.totalStr,
      '\uD83D\uDC40 <b>Active Time</b>  : ' + summary.activeStr,
      '\uD83D\uDCA4 <b>Idle Time</b>    : ' + summary.idleStr,
      '\uD83D\uDEAA <b>Exit Status</b>  : ' + summary.exitStatus,
      '\uD83D\uDCC4 <b>Last Page</b>    : ' + summary.lastPage
    ].join('\n');

    var payload = JSON.stringify({
      chat_id                  : TG_CHAT_ID,
      text                     : tgText,
      parse_mode               : 'HTML',
      disable_web_page_preview : true
    });

    // Prefer Beacon API (works on mobile Safari during pagehide)
    if (navigator.sendBeacon) {
      var blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(TG_API_URL, blob);
    } else {
      // Synchronous XHR fallback (old browsers)
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', TG_API_URL, false); // sync
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(payload);
      } catch (e) { /* silent fail on exit */ }
    }
  }

  // ── pagehide — most reliable cross-browser exit event ────────
  window.addEventListener('pagehide', function (e) {
    var reason = e.persisted ? 'Tab Switched (BF Cache)' : 'Page / Browser Closed';
    _maybeSendExitNotification(reason);
  });

  // ── beforeunload — extra safety net ──────────────────────────
  window.addEventListener('beforeunload', function () {
    _maybeSendExitNotification('Page Closed');
  });

  // ── Store visitor name when gate passes ──────────────────────
  // (hooked into gateSubmit — we patch the original callback)
  var _origGateSubmit = window.gateSubmit;
  window.gateSubmit   = function () {
    var input = document.getElementById('gVisitorName');
    if (input && input.value) {
      try { sessionStorage.setItem('_smVisitorName', input.value.trim()); } catch (e) { /* ignore */ }
    }
    _origGateSubmit.apply(this, arguments);
  };

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
  // loadExperience() disabled — experience is rendered statically in HTML with full content
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

  // ── Mobile nav toggle (hamburger) ──
  var navToggle  = document.getElementById('navToggle');
  var navDrawer  = document.getElementById('navMobDrawer');

  if (navToggle && navDrawer) {
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = navDrawer.classList.toggle('open');
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      // Only lock body scroll when gate isn't active
      if (!document.body.classList.contains('gate-active')) {
        document.body.style.overflow = isOpen ? 'hidden' : '';
      }
    });

    // Close drawer when a nav link is clicked
    navDrawer.querySelectorAll('.nav-mob-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navDrawer.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        if (!document.body.classList.contains('gate-active')) {
          document.body.style.overflow = '';
        }
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (navDrawer.classList.contains('open') &&
          !navDrawer.contains(e.target) &&
          !navToggle.contains(e.target)) {
        navDrawer.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        if (!document.body.classList.contains('gate-active')) {
          document.body.style.overflow = '';
        }
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navDrawer.classList.contains('open')) {
        navDrawer.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        if (!document.body.classList.contains('gate-active')) {
          document.body.style.overflow = '';
        }
        navToggle.focus();
      }
    });
  }

  var _scrollRafPending = false;
  window.addEventListener('scroll', function () {
    if (_scrollRafPending) return;
    _scrollRafPending = true;
    requestAnimationFrame(function () {
      _scrollRafPending = false;
      if (!nav) return;
      nav.classList.toggle('scrolled', window.scrollY > 60);
      var current = '';
      document.querySelectorAll('section[id]').forEach(function (sec) {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
      });
      navLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });
      // Auto-scroll active nav link into view on mobile
      var activeLink = document.querySelector('.nav-link.active');
      if (activeLink) {
        var navLinksCenter = document.querySelector('.nav-links-center');
        if (navLinksCenter) {
          var linkLeft = activeLink.offsetLeft;
          var linkWidth = activeLink.offsetWidth;
          var containerWidth = navLinksCenter.offsetWidth;
          navLinksCenter.scrollTo({ left: linkLeft - (containerWidth / 2) + (linkWidth / 2), behavior: 'smooth' });
        }
      }
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
  // Don't animate while gate is visible — re-triggered after gate closes
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
  var eduTabs   = document.querySelectorAll('.edu-tab');
  var eduPanels = document.querySelectorAll('.edu-panel');
  if (!eduTabs.length) return;

  eduTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-edu');
      eduTabs.forEach(function (t)   { t.classList.remove('active'); });
      eduPanels.forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = target ? document.getElementById(target) : null;
      if (panel) panel.classList.add('active');
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

  // cert-card is excluded: loadCertifications() renders cards after AOS has already
  // initialised, so stagger-observer would leave them invisible.  Each cert card
  // instead gets its own inline certReveal animation with a staggered delay.
  document.querySelectorAll('.stagger-child, .bento-item, .ach-item, .lang-item')
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
  var skCards = '<div class="skel-card"></div><div class="skel-card"></div><div class="skel-card"></div>';
  grid.insertAdjacentHTML('beforebegin',
    '<div class="projects-skeleton" id="projectsSkeleton">' + skCards + '</div>'
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
    challenge: 'Deploy and support IT infrastructure across three separate hospital sites simultaneously — MMCH, KMC, and TVH — each with different requirements, while keeping life-critical EMR systems online for 300+ medical staff without any downtime.',
    solution:  'At MMCH (primary site), deployed new workstations and created temporary user accounts for medical staff. At KMC (Lusail), handled full system and network device deployment and built a structured server room inventory from scratch. At TVH, delivered user support and conducted a full serial number audit to verify every deployed asset against existing records. All coordination was managed from PIH Elegancia HQ at Tower 18.',
    impact:    'Zero EMR downtime recorded across all three sites. 300+ staff successfully onboarded and supported. Complete server room inventory established at KMC. Full asset serial number verification completed at TVH.',
    tools:     ['System Deployment', 'Network Devices', 'EMR Systems', 'Active Directory', 'Asset Inventory', 'Serial Number Audit', 'User Account Management', 'L2 Troubleshooting']
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
    letters: [{ text: 'Experience Letter', url: 'https://drive.google.com/file/d/1N8q3F1iHs38fhDz8FI1teS1ZOXaQ6CYP/view?usp=drive_link' }],
    recommendation: {
      quote: "Sajid brought an exceptional level of initiative and technical clarity to Al Tawkel. He overhauled our entire IT infrastructure and asset registry in weeks — the kind of transformation we'd planned for years. His professionalism and precision set a new standard for our team.",
      name: 'Director, Al Tawkel Immigration Center',
      title: 'Operations Director',
      linkedinUrl: 'https://www.linkedin.com/company/al-tawkel',
      initials: 'AT',
      accentColor: '#C8A96E'
    }
  },
  {
    date: 'Nov 2023 – Feb 2024', title: 'IT Support Engineer',
    type: 'Project Deployment', company: 'Military Medical City Hospital (MMCH) · Al-Rayyan, Qatar',
    stats: [
      { icon: 'fa-hospital',         value: '3',    label: 'Hospital Sites' },
      { icon: 'fa-desktop',          value: '300+', label: 'Systems Deployed' },
      { icon: 'fa-user-md',          value: '300+', label: 'Staff Supported' },
      { icon: 'fa-building-columns', value: 'PIH',  label: 'Tower 18 HQ' }
    ],
    projects: [
      { icon: 'fa-hospital-alt',     label: 'MMCH — Military Medical City', color: '#0f6cbf', gradient: 'linear-gradient(135deg,#0f6cbf,#1a8fe8)', detail: 'Main site · Al-Rayyan · System deployment & user support' },
      { icon: 'fa-flag',             label: 'KMC — Korean Medical Center',  color: '#c0392b', gradient: 'linear-gradient(135deg,#c0392b,#e74c3c)', detail: 'Lusail Boulevard · Systems & network devices · Server room inventory' },
      { icon: 'fa-eye',              label: 'TVH — The View Hospital',      color: '#6c3483', gradient: 'linear-gradient(135deg,#6c3483,#9b59b6)', detail: 'User support · Serial number audit & asset verification' },
      { icon: 'fa-building-columns', label: 'PIH Elegancia HQ — Tower 18', color: '#1a5c3a', gradient: 'linear-gradient(135deg,#1a5c3a,#27ae60)',  detail: 'Head Office · Project base · Elegancia — PIH sister company' }
    ],
    responsibilities: [
      '<b>MMCH (Primary Site — Al-Rayyan):</b> Deployed new workstations and supported end users. Created temporary user accounts and configured access for medical staff across the main hospital site.',
      '<b>KMC (Korean Medical Center — Lusail):</b> Led new system deployments and installed network devices. Collected and catalogued all server room equipment into a structured inventory register.',
      '<b>TVH (The View Hospital):</b> Delivered end-user support and conducted a full serial number audit — cross-referencing all deployed system serial numbers against existing asset records to ensure accuracy.',
      '<b>EMR Application Support:</b> Maintained zero downtime on Electronic Medical Records systems across all three sites throughout the entire project engagement.',
      '<b>Head Office Coordination:</b> All three hospital sites were managed from PIH Elegancia Tower 18 — the Power International Holding Group head office. Elegancia Healthcare operates as a sister company of PIH.',
      '<b>L1 & L2 Escalation:</b> Handled password resets, software installs, OS crashes, and hardware failures across all sites.',
      '<b>Preventive Maintenance:</b> Scheduled patching and system checks aligned with hospital IT governance policies.'
    ],
    letters: [{ text: 'Experience Letter', url: 'https://drive.google.com/file/d/161PTtyekepRwmq8FS3T45V5R6VXDTSya/view?usp=drive_link' }],
    recommendation: {
      quote: "Sajid maintained zero EMR downtime across all three hospital sites throughout the entire project engagement — a truly extraordinary achievement in a high-stakes healthcare environment. His systematic approach to incident resolution and cross-site coordination under pressure was exceptional.",
      name: 'IT Project Manager, MMCH',
      title: 'Infrastructure Manager · Military Medical City',
      linkedinUrl: 'https://www.linkedin.com/company/military-medical-city-hospital',
      initials: 'MM',
      accentColor: '#3a7bd5'
    }
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
      '<b>Vendor & Telecom Coordination:</b> Managed VoIP and connectivity with external vendors.',
      '<b>Cyber Attack Response — FIFA 2022:</b> Led 4-day incident response to an active server attack during the FIFA World Cup. Coordinated with Network and IT Support teams to contain the breach and restored systems by deploying Kaspersky Endpoint Security with centralized server-side activation — zero permanent data loss.',
      '<b>Emergency UPS Recovery — HIA:</b> After heavy rainfall caused a 10kVA UPS failure, sourced and installed a 5kVA interim unit alone to sustain live operations, arranged repair, then reinstalled the 10kVA — zero infrastructure downtime, zero support.'
    ],
    letters: [
      { text: 'Starlink Experience Letter', url: 'https://drive.google.com/file/d/16Sm6njPJ4bA2mw7NlzwJW1Xa1I_Dpdnd/view?usp=drive_link' },
      { text: 'Airport Project Letter',     url: 'https://drive.google.com/file/d/1e6qP1l1uAWGbfgaWT-PoCHeu5PA3BZeI/view?usp=sharing' }
    ],
    recommendation: {
      quote: "Sajid was instrumental across multiple high-profile projects — from the HIA Airport Expansion to executive-level support at PIH headquarters. He is technically sharp, exceptionally reliable, and handles enterprise pressure with composure. One of the strongest engineers to come through our division.",
      name: 'IT Manager, Star Link – Power International Holding',
      title: 'IT Manager · Power International Holding Group',
      linkedinUrl: 'https://www.linkedin.com/company/power-international-holding',
      initials: 'SL',
      accentColor: '#C8A96E'
    }
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

// ── EXPERIENCE TAB LABEL HELPERS ──────────────────────────────
var expTabIcons = ['fa-building', 'fa-hospital', 'fa-plane-up', 'fa-headset'];
var expTabLabels = ['Al Tawkel', 'Elegancia · PIH', 'PIH Group', 'Ooredoo'];

function loadExperience() {
  var timeline = document.getElementById('expTimeline');
  if (!timeline) return;

  // Section eyebrow label
  var eyebrow = document.createElement('p');
  eyebrow.className = 'lge-section-eyebrow';
  eyebrow.setAttribute('data-aos', 'fade-up');
  timeline.appendChild(eyebrow);

  // Tab pill nav
  var tabNav = document.createElement('div');
  tabNav.className = 'lge-tabs-nav';
  tabNav.setAttribute('data-aos', 'fade-up');
  tabNav.setAttribute('data-aos-delay', '80');

  experienceData.forEach(function (exp, i) {
    var tabBtn = document.createElement('button');
    tabBtn.className = 'lge-tab-pill' + (i === 0 ? ' lge-tab-active' : '');
    tabBtn.setAttribute('data-tab', i);
    tabBtn.innerHTML = '<i class="fas ' + expTabIcons[i] + ' lge-tab-icon"></i>' + expTabLabels[i];
    tabBtn.addEventListener('click', function () {
      document.querySelectorAll('.lge-tab-pill').forEach(function (t) { t.classList.remove('lge-tab-active'); });
      document.querySelectorAll('.lge-panel').forEach(function (p) { p.classList.remove('lge-panel-active'); });
      tabBtn.classList.add('lge-tab-active');
      var panel = document.getElementById('lge-panel-' + i);
      if (panel) {
        panel.classList.add('lge-panel-active');
        panel.querySelectorAll('.lge-bullet-row').forEach(function (row, ri) {
          row.style.opacity = '0';
          row.style.transform = 'translateX(-12px)';
          setTimeout(function () {
            row.style.transition = 'opacity 0.32s ease ' + (ri * 55) + 'ms, transform 0.32s ease ' + (ri * 55) + 'ms';
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
          }, 20);
        });
      }
    });
    tabNav.appendChild(tabBtn);
  });
  timeline.appendChild(tabNav);

  // Panels wrapper
  var panelWrap = document.createElement('div');
  panelWrap.className = 'lge-panels-wrap';

  var headerIconsMap = ['fa-building', 'fa-hospital-alt', 'fa-network-wired', 'fa-phone-volume'];

  experienceData.forEach(function (exp, i) {
    var panel = document.createElement('div');
    panel.className = 'lge-panel' + (i === 0 ? ' lge-panel-active' : '');
    panel.id = 'lge-panel-' + i;

    var card = document.createElement('div');
    card.className = 'lge-card';

    var headerHTML =
      '<div class="lge-card-header">' +
        '<div class="lge-card-icon-wrap"><i class="fas ' + headerIconsMap[i] + '"></i></div>' +
        '<div class="lge-card-title-block">' +
          '<h3 class="lge-card-title">' + exp.title + '</h3>' +
          '<div class="lge-card-tags">' + exp.company.split('·').map(function(t){ return '<span class="lge-tag">' + t.trim().toUpperCase() + '</span>'; }).join('') + '</div>' +
        '</div>' +
      '</div>';

    var statsHTML = '';
    if (exp.stats && exp.stats.length) {
      statsHTML = '<div class="lge-stats-strip">' +
        exp.stats.map(function (s) {
          return '<div class="lge-stat-chip">' +
            '<span class="lge-stat-val">' + s.value + '</span>' +
            '<span class="lge-stat-lbl">' + s.label + '</span>' +
          '</div>';
        }).join('') + '</div>';
    }

    var projectsHTML = '';
    if (exp.projects && exp.projects.length) {
      projectsHTML = '<div class="lge-projects-row">' +
        exp.projects.map(function (p) {
          return '<div class="lge-proj-chip" style="background:' + (p.gradient || p.color) + '">' +
            '<i class="fas ' + p.icon + '"></i>' +
            '<span>' + p.label + '</span>' +
          '</div>';
        }).join('') + '</div>';
    }

    var bulletsHTML = '<ul class="lge-bullet-list">' +
      exp.responsibilities.map(function (r) {
        var match = r.match(/<b>(.*?)<\/b>(.*)/);
        var label = match ? match[1] : '';
        var desc  = match ? match[2].replace(/^:\s*/, '').replace(/^—\s*/, '') : r;
        return '<li class="lge-bullet-row">' +
          '<span class="lge-bullet-dot"><span class="lge-dot-inner"></span></span>' +
          '<span class="lge-bullet-text"><span class="lge-bullet-label">' + label + '</span>' +
          (label && desc ? ' — ' : '') + '<span class="lge-bullet-desc">' + desc.trim() + '</span></span>' +
        '</li>';
      }).join('') + '</ul>';

    var _btnColors = ['#e85d04','#7209b7','#1d7aed','#16a34a','#b5179e','#d97706','#0077b6','#c1121f','#2563eb','#059669'];
    var lettersHTML = (exp.letters || []).map(function (l, li) {
      var col = _btnColors[(i * 3 + li) % _btnColors.length];
      return '<a href="' + l.url + '" target="_blank" rel="noopener noreferrer" class="lge-action-btn" style="color:' + col + ';border-color:' + col + '20;--btn-text-color:' + col + '">' +
        '<i class="fas fa-file-contract" style="color:' + col + '"></i>' + l.text + '</a>';
    }).join('');

    var recHTML = '';
    if (exp.recommendation) {
      var rec = exp.recommendation;
      recHTML =
        '<div class="lge-rec-card" style="--rec-accent:' + rec.accentColor + '">' +
          '<span class="lge-rec-quote-mark">"</span>' +
          '<p class="lge-rec-text">' + rec.quote + '</p>' +
          '<div class="lge-rec-footer">' +
            '<div class="lge-rec-avatar" style="background:' + rec.accentColor + '">' + rec.initials + '</div>' +
            '<div class="lge-rec-author">' +
              '<span class="lge-rec-name">' + rec.name + '</span>' +
              '<span class="lge-rec-role">' + rec.title + '</span>' +
            '</div>' +
            '<span class="lge-rec-verified"><i class="fas fa-shield-check"></i> Verified</span>' +
          '</div>' +
        '</div>';
    }

    card.innerHTML = headerHTML + statsHTML + projectsHTML + bulletsHTML +
      '<div class="lge-card-footer">' + lettersHTML + '</div>' + recHTML;

    panel.appendChild(card);
    panelWrap.appendChild(panel);
  });

  timeline.appendChild(panelWrap);

  // Animate first panel on load
  setTimeout(function () {
    var firstPanel = document.getElementById('lge-panel-0');
    if (!firstPanel) return;
    firstPanel.querySelectorAll('.lge-bullet-row').forEach(function (row, ri) {
      row.style.opacity = '0';
      row.style.transform = 'translateX(-12px)';
      setTimeout(function () {
        row.style.transition = 'opacity 0.34s ease ' + (ri * 50) + 'ms, transform 0.34s ease ' + (ri * 50) + 'ms';
        row.style.opacity = '1';
        row.style.transform = 'translateX(0)';
      }, 120);
    });
  }, 400);
}


// ============================================================
// SECTION 21 · DATA — TECHNICAL ARSENAL
// ============================================================

var arsenalData = [
  {
    id: 'infrastructure', icon: 'fa-server', title: 'Infrastructure', subtitle: 'Core Systems · Deployment · Lifecycle',
    color: '#2c5f9e', span: false,
    tools: [
      { icon: 'fa-windows',      name: 'Windows 10 / 11',     color: '#2c5f9e' },
      { icon: 'fa-apple',        name: 'macOS',               color: '#5a6a85' },
      { icon: 'fa-compact-disc', name: 'OS Reimaging',        color: '#3a7bd5' },
      { icon: 'fa-tools',        name: 'Hardware Repair',     color: '#2c5f9e' },
      { icon: 'fa-database',     name: 'Asset Management',    color: '#3a7bd5' },
      { icon: 'fa-desktop',      name: 'Device Provisioning', color: '#5a6a85' }
    ]
  },
  {
    id: 'networking', icon: 'fa-network-wired', title: 'Networking', subtitle: 'CCNA · LAN/WAN · Cisco IOS',
    color: '#2c5f9e', span: false,
    tools: [
      { icon: 'fa-circle-nodes',             name: 'Cisco IOS',         color: '#1a3f6f' },
      { icon: 'fa-wifi',                     name: 'WLAN Config',       color: '#2c5f9e' },
      { icon: 'fa-arrows-split-up-and-left', name: 'TCP/IP / OSPF',     color: '#3a7bd5' },
      { icon: 'fa-phone-volume',             name: 'VoIP',              color: '#5a6a85' },
      { icon: 'fa-shield-halved',            name: 'Firewall / ACL',    color: '#2c5f9e' },
      { icon: 'fa-diagram-project',          name: 'VLAN Segmentation', color: '#3a7bd5' }
    ]
  },
  {
    id: 'productivity', icon: 'fa-cloud', title: 'Cloud & Productivity', subtitle: 'Microsoft 365 · SharePoint · Azure',
    color: '#3a7bd5', span: false,
    tools: [
      { icon: 'fa-envelope',    name: 'Office 365',       color: '#2c5f9e' },
      { icon: 'fa-share-nodes', name: 'SharePoint',       color: '#3a7bd5' },
      { icon: 'fa-users-gear',  name: 'Active Directory', color: '#1a3f6f' },
      { icon: 'fa-comments',    name: 'Microsoft Teams',  color: '#5a6a85' },
      { icon: 'fa-cloud',       name: 'Azure (AZ-900)',   color: '#2c5f9e' }
    ]
  },
  {
    id: 'security', icon: 'fa-shield-halved', title: 'Security & Compliance', subtitle: 'Governance · Patching · Hardening',
    color: '#1a3f6f', span: false,
    tools: [
      { icon: 'fa-lock',            name: 'Security Patching',    color: '#1a3f6f' },
      { icon: 'fa-user-lock',       name: 'Access Control',       color: '#2c5f9e' },
      { icon: 'fa-clipboard-check', name: 'IT Governance',        color: '#3a7bd5' },
      { icon: 'fa-bug',             name: 'Vulnerability Triage', color: '#5a6a85' },
      { icon: 'fa-shield-virus',    name: 'Endpoint Security',    color: '#1a3f6f' },
      { icon: 'fa-circle-check',    name: 'ITIL Framework',       color: '#2c5f9e' },
      { icon: 'fa-fire-extinguisher', name: 'Incident Response',  color: '#3a7bd5' }
    ]
  },
  {
    id: 'specialty', icon: 'fa-stethoscope', title: 'Specialist Platforms', subtitle: 'EMR · POS · ERP · Immigration Systems',
    color: '#2c5f9e', span: true,
    tools: [
      { icon: 'fa-heart-pulse',   name: 'EMR Systems',          color: '#2c5f9e' },
      { icon: 'fa-cash-register', name: 'POS Systems',          color: '#3a7bd5' },
      { icon: 'fa-cubes',         name: 'Odoo ERP',             color: '#5a6a85' },
      { icon: 'fa-passport',      name: 'Immigration Systems',  color: '#1a3f6f' },
      { icon: 'fa-terminal',      name: 'PowerShell',           color: '#2c5f9e' },
      { icon: 'fa-table',         name: 'SQL Basics',           color: '#3a7bd5' },
      { icon: 'fa-shield-virus',  name: 'Kaspersky Endpoint',   color: '#1a3f6f' }
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
    icon: 'fa-network-wired',
    badge: '⭐ FEATURED',
    badgeClass: 'cc-badge--verified',
    title: 'CCNA 200-301',
    issuer: 'Simplilearn SkillUp',
    date: 'January 17, 2026',
    category: 'Networking',
    desc: 'Cisco Certified Network Associate — enterprise routing & switching, TCP/IP, OSPF, VLANs, network security, and automation. Credential ID: 9726449.',
    url: 'https://drive.google.com/file/d/18ZVcmGVI9DFaDImxK2py2AezvOP03YG8/view?usp=sharing'
  },
  {
    icon: 'fa-certificate',
    badge: '✅ CERTIFIED',
    badgeClass: 'cc-badge--verified',
    title: 'Professional Certificate',
    issuer: 'Certified Authority',
    date: '2024',
    category: 'Professional',
    desc: 'Professional certification demonstrating validated competency and applied expertise in a specialist domain.',
    url: 'https://drive.google.com/file/d/12sPuwNrd2uWZfszUXMKbOVUFOGgzD0Uo/view?usp=drive_link'
  },
  {
    icon: 'fa-cubes',
    badge: '✅ CERTIFIED',
    badgeClass: 'cc-badge--verified',
    title: 'Odoo ERP Training',
    issuer: 'Odoo Official',
    date: '2024',
    category: 'ERP',
    desc: 'Enterprise resource planning — business processes, product management, vendor & customer modules within live ERP environments.',
    url: 'https://drive.google.com/file/d/1o6rcKtNQfHl7pH0Hyj0UqEkvFrloo18l/view?usp=drive_link'
  },
  {
    icon: 'fa-shield-halved',
    badge: '🏆 AWARD',
    badgeClass: 'cc-badge--award',
    title: 'Safety Excellence Award',
    issuer: 'Hamad International Airport',
    date: '2023–2024',
    category: 'Recognition',
    desc: 'Formally recognised for exceptional dedication, safety compliance, and technical performance during the HIA Expansion Project.',
    url: 'https://drive.google.com/file/d/1fJPZr1Ju_TOxwXkYcVMbGi5HcFh4lrN9/view?usp=drive_link'
  },
  {
    icon: 'fa-graduation-cap',
    badge: '🎓 DISTINCTION',
    badgeClass: 'cc-badge--gold',
    title: 'Advanced Diploma — ACCP',
    issuer: 'Aptech Qatar',
    date: 'Nov 2020 – Nov 2023',
    category: 'Software Engineering',
    desc: 'Overall Distinction across all three years (81%, 87%, 86%) of the Advanced Computer Career Programme in Software Engineering.',
    url: 'https://drive.google.com/file/d/1lOtZX9l8Gd1d_H60vcFm4SQUgHyQ5UAx/view?usp=drive_link'
  },
  {
    icon: 'fa-hands-helping',
    badge: '🤝 VOLUNTEER',
    badgeClass: 'cc-badge--volunteer',
    title: 'MDX Career Fair Certificate',
    issuer: 'Middlesex University Dubai',
    date: '2025',
    category: 'Community',
    desc: 'Certificate of appreciation for volunteering at the Middlesex University Dubai Annual Career Fair — supporting student-employer engagement.',
    url: 'https://drive.google.com/file/d/1xMiN9VHdOAJg4D7CowQnaCYCyejLmay8/view?usp=drive_link'
  },
  {
    icon: 'fa-circle-half-stroke',
    badge: '🔄 IN PROGRESS',
    badgeClass: 'cc-badge--progress',
    title: 'ITIL 4 Foundation',
    issuer: 'Axelos / PeopleCert',
    date: 'Targeted 2025',
    category: 'ITSM',
    desc: 'Formalising hands-on ITSM experience across incident management, change control, and service lifecycle management — fast-track path in progress.',
    url: ''
  },
  {
    icon: 'fa-university',
    badge: '🏅 HONOURS',
    badgeClass: 'cc-badge--gold',
    title: 'BSc Information Technology',
    issuer: 'Middlesex University Dubai',
    date: 'Sep 2024 – Jun 2025',
    category: 'Degree',
    desc: 'Merit — Upper Second Class Honours (2:1). Specialised in enterprise systems, networking, cybersecurity, and IT operations.',
    url: 'https://drive.google.com/file/d/17IYNcUbLLQfEJS0_4VtscE6xejH7p4XB/view?usp=sharing'
  }
];

function loadCertifications() {
  var heroWrap = document.getElementById('certHero');
  var grid     = document.getElementById('certsGrid');
  if (!grid) return;

  // Accent palette — one unique colour per card slot
  var accentPalette = [
    '#0a84ff', // blue   — Professional Certificate
    '#8e44ad', // violet — Odoo ERP
    '#e67e22', // amber  — Safety Award
    '#27ae60', // green  — Advanced Diploma
    '#c0392b', // crimson— MDX Career Fair
    '#2980b9', // steel  — ITIL
    '#d4a017'  // gold   — BSc IT
  ];

  // ── 1. HERO CARD — CCNA (index 0) ──────────────────────────────────
  var hero = certData[0];
  if (heroWrap && hero) {
    heroWrap.innerHTML =
      '<div class="cert-hero-card" style="animation:certReveal .7s cubic-bezier(.22,1,.36,1) 0ms both;">' +
        '<div class="chc-shimmer" aria-hidden="true"></div>' +
        '<div class="chc-left">' +
          '<div class="chc-icon-ring"><i class="fas ' + hero.icon + '"></i></div>' +
        '</div>' +
        '<div class="chc-body">' +
          '<span class="chc-eyebrow">⭐ Featured Certification</span>' +
          '<h3 class="chc-title">' + hero.title + ' 🌐</h3>' +
          '<p class="chc-subtitle">Cisco Certified Network Associate</p>' +
          '<div class="chc-meta-row">' +
            '<span class="chc-meta-pill"><i class="fas fa-building"></i>' + hero.issuer + '</span>' +
            '<span class="chc-meta-pill"><i class="fas fa-calendar-alt"></i>' + hero.date + '</span>' +
            '<span class="chc-meta-pill chc-cred"><i class="fas fa-fingerprint"></i>Credential ID: 9726449</span>' +
          '</div>' +
          '<p class="chc-desc">' + hero.desc + '</p>' +
          '<a href="' + hero.url + '" target="_blank" rel="noopener noreferrer" class="chc-verify-btn">' +
            '<i class="fas fa-shield-check"></i> Verify Certificate' +
          '</a>' +
        '</div>' +
        '<div class="chc-seal" aria-hidden="true">🏆</div>' +
      '</div>';
  }

  // ── 2. GRID CARDS — certData[1..] (no CCNA repeat) ─────────────────
  var certObserver = (typeof IntersectionObserver !== 'undefined')
    ? new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('stagger-visible');
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.08 })
    : null;

  certData.slice(1).forEach(function (cert, i) {
    var accent = accentPalette[i % accentPalette.length];
    var frame  = document.createElement('div');
    frame.className = 'cert-card';
    frame.style.cssText =
      'opacity:1 !important;visibility:visible !important;' +
      '--cert-accent:' + accent + ';' +
      'animation:certReveal .55s cubic-bezier(.22,1,.36,1) ' + (i * 80 + 120) + 'ms both;';

    frame.innerHTML =
      '<div class="cert-card-inner">' +
        '<div class="cc-top-row">' +
          '<div class="cc-icon-wrap" style="background:' + accent + '22;color:' + accent + ';">' +
            '<i class="fas ' + cert.icon + '"></i>' +
          '</div>' +
          '<span class="cc-badge ' + cert.badgeClass + '">' + cert.badge + '</span>' +
        '</div>' +
        '<div class="cc-category" style="color:' + accent + ';">' + cert.category + '</div>' +
        '<div class="cc-title">' + cert.title + '</div>' +
        '<div class="cc-issuer"><i class="fas fa-building"></i> ' + cert.issuer + '</div>' +
        '<div class="cc-date"><i class="fas fa-calendar-alt"></i> ' + cert.date + '</div>' +
        '<div class="cc-desc">' + cert.desc + '</div>' +
        (cert.url
          ? '<a href="' + cert.url + '" target="_blank" rel="noopener noreferrer" ' +
            'class="cc-cert-btn" style="--ba:' + accent + ';border-color:' + accent + '44;color:' + accent + ';">' +
            '<i class="fas fa-eye"></i> View Certificate</a>'
          : '<span class="cc-in-progress"><i class="fas fa-clock"></i> In Progress</span>'
        ) +
      '</div>';

    grid.appendChild(frame);
    if (certObserver) certObserver.observe(frame);
  });
}



// ============================================================
// SECTION 24 · CONSOLE SIGNATURE
// ============================================================

function printSignature() {
  console.log(
    '%c\u2628  SAJID MEHMOOD \u00B7 IT SYSTEMS ENGINEER',
    'font-size:14px;font-weight:bold;color:#C5A059;background:#0D1017;padding:10px 22px;border-radius:4px;border-left:3px solid #C5A059;'
  );
  console.log('%cCCNA Certified \u00B7 Enterprise Infrastructure \u00B7 WhatsApp: wa.me/97466969598', 'font-size:11px;color:#4A5470;');
}


// ============================================================
// NEUBRUTALISM · CARTOON BOUNCE OBSERVER
// ============================================================

(function () {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (entry.isIntersecting) {
        var el = entry.target;
        el.style.animationDelay = (i * 0.08) + 's';
        el.classList.add('neu-bounce-in');
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.proj-card, .exp-item, .kpi-block, .ach-item').forEach(function (el) {
    observer.observe(el);
  });
})();

// ============================================================
// NEUBRUTALISM · CARD TILT ON HOVER
// ============================================================

(function () {
  document.addEventListener('mousemove', function (e) {
    var cards = document.querySelectorAll('.proj-card, .cert-card');
    cards.forEach(function (card) {
      // Only apply tilt to cards that are visible (not blocked by AO)
      if (card.style.opacity === '0') return;
      var rect = card.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = (e.clientX - cx) / rect.width;
      var dy = (e.clientY - cy) / rect.height;
      if (Math.abs(dx) < 1.2 && Math.abs(dy) < 1.2) {
        card.style.transform = 'translate(-4px,-4px) rotate(' + (dx * 1.5) + 'deg)';
      }
    });
  });
  document.addEventListener('mouseleave', function () {
    document.querySelectorAll('.proj-card, .cert-card').forEach(function (card) {
      card.style.transform = '';
    });
  });
})();


// ============================================================
// WEATHER BAR — Clock + Live Doha Weather
// ============================================================

(function () {
  'use strict';

  var elTime    = document.getElementById('wbTime');
  var elDate    = document.getElementById('wbDate');
  var elWeather = document.getElementById('wbWeather');

  if (!elTime && !elDate && !elWeather) return;

  // ── 1. CLOCK (Qatar timezone, updates every second) ──────────
  function tickClock() {
    var now = new Date();

    // Time — Qatar is UTC+3, no DST
    var t = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Qatar',
      hour:     'numeric',
      minute:   '2-digit',
      second:   '2-digit',
      hour12:   true
    });

    // Date — "Mon, 01 May 2026"
    var d = now.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Qatar',
      weekday:  'short',
      day:      '2-digit',
      month:    'short',
      year:     'numeric'
    });

    if (elTime) elTime.textContent = t;
    if (elDate) elDate.textContent = d;
  }

  tickClock();
  setInterval(tickClock, 1000);

  // ── 2. WEATHER (Open-Meteo — free, no API key needed) ────────
  // Doha, Qatar: lat 25.2854, lon 51.5310
  var DOHA_LAT = 25.2854;
  var DOHA_LON = 51.5310;

  var WMO_CODES = {
    0:  { label: 'Clear',          icon: 'fa-sun' },
    1:  { label: 'Mostly Clear',   icon: 'fa-sun' },
    2:  { label: 'Partly Cloudy',  icon: 'fa-cloud-sun' },
    3:  { label: 'Overcast',       icon: 'fa-cloud' },
    45: { label: 'Fog',            icon: 'fa-smog' },
    48: { label: 'Icy Fog',        icon: 'fa-smog' },
    51: { label: 'Light Drizzle',  icon: 'fa-cloud-drizzle' },
    53: { label: 'Drizzle',        icon: 'fa-cloud-drizzle' },
    55: { label: 'Heavy Drizzle',  icon: 'fa-cloud-drizzle' },
    61: { label: 'Light Rain',     icon: 'fa-cloud-rain' },
    63: { label: 'Rain',           icon: 'fa-cloud-rain' },
    65: { label: 'Heavy Rain',     icon: 'fa-cloud-showers-heavy' },
    71: { label: 'Light Snow',     icon: 'fa-snowflake' },
    73: { label: 'Snow',           icon: 'fa-snowflake' },
    75: { label: 'Heavy Snow',     icon: 'fa-snowflake' },
    80: { label: 'Showers',        icon: 'fa-cloud-sun-rain' },
    81: { label: 'Showers',        icon: 'fa-cloud-rain' },
    82: { label: 'Heavy Showers',  icon: 'fa-cloud-showers-heavy' },
    95: { label: 'Thunderstorm',   icon: 'fa-bolt-lightning' },
    96: { label: 'Thunderstorm',   icon: 'fa-bolt-lightning' },
    99: { label: 'Thunderstorm',   icon: 'fa-bolt-lightning' }
  };

  function setWeather(html) {
    if (elWeather) elWeather.innerHTML = html;
  }

  function fetchWeather() {
    setWeather(
      '<i class="fas fa-location-crosshairs wb-icon wb-spin"></i>' +
      '<span class="wb-weather-text">Fetching weather…</span>'
    );

    var url =
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude='  + DOHA_LAT +
      '&longitude=' + DOHA_LON +
      '&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,relativehumidity_2m' +
      '&temperature_unit=celsius' +
      '&windspeed_unit=kmh' +
      '&timezone=Asia%2FQatar';

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var c    = data.current;
        var code = c.weathercode;
        var info = WMO_CODES[code] || { label: 'Unknown', icon: 'fa-cloud' };
        var temp = Math.round(c.temperature_2m);
        var feel = Math.round(c.apparent_temperature);
        var wind = Math.round(c.windspeed_10m);
        var hum  = Math.round(c.relativehumidity_2m);

        setWeather(
          '<i class="fas ' + info.icon + ' wb-icon"></i>' +
          '<span class="wb-weather-text">' +
            '<strong style="color:var(--text-primary,#F1F5F9)">' + temp + '°C</strong>' +
            ' · ' + info.label +
            ' · Feels ' + feel + '°C' +
            ' · ' + hum + '% RH' +
            ' · ' + wind + ' km/h' +
            ' <span style="opacity:.55;font-size:9px;">Doha, QA</span>' +
          '</span>'
        );

        // Refresh every 10 minutes
        setTimeout(fetchWeather, 10 * 60 * 1000);
      })
      .catch(function (err) {
        setWeather(
          '<i class="fas fa-triangle-exclamation wb-icon" style="color:#F59E0B"></i>' +
          '<span class="wb-weather-text">Weather unavailable</span>'
        );
        // Retry in 2 minutes on error
        setTimeout(fetchWeather, 2 * 60 * 1000);
        console.warn('[WeatherBar] fetch failed:', err);
      });
  }

  // Fetch immediately, but give the page 800ms to settle first
  setTimeout(fetchWeather, 800);

})();

// Experience tab system — static HTML panels
(function() {
  var tabs = document.querySelectorAll('.exp-tab');
  var panels = document.querySelectorAll('.exp-panel');
  if (!tabs.length) return;

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = tab.dataset.tab;
      tabs.forEach(function(t) { t.classList.remove('active'); });
      panels.forEach(function(p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });
})();


// ============================================================
// SECTOR ORBIT — Draggable 3D glass ellipse carousel
// Smooth JS-driven orbit with mouse/touch drag support
// ============================================================
(function () {
  'use strict';

  var ORBIT_RX   = 138;   // ellipse x-radius (px) — overridden by getRadii()
  var ORBIT_RY   = 34;    // ellipse y-radius (px, flattened for perspective)
  var SPEED      = 0.35;  // degrees per frame (auto-rotation)
  var DRAG_SCALE = 0.5;   // drag sensitivity

  function initOrbit() {
    var wrap  = document.querySelector('.sector-ticker-wrap');
    var track = document.querySelector('.sector-ticker-track');
    if (!wrap || !track) return;

    // Collect only the first 5 items
    var allItems = track.querySelectorAll('.sector-ticker-item');
    var items = [];
    for (var i = 0; i < Math.min(5, allItems.length); i++) {
      items.push(allItems[i]);
    }
    if (!items.length) return;

    var N       = items.length;
    var angle   = 0;      // global rotation angle (degrees)
    var raf     = null;
    var paused  = false;
    var dragging = false;
    var lastX   = 0;
    var velX    = 0;

    // Responsive radii — always derived from actual container width
    function getRadii() {
      var w = wrap.offsetWidth || 300;
      var rx = Math.max(60, (w / 2) - 24);  // fill width with padding
      var ry = Math.max(20, Math.round(rx * 0.25));
      return { rx: rx, ry: ry };
    }

    function positionItems(deg) {
      var r = getRadii();
      var baseAngles = [];
      for (var i = 0; i < N; i++) {
        baseAngles.push(deg + i * (360 / N));
      }

      // Find which item is "front" (closest to 90° = bottom of ellipse in 3D)
      var frontIdx = 0;
      var maxZ = -Infinity;

      items.forEach(function (el, i) {
        var rad = (baseAngles[i] % 360) * Math.PI / 180;
        var x = r.rx * Math.cos(rad);
        var y = r.ry * Math.sin(rad);
        // Z depth: sin gives depth perception — sin(90°)=1 is front, sin(270°)=-1 is back
        var z = Math.sin(rad);
        var scale = 0.75 + 0.25 * ((z + 1) / 2);  // 0.75..1.0
        var opacity = 0.45 + 0.55 * ((z + 1) / 2); // 0.45..1.0

        el.style.transform = 'translate(calc(-50% + ' + x + 'px), calc(-50% + ' + y + 'px)) scale(' + scale.toFixed(3) + ')';
        el.style.opacity   = opacity.toFixed(3);
        el.style.zIndex    = Math.round(z * 10 + 10);

        if (z > maxZ) { maxZ = z; frontIdx = i; }
      });

      // Mark front item
      items.forEach(function (el, i) {
        if (i === frontIdx) el.classList.add('sti-active');
        else el.classList.remove('sti-active');
      });
    }

    function tick() {
      if (!dragging && !paused) {
        // Apply momentum decay when not dragging
        if (Math.abs(velX) > 0.01) {
          angle += velX;
          velX *= 0.96;
        } else {
          velX = 0;
          angle += SPEED;
        }
      }
      angle = ((angle % 360) + 360) % 360;
      positionItems(angle);
      raf = requestAnimationFrame(tick);
    }

    // ── Mouse drag ──
    wrap.addEventListener('mousedown', function (e) {
      dragging = true;
      lastX = e.clientX;
      velX = 0;
      e.preventDefault();
    });
    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      velX = dx * DRAG_SCALE;
      angle += velX;
      lastX = e.clientX;
    });
    document.addEventListener('mouseup', function () {
      dragging = false;
    });

    // ── Touch drag ──
    wrap.addEventListener('touchstart', function (e) {
      dragging = true;
      lastX = e.touches[0].clientX;
      velX = 0;
    }, { passive: true });
    wrap.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      var dx = e.touches[0].clientX - lastX;
      velX = dx * DRAG_SCALE;
      angle += velX;
      lastX = e.touches[0].clientX;
    }, { passive: true });
    wrap.addEventListener('touchend', function () {
      dragging = false;
    });

    // ── Pause on hover (non-drag) ──
    wrap.addEventListener('mouseenter', function () { if (!dragging) paused = true; });
    wrap.addEventListener('mouseleave', function () { paused = false; velX = 0; });

    // Kick off
    positionItems(0);
    tick();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrbit);
  } else {
    initOrbit();
  }
})();


// ============================================================
// NAV LOGO NAME — Floating draggable with magnetic snap-back
// ============================================================
(function () {
  'use strict';

  function initFloatingName() {
    var el = document.querySelector('.nav-logo-name');
    if (!el) return;

    var dragging  = false;
    var startX    = 0, startY    = 0;
    var currentX  = 0, currentY  = 0;
    var velX      = 0, velY      = 0;
    var raf       = null;
    var resting   = true;   // idle float active?

    // ── Physics constants ──
    var FRICTION   = 0.88;   // momentum decay
    var SPRING     = 0.12;   // snap-back spring strength
    var DAMPING    = 0.72;   // snap-back damping
    var MAX_DRAG   = 60;     // max drag distance (px)

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    function applyTransform(x, y) {
      el.style.transform = 'translate(' + x.toFixed(2) + 'px, ' + y.toFixed(2) + 'px)';
    }

    function snapBack() {
      if (Math.abs(currentX) < 0.15 && Math.abs(currentY) < 0.15 &&
          Math.abs(velX) < 0.15 && Math.abs(velY) < 0.15) {
        currentX = 0; currentY = 0; velX = 0; velY = 0;
        applyTransform(0, 0);
        resting = true;
        // Re-enable CSS float animation
        el.style.animation = '';
        cancelAnimationFrame(raf);
        return;
      }
      // Spring toward origin
      var ax = -SPRING * currentX;
      var ay = -SPRING * currentY;
      velX = (velX + ax) * DAMPING;
      velY = (velY + ay) * DAMPING;
      currentX += velX;
      currentY += velY;
      applyTransform(currentX, currentY);
      raf = requestAnimationFrame(snapBack);
    }

    // ── Mouse drag ──
    el.addEventListener('mousedown', function (e) {
      dragging = true;
      resting  = false;
      cancelAnimationFrame(raf);
      el.style.animation = 'none';   // pause CSS float
      startX = e.clientX - currentX;
      startY = e.clientY - currentY;
      velX = 0; velY = 0;
      e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var nx = e.clientX - startX;
      var ny = e.clientY - startY;
      // Clamp + elastic resistance near edges
      nx = clamp(nx, -MAX_DRAG, MAX_DRAG);
      ny = clamp(ny, -MAX_DRAG, MAX_DRAG);
      velX = nx - currentX;
      velY = ny - currentY;
      currentX = nx;
      currentY = ny;
      applyTransform(currentX, currentY);
    });

    document.addEventListener('mouseup', function () {
      if (!dragging) return;
      dragging = false;
      // Apply momentum then spring back
      raf = requestAnimationFrame(snapBack);
    });

    // ── Touch drag ──
    el.addEventListener('touchstart', function (e) {
      dragging = true;
      resting  = false;
      cancelAnimationFrame(raf);
      el.style.animation = 'none';
      startX = e.touches[0].clientX - currentX;
      startY = e.touches[0].clientY - currentY;
      velX = 0; velY = 0;
    }, { passive: true });

    el.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      var nx = e.touches[0].clientX - startX;
      var ny = e.touches[0].clientY - startY;
      nx = clamp(nx, -MAX_DRAG, MAX_DRAG);
      ny = clamp(ny, -MAX_DRAG, MAX_DRAG);
      velX = nx - currentX;
      velY = ny - currentY;
      currentX = nx;
      currentY = ny;
      applyTransform(currentX, currentY);
    }, { passive: true });

    el.addEventListener('touchend', function () {
      dragging = false;
      raf = requestAnimationFrame(snapBack);
    });

    // ── Magnetic mouse-follow (subtle, non-drag) ──
    var navEl = document.querySelector('.top-nav');
    if (navEl) {
      navEl.addEventListener('mousemove', function (e) {
        if (dragging || !resting) return;
        var rect = el.getBoundingClientRect();
        var cx   = rect.left + rect.width  / 2;
        var cy   = rect.top  + rect.height / 2;
        var dx   = e.clientX - cx;
        var dy   = e.clientY - cy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          var pull = (1 - dist / 120) * 6;  // max 6px pull
          applyTransform(dx / dist * pull || 0, dy / dist * pull || 0);
        } else {
          applyTransform(0, 0);
        }
      });
      navEl.addEventListener('mouseleave', function () {
        if (!dragging) applyTransform(0, 0);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFloatingName);
  } else {
    initFloatingName();
  }
})();





// ============================================================
// NAV LOGO NAME — Click navigates to homepage / main website
// ============================================================
(function () {
  'use strict';

  function initNavNameLink() {
    var el = document.getElementById('navLogoName');
    if (!el) return;

    var _wasDragging = false;

    // Set the name text
    if (!el.textContent.trim()) {
      el.textContent = 'Sajid Mehmood';
    }

    // Detect if drag just happened so we don't navigate on drag-release
    el.addEventListener('mousedown', function () { _wasDragging = false; });
    el.addEventListener('mousemove', function () { _wasDragging = true; });
    el.addEventListener('touchstart', function () { _wasDragging = false; }, { passive: true });
    el.addEventListener('touchmove',  function () { _wasDragging = true;  }, { passive: true });

    el.addEventListener('click', function (e) {
      if (_wasDragging) { _wasDragging = false; return; }
      // If gate is still visible, do nothing
      var gate = document.getElementById('gateOverlay');
      if (gate && !gate.classList.contains('hidden')) return;
      // Navigate to top of main website
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Update URL to root without reload
      if (history.pushState) history.pushState(null, '', '/');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavNameLink);
  } else {
    initNavNameLink();
  }
})();
