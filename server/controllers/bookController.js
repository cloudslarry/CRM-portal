const fs = require('fs');
const path = require('path');
const { saveFile, deleteFile } = require('../utils/fileStorage');
const Book = require('../models/Book');

// Build filters from query
const buildBookFilters = (query) => {
  const filters = {};
  if (query.q) {
    const regex = new RegExp(query.q.trim(), 'i');
    filters.$or = [
      { title: regex },
      { subtitle: regex },
      { authors: regex },
      { categories: regex },
      { tags: regex },
      { publisher: regex }
    ];
  }
  if (query.author) filters.authors = new RegExp(query.author.trim(), 'i');
  if (query.category) filters.categories = new RegExp(query.category.trim(), 'i');
  if (query.isbn) filters.$or = [ { isbn10: query.isbn }, { isbn13: query.isbn } ];
  if (query.publishedYear) filters.publishedYear = Number(query.publishedYear);
  if (query.availableOnly === 'true') filters.copiesAvailable = { $gt: 0 };
  return filters;
};

exports.listBooks = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';
    const filters = buildBookFilters(req.query);

    const [items, total] = await Promise.all([
      Book.find(filters)
        .select('title authors isbn13 categories copiesTotal copiesAvailable file.url createdAt')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Book.countDocuments(filters)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        items,
        pagination: { page, limit, total }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    return res.status(200).json({ success: true, data: book });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).select('title file');
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.isPhysical) return res.status(400).json({ success: false, message: 'This is a physical copy. No file available.' });
    if (!book.file || !book.file.path) return res.status(404).json({ success: false, message: 'No file available for this book' });

    const absolutePath = path.isAbsolute(book.file.path)
      ? book.file.path
      : path.join(process.cwd(), book.file.path);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }
    return res.download(absolutePath, book.file.originalName || `${book.title}.pdf`);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadBook = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      authors,
      isbn10,
      isbn13,
      categories,
      publisher,
      publishedYear,
      edition,
      language,
      pages,
      description,
      tags,
      copiesTotal,
      copiesAvailable,
      location,
      isPhysical
    } = req.body;

    if (!title) return res.status(400).json({ success: false, message: 'title is required' });
    const authorsArray = Array.isArray(authors) ? authors : (authors ? String(authors).split(',').map(s => s.trim()).filter(Boolean) : []);
    if (authorsArray.length === 0) return res.status(400).json({ success: false, message: 'authors is required' });

    const payload = {
      title,
      subtitle,
      authors: authorsArray,
      isbn10,
      isbn13,
      categories: categories ? String(categories).split(',').map(s => s.trim()).filter(Boolean) : [],
      publisher,
      publishedYear: publishedYear ? Number(publishedYear) : undefined,
      edition,
      language,
      pages: pages ? Number(pages) : undefined,
      description,
      tags: tags ? String(tags).split(',').map(s => s.trim()).filter(Boolean) : [],
      copiesTotal: copiesTotal ? Number(copiesTotal) : 0,
      copiesAvailable: copiesAvailable ? Number(copiesAvailable) : (copiesTotal ? Number(copiesTotal) : 0),
      location: location ? (typeof location === 'string' ? JSON.parse(location) : location) : undefined,
      createdBy: req.user?._id,
      createdByModel: req.user?.constructor?.modelName,
      isPhysical: String(isPhysical) === 'true'
    };

    if (payload.copiesAvailable > payload.copiesTotal) {
      return res.status(400).json({ success: false, message: 'copiesAvailable cannot exceed copiesTotal' });
    }

    if (!payload.isPhysical && !req.file) {
      return res.status(400).json({ success: false, message: 'File is required for digital books' });
    }

    if (req.file) {
      const meta = await saveFile('books', req.file)
      payload.file = meta
    }

    const created = await Book.create(payload);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.authors && !Array.isArray(updates.authors)) {
      updates.authors = String(updates.authors).split(',').map(s => s.trim()).filter(Boolean);
    }
    if (updates.categories && !Array.isArray(updates.categories)) {
      updates.categories = String(updates.categories).split(',').map(s => s.trim()).filter(Boolean);
    }
    if (updates.tags && !Array.isArray(updates.tags)) {
      updates.tags = String(updates.tags).split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof updates.publishedYear !== 'undefined') updates.publishedYear = Number(updates.publishedYear);
    if (typeof updates.pages !== 'undefined') updates.pages = Number(updates.pages);
    if (typeof updates.copiesTotal !== 'undefined') updates.copiesTotal = Number(updates.copiesTotal);
    if (typeof updates.copiesAvailable !== 'undefined') updates.copiesAvailable = Number(updates.copiesAvailable);
    if (updates.location && typeof updates.location === 'string') {
      try { updates.location = JSON.parse(updates.location); } catch (_) {}
    }

    if (typeof updates.isPhysical !== 'undefined') {
      updates.isPhysical = String(updates.isPhysical) === 'true'
    }

    if (updates.isPhysical && req.file) {
      return res.status(400).json({ success: false, message: 'Physical books cannot include a file' });
    }

    if (!updates.isPhysical && !req.file && updates.file === undefined) {
      // If toggling from physical->digital without providing a file
      // we keep existing file if any, else error later
    }

    if (req.file) {
      const meta = await saveFile('books', req.file)
      updates.file = meta
    }

    updates.updatedBy = req.user?._id;
    updates.updatedByModel = req.user?.constructor?.modelName;

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    // Prevent invalid availability
    const newCopiesTotal = typeof updates.copiesTotal === 'number' ? updates.copiesTotal : book.copiesTotal;
    const newCopiesAvailable = typeof updates.copiesAvailable === 'number' ? updates.copiesAvailable : book.copiesAvailable;
    if (newCopiesAvailable > newCopiesTotal) {
      return res.status(400).json({ success: false, message: 'copiesAvailable cannot exceed copiesTotal' });
    }

    // If changing from digital to physical, remove file metadata
    if (updates.isPhysical === true) {
      updates.file = undefined
    }

    const updated = await Book.findByIdAndUpdate(req.params.id, updates, { new: true });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    // Business rule: could block if active loans exist (not implemented here)

    // Remove stored file if exists
    if (book.file) {
      await deleteFile(book.file)
    }

    await Book.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


