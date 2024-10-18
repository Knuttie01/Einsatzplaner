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
    drawMap();  // Karte initial zeichnen
};

// Variablen zur Steuerung
let isDrawing = false;
let color = 'red';  // Standard-Zeichenfarbe
let isDragging = false;
let startX, startY;
let offsetX = 0, offsetY = 0;
let drawMode = false; // Zeichenmodus initial deaktiviert
let currentTool = 'move';  // Standardmodus ist Bewegung
let scale = 1;  // Initiale Zoom-Skalierung
let drawings = [];  // Zeichnungen speichern

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
    toggleDrawModeButton.textContent = drawMode ? 'Zeichnen: EINs' : 'Zeichnen: AUS';
    currentTool = drawMode ? 'draw' : 'move'; // Zwischen Zeichnen und Bewegen wechseln
    if (drawMode) {
        canvas.style.cursor = "crosshair";  // Fadenkreuz-Cursor
    } else {
        canvas.style.cursor = "grab";  // Hand-Cursor
    }
});

// Radierer
document.getElementById('eraser').addEventListener('click', () => {
    drawings = [];  // Alle Zeichnungen löschen
    drawMap();  // Karte neu zeichnen
});

// Karte bewegen oder zeichnen – Desktop
canvas.addEventListener('mousedown', (e) => {
    if (currentTool === 'move') {
        isDragging = true;
        canvas.style.cursor = "grabbing";  // Feedback für Bewegung
        startX = e.offsetX - offsetX;
        startY = e.offsetY - offsetY;
    } else if (currentTool === 'draw') {
        isDrawing = true;
        ctx.strokeStyle = color;  // Farbe anwenden
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo((e.offsetX - offsetX) / scale, (e.offsetY - offsetY) / scale);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging && currentTool === 'move') {
        offsetX = e.offsetX - startX;
        offsetY = e.offsetY - startY;
        drawMap();  // Karte neu zeichnen bei Bewegung
    } else if (isDrawing && currentTool === 'draw') {
        ctx.lineTo((e.offsetX - offsetX) / scale, (e.offsetY - offsetY) / scale);
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    if (isDrawing && currentTool === 'draw') {
        isDrawing = false;
        ctx.closePath();
        drawings.push({ color, path: ctx.getImageData(0, 0, canvas.width, canvas.height) });
    }
    if (currentTool === 'move') {
        canvas.style.cursor = "grab";  // Cursor zurücksetzen
    }
});

// Touch-Unterstützung für mobile Geräte
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    let touch = e.touches[0];
    if (currentTool === 'move') {
        isDragging = true;
        startX = touch.pageX - offsetX;
        startY = touch.pageY - offsetY;
    } else if (currentTool === 'draw') {
        isDrawing = true;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo((touch.pageX - offsetX) / scale, (touch.pageY - offsetY) / scale);
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    let touch = e.touches[0];
    if (isDragging && currentTool === 'move') {
        offsetX = touch.pageX - startX;
        offsetY = touch.pageY - startY;
        drawMap();
    } else if (isDrawing && currentTool === 'draw') {
        ctx.lineTo((touch.pageX - offsetX) / scale, (touch.pageY - offsetY) / scale);
        ctx.stroke();
    }
});

canvas.addEventListener('touchend', () => {
    isDragging = false;
    if (isDrawing && currentTool === 'draw') {
        isDrawing = false;
        ctx.closePath();
        drawings.push({ color, path: ctx.getImageData(0, 0, canvas.width, canvas.height) });
    }
});

// Zoom-Funktion
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY * -0.01;
    scale += zoomFactor;
    if (scale < 0.5) scale = 0.5;
    if (scale > 3) scale = 3;
    drawMap();  // Karte neu zeichnen mit Zoom
});

// Zeichnen und Karte synchronisieren
function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(scale, scale);
    ctx.drawImage(mapImage, offsetX / scale, offsetY / scale, canvas.width, canvas.height);
    ctx.restore();

    // Zeichnungen wiederherstellen
    drawings.forEach(drawing => {
        ctx.putImageData(drawing.path, 0, 0);
    });
}