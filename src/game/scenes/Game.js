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

        // Posisi 3 lane
        this.lanes = [
            width * 0.25,
            width * 0.50,
            width * 0.75
        ];

        // Garis pemisah lane
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

        // Player
        this.currentLane = 1;

        this.player = this.add.rectangle(
            this.lanes[this.currentLane],
            height * 0.80,
            50,
            70,
            0x00aaff
        );

        this.add.text(
            width / 2,
            30,
            'ENDLESS RUNNER',
            {
                fontSize: '28px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // -------------------------
        // SCORE
        // -------------------------

        this.startTime = this.time.now;
        this.score = 0;

        this.scoreText = this.add.text(
            20,
            20,
            'Score: 0',
            {
                fontSize: '24px',
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

        // Nilai awal difficulty
        this.obstacleSpeed = 250;
        this.spawnDelay = 1500;

        // Batas difficulty
        this.maxObstacleSpeed = 650;
        this.minSpawnDelay = 500;

        this.createSpawnTimer();

        // Difficulty naik setiap 10 detik
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
        // SCORE BERDASARKAN WAKTU
        // -------------------------

        this.score = Math.floor((time - this.startTime) / 1000);

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

            // Collision detection
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

            // Cleanup
            if (obstacle.y > this.scale.height + 100)
            {
                obstacle.destroy();
                this.obstacles.splice(i, 1);
            }
        }
    }

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

        const laneIndex = PhaserMath.Between(0, 2);

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

    increaseDifficulty()
    {
        if (this.gameEnded)
        {
            return;
        }

        // Obstacle makin cepat
        this.obstacleSpeed = Math.min(
            this.obstacleSpeed + 50,
            this.maxObstacleSpeed
        );

        // Spawn makin sering
        this.spawnDelay = Math.max(
            this.spawnDelay - 100,
            this.minSpawnDelay
        );

        // Buat ulang timer menggunakan delay baru
        this.createSpawnTimer();

        console.log(
            'Difficulty increased:',
            'Speed =',
            this.obstacleSpeed,
            'Spawn Delay =',
            this.spawnDelay
        );
    }

    moveLeft()
    {
        if (this.currentLane > 0)
        {
            this.currentLane--;
            this.player.x = this.lanes[this.currentLane];
        }
    }

    moveRight()
    {
        if (this.currentLane < 2)
        {
            this.currentLane++;
            this.player.x = this.lanes[this.currentLane];
        }
    }

    endGame()
    {
        if (this.gameEnded)
        {
            return;
        }

        this.gameEnded = true;

        this.spawnTimer.remove();
        this.difficultyTimer.remove();

        // Kirim score ke GameOver
        this.scene.start('GameOver', {
            score: this.score
        });
    }
}