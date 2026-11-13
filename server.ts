import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FilterCriteria, ProductCategory, SortOption } from './src/shared/types.ts';
import { filterAndSortInventory } from './server/inventoryService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function parseNumberParam(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCategoriesParam(value: unknown): ProductCategory[] | null {
  if (value === undefined || value === null || value === '') return null;
  if (Array.isArray(value)) {
    return value
      .flatMap((entry) => String(entry).split(','))
      .map((s) => s.trim())
      .filter(Boolean) as ProductCategory[];
  }
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean) as ProductCategory[];
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // GET endpoint for bookmarkable/query-string inventory filtering & sorting
  app.get('/api/inventory', (req, res) => {
    const criteria: FilterCriteria = {
      categories: parseCategoriesParam(req.query.categories),
      minPrice: parseNumberParam(req.query.minPrice),
      maxPrice: parseNumberParam(req.query.maxPrice),
      minRating: parseNumberParam(req.query.minRating),
      sortBy: (req.query.sortBy as SortOption | undefined) ?? null,
    };

    const result = filterAndSortInventory(criteria);
    res.json(result);
  });

  // POST endpoint for structured filter state updates
  app.post('/api/inventory/query', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const criteria: FilterCriteria = {
      categories: parseCategoriesParam(body.categories),
      minPrice: parseNumberParam(body.minPrice),
      maxPrice: parseNumberParam(body.maxPrice),
      minRating: parseNumberParam(body.minRating),
      sortBy: (body.sortBy as SortOption | undefined) ?? null,
    };

    const result = filterAndSortInventory(criteria);
    res.json(result);
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
