import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';

import {
    AUTO,
    Game,
    Scale
} from 'phaser';

// Portrait-first, mendekati rasio HP modern
const GAME_WIDTH = 450;
const GAME_HEIGHT = 975;

const config = {
    type: AUTO,

    width: GAME_WIDTH,
    height: GAME_HEIGHT,

    parent: 'game-container',

    backgroundColor: '#000000',

    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH,

        width: GAME_WIDTH,
        height: GAME_HEIGHT
    },

    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver
    ]
};

const StartGame = (parent) =>
{
    return new Game({
        ...config,
        parent
    });
};

export default StartGame;