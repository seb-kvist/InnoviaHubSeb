# Innovia Hub Frontend

> Den här grenen (`frontend-only`) är avsedd för den fristående frontend-deployen på DigitalOcean. För lokal utveckling eller fullstack-körning ska du i stället klona `main`, där både frontend- och backend-koden finns samlad.

## Innehåll
- `Frontend/` - Vite + React-app med alla komponenter, konfigurering och resurser
- `.gitignore` - Ignorerar Node-moduler, build-artifakter m.m.

## Förutsättningar
- Node.js 18 eller 20
- npm (följer vanligtvis med Node.js)

## Kom igång

1. Installera beroenden
   ```bash
   cd Frontend
   npm install
   ```

2. Skapa en `.env` i `Frontend/` för att peka mot backend-API:t
   ```env
   VITE_API_URL=http://localhost:5022/api
   ```

3. Starta utvecklingsservern
   ```bash
   npm run dev
   ```
   Applikationen körs som standard på http://localhost:5173.

4. Bygga för produktion
   ```bash
   npm run build
   npm run preview   # valfritt: testar den byggda versionen lokalt
   ```

## Beroenden & skript
`Frontend/package.json` innehåller samtliga npm-skript och beroenden. Vanliga skript:
- `npm run dev` - Startar Vite-utvecklingsservern
- `npm run build` - Bygger en produktionsbundle till `Frontend/dist`
- `npm run lint` - (om konfigurerat) kör ESLint

## Övrigt
- Bild- och stilfiler finns i `Frontend/public/` respektive `Frontend/src/styles/`.
- SignalR-klienten konfigureras i `Frontend/src/signalRConnection.ts` och använder `VITE_API_URL`.
- För full funktionalitet krävs att motsvarande backend från huvudgrenen körs och att IoT-tjänsterna är igång, precis som beskrivs i huvud-README:n på `main`.
