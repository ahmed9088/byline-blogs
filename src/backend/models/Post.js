import { SupabaseModel } from './BaseModel.js';

class PostModel extends SupabaseModel {
  constructor() {
    super('posts');
  }
}

const Post = new PostModel();
export default Post;
