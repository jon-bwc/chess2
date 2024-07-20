import express from 'express'
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Game, RoomReq } from './models';

const port = 3000;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173"
    }
});

let games = new Map<string, Game>();

io.on('connection', (socket => {
    console.log(`Socket connected from ${socket.id}`);

    // Handle when player creates a new game
    socket.on('new_game', (data: RoomReq) => {
        console.log(`new_game: ${data}`);

        if (games.has(data.gameId)) {
            socket.emit('new_game', false);
        } else {
            games.set(data.gameId, new Game(data.gameId));

            // Add this socket to a room name
            socket.join(data.gameId);

            console.log(games.get(data.gameId)?.chess.ascii());
            socket.emit('new_game', true);
        }
    });

    socket.on('join_game', (data: RoomReq) => {
        const { username, gameId } = data;
        console.log(data);
        
        // TODO Check if game exists

        // Add this socket to a room name
        socket.join(gameId);
        const __createdtime__ = Date.now();

        // Send to everyone in the room, apart from the user that joined
        socket.to(gameId).emit('new_game', "everyone");

        // Send to user that just joined
        socket.emit('new_game', "user");

        console.log(__createdtime__)
    });

    // Client to Server events
    // socket.on('make_move', (data) => {});

    // socket.on('player_offer', (data) => {});

    // Server to Client events
    // socket.emit('next_turn', (data) => {});

    // Disconnect
    socket.on("disconnect", (reason) => {

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