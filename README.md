# Innovia Hub - Intranät och bokningssystem

Detta repo innehåller min version av projektarbetet **Innovia Hub**.

## Om uppgiften

Innovia Hub är ett intranät och bokningssystem för coworkingcentret Innovia Hub. Systemet är byggt för att underlätta vardagen för både medlemmar och administratörer.

För användaren
- Medlemmar kan logga in och boka resurser i realtid, som skrivbord, mötesrum, VR-headsets och AI-servrar.
- Systemet visar aktuellt tillgängliga tider och uppdateras automatiskt via SignalR när någon annan gör en bokning - användaren ser direkt om en tid blir upptagen.
- En responsiv och enkel frontend gör att systemet kan användas på dator, surfplatta och mobil.
- Chattbott som hjälper användaren med hur man kan använda appen

För administratören
- Administratörer har en egen panel där de kan hantera användare, resurser och bokningar.
- De kan aktivera/inaktivera resurser, ta bort bokningar eller uppdatera information om medlemmar.
- All data hanteras via ett API som backend tillhandahåller.

Tekniska funktioner
- Backend är byggt i ASP.NET Core med Entity Framework Core och Identity för autentisering och behörigheter.
- Bokningar och användare lagras i en SQL-databas (MySQL).
- Realtidskommunikation sker med SignalR, vilket gör att alla användare får live-uppdateringar utan att behöva ladda om sidan.
- Frontend är byggd i React (Vite) och kommunicerar med backend via ett REST API och en SignalR-klient.


## Vår Stack

- **Backend:** ASP.NET Core (C#)
- **Frontend:** React (Vite)
- **Databas:** SQL (MySQL)
- **Realtidskommunikation:** SignalR
- **API (framtid):** Mockat sensor-API

---

## Kom igång – Installation (Databas + Backend + Frontend)

- Den här README:n beskriver hur du startar din app (Backend + Frontend + IoT-API).
- Snabb översikt över portar som ska vara igång när du använder IoT‑sidan:
  - DeviceRegistry.Api: 5101
  - Ingest.Gateway: 5102
  - Realtime.Hub: 5103
  - Portal.Adapter: 5104
  - (Edge.Simulator: valfritt för test – publicerar MQTT var 10s)

Krav på verktyg/versioner
- **.NET SDK:** 9.0
- **Node.js:** 18 eller 20 rekommenderas
- **MySQL:** igång lokalt på `localhost` (exemplet nedan visar port `3306` med `root`)

Nedan följer en steg-för-steg guide för att köra projektet lokalt.

### 1. Klona projekten
```sql
# Klona backend/frontend-projektet (detta repo)
git clone https://github.com/seb-kvist/InnoviaHubSeb.git

# Klona IoT-plattformen
git clone https://github.com/seb-kvist/innovia-iot.git
```

### 2. Starta IoT-plattformen (Innovia-IoT)

Innan du startar backend måste alla IoT-API:er köras via Docker Compose.

#### 2.1 Starta Docker Compose
```sql
cd innovia-iot/deploy
docker compose up -d
```
#### 2.2 Starta upp API-tjänsterna i ordning
```sql
cd src/DeviceRegistry.Api && dotnet run
cd src/Portal.Adapter   && dotnet run
cd src/Realtime.Hub     && dotnet run
cd src/Ingest.Gateway   && dotnet run

# Vid test av simulera data till sensorer
cd src/Edge.Simulator && dotnet run
```

#### 2.3 Seed Tenant & Devices
När DeviceRegistry.Api är igång (port 5101), måste du skapa din tenant och sensorer.
Det görs med script i innovia-iot/scripts/.

Windows (PowerShell):
```sql
cd innovia-iot/scripts
./seed-seb-data.ps1
```
MacOS/Linux:
```sql
cd innovia-iot/scripts
chmod +x seed-seb-data.sh
./seed-seb-data.sh

# Om du får jq: command not found → kör brew install jq.
```

Exempel på lyckad output:
```sql
🌱 Seeding Sebastians Hub data...
✅ Tenant skapad: c5ba0b5e-04a2-402a-97dd-c61e7bb9adc0
📡 Skapar device: Toshi-Maestro-Temp-333 (toshi001)
...
✅ Klart! Tenant: sebastians-hub (c5ba0b5e-04a2-402a-97dd-c61e7bb9adc0)
```
OBS!!! Kopiera Tenant ID:t som du får ovan då det kommer användas i InnoviaHubSeb


### 3. Backend (InnoviaHubSeb)
```sql
cd InnoviaHubSeb/Backend
```

#### 3.1
1) Skapa MySQL‑databas lokalt (exempel för port 3306 med root)
```sql
CREATE DATABASE innoviahub_seb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 3.2 Skapa `Backend/.env`
Nedan är ett exempel så ändra för att matcha din lokala mysql databas + din API nyckel
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=dittlösenordhär
DB_NAME=namnpådatabashär

# OpenAI (för chatbotten)
OPENAI_API_KEY=...din api nyckel...
```
Notera: `.env` läses automatiskt av backend. Kör du från projektroten med `--project` fungerar det också.

