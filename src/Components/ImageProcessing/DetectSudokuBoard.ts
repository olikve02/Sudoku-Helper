import cvReadyPromise from "@techstark/opencv-js";

export async function processImageWithOpenCV(
  canvas: HTMLCanvasElement,
): Promise<HTMLCanvasElement> {
  const cv = await cvReadyPromise;
  const src = cv.imread(canvas);

  const grayImage = new cv.Mat();
  cv.cvtColor(src, grayImage, cv.COLOR_RGBA2GRAY);

  const edges = new cv.Mat();
  cv.Canny(grayImage, edges, 50, 150);

  // Lukker små hull i kantene, slik at ytterrammen lettere blir én kontur.
  const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));

  cv.morphologyEx(edges, edges, cv.MORPH_CLOSE, kernel);
  kernel.delete();

  const newCanvas = document.createElement("canvas");

  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  cv.findContours(
    edges,
    contours,
    hierarchy,
    cv.RETR_LIST,
    cv.CHAIN_APPROX_SIMPLE,
  );

  let largestArea = 0;
  let largestContourIndex = -1;

  for (let i = 0; i < contours.size(); i++) {
    const contour = contours.get(i);
    const area = cv.contourArea(contour);
    const perimeter = cv.arcLength(contour, true);
    const approximatedContour = new cv.Mat();

    // Forenkler konturen slik at vi kan undersøke om den har fire hjørner.
    cv.approxPolyDP(contour, approximatedContour, 0.02 * perimeter, true);

    if (approximatedContour.rows === 4 && area > largestArea) {
      largestArea = area;
      largestContourIndex = i;
    }

    approximatedContour.delete();
    contour.delete();
  }

  if (largestContourIndex !== -1) {
    const largestContour = contours.get(largestContourIndex);
    const approximatedContour = new cv.Mat();
    const perimeter = cv.arcLength(largestContour, true);

    cv.approxPolyDP(
      largestContour,
      approximatedContour,
      0.02 * perimeter,
      true,
    );

    if (approximatedContour.rows === 4) {
      const points: Point[] = [];

      for (let i = 0; i < 4; i++) {
        points.push({
          x: approximatedContour.data32S[i * 2],
          y: approximatedContour.data32S[i * 2 + 1],
        });
      }

      const corners = sortCorners(points);
      const boardSize = 450;

      // Definerer hjørnene i det ferdige, kvadratiske bildet.
      const destinationPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0,
        0,
        boardSize,
        0,
        boardSize,
        boardSize,
        0,
        boardSize,
      ]);

      const sourcePoints = cv.matFromArray(
        4,
        1,
        cv.CV_32FC2,
        corners.flatMap((point) => [point.x, point.y]),
      );

      // Beregner transformasjonen som retter opp perspektivet på brettet.
      const transform = cv.getPerspectiveTransform(
        sourcePoints,
        destinationPoints,
      );

      const warped = new cv.Mat();

      cv.warpPerspective(
        src,
        warped,
        transform,
        new cv.Size(boardSize, boardSize),
      );

      newCanvas.width = boardSize;
      newCanvas.height = boardSize;
      cv.imshow(newCanvas, warped);

      warped.delete();
      transform.delete();
      sourcePoints.delete();
      destinationPoints.delete();
    }

    approximatedContour.delete();
    largestContour.delete();
  }

  src.delete();
  grayImage.delete();
  edges.delete();
  contours.delete();
  hierarchy.delete();

  return newCanvas;
}

type Point = {
  x: number;
  y: number;
};

function sortCorners(points: Point[]): Point[] {
  const topLeft = points.reduce((a, b) => (a.x + a.y < b.x + b.y ? a : b));

  const bottomRight = points.reduce((a, b) => (a.x + a.y > b.x + b.y ? a : b));

  const topRight = points.reduce((a, b) => (a.x - a.y > b.x - b.y ? a : b));

  const bottomLeft = points.reduce((a, b) => (a.x - a.y < b.x - b.y ? a : b));

  return [topLeft, topRight, bottomRight, bottomLeft];
}
