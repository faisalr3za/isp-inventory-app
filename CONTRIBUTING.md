# Contributing to ISP Inventory Management System

Thank you for your interest in contributing to the ISP Inventory Management System! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs
1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Provide detailed reproduction steps
4. Include environment information
5. Add screenshots if applicable

### Suggesting Features
1. Use the feature request template
2. Clearly describe the problem and solution
3. Consider implementation complexity
4. Discuss with maintainers before large changes

### Code Contributions

#### Getting Started
1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Set up development environment (see README.md)

#### Development Process
1. Write clean, documented code
2. Follow existing code style and patterns
3. Add tests for new functionality
4. Update documentation if needed
5. Test your changes thoroughly

#### Pull Request Process
1. Update your branch with latest main: `git rebase main`
2. Run tests: `npm test`
3. Run linting: `npm run lint`
4. Create detailed PR description
5. Link related issues
6. Request review from maintainers

## 📋 Development Guidelines

### Code Style
- **TypeScript**: Use strict typing, avoid `any`
- **React**: Use functional components with hooks
- **CSS**: Use Tailwind CSS classes, avoid custom CSS
- **Naming**: Use descriptive names, follow conventions

### Commit Messages
Follow conventional commits format:
```
type(scope): description

feat(auth): add login functionality
fix(scanner): resolve camera permission issue
docs(readme): update installation instructions
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Branch Naming
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/update-description` - Documentation updates
- `refactor/component-name` - Code refactoring

### Testing
- Write unit tests for utilities and services
- Add integration tests for API endpoints
- Test mobile and desktop responsive design
- Verify PWA functionality

## 🏗️ Project Structure

```
├── backend/              # Node.js API server
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── middleware/   # Express middleware
│   └── database/         # Migrations and seeds
├── frontend/             # React PWA application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript types
│   └── public/           # Static assets
└── docs/                 # Documentation
```

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Local Development
```bash
# Clone repository
git clone https://github.com/your-username/isp-inventory-app.git
cd isp-inventory-app

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start development servers
docker-compose up -d postgres
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

### Database Setup
```bash
# Run migrations
cd backend
npm run migrate

# Seed database
npm run seed
```

## 📱 PWA Development

### Testing PWA Features
1. Use HTTPS in development (required for PWA)
2. Test service worker registration
3. Verify offline functionality
4. Test install prompt
5. Check responsive design

### PWA Guidelines
- Optimize for mobile-first
- Ensure offline functionality
- Follow accessibility guidelines
- Test on various devices
- Optimize performance

## 🔍 Code Review Process

### For Contributors
- Keep PRs focused and small
- Write clear descriptions
- Respond to feedback promptly
- Update code based on reviews

### For Reviewers
- Review code thoroughly
- Test functionality
- Check for security issues
- Verify documentation updates
- Ensure tests pass

## 📚 Documentation

### What to Document
- New features and APIs
- Configuration changes
- Breaking changes
- Installation/setup updates
- Troubleshooting guides

### Documentation Standards
- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Update relevant documentation files
- Keep README.md current

## 🐛 Debugging

### Common Issues
- **Database Connection**: Check PostgreSQL status
- **Port Conflicts**: Verify available ports
- **Permission Issues**: Check file permissions
- **Build Errors**: Clear node_modules and reinstall

### Debugging Tools
- Browser DevTools for frontend
- Node.js debugger for backend
- Database query tools
- Network monitoring tools

## 📞 Getting Help

### Communication Channels
- GitHub Issues for bugs and features
- GitHub Discussions for questions
- Email maintainers for sensitive issues

### Before Asking for Help
1. Check existing documentation
2. Search closed issues
3. Try basic troubleshooting
4. Provide detailed information

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Invited to contribute more
- Considered for maintainer roles

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to ISP Inventory Management System! 🎉
