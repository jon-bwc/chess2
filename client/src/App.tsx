import { useState, useRef, useEffect, ChangeEvent, MutableRefObject } from 'react'
import './App.css'
import { CPiece, CSquare, getNewPiece, ServerService } from './Chess';
import { ChessColor, GameData, MoveReq, NUM_COL, NUM_ROW } from './chess-models';

class Player {
  name: string;
  pieces: CPiece[];
  time: number = 10 * 60;

  constructor(name: string, pieces: CPiece[]) {
    this.name = name;
    this.pieces = pieces;
  }
}

class Game {
  name: string = "test";
  id: number;
  white: Player;
  black: Player;

  constructor(id: number, white: Player, black: Player) {
    this.id = id;
    this.white = white;
    this.black = black;
  }
}

export default function App() {
  const serverService = useRef<ServerService>(new ServerService());
  const [username, setUsername] = useState('');
  const [gameId, setGameId] = useState('');

  return (
    <>
      <div className="content">
        <div className ="board-cont">
          <Board
            serverServiceRef={serverService}
            username={username}
            gameId={gameId}
          />
        </div>
        <div className='sidebar'>
          <Sidebar 
            serverServiceRef={serverService}
            username={username}
            onUsernameSet={(s) => setUsername(s)}
            gameId={gameId}
            onGameIdSet={(s) => setGameId(s)}
          />
        </div>
      </div>
    </>
  )
}

// :{serverServiceRef: MutableRefObject<ServerService>},{username}

function Board({serverServiceRef, username, gameId}) {
  const [playerColor, setPlayerColor] = useState(ChessColor.W);
  const [selectedPiece, setSelectedPiece] = useState<CPiece | null>(null)
  const [playerTurn, setPlayerTurn] = useState(ChessColor.W);

  // const [isValidBoard, setIsValidBoard] = useState(new Array(NUM_COL * NUM_ROW).fill(false));

  // TODO add game and disp board
  // Array Setup
  const initBoard: CSquare[][] = new Array<CSquare[]>(NUM_ROW);
  for(let i = 0; i < NUM_ROW; i++) {
    initBoard[i] = new Array<CSquare>(NUM_COL);
    for(let j = 0; j < NUM_COL; j++) {
      initBoard[i][j] = new CSquare(i, j);
    }
  }
  const [board, setBoard] = useState(initBoard);

  function chessjsToLocalBoard(chessjsBoard: {square: string;type: string;color: string;}[][]) {
    // Convert chess.js board to local board
    let newBoard = new Array<CSquare[]>(NUM_ROW);
    for(let i = 0; i < NUM_ROW; i++) {
      newBoard[i] = new Array<CSquare>(NUM_COL);
      for(let j = 0; j < NUM_COL; j++) {
        newBoard[i][j] = new CSquare(i, j);
        let s = chessjsBoard[i][j];
        if (s !== null) {
          newBoard[i][j].piece = getNewPiece(i,j,s.type,s.color as ChessColor);
        }
      }
    }
    return newBoard;
  }

  useEffect(() => {
    let socket = serverServiceRef.current.socket;

    socket.on('game_start', (result: GameData) => {
      if (result.black === username) {
        setPlayerColor(ChessColor.B);
      }
      setBoard(chessjsToLocalBoard(result.board));
    });

    socket.on('move_failed', () => {
      console.log("Move Failed!")
    });

    socket.on('next_turn', (result: GameData) => {
      console.log(result);
      setSelectedPiece(null);
      setPlayerTurn(result.turn);
      setBoard(chessjsToLocalBoard(result.board));
    });

    return () => { 
      socket.off('game_start')
      socket.off('next_turn')
    };
  }, [serverServiceRef.current.socket, username]);

  function handleSquareClick(square: CSquare) {
    if (playerColor !== playerTurn) {
      console.log('Not your turn!')
      return;
    }

    if (selectedPiece === null && square.piece !== null && square.piece.color === playerColor) {
      setSelectedPiece(square.piece)
    } else if (selectedPiece === square.piece) {
      setSelectedPiece(null)
    } else if (selectedPiece !== null) {
      if (selectedPiece.isValidMove(square.row, square.col)) {
        // Send move to server
        let moveReq = new MoveReq(board[selectedPiece.row][selectedPiece.col].getChessCord(), square.getChessCord());
        serverServiceRef.current.socket.emit('move', moveReq);
      }
    }
  }

  function getRank(row: number, color: ChessColor) {
    if (color === ChessColor.W) {
      return NUM_ROW - row;
    }
    return row + 1;
  }

  function getSquareClass(square: CSquare) {
    let className = 'square';
    if ((square.row + square.col)%2 ) {
      className += ' dark-square'
    } else {
      className += ' light-square'
    }
    if (selectedPiece?.row === square.row && selectedPiece?.col === square.col) {
      className += ' selectedSquare'
    }
    return className
  }

  function getDispBoard(): CSquare[][] {
    let dispBoard = board;
    if (playerColor === ChessColor.B) {
      dispBoard = [...board]
      dispBoard.reverse().map((row) => {row.reverse()})
    }
    return dispBoard
  }

  return (
    <div id="board">
        { getDispBoard().map((row, i) => {
            return (
              <div key={i} className="rank"> {
                row.map((square, j) => {
                  return (
                    <div 
                      key={i.toString() + ':' + j.toString()}
                      className={getSquareClass(square)}
                      onClick={() => handleSquareClick(square)}
                    >
                      {/* {(isValidBoard[(i * NUM_ROW) + j]) ? square.getFile()+square.getRank():''} */}
                      <img hidden={square.piece === null} src={square.piece?.color === ChessColor.W? square.piece?.wImage: square.piece?.bImage}></img>
                    </div>
                  )
                })
              } </div>
            )
          }
        )}
    </div>
  );
}

