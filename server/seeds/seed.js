import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Contact from '../models/Contact.js';
import Deal from '../models/Deal.js';
import Activity from '../models/Activity.js';

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany(),
    Contact.deleteMany(),
    Deal.deleteMany(),
    Activity.deleteMany(),
  ]);

  // Create users
  const admin = await User.create({
    name: 'Yeabsira Daniel',
    email: 'admin@salespulse.com',
    password: 'password123',
    role: 'admin',
  });

  const sales1 = await User.create({
    name: 'Sara Mekonnen',
    email: 'sara@salespulse.com',
    password: 'password123',
    role: 'sales',
  });

  const sales2 = await User.create({
    name: 'Dawit Haile',
    email: 'dawit@salespulse.com',
    password: 'password123',
    role: 'sales',
  });

  const users = [admin, sales1, sales2];

  // Create contacts
  const contacts = await Contact.insertMany([
    { name: 'Abebe Tekle', email: 'abebe@techcorp.com', phone: '+251911234567', company: 'TechCorp Ethiopia', createdBy: admin._id },
    { name: 'Meron Alemu', email: 'meron@safaricom.com', phone: '+251922345678', company: 'Safaricom ET', createdBy: sales1._id },
    { name: 'Kidist Gebre', email: 'kidist@ridevue.io', phone: '+251933456789', company: 'RideVue', createdBy: sales2._id },
    { name: 'Solomon Bekele', email: 'solomon@addispay.com', phone: '+251944567890', company: 'AddisPay', createdBy: admin._id },
    { name: 'Hana Tadesse', email: 'hana@greenfields.et', phone: '+251955678901', company: 'GreenFields', createdBy: sales1._id },
    { name: 'Yonas Worku', email: 'yonas@cloudnine.io', phone: '+251966789012', company: 'CloudNine Solutions', createdBy: sales2._id },
    { name: 'Tigist Lemma', email: 'tigist@ethiobank.com', phone: '+251977890123', company: 'EthioBank', createdBy: admin._id },
    { name: 'Bereket Hailu', email: 'bereket@logix.et', phone: '+251988901234', company: 'Logix Freight', createdBy: sales1._id },
    { name: 'Rahel Desta', email: 'rahel@brightmed.com', phone: '+251911012345', company: 'BrightMed', createdBy: sales2._id },
    { name: 'Ephrem Girma', email: 'ephrem@agritech.et', phone: '+251922123456', company: 'AgriTech Ethiopia', createdBy: admin._id },
  ]);

  // Create deals across stages with realistic dates
  const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  const dealData = [
    { title: 'TechCorp CRM Integration', value: 15000, stage: 'closed_won', contact: 0, user: 0, daysAgo: 45 },
    { title: 'Safaricom Dashboard', value: 28000, stage: 'negotiation', contact: 1, user: 1, daysAgo: 10 },
    { title: 'RideVue Mobile App', value: 42000, stage: 'proposal', contact: 2, user: 2, daysAgo: 15 },
    { title: 'AddisPay Payment Gateway', value: 35000, stage: 'closed_won', contact: 3, user: 0, daysAgo: 90 },
    { title: 'GreenFields Inventory System', value: 18000, stage: 'qualified', contact: 4, user: 1, daysAgo: 5 },
    { title: 'CloudNine Migration', value: 55000, stage: 'closed_won', contact: 5, user: 2, daysAgo: 120 },
    { title: 'EthioBank Fraud Detection', value: 72000, stage: 'proposal', contact: 6, user: 0, daysAgo: 8 },
    { title: 'Logix Fleet Tracker', value: 22000, stage: 'lead', contact: 7, user: 1, daysAgo: 2 },
    { title: 'BrightMed Patient Portal', value: 31000, stage: 'closed_lost', contact: 8, user: 2, daysAgo: 60 },
    { title: 'AgriTech Sensor Dashboard', value: 19000, stage: 'lead', contact: 9, user: 0, daysAgo: 1 },
    { title: 'TechCorp Phase 2', value: 25000, stage: 'qualified', contact: 0, user: 0, daysAgo: 7 },
    { title: 'Safaricom Analytics', value: 38000, stage: 'closed_won', contact: 1, user: 1, daysAgo: 150 },
    { title: 'AddisPay Mobile Wallet', value: 45000, stage: 'negotiation', contact: 3, user: 0, daysAgo: 12 },
    { title: 'RideVue Admin Panel', value: 16000, stage: 'closed_won', contact: 2, user: 2, daysAgo: 75 },
    { title: 'CloudNine API Gateway', value: 33000, stage: 'closed_lost', contact: 5, user: 1, daysAgo: 30 },
  ];

  const deals = [];
  for (const d of dealData) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - d.daysAgo);
    const deal = await Deal.create({
      title: d.title,
      value: d.value,
      stage: d.stage,
      contact: contacts[d.contact]._id,
      assignedTo: users[d.user]._id,
      expectedCloseDate: new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000),
      createdAt,
    });
    deals.push(deal);
  }

  // Create activities
  for (const deal of deals) {
    await Activity.create({
      type: 'deal_created',
      description: `Created deal "${deal.title}" ($${deal.value.toLocaleString()})`,
      deal: deal._id,
      user: deal.assignedTo,
      createdAt: deal.createdAt,
    });

    if (['closed_won', 'closed_lost'].includes(deal.stage)) {
      const closedAt = new Date(deal.createdAt);
      closedAt.setDate(closedAt.getDate() + Math.floor(Math.random() * 20) + 5);
      await Activity.create({
        type: 'deal_stage_changed',
        description: `Moved "${deal.title}" to ${deal.stage}`,
        deal: deal._id,
        user: deal.assignedTo,
        createdAt: closedAt,
      });
    }
  }

  console.log(`Seeded: ${users.length} users, ${contacts.length} contacts, ${deals.length} deals`);
  console.log('\nTest credentials:');
  console.log('  Admin: admin@salespulse.com / password123');
  console.log('  Sales: sara@salespulse.com / password123');

  await mongoose.disconnect();
};

seed().catch(console.error);
