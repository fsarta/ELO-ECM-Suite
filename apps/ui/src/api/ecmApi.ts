import type {
  DashboardSummaryResponse,
  DocumentDetail,
  DocumentState,
  GlobalSearchResponse,
  RepositoryContentResponse,
  RepositoryTreeNode,
  WorkflowTask
} from "@ecm/shared";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:3001";

const buildUrl = (path: string, params?: Record<string, string | number | boolean | undefined>): string => {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === "") {
        continue;
      }
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...init
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status}: ${text}`);
  }

  return (await response.json()) as T;
};

export const ecmApi = {
  async getTree(): Promise<RepositoryTreeNode[]> {
    const payload = await request<{ items: RepositoryTreeNode[] }>("/api/v1/repositories/tree");
    return payload.items;
  },
  async getRepositoryContent(input: {
    nodeId: string;
    query?: string;
    state?: DocumentState | "ALL";
    onlyMine?: boolean;
    onlyDueSoon?: boolean;
    user?: string;
  }): Promise<RepositoryContentResponse> {
    const queryState = input.state && input.state !== "ALL" ? input.state : undefined;
    const url = buildUrl(`/api/v1/repositories/${input.nodeId}/content`, {
      q: input.query,
      state: queryState,
      onlyMine: input.onlyMine,
      onlyDueSoon: input.onlyDueSoon,
      user: input.user
    });
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API ${response.status}: ${text}`);
    }
    return (await response.json()) as RepositoryContentResponse;
  },
  async getDocument(documentId: string): Promise<DocumentDetail> {
    return request<DocumentDetail>(`/api/v1/documents/${documentId}`);
  },
  async patchDocument(
    documentId: string,
    payload: Partial<Pick<DocumentDetail, "name" | "description" | "state" | "metadata" | "tags">>,
    actor: string
  ): Promise<DocumentDetail> {
    const path = `/api/v1/documents/${documentId}?actor=${encodeURIComponent(actor)}`;
    return request<DocumentDetail>(path, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },
  async checkoutDocument(documentId: string, actor: string): Promise<DocumentDetail> {
    return request<DocumentDetail>(`/api/v1/documents/${documentId}/check-out`, {
      method: "POST",
      body: JSON.stringify({ actor })
    });
  },
  async checkinDocument(documentId: string, actor: string, comment: string): Promise<DocumentDetail> {
    return request<DocumentDetail>(`/api/v1/documents/${documentId}/check-in`, {
      method: "POST",
      body: JSON.stringify({ actor, comment })
    });
  },
  async addComment(documentId: string, actor: string, message: string): Promise<DocumentDetail> {
    return request<DocumentDetail>(`/api/v1/documents/${documentId}/comments`, {
      method: "POST",
      body: JSON.stringify({ actor, message })
    });
  },
  async deleteDocument(documentId: string, actor: string): Promise<DocumentDetail> {
    return request<DocumentDetail>(`/api/v1/documents/${documentId}?actor=${encodeURIComponent(actor)}`, {
      method: "DELETE"
    });
  },
  async restoreDocument(documentId: string, actor: string): Promise<DocumentDetail> {
    return request<DocumentDetail>(`/api/v1/documents/${documentId}/restore`, {
      method: "POST",
      body: JSON.stringify({ actor })
    });
  },
  async searchGlobal(query: string): Promise<GlobalSearchResponse> {
    const response = await fetch(buildUrl("/api/v1/search/global", { q: query }));
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API ${response.status}: ${text}`);
    }
    return (await response.json()) as GlobalSearchResponse;
  },
  async myTasks(user: string): Promise<WorkflowTask[]> {
    const response = await fetch(buildUrl("/api/v1/workflow/tasks/my", { user }));
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API ${response.status}: ${text}`);
    }
    const payload = (await response.json()) as { items: WorkflowTask[] };
    return payload.items;
  },
  async dashboard(user: string): Promise<DashboardSummaryResponse> {
    const response = await fetch(buildUrl("/api/v1/dashboard/summary", { user }));
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API ${response.status}: ${text}`);
    }
    return (await response.json()) as DashboardSummaryResponse;
  }
};

