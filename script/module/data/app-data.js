import {byteCount, getFormattedDate} from "/script/module/utils.js";
import {ColorMode, VisualizationType} from "/script/module/audio-visualization/audio-visualization.js";

export const readme = ` 
                     __                 
.----.-----.---.-.--|  |.--------.-----.
|   _|  -__|  _  |  _  ||        |  -__|
|__| |_____|___._|_____||__|__|__|_____|
 
Welcome to my web application. This website was written using HTML, JavaScript(ES6), 
and CSS. The goal was to write something interesting and dynamic without using any
external libraries. Too often developers rely on abstractions to help them create 
interesting content at the expense of understanding the language they were built
upon. My goal was to re-acquaint myself with JavaScript and its modern features, and
to produce something interesting with it. I hope you like it. 
  
`

export const aboutme = ` 
 |   |        |  |              \\ \\ 
 |   |   _ \\  |  |   _ \\       _)  |
 ___ |   __/  |  |  (   |          |
_|  _| \\___| _| _| \\___/       _)  |
                                 _/ 
 
My name is Jeff Pizano, I was born in 1982, and I've been a software engineer for 
over 14 years. I'm a father of two, amateur musician, and game developer. 
 
`

export const workhistory = ` 
[JOB HISTORY]
---------------------------------------------------------------------------------
Company: Employer's Outsourcing / Full Stack Studios
Timeframe: 2024 - present
Titles: 
    Senior Full-Stack Developer (2024 - present)
 
---------------------------------------------------------------------------------
Company: Solutions By Design, Inc.
Timeframe: 2017 - 2024
Titles: 
    Director Of Development (2021 - 2024)
    Lead Software Engineer (2017 - 2021)
 
---------------------------------------------------------------------------------
Company: kodevo
Timeframe: 2014 - 2017
Titles:
    Lead Software Engineer (2014 - 2017)
 
---------------------------------------------------------------------------------
Company: signingTRAC
Timeframe: 2013 - 2014
Titles:
    Senior Programmer / Application Developer (2013 - 2014)
 
---------------------------------------------------------------------------------
Company: Solutions By Design, Inc.
Timeframe: 2010 - 2014
Titles:
    Senior Programmer (2010 - 2014)
 
---------------------------------------------------------------------------------
Company: Pro Travel Network
Timeframe: 2007 -2010
Titles:
    Junior Programmer (2007 - 2010)
 
`

export const trackList = [
    {
        name: '03 - Odyssey - Set Forth',
        path: '/content/music/Odyssey/03 - Odyssey - Set Forth.mp3'
    },
    {
        name: '04 - Odyssey - Death March',
        path: '/content/music/Odyssey/04 - Odyssey - Death March.mp3'
    },
    {
        name: '05 - Odyssey - Aftermath',
        path: '/content/music/Odyssey/05 - Odyssey - Aftermath.mp3'
    }
]

export const motd = `
&nbsp;
&nbsp;
     _____    ____    _____                ____  _____   ______           _____    
 ___|\\    \\  |    |  /    /|___       ____|\\   \\|\\    \\ |\\     \\     ____|\\    \\   
|    |\\    \\ |    | /    /|    |     /    /\\    \\\\\\    \\| \\     \\   /     /\\    \\  
|    | |    ||    ||\\____\\|    |    |    |  |    |\\|    \\  \\     | /     /  \\    \\ 
|    |/____/||    || |   |/    |___ |    |__|    | |     \\  |    ||     |    |    |
|    ||    |||    | \\|___/    /    ||    .--.    | |      \\ |    ||     |    |    |
|    ||____|/|    |    /     /|    ||    |  |    | |    |\\ \\|    ||\\     \\  /    /|
|____|       |____|   |_____|/____/||____|  |____| |____||\\_____/|| \\_____\\/____/ |
|    |       |    |   |     |    | ||    |  |    | |    |/ \\|   || \\ |    ||    | /
|____|       |____|   |_____|____|/ |____|  |____| |____|   |___|/  \\|____||____|/ 
 
&nbsp;
&nbsp;
System information as of ${getFormattedDate()}
&nbsp;
System load:  0.0                Processes:             1337
Usage of /:   0.69% of 420TB     Users logged in:       0
Memory usage: 0%                 IPv4 address for eth0: 10.0.0.1
Swap usage:   0%
&nbsp;
Welcome to my web-application. My 'documents' folder contains info about myself,
what I do, and what I've done. My name is Jeff, and i like to write software,
make music and games, and hike.
&nbsp;
For a list of commands, type 'help'.
&nbsp;
`

export const fileSystemTree = {
    '/': {
        'type': 2,
        'children': {
            'documents': {
                'type': 2,
                'children': {
                    'aboutme': {
                        'type': 0,
                        'data': aboutme,
                        'size': byteCount(aboutme)
                    },
                    'jobhistory': {
                        'type': 0,
                        'data': workhistory,
                        'size': byteCount(workhistory)
                    }
                }
            },
            'media-player': {
                'type': 1,
                'data': {},
                'size': 12288
            },
            'motd': {
                'type':0,
                'data': motd,
                'size': byteCount(motd)
            },
            'readme.txt': {
                'type':0,
                'data': readme,
                'size': byteCount(readme)
            }
        }
    }
};


export var defaultTabCompleteFilters = [
    'cat',
    'pwd',
    'cd',
    'whoami',
    'clear',
    'exit',
    'ps',
    'ls',
    'kill',
]

export const visualizationList = [
    VisualizationType.Oscilloscope | VisualizationType.Spectrum,
    VisualizationType.Oscilloscope,
    VisualizationType.Spectrum,
    VisualizationType.Spectrum | VisualizationType.LowResolution,
    VisualizationType.Oscilloscope | VisualizationType.Spectrum | VisualizationType.LowResolution
]

export const colorModeList = [
    ColorMode.Fire,
    ColorMode.BlueFire,
    ColorMode.Spectrum,
    ColorMode.Desaturated
]

export const helpOutput = `
<table style="width:500px;">
    <tr><td>cat &lt;file&gt;</td><td>Dump the contents of a file to the screen</td></tr>
    <tr><td>cd &lt;path&gt;</td><td>Change the directory to the specified path</td></tr>
    <tr><td>clear</td><td>Clear the screen buffer</td></tr>
    <tr><td>exit</td><td>End terminal session</td></tr>
    <tr><td>help &lt;command&gt;</td><td>Get help for the specified command</td></tr>
    <tr><td>kill &lt;pid&gt;</td><td>Terminate the specified process</td></tr>
    <tr><td>ls [path]</td><td>List the contents of a specified path. Path is optional</td></tr>
    <tr><td>ps</td><td>List running processes</td></tr>
    <tr><td>whoami</td><td>Print the current user</td></tr>
</table>
`