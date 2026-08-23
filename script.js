/* =========================================
   CONFIGURATION: EDIT NAMES HERE
   ========================================= */
const sisterName = "My Dearest Sister";
const brotherName = "Your Loving Brother";

/* =========================================
   DOM ELEMENTS & INITIALIZATION
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    
    // Inject Names
    document.getElementById('display-sister-name').innerText = `${sisterName}, ❤️`;
    document.getElementById('display-brother-name').innerText = `${brotherName} ❤️`;
    document.getElementById('final-brother-name').innerText = brotherName;

    // --- PERFECTED AUTO-ON MUSIC SYSTEM ---
    const bgMusic = document.getElementById('backgroundMusic');
    const musicWidget = document.getElementById('music-widget');
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    
    // 1. Establish User Preference (Default: ON)
    let musicEnabled = localStorage.getItem("musicEnabled");
    if (musicEnabled === null) {
        musicEnabled = "true";
        localStorage.setItem("musicEnabled", "true");
    }

    // Lock volume strictly at 0.30 
    if (bgMusic) {
        bgMusic.volume = 0.30;
        bgMusic.loop = true;
    }

    // Function to visually update the button
    function updateMusicUI(isPlaying) {
        if (isPlaying) {
            musicWidget.classList.add('is-playing');
            musicToggleBtn.innerHTML = '<div class="music-waves"><span></span><span></span><span></span></div><i class="fas fa-music z-icon"></i>';
        } else {
            musicWidget.classList.remove('is-playing');
            musicToggleBtn.innerHTML = '<div class="music-waves"><span></span><span></span><span></span></div><i class="fas fa-volume-mute z-icon"></i>';
        }
    }

    // 2. Initial Autoplay Attempt
    if (musicEnabled === "true") {
        updateMusicUI(true); // Visually ON since user expects it ON
        const playPromise = bgMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                console.log("Autoplay blocked by browser. Waiting for first interaction.");
            });
        }
    } else {
        updateMusicUI(false);
    }

    // 3. Fallback interaction logic if autoplay is blocked
    function startMusicAfterInteraction() {
        if (localStorage.getItem("musicEnabled") !== "true") {
            // Remove listeners if user manually disabled it
            document.removeEventListener("click", startMusicAfterInteraction);
            document.removeEventListener("touchstart", startMusicAfterInteraction);
            return;
        }

        const promise = bgMusic.play();
        if (promise !== undefined) {
            promise.then(() => {
                // Remove listeners upon successful playback
                document.removeEventListener("click", startMusicAfterInteraction);
                document.removeEventListener("touchstart", startMusicAfterInteraction);
            }).catch(() => {}); // Do nothing, wait for next interaction
        }
    }

    // Listeners for any interaction anywhere on the screen
    document.addEventListener("click", startMusicAfterInteraction);
    document.addEventListener("touchstart", startMusicAfterInteraction);

    // 4. Manual Music Toggle
    function toggleMusic(e) {
        e.stopPropagation(); // Prevents triggering fallback listener immediately
        
        if (!bgMusic) return;

        if (bgMusic.paused) {
            // User manually turns ON
            localStorage.setItem("musicEnabled", "true");
            bgMusic.play().catch(err => console.log("Playback failed:", err));
            updateMusicUI(true);
        } else {
            // User manually turns OFF
            localStorage.setItem("musicEnabled", "false");
            bgMusic.pause();
            updateMusicUI(false);
        }
    }

    musicToggleBtn.addEventListener('click', toggleMusic);

    // --- ENVELOPE LOGIC ---
    const envelope = document.getElementById('envelope');
    const openBtn = document.getElementById('open-letter-btn');

    const triggerOpen = () => {
        if(envelope.classList.contains('is-open')) return;
        envelope.classList.add('is-open');
        
        // (Music naturally starts due to the global click interaction listener)

        setTimeout(() => {
            nextScreen(2);
        }, 1500); 
    };

    envelope.addEventListener('click', triggerOpen);
    openBtn.addEventListener('click', triggerOpen);

    // Init core systems
    createParticles();
    initMemoryBox();
    initRakhiCanvas();
});

/* =========================================
   SCREEN NAVIGATION LOGIC
   ========================================= */
