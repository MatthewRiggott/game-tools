var ongoingTouches = [];

let resizeCanvas = () => {
    let canvas = document.getElementById("canvas");
    const width = document.documentElement.clientWidth - 20;
    const height = document.documentElement.clientHeight - 60;
    canvas.style.width = width;
    canvas.style.height = height;
    canvas.width = width;
    canvas.height = height;
}

let updateTouchCount = () => {
    const count = ongoingTouches.length;
    let textElement = document.getElementById("touch-count");
    textElement.innerText = count;
}

let handleTouchStart = (evt) => {
    evt.preventDefault();
    console.log("touchstart.");
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    
    var touches = evt.changedTouches;
        
    for (var i = 0; i < touches.length; i++) {
      console.log("touchstart:" + i + "...");
      ongoingTouches.push(copyTouch(touches[i]));
      var color = colorForTouch(touches[i]);
      ctx.beginPath();
      ctx.arc(touches[i].pageX, touches[i].pageY, 25, 0, 2 * Math.PI, false);  // a circle at the start
      ctx.fillStyle = color;
      ctx.fill();
      console.log("touchstart:" + i + ".");
    }

    updateTouchCount();
}

let handleTouchMove = (evt) => {
    evt.preventDefault();
}

let handleTouchEnd = (evt) => {
    evt.preventDefault();

    updateTouchCount();
}

let clickAsTouch = (evt) => {
    let touch = {};
    touch.pageX = evt.clientX;
    touch.pageY = evt.clientY;
    touch.identifier = ongoingTouches.length;
    let touchEvent = {};
    touchEvent.changedTouches = [touch];
    touchEvent.preventDefault = () => {};
    handleTouchStart(touchEvent);
}

const COLORS = [ "F00", "FF0", "00F", "0F0", "F0F"];

colorForTouch = (touch) => {

    
    let color = `#${COLORS[touch.identifier % COLORS.length]}`;
    console.log("color for touch with identifier " + touch.identifier + " = " + color);
    return color;
}

copyTouch = (touch) => {
    return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
}

ongoingTouchIndexById = (touchId) => {
    for (var i = 0; i < ongoingTouches.length; i++) {
      var id = ongoingTouches[i].identifier;
      
      if (id == touchId) {
        return i;
      }
    }
    return -1;    // not found
  }

window.onload = function() {
    resizeCanvas();

    const canvas = document.getElementById("canvas");
    canvas.addEventListener("touchstart", handleTouchStart, false);
    canvas.addEventListener("touchmove", handleTouchMove, false);
    canvas.addEventListener("touchend", handleTouchEnd, false);
    canvas.addEventListener("click", clickAsTouch, false);

}

window.onresize = function() {
    window.setTimeout(resizeCanvas(), 50);
}