import { Router, Request, Response } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { fields, advisories, treatment_logs, chat_messages } from '../db/schema.js';
import { memDb } from '../db/inMemoryStore.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { createFieldSchema } from '../schemas/field.js';
import { geocodeLocation, getWeatherData } from '../services/weatherService.js';
import { generateGeminiAdvisory, generateGeminiCopilotChat } from '../services/geminiService.js';

const router = Router();

// Apply auth middleware to all field routes
router.use(authenticateToken);

/**
 * GET /api/fields
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;

  try {
    const userFields = await db
      .select()
      .from(fields)
      .where(eq(fields.user_id, userId));

    const enrichedFields = await Promise.all(
      userFields.map(async (f) => {
        const [latestAdvisory] = await db
          .select()
          .from(advisories)
          .where(eq(advisories.field_id, f.id))
          .orderBy(desc(advisories.created_at))
          .limit(1);

        const weather = await getWeatherData(
          parseFloat(f.latitude.toString()),
          parseFloat(f.longitude.toString())
        );

        const riskLevel = latestAdvisory?.risk_level || 'low';
        const nextCheckIn = latestAdvisory?.next_check_in || '9999-12-31';
        const riskScore = riskLevel === 'high' ? 3 : riskLevel === 'medium' ? 2 : 1;

        return { ...f, latestAdvisory, weather, riskScore, nextCheckIn };
      })
    );

    enrichedFields.sort((a, b) => {
      if (b.riskScore !== a.riskScore) return b.riskScore - a.riskScore;
      return a.nextCheckIn.localeCompare(b.nextCheckIn);
    });

    const sanitized = enrichedFields.map(({ riskScore, nextCheckIn, ...rest }) => rest);
    res.json({ fields: sanitized });
    return;
  } catch (error) {
    console.warn('[FieldsRoute] Postgres fetch fields failed, using memory DB:', (error as Error).message);
  }

  // Memory DB Fallback
  const memFields = memDb.getFieldsByUserId(userId);
  const enriched = await Promise.all(
    memFields.map(async (f) => {
      const advs = memDb.getAdvisoriesByFieldId(f.id);
      const latestAdvisory = advs[0] || null;
      const weather = await getWeatherData(parseFloat(f.latitude), parseFloat(f.longitude));
      const riskLevel = latestAdvisory?.risk_level || 'low';
      const nextCheckIn = latestAdvisory?.next_check_in || '9999-12-31';
      const riskScore = riskLevel === 'high' ? 3 : riskLevel === 'medium' ? 2 : 1;

      return { ...f, latestAdvisory, weather, riskScore, nextCheckIn };
    })
  );

  enriched.sort((a, b) => {
    if (b.riskScore !== a.riskScore) return b.riskScore - a.riskScore;
    return a.nextCheckIn.localeCompare(b.nextCheckIn);
  });

  const sanitized = enriched.map(({ riskScore, nextCheckIn, ...rest }) => rest);
  res.json({ fields: sanitized });
});

/**
 * POST /api/fields
 */
router.post('/', validateBody(createFieldSchema), async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { crop_type, sowing_date, soil_type, location, acreage, latitude, longitude } = req.body;

  let finalLat = latitude;
  let finalLon = longitude;

  if (finalLat === undefined || finalLon === undefined || isNaN(finalLat) || isNaN(finalLon)) {
    const geo = await geocodeLocation(location);
    finalLat = geo.latitude;
    finalLon = geo.longitude;
  }

  try {
    const [newField] = await db
      .insert(fields)
      .values({
        user_id: userId,
        crop_type,
        sowing_date,
        soil_type,
        location,
        latitude: finalLat.toString(),
        longitude: finalLon.toString(),
        acreage: acreage.toString(),
      })
      .returning();

    const weather = await getWeatherData(finalLat, finalLon);
    res.status(201).json({ field: newField, weather });
    return;
  } catch (error) {
    console.warn('[FieldsRoute] Postgres create field failed, using memory DB:', (error as Error).message);
  }

  // Memory DB Fallback
  const memField = memDb.createField({
    user_id: userId,
    crop_type,
    sowing_date,
    soil_type,
    location,
    latitude: finalLat.toString(),
    longitude: finalLon.toString(),
    acreage: acreage.toString(),
  });

  const weather = await getWeatherData(finalLat, finalLon);
  res.status(201).json({ field: memField, weather });
});

