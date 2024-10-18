// Canvas Setup
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Laden der Karte
const mapImage = new Image();
mapImage.src = 'Download.jpeg';  // Füge hier den richtigen Pfad für die Datei "Download.jpeg" ein
mapImage.onload = function () {
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
};

let isDrawing = false;
let color = 'red';  // Standard-Zeichenfarbe
let isDragging = false;
let startX, startY;
let offsetX = 0, offsetY = 0;
let currentTool = 'move';  // Standardmodus

// Menü-Button Toggle
const menuButton = document.getElementById('menuButton');
const menu = document.getElementById('menu');
const closeMenuButton = document.getElementById('closeMenu');

// Öffnen des Menüs per Klick oder Touch
menuButton.addEventListener('click', () => {
    menu.style.display = 'block'; // Menü anzeigen
});
menuButton.addEventListener('touchstart', () => {
    menu.style.display = 'block'; // Menü anzeigen für Touch-Geräte
});

// Schließen des Menüs per Klick oder Touch
closeMenuButton.addEventListener('click', () => {
    menu.style.display = 'none';  // Menü ausblenden
});
closeMenuButton.addEventListener('touchstart', () => {
    menu.style.display = 'none';  // Menü ausblenden für Touch-Geräte
});

// Farbwechsel für den Zeichnen-Modus
document.querySelectorAll('.draw-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
        color = e.target.getAttribute('data-color');
        currentTool = 'draw';
    });
});

// Radierer
document.getElementById('eraser').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);  // Karte neu zeichnen
});

// Karte bewegen
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

// Zoom-Funktion
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY * -0.001;
    canvas.width += canvas.width * zoomFactor;
    canvas.height += canvas.height * zoomFactor;
    ctx.drawImage(mapImage, offsetX, offsetY, canvas.width, canvas.height);
});
