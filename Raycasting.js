const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
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
                var tileColor = this.grid[i][j] == 1 ? "#222" : "#333";
                noStroke()
                fill(tileColor);
                rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
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
        this.rotationSpeed = 0.5 * (Math.PI / 180);
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
        noStroke();
        fill("white");
        circle(this.x, this.y, this.radius);

    }
}


function calculatedistance(x1, y1, x2, y2) {


    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

class Ray {
    constructor(rayAngle) {
        this.rayAngle = normalizeAngle(rayAngle);

        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;

        this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
        this.isRayFacingLeft = !this.isRayFacingRight;
    }

    cast(columnId) {


        var horizontal = this.horizontalIntersect()

        var vertical = this.verticalIntersect()
        stroke('white');

        if (vertical == null) {
            line(player.x, player.y, horizontal.x, horizontal.y)
        } else if (horizontal == null) {
            line(player.x, player.y, vertical.x, vertical.y)


        } else {


            var horizontaldist = calculatedistance(player.x, player.y, horizontal.x, horizontal.y);
            var verticaldist = calculatedistance(player.x, player.y, vertical.x, vertical.y);

            if (horizontaldist <= verticaldist) {


                line(player.x, player.y, horizontal.x, horizontal.y)


            } else {

                line(player.x, player.y, vertical.x, vertical.y)

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


                stroke("red");

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
        while (interceptX >= 0 && interceptX <= width && interceptY >= 0 && interceptY <= height) {
            if (grid.hasWallAt(interceptX, interceptY)) {


                stroke("red");

                return ({x: interceptX, y: interceptY})


            } else {


                interceptX += dx;
                interceptY += dy;
            }
        }


        return null


    }


}

var grid = new Map();
var player = new Player();
var rays = [];

function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle = (2 * Math.PI) + angle;
    }
    return angle;
}

function keyPressed() {
    if (keyCode == UP_ARROW) {
        player.walkDirection = +1;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = -1;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = +1;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirection = -1;
    }
}

function keyReleased() {
    if (keyCode == UP_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = 0;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirection = 0;
    }
}

function castAllRays() {
    var columnId = 0;


    var rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

    rays = [];


    for (var i = 0; i < NUM_RAYS; i++) {
        var ray = new Ray(rayAngle);
        ray.cast(columnId);
        rays.push(ray);

        rayAngle += FOV_ANGLE / NUM_RAYS;

        columnId++;
    }
}

function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle = (2 * Math.PI) + angle;
    }
    return angle;
}

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
    player.update();
}

function draw() {
    update();

    grid.render();

    player.render();

    castAllRays();
}
