# Balance Sheet Analyst - AI-Powered Financial Analysis Platform

A modern, role-based financial analysis platform with AI-powered insights using Google Gemini. Built with Next.js frontend and Express.js backend with PostgreSQL database.

## ✨ Features

### 🎨 **Visual Enhancements & Finishing Touches**
- **Modern UI Design**: Gradient backgrounds, glassmorphism effects, and smooth animations
- **Professional Icons**: Lucide React icons throughout the interface
- **Welcoming Statements**: Role-specific welcome messages and helpful tooltips
- **Enhanced Chat Experience**: 
  - Beautiful chat bubbles with avatars and timestamps
  - AI-powered suggestions and welcome messages
  - Loading animations and status indicators
- **Improved Navigation**: 
  - Fixed top navbar with gradient branding
  - Role-based user dropdown with enhanced styling
  - Active state indicators and hover effects
- **Upload Experience**: 
  - Drag-and-drop file upload with visual feedback
  - Manual entry mode with helpful descriptions
  - Progress indicators and success animations
- **Data Visualization**: 
  - Modern table designs with hover effects
  - Empty states with helpful illustrations
  - Status badges and visual indicators

### 🔐 **Authentication & Security**
- JWT-based authentication
- Role-based access control (Analyst, CEO, Top Management)
- Secure password handling
- Company-specific data isolation

### 📊 **Financial Analysis**
- Balance sheet upload (JSON files or manual entry)
- AI-powered financial analysis using Google Gemini
- Interactive charts and visualizations
- Real-time data processing

### 🏢 **Multi-Company Management**
- Company-specific dashboards
- Cross-company access for top management
- Role-based data visibility

### 🤖 **AI Chat Features**
- Natural language financial queries
- Context-aware responses based on user role
- Suggested questions and follow-up prompts
- Markdown formatting for rich responses

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Google Gemini API key

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=balance_sheet_db
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:
```bash
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
1. Create PostgreSQL database
2. Run the SQL schema from `backend/schema.sql`
3. Insert sample data for testing

## 👥 Demo Accounts

| Role | Email | Password | Company ID |
|------|-------|----------|------------|
| Financial Analyst | analyst@reliance.com | password | 1 |
| CEO | ceo@reliance.com | password | 1 |
| Top Management | management@reliance.com | password | 1 |

## 🎯 Role-Based Features

### Financial Analyst
- Upload and review balance sheets
- Analyze company performance metrics
- Generate financial reports
- AI-powered insights for analysis

### CEO
- View comprehensive balance sheet data
- Strategic AI insights for decision-making
- Monitor key financial metrics
- Performance trend analysis

### Top Management
- Access all group companies' data
- Compare performance across verticals
- Strategic AI recommendations
- Cross-company analytics

## 🛠️ Technical Stack

### Frontend
- **Next.js 14** - React framework
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Express.js** - Node.js framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **Google Gemini AI** - AI analysis

### Database
- **PostgreSQL** with role-based access
- Company-specific data isolation
- Secure user management

## 📁 Project Structure

```
flowise/
├── backend/                 # Express.js API server
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth & validation
│   └── schema.sql          # Database schema
├── frontend/               # Next.js application
│   ├── app/               # App router pages
│   │   ├── dashboard/     # Dashboard components
│   │   ├── companies/     # Company management
│   │   └── profile/       # User profile
│   └── components/        # Reusable components
└── sample-balance-sheet-*.json  # Sample data files
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#3B82F6 to #1D4ED8)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: Gray scale

### Components
- **Cards**: Glassmorphism with backdrop blur
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with focus states
- **Tables**: Modern design with hover effects
- **Chat**: Bubble design with avatars and timestamps

### Animations
- Smooth transitions and hover effects
- Loading spinners and progress indicators
- Micro-interactions for better UX

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Balance Sheets
- `GET /api/balance-sheet/company/:id` - Get company balance sheets
- `POST /api/balance-sheet/upload` - Upload balance sheet
- `GET /api/companies` - Get all companies (top management)

### AI Analysis
- `POST /api/chat/analyze` - AI-powered financial analysis

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, Railway, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for financial professionals who need smart, AI-powered insights for better business decisions.** 