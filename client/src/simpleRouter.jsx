import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const RouterContext = createContext({ pathname: '/', navigate: () => {} });
const OutletElementContext = createContext(null);
const OutletDataContext = createContext(null);

const normalizePath = (path) => {
  if (!path) return '/';
  const normalized = path.replace(/\/+/g, '/').replace(/\/$/, '');
  return normalized === '' ? '/' : normalized;
};

const createMatch = (element, child) => ({ element, child });

const matchRoutes = (children, pathname, basePath = '') => {
  const normalizedPathname = normalizePath(pathname);
  const normalizedBase = normalizePath(basePath);

  for (const child of children) {
    if (!child || typeof child !== 'object') continue;
    const { path, index, element, children: nested } = child.props || {};
    const isWildcard = path === '*';
    const routePath = index
      ? normalizedBase
      : path?.startsWith('/')
        ? normalizePath(path)
        : normalizePath(`${normalizedBase}/${path || ''}`);

    const exactMatch = normalizedPathname === routePath;
    const nestedMatch = !index && normalizedPathname.startsWith(`${routePath}/`);

    if (isWildcard || exactMatch || nestedMatch) {
      const childMatch = nested
        ? matchRoutes(
            Array.isArray(nested) ? nested : [nested],
            normalizedPathname,
            routePath,
          )
        : null;
      return createMatch(element, childMatch);
    }
  }
  return null;
};

const RenderMatch = ({ match }) => {
  if (!match) return null;
  const nested = match.child ? <RenderMatch match={match.child} /> : null;
  const content = match.element ?? nested;
  return (
    <OutletElementContext.Provider value={nested}>
      {content}
    </OutletElementContext.Provider>
  );
};

export const BrowserRouter = ({ children }) => {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to, options = {}) => {
    const target = typeof to === 'string' ? to : to?.pathname || '/';
    if (options.replace) {
      window.history.replaceState({}, '', target);
    } else {
      window.history.pushState({}, '', target);
    }
    setPathname(target);
  }, []);

  const contextValue = useMemo(() => ({ pathname, navigate }), [pathname, navigate]);

  return (
    <RouterContext.Provider value={contextValue}>
      <OutletDataContext.Provider value={null}>{children}</OutletDataContext.Provider>
    </RouterContext.Provider>
  );
};

export const Routes = ({ children }) => {
  const { pathname } = useContext(RouterContext);
  const match = matchRoutes(Array.isArray(children) ? children : [children], pathname, '/');
  return <RenderMatch match={match} />;
};

export const Route = ({ element }) => element || null;

export const Outlet = ({ context }) => {
  const child = useContext(OutletElementContext);
  const parentContext = useContext(OutletDataContext);
  const value = context === undefined ? parentContext : context;
  if (!child) return null;
  return <OutletDataContext.Provider value={value}>{child}</OutletDataContext.Provider>;
};

export const Link = ({ to, children, onClick, ...rest }) => {
  const { navigate } = useContext(RouterContext);
  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(to);
  };
  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
};

export const NavLink = ({ to, children, className, onClick, ...rest }) => {
  const { pathname, navigate } = useContext(RouterContext);
  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(to);
  };
  const normalizedPath = normalizePath(pathname);
  const normalizedTo = normalizePath(to);
  const isActive =
    normalizedPath === normalizedTo || normalizedPath.startsWith(`${normalizedTo}/`);
  const resolvedClassName =
    typeof className === 'function' ? className({ isActive }) : className || '';
  const classes = `${resolvedClassName} ${isActive ? 'active' : ''}`.trim();

  return (
    <a href={to} onClick={handleClick} className={classes} {...rest}>
      {children}
    </a>
  );
};

export const useNavigate = () => useContext(RouterContext).navigate;
export const useLocation = () => ({ pathname: useContext(RouterContext).pathname });
export const useOutletContext = () => useContext(OutletDataContext);

export const Navigate = ({ to, replace = false }) => {
  const { navigate } = useContext(RouterContext);
  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);
  return null;
};
