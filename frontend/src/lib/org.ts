const ACTIVE_ORGANIZATION_KEY = "active_organization_id";

export function getActiveOrganizationId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const id = window.localStorage.getItem(ACTIVE_ORGANIZATION_KEY);

  if (!id || id === "undefined" || id === "null") {
    return null;
  }

  return id;
}

export function saveActiveOrganizationId(id: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    ACTIVE_ORGANIZATION_KEY,
    id,
  );
}

export function removeActiveOrganizationId() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(
    ACTIVE_ORGANIZATION_KEY,
  );
}