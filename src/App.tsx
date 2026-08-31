import { useEffect, useMemo, useState } from "react";
import { clearHiddenAnswers, isAnswered, visibleQuestions } from "./core/questionnaire";
import { applySourceFreshness } from "./core/sourceFreshness";
import { landingOfficialLinks, resultOfficialLinks } from "./engine/processOfficialLinks";
import { getProcessBySlug, getProcessModule, listProcesses } from "./engine/registry";
import { currentRoute, navigate, restoreRedirectedRoute, routeHref } from "./engine/router";
import type { ProcessCatalogEntry, ProcessModule, ProcessOfficialLink } from "./engine/types";
import type { PassportAnswers, Question } from "./types";
import "./styles.css";

restoreRedirectedRoute();

function loadAnswers(key: string): PassportAnswers {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAnswers(key: string, answers: PassportAnswers) {
  localStorage.setItem(key, JSON.stringify(answers));
}

function Brand({ subtitle = "Verified official-process preflight", onHome }: { subtitle?: string; onHome?: () => void }) {
  return (
    <header className="brandbar">
      <button className="brand-home" onClick={onHome ?? (() => navigate(""))} type="button" aria-label="Official Checklist home">
        <span className="brand-mark">OC</span>
        <span><strong>Official Checklist</strong><small>{subtitle}</small></span>
      </button>
    </header>
  );
}

function ProcessAnchor({ entry, children, className }: { entry: ProcessCatalogEntry; children: React.ReactNode; className?: string }) {
  return (
    <a
      className={className}
      href={routeHref(entry.slug)}
      onClick={(event) => {
        event.preventDefault();
        navigate(entry.slug);
      }}
    >
      {children}
    </a>
  );
}

function OfficialLinksPanel({ links, title, copy, compact = false }: { links: ProcessOfficialLink[]; title: string; copy: string; compact?: boolean }) {
  if (!links.length) return null;
  return (
    <section className={`official-links-panel ${compact ? "compact" : ""}`}>
      <div className="official-links-heading">
        <div><p className="eyebrow">OFFICIAL LINKS</p><h2>{title}</h2></div>
        <span>{links.length} link{links.length === 1 ? "" : "s"}</span>
      </div>
      <p className="official-links-copy">{copy}</p>
      <div className="official-link-grid">
        {links.map((link) => (
          <a className="official-link-card" href={link.url} key={`${link.label}-${link.url}`} target="_blank" rel="noreferrer">
            <span>{link.label}</span>
            <strong>Open official site ↗</strong>
          </a>
        ))}
      </div>
    </section>
  );
}

function CatalogPage() {
  const processes = listProcesses();
  const live = processes.filter((entry) => entry.status === "live");
  const planned = processes.filter((entry) => entry.status === "coming_soon");

  return (
    <main className="shell catalog-shell">
      <Brand />
      <section className="catalog-hero">
        <p className="eyebrow">GLOBAL OFFICIAL-PROCESS NAVIGATOR</p>
        <h1>Choose the process. <em>Verify the path first.</em></h1>
        <p className="lead">Official Checklist turns fragmented government instructions into source-backed decision paths, blockers and personalized checklists before you pay, book or submit.</p>
      </section>

      <section className="catalog-section">
        <div className="section-heading"><div><p className="eyebrow">AVAILABLE NOW</p><h2>Verified workflows</h2></div><span>{live.length} live</span></div>
        <div className="process-grid">
          {live.map((entry) => (
            <ProcessAnchor entry={entry} className="process-card live" key={entry.id}>
              <div className="process-meta"><span className="country-badge">{entry.country_code}</span><span>{entry.service}</span><span className="status-dot">Live</span></div>
              <h3>{entry.title}</h3>
              <p>{entry.summary}</p>
              <div className="process-footer"><span>For applicants in {entry.applicant_country}</span><strong>Open preflight →</strong></div>
            </ProcessAnchor>
          ))}
        </div>
      </section>

      {planned.length > 0 && (
        <section className="catalog-section planned-section">
          <div className="section-heading"><div><p className="eyebrow">EXPANSION QUEUE</p><h2>Next official processes</h2></div></div>
          <div className="process-grid">
            {planned.map((entry) => (
              <ProcessAnchor entry={entry} className="process-card planned" key={entry.id}>
                <div className="process-meta"><span className="country-badge muted">{entry.country_code}</span><span>{entry.service}</span><span className="coming-badge">Coming soon</span></div>
                <h3>{entry.title}</h3>
                <p>{entry.summary}</p>
              </ProcessAnchor>
            ))}
          </div>
        </section>
      )}

      <section className="notice"><strong>Independent guidance.</strong> Every live workflow must be backed by current authoritative source nodes. If a rule is stale, incomplete or conflicting, the engine should stop or request authoritative confirmation rather than guess.</section>
    </main>
  );
}

function QuestionControl({ question, value, onChange, labelOption }: { question: Question; value: unknown; onChange: (value: unknown) => void; labelOption: (value: string) => string }) {
  if (question.type === "boolean") {
    return <div className="choice-grid two">{[true, false].map((choice) => <button key={String(choice)} className={`choice ${value === choice ? "selected" : ""}`} onClick={() => onChange(choice)} type="button">{choice ? "Yes" : "No"}</button>)}</div>;
  }
  if (question.type === "select") {
    return <div className="choice-grid">{question.options?.map((option) => <button key={option} className={`choice ${value === option ? "selected" : ""}`} onClick={() => onChange(option)} type="button">{labelOption(option)}</button>)}</div>;
  }
  if (question.type === "multiselect") {
    const selected = Array.isArray(value) ? value as string[] : [];
    return <div className="choice-grid">{question.options?.map((option) => {
      const active = selected.includes(option);
      return <button key={option} className={`choice ${active ? "selected" : ""}`} onClick={() => {
        if (option === "none") return onChange(active ? [] : ["none"]);
        const withoutNone = selected.filter((item) => item !== "none");
        onChange(active ? withoutNone.filter((item) => item !== option) : [...withoutNone, option]);
      }} type="button">{labelOption(option)}</button>;
    })}</div>;
  }
  if (question.type === "number") {
    return <input className="text-input" type="number" min={question.min} value={typeof value === "number" ? value : ""} onChange={(event) => onChange(event.target.value === "" ? undefined : Number(event.target.value))} placeholder="Enter value" />;
  }
  return <input className="text-input" type="text" value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} placeholder="Enter value" autoCapitalize="off" />;
}