/**
 * POST /api/fields/demo-seed
 */
router.post('/demo-seed', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;

  const sowingDateObj = new Date();
  sowingDateObj.setDate(sowingDateObj.getDate() - 38);
  const sowingDateStr = sowingDateObj.toISOString().split('T')[0];

  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 3);
  const checkInStr = checkIn.toISOString().split('T')[0];

  try {
    const [demoField] = await db
      .insert(fields)
      .values({
        user_id: userId,
        crop_type: 'Chilli',
        sowing_date: sowingDateStr,
        soil_type: 'Black Cotton Soil',
        location: 'Warangal, Telangana',
        latitude: '17.9784',
        longitude: '79.5941',
        acreage: '4.5',
      } as any)
      .returning();

    const [demoAdvisory] = await db
      .insert(advisories)
      .values({
        field_id: demoField.id,
        irrigation_plan: 'Heavy rainfall expected (14mm). Suspend drip irrigation for 48 hours to prevent Phytophthora root rot.',
        fertilizer_plan: [
          { name: 'Basal NPK 19:19:19', timing: 'Skipped - Immediate Catch-up required', dosage: '65 kg' },
          { name: 'Calcium Nitrate & Boron', timing: 'Apply post-rain at 07:00 AM', dosage: '25 kg' },
        ],
        risk_level: 'high',
        risk_notes: 'High rainfall forecast (14mm) combined with 82% relative humidity and skipped basal NPK fertilizer creates ideal conditions for Chilli Powdery Mildew and Leaf Curl Virus.',
        cost_of_inaction: 'Skipping catch-up fertilizer and fungicide spray risks up to 35% fruit dropping and flower loss within 5 days.',
        plan_drift_detected: true,
        drift_explanation: 'Plan Drift Detected: Farmer skipped Basal NPK Fertilizer application on Day 30. Compensatory application of NPK 19:19:19 + Chelated Zinc recommended to restore vegetative vigor.',
        next_check_in: checkInStr,
      } as any)
      .returning();

    await db.insert(treatment_logs).values({
      advisory_id: demoAdvisory.id,
      action_taken: 'Basal NPK 19:19:19 Fertilizer',
      status: 'skipped',
      farmer_note: 'Skipped due to lack of labor on Day 30',
    } as any);

    res.status(201).json({ message: 'Demo field seeded successfully', field: demoField });
    return;
  } catch (error) {
    console.warn('[FieldsRoute] Postgres demo seed failed, using memory DB:', (error as Error).message);
  }

  // Memory DB Fallback
  const memField = memDb.createField({
    user_id: userId,
    crop_type: 'Chilli',
    sowing_date: sowingDateStr,
    soil_type: 'Black Cotton Soil',
    location: 'Warangal, Telangana',
    latitude: '17.9784',
    longitude: '79.5941',
    acreage: '4.5',
  });

  const memAdvisory = memDb.createAdvisory({
    field_id: memField.id,
    irrigation_plan: 'Heavy rainfall expected (14mm). Suspend drip irrigation for 48 hours to prevent Phytophthora root rot.',
    fertilizer_plan: [
      { name: 'Basal NPK 19:19:19', timing: 'Skipped - Immediate Catch-up required', dosage: '65 kg' },
      { name: 'Calcium Nitrate & Boron', timing: 'Apply post-rain at 07:00 AM', dosage: '25 kg' },
    ],
    risk_level: 'high',
    risk_notes: 'High rainfall forecast (14mm) combined with 82% relative humidity and skipped basal NPK fertilizer creates ideal conditions for Chilli Powdery Mildew and Leaf Curl Virus.',
    cost_of_inaction: 'Skipping catch-up fertilizer and fungicide spray risks up to 35% fruit dropping and flower loss within 5 days.',
    plan_drift_detected: true,
    drift_explanation: 'Plan Drift Detected: Farmer skipped Basal NPK Fertilizer application on Day 30. Compensatory application of NPK 19:19:19 + Chelated Zinc recommended to restore vegetative vigor.',
    next_check_in: checkInStr,
  });

  memDb.createTreatmentLog({
    advisory_id: memAdvisory.id,
    action_taken: 'Basal NPK 19:19:19 Fertilizer',
    status: 'skipped',
    farmer_note: 'Skipped due to lack of labor on Day 30',
  });

  res.status(201).json({ message: 'Demo field seeded successfully (Dev Mode)', field: memField });
});

