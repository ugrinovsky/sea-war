'use strict';

var Player = function(_game, _type, _board, _name){
	this.name = _name;
	this.game = _game;
	this.score = 0;	
	this.is_bot = _type;
	this.board = _board;

	this.hittedShip = undefined;

	this.board.info.html(this.name);

	// если игрок - компьютер
	if (this.is_bot) {
		// прячем сгенерированное поле и создаем новое без кораблей
		var cloneBoard = $(this.board.el);
		cloneBoard.find('.row').each(function(){
			$(this).find('.cell').each(function(){
				$(this)
					.removeClass('ship')
					.removeClass('busy')
					.attr('style', '');
			});
		});
		$(this.board.el).detach();
		$('.wrapper').append(cloneBoard);
	}
	// если игрок человек
	else{
		// удаляем все точки вокруг кораблей
		$(this.board.el).find('.row').each(function(){
			$(this).find('.cell').each(function(){
				$(this)
					.removeClass('busy')
			});
		});
	}

	// обработчик клика по клетке
	var self = this;
	$(document).on('click', self.board.el + ' .cell', function(){

		if (self.board.el !== self.game.current.board.el) {
			var cell = $(this);
			// стрельба
			self.shoot(cell);
		}

	});
}

// стрельба
Player.prototype.shoot = function(cell){
	// пока не конец игры
	if(this.game.end === false){ 

		// обновление статистики
		this.game.updateStat();

		// если очередь бота
		if (this.game.current.is_bot === true) {
			this.shootBot();
			this.game.checkWin();
			this.game.swapPlayers();
		}
		// если очередь человека
		else{
			// если в поле не стреляли
			if (cell && !(cell.hasClass('ship') || cell.hasClass('hitted') || cell.hasClass('past'))) {
				this.shootHuman(cell);

				var self = this;
				$(this.game.next.board.el)
					.addClass('deactivated');

				// ответная стрельба компьютера
				setTimeout(function(){
					self.game.swapPlayers();
					self.shoot();
					self.game.checkWin();
					$(self.game.next.board.el)
						.removeClass('deactivated');
				}, 500);
			}
		}
	}
}

// стрельба человека
Player.prototype.shootHuman = function(cell){
	var x = cell.index();
	var y = cell.parent().index();

	// поиск корабля и ранение в случае успешного поиска
	var ship = this.findShip(x, y);

	if (ship) 
		cell.addClass('hitted');
	else
		cell.addClass('past');
}

// стрельба компьютера
Player.prototype.shootBot = function(){
	var x = rand(0, this.board.length);
	var y = rand(0, this.board.length);

	var finishCoords = this.game.current.finishHit();
	if (finishCoords) {
		x = finishCoords.x;
		y = finishCoords.y;
	}

	var cell = $(this.game.next.board.el)
			.find('.row').eq(y)
			.find('.cell').eq(x);

	if (cell && (cell.hasClass('hitted') || cell.hasClass('past') || cell.hasClass('busy'))) {
		this.shootBot();
		return;
	}

	var ship = this.findShip(x, y);

	if (ship)
		cell.addClass('hitted');
	else
		cell.addClass('past');
}

// поиск корабля и ранение в случае успешного поиска
Player.prototype.findShip = function(x, y){
	var coords;
	var self = this;
	var result = self.game.next.board.ships.filter(function(ship) {
		var point = ship.points.filter(function(point){
			return point.y == y && point.x == x;
		});	
		if (point[0] && point[0].state === true){
			point[0].state = false;
			ship.hit();
			coords = point.shift();
			self.game.current.hittedShip = ship;
			if (ship.state === ship.size) {
				self.game.next.board.outline(ship);
				self.game.current.score++;
				self.game.current.hittedShip = undefined;
			}
		}
	});

	return coords;
}

// актуальное количество раненых частей корабля
Player.prototype.getCountHitting = function(){
	var count = 0;
	if (this.game.current.hittedShip) {
		var points = this.game.current.hittedShip.points;
		for(var point in points){
			if (points[point].state === false)
				count++;
		}
	}
	return count;
}

