import { useState, useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Board from './Board'

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
  const [count, setCount] = useState(0)
  const [user, setUser] = useState()
  
  const linkElementRef = useRef();

  let badCount: number = 0;

  const initBoard: cSquare[][] = new Array<cSquare[]>(NUM_ROW);
  for(let i = 0; i < NUM_ROW; i++) {
    initBoard[i] = new Array<cSquare>(NUM_COL);
    for(let j = 0; j < NUM_COL; j++) {
      initBoard[i][j] = new cSquare(i, j);
    }
  }
  const [board, setBoard] = useState(initBoard)

  useEffect(() => {
    
  }, [])

  function handleClick() {
    setCount((c) => c + 1);
    badCount++;
  }

  function Board() {
    return (
        <div id="board">
            { board.map((row) => row.map((square, i) => <div key={i}>{square.getFile()}{square.getRank()}</div>)) }
        </div>
    );
  }

  return (
    <>
      <Board />

      <div>
        <a href="https://vitejs.dev" target="_blank" ref={linkElementRef}>
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>

        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h1>Vite + React</h1>

      <div id="x" className="card">
        <button onClick={handleClick}>
          {`count:${count} badcount:${badCount}`}
        </button>

        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

