window.addEventListener("load", windowLoadHandler, false);
var sphereRad = 140; // Radius of the sphere
var radius_sp = 1;

function windowLoadHandler() {
    canvasApp();
}

function canvasSupport() {
    return !!document.createElement("canvas").getContext;
}

function canvasApp() {
    if (!canvasSupport()) return;

    var theCanvas = document.getElementById("canvasOne");
    var context = theCanvas.getContext("2d");

    var displayWidth = theCanvas.width;
    var displayHeight = theCanvas.height;
    var particleList = {};
    var recycleBin = {};
    var numToAddEachFrame = 15; // Increased to add more particles
    var r = 0, g = 72, b = 255; // Blue color
    var rgbString = `rgba(${r},${g},${b},`;
    var particleAlpha = 1;
    var projCenterX = displayWidth / 2;
    var projCenterY = displayHeight / 2;
    var fLen = 320; 
    var zMax = fLen - 2;
    var turnSpeed = 2 * Math.PI / 1200; 
    var turnAngle = 0; 
    var sphereCenterX = 0, sphereCenterY = 0, sphereCenterZ = -3 - sphereRad;
    var zeroAlphaDepth = -750;
    var randAccelX = 0.05, randAccelY = 0.05, randAccelZ = 0.05; // Reduced random acceleration
    var gravity = -0;
    var particleRad = 1.0; // Smaller particle radius for denser effect
    var timer = setInterval(onTimer, 10 / 24);

    function onTimer() {
        for (let i = 0; i < numToAddEachFrame; i++) {
            let theta = Math.random() * 2 * Math.PI;
            let phi = Math.acos(Math.random() * 2 - 1);
            let x0 = sphereRad * Math.sin(phi) * Math.cos(theta);
            let y0 = sphereRad * Math.sin(phi) * Math.sin(theta);
            let z0 = sphereRad * Math.cos(phi);
            let p = addParticle(x0, sphereCenterY + y0, sphereCenterZ + z0, 0.002 * x0, 0.002 * y0, 0.002 * z0);
            p.attack = 50;
            p.hold = 50;
            p.decay = 100;
            p.initValue = 0;
            p.holdValue = particleAlpha;
            p.stuckTime = 90 + Math.random() * 20;
        }

        turnAngle = (turnAngle + turnSpeed) % (2 * Math.PI);
        let sinAngle = Math.sin(turnAngle);
        let cosAngle = Math.cos(turnAngle);

        context.fillStyle = "#000000";
        context.fillRect(0, 0, displayWidth, displayHeight);

        let p = particleList.first;
        while (p != null) {
            let nextParticle = p.next;
            p.age++;

            if (p.age > p.stuckTime) {
                p.velX += randAccelX * (Math.random() * 2 - 1);
                p.velY += randAccelY * (Math.random() * 2 - 1);
                p.velZ += randAccelZ * (Math.random() * 2 - 1);
                p.x += p.velX;
                p.y += p.velY;
                p.z += p.velZ;
            }

            let rotX = cosAngle * p.x + sinAngle * (p.z - sphereCenterZ);
            let rotZ = -sinAngle * p.x + cosAngle * (p.z - sphereCenterZ) + sphereCenterZ;
            let m = radius_sp * fLen / (fLen - rotZ);
            p.projX = rotX * m + projCenterX;
            p.projY = p.y * m + projCenterY;

            if (p.age < p.attack + p.hold + p.decay) {
                if (p.age < p.attack) {
                    p.alpha = (p.holdValue - p.initValue) / p.attack * p.age + p.initValue;
                } else if (p.age < p.attack + p.hold) {
                    p.alpha = p.holdValue;
                } else {
                    p.alpha = (0 - p.holdValue) / p.decay * (p.age - p.attack - p.hold) + p.holdValue;
                }
            } else {
                p.dead = true;
            }

            if ((p.projX > displayWidth) || (p.projX < 0) || (p.projY < 0) || (p.projY > displayHeight) || (rotZ > zMax)) {
                recycle(p);
            } else {
                let depthAlphaFactor = (1 - rotZ / zeroAlphaDepth);
                depthAlphaFactor = (depthAlphaFactor > 1) ? 1 : ((depthAlphaFactor < 0) ? 0 : depthAlphaFactor);
                context.fillStyle = rgbString + depthAlphaFactor * p.alpha + ")";
                context.beginPath();
                context.arc(p.projX, p.projY, m * particleRad, 0, 2 * Math.PI, false);
                context.closePath();
                context.fill();
            }

            p = nextParticle;
        }
    }

    function addParticle(x0, y0, z0, vx0, vy0, vz0) {
        let newParticle = (recycleBin.first != null) ? recycleBin.first : {};
        if (recycleBin.first) recycleBin.first = recycleBin.first.next;

        if (!particleList.first) {
            particleList.first = newParticle;
        } else {
            newParticle.next = particleList.first;
            particleList.first.prev = newParticle;
            particleList.first = newParticle;
        }

        newParticle.x = x0;
        newParticle.y = y0;
        newParticle.z = z0;
        newParticle.velX = vx0;
        newParticle.velY = vy0;
        newParticle.velZ = vz0;
        newParticle.age = 0;
        newParticle.dead = false;
        return newParticle;
    }

    function recycle(p) {
        if (particleList.first == p) {
            if (p.next) particleList.first = p.next;
            else particleList.first = null;
        } else {
            if (!p.next) p.prev.next = null;
            else {
                p.prev.next = p.next;
                p.next.prev = p.prev;
            }
        }

        p.next = recycleBin.first;
        recycleBin.first = p;
    }
}
