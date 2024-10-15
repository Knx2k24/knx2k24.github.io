let DEBUG = true;
let MAINGRID;
let IfPlayerDead = false;
let IfPlayerWin = false;

let IfFirstClick = true;

const emoji = {
    smile: "😃",
    scared: "😨",
    sunglasses: "😎",
    dead: "💀"
}

// Size configurations for different difficulty levels
const sizes = {
    b: [9, 9, 10 ],
    i: [16, 16, 40],
    e: [30, 16, 99],
};

let choosenSize = sizes.b;

let colors = [];
colors["0"] = "white";
colors["1"] = "#1010ff";
colors["2"] = "lightgreen";
colors["3"] = "hotpink";
colors["4"] = "#a0a0ff";
colors["5"] = "crimson";
colors["6"] = "#a0fff0";
colors["7"] = "#f0a0f0";
colors["8"] = "a0f020";
colors["B"] = "red";
colors["X"] = "lime";
// Grid dimensions and mine count
let gridWidth = 0;
let gridHeight = 0;
let mineCount = 0;

const gridCont = $("#gridContainer");
$(document).ready(() => {
    $("#face").text(emoji.smile)
    console.log("document ready");
    document.addEventListener('contextmenu', (event) => event.preventDefault());
    Initialize(...choosenSize);

    $(window).resize(function() { //resize the data window when the player changes aspects 
        if(gridWidth*gridHeight>255){
            $("#dataContainer").css({
                width: `${gridWidth * 32}px`,
                top: `${gridCont.position().top - $("#dataContainer").height()}px`
            });
        }else{
            $("#dataContainer").css({
                width: `${gridWidth * 48}px`,
                top: `${gridCont.position().top - $("#dataContainer").height()}px`
            });
        }
    });
    $(window).on( "keydown", function(e) { //fast start with space
        if(e.which == 32){
            Initialize(...choosenSize);
        }
    });
});

function GameLost() {
    IfPlayerDead = true;
    $("#face").text(emoji.dead)
    ShowAll();
}
function GameWin(){
    IfPlayerWin = true;
    $("#face").text(emoji.sunglasses)
    ShowAll();
}

function GlowNerby(x, y){
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            $cell = GetCell(x + dx, y + dy);
            $cell.css({
                outline: "1px lime solid"
            })
        }
    }
}
function RemoveGlowNerby(x, y){
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            $cell = GetCell(x + dx, y + dy);
            $cell.css({
                outline: "1px gray solid"
            })
        }
    }
}

