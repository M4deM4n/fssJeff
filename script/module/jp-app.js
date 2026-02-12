import { Terminal } from "/script/module/terminal/terminal.js";
import { MediaPlayer } from "/script/module/media-player/media-player.js";
import { GlslWindow } from "/script/module/audio-visualization/glsl-window.js";
import EventBus from "/script/module/event-bus.js";
import { openNewWindow } from "/script/module/utils.js";

module.createWindow = openNewWindow;

let terminalId = 'terminal';
let mediaPlayerId = 'media-player';
let glVisualizerId = 'gl-visualizer';

const term = new Terminal('terminal', { externalTriggerId: 'btn-term', minWidth:650, minHeight:480 });
const mediaPlayer = new MediaPlayer('media-player', { externalTriggerId: 'btn-music' });
const glVisualizer = new GlslWindow('gl-visualizer', { externalTriggerId: 'btn-glsl', minWidth:400, minHeight:300 });

EventBus.on('close-app', (e) => {
    if(e.detail.id === mediaPlayerId) {
        mediaPlayer.hide();
        glVisualizer.hide();
    }
})

EventBus.on('launch-app', (e) => {
    if(e.detail.id === mediaPlayerId) {
        mediaPlayer.show();
    }
})

EventBus.on('show-glsl-visualizer', (e) => {
    glVisualizer.show();
});

EventBus.on('hide-glsl-visualizer', (e) => {
    glVisualizer.hide();
});