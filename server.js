import 'dotenv/config';
import app from './src/app.js';

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`[File Service] Running on port ${PORT}`);
});
