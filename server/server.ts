import express from 'express'
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { ChessColor, MoveReq, RoomReq, Player, Game, GameData } from './models';
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
let players = new Map<string, Player>();
let usernames = new Set<string>();

io.on('connection', (socket => {
    console.log(`Socket connected from ${socket.id}`);

    socket.on('login', (username: string) => {
        if(players.has(socket.id) || usernames.has(username)) {
            console.log(`Login failed: ${username}`)
            socket.emit('login_result', false);
        } else {
            console.log(`Login: ${username}`)
            players.set(socket.id, new Player(socket.id, username));
            usernames.add(username)
            socket.emit('login_result', true);
        }
    });

    // Handle when player creates a new game
    socket.on('new_game', (roomReq: RoomReq) => {
        console.log(`[new_game]: ${roomReq.gameId}`);

        let player = players.get(socket.id);
        if(player === undefined) {
            console.log('[new_game]: Invalid user');
            socket.emit('error', 'Invalid user');
            return;
        }

        if (games.has(roomReq.gameId)) {
            console.log('[new_game]: Existing room');
            socket.emit('new_game_result', false);
        } else {
            let newGame = new Game(roomReq.gameId);

            // TODO Add side logic
            player.addGame(roomReq.gameId, ChessColor.W);
            newGame.playerIds.push(player.id);

            games.set(roomReq.gameId, newGame);

            // Add this socket to a room name
            socket.join(roomReq.gameId);

            console.log('[new_game]: Room created');
            socket.emit('new_game_result', true);
        }
    });

    socket.on('join_game', (roomReq: RoomReq) => {
        console.log(`[join_game]: ${roomReq.gameId}`);

        let player = players.get(socket.id);
        if(player === undefined) {
            console.log('[join_game]: Invalid player');
            socket.emit('error', 'Invalid player');
            return;
        }

        // TODO Check if game exists
        let game = games.get(roomReq.gameId);
        if (game !== undefined) {
            if (game.playerIds.length >= 2) {
                console.log('[join_game]: Room full');
                socket.emit('join_game_result', false);
            } else if (players.has(game.playerIds[0])) {
                // TODO add side logic
                player.addGame(roomReq.gameId, ChessColor.B)
                let opponent = players.get(game.playerIds[0])!;
                game.playerIds.push(player.id);

                console.log('[join_game]: Creating room:');
                games.get(roomReq.gameId)?.playerIds.forEach(element => {
                    console.log('[join_game]: '+ element);
                });

                // TODO handle side logic
                // Currently creator is white, joiner is black

                // Add this socket to the room name
                socket.join(roomReq.gameId);
                // Send to user that just joined
                socket.emit('join_game_result', true);
                // Send to everyone in the room
                io.to(roomReq.gameId).emit('game_start', new GameData(game, opponent.username, player.username));
            }
        } else {
            console.log('[join_game]: Room not found');
            socket.emit('join_game_result', false);
        }
    });

    socket.on('move', (moveReq: MoveReq) => {
        let player = players.get(socket.id);
        if(player === undefined || player.gameId === null) {
            socket.emit('error', 'Invalid player or game');
            return;
        }

        let game = games.get(player.gameId);
        if (game !== undefined) {
            console.log(`Move ${moveReq.from} to ${moveReq.to}`)
            //TODO check if player is in this game
            try {
                game.chess.move({from:moveReq.from, to:moveReq.to})

                // TODO handle promotion

                // Send new board state to both players
                io.to(game.id).emit('next_turn', game.chess.board)
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
        if (players.has(socket.id)) {
            // Handle game disconnect
            let dcPlayer = players.get(socket.id)!;
            if (dcPlayer.gameId !== null) {
                let dcGame = games.get(dcPlayer.gameId)!

                // TODO broadcast game end info
                io.to(dcGame.id).emit('game_end', {});

                // Kick everyone from socket
                io.in(dcGame.id).socketsLeave(dcGame.id);
            }

            usernames.delete(dcPlayer.username);
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