// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1.1,
  touchMultiplier: 1.5,
  infinite: false,
});

window.lenisInstance = lenis;

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Scrollytelling Setup
const canvas = document.getElementById('hero-canvas');
const context = canvas.getContext('2d');
const frameCount = 300;
const images = [];
let loadedImagesCount = 0;

// Normalized path to frames
const getFramePath = (index) => `./frames/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

// State variables for smooth lerping
let targetFrameIndex = 1;
let renderedFrameIndex = 1;

// Panel bounds for text fades (0.0 to 1.0 normalized scroll)
const panels = [
  { id: 'panel-0', start: 0.0, end: 0.12 },
  { id: 'panel-1', start: 0.16, end: 0.38 },
  { id: 'panel-2', start: 0.42, end: 0.62 },
  { id: 'panel-3', start: 0.66, end: 0.82 },
  { id: 'panel-4', start: 0.86, end: 1.0 }
];

// Preload Images
function preloadImages(onComplete) {
  const loaderProgressCircle = document.getElementById('loader-progress-circle');
  const loaderProgressText = document.getElementById('loader-progress-text');
  const loaderStatus = document.getElementById('loader-status');
  const preloader = document.getElementById('preloader');

  const totalCircumference = 2 * Math.PI * 36; // ~226.19px
  loaderProgressCircle.style.strokeDasharray = `${totalCircumference}`;
  loaderProgressCircle.style.strokeDashoffset = `${totalCircumference}`;

  const loadingStatuses = [
    "TUNING HIGH-RES COGNITIVE DRIVERS...",
    "SEALING CHAMBERS FOR ACOUSTIC VACUUM...",
    "CALIBRATING ACTIVE NOISE PROCESSORS...",
    "DECRYPTING EDGE-AI REAL-TIME UPSCALERS...",
    "FORMING MATTE CARBON STRUCTURAL SHELLS...",
    "ENGAGING COGNITIVE SILENCE ENGINE..."
  ];

  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = getFramePath(i);
    img.onload = () => {
      loadedImagesCount++;
      const progressPercent = Math.floor((loadedImagesCount / frameCount) * 100);

      // Update loading visual progress
      loaderProgressText.textContent = `${progressPercent.toString().padStart(2, '0')}%`;
      const offset = totalCircumference - (progressPercent / 100) * totalCircumference;
      loaderProgressCircle.style.strokeDashoffset = offset;

      // Update loading status messages
      const statusIndex = Math.min(Math.floor(progressPercent / 18), loadingStatuses.length - 1);
      loaderStatus.textContent = loadingStatuses[statusIndex];

      if (loadedImagesCount === frameCount) {
        setTimeout(() => {
          preloader.classList.add('fade-out');
          initCanvas();
          onComplete();
        }, 600);
      }
    };
    img.onerror = () => {
      console.warn(`Frame ${i} failed to load. Continuing...`);
      loadedImagesCount++;
      if (loadedImagesCount === frameCount) {
        preloader.classList.add('fade-out');
        initCanvas();
        onComplete();
      }
    };
    images.push(img);
  }
}

// Draw Frame to Canvas with "object-fit: contain" implementation
function drawFrame(index) {
  const img = images[index - 1];
  if (!img) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const imageWidth = img.naturalWidth;
  const imageHeight = img.naturalHeight;

  if (imageWidth === 0 || imageHeight === 0) return;

  const imgRatio = imageWidth / imageHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth, drawHeight, drawX, drawY;

  // Swap to contain: check if canvas aspect ratio is less than image aspect ratio
  if (canvasRatio < imgRatio) {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imgRatio;
    drawX = 0;
    drawY = (canvasHeight - drawHeight) / 2;
  } else {
    drawWidth = canvasHeight * imgRatio;
    drawHeight = canvasHeight;
    drawX = (canvasWidth - drawWidth) / 2;
    drawY = 0;
  }

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

// Initializing canvas sizing and event listeners
function initCanvas() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Instantly redraw the currently rendered frame
  drawFrame(Math.round(renderedFrameIndex));
}

// Scroll Update mapping
function handleScroll() {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollFraction = maxScroll > 0 ? scrollTop / maxScroll : 0;

  // Map scroll fraction to target frame index (1 - 300)
  targetFrameIndex = Math.min(
    frameCount,
    Math.max(1, Math.ceil(scrollFraction * frameCount))
  );

  // Apple-like glass navbar fading
  const headerNav = document.getElementById('header-nav');
  if (scrollTop > 50) {
    headerNav.classList.add('scrolled');
  } else {
    headerNav.classList.remove('scrolled');
  }

  // Update panels text overlay visibility
  updatePanels(scrollFraction);
}

// Update Active text panels
function updatePanels(scrollFraction) {
  panels.forEach(panel => {
    const el = document.getElementById(panel.id);
    if (!el) return;

    if (scrollFraction >= panel.start && scrollFraction < panel.end) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}

// Infinite requestAnimationFrame loop for hardware-accelerated lerped frames
function renderLoop() {
  const diff = targetFrameIndex - renderedFrameIndex;

  // Render frame if transition threshold is met
  if (Math.abs(diff) > 0.01) {
    renderedFrameIndex += diff * 0.12; // Easing speed
    drawFrame(Math.round(renderedFrameIndex));
  }

  requestAnimationFrame(renderLoop);
}

// Fire preloader and kick off main update loops
preloadImages(() => {
  // Bind scroll updates
  window.addEventListener('scroll', handleScroll);
  
  // Set initial frame and scroll state
  handleScroll();
  drawFrame(1);
  
  // Kick off frame-interpolation draw loop
  requestAnimationFrame(renderLoop);
});
