# FRAP | Farm Resource Allocation Planner

A fully functional, AI-powered agricultural analysis and optimization platform built for a 24-hour hackathon. 

FRAP helps farmers make data-driven decisions on planning their farm layout, optimizing for maximum yield and profit based on strict constraints like land size, water availability, and fertilizer limits.

## Core Features
1. **Intelligent Auth**: Mock authentication session handling to protect dashboard access.
2. **AI Soil Analysis**: Uses Gemini 2.5 Flash to evaluate soil parameters and provide actionable insights on soil health, nutrient tracking, and sustainability.
3. **Resource Optimization Engine**: A mathematical heuristic engine that allocates crops to available land based on maximum profit while strictly adhering to water and fertilizer limitations.
4. **Dynamic Visualization**: A custom CSS-grid driven farm map showing proportional resource allocation.
5. **PDF Export**: Generates professional, offline-ready reports of the farm plan.

## Technology Stack
We strictly adhered to the hackathon guidelines:
- **Frontend**: HTML5, Vanilla CSS3 (Custom Glassmorphism Design System), Vanilla JavaScript (ES6+).
- **Backend**: Node.js, Express.js.
- **AI**: `@google/genai` (Gemini API Integration).
- **Libraries used**: None (No React, Tailwind, Bootstrap, MongoDB, etc.).

## Setup & Deployment

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Open `.env` and configure your API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

3. **Run the Server**
   ```bash
   node server.js
   ```

4. **Access the App**
   Open your browser and navigate to `http://localhost:3000`.

## Directory Structure
- `index.html` - Landing page
- `login.html` & `signup.html` - Authentication
- `dashboard.html` - User hub and historical plans
- `planner.html` - Main data input form and AI request handler
- `report.html` - Data visualization, AI insights, and PDF generation
- `style.css` - Global design system and glassmorphism utilities
- `script.js` - Global functions, API wrappers, and auth logic
- `server.js` - Express backend, Gemini controller, and mathematical optimization engine

## Hackathon Delivery Notes
- Built exactly to spec in purely Vanilla web technologies.
- API Keys are completely secured on the server side correctly.
- UI features custom animations and modern styling without bloat.


video link : https://drive.google.com/file/d/1oQ6su-WbMNVJniVZB-v7-6j14QfioAE6/view?usp=sharing
netlify link: https://frapproject.netlify.app/
render link : https://farm-resource-allocation-planner.onrender.com
ppt link: https://drive.google.com/file/d/1LV67i9HiXzlTix1qjZLolEv4UNCPri99/view?usp=sharing
