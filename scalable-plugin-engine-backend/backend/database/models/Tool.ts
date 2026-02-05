import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Interface for Tool Document
 */
export interface ITool extends Document {
  toolName: string;
  toolSlug: string;
  isActive: boolean;
  description?: string;
  version?: string;
  category?: string;
  configSchema?: Record<string, any>;
  executionCount?: number;
  lastExecutedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  activate(): Promise<ITool>;
  deactivate(): Promise<ITool>;
  toggleStatus(): Promise<ITool>;
  incrementExecutionCount(): Promise<ITool>;
  updateLastExecuted(): Promise<ITool>;
}

/**
 * Interface for Tool Model (static methods)
 */
export interface IToolModel extends Model<ITool> {
  findActiveTools(): Promise<ITool[]>;
  findInactiveTools(): Promise<ITool[]>;
  findBySlug(slug: string): Promise<ITool | null>;
  findByCategory(category: string): Promise<ITool[]>;
  getToolStats(): Promise<any>;
  createToolFromPlugin(pluginData: Partial<ITool>): Promise<ITool>;
}

/**
 * Tool Schema
 */
const ToolSchema = new Schema<ITool, IToolModel>({
  toolName: {
    type: String,
    required: [true, 'Tool name is required'],
    trim: true,
    minlength: [2, 'Tool name must be at least 2 characters'],
    maxlength: [100, 'Tool name cannot exceed 100 characters'],
    index: true
  },
  toolSlug: {
    type: String,
    required: [true, 'Tool slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Tool slug can only contain lowercase letters, numbers, and hyphens'],
    index: true
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  version: {
    type: String,
    trim: true,
    match: [/^\d+\.\d+\.\d+$/, 'Version must follow semantic versioning (e.g., 1.0.0)'],
    default: '1.0.0'
  },
  category: {
    type: String,
    trim: true,
    lowercase: true,
    enum: {
      values: ['analytics', 'communication', 'data-processing', 'ai-ml', 'utility', 'integration', 'security', 'monitoring', 'other'],
      message: '{VALUE} is not a valid category'
    },
    default: 'other',
    index: true
  },
  configSchema: {
    type: Schema.Types.Mixed,
    default: {}
  },
  executionCount: {
    type: Number,
    default: 0,
    min: [0, 'Execution count cannot be negative']
  },
  lastExecutedAt: {
    type: Date,
    index: true
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'tools'
});

/**
 * Indexes for performance
 */
ToolSchema.index({ toolSlug: 1, isActive: 1 });
ToolSchema.index({ category: 1, isActive: 1 });
ToolSchema.index({ createdAt: -1 });
ToolSchema.index({ executionCount: -1 });
ToolSchema.index({ lastExecutedAt: -1 });

// Text index for search functionality
ToolSchema.index({ toolName: 'text', description: 'text' });

/**
 * Instance Methods
 */

// Activate the tool
ToolSchema.methods.activate = async function(): Promise<ITool> {
  this.isActive = true;
  return this.save();
};

// Deactivate the tool
ToolSchema.methods.deactivate = async function(): Promise<ITool> {
  this.isActive = false;
  return this.save();
};

// Toggle tool status
ToolSchema.methods.toggleStatus = async function(): Promise<ITool> {
  this.isActive = !this.isActive;
  return this.save();
};

// Increment execution count
ToolSchema.methods.incrementExecutionCount = async function(): Promise<ITool> {
  this.executionCount = (this.executionCount || 0) + 1;
  this.lastExecutedAt = new Date();
  return this.save();
};

// Update last executed timestamp
ToolSchema.methods.updateLastExecuted = async function(): Promise<ITool> {
  this.lastExecutedAt = new Date();
  return this.save();
};

/**
 * Static Methods
 */

// Find all active tools
ToolSchema.statics.findActiveTools = async function(): Promise<ITool[]> {
  return this.find({ isActive: true }).sort({ toolName: 1 });
};

// Find all inactive tools
ToolSchema.statics.findInactiveTools = async function(): Promise<ITool[]> {
  return this.find({ isActive: false }).sort({ toolName: 1 });
};

// Find tool by slug
ToolSchema.statics.findBySlug = async function(slug: string): Promise<ITool | null> {
  return this.findOne({ toolSlug: slug.toLowerCase().trim() });
};

// Find tools by category
ToolSchema.statics.findByCategory = async function(category: string): Promise<ITool[]> {
  return this.find({ category: category.toLowerCase().trim() }).sort({ toolName: 1 });
};

// Get tool statistics
ToolSchema.statics.getToolStats = async function(): Promise<any> {
  const totalTools = await this.countDocuments();
  const activeTools = await this.countDocuments({ isActive: true });
  const inactiveTools = await this.countDocuments({ isActive: false });
  
  const categoryStats = await this.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: ['$isActive', 1, 0] }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  const totalExecutions = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: '$executionCount' }
      }
    }
  ]);
  
  const mostUsedTools = await this.find()
    .sort({ executionCount: -1 })
    .limit(10)
    .select('toolName toolSlug executionCount lastExecutedAt');
  
  return {
    totalTools,
    activeTools,
    inactiveTools,
    categoryStats,
    totalExecutions: totalExecutions[0]?.total || 0,
    mostUsedTools
  };
};

// Create tool from plugin data
ToolSchema.statics.createToolFromPlugin = async function(
  pluginData: Partial<ITool>
): Promise<ITool> {
  // Generate slug from tool name if not provided
  if (!pluginData.toolSlug && pluginData.toolName) {
    pluginData.toolSlug = pluginData.toolName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  return this.create(pluginData);
};

/**
 * Middleware Hooks
 */

// Pre-save middleware
ToolSchema.pre('save', function(next) {
  // Ensure toolSlug is lowercase and trimmed
  if (this.isModified('toolSlug')) {
    this.toolSlug = this.toolSlug.toLowerCase().trim();
  }
  
  // Ensure toolName is trimmed
  if (this.isModified('toolName')) {
    this.toolName = this.toolName.trim();
  }
  
  next();
});

// Pre-validate middleware
ToolSchema.pre('validate', function(next) {
  // Auto-generate slug from name if slug is empty
  if (!this.toolSlug && this.toolName) {
    this.toolSlug = this.toolName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Post-save middleware (for logging)
ToolSchema.post('save', function(doc) {
  console.log(`[DB] Tool saved: ${doc.toolName} (${doc.toolSlug}) - Active: ${doc.isActive}`);
});

// Post-remove middleware
ToolSchema.post('remove', function(doc) {
  console.log(`[DB] Tool removed: ${doc.toolName} (${doc.toolSlug})`);
});

/**
 * Virtual Properties
 */

// Virtual for age in days
ToolSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for status text
ToolSchema.virtual('statusText').get(function() {
  return this.isActive ? 'Active' : 'Inactive';
});

// Virtual for days since last execution
ToolSchema.virtual('daysSinceLastExecution').get(function() {
  if (!this.lastExecutedAt) return null;
  const now = new Date();
  const lastExec = new Date(this.lastExecutedAt);
  const diffTime = Math.abs(now.getTime() - lastExec.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included in JSON output
ToolSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

ToolSchema.set('toObject', { virtuals: true });

/**
 * Export Model
 */
export const Tool = mongoose.model<ITool, IToolModel>('Tool', ToolSchema);

export default Tool;
