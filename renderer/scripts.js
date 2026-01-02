"use strict";

let width = 640;
let height = 480;

let canvas = document.getElementById("canvas");
let canvasCtx = canvas.getContext("2d");

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
        this.points = [];
        for (let point of points) {
            this.points.push(new Point3D(point.x, point.y, point.z));
        }
    }
}

class MyObject {
    constructor(faces) {
        this.faces = faces;
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
    }
}

function project(point3d) {
    return new Point2D(
        (point3d.x / point3d.z + 1) / 2 * width,
        (point3d.y / point3d.z + 1) / 2 * height
    );
}

function drawFace(face) {
    canvasCtx.beginPath();
    canvasCtx.moveTo(project(face.points[0]).x, project(face.points[0]).y);
    for (let point of face.points) {
        canvasCtx.lineTo(project(point).x, project(point).y);
    }
    canvasCtx.closePath();
    canvasCtx.stroke();
}

function drawObject(object) {
    for (let face of object.faces) {
        drawFace(face);
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
moveObjectZ(cube, 1);

function main() {
    canvasCtx.clearRect(0, 0, width, height);
    if (cube.center.z <= 1) {
        dist = 0.05;
    }
    else if (cube.center.z >= 10) {
        dist = -0.05;
    }
    moveObjectZ(cube, dist);
    rotateObjectXY(cube, 0.5);
    rotateObjectYZ(cube, 0.5);
    rotateObjectZX(cube, 0.5);
    drawObject(cube);
    requestAnimationFrame(main);
}

canvas.width = width;
canvas.height = height;
canvasCtx.strokeStyle = "lime";

main();