function StatusBadge({ status }: { status: string }) {
  const label = status === "READY" ? "Ready for next step" : status === "NOT_READY" ? "Stop — fix blockers" : "Official confirmation needed";
  return <span className={`status ${status.toLowerCase()}`}>{label}</span>;
}

function ProcessRunner({ process }: { process: ProcessModule }) {
  const [answers, setAnswers] = useState<PassportAnswers>(() => loadAnswers(process.storageKey));
  const [started, setStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const questions = useMemo(() => visibleQuestions(process.questionnaire.questions, answers), [process, answers]);
  const current = questions[Math.min(index, Math.max(0, questions.length - 1))];
  const presentation = useMemo(() => applySourceFreshness(process.entry, process.present(process.evaluate(answers))), [process, answers]);
  const startingLinks = useMemo(() => landingOfficialLinks(process), [process]);
  const relevantLinks = useMemo(() => resultOfficialLinks(process, answers, presentation), [process, answers, presentation]);

  function updateAnswer(value: unknown) {
    if (!current) return;
    const next = clearHiddenAnswers(process.questionnaire.questions, { ...answers, [current.id]: value } as PassportAnswers);
    setAnswers(next);
    saveAnswers(process.storageKey, next);
  }
  function next() {
    if (!current) return;
    const required = current.required || Boolean(current.required_when);
    if (required && !isAnswered(current, answers)) return;
    if (index >= questions.length - 1) setShowResult(true); else setIndex((value) => value + 1);
  }
  function reset() {
    localStorage.removeItem(process.storageKey);
    setAnswers({}); setIndex(0); setShowResult(false); setStarted(false);
  }
  async function copyJson() {
    await navigator.clipboard.writeText(JSON.stringify(presentation.rawResult, null, 2));
    setCopied(true); window.setTimeout(() => setCopied(false), 1500);
  }

  if (!started) {
    return (
      <main className="shell">
        <Brand subtitle={`${process.entry.country_name} · ${process.entry.service}`} />
        <button className="back-to-catalog" onClick={() => navigate("")} type="button">← All official processes</button>
        <section className="hero card">
          <p className="eyebrow">{process.eyebrow}</p>
          <h1>Verify the application path <em>before</em> the appointment.</h1>
          <p className="lead">{process.entry.summary}</p>
          <div className="promise-grid"><div><strong>1</strong><span>Classify the process</span></div><div><strong>2</strong><span>Detect blockers</span></div><div><strong>3</strong><span>Generate your checklist</span></div></div>
          <button className="primary" onClick={() => setStarted(true)} type="button">Start preflight</button>
          {Object.keys(answers).length > 0 && <button className="link-button" onClick={reset} type="button">Clear saved answers</button>}
        </section>
        <OfficialLinksPanel
          links={startingLinks}
          title="Official starting points"
          copy="Already know your next step? Open the government or contracted-service portal directly. If you are not sure which link applies, run the preflight first."
          compact
        />
        <section className="notice"><strong>Independent guidance.</strong> Official sources control whenever guidance changes or conflicts. Answers stay in this browser for this prototype.</section>
      </main>
    );
  }

  if (showResult) {
    return (
      <main className="shell result-shell">
        <header className="brandbar no-print"><button className="link-button" onClick={() => setShowResult(false)} type="button">← Review answers</button><div className="header-actions"><button className="link-button" onClick={() => navigate("")} type="button">All processes</button><button className="link-button" onClick={reset} type="button">Start over</button></div></header>
        <section className="result-header card"><div><p className="eyebrow">PREFLIGHT RESULT</p><h1>{presentation.title}</h1><p>{presentation.subtitle}</p></div><StatusBadge status={presentation.status} /></section>
        {presentation.blockers.length > 0 && <section className="result-section blocker-section"><h2>Blocking issues</h2><p>Do not continue to payment, appointment, mailing or submission until these are fixed.</p><ul>{presentation.blockers.map((item) => <li key={item}>{item}</li>)}</ul></section>}
        {presentation.warnings.length > 0 && <section className="result-section warning-section"><h2>Needs attention</h2><ul>{presentation.warnings.map((item) => <li key={item}>{item}</li>)}</ul></section>}
        <section className="summary-grid">{presentation.summary.map((item, idx) => <div className={`mini-card ${idx === 4 ? "wide" : ""}`} key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</section>
        <section className="result-section"><h2>Required checklist</h2><ol className="checklist">{presentation.requiredItems.map((item) => <li key={item}>{item}</li>)}</ol></section>
        {presentation.conditionalItems.length > 0 && <section className="result-section"><h2>Conditional documents</h2><ul className="checklist">{presentation.conditionalItems.map((item) => <li key={item}>{item}</li>)}</ul></section>}
        <section className="next-step card"><p className="eyebrow">NEXT STEP</p><h2>{presentation.nextStep}</h2></section>
        <OfficialLinksPanel
          links={relevantLinks}
          title="Continue on official sites"
          copy={`These links are filtered to the route above. Source/rule freshness was last verified ${presentation.sourcesVerified}; recheck the official instructions before payment, appointment or submission.`}
        />
        <div className="action-row no-print"><button className="primary" onClick={() => window.print()} type="button">Print / Save PDF</button><button className="secondary" onClick={copyJson} type="button">{copied ? "Copied" : "Copy result JSON"}</button></div>
        <p className="footer-note">Independent guidance only. Official sources remain authoritative.</p>
      </main>
    );
  }

  const progress = questions.length ? Math.round(((index + 1) / questions.length) * 100) : 0;
  const required = current?.required || Boolean(current?.required_when);
  const canContinue = current ? !required || isAnswered(current, answers) : false;

  return (
    <main className="shell wizard-shell">
      <header className="brandbar"><button className="brand-home compact" onClick={() => navigate("")} type="button"><span><strong>Official Checklist</strong><small>{process.entry.short_title}</small></span></button><button className="link-button" onClick={reset} type="button">Reset</button></header>
      <div className="progress-track"><span style={{ width: `${progress}%` }} /></div><p className="progress-copy">Question {index + 1} of {questions.length}</p>
      {current && <section className="question-card card"><p className="eyebrow">PROCESS FACT</p><h1>{process.questionLabels[current.id] ?? current.id}</h1>{process.questionHints?.[current.id] && <p className="helper">{process.questionHints[current.id]}</p>}<QuestionControl question={current} value={answers[current.id]} onChange={updateAnswer} labelOption={process.labelOption} /><div className="nav-row"><button className="secondary" onClick={() => index === 0 ? setStarted(false) : setIndex((value) => Math.max(0, value - 1))} type="button">Back</button><button className="primary" disabled={!canContinue} onClick={next} type="button">{index >= questions.length - 1 ? "Run preflight" : "Continue"}</button></div></section>}
      <p className="footer-note">Answers are stored only in this browser. No official document is uploaded.</p>
    </main>
  );
}

function ComingSoon({ entry }: { entry: ProcessCatalogEntry }) {
  return <main className="shell"><Brand /><button className="back-to-catalog" onClick={() => navigate("")} type="button">← All official processes</button><section className="hero card"><p className="eyebrow">{entry.country_name.toUpperCase()} · {entry.service.toUpperCase()}</p><h1>{entry.title}</h1><p className="lead">{entry.summary}</p><span className="coming-large">OKF bundle not published yet</span></section></main>;
}

function NotFound() {
  return <main className="shell"><Brand /><section className="hero card"><p className="eyebrow">PROCESS NOT FOUND</p><h1>This official process is not in the catalog.</h1><p className="lead">Return to the process catalog and choose a verified workflow.</p><button className="primary" onClick={() => navigate("")} type="button">Open catalog</button></section></main>;
}

export default function App() {
  const [route, setRoute] = useState(() => currentRoute());
  useEffect(() => {
    const onPopState = () => setRoute(currentRoute());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  if (!route) return <CatalogPage />;
  const entry = getProcessBySlug(route);
  if (!entry) return <NotFound />;
  if (entry.status !== "live") return <ComingSoon entry={entry} />;
  const process = getProcessModule(entry.id);
  if (!process) return <NotFound />;
  return <ProcessRunner key={entry.id} process={process} />;
}
