import cvReadyPromise from "@techstark/opencv-js";

const CELL_OUTPUT = 50; // størrelse på hver beskårne celle
const INK_THRESHOLD = 225; // på normalisert bilde (papir ≈ 250). Høy nok til å få med tynne, lyse linjer
const LINE_KERNEL = 0.9; // linjebit må være minst 90 % av en celle lang (sifre er kortere)
const LINE_SEARCH = 0.3; // søk ±30 % av cellebredden rundt forventet linje
const MIN_LINE_FILL = 0.35; // andel av brettet en linje må dekke for å regnes som linje
const MIN_BAND_FILL = 0.5; // andel av én rad/kolonne en linje må dekke lokalt
const LINE_ZONE = 5; // bare fjern linjepiksler innenfor ±5 px av en funnet linje

type Tracked = { delete(): void };
type Line = { pos: number; half: number };
type Mat = { rows: number; cols: number; data: Uint8Array };

export default async function cropCells(
  board: HTMLCanvasElement,
): Promise<HTMLCanvasElement[]> {
  const cv = await cvReadyPromise;

  const mats: Tracked[] = [];
  const track = <T extends Tracked>(m: T) => {
    mats.push(m);
    return m;
  };

  try {
    const src = track(cv.imread(board));
    const gray = track(new cv.Mat());
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    const n = gray.rows;
    const cell = n / 9;

    // Bakgrunnsestimat og normalisering (papir ≈ 255, blekk/linjer mørkt)
    const kernel = track(
      cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(15, 15)),
    );
    const bg = track(new cv.Mat());
    cv.morphologyEx(gray, bg, cv.MORPH_CLOSE, kernel);
    const norm = track(new cv.Mat());
    cv.divide(gray, bg, norm, 255);

    const ink = track(new cv.Mat());
    cv.threshold(norm, ink, INK_THRESHOLD, 255, cv.THRESH_BINARY_INV);

    // Isoler lange horisontale og vertikale linjer. Blekket gjøres først 3 px
    // tykkere på tvers, så linjer som er litt bøyde eller skjeve ikke brytes opp.
    const length = Math.round(cell * LINE_KERNEL);
    const hLines = track(lineMask(cv, ink, new cv.Size(1, 3), new cv.Size(length, 1)));
    const vLines = track(lineMask(cv, ink, new cv.Size(3, 1), new cv.Size(1, length)));
    const inkGrown = track(new cv.Mat());
    const grow = track(
      cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3)),
    );
    cv.dilate(ink, inkGrown, grow);
    cv.bitwise_and(hLines, inkGrown, hLines);
    cv.bitwise_and(vLines, inkGrown, vLines);

    // Finn linjene lokalt for hver rad/kolonne, så bøyde sider ikke forskyver cellene.
    // xs[rad][k] = x-posisjon til vertikal linje k i den raden, ys[kolonne][k] tilsvarende
    const xs = findLocalLines(vLines, "cols", cell);
    const ys = findLocalLines(hLines, "rows", cell);

    // Fjern linjene fra bildet ved å bytte dem ut med papirfargen, men bare nær
    // linjer vi faktisk har funnet (ellers kan lange siffer-strøk bli visket bort)
    keepNearLines(vLines, xs, "cols", cell);
    keepNearLines(hLines, ys, "rows", cell);
    const lines = track(new cv.Mat());
    cv.bitwise_or(hLines, vLines, lines);
    cv.dilate(lines, lines, grow);
    const cleaned = track(gray.clone());
    bg.copyTo(cleaned, lines);

    // Beskjær hver celle fra midten av linjene. Linjene er allerede fjernet, så
    // sifre som går helt ut til kanten blir ikke kuttet.
    const cells: HTMLCanvasElement[] = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const x0 = clamp(Math.round(xs[row][col]), 0, n - 2);
        const x1 = clamp(Math.round(xs[row][col + 1]), x0 + 2, n);
        const y0 = clamp(Math.round(ys[col][row]), 0, n - 2);
        const y1 = clamp(Math.round(ys[col][row + 1]), y0 + 2, n);

        const roi = cleaned.roi(new cv.Rect(x0, y0, x1 - x0, y1 - y0));
        const resized = new cv.Mat();
        cv.resize(
          roi,
          resized,
          new cv.Size(CELL_OUTPUT, CELL_OUTPUT),
          0,
          0,
          cv.INTER_LINEAR,
        );

        const canvas = document.createElement("canvas");
        cv.imshow(canvas, resized);
        cells.push(canvas);

        roi.delete();
        resized.delete();
      }
    }

    return cells;
  } finally {
    mats.forEach((m) => m.delete());
  }
}

