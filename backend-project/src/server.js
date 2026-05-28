const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routers/auth.js');
const carRoutes = require('./routers/car.js');
const parkingSlotRoutes = require('./routers/Parkingslot.js');
const parkingRecordRoutes = require('./routers/Parkingrecord.js');
const reportRoutes = require('./routers/report.js');


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/slots', parkingSlotRoutes);
app.use('/api/parking', parkingRecordRoutes);

app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));