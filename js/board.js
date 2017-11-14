'use strict';

var Board = function(_el){
	this.el = _el;
	this.ships = [];
	this.length = 10;
	this.info = undefined;

	this.create();
	this.fill();
}

// генерация поля
Board.prototype.create = function(){
	$(this.el).removeClass('deactivated--win');

	var wrapper = $('<div class="board__inner">');
	$(this.el).append(wrapper);

	for (var i = 0; i < this.length; i++) {
		var row = $('<div class="row">');
		for (var j = 0; j < this.length; j++) {
			var cell = $('<div class="cell">');
			row.append(cell);
		}
		$(this.el).find('.board__inner').append(row);
	}

	this.info = $('<div class="info">');
	$(this.el).prepend(this.info);
}

// обводка точками вокруг убитого корабля
Board.prototype.outline = function(ship){
	for (var i = 0; i < ship.size; i++) {
		var x, y, coords;
		if (ship.size > 1) {
			if (ship.direction) {
				y = ship.y + i;
				x = ship.x;

				coords = [
					{y: y-1, x: x-1},
					{y: y-1, x: x+1},
					{y: y+1, x: x-1},
					{y: y+1, x: x+1}
				];

				if (i == 0) {
					coords.push({y: y - 1, x: x});
					coords.push({y: y + ship.size, x: x});
				}
			}else if(!ship.direction){
				y = ship.y;
				x = ship.x + i;

				coords = [
					{y: y-1, x: x-1},
					{y: y-1, x: x+1},
					{y: y+1, x: x-1},
					{y: y+1, x: x+1}
				];

				if (i == 0) {
					coords.push({y: y, x: x - 1});
					coords.push({y: y, x: x + ship.size});
				}
			}
		}else{
			y = ship.y;
			x = ship.x;

			coords = [
				{y: y-1, x: x-1},
				{y: y-1, x: x+1},
				{y: y+1, x: x-1},
				{y: y+1, x: x+1},
				{y: y, x: x+1},
				{y: y, x: x-1},
				{y: y-1, x: x},
				{y: y+1, x: x},
			];
		}
		for (var c = 0; c < coords.length; c++) {
			if (coords[c].y >= 0 && coords[c].x >= 0) {
				$(this.el)
					.find('.row').eq(coords[c].y)
					.find('.cell').eq(coords[c].x)
					.addClass('busy');
			}
		}
		ship.el = $(this.el)
			.find('.row').eq(y)
			.find('.cell').eq(x);

		ship.el
			.addClass('ship')
			.css('background-color', ship.color);
	}
}

// случайная расстановка кораблей на поле
Board.prototype.fill = function(){
	for (var type in TYPES){
		for (var s = 0; s < type; s++) {

			// пока некорретно герерируетется расположение, генерировать снова
			while(true){
				var direction = rand(0, 2);
				var x = rand(0, this.length);
				var y = rand(0, this.length);
				var ship = new Ship(
					type,
					x, 
					y, 
					direction
				);
				// проверка на корректное расположение
				var res = this.checkField(ship);
				if(res) break;
			}
			this.addShip(ship);

		}
	}
}

// проверка на корректное расположение корабля
Board.prototype.checkField = function(ship){
	var find =  $(this.el)
		.find('.row').eq(ship.y)
		.find('.cell').eq(ship.x);

	//  если в клетке уже есть корабль
	if (find.hasClass('ship') || find.hasClass('busy')) {
		return false;
	}

	// координаты для проверки
	var coords = [];
	// вертикальное направление
	if (ship.direction) {
		// если корабль выходит за границы
		if (ship.y + ship.size > this.length)
			return false;


		coords.push({y: ship.y + ship.size, x: ship.x - 1});
		coords.push({y: ship.y + ship.size, x: ship.x + 1});

		for (var i = 0; i < ship.size + 1; i++) {
			coords.push({y: ship.y + i, x: ship.x-1});
			coords.push({y: ship.y + i, x: ship.x+1});
			coords.push({y: ship.y + i + 1, x: ship.x});
		}
	}else{
		if (ship.x + ship.size > this.length)
			return false;

		coords.push({y: ship.y - 1, x: ship.x + ship.size});
		coords.push({y: ship.y + 1, x: ship.x + ship.size});

		for (var i = 0; i < ship.size; i++) {
			coords.push({y: ship.y-1, x: ship.x + i});
			coords.push({y: ship.y+1, x: ship.x + i});
			coords.push({y: ship.y, x: ship.x + i + 1});
		}
	}

	// если клетка уже содержит корабль, то генерировать заново
	for (var c = 0; c < coords.length; c++) {
		var end = $(this.el)
			.find('.row').eq(coords[c].y)
			.find('.cell').eq(coords[c].x)
		if (end.hasClass('ship')) {
			return false;
		}
	}

	return true;
}

// добавить корабль на поле
Board.prototype.addShip = function(ship){
	this.ships.push(ship);

	// обвести корабль точками
	this.outline(ship);
}

// случайная генерация чисел
var rand = function getRandomInt(min, max){
	return Math.floor(Math.random() * (max - min)) + min;
}