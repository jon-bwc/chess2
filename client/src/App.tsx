import { useState, useRef, useEffect } from 'react'
import './App.css'
import { ChessColor, CPiece, CSquare, King, NUM_COL, NUM_ROW } from './Chess';

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

enum BoardState {
  none,
  wait,
  move
}

export default function App() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState();
  const [isWhite, setWhite] = useState(false);

  const [boardState, setBoardState] = useState(BoardState.wait)
  const [selectedPiece, setSelectedPiece] = useState<CPiece | null>(null)

  const initBoard: CSquare[][] = new Array<CSquare[]>(NUM_ROW);
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

  // function handleMoveKing() {
  //   const newBoard = [...board]
  //   newBoard[0][0].piece = new King(0,0, ChessColor.W);
  //   setBoard(newBoard);
  // }

  useEffect(() => {
    // TODO update board when we get updates from server
    // call setBoard
  }, [board])

  function handleSquareClick(square: CSquare) {
    if (selectedPiece === null && square.piece !== null) {
      setSelectedPiece(square.piece)
      // Call piece valid function to highlight valid squares
      
    } else if (selectedPiece !== null) {
      // Call piece move function to handle capture logic
      let newBoard = selectedPiece.move(square.row, square.col, [...board]);
      if (newBoard != null) {
        setBoard(newBoard);
        setSelectedPiece(null)
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
      if(selectedPiece?.row === square.row && selectedPiece?.col === square.col) {
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
                        {/* {square.getFile()+square.getRank()} */}

                        {/* If square.piece is not null, draw the correct square.piece */}
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

