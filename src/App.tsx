import { Box, Button } from "@mui/material";
import Board from "./Components/Board";
import { useState } from "react";
import NumberButtonRow from "./Components/Buttons/NumberButtonRow";
import { Eraser, Grid2x2Check, PencilLine, Undo2 } from "lucide-react";

function App() {
  const [selectMultipleCells, setSelectMultipleCells] = useState(false);
  const [candidateMode, setCandidateMode] = useState(false);
  const [cells, setCells] = useState<
    {
      row: number;
      cell: number;
      value: number | null;
      candidates: number[];
      selected: boolean;
    }[]
  >(addCells);

  const [cellHistory, setCellHistory] = useState<(typeof cells)[]>([]);
  return (
    <Box className="screen-container">
      <Board cells={cells} handleCellClicked={handleCellClicked}></Board>
      <Box className="icon-row">
        <Eraser onClick={() => handleClearSelectedCellsClicked()} />

        <Grid2x2Check onClick={() => handleSelectModeClicked()} />

        <Undo2 onClick={() => handleUndoClick()} />

        <PencilLine onClick={() => handleCandidateModeClicked()} />
      </Box>
      <NumberButtonRow
        handleNumberButtonClicked={handleNumberButtonClicked}
      ></NumberButtonRow>
    </Box>
  );

  function handleCellClicked(row: number, cell: number) {
    var newCells = cells;
    if (!selectMultipleCells) {
      newCells = cells.map((cellState) => {
        if (cellState.row == row && cellState.cell == cell) {
          return { ...cellState, selected: true };
        } else {
          return { ...cellState, selected: false };
        }
      });
    } else {
      newCells = cells.map((cellState) => {
        if (cellState.row == row && cellState.cell == cell) {
          return { ...cellState, selected: !cellState.selected };
        } else {
          return cellState;
        }
      });
    }

    setCells(newCells);
  }

  function handleNumberButtonClicked(buttonNr: number) {
    if (candidateMode) {
      const newCells = cells.map((cell) => {
        if (cell.selected) {
          return { ...cell, value: buttonNr };
        } else {
          return cell;
        }
      });
      setCellHistory([...cellHistory, cells]);
      setCells(newCells);
    } else {
      const newCells = cells.map((cell) => {
        if (cell.selected) {
          if (cell.candidates.includes(buttonNr)) {
            return {
              ...cell,
              candidates: cell.candidates.filter(
                (candidate) => candidate != buttonNr,
              ),
            };
          } else {
            return { ...cell, candidates: [...cell.candidates, buttonNr] };
          }
        } else {
          return cell;
        }
      });

      setCellHistory([...cellHistory, cells]);
      setCells(newCells);
    }
  }

  function handleClearSelectedCellsClicked() {
    const newCells = cells.map((cell) => {
      if (cell.selected) {
        return { ...cell, selected: false };
      } else {
        return cell;
      }
    });
    setCells(newCells);
  }

  function handleSelectModeClicked() {
    setSelectMultipleCells(!selectMultipleCells);
  }

  function handleUndoClick() {
    const previousBoards = cellHistory.slice(0, -1);
    console.log(previousBoards);
    setCellHistory(previousBoards);
    const snapshot = cellHistory.at(-1);
    if (snapshot != undefined) {
      setCells(snapshot);
    }
  }

  function handleCandidateModeClicked() {
    setCandidateMode(!candidateMode);
  }
}

function addCells() {
  const cells = [];
  for (let row = 1; row <= 9; row++) {
    for (let cell = 1; cell <= 9; cell++) {
      cells.push({
        row: row,
        cell: cell,
        value: null,
        candidates: [],
        selected: false,
      });
    }
  }
  return cells;
}
export default App;
