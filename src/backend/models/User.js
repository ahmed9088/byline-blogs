import bcrypt from 'bcryptjs';
import { SupabaseModel, SupabaseQuery } from './BaseModel.js';

const attachUserMethods = (userObj) => {
  if (!userObj) return null;
  if (Array.isArray(userObj)) {
    return userObj.map(attachUserMethods);
  }
  userObj.matchPassword = async function(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  };
  return userObj;
};

class UserQuery extends SupabaseQuery {
  async then(onFulfilled, onRejected) {
    return super.then(
      (data) => onFulfilled(attachUserMethods(data)),
      onRejected
    );
  }
}

class UserModel extends SupabaseModel {
  constructor() {
    super('users');
  }

  find(queryObj = {}) {
    return new UserQuery(this.tableName, queryObj);
  }

  findOne(queryObj = {}) {
    const q = new UserQuery(this.tableName, queryObj);
    q.isFindOne = true;
    q.limit(1);
    return q;
  }

  async create(data) {
    const dataCopy = { ...data };
    if (dataCopy.password) {
      const salt = await bcrypt.genSalt(10);
      dataCopy.password = await bcrypt.hash(dataCopy.password, salt);
    }
    const user = await super.create(dataCopy);
    return attachUserMethods(user);
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const updateCopy = { ...updateData };
    if (updateCopy.password) {
      const salt = await bcrypt.genSalt(10);
      updateCopy.password = await bcrypt.hash(updateCopy.password, salt);
    }
    const user = await super.findByIdAndUpdate(id, updateCopy, options);
    return attachUserMethods(user);
  }
}

const User = new UserModel();
export default User;
