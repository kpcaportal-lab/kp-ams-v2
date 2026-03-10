---
description: How to run the KP-AMS v2 project locally
---

# Setup & Execution Guide

To run the project locally on your machine, you need to have two separate terminals (Command Prompt or PowerShell) open: one for the **Backend Server** and one for the **Frontend Application**.

## 1. Run the Backend Server
1. Open a new Command Prompt (CMD).
2. Navigate to the server directory:
   ```cmd
   cd /d d:\KP-AMS\kp-ams-v2\server
   ```
3. Run the development server:
   ```cmd
   npm run dev
   ```
   *Expect to see: "🚀 KP AMS Server running on port 4000"*

## 2. Run the Frontend Application
1. Open a second Command Prompt (CMD).
2. Navigate to the root project directory:
   ```cmd
   cd /d d:\KP-AMS\kp-ams-v2
   ```
3. Run the development server:
   ```cmd
   npm run dev
   ```
   *Expect to see: "Ready in ... ms" and "http://localhost:3000"*

## 3. Access the Portal
Open your browser and go to:
[http://localhost:3000](http://localhost:3000)

## Troubleshooting
- **Port Conflict**: If port 4000 or 3000 is already in use, you can kill the existing process or check the `.env` files.
- **Node Modules**: If it's your first time running, you might need to run `npm install` in both directories first.
