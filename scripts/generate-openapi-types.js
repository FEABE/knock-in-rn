#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_SOURCE = 'https://api.knock-in.com/v3/api-docs';
const DEFAULT_OUT = 'lib/api/openapi-types.ts';

async function main() {
  const source = process.argv[2] || DEFAULT_SOURCE;
  const outFile = process.argv[3] || DEFAULT_OUT;
  const spec = await readSpec(source);
  const code = generate(spec);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, code);
}

async function readSpec(source) {
  if (/^https?:\/\//.test(source)) {
    const res = await fetch(source);
    if (!res.ok) throw new Error(`Failed to fetch ${source}: ${res.status}`);
    return res.json();
  }
  return JSON.parse(fs.readFileSync(source, 'utf8'));
}

function generate(spec) {
  const schemas = spec.components?.schemas ?? {};
  const lines = [
    '// This file is generated from https://api.knock-in.com/v3/api-docs.',
    '// Run `node scripts/generate-openapi-types.js` to refresh it.',
    '',
    'export interface OpenApiComponents {',
    '  schemas: {',
  ];

  for (const [name, schema] of Object.entries(schemas)) {
    lines.push(`    ${JSON.stringify(name)}: ${typeFor(schema, schemas, 4)};`);
  }

  lines.push('  };', '}');
  lines.push('');
  lines.push('export type OpenApiSchemas = OpenApiComponents["schemas"];');
  lines.push('export type OpenApiSchema<K extends keyof OpenApiSchemas> = OpenApiSchemas[K];');
  lines.push('');

  return lines.join('\n');
}

function typeFor(schema, schemas, indent) {
  if (!schema) return 'unknown';
  if (schema.$ref) return refType(schema.$ref);
  if (schema.nullable) return `${typeFor({ ...schema, nullable: false }, schemas, indent)} | null`;
  if (schema.enum) return schema.enum.map((value) => JSON.stringify(value)).join(' | ');

  switch (schema.type) {
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'string':
      return 'string';
    case 'array':
      return `${typeFor(schema.items, schemas, indent)}[]`;
    case 'object':
    case undefined:
      return objectType(schema, schemas, indent);
    default:
      return 'unknown';
  }
}

function objectType(schema, schemas, indent) {
  const properties = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  const keys = Object.keys(properties);
  if (keys.length === 0) {
    if (schema.additionalProperties) {
      return `{ [key: string]: ${typeFor(schema.additionalProperties, schemas, indent + 1)} }`;
    }
    return 'Record<string, never>';
  }

  const pad = '  '.repeat(indent);
  const closePad = '  '.repeat(indent - 1);
  const lines = ['{'];
  for (const key of keys) {
    const optional = required.has(key) ? '' : '?';
    lines.push(
      `${pad}${JSON.stringify(key)}${optional}: ${typeFor(properties[key], schemas, indent + 1)};`,
    );
  }
  lines.push(`${closePad}}`);
  return lines.join('\n');
}

function refType(ref) {
  const name = ref.replace('#/components/schemas/', '');
  return `OpenApiComponents["schemas"][${JSON.stringify(name)}]`;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
