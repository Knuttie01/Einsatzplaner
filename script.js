// Initialisierung des Canvas und der Kontexte
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

// Karte laden
const mapImage = new Image();
mapImage.src = './Download.jpeg';  // Das 7800x7800 große Bild

let mapWidth = 7800;  // Breite der Karte
let mapHeight = 7800; // Höhe der Karte

let offsetX = 0, offsetY = 0;
let scale = 1;
let isDrawing = false, isPanning = false;
let startX, startY;
let currentTool = 'move';  // Standardmäßig im Bewegungsmodus
let color = 'red';  // Standardzeichnungsfarbe
let drawings = [];  // Speicherung aller Zeichnungen

// Menü-Buttons
const menuButton = document.getElementById('menuButton');
const toggleDrawModeButton = document.getElementById('toggleDrawMode');
const eraserButton = document.getElementById('eraser');

// Dynamische Anpassung der Canvas-Größe an das Fenster
function resizeCanvas() {
    canvas.width = window.innerWidth;  // Breite des Fensters
    canvas.height = window.innerHeight;  // Höhe des Fensters
    drawMap();  // Karte neu zeichnen
}

// Menü ein-/ausblenden
menuButton.addEventListener('click', () => {
    const menu = document.getElementById('menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
});

// Zeichenmodus ein-/ausschalten
toggleDrawModeButton.addEventListener('click', () => {
    isDrawing = !isDrawing;
    currentTool = isDrawing ? 'draw' : 'move';
    toggleDrawModeButton.textContent = isDrawing ? 'Zeichenmodus: EIN' : 'Zeichenmodus: AUS';
});

// Farbe wechseln
document.querySelectorAll('.draw-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
        color = e.target.getAttribute('data-color');
    });
});

// Radierer - Zeichnungen löschen
eraserButton.addEventListener('click', () => {
    drawings = [];
    drawMap();  // Karte und Canvas neu zeichnen
});

// Mousedown-Ereignis
canvas.addEventListener('mousedown', (e) => {
    if (currentTool === 'move') {
        // Bewegung starten
        isPanning = true;
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
    } else if (currentTool === 'draw') {
        // Zeichnen starten
        isDrawing = true;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo((e.clientX - offsetX) / scale, (e.clientY - offsetY) / scale);
    }
});

// Mousemove-Ereignis
canvas.addEventListener('mousemove', (e) => {
    if (isPanning) {
        // Bewegung umsetzen
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        drawMap();  // Karte neu zeichnen
    } else if (isDrawing) {
        // Zeichnen umsetzen
        ctx.lineTo((e.clientX - offsetX) / scale, (e.clientY - offsetY) / scale);
        ctx.stroke();
    }
});

// Mouseup-Ereignis
canvas.addEventListener('mouseup', () => {
    if (isPanning) {
        isPanning = false;
    }
    if (isDrawing) {
        isDrawing = false;
        ctx.closePath();
        // Zeichnung speichern
        const newDrawing = {
            color: ctx.strokeStyle,
            lineWidth: ctx.lineWidth,
            path: ctx.getImageData(0, 0, canvas.width, canvas.height)
        };
        drawings.push(newDrawing);
    }
});

// Zoom mit dem Mausrad
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();  // Standard-Zoom-Verhalten verhindern
    const zoomFactor = e.deltaY * -0.01;
    scale += zoomFactor;
    scale = Math.min(Math.max(0.5, scale), 3);  // Begrenzung des Zooms
    drawMap();
});

// Touch-Unterstützung für Tablets
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (currentTool === 'move') {
        // Bewegung per Touch
        isPanning = true;
        startX = touch.clientX - offsetX;
        startY = touch.clientY - offsetY;
    } else if (currentTool === 'draw') {
        // Zeichnen per Touch
        isDrawing = true;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
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
        isDrawing = false;
        ctx.closePath();
        const newDrawing = {
            color: ctx.strokeStyle,
            lineWidth: ctx.lineWidth,
            path: ctx.getImageData(0, 0, canvas.width, canvas.height)
        };
        drawings.push(newDrawing);
    }
});

// Funktion zum Zeichnen der Karte und der Zeichnungen
function drawMap() {
    // Hintergrund löschen
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    // Berechnung des Seitenverhältnisses der Karte
    const aspectRatio = mapWidth / mapHeight;
    const canvasRatio = canvas.width / canvas.height;
    
    let drawWidth, drawHeight;
    if (aspectRatio > canvasRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / aspectRatio;
    } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * aspectRatio;
    }

    // Karte zeichnen
    ctx.scale(scale, scale);
    ctx.drawImage(mapImage, offsetX / scale, offsetY / scale, drawWidth, drawHeight);
    ctx.restore();

    // Gespeicherte Zeichnungen wiederherstellen
    drawings.forEach(drawing => {
        ctx.putImageData(drawing.path, 0, 0);
    });
}

// Wenn die Karte geladen ist, das Canvas zeichnen
mapImage.onload = drawMap;

// Canvas dynamisch an Fenstergröße anpassen
window.addEventListener('resize', resizeCanvas);
resizeCanvas();  // Erste Initialisierung
