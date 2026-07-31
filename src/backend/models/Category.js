import { SupabaseModel } from './BaseModel.js';

class CategoryModel extends SupabaseModel {
  constructor() {
    super('categories');
  }
}

const Category = new CategoryModel();
export default Category;
