
import { 
  Package, Layers, Zap, Database, Globe, Server, Activity, ShieldCheck, 
  MessageSquare, Box, Cloud, Lock 
} from 'lucide-react';

export const SERVICE_REGISTRY = [
  { 
    id: 'enableInventory', 
    name: 'Inventory Service', 
    cat: 'Core', 
    desc: 'Stock tracking, unit management, and warehouse synchronization.', 
    icon: Package, 
    core: true,
    features: ['Multi-Warehouse Support', 'Barcode Scanning', 'Low Stock Alerts', 'Batch Tracking']
  },
  { 
    id: 'enableAnalytics', 
    name: 'Analytics Engine', 
    cat: 'Core', 
    desc: 'Advanced reporting, velocity charts, and telemetry intelligence.', 
    icon: Layers, 
    core: true,
    features: ['Real-time Velocity', 'Predictive Forecasting', 'Custom Reports', 'Data Export API']
  },
  { 
    id: 'enableAutomation', 
    name: 'Automation Workflow', 
    cat: 'Core', 
    desc: 'Trigger-based actions and logic pipelines.', 
    icon: Zap, 
    core: true,
    features: ['Visual Workflow Builder', 'Webhook Triggers', 'Scheduled Jobs', 'Multi-step Logic']
  },
  { 
    id: 'svc_ai_recs', 
    name: 'AI Recommendation Node', 
    cat: 'AI', 
    desc: 'Predictive product suggestions based on user behavior.', 
    icon: MessageSquare, 
    core: false,
    features: ['Collaborative Filtering', 'Trending Boost', 'Personalized Email']
  },
  { 
    id: 'svc_vector_db', 
    name: 'Vector Database', 
    cat: 'Data', 
    desc: 'High-dimensional storage for semantic search operations.', 
    icon: Database, 
    core: false,
    features: ['Semantic Search', 'Image Similarity', 'Hybrid Querying']
  },
  { 
    id: 'svc_edge_cdn', 
    name: 'Global Edge CDN', 
    cat: 'Infrastructure', 
    desc: 'Content delivery network across 140+ PoPs.', 
    icon: Globe, 
    core: false,
    features: ['Image Optimization', 'DDoS Protection', 'Geo-Blocking']
  },
  { 
    id: 'svc_auth_guard', 
    name: 'Auth Guard Pro', 
    cat: 'Security', 
    desc: 'Advanced MFA and anomaly detection for user sessions.', 
    icon: ShieldCheck, 
    core: false,
    features: ['Biometric MFA', 'IP Whitelisting', 'Session Replay']
  },
  { 
    id: 'svc_blockchain', 
    name: 'Ledger Audit', 
    cat: 'Compliance', 
    desc: 'Immutable blockchain recording for transaction history.', 
    icon: Lock, 
    core: false,
    features: ['Smart Contracts', 'Public Verification', 'Audit Trail']
  },
  { 
    id: 'svc_3d_render', 
    name: '3D Asset Renderer', 
    cat: 'Media', 
    desc: 'Real-time 3D model processing for storefronts.', 
    icon: Box, 
    core: false,
    features: ['AR Preview', 'Texture Compression', '360 Spin']
  },
  { 
    id: 'svc_compute_x', 
    name: 'Elastic Compute X', 
    cat: 'Infrastructure', 
    desc: 'Auto-scaling serverless functions.', 
    icon: Server, 
    core: false,
    features: ['Serverless Functions', 'Cron Jobs', 'Container Orchestration']
  },
  { 
    id: 'svc_health_mon', 
    name: 'Health Monitor', 
    cat: 'DevOps', 
    desc: 'Uptime tracking and latency alerts.', 
    icon: Activity, 
    core: false,
    features: ['Uptime Checks', 'Latency Maps', 'Incident Alerts']
  },
  { 
    id: 'svc_backup_cold', 
    name: 'Cold Storage Archive', 
    cat: 'Data', 
    desc: 'Long-term data retention for compliance.', 
    icon: Cloud, 
    core: false,
    features: ['Immutable Snapshots', '7-Year Retention', 'Compliance Reports']
  },
];
