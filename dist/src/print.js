var print = {
	lines: [],
	size: 32,
	tab: 0,
	vtab: 0,
	scale: 1,

	init: function(game, font) {
		this.game = game;
		this.font = font;
	},

	shiftUp: function() {
		var i = 0;
		
		this.lines.shift();
		for (i=0; i<this.lines.length; ++i) {
			this.lines[i].y -= this.size * this.scale;
		}
	},

	next: function(msg) {
		this.at(msg, this.tab, this.vtab + (this.lines.length + 1) * this.size * this.scale);
	},

	at: function(msg, x, y) {
		var bmpTxt = null;

		if ((this.lines.length + 1) * this.size >= this.game.height) {
			this.shiftUp();
		}

		bmpTxt = this.game.add.bitmapText(0, 0, this.font, msg, this.size);

		this.lines.push(bmpTxt);
		bmpTxt.anchor.set(0.0, 1.0);
		bmpTxt.x = x;
		bmpTxt.y = y;
		bmpTxt.scale.set(this.scale, this.scale);
	},

	clear: function(msg) {
		var i = 0;

		for (i=0; i<this.lines.length; ++i) {
			this.lines[i].destroy();
		}

		this.lines.length = 0;
	},
};