import { COORDINATES_MAP, PLAYERS, STEP_LENGTH } from "./constants.js";

const playerBases = document.querySelector(".player-bases"),
  playerPieces = document.querySelector(".player-pieces"),
  diceButtonElement = document.querySelector("#dice-btn"),
  activePlayer = document.querySelector("#active-player");

for (let i = 0; i < 4; i++) {
  playerBases.innerHTML += `<div class="player-base" player-id="${
    ["blue", "green", "yellow", "red"][i]
  }"></div>`;
}

for (let i = 0; i < PLAYERS.length; i++) {
  playerPieces.innerHTML += `<div class="player-piece" player-id="${PLAYERS[i]}" piece="0"></div>
<div class="player-piece" player-id="${PLAYERS[i]}" piece="1"></div>
<div class="player-piece" player-id="${PLAYERS[i]}" piece="2"></div>
<div class="player-piece" player-id="${PLAYERS[i]}" piece="3"></div>`;
}

export const playerPiecesElements = {
  blue: document.querySelectorAll('[player-id="blue"].player-piece'),
  green: document.querySelectorAll('[player-id="green"].player-piece'),
  yellow: document.querySelectorAll('[player-id="yellow"].player-piece'),
  red: document.querySelectorAll('[player-id="red"].player-piece'),
};

export class UI {
  static listenDiceClick(callback) {
    diceButtonElement.addEventListener("click", callback);
  }

  static listenResetClick(callback) {
    document
      .querySelector("button#reset-btn")
      .addEventListener("click", callback);
  }

  static listenPieceClick(callback) {
    document
      .querySelector(".player-pieces")
      .addEventListener("click", callback);
  }

  /**
   *
   * @param {string} player
   * @param {Number} piece
   * @param {Number} newPosition
   */
  static setPiecePosition(player, piece, newPosition) {
    if (!playerPiecesElements[player] || !playerPiecesElements[player][piece]) {
      return;
    }

    const [x, y] = COORDINATES_MAP[newPosition];

    const pieceElement = playerPiecesElements[player][piece];
    pieceElement.style.top = y * STEP_LENGTH + "%";
    pieceElement.style.left = x * STEP_LENGTH + "%";
  }

  static setTurn(index) {
    if (index < 0 || index >= PLAYERS.length) {
      return;
    }

    const player = PLAYERS[index];
    const activePlayerBase = document.querySelector(".player-base.highlight");
    if (activePlayerBase) {
      activePlayerBase.classList.remove("highlight");
    }
    // highlight
    document
      .querySelector(`[player-id="${player}"].player-base`)
      .classList.add("highlight");
    activePlayer.innerHTML = player;
  }

  static enableDice() {
    diceButtonElement.removeAttribute("disabled");
  }

  static disableDice() {
    diceButtonElement.setAttribute("disabled", "");
  }

  /**
   *
   * @param {string} player
   * @param {Number[]} pieces
   */
  static highlightPieces(player, pieces) {
    pieces.forEach((piece) => {
      const pieceElement = playerPiecesElements[player][piece];
      pieceElement.classList.add("highlight");
    });
  }

  static unhighlightPieces() {
    document.querySelectorAll(".player-piece.highlight").forEach((ele) => {
      ele.classList.remove("highlight");
    });
  }

  static setDiceValue(value) {
    document.querySelector(".dice-value").src = `./ludo/${value}.png`;
  }
}
