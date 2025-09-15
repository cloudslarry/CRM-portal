const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    subtitle: { type: String, trim: true },
    authors: { type: [String], required: true },
    isbn10: { type: String, trim: true, unique: true, sparse: true },
    isbn13: { type: String, trim: true, unique: true, sparse: true },
    categories: { type: [String], index: true },
    publisher: { type: String, trim: true },
    publishedYear: { type: Number },
    edition: { type: String, trim: true },
    language: { type: String, default: 'en' },
    pages: { type: Number },
    description: { type: String },
    tags: { type: [String], index: true },

    // Physical library location
    location: {
      rack: { type: String, trim: true },
      shelf: { type: String, trim: true },
      room: { type: String, trim: true }
    },

    // Inventory counts
    copiesTotal: { type: Number, required: true, min: 0 },
    copiesAvailable: { type: Number, required: true, min: 0 },

    // File storage for digital copy (optional)
    file: {
      originalName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      path: { type: String }, // relative path under /uploads/books
      url: { type: String }   // served path e.g. /uploads/books/...
    },
    // Physical copy indicator (no file attached)
    isPhysical: { type: Boolean, default: false },

    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'createdByModel' },
    createdByModel: { type: String, enum: ['Faculty', 'Admin'] },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'updatedByModel' },
    updatedByModel: { type: String, enum: ['Faculty', 'Admin'] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', BookSchema);