function Initialize(x, y, b, c) {
    $("#face").text(emoji.smile);
    IfFirstClick = true;
    gridWidth = x;
    gridHeight = y;
    mineCount = b;

    IfPlayerDead = false;
    IfPlayerWin = false;

    $("#face").on("click", function(){
        Initialize(...choosenSize);
    })


    $("#dataMarked").html(`Marked <br> <div class="dataNumber">${CountMarked()}</div`);

    $("#dataMines").html(`Mines <br> <div class="dataNumber">${mineCount}</div`);

    // Validate mine count
    if (mineCount <= 0 || mineCount > gridWidth * gridHeight) {
        alert(`SOMETHING WENT TERRIBLY WRONG | MINE NUMBER = ${mineCount}`);
        return;
    }
    if(gridWidth*gridHeight>255){
        gridCont.empty().css({
            width: `${gridWidth * 32}px`,
            height: `${gridHeight * 32}px`,
            "grid-template-columns": `repeat(${gridWidth}, 1fr)`,
            "grid-template-rows": `repeat(${gridHeight}, 1fr)`,
            fontSize: "80%"
        });
        $("#dataContainer").css({
            width: `${gridWidth * 32}px`,
            top: `${gridCont.position().top - $("#dataContainer").height()}px`
        });
    }else{
        gridCont.empty().css({
            width: `${gridWidth * 48}px`,
            height: `${gridHeight * 48}px`,
            "grid-template-columns": `repeat(${gridWidth}, 1fr)`,
            "grid-template-rows": `repeat(${gridHeight}, 1fr)`,
            fontSize: "100%"
        });
        $("#dataContainer").css({
            width: `${gridWidth * 48}px`,
            top: `${gridCont.position().top - $("#dataContainer").height()}px`
        });
    }

    MakeGrid();
    AddBombs();
    AssignNumbers();


    
    
    $(".cell").on("click", function () {
        const $cell = $(this);

        
        if ($cell.data("marked") == false) {
            if ($cell.data("hasbomb") == true) {
                if(IfFirstClick){
                    Initialize(...choosenSize, [$cell.data("x"), $cell.data("y")]);
                }else{
                    console.log("bomb :(");
                    IfPlayerDead = true;
                    GameLost();                    
                }
            } else {
                Show($cell.data("x"), $cell.data("y"));
                
                // Check for auto-reveal
                if ($cell.data("number") > 0 && checkSurroundingMarks($cell)) {
                    revealSurroundingCells($cell);
                }
            }
        }
        IfFirstClick = false;
    });

    if(c != null){ // for when the player rerolls
        GetCell(...c).trigger("click");
    }

    // Right-click event for marking cells
    $(".cell").on("contextmenu", function (e) {
        e.preventDefault(); // Prevent the context menu
        const $cell = $(this);
        if ($cell.data("seen") == false) {
            if(!IfPlayerDead){
                if(!IfPlayerWin){
                    $cell.data("marked", !$cell.data("marked"));
                    $cell.text($cell.data("marked") ? "X" : "");
                    if(CountMarked() > mineCount){
                        $("#dataMarked").html(`Marked <br> <div style="color:red;" class="dataNumber">${CountMarked()}</div`);
                    }else{
                        $("#dataMarked").html(`Marked <br> <div class="dataNumber">${CountMarked()}</div`);
                    }
                    if(CountCorrectMarked() == mineCount && CountMarked() == CountCorrectMarked()){
                        GameWin();
                    }
                }
            }
        }
    });

    // $(".cell").hover(
    //     function () {
    //         if($(this).data("number") > 0 && $(this).data("seen") == true){
    //             const x = $(this).data("x");
    //             const y = $(this).data("y");
    //             GlowNerby(x, y);
    //         }
    //         // Mouse enters the cell
    //     },
    //     function () {
    //         // Mouse leaves the cell
    //         const x = $(this).data("x");
    //         const y = $(this).data("y");
    //         RemoveGlowNerby(x, y); // Optional: Function to remove the glow
    //     }
    // );

    $(".cell").on("mousedown", function(){
        if(!IfPlayerDead){
            if(!IfPlayerWin){
                if($(this).data("number") != 0 || $(this).data("seen") == false){
                    $("#face").text(emoji.scared);
                }
            }
        }
    });
    $(".cell").on("mouseup", function(){
        if(!IfPlayerDead){
            if(!IfPlayerWin){
                if($(this).data("number") != 0 || $(this).data("seen") == false){
                    $("#face").text(emoji.smile);
                }
            }
        }
        if(IfPlayerWin){
            $("#face").text(emoji.sunglasses); //idk if this is necesary
        }
    });
}

function MakeGrid() {
    MAINGRID = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));

    for (let x = 0; x < gridHeight; x++) {
        for (let y = 0; y < gridWidth; y++) {
            gridCont.append(`
                <div class='cell' data-wentover='false' data-marked='false' data-seen='false' data-number='0' data-hasBomb='false' data-x='${x}' data-y='${y}'></div>
            `);
        }
    }

    $(".cell").css({
        width: gridCont.width() / gridWidth,
        height: gridCont.height() / gridHeight,
    });
}

function AddBombs() {
    let bombsPlaced = 0;
    while (bombsPlaced < mineCount) {
        const [x, y] = GetRandomCell();
        const $cell = GetCell(x, y);
        if ($cell.data("hasbomb") == false) {
            $cell.data("hasbomb", true);
            if (DEBUG) {
                $cell.css("background-color", "red");
            }
            bombsPlaced++;
        }
    }
}

function rInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min); // Inclusive min, exclusive max
}

function GetRandomCell() {
    return [rInt(0, gridHeight), rInt(0, gridWidth)];
}

function GetCell(x, y) {
    return $(`.cell[data-x='${x}'][data-y='${y}']`);
}

function ifHasBomb(x, y) {
    return GetCell(x, y).data("hasbomb");
}

