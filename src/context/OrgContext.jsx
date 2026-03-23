import { createContext, useContext, useEffect, useState } from 'react';
import API from '../services/api';
import { getOrganization, isLocalhost } from '../utils/getOrganization';

const OrgContext = createContext(null);

export const useOrg = () => useContext(OrgContext);

export function OrgProvider({ children }) {
  const [org, setOrg] = useState(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgError, setOrgError] = useState(null);

  const orgSlug = getOrganization();

  useEffect(() => {
    // No org slug detected
    if (!orgSlug) {
      // In production with no subdomain → redirect to super admin
      if (!isLocalhost()) {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/super-admin') && currentPath !== '/login') {
          window.location.replace('/super-admin');
        }
      }
      setOrgLoading(false);
      return;
    }

    API.get('/organization/details')
      .then(res => {
        setOrg(res.data);
        setOrgError(null);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setOrgError('Organization not found');
        } else {
          // Network/server error — fallback to slug as display name
          setOrg({ name: orgSlug, slug: orgSlug });
        }
      })
      .finally(() => setOrgLoading(false));
  }, [orgSlug]);

  // Update browser tab title
  useEffect(() => {
    document.title = org?.name ? `${org.name} - Slot Booking` : 'SlotBook - Slot Booking';
  }, [org]);

  // Show "Organization not found" screen
  if (orgError === 'Organization not found') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🏢</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Organization Not Found
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            The organization <span className="font-semibold text-blue-600">"{orgSlug}"</span> does not exist.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Please check the URL or contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <OrgContext.Provider value={{ org, orgSlug, orgLoading, orgError }}>
      {children}
    </OrgContext.Provider>
  );
}
