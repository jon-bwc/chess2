import express from 'express'
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const port = 3000;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173"
    }
});

io.on('connection', (socket => {
    console.log(`Socket connected from ${socket.id}`);

    // Handle when player creates or joins an existing game
    socket.on('join_game', (data) => {
        const { username, gamename } = data;
        console.log(data);
        
        // TODO Check if game exists

        // Add this socket to a room name
        socket.join(gamename);
        const __createdtime__ = Date.now();

        // Send to everyone in the room, apart from the user that joined
        socket.to(gamename).emit('new_game', "everyone");

        // Send to user that just joined
        socket.emit('new_game', "user");

        console.log(__createdtime__)
    });

    // Client to Server events
    socket.on('make_move', (data) => {

    });

    socket.on('player_offer', (data) => {

    });

    // Server to Client events
    socket.emit('next_turn', (data) => {

    });

    // Disconnect 
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