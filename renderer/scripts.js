"use strict";

class Transformation {
    constructor(distX = 0, distY = 0, distZ = 0, rotXY = 0, rotYZ = 0, rotZX = 0, scaleX = 1, scaleY = 1, scaleZ = 1) {
        this.distX = distX;
        this.distY = distY;
        this.distZ = distZ;
        this.rotXY = rotXY;
        this.rotYZ = rotYZ;
        this.rotZX = rotZX;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.scaleZ = scaleZ;
    }
}

class Point3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Face {
    constructor(points) {
        this.points = structuredClone(points);
    }
}

class MyObject {
    constructor(faces) {
        this.faces = structuredClone(faces);
        let maxX = -Infinity;
        let minX = Infinity;
        let maxY = -Infinity;
        let minY = Infinity;
        let maxZ = -Infinity;
        let minZ = Infinity;
        for (let face of this.faces) {
            for (let point of face.points) {
                maxX = Math.max(maxX, point.x);
                minX = Math.min(minX, point.x);
                maxY = Math.max(maxY, point.y);
                minY = Math.min(minY, point.y);
                maxZ = Math.max(maxZ, point.z);
                minZ = Math.min(minZ, point.z);
            }
        }
        this.center = new Point3D(
            (maxX + minX) / 2,
            (maxY + minY) / 2,
            (maxZ + minZ) / 2
        );
        this.transformation = new Transformation();
    }
}

function project(point3d, width, height) {
    return new Point2D(
        (point3d.x / point3d.z + 1) / 2 * width,
        (1 - point3d.y / point3d.z) / 2 * height
    );
}

function drawFace(face, canvasCtx, width, height) {
    canvasCtx.beginPath();
    canvasCtx.moveTo(project(face.points[0], width, height).x, project(face.points[0], width, height).y);
    for (let point of face.points) {
        canvasCtx.lineTo(project(point, width, height).x, project(point, width, height).y);
    }
    canvasCtx.closePath();
    canvasCtx.stroke();
}

function drawObject(object, canvasCtx, width, height) {
    for (let face of object.faces) {
        drawFace(face, canvasCtx, width, height);
    }
}

function moveObjectX(object, dist) {
    for (let face of object.faces) {
        for (let point of face.points) {
            point.x += dist;
        }
    }
    object.center.x += dist;
}

function moveObjectY(object, dist) {
    for (let face of object.faces) {
        for (let point of face.points) {
            point.y += dist;
        }
    }
    object.center.y += dist;
}

function moveObjectZ(object, dist) {
    for (let face of object.faces) {
        for (let point of face.points) {
            point.z += dist;
        }
    }
    object.center.z += dist;
}

function rotateObjectXY(object, deg) {
    let rad = deg * Math.PI / 180;
    let cos = Math.cos(rad);
    let sin = Math.sin(rad);
    for (let face of object.faces) {
        for (let point of face.points) {
            let XBack = point.x - object.center.x;
            let YBack = point.y - object.center.y;
            point.x = XBack * cos - YBack * sin + object.center.x;
            point.y = XBack * sin + YBack * cos + object.center.y;
        }
    }
}

function rotateObjectYZ(object, deg) {
    let rad = deg * Math.PI / 180;
    let cos = Math.cos(rad);
    let sin = Math.sin(rad);
    for (let face of object.faces) {
        for (let point of face.points) {
            let YBack = point.y - object.center.y;
            let ZBack = point.z - object.center.z;
            point.y = YBack * cos - ZBack * sin + object.center.y;
            point.z = YBack * sin + ZBack * cos + object.center.z;
        }
    }
}

function rotateObjectZX(object, deg) {
    let rad = deg * Math.PI / 180;
    let cos = Math.cos(rad);
    let sin = Math.sin(rad);
    for (let face of object.faces) {
        for (let point of face.points) {
            let ZBack = point.z - object.center.z;
            let XBack = point.x - object.center.x;
            point.z = ZBack * cos - XBack * sin + object.center.z;
            point.x = ZBack * sin + XBack * cos + object.center.x;
        }
    }
}

