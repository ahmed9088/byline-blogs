import { supabase } from '../config/supabase.js';

export const camelToSnake = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  if (typeof obj === 'object') {
    const newObj = {};
    for (let [k, v] of Object.entries(obj)) {
      let key = k;
      if (k === '_id') key = 'id';
      else if (k === 'author') key = 'author_id';
      else if (k === 'category') key = 'category_id';
      else if (k === 'user') key = 'user_id';
      else if (k === 'post') key = 'post_id';
      else key = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      
      newObj[key] = (k === 'socialLinks' || k === 'seo' || k === 'social_links' || k === 'tableOfContents' || k === 'table_of_contents') ? v : camelToSnake(v);
    }
    return newObj;
  }
  return obj;
};

export const snakeToCamel = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (typeof obj === 'object') {
    const newObj = {};
    for (let [k, v] of Object.entries(obj)) {
      let key = k;
      if (k === 'id') key = '_id';
      else if (k === 'author_id') key = 'author';
      else if (k === 'category_id') key = 'category';
      else if (k === 'user_id') key = 'user';
      else if (k === 'post_id') key = 'post';
      else key = k.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      
      newObj[key] = (k === 'social_links' || k === 'seo' || k === 'table_of_contents') ? v : snakeToCamel(v);
    }
    return newObj;
  }
  return obj;
};

