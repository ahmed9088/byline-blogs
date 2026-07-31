import { SupabaseModel } from './BaseModel.js';

class SubscriberModel extends SupabaseModel {
  constructor() {
    super('subscribers');
  }
}

const Subscriber = new SubscriberModel();
export default Subscriber;
