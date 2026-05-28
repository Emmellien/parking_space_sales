# SmartPark (PSSMS) — Frontend Workspace

SmartPark is a real-time Parking Space Space Management & Sales System (PSSMS) optimized for tracking infrastructure operations, public zone allocations, and automated transaction logging. Built for deployment profiles in regional hubs like Rubavu District, this dashboard allows cashiers and administrators to completely eliminate manual pen-and-paper tracking dependencies.

---

## 🚀 Key Features

* **Real-Time Visual Bay Matrix Map:** Automatically renders individual parking slots with color-coded operational states (`Open` vs `Occupied`).
* **Dynamic Data Overlay:** Displays vehicle license plate identifiers and active driver credentials directly inside active slots so operators don't have to navigate away.
* **Background Poll Syncing:** Leverages an automated, decoupled background `setInterval` polling hook ticking precisely every `10,000ms` (10 seconds) to ensure fluid tracking parity without manual page refreshes.
* **Highly Responsive Typography & Layouts:** Built on custom-tuned Tailwind utilities and robust vector asset mapping powered entirely by `lucide-react`.

---

## 🛠️ Tech Stack & Dependencies

* **Runtime Environment:** Node.js (LTS Version Recommended)
* **UI Architecture Framework:** React.js (Hooks pattern utilizing `useState` and `useEffect`)
* **Client Routing Structure:** `react-router-dom` (Version 6+)
* **Server Interfacing Core:** Axios Client Modulized Singleton Wrapper (`API.js`)
* **Design & Utility Styling:** Tailwind CSS Ecosystem
* **Icon Library Interface:** `lucide-react`

---

## 📂 Project Structure Directory Map

```text
frontend-project/
├── src/
│   ├── api/
│   │   └── API.js                 # Central Axios instances configured with backend proxy interceptors
│   ├── components/
│   │   ├── Header.jsx             # Top bar featuring context page title resolutions and active user tags
│   │   └── Sidebar.jsx            # Dynamic responsive dashboard links with targeted iconography
│   ├── pages/
│   │   ├── Home.jsx               # Corporate Landing Page featuring full validation feedback channels
│   │   ├── Dashboard.jsx          # Live data-matrix layout loop with auto-polling sync intervals
│   │   ├── ParkingSlot.jsx        # Slot configuration grids
│   │   ├── Car.jsx                # Registered vehicle inventory arrays
│   │   ├── ParkingRecord.jsx      # Active log timelines
│   │   └── Payment.jsx            # Transaction ledger configurations
│   ├── App.jsx                    # Root client router definitions
│   └── main.jsx                   # Bundle compiler entry node
├── package.json
└── tailwind.config.js
---

##  Developed by NIYIGABA EmmellienGuillaume