// последнаяя раненная часть корабля
Player.prototype.getHittedPoint = function(){
	if (this.game.current.hittedShip) {
		var points = this.game.current.hittedShip.points;
		for(var point in points){
			if (points[point].state === false)
				return points[point];
		}
	}
}

// получить направление последнего раненого корабля
Player.prototype.getDirection = function(){
	var res;
	if (this.game.current.hittedShip) {
		var points = this.game.current.hittedShip.points;

		var filtering = points.filter(function(point) {
		  return point.state === false;
		});

		if (filtering[0].x == filtering[1].x)
			res = true;
		if (filtering[0].y == filtering[1].y) {
			res = false;
		}
	}
	return res;
}

// добивание корабля в случае попадание
Player.prototype.finishHit = function(){
	var x, y;
	var hits = this.game.current.getCountHitting();
	if (hits === 0) {
		return undefined;
	}
	// если ранена одна часть корабоя, то обстреливаем по одной из 4 сторон
	if (hits === 1) {
		var hittedPoint = this.game.current.getHittedPoint();

		var hittedX = hittedPoint.x;
		var hittedY = hittedPoint.y;

		var probs = [];
		if (hittedX > 0) {
			probs.push({x: hittedX-1, y: hittedY})
		}
		if (hittedX <= this.board.length) {
			probs.push({x: hittedX+1, y: hittedY});
		}
		if (hittedY <= this.board.length) {
			probs.push({x: hittedX, y: hittedY+1});
		}
		if (hittedY > 0) {
			probs.push({x: hittedX, y: hittedY-1});
		}

		var r = rand(0, probs.length);
		var point = probs[r];
		x = point.x;
		y = point.y;
	}
	// если ранено более одной части корабля, то обстреливаем по одной из 2 сторон
	if (hits >= 2) {
		var hittedPoint = this.game.current.getHittedPoint();
		var hittedX = hittedPoint.x;
		var hittedY = hittedPoint.y;
		var direction = this.game.current.getDirection();

		var self = this;
		// если корабль не убит, разворачивамся (вертикальное направление)
		function invertVert(){
			var index = 1;
			while(true){
				var cell = $(self.game.next.board.el)
					.find('.row').eq(hittedY+index)
					.find('.cell').eq(hittedX);

				if (cell.hasClass('busy') || cell.hasClass('hitted') || cell.hasClass('past')) {
					index++;
				}else{
					x = hittedX;
					y = hittedY + index;
					break;
				}
			}
		}
		// если корабль не убит, разворачивамся (горизонтальное направление)
		function invertHor(){
			var index = 1;
			while(true){
				var cell = $(self.game.next.board.el)
					.find('.row').eq(hittedY)
					.find('.cell').eq(hittedX+index);

				if (cell.hasClass('busy') || cell.hasClass('hitted') || cell.hasClass('past')) {
					index++;
				}else{
					x = hittedX + index;
					y = hittedY;
					break;
				}
			}
		}
		// стреляем в одну из двух сторон
		if (direction === true) {
			if (hittedY > 0) {
				var cell = $(this.game.next.board.el)
					.find('.row').eq(hittedY-1)
					.find('.cell').eq(hittedX);
				if (cell.hasClass('busy') || cell.hasClass('hitted') || cell.hasClass('past')) {
					invertVert();
				}else{
					x = hittedX;
					y = hittedY - 1;
				}
			}else{
				invertVert();
			}
		}else{
			if (hittedX > 0) {
				var cell = $(this.game.next.board.el)
					.find('.row').eq(hittedY)
					.find('.cell').eq(hittedX-1);
				if (cell.hasClass('busy') || cell.hasClass('hitted') || cell.hasClass('past')) {
					invertHor();
				}else{
					x = hittedX-1;
					y = hittedY;
				}
			}else{
				invertHor();
			}
		}
	}

	return {x: x, y: y};
}