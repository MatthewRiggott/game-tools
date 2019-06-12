var canvas;
var ctx;
var offset = { x: 0, y: 0 };
var randomSelectedIndex = -1;
var clearFlag = false;
var touchCount = 0;
var turnPickerParam = "turnpickeroption";

const circleRadius = 60;
const DELAY_TO_PICK = 3000;

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
    shuffleColors();
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
        selectedPickOption = turnPickerOptions.firstPlayerOnly
    } else {
        selectedPickOption = options.get(turnPickerParam);
    }
    
    let pickFunc;
    if(selectedPickOption == turnPickerOptions.firstPlayerOnly) {
        pickFunc = selectRandomPlayer;
    } else if(selectedPickOption == turnPickerOptions.allPlayers) {
        pickFunc = shuffleAllPlayers;
    } else if (selectedPickOption == turnPickerOptions.splitTeams) {
        pickFunc = splitIntoTeams;
    } else { 
        // default case should option not match a valid case
        selectedPickOption = turnPickerOptions.firstPlayerOnly;
        pickFunc = selectRandomPlayer;
    }
    handleTurnPick = debounce(pickFunc, DELAY_TO_PICK);

    if(selectedPickOption == turnPickerOptions.splitTeams) {
        const teamCount = parseInt(options.get("numberOfTeams"));
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

let shuffle = (arr) => {
    let copyArr = [...arr];
    for (let i = copyArr.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1));
        [copyArr[i], copyArr[rand]] = [copyArr[rand], copyArr[i]]
    }
    return copyArr;
}

let shuffleColors = () => {
    COLORS = shuffle(COLORS);
}

let updateTouchCount = (count) => {
    let textElement = document.getElementById("touch-count");
    textElement.innerText = count;
    touchCount = count;
    if(validate()) {
        handleTurnPick();
    }
}

let validate = () => {
    if(selectedPickOption != turnPickerOptions.splitTeams) {
        return ongoingTouches.length >= 2;
    } else {
        return ongoingTouches.length >= numberOfTeams;
    }
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

let reorderAllPlayers = () => {
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
    if(numberOfTeams >= ongoingTouches.count) {
        if(numberOfTeams == ongoingTouches.count) {
            reorderAllPlayers();
        }
        return;
    }

    // shuffle players, assign first $numberOfTeams players to a unique teams, divvying the remainder as evenly possible
    const shuffledOrder = shufflePlayers(ongoingTouches.length);
    const teams = new Array(numberOfTeams);

    for(let i = 0; i < shuffledOrder.length; i ++) {
        if(i < teams.length) {
            let team = {};
            team.players = [];
            team.color = ongoingTouches[shuffledOrder[i]].color;
            teams[i] = team;
        }
        teams[i % teams.length].players.push(ongoingTouches[shuffledOrder[i]]);
    }

    // select which team goes 'first', prefer teams with less players
    const lowestTeamPlayerCount = teams[teams.length - 1].players.length; // team whom is decided last will have the lowest count
    const totalTeamsWithLessPlayers = teams.filter(team => team.players.length == lowestTeamPlayerCount).length; // number of teams with fewer players
    // randomly selected team of those with fewer players, index is mapped back to one within the teams array
    const firstTeamIndex = Math.floor(Math.random() * totalTeamsWithLessPlayers) + (teams.length - totalTeamsWithLessPlayers);
    
    for(let i = 0; i < teams.length; i++) {
        const team = teams[i];
        const isFirst = i == firstTeamIndex;
        for(let j = 0; j < team.players.length; j++) {
            const touch = team.players[j];
            ctx.beginPath();
            ctx.fillStyle = team.color;
            ctx.arc(touch.pageX, touch.pageY, circleRadius - 10, 0, 2 * Math.PI, false);  // a circle at the start
            ctx.fill();
            if(isFirst) {
                ctx.font = "4em Arial";
                ctx.textAlign = "center";
                ctx.fillStyle = "black";
                ctx.fillText(1, touch.pageX, touch.pageY + 20);
            }
        }
    }
}

let shufflePlayers = (arrLength) => {
    let arr = new Array(arrLength);
    for(let i = 0; i < arr.length; i++) {
        arr[i] = i;
    }
    return shuffle(arr);
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

let clearState = () => {
    randomSelectedIndex = -1;
    ongoingTouches = [];
    updateTouchCount(0);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    shuffleColors();
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
