# CPD Points Tracker Dashboard

## 🏥 Overview

A real-time Continuing Professional Development (CPD) Points Tracking Dashboard for medical professionals. Track, monitor, and manage CPD points for your entire medical staff.

## ✨ Features

- **Real-time Updates**: Live updates using WebSocket (Socket.io)
- **Staff Management**: Add and manage medical professionals
- **Activity Logging**: Log CPD activities with points and categories
- **Interactive Dashboard**: View real-time statistics and leaderboards
- **Staff Profiles**: Detailed view of each staff member's CPD progress
- **Categories Support**: Conference, Workshop, Course, Online Learning, etc.
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Connection Status**: Real-time connection indicator

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Lcaminade85/CMD.git
cd CMD
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## 📊 Dashboard Sections

### 1. Dashboard Tab
- Real-time statistics (Total Staff, Total Points, Total Activities, Average Points)
- CPD Points Leaderboard showing staff ranked by their points
- Auto-refresh every 5 seconds

### 2. Add Staff Tab
- Form to add new medical professionals
- Fields: Name, Email, Profession
- Profession options: Doctor, Nurse, Pharmacist, Dentist, Physiotherapist, Healthcare Assistant

### 3. Log Activity Tab
- Log CPD activities for staff members
- Fields: Staff Member, Activity Name, Points, Category, Date, Description
- Categories: Conference, Workshop, Course, Online Learning, Professional Membership, Presentation, Research

### 4. Staff Details Tab
- View all staff members with their total CPD points
- See recent activities for each staff member
- Individual staff cards with comprehensive information

## 🔄 Real-time Features

- **Live Connection Status**: Green dot indicates active connection
- **Instant Updates**: When new staff is added or activity is logged, all connected clients see updates immediately
- **WebSocket Communication**: Uses Socket.io for efficient real-time communication
- **Auto-refresh**: Dashboard refreshes every 5 seconds for live data

## 📱 Responsive Design

- Mobile-friendly interface
- Tablet optimized
- Desktop full-featured experience

## 🗄️ Database

Using SQLite3 with three main tables:

- **staff**: Medical professionals information
- **cpd_activities**: CPD activities logged for each staff
- **cpd_targets**: CPD targets and goals for staff (for future use)

## 🔌 API Endpoints

### Staff Management
- `GET /api/staff` - Get all staff members
- `POST /api/staff` - Add new staff member
- `GET /api/staff/:staffId/cpd` - Get CPD activities for a staff member
- `GET /api/staff/:staffId/summary` - Get CPD summary for a staff member

### CPD Activities
- `POST /api/cpd-activity` - Log new CPD activity
- `GET /api/dashboard/summary` - Get dashboard summary for all staff

## 🎨 Tech Stack

- **Backend**: Node.js + Express
- **Real-time**: Socket.io
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Modern CSS with gradients and animations

## 📝 Usage Examples

### Adding a Staff Member
1. Click "Add Staff" tab
2. Fill in Name, Email, and Profession
3. Click "Add Staff Member"
4. Staff appears immediately in the dropdown and dashboard

### Logging CPD Activity
1. Click "Log Activity" tab
2. Select a staff member
3. Enter activity details (name, points, category, date)
4. Click "Log Activity"
5. Points are immediately added to staff member's total
6. Dashboard updates in real-time

## 🔐 Security Considerations

- Email validation on staff creation
- Input sanitization
- CORS configuration
- Consider adding authentication for production use

## 🚀 Future Enhancements

- User authentication and authorization
- CPD targets and goals tracking
- Email notifications for milestones
- Export reports (PDF, CSV)
- Advanced analytics and charts
- Filtering by date range and category
- User roles (Admin, Manager, Staff)
- Activity approval workflow

## 📄 License

MIT License - see LICENSE file for details

## 👥 Contributing

Contributions are welcome! Please create a branch and submit a pull request.

## 📧 Support

For issues or questions, please create an issue on GitHub.

---

**Last Updated**: June 2026
