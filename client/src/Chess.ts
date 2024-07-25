import wKingImg from './assets/wk.png'
import bKingImg from './assets/bk.png'
import wQueenImg from './assets/wq.png'
import bQueenImg from './assets/bq.png'
import wBishopImg from './assets/wb.png'
import bBishopImg from './assets/bb.png'
import wKnightImg from './assets/wn.png'
import bKnightImg from './assets/bn.png'
import wPawnImg from './assets/wp.png'
import bPawnImg from './assets/bp.png'
import wRookImg from './assets/wr.png'
import bRookImg from './assets/br.png'
import { io, Socket } from 'socket.io-client';
import { ChessColor, LETTER_ARRAY, NUM_COL, NUM_ROW, RoomReq, ChessType } from './chess-models'

export class ServerService {
    socket: Socket;

    constructor () {
        this.socket = io('http://localhost:3000');
    }

    login(username: string) {
        this.socket.emit('login', username);
    }

    newGame(gameId: string, side: ChessColor) {
        let req = new RoomReq(gameId, side);
        this.socket.emit('new_game', req);
    }

    joinGame(gameId: string, side: ChessColor) {
        let req = new RoomReq(gameId, side);
        this.socket.emit('join_game', req);
    }
}

export class CSquare {
    piece: CPiece | null = null;
    // Cords from the top left
    // Assume bottom left is A1
    row: number;
    col: number;

    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    getFile() : string {
        return LETTER_ARRAY[this.col];
    }

    getRank() : number {
        return NUM_ROW - this.row;
    }

    getChessCord() : string {
        return this.getFile() + this.getRank().toString();
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

    isValidMove(targetRow: number, targetCol:number) {
        if (targetRow >= 0 && targetRow < NUM_ROW && targetCol >= 0 &&  targetCol < NUM_COL) {
            return true;
        }
        return false;
    }

    move(row: number, col: number, board: CSquare[][]): CSquare[][] | null {
        if (this.isValidMove(row, col)) {

            let square = board[this.row][this.col];
            let targetSquare = board[row][col];

            // TODO add capture logic
            if (targetSquare.piece !== null) {
                if (targetSquare.piece.color === this.color) {
                    return null;
                }
            }

            square.piece = null;

            this.row = row;
            this.col = col;
            targetSquare.piece = this;
            return board
        }
        return null
    }

    valid(isValidBoard: boolean[]): boolean[] | null {
        return null
    }

    // Trigger capture animation
    capture(): void {}
}

export function getNewPiece(row: number, col: number, type: string, color: ChessColor): CPiece {
    switch (type) {
        case ChessType.B:
            return new Bishop(row, col, color);
        case ChessType.K:
            return new King(row, col, color);
        case ChessType.N:
            return new Knight(row, col, color);
        case ChessType.P:
            return new Pawn(row, col, color);
        case ChessType.Q:
            return new Queen(row, col, color);
        case ChessType.R:
            return new Rook(row, col, color);
        default:
            return new CPiece(row, col, color);
    }
}

export class King extends CPiece {
    wImage = wKingImg;
    bImage = bKingImg;

    constructor(row: number, col: number, color: ChessColor) {
        super(row, col, color)
    }

    isValidMove(targetRow: number, targetCol:number) {
        if (targetRow >= 0 && targetRow < NUM_ROW && targetCol >= 0 &&  targetCol < NUM_COL) {
            const fileDiff = Math.abs(targetRow - this.row);
            const rankDiff = Math.abs(targetCol - this.col);
            
            if ((fileDiff !== 0 || rankDiff !== 0) && (fileDiff <= 1 && rankDiff <= 1)) {
                return true;
            }
        }
        return false;
    }

