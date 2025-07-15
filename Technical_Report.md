# Balance Sheet AI Analyst - Technical Report

## 1. Authentication System

### Feature
- JWT-based user authentication
- Role-based access (Analyst, CEO, Top Management)
- Company-specific data isolation

### Tech Stack
- **Backend**: Express.js, bcrypt, jsonwebtoken
- **Database**: PostgreSQL with users table
- **Frontend**: Next.js with localStorage

### Methodology
- Password hashing with bcrypt
- JWT token generation and validation
- Role-based middleware for route protection
- Company ID isolation for data access

---

## 2. Balance Sheet Upload

### Feature
- JSON file upload with drag-and-drop
- Manual data entry option
- Year and quarter tracking
- Data validation

### Tech Stack
- **Frontend**: Multer, file upload handling
- **Backend**: Express.js with file processing
- **Database**: PostgreSQL with balance_sheets table
- **UI**: Tailwind CSS with drag-drop

### Methodology
- File buffer processing for JSON parsing
- Database constraints for unique year/quarter combinations
- Client-side validation with server-side verification
- Error handling for duplicate entries

---

## 3. AI Chat Analysis

### Feature
- Natural language financial queries
- Multi-year data analysis across all available years
- Context-aware responses
- Suggested follow-up questions

### Tech Stack
- **AI**: Google Gemini 1.5 Flash
- **Backend**: Express.js with AI integration
- **Database**: PostgreSQL with chat_history table
- **Frontend**: React state management

### Methodology
- **Prompt Engineering**: Structured prompts with financial context
- **Data Aggregation**: Fetch all balance sheets by company_id
- **Response Parsing**: Extract suggested questions using regex
- **Context Building**: Organize data by year/quarter for comprehensive analysis

### Example Prompt Structure
```
Company: ${companyName}

You have access to COMPLETE financial data for this company across ALL available years and quarters:
${JSON.stringify(balanceSheetData, null, 2)}

Analysis Requirements:
1. Multi-Year Trends: Analyze how key metrics have changed over time
2. Quarterly Patterns: Identify seasonal patterns and quarterly performance
3. Growth Analysis: Calculate year-over-year and quarter-over-quarter growth rates
4. Financial Ratios: Compute and compare ratios across all periods
5. Risk Assessment: Identify trends in liquidity, solvency, and profitability
6. Strategic Insights: Provide actionable recommendations based on historical patterns

User Question: ${question}

At the end of your answer, output a JSON array of up to 3 suggested follow-up questions:
SuggestedQuestions: ["What is the trend in revenue?", "How does the debt-to-equity ratio compare to last year?", "What are the main risks for this company?"]
```

### Answer Parsing Example
```javascript
function extractSuggestions(aiText) {
  const match = aiText.match(/SuggestedQuestions:\s*(\[.*?\])/s);
  if (!match) return [];
  try {
    return JSON.parse(match[1]);
  } catch {
    return [];
  }
}
```

---

## 4. Dashboard Interface

### Feature
- Role-based dashboard views
- Company-specific data display
- Balance sheet list with details
- Real-time data visualization

### Tech Stack
- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with gradients
- **Icons**: Lucide React
- **State**: React hooks and context

### Methodology
- Conditional rendering based on user role
- Responsive design with mobile-first approach
- Component-based architecture
- Real-time data fetching with loading states

---

## 5. Multi-Year Data Analysis

### Feature
- Complete historical data access
- Year-over-year comparisons
- Quarterly pattern identification
- Growth trajectory analysis

### Tech Stack
- **Database**: PostgreSQL with JSONB data storage
- **Backend**: Express.js with data aggregation
- **AI**: Google Gemini for trend analysis
- **Frontend**: React for data display

### Methodology
- **Data Organization**: Structure by year/quarter in nested objects
- **AI Prompting**: Enhanced prompts for multi-year analysis
- **Trend Calculation**: Year-over-year and quarter-over-quarter comparisons
- **Insight Generation**: AI identifies patterns and growth trajectories

---

## 6. Security Implementation

### Feature
- JWT token authentication
- Role-based route protection
- Company data isolation
- Input validation

### Tech Stack
- **Authentication**: jsonwebtoken, bcrypt
- **Middleware**: Express.js custom middleware
- **Validation**: Express-validator
- **Database**: PostgreSQL with proper constraints

### Methodology
- **Token Verification**: Middleware checks JWT validity
- **Role Checking**: Route-level permission validation
- **Data Isolation**: Company ID filtering in queries
- **Input Sanitization**: Server-side validation for all inputs

---

## 7. User Interface Design

### Feature
- Modern, professional design
- Responsive layout
- Loading animations
- Error handling

### Tech Stack
- **Styling**: Tailwind CSS with custom gradients
- **Animations**: CSS transitions and transforms
- **Icons**: Lucide React icon library
- **Layout**: Flexbox and Grid CSS

### Methodology
- **Design System**: Consistent color palette and spacing
- **Component Architecture**: Reusable UI components
- **Responsive Design**: Mobile-first approach
- **User Feedback**: Loading states and error messages

---

## 8. Database Architecture

### Feature
- Relational data structure
- JSONB for flexible balance sheet data
- Proper indexing for performance
- Data integrity constraints

### Tech Stack
- **Database**: PostgreSQL
- **ORM**: Native SQL queries
- **Connection**: Connection pooling
- **Schema**: Normalized tables with JSONB

### Methodology
- **Schema Design**: Normalized users and companies tables
- **JSONB Storage**: Flexible balance sheet data structure
- **Indexing**: Performance optimization for queries
- **Constraints**: Data integrity with foreign keys

### Database Schema Examples

#### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('analyst', 'ceo', 'top_management')),
    company_id INTEGER REFERENCES companies(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Balance Sheets Table
```sql
CREATE TABLE balance_sheets (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    year INTEGER NOT NULL,
    quarter INTEGER CHECK (quarter IN (1, 2, 3, 4)),
    data JSONB NOT NULL,
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, year, quarter)
);
```

#### Chat History Table
```sql
CREATE TABLE chat_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    balance_sheet_id INTEGER REFERENCES balance_sheets(id),
    company_id INTEGER REFERENCES companies(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Example JSONB Data Structure
```json
{
  "total_assets": 1500000,
  "total_liabilities": 800000,
  "total_equity": 700000,
  "current_assets": 500000,
  "current_liabilities": 300000,
  "long_term_debt": 500000,
  "cash_and_equivalents": 200000,
  "accounts_receivable": 150000,
  "inventory": 100000,
  "property_plant_equipment": 800000
}
```

---

## Key Achievements

✅ **Complete AI Integration**: Google Gemini for financial analysis  
✅ **Multi-Year Analysis**: Access to all historical data  
✅ **Role-Based Security**: Enterprise-grade access control  
✅ **Modern UI/UX**: Professional, responsive design  
✅ **Real-Time Processing**: Instant analysis and insights  
✅ **Scalable Architecture**: Component-based development  

## GitHub Repository
https://github.com/vanshd132/Balance-Sheet-AI-Analyst- 