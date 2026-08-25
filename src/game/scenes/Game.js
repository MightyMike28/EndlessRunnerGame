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

        // -------------------------
        // PLAYER
        // -------------------------

        // Player mulai di lane tengah
        this.currentLane = 1;

        // Mencegah input bertumpuk saat player sedang berpindah lane
        this.isMoving = false;

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

        // Touch menggunakan fungsi movement yang sama dengan keyboard
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

        // Menyimpan informasi spawn sebelumnya
        this.lastSpawnLane = -1;
        this.sameLaneCount = 0;

        // Difficulty awal
        this.obstacleSpeed = 250;
        this.spawnDelay = 1500;

        // Batas difficulty agar permainan tetap masuk akal
        this.maxObstacleSpeed = 550;
        this.minSpawnDelay = 750;

        this.createSpawnTimer();

        // Difficulty meningkat setiap 10 detik
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

        this.score = Math.floor(
            (time - this.startTime) / 1000
        );

        this.scoreText.setText(
            'Score: ' + this.score
        );

        // -------------------------
        // KEYBOARD INPUT
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

            // Gerakkan obstacle berdasarkan delta time
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

            // Hapus obstacle yang sudah keluar layar
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
        // Hapus timer sebelumnya jika ada
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

        // Pilih lane secara acak.
        // Lane yang sama maksimal muncul 2 kali berturut-turut.
        do
        {
            laneIndex = PhaserMath.Between(0, 2);
        }
        while (
            laneIndex === this.lastSpawnLane &&
            this.sameLaneCount >= 2
        );

        // Catat pola spawn
        if (laneIndex === this.lastSpawnLane)
        {
            this.sameLaneCount++;
        }
        else
        {
            this.sameLaneCount = 1;
        }

        this.lastSpawnLane = laneIndex;

        // Buat obstacle
        const obstacle = this.add.rectangle(
            this.lanes[laneIndex],
            -60,
            60,
            60,
            0xff3333
        );

        // Simpan lane obstacle
        obstacle.laneIndex = laneIndex;

        this.obstacles.push(obstacle);
    }

    // -------------------------
    // DIFFICULTY SCALING
    // -------------------------

    increaseDifficulty()
    {
        if (this.gameEnded)
        {
            return;
        }

        // Kecepatan obstacle meningkat
        this.obstacleSpeed = Math.min(
            this.obstacleSpeed + 50,
            this.maxObstacleSpeed
        );

        // Interval spawn semakin pendek
        this.spawnDelay = Math.max(
            this.spawnDelay - 100,
            this.minSpawnDelay
        );

        // Buat ulang timer menggunakan interval terbaru
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

        // Hentikan timer
        this.spawnTimer.remove();
        this.difficultyTimer.remove();

        // Kirim score ke GameOver
        this.scene.start('GameOver', {
            score: this.score
        });
    }
}