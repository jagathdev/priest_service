export interface GraphTrendItem {
  date: string;
  label: string;
  count: number;
}

export interface DashboardMetricGraph {
  title: string;
  prefix: string;
  count: number;
  todayCount: number;
  subtitle: string;
  trend: GraphTrendItem[];
  color: "blue" | "purple" | "orange" | "green";
  revenue?: number;
  todayRevenue?: number;
}

export interface DashboardGraphsPayload {
  websiteViews: DashboardMetricGraph;
  otpGenerated: DashboardMetricGraph;
  purchaseInterest: DashboardMetricGraph;
  completedOrders: DashboardMetricGraph;
}

export interface VisitorSourceItem {
  source: string;
  count: number;
}

export interface VisitorCampaignItem {
  source: string;
  campaign: string;
  count: number;
}

export interface DashboardStatsResponse {
  graphs: DashboardGraphsPayload;
  totalVisitors: number;
  todayVisitors: number;
  filteredVisitors: number;
  sourceBreakdown: VisitorSourceItem[];
  campaignBreakdown: VisitorCampaignItem[];
}
