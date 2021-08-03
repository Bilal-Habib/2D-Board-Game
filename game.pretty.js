// define all classes
// -------------------------------------------------------------------------
class Treasure {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
  }
}
 
class Obstacle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
 
class Hero {
  constructor(x, y) {
    hero_x = x;
    hero_y = y;
  }
}
 
class Killer {
  score = 0;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  setScore(score) {
    this.score = score;
  }
}
// -------------------------------------------------------------------------
 
// initialise global vars
// -------------------------------------------------------------------------
var hero_x;
var hero_y;
var hero_score = 0;
let no_turns = 0;
let no_rounds = 0;
let no_treasures = 0;
let no_heros = 0;
let all_killers = [];
let isHero_alive = true;
let total_killer_score = 0;
const table = document.getElementById("board");
const stage_label = document.getElementById("stage");
const turn_label = document.getElementById("turn");
const hero_score_label = document.getElementById("heroScore");
const killer_score_label = document.getElementById("killerScore");
const treasure_label = document.getElementById("treasure");
const round_label = document.getElementById("round");
const end_stage_btn = document.getElementById("playCompleteBtn");
 
var board = [
  ["", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", ""],
];
// -------------------------------------------------------------------------
 
// Messages and Labels Handling
// -------------------------------------------------------------------------
end_stage_btn.hidden = true;
 
function updateLabels() {
  if (isPlayersTurn()) {
    turn_label.innerHTML = "Player's Turn!";
  } else {
    turn_label.innerHTML = "Computer's Turn!";
  }
  hero_score_label.innerHTML = "Hero's Score: " + hero_score;
  killer_score_label.innerHTML = "Killer's Score: " + total_killer_score;
  treasure_label.innerHTML = "Treasures Remaining: " + no_treasures;
  round_label.innerHTML = "Round Number: " + no_rounds;
}
 
function showMessage(message) {
  window.alert(message);
}
// -------------------------------------------------------------------------
 
// initialise table
function init() {
  for (y = 0; y < board.length; y++) {
    var tr = document.createElement("tr");
    table.appendChild(tr);
    for (x = 0; x < board[y].length; x++) {
      var td = document.createElement("td");
      var txt = document.createTextNode(board[y][x]);
      td.appendChild(txt);
      td.addEventListener("click", setupStage.bind(null, x, y));
      tr.appendChild(td);
    }
  }
}
 
function possibleKillerMoves(x, y) {
  let m = [
    [x, y - 1],
    [x - 1, y],
    [x, y + 1],
    [x + 1, y],
    [x - 1, y - 1],
    [x + 1, y - 1],
    [x - 1, y + 1],
    [x + 1, y + 1],
  ];
  return m;
}
 
// setup process
// -------------------------------------------------------------------------
function setupStage(x, y, event) {
  let input = prompt("Please enter a command");
 
  if (isPromptInputValid(input)) {
    // set value of square on board
    if (parseInt(input)) {
      event.target.innerHTML = "t";
    } else {
      event.target.innerHTML = input;
    }
 
    // set the value of selected cell
    setCellValue(x, y, input);
  } else {
    if (no_heros > 0 && input == "h") {
      showMessage("Hero already placed!");
      return;
    }
    showMessage("Input " + input + " is invalid!");
  }
}
 
function setCellValue(x, y, input) {
  if (parseInt(input)) {
    board[x][y] = new Treasure(x, y, input);
    no_treasures += 1;
  }
  if (input == "o") {
    board[x][y] = new Obstacle(x, y);
  }
  if (input == "h") {
    board[x][y] = new Hero(x, y);
    no_heros += 1;
  }
  if (input == "k") {
    board[x][y] = new Killer(x, y);
    all_killers.push(new Killer(x, y));
  }
}
 
function setupComplete() {
  // check if hero exists on grid
  if (no_heros == 0) {
    showMessage("You need to place a hero!");
    return;
  }
 
  stage_label.innerText = "Setup Stage Complete";
 
  // removes all event listeners from grid
  removeAllEventListeners();
 
  //   change display message
  stage_label.innerText = "Play Stage!";
 
  //   hide setup finish button
  document.getElementById("setupCompleteBtn").hidden = true;
  playStage();
}
 
function removeAllEventListeners() {
  for (y = 0; y < board.length; y++) {
    var tr = table.getElementsByTagName("tr")[y];
    for (x = 0; x < board[y].length; x++) {
      var td = tr.getElementsByTagName("td")[x];
      td.replaceWith(td.cloneNode(true));
    }
  }
}
// -------------------------------------------------------------------------
 
function playStage() {
  // if user has not placed any treasure then skip to end stage
  if (no_treasures == 0) {
    endStage();
    return;
  }
 
  // hide button that ends the setup stage
  end_stage_btn.hidden = false;
 
  document.onkeydown = function (e) {
    let input = e.key;
    if (input != "w" && input != "a" && input != "s" && input != "d") {
      window.alert("Oops! sorry, you need to enter one of: w, a, s, d");
    } else {
      // handle movement of hero
      handleHeroMovement(input);
      no_turns += 1;
      updateLabels();
      if (no_treasures == 0 || isHero_alive == false) {
        endStage();
        return;
      }
 
      // handle movement of all killers
      for (var i = 0; i < all_killers.length; i++) {
        let killer = all_killers[i];
        handleKillerMovement(killer.x, killer.y, killer);
      }
      no_rounds += 1;
      updateLabels();
      if (no_treasures == 0 || isHero_alive == false) {
        endStage();
      }
    }
  };
}
 
// Board and game logic
// -------------------------------------------------------------------------
function handleKillerMovement(x, y, killer) {
  no_turns += 1;
  let movements = possibleKillerMoves(x, y);
  for (var i = 0; i < movements.length; i++) {
    if (killerFoundObj(movements[i][0], movements[i][1]) != "") {
      killOrTake(x, y, movements[i][0], movements[i][1], killer);
      return;
    }
  }
  let x_and_y = randomMove(x, y);
  updateKillerPosition(x, y, x_and_y[0], x_and_y[1], killer);
}
 
// checks if killer found hero or treasure
function killerFoundObj(x, y) {
  if (isKillerMoveValid(x, y)) {
    if (getCellContent(x, y).innerHTML == "h") {
      return "h";
    } else if (getCellContent(x, y).innerHTML == "t") {
      return "t";
    }
  }
  return "";
}
 
// handles if killer can kill hero or take treasure
function killOrTake(x, y, x2, y2, killer) {
  if (killerFoundObj(x2, y2) == "h") {
    isHero_alive = false;
    updateKillerPosition(x, y, x2, y2, killer);
  } else if (killerFoundObj(x2, y2) == "t") {
    // update global killer score
    total_killer_score += parseInt(board[x2][y2].value);
    updateKillerPosition(x, y, x2, y2, killer);
    no_treasures -= 1;
  }
}
 
// handles random killer movement
function randomMove(x, y) {
  let is_move_valid = false;
  // only return if move valid
  while (is_move_valid == false) {
    let i = Math.floor(Math.random() * 7 + 1);
    let movements = possibleKillerMoves(x, y);
    let x_and_y = movements[i];
    if (isKillerMoveValid(x_and_y[0], x_and_y[1])) {
      is_move_valid = true;
      return movements[i];
    }
  }
}
 
function handleHeroMovement(input) {
  switch (input) {
    case "w":
      moveHero(hero_x, hero_y - 1);
      break;
    case "a":
      moveHero(hero_x - 1, hero_y);
      break;
    case "s":
      moveHero(hero_x, hero_y + 1);
      break;
    case "d":
      moveHero(hero_x + 1, hero_y);
      break;
  }
}
 
function moveHero(x, y) {
  if (isMoveValid(x, y)) {
    heroFoundTreasure(x, y);
    // hero collided with killer
    if (getCellContent(x, y).innerHTML == "k") {
      isHero_alive = false;
      // endStage();
      return;
    }
    updateHeroPosition(x, y);
  }
}
 
function heroFoundTreasure(x, y) {
  if (getCellContent(x, y).innerHTML == "t") {
    if (isPlayersTurn) {
      hero_score += parseInt(board[x][y].value);
    }
    no_treasures -= 1;
  }
}
 
function updateHeroPosition(x, y) {
  if (isPlayersTurn) {
    // remove old position
    board[hero_x][hero_y] = "";
    updateCellContent(hero_x, hero_y, "");
 
    // set new position
    board[x][y] = new Hero(x, y);
    updateCellContent(hero_x, hero_y, "h");
  }
}
 
function updateKillerPosition(x, y, x2, y2, killer) {
  // remove old position
  board[x][y] = "";
  updateCellContent(x, y, "");
 
  // update object coordinates
  killer.x = x2;
  killer.y = y2;
 
  // set new position
  board[x2][y2] = new Killer(x2, y2);
  updateCellContent(x2, y2, "k");
}
 
function getCellContent(x, y) {
  return table.getElementsByTagName("tr")[y].getElementsByTagName("td")[x];
}
 
function updateCellContent(x, y, val) {
  return (getCellContent(x, y).innerHTML = val);
}
// -------------------------------------------------------------------------
 
function endStage() {
  updateLabels();
  // turn_label.hidden = true;
  end_stage_btn.hidden = true;
  stage_label.innerHTML = "Game Over!";
  if (no_treasures == 0) {
    document.onkeydown = null;
    displayWinner();
    return;
  } else if (isHero_alive == false) {
    turn_label.innerHTML = "Game Over, You Died!";
    // showMessage("Game Over, You Died!");
    return;
  }
  var proceed = confirm("Are you sure you want to end the game?");
  if (proceed) {
    // remove user keyboard input
    document.onkeydown = null;
  }
  displayWinner();
}
 
function displayWinner() {
  if (hero_score > total_killer_score) {
    showMessage("You Won!!!");
  } else if (hero_score < total_killer_score) {
    showMessage("Sorry! The Killer Won");
  } else {
    showMessage("It's a Draw!!!");
  }
}
 
// Validation
// -------------------------------------------------------------------------
function isPromptInputValid(input) {
  if (parseInt(input) >= 1 && parseInt(input) <= 9) {
    return true;
  }
  if (input == "o" || input == "k") {
    return true;
  }
  if (input == "h") {
    if (no_heros == 0) {
      return true;
    }
    return false;
  }
  return false;
}
 
function isPlayersTurn() {
  if (no_turns % 2 == 0) {
    return true;
  }
  return false;
}
 
function isMoveValid(x, y) {
  // check if out of bounds
  if (x >= 0 && x <= 9 && y >= 0 && y <= 9) {
    // check if obstacle
    if (getCellContent(x, y).innerHTML != "o") {
      return true;
    } else {
      showMessage("Oops! there is an obstacle there, your turn is over");
      return false;
    }
  } else {
    showMessage("Oops! that move is out of bounds, your turn is over");
    return false;
  }
}
 
function isKillerMoveValid(x, y) {
  // check if out of bounds
  if (x >= 0 && x <= 9 && y >= 0 && y <= 9) {
    // check if obstacle or killer
    if (
      getCellContent(x, y).innerHTML != "o" &&
      getCellContent(x, y).innerHTML != "k"
    ) {
      return true;
    }
  }
  return false;
}
// -------------------------------------------------------------------------
 
init();
