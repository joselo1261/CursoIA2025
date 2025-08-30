document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');

  // Estado inicial del tema
  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    if (themeToggle) themeToggle.textContent = '☀️';
  } else {
    if (themeToggle) themeToggle.textContent = '🌙';
  }

  /* set current nav item and Contenido highlight for modules */
  try {
    const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const nav = document.querySelector('nav');
    if (nav) {
      // Marcar link actual por coincidencia directa
      const currentLink = nav.querySelector(`a[href="${current}"]`);
      if (currentLink) {
        currentLink.classList.add('current');
        currentLink.setAttribute('aria-current', 'page');
      }
      // Si es una página de módulo, resaltar 'Contenido' (dropdown)
      if (current.startsWith('modulo')) {
        const dd = nav.querySelector('li.dropdown');
        if (dd) dd.classList.add('is-current');
      }
    }
  } catch(e) { /* noop */ }

// Al hacer click en el botón alternar
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = body.classList.toggle('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      themeToggle.textContent = isDark ? '☀️' : '🌙';
    
  

});
  }

  // === Menú hamburguesa ===
  const hamburger = document.querySelector('.hamburger-menu');
  const navList   = document.getElementById('main-nav-list');
  if (hamburger && navList) {
    hamburger.addEventListener('click', () => {
      navList.classList.toggle('active');
    });
  }

  // === Dropdowns ===
  // Auto-fit & auto-scroll for long dropdowns
  (function(){
    const EDGE = 24;   // px from top/bottom to start autoscroll
    const SPEED = 16;  // px/frame
    function enhance(dd){
      const menu = dd.querySelector('.dropdown-menu');
      if (!menu) return;
      // compute available height from bottom of toggle to viewport
      const rect = menu.getBoundingClientRect();
      const top = rect.top;
      const avail = Math.max(240, window.innerHeight - top - 12);
      menu.style.maxHeight = avail + 'px';
      menu.style.overflowY = 'auto';
      menu.style.webkitOverflowScrolling = 'touch';
      // autoscroll by mouse position
      if (menu.dataset._enhanced === '1') return;
      menu.dataset._enhanced = '1';
      let dir = 0, raf = 0;
      function step(){ if (!dir) { raf = 0; return; } menu.scrollTop += dir; raf = requestAnimationFrame(step); }
      menu.addEventListener('mousemove', (e)=>{
        const r = menu.getBoundingClientRect();
        const y = e.clientY - r.top;
        dir = y < EDGE ? -SPEED : (y > r.height - EDGE ? SPEED : 0);
        if (dir && !raf) raf = requestAnimationFrame(step);
      });
      ['mouseleave','blur','mouseout'].forEach(ev => menu.addEventListener(ev, ()=>{ dir = 0; }));
      // wheel support
      menu.addEventListener('wheel', (e)=>{ 
        // prevent page from scrolling when wheel on menu
        if (menu.scrollHeight > menu.clientHeight) { 
          e.preventDefault(); 
          menu.scrollTop += e.deltaY; 
        }
      }, { passive:false });
    }
    // when opening a dropdown, enhance it
    document.querySelectorAll('li.dropdown').forEach((dd)=>{
      const toggle = dd.querySelector('.dropbtn, .dropdown-toggle, a');
      if (!toggle) return;
      toggle.addEventListener('click', ()=>{ setTimeout(()=>{ enhance(dd); }, 0); });
      toggle.addEventListener('mouseover', ()=>{ setTimeout(()=>{ enhance(dd); }, 0); });
      dd.addEventListener('mouseenter', ()=>{ enhance(dd); });
    });
    window.addEventListener('resize', ()=>{
      document.querySelectorAll('li.dropdown.open').forEach((dd)=>{
        const m = dd.querySelector('.dropdown-menu');
        if (m) { const r = m.getBoundingClientRect(); const avail = Math.max(240, window.innerHeight - r.top - 12); m.style.maxHeight = avail + 'px'; }
      });
    });
  })();

  document.querySelectorAll('li.dropdown').forEach((dd) => {
    const toggle = dd.querySelector('.dropbtn, .dropdown-toggle, a');
    if (!toggle) return;
    toggle.addEventListener('click', (e) => {
      const href = toggle.getAttribute('href') || '';
      if (href && href.startsWith('#')) return; // si es ancla, dejar pasar
      e.preventDefault();
      const wasOpen = dd.classList.contains('open');
      document.querySelectorAll('li.dropdown.open').forEach(d => d.classList.remove('open'));
      if (!wasOpen) dd.classList.add('open');
      toggle.setAttribute('aria-expanded', String(!wasOpen));
    });
  });

  // Cerrar dropdowns al hacer click afuera
  document.addEventListener('click', (e) => {
    const openEl = document.querySelector('li.dropdown.open');
    if (openEl && !openEl.contains(e.target)) {
      openEl.classList.remove('open');
    }
  });

  // Asegurar navegación normal para links de nav
  document.querySelectorAll('nav a').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '';
      if (!href) return;
      if (href.startsWith('#')) return; // dejar que los anclajes funcionen
      if (href.endsWith('.html') && !a.classList.contains('dropdown-toggle')) {
        e.stopPropagation();
        window.location.href = href;
      }
    });
  });
  
  
  // Cerrar dropdown al elegir una opción (y no esperar al mouseleave)
  document.querySelectorAll('li.dropdown .dropdown-menu a').forEach((a) => {
    a.addEventListener('click', () => {
      const dd = a.closest('li.dropdown');
      if (!dd) return;
      dd.classList.remove('open');
      dd.classList.add('closing'); // fuerza ocultar incluso si sigue el hover
      const t = dd.querySelector('.dropbtn, .dropdown-toggle, a');
      if (t) t.setAttribute('aria-expanded','false');
      // quitar 'closing' al salir con el mouse, o después de un fallback
      const onLeave = () => { dd.classList.remove('closing'); dd.removeEventListener('mouseleave', onLeave); };
      dd.addEventListener('mouseleave', onLeave, { once: true });
      setTimeout(() => { dd.classList.remove('closing'); }, 1200);
    });
  });


