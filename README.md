# Sudoku Helper

En webapp for sudoku der du kan ta bilde av et fysisk sudokubrett. Appen finner brettet i bildet, gjenkjenner tallene (både trykte og håndskrevne) og legger dem inn på et virtuelt brett, der du kan fortsette å løse og notere kandidater.

Bygget med React, TypeScript og Vite. Bildebehandlingen gjøres med OpenCV, og tallene gjenkjennes av et nevralt nett (CNN) som er trent på egne data og kjører i nettleseren med TensorFlow.js.

## Funksjoner

- Virtuelt sudokubrett med tall og kandidater
- Velg én eller flere celler, fjern markeringen og angre
- Ta bilde av et sudokubrett med kameraet, med lommelykt på telefoner som støtter det
- Automatisk gjenkjenning av tallene fra bildet
- Eget verktøy for å merke treningsdata (se [Trene modellen](#trene-modellen))

## Kom i gang

Krever [Node.js](https://nodejs.org/).

```bash
npm install
npm run dev
```

Appen kjører da på http://localhost:5173.

| Kommando | Hva den gjør |
|---|---|
| `npm run dev` | Starter utviklingsserveren |
| `npm run build` | Typesjekker og bygger appen til `dist/` |
| `npm run preview` | Viser den bygde appen lokalt |
| `npm run lint` | Kjører ESLint |

### Teste på mobil

Nettlesere gir bare kameratilgang over HTTPS (eller på `localhost`). For å teste kameraet på telefonen kan du bruke en [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/do-more-with-tunnels/trycloudflare/) mens `npm run dev` kjører:

```bash
cloudflared tunnel --url http://localhost:5173
```

Åpne adressen som skrives ut (`https://….trycloudflare.com`) på telefonen. `vite.config.ts` godtar allerede alle `trycloudflare.com`-adresser.

## Slik gjenkjennes tallene

Fra kamerabilde til 81 tall går bildet gjennom disse stegene i `src/scanner/`:

1. **`scanBoard.ts`**: klipper ut området innenfor guideboksen og styrer resten av stegene
2. **`detectBoard.ts`**: finner brettet og retter opp perspektivet til et kvadrat
3. **`cropCells.ts`**: finner rutenettlinjene, fjerner dem og deler brettet i 81 celler
4. **`processCells.ts`**: gjør hver celle om til et 28×28 bilde med hvitt siffer på svart bunn, og avgjør om cella er tom
5. **`recognizeDigits.ts`**: lar modellen gjenkjenne sifrene i cellene som ikke er tomme

Modellen ligger i `public/models/digits/` (`model.json` og `weights.bin`).

## Trene modellen

Alt som har med maskinlæring å gjøre ligger i `ml/`.

### 1. Samle og merke data

Åpne appen med `?label` i adressen, f.eks. http://localhost:5173/?label. Last opp et bilde av et sudokubrett, skriv inn riktig tall for hver celle (`0` = tom), og last ned zip-filen. Den har én mappe per siffer, og en `raw`-mappe med de ubehandlede utsnittene.

Pakk ut zip-filen til `ml/data/`, slik at bildene ligger i `ml/data/1/` til `ml/data/9/`.

### 2. Sett opp Python-miljøet

Bruk Python 3.11. Kjør fra rotmappen i prosjektet:

```bash
py -3.11 -m venv ml/.venv
```

```powershell
ml\.venv\Scripts\Activate.ps1
```

```bash
pip install -r ml/requirements.txt
```

### 3. Tren

```bash
python ml/train.py
```

Scriptet laster bildene, deler dem i trening, validering og test **per ark** (så bilder fra samme brett ikke havner i flere deler), trener et lite CNN med Early Stopping, skriver ut resultatet på testsettet og lagrer modellen til `ml/digit-model.keras`.

Legg til `--plot` for å se læringskurven, eller `--show-mistakes` for å se valideringsbildene modellen tar feil på. Det siste er nyttig for å finne feilmerkede bilder. Hvilke ark som brukes til validering og test står øverst i `train.py`.

### 4. Eksporter til appen

```bash
python ml/export_tfjs.py ml/digit-model.keras public/models/digits
```

Eksportscriptet skriver modellen i TensorFlow.js-format uten `tensorflowjs`-pakken, som ikke er helt kompatibel med Keras 3.

## Prosjektstruktur

```
src/
  App.tsx                    Velger hvilken skjerm som vises
  types.ts                   Felles typer (CellState)
  components/                Brett, celler, knapper og kamera
  hooks/useSudokuBoard.ts    Tilstand og logikk for brettet (valg, tall, kandidater, angre)
  scanner/                   Fra kamerabilde til 81 tall
  tools/labeling/            Merkeverktøyet for treningsdata (?label)
public/models/digits/        Den trente modellen
ml/
  train.py                   Trener modellen
  export_tfjs.py             Eksporterer modellen til TensorFlow.js
  requirements.txt           Python-pakkene
  data/                      Treningsdata (ikke i git)
```
