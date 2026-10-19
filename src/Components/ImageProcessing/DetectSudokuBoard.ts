import cvReadyPromise from "@techstark/opencv-js";

const BOARD_SIZE = 450; // 9 celler à 50 px. Endre dette og du må justere cellebehandlingen
const MAX_DETECTION_SIDE = 1000;
const MIN_BOARD_AREA_RATIO = 0.15;

type Point = { x: number; y: number };

/**
 * Finner sudokubrettet i bildet og returnerer et rettet, kvadratisk canvas.
 * Returnerer null hvis ingen brukbar firkant ble funnet.
 */
export async function processImageWithOpenCV(
  canvas: HTMLCanvasElement,
): Promise<HTMLCanvasElement | null> {
  const cv = await cvReadyPromise;

  // Samler alle Mat-objekter så de alltid blir slettet
  const mats: { delete(): void }[] = [];
  const track = <T extends { delete(): void }>(mat: T): T => {
    mats.push(mat);
    return mat;
  };

  try {
    const src = track(cv.imread(canvas));
    const gray = track(new cv.Mat());
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // 1. Nedskaler for rask deteksjon (store mobilbilder er tunge å kjøre konturer på)
    const scale = Math.min(
      1,
      MAX_DETECTION_SIDE / Math.max(gray.cols, gray.rows),
    );
    const small = track(new cv.Mat());
    if (scale < 1) {
      cv.resize(gray, small, new cv.Size(0, 0), scale, scale, cv.INTER_AREA);
    } else {
      gray.copyTo(small);
    }

    // 2. Reduser støy, finn mørke linjer, og bind sammen små brudd
    const blurred = track(new cv.Mat());
    cv.GaussianBlur(small, blurred, new cv.Size(5, 5), 0);

    const binary = track(new cv.Mat());
    cv.adaptiveThreshold(
      blurred,
      binary,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY_INV,
      11,
      2,
    );

    const kernel = track(
      cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3)),
    );
    cv.dilate(binary, binary, kernel);

    // 3. Finn konturer og velg den største konvekse, kvadratiske firkanten
    const contours = track(new cv.MatVector());
    const hierarchy = track(new cv.Mat());
    cv.findContours(
      binary,
      contours,
      hierarchy,
      cv.RETR_LIST,
      cv.CHAIN_APPROX_SIMPLE,
    );

    const corners = findBoardCorners(
      cv,
      contours,
      small.cols * small.rows * MIN_BOARD_AREA_RATIO,
    );
    if (!corners) return null;

    // 4. Skaler hjørnene tilbake til originalbildet
    const sourceCorners = corners.flatMap((p) => [p.x / scale, p.y / scale]);

    const sourcePoints = track(
      cv.matFromArray(4, 1, cv.CV_32FC2, sourceCorners),
    );
    const destinationPoints = track(
      cv.matFromArray(4, 1, cv.CV_32FC2, [
        0,
        0,
        BOARD_SIZE,
        0,
        BOARD_SIZE,
        BOARD_SIZE,
        0,
        BOARD_SIZE,
      ]),
    );

    // 5. Rett opp perspektivet på originalbildet
    const transform = track(
      cv.getPerspectiveTransform(sourcePoints, destinationPoints),
    );
    const warped = track(new cv.Mat());
    cv.warpPerspective(
      src,
      warped,
      transform,
      new cv.Size(BOARD_SIZE, BOARD_SIZE),
    );

    const output = document.createElement("canvas");
    output.width = BOARD_SIZE;
    output.height = BOARD_SIZE;
    cv.imshow(output, warped);
    return output;
  } finally {
    mats.forEach((mat) => mat.delete());
  }
}

function findBoardCorners(
  cv: typeof import("@techstark/opencv-js"),
  contours: InstanceType<typeof cv.MatVector>,
  minArea: number,
): Point[] | null {
  let best: Point[] | null = null;
  let bestArea = 0;

  for (let i = 0; i < contours.size(); i++) {
    const contour = contours.get(i);
    const approx = new cv.Mat();

    try {
      const area = cv.contourArea(contour);
      if (area < minArea || area <= bestArea) continue;

      // Forenkler konturen og sjekker om den har fire hjørner
      const perimeter = cv.arcLength(contour, true);
      cv.approxPolyDP(contour, approx, 0.02 * perimeter, true);
      if (approx.rows !== 4 || !cv.isContourConvex(approx)) continue;

      const points: Point[] = [];
      for (let k = 0; k < 4; k++) {
        points.push({ x: approx.data32S[k * 2], y: approx.data32S[k * 2 + 1] });
      }

      const sorted = sortCorners(points);
      if (new Set(sorted).size !== 4 || !isRoughlySquare(sorted)) continue;

      best = sorted;
      bestArea = area;
    } finally {
      approx.delete();
      contour.delete();
    }
  }

  return best;
}

// Rekkefølge: øverst venstre, øverst høyre, nederst høyre, nederst venstre
function sortCorners(points: Point[]): Point[] {
  const topLeft = points.reduce((a, b) => (a.x + a.y < b.x + b.y ? a : b));
  const bottomRight = points.reduce((a, b) => (a.x + a.y > b.x + b.y ? a : b));
  const topRight = points.reduce((a, b) => (a.x - a.y > b.x - b.y ? a : b));
  const bottomLeft = points.reduce((a, b) => (a.x - a.y < b.x - b.y ? a : b));

  return [topLeft, topRight, bottomRight, bottomLeft];
}

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

// Avviser lange, smale firkanter (f.eks. en rad eller kolonne)
function isRoughlySquare([tl, tr, br, bl]: Point[]): boolean {
  const width = (distance(tl, tr) + distance(bl, br)) / 2;
  const height = (distance(tl, bl) + distance(tr, br)) / 2;
  if (height === 0) return false;

  const ratio = width / height;
  return ratio > 0.6 && ratio < 1.6;
}
