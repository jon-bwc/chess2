import wKingImg from './assets/wk.png'
import bKingImg from './assets/wk.png'

export const NUM_COL = 8;
export const NUM_ROW = 8;
export const LETTER_ARRAY = 'abcdefgh';

export enum ChessColor {
    W = "white",
    B = "black"
}

export class CSquare {
    piece: CPiece | null = null;
    // cords from the top left
    row: number;
    col: number;
    playerColor: ChessColor = ChessColor.W;
  
    constructor(row: number, col: number, color?: ChessColor) {
        this.row = row;
        this.col = col;
    
        if (color !== undefined) {
            this.playerColor = color;
        }
    }
  
    getFile() : string {
        if(this.playerColor == ChessColor.W) {
            return LETTER_ARRAY[this.col];
        }
        return LETTER_ARRAY[NUM_COL - this.col - 1]; 
    }
  
    getRank() : number {
        if(this.playerColor == ChessColor.W) {
            return NUM_ROW - this.row;
        }
        return this.row + 1;
    }
}

export class CPiece {
    row: number;
    col: number;
    color: ChessColor;
    wImage: string = '';
    bImage: string = '';

    constructor(row: number, col: number, color: ChessColor) {
        this.row = row;
        this.col = col;
        this.color = color;
    }

    move(row: number, col: number, board: CSquare[][]): CSquare[][] {
        return board
    }

    // Trigger capture animation
    capture(): void {}
}

export class King extends CPiece {
    wImage = wKingImg;
    bImage = bKingImg;

    constructor(row: number, col: number, color: ChessColor) {
        super(row, col, color)
    }

    move(row: number, col: number, board: CSquare[][]): CSquare[][] {
        const fileDiff = Math.abs(row - this.row);
        const rankDiff = Math.abs(col - this.col);

        if ((fileDiff !== 0 || rankDiff !== 0) && (fileDiff <= 1 && rankDiff <= 1)) {
            // TODO add capture logic

            let square = board[this.row][this.col];
            let targetSquare = board[row][col];

            square.piece = null;

            this.row = row;
            this.col = col;
            targetSquare.piece = this;
        }
        return [...board]
    }
}