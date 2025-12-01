(function () {
    'use strict';

    // Seletores e constantes
    const header = document.querySelector('.site-header');
    const links = document.querySelectorAll('.nav-link');
    const SCROLL_CLASS = 'scrolled';
    const SCROLL_THRESHOLD = 8; // quantos px de scroll antes de aplicar a classe

    // Marca "Home" por padrão no carregamento: tenta encontrar link com data-nav="home" ou href="/"
    function setDefaultActive() {
        if (!links || links.length === 0) return;
        // busca prioridade: data-nav="home" -> aria-default -> href="/" -> primeiro link
        let home = document.querySelector('.nav-link[data-nav="home"]')
                || Array.from(links).find(l => l.getAttribute('href') === '/' || l.getAttribute('href') === './' )
                || links[0];

        // limpa e marca
        clearActive();
        if (home) {
            home.classList.add('active');
            home.setAttribute('aria-current', 'true');
        }
    }

    // Remove estado 'active' de todos os links (visual + aria)
    function clearActive() {
        links.forEach(l => {
            l.classList.remove('active');
            l.removeAttribute('aria-current');
        });
    }

    // Adiciona handlers de clique e teclado para cada link
    if (links && links.length) {
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                // Se você quiser navegação real via href, remova a linha abaixo:
                e.preventDefault();

                clearActive();
                link.classList.add('active');
                link.setAttribute('aria-current', 'true');

                // Exemplo: se quiser rolar para uma seção, faça aqui (opcional)
                // const targetId = link.getAttribute('href');
                // if (targetId && targetId.startsWith('#')) {
                //   document.querySelector(targetId)?.scrollIntoView({ behavior: 'smooth' });
                // }
            });

            // Suporta ativação por teclado: Enter e Espaço
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
        });
    }

    // ------- Gerenciamento da variável CSS --site-header-height -------
    function updateHeaderHeightVar() {
        if (!header) return;
        const h = header.offsetHeight;
        document.documentElement.style.setProperty('--site-header-height', `${h}px`);
        // também atualiza o padding-top do main para redundância (caso não use a variável)
        const main = document.querySelector('main');
        if (main) main.style.paddingTop = `${h}px`;
    }

    // Observador de resize preferencialmente com ResizeObserver
    function initResizeObserver() {
        if (!header) return;
        if ('ResizeObserver' in window) {
            const ro = new ResizeObserver(() => updateHeaderHeightVar());
            ro.observe(header);
        } else {
            // fallback simples
            window.addEventListener('resize', updateHeaderHeightVar, { passive: true });
        }
        // atualiza já no load
        updateHeaderHeightVar();
    }

    // ------- Controle da classe de scroll (aplica efeitos visuais) -------
    function onScroll() {
        if (!header) return;
        if (window.scrollY > SCROLL_THRESHOLD) {
            header.classList.add(SCROLL_CLASS);
        } else {
            header.classList.remove(SCROLL_CLASS);
        }
    }

    // inicia scroll listener
    function initScrollWatcher() {
        // aplica o estado inicial (caso a página seja carregada já scrolled)
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // inicialização
    function init() {
        setDefaultActive();
        initResizeObserver();
        initScrollWatcher();
    }

    // esperar DOM pronto (script com defer já garante, mas double-safe)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
