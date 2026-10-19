import { Box } from "@mui/material";
import { Camera, Eraser, Grid2x2Check, PencilLine, Undo2 } from "lucide-react";
import Board from "./components/Board";
import NumberButtonRow from "./components/NumberButtonRow";
import CameraScanner from "./components/CameraScanner";
import useSudokuBoard from "./hooks/useSudokuBoard";
import scanBoard from "./scanner/scanBoard";
import LabelingTool from "./tools/labeling/LabelingTool";
import "./App.css";

// Merkeverktøyet for treningsdata åpnes med ?label i adressen
const showLabelingTool = new URLSearchParams(window.location.search).has(
  "label",
);

function App() {
  const board = useSudokuBoard();

  if (showLabelingTool) {
    return <LabelingTool />;
  }

  return (
    <Box className="screen-container">
      {board.screen == "board" ? (
        <div>
          <Board cells={board.cells} onCellClick={board.selectCell} />
          <Box className="icon-row">
            <Eraser className="icon-button" onClick={board.clearSelection} />
            <Grid2x2Check
              className={`icon-button ${board.selectMultiple ? "selected" : ""}`}
              onClick={board.toggleSelectMultiple}
            />
            <Undo2 className="icon-button" onClick={board.undo} />
            <PencilLine
              className={`icon-button ${board.candidateMode ? "selected" : ""}`}
              onClick={board.toggleCandidateMode}
            />
            <Camera
              className="icon-button"
              onClick={() => board.swapScreen("camera")}
            />
          </Box>
          <NumberButtonRow onNumberClick={board.enterNumber} />
        </div>
      ) : (
        <CameraScanner
          onCapture={handleCapture}
          onBack={() => board.swapScreen("board")}
        />
      )}
    </Box>
  );

  async function handleCapture(
    video: HTMLVideoElement,
    guideBox: HTMLDivElement,
  ) {
    const digits = await scanBoard(video, guideBox);
    board.setScannedValues(digits);
  }
}

export default App;
