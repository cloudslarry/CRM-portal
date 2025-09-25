const mongoose = require('mongoose');

const formSubmissionSchema = new mongoose.Schema({
  form: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'submittedByModel',
    required: false
  },
  submittedByModel: {
    type: String,
    required: false,
    enum: ['Admin', 'Faculty', 'Student', 'Applicant']
  },
  responses: [{
    fieldId: {
      type: String,
      required: true
    },
    fieldType: {
      type: String,
      required: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'tablet', 'mobile'],
      default: 'desktop'
    },
    browser: String,
    os: String,
    screenResolution: String,
    timezone: String,
    language: String
  },
  status: {
    type: String,
    enum: ['submitted', 'draft', 'reviewed', 'approved', 'rejected'],
    default: 'submitted'
  },
  reviewNotes: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'reviewedByModel'
  },
  reviewedByModel: {
    type: String,
    enum: ['Admin', 'Faculty']
  },
  reviewedAt: Date,
  completionTime: {
    type: Number, // in seconds
    default: 0
  },
  isSpam: {
    type: Boolean,
    default: false
  },
  spamScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  email: String, // if form collects email
  phone: String, // if form collects phone
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better performance
formSubmissionSchema.index({ form: 1, submittedAt: -1 });
formSubmissionSchema.index({ submittedBy: 1, submittedByModel: 1 });
formSubmissionSchema.index({ status: 1 });
formSubmissionSchema.index({ 'metadata.ipAddress': 1 });
formSubmissionSchema.index({ createdAt: -1 });

// Virtual for submission duration
formSubmissionSchema.virtual('submissionDuration').get(function() {
  if (this.completionTime) {
    const minutes = Math.floor(this.completionTime / 60);
    const seconds = this.completionTime % 60;
    return `${minutes}m ${seconds}s`;
  }
  return 'N/A';
});

// Method to get response by field ID
formSubmissionSchema.methods.getResponse = function(fieldId) {
  const response = this.responses.find(r => r.fieldId === fieldId);
  return response ? response.value : null;
};

// Method to set response for a field
formSubmissionSchema.methods.setResponse = function(fieldId, fieldType, value) {
  const existingResponseIndex = this.responses.findIndex(r => r.fieldId === fieldId);
  const responseData = {
    fieldId,
    fieldType,
    value,
    timestamp: new Date()
  };

  if (existingResponseIndex >= 0) {
    this.responses[existingResponseIndex] = responseData;
  } else {
    this.responses.push(responseData);
  }
};

// Method to calculate spam score
formSubmissionSchema.methods.calculateSpamScore = function() {
  let score = 0;
  
  // Check for common spam patterns
  const textContent = this.responses.map(r => String(r.value)).join(' ').toLowerCase();
  
  // Check for excessive links
  const linkCount = (textContent.match(/https?:\/\/[^\s]+/g) || []).length;
  if (linkCount > 3) score += 20;
  
  // Check for excessive caps
  const capsRatio = (textContent.match(/[A-Z]/g) || []).length / textContent.length;
  if (capsRatio > 0.5) score += 15;
  
  // Check for repeated characters
  const repeatedChars = textContent.match(/(.)\1{4,}/g);
  if (repeatedChars) score += 10;
  
  // Check for common spam words
  const spamWords = ['viagra', 'casino', 'loan', 'free money', 'click here', 'buy now'];
  const spamWordCount = spamWords.filter(word => textContent.includes(word)).length;
  score += spamWordCount * 5;
  
  // Check submission time (very fast submissions might be spam)
  if (this.completionTime < 10) score += 15;
  
  this.spamScore = Math.min(score, 100);
  this.isSpam = this.spamScore > 50;
  
  return this.spamScore;
};

// Static method to get form analytics
formSubmissionSchema.statics.getFormAnalytics = async function(formId, startDate, endDate) {
  const matchStage = { form: mongoose.Types.ObjectId(formId) };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const analytics = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        averageCompletionTime: { $avg: '$completionTime' },
        spamSubmissions: {
          $sum: { $cond: ['$isSpam', 1, 0] }
        },
        statusBreakdown: {
          $push: '$status'
        },
        deviceBreakdown: {
          $push: '$metadata.deviceType'
        }
      }
    },
    {
      $project: {
        totalSubmissions: 1,
        averageCompletionTime: { $round: ['$averageCompletionTime', 2] },
        spamSubmissions: 1,
        spamRate: {
          $round: [
            { $multiply: [{ $divide: ['$spamSubmissions', '$totalSubmissions'] }, 100] },
            2
          ]
        },
        statusBreakdown: 1,
        deviceBreakdown: 1
      }
    }
  ]);

  return analytics[0] || {
    totalSubmissions: 0,
    averageCompletionTime: 0,
    spamSubmissions: 0,
    spamRate: 0,
    statusBreakdown: [],
    deviceBreakdown: []
  };
};

module.exports = mongoose.model('FormSubmission', formSubmissionSchema);


