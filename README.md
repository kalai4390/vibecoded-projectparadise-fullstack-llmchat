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

Below is the system architecture. To display as an image on GitHub, copy the Mermaid code to [https://mermaid.live/](https://mermaid.live/), export as PNG/SVG, and upload to your repo.

```mermaid
graph TD
  UserWeb[User (Web)] -->|Books Room| WebUI[Web Frontend]
  UserMobile[User (Mobile)] -->|Books Room| MobileUI[Mobile Frontend]
  WebUI -->|API Calls| BackendAPI[Backend API]
  MobileUI -->|API Calls| BackendAPI
  BackendAPI -->|Reads/Writes| DB[(PostgreSQL DB)]
  WebUI -->|Chat| WebChat[Web Chat UI]
  MobileUI -->|Chat| MobileChat[Mobile Chat UI]
  WebChat -->|Sends Message| LLMProxy[LLM API Proxy]
  MobileChat -->|Sends Message| LLMProxy
  LLMProxy -->|Forwards| LLM[OpenAI/LLM]
  LLM -->|AI Response| LLMProxy
  LLMProxy -->|AI Response| WebChat
  LLMProxy -->|AI Response| MobileChat
```

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

## About Cursor
This project was built with the help of Cursor, an AI coding assistant that accelerates full-stack development, code review, and integration.

---

**Enjoy your resort app!** 