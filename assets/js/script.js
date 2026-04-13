// script.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });

    // 2. Handle Loader
    const loadingScreen = document.getElementById("loading");
    setTimeout(() => {
        loadingScreen.style.opacity = "0";
        setTimeout(() => {
            loadingScreen.style.display = "none";
        }, 1000);
    }, 1500);

    // 3. Guest Name via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const guestNameParam = urlParams.get('to');
    const guestNameElement = document.getElementById('guest-name');
    if (guestNameParam) {
        guestNameElement.textContent = guestNameParam;
    }

    // 4. Opening Screen & Audio Control
    const openingScreen = document.getElementById("opening");
    const bgMusic = document.getElementById("bg-music");
    const btnOpen = document.getElementById("btn-open");
    const audioContainer = document.getElementById("audio-container");
    const btnMusic = document.getElementById("btn-music");
    let isPlaying = false;

    btnOpen.addEventListener("click", () => {
        // Slide up opening screen
        openingScreen.style.transform = "translateY(-100%)";
        setTimeout(() => {
            openingScreen.style.display = "none";
        }, 1000);
        
        // Remove overflow hidden from body to allow window scrolling
        document.body.classList.remove("overflow-hidden");
        
        // Refresh AOS to recalculate elements correctly now that scrolling is enabled
        setTimeout(() => {
            AOS.refresh();
        }, 500);

        // Show audio icon
        audioContainer.style.transform = "translateY(0)";
        audioContainer.style.opacity = "1";

        // Play audio
        bgMusic.play().then(() => {
            isPlaying = true;
            btnMusic.classList.remove('paused');
            btnMusic.innerHTML = '<i class="fa-solid fa-compact-disc text-xl"></i>';
        }).catch(err => {
            console.log("Auto-play prevented by browser: ", err);
        });
    });

    btnMusic.addEventListener("click", () => {
        if (isPlaying) {
            bgMusic.pause();
            btnMusic.classList.add('paused');
            btnMusic.innerHTML = '<i class="fa-solid fa-volume-xmark text-xl"></i>';
        } else {
            bgMusic.play();
            btnMusic.classList.remove('paused');
            btnMusic.innerHTML = '<i class="fa-solid fa-compact-disc text-xl"></i>';
        }
        isPlaying = !isPlaying;
    });

    // 5. Countdown Timer
    const countDownDate = new Date("Oct 28, 2026 08:00:00").getTime();
    
    const x = setInterval(function() {
        const now = new Date().getTime();
        const distance = countDownDate - now;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById("days").innerText = days < 10 ? "0" + days : days;
        document.getElementById("hours").innerText = hours < 10 ? "0" + hours : hours;
        document.getElementById("minutes").innerText = minutes < 10 ? "0" + minutes : minutes;
        document.getElementById("seconds").innerText = seconds < 10 ? "0" + seconds : seconds;
        
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("days").innerText = "00";
            document.getElementById("hours").innerText = "00";
            document.getElementById("minutes").innerText = "00";
            document.getElementById("seconds").innerText = "00";
        }
    }, 1000);

    // 6. Lightbox logic
    const galleryImgs = document.querySelectorAll('.gallery-img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightboxBtn = document.getElementById('close-lightbox');

    galleryImgs.forEach(img => {
        img.addEventListener('click', () => {
            lightbox.style.pointerEvents = "auto";
            lightbox.style.opacity = "1";
            lightboxImg.src = img.src;
        });
    });

    closeLightboxBtn.addEventListener('click', () => {
        lightbox.style.pointerEvents = "none";
        lightbox.style.opacity = "0";
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.pointerEvents = "none";
            lightbox.style.opacity = "0";
        }
    });

    // 7. RSVP & Guestbook logic
    const rsvpForm = document.getElementById('rsvp-form');
    const wishesContainer = document.getElementById('wishes-container');
    const countWishesLabel = document.getElementById('count-wishes');

    function loadWishes() {
        const wishes = JSON.parse(localStorage.getItem('wedding_wishes')) || [];
        
        if (wishes.length > 0) {
            wishesContainer.innerHTML = '';
            wishes.forEach(wish => {
                const wishElement = document.createElement('div');
                wishElement.className = "p-4 bg-dark/30 rounded-lg border border-gold/10 relative";
                wishElement.innerHTML = `
                    <div class="flex justify-between items-start mb-2">
                        <h5 class="font-bold text-gold-light">${escapeHTML(wish.name)}</h5>
                        <span class="text-[10px] uppercase tracking-widest ${wish.attendance === 'Hadir' ? 'text-green-400' : 'text-gray-400'}">${escapeHTML(wish.attendance)}</span>
                    </div>
                    <p class="text-sm opacity-90">${escapeHTML(wish.message)}</p>
                    <span class="text-[10px] text-gray-500 absolute bottom-2 right-4">${wish.date}</span>
                `;
                wishesContainer.appendChild(wishElement);
            });
        }
        countWishesLabel.innerText = wishes.length;
    }

    loadWishes();

    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('guest-input-name').value;
        const attendance = document.getElementById('guest-attendance').value;
        const message = document.getElementById('guest-message').value;
        
        const dateObj = new Date();
        const dateStr = dateObj.toLocaleDateString('id-ID') + " " + dateObj.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});

        const newWish = { name, attendance, message, date: dateStr };
        
        const wishes = JSON.parse(localStorage.getItem('wedding_wishes')) || [];
        wishes.unshift(newWish); // prepend
        
        localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
        
        loadWishes();
        
        rsvpForm.reset();
        
        // Custom simple alert
        alert("Terima kasih atas konfirmasi dan ucapan Anda!");
    });

    // Helper syntax to prevent XSS in guestbook
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
    
    // 8. Share functionality
    const btnShare = document.getElementById('btn-share');
    if (btnShare) {
        btnShare.addEventListener('click', async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Undangan Pernikahan Romeo & Juliet',
                        text: 'Kepada Yth. Bapak/Ibu/Saudara/i. Kami mengundang Anda untuk hadir di acara pernikahan kami.',
                        url: window.location.href
                    });
                } catch (err) {
                    console.log('Error sharing:', err);
                }
            } else {
                alert('Browser Anda tidak mendukung fitur Web Share. Silakan gunakan tombol WhatsApp.');
            }
        });
    }
});

// 9. Copy to clipboard
window.copyText = function(elementId) {
    const textToCopy = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
        const toast = document.getElementById('toast');
        toast.style.pointerEvents = "auto";
        toast.style.opacity = "1";
        toast.style.transform = "translate(-50%, -20px)";
        
        setTimeout(() => {
            toast.style.pointerEvents = "none";
            toast.style.opacity = "0";
            toast.style.transform = "translate(-50%, 0)";
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
};
