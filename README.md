# 🌾 Fasal AI

### AI-Powered Agricultural Intelligence for Farmers

> **Understand your crop. See the bigger picture.**

🔗 **Live Demo:** [Open Fasal AI](https://fasal-ai-tan.vercel.app/)

Fasal AI is an AI-powered agricultural intelligence platform that helps farmers understand crop health, monitor regional agricultural patterns, access weather insights, and make informed farming decisions.

Instead of treating every crop observation as an isolated problem, Fasal AI transforms individual reports into structured agricultural signals and analyzes repeated observations across regions to identify emerging patterns.

---

## 🌱 Why Fasal AI?

Farmers can face several challenges at the same time:

* Identifying crop diseases and visible crop-health problems
* Getting understandable and timely agricultural guidance
* Monitoring weather conditions affecting crops
* Knowing whether a crop issue is isolated or appearing across a region
* Accessing agricultural information in regional languages
* Managing crop information, alerts, weather, and farm insights in one place

Fasal AI brings these capabilities together through a farmer-focused AI platform.

---

## 💡 What Fasal AI Does

A farmer can:

1. 📸 Upload a crop image or report a problem through voice.
2. 🤖 Receive an AI-assisted crop assessment using Gemini.
3. 📊 Convert the observation into a structured agricultural signal.
4. 🌍 Compare recent signals across districts and regions.
5. 📡 Identify emerging agricultural patterns.
6. 🌦️ Monitor weather conditions and their potential farm impact.
7. 🚨 Receive alerts when repeated observations form a significant pattern.
8. 💬 Ask the AI Assistant questions using connected farm information.

### The Core Intelligence Loop

```
Farmer Observation
       ↓
AI-Assisted Crop Assessment
       ↓
Agricultural Signal
       ↓
Regional Signal Analysis
       ↓
Emerging Pattern Detection
       ↓
Farmer Awareness & Action
```

---

# ✨ Key Features

## 📸 AI Crop Assessment

Farmers can upload a crop image and receive an AI-assisted assessment containing:

* Likely crop issue
* Risk level
* AI confidence
* Explanation
* Recommended actions
* Things to avoid
* Prevention guidance

The assessment is generated using **Gemini multimodal AI**.

---

## 🎙️ Voice-Based Crop Reporting

Farmers can report crop problems through voice instead of typing.

The application uses browser-based speech recognition to convert spoken input into text and supports multilingual crop reporting.

Supported languages currently include:

* Telugu
* Hindi
* English

---

## 🌐 Multilingual AI Guidance

Fasal AI can generate crop assessment and agricultural guidance according to the selected language.

This is designed to make AI-powered agricultural information more accessible to users who prefer regional languages.

---

# 🧠 Regional Agricultural Intelligence

One of the core ideas behind Fasal AI is that **one farmer's observation can become part of a larger regional signal**.

After a crop assessment, the system stores a structured agricultural signal containing information such as:

* Crop
* State
* District
* Issue
* Risk
* Confidence
* Language
* Timestamp

Recent signals can then be analyzed based on:

* Crop
* State
* District
* Reported issue
* Risk level
* Recency

Similar observations can be grouped to identify regional patterns.

---

# 📡 Threat Radar

The Threat Radar provides a regional view of agricultural signals.

It analyzes recent observations and identifies areas where repeated crop-related issues are being reported.

The radar considers factors including:

* Number of recent signals
* Risk levels
* Affected crops
* Reported issues
* District distribution

This provides a visual overview of where agricultural attention may be needed.

---

# 🚨 Agricultural Alerts

Fasal AI can generate alerts when multiple similar agricultural observations form a significant pattern.

An alert can include:

* Crop
* Reported issue
* Severity
* Number of observations
* Affected districts
* Latest observation time

The system uses recent agricultural signals rather than treating every individual observation as an alert.

---

# 🌦️ Weather Intelligence

Fasal AI integrates weather information into the farmer dashboard.

The Weather section provides information such as:

* Current weather conditions
* Temperature
* Humidity
* Wind
* Weather alerts
* Farm impact insights

Weather context can be viewed alongside crop intelligence to help farmers understand environmental conditions affecting their crops.

---

# 🤖 AI Farm Assistant

The AI Assistant provides a conversational interface for farm-related questions.

It can use connected farm information and agricultural context to answer questions about:

* Crops
* Farm area
* Harvest information
* Weather
* Crop care
* Irrigation
* Pest-related concerns
* Recent crop scans
* General farm guidance

The assistant uses Gemini for contextual responses and includes local fallback handling for selected farm queries.

---

# 🌾 Farm & Crop Management

Fasal AI includes dedicated sections for:

* **My Farm**
* **My Crops**
* **Calendar**
* **Weather**
* **Farm Intelligence**
* **Farm Economics**
* **AI Assistant**

This creates a unified farmer-facing workspace rather than a standalone crop-disease detector.

---

# 💰 Farm Economics

The Farm Economics section provides a structured view of:

* Revenue
* Expenses
* Profit
* Profit margin
* Farming expenses
* Indicative crop prices
* Relevant agricultural schemes

The displayed market prices are presented as **indicative information**, rather than claiming to be real-time market prices.

---

# 🧠 AI & Google Technology

Fasal AI uses Google AI technologies where they directly support the product.

## Generative AI

### Gemini API

Gemini is used for:

* Multimodal crop-image analysis
* Crop issue assessment
* Risk classification
* Agricultural recommendations
* Multilingual responses
* AI Assistant conversations

### Google AI Studio

Google AI Studio is used for working with the Gemini API and managing the API key used by the application.

> **Note:** Fasal AI currently uses the Gemini API rather than Vertex AI.

---

## 👁️ Vision & Multimodal AI

### Gemini Multimodal

Gemini's multimodal capabilities are used to process crop images and generate structured crop assessments.

The crop assessment flow combines:

```
Crop Image
    +
Farmer Description
    +
Selected Language
    ↓
Gemini Multimodal Analysis
    ↓
Structured Agricultural Assessment
```

---

## 🎙️ Language & Voice

Fasal AI currently uses:

* Browser Speech Recognition
* Gemini multilingual generation
* Telugu
* Hindi
* English

The current implementation **does not use** Google Cloud Speech-to-Text, Text-to-Speech, Translation API, or Dialogflow.

---

# 🔥 Firebase & Data Layer

### Firebase Firestore

Firestore is used to store agricultural signals and support the regional intelligence layer.

Stored signal information includes data such as:

* Crop
* State
* District
* Issue
* Risk
* Confidence
* Language
* Timestamp

These signals power features such as:

* Regional Intelligence
* Threat Radar
* Agricultural Alerts

---

# 🛠️ Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* CSS
* Lucide React

## AI

* Gemini API
* Google AI Studio
* Gemini multimodal capabilities

## Backend

* Next.js API Routes
* Firebase
* Cloud Firestore

## Voice

* Browser Speech Recognition

## Weather

* Weather API

## Development

* Node.js
* npm
* Git
* GitHub

---

# 🏗️ System Architecture

```
Farmer
Image / Voice / Text
        ↓
Next.js Web Application
        ↓
┌─────────────────────────────────┐
│ Gemini Multimodal AI            │
│ Weather API                     │
│ Browser Speech Recognition      │
└─────────────────────────────────┘
        ↓
Firebase Firestore
        ↓
Regional Intelligence
        ↓
Signal Clustering
Risk Analysis
District Patterns
        ↓
Threat Radar
Agricultural Alerts
        ↓
Farmer Dashboard
```

---

# 🔄 End-to-End Workflow

### Step 1 — Report

The farmer uploads a crop image or provides a voice/text description.

### Step 2 — Analyze

Gemini analyzes the crop observation and generates a structured assessment.

### Step 3 — Store

The assessment becomes an agricultural signal and is stored in Firestore.

### Step 4 — Compare

The signal is compared with recent observations involving similar crops and issues.

### Step 5 — Detect

Repeated observations across districts can form an emerging regional pattern.

### Step 6 — Inform

The resulting intelligence is surfaced through the dashboard, radar, and alerts.

---

# 📁 Project Structure

```
fasal-ai/
├── public/
├── src/
│   ├── app/
│   │   ├── alerts/
│   │   ├── api/
│   │   │   ├── alerts/
│   │   │   ├── analyze/
│   │   │   ├── assistant/
│   │   │   ├── radar/
│   │   │   ├── signals/
│   │   │   └── weather/
│   │   ├── assistant/
│   │   ├── calendar/
│   │   ├── crops/
│   │   ├── dashboard/
│   │   ├── farm-economics/
│   │   ├── farm-intelligence/
│   │   ├── my-farm/
│   │   ├── radar/
│   │   ├── results/
│   │   ├── scan/
│   │   └── weather/
│   ├── components/
│   │   ├── brand/
│   │   ├── landing/
│   │   ├── layout/
│   │   └── ui/
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── i18n.ts
│   │   ├── signalEngine.ts
│   │   ├── utils.ts
│   │   └── weather.ts
│   └── types/
├── .gitignore
├── package.json
├── package-lock.json
├── next.config.ts
└── tsconfig.json
```

---

# 🚀 Getting Started

## Prerequisites

Install:

* Node.js
* npm
* Git

## Clone the Repository

```
git clone https://github.com/PENDHOTAPOORNITHA/Fasal-AI.git
cd Fasal-AI
```

## Install Dependencies

```
npm install
```

## Environment Variables

Create a file named `.env.local`.

Add the required environment variables:

```
GEMINI_API_KEY=your_gemini_api_key
DEMO_MODE=false

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

WEATHER_API_KEY=your_weather_api_key
```

Never commit `.env.local` or API keys to GitHub.

The project's `.gitignore` excludes environment files.

## Run Locally

```
npm run dev
```

Open the application at:

```
http://localhost:3000
```

---

# 🔐 Security

Fasal AI keeps credentials outside the source code using environment variables.

The repository excludes:

* `.env` files
* API keys
* `node_modules`
* `.next`
* Local build artifacts
* Local backup archives

Never expose private API credentials in client-side code or public repositories.

---

# 🌱 Future Scope

Fasal AI can be extended with additional agricultural data and AI capabilities, including:

* More crop and disease coverage
* Additional Indian regional languages
* Satellite and remote-sensing data
* IoT-based farm monitoring
* Soil and crop-condition integration
* Government agricultural datasets
* Market-price intelligence
* Personalized crop calendars
* Offline-first support
* Mobile application
* Advanced regional agricultural forecasting
* Integration with additional geospatial and climate data sources

These are **future possibilities** and are not currently implemented in the project.

---

# 🏆 Project Context

Fasal AI was developed as an AI-focused agricultural technology project centered on combining:

**Multimodal AI + Farmer Tools + Weather Intelligence + Regional Agricultural Signals**

The project explores how individual farmer observations can be transformed into structured signals and analyzed collectively to provide broader agricultural awareness.

---

# ⚠️ Disclaimer

Fasal AI provides AI-assisted agricultural information and decision support.

AI-generated crop assessments may not always be accurate and should not be treated as a definitive professional diagnosis.

Important crop-health and farming decisions should be verified using qualified agricultural experts and trusted local sources.

---

# 📄 License

This project currently does not include an open-source license.

All rights reserved unless otherwise stated.
