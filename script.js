document.addEventListener('DOMContentLoaded', () => {
    // --- UI Variables ---
    const introSection = document.getElementById('intro-section');
    const startLight = document.getElementById('start-light');
    const trackContainer = document.getElementById('wheel-track-container');
    const tracks = document.querySelectorAll('.track');
    const travelText = document.getElementById('travel-text');
    const dashboardContainer = document.getElementById('dashboard-container');
    const clickPrompt = document.getElementById('click-prompt');
    const presentTimeDisplay = document.getElementById('present-time-display');
    
    // --- Scroll Variables ---
    const horizontalWrapper = document.getElementById('horizontal-scroll-wrapper');
    const horizontalTrack = document.getElementById('horizontal-track');
    
    let travelStarted = false;
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    // 1. Clock
    function updateTime() {
        const now = new Date();
        const timeString = `${monthNames[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')} ${now.getFullYear()} ${String(now.getHours()%12||12).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')} ${now.getHours()>=12?'PM':'AM'}`;
        if (presentTimeDisplay) presentTimeDisplay.textContent = timeString;
    }
    setInterval(updateTime, 1000); updateTime();

    // 2. Start Travel (Draw-on + Auto Scroll)
    window.startTravel = function() {
        if (travelStarted) return;
        travelStarted = true;
        
        introSection.classList.add('travel-active');
        startLight.style.width = '200vw'; startLight.style.height = '200vh';
        
        // Track Animation
        trackContainer.classList.add('visible');
        tracks.forEach(t => t.classList.add('burning'));
        
        travelText.style.opacity = 1;
        clickPrompt.textContent = "SCROLL DOWN";
        
        setTimeout(() => { travelText.style.opacity = 0; }, 2500);

        // [AUTO SCROLL] Smoothly scroll to Horizontal Section start
        setTimeout(() => {
            const targetY = horizontalWrapper.offsetTop; // 가로 섹션 시작 위치
            smoothScrollTo(targetY, 2000); // 2초 동안 이동
        }, 500);
    };

    function smoothScrollTo(targetY, duration) {
        const startY = window.scrollY;
        const distance = targetY - startY;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = 0.5 * (1 - Math.cos(Math.PI * progress)); // Ease-in-out
            window.scrollTo(0, startY + distance * ease);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        requestAnimationFrame(animation);
    }

    // 3. Scroll Handler (Horizontal Mapping)
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        
        // Intro Fade
        if (scrollTop < window.innerHeight) {
            dashboardContainer.style.opacity = Math.max(0, 1 - (scrollTop / (window.innerHeight * 0.8)));
        }

        // Horizontal Scroll Logic
        const hTop = horizontalWrapper.offsetTop;
        const hHeight = horizontalWrapper.offsetHeight;
        const vHeight = window.innerHeight;

        // Sticky Area Logic: Vertical Scroll -> Horizontal Transform
        if (scrollTop >= hTop && scrollTop <= (hTop + hHeight - vHeight)) {
            const progress = (scrollTop - hTop) / (hHeight - vHeight);
            const moveX = progress * (horizontalTrack.scrollWidth - window.innerWidth);
            horizontalTrack.style.transform = `translateX(-${moveX}px)`;
        }

        // Outro Album Reveal
        const outroTop = document.getElementById('outro-section').offsetTop;
        if (scrollTop > outroTop - vHeight/1.5) {
            triggerAlbumReveal();
        }
    });


    // =================================================================
    // 🎨 CANVAS ANIMATIONS
    // =================================================================
    function attachInteraction(el) {
        const strength = 15;
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            el.style.setProperty('--tiltX', `${(-y * strength).toFixed(2)}deg`);
            el.style.setProperty('--tiltY', `${(x * strength).toFixed(2)}deg`);
        });
        el.addEventListener('mouseleave', () => { el.style.setProperty('--tiltX', '0deg'); el.style.setProperty('--tiltY', '0deg'); });
        el.addEventListener('click', () => { el.classList.toggle('active'); });
    }
    document.querySelectorAll('.memory-object').forEach(attachInteraction);

    // 1. Birch Forest
    function initBirchCanvas() {
        const canvas = document.getElementById('canvas-birch'); if(!canvas) return;
        const ctx = canvas.getContext('2d'); const container = canvas.parentElement;
        const trees = []; for(let i=0; i<10; i++) trees.push({ x: Math.random()*500, w: Math.random()*30+20, s: Math.random()*0.2+0.1 });
        function draw() {
            const w = canvas.width = container.offsetWidth; const h = canvas.height = container.offsetHeight;
            const isClicked = container.classList.contains('active');
            const grad = ctx.createLinearGradient(0,0,0,h); grad.addColorStop(0, isClicked ? "#e1bee7" : "#e0f7fa"); grad.addColorStop(1, "#fff");
            ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
            trees.forEach(t => {
                t.x -= t.s * (isClicked ? 8 : 1); if(t.x < -t.w) t.x = w + 50;
                ctx.fillStyle = "#fff"; ctx.fillRect(t.x, 0, t.w, h); 
                ctx.strokeStyle = "#ccc"; ctx.strokeRect(t.x, 0, t.w, h); 
                ctx.fillStyle = "#333"; for(let j=20; j<h; j+=30) if(Math.random()>0.7) ctx.fillRect(t.x, j, t.w*0.6, 3); 
            }); requestAnimationFrame(draw);
        } draw();
    }

    // 2. Field
    function initFieldCanvas() {
        const canvas = document.getElementById('canvas-field'); if(!canvas) return;
        const ctx = canvas.getContext('2d'); const container = canvas.parentElement;
        const grass = []; for(let i=0; i<200; i++) grass.push({x: Math.random()*100, h: Math.random()*50+20, s: Math.random()*0.01+0.005});
        let time = 0;
        function draw() {
            const w = canvas.width = container.offsetWidth; const h = canvas.height = container.offsetHeight;
            const isClicked = container.classList.contains('active'); time += isClicked ? 0.1 : 0.02;
            const bg = ctx.createLinearGradient(0,0,0,h); bg.addColorStop(0, isClicked ? "#1a237e" : "#e0f2f1"); bg.addColorStop(1, isClicked ? "#004d40" : "#81c784");
            ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);
            grass.forEach(g => {
                const gx = (g.x/100)*w; const sway = Math.sin(time + g.x) * (isClicked?15:5);
                ctx.beginPath(); ctx.moveTo(gx, h); ctx.quadraticCurveTo(gx+sway, h-g.h/2, gx+sway*1.2, h-g.h);
                ctx.strokeStyle = isClicked ? "#4caf50" : "#2e7d32"; ctx.stroke();
            }); requestAnimationFrame(draw);
        } draw();
    }

    // 3. Snow
    function initSnowCanvas() {
        const canvas = document.getElementById('canvas-snow'); if(!canvas) return;
        const ctx = canvas.getContext('2d'); const container = canvas.parentElement;
        const parts = []; for(let i=0; i<100; i++) parts.push({x:Math.random()*500, y:Math.random()*400, r:Math.random()*2+1, s:Math.random()*0.5+0.2});
        let t = 0;
        function draw() {
            const w = canvas.width = container.offsetWidth; const h = canvas.height = container.offsetHeight;
            const isClicked = container.classList.contains('active'); t += 0.01;
            ctx.clearRect(0,0,w,h); ctx.fillStyle = isClicked ? "rgba(0,0,20,0.5)" : "transparent"; if(isClicked) ctx.fillRect(0,0,w,h);
            parts.forEach(p => {
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
                if(isClicked) { ctx.fillStyle = `rgba(255, 215, 0, ${Math.random()*0.5+0.5})`; p.y -= p.s * 3; p.x += Math.sin(t+p.y)*0.5; if(p.y < -10) { p.y = h+10; p.x = Math.random()*w; } } 
                else { ctx.fillStyle = "rgba(255,255,255,0.9)"; p.y += p.s; p.x += Math.sin(t+p.y)*0.3; if(p.y > h) { p.y = -10; p.x = Math.random()*w; } } ctx.fill();
            }); requestAnimationFrame(draw);
        } draw();
    }

    // 4. Signal (Osaka) - Geometric
    function initSignalCanvas() {
        const canvas = document.getElementById('canvas-signal'); if(!canvas) return;
        const ctx = canvas.getContext('2d'); const container = canvas.parentElement;
        const nodes = []; for(let i=0; i<20; i++) nodes.push({x: Math.random()*100, y: Math.random()*100, vx: (Math.random()-0.5)*0.2, vy: (Math.random()-0.5)*0.2, r: Math.random()*2+2, phase: Math.random()*Math.PI*2});
        let time = 0;
        function draw() {
            const w = canvas.width = container.offsetWidth; const h = canvas.height = container.offsetHeight;
            const isClicked = container.classList.contains('active'); time += 0.05;
            ctx.fillStyle = isClicked ? "#220000" : "#001100"; ctx.fillRect(0,0,w,h);
            nodes.forEach(n => { n.x += n.vx*(isClicked?5:1); n.y += n.vy*(isClicked?5:1); if(n.x<0||n.x>100) n.vx*=-1; if(n.y<0||n.y>100) n.vy*=-1; });
            ctx.lineWidth = 1;
            for(let i=0; i<nodes.length; i++) { for(let j=i+1; j<nodes.length; j++) {
                const dx=(nodes[i].x-nodes[j].x)*w/100, dy=(nodes[i].y-nodes[j].y)*h/100, dist=Math.sqrt(dx*dx+dy*dy);
                if(dist < 150) { 
                    const a=1-dist/150; 
                    ctx.strokeStyle=isClicked?`rgba(255,50,50,${a})`:`rgba(50,255,100,${a})`; 
                    ctx.beginPath(); ctx.moveTo(nodes[i].x/100*w,nodes[i].y/100*h); ctx.lineTo(nodes[j].x/100*w,nodes[j].y/100*h); ctx.stroke(); 
                }
            }}
            nodes.forEach(n => { const nx=n.x/100*w, ny=n.y/100*h, p=Math.sin(time+n.phase)*5; ctx.fillStyle=isClicked?"#ff5252":"#69f0ae"; ctx.beginPath(); ctx.arc(nx,ny,n.r,0,Math.PI*2); ctx.fill(); });
            ctx.save(); ctx.translate(w/2, h/2); ctx.rotate(time*0.2); ctx.strokeStyle=isClicked?"#ffeb3b":"#00bcd4"; ctx.lineWidth=2; 
            const size=60+Math.sin(time)*10; ctx.strokeRect(-size/2,-size/2,size,size); ctx.rotate(Math.PI/4); ctx.strokeRect(-size/2,-size/2,size,size); ctx.restore();
            requestAnimationFrame(draw);
        } draw();
    }

    // 5. Flowers (Red) - Full Mandala
    function initFlowerCanvas() {
        const canvas = document.getElementById('canvas-flowers'); if(!canvas) return;
        const ctx = canvas.getContext('2d'); const container = canvas.parentElement;
        const flowers = []; const count = 80; 
        for(let i=0; i<count; i++) { flowers.push({ rx: Math.random(), ry: Math.random(), maxR: Math.random() * 30 + 10, offset: Math.random() * Math.PI * 2, colorHue: 320 + Math.random() * 40, speed: (Math.random() * 0.5 + 0.2) * (Math.random() > 0.5 ? 1 : -1) }); }
        let time = 0;
        function draw() {
            const w = canvas.width = container.offsetWidth; const h = canvas.height = container.offsetHeight;
            const isClicked = container.classList.contains('active'); ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; ctx.fillRect(0, 0, w, h);
            time += 0.01; const activeSpeed = isClicked ? 3 : 1;
            flowers.forEach(f => {
                const cx = f.rx * w; const cy = f.ry * h; const r = f.maxR * (isClicked ? 1.5 : 1); 
                ctx.save(); ctx.translate(cx, cy); ctx.rotate(time * 0.5 * f.speed + f.offset); 
                ctx.beginPath();
                for (let i = 0; i <= 360; i += 20) {
                    const rad = i * Math.PI / 180; const k = isClicked ? 8 : 6; const radius = r * Math.cos(k * rad + time * activeSpeed);
                    const x = radius * Math.cos(rad); const y = radius * Math.sin(rad);
                    if(i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                } ctx.closePath(); ctx.lineWidth = 1; ctx.strokeStyle = `hsla(${f.colorHue}, 80%, ${isClicked?70:50}%, 0.7)`; ctx.stroke(); ctx.restore();
            }); requestAnimationFrame(draw);
        } draw();
    }


    // =================================================================
    // 🎵 MOSAIC ALBUM & LIGHTBOX
    // =================================================================
    
    // 1. Spine Generator
    class MosaicSpine {
        constructor(canvasId, imageSrc) {
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas.getContext('2d');
            this.image = new Image();
            this.image.src = imageSrc;
            this.tileSize = 6;
            this.image.onload = () => this.init();
        }
        init() {
            const w = 60, h = 350;
            this.canvas.width = w; this.canvas.height = h;
            const tempCanvas = document.createElement('canvas'); const tCtx = tempCanvas.getContext('2d'); tempCanvas.width = w; tempCanvas.height = h;
            const scale = Math.max(w / this.image.width, h / this.image.height); const x = (w/2) - (this.image.width/2)*scale; const y = (h/2) - (this.image.height/2)*scale;
            tCtx.drawImage(this.image, x, y, this.image.width*scale, this.image.height*scale);
            const imgData = tCtx.getImageData(0,0,w,h).data;
            for(let y=0; y<h; y+=this.tileSize) { for(let x=0; x<w; x+=this.tileSize) {
                const i = (y*w + x)*4; this.ctx.fillStyle = `rgb(${imgData[i]},${imgData[i+1]},${imgData[i+2]})`; this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
            }}
        }
    }

    // 2. Large Pop Art Mosaic
    class PopArtMosaic {
        constructor(wrapperId, imageSrc) {
            this.wrapper = document.getElementById(wrapperId);
            this.wrapper.innerHTML = ''; 
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'pop-art-canvas';
            this.wrapper.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            this.image = new Image();
            this.image.src = imageSrc;
            this.tileSize = 12; 
            this.tiles = [];
            this.image.onload = () => this.init();
        }

        init() {
            const size = Math.min(600, window.innerWidth * 0.8);
            this.canvas.width = size; this.canvas.height = size;
            const temp = document.createElement('canvas'); const tCtx = temp.getContext('2d'); temp.width = size; temp.height = size;
            tCtx.drawImage(this.image, 0, 0, size, size);
            const data = tCtx.getImageData(0,0,size,size).data;
            
            for(let y=0; y<size; y+=this.tileSize) {
                for(let x=0; x<size; x+=this.tileSize) {
                    const i = (y*size + x)*4;
                    const r = data[i], g = data[i+1], b = data[i+2];
                    this.tiles.push({
                        x: x, y: y,
                        baseColor: `rgb(${r},${g},${b})`,
                        color: `rgb(${r},${g},${b})`, 
                        popColor: `rgb(${g}, ${b}, ${r})`, 
                        isPopped: false
                    });
                }
            }
            this.draw();
            this.addInteraction();
        }

        draw() {
            this.tiles.forEach(t => {
                this.ctx.fillStyle = t.color;
                this.ctx.fillRect(t.x, t.y, this.tileSize, this.tileSize);
            });
        }

        addInteraction() {
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;
                let redraw = false;
                
                // Spread Effect
                const radius = 40; 
                this.tiles.forEach(t => {
                    const tx = t.x + this.tileSize/2;
                    const ty = t.y + this.tileSize/2;
                    const dist = Math.sqrt((mx-tx)**2 + (my-ty)**2);
                    
                    if (dist < radius) {
                        if (!t.isPopped) {
                            t.isPopped = true;
                            t.color = t.popColor;
                            redraw = true;
                        }
                    }
                });
                if(redraw) this.draw();
            });
        }
    }

    let albumsLoaded = false;
    function triggerAlbumReveal() {
        if(albumsLoaded) return;
        albumsLoaded = true;

        new MosaicSpine('spine-1', 'img/album_1.jpg');
        new MosaicSpine('spine-2', 'img/album_2.jpg');
        new MosaicSpine('spine-3', 'img/album_3.png');
        new MosaicSpine('spine-4', 'img/album_4.png');

        const spines = document.querySelectorAll('.album-spine');
        const modal = document.getElementById('mosaic-modal');
        const caption = document.getElementById('modal-caption');
        const close = document.querySelector('.close-modal');

        spines.forEach((spine, i) => {
            setTimeout(() => spine.classList.add('visible'), i*150);
            
            spine.addEventListener('click', () => {
                modal.style.display = "flex";
                caption.textContent = spine.getAttribute('data-title');
                new PopArtMosaic('modal-canvas-wrapper', spine.getAttribute('data-img'));
            });
        });

        close.onclick = () => { modal.style.display = "none"; };
        modal.onclick = (e) => { if(e.target === modal) modal.style.display = "none"; };
    }

    setTimeout(() => {
        initBirchCanvas(); initFieldCanvas(); initSnowCanvas(); initSignalCanvas(); initFlowerCanvas();
    }, 100);
});