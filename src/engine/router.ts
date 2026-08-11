const basePath = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

function normalizeRoute(route: string): string {
  return route.replace(/^\/+|\/+$/g, "");
}

export function restoreRedirectedRoute(): void {
  const url = new URL(window.location.href);
  const redirected = url.searchParams.get("route");
  if (!redirected) return;
  url.searchParams.delete("route");
  const query = url.searchParams.toString();
  const target = `${basePath}${normalizeRoute(redirected)}${query ? `?${query}` : ""}${url.hash}`;
  window.history.replaceState({}, "", target);
}

export function currentRoute(): string {
  const pathname = window.location.pathname;
  const relative = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname.replace(/^\//, "");
  return normalizeRoute(relative);
}

export function routeHref(route = ""): string {
  return `${basePath}${normalizeRoute(route)}`;
}

export function navigate(route = ""): void {
  window.history.pushState({}, "", routeHref(route));
  window.dispatchEvent(new PopStateEvent("popstate"));
}
