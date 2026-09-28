import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validatePlan } from './coverage.mjs';
const plan = JSON.parse(readFileSync(new URL('../docs/svg-feature-demos.json', import.meta.url)));
const catalog = JSON.parse(readFileSync(new URL('../catalog.json', import.meta.url)));
test('the complete plan and catalog agree', () => assert.equal(validatePlan(plan,catalog).core,519));
for (const [name, mutate] of [
  ['unassigned core feature', p=>{p.features.find(f=>f.tier==='core').demos=[];}],
  ['unknown scene assignment', p=>{p.features.find(f=>f.tier==='core').demos=['missing'];}],
  ['duplicate key', p=>{p.features.push(p.features[0]);}],
  ['missing core key', p=>{p.features.splice(p.features.findIndex(f=>f.tier==='core'),1);}],
  ['duplicate demo', p=>{p.demos[1]=p.demos[0];}],
]) test(`reject ${name}`, () => {const p=structuredClone(plan);mutate(p);assert.throws(()=>validatePlan(p,catalog));});
test('a catalog omission cannot silently skip rendering a planned demo', () => assert.throws(()=>validatePlan(plan,catalog.filter(c=>c.id!==plan.demos[0].id))));