/**
 * GET /api/fields/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const fieldId = req.params.id;

  try {
    const [field] = await db
      .select()
      .from(fields)
      .where(and(eq(fields.id, fieldId), eq(fields.user_id, userId)));

    if (field) {
      const fieldAdvisories = await db
        .select()
        .from(advisories)
        .where(eq(advisories.field_id, fieldId))
        .orderBy(desc(advisories.created_at));

      const advisoriesWithLogs = await Promise.all(
        fieldAdvisories.map(async (adv) => {
          const logs = await db
            .select()
            .from(treatment_logs)
            .where(eq(treatment_logs.advisory_id, adv.id))
            .orderBy(desc(treatment_logs.done_at));
          return { ...adv, treatment_logs: logs };
        })
      );

      const fieldChats = await db
        .select()
        .from(chat_messages)
        .where(eq(chat_messages.field_id, fieldId))
        .orderBy(chat_messages.created_at);

      const weather = await getWeatherData(
        parseFloat(field.latitude.toString()),
        parseFloat(field.longitude.toString())
      );

      res.json({
        field,
        advisories: advisoriesWithLogs,
        chat_messages: fieldChats,
        weather,
      });
      return;
    }
  } catch (error) {
    console.warn('[FieldsRoute] Postgres fetch field details failed, using memory DB:', (error as Error).message);
  }

  // Memory DB Fallback
  const memField = memDb.getFieldById(fieldId, userId);
  if (!memField) {
    res.status(404).json({ error: 'Field not found or access denied' });
    return;
  }

  const memAdvisories = memDb.getAdvisoriesByFieldId(fieldId).map((adv) => ({
    ...adv,
    treatment_logs: memDb.getTreatmentLogsByAdvisoryId(adv.id),
  }));

  const memChats = memDb.getChatMessagesByFieldId(fieldId);
  const weather = await getWeatherData(parseFloat(memField.latitude), parseFloat(memField.longitude));

  res.json({
    field: memField,
    advisories: memAdvisories,
    chat_messages: memChats,
    weather,
  });
});

/**
 * DELETE /api/fields/:id
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const fieldId = req.params.id;

  try {
    const [existingField] = await db
      .select()
      .from(fields)
      .where(and(eq(fields.id, fieldId), eq(fields.user_id, userId)));

    if (existingField) {
      await db
        .delete(fields)
        .where(and(eq(fields.id, fieldId), eq(fields.user_id, userId)));

      res.json({ message: 'Field deleted successfully', id: fieldId });
      return;
    }
  } catch (error) {
    console.warn('[FieldsRoute] Postgres delete field failed, trying memory DB:', (error as Error).message);
  }

  const deleted = memDb.deleteField(fieldId, userId);
  if (deleted) {
    res.json({ message: 'Field deleted successfully', id: fieldId });
  } else {
    res.status(404).json({ error: 'Field not found or access denied' });
  }
});

/**
 * POST /api/fields/:id/advisory
 */
