'use strict';

var Game = function(){
	this.end = false;
	this.current = undefined;
	this.next = undefined;
	this.is_bot = true;
}

Game.prototype.start = function(){
	this.reset();

	// генерация полей
	var boardHuman = new Board('.js-board1');
	var boardBot = new Board('.js-board2');

	// генерация игроков
	var humanName = $('.js-name').val();
	var human = new Player(this, false, boardHuman, humanName);
	var bot = new Player(this, this.is_bot, boardBot, 'бот');

	var players = this.randPlayer(human, bot);
	this.current = players.current;
	this.next = players.next;

	this.swapPlayers();

	// если первый ходит компьютер
	if (this.current.is_bot === true) {
		this.current.shoot();
	}else{
		this.updateStat(true);
	}
}

// сброс полей
Game.prototype.reset = function(){
	$('.js-board1').html('');
	$('.js-board2').html('');
}

// генерация, кто первый стреляет
Game.prototype.randPlayer = function(p1, p2){
	var r = rand(0, 2);

	if (r == 0) return {current: p1, next: p2};
	if (r == 1) return {current: p2, next: p1};
}

// именение очереди
Game.prototype.swapPlayers = function(){
	var tmp;
	tmp = this.current;
	this.current = this.next;
	this.next = tmp;
}

// обновление статистики
Game.prototype.updateStat = function(check){
	var name = (check === true) ? name = this.current.name : this.next.name;
	$('.js-player').text('Ход: ' + name);
}

// проверка на выигрыщ
Game.prototype.checkWin = function(){
	if (this.current.score === 10) {
		this.end = true;
		$('.js-player').text('Выиграл: ' + this.current.name);
		$('.board').addClass('deactivated--win');

		$('.js-menu').removeClass('hidden')
	}
}