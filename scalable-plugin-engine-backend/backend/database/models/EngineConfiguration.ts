import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Interface for SystemLog subdocument
 */
export interface ISystemLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source?: string;
  metadata?: Record<string, any>;
}

/**
 * Interface for EngineConfiguration Document
 */
export interface IEngineConfiguration extends Document {
  engineName: string;
  loadThreshold: number;
  isLive: boolean;
  pluginCount: number;
  systemLogs: ISystemLog[];
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  addSystemLog(level: ISystemLog['level'], message: string, source?: string, metadata?: Record<string, any>): Promise<IEngineConfiguration>;
  clearOldLogs(daysToKeep?: number): Promise<IEngineConfiguration>;
  getRecentLogs(limit?: number): ISystemLog[];
}

/**
 * Interface for EngineConfiguration Model (static methods)
 */
export interface IEngineConfigurationModel extends Model<IEngineConfiguration> {
  getActiveEngines(): Promise<IEngineConfiguration[]>;
  findByEngineName(engineName: string): Promise<IEngineConfiguration | null>;
}

/**
 * SystemLog subdocument schema
 */
const SystemLogSchema = new Schema<ISystemLog>({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  level: {
    type: String,
    enum: ['info', 'warning', 'error', 'debug'],
    required: true,
    default: 'info'
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  source: {
    type: String,
    maxlength: 100
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  _id: false // Don't create _id for subdocuments
});

/**
 * EngineConfiguration Schema
 */
const EngineConfigurationSchema = new Schema<IEngineConfiguration, IEngineConfigurationModel>({
  engineName: {
    type: String,
    required: [true, 'Engine name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Engine name must be at least 3 characters'],
    maxlength: [100, 'Engine name cannot exceed 100 characters'],
    index: true
  },
  loadThreshold: {
    type: Number,
    required: [true, 'Load threshold is required'],
    min: [0, 'Load threshold cannot be negative'],
    max: [100, 'Load threshold cannot exceed 100'],
    default: 80
  },
  isLive: {
    type: Boolean,
    required: true,
    default: false,
    index: true
  },
  pluginCount: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Plugin count cannot be negative']
  },
  systemLogs: {
    type: [SystemLogSchema],
    default: [],
    validate: {
      validator: function(logs: ISystemLog[]) {
        // Limit to 1000 logs per engine to prevent bloat
        return logs.length <= 1000;
      },
      message: 'System logs cannot exceed 1000 entries. Please archive old logs.'
    }
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'engineconfigurations'
});

// Indexes for performance
EngineConfigurationSchema.index({ engineName: 1, isLive: 1 });
EngineConfigurationSchema.index({ createdAt: -1 });
EngineConfigurationSchema.index({ 'systemLogs.timestamp': -1 });

/**
 * Instance Methods
 */

// Add a system log entry
EngineConfigurationSchema.methods.addSystemLog = async function(
  level: ISystemLog['level'],
  message: string,
  source?: string,
  metadata?: Record<string, any>
): Promise<IEngineConfiguration> {
  const log: ISystemLog = {
    timestamp: new Date(),
    level,
    message,
    source,
    metadata
  };
  
  this.systemLogs.push(log);
  
  // Keep only the last 1000 logs
  if (this.systemLogs.length > 1000) {
    this.systemLogs = this.systemLogs.slice(-1000);
  }
  
  return this.save();
};

// Clear old logs (older than specified days)
EngineConfigurationSchema.methods.clearOldLogs = async function(
  daysToKeep: number = 30
): Promise<IEngineConfiguration> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  this.systemLogs = this.systemLogs.filter((log: ISystemLog) => 
    log.timestamp > cutoffDate
  );
  
  return this.save();
};

// Get recent logs
EngineConfigurationSchema.methods.getRecentLogs = function(limit: number = 50): ISystemLog[] {
  return this.systemLogs
    .sort((a: ISystemLog, b: ISystemLog) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
};

/**
 * Static Methods
 */

// Get all active engines
EngineConfigurationSchema.statics.getActiveEngines = async function(): Promise<IEngineConfiguration[]> {
  return this.find({ isLive: true }).sort({ createdAt: -1 });
};

// Find by engine name
EngineConfigurationSchema.statics.findByEngineName = async function(
  engineName: string
): Promise<IEngineConfiguration | null> {
  return this.findOne({ engineName: engineName.trim() });
};

/**
 * Middleware Hooks
 */

// Pre-save middleware
EngineConfigurationSchema.pre('save', function(next) {
  // Ensure engineName is trimmed
  if (this.isModified('engineName')) {
    this.engineName = this.engineName.trim();
  }
  next();
});

// Post-save middleware (for logging)
EngineConfigurationSchema.post('save', function(doc) {
  console.log(`[DB] Engine configuration saved: ${doc.engineName}`);
});

/**
 * Virtual Properties
 */

// Virtual for total log count
EngineConfigurationSchema.virtual('totalLogs').get(function() {
  return this.systemLogs.length;
});

// Virtual for error log count
EngineConfigurationSchema.virtual('errorLogCount').get(function() {
  return this.systemLogs.filter((log: ISystemLog) => log.level === 'error').length;
});

// Virtual for status (derived from isLive and loadThreshold)
EngineConfigurationSchema.virtual('status').get(function() {
  if (!this.isLive) return 'offline';
  if (this.loadThreshold >= 90) return 'critical';
  if (this.loadThreshold >= 70) return 'warning';
  return 'healthy';
});

// Ensure virtuals are included in JSON output
EngineConfigurationSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

EngineConfigurationSchema.set('toObject', { virtuals: true });

/**
 * Export Model
 */
export const EngineConfiguration = mongoose.model<IEngineConfiguration, IEngineConfigurationModel>(
  'EngineConfiguration',
  EngineConfigurationSchema
);

export default EngineConfiguration;
