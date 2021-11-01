'use strict';

(function () {

function main() {
	if (!game.over()){
		ft.time();
		updateState();
		render();
		window.requestAnimationFrame(main);
	}
}

function updateState() {
	game.update();
}

function render() {
	draw.matrixBorder();
	draw.matrix();
	draw.activePiece(game.activePiece);
	draw.nextPiece(game.nextPiece,game);
	draw.lineClearAnimation();
}

var Renderer = function (game, rendererFlag) {
	this.canvas = document.getElementById('gamecanvas');
	this.ctx = this.canvas.getContext('2d');
	this.spritesheet = new Image();
	this.spritesheet.src = './res/img/tiles24.png';
	this.x = 0;
	this.y = 0;
	this.color = 0;
	this.border = [1,2,3,4,5,6,7,8,9,10,358,359,360,361,362,363,364,365,366,367,357,
	340,323,306,289,272,255,238,221,204,187,170,153,136,119,102,85,68,51,34,17,0,
	368,351,334,317,300,283,266,249,232,215,198,181,164,147,130,113,96,79,62,45,28,11]
	this.nextPieceBox = [199,200,201,202,284,285,286,287,288,271,254,237,220,203];
};

Renderer.prototype.lineClearAnimation = function () {
	if (game.lineClearAnimationStep != 0) {
		this.x = 0;
		this.y = 0;
		for (var i = 0; i < game.markedForRemoval.length; i++) {
			for (var j = 0; j < game.lineClearAnimationStep; j++) {
				this.x = (game.markedForRemoval[i]+j) % 11;
				this.y = Math.floor((game.markedForRemoval[i]+j)/11);
				this.x = this.x * 24;
				this.y = (21-this.y) * 24;
				this.ctx.clearRect(this.x, this.y, 24, 24)
			}
		}
	}
	if (game.lineClearAnimationStep === 10) {
		game.lineClearAnimationStep = 0;
	}
};

Renderer.prototype.matrix = function () {
	if (game.shouldRedrawMatrix) {
		game.shouldRedrawMatrix = false;
		this.x = 0;
		this.y = 0;
		this.color = 0;
		this.ctx.clearRect(24,24,240,480);
		for (var i = 0; i < 231; i++) {
			if (game.matrix[i] !== -1) {
				//array index to x y tilematrix coordinates
	  			this.x = i % 11;
	  			this.y = Math.floor(i/11);
	  			//x y tilemap coordinates to x y pixel coordinates
	  			this.x = this.x * 24;
	  			this.y = (21 - this.y) * 24;
				if (game.matrix[i] !== 0) {
					this.color = game.colors[game.matrix[i]] * 24;
					this.ctx.drawImage(this.spritesheet, this.color, 0, 24, 24, this.x, this.y, 24, 24);
				}
			}
		}
	}
};

Renderer.prototype.matrixBorder = function () {
	if (game.shouldDrawBorder) {
		//pretend the matrix is 17 wide and 22 tall
		this.x = 0;
		this.y = 0;
		for (var i = 0; i < this.border.length; i++) {
			/*array index to x y tilematrix coordinates*/
			this.x = this.border[i] % 17;
			this.y = Math.floor(this.border[i]/17);
			/*x y tilemap coordinates to x y pixel coordinates*/
			this.x = this.x * 24;
			this.y = (21 - this.y) * 24;
			this.ctx.drawImage(this.spritesheet, game.colors[9]*24, 0, 24, 24, this.x, this.y, 24, 24);
		}
		if (!settings.usePentominoes) {
			for (var i = 0; i < this.nextPieceBox.length; i++) {
				/*array index to x y tilematrix coordinates*/
				this.x = this.nextPieceBox[i] % 17;
				this.y = Math.floor(this.nextPieceBox[i]/17);
				/*x y tilemap coordinates to x y pixel coordinates*/
				this.x = this.x * 24;
				this.y = (21 - this.y) * 24;
				this.ctx.drawImage(this.spritesheet, game.colors[9]*24, 0, 24, 24, this.x, this.y, 24, 24);
			}
		}
		game.shouldDrawBorder = false;
	}
};

Renderer.prototype.clearCanvas = function () {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

Renderer.prototype.activePiece = function (piece) {
	if (piece.hasNotBeenRendered) {
		this.x = 0;
		this.y = 0;
		this.color = game.colors[piece.id] * 24;
		for (var i = 0; i < piece.offsets[piece.orientation].length; i++) {
			this.ctx.clearRect(game.lastX[i], game.lastY[i], 24, 24);
		}
		for (var i = 0; i < piece.offsets[piece.orientation].length; i++) {
			if (piece.position + piece.offsets[piece.orientation][i] < 231) {
				this.x = (piece.position + (piece.offsets[piece.orientation][i])) % 11;
	  			this.y = Math.floor((piece.position + (piece.offsets[piece.orientation][i]))/11);
	  			this.x = this.x * 24;
				game.lastX[i] = this.x;
	  			this.y = (21 - this.y) * 24;
				game.lastY[i] = this.y;
				this.ctx.drawImage(this.spritesheet, this.color, 0, 24, 24, this.x, this.y, 24, 24);
			}
		}
		piece.hasNotBeenRendered = false;
	}
};

Renderer.prototype.nextPiece = function (piece,game) {
	if (game.nextQueueIsNotRendered) {
		this.x = 0;
		this.y = 0;
		this.color = game.colors[piece.id] * 24;
		if (settings.usePentominoes) {
			this.ctx.clearRect(288, 120, 120, 144);
		} else {
			this.ctx.clearRect(288, 144, 96, 96);
		}
		for (var i = 0; i < piece.offsets[piece.spawnOrientation].length; i++) {
  			this.x = (piece.spawnPosition + (piece.offsets[piece.spawnOrientation][i])) % 11;
  			this.y = Math.floor((piece.spawnPosition + (piece.offsets[piece.spawnOrientation][i]))/11);
  			this.x = (this.x + 8) * 24;
  			this.y = (27 - this.y) * 24;
			this.ctx.drawImage(this.spritesheet, this.color, 0, 24, 24, this.x, this.y, 24, 24);
		}
		game.nextQueueIsNotRendered = false;
	}
};

var Game = function () {
	this.gameOver = true;
	this.accumulator = 0;
	this.gravity = 120 * ft.oneFrame;
	this.lineClearDelay = 20 * ft.oneFrame;
	this.are = 18 * ft.oneFrame;
	this.gravityTable = [120,100,80,60,40,35,30,25,22,20,10,9,8,7,6,5,4,3.5,3,2.5,2.4,2.3,2.2,2.1,2,2,2,2,2,2,1.9,1.8,1.7,1.6,1];
	this.stats = {
		lineClears: 0,
		garbageLineClears: 0,
		totalLineClears: 0,
		level: 0,
		score: 0,
		bonus: 0
	};
	this.garbageHeight = 0;
	this.state = 0; //0 = not in game. 1 = ARE, 2 = falling, 3 = Line clear delay
	this.matrix = [];
	this.markedForRemoval = [];
	this.tetromino = {
		J: {
			offsets: [[-10,-1,0,1],[-12,-11,0,11],[-1,0,1,10],[-11,0,11,12]],
			hasNotBeenRendered: true,
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			id: 2
		},
		I: {
			offsets: [[-2,-1,0,1],[-11,0,11,22],[-2,-1,0,1],[-11,0,11,22]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 3
		},
		Z: {
			offsets: [[-11,-10,-1,0],[-11,0,1,12],[-11,-10,-1,0],[-11,0,1,12]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 4
		},
		L: {
			offsets: [[-12,-1,0,1],[-11,0,10,11],[-1,0,1,12],[-11,-10,0,11]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 5
		},
		O: {
			offsets:[[-12,-11,-1,0],[-12,-11,-1,0],[-12,-11,-1,0],[-12,-11,-1,0]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 6
		},
		T: {
			offsets:[[-11,-1,0,1],[-11,-1,0,11],[-1,0,1,11],[-11,0,1,11]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 7
		},
		S: {
			offsets:[[-12,-11,0,1],[-10,0,1,11],[-12,-11,0,1],[-10,0,1,11]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 8
		}
	}
	this.pentomino = {
		I: {
			offsets:[[-2,-1,0,1,2],[-22,-11,0,11,22],[-2,-1,0,1,2],[-22,-11,0,11,22]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 10
		},
		T: {
			offsets:[[-11,0,10,11,12],[-10,-1,0,1,12],[-12,-11,-10,0,11],[-12,-1,0,1,10]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 11
		},
		U: {
			offsets:[[-12,-10,-1,0,1],[-12,-11,0,10,11],[-1,0,1,10,12],[-11,-10,0,11,12]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 12
		},
		V: {
			offsets:[[-10,1,10,11,12],[-12,-11,-10,1,12],[-12,-11,-10,-1,10],[-12,-1,10,11,12]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 13
		},
		W: {
			offsets:[[-10,0,1,10,11],[-12,-11,0,1,12],[-11,-10,-1,0,10],[-12,-1,0,11,12]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 14
		},
		X: {
			offsets:[[-11,-1,0,1,11],[-11,-1,0,1,11],[-11,-1,0,1,11],[-11,-1,0,1,11]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 15
		},
		R: {
			offsets:[[-11,-1,0,1,10],[-11,-1,0,11,12],[-10,-1,0,1,11],[-12,-11,0,1,11]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 16
		},
		F: {
			offsets:[[-11,-1,0,1,12],[-11,-10,-1,0,11],[-12,-1,0,1,11],[-11,0,1,10,11]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 17
		},
		S: {
			offsets:[[-10,-1,0,1,10],[-12,-11,0,11,12],[-10,-1,0,1,10],[-12,-11,0,11,12]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 18
		},
		Z: {
			offsets:[[-12,-1,0,1,12],[-11,-10,0,10,11],[-12,-1,0,1,12],[-11,-10,0,10,11]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 19
		},
		J: {
			offsets:[[-10,-2,-1,0,1],[-12,-11,0,11,22],[-13,-12,-11,-10,-2],[-23,-12,-1,10,11]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 20
		},
		L: {
			offsets:[[-13,-2,-1,0,1],[-22,-11,0,10,11],[-13,-12,-11,-10,1],[-23,-22,-12,-1,10]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 21
		},
		Y: {
			offsets:[[-11,-2,-1,0,1],[-22,-12,-11,0,11],[-13,-12,-11,-10,-1],[-23,-12,-1,0,10]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 22
		},
		y: {
			offsets:[[-12,-2,-1,0,1],[-22,-11,-1,0,11],[-13,-12,-11,-10,0],[-23,-12,-11,-1,10]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 23
		},
		H: {
			offsets:[[-13,-12,-1,0,1],[-22,-11,-1,0,10],[-13,-12,-11,0,1],[-22,-12,-11,-1,10]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 24
		},
		N: {
			offsets:[[-11,-10,-2,-1,0],[-23,-12,-11,0,11],[-12,-11,-10,-2,-1],[-23,-12,-1,0,11]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 25
		},
		P: {
			offsets:[[-11,-10,-1,0,1],[-12,-11,-1,0,11],[-1,0,1,10,11],[-11,0,1,11,12]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 26
		},
		Q: {
			offsets:[[-12,-11,-1,0,1],[-11,-1,0,10,11],[-1,0,1,11,12],[-11,-10,0,1,11]],
			spawnPosition: 226,
			spawnOrientation: 0,
			position: 226,
			orientation: 0,
			hasNotBeenRendered: true,
			id: 27
		}
	}
	        //unused,g,J,I,Z,L,O,T,Z,border,pentominoes
	this.colors = [0,5,4,4,4,4,4,4,4,1,     4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4];
	this.shouldLockPiece = false;
	this.next = this.memorylessRandomizer([this.tetromino.J,this.tetromino.I,this.tetromino.Z,this.tetromino.L,this.tetromino.O,this.tetromino.T,this.tetromino.S]);
	this.activePiece = this.next();
	this.nextPiece = this.next();
	this.nextQueueIsNotRendered = true;
	this.lastX = [-24,-24,-24,-24,-24];
	this.lastY = [-24,-24,-24,-24,-24];
	this.lineClearAnimationStep = 0;
	this.shouldRedrawMatrix = true;
	this.shouldDrawBorder = true;
	this.pendingGarbage = 0;
	this.update;
	this.lastMode = 0;
	this.howManyColors = this.colorRandomizer([2,3,3,3,4])
};

Game.prototype.moveLeft = function () {
	if (this.canMoveLeft()) {
		this.activePiece.position -= 1;
		this.activePiece.hasNotBeenRendered = true;
		return true;
	} else {
		return false;
	}
};

Game.prototype.moveRight = function () {
	if (this.canMoveRight()) {
		this.activePiece.position += 1;
		this.activePiece.hasNotBeenRendered = true;
		return true;
	} else {
		return false;
	}
};

Game.prototype.moveDown = function () {
	if (this.canMoveDown()) {
		this.activePiece.position -= 11;
		this.activePiece.hasNotBeenRendered = true;
		return true;
	} else {
		return false;
	}
};

Game.prototype.rotateClockwise = function () {
	let offset = this.canRotateClockwise();
	if (offset !== false) {
		this.activePiece.orientation = (this.activePiece.orientation + 1) % 4;
		this.activePiece.position += offset;
		this.activePiece.hasNotBeenRendered = true;
		return true;
	} else {
		return false;
	}
};

Game.prototype.rotateCounterClockwise = function () {
	let offset = this.canRotateCounterClockwise();
	if (offset !== false) {
		this.activePiece.orientation = (this.activePiece.orientation + 3) % 4;
		this.activePiece.position += offset;
		this.activePiece.hasNotBeenRendered = true;
		return true;
	} else {
		return false;
	}
};

Game.prototype.canMoveLeft = function () {
	if (this.isPossible(0,-1)) {
		return true;
	} else {
		return false;
	}
};

Game.prototype.canMoveRight = function () {
	if (this.isPossible(0,1)) {
		return true;
	} else {
		return false;
	}
};

Game.prototype.canMoveDown = function () {
	if (this.isPossible(0,-11)) {
		return true;
	} else {
		return false;
	}
};

Game.prototype.canRotateClockwise = function () {
	/*
	if (this.isPossible(1,0)) {
		return true;
	} else {
		return false;
	}
	*/
	let offsets = [0,1,-1];
	if (this.activePiece === this.tetromino.I) {
		offsets.push(2);
	}
	for (const offset of offsets) {
		if (this.isPossible(1,offset)) {
			return offset;
		}
	}
	return false;
};

Game.prototype.canRotateCounterClockwise = function () {
	/*
	if (this.isPossible(3,0)) {
		return true;
	} else {
		return false;
	}
	*/
	let offsets = [0,-1,1];
	if (this.activePiece === this.tetromino.I) {
		offsets.push(2);
	}
	for (const offset of offsets) {
		if (this.isPossible(3,offset)) {
			return offset;
		}
	}
	return false;
};

Game.prototype.isPossible = function (orientation,position) {
var newOrientation = (this.activePiece.orientation + orientation) % this.activePiece.offsets.length;
var newPosition = this.activePiece.position + position;
	for (var i = 0; i < this.activePiece.offsets[newOrientation].length; i++){
		if (this.matrix[newPosition + this.activePiece.offsets[newOrientation][i]] != 0) {
			return false;
		}
	}
	return true;
}

Game.prototype.lockPiece = function () {
	audio.play(audio.lock)
	this.shouldLockPiece = false;
	var leftMostBlock = 0;
	for (var i = 0; i < this.activePiece.offsets[this.activePiece.orientation].length; i++) {
		this.matrix[this.activePiece.position + this.activePiece.offsets[this.activePiece.orientation][i]] = this.activePiece.id;
		leftMostBlock = this.activePiece.position + this.activePiece.offsets[this.activePiece.orientation][i] - ((this.activePiece.position + this.activePiece.offsets[this.activePiece.orientation][i]) % 11);
		this.matrix[leftMostBlock] --;
	}
};

Game.prototype.over = function () {
	return this.gameOver;
};

Game.prototype.initMatrix = function () {
	for (var i = 0; i < 253; i++) {
		if (i < 11 || i % 11 == 0) {
			this.matrix[i] = -1;
		}
		else {
			this.matrix[i] = 0;
		}
	}
};

Game.prototype.changeColor = function (id,value) {
	if (id === 0 && value === 0) {
		var numColors = this.howManyColors();
		var randomColors = [];
		for (var i = 0; i < numColors; i++) {
			randomColors.push(Math.floor(Math.random() * (54)) + 1);
		}
		for (var i = 1; i < this.colors.length; i++) {
			if (i === 9) {
				i++; //dont randomize matrix border
			}
			this.colors[i] = randomColors[Math.floor(Math.random() * (randomColors.length))];
		}
		this.colors[1] = Math.floor(Math.random() * (54)) + 1;//increase the chance of garbage being a different color than the pieces
		randomColors.length = 0;
	}
	else if (this.colors[id] + value === 0) {
		this.colors[id] = 54;
	}
	else if (this.colors[id] + value === 55) {
		this.colors[id] = 1;
	}
	else {
		this.colors[id] += value;
	}
	this.shouldDrawBorder = true;
	this.shouldRedrawMatrix = true;
	this.activePiece.hasNotBeenRendered = true;
	this.nextQueueIsNotRendered = true;
};

Game.prototype.getMatrix = function () {
	return this.matrix;
};

Game.prototype.memorylessRandomizer = function (pieces) {
	return function () {
		return pieces[Math.floor(Math.random() * pieces.length)];
	}
};

Game.prototype.colorRandomizer = function (colors) {
    var buf = colors.slice(),
        size = colors.length,
        ptr = -1;

    var shuffle = function () {
        for (var t, j, i = 1; i < size; i++) {
            j = Math.random() * (i+1) |0;
            t = buf[i];
            buf[i] = buf[j];
            buf[j] = t;
        }
        ptr = size;
    };

    shuffle();

    return function () {
        var ret = buf[--ptr];
        if (!ptr) shuffle();
        return ret;
    };
};

Game.prototype.resetActivePiece = function () {
	this.activePiece.hasNotBeenRendered = true;
	this.activePiece.position = this.activePiece.spawnPosition;
	this.activePiece.orientation = this.activePiece.spawnOrientation;
	this.lastX = [-24,-24,-24,-24,-24];
	this.lastY = [-24,-24,-24,-24,-24];
};

Game.prototype.updatePieceQueue = function () {
	this.resetActivePiece();
	this.activePiece = this.nextPiece;
	this.nextPiece = this.next();
	this.nextQueueIsNotRendered = true;
	this.gameOverTest();
};

Game.prototype.gameOverTest = function () {
	for (var i = 0; i < this.activePiece.offsets[this.activePiece.orientation].length; i++) {
		if (this.matrix[this.activePiece.position + this.activePiece.offsets[this.activePiece.orientation][i]] != 0) {
			this.gameOver = true;
			audio.play(audio.gameOver);
			setTimeout(function(){ ui.showGameOverDiv(); }, 0);
		}
	}
};

Game.prototype.applyGravity = function () {
	if (this.accumulator > this.gravity) {
		this.accumulator -= this.gravity;
		if (controller.drop.isPressed && !controller.left.isPressed && !controller.right.isPressed) {
			//do nothing
		}
		else if (!controller.drop.isPressed && !controller.autoDrop) {
			if (!this.moveDown()) {
				this.shouldLockPiece = true;
			}
		}
		else if (!(controller.autoDrop && !controller.left.isPressed && !controller.right.isPressed)) {
			if (!this.moveDown()) {
				this.shouldLockPiece = true;
			}
		}
	}
};

Game.prototype.processAre = function () {
	if (this.markedForRemoval.length > 0 && this.accumulator > (0.5 * this.are)) { //After a line clear, makes the stack hang in the air for half the duration of ARE
		this.collapseStack();
		this.shouldRedrawMatrix = true;
		this.markedForRemoval.length = 0;
	}
	if (this.accumulator > this.are) {
		this.accumulator -= this.are;
		this.updatePieceQueue();
		this.state = 2; //falling
	}
};

Game.prototype.processLineClearDelay = function () {
	this.lineClearAnimationStep = Math.floor(10 * (this.accumulator/this.lineClearDelay));
	if (this.lineClearAnimationStep > 10) {
		this.lineClearAnimationStep = 10;
	}

	if (this.accumulator > this.lineClearDelay) {
		this.accumulator -= this.lineClearDelay;
		this.state = 1; //are
	}
};

Game.prototype.shouldLock = function () {
	return this.shouldLockPiece;
};

Game.prototype.lineClearCheck = function () {
	var clear = 0;
	var garbageClear = 0;
	var sum = 0;
	for (var i = 242; i > 0; i -= 11) {
		if (this.matrix[i] === -11) {
			clear++;
			this.markedForRemoval.push(i+1);
		} else if (this.matrix[i] === -22) {
			garbageClear++;
			this.garbageHeight--;
			this.markedForRemoval.push(i+1);
		}
	}
	sum = clear + garbageClear;
	if (sum > 0 && sum < 4) {
		audio.play(audio.lineClear);
	} else if (sum === 4 || sum === 5) {
		audio.play(audio.lineClear4);
	}
	if (sum > 0) {
		this.state = 3;
	} else {
		this.state = 1;
	}
	return {
		clear: clear,
		garbageClear: garbageClear
	};
};

Game.prototype.collapseStack = function () {
	for (var i = 242; i > 0; i -= 11) {
		if (this.matrix[i] === -11 || this.matrix[i] === -22) {
			for (var j = i; j < 242; j++) {
				this.matrix[j] = this.matrix[j + 11];
			}
			//deals with a corner case that occurs only if there are blocks on row 22 after a line clear.
			if (this.matrix[242] != -1){
				this.matrix[242] = -1;
				for (var k = 243; k < 253; k++) {
					this.matrix[k] = 0;
				}
			}
		}
	}
};

Game.prototype.raiseStack = function () {
	for (var i = 252; i > 21; i--) {
		this.matrix[i] = this.matrix[i-11];
	}
};

Game.prototype.addGarbageLine = function (min,max) {
	if (min !== undefined && max !== undefined && min <= max && max < 11 && min > 0) {
		var numHoles = Math.floor(Math.random() * (max - min + 1)) + min;
	} else {
		var numHoles = 1;
	}
	this.raiseStack();
	this.garbageHeight++;
	this.matrix[11] = -22 + numHoles;
	for (var i = 12; i < 22; i++) {
		this.matrix[i] = 1;
	}
	var holePosition = 0;
	for (var i = 0; i < numHoles; i++) {
		holePosition = Math.floor(Math.random() * (21 - 12 + 1)) + 12;
		//if there already is a hole at this position, keep trying
		while (this.matrix[holePosition] === 0) {
			holePosition = Math.floor(Math.random() * (21 - 12 + 1)) + 12;
		}
		this.matrix[holePosition] = 0;
	}
}

Game.prototype.reset = function () {
	this.stats = {
		lineClears: 0,
		garbageLineClears: 0,
		totalLineClears: 0,
		level: 0,
		score: 0,
		bonus: 0
	};
	this.garbageHeight = 0;
	this.pendingGarbage = 0;
	this.gravity = this.gravityTable[this.stats.level] * ft.oneFrame;
	this.lineClearDelay = 20 * ft.oneFrame;
	this.are = 18 * ft.oneFrame;
	this.lineClearAnimationStep = 0;
	this.shouldRedrawMatrix = true;
	this.shouldDrawBorder = true;
	this.nextQueueIsNotRendered = true;
	this.markedForRemoval.length = 0;
	this.lastX = [-24,-24,-24,-24,-24];
	this.lastY = [-24,-24,-24,-24,-24];
	this.accumulator = 0;
	this.shouldLockPiece = false;
	controller.reset();
	this.initMatrix();
	this.resetPolyminoes();
	if (settings.usePentominoes) {
        this.next = this.memorylessRandomizer([this.pentomino.I,this.pentomino.T,this.pentomino.U,this.pentomino.V,this.pentomino.W,this.pentomino.X,this.pentomino.R,this.pentomino.F,this.pentomino.S,this.pentomino.Z,this.pentomino.J,this.pentomino.L,this.pentomino.Y,this.pentomino.y,this.pentomino.H,this.pentomino.N,this.pentomino.P,this.pentomino.Q])
	} else {
		this.next = this.memorylessRandomizer([this.tetromino.J,this.tetromino.I,this.tetromino.Z,this.tetromino.L,this.tetromino.O,this.tetromino.T,this.tetromino.S]);
	}
	this.activePiece = this.next();
	this.nextPiece = this.next();
	this.state = 2;
	this.activePiece.hasNotBeenRendered = true;
};

Game.prototype.resetPolyminoes = function () {
	this.tetromino.J.hasNotBeenRendered = true;
	this.tetromino.I.hasNotBeenRendered = true;
	this.tetromino.Z.hasNotBeenRendered = true;
	this.tetromino.L.hasNotBeenRendered = true;
	this.tetromino.O.hasNotBeenRendered = true;
	this.tetromino.T.hasNotBeenRendered = true;
	this.tetromino.S.hasNotBeenRendered = true;
	this.pentomino.I.hasNotBeenRendered = true;
	this.pentomino.T.hasNotBeenRendered = true;
	this.pentomino.U.hasNotBeenRendered = true;
	this.pentomino.V.hasNotBeenRendered = true;
	this.pentomino.W.hasNotBeenRendered = true;
	this.pentomino.X.hasNotBeenRendered = true;
	this.pentomino.R.hasNotBeenRendered = true;
	this.pentomino.F.hasNotBeenRendered = true;
	this.pentomino.S.hasNotBeenRendered = true;
	this.pentomino.Z.hasNotBeenRendered = true;
	this.pentomino.J.hasNotBeenRendered = true;
	this.pentomino.L.hasNotBeenRendered = true;
	this.pentomino.Y.hasNotBeenRendered = true;
	this.pentomino.y.hasNotBeenRendered = true;
	this.pentomino.H.hasNotBeenRendered = true;
	this.pentomino.N.hasNotBeenRendered = true;
	this.pentomino.P.hasNotBeenRendered = true;
	this.pentomino.Q.hasNotBeenRendered = true;
};

Game.prototype.restartLastMode = function () {
	if (this.lastMode === 1) {
		this.startMarathonMode();
	} else if (this.lastMode === 2) {
		this.startDigMode();
	} else if (this.lastMode === 3) {
		this.startFashionMode();
	} else if (this.lastMode === 4) {
		this.startMixMode();
	}
};

Game.prototype.startMarathonMode = function () {
	this.reset();
	this.lastMode = 1;
	stats.update("Score: 0 <br>Lines: 0 <br>Level: 0 <br>");
	draw.clearCanvas();
	draw.matrixBorder();
	ui.showGame();
	var self = this;
	countdown.begin();
	setTimeout(function(){
		ft.begin();
		self.gameOver = false;
		self.update = self.marathonMode();
		window.requestAnimationFrame(main);
	}, 3000);
};

Game.prototype.marathonMode = function () {
	return function () {
		this.accumulator += ft.elapsedTime;
		controller.processInputs();
		if (this.state === 2) { //piece is falling
			this.applyGravity();
			if (this.shouldLock()) {
				this.lockPiece();
				var line = this.lineClearCheck();
				if (line.clear > 0) {
					if (line.clear === 4 || line.clear === 5) {
						this.stats.bonus++;
					}
					this.stats.lineClears += line.clear;
					if (this.stats.level < 18) {
						/*
						It's possible to advance from level 17 to level 19 with this formula.
						Not intentional, but intentionally not fixed.
						*/
						this.stats.level = Math.floor(this.stats.lineClears/10) + this.stats.bonus;

					} else if (this.stats.lineClears > 179) {
						this.stats.level = Math.floor(this.stats.lineClears/10);
					}
					if (line.clear === 1) {
						this.stats.score += 40 * (this.stats.level + 1);
					} else if (line.clear === 2) {
						this.stats.score += 100 * (this.stats.level + 1);
					} else if (line.clear === 3) {
						this.stats.score += 300 * (this.stats.level + 1);
					} else if (line.clear === 4) {
						this.stats.score += 1200 * (this.stats.level + 1);
					} else if (line.clear === 5) {
						this.stats.score += 2000 * (this.stats.level + 1);
					}
					if (this.stats.level < this.gravityTable.length) {
						this.gravity = this.gravityTable[this.stats.level] * ft.oneFrame;
						if (this.stats.level > 23) {
							this.are = 10 * ft.oneFrame;
						}
					}

					stats.update("Score: "+ this.stats.score +" <br>Lines: "+ this.stats.lineClears +" <br>Level: "+ this.stats.level + " <br>");

				}
			}
		} else if (this.state === 1) { //ARE
			this.processAre();
		} else if (this.state === 3) { //Line clear delay
			this.processLineClearDelay();
		}
	}
};

Game.prototype.startDigMode = function () {
	this.reset();
	this.lastMode = 2;
	for (var i = 0; i < 5; i++) {
		this.addGarbageLine();
	}
	stats.update("Score: 0 <br>Garbage: 0 <br>Lines: 0 <br>Level: 0 <br>");
	draw.clearCanvas();
	draw.matrixBorder();
	ui.showGame();
	var self = this;
	countdown.begin();
	setTimeout(function(){
		ft.begin();
		self.gameOver = false;
		self.update = self.digMode();
		window.requestAnimationFrame(main);
	}, 3000);
};

Game.prototype.digMode = function () {
	return function () {
		this.accumulator += ft.elapsedTime;
		controller.processInputs();
		if (this.state === 2) { //piece is falling
			this.applyGravity();
			if (this.shouldLock()) {
				this.lockPiece();
				var line = this.lineClearCheck();
				if (line.clear > 0 || line.garbageClear > 0) {
					this.stats.lineClears += line.clear;
					this.stats.garbageLineClears += line.garbageClear;
					this.stats.level = Math.floor((this.stats.lineClears+this.stats.garbageLineClears)/10);
					this.stats.score += 800 * line.garbageClear * (this.stats.level + 1);
					if (this.stats.level < this.gravityTable.length) {
						this.gravity = this.gravityTable[this.stats.level] * ft.oneFrame;
					}
					stats.update("Score: "+ this.stats.score +" <br>Garbage: "+ this.stats.garbageLineClears+" <br>Lines: "+ this.stats.lineClears +" <br>Level: "+ this.stats.level + " <br>");
				}
			}
		} else if (this.state === 1) { //ARE
			if (this.garbageHeight < 5 && this.stats.level < 17) {
				this.addGarbageLine();
			} else if (this.garbageHeight < 3 && this.stats.level < 21) {
				this.addGarbageLine();
			} else if (this.garbageHeight < 2) {
				this.addGarbageLine();
			}
			this.processAre();
		} else if (this.state === 3) { //Line clear delay
			this.processLineClearDelay();
		}
	}
};

Game.prototype.startFashionMode = function () {
	this.reset();
	this.lastMode = 3;
	this.gravity = 1200 * ft.oneFrame;
	draw.clearCanvas();
	draw.matrixBorder();
	stats.update('');
	ui.showGame();
	ui.showFashionModeControls();
	var self = this;
	countdown.begin();
	setTimeout(function(){
		ft.begin();
		self.gameOver = false;
		self.update = self.fashionMode();
		window.requestAnimationFrame(main);
	}, 3000);
};

Game.prototype.fashionMode = function () {
	return function () {
		this.accumulator += ft.elapsedTime;
		controller.processInputs();
		if (this.state === 2) { //piece is falling
			this.applyGravity();
			if (this.shouldLock()) {
				this.lockPiece();
				this.lineClearCheck();
			}
		} else if (this.state === 1) { //ARE
			this.processAre();
		} else if (this.state === 3) { //Line clear delay
			this.processLineClearDelay();
		}
	}
};

Game.prototype.startMixMode = function () {
	this.reset();
	this.lastMode = 4;
	stats.update("Score: 0 <br>Lines: 0 <br>Level: 0 <br>");
	draw.clearCanvas();
	draw.matrixBorder();
	ui.showGame();
	var self = this;
	countdown.begin();
	setTimeout(function(){
		ft.begin();
		self.gameOver = false;
		self.update = self.mixMode();
		window.requestAnimationFrame(main);
	}, 3000);
};

Game.prototype.mixMode = function () {
	return function () {
		this.accumulator += ft.elapsedTime;
		controller.processInputs();
		if (this.state === 2) { //piece is falling
			this.applyGravity();
			if (this.shouldLock()) {
				this.lockPiece();
				var line = this.lineClearCheck();
				if (line.clear > 0 || line.garbageClear > 0) {
					line.clear += line.garbageClear;
					if (line.clear === 4 || line.clear === 5) {
						this.stats.bonus++;
					}
					this.stats.lineClears += line.clear;
					if (this.stats.level < 18) {
						/*
						It's possible to advance from level 17 to level 19 with this formula.
						Not intentional, but intentionally not fixed.
						*/
						this.stats.level = Math.floor(this.stats.lineClears/10) + this.stats.bonus;

					} else if (this.stats.lineClears > 179) {
						this.stats.level = Math.floor(this.stats.lineClears/10);
					}
					if (line.clear === 1) {
						this.stats.score += 40 * (this.stats.level + 1);
					} else if (line.clear === 2) {
						this.stats.score += 100 * (this.stats.level + 1);
					} else if (line.clear === 3) {
						this.stats.score += 300 * (this.stats.level + 1);
					} else if (line.clear === 4) {
						this.stats.score += 1200 * (this.stats.level + 1);
						this.pendingGarbage++;
					} else if (line.clear === 5) {
						this.stats.score += 2000 * (this.stats.level + 1);
					}
					if (this.stats.level < this.gravityTable.length) {
						this.gravity = this.gravityTable[this.stats.level] * ft.oneFrame;
						if (this.stats.level > 25) {
							this.are = 14 * ft.oneFrame;
						}
					}

					stats.update("Score: "+ this.stats.score +" <br>Lines: "+ this.stats.lineClears +" <br>Level: "+ this.stats.level + " <br>");

				}
			}
		} else if (this.state === 1) { //ARE
			if (this.pendingGarbage && this.accumulator > (0.5 * this.are)) {
				for (var i = 0; i < this.pendingGarbage; i++) {
					this.addGarbageLine();
				}
				this.pendingGarbage = 0;
			}
			this.processAre();
		} else if (this.state === 3) { //Line clear delay
			this.processLineClearDelay();
		}
	}
};

var Controller = function () {
	this.repeatDelay = 16 * ft.oneFrame;
	this.repeatInterval = 6 * ft.oneFrame;
	this.dropSpeed = 2 * ft.oneFrame;
	this.dasAccumulator = 0;
	this.dropAccumulator = 0;
	this.wallCharge = false;
	this.left = {
		isPressed: false,
		pendingMove: false,
	}
	this.right = {
		isPressed: false,
		pendingMove: false,
	}
	this.rotateClockwise = {
		pending: false,
		isPressed: false
	}
	this.rotateCounterClockwise = {
		pending: false,
		isPressed: false
	}
	this.drop = {
		isPressed: false,
	}
	this.autoDrop = false;

	var self = this;

	document.addEventListener("keydown", function(event) {
		if (!game.over()) {
			if (event.keyCode === settings.keyLeft && self.left.isPressed === false) {
				self.left.isPressed = true;
				self.left.pendingMove = true;
			} else if (event.keyCode === settings.keyRight && self.right.isPressed === false) {
				self.right.isPressed = true;
				self.right.pendingMove = true;
			} else if (event.keyCode === settings.keyCw && self.rotateClockwise.isPressed === false) {
				self.rotateClockwise.pending = true;
				self.rotateClockwise.isPressed = true;
			} else if (event.keyCode === settings.keyCcw && self.rotateCounterClockwise.isPressed === false) {
				self.rotateCounterClockwise.pending = true;
				self.rotateCounterClockwise.isPressed = true;
			}
			else if (event.keyCode === settings.keySoftdrop && self.drop.isPressed === false) {
				self.drop.pendingMove = true;
				self.drop.isPressed = true;
			}
			else if (event.keyCode === settings.keyAutodrop) {
				self.autoDrop = !self.autoDrop;
			}
		} else if (ui.inKeyConfig) {
			ui.updateKeyConfig(event);
		}
	});
	document.addEventListener("keyup", function(event) {
		if (!game.over()) {
			if (event.keyCode === settings.keyLeft) {
				self.left.isPressed = false;
				self.left.pendingMove = false;
			} else if (event.keyCode === settings.keyRight) {
				self.right.isPressed = false;
				self.right.pendingMove = false;
			} else if (event.keyCode === settings.keyCw) {
				self.rotateClockwise.pending = false;
				self.rotateClockwise.isPressed = false;
			} else if (event.keyCode === settings.keyCcw) {
				self.rotateCounterClockwise.pending = false;
				self.rotateCounterClockwise.isPressed = false;
			}
			else if (event.keyCode === settings.keySoftdrop) {
				self.drop.isPressed = false;
			}
		}
	});
};

Controller.prototype.reset = function () {
	this.dasAccumulator = 0;
	this.dropAccumulator = 0;
	this.wallCharge = false;
	this.left = {
		isPressed: false,
		pendingMove: false,
	}
	this.right = {
		isPressed: false,
		pendingMove: false,
	}
	this.rotateClockwise = {
		pending: false,
		isPressed: false
	}
	this.rotateCounterClockwise = {
		pending: false,
		isPressed: false
	}
	this.drop = {
		isPressed: false,
	}
	this.autoDrop = false;
};

Controller.prototype.processInputs = function () {
	if (game.state === 2) { //Falling
		this.processInputsFalling();
	} else if (game.state === 1) { //ARE
		this.processInputsAre();
	} else if (game.state === 3) { //line clear delay
		this.processInputsLineClearDelay();
	}
};

Controller.prototype.processInputsFalling = function () {
	if (this.left.isPressed || this.right.isPressed) {
		if (this.wallCharge) {
			this.wallCharge = false;
			this.left.pendingMove = false;
			this.right.pendingMove = false;
			this.dasAccumulator = this.repeatDelay;
		} else {
			this.dasAccumulator += ft.elapsedTime;
		}
	} else if (!this.left.isPressed && !this.right.isPressed) {
		this.dasAccumulator = 0;
		if (this.wallCharge) {
			this.wallCharge = false;
		}
	}

	if (this.left.pendingMove) {
		this.left.pendingMove = false;
		if (!game.moveLeft()) {
			this.dasAccumulator = this.repeatDelay;
		}
	}
	if (this.right.pendingMove) {
		this.right.pendingMove = false;
		if (!game.moveRight()) {
			this.dasAccumulator = this.repeatDelay;
		}
	}

	if (this.left.isPressed && this.dasAccumulator > this.repeatDelay) {
		if (game.moveLeft()) {
			this.dasAccumulator -= this.repeatInterval;
		} else {
			this.dasAccumulator = this.repeatDelay;
		}
	}
	if (this.right.isPressed && this.dasAccumulator > this.repeatDelay) {
		if (game.moveRight()) {
			this.dasAccumulator -= this.repeatInterval;
		} else {
			this.dasAccumulator = this.repeatDelay;
		}
	}

	if (this.rotateClockwise.pending) {
		if (game.rotateClockwise()) {
			this.rotateClockwise.pending = false;
		}
	}
	if (this.rotateCounterClockwise.pending) {
		if (game.rotateCounterClockwise()) {
			this.rotateCounterClockwise.pending = false;
		}
	}

	if (game.gravity < this.dropSpeed) {
		this.drop.isPressed = false;
		this.autoDrop = false;
	}
	if ((this.drop.isPressed && !this.left.isPressed && !this.right.isPressed) || (this.autoDrop && !this.left.isPressed && !this.right.isPressed)) {
		this.dropAccumulator += ft.elapsedTime;
		if (this.dropAccumulator > this.dropSpeed) {
			this.dropAccumulator -= this.dropSpeed;
			if (!game.moveDown()) {
				game.accumulator = this.dropAccumulator;
				game.shouldLockPiece = true;
			}
		}
	}
};

Controller.prototype.processInputsAre = function () {
	if (this.left.isPressed || this.right.isPressed) {
		this.wallCharge = true;
	} else if (!this.left.isPressed && !this.right.isPressed) {
		this.wallCharge = false;
	}
	if (this.rotateClockwise.isPressed && !this.rotateClockwise.pending) {
		this.rotateClockwise.pending = true;
	} else if (!this.rotateClockwise.isPressed && this.rotateClockwise.pending) {
		this.rotateClockwise.pending = false;
	}
	if (this.rotateCounterClockwise.isPressed && !this.rotateCounterClockwise.pending) {
		this.rotateCounterClockwise.pending = true;
	} else if (!this.rotateCounterClockwise.isPressed && this.rotateCounterClockwise.pending) {
		this.rotateCounterClockwise.pending = false;
	}
};

Controller.prototype.processInputsLineClearDelay = function () {
	this.processInputsAre();
};

var Settings = function() {
	this.audioEnabled = true;
	this.usePentominoes = false;
	this.keyLeft = 37;
	this.keyRight = 39;
	this.keyCcw = 90;
	this.keyCw = 88;
	this.keySoftdrop = 40;
	this.keyAutodrop = 32;
}

Settings.prototype.toggleSound = function () {
	this.audioEnabled = !this.audioEnabled;
};

Settings.prototype.togglePentominoes = function () {
    this.usePentominoes = !this.usePentominoes;
};

var UserInterface = function () {
	var self = this;
	this.inKeyConfig = false;
	this.settingsdiv = document.getElementById('settingsdiv');
	this.gamediv = document.getElementById('gamediv');
	this.mainmenudiv = document.getElementById('mainmenudiv');
	this.keyconfigdiv = document.getElementById('keyconfigdiv');
	this.confirmkeyconfigdiv = document.getElementById('confirmkeyconfigdiv');
	this.gameoverdiv = document.getElementById('gameoverdiv');
	this.fashionmodecontrols = document.getElementById('fashionmodecontrols');

	this.mainmenubutton = document.getElementsByClassName('returntomainmenubutton');
	this.restartlastmodebutton = document.getElementById('restartlastmodebutton');
	this.settingsbutton = document.getElementById('settingsbutton');
	this.soundtogglebutton = document.getElementById('soundtogglebutton');
    this.pentominotogglebutton = document.getElementById('pentominotogglebutton');
	this.keyconfigbutton = document.getElementById('keyconfigbutton');
	this.confirmkeybindingsbutton = document.getElementById('confirmkeybindingsbutton');
	this.retrykeybindingsbutton = document.getElementById('retrykeybindingsbutton');
	this.playmarathonbutton = document.getElementById('playmarathonbutton');
	this.playdigbutton = document.getElementById('playdigbutton');
	this.playFashionModebutton = document.getElementById('playfashionmodebutton');
	this.playmixbutton = document.getElementById('playmixbutton');
	this.decrementibutton = document.getElementById('i-');
	this.incrementibutton = document.getElementById('i+');
	this.decrementzbutton = document.getElementById('z-');
	this.incrementzbutton = document.getElementById('z+');
	this.decrementjbutton = document.getElementById('j-');
	this.incrementjbutton = document.getElementById('j+');
	this.decrementlbutton = document.getElementById('l-');
	this.incrementlbutton = document.getElementById('l+');
	this.decrementobutton = document.getElementById('o-');
	this.incrementobutton = document.getElementById('o+');
	this.decrementtbutton = document.getElementById('t-');
	this.incrementtbutton = document.getElementById('t+');
	this.decrementsbutton = document.getElementById('s-');
	this.incrementsbutton = document.getElementById('s+');
	this.decrementgbutton = document.getElementById('g-');
	this.incrementgbutton = document.getElementById('g+');
	this.decrementfbutton = document.getElementById('f-');
	this.incrementfbutton = document.getElementById('f+');
	this.addgarbagebutton = document.getElementById('addgarbagebutton');
	this.randomizecolorsbutton = document.getElementById('randomizecolors');
	this.restartlastmodebutton.addEventListener('click', function() { game.restartLastMode() }, false);
	this.settingsbutton.addEventListener('click', function() { self.showSettings() }, false);
	this.soundtogglebutton.addEventListener('click', function() { self.toggleSound() }, false);
    this.pentominotogglebutton.addEventListener('click', function() { self.togglePentominoes() }, false);
	this.keyconfigbutton.addEventListener('click', function() { self.showKeyConfig() }, false);
	this.confirmkeybindingsbutton.addEventListener('click', function() { self.showSettings() }, false);
	this.retrykeybindingsbutton.addEventListener('click', function() { self.showKeyConfig() }, false);
	this.playmarathonbutton.addEventListener('click', function() { game.startMarathonMode() }, false);
	this.playdigbutton.addEventListener('click', function() { game.startDigMode() }, false);
	this.playFashionModebutton.addEventListener('click', function() { game.startFashionMode() }, false);
	this.playmixbutton.addEventListener('click', function() {game.startMixMode() }, false);
	this.decrementibutton.addEventListener('click', function() {game.changeColor(3,-1) }, false);
	this.incrementibutton.addEventListener('click', function() {game.changeColor(3,1) }, false);
	this.decrementzbutton.addEventListener('click', function() {game.changeColor(4,-1) }, false);
	this.incrementzbutton.addEventListener('click', function() {game.changeColor(4,1) }, false);
	this.decrementjbutton.addEventListener('click', function() {game.changeColor(2,-1) }, false);
	this.incrementjbutton.addEventListener('click', function() {game.changeColor(2,1) }, false);
	this.decrementlbutton.addEventListener('click', function() {game.changeColor(5,-1) }, false);
	this.incrementlbutton.addEventListener('click', function() {game.changeColor(5,1) }, false);
	this.decrementobutton.addEventListener('click', function() {game.changeColor(6,-1) }, false);
	this.incrementobutton.addEventListener('click', function() {game.changeColor(6,1) }, false);
	this.decrementtbutton.addEventListener('click', function() {game.changeColor(7,-1) }, false);
	this.incrementtbutton.addEventListener('click', function() {game.changeColor(7,1) }, false);
	this.decrementsbutton.addEventListener('click', function() {game.changeColor(8,-1) }, false);
	this.incrementsbutton.addEventListener('click', function() {game.changeColor(8,1) }, false);
	this.decrementgbutton.addEventListener('click', function() {game.changeColor(1,-1) }, false);
	this.incrementgbutton.addEventListener('click', function() {game.changeColor(1,1) }, false);
	this.decrementfbutton.addEventListener('click', function() {game.changeColor(9,-1) }, false);
	this.incrementfbutton.addEventListener('click', function() {game.changeColor(9,1) }, false);
	this.addgarbagebutton.addEventListener('click', function() {
		game.addGarbageLine();
		game.shouldRedrawMatrix = true;
		game.activePiece.hasNotBeenRendered = true;
	}, false);
	this.randomizecolorsbutton.addEventListener('click', function() {game.changeColor(0,0);}, false);
	for (var i = 0; i < this.mainmenubutton.length; i++) {
		this.mainmenubutton[i].addEventListener('click', function() { self.showMainMenu() }, false);
	}
};

UserInterface.prototype.hideall = function () {
	this.settingsdiv.style.display = 'none';
	this.gamediv.style.display = 'none';
	this.mainmenudiv.style.display ='none';
	this.keyconfigdiv.style.display = 'none';
	this.confirmkeyconfigdiv.style.display = 'none';
	this.gameoverdiv.style.display = 'none';
	this.fashionmodecontrols.style.display = 'none';
};

UserInterface.prototype.showGame = function () {
	this.hideall();
	this.gamediv.style.display = 'inline';
};

UserInterface.prototype.showSettings = function () {
	this.hideall();
	this.settingsdiv.style.display = 'inline';
};

UserInterface.prototype.showMainMenu = function () {
	this.hideall();
	this.mainmenudiv.style.display = 'inline';
};

UserInterface.prototype.showKeyConfig = function () {
	this.hideall();
	this.inKeyConfig = 1;
	this.keyconfigdiv.innerHTML = "← move left | press a key<br>→<br>↺<br>↻<br>↓<br>⇊";
	this.keyconfigdiv.style.display = 'inline';
};

UserInterface.prototype.showConfirmKeyConfig = function () {
	this.confirmkeyconfigdiv.style.display = 'block';
};

UserInterface.prototype.showGameOverDiv = function () {
	this.gameoverdiv.style.display = 'block';
};

UserInterface.prototype.showFashionModeControls = function () {
	this.fashionmodecontrols.style.display = 'block';
}

UserInterface.prototype.updateKeyConfig = function (event) {
	if (this.inKeyConfig === 1) {
		settings.keyLeft = event.keyCode;
		this.keyconfigdiv.innerHTML = "← "+ keyName(event.keyCode) +"<br>→ move right | press a key<br>↺<br>↻<br>↓<br>⇊";
		this.inKeyConfig++;
	} else if (this.inKeyConfig === 2) {
		settings.keyRight = event.keyCode;
		this.keyconfigdiv.innerHTML = "← "+ keyName(settings.keyLeft) +"<br>→ "+ keyName(event.keyCode)+"<br>↺ rotate counterclockwise | press a key<br>↻<br>↓<br>⇊";
		this.inKeyConfig++;
	} else if (this.inKeyConfig === 3) {
		settings.keyCcw = event.keyCode;
		this.keyconfigdiv.innerHTML = "← "+ keyName(settings.keyLeft) +"<br>→ "+ keyName(settings.keyRight)+"<br>↺ "+ keyName(event.keyCode)+"<br>↻ rotate clockwise | press a key<br>↓<br>⇊";
		this.inKeyConfig++;
	} else if (this.inKeyConfig === 4) {
		settings.keyCw = event.keyCode;
		this.keyconfigdiv.innerHTML = "← "+ keyName(settings.keyLeft) +"<br>→ "+ keyName(settings.keyRight)+"<br>↺ "+ keyName(settings.keyCcw)+"<br>↻ "+ keyName(event.keyCode)+"<br>↓ soft drop | press a key<br>⇊";
		this.inKeyConfig++;
	} else if (this.inKeyConfig === 5) {
		settings.keySoftdrop = event.keyCode;
		this.keyconfigdiv.innerHTML = "← "+ keyName(settings.keyLeft) +"<br>→ "+ keyName(settings.keyRight)+"<br>↺ "+ keyName(settings.keyCcw)+"<br>↻ "+ keyName(settings.keyCw)+"<br>↓ "+ keyName(event.keyCode)+"<br>⇊ auto soft drop | press a key";
		this.inKeyConfig++;
	} else if (this.inKeyConfig === 6) {
		settings.keyAutodrop = event.keyCode;
		this.keyconfigdiv.innerHTML = "← "+ keyName(settings.keyLeft) +"<br>→ "+ keyName(settings.keyRight)+"<br>↺ "+ keyName(settings.keyCcw)+"<br>↻ "+ keyName(settings.keyCw)+"<br>↓ "+ keyName(settings.keySoftdrop)+"<br>⇊ "+ keyName(event.keyCode);
		this.inKeyConfig = 0;
		this.showConfirmKeyConfig();
	}
};

UserInterface.prototype.toggleSound = function () {
	settings.toggleSound();
	if (this.soundtogglebutton.innerHTML === 'Sound effects: On') {
		this.soundtogglebutton.innerHTML = 'Sound effects: Off';
	} else {
		this.soundtogglebutton.innerHTML = 'Sound effects: On';
	}
};

UserInterface.prototype.togglePentominoes = function () {
	settings.togglePentominoes();
	if (this.pentominotogglebutton.innerHTML === 'Use Pentominoes: Off') {
		this.pentominotogglebutton.innerHTML = 'Use Pentominoes: On';
	} else {
		this.pentominotogglebutton.innerHTML = 'Use Pentominoes: Off';
	}
};

var FrameTimer = function () {
	this.oneFrame = 1000 / 60.0988; //in milliseconds
	this.last = performance.now();
	this.old = performance.now();
	this.elapsedTime = this.time();
};

FrameTimer.prototype.time = function () {
	this.old = this.last;
	this.last = performance.now();
	this.elapsedTime = this.last - this.old;
};

FrameTimer.prototype.begin = function () {
	this.last = performance.now();
	this.old = performance.now();
};

var Countdown = function (element) {
	this.countdowndiv = element;
};

Countdown.prototype.begin = function () {
	this.three();
};

Countdown.prototype.three = function () {
	audio.play(audio.countDown321);
	this.countdowndiv.innerHTML = 3;
	this.countdowndiv.style.display = 'block';
	var self = this;
	setTimeout(function(){ self.two(); }, 1000);
};

Countdown.prototype.two = function () {
	audio.play(audio.countDown321);
	this.countdowndiv.innerHTML = 2;
	var self = this;
	setTimeout(function(){ self.one(); }, 1000);
};

Countdown.prototype.one = function () {
	audio.play(audio.countDown321);
	this.countdowndiv.innerHTML = 1;
	var self = this;
	setTimeout(function(){ self.go(); }, 1000);
};

Countdown.prototype.go = function () {
	audio.play(audio.countDownGo);
	this.countdowndiv.style.display = 'none';
};

var Statistics = function (element) {
	this.statisticsdiv = document.getElementById(element);
};

Statistics.prototype.update = function (string) {
	this.statisticsdiv.innerHTML = string;
};


var AudioPlayer = function () {
	this.countDown321 = new Audio('res/audio/countdown321.wav');
	this.countDownGo = new Audio('res/audio/countdownGo.wav');
	this.lock = new Audio('res/audio/lock.wav');
	this.lineClear = new Audio('res/audio/lineclear.wav');
	this.lineClear4 = new Audio('res/audio/lineclear4.wav');
	this.gameOver = new Audio('res/audio/gameover.wav');
};

AudioPlayer.prototype.play = function (sound) {
	if (settings.audioEnabled) {
		sound.play();
	}
};


var draw = new Renderer();
var ft = new FrameTimer();
var game = new Game();
var controller = new Controller();
var countdown = new Countdown(document.getElementById('countdowndiv'));
var audio = new AudioPlayer();
var ui = new UserInterface();
var settings = new Settings();
var stats = new Statistics('statisticsdiv');



function keyName(keycode) {
	if (keycode === 37) {
		return 'left'
	} else if (keycode === 38) {
		return 'up'
	} else if (keycode === 39) {
		return 'right'
	} else if (keycode === 40) {
		return 'down'
	} else if (keycode === 32) {
		return 'space'
	}
	 else {
		return String.fromCharCode(keycode)
	}
}

}());
