import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const fruits = ["Apple", "Banana", "Cherry", "Lemon"] as const;
type Fruit = typeof fruits[number];

function getRandomFruit(): Fruit {
  return fruits[Math.floor(Math.random() * fruits.length)];
}

export default function SlotMachine() {
  const [grid, setGrid] = useState<Fruit[][]>(Array.from({ length: 3 }, () => Array.from({ length: 3 }, getRandomFruit)));
  const [spinning, setSpinning] = useState(false);
  const [win, setWin] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setWin(null);
    let count = 0;
    intervalRef.current = setInterval(() => {
      setGrid(prev => {
        const newGrid = prev.map(row => [...row]);
        // shift each column down
        for (let col = 0; col < 3; col++) {
          const newCol = [getRandomFruit(), ...prev.slice(0, 2).map(row => row[col])];
          for (let row = 0; row < 3; row++) {
            newGrid[row][col] = newCol[row];
          }
        }
        return newGrid;
      });
      count += 200;
      if (count >= 2000) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setSpinning(false);
        // check win
        const rows = grid;
        const cols = Array.from({ length: 3 }, (_, i) => [grid[0][i], grid[1][i], grid[2][i]]);
        const allLines = [...rows, ...cols];
        for (const line of allLines) {
          if (line.every(f => f === line[0])) {
            setWin(`You won with ${line[0]}!`);
            break;
          }
        }
      }
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-2">
        {grid.flat().map((fruit, idx) => (
          <div key={idx} className="w-16 h-16 flex items-center justify-center border rounded">
            <img src={`/${fruit.toLowerCase()}.png`} alt={fruit} className="w-12 h-12" />
          </div>
        ))}
      </div>
      <Button onClick={spin} disabled={spinning} variant="outline">
        {spinning ? "Spinning..." : "Spin"}
      </Button>
      {win && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-xl font-semibold">{win}</span>
          <Share text={`I just ${win} in the Fruit Slot Machine! ${url}`} />
        </div>
      )}
    </div>
  );
}
