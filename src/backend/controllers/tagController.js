import Tag from '../models/Tag.js';
import Post from '../models/Post.js';

const makeSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export const getTags = async (req, res, next) => {
  try {
    const tags = await Tag.find({}).sort({ name: 1 });

    const tagsWithCount = await Promise.all(
      tags.map(async (tag) => {
        const postCount = await Post.countDocuments({ tags: tag._id, status: 'published' });
        return {
          ...tag.toObject(),
          postCount
        };
      })
    );

    res.json({ success: true, tags: tagsWithCount });
  } catch (error) {
    next(error);
  }
};

export const createTag = async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = makeSlug(name);

    const exists = await Tag.findOne({ slug });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Tag already exists' });
    }

    const tag = await Tag.create({ name, slug });
    res.status(201).json({ success: true, tag });
  } catch (error) {
    next(error);
  }
};

export const updateTag = async (req, res, next) => {
  try {
    const { name } = req.body;
    let tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }

    if (name && name !== tag.name) {
      tag.name = name;
      tag.slug = makeSlug(name);
    }

    await tag.save();
    res.json({ success: true, tag });
  } catch (error) {
    next(error);
  }
};

export const deleteTag = async (req, res, next) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }

    // Pull this tag out of all posts containing it
    await Post.updateMany({ tags: tag._id }, { $pull: { tags: tag._id } });

    await Tag.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Tag deleted successfully and unlinked from posts.' });
  } catch (error) {
    next(error);
  }
};
