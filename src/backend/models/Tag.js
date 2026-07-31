import { SupabaseModel } from './BaseModel.js';

class TagModel extends SupabaseModel {
  constructor() {
    super('tags');
  }
}

const Tag = new TagModel();
export default Tag;