function scaleObjectX(object, scale) {
    for (let face of object.faces) {
        for (let point of face.points) {
            point.x = (point.x - object.center.x) * scale + object.center.x;
        }
    }
}

function scaleObjectY(object, scale) {
    for (let face of object.faces) {
        for (let point of face.points) {
            point.y = (point.y - object.center.y) * scale + object.center.y;
        }
    }
}

function scaleObjectZ(object, scale) {
    for (let face of object.faces) {
        for (let point of face.points) {
            point.z = (point.z - object.center.z) * scale + object.center.z;
        }
    }
}

function addTransformation(object, transformation) {
    object.transformation.distX += transformation.distX;
    object.transformation.distY += transformation.distY;
    object.transformation.distZ += transformation.distZ;
    object.transformation.rotXY = ((object.transformation.rotXY + transformation.rotXY) % 360 + 360) % 360;
    object.transformation.rotYZ = ((object.transformation.rotYZ + transformation.rotYZ) % 360 + 360) % 360;
    object.transformation.rotZX = ((object.transformation.rotZX + transformation.rotZX) % 360 + 360) % 360;
    object.transformation.scaleX *= transformation.scaleX;
    object.transformation.scaleY *= transformation.scaleY;
    object.transformation.scaleZ *= transformation.scaleZ;
}

function applyTransformation(object) {
    let objectCopy = structuredClone(object);
    scaleObjectX(objectCopy, object.transformation.scaleX);
    scaleObjectY(objectCopy, object.transformation.scaleY);
    scaleObjectZ(objectCopy, object.transformation.scaleZ);
    rotateObjectXY(objectCopy, object.transformation.rotXY);
    rotateObjectYZ(objectCopy, object.transformation.rotYZ);
    rotateObjectZX(objectCopy, object.transformation.rotZX);
    moveObjectX(objectCopy, object.transformation.distX);
    moveObjectY(objectCopy, object.transformation.distY);
    moveObjectZ(objectCopy, object.transformation.distZ);
    objectCopy.transformation = new Transformation();
    return objectCopy;
}

let canvas = document.getElementById("canvas");
let canvasCtx = canvas.getContext("2d");

let width = 640;
let height = 480;

let point0 = new Point3D(-0.5, -0.5, -0.5);
let point1 = new Point3D(-0.5, -0.5,  0.5);
let point2 = new Point3D(-0.5,  0.5, -0.5);
let point3 = new Point3D(-0.5,  0.5,  0.5);
let point4 = new Point3D( 0.5, -0.5, -0.5);
let point5 = new Point3D( 0.5, -0.5,  0.5);
let point6 = new Point3D( 0.5,  0.5, -0.5);
let point7 = new Point3D( 0.5,  0.5,  0.5);
let cube = new MyObject([
    new Face([point1, point3, point7, point5]),
    new Face([point0, point4, point6, point2]),
    new Face([point2, point6, point7, point3]),
    new Face([point0, point1, point5, point4]),
    new Face([point4, point5, point7, point6]),
    new Face([point0, point2, point3, point1])
]);
let dist = 0;
addTransformation(cube, new Transformation(0, 0, 1, 0, 0, 0, 1, 1, 1.5));

function main() {
    canvasCtx.fillRect(0, 0, width, height);
    addTransformation(cube, new Transformation(0, 0, dist, 0.5, 0.5, 0.5));
    let cubeCopy = applyTransformation(cube);
    drawObject(cubeCopy, canvasCtx, width, height);
    if (cubeCopy.center.z <= 1) {
        dist = 0.05;
    }
    else if (cubeCopy.center.z >= 10) {
        dist = -0.05;
    }
    requestAnimationFrame(main);
}

canvas.width = width;
canvas.height = height;
canvasCtx.fillStyle = "black";
canvasCtx.strokeStyle = "lime";

main();