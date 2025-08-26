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
  p.innerHTML = `2025 - Realizado por Ing. Jose Luis Elisseche - <a href="https://www.linkedin.com/in/jle1261/" target="_blank" rel="noopener noreferrer"><img src="https://content.linkedin.com/content/dam/me/business/en-us/amp/brand-site/v2/bg/LI-Bug.svg.original.svg" alt="LinkedIn" class="linkedin-icon"></a> - Agradecimiento especial a Jon Hernández / BIG school y todo su equipo de profesores.`;

  footer.appendChild(p);
  document.body.appendChild(footer);
});
