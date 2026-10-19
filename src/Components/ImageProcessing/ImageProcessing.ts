import recognizeSudoku, { testScaleImages } from "./RecognizeSudoku";
import { processImageWithOpenCV } from "./DetectSudokuBoard";
import cropCells from "./CropCells";
import recognizeHandwriting from "./RecognizeNumbert";

export default async function takePicture(
  video: HTMLVideoElement | undefined,
  guideBox: HTMLDivElement | undefined,
): Promise<number[]> {
  //Take image and crop the image to the guidebox
  const canvas = cropBoard(video, guideBox);
  if (!canvas) return [];

  //Transform the board so that the image is straight
  const correctedBoard = await processImageWithOpenCV(canvas);
  if (!correctedBoard) return [];
  //Crop all the cells
  const croppedCells = await cropCells(correctedBoard);
  //Predicted numbers
  const predictions = await recognizeHandwriting(croppedCells);

  return predictions;
}

export async function testImages(
  video: HTMLVideoElement | undefined,
  guideBox: HTMLDivElement | undefined,
): Promise<string[]> {
  const canvas = cropBoard(video, guideBox);
  if (!canvas) return [];

  const correctedBoard = await processImageWithOpenCV(canvas);
  if (!correctedBoard) return [];
  const cellImages = await cropCells(correctedBoard);
  const cellImagesString = cellImages.map((image) =>
    image.toDataURL("image/url"),
  );
  const preparedCellImages = await testScaleImages(cellImagesString);

  return preparedCellImages;
}

function cropBoard(
  video: HTMLVideoElement | undefined,
  guideBox: HTMLDivElement | undefined,
): HTMLCanvasElement | undefined {
  if (!video || !guideBox) return undefined;

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
  return canvas;
}
