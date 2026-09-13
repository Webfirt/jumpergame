import './style.css';
import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');

    this.player = null;
    this.platforms = null;
    this.keyItem = null;
    this.door = null;
    this.playerParts = {};
    this.cursors = null;
    this.keys = null;
    this.keyLabel = null;
    this.winText = null;
    this.levelText = null;
    this.hasKey = false;
    this.gameWon = false;
    this.levelIndex = 0;
    this.started = false;
    this.restartButton = null;
    this.startMenu = null;
    this.startButton = null;
    this.endMenu = null;
    this.endButton = null;
    this.soundContext = null;

    this.levels = [
      {
        startX: 80,
        startY: 360,
        keyX: 500,
        keyY: 120,
        doorX: 820,
        doorY: 378,
        platforms: [
          { x: 460, y: 472, w: 920, h: 52 },
          { x: 180, y: 360, w: 210, h: 18 },
          { x: 470, y: 290, w: 200, h: 18 },
          { x: 300, y: 210, w: 180, h: 18 },
        ],
      },
      {
        startX: 80,
        startY: 360,
        keyX: 620,
        keyY: 120,
        doorX: 820,
        doorY: 378,
        platforms: [
          { x: 460, y: 472, w: 920, h: 52 },
          { x: 200, y: 360, w: 180, h: 18 },
          { x: 430, y: 300, w: 160, h: 18 },
          { x: 660, y: 235, w: 160, h: 18 },
          { x: 320, y: 180, w: 140, h: 18 },
        ],
      },
      {
        startX: 80,
        startY: 360,
        keyX: 700,
        keyY: 150,
        doorX: 820,
        doorY: 378,
        platforms: [
          { x: 460, y: 472, w: 920, h: 52 },
          { x: 160, y: 360, w: 150, h: 18 },
          { x: 330, y: 290, w: 150, h: 18 },
          { x: 500, y: 230, w: 150, h: 18 },
          { x: 650, y: 180, w: 140, h: 18 },
        ],
      },
    ];
  }

  create() {
    this.startMenu = document.getElementById('startMenu');
    this.startButton = document.getElementById('startButton');
    this.restartButton = document.getElementById('restartButton');
    this.endMenu = document.getElementById('endMenu');
    this.endButton = document.getElementById('endButton');

    this.restartButton.style.display = 'none';
    this.restartButton.onclick = () => this.startGame();
    this.endButton.onclick = () => this.startGame();

    this.startButton.onclick = () => {
      this.startMenu.classList.add('hidden');
      this.startGame();
    };

    this.started = false;
    this.showStartMenu();
  }

  showStartMenu() {
    this.startMenu.classList.remove('hidden');
    this.endMenu.classList.add('hidden');
    this.restartButton.style.display = 'none';
  }

  startGame() {
    this.levelIndex = 0;
    this.started = true;
    this.endMenu.classList.add('hidden');
    this.startLevel(0);
  }

  startLevel(levelIndex) {
    if (!this.started) {
      return;
    }

    this.levelIndex = levelIndex;
    this.hasKey = false;
    this.gameWon = false;

    this.children.removeAll(true);
    this.input.keyboard.removeAllListeners();
    this.physics.world.colliders.destroy();

    const { width, height } = this.scale;
    const level = this.levels[levelIndex];

    this.add.rectangle(width / 2, height / 2, width, height, 0xdfeaf4);
    this.createSun();
    this.createSkyline();

    this.platforms = this.physics.add.staticGroup();
    level.platforms.forEach((platform) => {
      const rect = this.add.rectangle(platform.x, platform.y, platform.w, platform.h, 0x7ac36d);
      this.physics.add.existing(rect, true);
      this.platforms.add(rect);
    });

    this.add.rectangle(220, height - 22, 180, 6, 0xf5dd6a);
    this.add.rectangle(570, height - 22, 180, 6, 0xf5dd6a);
    this.add.rectangle(780, height - 22, 115, 6, 0xf5dd6a);

    this.createPlayer(level.startX, level.startY);
    this.createKey(level.keyX, level.keyY);
    this.createDoor(level.doorX, level.doorY);

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.keyItem, this.collectKey, null, this);
    this.physics.add.overlap(this.player, this.door, this.checkDoor, null, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.W,
    });

    this.levelText = this.add.text(18, 18, `Niveau ${levelIndex + 1} / ${this.levels.length}`, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#1d2a36',
      backgroundColor: '#f4f7fb',
      padding: { x: 8, y: 4 },
    });

    this.keyLabel = this.add.text(18, 52, 'Clé: non', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#1d2a36',
      backgroundColor: '#f4f7fb',
      padding: { x: 8, y: 4 },
    });

    this.winText = this.add.text(width / 2, 88, '', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#1d2a36',
      backgroundColor: '#f4f7fb',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5);
  }

  createSun() {
    const sun = this.add.graphics();
    sun.fillStyle(0xf5c75b, 1);
    sun.fillCircle(52, 38, 20);
    sun.lineStyle(2, 0xf5c75b, 1);

    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2;
      const x1 = 52 + Math.cos(angle) * 26;
      const y1 = 38 + Math.sin(angle) * 26;
      const x2 = 52 + Math.cos(angle) * 34;
      const y2 = 38 + Math.sin(angle) * 34;
      sun.beginPath();
      sun.moveTo(x1, y1);
      sun.lineTo(x2, y2);
      sun.strokePath();
    }
  }

  createSkyline() {
    const { height } = this.scale;
    const skyline = this.add.graphics();

    skyline.fillStyle(0xc7d9ed, 1);
    const buildings = [
      { x: 20, w: 72, h: 110 },
      { x: 120, w: 90, h: 130 },
      { x: 240, w: 108, h: 120 },
      { x: 390, w: 82, h: 100 },
      { x: 500, w: 100, h: 140 },
      { x: 630, w: 86, h: 108 },
      { x: 760, w: 100, h: 120 },
    ];

    buildings.forEach((b) => {
      skyline.fillRect(b.x, height - b.h - 30, b.w, b.h);
    });

    skyline.fillStyle(0xdfeaf4, 1);
    skyline.fillEllipse(220, 176, 110, 26);
    skyline.fillEllipse(530, 170, 120, 28);
    skyline.fillEllipse(760, 174, 120, 26);
  }

  createPlayer(x, y) {
    const playerContainer = this.add.container(x, y);

    const body = this.add.rectangle(0, 18, 30, 32, 0x8adbb0);
    body.setStrokeStyle(2, 0x4b8f68);

    const head = this.add.circle(0, -16, 13, 0x8adbb0);
    head.setStrokeStyle(2, 0x4b8f68);

    const eyeLeft = this.add.rectangle(-5, -16, 3, 3, 0x1d2a36);
    const eyeRight = this.add.rectangle(5, -16, 3, 3, 0x1d2a36);

    const armLeft = this.add.rectangle(-20, 18, 8, 18, 0x8adbb0);
    const armRight = this.add.rectangle(20, 18, 8, 18, 0x8adbb0);
    const legLeft = this.add.rectangle(-8, 38, 7, 18, 0x8adbb0);
    const legRight = this.add.rectangle(8, 38, 7, 18, 0x8adbb0);

    playerContainer.add([body, head, eyeLeft, eyeRight, armLeft, armRight, legLeft, legRight]);
    this.player = playerContainer;
    this.playerParts = { body, head, eyeLeft, eyeRight, armLeft, armRight, legLeft, legRight };

    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setBounce(0.05);
    this.player.body.setGravityY(900);
    this.player.body.setSize(30, 58);
  }

  createKey(x, y) {
    const keyContainer = this.add.container(x, y);

    const ring = this.add.circle(0, 0, 10, 0xf7c96f);
    ring.setStrokeStyle(3, 0xc97d1f);

    const shank = this.add.rectangle(12, 0, 24, 4, 0xf7c96f);
    shank.setStrokeStyle(2, 0xc97d1f);

    const tooth1 = this.add.rectangle(25, -7, 8, 3, 0xf7c96f);
    const tooth2 = this.add.rectangle(25, 0, 8, 3, 0xf7c96f);
    const tooth3 = this.add.rectangle(25, 7, 8, 3, 0xf7c96f);

    keyContainer.add([ring, shank, tooth1, tooth2, tooth3]);
    this.keyItem = keyContainer;

    this.physics.add.existing(this.keyItem);
    this.keyItem.body.setAllowGravity(false);
    this.keyItem.body.setImmovable(true);
    this.keyItem.body.setSize(40, 25);

    this.tweens.add({
      targets: this.keyItem,
      y: y - 8,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  createDoor(x, y) {
    const doorContainer = this.add.container(x, y);
    const frame = this.add.rectangle(0, 0, 28, 46, 0x9f6b42);
    frame.setStrokeStyle(2, 0x5d3b2d);

    const handle = this.add.circle(8, -2, 3, 0xf4d59a);
    handle.setStrokeStyle(1, 0xb88d44);

    doorContainer.add([frame, handle]);
    this.door = doorContainer;
    this.physics.add.existing(this.door, true);
    this.door.body.setSize(28, 46);
  }

  playTone(frequency, duration, type = 'square', volume = 0.04) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return;
    }

    if (!this.soundContext) {
      this.soundContext = new AudioCtx();
    }

    const oscillator = this.soundContext.createOscillator();
    const gain = this.soundContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;

    oscillator.connect(gain);
    gain.connect(this.soundContext.destination);

    const start = this.soundContext.currentTime;
    oscillator.start(start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.stop(start + duration);
  }

  collectKey() {
    if (this.hasKey) {
      return;
    }

    this.hasKey = true;
    this.keyItem.destroy();
    this.keyLabel.setText('Clé: oui');
    this.playTone(880, 0.1, 'square', 0.06);
  }

  checkDoor() {
    if (this.hasKey && !this.gameWon) {
      this.gameWon = true;
      this.playTone(660, 0.18, 'triangle', 0.07);

      if (this.levelIndex < this.levels.length - 1) {
        this.winText.setText('Niveau terminé !');
        this.time.delayedCall(1000, () => {
          this.startLevel(this.levelIndex + 1);
        });
      } else {
        this.winText.setText('Tu as gagné !');
        this.restartButton.style.display = 'block';
        this.endMenu.classList.remove('hidden');
      }

      this.player.body.setVelocity(0, 0);
    }
  }

  update() {
    if (!this.started || !this.player || !this.player.body || this.gameWon) {
      return;
    }

    const left = this.cursors.left.isDown || this.keys.left.isDown;
    const right = this.cursors.right.isDown || this.keys.right.isDown;
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.up);

    const speed = left ? -220 : right ? 220 : 0;
    this.player.body.setVelocityX(speed);

    if (this.playerParts.armLeft) {
      const armSwing = left ? -0.8 : right ? 0.8 : 0.15;
      this.playerParts.armLeft.rotation = armSwing;
      this.playerParts.armRight.rotation = -armSwing;
      this.playerParts.legLeft.rotation = left ? 0.6 : right ? -0.6 : 0;
      this.playerParts.legRight.rotation = left ? -0.6 : right ? 0.6 : 0;
    }

    if (jumpPressed && this.player.body.blocked.down) {
      this.player.body.setVelocityY(-440);
      this.playTone(280, 0.08, 'sawtooth', 0.03);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 920,
  height: 500,
  backgroundColor: '#dfeaf4',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 900 },
      debug: false,
    },
  },
  scene: [GameScene],
};

new Phaser.Game(config);
