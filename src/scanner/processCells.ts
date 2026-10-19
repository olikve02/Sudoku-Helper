import cvReadyPromise from "@techstark/opencv-js";

export interface ProcessedCell {
  canvas: HTMLCanvasElement;
  isEmpty: boolean;
}

type CV = Awaited<typeof cvReadyPromise>;
type Tracked = { delete(): void };

const OUTPUT_SIZE = 28;
const DIGIT_BOX = 20; // MNIST: siffer i 20x20 inni 28x28
const EDGE_MARGIN = 2; // linjene er fjernet i cropCells, så liten margin holder
// Tersklene tilpasses kontrasten i hver celle (papir ≈ 255 etter normalisering)
const MIN_CONTRAST = 45; // svakere enn dette = tom celle
const LOOSE_RATIO = 0.35; // løs terskel: 35 % av veien fra papir mot mørkeste blekk
const LOOSE_RANGE = [205, 228]; // ...men aldri utenfor dette området
const STRONG_RATIO = 0.6; // en komponent må ha noen piksler mørkere enn dette
const STRONG_MAX = 195;
const MIN_STRONG_PIXELS = 4;
const EDGE_ZONE = 0.08; // komponenter innenfor 8 % av kanten kan være linjerester
const THIN = 0.18; // en linjerest er smalere enn 18 % av cella...
const LONG = 0.5; // ...og lengre enn 50 %

/**
 * Gjør hver celle om til et 28×28 bilde med hvitt siffer på svart bunn,
 * sentrert og skalert slik modellen er trent på, og avgjør om cella er tom.
 */
export default async function processCells(
  croppedCells: HTMLCanvasElement[],
): Promise<ProcessedCell[]> {
  const cv = await cvReadyPromise;
  const kernel = cv.getStructuringElement(
    cv.MORPH_ELLIPSE,
    new cv.Size(15, 15),
  );

  try {
    return croppedCells.map((cell) => processCell(cv, cell, kernel));
  } finally {
    kernel.delete();
  }
}

function processCell(
  cv: CV,
  cell: HTMLCanvasElement,
  kernel: Tracked,
): ProcessedCell {
  const mats: Tracked[] = [];
  const track = <T extends Tracked>(m: T) => {
    mats.push(m);
    return m;
  };

  try {
    const src = track(cv.imread(cell));
    const gray = track(new cv.Mat());
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Bakgrunnsestimat og normalisering
    const bg = track(new cv.Mat());
    cv.morphologyEx(gray, bg, cv.MORPH_CLOSE, kernel as never);
    const norm = track(new cv.Mat());
    cv.divide(gray, bg, norm, 255);

    // Kontrast = hvor mørkt det mørkeste blekket i midten av cella er
    const w = norm.cols;
    const h = norm.rows;
    const contrast = 255 - darkestInk(norm, w, h);
    const looseThreshold = clamp(
      255 - LOOSE_RATIO * contrast,
      LOOSE_RANGE[0],
      LOOSE_RANGE[1],
    );
    const strongThreshold = Math.min(STRONG_MAX, 255 - STRONG_RATIO * contrast);

    const loose = track(new cv.Mat());
    const strong = track(new cv.Mat());
    cv.threshold(norm, loose, looseThreshold, 255, cv.THRESH_BINARY_INV);
    cv.threshold(norm, strong, strongThreshold, 255, cv.THRESH_BINARY_INV);

    for (const m of [loose, strong]) clearEdges(cv, m, w, h, EDGE_MARGIN);

    const contours = track(new cv.MatVector());
    const hierarchy = track(new cv.Mat());
    cv.findContours(
      loose,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE,
    );

    const minHeight = h * 0.25;
    const minArea = w * h * 0.01;
    const filled = track(cv.Mat.zeros(h, w, cv.CV_8UC1));

    let minX = w,
      minY = h,
      maxX = 0,
      maxY = 0,
      kept = 0;

    const count = contrast < MIN_CONTRAST ? 0 : contours.size();
    for (let i = 0; i < count; i++) {
      const c = contours.get(i);
      try {
        const r = cv.boundingRect(c);
        if (cv.contourArea(c) < minArea || r.height < minHeight) continue;

        const strongRoi = strong.roi(r);
        const strongPixels = cv.countNonZero(strongRoi);
        strongRoi.delete();
        if (strongPixels < MIN_STRONG_PIXELS) continue; // svak flekk, sannsynlig støy
        if (isLineRemnant(r, w, h)) continue;

        cv.drawContours(filled, contours, i, new cv.Scalar(255), -1);
        minX = Math.min(minX, r.x);
        minY = Math.min(minY, r.y);
        maxX = Math.max(maxX, r.x + r.width);
        maxY = Math.max(maxY, r.y + r.height);
        kept++;
      } finally {
        c.delete();
      }
    }

    const output = document.createElement("canvas");
    output.width = OUTPUT_SIZE;
    output.height = OUTPUT_SIZE;

    if (kept === 0) {
      const ctx = output.getContext("2d")!;
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      return { canvas: output, isEmpty: true };
    }

    // Gjenåpne hull (4, 6, 8, 9) ved å bare beholde ekte blekkpiksler
    cv.bitwise_and(filled, loose, filled);

    // Beskjær, skaler til 20 px på lengste side, sentrer på tyngdepunkt i 28x28
    const digit = track(
      filled.roi(new cv.Rect(minX, minY, maxX - minX, maxY - minY)),
    );
    const scale = DIGIT_BOX / Math.max(digit.cols, digit.rows);
    const nw = Math.max(1, Math.round(digit.cols * scale));
    const nh = Math.max(1, Math.round(digit.rows * scale));

    const resized = track(new cv.Mat());
    cv.resize(digit, resized, new cv.Size(nw, nh), 0, 0, cv.INTER_AREA);

    const m = cv.moments(resized, false);
    const cx = m.m00 > 0 ? m.m10 / m.m00 : nw / 2;
    const cy = m.m00 > 0 ? m.m01 / m.m00 : nh / 2;
    const ox = clamp(Math.round(OUTPUT_SIZE / 2 - cx), 0, OUTPUT_SIZE - nw);
    const oy = clamp(Math.round(OUTPUT_SIZE / 2 - cy), 0, OUTPUT_SIZE - nh);

    const final = track(cv.Mat.zeros(OUTPUT_SIZE, OUTPUT_SIZE, cv.CV_8UC1));
    const target = final.roi(new cv.Rect(ox, oy, nw, nh));
    resized.copyTo(target);
    target.delete();

    cv.imshow(output, final); // hvitt siffer på svart bunn
    return { canvas: output, isEmpty: false };
  } finally {
    mats.forEach((m) => m.delete());
  }
}

