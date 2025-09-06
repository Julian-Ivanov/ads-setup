# Article Craft Backend

This backend server handles communication with n8n webhooks to avoid CORS issues.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp env.example .env
   ```

3. **Configure environment variables:**
   Edit `.env` file (optional - defaults are fine):
   ```
   PORT=3001
   ```

4. **Start the server:**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### POST /api/init-workflow
Initializes a new n8n workflow and returns the resume URL.

**Response:**
```json
{
  "resumeUrl": "https://n8n.srv850193.hstgr.cloud/webhook/resume/abc123"
}
```

### POST /api/submit-form
Submits form data to the n8n resume URL.

**Request Body:**
```json
{
  "resumeUrl": "https://n8n.srv850193.hstgr.cloud/webhook/resume/abc123",
  "formData": {
    "author": "John Doe",
    "email": "john@example.com",
    "mainKeyword": "SEO",
    // ... other form fields
  }
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Backend server is running"
}
```

## CORS Configuration

The server is configured to allow requests from your frontend (typically running on localhost:5173 for Vite).

## Error Handling

All endpoints include proper error handling and logging. Check the console for detailed error messages.
