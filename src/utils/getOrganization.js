/**
 * Detects the current organization slug based on environment:
 *
 * DEVELOPMENT (localhost):
 *   - Reads from ?org= query param
 *   - Falls back to localStorage for persistence
 *   - http://localhost:5173/?org=tcs → "tcs"
 *   - http://localhost:5173          → null (super admin)
 *
 * PRODUCTION:
 *   - Extracts subdomain from hostname
 *   - tcs.cernsystem.com   → "tcs"
 *   - cernsystem.com       → null (super admin)
 */

const PROD_ROOT_DOMAIN = import.meta.env.VITE_ROOT_DOMAIN || 'cernsystem.com';

export function isLocalhost() {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function getOrganization() {
  if (isLocalhost()) {
    // Dev: use query param with localStorage fallback
    const params = new URLSearchParams(window.location.search);
    const orgFromQuery = params.get('org');

    if (orgFromQuery) {
      localStorage.setItem('org_slug', orgFromQuery);
      return orgFromQuery;
    }

    return localStorage.getItem('org_slug') || null;
  }

  // Production: extract subdomain from hostname
  const hostname = window.location.hostname; // e.g. tcs.cernsystem.com
  const rootDomain = PROD_ROOT_DOMAIN;

  if (hostname === rootDomain || hostname === `www.${rootDomain}`) {
    return null; // No subdomain → super admin
  }

  // Has subdomain
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts[0]; // "tcs" from "tcs.cernsystem.com"
  }

  return null;
}

export function clearOrganization() {
  localStorage.removeItem('org_slug');
}

export default getOrganization;
