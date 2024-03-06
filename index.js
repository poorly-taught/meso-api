import app from './src/app.js';

const PORT = parseInt(process.env.PORT, 10) || 3000;

app.listen(PORT, async () => {
  console.log(`Successfully listening on localhost:3000/api`);
});
