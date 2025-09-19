const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// In production, serve static files from the dist directory at repo root
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '..', 'dist')));
}

// Simple in-memory storage for outlines (in production, use a database)
const outlineStorage = new Map();

// Helper function to clean JSON responses from n8n
function cleanJsonResponse(responseText) {
  let cleanedText = responseText.trim();
  
  // Remove BOM (Byte Order Mark) if present
  if (cleanedText.length > 0 && cleanedText.charCodeAt(0) === 0xFEFF) {
    cleanedText = cleanedText.slice(1);
    console.log('🔧 Removed BOM from response');
  }
  
  // Remove any non-printable characters that might interfere with JSON parsing
  cleanedText = cleanedText.replace(/[\x00-\x1F\x7F]/g, '');
  
  console.log('🔧 Cleaned response text:', cleanedText);
  console.log('🔧 Cleaned text length:', cleanedText.length);
  
  return cleanedText;
}

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

// Endpoint for n8n to store outline, article, end, or getFeedback response (called by n8n webhook)
app.post('/api/store-outline', (req, res) => {
  try {
    console.log('📥 Received request to /api/store-outline');
    console.log('Request body type:', typeof req.body);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Handle potential malformed JSON by parsing manually if needed
    let bodyData = req.body;
    if (typeof req.body === 'string') {
      try {
        // Clean the JSON string before parsing
        const cleanedBody = cleanJsonResponse(req.body);
        bodyData = JSON.parse(cleanedBody);
      } catch (parseError) {
        console.error('❌ Failed to parse request body as JSON:', parseError);
        console.error('Raw body:', req.body);
        return res.status(400).json({ error: 'Invalid JSON in request body' });
      }
    }
    
    const { resumeUrl, outline, article, end, getFeedback } = bodyData;
    
    if (!resumeUrl || (!outline && !article && !end && !getFeedback)) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ error: 'Resume URL and either outline, article, end, or getFeedback are required' });
    }

    if (outline) {
      console.log('📝 Storing outline for resume URL:', resumeUrl);
      outlineStorage.set(resumeUrl, { type: 'outline', content: outline });
    } else if (article) {
      console.log('📄 Storing article for resume URL:', resumeUrl);
      outlineStorage.set(resumeUrl, { type: 'article', content: article });
    } else if (end) {
      console.log('🏁 Storing end response for resume URL:', resumeUrl);
      outlineStorage.set(resumeUrl, { type: 'end', content: end });
    } else if (getFeedback) {
      console.log('🔄 Storing getFeedback for resume URL:', resumeUrl, 'URL:', getFeedback);
      outlineStorage.set(resumeUrl, { type: 'getFeedback', content: getFeedback });
    }
    
    console.log('✅ Content stored successfully');
    res.json({ success: true, message: 'Content stored successfully' });
  } catch (error) {
    console.error('❌ Error storing content:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize workflow endpoint
app.post('/api/init-workflow', async (req, res) => {
  try {
    const { workflowType } = req.body;
    console.log('Initializing workflow:', workflowType || 'default');
    
    let webhookUrl;
    if (workflowType === 'setupWithKeywords') {
      webhookUrl = 'https://n8n.srv850193.hstgr.cloud/webhook/e6b3c337-626e-4ab9-b380-4333b74752d9';
    } else {
      webhookUrl = 'https://n8n.srv850193.hstgr.cloud/webhook/50d8f2db-2513-40a9-bc0f-dea216acadfb';
    }
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (response.ok) {
      let data;
      try {
        const responseText = await response.text();
        console.log('Raw response from n8n (init):', responseText);
        
        // Clean the response text before parsing
        const cleanedText = cleanJsonResponse(responseText);
        
        // Try to parse as JSON
        data = JSON.parse(cleanedText);
        console.log('Full response from n8n:', JSON.stringify(data, null, 2));
        console.log('Workflow initialized, resume URL:', data.resumeURL);
        
        // Check if n8n returned content directly in the initial response
        if (data.getFeedback) {
          console.log('🔄 n8n returned getFeedback in initial response:', data.getFeedback);
          outlineStorage.set(data.resumeURL, { type: 'getFeedback', content: data.getFeedback });
        }
        if (data.end) {
          console.log('🏁 n8n returned end in initial response:', data.end);
          outlineStorage.set(data.resumeURL, { type: 'end', content: data.end });
        }
        
        res.json(data);
      } catch (parseError) {
        console.error('❌ Failed to parse n8n init response as JSON:', parseError);
        console.error('Raw response:', responseText);
        return res.status(500).json({ 
          error: 'Ungültige Antwort von n8n',
          details: 'Die Antwort konnte nicht als JSON geparst werden'
        });
      }
    } else {
      const errorText = await response.text();
      console.error('Failed to initialize workflow:', response.status, errorText);
      res.status(response.status).json({ error: 'Failed to initialize workflow' });
    }
  } catch (error) {
    console.error('Error initializing workflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit form data to resume URL
app.post('/api/submit-form', upload.single('file'), async (req, res) => {
  try {
    // Get resumeUrl from query parameter or body
    const resumeUrl = req.query.resumeUrl || req.body.resumeUrl;
    
    if (!resumeUrl) {
      return res.status(400).json({ error: 'Resume URL is required' });
    }

    console.log('Submitting form data to resume URL:', resumeUrl);
    console.log('Form fields:', req.body);
    console.log('File uploaded:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file');

    // Check if this is a feedback submission
    if (req.body.feedback === true || req.body.feedback === 'true') {
      console.log('This is a feedback submission, sending JSON directly');
      
      // Send JSON directly for feedback
      const response = await fetch(resumeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback: true }),
      });

      if (response.ok) {
        let responseData;
        try {
          const responseText = await response.text();
          console.log('Raw response from n8n (feedback):', responseText);
          
          // Clean the response text before parsing
          const cleanedText = cleanJsonResponse(responseText);
          
          // Try to parse as JSON
          responseData = JSON.parse(cleanedText);
          console.log('Feedback submitted successfully, n8n response:', responseData);
        } catch (parseError) {
          console.error('❌ Failed to parse n8n feedback response as JSON:', parseError);
          console.error('Raw response:', responseText);
          return res.status(500).json({ 
            error: 'Ungültige Antwort von n8n',
            details: 'Die Antwort konnte nicht als JSON geparst werden'
          });
        }
        
        // Check if n8n returned content directly and store it
        if (responseData.outline) {
          console.log('Storing outline from direct response:', responseData.outline);
          outlineStorage.set(resumeUrl, { type: 'outline', content: responseData.outline });
        } else if (responseData.article) {
          console.log('Storing article from direct response:', responseData.article);
          outlineStorage.set(resumeUrl, { type: 'article', content: responseData.article });
        } else if (responseData.end) {
          console.log('Storing end response from direct response:', responseData.end);
          outlineStorage.set(resumeUrl, { type: 'end', content: responseData.end });
        } else if (responseData.getFeedback) {
          console.log('Storing getFeedback from direct response:', responseData.getFeedback);
          outlineStorage.set(resumeUrl, { type: 'getFeedback', content: responseData.getFeedback });
        }
        
        res.json(responseData);
      } else {
        const errorText = await response.text();
        console.error('Failed to submit feedback:', response.status, errorText);
        res.status(response.status).json({ error: 'Failed to submit feedback' });
      }
    } else {
      // Regular form submission with FormData
      const form = new FormData();
      
      // Add all form fields from the request body
      Object.entries(req.body).forEach(([key, value]) => {
        if (key !== 'resumeUrl') { // Don't include resumeUrl in the form data
          form.append(key, value);
        }
      });

      // Add file if present
      if (req.file) {
        form.append('file', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype
        });
      }

      // Send to n8n resume URL
      const response = await fetch(resumeUrl, {
        method: 'POST',
        headers: {
          ...form.getHeaders(),
        },
        body: form,
      });

    if (response.ok) {
      let responseData;
      try {
        const responseText = await response.text();
        console.log('Raw response from n8n:', responseText);
        
        // Try to parse as JSON
        console.log('🔍 Attempting to parse JSON response...');
        console.log('🔍 Response length:', responseText.length);
        console.log('🔍 Response type:', typeof responseText);
        console.log('🔍 First 100 chars:', responseText.substring(0, 100));
        console.log('🔍 Last 100 chars:', responseText.substring(Math.max(0, responseText.length - 100)));
        
        // Clean the response text before parsing
        const cleanedText = cleanJsonResponse(responseText);
        
        responseData = JSON.parse(cleanedText);
        console.log('✅ Form submitted successfully, n8n response:', JSON.stringify(responseData, null, 2));
      } catch (parseError) {
        console.error('❌ Failed to parse n8n response as JSON:', parseError);
        console.error('Raw response:', responseText);
        return res.status(500).json({ 
          error: 'Ungültige Antwort von n8n',
          details: 'Die Antwort konnte nicht als JSON geparst werden'
        });
      }
      
      // Check if n8n returned content directly and store it
      if (responseData.outline) {
        console.log('📝 Storing outline from direct response:', responseData.outline);
        outlineStorage.set(resumeUrl, { type: 'outline', content: responseData.outline });
      } else if (responseData.article) {
        console.log('📄 Storing article from direct response:', responseData.article);
        outlineStorage.set(resumeUrl, { type: 'article', content: responseData.article });
      } else if (responseData.end) {
        console.log('🏁 Storing end response from direct response:', responseData.end);
        outlineStorage.set(resumeUrl, { type: 'end', content: responseData.end });
      } else if (responseData.getFeedback) {
        console.log('🔄 Storing getFeedback from direct response:', responseData.getFeedback);
        console.log('🔄 Resume URL for storage:', resumeUrl);
        outlineStorage.set(resumeUrl, { type: 'getFeedback', content: responseData.getFeedback });
        console.log('🔄 getFeedback stored successfully in outlineStorage');
      } else {
        console.log('⚠️ n8n did not return any content in the response');
        console.log('⚠️ Available keys in response:', Object.keys(responseData));
      }
      
      res.json(responseData);
    } else {
      const errorText = await response.text();
      console.error('Failed to submit form:', response.status, errorText);
      res.status(response.status).json({ error: 'Failed to submit form' });
    }
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit feedback to resume URL
app.post('/api/submit-feedback', async (req, res) => {
  try {
    const { resumeUrl, feedback, editedOutline, editedArticle } = req.body;
    
    if (!resumeUrl) {
      return res.status(400).json({ error: 'Resume URL is required' });
    }

    console.log('Submitting feedback to resume URL:', resumeUrl);
    console.log('Feedback:', feedback);
    console.log('Edited outline:', editedOutline);
    console.log('Edited article:', editedArticle);

    // Clear any existing content for this resume URL to prevent showing old content
    if (outlineStorage.has(resumeUrl)) {
      console.log('Clearing existing content for resume URL:', resumeUrl);
      outlineStorage.delete(resumeUrl);
    }

    // Create FormData object for feedback
    const form = new FormData();
    form.append('feedback', feedback || '');
    if (editedOutline) {
      form.append('editedOutline', editedOutline);
    }
    if (editedArticle) {
      form.append('editedArticle', editedArticle);
    }

    // Send to n8n resume URL
    const response = await fetch(resumeUrl, {
      method: 'POST',
      headers: {
        ...form.getHeaders(),
      },
      body: form,
    });

    if (response.ok) {
      let responseData;
      try {
        const responseText = await response.text();
        console.log('Raw response from n8n (feedback form):', responseText);
        
        // Clean the response text before parsing
        const cleanedText = cleanJsonResponse(responseText);
        
        // Try to parse as JSON
        responseData = JSON.parse(cleanedText);
        console.log('Feedback submitted successfully');
        console.log('Response from n8n:', responseData);
      } catch (parseError) {
        console.error('❌ Failed to parse n8n feedback form response as JSON:', parseError);
        console.error('Raw response:', responseText);
        return res.status(500).json({ 
          error: 'Ungültige Antwort von n8n',
          details: 'Die Antwort konnte nicht als JSON geparst werden'
        });
      }
      
      // Check if n8n returned content directly in the response
      if (responseData.outline) {
        console.log('n8n returned outline directly in feedback response');
        outlineStorage.set(resumeUrl, { type: 'outline', content: responseData.outline });
        console.log('Stored outline in storage for resume URL:', resumeUrl);
      } else if (responseData.article) {
        console.log('n8n returned article directly in feedback response');
        outlineStorage.set(resumeUrl, { type: 'article', content: responseData.article });
        console.log('Stored article in storage for resume URL:', resumeUrl);
      } else if (responseData.end) {
        console.log('n8n returned end response directly in feedback response');
        outlineStorage.set(resumeUrl, { type: 'end', content: responseData.end });
        console.log('Stored end response in storage for resume URL:', resumeUrl);
      } else if (responseData.getFeedback) {
        console.log('n8n returned getFeedback directly in feedback response');
        outlineStorage.set(resumeUrl, { type: 'getFeedback', content: responseData.getFeedback });
        console.log('Stored getFeedback in storage for resume URL:', resumeUrl);
      } else {
        console.log('No content returned in feedback response, waiting for n8n to call /api/store-outline');
      }
      
      res.json(responseData);
    } else {
      const errorText = await response.text();
      console.error('Failed to submit feedback:', response.status, errorText);
      res.status(response.status).json({ error: 'Failed to submit feedback' });
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check for outline or article response (polling endpoint)
app.post('/api/check-outline', async (req, res) => {
  try {
    const { resumeUrl } = req.body;
    
    if (!resumeUrl) {
      return res.status(400).json({ error: 'Resume URL is required' });
    }

    console.log('🔍 Checking for content response from:', resumeUrl);
    console.log('🔍 Current storage keys:', Array.from(outlineStorage.keys()));
    console.log('🔍 Storage size:', outlineStorage.size);

    // Check if content is stored for this resume URL
    const storedContent = outlineStorage.get(resumeUrl);
    
    if (storedContent) {
      console.log('✅ Found content for resume URL:', resumeUrl, 'Type:', storedContent.type, 'Content:', storedContent.content);
      // Remove the content from storage after retrieving it
      outlineStorage.delete(resumeUrl);
      
      if (storedContent.type === 'outline') {
        console.log('📝 Returning outline response');
        res.json({ outline: storedContent.content });
      } else if (storedContent.type === 'article') {
        console.log('📄 Returning article response');
        res.json({ article: storedContent.content });
      } else if (storedContent.type === 'end') {
        console.log('🏁 Returning end response:', storedContent.content);
        res.json({ end: storedContent.content });
      } else if (storedContent.type === 'getFeedback') {
        console.log('🔄 Returning getFeedback response:', storedContent.content);
        const response = { getFeedback: storedContent.content };
        console.log('🔄 Response object:', JSON.stringify(response, null, 2));
        res.json(response);
      }
    } else {
      console.log('No content found for resume URL:', resumeUrl);
      res.json({ outline: null, article: null, getFeedback: null, end: null });
    }
  } catch (error) {
    console.error('Error checking content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Catch-all handler: send back React's index.html file for client-side routing
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
