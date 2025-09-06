# Ads-Setupgenerierung

Eine moderne Webanwendung zur automatisierten Generierung von Google Ads Setups mit n8n Integration.

## Features

- **Setup ohne Keyword Vorlage**: Generiert Keywords mit DataForSEO und erstellt Google Ads Kampagnen
- **Setup mit Keyword Vorlage**: Verwendet vorhandene .xlsx Dateien für die Kampagnenerstellung
- **Echtzeit-Feedback**: Interaktive Workflows mit Google Sheets Integration
- **Moderne UI**: Responsive Design mit Tailwind CSS

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Multer
- **Integration**: n8n Webhooks
- **Deployment**: Azure App Service

## Setup

### Lokale Entwicklung

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd Ads-Prozess
   ```

2. **Frontend Dependencies installieren**
   ```bash
   npm install
   ```

3. **Backend Dependencies installieren**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Environment Variables konfigurieren**
   
   Erstelle `.env` Dateien basierend auf den Beispielen:
   - Root: `.env` (Frontend)
   - Backend: `backend/.env` (Backend)

5. **Anwendung starten**
   ```bash
   # Frontend (Terminal 1)
   npm run dev
   
   # Backend (Terminal 2)
   cd backend
   npm start
   ```

### Environment Variables

#### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:3001
VITE_ADMIN_USERNAME=your_username
VITE_ADMIN_PASSWORD=your_password
```

#### Backend (backend/.env)
```
NODE_ENV=development
PORT=3001
```

## Workflows

### 1. Setup ohne Keyword Vorlage
- User füllt Formular aus (Email, Kundenname, Website, Keywords, etc.)
- Keywords werden mit DataForSEO erweitert
- Google Sheets Dokument wird erstellt
- User überprüft Keywords und setzt fort
- Finale Kampagne wird generiert

### 2. Setup mit Keyword Vorlage
- User lädt .xlsx Datei hoch
- Füllt grundlegende Informationen aus
- Kampagne wird direkt generiert

## API Endpoints

- `POST /api/init-workflow` - Workflow initialisieren
- `POST /api/submit-form` - Formular-Daten senden
- `POST /api/check-outline` - Polling für Responses
- `POST /api/store-outline` - n8n Webhook für Responses

## Deployment

### Azure App Service

1. **GitHub Secrets konfigurieren**:
   - `AZURE_WEBAPP_NAME`: Name deiner Azure App
   - `AZURE_WEBAPP_PUBLISH_PROFILE`: Publish Profile von Azure
   - `VITE_API_BASE_URL`: URL deiner deployed App
   - `VITE_ADMIN_USERNAME`: Admin Username
   - `VITE_ADMIN_PASSWORD`: Admin Passwort

2. **Automatisches Deployment**:
   - Push zu `main` Branch triggert automatisches Deployment
   - GitHub Actions baut Frontend und deployed zu Azure

### Manuelles Deployment

```bash
# Frontend builden
npm run build

# Backend starten
cd backend
npm start
```

## n8n Integration

Die App kommuniziert mit n8n über Webhooks:

- **Setup ohne Keywords**: `https://n8n.srv850193.hstgr.cloud/webhook-test/50d8f2db-2513-40a9-bc0f-dea216acadfb`
- **Setup mit Keywords**: `https://n8n.srv850193.hstgr.cloud/webhook-test/e6b3c337-626e-4ab9-b380-4333b74752d9`

## Development

### Scripts

```bash
# Frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build

# Backend
cd backend
npm start           # Production server
npm run dev         # Development server (falls verfügbar)
```

### Projektstruktur

```
src/
├── components/          # React Komponenten
│   ├── ui/             # UI Komponenten (shadcn/ui)
│   ├── SetupWithoutKeywordsForm.tsx
│   ├── SetupWithKeywordsForm.tsx
│   ├── AdsSetupLoading.tsx
│   ├── KeywordKontrolle.tsx
│   └── AdsSetupComplete.tsx
├── context/            # React Context
├── hooks/              # Custom Hooks
├── lib/                # Utilities
└── pages/              # Seiten

backend/
├── server.js           # Express Server
├── package.json        # Backend Dependencies
└── env.example         # Environment Variables Beispiel
```

## Lizenz

Proprietär - Alle Rechte vorbehalten