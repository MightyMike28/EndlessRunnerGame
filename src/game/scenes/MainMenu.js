import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor()
    {
        super('MainMenu');
    }

    create()
    {
        const width = this.scale.width;
        const height = this.scale.height;

        this.cameras.main.setBackgroundColor('#16c7e8');

        this.add.text(
            width / 2,
            height * 0.28,
            'ENDLESS RUNNER',
            {
                fontSize: '48px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        const startButton = this.add.text(
            width / 2,
            height * 0.55,
            'START GAME',
            {
                fontSize: '32px',
                color: '#ffffff',
                backgroundColor: '#222222',
                padding: {
                    x: 20,
                    y: 12
                }
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        startButton.on('pointerover', () =>
        {
            startButton.setStyle({
                backgroundColor: '#444444'
            });
        });

        startButton.on('pointerout', () =>
        {
            startButton.setStyle({
                backgroundColor: '#222222'
            });
        });

        startButton.on('pointerdown', () =>
        {
            console.log('START GAME clicked');

            if (this.scene.get('Game'))
            {
                this.scene.start('Game');
            }
            else
            {
                console.error('Scene Game tidak ditemukan');
            }
        });

        this.add.text(
            width / 2,
            height * 0.70,
            'PC: Arrow Keys / A D\nHP: Touch buttons',
            {
                fontSize: '18px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
    }
}