var sm = {
	screenWidth: window.innerWidth * window.devicePixelRatio, // window.screen.width * window.devicePixelRatio,
	screenHeight: window.innerHeight * window.devicePixelRatio, // window.screen.height * window.devicePixelRatio,
	baseWidth: 960,
	baseHeight: 640,
	width: 0,
	height: 0,
	scale: 1,
	switchboard: {},
	scenes: {},
	game: null,
	gfxBuffer: null,
	errText: null,

	fitScreenToDevice: function() {
		var widthRatio = Math.floor(this.screenWidth / this.baseWidth);
		var heightRatio = Math.floor(this.screenHeight / this.baseHeight);

		this.scale = Math.min(widthRatio, heightRatio);

		console.log("widthRatio: " + widthRatio + ",  heightRatio: " + heightRatio);

		if (this.scale > 0) {
			this.width = this.baseWidth * this.scale;
			this.height = this.baseHeight * this.scale;
		}
		else {
			this.width = this.baseWidth;
			this.height = this.baseHeight;
		}

		console.log("Scale is :" + this.scale);
	},

	listenFor: function(message, listener) {
		var listeners = null;

		this.assert(message && listener, "(listenFor) invalid message or listener");

		listeners = this.switchboard[message];

		if (!listeners) {
			listeners = [];
		}

		if (listeners.indexOf(listener) < 0) {
			listeners.push(listener);
			this.switchboard[message] = listeners;
		}
	},

	unlistenFor: function(message, listener) {
		var listeners = null;

		this.assert(message && listener, "(listenFor) invalid message or listener");

		listeners = this.switchboard[message];

		if (listeners) {
			this.removeElementFromArray(listener, listeners);
		}
	},

	unlistenForAll: function(listener) {
		this.assert(listener, "(unlistenForAll) invalid listener");

		var listeners = null;
		var key = null;

		for (key in this.switchboard) {
			this.unlistenFor(key, listener);
		}
	},

	broadcast: function(message, data) {
		this.assert(message, "(broadcast) invalid message");

		var listeners = null;
		var listener = null;
		var i = 0;

		listeners = this.switchboard[message];

		for (i=0; listeners && i<listeners.length; ++i) {
			listener = listeners[i];
			this.assert(listener && listener.hasOwnProperty(message), "(broadcast) invalid listener or missing handler");
			listener[message](data);			
		}
	},

	removeElementFromArray: function(element, array, bPreserveOrder) {
		this.assert(array, "(removeElementFromArray) invalid array");

		var index = array.indexOf(element);
		var i = 0;

		if (index >= 0) {
			if (index != array.length - 1) {
				if (bPreserveOrder) {
					for (i=index; i<array.length - 1; ++i) {
						array[i] = array[i + 1];
					}
				}
				else {
					array[index] = array[array.length - 1];
				}
			}

			array.length = array.length - 1;
		}
	},

	assert: function(test, msg) {
		var textWidth = 0;

		if (!test) {
			sm.game.stage.backgroundColor = 0xff0000;

			sm.gfxBuffer.ctx.fillStyle = "black";
			sm.gfxBuffer.ctx.fillRect(0, 0, sm.width, sm.height);

			sm.gfxBuffer.ctx.fillStyle = "red";
			sm.gfxBuffer.ctx.font = '32px san-serif';
			textWidth = sm.gfxBuffer.ctx.measureText(msg).width;
			sm.gfxBuffer.ctx.fillText(msg, sm.width / 2 - textWidth / 2, sm.height / 2 - 32 / 2);

			sm.errText = msg;

			console.log("ASSERT FAILED: " + msg);
			// debugger;
		}
	},

	preload: function() {
	    // sm.game.load.image('world', 		'./game/res/bitmaps/world.png',		24, 24);
	    // sm.game.load.image('creatures', 	'./game/res/bitmaps/creatures.png', 24, 24);

	    sm.game.load.bitmapFont('charybdis_72', './res/fonts/charybdis_72/font.png', './res/fonts/charybdis_72/font.fnt');
	},

	create: function() {
		var key = null;
		var ctxt = null;

		sm.createGfxBuffer();
		sm.game.stage.backgroundColor = 0x000000;

		sm.assert(sm.scale > 0, "Device screen too small to support app!");
		sm.scale = Math.max(sm.scale, 1);

		sm.cursorKeys = sm.game.input.keyboard.createCursorKeys();
		sm.cursorKeys['enter'] = sm.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

		sm.listenFor('addKeyAction', sm);
		sm.listenFor('removeKeyAction', sm);
		sm.listenFor('loadScene', sm);

		for (key in sm.scenes) {
			sm.assert(sm.scenes[key], "undefined scene (" + key + ")");
			if (sm.scenes[key].hasOwnProperty('create')) {
				sm.scenes[key].create();
			}
		}

		// Display the main menu.
		// sm.startScene(sm.scenes.mainMenu);

		sm.centerContent();
	},

	update :function() {
		if (!sm.errText && sm.scene && sm.scene.hasOwnProperty('update')) {
			sm.scene.update();
		}
	},

	render: function() {
		if (!sm.errText && sm.scene && sm.scene.hasOwnProperty('render')) {
			sm.scene.render(sm.game.canvas.getContext('2d'));
		}
	},

	startScene: function(newScene) {
		if (newScene) {
			if (sm.scene != newScene) {
				if (sm.scene && sm.scene.hasOwnProperty('end')) {
					sm.scene.end();
				}

				if (newScene && newScene.hasOwnProperty('start')) {
					newScene.start();
				}

				sm.scene = newScene;
			}
		}
	},

	createGfxBuffer: function() {
		var x = Math.floor(sm.screenWidth / 2);
		var y = Math.floor(sm.screenHeight / 2);

	    this.gfxBuffer = sm.game.add.bitmapData(sm.width, sm.height);
	    this.gfxBuffer.addToWorld(x, y, 0.5, 0.5, this.scale, this.scale);

	    // DEBUG
	    this.gfxBuffer.ctx.fillStyle = "#00BBBB";
	    this.gfxBuffer.ctx.fillRect(0, 0, sm.width, sm.height);
	},

	centerContent: function() {
		sm.game.scale.pageAlignHorizontally = true;
		sm.game.scale.pageAlignVertically = true;
		sm.game.scale.refresh();		
	},

	// Message Handlers ///////////////////////////////////////////////////////
	loadScene: function(sceneName) {
		this.assert(sceneName, '(loadScene) invalid scene name');
		
		this.startScene(this.scenes[sceneName]);
	},

	addKeyAction: function(keyActionAssoc) {
		var keys = keyActionAssoc ? Object.keys(keyActionAssoc) : null;

		this.assert(keys && keys.length === 1, "(addKeyAction) invalid args");

		this.cursorKeys[keys[0]].onUp.add(keyActionAssoc[keys[0]]);
	},

	removeKeyAction: function(keyActionAssoc) {
		var keys = keyActionAssoc ? Object.keys(keyActionAssoc) : null;

		this.assert(keys && keys.length === 1, "(addKeyAction) invalid args");

		this.cursorKeys[keys[0]].onDown.remove(keyActionAssoc[keys[0]]);
	},
};


