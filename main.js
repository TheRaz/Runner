(function() {
	var Game = function() {
		var _this = this;

		this.running = true;
		this.points = 0;
		this.speed = 8;

		this.canvas = document.getElementById('canvas');
		this.screen = canvas.getContext('2d');
		this.controls = new Keyboarder();
		this.bg = new Image()
		this.bg.src = 'http://i.imgur.com/BWw5qor.png';

		this.parralaxModifier = 15;
		this.locationX = 0;
		this.bg1 = {x: 0};
		this.bg2 = {x: this.canvas.width};

		this.player = new Player(_this);
		this.bodies = [];

		var tick = function() {
			_this.update();
			_this.draw(_this.screen, _this.canvas);
			if(_this.running) {
				requestAnimationFrame(tick);
			}
		};

		tick();

	};
	Game.prototype = {
		update: function() {
			var _this = this;

			if(!this.player.isAlive) {
				this.running = false;
			}
			this.player.update(this.locationX);

			this.points = Math.floor(this.locationX / (this.speed * 40));
			this.locationX += this.speed;

			if(this.locationX % 17 === 0 && Math.random() > 0.85) {
				this.bodies.push(new Block(this.screen, {x: this.locationX + this.canvas.width, y: this.canvas.height-60}));
				tempBodies = this.bodies.filter(function(body) {
					return !(body.position.x < _this.locationX - 100);
				});
				this.bodies = tempBodies;
			}

			this.bg1.x -= this.speed / this.parralaxModifier;
			if(this.bg1.x + this.canvas.width <= this.locationX ) {
				this.bg1.x = this.locationX + this.canvas.width;
			}
			this.bg2.x -= this.speed / this.parralaxModifier;
			if(this.bg2.x + this.canvas.width <= this.locationX ) {
				this.bg2.x = this.locationX + this.canvas.width;
			}

		},
		draw: function(screen, canvas) {

			screen.save();

			screen.translate(-this.locationX, 0);
			screen.clearRect(0, 0, canvas.width, canvas.height);

			screen.drawImage(this.bg, this.bg1.x, 0);
			screen.drawImage(this.bg, this.bg2.x, 0);

			this.player.draw(screen);
			for(var i = 0; i < this.bodies.length; i++) {
				this.bodies[i].draw(screen);
			}

			screen.restore();
			screen.fillStyle= '#000';
			screen.fillRect(0, canvas.height - 30, canvas.width, 40);

			screen.fillStyle = '#fff';
			screen.font = '25px arial';
			screen.fillText(this.points + " Points", 10, 30);

			if(!this.player.isAlive) {
				screen.fillText("You are dead | F5 to try again", canvas.width / 2 - (screen.measureText("You are dead | F5 to try again").width / 2), 50);
			}

		}
	};
	var Block = function(screen, position) {
		this.position = position;
		this.screen = screen;
		this.size = {x: 30, y: 60};
	};
	Block.prototype = {
		draw: function(screen) {
			screen.fillRect(this.position.x - this.size.x / 2, this.position.y - this.size.y / 2, this.size.x, this.size.y);
		}
	};
	var Player = function(game, screen) {
		this.game = game;
		this.screen = screen;

		this.isAlive = true;
		this.jumping = true;

		this.gravity = +1;
		this.velocityY = 0;

		this.size = {x: 20, y: 20};
		this.position = {x: this.game.canvas.width / 2, y: this.game.canvas.height - 128};

	};
	Player.prototype = {
		update: function(positionX) {
			var _this = this;
			this.position.x = positionX + this.game.canvas.width / 2 - this.size.x / 2;

			if(this.game.controls.isDown(32) && !this.jumping) {
				this.jumping = true;
				this.velocityY = -18;
			}
			if(this.jumping) {
				this.velocityY++;
			}
			this.position.y += this.velocityY;
			if(this.position.y < (this.game.canvas.height - 40)) {
				this.position.y += this.gravity;
			}else {
				this.jumping = false;
				this.velocityY = 0;
			}
			if(this.position.y > (this.game.canvas.height - 40)) {
				this.position.y = (this.game.canvas.height - 40);
			}
			var collisions = this.game.bodies.filter(function(body) {
				return Colliding(_this, body);
			});
			if(collisions.length > 0) {
				this.isAlive = false;
			}
		},
		draw: function(screen) {
			screen.fillRect(this.position.x - this.size.x / 2, this.position.y - this.size.y / 2, this.size.x, this.size.y);
		}
	};

	//Keyboarder & Collision detection from Mary Roose Cook
	//https://github.com/maryrosecook
	var Colliding = function(b1, b2) {
		return !(
			b1 === b2 ||
			b1.position.x + b1.size.x / 2 < b2.position.x - b2.size.x / 2 ||
			b1.position.y + b1.size.y / 2 < b2.position.y - b2.size.y / 2 ||
			b1.position.x - b1.size.x / 2 > b2.position.x + b2.size.x / 2 ||
			b1.position.y - b1.size.y / 2 > b2.position.y + b2.size.y / 2
			);
	};
	var Keyboarder = function() {
		var keyState = {};
		window.addEventListener('keydown', function(e) {
			keyState[e.keyCode] = true;
		});

		window.addEventListener('keyup', function(e) {
			keyState[e.keyCode] = false;
		});

		this.isDown = function(keyCode) {
			return keyState[keyCode] === true;
		};
	};

	window.addEventListener('load', function() {
		new Game();
	});
})();