function GetNumberOfNearbyBombs(x, y) {
    let bombCount = 0;

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue; // Skip the cell itself
            if (ifHasBomb(x + dx, y + dy)) bombCount++;
        }
    }

    GetCell(x, y).data("number", bombCount);
}

function AssignNumbers() {
    for (let x = 0; x < gridHeight; x++) {
        for (let y = 0; y < gridWidth; y++) {
            GetNumberOfNearbyBombs(x, y);
        }
    }
}

function Show(x, y) {
    CheckForLoss();
    CheckForWin();
    if (x < 0 || x >= gridHeight || y < 0 || y >= gridWidth) return; // Out of bounds
    const $cell = GetCell(x, y);
    if ($cell.data("seen") || $cell.data("marked")) return;

    $cell.data("seen", true);
    $cell.attr("data-wentover", "true");
    
    if ($cell.data("hasbomb") == true) {
        $cell.text("B");
        return; // Stop revealing further if a bomb is hit
    }

    const number = $cell.data("number");
    $cell.text(number > 0 ? number : "");
    $cell.css("color", colors[$cell.data("number")]);
    $cell.css("background-color", "#303030");

    if (number === 0) {
        // Recursive reveal if the cell is empty
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                Show(x + dx, y + dy);
            }
        }
    }
}

// Check if the surrounding marked cells match the number in the clicked cell
function checkSurroundingMarks($cell) {
    const x = $cell.data("x");
    const y = $cell.data("y");
    let markedCount = 0;

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue; // Skip the cell itself
            if (GetCell(x + dx, y + dy).data("marked") === true) {
                markedCount++;
            }
        }
    }

    return markedCount === $cell.data("number");
}

// Reveal surrounding cells if the number of markings is fulfilled
function revealSurroundingCells($cell) {
    const x = $cell.data("x");
    const y = $cell.data("y");

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue; // Skip the cell itself
            const adjacentCell = GetCell(x + dx, y + dy);
            if (adjacentCell.data("seen") === false && adjacentCell.data("marked") === false) {
                GetCell(x + dx, y + dy).trigger("click");
                Show(x + dx, y + dy); // Show the adjacent cell
            }
        }
    }
}

function CheckForLoss() {
    if (IfPlayerDead) return;
    
    for(let x = 0; x > gridWidth; x++){
        for(let y = 0; y > gridHeight; y++){
            $cell = GetCell(x, y)
            if($cell.data("seen") == true && $cell.data("hasbomb") == true){
                IfPlayerDead = true;
                GameLost();
            }
        }
    }

}

function CheckForWin() {
    if (IfPlayerWin) return;
    
    for(let x = 0; x > gridWidth; x++){
        for(let y = 0; y > gridHeight; y++){
            $cell = GetCell(x, y)
            if(CountCorrectMarked() == mineCount && CountMarked() == CountCorrectMarked()){
                IfPlayerWin = true;
                GameWin();
            }
        }
    }

}


function ShowAll() {
    $(".cell").each(function () {
        const $cell = $(this);
        $cell.text($cell.data("number") > 0 ? $cell.data("number") : "");
        $cell.css("color", colors[$cell.data("number")]);
        $cell.css("background-color", "#303030");
        if ($cell.data("hasbomb") == true) {
            $cell.text($cell.data("marked") == true ? "X" : "B");
            $cell.css("color", $cell.data("marked") == true ? colors["X"] : colors["B"]);
        }
        if ($cell.data("hasbomb") == false && $cell.data("marked") == true ){
            $cell.text("X");
            $cell.css("color", colors["B"]);
        }
    });
}

function CountMarked(){
    let mCount = 0;
    for (let x = 0; x < gridHeight; x++) {
        for (let y = 0; y < gridWidth; y++) {
            $cell = GetCell(x,y);
            if($cell.data("marked") == true){
                mCount++;
            }
        }
    }
    return mCount;
}

function CountCorrectMarked(){
    let mCount = 0;
    for (let x = 0; x < gridHeight; x++) {
        for (let y = 0; y < gridWidth; y++) {
            $cell = GetCell(x,y);
            if($cell.data("marked") == true && $cell.data("hasbomb") == true){
                mCount++;
            }
        }
    }
    return mCount;
}