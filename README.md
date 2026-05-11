# ForecastIQ

A modern full-stack forecasting application for data-driven insights and predictions. ForecastIQ combines a powerful FastAPI backend with a responsive React frontend to provide accurate sales forecasting and analytics.

## Features

- 📊 **Interactive Dashboards** - Real-time analytics and KPI tracking
- 📈 **Advanced Forecasting** - Linear Regression and Prophet-based time series forecasting
- 📁 **Dataset Management** - Upload and manage CSV, XLS, XLSX datasets
- 🧠 **Real-Time Training Stream** - SSE-powered live model training progress
- 📏 **Forecast Confidence** - Confidence intervals and predictive accuracy metrics
- 🔒 **Secure Authentication** - JWT-based auth with user-level dataset isolation
- ⚙️ **Automatic Model Selection** - Auto-select the best forecasting pipeline
- 📄 **Export Reports** - Excel and PDF report generation
- 🐘 **Async PostgreSQL Architecture** - Production-ready database design
- 🧩 **Database Migrations** - Alembic-powered schema versioning
- 🚢 **Dockerized Deployment** - Container-ready backend and frontend support

## Production Features

- Async PostgreSQL architecture
- Secure JWT authentication
- User-level dataset isolation
- Production-grade error handling
- Forecast confidence intervals
- Automatic model selection
- SSE real-time streaming
- Excel and PDF exports
- Alembic database migrations
- Dockerized deployment

## Forecasting Workflow

1. Upload dataset
2. Preview and validate data
3. Train forecasting model
4. Stream real-time training progress
5. Generate predictions
6. Analyze insights
7. Export PDF/Excel reports

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Migrations**: Alembic
- **Authentication**: JWT tokens
- **Server**: Uvicorn

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **API Client**: Axios
- **State Management**: Zustand
- **Charts**: Chart.js or similar

## Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- PostgreSQL 13+
- Docker and Docker Compose (for containerized setup)

## Quick Start

### Option 1: Local Development Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database credentials and settings.

5. **Initialize database**
   ```bash
   alembic upgrade head
   ```

6. **Run the backend server**
   ```bash
   uvicorn app.main:app --reload --port 9000
   ```
   Backend will be available at `http://localhost:9000`

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update `VITE_API_URL` to `http://localhost:9000`

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Frontend will be available at `http://localhost:5173`

### Option 2: Docker Compose Setup

1. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Configure database and API settings as needed.

2. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:9000`
   - API Docs: `http://localhost:9000/docs`

4. **Run migrations (if needed)**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

## Project Structure

```
forecastiq/
├── backend/
│   ├── app/
│   │   ├── api/v1/           # API route handlers
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   ├── core/             # Config, security, dependencies
│   │   └── main.py           # FastAPI app entry point
│   ├── alembic/              # Database migrations
│   ├── uploads/              # User uploaded files
│   ├── reports/              # Generated reports
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # Backend container config
│
├── frontend/
│   ├── src/
│   │   ├── api/              # API service clients
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── routes/           # Route configuration
│   │   ├── store/            # Zustand stores
│   │   └── App.jsx           # Root component
│   ├── public/               # Static assets
│   ├── package.json          # Node dependencies
│   ├── vite.config.js        # Vite configuration
│   ├── tailwind.config.js    # Tailwind CSS config
│   └── Dockerfile            # Frontend container config
│
├── docker-compose.yml        # Multi-container orchestration
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user information

### Datasets
- `POST /api/datasets/upload` - Upload new dataset
- `GET /api/datasets` - List all datasets
- `GET /api/datasets/{dataset_id}/preview` - Preview dataset content
- `DELETE /api/datasets/{dataset_id}` - Delete dataset

### Forecasts
- `POST /api/forecasts/train` - Train forecasting model
- `GET /api/forecasts/{job_id}/stream` - Stream training progress
- `POST /api/forecasts/predict` - Generate predictions
- `GET /api/forecasts/{prediction_id}/results` - Get prediction results

### Analytics
- `GET /api/analytics/summary` - Get analytics summary
- `GET /api/analytics/monthly-sales` - Get monthly sales data
- `GET /api/analytics/top-products` - Get top products analytics
- `GET /api/analytics/accuracy` - Get forecast accuracy metrics

### Reports
- `POST /api/reports/generate` - Generate new report
- `GET /api/reports` - List all reports
- `GET /api/reports/{report_id}/download/excel` - Download report as Excel
- `GET /api/reports/{report_id}/download/pdf` - Download report as PDF

### Health
- `GET /` - Root endpoint
- `GET /health` - Health check endpoint

For complete API documentation, visit `/docs` (Swagger UI) or `/redoc` (ReDoc) when the backend is running.

## Development Workflow

### Backend Development

1. **Create a new migration** (when schema changes)
   ```bash
   cd backend
   alembic revision --autogenerate -m "Description of changes"
   alembic upgrade head
   ```

2. **Add new endpoints**
   - Create router in `app/api/v1/`
   - Add models in `app/models/`
   - Add schemas in `app/schemas/`
   - Add service logic in `app/services/`

3. **Run tests** (when available)
   ```bash
   pytest
   ```

### Frontend Development

1. **Add new components**
   - Create component in `src/components/`
   - Use Tailwind CSS for styling
   - Follow naming conventions

2. **Create new pages**
   - Add page component in `src/pages/`
   - Register route in `src/routes/AppRoutes.jsx`
   - Add navigation in `src/components/layout/Sidebar.jsx`

3. **Lint and format**
   ```bash
   npm run lint
   npm run format
   ```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://user:password@localhost/forecastiq
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:9000
VITE_APP_NAME=ForecastIQ
```

## Troubleshooting

### Backend Issues

**Port already in use**
```bash
# Change port in uvicorn command
uvicorn app.main:app --reload --port 8000
```

**Database connection error**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

**Migration errors**
```bash
# Reset migrations (development only)
alembic downgrade base
alembic upgrade head
```

### Frontend Issues

**Vite build errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**API connection issues**
- Verify backend is running on correct port
- Check VITE_API_URL in .env.local
- Check CORS settings in backend

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

