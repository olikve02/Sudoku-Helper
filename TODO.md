# TODO

## Neste opp

- [X] **Nytt / tømt brett**: knapp som tømmer hele brettet (med bekreftelse). Nå som brettet lagres i `localStorage`, er scanning eneste måte å starte på nytt
- [X] **Lås gitte tall**: tall fra scanning og generatoren kan ikke viskes ut eller overskrives (`locked` i `CellState`). Låste tall er hvite og fete (`cell-locked`), egne tall er blå
- [X] **Fjern tall ved å trykke samme tall igjen**
- [ ] **Bekreft før nytt brett**: spør med `confirm` (som i `clearBoard`) før "Nytt brett" overskriver brettet man holder på med
- [ ] **Ferdig-skjerm**: når alle 81 celler er fylt og ingen er i konflikt, vis gratulasjon (og tid, hvis timer er laget)
- [ ] **Fyll inn alle kandidater**: knapp som setter alle lovlige kandidater i tomme celler (bruk `isPeer`)
- [X] **Vis naboer for alle med samme tall** (av/på-knapp): når den er på og du velger en celle med f.eks. 5, markeres rad, kolonne og boks for *alle* 5-ere på brettet, ikke bare den valgte. Cellene som ikke er markert, er da de eneste stedene 5 kan stå. Ligner `isPeerOfSelectedCell`, men sjekker naboer til alle celler med samme `value` som den valgte

## Mindre forbedringer

- [ ] **Tastatur på PC**: tallene 1–9, piltaster for å flytte, Backspace/Delete for å viske ut
- [ ] **Gjør om (redo)**: motstykket til angre
- [ ] **Timer** som går mens man løser (og pauser når appen er i bakgrunnen)
- [ ] **Tester** med Vitest for de rene funksjonene: `isPeer`, `hasConflict`, `isWrong`, `completedNumbers`, `loadBoard`, løseren (`solve`) og generatoren (`generate` skal alltid gi én løsning)
- [ ] **Zoom på brettet**: zoom bare brettet, så knappene står i ro. Enklest med en zoom-knapp (f.eks. 2×) og scrolling, eller kniping med `react-zoom-pan-pinch`. Sjekk først om større kandidater er nok

## Design

- [X] **Nytt design på hovedskjermen**: topplinje med "Nytt brett", avrundet brett, verktøyknapper med tekst, større tallknapper og egen farge i notatmodus. Alltid mørk modus
- [X] **Nytt design på kameraet**: søkeramme med hjørner, mørkt område utenfor, stor utløserknapp, "Leser brettet…" mens bildet behandles, og lommelykt bare når telefonen støtter det
- [X] **Eget app-ikon** (`public/favicon.svg`, lag PNG-ene med `npm run generate-icons`)
- [ ] Test kameraet og lommelykta på en ekte telefon etter det nye designet

## Rydding

- [X] Fjern `console.log` i `completedNumbers`
- [X] Fjern de to `localStorage.setItem`-linjene i `newGame`. `useEffect` lagrer allerede, og linja som lagrer `puzzle` under `"cells"` har feil format
- [X] Fjern `test()` i `generator.ts`
- [ ] `digits[index] > 0 ? true : false` → `digits[index] > 0` i `setScannedValues`
- [ ] `newGame` og `setScannedValues` gjør nesten det samme (lager celler fra 81 tall, setter løsning, nullstiller). Lag én felles hjelpefunksjon
- [ ] Bruk én konstant for hver `localStorage`-nøkkel (`"cells"` og `"solution"` står to steder hver)
- [ ] `==`/`!=` → `===`/`!==` i `useSudokuBoard.ts` (fire steder: `enterNumber`, `isPeer` og `isPeerOfSameValueAsSelected`)
- [ ] Del `useEffect` for lagring i én per verdi (`cells` og `solution`)

## Sudoku-logikk