router.post('/:id/advisory', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const fieldId = req.params.id;

  let fieldObj: any = null;
  let recentLogs: any[] = [];

  try {
    const [field] = await db
      .select()
      .from(fields)
      .where(and(eq(fields.id, fieldId), eq(fields.user_id, userId)));

    if (field) {
      fieldObj = field;
      recentLogs = await db
        .select({
          id: treatment_logs.id,
          action_taken: treatment_logs.action_taken,
          status: treatment_logs.status,
          farmer_note: treatment_logs.farmer_note,
          done_at: treatment_logs.done_at,
        })
        .from(treatment_logs)
        .innerJoin(advisories, eq(treatment_logs.advisory_id, advisories.id))
        .where(eq(advisories.field_id, fieldId))
        .orderBy(desc(treatment_logs.done_at))
        .limit(10);
    }
  } catch (error) {
    console.warn('[FieldsRoute] Postgres advisory context query failed, trying memory DB:', (error as Error).message);
  }

  if (!fieldObj) {
    fieldObj = memDb.getFieldById(fieldId, userId);
    if (!fieldObj) {
      res.status(404).json({ error: 'Field not found or access denied' });
      return;
    }
    recentLogs = memDb.getTreatmentLogsForField(fieldId);
  }

  const sowingDateMs = new Date(fieldObj.sowing_date).getTime();
  const daysSinceSowing = Math.max(0, Math.floor((Date.now() - sowingDateMs) / 86400000));
  const weather = await getWeatherData(parseFloat(fieldObj.latitude), parseFloat(fieldObj.longitude));

  const generated = await generateGeminiAdvisory(fieldObj, daysSinceSowing, weather, recentLogs);

  try {
    const [newAdvisory] = await db
      .insert(advisories)
      .values({
        field_id: fieldId,
        irrigation_plan: generated.irrigation,
        fertilizer_plan: generated.fertilizer,
        risk_level: generated.riskLevel,
        risk_notes: generated.riskNotes,
        cost_of_inaction: generated.costOfInaction,
        plan_drift_detected: generated.planDriftDetected,
        drift_explanation: generated.driftExplanation,
        next_check_in: generated.nextCheckInDate,
      } as any)
      .returning();

    res.status(201).json({ advisory: newAdvisory, days_since_sowing: daysSinceSowing, weather });
    return;
  } catch (error) {
    console.warn('[FieldsRoute] Postgres insert advisory failed, saving in memory DB:', (error as Error).message);
  }

  const memAdvisory = memDb.createAdvisory({
    field_id: fieldId,
    irrigation_plan: generated.irrigation,
    fertilizer_plan: generated.fertilizer,
    risk_level: generated.riskLevel,
    risk_notes: generated.riskNotes,
    cost_of_inaction: generated.costOfInaction,
    plan_drift_detected: generated.planDriftDetected,
    drift_explanation: generated.driftExplanation,
    next_check_in: generated.nextCheckInDate,
  });

  res.status(201).json({ advisory: memAdvisory, days_since_sowing: daysSinceSowing, weather });
});

/**
 * POST /api/fields/:id/treatment-logs
 */
router.post('/:id/treatment-logs', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const fieldId = req.params.id;
  const { advisory_id, action_taken, status, farmer_note } = req.body;

  if (!advisory_id || !action_taken || !['done', 'skipped'].includes(status)) {
    res.status(400).json({ error: 'Invalid treatment log parameters' });
    return;
  }

  try {
    const [field] = await db
      .select()
      .from(fields)
      .where(and(eq(fields.id, fieldId), eq(fields.user_id, userId)));

    if (field) {
      const [newLog] = await db
        .insert(treatment_logs)
        .values({
          advisory_id,
          action_taken,
          status,
          farmer_note: farmer_note || null,
        } as any)
        .returning();

      res.status(201).json({ log: newLog });
      return;
    }
  } catch (error) {
    console.warn('[FieldsRoute] Postgres treatment log insert failed, saving in memory DB:', (error as Error).message);
  }

  const memLog = memDb.createTreatmentLog({
    advisory_id,
    action_taken,
    status,
    farmer_note: farmer_note || null,
  });

  res.status(201).json({ log: memLog });
});

