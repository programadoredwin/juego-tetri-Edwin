const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

let rows = 20;
let cols = 10;
let board;
let currentPiece;
let score = 0;
let level = 1;
let speed = 700; // Velocidad inicial
let gameInterval;

function ajustarCanvas() {
    canvas.width = Math.min(window.innerWidth * 0.9, 400); // Ancho dinámico
    canvas.height = canvas.width * 2; // Mantén la relación de aspecto 10:20
    cellSize = canvas.width / cols; // Tamaño de celda basado en el ancho
}
ajustarCanvas();
window.addEventListener("resize", ajustarCanvas); // Ajustar en redimensión

const pieces = [
    { shape: [[1, 1, 1, 1]], color: "#3498db" }, // Línea
    { shape: [[1, 1], [1, 1]], color: "#f1c40f" }, // Cuadrado
    { shape: [[0, 1, 0], [1, 1, 1]], color: "#8e44ad" }, // T
    { shape: [[0, 1, 1], [1, 1, 0]], color: "#e74c3c" }, // Z
    { shape: [[1, 1, 0], [0, 1, 1]], color: "#2ecc71" }, // S
];

// Crear tablero vacío
function iniciarTablero() {
    board = Array.from({ length: rows }, () => Array(cols).fill(0));
}

// Generar una nueva pieza
function spawnPiece() {
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    currentPiece = {
        shape: randomPiece.shape,
        color: randomPiece.color,
        row: 0,
        col: Math.floor(cols / 2) - Math.floor(randomPiece.shape[0].length / 2),
    };
}

// Dibujar el tablero
function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell) {
                context.fillStyle = cell;
                context.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
                context.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);
            }
        });
    });
}

// Dibujar la pieza actual
function drawPiece() {
    currentPiece.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell) {
                const x = (currentPiece.col + c) * cellSize;
                const y = (currentPiece.row + r) * cellSize;
                context.fillStyle = currentPiece.color;
                context.fillRect(x, y, cellSize, cellSize);
                context.strokeStyle = "black";
                context.strokeRect(x, y, cellSize, cellSize);
            }
        });
    });
}

// Detectar colisión
function isCollision() {
    return currentPiece.shape.some((row, r) =>
        row.some((cell, c) => {
            if (cell) {
                const x = currentPiece.col + c;
                const y = currentPiece.row + r;
                return y >= rows || x < 0 || x >= cols || board[y]?.[x];
            }
            return false;
        })
    );
}

// Fusionar pieza al tablero
function mergePiece() {
    currentPiece.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell) {
                board[currentPiece.row + r][currentPiece.col + c] = currentPiece.color;
            }
        });
    });
}

// Limpiar líneas completas
function clearLines() {
    board = board.filter(row => row.some(cell => cell === 0));
    while (board.length < rows) {
        board.unshift(Array(cols).fill(0));
    }
    score++;
    document.getElementById("score").textContent = score;
    if (score % 10 === 0) {
        level++;
        speed = Math.max(speed - 50, 300);
        document.getElementById("level").textContent = level;
        clearInterval(gameInterval);
        startGame();
    }
}

// Mover la pieza hacia abajo
function moveDown() {
    currentPiece.row++;
    if (isCollision()) {
        currentPiece.row--;
        mergePiece();
        clearLines();
        spawnPiece();
    }
}

// Controles del jugador
document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") currentPiece.col--;
    if (event.key === "ArrowRight") currentPiece.col++;
    if (event.key === "ArrowDown") moveDown();
    if (event.key === "ArrowUp") rotatePiece();
});

// Rotar la pieza
function rotatePiece() {
    const rotatedShape = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    const originalShape = currentPiece.shape;
    currentPiece.shape = rotatedShape;
    if (isCollision()) currentPiece.shape = originalShape;
}

// Iniciar el juego
function startGame() {
    spawnPiece();
    drawBoard();
    gameInterval = setInterval(() => {
        moveDown();
        drawBoard();
        drawPiece();
    }, speed);
}

iniciarTablero();
startGame();