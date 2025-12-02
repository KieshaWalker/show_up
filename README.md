# ShowUp - Habit Tracking App

A modern, full-stack habit tracking application built with Next.js 16, TypeScript, PostgreSQL, and Stack Auth. Features a beautiful glassmorphism UI design and comprehensive habit and nutrition tracking capabilities.

## 🚀 Features

- **Habit Tracking**: Create, manage, and track daily habits with streak counting and progress visualization
- **Nutrition Logging**: Track food intake with detailed nutritional information and calorie counting
- **Calendar View**: Visual calendar showing activity across months with detailed statistics
- **Authentication**: Secure user authentication with Stack Auth
- **Responsive Design**: Modern glassmorphism UI that works on all devices
- **Real-time Updates**: Live progress tracking and instant feedback

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 16 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: PostgreSQL with connection pooling
- **Authentication**: Stack Auth
- **Deployment**: Vercel (optimized for serverless)

### Project Structure

```
show_up/
├── app/                          # Next.js App Router directory
│   ├── api/                      # API routes
│   │   ├── calendar/            # Calendar statistics API
│   │   ├── food/                # Food management API
│   │   ├── habits/              # Habit CRUD operations
│   │   └── nutrition/           # Nutrition logging API
│   ├── components/              # React components
│   │   ├── CalendarPreview.tsx  # Monthly activity preview
│   │   ├── HabitsPreview.tsx    # Habits dashboard preview
│   │   └── NutritionPreview.tsx # Nutrition tracking preview
│   ├── db.ts                    # Database connection management
│   ├── fonts.js                 # Font configuration
│   ├── globals.css              # Global styles and design tokens
│   ├── layout.tsx               # Root layout with providers
│   ├── loading.tsx              # Loading UI component
│   ├── page.tsx                 # Home dashboard
│   ├── utils/                   # Utility functions
│   │   └── auth.ts              # Authentication helpers
│   └── handler/                 # Stack Auth handlers
├── stack/                       # Stack Auth configuration
│   ├── client.tsx               # Client-side auth setup
│   └── server.tsx               # Server-side auth setup
├── public/                      # Static assets
├── docs/                        # Documentation
└── package.json                 # Dependencies and scripts
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stack Auth account and project

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/showup

# Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID=your_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_client_key
STACK_SECRET_SERVER_KEY=your_server_key
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd show_up
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Create database and run migrations
   npm run db:migrate
   ```

4. **Configure Stack Auth**
   - Create a project at [stack-auth.com](https://stack-auth.com)
   - Add your environment variables
   - Configure redirect URLs for your domain

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Core Tables

- **users**: User accounts (managed by Stack Auth)
- **habits**: User-defined habits with metadata
- **habit_logs**: Daily habit completion records
- **food_items**: Nutritional food database
- **nutrition_logs**: Daily food consumption tracking

### Key Relationships

- Users have many habits and habit_logs
- Users have many nutrition_logs
- nutrition_logs reference food_items
- habit_logs reference habits

## 🔐 Authentication

The app uses Stack Auth for secure authentication with:

- Email/password authentication
- Social login options (configurable)
- JWT token management
- Server-side session validation
- Protected API routes

## 🎨 Design System

### Color Palette

- **Background**: Warm green (#626554)
- **Surface**: Semi-transparent white overlays
- **Accent**: Blue tones for interactive elements
- **Text**: Dark colors for optimal readability

### Components

- **Glass Cards**: Semi-transparent containers with blur effects
- **Progress Bars**: Animated progress indicators
- **Buttons**: Consistent button styles with hover states
- **Forms**: Accessible form components with validation

## 🚀 Deployment

### Vercel Deployment

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Configure build settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Deploy**

### Database Setup

Ensure your production database is accessible and update the `DATABASE_URL` environment variable.

## 📝 API Documentation

### Habits API

- `GET /api/habits` - List user habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/[id]` - Update habit
- `DELETE /api/habits/[id]` - Delete habit

### Nutrition API

- `GET /api/food` - List food items
- `POST /api/food` - Add new food item
- `GET /api/nutrition/log` - Get nutrition logs
- `POST /api/nutrition/log` - Log food consumption

### Calendar API

- `GET /api/calendar` - Get calendar statistics for month

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with comprehensive comments
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication by [Stack Auth](https://stack-auth.com)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Database operations with [pg](https://www.npmjs.com/package/pg)</content>
<parameter name="filePath">/home/kieshawalk/selfcoder/show_up/README.md
