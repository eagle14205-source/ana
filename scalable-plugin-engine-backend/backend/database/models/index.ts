/**
 * Database Models Index
 * 
 * Central export point for all Mongoose models
 */

export { 
  EngineConfiguration, 
  IEngineConfiguration, 
  IEngineConfigurationModel,
  ISystemLog 
} from './EngineConfiguration';

export { 
  Tool, 
  ITool, 
  IToolModel 
} from './Tool';

export { 
  User, 
  IUser, 
  IUserModel 
} from './User';

/**
 * Model exports for easy importing
 * 
 * Usage:
 * import { models } from './database/models';
 * const user = await models.User.findById(id);
 */
import EngineConfiguration from './EngineConfiguration';
import Tool from './Tool';
import User from './User';

export const models = {
  EngineConfiguration,
  Tool,
  User
};

export default models;
