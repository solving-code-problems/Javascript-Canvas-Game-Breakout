
const MOVING_LEFT = 0;
const MOVING_RIGHT = 1;
const NOT_MOVING = 2;

const W = 1000
const H = 1000

const BRICK_COLUMNS = 8
const BRICK_ROWS = 4;

const PADDLE_WIDTH = 200;
const PADDLE_HEIGHT = 20;

class GameData {
    constructor() {
        this.paddle = {
            x: (W/2)-(PADDLE_WIDTH/2), 
            y: W-PADDLE_HEIGHT,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT
        }
        this.ball = this.initiateBall()
        this.bricks = this.initiateBricks() 
    }


    initiateBricks = () => {
        const brickWidth = W / BRICK_COLUMNS
        const brickHeight = (H*0.20) / BRICK_ROWS;
        
        const colors = ["green", "red","yellow","blue"];
        const bricks = [];
        for(let row = 0; row < BRICK_ROWS; row++) {
            const rowArray = [];
            const rowColor = colors[row % colors.length]

            for(let column = 0; column < BRICK_COLUMNS; column++) {
                rowArray.push(
                    {
                        x: 0 + (brickWidth*column),
                        y: 0 + (brickHeight*row),
                        width: brickWidth,
                        height: brickHeight,
                        color: rowColor
                    }
                )
            }
            bricks.push(rowArray) ;
        }
        return bricks;
    }

    initiateBall = () => {
        let dx = (Math.random() * 2) + 1; 
        dx = this.coinflip() ? dx : -dx;
        return {x: (W/2), y: W-30, dx: dx, dy: -5, radius: 10}
    }

    coinflip = () => {
        return Math.random() > 0.5
    }
}

const WON = 0;
const LOST = 1;
const PLAYING = 2;

class GameState {
    constructor(data) {
        this.ball = data.ball;
        this.bricks = data.bricks;
    }

    gameState = () => {
        if(this.ball.y > H) {
            return LOST;
        }
        const bricksLeft = this.bricks.filter(row => row.length !== 0);
        if(!bricksLeft.length) {
            return WON;
        }
        return PLAYING;
    }
}


class HitDetection {
    constructor(data) {
        this.ball = data.ball;
        this.bricks = data.bricks;
    }

    detectCollisions = () => {
        for(let row = 0; row < this.bricks.length; row++) {
            for(let column = 0; column < this.bricks[row].length; column++) {
                let rowArray = this.bricks[row];
                const brick = this.bricks[row][column]
                const hasColided = this.detectCollisionsInternal(this.ball, brick)
                if(hasColided) {
                    rowArray = rowArray.filter(bricks => bricks !== brick);
                    this.bricks[row] = rowArray;
                    this.applyCollisionToBall(brick);
                    break;
                }
            }
        }
    }

    applyCollisionToBall = (brick) => {
        if((brick.y + brick.height) > this.ball.y && (this.ball.y > brick.y)) {
            this.ball.dx = -this.ball.dx
        } else {
            this.ball.dy = -this.ball.dy
        }
    }

    detectCollisionsInternal = (ball, brick) => {
        
        const brickMesh = {
            topLeft: { x: brick.x,                    y: brick.y},
            topRight: { x: brick.x + brick.width,     y: brick.y },
            bottomLeft: { x: brick.x,                 y: brick.y + brick.height},
            bottomRight: { x: brick.x + brick.width,   y: brick.y + brick.height}
        }

        const ballMesh = {
            bTopLeft: {x: ball.x - ball.radius,      y: ball.y - ball.radius},
            bTopRight: { x: ball.x + ball.radius,    y: ball.y - ball.radius},
            bBotLeft: {x: ball.x - ball.radius,      y: ball.y + ball.radius},
            bBotRight: {x: ball.x + ball.radius,     y: ball.y + ball.radius}
        }

        const corners = Object.values(ballMesh)
        for(let i = 0; i < corners.length; i++) {
            if(this.didColide(corners[i], brickMesh)) {
                return true;
            }
        }
        return false;
    }

    

    didColide = (ballPoint, brickMesh) => {
        if(ballPoint.x > brickMesh.topLeft.x && ballPoint.x < brickMesh.topRight.x) {
            if(ballPoint.y > brickMesh.topLeft.y && ballPoint.y < brickMesh.bottomLeft.y) {
                return true;
            }
        }
        return false;
    }
}

class Bricks {
    constructor(render, data) {
        this.bricks = data.bricks;
        this.renderer = render;
    }

