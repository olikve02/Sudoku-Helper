# TODO

## Neste opp

- [X] **Nytt / tømt brett**: knapp som tømmer hele brettet (med bekreftelse). Nå som brettet lagres i `localStorage`, er scanning eneste måte å starte på nytt
- [ ] **Lås gitte tall**: tall fra scanning (og senere generatoren) kan ikke viskes ut eller overskrives. Nytt felt `given: boolean` i `CellState`, vises i egen farge. Trengs før generatoren
- [ ] **Ferdig-skjerm**: når alle 81 celler er fylt og ingen er i konflikt, vis gratulasjon (og tid, hvis timer er laget)
- [ ] **Fyll inn alle kandidater**: knapp som setter alle lovlige kandidater i tomme celler (bruk `isPeer`)
- [ ] **Vis naboer for alle med samme tall** (av/på-knapp): når den er på og du velger en celle med f.eks. 5, markeres rad, kolonne og boks for *alle* 5-ere på brettet, ikke bare den valgte. Cellene som ikke er markert, er da de eneste stedene 5 kan stå. Ligner `isPeerOfSelectedCell`, men sjekker naboer til alle celler med samme `value` som den valgte

## Mindre forbedringer

- [ ] **Tastatur på PC**: tallene 1–9, piltaster for å flytte, Backspace/Delete for å viske ut
- [ ] **Gjør om (redo)**: motstykket til angre
- [ ] **Timer** som går mens man løser (og pauser når appen er i bakgrunnen)
- [ ] **Tester** med Vitest for de rene funksjonene: `isPeer`, `hasConflict`, `isWrong`, `completedNumbers`, `loadBoard`, og løseren (`solve`)

## Rydding

- [ ] Fjern `console.log` i `completedNumbers`
- [ ] Bruk én konstant for hver `localStorage`-nøkkel (`"cells"` og `"solution"` står to steder hver)
- [ ] `==`/`!=` → `===`/`!==` i `useSudokuBoard.ts`
- [ ] Del `useEffect` for lagring i én per verdi (`cells` og `solution`)

## Sudoku-logikk

1. [X] **Løser** (`src/sudoku/solver.ts`): backtracking på `number[]` med 81 tall (0 = tom). Rene funksjoner som `isValid` og `solve`, ingen React
2. [X] **Marker feil tall**: løsningen regnes ut ved scanning og lagres i `localStorage`. Tall som ikke stemmer med løsningen får klassen `wrong-cell`
   - [ ] Tøm angre-historikken (`setHistory([])`) ved scanning og "Tøm brett", så angre ikke hopper tilbake til et gammelt brett
   - [ ] Virker bare på scannede brett. For brett som tastes inn for hånd trengs "Lås gitte tall" først, så løsningen kan regnes ut fra de gitte tallene
3. [ ] **Feil tall på det scannede brettet**: et feil tall som allerede er skrevet på papiret (eller lest feil av scanneren) gjør at brettet ikke kan løses, eller gir feil løsning
   - [ ] Varsle brukeren når det scannede brettet ikke kan løses
   - [ ] Sjekk de gitte tallene med `isValid` før `solve` (nå sjekker løseren bare tallene den setter inn selv)
   - [ ] Varsle hvis brettet har mer enn én løsning (løseren må kunne telle løsninger, og stoppe ved 2)
   - [ ] Finn ut *hvilket* tall som er feil og marker det
4. [ ] **Hint**: vis riktig tall i den valgte cella (løsningen finnes allerede i `solution`)
5. [ ] **Generator**: lag et fullt brett (løseren med tilfeldig rekkefølge på tallene), og fjern tall så lenge det fortsatt finnes nøyaktig én løsning (løseren må kunne telle løsninger, og stoppe ved 2)
6. [ ] **Vanskelighetsgrad**: styr med antall tall som står igjen (f.eks. lett ≈ 40, middels ≈ 32, vanskelig ≈ 26)

## Scanning

- [ ] **Kontroller scanningen**: vis bildet ved siden av brettet etter scanning, så feil er lette å rette
