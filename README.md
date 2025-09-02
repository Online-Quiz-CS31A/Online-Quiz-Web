# School Quiz Portal

A modern, responsive Vue.js application for managing academic quizzes and assessments. Built with Vue 3, TypeScript, and Tailwind CSS.

## Features

- **Dashboard Overview**: View active quizzes, statistics, and recent activities
- **Quiz Management**: Create, edit, and delete quizzes with ease
- **Question Import**: Import questions from files (CSV, Excel) or paste text
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Updates**: Dynamic content updates and interactive components
- **Modern UI**: Beautiful gradient backgrounds and smooth animations

## Components Structure

- **HomeView.vue**: Main dashboard view with all components
- **Sidebar.vue**: Navigation sidebar with menu items and quick actions
- **Header.vue**: Top header with notifications and user info
- **WelcomeBanner.vue**: Welcome message with quick start button
- **StatsCards.vue**: Statistics cards showing quiz metrics
- **ActiveQuizzes.vue**: Grid of active quizzes with actions
- **RecentActivity.vue**: Timeline of recent activities
- **CreateQuizModal.vue**: Modal for creating new quizzes
- **ImportQuestionsModal.vue**: Modal for importing questions

## Technologies Used

- **Vue 3**: Composition API with TypeScript
- **Vue Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Font Awesome**: Icon library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Run tests**:
   ```bash
   npm run test:unit
   ```

## Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── Sidebar.vue     # Navigation sidebar
│   ├── Header.vue      # Top header
│   ├── WelcomeBanner.vue # Welcome message
│   ├── StatsCards.vue  # Statistics display
│   ├── ActiveQuizzes.vue # Quiz grid
│   ├── RecentActivity.vue # Activity timeline
│   ├── CreateQuizModal.vue # Quiz creation modal
│   └── ImportQuestionsModal.vue # Question import modal
├── views/              # Page components
│   └── HomeView.vue    # Main dashboard
├── router/             # Vue Router configuration
├── stores/             # Pinia state management
└── assets/             # Static assets and styles
```

## Key Features

### Quiz Management
- Create new quizzes with title, subject, class, and due date
- Edit existing quizzes
- Delete quizzes with confirmation
- View quiz progress and submissions

### Question Import
- Upload files (CSV, Excel, TXT)
- Paste questions as text
- Assign subjects to imported questions
- Flexible import formats

### Responsive Design
- Mobile-first approach
- Collapsible sidebar for mobile devices
- Touch-friendly interface
- Adaptive layouts for different screen sizes

### Interactive Elements
- Hover effects and animations
- Progress bars for quiz completion
- Color-coded subjects and activities
- Smooth transitions and micro-interactions

## Development

The application uses modern Vue 3 features:
- **Composition API**: Better logic organization and reusability
- **TypeScript**: Type safety and better developer experience
- **Reactive State**: Vue's reactivity system for dynamic updates
- **Event Handling**: Component communication through events

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
