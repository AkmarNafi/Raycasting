const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const SCALE = 1;
const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 80 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

//helper functions

function calculatedistance(x1, y1, x2, y2) {

    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle = (2 * Math.PI) + angle;
    }
    return angle;
}


var subsketch = function (canvas) {


    canvas.setup = function () {

        var drawcanvas = canvas.createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
        drawcanvas.parent('canvas3d')


    }


    // canvas.render3dWalls=function(){
    //
    //
    // }


}

var canvas3d = new p5(subsketch)


var mainsketch = function (canvas) {


    class Map {
        constructor() {
            this.grid = [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 3, 0, 1],
                [1, 0, 0, 0, 0, 2, 0, 0, 0, 4, 0, 0, 3, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 1],
                [1, 0, 0, 4, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 1],
                [1, 0, 3, 0, 2, 0, 0, 0, 0, 0, 0, 4, 3, 0, 1],
                [1, 3, 3, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 1],
                [1, 0, 3, 0, 0, 4, 0, 2, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ];
        }

        getColourAt(x, y, alpha) {


            var mapGridIndexX = x;
            var mapGridIndexY = y;


            var colourcode = this.grid[mapGridIndexY][mapGridIndexX]


            if (colourcode === 0) return `rgba(0,0,0,${alpha})`
            if (colourcode === 1) return `rgba(100,100,100,${alpha})`
            if (colourcode === 2) return `rgba(255,215,0,${alpha})`
            if (colourcode === 3) return `rgba(116,78,163,${alpha})`
            if (colourcode === 4) return `rgba(247,99,0,${alpha})`


        }

        hasWallAt(x, y) {
            if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT) {
                return true;
            }
            var mapGridIndexX = Math.floor(x / TILE_SIZE);
            var mapGridIndexY = Math.floor(y / TILE_SIZE);
            return this.grid[mapGridIndexY][mapGridIndexX] != 0;
        }


        render() {
            for (var i = 0; i < MAP_NUM_ROWS; i++) {
                for (var j = 0; j < MAP_NUM_COLS; j++) {
                    var tileX = j * TILE_SIZE;
                    var tileY = i * TILE_SIZE;


                    var alpha = 1 / (calculatedistance(player.x, player.y, tileX, tileY) * 0.0095)


                    var tileColor = this.getColourAt(j, i, alpha)
                    canvas.noStroke();

                    canvas.fill(tileColor);
                    canvas.rect(SCALE * tileX, SCALE * tileY, SCALE * TILE_SIZE, SCALE * TILE_SIZE);
                }
            }
        }
    }

    class Player {
        constructor() {
            this.x = WINDOW_WIDTH / 2;
            this.y = WINDOW_HEIGHT / 2;
            this.radius = 13;
            this.turnDirection = 0;
            this.walkDirection = 0;
            this.rotationAngle = Math.PI / 2;
            this.moveSpeed = 2.0;
            this.rotationSpeed = 2.5 * (Math.PI / 180);
        }

        update() {
            this.rotationAngle += this.turnDirection * this.rotationSpeed;

            var moveStep = this.walkDirection * this.moveSpeed;

            var newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep;
            var newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep;

            if (!grid.hasWallAt(newPlayerX, newPlayerY)) {
                this.x = newPlayerX;
                this.y = newPlayerY;
            }
        }

        render() {
            canvas.noStroke();
            canvas.fill("white");
            canvas.circle(SCALE * this.x, SCALE * this.y, SCALE * this.radius);

        }
    }

    class Ray {
        constructor(rayAngle) {
            this.rayAngle = normalizeAngle(rayAngle);

            this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
            this.isRayFacingUp = !this.isRayFacingDown;

            this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
            this.isRayFacingLeft = !this.isRayFacingRight;

        }

        cast() {


            var horizontal = this.horizontalIntersect()

            var vertical = this.verticalIntersect()
            canvas.stroke('white');

            if (vertical == null) {

                this.distance = calculatedistance(player.x, player.y, horizontal.x, horizontal.y);

                this.target = {x: horizontal.x, y: horizontal.y}

                canvas.line(SCALE * player.x, SCALE * player.y, SCALE * horizontal.x, SCALE * horizontal.y)
            } else if (horizontal == null) {
                this.distance = calculatedistance(player.x, player.y, vertical.x, vertical.y);

                this.target = {x: vertical.x, y: vertical.y}

                canvas.line(SCALE * player.x, SCALE * player.y, SCALE * vertical.x, SCALE * vertical.y)


            } else {


                var horizontaldist = calculatedistance(player.x, player.y, horizontal.x, horizontal.y);

                var verticaldist = calculatedistance(player.x, player.y, vertical.x, vertical.y);

                if (horizontaldist <= verticaldist) {
                    this.distance = horizontaldist
                    this.target = {x: horizontal.x, y: horizontal.y}

                    canvas.line(SCALE * player.x, SCALE * player.y, SCALE * horizontal.x, SCALE * horizontal.y)


                } else {
                    this.distance = verticaldist
                    this.target = {x: vertical.x, y: vertical.y}
                    canvas.line(SCALE * player.x, SCALE * player.y, SCALE * vertical.x, SCALE * vertical.y)

                }
            }

        }


        horizontalIntersect() {


            var interceptX, interceptY;
            var dx, dy;


            // Find the y-coordinate of the closest horizontal grid intersenction
            interceptY = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
            interceptY += this.isRayFacingDown ? TILE_SIZE : 0;

            // Find the x-coordinate of the closest horizontal grid intersection
            interceptX = player.x + (interceptY - player.y) / Math.tan(this.rayAngle);

            // Calculate the increment dx and dy
            dy = TILE_SIZE;
            dy *= this.isRayFacingUp ? -1 : 1;

            dx = TILE_SIZE / Math.tan(this.rayAngle);
            dx *= (this.isRayFacingLeft && dx > 0) ? -1 : 1;
            dx *= (this.isRayFacingRight && dx < 0) ? -1 : 1;


            if (this.isRayFacingUp)
                interceptY--;

            // Increment dx and dy until we find a wall
            while (interceptX >= 0 && interceptX <= WINDOW_WIDTH && interceptY >= 0 && interceptY <= WINDOW_HEIGHT) {
                if (grid.hasWallAt(interceptX, interceptY)) {


                    return ({x: interceptX, y: interceptY})


                } else {
                    interceptX += dx;
                    interceptY += dy;
                }

            }

            return null


        }

        verticalIntersect() {


            var interceptX, interceptY;
            var dx, dy;


            // Find the y-coordinate of the closest horizontal grid intersenction
            interceptX = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
            interceptX += this.isRayFacingRight ? TILE_SIZE : 0;

            // Find the x-coordinate of the closest horizontal grid intersection
            interceptY = player.y + (interceptX - player.x) * Math.tan(this.rayAngle);

            // Calculate the increment dx and dy
            dx = TILE_SIZE;
            dx *= this.isRayFacingLeft ? -1 : 1;

            dy = TILE_SIZE * Math.tan(this.rayAngle);
            dy *= (this.isRayFacingUp && dy > 0) ? -1 : 1;
            dy *= (this.isRayFacingDown && dy < 0) ? -1 : 1;


            if (this.isRayFacingLeft)
                interceptX--;

            // Increment dx and dy until we find a wall
            while (interceptX >= 0 && interceptX <= canvas.width && interceptY >= 0 && interceptY <= canvas.height) {
                if (grid.hasWallAt(interceptX, interceptY)) {


                    return ({x: interceptX, y: interceptY})


                } else {


                    interceptX += dx;
                    interceptY += dy;
                }
            }


            return null


        }


    }


    castAllRays = function () {


        var rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

        rays = [];


        for (var i = 0; i < NUM_RAYS; i++) {
            var ray = new Ray(rayAngle);
            ray.cast();
            rays.push(ray);

            rayAngle += FOV_ANGLE / NUM_RAYS;


        }
    }

    render3dWalls = function () {

        canvas3d.clear()
        for (var i = 0; i < rays.length; i++) {

            var ray = rays[i];
            var rayDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle)
            var distanceToProjectionPlane = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2)
            var wallHeight = (TILE_SIZE / rayDistance) * distanceToProjectionPlane;


            var alpha = wallHeight * 0.008


            canvas3d.fill(grid.getColourAt(Math.floor(ray.target.x / TILE_SIZE), Math.floor(ray.target.y / TILE_SIZE), alpha));
            canvas3d.noStroke();
            canvas3d.rect(i * WALL_STRIP_WIDTH, (WINDOW_WIDTH / 2) - (wallHeight / 2) - 65, WALL_STRIP_WIDTH, wallHeight)


        }
    }

    var grid, player, rays;


    canvas.mouseClicked = function () {


        var x = Math.floor(canvas.mouseX/TILE_SIZE)
        var y = Math.floor(canvas.mouseY/TILE_SIZE);
        alert(x)


    }
    canvas.keyPressed = function () {

        if (canvas.keyCode == canvas.SHIFT) {

            alert('biches')
            grid.grid[3][7] = 2


        }

        if (canvas.keyCode == canvas.UP_ARROW) {
            player.walkDirection = +1;
        } else if (canvas.keyCode == canvas.DOWN_ARROW) {
            player.walkDirection = -1;
        } else if (canvas.keyCode == canvas.RIGHT_ARROW) {
            player.turnDirection = +1;
        } else if (canvas.keyCode == canvas.LEFT_ARROW) {
            player.turnDirection = -1;
        }
    }

    canvas.keyReleased = function () {
        if (canvas.keyCode == canvas.UP_ARROW) {
            player.walkDirection = 0;
        } else if (canvas.keyCode == canvas.DOWN_ARROW) {
            player.walkDirection = 0;
        } else if (canvas.keyCode == canvas.RIGHT_ARROW) {
            player.turnDirection = 0;
        } else if (canvas.keyCode == canvas.LEFT_ARROW) {
            player.turnDirection = 0;
        }
    }

    canvas.setup = function () {

        var drawcanvas = canvas.createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
        drawcanvas.parent('canvas2d')
        grid = new Map();
        player = new Player();
        rays = [];

    }

    canvas.update = function () {
        player.update();

    }

    canvas.draw = function () {


        canvas.clear();

        canvas.update();

        grid.render();

        player.render();

        castAllRays();

        render3dWalls();


    }


}


var maincanvas = new p5(mainsketch)




