# 🏥 CareSync - Frontend

CareSync is a comprehensive, scalable, and secure healthcare management platform. This repository contains the **Frontend** application, built to bridge the gap between patients, doctors, receptionists, and hospital administrators. It features telemedicine capabilities, AI-powered health assistants, real-time communications, and role-based dashboards.

## 🏗️ Technology Stack

- **Framework:** React.js (Vite for fast bundling)
- **Styling:** Tailwind CSS (Modern, responsive UI)
- **State Management:** Redux Toolkit
- **Routing:** React Router DOM
- **Real-Time:** Socket.IO Client
- **Telemedicine:** Azure Communication Services (Calling & Chat UI)
- **AI/Biometrics:** `face-api.js` for facial recognition login
- **Utilities:** `jspdf` & `jspdf-autotable` for generating medical prescriptions and reports
- **Drag & Drop:** `@hello-pangea/dnd` for the Doctor's Kanban appointment board

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository and navigate to the frontend directory:
   ```bash
   cd CareSyncFrontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.development` (or `.env`) file in the root directory and add your backend API URL.
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   The application should now be running on `http://localhost:5173` (or the port specified by Vite).

### Build for Production
To build the app for production, run:
```bash
npm run build
```
The optimized files will be generated in the `dist` directory.

## 🔄 System Flow Highlights

- **Authentication & Security Flow:** Login via password or facial recognition. JWT strictly dictates access to specific routes (Patient, Doctor, Receptionist, or Admin).
- **Patient Dashboard:** Centralized hub to view upcoming appointments, book new ones, join telemedicine rooms, and view medical history.
- **Doctor Dashboard:** Manage daily appointments using an intuitive drag-and-drop Kanban board, join video consultations, and set availability.
- **Admin & Receptionist Flow:** Approve doctors, manage global services, handle in-person walk-ins and physical queue via token numbers.

## 🔒 Security Measures
- **Biometrics:** `face-api.js` enables highly secure, passwordless authentication, ensuring the person logging in is physically present.
- **Network Isolation & Proxies:** Frontend NGINX is configured to dynamically rewrite API routes in production to prevent Cross-Origin Resource Sharing (CORS) exploits.

## 🚀 Deployment Guide (Docker / AKS)

1. **Build Image:**
   ```bash
   docker build -t caresync.azurecr.io/caresync-frontend:latest .
   ```
2. **Push to Azure Container Registry:**
   ```bash
   docker push caresync.azurecr.io/caresync-frontend:latest
   ```
3. **Deploy Workloads:**
   ```bash
   kubectl apply -f deployment.yaml
   ```
4. **Configure Ingress & TLS:**
   Assign Azure DNS Label and apply Let's Encrypt Issuer for secure access.
