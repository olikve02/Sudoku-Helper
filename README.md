# Sudoku Helper

En webapp for sudoku der du kan ta bilde av et fysisk sudokubrett. Appen finner brettet i bildet, gjenkjenner tallene (både trykte og håndskrevne) og legger dem inn på et virtuelt brett, der du kan fortsette å løse og notere kandidater. Du kan også lage nye brett med valgfri vanskelighetsgrad.

Appen er en PWA, så den kan installeres på telefonen og virker uten nett, også scanningen.

**Prøv den her: https://sudoku-helper-eta.vercel.app**

Bygget med React, TypeScript og Vite. Bildebehandlingen gjøres med OpenCV, og tallene gjenkjennes av et nevralt nett (CNN) som er trent på egne data og kjører i nettleseren med TensorFlow.js.

## Funksjoner

### Nytt brett

- **Generer et brett** med vanskelighetsgrad: lett (40 tall), middels (32) eller vanskelig (26). Alle brett har nøyaktig én løsning
- **Scan et brett** fra papir med kameraet
- Begge velges fra "Nytt brett"-menyen øverst til høyre

### Brettet

- Virtuelt sudokubrett med tall og kandidater (notatmodus)
- Velg én eller flere celler, visk ut, angre og tøm brettet
- Når du setter et tall, fjernes det automatisk fra kandidatene i samme rad, kolonne og boks
- **Feil tall** (som ikke stemmer med løsningen) og **konflikter** (samme tall i rad, kolonne eller boks) markeres med rød tekst og en kort risting
- Rad, kolonne og boks til den valgte cella markeres
- Alle celler med samme tall som den valgte cella markeres
- **Naboer for alle med samme tall** (av/på): markerer rad, kolonne og boks for alle cellene med det valgte tallet, så de umarkerte cellene er de eneste stedene tallet kan stå
- Tallknapper får en hake og deaktiveres når alle ni av et tall er plassert
- Brettet og løsningen lagres i nettleseren (`localStorage`), så ingenting forsvinner når appen lukkes

### Kamera

