# Systeminformation

- **Frontend**: React + TypeScript.  
- **Backend**: ASP.NET Core.  
- **Databas**: MySQL (lagrar användare, resurser och bokningar).  
- **Autentisering**:  
  - Inloggning sker via sidan **Login** med e-postadress och lösenord.  
  - Nya konton registreras via sidan **Register**.  
  - Efter inloggning får användaren tillgång till sina bokningar.  
  - Administratörer loggar in på samma sätt men får tillgång till Admin-funktioner.  
- **API**: Backend exponerar endpoints för bokningar, resurser, användare och chatbot.  
- **Chatbot**:  
  - Frontend visar en chatt-widget.  
  - Backend har endpoint `/api/chatbot/ask`.  
  - Chatbot kan:  
    - Ge navigeringsinstruktioner (ex. till Resources eller Profile).  
    - Hämta data från databasen (ex. dina bokningar).  
    - Utföra bokningsåtgärder (skapa eller avboka).  
    - Använda AI (OpenAI API via `.env`).  
