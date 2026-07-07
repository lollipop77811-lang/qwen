# EMR System - Electronic Medical Record

A production-ready, highly responsive Electronic Medical Record (EMR) web application inspired by HealthPlix. This is a commercial-grade product built with modern technologies and best practices.

## 🏥 Features

### Core Modules
- **Admin Dashboard** - User management, RBAC, hospital settings, audit logs, analytics
- **Doctor Dashboard** - Patient queue, clinical notes, prescriptions, lab ordering, past records
- **Front Desk Dashboard** - Patient registration, appointments, token generation, IPD management, billing
- **Nurse/IPD Dashboard** - Bed management, vitals monitoring, MAR, doctor's orders
- **Laboratory Dashboard** - Test orders, sample collection, result entry, report approval
- **Pharma Inventory Dashboard** - Stock management, purchase orders, dispensing, low stock alerts
- **Reports Dashboard** - PDF generation for prescriptions, discharge summaries, lab reports, financial reports

### Technical Highlights
- **Security**: JWT authentication, RBAC, password hashing with bcrypt, helmet security headers
- **Database**: PostgreSQL with proper foreign keys, indexes, triggers, and views
- **Validation**: Express-validator for request validation
- **Audit Trail**: Complete audit logging for compliance
- **API**: RESTful conventions with standard HTTP status codes
- **Responsive**: Mobile-first design with Tailwind CSS breakpoints

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- PostgreSQL
- JWT Authentication
- Bcrypt (Password Hashing)
- Multer (File uploads)
- PDFKit (PDF generation)
- Winston (Logging)

### Frontend
- React.js (Vite)
- Tailwind CSS
- React Router
- Zustand (State Management)
- Axios
- React-Toastify

## 📁 Project Structure

```
emr-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & app configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── models/          # Database models (if using ORM)
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   └── server.js        # Entry point
│   ├── database/
│   │   └── schema.sql       # Complete database schema
│   ├── uploads/             # File upload directory
│   ├── .env.example         # Environment variables template
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── common/      # Reusable components
    │   │   ├── dashboard/   # Dashboard-specific components
    │   │   ├── forms/       # Form components
    │   │   └── layout/      # Layout components (Navbar, Sidebar)
    │   ├── hooks/           # Custom React hooks
    │   ├── pages/           # Page components
    │   ├── services/        # API service layer
    │   ├── store/           # Zustand stores
    │   ├── utils/           # Utility functions
    │   └── App.jsx
    ├── .env.example
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd emr-system/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update environment variables in `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=emr_user
DB_PASSWORD=your_secure_password
DB_NAME=emr_db
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
CORS_ORIGIN=http://localhost:5173
```

5. Create PostgreSQL database and user:
```sql
CREATE DATABASE emr_db;
CREATE USER emr_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE emr_db TO emr_user;
```

6. Run database migrations:
```bash
psql -U emr_user -d emr_db -f database/schema.sql
```

7. Start development server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd emr-system/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update environment variables:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

5. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/register` | Register new user | Admin |
| GET | `/api/auth/me` | Get current profile | Private |
| PUT | `/api/auth/password` | Update password | Private |
| POST | `/api/auth/logout` | Logout user | Private |

### User Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin/Self |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Deactivate user | Admin |
| GET | `/api/users/doctors` | Get doctors list | Private |
| GET | `/api/users/stats` | Get user statistics | Admin |

### Patient Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/patients` | Get all patients | Private |
| POST | `/api/patients` | Create patient | Admin/FrontDesk/Doctor |
| GET | `/api/patients/:id` | Get patient by ID | Private |
| GET | `/api/patients/uhid/:uhid` | Get patient by UHID | Private |
| PUT | `/api/patients/:id` | Update patient | Admin/FrontDesk/Doctor |
| GET | `/api/patients/:id/history` | Get patient history | Doctor/Nurse |
| GET | `/api/patients/stats` | Get patient statistics | Admin/FrontDesk |

### Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

### Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 🔒 Security Features

- **Password Hashing**: Bcrypt with configurable rounds (default: 12)
- **JWT Tokens**: Secure session management with expiration
- **RBAC**: Role-based access control for all endpoints
- **Input Validation**: Express-validator for all user inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Helmet security headers
- **Rate Limiting**: Configurable rate limits per IP
- **Audit Logging**: Complete trail of user actions
- **CORS**: Configured for specific origins only

## 🗄️ Database Schema

The database includes the following main tables:
- `users` - System users with roles
- `patients` - Patient registry with auto-generated UHID
- `appointments` - OPD scheduling with tokens
- `encounters` - Clinical visit records
- `prescriptions` - Medication prescriptions
- `lab_tests` - Laboratory test orders and results
- `wards` & `beds` - IPD bed management
- `ipd_admissions` - Inpatient admission records
- `vitals_history` - Time-series vital signs
- `inventory` - Medicine stock with batch tracking
- `billing` - Financial transactions
- `audit_logs` - System audit trail

See `backend/database/schema.sql` for complete schema documentation.

## 📊 Default Roles

1. **Admin** - Full system access
2. **Doctor** - Patient consultation, prescriptions, lab orders
3. **Nurse** - Vitals entry, IPD care, medication administration
4. **FrontDesk** - Registration, appointments, billing
5. **LabTechnician** - Lab test management
6. **Pharmacist** - Inventory and dispensing

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=emr_user
DB_PASSWORD=your_password
DB_NAME=emr_db
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
BCRYPT_ROUNDS=12
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=HealthCare EMR
```

## 🤝 Contributing

This is a commercial-grade product. Please follow these guidelines:
1. Write clean, modular code
2. Add appropriate comments
3. Follow existing code style
4. Test thoroughly before committing
5. No placeholder code
6. Ensure responsive design

## 📄 License

Proprietary - All rights reserved

## 👥 Support

For issues and questions, please contact the development team.

---

**Built with ❤️ for Healthcare**
