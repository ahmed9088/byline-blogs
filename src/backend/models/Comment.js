import { SupabaseModel } from './BaseModel.js';

class CommentModel extends SupabaseModel {
  constructor() {
    super('comments');
  }
}

const Comment = new CommentModel();
export default Comment;
