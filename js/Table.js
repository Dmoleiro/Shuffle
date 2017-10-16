'use strict';

class Table {
	constructor(app, id, pair1, pair2, x, y) {
		this.app = app;
		this.id = id;
		this.pair1 = pair1;
		this.pair2 = pair2;
		this.x = parseInt(x);
		this.y = parseInt(y);
		this.xDistanceToCenter = this.x > (this.app.renderer.width / 2) ? (this.x - (this.app.renderer.width / 2)) : ((this.app.renderer.width / 2) - this.x);
		this.yDistanceToCenter = this.y > (this.app.renderer.height / 2) ? (this.y - (this.app.renderer.height / 2)) : ((this.app.renderer.height / 2) - this.y);
	}
}
