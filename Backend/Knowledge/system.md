# Systeminformation

- **Frontend**: React + TypeScript.  
- **Backend**: ASP.NET Core.  
- **Databas**: MySQL (lagrar användare, resurser och bokningar).  
- **Autentisering**: Se **auth.md** för användarinstruktioner.  
- **API**: Backend exponerar endpoints för bokningar, resurser, användare och chatbot.  
- **Chatbot**:  
  - Frontend visar en chatt-widget.  
  - Backend har endpoint `/api/chatbot/ask`.  
  - Chatbot kan:  
    - Ge navigeringsinstruktioner (ex. till startsidan eller Profile).  
    - Använda AI (OpenAI API via `.env`).  
