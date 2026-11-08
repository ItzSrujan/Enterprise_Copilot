/**
 * Mock dataset for previewing Employee and Admin Dashboards.
 * Clearly identified mock structures kept separate from UI components
 * for straightforward replacement with live backend APIs.
 */

import {
  EmployeeConversationItem,
  SuggestedQuestion,
  KnowledgeArticle,
  ActivityItem,
  AdminKPIs,
  IngestionLog,
  EvaluationMetricsSummary,
  UserFeedbackItem,
} from '@/types';

// ==========================================
// 1. Employee Dashboard Data
// ==========================================

export const sampleEmployeeData = {
  user: {
    name: 'Alex Morgan',
    email: 'alex.morgan@company.com',
    role: 'employee',
    department: 'Engineering & Operations',
  },
  recentConversations: [
    {
      id: 'conv-1',
      title: 'UPI transaction reversal turnaround time & escalation',
      category: 'troubleshooting',
      preview:
        'According to the payment gateway policy, failed UPI transactions are auto-reversed within 48 to 72 hours [S1]...',
      updatedAt: '10 mins ago',
      messageCount: 6,
    },
    {
      id: 'conv-2',
      title: 'Maternity & parental leave application policy in Workday',
      category: 'policies',
      preview:
        'Parental leave must be formally filed at least 30 days prior to commencement in the Workday portal [S2]...',
      updatedAt: '2 hours ago',
      messageCount: 4,
    },
    {
      id: 'conv-3',
      title: 'Client VPN setup and multi-factor authenticator enrollment',
      category: 'faq',
      preview:
        'Download the enterprise profile from portal.corp, install AnyConnect client, and authorize with Duo Push...',
      updatedAt: 'Yesterday',
      messageCount: 3,
    },
    {
      id: 'conv-4',
      title: 'API rate limits for customer-facing GraphQL gateway',
      category: 'product_docs',
      preview:
        'Standard tier endpoints enforce a throttling threshold of 120 requests per minute per authenticated client ID...',
      updatedAt: '3 days ago',
      messageCount: 8,
    },
  ] as EmployeeConversationItem[],
  suggestedQuestions: [
    {
      id: 'sq-1',
      category: 'Payment Operations',
      question: 'What is the standard SLA for UPI transaction reversal?',
      description:
        'Find turnaround policies and troubleshooting steps for pending debit queries.',
    },
    {
      id: 'sq-2',
      category: 'HR & People Ops',
      question: 'How do I request parental leave or extended PTO?',
      description:
        'Review leave entitlement policies, notice requirements, and Workday filing.',
    },
    {
      id: 'sq-3',
      category: 'Information Security',
      question: 'What are our corporate encryption and key destruction rules?',
      description:
        'Inspect SOC2 security standards and customer data retention guidelines.',
    },
    {
      id: 'sq-4',
      category: 'IT Support',
      question: 'How to resolve recurring VPN gateway certificate errors?',
      description:
        'Steps for refreshing machine identity certificates and DNS flush.',
    },
  ] as SuggestedQuestion[],
  quickKnowledge: [
    {
      id: 'kb-1',
      title: 'Employee Handbook & Benefits Policy 2026.pdf',
      category: 'policies',
      fileType: 'PDF',
      pages: 42,
      lastUpdated: 'Nov 2, 2026',
    },
    {
      id: 'kb-2',
      title: 'UPI & Payment Gateway Incident Guide.pdf',
      category: 'troubleshooting',
      fileType: 'PDF',
      pages: 18,
      lastUpdated: 'Oct 28, 2026',
    },
    {
      id: 'kb-3',
      title: 'Enterprise Copilot API & Architecture Docs.pdf',
      category: 'product_docs',
      fileType: 'PDF',
      pages: 36,
      lastUpdated: 'Oct 15, 2026',
    },
    {
      id: 'kb-4',
      title: 'Global Information Security Guidelines.pdf',
      category: 'policies',
      fileType: 'PDF',
      pages: 27,
      lastUpdated: 'Sep 20, 2026',
    },
  ] as KnowledgeArticle[],
  recentActivity: [
    {
      id: 'act-1',
      user: 'Alex Morgan',
      action: 'Queried knowledge base regarding',
      target: 'UPI Transaction SLA',
      timestamp: '12 minutes ago',
      type: 'query',
    },
    {
      id: 'act-2',
      user: 'System',
      action: 'Indexed new version of',
      target: 'Employee Handbook v2.4.pdf',
      timestamp: '1 hour ago',
      type: 'document',
    },
    {
      id: 'act-3',
      user: 'Alex Morgan',
      action: 'Submitted positive feedback on answer in',
      target: 'Parental Leave Query',
      timestamp: '3 hours ago',
      type: 'query',
    },
    {
      id: 'act-4',
      user: 'System',
      action: 'Scheduled RAG benchmark batch',
      target: 'Daily Accuracy Run #84',
      timestamp: '6 hours ago',
      type: 'evaluation',
    },
  ] as ActivityItem[],
};

