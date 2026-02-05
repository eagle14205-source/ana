import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Interface for User Document
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  activeToolList: string[]; // Array of toolSlugs
  isActive: boolean;
  lastLogin?: Date;
  loginCount?: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  addTool(toolSlug: string): Promise<IUser>;
  removeTool(toolSlug: string): Promise<IUser>;
  hasToolAccess(toolSlug: string): boolean;
  updateLastLogin(): Promise<IUser>;
  isAdmin(): boolean;
  toSafeObject(): Partial<IUser>;
}

/**
 * Interface for User Model (static methods)
 */
export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findAdmins(): Promise<IUser[]>;
  findRegularUsers(): Promise<IUser[]>;
  getUserStats(): Promise<any>;
  createUser(userData: Partial<IUser>): Promise<IUser>;
  authenticate(email: string, password: string): Promise<IUser | null>;
}

/**
 * User Schema
 */
const UserSchema = new Schema<IUser, IUserModel>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'user'],
      message: '{VALUE} is not a valid role'
    },
    required: true,
    default: 'user',
    index: true
  },
  activeToolList: {
    type: [String],
    default: [],
    validate: {
      validator: function(tools: string[]) {
        // Ensure all tool slugs are valid format
        return tools.every(slug => /^[a-z0-9-]+$/.test(slug));
      },
      message: 'Tool slugs must contain only lowercase letters, numbers, and hyphens'
    }
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
    index: true
  },
  lastLogin: {
    type: Date,
    index: true
  },
  loginCount: {
    type: Number,
    default: 0,
    min: [0, 'Login count cannot be negative']
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'users'
});

/**
 * Indexes for performance
 */
UserSchema.index({ email: 1, role: 1 });
UserSchema.index({ isActive: 1, role: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLogin: -1 });

// Text index for search functionality
UserSchema.index({ name: 'text', email: 'text' });

/**
 * Middleware Hooks
 */

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Ensure email is lowercase and trimmed
UserSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }
  
  next();
});

// Remove duplicate tool slugs from activeToolList
UserSchema.pre('save', function(next) {
  if (this.isModified('activeToolList')) {
    this.activeToolList = [...new Set(this.activeToolList)];
  }
  next();
});

// Post-save middleware (for logging)
UserSchema.post('save', function(doc) {
  console.log(`[DB] User saved: ${doc.name} (${doc.email}) - Role: ${doc.role}`);
});

/**
 * Instance Methods
 */

// Compare password for authentication
UserSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Add a tool to user's active tool list
UserSchema.methods.addTool = async function(toolSlug: string): Promise<IUser> {
  const slug = toolSlug.toLowerCase().trim();
  
  if (!this.activeToolList.includes(slug)) {
    this.activeToolList.push(slug);
    await this.save();
  }
  
  return this;
};

// Remove a tool from user's active tool list
UserSchema.methods.removeTool = async function(toolSlug: string): Promise<IUser> {
  const slug = toolSlug.toLowerCase().trim();
  this.activeToolList = this.activeToolList.filter(t => t !== slug);
  await this.save();
  return this;
};

// Check if user has access to a specific tool
UserSchema.methods.hasToolAccess = function(toolSlug: string): boolean {
  // Admins have access to all tools
  if (this.role === 'admin') {
    return true;
  }
  
  return this.activeToolList.includes(toolSlug.toLowerCase().trim());
};

// Update last login timestamp and increment login count
UserSchema.methods.updateLastLogin = async function(): Promise<IUser> {
  this.lastLogin = new Date();
  this.loginCount = (this.loginCount || 0) + 1;
  return this.save();
};

// Check if user is admin
UserSchema.methods.isAdmin = function(): boolean {
  return this.role === 'admin';
};

// Return safe user object (without sensitive data)
UserSchema.methods.toSafeObject = function(): Partial<IUser> {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    activeToolList: this.activeToolList,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    loginCount: this.loginCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

/**
 * Static Methods
 */

// Find user by email
UserSchema.statics.findByEmail = async function(email: string): Promise<IUser | null> {
  return this.findOne({ email: email.toLowerCase().trim() }).select('+password');
};

// Find all admin users
UserSchema.statics.findAdmins = async function(): Promise<IUser[]> {
  return this.find({ role: 'admin', isActive: true }).sort({ name: 1 });
};

// Find all regular users
UserSchema.statics.findRegularUsers = async function(): Promise<IUser[]> {
  return this.find({ role: 'user', isActive: true }).sort({ name: 1 });
};

// Get user statistics
UserSchema.statics.getUserStats = async function(): Promise<any> {
  const totalUsers = await this.countDocuments();
  const activeUsers = await this.countDocuments({ isActive: true });
  const adminUsers = await this.countDocuments({ role: 'admin' });
  const regularUsers = await this.countDocuments({ role: 'user' });
  
  const recentLogins = await this.find({ lastLogin: { $exists: true } })
    .sort({ lastLogin: -1 })
    .limit(10)
    .select('name email lastLogin loginCount');
  
  const mostActiveUsers = await this.find()
    .sort({ loginCount: -1 })
    .limit(10)
    .select('name email loginCount lastLogin');
  
  const toolUsageStats = await this.aggregate([
    { $unwind: '$activeToolList' },
    {
      $group: {
        _id: '$activeToolList',
        userCount: { $sum: 1 }
      }
    },
    { $sort: { userCount: -1 } },
    { $limit: 10 }
  ]);
  
  return {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    adminUsers,
    regularUsers,
    recentLogins,
    mostActiveUsers,
    toolUsageStats
  };
};

// Create a new user with hashed password
UserSchema.statics.createUser = async function(
  userData: Partial<IUser>
): Promise<IUser> {
  return this.create(userData);
};

// Authenticate user (find by email and compare password)
UserSchema.statics.authenticate = async function(
  email: string,
  password: string
): Promise<IUser | null> {
  const user = await this.findByEmail(email);
  
  if (!user || !user.isActive) {
    return null;
  }
  
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    return null;
  }
  
  // Update last login
  await user.updateLastLogin();
  
  return user;
};

/**
 * Virtual Properties
 */

// Virtual for full user info
UserSchema.virtual('toolCount').get(function() {
  return this.activeToolList.length;
});

// Virtual for account age in days
UserSchema.virtual('accountAgeInDays').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days since last login
UserSchema.virtual('daysSinceLastLogin').get(function() {
  if (!this.lastLogin) return null;
  const now = new Date();
  const lastLogin = new Date(this.lastLogin);
  const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included in JSON output
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    delete ret.password; // Never include password in JSON
    return ret;
  }
});

UserSchema.set('toObject', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password; // Never include password in object
    return ret;
  }
});

/**
 * Export Model
 */
export const User = mongoose.model<IUser, IUserModel>('User', UserSchema);

export default User;
