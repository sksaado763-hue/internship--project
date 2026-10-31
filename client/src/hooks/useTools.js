import { useEffect, useState } from 'react';
import { toolBySlug, tools as staticTools } from '../data/tools.js';
import { fetchTools } from '../services/toolsApi.js';

/**
 * Returns the tool list, preferring live data from the API.
 * If the server is unavailable, falls back to the static registry
 * (already pre-filtered by the `hidden` flag in toolRegistry.js).
 *
 * @returns {{ tools: typeof staticTools, loading: boolean, source: 'api'|'static' }}
 */
export default function useTools() {
  const [tools, setTools] = useState(staticTools);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('static');

  useEffect(() => {
    let cancelled = false;

    fetchTools().then((apiTools) => {
      if (cancelled) return;

      if (apiTools && apiTools.length > 0) {
        // Map API tool objects back to the shape the UI expects
        // (icon component, full category name, tags array etc.)
        const mapped = apiTools
          .filter((t) => !t.isHidden)
          .map((apiTool) => {
            const local = toolBySlug[apiTool.slug];
            if (!local) return null;
            return {
              ...local,
              // Prefer live DB values for toggleable fields
              isPopular: apiTool.isPopular,
              isFeatured: apiTool.isFeatured,
              isNew: apiTool.isNew,
            };
          })
          .filter(Boolean);

        if (mapped.length > 0) {
          setTools(mapped);
          setSource('api');
        }
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  return { tools, loading, source };
}