// === Smooth scroll to anchors with sticky header offset ===
(function(){
  const nav = document.querySelector('nav');
  const getOffset = () => {
    if (!nav) return 0;
    const r = nav.getBoundingClientRect();
    // Sumamos un margen extra por estética
    return Math.max(0, r.height + 12);
  };
  function smoothScrollTo(target){
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - getOffset();
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  // Interceptar clics en anchors internos
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href === '#' ) return;
    a.addEventListener('click', (e)=>{
      const id = href;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      smoothScrollTo(el);
      // Actualizar hash sin salto
      history.replaceState(null, '', id);
      // Si venimos de un dropdown, cerrarlo
      const dd = a.closest('li.dropdown');
      if (dd) {
        dd.classList.remove('open');
        dd.classList.add('closing');
        const t = dd.querySelector('.dropdown-toggle, .dropbtn, a');
        if (t) t.setAttribute('aria-expanded','false');
        setTimeout(()=> dd.classList.remove('closing'), 800);
      }
    });
  });
})();

// === Keyboard accessibility for dropdown ===
(function(){
  document.querySelectorAll('li.dropdown').forEach(dd => {
    const toggle = dd.querySelector('.dropdown-toggle, .dropbtn, a');
    const items = Array.from(dd.querySelectorAll('.dropdown-menu a'));
    if (!toggle || items.length === 0) return;

    // Toggle keys
    toggle.addEventListener('keydown', (e)=>{
      const key = e.key;
      if (key === 'Enter' || key === ' ') {
        e.preventDefault();
        dd.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(dd.classList.contains('open')));
        if (dd.classList.contains('open')) items[0].focus();
      } else if (key === 'ArrowDown') {
        e.preventDefault();
        dd.classList.add('open');
        toggle.setAttribute('aria-expanded','true');
        items[0].focus();
      } else if (key === 'Escape') {
        dd.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
      }
    });

    // Item keys
    items.forEach((link, idx) => {
      link.setAttribute('tabindex','0');
      link.addEventListener('keydown', (e)=>{
        if (e.key === 'Escape') {
          dd.classList.remove('open');
          toggle.setAttribute('aria-expanded','false');
          toggle.focus();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = items[(idx+1) % items.length];
          next.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = items[(idx-1+items.length) % items.length];
          prev.focus();
        }
      });
    });
  });
})();

