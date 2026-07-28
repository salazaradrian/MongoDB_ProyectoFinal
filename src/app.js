const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const hospitalesRoutes = require('./routes/hospitalesRoutes');
const pacientesRoutes = require('./routes/pacientesRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/hospitales', hospitalesRoutes);
app.use('/api/pacientes', pacientesRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
