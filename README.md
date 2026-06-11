# 💧 AquaSmart — Smart House Irrigation System

A React-based web application to monitor and control home irrigation zones intelligently. Built with real-time zone control, weather integration, scheduling, and automated watering logic.

---

## 🚀 Features

- **Dashboard** — Live weather strip, system gauges (humidity, water usage, wind), zone grid, weekly usage chart
- **Zone Control** — 6 irrigation zones with real-time on/off toggles, moisture level bars, live flow rate, and auto-stop timers
- **Scheduling** — Add/edit/delete watering schedules per zone with custom time, duration, and days
- **Smart Automation** — Auto Mode (AI-based), Rain Skip (skips watering if rain forecast >60%)
- **Settings** — Daily water limits, usage alerts, system info panel

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| React Hooks (useState, useEffect, useCallback) | State & side effects |
| Inline CSS-in-JS | Styling (no external CSS lib) |
| SVG | Gauge components |

---

## 📁 Project Structure

```
aquasmart-irrigation-system/
├── public/
│   └── index.html          # HTML entry point
├── src/
│   ├── App.jsx             # Main application component
│   └── index.js            # React DOM entry point
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v16 or above)
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/aquasmart-irrigation-system.git

# 2. Navigate into the project
cd aquasmart-irrigation-system

# 3. Install dependencies
npm install

# 4. Start the development server
npm start
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

---

## 📸 Screenshots

| Dashboard | Zones | Schedule |
|---|---|---|
| Weather, gauges, zone grid | Zone cards with moisture | Add & manage schedules |

---

## 👨‍💻 Author

**Mansoor** — Software Engineering Student, MUST  
Mirpur University of Science and Technology, AJ&K  

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
