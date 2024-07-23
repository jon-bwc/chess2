export const NUM_COL = 8;
export const NUM_ROW = 8;
export const LETTER_ARRAY = 'abcdefgh';

export enum ChessColor {
    W = "white",
    B = "black",
    N = "none"
}

export class RoomReq {
    gameId: string;
    side: ChessColor;

    constructor(gameId: string, side: ChessColor) {
        this.gameId = gameId;
        this.side = side;
    }
}
