// routes/templates.js
const express = require('express');
const router = express.Router();
const ResponseTemplate = require('../models/responseTemplate');
const { v4: uuidv4 } = require('uuid');
const { simulateDelay } = require('../utils/helpers');

// GET /api/templates - Get all templates
router.get('/', async (req, res, next) => {
  try {
    const { category, search, channel } = req.query;
    const filter = {};
    if (category && category !== 'All templates') {
      filter.category = new RegExp(category, 'i');
    }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
      ];
    }
    const templates = await ResponseTemplate.find(filter).sort({ createdAt: -1 });
    await simulateDelay(150);
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

// GET /api/templates/:id - Get single template
router.get('/:id', async (req, res, next) => {
  try {
    const template = await ResponseTemplate.findOne({ id: req.params.id });
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    await simulateDelay(100);
    res.json(template);
  } catch (error) {
    next(error);
  }
});

// POST /api/templates - Create template
router.post('/', async (req, res, next) => {
  try {
    const { name, category, content, variables = [], createdBy = 'Supervisor', isShared = false, title } = req.body;

    if (!name || !category || !content) {
      return res.status(400).json({ message: 'Name, category, and content are required' });
    }

    const id = req.body.id || `tmpl-${uuidv4().substring(0, 8)}`;

    const newTemplate = new ResponseTemplate({
      id,
      name,
      category,
      content,
      variables,
      createdBy,
      isShared,
      title: title || name,
    });

    await newTemplate.save();
    await simulateDelay(200);

    res.status(201).json(newTemplate);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/templates/:id - Update template
router.patch('/:id', async (req, res, next) => {
  try {
    const template = await ResponseTemplate.findOne({ id: req.params.id });
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const updatableFields = ['name', 'category', 'content', 'variables', 'isShared', 'title'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        template[field] = req.body[field];
      }
    });

    await template.save();
    await simulateDelay(150);

    res.json(template);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/templates/:id - Delete template
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await ResponseTemplate.findOneAndDelete({ id: req.params.id });
    if (!result) {
      return res.status(404).json({ message: 'Template not found' });
    }
    await simulateDelay(150);
    res.json({ message: 'Template deleted', id: req.params.id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
