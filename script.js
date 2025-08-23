        const themeToggle = document.getElementById('theme-toggle');
        const body = document.body;

        // Check for saved theme in localStorage
        if (localStorage.getItem('theme') === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.textContent = 'Modo Claro';
        }

        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            
            // Save theme preference
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                themeToggle.textContent = 'Modo Claro';
            } else {
                localStorage.removeItem('theme');
                themeToggle.textContent = 'Modo Oscuro';
            }
        });
