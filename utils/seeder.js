import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Worker from '../models/worker.model.js';
import Category from '../models/category.model.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);
    console.log('✅ DB Connected for Seeding...');

    const categories = await Category.find();

    if (categories.length === 0) {
      console.log('⚠️ لا يوجد تصنيفات في قاعدة البيانات');
      process.exit();
    }

    // helper function
    const getCategoryId = (categoryName) => {
      return categories.find(
        (cat) => cat.name === categoryName
      )?._id;
    };

    const dummyWorkers = [

      // ================= أرضيات =================
      {
        name: 'محمد أشرف',
        rating: 4.9,
        location: 'القاهرة، مدينة نصر',
        price: 350,
        isOnline: true,
        password: '123A!',
        phoneNumber: '01000000001',
        email: 'floor1@example.com',
        category: getCategoryId('أرضيات')
      },
      {
        name: 'حسام فتحي',
        rating: 4.7,
        location: 'الجيزة، فيصل',
        price: 300,
        isOnline: false,
        password: '123A!',
        phoneNumber: '01000000002',
        email: 'floor2@example.com',
        category: getCategoryId('أرضيات')
      },
      {
        name: 'أحمد رجب',
        rating: 4.8,
        location: 'الإسكندرية، العصافرة',
        price: 400,
        isOnline: true,
        password: '123A!',
        phoneNumber: '01000000003',
        email: 'floor3@example.com',
        category: getCategoryId('أرضيات')
      },

      // ================= ألوميتال =================
      {
        name: 'كريم سامح',
        rating: 4.6,
        location: 'القاهرة، المعادي',
        price: 500,
        isOnline: true,
        password: '123A!',
        phoneNumber: '01000000004',
        email: 'alu1@example.com',
        category: getCategoryId('ألوميتال')
      },
      {
        name: 'مصطفى علي',
        rating: 4.5,
        location: 'الجيزة، الدقي',
        price: 450,
        isOnline: true,
        password: '123A!',
        phoneNumber: '01000000005',
        email: 'alu2@example.com',
        category: getCategoryId('ألوميتال')
      },
      {
        name: 'عبدالله خالد',
        rating: 4.9,
        location: 'القاهرة، التجمع',
        price: 600,
        isOnline: false,
        password: '123A!',
        phoneNumber: '01000000006',
        email: 'alu3@example.com',
        category: getCategoryId('ألوميتال')
      },

      // ================= محارة وبناء =================
      {
        name: 'سيد محمود',
        rating: 4.8,
        location: 'الشرقية، الزقازيق',
        price: 700,
        isOnline: true,
        password: '123A!',
        phoneNumber: '01000000007',
        email: 'build1@example.com',
        category: getCategoryId('محارة وبناء')
      },
      {
        name: 'رمضان إبراهيم',
        rating: 4.6,
        location: 'القاهرة، المطرية',
        price: 650,
        isOnline: false,
        password: '123A!',
        phoneNumber: '01000000008',
        email: 'build2@example.com',
        category: getCategoryId('محارة وبناء')
      },
      {
        name: 'محمود شوقي',
        rating: 4.7,
        location: 'الجيزة، الهرم',
        price: 750,
        isOnline: true,
        password: '123A!',
        phoneNumber: '01000000009',
        email: 'build3@example.com',
        category: getCategoryId('محارة وبناء')
      },

      // ================= نقل عفش =================
      {
        name: 'طارق حسن',
        rating: 4.9,
        location: 'القاهرة، شبرا',
        price: 800,
        isOnline: true,
        password: '123A!',
        phoneNumber: '01000000010',
        email: 'move1@example.com',
        category: getCategoryId('نقل عفش')
      },
      {
        name: 'وليد سامي',
        rating: 4.5,
        location: 'الإسكندرية، سيدي بشر',
        price: 700,
        isOnline: true,
        password: '123A!',
        phoneNumber: '01000000011',
        email: 'move2@example.com',
        category: getCategoryId('نقل عفش')
      },
      {
        name: 'شريف عادل',
        rating: 4.8,
        location: 'الجيزة، أكتوبر',
        price: 900,
        isOnline: false,
        password: '123A!',
        phoneNumber: '01000000012',
        email: 'move3@example.com',
        category: getCategoryId('نقل عفش')
      },

      // ================= تنظيف =================
      {
        name: 'منى سامي',
        rating: 5.0,
        location: 'القاهرة، الزمالك',
        price: 250,
        isOnline: true,
        password: '123A!',
        phoneNumber: '01000000013',
        email: 'clean1@example.com',
        category: getCategoryId('تنظيف')
      },
      {
        name: 'سارة أحمد',
        rating: 4.8,
        location: 'الجيزة، المهندسين',
        price: 300,
        isOnline: true,
        password: '123A!',
        phoneNumber: '01000000014',
        email: 'clean2@example.com',
        category: getCategoryId('تنظيف')
      },
      {
        name: 'هدى علي',
        rating: 4.7,
        location: 'القاهرة، الرحاب',
        price: 280,
        isOnline: false,
        password: '123A!',
        phoneNumber: '01000000015',
        email: 'clean3@example.com',
        category: getCategoryId('تنظيف')
      }

    ];

    await Worker.deleteMany();
    console.log('🗑️ Old Workers Deleted');

    await Worker.insertMany(dummyWorkers);
    console.log('🌱 Dummy Workers Inserted Successfully!');

    process.exit();

  } catch (error) {
    console.error('❌ Error with Seeder:', error.message);
    process.exit(1);
  }
};

seedData();