function lineMask(
  cv: Awaited<typeof cvReadyPromise>,
  ink: InstanceType<typeof cv.Mat>,
  thicken: InstanceType<typeof cv.Size>,
  line: InstanceType<typeof cv.Size>,
) {
  const thickKernel = cv.getStructuringElement(cv.MORPH_RECT, thicken);
  const lineKernel = cv.getStructuringElement(cv.MORPH_RECT, line);
  const out = new cv.Mat();
  cv.dilate(ink, out, thickKernel);
  cv.morphologyEx(out, out, cv.MORPH_OPEN, lineKernel);
  thickKernel.delete();
  lineKernel.delete();
  return out;
}

// Antall linjepiksler per rad eller kolonne, innenfor et bånd på tvers
function profile(
  mat: Mat,
  axis: "rows" | "cols",
  from = 0,
  to = axis === "rows" ? mat.cols : mat.rows,
): number[] {
  const { rows, cols, data } = mat;
  const out = new Array<number>(axis === "rows" ? rows : cols).fill(0);
  if (axis === "rows") {
    for (let y = 0; y < rows; y++)
      for (let x = from; x < to; x++) if (data[y * cols + x]) out[y]++;
  } else {
    for (let y = from; y < to; y++)
      for (let x = 0; x < cols; x++) if (data[y * cols + x]) out[x]++;
  }
  return out;
}

// Finner topp og bredde på en linje rundt forventet posisjon, eller null
function findPeak(
  prof: number[],
  expected: number,
  range: number,
  minFill: number,
): Line | null {
  const n = prof.length;
  const from = Math.max(0, Math.round(expected) - range);
  const to = Math.min(n - 1, Math.round(expected) + range);

  let best = from;
  for (let i = from; i <= to; i++) if (prof[i] > prof[best]) best = i;

  const peak = prof[best];
  if (peak < minFill) return null;

  let l = best;
  let r = best;
  while (l > 0 && prof[l - 1] >= peak / 2) l--;
  while (r < n - 1 && prof[r + 1] >= peak / 2) r++;
  return { pos: (l + r) / 2, half: (r - l + 1) / 2 };
}

// Finner midten og halve tykkelsen på hver av de 10 rutenettlinjene over hele brettet
function findLines(prof: number[], cell: number): Line[] {
  const n = prof.length;
  const range = Math.round(cell * LINE_SEARCH);
  const lines: Line[] = [];

  for (let k = 0; k <= 9; k++) {
    const expected = Math.min(Math.round(k * cell), n - 1);
    // fant ingen linje, bruk forventet plass
    lines.push(
      findPeak(prof, expected, range, MIN_LINE_FILL * n) ?? {
        pos: expected,
        half: 2,
      },
    );
  }

  // Sikkerhetsnett: urimelig avstand mellom linjer gir forventet plass
  for (let k = 1; k <= 9; k++) {
    const gap = lines[k].pos - lines[k - 1].pos;
    if (gap < cell * 0.7 || gap > cell * 1.3) {
      lines[k] = { pos: Math.min(Math.round(k * cell), n - 1), half: 2 };
    }
  }
  return lines;
}

// Finner de 10 linjene separat for hver av de 9 radene (axis "cols") eller
// kolonnene (axis "rows"). Mangler en linje lokalt, brukes nabobåndene eller
// den globale posisjonen.
function findLocalLines(
  mask: Mat,
  axis: "rows" | "cols",
  cell: number,
): number[][] {
  const global = findLines(profile(mask, axis), cell);
  const range = Math.round(cell * LINE_SEARCH);

  const local: (number | null)[][] = [];
  for (let b = 0; b < 9; b++) {
    const from = Math.round(b * cell);
    const to = Math.round((b + 1) * cell);
    const prof = profile(mask, axis, from, to);
    local.push(
      global.map(
        (g) => findPeak(prof, g.pos, range, MIN_BAND_FILL * (to - from))?.pos ?? null,
      ),
    );
  }

  return local.map((band, b) =>
    band.map((pos, k) => {
      if (pos !== null) return pos;
      const neighbours = [local[b - 1]?.[k], local[b + 1]?.[k]].filter(
        (p): p is number => p != null,
      );
      return neighbours.length
        ? neighbours.reduce((a, c) => a + c, 0) / neighbours.length
        : global[k].pos;
    }),
  );
}

// Nullstiller linjepiksler som ikke ligger nær en funnet linje
function keepNearLines(
  mask: Mat,
  lines: number[][],
  axis: "rows" | "cols",
  cell: number,
) {
  const { rows, cols, data } = mask;
  for (let b = 0; b < 9; b++) {
    const from = Math.round(b * cell);
    const to = b === 8 ? (axis === "cols" ? rows : cols) : Math.round((b + 1) * cell);
    const near = (p: number) =>
      lines[b].some((pos) => Math.abs(p - pos) <= LINE_ZONE);

    for (let a = from; a < to; a++) {
      if (axis === "cols") {
        for (let x = 0; x < cols; x++) if (!near(x)) data[a * cols + x] = 0;
      } else {
        for (let y = 0; y < rows; y++) if (!near(y)) data[y * cols + a] = 0;
      }
    }
  }
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
