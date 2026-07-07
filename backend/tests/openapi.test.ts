import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { openApiDocument } from '../docs/openapi.js';

describe('openapi document', () => {
  it('documenta as rotas administrativas principais', () => {
    const paths = openApiDocument.paths as Record<string, unknown>;

    assert.ok(paths['/admin/aplicacoes']);
    assert.ok(paths['/admin/aplicacoes/{id}']);
    assert.ok(paths['/admin/aplicacoes/{id}/hosts']);
    assert.ok(paths['/admin/aplicacoes/{id}/unidades']);
    assert.ok(paths['/admin/status']);
    assert.ok(paths['/admin/unidades']);
  });

  it('possui tag Admin', () => {
    assert.ok(openApiDocument.tags.some((tag) => tag.name === 'Admin'));
  });
});