1. [X] **Løser** (`src/sudoku/solver.ts`): backtracking på `number[]` med 81 tall (0 = tom). Rene funksjoner som `isValid` og `solve`, ingen React
2. [X] **Marker feil tall**: løsningen regnes ut ved scanning (eller kommer fra generatoren) og lagres i `localStorage`. Tall som ikke stemmer med løsningen vises som konflikter (`cell-conflict`)
   - [X] Tøm angre-historikken (`setHistory([])`) ved scanning, "Tøm brett" og "Nytt brett", så angre ikke hopper tilbake til et gammelt brett med feil løsning
   - [ ] Brett som tastes inn for hånd har ingen løsning. Lag en knapp "Lås og start" som låser tallene som står, og regner ut løsningen med `solve` (nå som `locked` finnes)
3. [ ] **Feil tall på det scannede brettet**: et feil tall som allerede er skrevet på papiret (eller lest feil av scanneren) gjør at brettet ikke kan løses, eller gir feil løsning
   - [ ] Varsle brukeren når det scannede brettet ikke kan løses
   - [ ] Sjekk de gitte tallene med `isValid` før `solve` (nå sjekker løseren bare tallene den setter inn selv)
   - [ ] Varsle hvis brettet har mer enn én løsning (bruk `countSolutions` fra `generator.ts`, flytt den gjerne til `solver.ts`)
   - [ ] Finn ut *hvilket* tall som er feil og marker det
4. [ ] **Hint**: vis riktig tall i den valgte cella (løsningen finnes allerede i `solution`)
5. [X] **Generator** (`src/sudoku/generator.ts`). Løsningen er det fulle brettet fra steg 1, så den sendes rett til `setSolution`
   - [X] Fyll et tomt brett tilfeldig: `fillRandom` med `shuffle`
   - [X] Tell løsninger: `countSolutions`, gir seg ved 2
   - [X] Fjern tall i tilfeldig rekkefølge. Får brettet mer enn én løsning, legg tallet tilbake (`generate`)
   - [X] "Nytt brett"-meny med vanskelighetsgrad og scanning (`NewGameMenu.tsx`)
   - [X] Gitte tall er låst
   - [ ] `shuffle` med Fisher–Yates i stedet for `sort(() => Math.random() - 0.5)` (valgfritt, gir jevnere tilfeldighet)
   - [ ] Raskere `countSolutions`, hvis det skal gå under 26 tall. Nå tar 26 tall ca. 0,4 s og 22 tall ca. 4 s
6. [X] **Vanskelighetsgrad, enkel**: lett = 40, middels = 32, vanskelig = 26 gitte tall. Unøyaktig, fordi vanskeligheten avhenger av *hvor* tallene står. Under ca. 24 når ikke generatoren alltid ned, fordi alle tallene som er igjen er nødvendige
7. [ ] **Vanskelighetsgrad, ordentlig**: en "menneskelig" løser som bare bruker kjente teknikker, alltid den enkleste først, og husker den vanskeligste den trengte. Generatoren lager brett til nivået passer:
   - Lett: bare naked og hidden singles
   - Middels: + pairs og pointing pairs
   - Vanskelig: + X-Wing og lignende

   Teknikkene er de samme som på strategi-siden (se under), og kan også brukes til smarte hint ("se etter en hidden single i rad 4")

## Strategi-side

- [ ] **Ny skjerm** med kjente sudoku-strategier og interaktive eksempler. Ny verdi i `Screen` i `App.tsx` (f.eks. `"strategies"`) og et ikon som åpner den (f.eks. `BookOpen`)
- [ ] **Strategiene som data** (f.eks. `src/strategies/strategies.ts`): navn, forklaring, eksempelbrett med kandidater, og hvilke celler som markeres og hvilke kandidater som fjernes. Én komponent viser alle
- [ ] **Interaktivt**: "Vis" markerer cellene, "Neste steg" fjerner kandidatene eller setter inn tallet. Senere: oppgave der brukeren skal finne riktig celle
- [ ] **Gjenbruk `Board`/`Cell`** med en ny prop for strategi-markering, og stil for kandidater som skal fjernes (rød, gjennomstreket)
- [ ] Strategier, fra lett til vanskelig: naked single, hidden single, naked pair, pointing pair, hidden pair, X-Wing

## Scanning

- [ ] **Kontroller scanningen**: vis bildet ved siden av brettet etter scanning, så feil er lette å rette
