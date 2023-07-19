const express = require('express');
const mongoose = require('mongoose');
const debug = require('debug')('server');
const chalk = require('chalk');
const cors = require('cors');
const noteRoutes = require('./routes/noteRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const PORT = 4000;
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Register the  routes
app.use('/api/v1', noteRoutes);
app.use('/api/v1', categoryRoutes);


mongoose
  .connect('mongodb://localhost:27017/bookstoreDB')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      debug(`Server is running on port ${chalk.green(PORT)}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });