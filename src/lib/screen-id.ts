const SCREEN_ID_KEY = "clarra-screen-id";

export function getScreenId(): string {
  const stored = localStorage.getItem(SCREEN_ID_KEY);
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem(SCREEN_ID_KEY, id);
  return id;
}

export function setPairedScreen(workspaceId: string, displayId: string) {
  localStorage.setItem("clarra-workspace-id", workspaceId);
  localStorage.setItem("clarra-display-id", displayId);
}
