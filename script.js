const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

// Karte laden
const mapImage = new Image();
mapImage.src = 'https://raw.githubusercontent.com/Knuttie01/Einsatzplaner/main/images/Download.jpg'; // Korrekt

let mapWidth = 7800;  // Breite der Karte
let mapHeight = 7800; // Höhe der Karte

let offsetX = 2, offsetY = 2;
let scale = 1;
let isDrawing = false, isPanning = false;
let startX, startY;
let currentTool = 'move';
let color = 'red';
let drawings = [];

// Menü-Buttons
const menuButton = document.getElementById('menuButton');
const toggleDrawModeButton = document.getElementById('toggleDrawMode');
const eraserButton = document.getElementById('eraser');

function resizeCanvas() {
    canvas.width = window.innerWidth;  // Breite des Fensters
    canvas.height = window.innerHeight;  // Höhe des Fensters
    drawMap();
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
    drawMap();
});


function getMousePosition(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) / scale,
        y: (e.clientY - rect.top) / scale
    };
}

// Mousedown-Ereignis
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect(); // Position des Canvas im Fenster
    const mouseX = (e.clientX - rect.left); // Mausposition relativ zum Canvas (ohne Skalierung)
    const mouseY = (e.clientY - rect.top);

    if (currentTool === 'move') {
        // Bewegung starten
        isPanning = true;
        startX = mouseX / scale - offsetX; // Berechnung mit Skalierung
        startY = mouseY / scale - offsetY;
    } else if (currentTool === 'draw') {
        // Zeichnen starten
        isDrawing = true;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo((mouseX - offsetX * scale) / scale, (mouseY - offsetY * scale) / scale); // Korrekte Berechnung
    }
});

// Mousemove-Ereignis
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect(); // Position des Canvas im Fenster
    const mouseX = (e.clientX - rect.left); // Mausposition relativ zum Canvas (ohne Skalierung)
    const mouseY = (e.clientY - rect.top);

    if (isPanning) {
        // Bewegung umsetzen
        offsetX = (mouseX / scale - startX); // Position mit Skalierung korrekt berechnen
        offsetY = (mouseY / scale - startY);
        drawMap();  // Karte neu zeichnen
    } else if (isDrawing) {
        // Zeichnen umsetzen
        ctx.lineTo((mouseX - offsetX * scale) / scale, (mouseY - offsetY * scale) / scale); // Offset und Skalierung korrekt anwenden
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
        const newDrawing = {
            color: ctx.strokeStyle,
            lineWidth: ctx.lineWidth,
            path: ctx.getImageData(0, 0, canvas.width, canvas.height)
        };
        drawings.push(newDrawing);
    }
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY * -0.01;
    scale += zoomFactor;
    scale = Math.min(Math.max(0.5, scale), 5);
    drawMap();
});

// Touch-Unterstützung für Tablets
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const { x, y } = getMousePosition(touch);
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
        ctx.moveTo(x - offsetX / scale, y - offsetY / scale);
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const { x, y } = getMousePosition(touch);
    if (isPanning) {
        offsetX = touch.clientX - startX;
        offsetY = touch.clientY - startY;
        drawMap();
    } else if (isDrawing) {
        ctx.lineTo(x - offsetX / scale, y - offsetY / scale);
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

function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
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


    ctx.scale(scale, scale);
    ctx.drawImage(mapImage, offsetX / scale, offsetY / scale, drawWidth, drawHeight);
    ctx.restore();

    drawings.forEach(drawing => {
        ctx.putImageData(drawing.path, 0, 0);
    });
}

mapImage.onload = function() {
    console.log("Bild erfolgreich geladen.");
    drawMap();
};

mapImage.onerror = function() {
    console.error("Das Bild konnte nicht geladen werden. Überprüfe den Pfad und die Verfügbarkeit.");
};


window.addEventListener('resize', resizeCanvas);
resizeCanvas();
