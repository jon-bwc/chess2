import { useState, useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

class user {
  name: string;
  ranking: number;

  constructor(name: string, ranking: number) {
    this.name = name;
    this.ranking = ranking;
  }
}

class cPiece {

}

class player {
  name: string;
  pieces: cPiece[];
  time: number = 10 * 60;

  constructor(name: string, pieces: cPiece[]) {
    this.name = name;
    this.pieces = pieces;
  }
}

class game {
  name: string = "test";
  id: number;
  white: player;
  black: player;

  constructor(id: number, white: player, black: player) {
    this.id = id;
    this.white = white;
    this.black = black;
  }
}

class cSquare {
  piece: cPiece | null = null;
  // cords from the top left
  row: number;
  col: number;
  isWhite: boolean = true;

  constructor(row: number, col: number, isWhite?: boolean) {
    this.row = row;
    this.col = col;

    if (isWhite !== undefined) {
      this.isWhite = isWhite;
    }
  }

  getFile() : string {
    if(this.isWhite) {
      return LETTER_ARRAY[this.col];
    }
    return LETTER_ARRAY[NUM_COL - this.col - 1]; 
  }

  getRank() : number {
    if(this.isWhite) {
      return NUM_ROW - this.row;
    }
    return this.row + 1;
  }
}

const NUM_COL = 8;
const NUM_ROW = 8;
const LETTER_ARRAY = 'abcdefgh';

export default function App() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState();
  const [isWhite, setWhite] = useState(true);

  let badCount: number = 0;
  function handleClick() {
    setCount((c) => c + 1);
    badCount++;
  }

  const initBoard: cSquare[][] = new Array<cSquare[]>(NUM_ROW);
  for(let i = 0; i < NUM_ROW; i++) {
    initBoard[i] = new Array<cSquare>(NUM_COL);
    for(let j = 0; j < NUM_COL; j++) {
      initBoard[i][j] = new cSquare(i, j, isWhite);
    }
  }
  const [board, setBoard] = useState(initBoard)

  useEffect(() => {
    // TODO update board when we get updates from server
    // call setBoard
  }, [])

  function Board() {
    function getRank(row: number) {
      if (isWhite) {
        return NUM_ROW - row;
      }
      return row + 1;
    }

    return (
      <div id="board">
          { board.map((row, i) => {
              return (
                <div key={getRank(i)} className="rank"> {
                  row.map((square, j) => 
                    <div 
                      key={square.getFile()+square.getRank()} 
                      className={'square' + ((i + j) % 2 ? ' dark-square': ' light-square')}
                    >
                      {square.getFile()+square.getRank()}
                    </div>)
                  }
                </div>
              )
            }
          )}
      </div>
    );
  }

  return (
    <>
      <h1>Chess 2</h1>

      <Board />

      <button onClick={handleClick}>
        {`count:${count} badcount:${badCount}`}
      </button>

    </>
  )
}