// === Active section highlight inside dropdown while scrolling ===
(function(){
  // For each dropdown that contains anchors to in-page sections, track active link on scroll
  const dropdowns = Array.from(document.querySelectorAll('li.dropdown'))
    .map(dd => ({
      dd,
      links: Array.from(dd.querySelectorAll('.dropdown-menu a[href^="#"]'))
    }))
    .filter(x => x.links.length > 0);

  if (dropdowns.length === 0) return;

  const nav = document.querySelector('nav');
  const headerOffset = nav ? (nav.getBoundingClientRect().height + 18) : 60;

  function computeActive(){
    const y = window.scrollY + headerOffset + 2;
    dropdowns.forEach(({dd, links}) => {
      let best = null; let bestTop = -Infinity;
      links.forEach(a => {
        const id = a.getAttribute('href');
        const el = document.querySelector(id);
        if (!el) return;
        const top = el.offsetTop;
        if (top <= y && top > bestTop) { bestTop = top; best = a; }
      });
      links.forEach(l => l.classList.toggle('active', l === best));
    });
  }

  // Run now and on scroll/resize (throttled with requestAnimationFrame)
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { computeActive(); ticking = false; });
  };
  ['scroll','resize','DOMContentLoaded'].forEach(ev => document.addEventListener(ev, onScroll, { passive: true }));
  computeActive();
})();

// === Ensure rel=noopener on target=_blank links ===

(function(){
  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    const rel = (a.getAttribute('rel') || '').toLowerCase();
    if (!rel.includes('noopener')) {
      a.setAttribute('rel', (rel ? rel + ' ' : '') + 'noopener noreferrer');
    }
  });
})();

// === Footer ===
  const footer = document.createElement('footer');
  footer.className = 'site-footer';

  const p = document.createElement('p');
  p.innerHTML = '2025 - Realizado por Ing. Jose Luis Elisseche - ';

  
  // Logo InoTech al inicio del footer
  const logoIno = document.createElement('img');
  logoIno.src = 'InoTech.png';
  logoIno.alt = 'InoTech';
  logoIno.className = 'footer-logo';
  p.prepend(logoIno);
// Enlace LinkedIn justo después del nombre
  const a = document.createElement('a');
  a.href = 'https://www.linkedin.com/in/jle1261/';
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.title = 'LinkedIn de Jose Luis Elisseche';
  a.setAttribute('aria-label', 'LinkedIn de Jose Luis Elisseche');
  a.innerHTML = '<svg class="linkedin-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.6c0-1.33-.03-3.05-1.86-3.05-1.86 0-2.15 1.45-2.15 2.95v5.7H9.32V9.75h3.42v1.46h.05c.48-.9 1.65-1.86 3.4-1.86 3.64 0 4.31 2.4 4.31 5.5v5.6ZM5.34 8.29a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9.75h3.56v10.7ZM22 2H2C.9 2 0 2.9 0 4v16c0 1.1.9 2 2 2h20a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/></svg>';
  p.appendChild(a);

  // Texto de agradecimiento después
  const span = document.createElement('span');
  span.textContent = ' - Agradecimiento especial a Jon Hernández / BIG school y todo su equipo de profesores.';
  p.appendChild(span);

  footer.appendChild(p);
  document.body.appendChild(footer);
});

// Descarga el contenido del <pre><code> anterior al botón.
// Uso: <button class="download-txt" data-filename="Nombre.txt">Descargar</button>
(function(){
  function findPrevCode(el){
    var p = el.previousElementSibling;
    while(p){
      if (p.tagName && p.tagName.toLowerCase() === 'pre'){
        var code = p.querySelector('code');
        if (code) return code.innerText || code.textContent || '';
      }
      p = p.previousElementSibling;
    }
    return '';
  }
  window.addEventListener('click', function(e){
    var btn = e.target.closest && e.target.closest('.download-txt');
    if(!btn) return;
    e.preventDefault();
    var content = findPrevCode(btn);
    var blob = new Blob([content], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = btn.dataset.filename || 'prompt.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
})();


// ===== Offsets globales para sticky (nav + buscador) =====
(function(){
  function updateOffsets(){
    var navEl = document.querySelector('nav');
    var sb = document.getElementById('module-searchbar');
    var navH = navEl ? navEl.offsetHeight : 0;
    var sbH  = sb ? sb.offsetHeight : 0;
    document.documentElement.style.setProperty('--nav-h', navH + 'px');
    document.documentElement.style.setProperty('--searchbar-h', sbH + 'px');
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', updateOffsets);
  }else{
    updateOffsets();
  }
  window.addEventListener('resize', updateOffsets);
})();
