import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  return (
    <>
      
    </>
  )
}

let alphabet = 'abcdefgh'
let board = document.getElementById('board')
board.innerHTML += `<div class='rank'>${'<div class="square"></div>'.repeat(8)}</div>`.repeat(8)
let boardMap = Array(...board.children).map(rank => rank.children)

for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 8; j++) {
    boardMap[i][j].classList.add((i + j) % 2 ? 'dark-square' : 'light-square')
  }
}

function piecePosition(i, j) {
  return `scale(${j * 12.5}%, ${i * 12.5}%)`
}

export default App