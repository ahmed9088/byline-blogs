import { SupabaseModel } from './BaseModel.js';

class SettingsModel extends SupabaseModel {
  constructor() {
    super('settings');
  }
}

const Settings = new SettingsModel();
export default Settings;