    valid(isValidBoard: boolean[]): boolean[] {
        // TODO add check logic
        let squaresToCheck = [
            {row: this.row - 1, col: this.col},
            {row: this.row - 1, col: this.col + 1},
            {row: this.row - 1, col: this.col - 1},
            {row: this.row + 1, col: this.col},
            {row: this.row + 1, col: this.col + 1},
            {row: this.row + 1, col: this.col - 1},
            {row: this.row, col: this.col + 1},
            {row: this.row, col: this.col - 1}
        ]

        squaresToCheck.forEach((cord) => {
            if (this.isValidMove(cord.row, cord.col)) {
                isValidBoard[(cord.row * NUM_ROW) + cord.col] = true;
            }
        });
        return isValidBoard;
    }
}

export class Queen extends CPiece {
    wImage = wQueenImg;
    bImage = bQueenImg;

    constructor(row: number, col: number, color: ChessColor) {
        super(row, col, color)
    }

    isValidMove(targetRow: number, targetCol:number) {
        if (targetRow >= 0 && targetRow < NUM_ROW && targetCol >= 0 &&  targetCol < NUM_COL) {
            const fileDiff = Math.abs(targetRow - this.row);
            const rankDiff = Math.abs(targetCol - this.col);
            
            if ((fileDiff !== 0 || rankDiff !== 0) && ((fileDiff === rankDiff) || (fileDiff <= 1 && rankDiff <= 1)) || (fileDiff > 0 && rankDiff === 0) || (fileDiff === 0 && rankDiff > 0)) {
                return true;
            }
        }
        return false;
    }
}

export class Bishop extends CPiece {
    wImage = wBishopImg;
    bImage = bBishopImg;

    constructor(row: number, col: number, color: ChessColor) {
        super(row, col, color)
    }

    isValidMove(targetRow: number, targetCol:number) {
        if (targetRow >= 0 && targetRow < NUM_ROW && targetCol >= 0 &&  targetCol < NUM_COL) {
            const fileDiff = Math.abs(targetRow - this.row);
            const rankDiff = Math.abs(targetCol - this.col);
            
            if (fileDiff !== 0 && (fileDiff === rankDiff)) {
                return true;
            }
        }
        return false;
    }
}

export class Knight extends CPiece {
    wImage = wKnightImg;
    bImage = bKnightImg;

    constructor(row: number, col: number, color: ChessColor) {
        super(row, col, color)
    }

    isValidMove(targetRow: number, targetCol:number) {
        if (targetRow >= 0 && targetRow < NUM_ROW && targetCol >= 0 &&  targetCol < NUM_COL) {
            const fileDiff = Math.abs(targetRow - this.row);
            const rankDiff = Math.abs(targetCol - this.col);
            
            if ((fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff ===2)) {
                return true;
            }
        }
        return false;
    }
}

export class Pawn extends CPiece {
    wImage = wPawnImg;
    bImage = bPawnImg;
    isFirstMove = true;

    constructor(row: number, col: number, color: ChessColor) {
        super(row, col, color)
    }

    isValidMove(targetRow: number, targetCol:number) {
        if (targetRow >= 0 && targetRow < NUM_ROW && targetCol >= 0 &&  targetCol < NUM_COL) {
            const rawFileDiff = targetRow - this.row;
            const fileDiff = Math.abs(rawFileDiff);
            const rankDiff = Math.abs(targetCol - this.col);
            
            if ((this.color === ChessColor.W && rawFileDiff < 0) || (this.color === ChessColor.B && rawFileDiff > 0)) {
                if ((this.isFirstMove && rankDiff === 0 && fileDiff <= 2) || (fileDiff === 1 && rankDiff <= 1)) {
                    this.isFirstMove = false;
                    return true;
                }
            }
        }
        return false;
    }
}

export class Rook extends CPiece {
    wImage = wRookImg;
    bImage = bRookImg;

    constructor(row: number, col: number, color: ChessColor) {
        super(row, col, color)
    }

    isValidMove(targetRow: number, targetCol:number) {
        if (targetRow >= 0 && targetRow < NUM_ROW && targetCol >= 0 &&  targetCol < NUM_COL) {
            const fileDiff = Math.abs(targetRow - this.row);
            const rankDiff = Math.abs(targetCol - this.col);
            
            if ((fileDiff > 0 && rankDiff === 0) || (fileDiff === 0 && rankDiff > 0)) {
                return true;
            }
        }
        return false;
    }
}