export const addMongooseMethods = (item, tableName) => {
  if (!item || typeof item !== 'object') return item;
  
  if (Array.isArray(item)) {
    return item.map(i => addMongooseMethods(i, tableName));
  }
  
  if (!item.toObject) {
    Object.defineProperty(item, 'toObject', {
      value: function() {
        const copy = { ...this };
        return copy;
      },
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
  
  if (!item.save) {
    Object.defineProperty(item, 'save', {
      value: async function() {
        const dbData = camelToSnake(this);
        const id = this._id || this.id;
        if (!id) return this;
        
        const cleanedData = { ...dbData };
        delete cleanedData.tags;
        delete cleanedData.postCount;
        delete cleanedData.post_count;
        
        const { data, error } = await supabase.from(tableName).update(cleanedData).eq('id', id).select().single();
        if (error) throw error;
        
        const updated = snakeToCamel(data);
        Object.assign(this, updated);
        return this;
      },
      writable: true,
      configurable: true,
      enumerable: false
    });
  }
  
  return item;
};

export class SupabaseQuery {
  constructor(tableName, queryObj = {}) {
    this.tableName = tableName;
    this.queryObj = queryObj;
    this.supabaseQuery = supabase.from(tableName);
    this.selectStr = '*';
    this.sortFields = [];
    this.offsetVal = null;
    this.limitVal = null;
    this.populates = [];
    this.isFindOne = false;
  }

  populate(field, selectFields) {
    this.populates.push({ field, selectFields });
    return this;
  }

  sort(sortObj) {
    this.sortFields.push(sortObj);
    return this;
  }

  skip(val) {
    this.offsetVal = val;
    return this;
  }

  limit(val) {
    this.limitVal = val;
    return this;
  }

  select(selectStr) {
    if (typeof selectStr === 'string') {
      const parts = selectStr.split(/\s+/);
      const includes = [];
      const excludes = [];
      let hasPlus = false;

      for (const f of parts) {
        if (f.startsWith('+')) {
          // Mongoose '+field' means: include this normally-excluded field
          hasPlus = true;
          const col = f.slice(1) === '_id' ? 'id' : f.slice(1).replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          includes.push(col);
        } else if (f.startsWith('-')) {
          // Mongoose '-field' means: exclude this field
          const col = f.slice(1) === '_id' ? 'id' : f.slice(1).replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          excludes.push(col);
        } else {
          const col = f === '_id' ? 'id' : f.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          includes.push(col);
        }
      }

      // If only excludes (e.g. '-password'), keep selectStr as '*' and store excludes for post-processing
      if (excludes.length > 0 && includes.length === 0) {
        this.selectStr = '*';
        this.excludeFields = excludes;
      } else if (hasPlus) {
        // '+password' means: use * but ensure the field is included (it already is with *)
        this.selectStr = '*';
        this.includeFields = includes;
      } else if (includes.length > 0) {
        this.selectStr = includes.join(',');
      }
    }
    return this;
  }

  async then(onFulfilled, onRejected) {
    try {
      let selectFields = this.selectStr;
      
      for (const pop of this.populates) {
        let relName = pop.field;
        if (pop.field === 'author') relName = 'author:users';
        else if (pop.field === 'category') relName = 'category:categories';
        else if (pop.field === 'user') relName = 'user:users';
        else if (pop.field === 'post') relName = 'post:posts';

        let fieldsPart = '*';
        if (pop.selectFields) {
          const mappedSelect = pop.selectFields.split(/\s+/).map(f => f === '_id' ? 'id' : f.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)).join(',');
          fieldsPart = `id,${mappedSelect}`;
        }
        
        if (pop.field === 'tags') {
          // Fetch tags through junction table
          selectFields += `,post_tags(tag:tags(${fieldsPart}))`;
        } else {
          selectFields += `,${relName}(${fieldsPart})`;
        }
      }

      let q = this.supabaseQuery.select(selectFields);
      q = this.applyFilters(q, this.queryObj);

      if (this.sortFields.length > 0) {
        for (const sortObj of this.sortFields) {
          for (let [key, val] of Object.entries(sortObj)) {
            const col = key === '_id' ? 'id' : key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            q = q.order(col, { ascending: val === 1 || val === 'asc' });
          }
        }
      }

      if (this.offsetVal !== null) {
        const limit = this.limitVal || 10;
        q = q.range(this.offsetVal, this.offsetVal + limit - 1);
      } else if (this.limitVal !== null) {
        q = q.limit(this.limitVal);
      }

      const { data, error } = await q;
      if (error) throw error;

      let result = snakeToCamel(data);
      
      // Map post_tags array to simple tags array to match Mongoose expectations
      if (Array.isArray(result)) {
        result = result.map(item => {
          if (item.postTags) {
            item.tags = item.postTags.map(pt => pt.tag).filter(Boolean);
            delete item.postTags;
          }
          return item;
        });
      } else if (result && result.postTags) {
        result.tags = result.postTags.map(pt => pt.tag).filter(Boolean);
        delete result.postTags;
      }

      // Post-process: remove excluded fields (e.g. '-password')
      if (this.excludeFields && this.excludeFields.length > 0) {
        const removeFields = (item) => {
          if (!item || typeof item !== 'object') return item;
          for (const f of this.excludeFields) {
            const camelField = f.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            delete item[camelField];
            delete item[f];
          }
          return item;
        };
        if (Array.isArray(result)) {
          result = result.map(removeFields);
        } else {
          removeFields(result);
        }
      }

      if (this.isFindOne) {
        result = result[0] || null;
      }

      result = addMongooseMethods(result, this.tableName);

      return onFulfilled ? onFulfilled(result) : result;
    } catch (err) {
      if (onRejected) return onRejected(err);
      throw err;
    }
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(onFinally) {
    return this.then(
      res => Promise.resolve(onFinally ? onFinally() : undefined).then(() => res),
      err => Promise.resolve(onFinally ? onFinally() : undefined).then(() => { throw err; })
    );
  }

  applyFilters(q, queryObj) {
    if (!queryObj) return q;

    for (let [key, val] of Object.entries(queryObj)) {
      let col = key;
      if (key === '_id' || key === 'id') col = 'id';
      else if (key === 'author') col = 'author_id';
      else if (key === 'category') col = 'category_id';
      else if (key === 'user') col = 'user_id';
      else if (key === 'post') col = 'post_id';
      else col = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      
      if (key === '$or' && Array.isArray(val)) {
        // OR search logic
        const orConditions = [];
        for (const condition of val) {
          for (const [k, v] of Object.entries(condition)) {
            let cCol = k;
            if (k === '_id' || k === 'id') cCol = 'id';
            else if (k === 'author') cCol = 'author_id';
            else if (k === 'category') cCol = 'category_id';
            else if (k === 'user') cCol = 'user_id';
            else if (k === 'post') cCol = 'post_id';
            else cCol = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            
            let cVal = v;
            if (v && typeof v === 'object' && v.$regex) cVal = v.$regex;
            else if (v instanceof RegExp) cVal = v.source;
            orConditions.push(`${cCol}.ilike.%${cVal}%`);
          }
        }
        if (orConditions.length > 0) {
          q = q.or(orConditions.join(','));
        }
      } else if (val && typeof val === 'object') {
        if (val.$ne !== undefined) {
          const neVal = val.$ne === '_id' ? 'id' : val.$ne;
          q = q.neq(col, neVal);
        } else if (val.$in) {
          q = q.in(col, val.$in);
        } else if (val.$regex) {
          q = q.ilike(col, `%${val.$regex}%`);
        }
      } else {
        q = q.eq(col, val);
      }
    }
    return q;
  }
}

export class SupabaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  find(queryObj = {}) {
    return new SupabaseQuery(this.tableName, queryObj);
  }

  findOne(queryObj = {}) {
    const q = new SupabaseQuery(this.tableName, queryObj);
    q.isFindOne = true;
    q.limit(1);
    return q;
  }

  findById(id) {
    return this.findOne({ _id: id });
  }

  async create(data) {
    if (Array.isArray(data)) {
      const results = [];
      for (const item of data) {
        const res = await this.create(item);
        results.push(res);
      }
      return results;
    }

    const dbData = camelToSnake(data);
    
    // Handle tags creation in junction table separately if it exists
    const tags = dbData.tags;
    delete dbData.tags;

    const { data: inserted, error } = await supabase.from(this.tableName).insert(dbData).select().single();
    if (error) throw error;

    let result = snakeToCamel(inserted);

    if (tags && Array.isArray(tags) && tags.length > 0) {
      const junctionData = tags.map(tagId => ({ post_id: result._id, tag_id: tagId }));
      const { error: jError } = await supabase.from('post_tags').insert(junctionData);
      if (jError) throw jError;
      result.tags = tags;
    }

    result = addMongooseMethods(result, this.tableName);
    return result;
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const dbData = camelToSnake(updateData);
    
    // Handle MongoDB array operators like $push, $pull, $addToSet
    let { data: current } = await supabase.from(this.tableName).select('*').eq('id', id).single();
    if (!current) return null;

    // Apply updates
    const finalData = { ...dbData };
    
    // Check for MongoDB update operators
    if (updateData.$push) {
      for (const [k, v] of Object.entries(updateData.$push)) {
        const col = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        const currentArr = current[col] || [];
        finalData[col] = [...currentArr, v];
      }
      delete finalData['$push'];
    }
    if (updateData.$pull) {
      for (const [k, v] of Object.entries(updateData.$pull)) {
        const col = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        const currentArr = current[col] || [];
        finalData[col] = currentArr.filter(item => item !== v);
      }
      delete finalData['$pull'];
    }
    if (updateData.$addToSet) {
      for (const [k, v] of Object.entries(updateData.$addToSet)) {
        const col = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        const currentArr = current[col] || [];
        if (!currentArr.includes(v)) {
          finalData[col] = [...currentArr, v];
        } else {
          finalData[col] = currentArr;
        }
      }
      delete finalData['$addToSet'];
    }

    // Check if tags are updated
    const tags = finalData.tags;
    delete finalData.tags;

    const { data: updated, error } = await supabase.from(this.tableName).update(finalData).eq('id', id).select().single();
    if (error) throw error;

    let result = snakeToCamel(updated);

    if (tags && Array.isArray(tags)) {
      // Sync junction table
      await supabase.from('post_tags').delete().eq('post_id', id);
      if (tags.length > 0) {
        const junctionData = tags.map(tagId => ({ post_id: id, tag_id: tagId }));
        const { error: jError } = await supabase.from('post_tags').insert(junctionData);
        if (jError) throw jError;
      }
      result.tags = tags;
    }

    result = addMongooseMethods(result, this.tableName);
    return result;
  }

  async findOneAndUpdate(queryObj, updateData, options = {}) {
    const q = new SupabaseQuery(this.tableName, queryObj);
    const results = await q.limit(1);
    if (!results || results.length === 0) return null;
    const item = Array.isArray(results) ? results[0] : results;
    return this.findByIdAndUpdate(item._id, updateData, options);
  }

  async findByIdAndDelete(id) {
    const { data, error } = await supabase.from(this.tableName).delete().eq('id', id).select().single();
    if (error) throw error;
    return snakeToCamel(data);
  }

  async findOneAndDelete(queryObj) {
    const q = new SupabaseQuery(this.tableName, queryObj);
    const results = await q.limit(1);
    if (!results || results.length === 0) return null;
    const item = Array.isArray(results) ? results[0] : results;
    return this.findByIdAndDelete(item._id);
  }

  async countDocuments(queryObj = {}) {
    let q = supabase.from(this.tableName).select('id', { count: 'exact', head: true });
    
    // Instantiate helper to apply filters
    const queryHelper = new SupabaseQuery(this.tableName);
    q = queryHelper.applyFilters(q, queryObj);
    
    const { count, error } = await q;
    if (error) throw error;
    return count || 0;
  }

  async deleteMany(queryObj = {}) {
    // If empty queryObj, delete all rows
    if (Object.keys(queryObj).length === 0) {
      const { error } = await supabase.from(this.tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      return { deletedCount: 0 };
    }

    // Handle $or operator for deleteMany (e.g. delete comment + its replies)
    if (queryObj.$or && Array.isArray(queryObj.$or)) {
      for (const condition of queryObj.$or) {
        let q = supabase.from(this.tableName).delete();
        const queryHelper = new SupabaseQuery(this.tableName);
        q = queryHelper.applyFilters(q, condition);
        const { error } = await q;
        if (error) throw error;
      }
      return { deletedCount: 0 };
    }

    let q = supabase.from(this.tableName).delete();
    const queryHelper = new SupabaseQuery(this.tableName);
    q = queryHelper.applyFilters(q, queryObj);
    const { error } = await q;
    if (error) throw error;
    return { deletedCount: 0 };
  }

  async updateMany(queryObj = {}, updateData = {}) {
    const dbData = camelToSnake(updateData);
    let q = supabase.from(this.tableName).update(dbData);
    const queryHelper = new SupabaseQuery(this.tableName);
    q = queryHelper.applyFilters(q, queryObj);
    const { error } = await q;
    if (error) throw error;
    return { modifiedCount: 0 };
  }

  async updateOne(queryObj = {}, updateData = {}) {
    // Find the first matching record and update it
    const q = new SupabaseQuery(this.tableName, queryObj);
    const results = await q.limit(1);
    if (!results || results.length === 0) return { modifiedCount: 0 };
    const item = Array.isArray(results) ? results[0] : results;
    const id = item._id || item.id;
    if (!id) return { modifiedCount: 0 };

    const dbData = camelToSnake(updateData);
    // Handle $set operator
    const finalData = dbData['$set'] ? camelToSnake(updateData['$set']) : dbData;
    delete finalData['$set'];
    
    const { error } = await supabase.from(this.tableName).update(finalData).eq('id', id);
    if (error) throw error;
    return { modifiedCount: 1 };
  }

  // Stub for aggregate — analytics controller has been rewritten to avoid this,
  // but keeping a safe fallback in case any other code calls it
  async aggregate(pipeline = []) {
    console.warn(`[SupabaseModel] aggregate() called on "${this.tableName}" — returning empty array. Use direct Supabase queries instead.`);
    return [];
  }
}

