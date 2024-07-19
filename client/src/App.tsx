import { useState, useRef, useEffect } from 'react'
import './App.css'
import { ChessColor, CPiece, CSquare, King, NUM_COL, NUM_ROW } from './Chess';
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
  const [count, setCount] = useState(0);
  const [user, setUser] = useState();
  const [isWhite, setWhite] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<CPiece | null>(null)
  const initBoard: CSquare[][] = new Array<CSquare[]>(NUM_ROW);
  const [isValidBoard, setIsValidBoard] = useState(new Array(NUM_COL * NUM_ROW).fill(false));

  // Socket.io setup
  const socket = io('http://localhost:3000', { autoConnect: false });
  socket.connect()

  socket.emit('join_game', {username:'user', gamename:'test_game'});

  useEffect(() => {
    socket.on('new_game', (data) => {
      console.log(data);
    });

    // Remove event listener on component unmount
    return () => { socket.off('new_game') };
  }, [socket]);

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

  useEffect(() => {
    // TODO update board when we get updates from server
    // call setBoard
  }, [board])

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

  return (
    <>
      <div className="content">
        <div className ="board-cont">
          <Board />
        </div>
        <div className="sidebar">
          <h1>Chess 2</h1>
          <button onClick={handleAddKing}>Add King</button>
          <div></div>
        </div>
      </div>
    </>
  )
}

