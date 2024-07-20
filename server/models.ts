import { Chess } from 'chess.js';

export class RoomReq {
    username: string;
    gameId: string;

    constructor(username: string, gameId: string) {
        this.username = username;
        this.gameId = gameId;
    }
}

export class Player {
    id: string;
    name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}

export class Square {

}

export class Piece {
    
}

export class Game {
    id = '';
    players = [];
    chess: Chess;

    constructor(id: string) {
        this.id = id
        this.chess = new Chess()
    }
}