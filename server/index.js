const express = require('express');
const mongoose = require('mongoose');
const productsRouter = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/products', productsRouter);

app.get('/', (req, res) => {
  res.send('API is running');
});

// Database connection
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('MONGO_URI is not defined in environment variables.');
  process.exit(1);
}

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () =>
      console.log(`Server is running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error('DB connection error:', err.message);
  });
