import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor()
    {
        super('GameOver');
    }

    create()
    {
        const width = this.scale.width;
        const height = this.scale.height;

        this.cameras.main.setBackgroundColor('#1a1a1a');

        this.add.text(
            width / 2,
            height * 0.35,
            'GAME OVER',
            {
                fontSize: '48px',
                color: '#ff4444',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        const restartButton = this.add.text(
            width / 2,
            height * 0.55,
            'PLAY AGAIN',
            {
                fontSize: '30px',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: {
                    x: 20,
                    y: 12
                }
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        restartButton.on('pointerdown', () =>
        {
            this.scene.start('Game');
        });

        const menuButton = this.add.text(
            width / 2,
            height * 0.68,
            'MAIN MENU',
            {
                fontSize: '22px',
                color: '#ffffff'
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        menuButton.on('pointerdown', () =>
        {
            this.scene.start('MainMenu');
        });
    }
}