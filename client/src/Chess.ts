import wKingImg from './assets/wk.png'
import bKingImg from './assets/bk.png'
import wQueenImg from './assets/wq.png'
import bQueenImg from './assets/bq.png'
import { io, Socket } from 'socket.io-client';
import { ChessColor, LETTER_ARRAY, NUM_COL, NUM_ROW, RoomReq } from '../../chess-models.ts'

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

    move(row: number, col: number, board: CSquare[][]): CSquare[][] | null {
        return null
    }

    valid(isValidBoard: boolean[]): boolean[] | null {
        return null
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

    move(row: number, col: number, board: CSquare[][]): CSquare[][] | null {
        if (this.isValidMove(row, col)) {
            // TODO add capture logic

            let square = board[this.row][this.col];
            let targetSquare = board[row][col];

            square.piece = null;

            this.row = row;
            this.col = col;
            targetSquare.piece = this;
            return board
        }
        return null
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
            
            if ((fileDiff !== 0 || rankDiff !== 0) && (fileDiff === rankDiff)) {
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

    move(row: number, col: number, board: CSquare[][]): CSquare[][] | null {
        if (this.isValidMove(row, col)) {
            // TODO add capture logic

            let square = board[this.row][this.col];
            let targetSquare = board[row][col];

            square.piece = null;

            this.row = row;
            this.col = col;
            targetSquare.piece = this;
            return board
        }
        return null
    }
}