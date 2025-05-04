// BeeDaya Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const nav = document.querySelector('nav');
    
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function() {
            nav.classList.toggle('active');
            // Toggle aria-expanded for accessibility
            const expanded = nav.classList.contains('active');
            mobileMenu.setAttribute('aria-expanded', expanded);
        });

// Go to Top Button Logic
const goToTopBtn = document.getElementById("goToTopBtn");

// Show button when scrolling down
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    goToTopBtn.style.display = "block";
    goToTopBtn.style.opacity = "1";
  } else {
    goToTopBtn.style.opacity = "0";
    // Optional: Hide completely after fade out
    setTimeout(() => { 
        if (goToTopBtn.style.opacity === '0') { 
            goToTopBtn.style.display = "none"; 
        }
    }, 500); // Match CSS transition duration
  }
}

// Scroll to top when button is clicked
goToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
    }
    
    // Close mobile menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('active');
            if (mobileMenu) mobileMenu.setAttribute('aria-expanded', 'false');
        });
    });
});