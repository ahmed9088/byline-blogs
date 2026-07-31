import { SupabaseModel } from './BaseModel.js';

class AnalyticsModel extends SupabaseModel {
  constructor() {
    super('analytics');
  }
}

const Analytics = new AnalyticsModel();
export default Analytics;
