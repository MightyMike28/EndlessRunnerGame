import { Scene, Input, Math as PhaserMath } from 'phaser';

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

        // Judul
        this.add.text(
            width / 2,
            30,
            'ENDLESS RUNNER',
            {
                fontSize: '28px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // Keyboard
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey('A');
        this.keyD = this.input.keyboard.addKey('D');

        // Tombol touch kiri
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

        // Tombol touch kanan
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

        // Kecepatan obstacle awal
        this.obstacleSpeed = 250;

        // Spawn obstacle setiap 1500 ms
        this.spawnTimer = this.time.addEvent({
            delay: 1500,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });
    }

    update(time, delta)
    {
        // Keyboard kiri
        if (
            Input.Keyboard.JustDown(this.cursors.left) ||
            Input.Keyboard.JustDown(this.keyA)
        )
        {
            this.moveLeft();
        }

        // Keyboard kanan
        if (
            Input.Keyboard.JustDown(this.cursors.right) ||
            Input.Keyboard.JustDown(this.keyD)
        )
        {
            this.moveRight();
        }

        // Gerakkan obstacle ke bawah
        for (let i = this.obstacles.length - 1; i >= 0; i--)
        {
            const obstacle = this.obstacles[i];

            obstacle.y += this.obstacleSpeed * (delta / 1000);

            // Hapus obstacle jika sudah keluar layar
            if (obstacle.y > this.scale.height + 100)
            {
                obstacle.destroy();
                this.obstacles.splice(i, 1);
            }
        }
    }

    spawnObstacle()
    {
        // Pilih lane secara acak: 0, 1, atau 2
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
}