function nextScreen(screenNumber) { goToScreen(screenNumber); }

function goToScreen(screenNumber) {
    document.querySelectorAll('.screen').forEach(el => {
        el.classList.remove('active');
        setTimeout(() => el.classList.add('hidden'), 500);
    });
    setTimeout(() => {
        const target = document.getElementById(`screen-${screenNumber}`);
        target.classList.remove('hidden');
        setTimeout(() => target.classList.add('active'), 50);
        
        if(screenNumber === 5) {
            const canvas = document.getElementById('rakhi-canvas');
            document.getElementById('reveal-rakhi-img').src = canvas.toDataURL("image/png");
        }
    }, 500);
}

function resetExperience() {
    document.getElementById('envelope').classList.remove('is-open');
    goToScreen(1);
    
    // Reset Memory Box
    document.getElementById('chest-box').classList.remove('opening');
    document.getElementById('memory-box-intro').style.display = 'flex';
    document.getElementById('memory-carousel').classList.add('hidden');
    currentMemoryIdx = 0;
}

/* =========================================
   MEMORY BOX LOGIC
   ========================================= */
const memories = [
    { icon: '🧸', title: "Fighting Over The Smallest Things", desc: "We could turn the smallest thing into a full argument. Sometimes we fought over toys, the remote, food, or absolutely nothing... But somehow, after a little while, we were laughing together again." },
    { icon: '🍽️', title: "One Plate, Endless Conversations", desc: "Sitting together and eating was never just about food. We talked, laughed, complained, shared bites, and somehow made even the simplest meal feel special." },
    { icon: '📱', title: "Just One More Video...", desc: "We would sit together and watch the mobile... One video became ten, ten became twenty, and suddenly someone would say, 'Okay, last one!' 😂" },
    { icon: '😎', title: "Our Cousin Gang", desc: "When all the cousins came together, the house was never quiet. We made our own little gang, created our own rules, laughed for no reason, and turned every family gathering into an adventure." },
    { icon: '🫣', title: "Hide & Seek Adventures", desc: "Running around the house, hiding behind doors, under beds, behind curtains... And trying not to laugh when someone was getting closer. Those simple games somehow became some of our best memories." },
    { icon: '🌙', title: "Our Secret Late-Night Talks", desc: "Night time was different. Everyone else was sleeping, but somehow our conversations were just getting started. We shared secrets, talked about everyone, laughed quietly, and tried not to get caught." },
    { icon: '🍕', title: "We Shared More Than Things", desc: "Sometimes we shared food. Sometimes secrets. Sometimes jokes. Sometimes problems. And without even realizing it, we were sharing pieces of our lives with each other." },
    { icon: '😜', title: "Professional Annoying Partners", desc: "I don't know who annoyed whom more... But honestly, annoying you was one of my favorite hobbies. 😂 And somehow, you always managed to annoy me right back." },
    { icon: '😂', title: "Those Random Laughs", desc: "Sometimes we didn't even need a reason. One silly look, one stupid joke, and suddenly we couldn't stop laughing." },
    { icon: '❤️', title: "Some Things Never Change ❤️", desc: "We grew up. Things changed. Life became busier. But one thing will always remain the same — You will always be my sister, and I will always be your brother." }
];

let currentMemoryIdx = 0;

