var canvas;
var ctx;
var offset = { x: 0, y: 0 };
var randomSelectedIndex = -1;
var clearFlag = false;
var touchCount = 0;
var turnPickerParam = "turnpickeroption";

const circleRadius = 60;
var COLORS = [ "F00", "00F", "0F0", "FF0", "F0F", "0FF", "6FC", "FC9", "CCC", "099", "909", "0F9" ];

var selectedPickOption;
var numberOfTeams = 2;

var turnPickerOptions = Object.freeze({
    firstPlayerOnly: "firstPlayerOnly",
    allPlayers: "allPlayers",
    splitTeams: "splitTeams"
})

let handleTurnPick; // remap to selection function

window.onload = function() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    setOptionsFromQuery();
    shuffle();
    resizeCanvas();
    canvas.addEventListener("touchstart", updateTouches, false);
    canvas.addEventListener("touchmove", updateTouches, false);
    canvas.addEventListener("touchend", updateTouches, false);
    canvas.addEventListener("click", clickAsTouch, false);
    canvas.addEventListener("contextmenu", handleRightClick, false);
}

let setOptionsFromQuery = () => {
    const options = new URLSearchParams(window.location.search);
    if(options == null || options.get(turnPickerParam) == null) {
        handleTurnPick = selectRandomPlayer;
        return;
    }

    const option = options.get(turnPickerParam);
    if(option == turnPickerOptions.firstPlayerOnly) {
        handleTurnPick = selectRandomPlayer;
    } else if(option == turnPickerOptions.allPlayers) {
        handleTurnPick = shuffleAllPlayers;
    } else if (option == turnPickerOptions.splitTeams) {
        handleTurnPick = selectRandomPlayer;
    } else {
        handleTurnPick = selectRandomPlayer;
    }

    if(selectedPickOption == turnPickerOptions.splitTeams) {
        const teamCount = options.get("numberOfTeams");
        if(teamCount == NaN || teamCount < 2) {
            numberOfTeams = 2;
        } else {
            numberOfTeams = teamCount;
        }
    }
}

let resizeCanvas = () => {
    const width = document.documentElement.clientWidth - 20;
    const height = document.documentElement.clientHeight - 60 - 60;
    canvas.style.width = width;
    canvas.style.height = height;
    canvas.width = width;
    canvas.height = height;

    let rect = canvas.getBoundingClientRect();
    offset.x = rect.left;
    offset.y = rect.top;
}

let shuffle = () => {
    for (let i = COLORS.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1));
        [COLORS[i], COLORS[rand]] = [COLORS[rand], COLORS[i]]
    }
}

let updateTouchCount = (count) => {
    let textElement = document.getElementById("touch-count");
    textElement.innerText = count;
    touchCount = count;
    console.log("Selecting at random in 3 seconds");
    debouncedSelectRandomPlayer();
}


let selectRandomPlayer = () => {

    console.log("Selecting a player from array");
    randomSelectedIndex = Math.floor(Math.random() * ongoingTouches.length);
    let selected = ongoingTouches[randomSelectedIndex];
    console.debug(selected);
    ongoingTouches = [selected];
    
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(selected.pageX, selected.pageY, circleRadius, 0, 2 * Math.PI, false);  // a circle at the start
    ctx.fillStyle = selected.color;
    ctx.fill();
}

let shuffleAllPlayers = () => {
    const playerOrder = shuffleArray(ongoingTouches.length);
    
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for(let i = 0; i < ongoingTouches.length; i++) {
        ongoingTouches[i].order = playerOrder[i];
        const selected = ongoingTouches[i];
        ctx.beginPath();
        ctx.fillStyle = selected.color;
        ctx.arc(selected.pageX, selected.pageY, circleRadius, 0, 2 * Math.PI, false);  // a circle at the start
        ctx.fill();
        ctx.font = "4em Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.fillText(selected.order + 1, selected.pageX, selected.pageY + 20);
    }
}

let splitIntoTeams = () => {

}

let shuffleArray = (arrLength) => {
    let arr = new Array(arrLength);
    for(let i = 0; i < arr.length; i++) {
        arr[i] = i;
    }
    // es6 fisher yates
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

let updateTouches = (evt) => {
    evt.preventDefault();
    console.log("touchstart.");
    if(randomSelectedIndex > -1 ) {
        if(evt.targetTouches.length === 0) {
            randomSelectedIndex = -1;
            clearFlag = true;
        }    
        return;
    }

    if(clearFlag) {
        clearState();
    }

    ongoingTouches = [...evt.targetTouches].map(t => copyTouch(t));
    drawTouches()
}

var ongoingTouches = [];

let getClickIndex = () => {
    return ongoingTouches.length;
}

let clickAsTouch = (evt) => {
    if(randomSelectedIndex > -1) {
        clearState()
        return;
    }

    let click = copyClickAsTouch(evt);
    ongoingTouches.push(click);
    drawTouches();
}

let handleRightClick = (evt) => {
    evt.preventDefault();
    if(getClickIndex() <= 0) {
        return;
    }
    ongoingTouches.pop();
    drawTouches();
}

let drawTouches = () => {
    if(randomSelectedIndex > -1) {
        return;
    }
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if(touchCount != ongoingTouches.length) {
        updateTouchCount(ongoingTouches.length);
    }
    for( let i = 0; i < ongoingTouches.length; i++)
    {
        let touch = ongoingTouches[i];
        ctx.beginPath();
        ctx.arc(touch.pageX, touch.pageY, circleRadius, 0, 2 * Math.PI, false);  // a circle at the start
        ctx.fillStyle = touch.color;
        ctx.fill();
    }
}

let debounce = (func, wait) => {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(this, args);
      }, wait);
    };
}

let debouncedResizeCanvas = debounce(resizeCanvas, 50);
let debouncedSelectRandomPlayer = debounce(selectRandomPlayer, 3000);

let clearState = () => {
    randomSelectedIndex = -1;
    ongoingTouches = [];
    updateTouchCount(0);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    shuffle();
    clearFlag = false;
}

let copyClickAsTouch = (evt) => {
    return { identifier: getClickIndex(), pageX: evt.clientX - offset.x, pageY: evt.clientY - offset.y, color: colorForTouch(getClickIndex()) };
}

let copyTouch = (touch) => {
    return { identifier: touch.identifier, pageX: touch.pageX - offset.x, pageY: touch.pageY - offset.y, color: colorForTouch(touch.identifier) };
}

let colorForTouch = (id) => {
    let color = `#${COLORS[id % COLORS.length]}`;
    return color;
}

window.onresize = function() {
    debouncedResizeCanvas();
}
