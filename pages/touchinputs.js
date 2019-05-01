var canvas;
var ctx;
var offset = { x: 0, y: 0 };

window.onload = function() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    
    resizeCanvas();
    canvas.addEventListener("touchstart", updateTouches, false);
    canvas.addEventListener("touchmove", updateTouches, false);
    canvas.addEventListener("touchend", updateTouches, false);
    canvas.addEventListener("click", clickAsTouch, false);
    canvas.addEventListener("contextmenu", handleRightClick, false);
}

let resizeCanvas = () => {
    const width = document.documentElement.clientWidth - 20;
    const height = document.documentElement.clientHeight - 60;
    canvas.style.width = width;
    canvas.style.height = height;
    canvas.width = width;
    canvas.height = height;

    let rect = canvas.getBoundingClientRect();
    offset.x = rect.left;
    offset.y = rect.top;
}

let updateTouchCount = (count) => {
    let textElement = document.getElementById("touch-count");
    textElement.innerText = count;

    if(count > 1) {
        console.log("Selecting at random in 3 seconds");
        window.setTimeout(() => selectRandomPlayer(count), 3000);
    }
}

let selectRandomPlayer = (count) => {
    if(count != ongoingClicks.length) {
        return;
    }
    console.log("Selecting a player");
    let selected = ongoingClicks[Math.floor(Math.random() * ongoingClicks.length)];
    console.debug(selected);
    ongoingClicks = [selected];
    clickIndex = 1;
    drawClicks();
}

let updateTouches = (evt) => {
    evt.preventDefault();
    console.log("touchstart.");
    
    var touches = evt.targetTouches;
    var touchCount = touches.length;
    updateTouchCount(touchCount);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < touches.length; i++) {
      console.log(`Touch ${i} being drawn.`);
      var color = colorForTouch(touches[i]);
      ctx.beginPath();
      ctx.arc(touches[i].pageX - offset.x, touches[i].pageY - offset.y, 25, 0, 2 * Math.PI, false);  // a circle at the start
      ctx.fillStyle = color;
      ctx.fill();
    }
}

var clickIndex = 0;
const COLORS = [ "F00", "00F", "0F0", "FF0", "F0F", "0FF", "6FC", "FC9", "CCC", "099", "909", "0F9" ];

var ongoingClicks = [];

let clickAsTouch = (evt) => {
    let click = copyClick(evt);
    ongoingClicks.push(click);
    clickIndex++;
    drawClicks();
}

let handleRightClick = (evt) => {
    evt.preventDefault();
    if(clickIndex <= 0) {
        return;
    }
    ongoingClicks.pop();
    clickIndex --;
    drawClicks();
}

let drawClicks = () => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateTouchCount(ongoingClicks.length);
    for( let i = 0; i < ongoingClicks.length; i++)
    {
        let click = ongoingClicks[i];
        ctx.beginPath();
        ctx.arc(click.x, click.y, 25, 0, 2 * Math.PI, false);  // a circle at the start
        ctx.fillStyle = click.color;
        ctx.fill();
    }
}

let copyClick = (evt) => {
    let click = {};
    click.x = evt.clientX - offset.x;
    click.y = evt.clientY - offset.y;
    click.color = `#${COLORS[clickIndex % COLORS.length]}`;
    click.id = clickIndex;
    return click;
}

colorForTouch = (touch) => {
    let color = `#${COLORS[touch.identifier % COLORS.length]}`;
    console.log("color for touch with identifier " + touch.identifier + " = " + color);
    return color;
}

window.onresize = function() {
    window.setTimeout(resizeCanvas(), 50);
}