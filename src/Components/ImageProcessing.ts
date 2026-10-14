import cvReadyPromise from "@techstark/opencv-js";
import recognizeSudoku from "./RecognizeSudoku";
import { processImageWithOpenCV } from "./ImageProcessing/DetectSudokuBoard";

export default async function takePicture(
  video: HTMLVideoElement | undefined,
  guideBox: HTMLDivElement | undefined,
): Promise<number[]> {
  if (!video || !guideBox) return [];

  const canvas = document.createElement("canvas");

  const guideRect = guideBox.getBoundingClientRect();
  const videoRect = video.getBoundingClientRect();

  const scaleX = video.videoWidth / videoRect.width;
  const scaleY = video.videoHeight / videoRect.height;

  canvas.width = guideRect.width;
  canvas.height = guideRect.height;

  // Konverter koordinatene fra skjermen til koordinater i kamerabildet.
  const sx = (guideRect.left - videoRect.left) * scaleX;
  const sy = (guideRect.top - videoRect.top) * scaleY;
  const sw = guideRect.width * scaleX;
  const sh = guideRect.height * scaleY;

  const context = canvas.getContext("2d");
  context?.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  const newCanvas = await processImageWithOpenCV(canvas);
  const croppedCellsStrings = await cropCells(newCanvas);
  const numberPredictions = await recognizeSudoku(croppedCellsStrings);
  return numberPredictions;
}

async function cropCells(canvas: HTMLCanvasElement): Promise<Array<string>> {
  const croppedCells: HTMLCanvasElement[] = [];

  const cellHeight = canvas.height / 9;
  const cellWidth = canvas.width / 9;

  let yAlign = 0;
  for (let i = 0; i < 9; i++) {
    //Row
    let xAlign = 0;
    for (let j = 0; j < 9; j++) {
      //Column
      const newCanvas = document.createElement("canvas");
      newCanvas.width = cellWidth;
      newCanvas.height = cellHeight;
      const canvasContext = newCanvas.getContext("2d");

      const margin = 5;

      canvasContext?.drawImage(
        canvas,
        xAlign + margin,
        yAlign + margin,
        cellWidth - margin * 2,
        cellHeight - margin * 2,
        0,
        0,
        cellWidth,
        cellHeight,
      );

      croppedCells.push(newCanvas);
      xAlign += cellWidth;
    }
    yAlign += cellHeight;
  }
  const processedCells = await processCroppedCells(croppedCells);
  const processedCellStrings = processedCells.map((cell) =>
    cell.toDataURL("image/png"),
  );
  return processedCellStrings;
}

async function processCroppedCells(
  croppedCells: HTMLCanvasElement[],
): Promise<HTMLCanvasElement[]> {
  const cv = await cvReadyPromise;
  const processedCells: HTMLCanvasElement[] = [];

  croppedCells.forEach((cell) => {
    const src = cv.imread(cell);
    //Grayscale the image
    const grayImg = new cv.Mat();
    cv.cvtColor(src, grayImg, cv.COLOR_RGBA2GRAY);

    const binary = new cv.Mat();

    cv.adaptiveThreshold(
      grayImg,
      binary,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY,
      31,
      10,
    );
    const canvas = document.createElement("canvas");

    canvas.width = cell.width;
    canvas.height = cell.height;

    cv.imshow(canvas, binary);

    src.delete();
    grayImg.delete();
    binary.delete();
    processedCells.push(canvas);
  });
  return processedCells;
}
