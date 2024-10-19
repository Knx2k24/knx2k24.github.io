let DEBUG = false;
let MAINGRID;
let IfPlayerDead = false;
let IfPlayerWin = false;

let SEED = 10;

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
$(() => {
    $("#face").text(emoji.smile)
    console.log("document ready");
    document.addEventListener('contextmenu', (event) => event.preventDefault());
    Initialize(...choosenSize);

    $(window).on("resize", function() { //resize the data window when the player changes aspects 
        if(document.documentElement.clientHeight+200 > document.documentElement.clientWidth){
            $("#bgImage").css("display", "none")
        }else{
            $("#bgImage").css("display", "initial")
        }

        if(gridWidth*gridHeight>255 || gridHeight >21){
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
    window.addEventListener('keydown', function(e) {
        if(e.key == " " && e.target == document.body) {
          e.preventDefault();
        }
    });

    $(window).on( "keydown", function(e) { //fast start with space
        if(e.which == 32){
            Initialize(...choosenSize);
        }
    });
    ShowSelectedMode(0);

    $("#customWidth").val(9);
    $("#customHeight").val(7);
    $("#customBombs").val(7);

    $("#modeBegginer").on("click", function(){
        ShowSelectedMode(0);
    })
    $("#modeIntermediate").on("click", function(){
        ShowSelectedMode(1);
    })
    $("#modeExpert").on("click", function(){
        ShowSelectedMode(2);
    })
    $("#modeCustom").on("click", function(){
        ShowSelectedMode(3);
    })

    $("#face").on("click", function(){
        Initialize(...choosenSize);
    })

    $("#buttonBegin").on("click", function(){
        Initialize(...choosenSize);
    })
});

function GameLost() {
    IfPlayerDead = true;
    $("#face").text(emoji.dead)
    ShowAll();
    if(sMsOD){alert("No orgasm for you >w<.")}
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

function ShowSelectedMode(n){
    
    if(n == 3){

        $("#modeCustom").css({
            color: "white",
            textDecoration: "underline"
        })
        $("#modeBegginer").css({
            color: "gray",
            textDecoration: "none"
        })
        $("#modeIntermediate").css({
            color: "gray",
            textDecoration: "none"
        })
        $("#modeExpert").css({
            color: "gray",
            textDecoration: "none"
        })
        choosenSize = [$("#customWidth").val(), $("#customHeight").val(), $("#customBombs").val()];
    }else if(n == 2){
        $("#modeCustom").css({
            color: "gray",
            textDecoration: "none"
        })
        $("#modeBegginer").css({
            color: "gray",
            textDecoration: "none"
        })
        $("#modeIntermediate").css({
            color: "gray",
            textDecoration: "none"
        })
        $("#modeExpert").css({
            color: "white",
            textDecoration: "underline"
        })
        choosenSize = sizes.e;
    }else if(n == 1){
        $("#modeCustom").css({
            color: "gray",
            textDecoration: "none"
        })
        $("#modeBegginer").css({
            color: "gray",
            textDecoration: "none"
        })
        $("#modeIntermediate").css({
            color: "white",
            textDecoration: "underline"
        })
        $("#modeExpert").css({
            color: "gray",
            textDecoration: "none"
        })
        choosenSize = sizes.i;
    }else{
        $("#modeCustom").css({
            color: "gray",
            textDecoration: "none"
        })
        $("#modeBegginer").css({
            color: "white",
            textDecoration: "underline"
        })
        $("#modeIntermediate").css({
            color: "gray",
            textDecoration: "none"
        })
        $("#modeExpert").css({
            color: "gray",
            textDecoration: "none"
        })

        choosenSize = sizes.b;
    }
}

let BOARD_STATES_LIST = [];
let timeAvg = 0;
let timeIndex = 0;
function Initialize(x, y, b, c) {
    if(DEBUG){
        var start = new Date().getTime();
    }
    timeIndex += 1;
    //UGLY ASS MOBILE OPT

    if($(window).height() >= $(window).width()){
        $("#pseudoBackground").css({
            display: "none"
        })
    }else{
        $("#pseudoBackground").css({
            display: "initial"
        })
    }


    $("#face").text(emoji.smile);
    IfFirstClick = true;
    gridWidth = x;
    gridHeight = y;
    mineCount = b;

    IfPlayerDead = false;
    IfPlayerWin = false;

    if (mineCount <= 0 || mineCount >= gridWidth * gridHeight) {
        
        mineCount = gridHeight * gridWidth -1;
    }

    

    $("#dataMarked").html(`Marked <br> <div class="dataNumber">${CountMarked()}</div`);

    $("#dataMines").html(`Mines <br> <div class="dataNumber">${mineCount}</div`);

    // Validate mine count
    
    if(gridWidth*gridHeight>255 || gridHeight >21){
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

    if(gridHeight > 17 || gridHeight > 23){
        gridCont.empty().css({
            top: "70%"
        });
        $("#dataContainer").css({
            top: `${gridCont.position().top - $("#dataContainer").height()}px`
        });
    }


    if(choosenSize == sizes.e){
        GridFromState(EXPERT_GRIDS_SAMPLES);
    }else{
        MakeGrid();
        AddBombs();
        AssignNumbers();
    }


    
    
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

    if(DEBUG){
        var end = new Date().getTime();
        var time = end - start;
        timeAvg += time;
    
        console.log('Execution time: ' + time + 'ms \n AVG time: ' + timeAvg/timeIndex);
    }
    console.log(GetState());
    // BOARD_STATES_LIST.push(GetState());
    // sleep(500)
    // if(timeIndex > 1000){
    //     console.log("FINISHED!!!");
    //     console.log(BOARD_STATES_LIST);
    //     console.log("ENDED!!!")
    // }else{
    //     //Initialize(...choosenSize);
    // }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

function GetState() {
    let cells = {
        w: gridWidth,
        h: gridHeight,
        c: ""
    };
    $(".cell").each(function (index, element) {
        cells.c += $(element).data("hasbomb") ? "B" : $(element).data("number").toString();
    });
    return cells;
}

function GridFromState(s, mirror = false){
    let Grid = s[rInt(0, s.length)];
    gridWidth = Grid.w;
    gridHeight = Grid.h;

    let Cells = Grid.c.split('');
    let Matrix = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));
    
    for (let x = 0; x < gridHeight; x++) {
        for (let y = 0; y < gridWidth; y++) {
            let index = x * gridWidth + y;
            Matrix[x][y] = Cells[index];
        }
    }

    for (let x = 0; x < gridHeight; x++) {
        for (let y = 0; y < gridWidth; y++) {
            if(Matrix[x][y] == "B"){
                if (DEBUG) {
                    gridCont.append(`
                        <div style='background-color: red;' class='cell' data-wentover='false' data-marked='false' data-seen='false' data-number='0' data-hasBomb='true' data-x='${x}' data-y='${y}'></div>
                    `);
                }else{
                    gridCont.append(`
                        <div class='cell' data-wentover='false' data-marked='false' data-seen='false' data-number='0' data-hasBomb='true' data-x='${x}' data-y='${y}'></div>
                    `);
                }
            }else{
                gridCont.append(`
                    <div class='cell' data-wentover='false' data-marked='false' data-seen='false' data-number='${Matrix[x][y]}' data-hasBomb='false' data-x='${x}' data-y='${y}'></div>
                `);
            }
        }
    }

    $(".cell").css({
        width: gridCont.width() / gridWidth,
        height: gridCont.height() / gridHeight,
    });
}