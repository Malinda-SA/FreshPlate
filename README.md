# FreshPlate 🍽️

A home cooked food delivery mobile app that connects local cooks with customers, powered by delivery drivers and managed by admins.

## Tech Stack

- **Frontend**: React Native (Expo) + TypeScript
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
FreshPlate/
├── backend/          # Node.js + Express REST API
├── frontend/         # React Native (Expo) mobile app
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup
```bash
cd backend
cp .env.example .env    # Configure your environment variables
npm install
npm run dev             # Start development server
```

### Frontend Setup
```bash
cd frontend
npm install
npx expo start          # Start Expo development server
```

## User Roles

| Role | Description |
|------|-------------|
| **Customer** | Browse foods, place orders, track deliveries |
| **Cook** | List food items, manage incoming orders |
| **Driver** | Accept and deliver orders |
| **Admin** | Approve cooks/drivers, manage users and orders |

## Team

- 4 team members

## License

Private — All rights reserved.
