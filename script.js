const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme in localStorage
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Save theme preference
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '☀️';
    } else {
        localStorage.removeItem('theme');
        themeToggle.textContent = '🌙';
    }
});

// Dynamic scroll padding for fixed header
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    const html = document.documentElement;

    const setScrollPadding = () => {
        html.style.scrollPaddingTop = `${nav.offsetHeight}px`;
    };

    // Set padding on load
    setScrollPadding();

    // Recalculate on window resize
    window.addEventListener('resize', setScrollPadding);

    // Also recalculate if images or other content load that might affect layout
    window.addEventListener('load', setScrollPadding);
});

// Hamburger menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mainNavList = document.getElementById('main-nav-list');

    if (hamburgerMenu && mainNavList) {
        hamburgerMenu.addEventListener('click', () => {
            mainNavList.classList.toggle('active');
        });
    }
});