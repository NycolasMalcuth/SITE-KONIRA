// static/js/gsap-animations.js
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    // segurança: GSAP + ScrollTrigger
    if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
      console.warn('GSAP ou ScrollTrigger não carregado. Animação do ponteiro ignorada.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const pointer = document.getElementById('pointer');
    const section = document.getElementById('bloco-5');
    if (!pointer || !section) return;

    // reduced-motion -> estado final sem animação
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(pointer, { xPercent: 0, opacity: 1, clearProps: 'all' });
      return;
    }

    let pointerTween = null;
    let bobbingTween = null;

    function killTweens() {
      if (pointerTween) {
        try { pointerTween.scrollTrigger && pointerTween.scrollTrigger.kill(); } catch(e) {}
        try { pointerTween.kill(); } catch(e) {}
        pointerTween = null;
      }
      if (bobbingTween) {
        try { bobbingTween.kill(); } catch(e) {}
        bobbingTween = null;
      }
    }

    function pointerVisibleByCSS() {
      const cs = getComputedStyle(pointer);
      return cs.display !== 'none' && cs.visibility !== 'hidden';
    }

    function init() {
      killTweens();

      // se mobile ou oculto: garante estado e sai
      if (window.innerWidth <= 520 || !pointerVisibleByCSS()) {
        gsap.set(pointer, { clearProps: 'all', display: 'none', opacity: 0 });
        return;
      }

      // inicial: deslocado para a direita por xPercent (transform-only)
      // xPercent = 120 significa "120% da largura do elemento para a direita"
      gsap.set(pointer, { xPercent: 120, opacity: 0, clearProps: 'display' });

      // tween de entrada sincronizado ao scroll
      pointerTween = gsap.to(pointer, {
        xPercent: 0,
        opacity: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',    // quando o topo do bloco entra na viewport
          end: 'center center',// animação completa quando bloco estiver centralizado
          scrub: 0.6,
          invalidateOnRefresh: true,
          //markers: true // habilite para debug
        }
      });

      // bobbing sutil (após entrada, mas não bloqueante)
      bobbingTween = gsap.to(pointer, {
        y: '+=-8',
        duration: 1.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1.0
      });
    }

    // inicializa após um frame para garantir bounding rect corretos
    requestAnimationFrame(() => {
      init();
    });

    // resize: debounce e reinit
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        // se mobile, esconde
        if (window.innerWidth <= 520) {
          killTweens();
          gsap.set(pointer, { clearProps: 'all', display: 'none' });
          if (window.ScrollTrigger && ScrollTrigger.refresh) ScrollTrigger.refresh();
          return;
        }
        init();
        if (window.ScrollTrigger && ScrollTrigger.refresh) ScrollTrigger.refresh();
      }, 140);
    });

    // função pública para re-inicializar quando conteúdo for injetado dinamicamente
    window.__reinitBloco5Pointer = function () {
      init();
      if (window.ScrollTrigger && ScrollTrigger.refresh) ScrollTrigger.refresh();
    };
  });
})();
