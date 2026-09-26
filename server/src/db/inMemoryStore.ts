import { randomUUID } from 'crypto';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
}

export interface FieldRecord {
  id: string;
  user_id: string;
  crop_type: string;
  sowing_date: string;
  soil_type: string;
  location: string;
  latitude: string;
  longitude: string;
  acreage: string;
  created_at: Date;
  updated_at: Date;
}

export interface AdvisoryRecord {
  id: string;
  field_id: string;
  irrigation_plan: string;
  fertilizer_plan: any;
  risk_level: 'low' | 'medium' | 'high';
  risk_notes: string;
  cost_of_inaction: string;
  plan_drift_detected: boolean;
  drift_explanation?: string | null;
  next_check_in: string;
  created_at: Date;
}

export interface TreatmentLogRecord {
  id: string;
  advisory_id: string;
  action_taken: string;
  status: 'done' | 'skipped';
  farmer_note?: string | null;
  done_at: Date;
}

export interface ChatMessageRecord {
  id: string;
  field_id: string;
  role: 'user' | 'assistant';
  message: string;
  image_url?: string | null;
  created_at: Date;
}

class InMemoryStore {
  users: UserRecord[] = [];
  fields: FieldRecord[] = [];
  advisories: AdvisoryRecord[] = [];
  treatmentLogs: TreatmentLogRecord[] = [];
  chatMessages: ChatMessageRecord[] = [];

  constructor() {
    console.log('[InMemoryStore] Initialized resilient fallback data layer.');
  }

  // User methods
  findUserByEmail(email: string): UserRecord | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): UserRecord | undefined {
    return this.users.find((u) => u.id === id);
  }

  createUser(email: string, password_hash: string, name: string): UserRecord {
    const user: UserRecord = {
      id: randomUUID(),
      email: email.toLowerCase().trim(),
      password_hash,
      name,
      created_at: new Date(),
    };
    this.users.push(user);
    return user;
  }

  // Field methods
  getFieldsByUserId(userId: string): FieldRecord[] {
    return this.fields.filter((f) => f.user_id === userId);
  }

  getFieldById(id: string, userId: string): FieldRecord | undefined {
    return this.fields.find((f) => f.id === id && f.user_id === userId);
  }

  createField(data: Omit<FieldRecord, 'id' | 'created_at' | 'updated_at'>): FieldRecord {
    const field: FieldRecord = {
      ...data,
      id: randomUUID(),
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.fields.push(field);
    return field;
  }

  deleteField(id: string, userId: string): boolean {
    const idx = this.fields.findIndex((f) => f.id === id && f.user_id === userId);
    if (idx !== -1) {
      this.fields.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Advisory methods
  getAdvisoriesByFieldId(fieldId: string): AdvisoryRecord[] {
    return this.advisories
      .filter((a) => a.field_id === fieldId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  createAdvisory(data: Omit<AdvisoryRecord, 'id' | 'created_at'>): AdvisoryRecord {
    const advisory: AdvisoryRecord = {
      ...data,
      id: randomUUID(),
      created_at: new Date(),
    };
    this.advisories.push(advisory);
    return advisory;
  }

  // Treatment log methods
  getTreatmentLogsByAdvisoryId(advisoryId: string): TreatmentLogRecord[] {
    return this.treatmentLogs
      .filter((t) => t.advisory_id === advisoryId)
      .sort((a, b) => b.done_at.getTime() - a.done_at.getTime());
  }

  getTreatmentLogsForField(fieldId: string): TreatmentLogRecord[] {
    const advisoryIds = new Set(this.getAdvisoriesByFieldId(fieldId).map((a) => a.id));
    return this.treatmentLogs
      .filter((t) => advisoryIds.has(t.advisory_id))
      .sort((a, b) => b.done_at.getTime() - a.done_at.getTime());
  }

  createTreatmentLog(data: Omit<TreatmentLogRecord, 'id' | 'done_at'>): TreatmentLogRecord {
    const log: TreatmentLogRecord = {
      ...data,
      id: randomUUID(),
      done_at: new Date(),
    };
    this.treatmentLogs.push(log);
    return log;
  }

  // Chat message methods
  getChatMessagesByFieldId(fieldId: string): ChatMessageRecord[] {
    return this.chatMessages
      .filter((c) => c.field_id === fieldId)
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
  }

  createChatMessage(data: Omit<ChatMessageRecord, 'id' | 'created_at'>): ChatMessageRecord {
    const msg: ChatMessageRecord = {
      ...data,
      id: randomUUID(),
      created_at: new Date(),
    };
    this.chatMessages.push(msg);
    return msg;
  }
}

export const memDb = new InMemoryStore();
