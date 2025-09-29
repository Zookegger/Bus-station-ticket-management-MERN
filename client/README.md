# Vexe FE - Modern React Application

A well-structured React application built with TypeScript, Vite, and Bootstrap 5, following modern best practices and scalable architecture patterns.

## 🚀 Features

- **Modern Tech Stack**: React 19, TypeScript, Vite, Bootstrap 5
- **Scalable Architecture**: Well-organized folder structure with separation of concerns
- **Authentication System**: Complete auth flow with JWT tokens and protected routes
- **Responsive Design**: Mobile-first approach with Bootstrap components
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Custom Hooks**: Reusable hooks for common functionality
- **API Layer**: Centralized API service with error handling
- **State Management**: Context API for global state management
- **Form Handling**: Robust form validation and error handling
- **Loading States**: Proper loading indicators and error boundaries

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components (ProtectedRoute, etc.)
│   ├── layout/          # Layout components (Header, Footer, Layout)
│   └── ui/              # Basic UI components (Button, Loading)
├── context/             # React Context providers
│   └── AuthContext.tsx  # Authentication context
├── hooks/               # Custom React hooks
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
├── pages/               # Page components
│   ├── Home.tsx
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── NotFound.tsx
├── services/            # API and external services
│   ├── api.ts          # API client and utilities
│   └── auth.ts         # Authentication service
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   └── index.ts
├── constants/           # Application constants
│   └── index.ts
├── assets/              # Static assets
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Bootstrap 5
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom wrapper
- **Styling**: CSS3 with Bootstrap + Custom styles
- **Development**: ESLint, TypeScript compiler

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd vexe_fe
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Architecture Patterns

### Component Organization

- **Atomic Design**: Components are organized by complexity and reusability
- **Container/Presentational**: Separation of logic and presentation
- **Compound Components**: Related components grouped together

### State Management

- **Context API**: Global state for authentication and app-wide data
- **Local State**: Component-level state with useState/useReducer
- **Custom Hooks**: Reusable stateful logic

### API Layer

- **Service Layer**: Centralized API calls with error handling
- **Type Safety**: Full TypeScript support for API responses
- **Error Boundaries**: Graceful error handling and user feedback

### Routing

- **Protected Routes**: Authentication-based route protection
- **Route Guards**: Automatic redirects based on auth state
- **Lazy Loading**: Code splitting for better performance

## 📱 Pages & Features

### Public Pages

- **Home**: Landing page with feature showcase
- **Login**: User authentication
- **Register**: User registration
- **404**: Not found page

### Protected Pages

- **Dashboard**: Main application dashboard with statistics
- **Profile**: User profile management
- **Settings**: Application settings

### Authentication Flow

1. User registration/login
2. JWT token storage
3. Protected route access
4. Automatic token refresh
5. Secure logout

## 🎨 Styling

- **Bootstrap 5**: Component library and grid system
- **Custom CSS**: Additional styling for unique components
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: System preference detection
- **Animations**: Smooth transitions and micro-interactions

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

### TypeScript Configuration

- Strict mode enabled
- Path mapping for clean imports
- Comprehensive type checking

### ESLint Configuration

- React-specific rules
- TypeScript integration
- Code quality enforcement

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Deployment Options

- **Vercel**: Zero-config deployment
- **Netlify**: Drag-and-drop deployment
- **GitHub Pages**: Static site hosting
- **Docker**: Containerized deployment

## 📚 Best Practices

### Code Organization

- Single responsibility principle
- DRY (Don't Repeat Yourself)
- Consistent naming conventions
- Proper file structure

### Performance

- Code splitting and lazy loading
- Optimized bundle size
- Efficient re-renders
- Image optimization

### Security

- Input validation
- XSS protection
- Secure token handling
- HTTPS enforcement

### Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Bootstrap team for the UI components
- Vite team for the fast build tool
- TypeScript team for type safety
