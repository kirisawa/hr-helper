<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# HR Pro Event Suite (HR Helper)

This project is a React-based application powered by Vite and Gemini AI to assist HR professionals.

## 🚀 Features
- **Modern Stack**: Built with React 19, Vite, and TypeScript.
- **AI Powered**: Integrated with Google Gemini API.
- **Styling**: Uses Lucide React for icons.

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Clone & Install
```bash
git clone <repository-url>
cd hr-helper
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory (copy from `.env.example` if available, or just create one):

```bash
# .env
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note**: This project configuration loads `GEMINI_API_KEY` specifically.

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 📦 Deployment

### GitHub Pages (Automated)
This project is configured to deploy automatically to GitHub Pages using GitHub Actions.

1. Go to your repository **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **"Deploy from a branch"**.
3. *However*, since we use a GitHub Action, you might simply need to verify the action runs on push. 
   - The workflow file `.github/workflows/deploy.yml` takes care of building and deploying to a `gh-pages` branch.
   - Once the action runs, switch the Source in Settings > Pages to **`gh-pages` branch** (if not automatically set).

### Manual Build
To build the project for production:
```bash
npm run build
```
The output will be in the `dist/` directory, ready to be served by any static host.

## 📁 Project Structure
- `src/` - Source code (React components, App entry).
- `vite.config.ts` - Vite configuration.
- `.github/workflows/` - CI/CD pipelines.
