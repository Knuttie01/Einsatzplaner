// Canvas und Kontexte initialisieren
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

// Karte laden
const mapImage = new Image();
mapImage.src = './Download.jpeg';

// Kartenparameter
let offsetX = 0, offsetY = 0;
let scale = 1;
let isPanning = false, isDrawing = false;
let startX, startY;
let currentTool = 'move';  // Standardwerkzeug ist Bewegung
let drawings = [];
let color = 'red';

// Zeichenwerkzeuge
const menuButton = document.getElementById('menuButton');
const toggleDrawModeButton = document.getElementById('toggleDrawMode');

// Menü sichtbar machen/verstecken
menuButton.addEventListener('click', () => {
    const menu = document.getElementById('menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
});

// Zeichenmodus umschalten
toggleDrawModeButton.addEventListener('click', () => {
    isDrawing = !isDrawing;
    currentTool = isDrawing ? 'draw' : 'move';
    toggleDrawModeButton.textContent = isDrawing ? 'Zeichenmodus: EIN' : 'Zeichenmodus: AUS';
});

// Farbwechsel
document.querySelectorAll('.draw-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
        color = e.target.getAttribute('data-color');
    });
});

// Radierer
document.getElementById('eraser').addEventListener('click', () => {
    drawings = [];
    drawMap();
});

// Mousedown Ereignis
canvas.addEventListener('mousedown', (e) => {
    if (currentTool === 'move') {
        isPanning = true;
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
    } else if (currentTool === 'draw') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo((e.clientX - offsetX) / scale, (e.clientY - offsetY) / scale);
    }
});

// Mousemove Ereignis
canvas.addEventListener('mousemove', (e) => {
    if (isPanning) {
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        drawMap();
    } else if (isDrawing) {
        ctx.lineTo((e.clientX - offsetX) / scale, (e.clientY - offsetY) / scale);
        ctx.stroke();
    }
});

// Mouseup Ereignis
canvas.addEventListener('mouseup', () => {
    isPanning = false;
    if (isDrawing) {
        drawings.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        isDrawing = false;
        ctx.closePath();
    }
});

// Zoom mit dem Mausrad
canvas.addEventListener('wheel', (e) => {
    const zoomFactor = e.deltaY * -0.01;
    scale += zoomFactor;
    scale = Math.min(Math.max(.5, scale), 3); // Begrenzen des Zooms
    drawMap();
});

// Touch-Unterstützung (zum Bewegen und Zeichnen)
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (currentTool === 'move') {
        isPanning = true;
        startX = touch.clientX - offsetX;
        startY = touch.clientY - offsetY;
    } else if (currentTool === 'draw') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo((touch.clientX - offsetX) / scale, (touch.clientY - offsetY) / scale);
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (isPanning) {
        offsetX = touch.clientX - startX;
        offsetY = touch.clientY - startY;
        drawMap();
    } else if (isDrawing) {
        ctx.lineTo((touch.clientX - offsetX) / scale, (touch.clientY - offsetY) / scale);
        ctx.stroke();
    }
});

canvas.addEventListener('touchend', () => {
    isPanning = false;
    if (isDrawing) {
        drawings.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        isDrawing = false;
        ctx.closePath();
    }
});

// Zeichnungen und Karte rendern
function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(scale, scale);
    ctx.drawImage(mapImage, offsetX / scale, offsetY / scale, canvas.width, canvas.height);
    ctx.restore();

    drawings.forEach(drawing => {
        ctx.putImageData(drawing, 0, 0);
    });
}