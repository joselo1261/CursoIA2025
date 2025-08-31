// ======= script_ML.js — v16 =======
// Objetivos:
// - Construir/usar el sidebar ML.
// - Al hacer scroll con el navegador, el sidebar acompaña proporcionalmente y marca la tarjeta activa.
// - Al hacer click en una tarjeta, la alinea ARRIBA del sidebar y hace scroll al título con offset de header.

(function(){
  const main    = document.getElementById('ml-main') || document.querySelector('main');
  const sidebar = document.getElementById('ml-sidebar');
  const nav     = document.getElementById('ml-nav');
  if(!main || !sidebar || !nav) return;

  // Layout ancho (se mantiene tu CSS)
  document.body.classList.add('ml-wide');

  // ===== Utilidades
  const clamp = (n,a,b) => Math.max(a, Math.min(b,n));

  function headerOffset(){
    const header = document.querySelector('header') || document.querySelector('.site-header') || document.querySelector('.menu');
    const h = header ? header.getBoundingClientRect().height : 0;
    const total = Math.max(64, h + 4);
    document.documentElement.style.setProperty('--ml-sticky-offset', total + 'px');
    return total;
  }

  function slugify(str){
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  }

  // ===== Anclas del contenido
  function collectAnchors(){
    const h2 = Array.from(main.querySelectorAll('h2, section > h2, .card h2')).filter(h => h.textContent.trim());
    const list = h2.length ? h2 : Array.from(main.querySelectorAll('h3'));
    const used = new Set();
    list.forEach(h => {
      if(!h.id){
        let base = slugify(h.textContent.trim()); let id = base, i=2;
        while(used.has(id) || document.getElementById(id)){ id = base + '-' + (i++); }
        used.add(id); h.id = id;
      }
      h.setAttribute('data-ml-anchor', '');
    });
    return list;
  }

  let anchors = collectAnchors();

  // ===== Crear tarjetas si hace falta
  function buildNav(){
    if(nav.children.length > 0) return;
    anchors.forEach(h => {
      const a = document.createElement('a');
      a.href = '#'+h.id;
      a.className = 'ml-card';
      a.innerHTML = '<div class="ml-title-txt" style="font-weight:700;line-height:1.25;font-size:.95rem;">' + h.textContent.trim() + '</div>';
      a.addEventListener('click', (ev)=>{
        ev.preventDefault();
        const idx = anchors.indexOf(h);
        setActiveIndex(idx);
        alignCardTop(idx);
        scrollToAnchor(h.id);
      });
      nav.appendChild(a);
    });
  }

  buildNav();

  let cards = Array.from(nav.querySelectorAll('a.ml-card'));

  // ===== Estado activo + helpers de scroll lateral
  function setActiveIndex(idx){
    cards.forEach((c,i)=>{
      const active = i === idx;
      c.classList.toggle('ml-active', active);
      if(active) c.setAttribute('aria-current','true'); else c.removeAttribute('aria-current');
    });
  }

  function alignCardTop(idx, behavior='smooth'){
    const card = cards[idx]; if(!card) return;
    const pad = 8;
    const target = Math.max(0, card.offsetTop - pad);
    // Evitar pelea con sincronización
    syncing = true;
    sidebar.scrollTo({ top: target, behavior });
    // liberar el flag tras la animación
    setTimeout(()=>{ syncing = false; }, 250);
  }

  function ensureCardVisible(idx){
    const card = cards[idx]; if(!card) return;
    const pad = 8;
    const cr = card.getBoundingClientRect();
    const sr = sidebar.getBoundingClientRect();
    if(cr.top < sr.top + pad){
      sidebar.scrollTop += (cr.top - sr.top) - pad;
    }else if(cr.bottom > sr.bottom - pad){
      sidebar.scrollTop += (cr.bottom - sr.bottom) + pad;
    }
  }

  // ===== Scroll al título con compensación por header sticky
  function scrollToAnchor(id){
    const el = document.getElementById(id); if(!el) return;
    const off = headerOffset();
    const y = el.getBoundingClientRect().top + window.pageYOffset - off;
    window.scrollTo({ top: y, behavior:'smooth' });
    history.replaceState(null,'','#'+id);
  }

  // ===== Sincronización proporcional sidebar <-> scroll del documento
  let syncing = false;
  let rafPending = false;
  let lastSideUserScroll = 0;

  function onSideUserScroll(){ lastSideUserScroll = Date.now(); }
  sidebar.addEventListener('scroll', onSideUserScroll, {passive:true});
  sidebar.addEventListener('wheel',  onSideUserScroll, {passive:true});
  sidebar.addEventListener('touchmove', onSideUserScroll, {passive:true});

  function syncSidebar(){
    if(!sidebar) return;
    // Si el usuario tocó el sidebar hace muy poco, no lo pisamos
    if(Date.now() - lastSideUserScroll < 150) return;
    const doc = document.documentElement;
    const maxMain = Math.max(1, doc.scrollHeight - window.innerHeight);
    const maxSide = Math.max(0, sidebar.scrollHeight - sidebar.clientHeight);
    const progress = clamp(window.scrollY / maxMain, 0, 1);
    const target = progress * maxSide;
    syncing = true;
    sidebar.scrollTop = target;
    syncing = false;
  }

  function recomputePositions(){
    anchors = collectAnchors();
    cards = Array.from(nav.querySelectorAll('a.ml-card'));
  }

  // ===== Elegir índice activo según el scroll del documento
  function activeIndexFromScroll(){
    const y = window.pageYOffset + headerOffset() + 1;
    let idx = 0;
    for(let i=0;i<anchors.length;i++){
      const top = anchors[i].getBoundingClientRect().top + window.pageYOffset;
      if(top <= y) idx = i; else break;
    }
    return idx;
  }

  function onWinScroll(){
    if(rafPending) return;
    rafPending = true;
    requestAnimationFrame(()=>{
      rafPending = false;
      // 1) Marcar activo según la posición actual del documento
      const idx = activeIndexFromScroll();
      setActiveIndex(idx);
      // 2) Si no hay interacción del usuario con el sidebar, sincronizar proporcionalmente
      syncSidebar();
      // 3) Asegurar visibilidad mínima de la tarjeta activa (por si quedó fuera)
      if(!syncing) ensureCardVisible(idx);
    });
  }

  window.addEventListener('scroll', onWinScroll, {passive:true});
  window.addEventListener('resize', ()=>{ headerOffset(); recomputePositions(); onWinScroll(); });

  // ===== Inicial
  headerOffset();
  onWinScroll();

  // Si la URL tiene hash al entrar
  if(location.hash){
    const id = location.hash.slice(1);
    const i = anchors.findIndex(h => h.id === id);
    if(i>=0){
      setActiveIndex(i);
      alignCardTop(i, 'auto');
      // coloca el documento también en el sitio exacto
      setTimeout(()=>scrollToAnchor(id), 10);
    }
  }else{
    setActiveIndex(0);
    alignCardTop(0, 'auto');
  }

})();


