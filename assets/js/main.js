/* Claudio Junior Alicati, portfólio.
   Animações com GSAP (ScrollTrigger e SplitText) e rolagem suave com Lenis. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var body = document.body;
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ponteiroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var temGsap = typeof window.gsap !== 'undefined' &&
    typeof window.ScrollTrigger !== 'undefined' &&
    typeof window.SplitText !== 'undefined';
  var comMovimento = temGsap && !reduzir;
  var lenis = null;

  function liberar() { doc.classList.add('pronto'); }

  function adiar(fn, ms) {
    var t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  /* ---------- Relógio ---------- */
  var relogio = document.querySelector('[data-relogio]');
  if (relogio) {
    var formatoHora = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
    var atualizarHora = function () {
      var agora = new Date();
      relogio.textContent = formatoHora.format(agora);
      relogio.setAttribute('datetime', agora.toISOString());
    };
    atualizarHora();
    setInterval(atualizarHora, 10000);
  }

  /* ---------- Copiar e-mail ---------- */
  var statusCopia = document.querySelector('[data-copiar-status]');
  document.querySelectorAll('[data-copiar]').forEach(function (botao) {
    var rotulo = botao.textContent;
    var espera;
    botao.addEventListener('click', function () {
      var valor = botao.getAttribute('data-copiar');
      var concluir = function (ok) {
        botao.textContent = ok ? 'E-mail copiado' : 'Copie o e-mail acima';
        if (statusCopia) {
          statusCopia.textContent = ok
            ? 'E-mail copiado: ' + valor
            : 'O navegador bloqueou a cópia. O e-mail é ' + valor + '.';
        }
        clearTimeout(espera);
        espera = setTimeout(function () {
          botao.textContent = rotulo;
          if (statusCopia) statusCopia.textContent = '';
        }, 2800);
      };
      var reserva = function () {
        var campo = document.createElement('textarea');
        campo.value = valor;
        campo.setAttribute('readonly', '');
        campo.style.position = 'fixed';
        campo.style.opacity = '0';
        body.appendChild(campo);
        campo.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        campo.remove();
        concluir(ok);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(valor).then(function () { concluir(true); }, reserva);
      } else {
        reserva();
      }
    });
  });

  /* ---------- Atrium: ver o painel como Ana ou Clara ---------- */
  var alternador = document.querySelector('[data-alternador]');
  if (alternador) {
    var telas = Array.prototype.slice.call(document.querySelectorAll('[data-telas] img'));
    var legenda = document.querySelector('[data-legenda]');
    var legendas = {
      ana: 'A Ana vê todos os clientes, a equipe e a cobrança da agência.',
      clara: 'A Clara só vê os projetos e pedidos da empresa dela. Quem decide isso é o banco de dados, então o resto nem chega ao navegador.'
    };
    alternador.setAttribute('data-ativo', 'ana');
    window.addEventListener('load', function () {
      telas.forEach(function (img) { img.loading = 'eager'; });
    });
    alternador.addEventListener('click', function (e) {
      var botao = e.target.closest('button[data-ver]');
      if (!botao) return;
      var ver = botao.getAttribute('data-ver');
      if (alternador.getAttribute('data-ativo') === ver) return;
      alternador.setAttribute('data-ativo', ver);
      alternador.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === botao));
      });
      if (legenda) legenda.textContent = legendas[ver];
      var nova = telas.filter(function (t) { return t.getAttribute('data-tela') === ver; })[0];
      var antiga = telas.filter(function (t) { return t.getAttribute('data-tela') !== ver; })[0];
      if (!nova || !antiga) return;
      nova.hidden = false;
      if (comMovimento) {
        nova.style.zIndex = '2';
        antiga.style.zIndex = '1';
        gsap.fromTo(nova,
          { clipPath: 'inset(0% 0% 0% 100%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)', duration: 0.95, ease: 'expo.inOut', overwrite: true,
            onComplete: function () { antiga.hidden = true; nova.style.clipPath = ''; }
          });
      } else {
        antiga.hidden = true;
      }
    });
  }

  /* ---------- Topo: some ao descer, volta ao subir ---------- */
  var topo = document.querySelector('[data-topo]');
  var ultimoY = 0;
  function aoRolar(y) {
    if (!topo) return;
    topo.classList.toggle('rolou', y > 24);
    if (y > ultimoY + 6 && y > 320) topo.classList.add('escondido');
    else if (y < ultimoY - 6 || y <= 320) topo.classList.remove('escondido');
    ultimoY = y;
  }
  if (topo) {
    topo.addEventListener('focusin', function () { topo.classList.remove('escondido'); });
  }

  /* ---------- Links internos ---------- */
  function irPara(alvo) {
    if (!alvo) return;
    if (lenis) lenis.scrollTo(alvo, { duration: 1.6 });
    else alvo.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth' });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id.length < 2) return;
      var alvo = document.getElementById(id.slice(1));
      if (!alvo) return;
      e.preventDefault();
      irPara(alvo);
      if (history.pushState) history.pushState(null, '', id === '#inicio' ? location.pathname : id);
      if (!alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1');
      alvo.focus({ preventScroll: true });
    });
  });

  var pilha = document.querySelector('[data-hero-pilha]');
  if (pilha) {
    pilha.addEventListener('click', function () { irPara(document.getElementById('projetos')); });
  }

  /* ---------- Sem GSAP: página estática ---------- */
  if (!temGsap) {
    doc.classList.remove('motion');
    window.addEventListener('scroll', function () { aoRolar(window.scrollY); }, { passive: true });
    liberar();
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* ---------- Rolagem suave ---------- */
  if (comMovimento && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    lenis.on('scroll', function (l) { aoRolar(l.scroll); });
    gsap.ticker.add(function (tempo) { lenis.raf(tempo * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    window.addEventListener('scroll', function () { aoRolar(window.scrollY); }, { passive: true });
  }

  /* ---------- Cor de fundo de cada parte da página ---------- */
  var metaCor = document.querySelector('meta[name="theme-color"]');
  var secaoAtual = null;
  function aplicarCor(secao) {
    if (secaoAtual === secao) return;
    secaoAtual = secao;
    var cor = secao.getAttribute('data-bg');
    gsap.to(body, { backgroundColor: cor, duration: comMovimento ? 0.9 : 0, ease: 'power2.out', overwrite: 'auto' });
    doc.style.setProperty('--acento-atual', secao.getAttribute('data-acento') || '#3ED6B5');
    body.classList.toggle('tema-claro', secao.getAttribute('data-tema') === 'claro');
    if (metaCor) metaCor.setAttribute('content', cor);
  }
  gsap.utils.toArray('[data-bg]').forEach(function (secao) {
    ScrollTrigger.create({
      trigger: secao,
      start: 'top 55%',
      end: 'bottom 55%',
      onEnter: function () { aplicarCor(secao); },
      onEnterBack: function () { aplicarCor(secao); }
    });
  });
  doc.classList.add('cores-vivas');

  /* ---------- Link ativo no menu ---------- */
  var linksMenu = Array.prototype.slice.call(document.querySelectorAll('.menu a'));
  ['projetos', 'sobre', 'trajetoria', 'contato'].forEach(function (id) {
    var secao = document.getElementById(id);
    if (!secao) return;
    ScrollTrigger.create({
      trigger: secao,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: function (self) {
        linksMenu.forEach(function (a) {
          if (a.getAttribute('href') === '#' + id) {
            if (self.isActive) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          }
        });
      }
    });
  });

  /* ---------- Abertura ---------- */
  var nome = document.querySelector('[data-hero-nome]');
  var letras = [];
  var centros = [];
  var nomeSolto = false;

  function medirLetras() {
    centros = letras.map(function (c) {
      var r = c.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 + window.scrollY };
    });
  }

  function abrir() {
    if (!nome) { liberar(); return; }
    var divisao = new SplitText(nome.querySelectorAll('.palavra'), { type: 'chars', charsClass: 'char' });
    letras = divisao.chars;

    if (!comMovimento) {
      nome.classList.add('solto');
      liberar();
      return;
    }

    var intro = document.querySelector('[data-hero-intro]');
    var linhasIntro = intro ? new SplitText(intro, { type: 'lines', mask: 'lines', linesClass: 'linha' }) : null;
    var acoes = document.querySelectorAll('[data-hero-acoes] > *');
    var local = document.querySelector('[data-hero-local]');
    var janelas = document.querySelectorAll('.pilha-janela');

    var tl = gsap.timeline({
      defaults: { ease: 'expo.out' },
      onComplete: function () {
        nome.classList.add('solto');
        nomeSolto = true;
        if (linhasIntro) linhasIntro.revert();
        medirLetras();
      }
    });

    tl.fromTo(letras,
      { yPercent: 118, '--wdth': 76 },
      { yPercent: 0, '--wdth': 100, duration: 1.5, stagger: 0.035 }, 0.1);
    if (linhasIntro) tl.from(linhasIntro.lines, { yPercent: 105, duration: 1.15, stagger: 0.09 }, 0.55);
    tl.from(acoes, { y: 26, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.8)
      .from(local, { autoAlpha: 0, duration: 1 }, 1)
      .from(janelas, { y: 170, rotationX: -26, autoAlpha: 0, duration: 1.7, stagger: 0.12, ease: 'power4.out' }, 0.45);
    if (topo) tl.from(topo.children, { y: -24, autoAlpha: 0, duration: 1.1, stagger: 0.08 }, 0.85);

    liberar();
  }

  var fonte = (document.fonts && document.fonts.load)
    ? Promise.race([
        document.fonts.load('690 100px "Mona Sans"'),
        new Promise(function (r) { setTimeout(r, 2500); })
      ])
    : Promise.resolve();
  fonte.then(abrir, abrir);

  /* ---------- Nome reage ao ponteiro ---------- */
  var hero = document.querySelector('.hero');
  if (comMovimento && ponteiroFino && hero) {
    var px = -1e5, py = -1e5, dentro = false;
    var estados = [];
    hero.addEventListener('pointermove', function (e) {
      px = e.clientX; py = e.clientY + window.scrollY; dentro = true;
    });
    hero.addEventListener('pointerleave', function () { dentro = false; });
    window.addEventListener('resize', adiar(function () { if (nomeSolto) medirLetras(); }, 200));

    gsap.ticker.add(function () {
      if (!nomeSolto || !letras.length) return;
      var raio = Math.max(200, window.innerWidth * 0.17);
      for (var i = 0; i < letras.length; i++) {
        var s = estados[i] || (estados[i] = { w: 100, g: 690 });
        var t = 0;
        if (dentro && centros[i]) {
          var dx = px - centros[i].x;
          var dy = (py - centros[i].y) * 1.25;
          var d = Math.sqrt(dx * dx + dy * dy);
          t = d < raio ? 1 - d / raio : 0;
          t = t * t * (3 - 2 * t);
        }
        var alvoW = 100 + 25 * t;
        var alvoG = 690 + 210 * t;
        var nw = s.w + (alvoW - s.w) * 0.12;
        var ng = s.g + (alvoG - s.g) * 0.12;
        if (Math.abs(nw - s.w) > 0.01 || Math.abs(ng - s.g) > 0.05) {
          s.w = nw; s.g = ng;
          letras[i].style.setProperty('--wdth', nw.toFixed(2));
          letras[i].style.setProperty('--wght', ng.toFixed(1));
        }
      }
    });

    var cena = document.querySelector('.pilha-cena');
    if (cena) {
      gsap.set(cena, { rotationX: 9, rotationY: -17 });
      var girarX = gsap.quickTo(cena, 'rotationX', { duration: 1.3, ease: 'power3' });
      var girarY = gsap.quickTo(cena, 'rotationY', { duration: 1.3, ease: 'power3' });
      hero.addEventListener('pointermove', function (e) {
        var nx = e.clientX / window.innerWidth - 0.5;
        var ny = e.clientY / window.innerHeight - 0.5;
        girarY(-17 + nx * 14);
        girarX(9 - ny * 12);
      });
      hero.addEventListener('pointerleave', function () { girarY(-17); girarX(9); });
    }
  }

  if (comMovimento) {
    /* Abertura sai devagar ao rolar */
    if (hero && nome) {
      gsap.to(nome, { yPercent: -24, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }
    if (pilha) {
      gsap.to(pilha, { yPercent: -26, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }

    /* Títulos abrem a largura das letras conforme entram na tela */
    gsap.utils.toArray('[data-largura]').forEach(function (el) {
      var fim = el.classList.contains('contato-titulo') ? 115 : 112;
      gsap.fromTo(el, { '--wdth': 75 }, {
        '--wdth': fim, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 96%', end: 'top 42%', scrub: 0.6 }
      });
    });

    /* Texto do Sobre acende palavra por palavra */
    gsap.utils.toArray('[data-revelar]').forEach(function (p) {
      var palavras = new SplitText(p, { type: 'words', wordsClass: 'palavra-r' }).words;
      gsap.fromTo(palavras, { opacity: 0.14 }, {
        opacity: 1, ease: 'none', stagger: 0.1,
        scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 52%', scrub: true }
      });
    });

    /* Telas dos projetos se endireitam ao subir */
    gsap.utils.toArray('[data-inclinar]').forEach(function (janela) {
      gsap.fromTo(janela, { rotationX: 26, scale: 0.84, y: 40 }, {
        rotationX: 0, scale: 1, y: 0, ease: 'none',
        scrollTrigger: { trigger: janela, start: 'top 96%', end: 'top 36%', scrub: 0.7 }
      });
    });

    gsap.utils.toArray('[data-paralaxe]').forEach(function (el) {
      var v = parseFloat(el.getAttribute('data-paralaxe')) || 10;
      gsap.fromTo(el, { yPercent: v }, {
        yPercent: -v, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    /* Trajetória: cada etapa acende quando chega ao meio da tela */
    gsap.utils.toArray('[data-linha-tempo] li').forEach(function (item) {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 62%',
        onEnter: function () { item.classList.add('passou'); },
        onLeaveBack: function () { item.classList.remove('passou'); }
      });
      gsap.fromTo(item, { '--enchido': 0 }, {
        '--enchido': 1, ease: 'none',
        scrollTrigger: { trigger: item, start: 'top 62%', end: 'bottom 62%', scrub: true }
      });
    });
  }

  /* ---------- Faixa de tecnologias ---------- */
  var trilho = document.querySelector('[data-faixa]');
  if (trilho) {
    trilho.innerHTML += trilho.innerHTML;
    if (comMovimento) {
      var x = 0, velocidade = 0, direcao = 1, metade = trilho.scrollWidth / 2, visivel = false;
      window.addEventListener('resize', adiar(function () { metade = trilho.scrollWidth / 2; }, 200));
      if (lenis) {
        lenis.on('scroll', function (l) {
          velocidade = l.velocity;
          if (l.direction) direcao = l.direction;
        });
      }
      ScrollTrigger.create({
        trigger: trilho, start: 'top bottom', end: 'bottom top',
        onToggle: function (self) { visivel = self.isActive; }
      });
      gsap.ticker.add(function (tempo, delta) {
        if (!visivel || !metade) return;
        var passo = (0.05 * delta + Math.min(Math.abs(velocidade), 70) * 0.4) * direcao;
        x -= passo;
        if (x <= -metade) x += metade;
        else if (x > 0) x -= metade;
        trilho.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
        velocidade *= 0.92;
      });
    }
  }

  /* ---------- Cursor sobre as telas e botões magnéticos ---------- */
  if (comMovimento && ponteiroFino) {
    var cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    var bolha = document.createElement('span');
    bolha.className = 'cursor-bolha';
    cursor.appendChild(bolha);
    body.appendChild(cursor);
    var cursorX = gsap.quickTo(cursor, 'x', { duration: 0.5, ease: 'power3' });
    var cursorY = gsap.quickTo(cursor, 'y', { duration: 0.5, ease: 'power3' });
    window.addEventListener('pointermove', function (e) { cursorX(e.clientX); cursorY(e.clientY); }, { passive: true });
    document.querySelectorAll('[data-cursor]').forEach(function (el) {
      el.addEventListener('pointerenter', function () {
        bolha.textContent = el.getAttribute('data-cursor');
        cursor.classList.add('ativo');
      });
      el.addEventListener('pointerleave', function () { cursor.classList.remove('ativo'); });
    });

    document.querySelectorAll('[data-magnetico]').forEach(function (el) {
      var mx = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'elastic.out(1, 0.45)' });
      var my = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'elastic.out(1, 0.45)' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.26);
        my((e.clientY - (r.top + r.height / 2)) * 0.36);
      });
      el.addEventListener('pointerleave', function () { mx(0); my(0); });
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
