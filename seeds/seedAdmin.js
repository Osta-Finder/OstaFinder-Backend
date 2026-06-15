/**
 * seedAdmin.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeds the initial admin accounts.
 * Run with:  node seeds/seedAdmin.js
 *
 * SECURITY NOTE: Change the passwords below before deploying to production,
 * or better yet, pass them via environment variables.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/user.model.js';

const admins = [
  {
    name: 'محمد عبدالكريم',
    email: 'm.abdelkreem@ostafinder.com',
    phoneNumber: '01226469502',
    password: process.env.ADMIN1_PASSWORD || 'Osta@Admin#2025!',
    role: 'admin',
  },
  {
    name: 'أحمد السيد',
    email: 'a.elsayed@ostafinder.com',
    phoneNumber: '01017151411',
    password: process.env.ADMIN2_PASSWORD || 'Osta@Admin#2025@',
    role: 'admin',
  },
  {
    name: 'abdallah elnagar',
    email: 'a.elnagar@ostafinder.com',
    phoneNumber: '01224758900',
    password: process.env.ADMIN3_PASSWORD || 'Osta@Admin#2025#',
    role: 'admin',
  },
];

const seedAdmins = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);
    console.log(' DB connected');

    let created = 0;
    let skipped = 0;

    for (const adminData of admins) {
      const exists = await User.findOne({ email: adminData.email });
      if (exists) {
        console.log(`  Skipping "${adminData.name}" — email already exists`);
        skipped++;
        continue;
      }

      await User.create(adminData);
      console.log(` Created admin: ${adminData.name} (${adminData.email})`);
      created++;
    }

    console.log(`\n Summary: ${created} created, ${skipped} skipped`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seedAdmins();
