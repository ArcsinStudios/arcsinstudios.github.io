"use strict";

class Item {
    constructor(name, sprite) {
        this.name = name;
        this.sprite = sprite;
    }

    duplicate() {
        return new Item(this.name, this.sprite);
    }
}

class Input {
    constructor(x, y, dir) {
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.buffer = [];
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
    constructor(XScale, YScale, producer, consumer, content, inputs, outputs, handleTime, handle, sprite) {
        this.XScale = XScale;
        this.YScale = YScale;
        this.producer = producer;
        this.consumer = consumer;
        this.content = content;
        if (this.producer) {
            this.inputs = [];
        }
        else {
            this.inputs = inputs.map(
                function(input) {
                    return new Input(input.x, input.y, input.dir);
                }
            );
        }
        if (this.consumer) {
            this.outputs = [];
        }
        else {
            this.outputs = outputs.map(
                function(output) {
                    return new Output(output.x, output.y, output.dir);
                }
            );
        }
        this.handleTime = handleTime;
        this.handle = handle;
        this.sprite = sprite;
    }
}

class Building {
    constructor(blueprint, XPos, YPos, dir) {
        this.blueprint = new Blueprint(
            blueprint.XScale, blueprint.YScale,
            blueprint.producer, blueprint.consumer,
            blueprint.content, blueprint.inputs, blueprint.outputs,
            blueprint.handleTime, blueprint.handle.bind(this),
            blueprint.sprite
        );
        this.XPos = XPos;
        this.YPos = YPos;
        this.XGridPos = this.XPos / 24;
        this.YGridPos = this.YPos / 24;
        this.dir = dir;
        this.currHandleTime = 0;
        this.contentItems = [];
        this.updateStage = 0;
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

    checkOppPos(what) {
        let targetX = this.XGridPos + what.x;
        let targetY = this.YGridPos + what.y;
        if (what.dir % 2 === 0) {
            targetY += 1 - what.dir;
        }
        else {
            targetX += 2 - what.dir;
        }
        if (targetX < 0 || targetX >= gridsX || targetY < 0 || targetY >= gridsY) {
            return [null, null, null];
        }
        let building = buildings[targetY][targetX];
        if (building instanceof BuildingPlaceholder) {
            building = building.origin;
        }
        return [building, targetX, targetY];
    }

    checkInput(output) {
        let pack = this.checkOppPos(output);
        let building = pack[0];
        let targetX = pack[1];
        let targetY = pack[2];
        if (building) {
            return building.blueprint.inputs.find(
                function(input) {
                    return input.x === targetX - building.XGridPos && input.y === targetY - building.YGridPos && input.dir === (output.dir + 2) % 4;
                }
            );
        }
    }

    checkOutput(input) {
        let pack = this.checkOppPos(input);
        let building = pack[0];
        let targetX = pack[1];
        let targetY = pack[2];
        if (building) {
            return building.blueprint.outputs.find(
                function(output) {
                    return output.x === targetX - building.XGridPos && output.y === targetY - building.YGridPos && output.dir === (input.dir + 2) % 4;
                }
            );
        }
    }

    draw(canvasCtx) {
        if (this.dir === 0) {
            canvasCtx.drawImage(this.blueprint.sprite, this.XPos, this.YPos);
        }
        else {
            let centerXOffset = this.blueprint.XScale * gridSize / 2;
            let centerYOffset = this.blueprint.YScale * gridSize / 2;
            canvasCtx.save();
            canvasCtx.translate(this.XPos + centerXOffset, this.YPos + centerYOffset);
            if (this.dir > 1) {
                canvasCtx.scale(-1, 1);
            }
            if (this.dir === 2) {
                canvasCtx.rotate(Math.PI);
                canvasCtx.drawImage(this.blueprint.sprite, -centerXOffset, -centerYOffset);
            }
            else {
                canvasCtx.rotate(-Math.PI / 2);
                canvasCtx.drawImage(this.blueprint.sprite, -centerYOffset, -centerXOffset);
            }
            canvasCtx.restore();
        }
        if (this.contentItems.length !== 0) {
            canvasCtx.drawImage(this.contentItems[0].sprite, this.XPos, this.YPos);
        }
    }

    update0() {
        this.updateStage = 0;
        this.currHandleTime = (this.currHandleTime + 1) % this.blueprint.handleTime;
        if (this.currHandleTime === 0) {
            this.blueprint.handle();
        }
    }

    update1() {
        if (this.updateStage === 1) {
            return;
        }
        this.updateStage = 1;
        let total = this.contentItems.length;
        for (let input of this.blueprint.inputs) {
            total += input.buffer.length;
        }
        if (total > this.blueprint.content) {
            for (let input of this.blueprint.inputs) {
                let outputPos = this.checkOppPos(input)[0];
                if (!outputPos) {
                    continue;
                }
                while (input.buffer.length > 0 && total > this.blueprint.content) {
                    let temp = input.buffer.pop();
                    --total;
                    if (outputPos.blueprint.producer || outputPos.contentItems.length === outputPos.blueprint.content) {
                        break;
                    }
                    outputPos.contentItems.push(temp);
                }
                outputPos.update1();
            }
        }
        for (let input of this.blueprint.inputs) {
            while (input.buffer.length > 0) {
                this.contentItems.push(input.buffer.pop());
            }
        }
    }
}

class BuildingPlaceholder {
    constructor(origin) {
        this.origin = origin;
    }
}

let gridSize = 24;
let gridsX = 30;
let gridsY = 20;

let canvasWidth = gridSize * gridsX;
let canvasHeight = gridSize * gridsY;
let canvasAr = canvasWidth / canvasHeight;

let imageLocs = ["background_tile.png", "building_belt.png", "building_vacuum_pump.png", "item_voidium.png"];
let images = [];
let imagesLoaded = -1;
let imagesTotal = imageLocs.length;

let items = [];
let blueprints = [];
let buildings = [];

let mouseX = 0;
let mouseY = 0;
let mouseGridX = 0;
let mouseGridY = 0;
let mouseGridBackX = 0;
let mouseGridBackY = 0;
let previewNum = 0;
let previewDir = 0;

let canvas = document.getElementById("game-canvas");
let container = document.querySelector(".game-container");
let canvasCtx = canvas.getContext("2d");

async function main() {
    await loadImgs();
    initItems();
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

function initItems() {
    items.push(new Item("Voidium", images[3]));
}

function initBlueprints() {
    blueprints.push(new Blueprint(1, 1, false, false, 1, [new Input(0, 0, 1), new Input(0, 0, 2), new Input(0, 0, 3)], [new Output(0, 0, 0)], 30,
    function() {
        if (this.contentItems.length === 0) {
            return;
        }
        for (let output of this.blueprint.outputs) {
            let input = this.checkInput(output);
            if (input) {
                input.buffer.push(this.contentItems.pop());
            }
        }
    },
    images[1]));
    blueprints.push(new Blueprint(1, 2, true, false, 1, [], [new Output(0, 1, 0)], 120,
    function() {
        for (let output of this.blueprint.outputs) {
            let inputPos = this.checkOppPos(output)[0];
            if (!inputPos) {
                return;
            }
            if (inputPos.contentItems.length === inputPos.blueprint.content) {
                return;
            }
            let input = this.checkInput(output);
            if (input) {
                input.buffer.push(items[0].duplicate());
            }
        }
    },
    images[2]));
}

function initBuildings() {
    for (let i = 0; i < gridsY; ++i) {
        buildings.push([]);
        for (let j = 0; j < gridsX; ++j) {
            buildings[i].push(null);
        }
    }
}

function placeBuilding(event) {
    for (let i = 0; i < blueprints[previewNum].YScale; ++i) {
        for (let j = 0; j < blueprints[previewNum].XScale; ++j) {
            if (i === 0 && j === 0) {
                buildings[mouseGridY][mouseGridX] = new Building(blueprints[previewNum], mouseGridBackX, mouseGridBackY, previewDir);
                continue;
            }
            buildings[mouseGridY + i][mouseGridX + j] = new BuildingPlaceholder(buildings[mouseGridY][mouseGridX]);
        }
    }
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

function updatePreview(event) {
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
    else {
        let num = parseInt(event.key);
        if (!Number.isNaN(num)) {
            previewNum = num;
        }
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
            if (buildings[i][j] && buildings[i][j] instanceof Building) {
                buildings[i][j].draw(canvasCtx);
            }
        }
    }
    for (let i = 0; i < gridsY; ++i) {
        for (let j = 0; j < gridsX; ++j) {
            if (buildings[i][j] && buildings[i][j] instanceof Building) {
                buildings[i][j].update0();
            }
        }
    }
    for (let i = 0; i < gridsY; ++i) {
        for (let j = 0; j < gridsX; ++j) {
            if (buildings[i][j] && buildings[i][j] instanceof Building) {
                buildings[i][j].update1();
            }
        }
    }
    let previewBuilding = new Building(blueprints[previewNum], mouseGridBackX, mouseGridBackY, previewDir);
    canvasCtx.globalAlpha = 0.5;
    previewBuilding.draw(canvasCtx);
    canvasCtx.globalAlpha = 1;
    requestAnimationFrame(updateCanvas);
}

main();

window.addEventListener("click", placeBuilding);
window.addEventListener("keydown", updatePreview);
window.addEventListener("mousemove", updateMousePos);
window.addEventListener("resize", resizeCanvas);