- Søkeramme som viser hvor brettet skal være, med lommelykt på telefoner som støtter det
- Automatisk gjenkjenning av tallene fra bildet
- Eget verktøy for å merke treningsdata (se [Trene modellen](#trene-modellen))

## Installere appen

Appen installeres rett fra nettleseren, ikke fra App Store eller Google Play. Åpne https://sudoku-helper-eta.vercel.app og:

- **iPhone (Safari):** Del-knappen → **Legg til på Hjem-skjerm**
- **Android (Chrome):** menyen ⋮ → **Installer app**
- **PC (Chrome/Edge):** installeringsikonet til høyre i adressefeltet

Første gang appen åpnes, lagres alle filene (ca. 17 MB, mest OpenCV) for offline bruk. Etter det virker den uten nett, og den oppdaterer seg selv når en ny versjon er publisert.

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
| `npm run preview` | Viser den bygde appen lokalt (med service worker, så PWA-en kan testes) |
| `npm run lint` | Kjører ESLint |
| `npm run generate-icons` | Lager app-ikonene i `public/` på nytt fra `public/favicon.svg` |

### Teste på mobil

Nettlesere gir bare kameratilgang over HTTPS (eller på `localhost`). For å teste kameraet på telefonen kan du bruke en [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/do-more-with-tunnels/trycloudflare/) mens `npm run dev` kjører:

```bash
cloudflared tunnel --url http://localhost:5173
```

Åpne adressen som skrives ut (`https://….trycloudflare.com`) på telefonen. `vite.config.ts` godtar allerede alle `trycloudflare.com`-adresser.

Alternativt kan du bruke forhåndsvisningen som Vercel lager for hver pull request (se under).

## Publisering

Appen publiseres på [Vercel](https://vercel.com) til https://sudoku-helper-eta.vercel.app. Vercel er koblet til GitHub-repoet:

- Hver merge til `master` publiseres automatisk
- Hver pull request får en egen forhåndsvisningsadresse, som Vercel legger som kommentar på PR-en

Vercel kjører `npm run build` og publiserer `dist/`. Ingen miljøvariabler trengs.

### PWA

PWA-oppsettet ligger i `vite.config.ts` og lages av [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/). Den lager manifestet og en service worker som lagrer filene for offline bruk. To ting er spesielt for dette prosjektet:

- **`maximumFileSizeToCacheInBytes`** er satt til 20 MB, fordi OpenCV gjør JavaScript-filen ca. 17 MB (standardgrensen er 2 MB)
- **`globPatterns`** tar med `json` og `bin`, så ML-modellen lagres og scanning virker offline

### App-ikonet

Ikonet er tegnet i `public/favicon.svg`. PNG-ikonene for Android, iPhone og PWA-manifestet lages ut fra den med [`@vite-pwa/assets-generator`](https://vite-pwa-org.netlify.app/assets-generator/):

```bash
npm run generate-icons
```

Innstillingene ligger i `pwa-assets.config.ts`. Der får Android- og iPhone-ikonene mørk bakgrunn i stedet for hvit. Endrer du ikonet, må appen ofte fjernes fra startskjermen og legges til på nytt før det nye ikonet vises.

## Sudoku-logikk

Løseren og generatoren ligger i `src/sudoku/` og jobber på en enkel liste med 81 tall (rad for rad, `0` = tom), ikke på `CellState`.

- **`solver.ts`**: `solve` løser et brett med *backtracking*: finn første tomme celle, prøv tallene 1–9 som er lov (`isValid`), løs resten rekursivt, og gå tilbake hvis det ender i en blindvei. `solve` fyller inn løsningen i lista den får, og returnerer om det gikk
- **`generator.ts`**: `generate(givens)` lager et nytt brett:
  1. `fillRandom` fyller et tomt brett med en løser som prøver tallene i tilfeldig rekkefølge
  2. Tall fjernes i tilfeldig rekkefølge. Etter hver fjerning sjekker `countSolutions` at brettet fortsatt har nøyaktig én løsning (den stopper ved 2). Hvis ikke, settes tallet tilbake
  3. Når det står `givens` tall igjen, returneres både oppgaven og det fulle brettet (løsningen)

Vanskelighetsgraden styres foreløpig bare av hvor mange tall som står igjen. Under ca. 24 tall kommer ikke generatoren alltid ned, fordi alle tallene som er igjen er nødvendige.

Løsningen brukes til å markere feil tall. For scannede brett regnes den ut med `solve` rett etter scanningen.

## Slik gjenkjennes tallene

Fra kamerabilde til 81 tall går bildet gjennom disse stegene i `src/scanner/`:

1. **`scanBoard.ts`**: klipper ut området innenfor guideboksen (pluss 10 % margin, i kameraets fulle oppløsning) og styrer resten av stegene
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

I tillegg til dine egne bilder blandes et utvalg håndskrevne sifre fra [MNIST](https://en.wikipedia.org/wiki/MNIST_database) inn i treningen (lastes ned automatisk første gang). Det går fordi appen behandler cellene til samme format som MNIST. Validering og test bruker bare egne brett. Antallet styres med `--mnist`, og `--mnist 0` trener bare på egne bilder.

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
  components/                Brett, celler, knapper, "Nytt brett"-menyen og kamera
  hooks/useSudokuBoard.ts    Tilstand og logikk for brettet (valg, tall, kandidater, angre,
                             lagring), og hjelpefunksjoner for naboer, konflikter og feil tall
  sudoku/                    Løser og generator
  scanner/                   Fra kamerabilde til 81 tall
  tools/labeling/            Merkeverktøyet for treningsdata (?label)
public/
  favicon.svg                App-ikonet (kilden til alle ikonene)
  models/digits/             Den trente modellen
  pwa-*.png, …               App-ikoner for PWA-en
vite.config.ts               Vite- og PWA-oppsett
pwa-assets.config.ts         Oppsett for å lage app-ikonene
TODO.md                      Planlagte funksjoner og forbedringer
ml/
  train.py                   Trener modellen
  export_tfjs.py             Eksporterer modellen til TensorFlow.js
  requirements.txt           Python-pakkene
  data/                      Treningsdata (ikke i git)
```
