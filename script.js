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
  waves.push(new Wave(0, 22, 0.25, waveColors[0], 0.035)); // was 0.06
  waves.push(new Wave(0, 16, -0.18, waveColors[1], 0.028)); // was 0.05
  waves.push(new Wave(0, 12, 0.32, waveColors[2], 0.022)); // was 0.04

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
          var op = (1 - d / LINK_DIST) * 0.10; // was 0.18 — much subtler
          var life = Math.min(particles[a].life / particles[a].maxLife, particles[b].life / particles[b].maxLife);
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.strokeStyle = 'hsla(212, 40%, 65%,' + (op * life) + ')'; // unified blue
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
        var alpha = 0.015 + pulse * 0.012; // was 0.025 + 0.02
        if (dist < 220) alpha += (1 - dist / 220) * 0.025; // was 0.04
        ctx.beginPath();
        for (var k = 0; k < 6; k++) {
          var angle = (Math.PI / 3) * k;
          var hx = cx + size * Math.cos(angle), hy = cy + size * Math.sin(angle);
          k === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.strokeStyle = 'hsla(212,35%,68%,' + alpha + ')'; // was 195,60%,65%
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
  // TELEGRAM — proxy endpoint pattern
  // NOTE: For production security, replace TG_TOKEN and TG_CHAT_ID
  // with a server-side proxy URL (Cloudflare Worker / Vercel function).
  // Keeping client-side here for portability — rotate token regularly.
  // ----------------------------------------------------------
  var TG_TOKEN   = '8716049751:AAGInSyDf0cwRJW95nc-9YlLc6dBTzrx6AU';
  var TG_CHAT_ID = '8235795754';

  // Rate limit: max 5 attempts per session, 3s cooldown between submits
  var _submitCount      = 0;
  var _lastSubmitMs     = 0;
  var MAX_ATTEMPTS      = 5;
  var SUBMIT_COOLDOWN_MS = 3000;

  document.body.style.overflow = 'hidden';

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
      _submitCount--;
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

    setTimeout(revealPortfolio, 2800);
    sendTelegramNotification(displayName, revealPortfolio);
  };

  // ----------------------------------------------------------
  // 1P · TELEGRAM NOTIFICATION
  // ----------------------------------------------------------

  function sendTelegramNotification(name, callback) {
    var ua = navigator.userAgent;

    var device = '\uD83D\uDCBB Desktop';
    if      (/iPhone/i.test(ua))          device = '\uD83D\uDCF1 iPhone';
    else if (/iPad/i.test(ua))            device = '\uD83D\uDCF1 iPad';
    else if (/Android.*Mobile/i.test(ua)) device = '\uD83D\uDCF1 Android Phone';
    else if (/Android/i.test(ua))         device = '\uD83D\uDCF1 Android Tablet';

    var os = 'Unknown OS';
    if      (/Windows NT 10/i.test(ua))       os = 'Windows 10/11';
    else if (/Windows NT 6/i.test(ua))        os = 'Windows (older)';
    else if (/Mac OS X/i.test(ua))            os = 'macOS';
    else if (/iPhone OS ([\d_]+)/i.test(ua))  os = 'iOS ' + ua.match(/iPhone OS ([\d_]+)/i)[1].replace(/_/g,'.');
    else if (/Android ([\d.]+)/i.test(ua))    os = 'Android ' + ua.match(/Android ([\d.]+)/i)[1];
    else if (/Linux/i.test(ua))               os = 'Linux';

    var browser = 'Unknown';
    if      (/Edg\//i.test(ua))     browser = 'Microsoft Edge';
    else if (/OPR\//i.test(ua))     browser = 'Opera';
    else if (/Chrome\//i.test(ua))  browser = 'Chrome';
    else if (/Firefox\//i.test(ua)) browser = 'Firefox';
    else if (/Safari\//i.test(ua))  browser = 'Safari';

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
      var deviceCategory = screenWidth < 480 ? 'Mobile' : screenWidth < 1024 ? 'Tablet' : 'Desktop';
      var isLocal        = referrer.includes('127.0.0.1') || referrer.includes('localhost');
      var statusEmoji    = isLocal ? '\uD83D\uDEE0\uFE0F' : '\uD83C\uDFAF';
      var statusTitle    = isLocal ? 'Local Test'  : 'New Visitor';

      var msg =
        statusEmoji + ' <b>' + statusTitle + ': ' + esc(name) + ' is viewing your Portfolio!</b>\n' +
        '\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n' +
        '\uD83D\uDCCD <b>' + esc(city) + ', ' + esc(country) + '</b>\n' +
        '\uD83C\uDFE2 <i>ISP: ' + esc(isp) + '</i>\n' +
        '\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n' +
        '\uD83D\uDC64 <b>Visitor:</b> '      + esc(name)      + '\n' +
        '\uD83D\uDD17 <b>Source:</b> <code>' + esc(referrer)  + '</code>\n' +
        '\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n' +
        '\uD83D\uDDA5\uFE0F <b>Device:</b> '   + esc(device)    + '\n' +
        '\u2699\uFE0F <b>OS:</b> '             + esc(os)        + '\n' +
        '\uD83C\uDF10 <b>Browser:</b> '        + esc(browser)   + '\n' +
        '\uD83D\uDCD0 <b>Screen:</b> '         + esc(screenRes) + ' <i>(' + esc(deviceCategory) + ')</i>\n' +
        '\uD83D\uDDE3\uFE0F <b>Language:</b> ' + esc(lang)      + '\n' +
        '\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n' +
        '\uD83D\uDD50 <b>Time (Qatar):</b> '   + esc(time)      + '\n' +
        '\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n' +
        '\uD83D\uDEE0\uFE0F <a href="https://ipinfo.io/' + ip + '">Lookup</a> | ' +
        '\uD83D\uDCCD <a href="https://www.google.com/maps/search/' + ip + '">Map</a> | ' +
        '\uD83D\uDD12 IP: <code>' + esc(ip) + '</code>';

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
      { icon: 'fa-bug',             name: 'Vulnerability Triage', color: '#5a6a85' }
    ]
  },
  {
    id: 'specialty', icon: 'fa-stethoscope', title: 'Specialist Platforms', subtitle: 'EMR · POS · ERP · Immigration Systems',
    color: '#2c5f9e', span: true,
    tools: [
      { icon: 'fa-heart-pulse',   name: 'EMR Systems',         color: '#2c5f9e' },
      { icon: 'fa-cash-register', name: 'POS Systems',         color: '#3a7bd5' },
      { icon: 'fa-cubes',         name: 'Odoo ERP',            color: '#5a6a85' },
      { icon: 'fa-passport',      name: 'Immigration Systems', color: '#1a3f6f' },
      { icon: 'fa-terminal',      name: 'PowerShell',          color: '#2c5f9e' },
      { icon: 'fa-table',         name: 'SQL Basics',          color: '#3a7bd5' }
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
    '%c\u2628  SAJID MEHMOOD \u00B7 IT SYSTEMS ENGINEER',
    'font-size:14px;font-weight:bold;color:#C5A059;background:#0D1017;padding:10px 22px;border-radius:4px;border-left:3px solid #C5A059;'
  );
  console.log('%cCCNA Certified \u00B7 Enterprise Infrastructure \u00B7 WhatsApp: wa.me/97466969598', 'font-size:11px;color:#4A5470;');
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

  document.querySelectorAll('.proj-card, .cert-card, .exp-item, .kpi-block, .ach-item').forEach(function (el) {
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
    var t = now.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Qatar',
      hour:     '2-digit',
      minute:   '2-digit',
      second:   '2-digit',
      hour12:   false
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
