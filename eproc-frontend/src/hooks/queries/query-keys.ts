export const queryKeys = {
  requests: {
    all: ["requests"] as const,
    byId: (id: number) => ["requests", id] as const,
    byProject: (projectId: number) =>
      ["requests", "project", projectId] as const,
  },
  purchaseOrders: {
    all: ["purchase-orders"] as const,
    byId: (id: number) => ["purchase-orders", id] as const,
    byProject: (projectId: number) =>
      ["purchase-orders", "project", projectId] as const,
  },
  deliveries: {
    all: ["deliveries"] as const,
    byId: (id: number) => ["deliveries", id] as const,
    byProject: (projectId: number) =>
      ["deliveries", "project", projectId] as const,
  },
  projects: {
    all: ["projects"] as const,
    byId: (id: number) => ["projects", id] as const,
    my: ["projects", "my"] as const,
    users: (projectId: number) => ["projects", projectId, "users"] as const,
  },
  sites: {
    all: ["sites"] as const,
    byProject: (projectId: number) => ["sites", "project", projectId] as const,
  },
  users: {
    all: ["users"] as const,
    byId: (id: number) => ["users", id] as const,
  },
  dashboard: {
    manager: ["dashboard", "manager"] as const,
    accountant: ["dashboard", "accountant"] as const,
    engineer: ["dashboard", "engineer"] as const,
  }
};
