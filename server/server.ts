import express from 'express'
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { ChessColor, RoomReq } from './chess-models';
import { Chess } from 'chess.js';

const port = 3000;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    connectionStateRecovery: {
        maxDisconnectionDuration: Infinity,
        // whether to skip middlewares upon successful recovery
        skipMiddlewares: true,
    },
    cors: {
        origin: "http://localhost:5173"
    }
});

let games = new Map<string, Game>();
let users = new Map<string, string>();
let usernames = new Set<string>();

class Player {
    username: string;
    side: ChessColor | null;

    constructor(username: string, side: ChessColor | null) {
        this.username = username;
        this.side = side;
    }
}

class Game {
    id = '';
    players: Player[] = [];
    chess: Chess;

    constructor(id: string) {
        this.id = id
        this.chess = new Chess()
    }
}

io.on('connection', (socket => {
    console.log(`Socket connected from ${socket.id}`);

    socket.on('login', (username: string) => {
        if(users.has(socket.id) || usernames.has(username)) {
            console.log(`Login failed: ${username}`)
            socket.emit('login_result', false);
        } else {
            console.log(`Login: ${username}`)
            users.set(socket.id, username);
            usernames.add(username);
            socket.emit('login_result', true);
        }
    });

    // Handle when player creates a new game
    socket.on('new_game', (roomReq: RoomReq) => {
        console.log(`new_game: ${roomReq.gameId}`);

        let username = users.get(socket.id);
        if(username === undefined) {
            socket.emit('error', 'User missing id');
            return;
        }

        if (games.has(roomReq.gameId)) {
            socket.emit('new_game_result', false);
        } else {
            let newGame = new Game(roomReq.gameId);
            newGame.players.push(new Player(username, roomReq.side));

            games.set(roomReq.gameId, newGame);

            // Add this socket to a room name
            socket.join(roomReq.gameId);

            console.log(newGame.chess.ascii());
            socket.emit('new_game_result', true);
        }
    });

    socket.on('join_game', (roomReq: RoomReq) => {
        console.log(`join_game: ${roomReq.gameId}`);

        let username = users.get(socket.id);
        if(username === undefined) {
            socket.emit('error', 'User missing id');
            return;
        }

        // TODO Check if game exists
        let game = games.get(roomReq.gameId);
        if (game !== undefined) {
            game.players.push(new Player(username, roomReq.side));

            console.log(games.get(roomReq.gameId)?.players);

            // Add this socket to the room name
            socket.join(roomReq.gameId);
            // Send to user that just joined
            socket.emit('join_game_result', true);3
            // Send to everyone in the room
            io.to(roomReq.gameId).emit('game_start', game.chess.board());
        } else {
            console.log('room not found');
            socket.emit('join_game_result', false);
        }
    });

    socket.on('make_move', (data) => {
        console.log(data)

        let game = games.get(data.gameId);
        if (game !== undefined) {
            //TODO check if player is in this game
            try {
                game.chess.move({from:data.from, to:data.to})

                // TODO handle promotion

                // Send new board state to both players
                io.to(data.gameId).emit('next_turn', game.chess.board)
            } catch {
                // Move failed
                socket.emit('move_failed')
            }
        }
    });

    // socket.on('player_offer', (data) => {});

    // Server to Client events
    // socket.emit('next_turn', (data) => {});

    // Disconnect
    socket.on("disconnect", (reason) => {
        console.log(`Socket disconnected from ${socket.id}`);
        if (users.has(socket.id)) {
            usernames.delete(users.get(socket.id)!);
            users.delete(socket.id)
        }
    });
}));

app.use(cors());

app.get('/', (req, res) => {
    res.send('Chess server');
});

app.get('/test', (req, res) => {
    res.send('test server');
});

httpServer.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});