// ==========================================
// 2. Admin Dashboard Data
// ==========================================

export const sampleAdminData = {
  kpis: {
    totalDocuments: 148,
    processedDocuments: 142,
    failedDocuments: 6,
    totalUsers: 1240,
    totalChunks: 3840,
    avgIngestionTimeSec: 4.8,
  } as AdminKPIs,
  monthlyIngestionTrend: [
    { month: 'Jun', count: 18, chunks: 420 },
    { month: 'Jul', count: 24, chunks: 560 },
    { month: 'Aug', count: 32, chunks: 810 },
    { month: 'Sep', count: 28, chunks: 740 },
    { month: 'Oct', count: 41, chunks: 980 },
    { month: 'Nov', count: 15, chunks: 330 },
  ],
  categoryBreakdown: [
    { category: 'Product Docs', count: 52, percentage: 35 },
    { category: 'Policies', count: 44, percentage: 30 },
    { category: 'Troubleshooting', count: 32, percentage: 22 },
    { category: 'FAQ', count: 20, percentage: 13 },
  ],
  recentUploads: [
    {
      id: 101,
      fileName: 'payment_reconciliation_guide_v3.pdf',
      category: 'troubleshooting',
      status: 'completed',
      chunkCount: 28,
      uploadedBy: 'admin@company.com',
      timestamp: 'Today, 14:20',
    },
    {
      id: 102,
      fileName: 'kyc_compliance_standards_2026.pdf',
      category: 'policies',
      status: 'completed',
      chunkCount: 64,
      uploadedBy: 'sarah.lead@company.com',
      timestamp: 'Today, 11:05',
    },
    {
      id: 103,
      fileName: 'internal_api_gateway_spec.pdf',
      category: 'product_docs',
      status: 'processing',
      chunkCount: 0,
      uploadedBy: 'dev.ops@company.com',
      timestamp: 'Today, 09:40',
    },
    {
      id: 104,
      fileName: 'corrupt_legacy_handbook_scan.pdf',
      category: 'faq',
      status: 'failed',
      chunkCount: 0,
      uploadedBy: 'admin@company.com',
      timestamp: 'Yesterday',
      errorMessage: 'Corrupted PDF stream: font dictionary unparseable at page 4',
    },
    {
      id: 105,
      fileName: 'it_security_protocols_revised.pdf',
      category: 'policies',
      status: 'completed',
      chunkCount: 42,
      uploadedBy: 'security.team@company.com',
      timestamp: 'Nov 4, 2026',
    },
  ] as IngestionLog[],
  evaluationSummary: {
    precision: 0.942,
    recall: 0.895,
    f1Score: 0.918,
    mrr: 0.961,
    faithfulness: 0.958,
    answerRelevance: 0.932,
    citationAccuracy: 0.975,
    overallScore: 0.947,
  } as EvaluationMetricsSummary,
  evaluationTrends: [
    { label: 'W1', faithfulness: 0.91, relevance: 0.88, citations: 0.93 },
    { label: 'W2', faithfulness: 0.93, relevance: 0.90, citations: 0.95 },
    { label: 'W3', faithfulness: 0.94, relevance: 0.91, citations: 0.96 },
    { label: 'W4', faithfulness: 0.96, relevance: 0.93, citations: 0.98 },
  ],
  recentFeedback: [
    {
      id: 501,
      messageId: 1042,
      userEmail: 'support.agent@company.com',
      rating: 'positive',
      querySnippet: 'What are the escalation tiers for payment processing timeouts?',
      comment: 'Exact policy reference provided with accurate page citations.',
      timestamp: '25 mins ago',
    },
    {
      id: 502,
      messageId: 1041,
      userEmail: 'employee.dev@company.com',
      rating: 'negative',
      querySnippet: 'How to configure SSL pinning on iOS mobile build?',
      comment: 'Answer was generic; the internal iOS security doc was missing from retrieval.',
      timestamp: '2 hours ago',
    },
    {
      id: 503,
      messageId: 1039,
      userEmail: 'hr.specialist@company.com',
      rating: 'positive',
      querySnippet: 'How many bereavement days are granted under 2026 benefits?',
      comment: 'Super fast and verified against Employee Handbook S3.',
      timestamp: '5 hours ago',
    },
  ] as UserFeedbackItem[],
};