function clearEdges(
  cv: CV,
  mat: Tracked,
  w: number,
  h: number,
  margin: number,
) {
  const black = new cv.Scalar(0);
  const fill = (x0: number, y0: number, x1: number, y1: number) =>
    cv.rectangle(
      mat as never,
      new cv.Point(x0, y0),
      new cv.Point(x1, y1),
      black,
      -1,
    );

  fill(0, 0, w - 1, margin - 1);
  fill(0, h - margin, w - 1, h - 1);
  fill(0, 0, margin - 1, h - 1);
  fill(w - margin, 0, w - 1, h - 1);
}

// 1. persentil av lysstyrken i midten av cella (ignorerer kantene og enkeltpiksler med støy)
function darkestInk(norm: { data: Uint8Array }, w: number, h: number) {
  const histogram = new Array<number>(256).fill(0);
  const x0 = Math.floor(w / 6);
  const y0 = Math.floor(h / 6);
  let total = 0;
  for (let y = y0; y < h - y0; y++) {
    for (let x = x0; x < w - x0; x++) {
      histogram[norm.data[y * w + x]]++;
      total++;
    }
  }

  let seen = 0;
  for (let v = 0; v < 256; v++) {
    seen += histogram[v];
    if (seen >= total * 0.01) return v;
  }
  return 255;
}

// Lang, tynn strek som ligger langs kanten av cella = rest av en rutenettlinje
function isLineRemnant(
  r: { x: number; y: number; width: number; height: number },
  w: number,
  h: number,
) {
  const edge = Math.max(3, Math.round(w * EDGE_ZONE));
  const touchesEdge =
    r.x <= edge ||
    r.y <= edge ||
    r.x + r.width >= w - edge ||
    r.y + r.height >= h - edge;
  const vertical = r.width <= w * THIN && r.height >= h * LONG;
  const horizontal = r.height <= h * THIN && r.width >= w * LONG;
  const cx = r.x + r.width / 2;
  const cy = r.y + r.height / 2;
  const nearSide = Math.min(cx, w - cx) < w * 0.2 || Math.min(cy, h - cy) < h * 0.2;

  return touchesEdge && (vertical || horizontal) && nearSide;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
