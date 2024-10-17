const FACE = $("#face");

const PSEUDOBACKGROUND = $("#pseudoBackground");
const SLIDEBUTTON = $("#hideIcon")

let sideOpen = true;

let sMsOD = false;

//https://pixabay.com/illustrations/stars-sky-space-space-wallpaper-2643089/
const BACKGROUNDS = {
    s: [640, 427, "public/assets/stars640×427.jpg"],
    m: [1280, 854, "public/assets/stars1280×854.jpg"],
    l: [1920, 1281, "public/assets/stars1920×1281.jpg"],
    xl: [6960, 4645, "public/assets/stars6960×4645.jpg"]
} ;

$(() => {
    console.log("effects ready")
    startAnimating(24);
    PSEUDOBACKGROUND.html(`<img id="bgImage" src="/${BACKGROUNDS.l[2]}">`)

    let bgX = 0;
    let bgY = 0;
    $(document).on("mousemove", function(event) { //add disable animation hir
        bgX = lerp(bgX, event.pageX/300, 0.1)
        bgY = lerp(bgY, event.pageY/300, 0.1)
        $("#bgImage").css({
            left: -50 + bgX+"%",
            top: -25 + bgY+"%"
        });
    });
    
    SLIDEBUTTON.on("click", function(){
        sideOpen = !sideOpen;
        AnimateSide(sideOpen)
    })
});

function AnimateSide(s){
    if(s){
        $("#hideIcon").text("<<");
        $("#sideBar").animate({
            left: "0px"
        }, 1000)
    }else{
        $("#hideIcon").text(">>");
        $("#sideBar").animate({
            left: "-250px"
        }, 1000)
    }
}

var stop = false;
var frameCount = 0;
var $results = $("#results");
var fps, fpsInterval, startTime, now, then, elapsed;


function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    
    
    animate();
}


function animate() {
    requestAnimationFrame(animate);
    frameCount++;

    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);

        if(FACE.text() == emoji.dead){
            glowFace(true, "red", frameCount);
        }else{
            glowFace(false, "", frameCount);
        }
    }
}

function glowFace(s, c, f){
    let offset = Math.sin(f/100)*50;
    offset = Math.abs(offset);
    if(s){
        FACE.css("text-shadow", `0px 0px ${offset}px ${c}`);
    }else{
        FACE.css("text-shadow", "none");
    }
}

function MoveBackground(x, y){
    $("body").css({
        backgroundPosition: `${x}px ${200+y}px 0px 0px`
    })
}


function lerp (start, end, amt){
    return (1-amt)*start+amt*end;
  }