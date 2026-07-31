import Category from '../models/Category.js';
import Post from '../models/Post.js';

// Helper to generate slug
const makeSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    
    // Dynamically calculate post count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const postCount = await Post.countDocuments({ category: cat._id, status: 'published' });
        return {
          ...cat.toObject(),
          postCount
        };
      })
    );

    res.json({ success: true, categories: categoriesWithCount });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = makeSlug(name);

    const exists = await Category.findOne({ slug });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({ name, slug, description });
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name && name !== category.name) {
      category.name = name;
      category.slug = makeSlug(name);
    }
    if (description !== undefined) {
      category.description = description;
    }

    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Verify if any posts are linked to this category
    const linkedPosts = await Post.countDocuments({ category: category._id });
    if (linkedPosts > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category: it is assigned to one or more blog posts.'
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
