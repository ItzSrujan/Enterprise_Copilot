// User & Auth Types
export type UserRole = "admin" | "employee";

export interface User {
  id: number;
  full_name?: string;
  email: string;
  role: UserRole | string;
  is_active: boolean;
  created_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: UserRole;
  invitation_code?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Conversation & Message Types
export interface Message {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  sources?: Source[];
  citations?: string[];
  feedback?: {
    id: number;
    rating: "positive" | "negative";
    comment?: string | null;
  };
}

export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface ConversationCreate {
  title?: string;
}

// Chat Types
export interface Source {
  source_id?: string;
  file_path?: string;
  file_name?: string | null;
  page?: number | null;
  page_number?: number | null;
  content?: string;
  score?: number;
  title?: string;
  document_id?: number | string;
}

export interface ChatRequest {
  question: string;
  conversation_id?: number | null;
  conversation_history?: Array<{ role: string; content: string }> | null;
  top_k?: number;
  candidate_k?: number;
  document_type?: string | null;
  file_name?: string | null;
}

export interface ChatResponse {
  original_query: string;
  processed_query: string;
  category: string | null;
  answer: string;
  conversation_id: number;
  sources: Source[];
  citations: string[];
  invalid_citations?: string[];
  has_invalid_citations?: boolean;
  grounding_results?: any | null;
  retrieved_document_count?: number;
}

// Feedback Types (Backend expects 'positive' or 'negative')
export type FeedbackRating = "positive" | "negative";

export interface FeedbackCreate {
  message_id: number;
  rating: FeedbackRating;
  comment?: string | null;
}

export interface FeedbackResponse {
  id: number;
  message_id: number;
  rating: FeedbackRating;
  comment: string | null;
  created_at: string;
}

// Document Management Types
export type DocumentCategory =
  | "product_docs"
  | "policies"
  | "faq"
  | "troubleshooting";

export interface DocumentItem {
  id: number;
  file_name: string;
  file_path?: string;
  document_type: DocumentCategory | string;
  status: "completed" | "processing" | "failed" | string;
  chunk_count: number;
  created_at: string;
  updated_at?: string;
  error_message?: string | null;
  uploaded_by?: number | null;
}

// Evaluation Types
export interface EvaluationCreate {
  question: string;
  expected_answer?: string | null;
  relevant_chunk_ids?: number[] | null;
}

export interface EvaluationItem {
  id: number;
  question: string;
  generated_answer: string;
  expected_answer?: string | null;
  metrics: Record<string, any>;
  overall_score?: number | null;
  status: "completed" | "failed" | string;
  error_message?: string | null;
  evaluated_by?: number | null;
  created_at: string;
}

export interface EvaluationResponse extends EvaluationItem {
  retrieved_documents?: any[];
  grounding_result?: any;
}

// ==========================================
// Dashboard Datasets & Types
// ==========================================

export interface EmployeeConversationItem {
  id: string;
  title: string;
  category: "policies" | "troubleshooting" | "faq" | "product_docs";
  preview: string;
  updatedAt: string;
  messageCount: number;
}

export interface SuggestedQuestion {
  id: string;
  category: string;
  question: string;
  description: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  fileType: string;
  pages: number;
  lastUpdated: string;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: "query" | "document" | "evaluation" | "ticket";
}

export interface AdminKPIs {
  totalDocuments: number;
  processedDocuments: number;
  failedDocuments: number;
  totalUsers: number;
  totalChunks: number;
  avgIngestionTimeSec: number;
}

export interface IngestionLog {
  id: number;
  fileName: string;
  category: "product_docs" | "policies" | "faq" | "troubleshooting";
  status: "completed" | "processing" | "failed";
  chunkCount: number;
  uploadedBy: string;
  timestamp: string;
  errorMessage?: string | null;
}

export interface AdminCategoryStats {
  category: string;
  count: number;
  chunks: number;
}

export interface AdminStatsData {
  total_documents: number;
  processed_documents: number;
  failed_documents: number;
  processing_documents: number;
  total_users: number;
  total_chunks: number;
  category_distribution: AdminCategoryStats[];
  recent_documents: DocumentItem[];
}

export interface AdminFeedbackRecord {
  id: number;
  message_id: number;
  user_id: number;
  user_email: string;
  user_name?: string | null;
  query_snippet?: string | null;
  rating: "positive" | "negative";
  comment?: string | null;
  created_at: string;
}

export interface EvaluationMetricsSummary {
  precision: number;
  recall: number;
  f1Score: number;
  mrr: number;
  faithfulness: number;
  answerRelevance: number;
  citationAccuracy: number;
  overallScore: number;
}

export interface UserFeedbackItem {
  id: number;
  messageId: number;
  userEmail: string;
  rating: "positive" | "negative";
  querySnippet: string;
  comment: string | null;
  timestamp: string;
}

export interface SupportKPIs {
  assignedTickets: number;
  openTickets: number;
  resolvedTickets: number;
  escalatedTickets: number;
  avgResolutionTimeHours: number;
  copilotAssistedRate: number;
}

export interface SupportTicketItem {
  id: string;
  customer: string;
  subject: string;
  category: "UPI & Payments" | "Authentication" | "Portal Access" | "Billing" | "Integration";
  priority: "urgent" | "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved" | "escalated";
  assignedAgent: string;
  lastUpdated: string;
  copilotMatchedDoc?: string;
}

export interface CustomerConversationSnippet {
  id: string;
  customerName: string;
  channel: "In-App Chat" | "Email Portal" | "Direct Support";
  issueTitle: string;
  lastMessage: string;
  confidence: number;
  timestamp: string;
  status: "active" | "waiting_customer" | "closed";
}

export interface FrequentlyReportedIssue {
  id: string;
  title: string;
  occurrences: number;
  category: string;
  trend: "up" | "down" | "stable";
  recommendedDocument: string;
  resolutionRate: number;
}

