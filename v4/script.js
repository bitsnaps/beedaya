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
    }
    
    // Close mobile menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('active');
            if (mobileMenu) mobileMenu.setAttribute('aria-expanded', 'false');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (nav.classList.contains('active') && 
            !nav.contains(e.target) && 
            e.target !== mobileMenu) {
            nav.classList.remove('active');
            if (mobileMenu) mobileMenu.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Header scroll effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Portfolio filtering with animation
    const filterButtons = document.querySelectorAll('.portfolio-filter button');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    // Initialize Isotope-like filtering
    if (portfolioItems.length > 0) {
        // Set initial state
        portfolioItems.forEach(item => {
            item.classList.add('show');
        });
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                
                // Apply filtering with animation
                portfolioItems.forEach(item => {
                    // First remove the show class from all items
                    item.classList.remove('show');
                    
                    // Add a small delay for animation effect
                    setTimeout(() => {
                        if (filter === 'all' || item.getAttribute('data-category') === filter) {
                            item.style.display = 'block';
                            // Add a small delay before showing the item
                            setTimeout(() => {
                                item.classList.add('show');
                            }, 50);
                        } else {
                            item.style.display = 'none';
                        }
                    }, 300);
                });
            });
        });
    }
    
    // Form submission with enhanced validation
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Add input event listeners for real-time validation
        const formInputs = contactForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', function() {
                validateInput(this);
            });
            
            input.addEventListener('blur', function() {
                validateInput(this, true);
            });
        });
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real implementation, you would send the form data to a server
            const formElements = contactForm.elements;
            let isValid = true;
            
            // Enhanced validation
            for (let i = 0; i < formElements.length; i++) {
                if (!validateInput(formElements[i], true)) {
                    isValid = false;
                }
            }
            
            if (isValid) {
                // Create and show success message
                const formContainer = contactForm.parentElement;
                const successMsg = document.createElement('div');
                successMsg.className = 'success-message';
                successMsg.innerHTML = '<i class="fas fa-check-circle"></i> Thank you for your message! We will get back to you soon.';
                
                // Replace form with success message
                formContainer.innerHTML = '';
                formContainer.appendChild(successMsg);
                
                // In a real implementation, you would send the form data to a server here
                // For example:
                // const formData = new FormData(contactForm);
                // fetch('your-endpoint', {
                //     method: 'POST',
                //     body: formData
                // });
            }
        });
        
        // Helper function for input validation
        function validateInput(input, showError = false) {
            let isValid = true;
            const errorElement = input.nextElementSibling?.classList.contains('error-message') 
                ? input.nextElementSibling 
                : null;
                
            // Remove existing error message
            if (errorElement) {
                errorElement.remove();
            }
            
            // Skip validation for non-required empty fields
            if (!input.hasAttribute('required') && !input.value) {
                input.classList.remove('error');
                return true;
            }
            
            // Required field validation
            if (input.hasAttribute('required') && !input.value) {
                isValid = false;
                if (showError) {
                    showErrorMessage(input, 'This field is required');
                }
            }
            
            // Email validation
            if (input.type === 'email' && input.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                    if (showError) {
                        showErrorMessage(input, 'Please enter a valid email address');
                    }
                }
            }
            
            // Phone validation (optional)
            if (input.type === 'tel' && input.value) {
                const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
                if (!phoneRegex.test(input.value)) {
                    isValid = false;
                    if (showError) {
                        showErrorMessage(input, 'Please enter a valid phone number');
                    }
                }
            }
            
            // Update input styling
            if (isValid) {
                input.classList.remove('error');
                if (input.value) input.classList.add('valid');
            } else {
                input.classList.add('error');
                input.classList.remove('valid');
            }
            
            return isValid;
        }
        
        // Helper function to show error messages
        function showErrorMessage(input, message) {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = message;
            input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add animation to elements when they come into view
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.service-card, .about-content, .portfolio-item, .testimonial-card');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('animate');
            }
        });
    };
    
    // Run animation check on load and scroll
    window.addEventListener('scroll', animateOnScroll);
    window.addEventListener('load', animateOnScroll);
    
    // Initialize current year in footer
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// Add CSS for animations if not already in stylesheet
const style = document.createElement('style');
style.textContent = `
    .portfolio-item {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.4s ease, transform 0.4s ease;
    }
    
    .portfolio-item.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .animate {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .error-message {
        color: #e74c3c;
        font-size: 0.85rem;
        margin-top: 5px;
    }
    
    input.error, textarea.error {
        border-color: #e74c3c;
    }
    
    input.valid, textarea.valid {
        border-color: #2ecc71;
    }
    
    .success-message {
        background-color: #d4edda;
        color: #155724;
        padding: 15px;
        border-radius: 4px;
        text-align: center;
        margin-top: 20px;
    }
    
    .success-message i {
        margin-right: 8px;
        color: #28a745;
    }
`;
document.head.appendChild(style);