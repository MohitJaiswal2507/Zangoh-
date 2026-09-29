// routes/vector.js
const express = require('express');
const router = express.Router();
const KnowledgeBase = require('../models/knowledgeBase');
const { simulateDelay } = require('../utils/helpers');

// POST /api/vector/search - Search knowledge base
router.post('/search', async (req, res, next) => {
  try {
    const { query, knowledgeBases = [], limit = 3 } = req.body;
    await simulateDelay(200);

    const defaultResults = [
      {
        text: "For delays exceeding 3 business days beyond the original estimate: Offer 10% refund on shipping costs and provide expedited shipping on next order.",
        source: "Customer Service Guidelines",
        section: "Issue Handling Protocols > Shipping and Delivery Issues > Delayed Shipments",
        relevance: 0.92
      },
      {
        text: "Shipping Carrier Status Lookup is integrated with Order Management System to provide real-time tracking information.",
        source: "Customer Service Guidelines",
        section: "Tools and Resources > Reference Materials",
        relevance: 0.78
      },
      {
        text: "For shipping delays affecting gift deliveries during holiday season (November 15 - January 15), agents are authorized to offer additional compensation flexibility.",
        source: "Customer Service Guidelines",
        section: "Special Circumstances > Seasonal Adjustments",
        relevance: 0.75
      }
    ];

    res.json({ results: defaultResults.slice(0, limit) });
  } catch (error) {
    next(error);
  }
});

// GET /api/vector/kb/:id - Get KB content
router.get('/kb/:id', async (req, res, next) => {
  try {
    const kb = await KnowledgeBase.findOne({ id: req.params.id });
    if (!kb) {
      return res.status(404).json({ message: 'Knowledge base not found' });
    }
    res.json({
      id: kb.id,
      name: kb.name,
      description: kb.description,
      content: `# ${kb.name}\n\n## Overview\n${kb.description}\n\n## Guidelines\n- Document count: ${kb.documentCount || 10}\n- Policy updated: ${kb.lastUpdated || new Date()}`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
