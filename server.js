const express = require('express');
const app = express();

app.use('/', (req, res) => {
  res.send('Server is running on Vercel!');
});

// Export the app to Vercel
module.exports = app;
