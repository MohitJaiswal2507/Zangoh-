// utils/seedData.js
const Conversation = require('../models/conversation');
const Agent = require('../models/agent');
const KnowledgeBase = require('../models/knowledgeBase');
const ResponseTemplate = require('../models/responseTemplate');

const sampleConversations = [
  {
    id: "conv-84291",
    customer: {
      id: "cust-84291",
      name: "Elena Vasquez",
      email: "elena.vasquez@example.com",
      tier: "VIP",
      tenure: "3.8 years",
      location: "Madrid",
      lifetimeValue: "₹1.24L",
      orders: 38,
      returnRate: "5.2%",
      sentiment: -0.62
    },
    agent: {
      id: "CSR-Returns",
      name: "CSR-Returns Agent"
    },
    status: "active",
    alertLevel: "high",
    caseNumber: "84291",
    queue: "Refund",
    risk: 96,
    waitTime: "12:42",
    recommendedAction: "Take over",
    category: "Refund blocked",
    channel: "Web chat",
    region: "EN-US",
    coPilotRecommendation: {
      action: "Approve expedited refund of ₹8,420 and waive the standard review period.",
      evidence: "return scan received • item category eligible • customer lifetime value: high",
      confidence: 88,
      suggestedReply: "Hi Elena — I've reviewed the return evidence and approved an expedited refund of ₹8,420. The standard review period has been waived."
    },
    caseDiagnostics: {
      repeatContact: 92,
      negativeSentiment: 78,
      policyException: 66,
      churnPropensity: 58
    },
    startTime: new Date(Date.now() - 15 * 60000),
    metrics: {
      sentiment: 0.18,
      responseTime: 14.2,
      confidenceScore: 0.62,
      resolutionRate: 74,
      csatScore: 3.2
    },
    messages: [
      {
        sender: "customer",
        text: "I returned the item last week, but the refund is still blocked.",
        timestamp: new Date(Date.now() - 14 * 60000)
      },
      {
        sender: "agent",
        text: "I found the return receipt and carrier confirmation. I'm checking the refund policy now.",
        timestamp: new Date(Date.now() - 13 * 60000)
      },
      {
        sender: "customer",
        text: "I need the refund today. This is the second time I'm contacting support.",
        timestamp: new Date(Date.now() - 11 * 60000)
      },
      {
        sender: "agent",
        text: "The amount exceeds my approval limit. I've prepared the evidence for supervisor review.",
        timestamp: new Date(Date.now() - 10 * 60000)
      }
    ],
    tags: ["refund", "returns", "VIP", "urgent"],
    humanIntervention: {
      occurred: false
    }
  },
  {
    id: "conv-84275",
    customer: {
      id: "cust-84275",
      name: "Marcus Lee",
      email: "marcus.lee@example.com",
      tier: "Standard",
      tenure: "1.2 years",
      location: "San Francisco",
      lifetimeValue: "₹45,200",
      orders: 14,
      returnRate: "2.1%",
      sentiment: -0.45
    },
    agent: {
      id: "CSR-Identity",
      name: "CSR-Identity Agent"
    },
    status: "active",
    alertLevel: "high",
    caseNumber: "84275",
    queue: "Account",
    risk: 84,
    waitTime: "09:18",
    recommendedAction: "Approve override",
    category: "Account locked",
    channel: "Web chat",
    region: "NA-US",
    coPilotRecommendation: {
      action: "Verify 2FA challenge via secondary email and unlock credentials.",
      evidence: "device fingerprint match • clean IP address history",
      confidence: 94,
      suggestedReply: "Hi Marcus — I have verified your identity token and unlocked your account access."
    },
    caseDiagnostics: {
      repeatContact: 75,
      negativeSentiment: 82,
      policyException: 50,
      churnPropensity: 42
    },
    startTime: new Date(Date.now() - 25 * 60000),
    metrics: {
      sentiment: 0.25,
      responseTime: 11.5,
      confidenceScore: 0.70
    },
    messages: [
      {
        sender: "customer",
        text: "My account has been locked after 2 incorrect password attempts. I can't access my active orders!",
        timestamp: new Date(Date.now() - 24 * 60000)
      },
      {
        sender: "agent",
        text: "Hello Marcus, I can assist with account verification. I have sent an SMS code to your registered number.",
        timestamp: new Date(Date.now() - 23 * 60000)
      }
    ],
    tags: ["account", "security", "override"],
    humanIntervention: {
      occurred: false
    }
  },
  {
    id: "conv-84263",
    customer: {
      id: "cust-84263",
      name: "Noah Williams",
      email: "noah.williams@example.com",
      tier: "Plus",
      tenure: "2.0 years",
      location: "Chicago",
      lifetimeValue: "₹68,900",
      orders: 22,
      returnRate: "4.0%",
      sentiment: -0.30
    },
    agent: {
      id: "CSR-Logistics",
      name: "CSR-Logistics Agent"
    },
    status: "active",
    alertLevel: "high",
    caseNumber: "84263",
    queue: "Delivery",
    risk: 72,
    waitTime: "08:09",
    recommendedAction: "Review evidence",
    category: "Delivery exception",
    channel: "Mobile",
    region: "NA-US",
    coPilotRecommendation: {
      action: "Initiate carrier re-dispatch to alternate safe drop location.",
      evidence: "carrier GPS confirms address mismatch at gate",
      confidence: 89,
      suggestedReply: "Hello Noah, carrier dispatch has been notified to re-attempt delivery by 4 PM today."
    },
    caseDiagnostics: {
      repeatContact: 60,
      negativeSentiment: 55,
      policyException: 40,
      churnPropensity: 35
    },
    startTime: new Date(Date.now() - 18 * 60000),
    metrics: {
      sentiment: 0.35,
      responseTime: 9.8,
      confidenceScore: 0.76
    },
    messages: [
      {
        sender: "customer",
        text: "The delivery status says 'Delivered to porch', but there is nothing here. Please check GPS coordinates.",
        timestamp: new Date(Date.now() - 17 * 60000)
      }
    ],
    tags: ["delivery", "tracking", "logistics"],
    humanIntervention: {
      occurred: false
    }
  },
  {
    id: "conv-84241",
    customer: {
      id: "cust-84241",
      name: "Ava Thompson",
      email: "ava.t@example.com",
      tier: "Standard",
      tenure: "0.8 years",
      location: "Austin",
      lifetimeValue: "₹24,100",
      orders: 7,
      returnRate: "1.0%",
      sentiment: 0.10
    },
    agent: {
      id: "CSR-Tech",
      name: "CSR-Tech Agent"
    },
    status: "active",
    alertLevel: "medium",
    caseNumber: "84241",
    queue: "Product",
    risk: 58,
    waitTime: "06:34",
    recommendedAction: "Monitor",
    category: "Product defect",
    channel: "Website",
    region: "NA-US",
    coPilotRecommendation: {
      action: "Offer replacement unit under standard 1-year product warranty.",
      evidence: "serial number in range of known firmware batch defect",
      confidence: 91,
      suggestedReply: "Hi Ava, we will ship a complimentary replacement unit to you right away."
    },
    caseDiagnostics: {
      repeatContact: 45,
      negativeSentiment: 40,
      policyException: 30,
      churnPropensity: 25
    },
    startTime: new Date(Date.now() - 12 * 60000),
    metrics: {
      sentiment: 0.50,
      responseTime: 8.4,
      confidenceScore: 0.82
    },
    messages: [
      {
        sender: "customer",
        text: "The blender motor started smelling like burning plastic on the first use.",
        timestamp: new Date(Date.now() - 11 * 60000)
      }
    ],
    tags: ["product", "defect", "warranty"],
    humanIntervention: {
      occurred: false
    }
  },
  {
    id: "conv-84230",
    customer: {
      id: "cust-84230",
      name: "Oliver Chen",
      email: "oliver.c@example.com",
      tier: "VIP",
      tenure: "4.5 years",
      location: "Seattle",
      lifetimeValue: "₹1.80L",
      orders: 52,
      returnRate: "3.5%",
      sentiment: 0.20
    },
    agent: {
      id: "CSR-Finance",
      name: "CSR-Finance Agent"
    },
    status: "active",
    alertLevel: "low",
    caseNumber: "84230",
    queue: "Billing",
    risk: 47,
    waitTime: "04:51",
    recommendedAction: "Send template",
    category: "Invoice discrepancy",
    channel: "Messenger",
    region: "NA-US",
    coPilotRecommendation: {
      action: "Send 'Billing receipt resend' template with itemized VAT breakdown.",
      evidence: "tax exempt flag not applied during checkout",
      confidence: 96,
      suggestedReply: "Hi Oliver, I've corrected the VAT adjustment and attached the updated tax invoice."
    },
    caseDiagnostics: {
      repeatContact: 30,
      negativeSentiment: 25,
      policyException: 15,
      churnPropensity: 18
    },
    startTime: new Date(Date.now() - 8 * 60000),
    metrics: {
      sentiment: 0.65,
      responseTime: 7.2,
      confidenceScore: 0.88
    },
    messages: [
      {
        sender: "customer",
        text: "Could you send me the GST invoice with company tax registration details?",
        timestamp: new Date(Date.now() - 7 * 60000)
      }
    ],
    tags: ["billing", "tax", "invoice"],
    humanIntervention: {
      occurred: false
    }
  },
  {
    id: "conv-2023-10",
    customer: {
      id: "cust-5672",
      name: "Alex Johnson",
      email: "alex.j@example.com",
      tier: "Standard",
      location: "New York"
    },
    agent: {
      id: "agent-cs-1",
      name: "Customer Service Agent"
    },
    status: "active",
    alertLevel: "high",
    caseNumber: "2023-10",
    queue: "Delivery",
    risk: 85,
    waitTime: "10:15",
    recommendedAction: "Take over",
    category: "Delayed shipment",
    startTime: new Date(Date.now() - 20 * 60000),
    metrics: {
      sentiment: 0.2,
      responseTime: 15.3,
      confidenceScore: 0.65
    },
    messages: [
      {
        sender: "customer",
        text: "I ordered a package 5 days ago and it still hasn't arrived. The tracking hasn't updated in 3 days.",
        timestamp: new Date(Date.now() - 20 * 60000)
      },
      {
        sender: "agent",
        text: "I understand your concern about your package. Let me check the status for you. Could you please provide your order number?",
        timestamp: new Date(Date.now() - 19 * 60000)
      },
      {
        sender: "customer",
        text: "Order #ORD-29384-KJH. I need this package by tomorrow for my daughter's birthday.",
        timestamp: new Date(Date.now() - 18 * 60000)
      },
      {
        sender: "agent",
        text: "Thank you for providing your order number. I'm checking your order status now.",
        timestamp: new Date(Date.now() - 17 * 60000)
      },
      {
        sender: "customer",
        text: "That's not good enough. I paid for express shipping specifically to have it arrive by tomorrow. I want to speak to a human representative.",
        timestamp: new Date(Date.now() - 13 * 60000)
      }
    ],
    tags: ["shipping", "delay", "urgent"],
    humanIntervention: {
      occurred: false
    }
  }
];

