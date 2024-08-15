"use-strict";
// Day mode background
function start_day_mode() {
    var LeafScene = function(el) {
        this.viewport = el;
        this.world = document.createElement('div');
        this.leaves = [];

        this.options = {
            numLeaves: 20,
            wind: {
                magnitude: 1.2,
                maxSpeed: 12,
                duration: 300,
                start: 0,
                speed: 0,
            },
        };

        this.width = this.viewport.offsetWidth;
        this.height = this.viewport.offsetHeight;

        // animation helper
        this.timer = 0;

        this._resetLeaf = function(leaf) {
            // place leaf towards top left
            leaf.x = this.width * 2 - Math.random() * this.width * 1.75;
            leaf.y = -10;
            leaf.z = Math.random() * 200;

            if (leaf.x > this.width) {
                leaf.x = this.width + 10;
                leaf.y = Math.random() * this.height / 2;
            }

            // at the start, leaf can be anywhere
            if (this.timer == 0) {
                leaf.y = Math.random() * this.height;
            }

            // Choose axis of rotation
            // If axis is not x, choose a random static x-rotation for greater variability
            leaf.rotation.speed = Math.random() * 10;
            var randomAxis = Math.random();
            if (randomAxis > 0.5) {
                leaf.rotation.axis = 'X';
            } else if (randomAxis > 0.25) {
                leaf.rotation.axis = 'Y';
                leaf.rotation.x = Math.random() * 180 + 90;
            } else {
                leaf.rotation.axis = 'Z';
                leaf.rotation.x = Math.random() * 360 - 180;
                //looks weird if the rotation is too fast around this axis
                leaf.rotation.speed = Math.random() * 3;
            }

            // random speed
            leaf.xSpeedVariation = Math.random() * 0.8 - 0.4;
            leaf.ySpeed = Math.random() + 1.5;

            return leaf;
        }
        this._updateLeaf = function(leaf) {
            var leafWindSpeed = this.options.wind.speed(this.timer - this.options.wind.start, leaf.y);
            var xSpeed = leafWindSpeed + leaf.xSpeedVariation;
            leaf.x -= xSpeed;
            leaf.y += leaf.ySpeed;
            leaf.rotation.value += leaf.rotation.speed;

            var t = 'translateX( ' + leaf.x + 'px ) translateY( ' + leaf.y + 'px ) translateZ( ' + leaf.z + 'px )  rotate' + leaf.rotation.axis + '( ' + leaf.rotation.value + 'deg )';

            if (leaf.rotation.axis !== 'X') {
                t += ' rotateX(' + leaf.rotation.x + 'deg)';
            }
            leaf.el.style.webkitTransform = t;
            leaf.el.style.MozTransform = t;
            leaf.el.style.oTransform = t;
            leaf.el.style.transform = t;

            // reset if out of view
            if (leaf.x < -10 || leaf.y > this.height + 10) {
                this._resetLeaf(leaf);
            }
        }

        this._updateWind = function() {
            // wind follows a sine curve: asin(b*time + c) + a
            // where a = wind magnitude as a function of leaf position, b = wind.duration, c = offset
            // wind duration should be related to wind magnitude, e.g. higher windspeed -> longer gust duration

            if (this.timer === 0 || this.timer > (this.options.wind.start + this.options.wind.duration)) {
                this.options.wind.magnitude = Math.random() * this.options.wind.maxSpeed;
                this.options.wind.duration = this.options.wind.magnitude * 50 + (Math.random() * 20 - 10);
                this.options.wind.start = this.timer;

                var screenHeight = this.height;

                this.options.wind.speed = function(t, y) {
                    // should go from full wind speed at the top, to 1/2 speed at the bottom, using leaf Y
                    var a = this.magnitude/2 * (screenHeight - 2*y/3) / screenHeight;
                    return a * Math.sin(2*Math.PI/this.duration * t + (3 * Math.PI/2)) + a;
                }
            }
        }
    }

    LeafScene.prototype.init = function() {
        for (var i = 0; i < this.options.numLeaves; i++) {
            var leaf = {
                el: document.createElement('div'),
                x: 0,
                y: 0,
                z: 0,
                rotation: {
                    axis: 'X',
                    value: 0,
                    speed: 0,
                    x: 0
                },
                xSpeedVariation: 0,
                ySpeed: 0,
                path: {
                    type: 1,
                    start: 0
                },
                image: 1
            };
            this._resetLeaf(leaf);
            this.leaves.push(leaf);
            this.world.appendChild(leaf.el);
        }
        this.world.className = 'leaf-scene';
        this.viewport.appendChild(this.world);

        //set perspective
        this.world.style.webkitPerspective = '400px';
        this.world.style.MozPerspective = '400px';
        this.world.style.oPerspective = '400px';
        this.world.style.perspective = '400px';

        // reset window height/width on resize
        var self = this;

        window.onresize = function(event) {
            self.width = self.viewport.offsetWidth;
            self.height = self.viewport.offsetHeight;
        };
    }

    LeafScene.prototype.render = function() {
        this._updateWind();
        for (var i = 0; i < this.leaves.length; i++) {
            this._updateLeaf(this.leaves[i]);
        }
        this.timer++;

        requestAnimationFrame(this.render.bind(this));
    }

    // hide canvas
    var canvas = document.querySelector('canvas');
    canvas.style.display = 'none';


    // Create a new <div> element
    var fallingLeavesDiv = document.createElement('div');

    // Set the class name to 'falling-leaves'
    fallingLeavesDiv.className = 'falling-leaves';

    // Append the <div> to the body
    document.body.appendChild(fallingLeavesDiv);

    // Start up leaf scene
    var leafContainer = document.querySelector('.falling-leaves'),
        leaves = new LeafScene(leafContainer);


    leaves.init();
    leaves.render();
}

