import {
  BASE_POSITIONS,
  HOME_ENTRANCE,
  HOME_POSITIONS,
  PLAYERS,
  SAFE_POSITIONS,
  START_POSITIONS,
  STATE,
  TURNING_POINTS,
} from "./constants.js";
import { UI, playerPiecesElements } from "./UI.js";

export class Ludo {
  currentPositions = PLAYERS.reduce((player, color) => {
    player[color] = [];
    return player;
  }, {});

  _diceValue;
  get diceValue() {
    return this._diceValue;
  }
  set diceValue(value) {
    this._diceValue = value;

    UI.setDiceValue(value);
  }

  _turn;
  get turn() {
    return this._turn;
  }
  set turn(value) {
    this._turn = value;
    UI.setTurn(value);
  }

  _state;
  get state() {
    return this._state;
  }
  set state(value) {
    this._state = value;

    if (value === STATE.DICE_NOT_ROLLED) {
      UI.enableDice();
      UI.unhighlightPieces();
    } else {
      UI.disableDice();
    }
  }

  constructor() {
    this.listenDiceClick();
    this.listenResetClick();
    this.listenPieceClick();
    this.resetGame();
  }

  listenDiceClick() {
    UI.listenDiceClick(this.onDiceClick.bind(this));
  }

  onDiceClick() {
    this.diceValue = 1 + Math.floor(Math.random() * 6);
    this.state = STATE.DICE_ROLLED;

    this.checkForEligiblePieces();
  }

  checkForEligiblePieces() {
    const player = PLAYERS[this.turn];
    // eligible pieces of given player
    const eligiblePieces = this.getEligiblePieces(player);

    console.log(eligiblePieces);

    if (eligiblePieces.length) {
      // highlight the pieces
      UI.highlightPieces(player, eligiblePieces);

      // automate the piece
      const eligiblePiecesOnBase = eligiblePieces.filter((piece) => {
          const currentPosition = this.currentPositions[player][piece];

          return BASE_POSITIONS[player].includes(currentPosition);
        }),
        eligiblePiecePlace = this.currentPositions[player][eligiblePieces[0]],
        eligiblePiecesOnSamePlace = eligiblePieces.every((piece) => {
          this.currentPositions[player][piece] === eligiblePiecePlace;
        });

      if (
        eligiblePieces.length === 1 ||
        eligiblePiecesOnBase.length === eligiblePieces.length ||
        eligiblePiecesOnSamePlace
      )
        playerPiecesElements[player][eligiblePieces[0]].click();
    } else this.incrementTurn();
  }

  incrementTurn() {
    PLAYERS.length === 4
      ? (this.turn =
          this.turn === 0 ? 2 : this.turn === 2 ? 1 : this.turn === 1 ? 3 : 0)
      : (this.turn = this.turn === 0 ? 1 : 0);

    this.state = STATE.DICE_NOT_ROLLED;
  }

  getEligiblePieces(player) {
    return [0, 1, 2, 3].filter((piece) => {
      const currentPosition = this.currentPositions[player][piece];

      if (currentPosition === HOME_POSITIONS[player]) return false;

      if (
        BASE_POSITIONS[player].includes(currentPosition) &&
        this.diceValue !== 6
      )
        return false;

      if (
        HOME_ENTRANCE[player].includes(currentPosition) &&
        this.diceValue > HOME_POSITIONS[player] - currentPosition
      )
        return false;

      return true;
    });
  }

  listenResetClick() {
    UI.listenResetClick(this.resetGame.bind(this));
  }

  resetGame() {
    this.currentPositions = structuredClone(BASE_POSITIONS);

    PLAYERS.forEach((player) => {
      [0, 1, 2, 3].forEach((piece) => {
        this.setPiecePosition(
          player,
          piece,
          this.currentPositions[player][piece]
        );
      });
    });

    this.turn = 0;
    this.state = STATE.DICE_NOT_ROLLED;
  }

  listenPieceClick() {
    UI.listenPieceClick(this.onPieceClick.bind(this));
  }

  onPieceClick(event) {
    const target = event.target;

    if (
      !target.classList.contains("player-piece") ||
      !target.classList.contains("highlight")
    ) {
      return;
    }

    const player = target.getAttribute("player-id");
    const piece = target.getAttribute("piece");
    this.handlePieceClick(player, piece);
  }

  handlePieceClick(player, piece) {
    const currentPosition = this.currentPositions[player][piece];

    if (BASE_POSITIONS[player].includes(currentPosition)) {
      this.setPiecePosition(player, piece, START_POSITIONS[player]);
      this.state = STATE.DICE_NOT_ROLLED;
      return;
    }

    UI.unhighlightPieces();
    this.movePiece(player, piece, this.diceValue);
  }

  setPiecePosition(player, piece, newPosition) {
    this.currentPositions[player][piece] = newPosition;
    UI.setPiecePosition(player, piece, newPosition);
  }

  movePiece(player, piece, moveBy) {
    const interval = setInterval(() => {
      this.incrementPiecePosition(player, piece);
      moveBy--;
      if (moveBy === 0) {
        clearInterval(interval);
        // check if player won
        if (this.hasPlayerWon(player)) {
          alert(`Player ${player} has won!`);
          this.resetGame();
          return;
        }
        const isKill = this.checkForKill(player, piece),
          isPieceOnHome =
            this.currentPositions[player][piece] === HOME_POSITIONS[player];
        if (isKill || isPieceOnHome || this.diceValue === 6) {
          this.state = STATE.DICE_NOT_ROLLED;
          return;
        }
        if (isKill && this.diceValue === 6) {
          for (let i = 0; i < 2; i++) {
            this.state = STATE.DICE_NOT_ROLLED;
            return;
          }
        }

        this.incrementTurn();
      }
    }, 200);
  }

  checkForKill(player, piece) {
    const currentPosition = this.currentPositions[player][piece];
    const opponents = PLAYERS.filter((PLAYER) => PLAYER !== player);

    let kill = false;

    [0, 1, 2, 3].forEach((piece) => {
      opponents.map((opponent) => {
        const opponentPosition = this.currentPositions[opponent][piece];

        if (
          currentPosition === opponentPosition &&
          !SAFE_POSITIONS.includes(currentPosition)
        ) {
          this.setPiecePosition(
            opponent,
            piece,
            BASE_POSITIONS[opponent][piece]
          );
          kill = true;
        }
      });
    });

    return kill;
  }

  hasPlayerWon(player) {
    return [0, 1, 2, 3].every(
      (piece) => this.currentPositions[player][piece] === HOME_POSITIONS[player]
    );
  }

  incrementPiecePosition(player, piece) {
    this.setPiecePosition(
      player,
      piece,
      this.getIncrementedPosition(player, piece)
    );
  }

  getIncrementedPosition(player, piece) {
    const currentPosition = this.currentPositions[player][piece];

    if (currentPosition === TURNING_POINTS[player]) {
      return HOME_ENTRANCE[player][0];
    } else if (currentPosition === 51) {
      return 0;
    }
    return currentPosition + 1;
  }
}
