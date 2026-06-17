import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Request from '../models/request.model.js';
import User from '../models/user.model.js';
import Worker from '../models/worker.model.js';

dotenv.config();

async function checkWorkerRequests() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);
    const workerId = '6a3159fd1ca9fc536c7cb652';
    const requests = await Request.find({ worker: workerId }).populate('user', 'name');
    console.log(`Found ${requests.length} requests for worker ${workerId}:`);
    requests.forEach((r, idx) => {
      console.log(`${idx + 1}. ID: ${r._id} | Service: ${r.service} | Status: ${r.status} | Client: ${r.user?.name} | CreatedAt: ${r.createdAt}`);
    });
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkWorkerRequests();
