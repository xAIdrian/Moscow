import express from 'express';
import routes from './routes.js';
import cors from 'cors'; 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Use the cors module

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use('/', routes);
