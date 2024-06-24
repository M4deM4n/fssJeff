import { Terminal } from "/script/module/terminal/terminal.js";
import { MediaPlayer} from "/script/module/media-player/media-player.js";
import EventBus from "./eventbus";
import { openNewWindow } from "/script/module/utils.js";

module.createWindow = openNewWindow;

let terminalId = 'terminal';
let mediaPlayerId = 'media-player';

const term = new Terminal('terminal', { externalTriggerId: 'btn-term', minWidth:650, minHeight:480 });
const mediaPlayer = new MediaPlayer('media-player', { externalTriggerId: 'btn-music' });

EventBus.on('close-app', (e) => {
    if(e.detail.id === mediaPlayerId) {
        mediaPlayer.hide();
    }
})

EventBus.on('launch-app', (e) => {
    if(e.detail.id === mediaPlayerId) {
        mediaPlayer.show();
    }
})