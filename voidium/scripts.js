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
    constructor(XScale, YScale, acceptReturn, displayItems, content, inputs, outputs, handleTime, handle, sprite) {
        this.XScale = XScale;
        this.YScale = YScale;
        this.acceptReturn = acceptReturn;
        this.displayItems = displayItems;
        this.content = content;
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
        this.handle = handle;
        this.sprite = sprite;
    }
}

class Building {
    constructor(blueprint, XPos, YPos, dir) {
        this.blueprint = new Blueprint(
            blueprint.XScale, blueprint.YScale,
            blueprint.acceptReturn, blueprint.displayItems,
            blueprint.content,
            blueprint.inputs, blueprint.outputs,
            blueprint.handleTime,
            blueprint.handle.bind(this),
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
        let angle = -this.dir * Math.PI / 2;
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        if (dir !== 2) {
            let temp = this.blueprint.XScale;
            this.blueprint.XScale = this.blueprint.YScale;
            this.blueprint.YScale = temp;
        }
        for (let input of this.blueprint.inputs) {
            let x = input.x;
            let y = input.y;
            input.x = Math.round(x * cos - y * sin);
            input.y = Math.round(x * sin + y * cos);
            input.dir = (input.dir + this.dir) % 4;
        }
        for (let output of this.blueprint.outputs) {
            let x = output.x;
            let y = output.y;
            output.x = Math.round(x * cos - y * sin);
            output.y = Math.round(x * sin + y * cos);
            output.dir = (output.dir + this.dir) % 4;
        }
        let minX = 0;
        let minY = 0;
        for (let input of this.blueprint.inputs) {
            if (input.x < minX) {
                minX = input.x;
            }
            if (input.y < minY) {
                minY = input.y;
            }
        }
        for (let output of this.blueprint.outputs) {
            if (output.x < minX) {
                minX = output.x;
            }
            if (output.y < minY) {
                minY = output.y;
            }
        }
        for (let input of this.blueprint.inputs) {
            input.x -= minX;
            input.y -= minY;
        }
        for (let output of this.blueprint.outputs) {
            output.x -= minX;
            output.y -= minY;
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
        if (!this.blueprint.displayItems) {
            return;
        }
        for (let i = 0; i < Math.min(this.contentItems.length, this.blueprint.XScale * this.blueprint.YScale); ++i) {
            canvasCtx.drawImage(this.contentItems[i].sprite, this.XPos + i % this.blueprint.XScale * gridSize, this.YPos + Math.floor(i / this.blueprint.XScale) * gridSize);
        }
    }

    update0() {
        this.updateStage = 0;
        this.currHandleTime = (this.currHandleTime + 1) % this.blueprint.handleTime;
        this.blueprint.handle();
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
                    if (!outputPos.blueprint.acceptReturn) {
                        continue;
                    }
                    outputPos.contentItems.push(temp);
                }
                outputPos.update1();
            }
        }
    }

    update2() {
        this.updateStage = 2;
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

let imageLocs = [
    "background_tile.png",
    "building_belt.png",
    "building_vacuum_pump.png",
    "item_voidium.png",
    "building_mint.png",
    "building_buffer.png",
    "building_centrifuge.png",
    "item_airium.png",
    "item_earthium.png",
    "item_firium.png",
    "item_waterium.png"
];
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
let crt0 = document.getElementById("crt0");
let crt1 = document.getElementById("crt1");
let container = document.querySelector(".game-container");
let info = document.querySelector(".game-info");
let canvasCtx = canvas.getContext("2d");

let voidium = 0;
let airium = 0;
let earthium = 0;
let firium = 0;
let waterium = 0;

function iterHelper(func) {
    for (let i = 0; i < gridsY; ++i) {
        for (let j = 0; j < gridsX; ++j) {
            func(i, j);
        }
    }
}

async function main() {
    await loadImgs();
    initItems();
    initBlueprints();
    initBuildings();
    resizeCanvas();
    update();
}

function update() {
    updateCanvas();
    updateUI();
    requestAnimationFrame(update);
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
    items.push(new Item("Airium", images[7]));
    items.push(new Item("Earthium", images[8]));
    items.push(new Item("Firium", images[9]));
    items.push(new Item("Waterium", images[10]));
}

function initBlueprints() {
    blueprints.push(
        new Blueprint(
            1, 1,
            true, true,
            1,
            [new Input(0, 0, 1), new Input(0, 0, 2), new Input(0, 0, 3)], [new Output(0, 0, 0)],
            30,
            function() {
                if (this.currHandleTime % this.blueprint.handleTime !== 0) {
                    return;
                }
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
            images[1]
        )
    );
    blueprints.push(
        new Blueprint(
            1, 2,
            false, false,
            1,
            [], [new Output(0, 1, 0)],
            120,
            function() {
                if (this.currHandleTime % this.blueprint.handleTime !== 0) {
                    return;
                }
                for (let output of this.blueprint.outputs) {
                    let inputPos = this.checkOppPos(output)[0];
                    if (!inputPos) {
                        continue;
                    }
                    if (inputPos.contentItems.length === inputPos.blueprint.content) {
                        continue;
                    }
                    let input = this.checkInput(output);
                    if (input) {
                        input.buffer.push(items[0].duplicate());
                    }
                }
            },
            images[2]
        )
    );
    blueprints.push(
        new Blueprint(
            2, 2,
            true, false,
            8,
            [new Input(0, 0, 2), new Input(0, 0, 3), new Input(1, 0, 1), new Input(1, 0, 2), new Input(0, 1, 0), new Input(0, 1, 3), new Input(1, 1, 0), new Input(1, 1, 1)], [],
            1,
            function() {
                if (this.currHandleTime % this.blueprint.handleTime !== 0) {
                    return;
                }
                for (let item of this.contentItems) {
                    if (item.name === "Voidium") {
                        ++voidium;
                    }
                    else if (item.name === "Airium") {
                        ++airium;
                    }
                    else if (item.name === "Earthium") {
                        ++earthium;
                    }
                    else if (item.name === "Firium") {
                        ++firium;
                    }
                    else if (item.name === "Waterium") {
                        ++waterium;
                    }
                }
                this.contentItems = [];
            },
            images[4]
        )
    );
    blueprints.push(
        new Blueprint(
            2, 1,
            true, true,
            20,
            [new Input(0, 0, 2), new Input(1, 0, 2)], [new Output(0, 0, 0)],
            1,
            function() {
                if (this.currHandleTime % this.blueprint.handleTime !== 0) {
                    return;
                }
                for (let output of this.blueprint.outputs) {
                    let inputPos = this.checkOppPos(output)[0];
                    if (!inputPos) {
                        continue;
                    }
                    let cnt = Math.min(this.contentItems.length, inputPos.blueprint.content - inputPos.contentItems.length);
                    let input = this.checkInput(output);
                    for (let i = 0; i < cnt; ++i) {
                        input.buffer.push(this.contentItems.pop());
                    }
                }
            },
            images[5]
        )
    );
    blueprints.push(
        new Blueprint(
            2, 2,
            false, false,
            1,
            [new Input(0, 0, 2)], [new Output(0, 1, 0)],
            240,
            function() {
                if (this.contentItems.length === 0) {
                    return;
                }
                if (this.contentItems[0].name !== "Voidium") {
                    return;
                }
                let quarter = Math.round(this.blueprint.handleTime / 4);
                if (this.currHandleTime % quarter !== 0) {
                    return;
                }
                let inputPos = this.checkOppPos(this.blueprint.outputs[0])[0];
                if (!inputPos) {
                    return;
                }
                let input = this.checkInput(this.blueprint.outputs[0]);
                input.buffer.push(items[(this.currHandleTime / quarter + 3) % 4 + 1].duplicate());
                if (this.currHandleTime === 0) {
                    this.contentItems = [];
                }
            },
            images[6]
        )
    );
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
    if (mouseGridX >= gridsX || mouseGridY >= gridsY) {
        return;
    }
    if (buildings[mouseGridY][mouseGridX]) {
        return;
    }
    buildings[mouseGridY][mouseGridX] = new Building(blueprints[previewNum], mouseGridBackX, mouseGridBackY, previewDir);
    for (let i = 0; i < buildings[mouseGridY][mouseGridX].blueprint.YScale; ++i) {
        for (let j = 0; j < buildings[mouseGridY][mouseGridX].blueprint.XScale; ++j) {
            if (i === 0 && j === 0) {
                continue;
            }
            if (buildings[mouseGridY + i][mouseGridX + j]) {
                buildings[mouseGridY][mouseGridX] = null;
                return;
            }
        }
    }
    for (let i = 0; i < buildings[mouseGridY][mouseGridX].blueprint.YScale; ++i) {
        for (let j = 0; j < buildings[mouseGridY][mouseGridX].blueprint.XScale; ++j) {
            if (i === 0 && j === 0) {
                continue;
            }
            buildings[mouseGridY + i][mouseGridX + j] = new BuildingPlaceholder(buildings[mouseGridY][mouseGridX]);
        }
    }
}

function removeBuilding(event) {
    event.preventDefault();
    if (mouseGridX >= gridsX || mouseGridY >= gridsY) {
        return;
    }
    let building = buildings[mouseGridY][mouseGridX];
    if (!building) {
        return;
    }
    if (building instanceof BuildingPlaceholder) {
        building = building.origin;
    }
    for (let i = 0; i < building.blueprint.YScale; ++i) {
        for (let j = 0; j < building.blueprint.XScale; ++j) {
            buildings[building.YGridPos + i][building.XGridPos + j] = null;
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
    else if (event.key === "q" || event.key === "Q") {
        crt0.classList.toggle("crt0");
        if (crt0.classList.contains("crt0")) {
            return;
        }
        crt1.classList.remove("crt1");
    }
    else if (event.key === "w" || event.key === "W") {
        if (!crt0.classList.contains("crt0")) {
            return;
        }
        crt1.classList.toggle("crt1");
    }
    else {
        let num = parseInt(event.key);
        if (!Number.isNaN(num) && num < blueprints.length) {
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
    iterHelper(function(i, j) {
        let iBack = i * gridSize;
        let jBack = j * gridSize;
        canvasCtx.drawImage(images[0], jBack, iBack);
    });
    iterHelper(function(i, j) {
        if (buildings[i][j] instanceof Building) {
            buildings[i][j].draw(canvasCtx);
        }
    });
    iterHelper(function(i, j) {
        if (buildings[i][j] instanceof Building) {
            buildings[i][j].update0();
        }
    });
    iterHelper(function(i, j) {
        if (buildings[i][j] instanceof Building) {
            buildings[i][j].update1();
        }
    });
    iterHelper(function(i, j) {
        if (buildings[i][j] instanceof Building) {
            buildings[i][j].update2();
        }
    });
    let previewBuilding = new Building(blueprints[previewNum], mouseGridBackX, mouseGridBackY, previewDir);
    canvasCtx.globalAlpha = 0.5;
    previewBuilding.draw(canvasCtx);
    canvasCtx.globalAlpha = 1;
}

function updateUI() {
    info.innerHTML = `<p>Cosmodox Manufacturing Ltd.<br>Prod. Line I</p><h2>${voidium} V¤ / ${airium} A¤ / ${earthium} E¤ / ${firium} F¤ / ${waterium} W¤</h2>`;
}

main();

window.addEventListener("click", placeBuilding);
window.addEventListener("contextmenu", removeBuilding);
window.addEventListener("keydown", updatePreview);
window.addEventListener("mousemove", updateMousePos);
window.addEventListener("resize", resizeCanvas);