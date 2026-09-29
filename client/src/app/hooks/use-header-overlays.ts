import { useState } from "react";

import { useLocation } from "react-router";

export const useHeaderOverlays = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const { pathname } = useLocation();
  const [lastPath, setLastPath] = useState(pathname);

  if (pathname !== lastPath) {
    setLastPath(pathname);
    setProfileMenuOpen(false);
    setMobileOpen(false);
  }

  return {
    searchOpen,
    openSearch: () => setSearchOpen(true),
    closeSearch: () => setSearchOpen(false),

    mobileOpen,
    setMobileOpen,
    closeMobile: () => setMobileOpen(false),

    profileMenuOpen,
    toggleProfile: () => setProfileMenuOpen((open) => !open),
    closeProfile: () => setProfileMenuOpen(false),
  };
};