// night mode background
function start_night_mode() {
    // Helpers
    function lineToAngle(x1, y1, length, radians) {
        var x2 = x1 + length * Math.cos(radians),
            y2 = y1 + length * Math.sin(radians);
        return {x: x2, y: y2};
    }

    function randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    function degreesToRads(deg) {
        return deg / 180 * Math.PI;
    }

    // Particle
    var particle = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 0,

        create: function(x, y, speed, direction) {
            var obj = Object.create(this);
            obj.x = x;
            obj.y = y;
            obj.vx = Math.cos(direction) * speed;
            obj.vy = Math.sin(direction) * speed;
            return obj
        },

        getSpeed: function() {
            return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        },

        setSpeed: function(speed) {
            var heading = this.getHeading();
            this.vx = Math.cos(heading) * speed;
            this.vy = Math.sin(heading) * speed;
        },

        getHeading: function() {
            return Math.atan2(this.vy, this.vx);
        },

        setHeading: function(heading) {
            var speed = this.getSpeed();
            this.vx = Math.cos(heading) * speed;
            this.vy = Math.sin(heading) * speed;
        },

        update: function() {
            this.x += this.vx;
            this.y += this.vy;
        }
    };

    // Canvas and settings
    var canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d'),
        width = canvas.width = window.innerWidth,
        height = canvas.height = window.innerHeight,
        stars = [],
        shootingStars = [],
        layers = [                                      // edit layer specs later, maybe add more layers?
            {speed: 0.015, scale: 0.2, count: 500},
            {speed: 0.03, scale: 0.35, count: 100},
            {speed: 0.05, scale: 0.55, count: 50},
            {speed: 0.1, scale: 0.75, count: 10},
        ],
        starsAngle = 155,                               // edit this later
        shootingStarSpeed = {                           // edit this later
            min: 15,
            max: 30
        },
        starOpacityDelta = 0.5,
        shootingStarOpacityDelta = 0.01,
        trailLengthDelta = 0.01,
        shootingStarEmittingInterval = 500,
        shootingStarLifeTime = 500,
        maxTrailLength = 300,
        starBaseRadius = 2,
        shootingStarRadius = 3,
        paused = false;                                 // keep this set to false all the time so that shooting stars keep going

    canvas.style.display = 'block';

    // Resize canvas function
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        updateShootingStar();  // Redraw content if necessary
    }



    // Create all stars
    function createStar() {
        for (var j = 0; j < layers.length; j += 1) {
            var layer = layers[j];
            for (var i = 0; i < layer.count; i += 1) {
                var star = particle.create(randomRange(0, width), randomRange(0, height), 0, 0);        // create a new star at a random position x, y and speed = 0, direction = 0
                star.radius = starBaseRadius * layer.scale;                                             // set star radius according to its layer's scale
                star.setSpeed(layer.speed);                                                             // set star speed according to its layer's speed
                star.setHeading(degreesToRads(starsAngle));                                             // set star heading according to starsAngle
                stars.push(star);
            }
        }
    }

    createStar();


    function createShootingStar() {
        var shootingStar = particle.create(randomRange(width / 2, width), randomRange(0, height / 2), 0, 0);
        shootingStar.setSpeed(randomRange(shootingStarSpeed.min, shootingStarSpeed.max));
        shootingStar.setHeading(degreesToRads(starsAngle));
        shootingStar.radius = shootingStarRadius;
        shootingStar.opacity = randomRange(0.0, 1.0);
        shootingStar.trailLengthDelta = 0;
        shootingStar.isSpawning = true;
        shootingStar.isDying = false;
        shootingStars.push(shootingStar);
    }

    function killShootingStar(shootingStar) {
        setTimeout(function () {
            shootingStar.isDying = true;
        }, shootingStarLifeTime);
    }

    function updateShootingStar() {
        if (!paused) {
            ctx.clearRect(0, 0, width, height);
            // Create a linear gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

            // Add color stops
            gradient.addColorStop(0, '#020107'); // Top color #360654
            gradient.addColorStop(1, '#201b46'); // Bottom color #17636A

            // Use the gradient as the fill style
            ctx.fillStyle = gradient;

            ctx.fillRect(0, 0, width, height);
            ctx.fill();

            for (var i = 0; i < stars.length; i += 1) {
                var star = stars[i];
                star.update();
                drawStar(star);
                if (star.x > width) {
                    star.x = 0;
                }
                if (star.x < 0) {
                    star.x = width;
                }
                if (star.y > height) {
                    star.y = 0
                }
                if (star.y < 0) {
                    star.y = height
                }
            }

            for (i = 0; i < shootingStars.length; i += 1) {
                var shootingStar = shootingStars[i];
                if (shootingStar.isSpawning) {
                    shootingStar.opacity += shootingStarOpacityDelta;           // opacity gradually increases by shootingStarOpacityDelta
                    if (shootingStar.opacity >= 1.0) {
                        shootingStar.isSpawning = false;                        // when opacity reaches 1, stop spawning
                        killShootingStar(shootingStar);                         // kill the shooting star after it stops spawning
                    }
                }
                if (shootingStar.isDying) {
                    shootingStar.opacity -= shootingStarOpacityDelta;           // when the shootingStar dies, opacity gradually decreases
                    if (shootingStar.opacity <= 0.0) {
                        shootingStar.isDying = false;
                        shootingStar.isDead = true;                             // when opacity goes back to 0, switch from dying status to dead
                    }
                }
                shootingStar.trailLengthDelta += trailLengthDelta;              // trailLengthDelta gradually increases

                shootingStar.update();
                if (shootingStar.opacity > 0.0) {
                    drawShootingStar(shootingStar);
                }
            }

            // Delete dead shooting star
            for (i = shootingStars.length-1; i >= 0; i--) {
                if (shootingStars[i].isDead) {
                    shootingStars.splice(i, 1);
                }
            }
        }
        requestAnimationFrame(updateShootingStar);
    }

    function drawStar(star) {
        ctx.fillStyle = "rgb(255, 221, 157)";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI*2, false);
        ctx.fill();
    }

    function drawShootingStar(p) {
        var x = p.x,
            y = p.y,
            currentTrailLength = (maxTrailLength * p.trailLengthDelta),
            pos = lineToAngle(x, y, -currentTrailLength, p.getHeading());

        ctx.fillStyle = "rgba(255, 255, 255, " + p.opacity + ")";
        var starLength = 5;
        ctx.beginPath();
        ctx.moveTo(x-1, y+1);

        ctx.lineTo(x, y + starLength);
        ctx.lineTo(x + 1, y + 1);

        ctx.lineTo(x + starLength, y);
        ctx.lineTo(x + 1, y - 1);

        ctx.lineTo(x, y + 1);
        ctx.lineTo(x, y - starLength);

        ctx.lineTo(x - 1, y - 1);
        ctx.lineTo(x - starLength, y);

        ctx.lineTo(x - 1, y + 1);
        ctx.lineTo(x - starLength, y);

        ctx.closePath();
        ctx.fill();

        // trail
        ctx.fillStyle = "rgba(255, 221, 157, " + p.opacity + ")";
        ctx.beginPath();
        ctx.moveTo(x-1, y-1);
        ctx.lineTo(pos.x, pos.y);
        ctx.lineTo(x+1, y+1);
        ctx.closePath();
        ctx.fill();
    }

    // Run
    updateShootingStar();

    // Shooting stars
    setInterval(function() {
        if (paused) return;
        createShootingStar();
    }, shootingStarEmittingInterval);

    window.onfocus = function() {
        paused = false;
    }
}

