# Degens Against Decency Card Bot

A React/TypeScript web application for submitting questions and answers to the Degens Against Decency card game.

## Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions whenever changes are pushed to the main branch.

The build workflow:
1. Installs dependencies
2. Compiles TypeScript to JavaScript 
3. Builds the React application using Vite
4. Deploys the compiled static files to GitHub Pages

## Project Structure

- `src/` - React/TypeScript source code
- `dist/` - Build output (generated)
- `.github/workflows/` - GitHub Actions deployment workflow
- `server.js` - Legacy Express server (not used in production)