/* ML-SEARCH-FIX START */
/**
 * Buscador unificado para módulos ML
 * - Busca desde el inicio y salta al primer resultado
 * - Funciona con #ml-main o #module-container
 * - No interfiere con otros módulos
 */
(function(){
  if (document.getElementById('module-search-script')) { return; }

  const input = document.getElementById('module-search');
  const clearBtn = document.getElementById('module-clear');
  const stats = document.getElementById('module-stats');
  if(!input || !stats) return;

  const scope = document.body;
  if(!scope) return;

  // calcular offset para que el título/resultado no quede tapado por header y buscador
  function getOffset(){
    const header = document.querySelector('nav') || document.querySelector('header');
    const searchbar = document.getElementById('module-searchbar');
    const h1 = header ? header.getBoundingClientRect().height : 0;
    const h2 = searchbar ? searchbar.getBoundingClientRect().height : 0;
    return Math.max(0, Math.round(h1 + h2 + 8));
  }

  // limpiar marcas existentes
  function clearMarks(){
    scope.querySelectorAll('mark[data-ml-hit]').forEach(m => {
      const parent = m.parentNode;
      while(m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m);
      parent.normalize && parent.normalize();
    });
    scope.querySelectorAll('.ml-hit').forEach(n => n.classList.remove('ml-hit'));
  }

  // buscar y resaltar primer match
  function doSearch(q){
    clearMarks();
    if(!q || q.trim().length < 2){
      stats.textContent = "";
      return;
    }
    const needle = q.trim();
    // estrategia: recorrer nodos de texto dentro del scope
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const t = node.nodeValue;
        if(!t) return NodeFilter.FILTER_REJECT;
        // evitar scripts/estilos ocultos
        if(!node.parentElement) return NodeFilter.FILTER_REJECT;
        const tag = node.parentElement.tagName;
        if(['SCRIPT','STYLE','NOSCRIPT','CODE','PRE'].includes(tag)) return NodeFilter.FILTER_SKIP;
        return t.toLowerCase().includes(needle.toLowerCase()) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    let firstHit = null, count = 0;
    const hits = [];
    while(walker.nextNode()){
      const node = walker.currentNode;
      const idx = node.nodeValue.toLowerCase().indexOf(needle.toLowerCase());
      if(idx >= 0){
        count++;
        // wrap first occurrence in this text node
        const range = document.createRange();
        range.setStart(node, idx);
        range.setEnd(node, idx + needle.length);
        const mark = document.createElement('mark');
        mark.setAttribute('data-ml-hit','');
        try { range.surroundContents(mark); } catch(e){ /* edge cases: skip */ }
        if(!firstHit) firstHit = mark;
        hits.push(mark);
      }
    }
    if(count === 0){
      stats.textContent = "Sin resultados.";
      return;
    }
    stats.textContent = `Mostrando 1 de ${count} coincidencia(s)`;

    // Destacar el contenedor cercano (h2/h3/section)
    let focus = firstHit;
    const container = firstHit.closest('h1,h2,h3,section,.module,.card') || firstHit;
    container.classList.add('ml-hit');

    // Si el hit está en el sidebar, alinear esa tarjeta y (si tiene href) saltar a su sección
    const sidebar = document.getElementById('ml-sidebar');
    if (sidebar && sidebar.contains(firstHit)) {
      // Alinear la tarjeta del sidebar
      const card = firstHit.closest('a.ml-card') || firstHit.closest('a');
      if (card) {
        // asegurar visibilidad en el sidebar
        const cr = card.getBoundingClientRect();
        const sr = sidebar.getBoundingClientRect();
        if (cr.top < sr.top + 8 || cr.bottom > sr.bottom - 8) {
          sidebar.scrollTo({ top: sidebar.scrollTop + (cr.top - sr.top) - 8, behavior: 'smooth' });
        }
        // si apunta a una sección del contenido, ir también allí
        const href = card.getAttribute('href') || '';
        if (href.startsWith('#')) {
          const target = document.getElementById(href.slice(1));
          if (target) {
            const off2 = getOffset();
            const r2 = target.getBoundingClientRect();
            const y2 = window.scrollY + r2.top - off2;
            window.scrollTo({ top: y2, behavior: 'smooth' });
            stats.textContent = `Mostrando 1 de ${count} coincidencia(s)`;
            return; // ya hicimos el scroll principal
          }
        }
      }
    }

    // Scroll con offset al contenedor del resultado
    const off = getOffset();
    const rect = container.getBoundingClientRect();
    const y = window.scrollY + rect.top - off;
    window.scrollTo({ top: y, behavior: 'smooth' });

    // asegurar focus visible
    setTimeout(()=>{ firstHit.scrollIntoView({block:'center', inline:'nearest'}); }, 300);
  }

  input.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){ doSearch(input.value); }
  });
  if(clearBtn){
    clearBtn.addEventListener('click', ()=>{
      input.value = "";
      stats.textContent = "";
      clearMarks();
      input.focus();
    });
  }
})();
/* ML-SEARCH-FIX END */