function initMemoryBox() {
    const container = document.getElementById('polaroid-container');
    container.innerHTML = '';
    memories.forEach((mem, index) => {
        const card = document.createElement('div');
        card.className = `polaroid-card ${index === 0 ? 'active' : 'next'}`;
        card.id = `memory-card-${index}`;
        card.innerHTML = `
            <div class="polaroid-image">${mem.icon}</div>
            <div class="polaroid-text">
                <h3 class="polaroid-title">${mem.title}</h3>
                <p class="polaroid-desc">${mem.desc}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

function openMemoryBox() {
    const chest = document.getElementById('chest-box');
    const intro = document.getElementById('memory-box-intro');
    const carousel = document.getElementById('memory-carousel');

    chest.classList.add('shaking');
    setTimeout(() => {
        chest.classList.remove('shaking');
        chest.classList.add('opening');
        setTimeout(() => {
            intro.style.display = 'none';
            carousel.classList.remove('hidden');
            updateMemoryView();
            for(let i=0; i<15; i++) { setTimeout(triggerPopParticle, i * 100); }
        }, 1500);
    }, 1000);
}

function updateMemoryView() {
    document.getElementById('current-mem-idx').innerText = currentMemoryIdx + 1;
    memories.forEach((_, idx) => {
        const card = document.getElementById(`memory-card-${idx}`);
        card.className = 'polaroid-card'; 
        if (idx === currentMemoryIdx) card.classList.add('active');
        else if (idx < currentMemoryIdx) card.classList.add('prev');
        else card.classList.add('next');
    });

    const finishBtn = document.getElementById('finish-memory-btn');
    if(currentMemoryIdx === memories.length - 1) {
        finishBtn.style.display = 'inline-block';
        finishBtn.style.animation = 'fadeIn 1s forwards';
    }
}

window.nextMemory = () => { if (currentMemoryIdx < memories.length - 1) { currentMemoryIdx++; updateMemoryView(); } };
window.prevMemory = () => { if (currentMemoryIdx > 0) { currentMemoryIdx--; updateMemoryView(); } };

function triggerPopParticle() {
    const container = document.getElementById('particles-container');
    let p = document.createElement('div');
    p.className = 'particle';
    p.innerText = ['✨','💖','🌸','⭐'][Math.floor(Math.random()*4)];
    p.style.left = '50vw'; p.style.top = '50vh';
    p.style.fontSize = (Math.random() * 20 + 15) + 'px'; p.style.opacity = '1';
    const tx = (Math.random() - 0.5) * 300; const ty = (Math.random() - 0.5) * 300;
    p.animate([ { transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 } ], { duration: 1500, easing: 'ease-out' });
    container.appendChild(p);
    setTimeout(() => p.remove(), 1500);
}

/* =========================================
   RAKHI DESIGNER (CANVAS LOGIC)
   ========================================= */
let rakhiState = { color: '#ff4d6d', shape: 'traditional', pattern: 'om', size: 1.0 };

function initRakhiCanvas() {
    const canvas = document.getElementById('rakhi-canvas');
    const ctx = canvas.getContext('2d');

    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            e.target.classList.add('active'); rakhiState.color = e.target.dataset.color; triggerCanvasRedraw(ctx, canvas);
        });
    });

    document.getElementById('shape-select').addEventListener('change', (e) => { rakhiState.shape = e.target.value; triggerCanvasRedraw(ctx, canvas); });
    document.getElementById('pattern-select').addEventListener('change', (e) => { rakhiState.pattern = e.target.value; triggerCanvasRedraw(ctx, canvas); });
    document.getElementById('size-slider').addEventListener('input', (e) => { rakhiState.size = parseFloat(e.target.value); triggerCanvasRedraw(ctx, canvas); });

    document.getElementById('download-btn').addEventListener('click', () => {
        const link = document.createElement('a'); link.download = 'My_Premium_Rakhi.png'; link.href = canvas.toDataURL("image/png"); link.click();
    });

    drawRakhi(ctx, canvas);
}

window.applyPreset = (color, shape, pattern, size) => {
    rakhiState = { color, shape, pattern, size };
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    let swatchMatch = document.querySelector(`.color-swatch[data-color="${color}"]`);
    if(swatchMatch) swatchMatch.classList.add('active');
    
    document.getElementById('shape-select').value = shape;
    document.getElementById('pattern-select').value = pattern;
    document.getElementById('size-slider').value = size;

    const canvas = document.getElementById('rakhi-canvas');
    triggerCanvasRedraw(canvas.getContext('2d'), canvas);
};

function triggerCanvasRedraw(ctx, canvas) {
    canvas.classList.add('fade-out');
    setTimeout(() => { drawRakhi(ctx, canvas); canvas.classList.remove('fade-out'); }, 300);
}

function drawRakhi(ctx, canvas) {
    const cx = canvas.width / 2; const cy = canvas.height / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath(); ctx.moveTo(0, cy + 15 * Math.sin(0));
    for (let x = 0; x < canvas.width; x++) ctx.lineTo(x, cy + 15 * Math.sin(x * 0.04));
    ctx.lineWidth = 8; ctx.strokeStyle = '#d4af37'; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, cy + 15 * Math.sin(0));
    for (let x = 0; x < canvas.width; x++) ctx.lineTo(x, cy + 15 * Math.sin(x * 0.04));
    ctx.lineWidth = 4; ctx.strokeStyle = '#ff0000'; ctx.stroke();

    ctx.save(); ctx.translate(cx, cy); ctx.scale(rakhiState.size, rakhiState.size);
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
    ctx.fillStyle = rakhiState.color; ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 4;

    if (rakhiState.shape === 'traditional') {
        ctx.beginPath(); ctx.arc(0, 0, 75, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 55, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.stroke();
    } else if (rakhiState.shape === 'flower') {
        ctx.beginPath();
        for (let i = 0; i < 12; i++) { ctx.rotate((Math.PI * 2) / 12); ctx.ellipse(0, 50, 20, 50, 0, 0, Math.PI * 2); }
        ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 35, 0, Math.PI * 2); ctx.fillStyle = '#fffdd0'; ctx.fill(); ctx.stroke();
    } else if (rakhiState.shape === 'heart') {
        ctx.beginPath(); ctx.moveTo(0, 15);
        ctx.bezierCurveTo(0, -25, -60, -25, -60, 15); ctx.bezierCurveTo(-60, 45, 0, 65, 0, 85);
        ctx.bezierCurveTo(0, 65, 60, 45, 60, 15); ctx.bezierCurveTo(60, -25, 0, -25, 0, 15);
        ctx.translate(0, -35); ctx.scale(1.4, 1.4); ctx.fill(); ctx.stroke();
        ctx.scale(1/1.4, 1/1.4); ctx.translate(0, 35);
    } else if (rakhiState.shape === 'diamond') {
        ctx.beginPath(); ctx.moveTo(0, -90); ctx.lineTo(70, 0); ctx.lineTo(0, 90); ctx.lineTo(-70, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -65); ctx.lineTo(50, 0); ctx.lineTo(0, 65); ctx.lineTo(-50, 0); ctx.closePath(); ctx.lineWidth = 2; ctx.stroke();
    } else if (rakhiState.shape === 'butterfly') {
        ctx.beginPath(); ctx.ellipse(-40, -30, 45, 35, Math.PI/4, 0, Math.PI*2); ctx.ellipse(-35, 30, 35, 30, -Math.PI/4, 0, Math.PI*2);
        ctx.ellipse(40, -30, 45, 35, -Math.PI/4, 0, Math.PI*2); ctx.ellipse(35, 30, 35, 30, Math.PI/4, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(0, 0, 10, 45, 0, 0, Math.PI*2); ctx.fillStyle = '#d4af37'; ctx.fill();
    } else if (rakhiState.shape === 'infinity') {
        ctx.beginPath(); ctx.ellipse(-45, 0, 45, 45, 0, 0, Math.PI*2); ctx.ellipse(45, 0, 45, 45, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    } else if (rakhiState.shape === 'crown') {
        ctx.beginPath(); ctx.moveTo(-60, 40); ctx.lineTo(60, 40); ctx.lineTo(70, -40); ctx.lineTo(30, 0); ctx.lineTo(0, -60); ctx.lineTo(-30, 0); ctx.lineTo(-70, -40); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else { ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }

    ctx.shadowBlur = 0; ctx.fillStyle = '#ffd700';
    
    if (rakhiState.pattern === 'om') {
        ctx.font = 'bold 60px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = (rakhiState.shape === 'flower' || rakhiState.color === '#ffffff') ? '#d4af37' : '#ffd700';
        if (rakhiState.color === '#ffd700') ctx.fillStyle = '#ff0000';
        ctx.fillText('ॐ', 0, 5);
    } else if (rakhiState.pattern === 'pearls') {
        ctx.fillStyle = '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 5;
        for(let i=0; i<16; i++){ const angle = (i * Math.PI) / 8; ctx.beginPath(); ctx.arc(Math.cos(angle)*55, Math.sin(angle)*55, 6, 0, Math.PI*2); ctx.fill(); }
        ctx.beginPath(); ctx.arc(0,0, 15, 0, Math.PI*2); ctx.fill();
    } else if (rakhiState.pattern === 'kundan') {
        const colors = ['#ff0000', '#00ff00', '#ffffff', '#0000ff'];
        for(let i=0; i<8; i++){
            ctx.fillStyle = colors[i%4]; const angle = (i * Math.PI) / 4;
            ctx.beginPath(); ctx.arc(Math.cos(angle)*40, Math.sin(angle)*40, 8, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        }
        ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.arc(0,0, 15, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    } else if (rakhiState.pattern === 'dots') {
        for(let i=0; i<8; i++){ const angle = (i * Math.PI) / 4; ctx.beginPath(); ctx.arc(Math.cos(angle)*35, Math.sin(angle)*35, 6, 0, Math.PI*2); ctx.fill(); }
        ctx.beginPath(); ctx.arc(0,0, 12, 0, Math.PI*2); ctx.fill();
    } else if (rakhiState.pattern === 'stars') {
        drawStar(ctx, 0, 0, 6, 30, 15);
    } else if (rakhiState.pattern === 'diamonds') {
        for(let i=0; i<4; i++){ ctx.save(); ctx.rotate((i * Math.PI) / 2); ctx.translate(0, -35); ctx.beginPath(); ctx.moveTo(0,-10); ctx.lineTo(10,0); ctx.lineTo(0,10); ctx.lineTo(-10,0); ctx.fill(); ctx.restore(); }
        ctx.beginPath(); ctx.arc(0,0, 15, 0, Math.PI*2); ctx.fill();
    } else if (rakhiState.pattern === 'hearts') {
        ctx.font = '25px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for(let i=0; i<4; i++){ const angle = (i * Math.PI) / 2; ctx.fillText('❤', Math.cos(angle)*35, Math.sin(angle)*35 + 2); }
    }
    ctx.restore();
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3; let x, y; let step = Math.PI / spikes; ctx.beginPath(); ctx.moveTo(cx, cy - outerRadius)
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius; y = cy + Math.sin(rot) * outerRadius; ctx.lineTo(x, y); rot += step;
        x = cx + Math.cos(rot) * innerRadius; y = cy + Math.sin(rot) * innerRadius; ctx.lineTo(x, y); rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius); ctx.closePath(); ctx.fill();
}

/* =========================================
   BACKGROUND PARTICLES
   ========================================= */
function createParticles() {
    const container = document.getElementById('particles-container');
    const particleTypes = ['🌸', '✨', '❤️', '💖', '⭐'];
    const particleCount = window.innerWidth < 768 ? 18 : 35;
    for (let i = 0; i < particleCount; i++) {
        let particle = document.createElement('div');
        particle.className = 'particle'; particle.innerText = particleTypes[Math.floor(Math.random() * particleTypes.length)];
        particle.style.left = `${Math.random() * 100}vw`; particle.style.fontSize = `${Math.random() * 15 + 10}px`;
        particle.style.animationDuration = `${Math.random() * 10 + 12}s`; particle.style.animationDelay = `${Math.random() * 10}s`;
        container.appendChild(particle);
    }
}