const sampleAgents = [
  {
    id: "CSR-Returns",
    name: "CSR-Returns Agent",
    model: "v4.3",
    description: "Returns and refund policy specialist with governed approval controls",
    parameters: {
      temperature: 0.68,
      max_tokens: 150,
      top_p: 0.68,
      speed: "Fast",
      empathy: "High",
      stability: 0.82
    },
    capabilities: [
      { id: "return_processing", name: "Return Processing", enabled: true },
      { id: "refund_approval", name: "Refund Approval Limit ₹5,000", enabled: true },
      { id: "carrier_integration", name: "Carrier Scan Verification", enabled: true },
      { id: "policy_exception", name: "Policy Exception Review", enabled: false }
    ],
    knowledgeBases: [
      { id: "kb-return-policy", name: "Return & Refund Policy", enabled: true },
      { id: "kb-cs-general", name: "Customer Service Guidelines", enabled: true }
    ],
    escalationThresholds: {
      lowConfidence: 0.64,
      negativeSentiment: -0.55,
      responseTime: 90,
      refundValue: 5000
    },
    status: "active",
    metrics: {
      conversations: 2456,
      avgResponseTime: 12.7,
      satisfaction: 0.86,
      escalationRate: 0.16,
      containment: 74.6,
      csat: 8.8,
      fallback: 11.2,
      hallucination: 0.7
    }
  },
  {
    id: "CSR-Identity",
    name: "CSR-Identity Agent",
    model: "v4.2",
    description: "Identity verification and account security specialist",
    parameters: {
      temperature: 0.3,
      max_tokens: 120,
      top_p: 0.4
    },
    capabilities: [
      { id: "2fa_override", name: "2FA Verification", enabled: true },
      { id: "account_unlock", name: "Account Unlock", enabled: true }
    ],
    knowledgeBases: [
      { id: "kb-cs-general", name: "Security & Auth Policy", enabled: true }
    ],
    escalationThresholds: {
      lowConfidence: 0.75,
      negativeSentiment: -0.4,
      responseTime: 60
    },
    status: "active",
    metrics: {
      conversations: 1840,
      avgResponseTime: 8.5,
      satisfaction: 0.91,
      escalationRate: 0.12
    }
  },
  {
    id: "CSR-Logistics",
    name: "CSR-Logistics Agent",
    model: "v4.3",
    description: "Shipping, tracking, and carrier coordination specialist",
    parameters: {
      temperature: 0.5,
      max_tokens: 150,
      top_p: 0.6
    },
    capabilities: [
      { id: "tracking_lookup", name: "Tracking Lookup", enabled: true },
      { id: "redispatch", name: "Carrier Re-dispatch", enabled: true }
    ],
    knowledgeBases: [
      { id: "kb-shipping-policy", name: "Shipping Policy", enabled: true }
    ],
    escalationThresholds: {
      lowConfidence: 0.6,
      negativeSentiment: -0.5,
      responseTime: 80
    },
    status: "active",
    metrics: {
      conversations: 3120,
      avgResponseTime: 10.2,
      satisfaction: 0.88,
      escalationRate: 0.14
    }
  },
  {
    id: "agent-cs-1",
    name: "Customer Service Agent",
    model: "gpt-3.5-turbo",
    description: "General customer service agent for handling inquiries",
    parameters: {
      temperature: 0.7,
      max_tokens: 150,
      top_p: 1.0
    },
    capabilities: [
      { id: "order_lookup", name: "Order Lookup", enabled: true },
      { id: "return_processing", name: "Return Processing", enabled: true }
    ],
    knowledgeBases: [
      { id: "kb-cs-general", name: "Customer Service Guidelines", enabled: true }
    ],
    escalationThresholds: {
      lowConfidence: 0.4,
      negativeSentiment: 0.3,
      responseTime: 20
    },
    status: "active",
    metrics: {
      conversations: 2456,
      avgResponseTime: 12.7,
      satisfaction: 0.86,
      escalationRate: 0.16
    }
  }
];

