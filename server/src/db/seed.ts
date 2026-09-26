import bcrypt from 'bcryptjs';
import { db, pool } from './index.js';
import { users, fields, advisories, treatment_logs, chat_messages } from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

export async function seed() {
  console.log('🌱 Starting FarmMitra database seeding...');

  try {
    // Enable uuid-ossp extension if available
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Create tables if they do not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS fields (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        crop_type TEXT NOT NULL,
        sowing_date DATE NOT NULL,
        soil_type TEXT NOT NULL,
        location TEXT NOT NULL,
        latitude NUMERIC NOT NULL,
        longitude NUMERIC NOT NULL,
        acreage NUMERIC NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS advisories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
        irrigation_plan TEXT NOT NULL,
        fertilizer_plan JSONB NOT NULL,
        risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')) NOT NULL,
        risk_notes TEXT NOT NULL,
        cost_of_inaction TEXT NOT NULL,
        plan_drift_detected BOOLEAN DEFAULT FALSE NOT NULL,
        drift_explanation TEXT,
        next_check_in DATE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS treatment_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        advisory_id UUID NOT NULL REFERENCES advisories(id) ON DELETE CASCADE,
        action_taken TEXT NOT NULL,
        status TEXT CHECK (status IN ('done', 'skipped')) NOT NULL,
        farmer_note TEXT,
        done_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
        role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
        message TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    // Clean existing seed data cleanly if needed
    console.log('🧹 Cleaning old mock data...');
    await db.delete(chat_messages);
    await db.delete(treatment_logs);
    await db.delete(advisories);
    await db.delete(fields);
    await db.delete(users);

    // 1. Create Mock User
    const hashedPassword = await bcrypt.hash('password123', 10);
    const [user] = await db
      .insert(users)
      .values({
        email: 'farmer@farmmitra.ai',
        password_hash: hashedPassword,
        name: 'Ramesh Kumar',
      })
      .returning();

    console.log(`👤 Created Mock User: ${user.email} (${user.id})`);

    // 2. Create Mock Fields
    const [field1] = await db
      .insert(fields)
      .values({
        user_id: user.id,
        crop_type: 'Cotton',
        sowing_date: '2026-06-15',
        soil_type: 'Black Cotton Soil',
        location: 'Warangal, Telangana',
        latitude: '17.9784',
        longitude: '79.5941',
        acreage: '4.5',
      })
      .returning();

    const [field2] = await db
      .insert(fields)
      .values({
        user_id: user.id,
        crop_type: 'Wheat',
        sowing_date: '2025-11-01',
        soil_type: 'Alluvial Soil',
        location: 'Ludhiana, Punjab',
        latitude: '30.9010',
        longitude: '75.8573',
        acreage: '8.0',
      })
      .returning();

    console.log(`🌾 Created 2 Mock Fields: ${field1.crop_type} & ${field2.crop_type}`);

    // 3. Create Advisories
    const [advisory1] = await db
      .insert(advisories)
      .values({
        field_id: field1.id,
        irrigation_plan: 'Apply 35mm drip irrigation every 3 days. Soil moisture is currently 22%.',
        fertilizer_plan: [
          { name: 'Urea (46% N)', dosage: '45 kg/acre', timing: 'At flowering stage (Day 45)' },
          { name: 'MOP (60% K2O)', dosage: '20 kg/acre', timing: 'Immediate top dressing' },
        ],
        risk_level: 'medium',
        risk_notes: 'Pink bollworm infestation risk detected due to high night temperatures (>28°C) and humdity.',
        cost_of_inaction: 'Potential 25-30% yield penalty (estimated loss: ₹35,000/acre) if preventive spray delayed by >5 days.',
        plan_drift_detected: true,
        drift_explanation: 'Farmer missed scheduled potassium spray 4 days ago.',
        next_check_in: '2026-09-28',
      })
      .returning();

    const [advisory2] = await db
      .insert(advisories)
      .values({
        field_id: field2.id,
        irrigation_plan: 'Standard canal irrigation schedule. Next watering in 7 days.',
        fertilizer_plan: [
          { name: 'DAP (18-46-0)', dosage: '50 kg/acre', timing: 'Completed baseline' },
        ],
        risk_level: 'low',
        risk_notes: 'Crop condition healthy. Yellow rust monitoring active.',
        cost_of_inaction: 'Negligible immediate risk. Maintain weed control schedule.',
        plan_drift_detected: false,
        drift_explanation: null,
        next_check_in: '2026-10-02',
      })
      .returning();

    console.log(`💡 Created Mock Advisories for Field 1 and Field 2`);

    // 4. Create Treatment Logs
    await db.insert(treatment_logs).values([
      {
        advisory_id: advisory1.id,
        action_taken: 'Sprayed Neem Oil (1500 ppm) + Neem Cake application',
        status: 'done',
        farmer_note: 'Applied early morning around 6:30 AM before sunlight got harsh.',
      },
      {
        advisory_id: advisory1.id,
        action_taken: 'Potassium MOP Top Dressing',
        status: 'skipped',
        farmer_note: 'Heavy rainfall expected, delayed fertilizer application to prevent runoff.',
      },
    ]);

    console.log(`📋 Created Mock Treatment Logs`);

    // 5. Create Chat Messages
    await db.insert(chat_messages).values([
      {
        field_id: field1.id,
        role: 'user',
        message: 'I noticed some yellowing on the bottom leaves of my cotton plants. Is this pink bollworm or nitrogen deficiency?',
      },
      {
        field_id: field1.id,
        role: 'assistant',
        message: 'Based on your black cotton soil type and current growth stage, yellowing on lower leaves typically indicates Nitrogen deficiency or waterlogging. Pink bollworm manifests as damaged squares and rosetted flowers. Inspect leaf veins for yellowing and ensure drip lines are unclogged.',
      },
    ]);

    console.log(`💬 Created Mock Chat History`);

    console.log('✅ FarmMitra database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
