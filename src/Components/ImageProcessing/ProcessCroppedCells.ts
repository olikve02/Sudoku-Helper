import cvReadyPromise from "@techstark/opencv-js";

export default async function processCroppedCells(
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
