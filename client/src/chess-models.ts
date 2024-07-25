export const NUM_COL = 8;
export const NUM_ROW = 8;
export const LETTER_ARRAY = 'abcdefgh';

export enum ChessColor {
    W = 'w',
    B = 'b',
    N = 'na'
}

export enum ChessType {
    B = 'b',
    K = 'k',
    N = 'n',
    P = 'p',
    Q = 'q',
    R = 'r'
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
    constructor(
        public board: {
            square: string;
            type: string;
            color: string;
        }[][],
        public white: string,
        public black: string,
        public turn: ChessColor,
        public isCheck: boolean,
        public isGameOver: boolean
    ) {}
}