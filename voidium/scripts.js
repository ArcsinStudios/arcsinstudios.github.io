"use strict";

class Item {
    constructor(name, sprite) {
        this.name = name;
        this.sprite = sprite;
    }
}

class Input {
    constructor(x, y, dir) {
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.buffer = null;
    }
}

class Output {
    constructor(x, y, dir) {
        this.x = x;
        this.y = y;
        this.dir = dir;
    }
}

class Blueprint {
    constructor(XScale, YScale, inputs, outputs, handleTime, sprite) {
        this.XScale = XScale;
        this.YScale = YScale;
        this.inputs = inputs.map(
            function(input) {
                return new Input(input.x, input.y, input.dir);
            }
        );
        this.outputs = outputs.map(
            function(output) {
                return new Output(output.x, output.y, output.dir);
            }
        );
        this.handleTime = handleTime;
        this.sprite = sprite;
    }
}

class Building {
    constructor(blueprint, XPos, YPos, dir) {
        this.blueprint = new Blueprint(blueprint.XScale, blueprint.YScale, blueprint.inputs, blueprint.outputs, blueprint.handleTime, blueprint.sprite);
        this.XPos = XPos;
        this.YPos = YPos;
        this.XGridPos = this.XPos / 24;
        this.YGridPos = this.YPos / 24;
        this.dir = dir;
        this.currHandleTime = 0;
        if (dir === 0) {
            return;
        }
        let angle = this.dir * Math.PI / 2;
        if (dir !== 2) {
            let temp = this.blueprint.XScale;
            this.blueprint.XScale = this.blueprint.YScale;
            this.blueprint.YScale = temp;
        }
        for (let input of this.blueprint.inputs) {
            let _x = input.x;
            let _y = input.y;
            input.x = Math.round(_x * Math.cos(angle) - _y * Math.sin(angle));
            input.y = Math.round(_x * Math.sin(angle) + _y * Math.cos(angle));
            input.dir = (input.dir + this.dir) % 4;
        }
        for (let output of this.blueprint.outputs) {
            let _x = output.x;
            let _y = output.y;
            output.x = Math.round(_x * Math.cos(angle) - _y * Math.sin(angle));
            output.y = Math.round(_x * Math.sin(angle) + _y * Math.cos(angle));
            output.dir = (output.dir + this.dir) % 4;
        }
    }

    checkInput(output) {
        let targetX = output.x;
        let targetY = output.y;
        if (output.dir % 2 === 0) {
            targetY += 1 - output.dir;
        }
        else {
            targetX += 2 - output.dir;
        }
        if (buildings[targetY][targetX].blueprint.inputs.find(
            function(input) {
                return input.x === targetX && input.y === targetY && input.dir === (dir + 2) % 4;
            }
        )) {
            return true;
        }
        else {
            return false;
        }
    }

    draw(canvasCtx) {
        if (this.dir === 0) {
            canvasCtx.drawImage(this.blueprint.sprite, this.XPos, this.YPos);
            return;
        }
        let centerXOffset = this.blueprint.XScale * gridSize / 2;
        let centerYOffset = this.blueprint.YScale * gridSize / 2;
        canvasCtx.save();
        canvasCtx.translate(this.XPos + centerXOffset, this.YPos + centerYOffset);
        if (this.dir > 1) {
            canvasCtx.scale(-1, 1);
        }
        if (this.dir === 2) {
            canvasCtx.rotate(Math.PI);
        }
        else {
            canvasCtx.rotate(-Math.PI / 2);
        }
        canvasCtx.drawImage(this.blueprint.sprite, -centerXOffset, -centerYOffset);
        canvasCtx.restore();
    }

    update(buildings) {
        if (currHandleTime === 0) {
            // TODO
        }
        else {
            currHandleTime = (currHandleTime + 1) % handleTime;
        }
    }
}

let gridSize = 24;
let gridsX = 30;
let gridsY = 20;

