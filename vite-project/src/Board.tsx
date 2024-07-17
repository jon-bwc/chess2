import { useState } from "react";

class cbLoc {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  toString(): string {
    const letterArray = 'abcdefgh';
    return `${letterArray[this.x]}${this.y}`;
  }
}

class cbSquare {
  isValid: boolean = false;
  loc: cbLoc;

  constructor(x: number, y: number) {
    this.loc = new cbLoc(x, y);
  }
}

export default function Board() {
  const numRows = 8;
  const numCols = 8;

  const initCBBoard : cbSquare[][] = new Array<cbSquare[]>(numRows);

  for(let i = 0; i < numRows; i++) {
    initCBBoard[i] = new Array<cbSquare>(numCols);
    for(let j = 0; j < numCols; j++) {
      initCBBoard[i][j] = new cbSquare(i, j);
    }
  }

  const [cbBoard, setCBBoard] = useState(initCBBoard)

  return (
      <>
          { cbBoard.map((row) => row.map((square, i) => <div key={i}>{square.loc.toString()}</div>)) }
      </>
  );
}