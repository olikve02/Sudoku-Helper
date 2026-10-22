# TODO

## Neste opp

- [X] **Nytt / tømt brett**: knapp som tømmer hele brettet (med bekreftelse). Nå som brettet lagres i `localStorage`, er scanning eneste måte å starte på nytt
- [ ] **Lås gitte tall**: tall fra scanning (og senere generatoren) kan ikke viskes ut eller overskrives. Nytt felt `given: boolean` i `CellState`, vises i egen farge. Trengs før generatoren
- [ ] **Ferdig-skjerm**: når alle 81 celler er fylt og ingen er i konflikt, vis gratulasjon (og tid, hvis timer er laget)
- [ ] **Fyll inn alle kandidater**: knapp som setter alle lovlige kandidater i tomme celler (bruk `isPeer`)
- [X] **Vis naboer for alle med samme tall** (av/på-knapp): når den er på og du velger en celle med f.eks. 5, markeres rad, kolonne og boks for *alle* 5-ere på brettet, ikke bare den valgte. Cellene som ikke er markert, er da de eneste stedene 5 kan stå. Ligner `isPeerOfSelectedCell`, men sjekker naboer til alle celler med samme `value` som den valgte

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
2. [X] **Marker feil tall**: løsningen regnes ut ved scanning og lagres i `localStorage`. Tall som ikke stemmer med løsningen vises som konflikter (`cell-conflict`)
   - [ ] Tøm angre-historikken (`setHistory([])`) ved scanning og "Tøm brett", så angre ikke hopper tilbake til et gammelt brett
   - [ ] Virker bare på scannede brett. For brett som tastes inn for hånd trengs "Lås gitte tall" først, så løsningen kan regnes ut fra de gitte tallene
3. [ ] **Feil tall på det scannede brettet**: et feil tall som allerede er skrevet på papiret (eller lest feil av scanneren) gjør at brettet ikke kan løses, eller gir feil løsning
   - [ ] Varsle brukeren når det scannede brettet ikke kan løses
   - [ ] Sjekk de gitte tallene med `isValid` før `solve` (nå sjekker løseren bare tallene den setter inn selv)
   - [ ] Varsle hvis brettet har mer enn én løsning (løseren må kunne telle løsninger, og stoppe ved 2)
   - [ ] Finn ut *hvilket* tall som er feil og marker det
4. [ ] **Hint**: vis riktig tall i den valgte cella (løsningen finnes allerede i `solution`)
5. [ ] **Generator** (`src/sudoku/generator.ts`). Løsningen er det fulle brettet fra steg 1, så den kan sendes rett til `setSolution`
   - [ ] Fyll et tomt brett tilfeldig: kopi av `solve` som prøver tallene i stokket rekkefølge (`shuffle`, gjerne Fisher–Yates)
   - [ ] Tell løsninger: variant av `solve` som teller i stedet for å stoppe ved første, og gir seg ved 2
   - [ ] Fjern tall i tilfeldig rekkefølge. Får brettet mer enn én løsning, legg tallet tilbake
   - [ ] Knapp for "Nytt brett" med valg av vanskelighetsgrad
   - [ ] Lås gitte tall bør være på plass, ellers kan oppgaven viskes ut
6. [ ] **Vanskelighetsgrad, enkel**: stopp fjerningen ved et visst antall gitte tall (lett ≈ 40–45, middels ≈ 32–36, vanskelig ≈ 26–30). Unøyaktig, fordi vanskeligheten avhenger av *hvor* tallene står. Ikke alle brett kan komme ned til lave tall, så generatoren må godta det den får eller starte på nytt
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
