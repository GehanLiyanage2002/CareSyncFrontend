# CareSync Frontend

CareSync is a comprehensive healthcare application frontend built with modern web technologies. This repository contains the React-based user interface for the CareSync platform.

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Communication & Video**: [Azure Communication Services](https://azure.microsoft.com/en-us/products/communication-services)
- **Real-time WebSockets**: [Socket.io Client](https://socket.io/)
- **Drag & Drop**: [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- **Face Recognition**: [face-api.js](https://github.com/vladmandic/face-api)
- **PDF Generation**: [jsPDF](https://parall.ax/products/jspdf) with [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Date Management**: [date-fns](https://date-fns.org/) & [react-datepicker](https://reactdatepicker.com/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## 🛠️ Installation & Setup

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd CareSyncFrontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory and add any necessary environment variables (e.g., API endpoints, Azure Communication connection strings, etc.).

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173` (or the port specified by Vite).

## 💻 Available Scripts

In the project directory, you can run:

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run lint`: Runs ESLint to check for code quality and style issues.
- `npm run preview`: Locally previews the production build.

## 🏗️ Project Structure

- `/src`: Contains the main source code for the application.
  - Components, pages, Redux slices, and utility functions should reside here.
- `/public`: Static assets that don't need to be processed by Webpack/Vite.
- `package.json`: Project metadata, dependencies, and scripts.
- `vite.config.js`: Configuration for the Vite bundler.
- `eslint.config.js`: ESLint rules and configuration.

## 📦 Building for Production

To create a production-ready build, run:
```bash
npm run build
```
This will bundle React in production mode and optimize the build for the best performance. The build artifacts will be stored in the `dist/` directory.

## 🤝 Contributing

When contributing to this repository, please ensure you test your changes locally and run the linter before submitting a pull request.
