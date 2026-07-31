import { SupabaseModel } from './BaseModel.js';

class AuditLogModel extends SupabaseModel {
  constructor() {
    super('audit_logs');
  }
}

const AuditLog = new AuditLogModel();
export default AuditLog;
