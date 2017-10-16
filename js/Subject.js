'use strict';

class Subject {
	constructor(id, pair, sprite, assignedTable, fixedTable) {
		this.id = id;
		this.pair = pair;
		this.sprite = sprite;
		this.assignedTable = assignedTable;
		this.fixedTable = fixedTable;
		this.oscilation = 0;
		this.xSpeed = 0;
		this.ySpeed = 0;
		this.shuffleDirection = 1;
		this.shuffleStart = 0;
	}
}
