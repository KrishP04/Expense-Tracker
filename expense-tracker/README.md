# Expense Tracker

A full-stack MERN (MongoDB, Express, React, Node.js) expense tracking application with CRUD operations, dynamic category budgeting, data visualization, and CSV export functionality.

## Features

- ✅ **CRUD Operations**: Create, read, update, and delete expenses
- ✅ **Category Management**: Create and manage expense categories with custom budgets
- ✅ **Budget Tracking**: Monitor spending against category budgets with visual indicators
- ✅ **Data Visualization**: Interactive charts showing spending trends by category
- ✅ **CSV Export**: Export expense data to CSV for reporting
- ✅ **Input Validation**: Server-side validation for data integrity
- ✅ **Responsive Design**: Modern, mobile-friendly UI

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Frontend**: React, Recharts, Axios
- **Validation**: Express-validator
- **Export**: CSV Writer

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd expense-tracker
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

4. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your MongoDB connection string:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
NODE_ENV=development
```

5. Make sure MongoDB is running on your system.

## Running the Application

### Development Mode

Run both backend and frontend concurrently:
```bash
npm run dev-all
```

Or run them separately:

**Backend:**
```bash
npm run dev
```

**Frontend:**
```bash
npm run client
```

### Production Mode

1. Build the React app:
```bash
cd client
npm run build
cd ..
```

2. Start the server:
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Expenses
- `GET /api/expenses` - Get all expenses (with optional filters)
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/stats/summary` - Get expense statistics
- `GET /api/expenses/export/csv` - Export expenses to CSV

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:name` - Get category by name
- `POST /api/categories` - Create new category
- `PUT /api/categories/:name` - Update category
- `DELETE /api/categories/:name` - Delete category
- `GET /api/categories/:name/budget-status` - Get budget status for category

## Project Structure

```
expense-tracker/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service functions
│   │   └── App.js
│   └── package.json
├── models/                 # Mongoose models
├── routes/                 # Express routes
├── server.js              # Express server
└── package.json
```

## Usage

1. **Add Categories**: Navigate to the Categories tab and create expense categories with optional budgets.

2. **Add Expenses**: Use the Add Expense tab to log new expenses with description, amount, category, date, and optional notes.

3. **View Dashboard**: Check the Dashboard for visualizations of your spending patterns and budget status.

4. **Manage Expenses**: View, edit, or delete expenses from the Expenses tab.

5. **Export Data**: Use the Export CSV button to download your expense data.

## License

MIT

