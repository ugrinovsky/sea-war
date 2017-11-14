'use strict';

// типы кораблей
var TYPES = {
	4: {
		size: 1,
		color: '#00ACE9'
	},
	3: {
		size: 2,
		color: '#D43F3F'
	},
	2: {
		size: 3,
		color: '#6A9A1F'
	},
	1: {
		size: 4,
		color: '#404040'
	}
}

var Ship = function(_type, _x, _y, _direction){
	this.type = _type;
	this.size = TYPES[_type].size;
	this.color = TYPES[_type].color;
	this.direction = _direction;
	this.state = 0;
	this.killed = false;
	this.el = undefined;
	this.points = [];
	this.x = _x;
	this.y = _y;

	// заполнение точек корабля
	for (var i = 0; i < this.size; i++) {
		// вертикально
		if (this.direction)
			this.points.push({
				x: this.x, 
				y: this.y + i,
				state: true
			});
		// горизонтально
		else
			this.points.push({
				x: this.x + i, 
				y: this.y,
				state: true
			});
	}
}

// попадение в корабль
Ship.prototype.hit = function(){
	this.state < this.size ? this.state++ : this.killed = true;;
}