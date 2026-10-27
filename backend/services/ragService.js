const KnowledgeChunk = require('../models/KnowledgeChunk');

function tokens(text = '') {
  return [...new Set(String(text).toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ').split(/\s+/).filter(w => w.length > 2))];
}

function overlap(queryTokens, fieldTokens) {
  const set = new Set(fieldTokens);
  return queryTokens.reduce((n, t) => n + (set.has(t) ? 1 : 0), 0);
}

function score(query, chunk, requestedDomain = '', requestedSkill = '') {
  const q = tokens(query);
  if (!q.length) return 0;
  const title = tokens(chunk.title);
  const domain = tokens(chunk.domain);
  const skill = tokens(chunk.skill);
  const body = tokens(chunk.text);
  let value = overlap(q, title) * 4 + overlap(q, skill) * 5 + overlap(q, domain) * 3 + overlap(q, body);
  if (requestedDomain && String(chunk.domain).toLowerCase() === String(requestedDomain).toLowerCase()) value += 8;
  if (requestedSkill && String(chunk.skill).toLowerCase().includes(String(requestedSkill).toLowerCase())) value += 10;
  return value / Math.sqrt(q.length);
}

async function retrieveKnowledge(query, { domain = '', skill = '', limit = 4, studentId = '' } = {}) {
  // Do not hard-filter by domain: old modules may use ADL while an FACP source
  // uses Personal. Ranking by domain gives us robust cross-version retrieval.
  const genericFilter = { 'metadata.assessmentId': { $exists: false } };
  const filter = studentId
    ? { $or: [genericFilter, { 'metadata.studentId': String(studentId) }] }
    : genericFilter;
  const candidates = await KnowledgeChunk.find(filter).lean().limit(1000);
  const ranked = candidates
    .map(c => ({ ...c, retrievalScore: score(`${query} ${skill} ${domain}`, c, domain, skill) }))
    .filter(c => c.retrievalScore > 0)
    .sort((a, b) => b.retrievalScore - a.retrievalScore);
  const withoutGuidelines = ranked.filter(c => c.sourceId !== 'facp-guidelines');
  return withoutGuidelines.slice(0, Math.max(1, Math.min(limit, 4)));
}

function formatContext(chunks, maxChars = 9000) {
  const parts = [];
  let used = 0;
  for (let i = 0; i < chunks.length; i += 1) {
    const c = chunks[i];
    const header = `[SOURCE ${i + 1}] ${c.sourceType} | ${c.title || c.skill || c.domain}\nDomain: ${c.domain || ''}\nSkill: ${c.skill || ''}\n`;
    const body = String(c.text || '').replace(/\s+/g, ' ').trim();
    const remaining = maxChars - used - header.length - 2;
    if (remaining <= 80) break;
    const clipped = body.slice(0, Math.min(body.length, remaining));
    parts.push(header + clipped);
    used += header.length + clipped.length + 2;
  }
  return parts.join('\n\n');
}

module.exports = { retrieveKnowledge, formatContext };
