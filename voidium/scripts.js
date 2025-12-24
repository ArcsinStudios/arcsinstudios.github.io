"use strict";

class Input {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
    }
}

class Output {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
    }
}

class Blueprint {
    constructor(XScale, YScale, inputs, outputs, handleTime, sprite) {
        this.XScale = XScale;
        this.YScale = YScale;
        this.inputs = inputs;
        this.outputs = outputs;
        this.handleTime = handleTime;
        this.sprite = sprite;
    }
}

class Building {
    constructor(blueprint, XPos, YPos, direction) {
        this.blueprint = blueprint;
        this.XPos = XPos;
        this.YPos = YPos;
        this.direction = direction;
    }

    draw(canvasContext) {
        if (this.direction === 0) {
            canvasContext.drawImage(this.blueprint.sprite, this.XPos, this.YPos);
            return;
        }
        canvasContext.save();
        canvasContext.translate(this.XPos + tileSize / 2, this.YPos + tileSize / 2);
        if (this.direction === 2 || this.direction === 3) {
            canvasContext.scale(-1, 1);
        }
        if (this.direction === 1 || this.direction === 3) {
            canvasContext.rotate(-Math.PI / 2);
        }
        else {
            canvasContext.rotate(Math.PI);
        }
        canvasContext.drawImage(this.blueprint.sprite, -tileSize / 2, -tileSize / 2);
        canvasContext.restore();
    }
}

let tileSize = 24;
let tilesX = 30;
let tilesY = 20;

let canvas = document.getElementById("game-canvas");
let container = document.querySelector(".game-container");
let canvasContext = canvas.getContext("2d");

let canvasWidth = tileSize * tilesX;
let canvasHeight = tileSize * tilesY;
let canvasAr = canvasWidth / canvasHeight;

let imageLocations = ["background.png", "building_belt.png", "building_vacuum_pump.png"];
let images = [];
let imagesLoaded = -1;
let imagesTotal = imageLocations.length;

let blueprints = [];

let buildings = [];

let mouseX = 0;
let mouseY = 0;
let mouseGridX = 0;
let mouseGridY = 0;
let mouseGridBackX = 0;
let mouseGridBackY = 0;

let previewDirection = 0;

function loadImages(resolve, reject) {
    if (++imagesLoaded === imagesTotal) {
        console.log("[INFO] Loading complete");
        resolve();
        return;
    }
    images.push(new Image());
    images[imagesLoaded].onload = function() {
        loadImages(resolve, reject);
    };
    images[imagesLoaded].onerror = function() {
        console.log(`[ERROR] Failed to load ${imageLocations[imagesLoaded]}`);
        reject(new Error(`Failed to load ${imageLocations[imagesLoaded]}`));
    };
    images[imagesLoaded].src = imageLocations[imagesLoaded];
    console.log(`[TRACE] Loading ${imageLocations[imagesLoaded]} (${imagesLoaded + 1}/${imagesTotal})`);
}

function startLoad() {
    return new Promise(loadImages);
}

function initBlueprints() {
    let beltInputs = [];
    let beltOutputs = [];
    for (let i = 1; i < 4; ++i) {
        beltInputs.push(new Input(0, 0, i));
    }
    beltOutputs.push(new Output(0, 0, 0));
    blueprints.push(new Blueprint(1, 1, beltInputs, beltOutputs, 1, images[1]));

    let vacuumPumpOutputs = [];
    vacuumPumpOutputs.push(new Output(0, 0, 0));
    blueprints.push(new Blueprint(1, 1, [], vacuumPumpOutputs, 10, images[2]));
}

function initBuildings() {
    for (let i = 0; i < tilesY; ++i) {
        buildings.push([]);
        for (let j = 0; j < tilesX; ++j) {
            buildings[i].push(undefined);
        }
    }
}

function updateMousePosition(event) {
    let rect = canvas.getBoundingClientRect();
    mouseX = (event.clientX - rect.left) * canvasWidth / rect.width;
    mouseY = (event.clientY - rect.top) * canvasHeight / rect.height;
    mouseGridX = Math.floor(mouseX / tileSize);
    mouseGridY = Math.floor(mouseY / tileSize);
    mouseGridBackX = mouseGridX * tileSize;
    mouseGridBackY = mouseGridY * tileSize;
}

function updatePreviewDirection(event) {
    if (event.code === "ArrowDown") {
        previewDirection = 0;
    }
    else if (event.code === "ArrowRight") {
        previewDirection = 1;
    }
    else if (event.code === "ArrowUp") {
        previewDirection = 2;
    }
    else if (event.code === "ArrowLeft") {
        previewDirection = 3;
    }
}

function placeBuilding(event) {
    buildings[mouseGridY][mouseGridX] = new Building(blueprints[0], mouseGridBackX, mouseGridBackY, previewDirection);
}

function resizeCanvas() {
    let containerWidth = container.clientWidth;
    let containerHeight = container.clientHeight;
    let containerAr = containerWidth / containerHeight;
    let newCanvasWidth;
    let newCanvasHeight;
    if (containerAr > canvasAr) {
        newCanvasHeight = containerHeight;
        newCanvasWidth = containerHeight * canvasAr;
    }
    else {
        newCanvasWidth = containerWidth;
        newCanvasHeight = newCanvasWidth / canvasAr;
    }
    canvas.style.width = `${newCanvasWidth}px`;
    canvas.style.height = `${newCanvasHeight}px`;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}

function updateCanvas() {
    for (let i = 0; i < tilesY; ++i) {
        for (let j = 0; j < tilesX; ++j) {
            let iBack = i * tileSize;
            let jBack = j * tileSize;
            canvasContext.drawImage(images[0], jBack, iBack);
            if (buildings[i][j]) {
                buildings[i][j].draw(canvasContext);
            }
        }
    }
    let previewBuilding = new Building(blueprints[0], mouseGridBackX, mouseGridBackY, previewDirection);
    canvasContext.globalAlpha = 0.5;
    previewBuilding.draw(canvasContext);
    canvasContext.globalAlpha = 1;
    requestAnimationFrame(updateCanvas);
}

async function main() {
    await startLoad();
    initBlueprints();
    initBuildings();
    resizeCanvas();
    updateCanvas();
}

main();

window.addEventListener("resize", resizeCanvas);
window.addEventListener("mousemove", updateMousePosition);
window.addEventListener("keydown", updatePreviewDirection);
window.addEventListener("click", placeBuilding);