const express = require('express');
const router = express.Router();

const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { upload } = require('../utils/bookMulter');
const {
  listBooks,
  getBookById,
  downloadBook,
  uploadBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');

// Publicly accessible list could be restricted; here require auth for all
router.get('/', verifyToken, requireRole(['student', 'faculty', 'admin']), listBooks);
router.get('/:id', verifyToken, requireRole(['student', 'faculty', 'admin']), getBookById);
router.get('/:id/download', verifyToken, requireRole(['student', 'faculty', 'admin']), downloadBook);

// Faculty/Admin only for create/update/delete
router.post('/', verifyToken, requireRole(['faculty', 'admin']), upload.single('file'), uploadBook);
router.put('/:id', verifyToken, requireRole(['faculty', 'admin']), upload.single('file'), updateBook);
router.delete('/:id', verifyToken, requireRole(['faculty', 'admin']), deleteBook);

module.exports = router;


