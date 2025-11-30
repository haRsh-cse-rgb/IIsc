import { connectDatabase } from './config/database.js';
import { Hall } from './models/Hall.js';
import { User } from './models/User.js';
import { Schedule } from './models/Schedule.js';
import { Event } from './models/Event.js';
import { Announcement } from './models/Announcement.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const seedDatabase = async () => {
  try {
    await connectDatabase();

    console.log('🧹 Clearing existing data...');
    await Hall.deleteMany({});
    await User.deleteMany({});
    await Schedule.deleteMany({});
    await Event.deleteMany({});
    await Announcement.deleteMany({});

    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      email: 'admin@stis.edu',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin'
    });

    console.log('🏛️  Creating halls...');
    const halls = await Hall.create([
      {
        name: 'Main Auditorium',
        code: 'HALL-A',
        capacity: 500,
        location: 'Ground Floor, Central Building'
      },
      {
        name: 'Conference Hall B',
        code: 'HALL-B',
        capacity: 200,
        location: 'First Floor, West Wing'
      },
      {
        name: 'Seminar Room C',
        code: 'HALL-C',
        capacity: 100,
        location: 'Second Floor, East Wing'
      },
      {
        name: 'Workshop Hall D',
        code: 'HALL-D',
        capacity: 150,
        location: 'Ground Floor, North Building'
      }
    ]);

    console.log('📅 Creating sample schedules...');
    const baseDate = new Date();
    baseDate.setHours(9, 0, 0, 0);

    const schedules = [];
    for (let day = 0; day < 4; day++) {
      for (let hallIndex = 0; hallIndex < halls.length; hallIndex++) {
        const hall = halls[hallIndex];
        const dayDate = new Date(baseDate);
        dayDate.setDate(dayDate.getDate() + day);

        for (let slot = 0; slot < 4; slot++) {
          const startTime = new Date(dayDate);
          startTime.setHours(9 + slot * 2);

          const endTime = new Date(startTime);
          endTime.setHours(startTime.getHours() + 1, 45);

          schedules.push({
            title: `Day ${day + 1} Session ${slot + 1} - ${hall.code}`,
            authors: `Dr. Speaker ${slot + 1}, Prof. Researcher ${hallIndex + 1}`,
            hall: hall._id,
            startTime,
            endTime,
            status: 'upcoming',
            tags: ['research', 'technology', `day-${day + 1}`],
            description: `Important presentation about cutting-edge research in ${hall.name}`
          });
        }
      }
    }

    await Schedule.create(schedules);

    console.log('🎉 Creating events...');
    const events = [];
    for (let day = 0; day < 4; day++) {
      const eventDate = new Date(baseDate);
      eventDate.setDate(eventDate.getDate() + day);
      eventDate.setHours(19, 0, 0, 0);

      const endTime = new Date(eventDate);
      endTime.setHours(21, 0, 0, 0);

      events.push({
        title: `Day ${day + 1} Conference Dinner`,
        type: 'dinner',
        description: `Welcome dinner for all conference attendees on day ${day + 1}`,
        venue: 'Main Dining Hall, IISc Campus',
        startTime: eventDate,
        endTime: endTime,
        rsvpRequired: true
      });

      if (day === 2) {
        const culturalDate = new Date(eventDate);
        culturalDate.setHours(21, 30, 0, 0);
        const culturalEnd = new Date(culturalDate);
        culturalEnd.setHours(23, 0, 0, 0);

        events.push({
          title: 'Cultural Evening - Traditional Dance Performance',
          type: 'cultural',
          description: 'Enjoy an evening of traditional Indian classical dance and music',
          venue: 'Open Air Theatre, IISc Campus',
          startTime: culturalDate,
          endTime: culturalEnd,
          rsvpRequired: false
        });
      }
    }

    await Event.create(events);

    console.log('📢 Creating sample announcements...');
    await Announcement.create([
      {
        title: 'Welcome to STIS Conference',
        type: 'announcement',
        priority: 'high',
        content: 'Welcome all attendees to the 4-day STIS Conference at IISc Bangalore. Please check your schedules and hall assignments.',
        createdBy: adminUser._id
      },
      {
        title: 'Registration Open',
        type: 'announcement',
        priority: 'normal',
        content: 'Registration desk is now open at the main entrance. Please collect your badges and conference materials.',
        createdBy: adminUser._id
      },
      {
        title: 'Bus Schedule Update',
        type: 'transport',
        priority: 'urgent',
        content: 'Due to traffic, the shuttle bus from the airport will be delayed by 30 minutes. New arrival time: 2:30 PM.',
        createdBy: adminUser._id
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email: admin@stis.edu');
    console.log('   Password: admin123');
    console.log(`\n🏛️  Created ${halls.length} halls`);
    console.log(`📅 Created ${schedules.length} schedule entries`);
    console.log(`🎉 Created ${events.length} events`);
    console.log(`📢 Created 3 sample announcements\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
