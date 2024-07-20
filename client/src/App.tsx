import { useState, useRef, useEffect, ChangeEvent } from 'react'
import './App.css'
import { CPiece, CSquare, King, ServerService } from './Chess';
import { ChessColor, NUM_COL, NUM_ROW } from '../../chess-models';
import io from 'socket.io-client'

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
  const [isWhite, setWhite] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<CPiece | null>(null)
  const serverService = useRef<ServerService>(new ServerService());

  const initBoard: CSquare[][] = new Array<CSquare[]>(NUM_ROW);
  const [isValidBoard, setIsValidBoard] = useState(new Array(NUM_COL * NUM_ROW).fill(false));

  useEffect(() => {
    let socket = serverService.current.socket;
    socket.on('login', (success) => {
      console.log(data);
    });

    // Remove event listener on component unmount
    return () => { socket.off('login') };
  }, [serverService.current.socket]);

  useEffect(() => {
    let socket = serverService.current.socket;
    socket.on('new_game', (data) => {
      console.log(data);
    });

    // Remove event listener on component unmount
    return () => { socket.off('new_game') };
  }, [serverService.current.socket]);

  
  useEffect(() => {
    // TODO update board when we get updates from server
    // call setBoard
  }, [serverService.current.socket])

  // Array Setup
  for(let i = 0; i < NUM_ROW; i++) {
    initBoard[i] = new Array<CSquare>(NUM_COL);
    for(let j = 0; j < NUM_COL; j++) {
      initBoard[i][j] = new CSquare(i, j, ChessColor.W);
    }
  }
  const [board, setBoard] = useState(initBoard)

  function handleAddKing() {
    const newBoard = [...board]
    newBoard[0][0].piece = new King(0,0, ChessColor.W);
    setBoard(newBoard);
  }

  function handleSquareClick(square: CSquare) {
    if (selectedPiece === null && square.piece !== null) {
      setSelectedPiece(square.piece)
      // Call piece valid function to highlight valid squares
      let newIsValidBoard = square.piece.valid([...isValidBoard]);
      if (newIsValidBoard !== null) {
        setIsValidBoard(newIsValidBoard);
      }
    } else if (selectedPiece !== null) {
      // Call piece move function to handle capture logic
      let newBoard = selectedPiece.move(square.row, square.col, [...board]);
      if (newBoard !== null) {
        setBoard(newBoard);
        setSelectedPiece(null);
        setIsValidBoard(new Array(NUM_COL * NUM_ROW).fill(false))
      }
    }
  }

  function Board() {
    function getRank(row: number) {
      if (isWhite) {
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

    return (
      <div id="board">
          { board.map((row, i) => {
              return (
                <div key={getRank(i)} className="rank"> {
                  row.map((square, j) => {
                    return (
                      <div 
                        key={square.getFile()+square.getRank()}
                        className={getSquareClass(square)}
                        onClick={() => handleSquareClick(square)}
                      >
                        {(isValidBoard[(i * NUM_ROW) + j]) ? square.getFile()+square.getRank():''}
                        <img hidden={square.piece === null} src={square.piece?.color === ChessColor.W? square.piece?.wImage: square.piece?.bImage}></img>
                      </div>
                    )
                  }
                    
                  )
                } </div>
              )
            }
          )}
      </div>
    );
  }

  function Sidebar() {
    const [username, setUsername] = useState('');
    const [roomId, setRoomId] = useState('');
    const [side, setSide] = useState<ChessColor>(ChessColor.N);

    return(
      <>
        <h1>Chess 2</h1>
        <button onClick={handleAddKing}>Add King</button>
        <div>
          <input 
            type='text'
            placeholder='username'
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                serverService.current.login(username);
              }
            }}
          />
        </div>
        <input type="text" placeholder='room id'value={roomId} onChange={(event: ChangeEvent<HTMLInputElement>)=>{
          setRoomId(event.target.value);
        }}/>
        <div onChange={(e) => {
            setSide(e.target.value);
        }}>
          <input type="radio" value={ChessColor.W} checked={side === ChessColor.W}/> White
          <input type="radio" value={ChessColor.B} checked={side === ChessColor.B}/> Black
          <input type="radio" value={ChessColor.N} checked={side === ChessColor.N}/> None
        </div>
        <div>
          <button onClick={() => {
            serverService.current.newGame(roomId, side)
          }}> Create Game</button>
          <button onClick={() => {
            serverService.current.joinGame(roomId, side)
          }}> Join Game</button>
        </div>
        
      </>
    )
  }

  return (
    <>
      <div className="content">
        <div className ="board-cont">
          <Board />
        </div>
        <div className='sidebar'>
          <Sidebar />
        </div>
      </div>
    </>
  )
}

