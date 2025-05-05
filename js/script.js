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
    } // Removed closing brace here to encompass Go To Top and Form logic

    // Go to Top Button Logic
    const goToTopBtn = document.getElementById("goToTopBtn");

    if (goToTopBtn) { // Check if the button exists
        // Show button when scrolling down
        window.onscroll = function() {scrollFunction()};

        function scrollFunction() {
          // Check if goToTopBtn exists before trying to access its style
          if (!goToTopBtn) return; 
          if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            goToTopBtn.style.display = "block";
            goToTopBtn.style.opacity = "1";
          } else {
            goToTopBtn.style.opacity = "0";
            // Optional: Hide completely after fade out
            setTimeout(() => {
                // Check again inside timeout
                if (goToTopBtn && goToTopBtn.style.opacity === '0') { 
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
    } // End of Go To Top Button Logic

    // Close mobile menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        // Ensure the link is not part of the language switcher or dropdown
        if (!link.closest('.language-switcher') && !link.closest('.language-dropdown')) {
            link.addEventListener('click', function() {
                if (nav && nav.classList.contains('active')) { // Check if nav exists and is active
                   nav.classList.remove('active');
                   if (mobileMenu) mobileMenu.setAttribute('aria-expanded', 'false');
                }
            });
        }
    });

    // Contact Form Submission Handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = 'Sending...'; // Provide visual feedback

            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                message: document.getElementById('message').value
            };

            // Send data to the backend endpoint
            fetch('/contact', { // Matches the action attribute, but fetch needs explicit path
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
            .then(response => {
                if (!response.ok) {
                    // Try to get error message from backend response body
                    return response.json().then(err => { throw new Error(err.error || `HTTP error! status: ${response.status}`) });
                }
                return response.json(); // Parse JSON response from backend
            })
            .then(data => {
                console.log('Success:', data);
                // Display success message to the user (e.g., replace form or show alert)
                alert(data.message || 'Message sent successfully! Thank you for your message.'); 
                contactForm.reset(); // Clear the form
            })
            .catch((error) => {
                console.error('Error:', error);
                // Display error message to the user
                alert(`Failed to send message: ${error.message}. Please try again later.`);
            })
            .finally(() => {
                 // Re-enable button and restore text regardless of success/failure
                 submitButton.disabled = false;
                 submitButton.innerHTML = originalButtonText;
            });
        });
    }

}); // DOMContentLoaded