function Sidebar({serverServiceRef, username, onUsernameSet, gameId, onGameIdSet}) {
  const [usernameSet, setUsernameSet] = useState(false);
  const [gameIdSet, setGameIdSet] = useState(false);
  const [side, setSide] = useState<ChessColor>(ChessColor.N);

  useEffect(() => {
    let socket = serverServiceRef.current.socket;

    socket.on('login_result', (result: boolean) => {
      setUsernameSet(result);
    });

    socket.on('new_game_result', (result: boolean) => {
      setGameIdSet(result);
    })

    socket.on('join_game_result', (result: boolean) => {
      setGameIdSet(result);
    })

    // Remove event listener on component unmount
    return () => { 
      socket.off('login_result')
      socket.off('new_game_result')
      socket.off('join_game_result')
    };
  }, [serverServiceRef.current.socket]);

  function handleSideChange(e) {
    setSide(e.target.value)
  }

  return(
    <>
      <h1>Chess 2</h1>
      <br/>
      <div>
        <input 
          type='text'
          placeholder='username'
          value={username}
          disabled={usernameSet}
          onChange={(e) => {
            onUsernameSet(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              serverServiceRef.current.login(username);
            }
          }}
        />
        <button  disabled={usernameSet} onClick={() => {
          serverServiceRef.current.login(username);
        }}>Login</button>
        <button  disabled={!usernameSet} onClick={() => {
          // serverService.current.logout(username);
        }}>Logout</button>
      </div>
      <input type="text" placeholder='room id'value={gameId} disabled={gameIdSet} onChange={(event: ChangeEvent<HTMLInputElement>)=>{
        onGameIdSet(event.target.value);
      }}/>
      <div>
        <input type="radio" value={ChessColor.W} checked={side === ChessColor.W} disabled={gameIdSet} onChange={handleSideChange}/> White
        <input type="radio" value={ChessColor.B} checked={side === ChessColor.B} disabled={gameIdSet} onChange={handleSideChange}/> Black
        <input type="radio" value={ChessColor.N} checked={side === ChessColor.N} disabled={gameIdSet} onChange={handleSideChange}/> None
      </div>
      <div>
        <button  disabled={gameIdSet} onClick={() => {
          serverServiceRef.current.newGame(gameId, side)
        }}> Create Game</button>
        <button  disabled={gameIdSet} onClick={() => {
          serverServiceRef.current.joinGame(gameId, side)
        }}> Join Game</button>
      </div>
      
    </>
  )
}