// Canvas Setup
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

// Größe des Canvas anpassen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Laden der Karte
const mapImage = new Image();
mapImage.src = './Download.jpeg';
mapImage.onload = function () {
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
};

let isDrawing = false;
let color = 'red';  // Standard-Zeichenfarbe
let isDragging = false;
let startX, startY;
let offsetX = 0, offsetY = 0;
let drawMode = false; // Zeichenmodus initial deaktiviert
let currentTool = 'move';  // Standardmodus

// Menü-Button Toggle
const menuButton = document.getElementById('menuButton');
const menu = document.getElementById('menu');
const closeMenuButton = document.getElementById('closeMenu');
const toggleDrawModeButton = document.getElementById('toggleDrawMode');

menuButton.addEventListener('click', () => {
    menu.style.display = 'block'; // Menü anzeigen
});

closeMenuButton.addEventListener('click', () => {
    menu.style.display = 'none';  // Menü ausblenden
});

// Farbwechsel für den Zeichnen-Modus
document.querySelectorAll('.draw-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
        color = e.target.getAttribute('data-color');
    });
});

// Zeichenmodus-Toggle
toggleDrawModeButton.addEventListener('click', () => {
    drawMode = !drawMode;  // Zeichenmodus umschalten
    toggleDrawModeButton.textContent = drawMode ? 'Zeichnen: EIN' : 'Zeichnen: AUS';
    currentTool = drawMode ? 'draw' : 'move'; // Zwischen Zeichnen und Bewegen wechseln
});

// Radierer
document.getElementById('eraser').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);  // Karte neu zeichnen
});

// Karte bewegen oder zeichnen – Desktop
canvas.addEventListener('mousedown', (e) => {
    if (currentTool === 'move') {
        isDragging = true;
        startX = e.offsetX - offsetX;
        startY = e.offsetY - offsetY;
    } else if (currentTool === 'draw') {
        isDrawing = true;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        offsetX = e.offsetX - startX;
        offsetY = e.offsetY - startY;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(mapImage, offsetX, offsetY, canvas.width, canvas.height);
    } else if (isDrawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    isDrawing = false;
    ctx.closePath();
});

// Touch-Unterstützung für mobile Geräte
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (currentTool === 'move') {
        isDragging = true;
        let touch = e.touches[0];
        startX = touch.pageX - offsetX;
        startY = touch.pageY - offsetY;
    } else if (currentTool === 'draw') {
        isDrawing = true;
        let touch = e.touches[0];
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(touch.pageX, touch.pageY);
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDragging) {
        let touch = e.touches[0];
        offsetX = touch.pageX - startX;
        offsetY = touch.pageY - startY;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(mapImage, offsetX, offsetY, canvas.width, canvas.height);
    } else if (isDrawing) {
        let touch = e.touches[0];
        ctx.lineTo(touch.pageX, touch.pageY);
        ctx.stroke();
    }
});

canvas.addEventListener('touchend', () => {
    isDragging = false;
    isDrawing = false;
    ctx.closePath();
});

// Zoom-Funktion
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY * -0.001;
    canvas.width += canvas.width * zoomFactor;
    canvas.height += canvas.height * zoomFactor;
    ctx.drawImage(mapImage, offsetX, offsetY, canvas.width, canvas.height);
});