const express = require('express');
const router = express.Router();
const {
  createForm,
  getForms,
  getFormById,
  updateForm,
  deleteForm,
  publishForm,
  getFormAnalytics,
  submitForm,
  getFormSubmissions,
  getPublicForm
} = require('../controllers/formController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/public/:id', getPublicForm);
router.post('/public/:id/submit', submitForm);
// list public forms
router.get('/public', async (req, res) => {
  try {
    const { Form } = require('../models');
    const { page = 1, limit = 10, search } = req.query;
    const query = { status: 'published', visibility: 'public' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    const forms = await Form.find(query)
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select('title description styling analytics updatedAt');
    const total = await Form.countDocuments(query);
    res.json({ success: true, data: { forms, pagination: { current: Number(page), pages: Math.ceil(total / limit), total } } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error fetching public forms', error: e.message });
  }
});

// Protected routes (authentication required)
router.use(verifyToken);

// Form management routes
router.post('/', createForm);
router.get('/', getForms);
router.get('/:id', getFormById);
router.put('/:id', updateForm);
router.delete('/:id', deleteForm);
router.patch('/:id/publish', publishForm);

// Analytics routes
router.get('/:id/analytics', getFormAnalytics);
router.get('/:id/submissions', getFormSubmissions);

// Form submission routes (for authenticated users)
router.post('/:id/submit', submitForm);

module.exports = router;
