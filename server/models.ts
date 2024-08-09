import { Chess, Color } from "chess.js";

export const NUM_COL = 8;
export const NUM_ROW = 8;
export const LETTER_ARRAY = 'abcdefgh';

export enum ChessColor {
    W = 'w',
    B = 'b',
    N = 'na'
}

export class Game {
    id: string;
    playerIds: string[] = [];
    white: string = '';
    black: string = '';
    chess: Chess;

    constructor(id: string) {
        this.id = id
        this.chess = new Chess()
    }

    getGameData() {
        return new GameData(this.chess, this.white, this.black);
    }
}

export class Player {
    id: string;
    username: string;
    gameId: string | null = null;
    side: ChessColor = ChessColor.N;

    constructor(id: string, username: string) {
        this.id = id;
        this.username = username;
    }

    addGame(gameId: string, side: ChessColor) {
        this.gameId = gameId;
        this.side = side;
    }
}

export class RoomReq {
    gameId: string;
    side: ChessColor;

    constructor(gameId: string, side: ChessColor) {
        this.gameId = gameId;
        this.side = side;
    }
}

export class MoveReq {
    from: string;
    to: string;

    constructor(from: string, to: string) {
        this.from = from;
        this.to = to;
    }
}

export class GameData {
    board;
    turn: Color;
    isCheck: boolean;
    isGameOver: boolean;

    constructor(chess: Chess, public white: string, public black: string) {
        this.board = chess.board();
        this.turn = chess.turn();
        this.isCheck = chess.isCheck();
        this.isGameOver = chess.isGameOver();
    }
}
