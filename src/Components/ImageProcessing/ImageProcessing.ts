import recognizeSudoku from "../RecognizeSudoku";
import { processImageWithOpenCV } from "./DetectSudokuBoard";
import cropCells from "./CropCells";

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

  const sx = (guideRect.left - videoRect.left) * scaleX;
  const sy = (guideRect.top - videoRect.top) * scaleY;
  const sw = guideRect.width * scaleX;
  const sh = guideRect.height * scaleY;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Kunne ikke opprette canvas-kontekst");
  }

  context.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  const correctedBoard = await processImageWithOpenCV(canvas);
  const cellImages = await cropCells(correctedBoard);
  const predictions = await recognizeSudoku(cellImages);

  return predictions;
}
