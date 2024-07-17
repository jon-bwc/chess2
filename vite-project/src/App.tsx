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

export default function App() {
  const [count, setCount] = useState(0)
  const [user, setUser] = useState()
  const linkElementRef = useRef();

  let badCount: number = 0;

  useEffect(() => {
    // TODO Install users
  }, [])

  function handleClick() {
    setCount((c) => c + 1);
    badCount++;
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