    draw = () => {
        this.renderer.strokeStyle = "white"
        this.renderer.lineWidth = 10
        this.bricks.forEach(row => {
            row.forEach(brick => {
                this.renderer.fillStyle = brick.color;
                this.renderer.fillRect(brick.x, brick.y, brick.width, brick.height);
                this.renderer.strokeRect(brick.x, brick.y, brick.width, brick.height)
            })
        })
    }
}


class Paddle {

    constructor(renderer, data) {
        this.renderer = renderer;
        this.paddle = data.paddle;
        this.state = NOT_MOVING;
        this.initEventListeners()
    }

    updatePosition = () => {
        if(this.state === MOVING_RIGHT) {
            this.paddle.x = Math.min(W - this.paddle.width, this.paddle.x + 3);
        }
        if(this.state === MOVING_LEFT) {
            this.paddle.x = Math.max(0, this.paddle.x - 3);
        }
    }

    draw = () => {
        this.updatePosition();
        this.renderer.fillRect(
            this.paddle.x,
            this.paddle.y,
            this.paddle.width,
            this.paddle.height);
    }

    initEventListeners = () => {
        document.addEventListener("keydown", (e) => {
            if(e.key === 'a') {
                this.state = MOVING_LEFT;
            }
            if(e.key === 'd') {
                this.state = MOVING_RIGHT;
            }
        })
        document.addEventListener("keyup", (e) => {
            if((e.key === 'a' && this.state === MOVING_LEFT) || (e.key === 'd' && this.state === MOVING_RIGHT)) {
                this.state = NOT_MOVING;
            }
        })
    }
}



class Ball {
    constructor(renderer, data) {
        this.renderer = renderer;
        this.ball = data.ball;
        this.paddle = data.paddle;
    }

    updatePosition = () => {
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        if(this.ball.x + this.ball.radius > W) {
            this.ball.dx = -this.ball.dx;
        }
        if(this.ball.x - this.ball.radius < 0) {
            this.ball.dx = -this.ball.dx;
        }

        if(this.isBallHittingPaddle(this.ball, this.paddle)) {
               this.applyPaddleShiftInXDirection()
               this.invertBallDirection()           
        }

        if(this.ball.y - this.ball.radius < 0) {
            this.ball.dy = -this.ball.dy
        }
    }

    isBallHittingPaddle = (ball, paddle) => {
        return (ball.y + ball.radius) > paddle.y
        && (ball.x - ball.radius) > paddle.x
        && (ball.x + ball.radius) < (paddle.x + paddle.width)
    }

    applyPaddleShiftInXDirection = () => {
        const maxDx = 5;
        const paddleMid = this.paddle.x + (this.paddle.width/2)
        const distanceFromMid = Math.abs(this.ball.x - paddleMid) 
        if(distanceFromMid != 0) {
            const percentage = distanceFromMid / 100;
            const diff = (this.ball.x > paddleMid) 
                ? (this.ball.dx + ( maxDx* percentage))
                : (this.ball.dx - (maxDx*percentage))
            
            this.ball.dx = this.ball.dx + diff;
            if(this.ball.dx > 0) {
                this.ball.dx = Math.min(3, this.ball.dx)
            }
            if(this.ball.dx < 0) {
                this.ball.dx = Math.max(-3, this.ball.dx)
            }
        }  
    }

    invertBallDirection = () => {
        this.ball.dy = this.ball.dy > 0 ? -this.ball.dy : this.ball.dy;
    }

    draw = () => {
        const render = this.renderer;
        const ball = this.ball;

        this.updatePosition()
        render.strokeStyle = "black"
        render.lineWidth = 10
        render.beginPath()
        render.arc(ball.x, ball.y, ball.radius, 0, 2*Math.PI)
        render.stroke();
    }
}


class Game {
    constructor(renderer) {
        this.renderer = renderer;
        this.data = new GameData()
        this.paddle = new Paddle(renderer, this.data);
        this.ball = new Ball(renderer, this.data);
        this.bricks = new Bricks(renderer, this.data);
        this.hitDetection = new HitDetection(this.data);
        this.gameState = new GameState(this.data);
    }


    // Called 60tps
    run = () => {
        this.clearScreen();

        this.paddle.draw();
        this.bricks.draw();
        this.ball.draw();
        this.hitDetection.detectCollisions();
        
        const state = this.gameState.gameState()
        if(state === WON) {
            alert("Congratulations")
            return;
        } else if(state === LOST) {
            alert("You lost")
            return;
        }

        window.requestAnimationFrame(this.run)
    }

    clearScreen = () => {
        this.renderer.fillStyle = "white";
        this.renderer.fillRect(0,0,W,H);
        this.renderer.fillStyle = "black"
    }
}


let canvasElement = document.getElementById("canvas-id");
const canvasContext = canvasElement.getContext("2d");
const game = new Game(canvasContext)
game.run()