let canvasWidth = gridSize * gridsX;
let canvasHeight = gridSize * gridsY;
let canvasAr = canvasWidth / canvasHeight;

let imageLocs = ["background_tile.png", "building_belt.png", "building_vacuum_pump.png"];
let images = [];
let imagesLoaded = -1;
let imagesTotal = imageLocs.length;

let blueprints = [];
let buildings = [];

let mouseX = 0;
let mouseY = 0;
let mouseGridX = 0;
let mouseGridY = 0;
let mouseGridBackX = 0;
let mouseGridBackY = 0;
let previewDir = 0;

let canvas = document.getElementById("game-canvas");
let container = document.querySelector(".game-container");
let canvasCtx = canvas.getContext("2d");

async function main() {
    await loadImgs();
    initBlueprints();
    initBuildings();
    resizeCanvas();
    updateCanvas();
}

function loadImgs() {
    return new Promise(loadImgsImpl);
}

function loadImgsImpl(resolve, reject) {
    if (++imagesLoaded === imagesTotal) {
        console.log("[INFO] Loading complete");
        resolve();
        return;
    }
    images.push(new Image());
    images[imagesLoaded].onload = function() {
        loadImgsImpl(resolve, reject);
    };
    images[imagesLoaded].onerror = function() {
        console.log(`[ERROR] Failed to load ${imageLocs[imagesLoaded]}`);
        reject(new Error(`Failed to load ${imageLocs[imagesLoaded]}`));
    };
    images[imagesLoaded].src = imageLocs[imagesLoaded];
    console.log(`[TRACE] Loading ${imageLocs[imagesLoaded]} (${imagesLoaded + 1}/${imagesTotal})`);
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
    for (let i = 0; i < gridsY; ++i) {
        buildings.push([]);
        for (let j = 0; j < gridsX; ++j) {
            buildings[i].push(undefined);
        }
    }
}

function placeBuilding(event) {
    buildings[mouseGridY][mouseGridX] = new Building(blueprints[0], mouseGridBackX, mouseGridBackY, previewDir);
}

function updateMousePos(event) {
    let rect = canvas.getBoundingClientRect();
    mouseX = (event.clientX - rect.left) * canvasWidth / rect.width;
    mouseY = (event.clientY - rect.top) * canvasHeight / rect.height;
    mouseGridX = Math.floor(mouseX / gridSize);
    mouseGridY = Math.floor(mouseY / gridSize);
    mouseGridBackX = mouseGridX * gridSize;
    mouseGridBackY = mouseGridY * gridSize;
}

function updatePreviewDir(event) {
    if (event.key === "ArrowDown") {
        previewDir = 0;
    }
    else if (event.key === "ArrowRight") {
        previewDir = 1;
    }
    else if (event.key === "ArrowUp") {
        previewDir = 2;
    }
    else if (event.key === "ArrowLeft") {
        previewDir = 3;
    }
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
    for (let i = 0; i < gridsY; ++i) {
        for (let j = 0; j < gridsX; ++j) {
            let iBack = i * gridSize;
            let jBack = j * gridSize;
            canvasCtx.drawImage(images[0], jBack, iBack);
        }
    }
    for (let i = 0; i < gridsY; ++i) {
        for (let j = 0; j < gridsX; ++j) {
            if (buildings[i][j]) {
                buildings[i][j].draw(canvasCtx);
            }
        }
    }
    let previewBuilding = new Building(blueprints[0], mouseGridBackX, mouseGridBackY, previewDir);
    canvasCtx.globalAlpha = 0.5;
    previewBuilding.draw(canvasCtx);
    canvasCtx.globalAlpha = 1;
    requestAnimationFrame(updateCanvas);
}

main();

window.addEventListener("click", placeBuilding);
window.addEventListener("keydown", updatePreviewDir);
window.addEventListener("mousemove", updateMousePos);
window.addEventListener("resize", resizeCanvas);