// JS for theme toggling

const themeToggle = document.querySelector("#theme-toggle");

themeToggle.addEventListener('click', () => {
    document.body.classList.contains("light-theme")
        ? enableDarkMode()
        : enableLightMode();
});

function enableDarkMode(){
    document.body.classList.remove("light-theme");
    document.body.classList.add("dark-theme");
    themeToggle.setAttribute("aria-label", "Switch to light theme");
    themeToggle.setAttribute("title", "Switch to light theme");
    themeToggle.setAttribute("data-attribute", "dark");

    // Clear heart rain effect
//    clearInterval(heartRain);
//    document.querySelectorAll('.heart').forEach(heart => heart.remove());
    document.querySelectorAll('.falling-leaves').forEach(d => d.remove());
    setTimeout(start_night_mode, 100);
};

function enableLightMode(){
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
    themeToggle.setAttribute("aria-label", "Switch to dark theme");
    themeToggle.setAttribute("title", "Switch to dark theme");
    themeToggle.setAttribute("data-attribute", "light");

    setTimeout(start_day_mode, 100);
};

function setThemePreference(){
    if(window.matchMedia("(prefers-color-scheme:dark)").matches){
        enableDarkMode();
        return;
    }
    enableLightMode();
}

document.onload = setThemePreference();

// JS local storage for theme

// store theme

const storeTheme = function(theme){
    localStorage.setItem("theme", theme);
}

themeToggle.addEventListener('click', () => {
    storeTheme(themeToggle.getAttribute('data-attribute'));
});


//apply theme

const retrieveTheme = function() {
    const activeTheme = localStorage.getItem("theme");
    if (activeTheme === "dark") {
        enableDarkMode();
    }
    else{
        enableLightMode();
    }
}

document.onload = retrieveTheme();