/* Herramientas: Buscador de tarjetas */
if (location.pathname.includes("herramientas")) {
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('module-search');
    const clearBtn = document.getElementById('module-clear');
    const stats = document.getElementById('module-stats');
    const container = document.getElementById('tools-container') || document;
    const cards = Array.from(container.querySelectorAll('li.tool-card'));
    const sections = Array.from(container.querySelectorAll('section[id^="tools-"], div[id^="tools-"]'));

    if (!input || !clearBtn || !stats || cards.length === 0) return;

    const total = cards.length;
    const strip = s => (s||'').normalize('NFD').replace(/[̀-ͯ]/g,'');

    function buildMap(s){ const map=[]; const norm=[]; let i=0; for (const ch of s){ const st=strip(ch); norm.push(st); for(let k=0;k<st.length;k++) map.push(i); i+=ch.length; } return { norm:norm.join(''), map }; }
    function hi(el,q){ if(!el) return; if(!el.dataset.orig) el.dataset.orig = el.textContent; const orig=el.dataset.orig; if(!q){ el.innerHTML=orig; return; }
      const {norm,map}=buildMap(orig); const qn=strip(q).toLowerCase(); let from=0,out='',last=0;
      while(true){ const idx=norm.toLowerCase().indexOf(qn,from); if(idx===-1) break; const start=map[idx]; const end=(idx+qn.length<map.length)?map[idx+qn.length]:orig.length;
        out += orig.slice(last,start) + '<mark>' + orig.slice(start,end) + '</mark>'; last=end; from=idx+qn.length; } out+=orig.slice(last); el.innerHTML=out; }

    function scrollToFirstMatch(){ const first = document.querySelector('li.tool-card mark'); if(first){ first.scrollIntoView({behavior:'smooth', block:'start'}); const cs = getComputedStyle(document.documentElement); const navH = parseInt(cs.getPropertyValue('--nav-h'))||0; const sbH = parseInt(cs.getPropertyValue('--searchbar-h'))||0; window.scrollBy({ top: -(navH + sbH + 8), left: 0, behavior: 'smooth' }); } }

    function apply(scroll){
      const q = input.value.trim();
      let visible = 0;
      cards.forEach(li => {
        const name = li.querySelector('a'); const desc = li.querySelector('p');
        const hay = strip((name&&name.textContent)+' '+(desc&&desc.textContent)).toLowerCase();
        const ok = !q || hay.includes(strip(q).toLowerCase());
        li.style.display = ok ? '' : 'none';
        hi(name, ok ? q : ''); hi(desc, ok ? q : '');
        if (ok) visible++;
      });
      sections.forEach(sec => {
        const any = Array.from(sec.querySelectorAll('li.tool-card')).some(li => li.style.display !== 'none');
        sec.style.display = any ? '' : 'none';
      });
      stats.textContent = `Mostrando ${visible} de ${total} herramientas`;
      if (scroll && q) scrollToFirstMatch();
    }

    input.addEventListener('input', () => apply(true));
    clearBtn.addEventListener('click', () => { input.value=''; input.focus(); apply(true); });
    apply(false);
  });
}