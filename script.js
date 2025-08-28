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

  // Al hacer click en el botón alternar
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = body.classList.toggle('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      themeToggle.textContent = isDark ? '☀️' : '🌙';
    
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
  
  // === Footer ===
  const footer = document.createElement('footer');
  footer.className = 'site-footer';

  const p = document.createElement('p');
  p.innerHTML = '2025 - Realizado por Ing. Jose Luis Elisseche (InoTech) - ';

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



// Refuerzo: captura en fase 'capture' para no perder el click si hay overlays transparentes.
window.addEventListener('click', function(e){
  var btn = e.target.closest && e.target.closest('.download-txt');
  if(!btn) return;
  // Si algún overlay intercepta, evitamos propagación temprana
  e.stopPropagation();
}, true);




// Si el botón trae data-target, usar ese selector para obtener el <pre><code> objetivo
(function(){
  function getTargetText(btn){
    var sel = btn.getAttribute('data-target');
    if(!sel) return '';
    try{
      var node = document.querySelector(sel);
      if(!node) return '';
      var code = node.querySelector && node.querySelector('code');
      return code ? (code.innerText || code.textContent || '') : (node.innerText || node.textContent || '');
    }catch(e){
      return '';
    }
  }
  window.addEventListener('click', function(e){
    var btn = e.target.closest && e.target.closest('.download-txt');
    if(!btn) return;
    // Si hay data-target, úsalo; si no, caé al mecanismo existente del archivo
    var content = getTargetText(btn);
    if(content){
      e.preventDefault();
      var blob = new Blob([content], { type: 'text/plain' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = btn.dataset.filename || 'prompt.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  }, true); // capture temprano para evitar overlays
})();

