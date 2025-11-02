# Contributing to Degens Against Decency

Thank you for your interest in contributing! We're excited to have you join our community of developers making this party game platform even better.

## 🚀 Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/DegensAgainstDecency.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Start developing: `npm start` or `npm run dev`

## 📝 Development Setup

### Prerequisites
- Node.js 16+ installed
- Git for version control
- A code editor (VS Code recommended)
- (Optional) Discord Developer Account for OAuth testing

### Environment Configuration
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
# Edit .env with your settings (Discord OAuth is optional)
```

### Running Locally
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Generate a session secret
npm run generate-secret
```

## 🎯 Contribution Areas

We welcome contributions in these areas:

### Code Contributions
- **New Game Types**: Add new party games to the platform
- **Bug Fixes**: Fix issues found in the issue tracker
- **Performance**: Optimize WebSocket handling, game state, or UI rendering
- **Features**: Add new features like spectator mode, tournaments, etc.
- **UI/UX**: Improve styling, animations, or user experience
- **Testing**: Add unit tests or integration tests

### Documentation
- Improve README clarity
- Add tutorials or guides
- Update API documentation
- Enhance deployment guides
- Fix typos or broken links

### Design
- Create better graphics/logos
- Improve CSS styling
- Design new card templates
- Enhance mobile responsiveness

## 🔧 Project Structure

```
DegensAgainstDecency/
├── server.js              # Main Express server
├── src/
│   ├── GameManager.js     # Central game state manager
│   ├── AICardGenerator.js # AI content generation
│   ├── DiscordBot.js      # Discord bot integration
│   └── games/             # Game type implementations
│       ├── BaseGame.js
│       ├── DegensAgainstDecencyGame.js
│       ├── TwoTruthsAndALieGame.js
│       └── PokerGame.js
├── scripts/               # Client-side JavaScript
├── styles/                # CSS styling
├── index.html             # Landing page
├── arena.html             # Game lobby (server version)
└── arena-demo.html        # Static demo (GitHub Pages)
```

## 📋 Coding Standards

### JavaScript
- Use ES6+ features (const/let, arrow functions, async/await)
- Add JSDoc comments for functions and classes
- Handle errors gracefully with try/catch
- Use meaningful variable names
- Keep functions focused and small

### CSS
- Use CSS custom properties for colors and sizing
- Maintain responsive design (mobile-first)
- Follow existing naming conventions
- Test on multiple browsers

### HTML
- Use semantic HTML5 elements
- Include ARIA labels for accessibility
- Keep structure clean and organized
- Add comments for complex sections

## 🧪 Testing Your Changes

### Manual Testing
1. **Server Functionality**: Test with `npm start`
2. **Static Demo**: Test arena-demo.html in a browser
3. **Multiple Browsers**: Chrome, Firefox, Safari
4. **Mobile Devices**: Test responsive design
5. **Game Flow**: Play through complete games
6. **Error Cases**: Test edge cases and errors

### Automated Testing
Currently, we don't have automated tests, but we'd love contributions in this area!

## 📦 Submitting Changes

### Before Submitting
- [ ] Code follows project style guidelines
- [ ] Changes work in both server and static modes (if applicable)
- [ ] Documentation is updated if needed
- [ ] No console errors or warnings
- [ ] Tested on at least 2 browsers
- [ ] Commit messages are clear and descriptive

### Pull Request Process

1. **Update your fork**: `git pull upstream main`
2. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
3. **Push to your fork**: `git push origin feature/your-feature-name`
4. **Open a Pull Request** on GitHub
5. **Describe your changes**: What, why, and how
6. **Link related issues**: Reference issue numbers if applicable
7. **Wait for review**: Maintainers will review and provide feedback

### Commit Message Format
Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Formatting, missing semicolons, etc.
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```
feat: add spectator mode to games
fix: resolve WebSocket connection issue on mobile
docs: update deployment guide for Railway
style: improve game card styling and animations
```

## 🐛 Reporting Bugs

Found a bug? Please open an issue with:
- Clear title describing the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots if applicable
- Console errors if available

## 💡 Suggesting Features

Have an idea? Open an issue with:
- Clear feature description
- Use case and benefits
- Potential implementation approach
- Any related examples or mockups

## 🔒 Security

Found a security vulnerability? Please report it via [GitHub Security Advisory](https://github.com/jmenichole/DegensAgainstDecency/security/advisories/new) instead of opening a public issue. See our [Security Policy](SECURITY.md) for details.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

All contributors will be recognized in our README. Thank you for making Degens Against Decency better!

## 💬 Questions?

- Open a GitHub Discussion
- Check existing issues and PRs
- Review the README and documentation

Happy coding! 🎮🎉
