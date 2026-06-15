import mongoose from 'mongoose';
import 'dotenv/config';

mongoose.connect(process.env.DB_CONNECTION || 'mongodb://localhost:27017/OstaFinder').then(async () => {
  const db = mongoose.connection.getClient().db();
  await db.collection('users').updateOne(
    { email: 'mohamedabdelkarim1236@gamil.com' },
    { $set: { role: 'admin' } }
  );
  console.log('Updated role to admin');
  process.exit(0);
});