const sampleTemplates = [
  {
    id: "tmpl-welcome-visitor",
    name: "Welcome new visitor",
    title: "Say Hi to welcome new visitors!",
    category: "Onboarding",
    channel: "Website",
    content: "Hi <user name>! Welcome to <company name>. How may I be of help today?",
    variables: [
      { name: "user name", description: "Visitor or customer full name" },
      { name: "company name", description: "Company or service name" }
    ],
    isShared: true,
    createdBy: "Neha Prasad",
    tags: ["Onboarding", "Website"],
    usageCount: 128,
    isFavorite: true
  },
  {
    id: "tmpl-product-tour",
    name: "Product tour invite",
    title: "Invite visitors to explore key features",
    category: "Onboarding",
    channel: "Messenger",
    content: "Welcome, {{name}}! Thanks for visiting {{company}}. I can help you get started or point you to the right product guide.",
    variables: [
      { name: "name", description: "Customer name" },
      { name: "company", description: "Company brand name" }
    ],
    isShared: true,
    createdBy: "Neha Prasad",
    tags: ["Onboarding", "Messenger"],
    usageCount: 84,
    isFavorite: false
  },
  {
    id: "tmpl-getting-started",
    name: "Getting started checklist",
    title: "Share a short first-session checklist",
    category: "Onboarding",
    channel: "Email",
    content: "Hello {{name}}, welcome to {{company}}! Here is your quick checklist to complete onboarding in under 5 minutes: 1. Confirm profile, 2. Add payment method, 3. Place your first order.",
    variables: [
      { name: "name", description: "Customer name" },
      { name: "company", description: "Company brand name" }
    ],
    isShared: true,
    createdBy: "Marcus L.",
    tags: ["Onboarding", "Email"],
    usageCount: 61,
    isFavorite: false
  },
  {
    id: "tmpl-trial-followup",
    name: "Trial follow-up",
    title: "Guide visitors after trial activation",
    category: "Engagement",
    channel: "Mobile",
    content: "Hi {{name}}, how has your experience been with {{product}} so far? Let our specialist team know if you need any setup assistance!",
    variables: [
      { name: "name", description: "Customer name" },
      { name: "product", description: "Product name" }
    ],
    isShared: true,
    createdBy: "Neha Prasad",
    tags: ["Engagement", "Mobile"],
    usageCount: 61,
    isFavorite: false
  },
  {
    id: "tmpl-expedited-refund",
    name: "Expedited refund approval",
    title: "Approve expedited refund and notify customer",
    category: "Returns",
    channel: "Website",
    content: "Hi {{name}} — I've reviewed your case for order #{{order_number}} and approved an expedited refund of ₹{{refund_amount}}. The standard review period has been waived.",
    variables: [
      { name: "name", description: "Customer name" },
      { name: "order_number", description: "Order reference number" },
      { name: "refund_amount", description: "Approved refund amount in INR" }
    ],
    isShared: true,
    createdBy: "Neha Prasad",
    tags: ["Returns", "Website"],
    usageCount: 95,
    isFavorite: true
  },
  {
    id: "tmpl-policy-exception",
    name: "Policy exception override",
    title: "Grant one-time exception for VIP customer",
    category: "Transaction",
    channel: "Website",
    content: "Hello {{name}}, as a valued VIP customer, we have granted a one-time policy exception for your request on case #{{case_number}}.",
    variables: [
      { name: "name", description: "Customer name" },
      { name: "case_number", description: "Case reference number" }
    ],
    isShared: true,
    createdBy: "Neha Prasad",
    tags: ["Transaction", "Website"],
    usageCount: 42,
    isFavorite: false
  },
  {
    id: "tmpl-billing-receipt",
    name: "Billing receipt resend",
    title: "Resend tax invoice with company details",
    category: "Billing",
    channel: "Email",
    content: "Hi {{name}}, your requested tax invoice for order #{{order_number}} has been regenerated with company registration details and resent to your email.",
    variables: [
      { name: "name", description: "Customer name" },
      { name: "order_number", description: "Order ID" }
    ],
    isShared: true,
    createdBy: "Oliver C.",
    tags: ["Billing", "Email"],
    usageCount: 73,
    isFavorite: false
  },
  {
    id: "tmpl-shipping-update",
    name: "Shipping carrier update",
    title: "Share urgent carrier transit update",
    category: "Transaction",
    channel: "Messenger",
    content: "Hi {{name}}, we checked with carrier dispatch. Your shipment under tracking {{tracking_number}} is confirmed for delivery by tomorrow.",
    variables: [
      { name: "name", description: "Customer name" },
      { name: "tracking_number", description: "Airway bill or tracking code" }
    ],
    isShared: true,
    createdBy: "Neha Prasad",
    tags: ["Transaction", "Messenger"],
    usageCount: 110,
    isFavorite: false
  }
];