/**
 * GET /api/fields/:id/chat
 */
router.get('/:id/chat', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const fieldId = req.params.id;

  try {
    const [field] = await db
      .select()
      .from(fields)
      .where(and(eq(fields.id, fieldId), eq(fields.user_id, userId)));

    if (field) {
      const messages = await db
        .select()
        .from(chat_messages)
        .where(eq(chat_messages.field_id, fieldId))
        .orderBy(chat_messages.created_at);

      res.json({ messages });
      return;
    }
  } catch (error) {
    console.warn('[FieldsRoute] Postgres chat fetch failed, using memory DB:', (error as Error).message);
  }

  const memChats = memDb.getChatMessagesByFieldId(fieldId);
  res.json({ messages: memChats });
});

/**
 * POST /api/fields/:id/chat
 */
router.post('/:id/chat', async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const fieldId = req.params.id;
  const { message, imageBase64 } = req.body;

  if (!message && !imageBase64) {
    res.status(400).json({ error: 'Message or image required' });
    return;
  }

  let fieldObj: any = null;
  let latestAdvisory: any = null;

  try {
    const [field] = await db
      .select()
      .from(fields)
      .where(and(eq(fields.id, fieldId), eq(fields.user_id, userId)));

    if (field) {
      fieldObj = field;
      const [adv] = await db
        .select()
        .from(advisories)
        .where(eq(advisories.field_id, fieldId))
        .orderBy(desc(advisories.created_at))
        .limit(1);
      latestAdvisory = adv || null;
    }
  } catch (error) {
    console.warn('[FieldsRoute] Postgres chat context failed, using memory DB:', (error as Error).message);
  }

  if (!fieldObj) {
    fieldObj = memDb.getFieldById(fieldId, userId);
    if (!fieldObj) {
      res.status(404).json({ error: 'Field not found or access denied' });
      return;
    }
    const advs = memDb.getAdvisoriesByFieldId(fieldId);
    latestAdvisory = advs[0] || null;
  }

  const sowingDateMs = new Date(fieldObj.sowing_date).getTime();
  const daysSinceSowing = Math.max(0, Math.floor((Date.now() - sowingDateMs) / 86400000));
  const weather = await getWeatherData(parseFloat(fieldObj.latitude), parseFloat(fieldObj.longitude));

  const promptText = message || (imageBase64 ? 'Analyze attached crop leaf image' : 'Provide status');
  const aiReply = await generateGeminiCopilotChat(
    fieldObj,
    daysSinceSowing,
    weather,
    latestAdvisory,
    promptText,
    imageBase64
  );

  try {
    const [userMsgRecord] = await db
      .insert(chat_messages)
      .values({
        field_id: fieldId,
        role: 'user',
        message: promptText,
        image_url: imageBase64 ? 'attached' : null,
      } as any)
      .returning();

    const [assistantMsgRecord] = await db
      .insert(chat_messages)
      .values({
        field_id: fieldId,
        role: 'assistant',
        message: aiReply,
      } as any)
      .returning();

    res.status(201).json({
      userMessage: userMsgRecord,
      assistantMessage: assistantMsgRecord,
    });
    return;
  } catch (error) {
    console.warn('[FieldsRoute] Postgres chat insert failed, saving in memory DB:', (error as Error).message);
  }

  const userMsgRecord = memDb.createChatMessage({
    field_id: fieldId,
    role: 'user',
    message: promptText,
    image_url: imageBase64 ? 'attached' : null,
  });

  const assistantMsgRecord = memDb.createChatMessage({
    field_id: fieldId,
    role: 'assistant',
    message: aiReply,
  });

  res.status(201).json({
    userMessage: userMsgRecord,
    assistantMessage: assistantMsgRecord,
  });
});

export default router;
