# Innovia Hub Backend

> Den har grenen (`backend-only`) innehaller endast backend-projektet, tillhorande tester och verktyg. Frontend-koden ligger kvar i `main`-grenen.

## Innehall
- `Backend/`  ASP.NET Core API, EF Core, Identity, SignalR och tester
- `test.rest`  Exempelanrop mot API:et
- `InnoviaHubSeb.sln` och `Innovia-Hub-2.sln`  Visual Studio-losningar for backend
- `.gitignore`  Ignorerar bin/obj/node_modules med mera

## Kom igang

### Forutsattningar
- .NET SDK 9.0
- MySQL-instans lokalt (standardexempel anvander port 3306 och anvandaren `root`)
- Docker + Docker Compose (for Innovia IoT-plattformen)
- Valfritt: PowerShell 7 eller Bash for scripts

### 1. Klona repos
```bash
# Klona backend-grenen
git clone https://github.com/seb-kvist/InnoviaHubSeb.git
cd InnoviaHubSeb
git checkout backend-only

# Klona Innovia IoT (kravs for sensordata och seeding)
git clone https://github.com/seb-kvist/innovia-iot.git
```

### 2. Starta Innovia IoT-plattformen
IoT-repot levererar DeviceRegistry, Portal Adapter, Realtime Hub och Ingest Gateway.

```bash
cd innovia-iot/deploy
docker compose up -d
```

```bash
cd ../src/DeviceRegistry.Api && dotnet run
cd ../Portal.Adapter      && dotnet run
cd ../Realtime.Hub        && dotnet run
cd ../Ingest.Gateway      && dotnet run

# Valfritt: simulera sensorflode
cd ../Edge.Simulator && dotnet run
```

#### Seed tenant och enheter
```powershell
cd innovia-iot/scripts
./seed-seb-data.ps1   # Windows

# eller
chmod +x seed-seb-data.sh && ./seed-seb-data.sh   # macOS/Linux
```
Spara Tenant ID som skrivs ut; det anvands senare i backendens `appsettings.json`.

### 3. Konfigurera och starta backend
```bash
cd InnoviaHubSeb/Backend
```

#### 3.1 Skapa MySQL-databas
```sql
CREATE DATABASE innoviahub_seb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 3.2 Skapa `Backend/.env`
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=byt-detta
DB_NAME=innoviahub_seb

# OpenAI (for chatbot)
OPENAI_API_KEY=din-nyckel-har
```

#### 3.3 Uppdatera `appsettings.json`
Ersatt `InnoviaIot:TenantId` med Tenant ID fran seeding-steget.

#### 3.4 Migrera och starta API
```bash
dotnet restore
dotnet ef database update
dotnet build
dotnet run
```
Backend lyssnar som standard pa `http://localhost:5022`.

### 4. Testa API:et
- Anvand `test.rest` for snabbtest av endpoints (REST Client extension i VS Code eller Thunder Client).
- `dotnet test` kan koras i `Backend/` for att validera enhetstester.

## Ovriga noteringar
- Projektet seedar standarddata (inklusive admin: `admin@example.com` / `Admin@123`).
- SignalR hubbar: `/bookingHub` och `/iotHub` (se `Hubs/`).
- `Backend/Services/PortalAdapterService.cs` hanterar kopplingen mot IoT-plattformens Portal Adapter.
- Behall grenen `backend-only-legacy` om du vill jamforra med tidigare variant som inkluderade byggartefakter.
