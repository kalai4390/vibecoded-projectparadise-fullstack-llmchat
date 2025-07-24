# Resort App with Web, Mobile, and LLM Integration

## Overview

This is a full-stack resort management application featuring:
- A modern web frontend (React + Vite)
- A cross-platform mobile app (React Native + Expo)
- A Node.js/Express backend with PostgreSQL
- Real-time room booking, chat with AI agent (LLM integration), and admin-ready architecture

## Built with Cursor

This project was developed using [Cursor](https://www.cursor.so/), an AI-powered coding assistant. Cursor enabled rapid prototyping, code generation, and seamless integration of web, mobile, and backend modules, as well as LLM-powered chat features.

## Features
- **Web App:**
  - Home page with static hero image and animated room carousel
  - Booking page with background carousel and compact booking form (integrated with backend)
  - Chat modal with LLM (AI) integration (OpenAI-style API ready)
- **Mobile App:**
  - Home screen with hero image, animated room carousel, and action buttons
  - Booking flow with real-time backend integration
  - Chat screen with LLM integration
- **Backend:**
  - Express API for room, booking, user, and chat management
  - PostgreSQL database
  - Endpoints for room availability, booking, and chat/LLM proxy

## Modules

### Web Frontend (`/web`)
- React + Vite
- Home, Booking, and Chat UI
- Connects to backend for booking and chat

### Mobile App (`/mobile`)
- React Native + Expo
- Home, Booking, and Chat screens
- Connects to backend for booking and chat

### Backend (`/backend`)
- Node.js + Express
- REST API for rooms, bookings, users, chat
- PostgreSQL integration
- LLM proxy endpoint for chat

## Architecture Diagram

Below is the system architecture. 
<img width="3840" height="3341" alt="resort" src="https://github.com/user-attachments/assets/5258405b-f108-4022-a4d3-31cefc64c245" />


## How to Run

### Prerequisites
- Node.js, npm
- PostgreSQL
- (For mobile) Expo Go app on your device

### Backend
```bash
cd backend
npm install
node index.js
```

### Web Frontend
```bash
cd web
npm install
npm run dev
```

### Mobile App
```bash
cd mobile
npm install
npx expo start
```

---
