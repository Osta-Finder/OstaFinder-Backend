import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Request from '../models/request.model.js';
import Worker from '../models/worker.model.js';
import User from '../models/user.model.js';

dotenv.config();

async function checkDb() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);
    console.log('Connected to DB');

    const totalRequests = await Request.countDocuments();
    console.log('Total requests in DB:', totalRequests);

    const allRequests = await Request.find().populate('user', 'name').populate('worker', 'name');
    console.log('Requests details:');
    allRequests.forEach((req, idx) => {
      console.log(`${idx + 1}. Request ID: ${req._id}
   Service: ${req.service}
   Status: ${req.status}
   Client: ${req.user?.name || 'Unknown'} (ID: ${req.user?._id})
   Worker: ${req.worker?.name || 'Unknown'} (ID: ${req.worker?._id || req.worker})
   CreatedAt: ${req.createdAt}`);
    });

    const totalWorkers = await Worker.countDocuments();
    console.log('\nTotal workers in DB:', totalWorkers);
    const workers = await Worker.find({}, 'name email phoneNumber');
    workers.forEach(w => {
      console.log(`- Worker: ${w.name} (ID: ${w._id}) Email: ${w.email}`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDb();
