
function applyNavBar() {
    // mobile-navbar aktivieren
    const hamburger = document.querySelector(".hamburger");
    const navBar = document.querySelector(".nav-bar");
    const body = document.body;

    if (hamburger && navBar) {
        hamburger.addEventListener('click', function () {
            navBar.classList.toggle('active');
            body.classList.toggle('nav-open');
        });
    }

    // Aktiven Link hervorheben in Navbar
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-bar ul li a');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', applyNavBar)












// Filter Buttons
// --- Unternehmensname ---
    // Suche nach GLN

