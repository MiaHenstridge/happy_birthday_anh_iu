"use-strict";
// Day mode background
function start_day_mode() {
    // Canvas and settings
    var canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d'),
        width = canvas.width = window.innerWidth,
        height = canvas.height = window.innerHeight,
        paused = false;                                 // keep this set to false all the time so that shooting stars keep going

    function updateDaySky() {
        if (!paused) {
            ctx.clearRect(0, 0, width, height);
            // Create a linear gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

            // Add color stops
            gradient.addColorStop(0, '#8DD0FC'); // Top color #360654
            gradient.addColorStop(1, '#DDB4F6'); // Bottom color #17636A

            // Use the gradient as the fill style
            ctx.fillStyle = gradient;

            ctx.fillRect(0, 0, width, height);
            ctx.fill();
        }
        requestAnimationFrame(updateDaySky);
    }

    // Run
    updateDaySky();

    window.onfocus = function() {
        paused = false;
    }
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
        shootingStarEmittingInterval = 2000,
        shootingStarLifeTime = 500,
        maxTrailLength = 300,
        starBaseRadius = 2,
        shootingStarRadius = 3,
        paused = false;                                 // keep this set to false all the time so that shooting stars keep going


    // Create all stars
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



