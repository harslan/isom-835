// Convert questions.ts → Canvas QTI 1.2 zip importable as 6 Question Banks
// (one per domain) for stratified random exam draw.
// Usage: npx tsx scripts/export-canvas-qti.ts
// Output: canvas-final-exam.zip in the project root.

import { questions, domains, type Question, type DomainId } from '../src/data/questions';
import { renderMarkdown } from '../src/data/practice-md';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const EXPORT_DIR = path.join(ROOT, 'canvas-export');
const ZIP_PATH = path.join(ROOT, 'canvas-final-exam.zip');

// Wrap text safely inside CDATA. Replace any closing CDATA marker.
function cdata(s: string): string {
  return `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

// Render a string as HTML for the QTI body (handles markdown to HTML).
function html(text: string): string {
  return renderMarkdown(text);
}

function buildItem(q: Question): string {
  const ident = q.id;
  const stemHtml = `${html(q.scenario)}\n${html(q.question)}`;

  const optionsXml = q.options
    .map(
      (o) => `
        <response_label ident="${o.id}">
          <material>
            <mattext texttype="text/html">${cdata(html(o.text))}</mattext>
          </material>
        </response_label>`
    )
    .join('');

  // Per-option feedback: correct gets correctExplanation; wrong gets misconception + explanation.
  // Canvas shows these only if quiz settings allow.
  const correctFeedback = html(`**Correct answer.** ${q.correctExplanation}`);
  const distractorFeedback = (oid: 'A' | 'B' | 'C' | 'D') => {
    const d = q.distractors[oid];
    if (!d) return null;
    return html(
      `**Misconception:** ${d.misconception}\n\n${d.explanation}`
    );
  };

  // Per-answer feedback ident pattern Canvas understands.
  const feedbackBlocks = (['A', 'B', 'C', 'D'] as const)
    .map((oid) => {
      const isCorrect = oid === q.correctAnswer;
      const fbHtml = isCorrect ? correctFeedback : distractorFeedback(oid);
      if (!fbHtml) return '';
      return `
    <itemfeedback ident="${oid}_fb">
      <flow_mat>
        <material>
          <mattext texttype="text/html">${cdata(fbHtml)}</mattext>
        </material>
      </flow_mat>
    </itemfeedback>`;
    })
    .join('');

  // Score 100 for the correct answer; route per-option feedback.
  const correctScore = `
        <respcondition continue="No">
          <conditionvar>
            <varequal respident="response1">${q.correctAnswer}</varequal>
          </conditionvar>
          <setvar action="Set" varname="SCORE">100</setvar>
          <displayfeedback feedbacktype="Response" linkrefid="${q.correctAnswer}_fb"/>
        </respcondition>`;

  const distractorConditions = (['A', 'B', 'C', 'D'] as const)
    .filter((oid) => oid !== q.correctAnswer)
    .map((oid) => {
      if (!q.distractors[oid]) return '';
      return `
        <respcondition continue="Yes">
          <conditionvar>
            <varequal respident="response1">${oid}</varequal>
          </conditionvar>
          <displayfeedback feedbacktype="Response" linkrefid="${oid}_fb"/>
        </respcondition>`;
    })
    .join('');

  return `
  <item ident="${ident}" title="${ident}">
    <itemmetadata>
      <qtimetadata>
        <qtimetadatafield>
          <fieldlabel>question_type</fieldlabel>
          <fieldentry>multiple_choice_question</fieldentry>
        </qtimetadatafield>
        <qtimetadatafield>
          <fieldlabel>points_possible</fieldlabel>
          <fieldentry>1</fieldentry>
        </qtimetadatafield>
      </qtimetadata>
    </itemmetadata>
    <presentation>
      <material>
        <mattext texttype="text/html">${cdata(stemHtml)}</mattext>
      </material>
      <response_lid ident="response1" rcardinality="Single">
        <render_choice>${optionsXml}
        </render_choice>
      </response_lid>
    </presentation>
    <resprocessing>
      <outcomes>
        <decvar maxvalue="100" minvalue="0" varname="SCORE" vartype="Decimal"/>
      </outcomes>${correctScore}${distractorConditions}
    </resprocessing>${feedbackBlocks}
  </item>`;
}

function buildDomainAssessmentXml(domainId: DomainId, domainTitle: string, qs: Question[]): string {
  const items = qs.map(buildItem).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<questestinterop xmlns="http://www.imsglobal.org/xsd/ims_qtiasiv1p2">
  <objectbank ident="ISOM260_${domainId}">
    <qtimetadata>
      <qtimetadatafield>
        <fieldlabel>bank_title</fieldlabel>
        <fieldentry>ISOM 260 — ${domainTitle} (${qs.length} questions)</fieldentry>
      </qtimetadatafield>
    </qtimetadata>${items}
  </objectbank>
</questestinterop>
`;
}

async function main() {
  console.log(`Building QTI from ${questions.length} questions across ${domains.length} domains...`);

  // Group questions by domain.
  const byDomain = new Map<DomainId, Question[]>();
  for (const d of domains) byDomain.set(d.id, []);
  for (const q of questions) byDomain.get(q.domain)!.push(q);

  // Clean & rebuild export dir.
  await rm(EXPORT_DIR, { recursive: true, force: true });
  await mkdir(EXPORT_DIR, { recursive: true });

  // Write one XML file per domain.
  const resourceEntries: string[] = [];
  let bankNum = 1;
  for (const d of domains) {
    const qs = byDomain.get(d.id)!;
    if (qs.length === 0) continue;
    const filename = `bank_${String(bankNum).padStart(2, '0')}_${d.id}.xml`;
    const xml = buildDomainAssessmentXml(d.id, d.title, qs);
    await writeFile(path.join(EXPORT_DIR, filename), xml);
    resourceEntries.push(
      `    <resource identifier="bank_${String(bankNum).padStart(2, '0')}" type="imsqti_xmlv1p2" href="${filename}">
      <file href="${filename}"/>
    </resource>`
    );
    console.log(`  ${filename}: ${qs.length} questions — ${d.title}`);
    bankNum++;
  }

  // Manifest pointing at all domain bank files.
  const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="ISOM260_FinalExam_QuestionBanks"
  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
  xmlns:imsmd="http://www.imsglobal.org/xsd/imsmd_v1p2">
  <metadata>
    <schema>IMS Content</schema>
    <schemaversion>1.1.3</schemaversion>
  </metadata>
  <organizations/>
  <resources>
${resourceEntries.join('\n')}
  </resources>
</manifest>
`;
  await writeFile(path.join(EXPORT_DIR, 'imsmanifest.xml'), manifest);

  // Zip the folder contents (not the folder itself).
  await rm(ZIP_PATH, { force: true });
  execSync(`cd "${EXPORT_DIR}" && zip -qr "${ZIP_PATH}" .`);

  console.log(`\n✓ Wrote ${ZIP_PATH}`);
  console.log(`  ${questions.length} questions in ${bankNum - 1} banks, ready for stratified random exam.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