#### 3.3 Initiera databasen (EF Core)
```powershell
# Kör från Backend-mappen
cd Backend

# Installera EF-verktyget
dotnet tool install --global dotnet-ef

# Första gången: om det INTE finns någon migrations-mapp, skapa en initial migration
dotnet ef migrations add InitialCreate

# Skapa/uppdatera databasen enligt migrations
dotnet ef database update
```

#### 3.4 Installera och kör backend
```powershell
cd Backend
dotnet restore
dotnet build
dotnet run
```

Backend startar på `http://localhost:5022` (API-bas: `http://localhost:5022/api`).

#### 3.5 Klistra in ID från steg 2.2 i /Backend/appsettings.json

```powershell
# Byt ut ditt tenant ID nedan
"TenantId": "X",
```

Övrigt (efter backend start)
- I din backend finns en bakgrundstjänst som kopplar upp sig mot Realtime.Hub (5103) och vidarebefordrar mätningar till din lokala SignalR‑hub.
- Om Realtime.Hub inte är igång kommer IoT‑sidan inte visa live‑uppdateringar.
- Projektet seedar data inkl. admin vid första körningen (se `Services/DbSeeder.cs`).
- Standardadmin: e‑post `admin@example.com`, lösenord `Admin@123`, roll `admin`.
- SignalR hub: `/bookingHub`.

### 4. Frontend

Frontend använder Vite och läser API-bas via `VITE_API_URL`.

#### 4.1 Skapa en .env i `Frontend`
```env
VITE_API_URL=http://localhost:5022/api
```

#### 4.2 Öppna en ny terminal i `Frontend/` och kör:
```powershell
cd Frontend
npm install
npm run dev
```

Frontend startar på `http://localhost:5173` 

IoT‑checkpoint (innan du går till IoT‑sidan i frontend)
- Navigationsknappen “IoT” syns endast för admin (rollen sätts i din app). Logga in som admin: `admin@example.com` / `Admin@123`.
- Se till att följande Innovia‑IoT‑tjänster körs: 5101, 5102, 5103, 5104. 
- Edge.Simulator kan köras för att skicka fejkade mätvärden var 10:e sekund.

---

## Strukturen
- `Backend/` – ASP.NET Core API, EF Core, Identity, SignalR, OpenAI-API
- `Frontend/` – React + Vite, React Router, SignalR-klient

## Chatbot (OpenAI + RAG)

- API‑nyckel läses från `OPENAI_API_KEY` i `Backend/.env`.
- Endpoint för frågor: `POST /api/chatbot/ask` med `{ "question": "..." }`.
- Chatboten använder enkel RAG: läser markdown i `Backend/Knowledge/*.md` och skickar relevanta utdrag som kontext till modellen.

## Databasen
- Starta MySQL lokalt (port 3306 i exemplen).
- Databasen och seed‑data skapas automatiskt första gången du kör backend.
