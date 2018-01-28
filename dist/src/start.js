// Launch the game!
sm.fitScreenToDevice();
sm.game = new Phaser.Game(sm.screenWidth, sm.screenHeight, Phaser.CANVAS, 'Spin Masters', { preload: sm.preload, create: sm.create, update: sm.update, render: sm.render });


