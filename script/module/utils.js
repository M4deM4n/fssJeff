export function getFormattedDate(short = false) {
    const date = new Date();

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const dayNumber = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const year = date.getFullYear();

    const timeZoneName = date.toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2];

    let formattedDate = '';
    if(short) {
        formattedDate = `${monthName} ${dayNumber} ${hours}:${minutes}`;
    } else {
        formattedDate = `${dayName} ${monthName} ${dayNumber} ${hours}:${minutes}:${seconds} ${timeZoneName} ${year}`;
    }

    return formattedDate;
}

export function secToMin(seconds) {

    const minutes = Math.floor(seconds / 60);
    if(minutes < 1) { return `${(seconds).toFixed(0)}s` }

    // remaining seconds
    const remaining = (seconds % 60).toFixed(0);
    return `${minutes}m ${remaining}s`;
}

export function isNumeric(strnum) {
    if(typeof strnum != "string") { return false }
    return !isNaN(strnum) && !isNaN(parseFloat(strnum));
}

export function byteCount(str) {
    const blob = new Blob([str]);
    return blob.size;
}

export function openNewWindow(url, config = null) { // url, width, height
    let features = `resizable,scrollbars`;

    if(config != null) {
        if (config['fullscreen']) {
            features += `fullscreen=${config['fullscreen']}`;
        }
        if (config.location) {
            features += `location=${config.location}`;
        } // Opera only
        if (config.menubar) {
            features += `menubar=${config.menubar}`;
        }
        if (config['resizable']) {
            features += `resizable=${config['resizable']}`;
        } // IE only
        if (config.scrollbars) {
            features += `scrollbars=${config.scrollbars}`;
        }
        if (config.width) {
            features += `,width=${config.width}`;
        }
        if (config.height) {
            features += `,height=${config.height}`;
        }

        if (config.leftOffset) {
            const left = window.screenX + config.leftOffset;
            features += `,left=${left}`;
        }

        if (config.topOffset) {
            const top = window.screenY + config.topOffset;
            features += `,top=${top}`;
        }
    }

    let newWindow = null;
    if(config == null) {
        console.log('no config');
        newWindow = window.open(url);
    } else {
        newWindow = window.open(url, '_blank', features);
    }


    if (newWindow) {
        newWindow.focus();
    } else {
        console.error('Failed to open the new window. It might be blocked by a popup blocker.');
    }
}