const sampleKnowledgeBases = [
  {
    id: "kb-cs-general",
    name: "Customer Service Guidelines",
    description: "General customer service policies and procedures",
    documentCount: 45,
    lastUpdated: new Date("2023-09-15T14:30:00Z")
  },
  {
    id: "kb-shipping-policy",
    name: "Shipping Policy",
    description: "Shipping options, timelines, and costs",
    documentCount: 12,
    lastUpdated: new Date("2023-08-22T11:45:00Z")
  },
  {
    id: "kb-return-policy",
    name: "Return Policy",
    description: "Return and exchange procedures and limitations",
    documentCount: 18,
    lastUpdated: new Date("2023-09-05T16:20:00Z")
  },
  {
    id: "kb-product-catalog",
    name: "Product Catalog",
    description: "Complete product listings with details and pricing",
    documentCount: 1243,
    lastUpdated: new Date("2023-10-01T09:15:00Z")
  }
];

async function runSeed() {
  try {
    for (const c of sampleConversations) {
      await Conversation.updateOne({ id: c.id }, { $set: c }, { upsert: true });
    }
    for (const a of sampleAgents) {
      await Agent.updateOne({ id: a.id }, { $set: a }, { upsert: true });
    }
    for (const t of sampleTemplates) {
      await ResponseTemplate.updateOne({ id: t.id }, { $set: t }, { upsert: true });
    }
    for (const kb of sampleKnowledgeBases) {
      await KnowledgeBase.updateOne({ id: kb.id }, { $set: kb }, { upsert: true });
    }
    console.log('Seed data successfully upserted into database.');
  } catch (err) {
    console.error('Error running seed data:', err);
  }
}

module.exports = {
  sampleConversations,
  sampleAgents,
  sampleTemplates,
  sampleKnowledgeBases,
  runSeed
};
