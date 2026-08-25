import { Scene, Input, Math as PhaserMath, Geom } from 'phaser';

export class Game extends Scene
{
    constructor()
    {
        super('Game');
    }

    create()
    {
        const width = this.scale.width;
        const height = this.scale.height;

        this.cameras.main.setBackgroundColor('#202020');

        // -------------------------
        // LANE
        // -------------------------

        this.lanes = [
            width * 0.25,
            width * 0.50,
            width * 0.75
        ];

        this.add.rectangle(
            width * 0.375,
            height / 2,
            4,
            height,
            0xffffff,
            0.3
        );

        this.add.rectangle(
            width * 0.625,
            height / 2,
            4,
            height,
            0xffffff,
            0.3
        );

        // -------------------------
        // PLAYER
        // -------------------------

        this.currentLane = 1;
        this.isMoving = false;

        this.player = this.add.rectangle(
            this.lanes[this.currentLane],
            height * 0.80,
            50,
            70,
            0x00aaff
        );

        // -------------------------
        // HUD / TITLE
        // -------------------------

        this.titleText = this.add.text(
            width / 2,
            55,
            'ENDLESS RUNNER',
            {
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // -------------------------
        // SCORE
        // -------------------------

        this.elapsedTime = 0;
        this.score = 0;

        this.scoreText = this.add.text(
            16,
            16,
            'Score: 0',
            {
                fontSize: '20px',
                color: '#ffffff'
            }
        );

        // -------------------------
        // KEYBOARD
        // -------------------------

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey('A');
        this.keyD = this.input.keyboard.addKey('D');

        // -------------------------
        // TOUCH BUTTONS
        // -------------------------

        this.leftButton = this.add.rectangle(
            width * 0.20,
            height * 0.92,
            100,
            60,
            0x555555,
            0.8
        ).setInteractive();

        this.add.text(
            width * 0.20,
            height * 0.92,
            '<',
            {
                fontSize: '32px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        this.rightButton = this.add.rectangle(
            width * 0.80,
            height * 0.92,
            100,
            60,
            0x555555,
            0.8
        ).setInteractive();

        this.add.text(
            width * 0.80,
            height * 0.92,
            '>',
            {
                fontSize: '32px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        this.leftButton.on('pointerdown', () =>
        {
            this.moveLeft();
        });

        this.rightButton.on('pointerdown', () =>
        {
            this.moveRight();
        });

        // -------------------------
        // OBSTACLE SYSTEM
        // -------------------------

        this.obstacles = [];
        this.gameEnded = false;

        this.lastSpawnLane = -1;
        this.sameLaneCount = 0;

        this.obstacleSpeed = 250;
        this.spawnDelay = 1500;

        this.maxObstacleSpeed = 550;
        this.minSpawnDelay = 750;

        this.createSpawnTimer();

        this.difficultyTimer = this.time.addEvent({
            delay: 10000,
            callback: this.increaseDifficulty,
            callbackScope: this,
            loop: true
        });
    }

    update(time, delta)
    {
        if (this.gameEnded)
        {
            return;
        }

        // -------------------------
        // SCORE
        // -------------------------

        this.elapsedTime += delta;

        this.score = Math.floor(
            this.elapsedTime / 1000
        );

        this.scoreText.setText(
            'Score: ' + this.score
        );

        // -------------------------
        // INPUT
        // -------------------------

        if (
            Input.Keyboard.JustDown(this.cursors.left) ||
            Input.Keyboard.JustDown(this.keyA)
        )
        {
            this.moveLeft();
        }

        if (
            Input.Keyboard.JustDown(this.cursors.right) ||
            Input.Keyboard.JustDown(this.keyD)
        )
        {
            this.moveRight();
        }

        // -------------------------
        // OBSTACLE MOVEMENT
        // -------------------------

        for (let i = this.obstacles.length - 1; i >= 0; i--)
        {
            const obstacle = this.obstacles[i];

            obstacle.y += this.obstacleSpeed * (delta / 1000);

            if (
                Geom.Intersects.RectangleToRectangle(
                    this.player.getBounds(),
                    obstacle.getBounds()
                )
            )
            {
                this.endGame();
                return;
            }

            if (obstacle.y > this.scale.height + 100)
            {
                obstacle.destroy();
                this.obstacles.splice(i, 1);
            }
        }
    }

    // -------------------------
    // SPAWN MANAGEMENT
    // -------------------------

    createSpawnTimer()
    {
        if (this.spawnTimer)
        {
            this.spawnTimer.remove();
        }

        this.spawnTimer = this.time.addEvent({
            delay: this.spawnDelay,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });
    }

    spawnObstacle()
    {
        if (this.gameEnded)
        {
            return;
        }

        let laneIndex;

        do
        {
            laneIndex = PhaserMath.Between(0, 2);
        }
        while (
            laneIndex === this.lastSpawnLane &&
            this.sameLaneCount >= 2
        );

        if (laneIndex === this.lastSpawnLane)
        {
            this.sameLaneCount++;
        }
        else
        {
            this.sameLaneCount = 1;
        }

        this.lastSpawnLane = laneIndex;

        const obstacle = this.add.rectangle(
            this.lanes[laneIndex],
            -60,
            60,
            60,
            0xff3333
        );

        obstacle.laneIndex = laneIndex;

        this.obstacles.push(obstacle);
    }

    // -------------------------
    // DIFFICULTY
    // -------------------------

    increaseDifficulty()
    {
        if (this.gameEnded)
        {
            return;
        }

        this.obstacleSpeed = Math.min(
            this.obstacleSpeed + 50,
            this.maxObstacleSpeed
        );

        this.spawnDelay = Math.max(
            this.spawnDelay - 100,
            this.minSpawnDelay
        );

        this.createSpawnTimer();

        console.log(
            'Difficulty increased:',
            'Speed =',
            this.obstacleSpeed,
            'Spawn Delay =',
            this.spawnDelay
        );
    }

    // -------------------------
    // PLAYER MOVEMENT
    // -------------------------

    moveLeft()
    {
        if (this.currentLane > 0 && !this.isMoving)
        {
            this.currentLane--;
            this.isMoving = true;

            this.tweens.add({
                targets: this.player,
                x: this.lanes[this.currentLane],
                duration: 120,
                ease: 'Power2',

                onComplete: () =>
                {
                    this.isMoving = false;
                }
            });
        }
    }

    moveRight()
    {
        if (this.currentLane < 2 && !this.isMoving)
        {
            this.currentLane++;
            this.isMoving = true;

            this.tweens.add({
                targets: this.player,
                x: this.lanes[this.currentLane],
                duration: 120,
                ease: 'Power2',

                onComplete: () =>
                {
                    this.isMoving = false;
                }
            });
        }
    }

    // -------------------------
    // GAME OVER
    // -------------------------

    endGame()
    {
        if (this.gameEnded)
        {
            return;
        }

        this.gameEnded = true;

        this.spawnTimer.remove();
        this.difficultyTimer.remove();

        this.scene.start('GameOver', {
            score: this.score
        });
    }
}