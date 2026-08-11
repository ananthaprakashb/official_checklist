import { useMemo, useState } from "react";
import questionnaireJson from "../data/india/us/passport/reissue/questionnaire.v2.json";
import { clearHiddenAnswers, isAnswered, visibleQuestions } from "./core/questionnaire";
import { evaluatePassport } from "./core/evaluatePassport";
import type { PassportAnswers, Question, Questionnaire } from "./types";
import { labelOption, QUESTION_LABELS } from "./uiText";
import "./styles.css";

const questionnaire = questionnaireJson as Questionnaire;
const STORAGE_KEY = `official-checklist:${questionnaire.id}:answers`;

function loadAnswers(): PassportAnswers {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAnswers(answers: PassportAnswers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
}

function QuestionControl({ question, value, onChange }: { question: Question; value: unknown; onChange: (value: unknown) => void }) {
  if (question.type === "boolean") {
    return (
      <div className="choice-grid two">
        {[true, false].map((choice) => (
          <button key={String(choice)} className={`choice ${value === choice ? "selected" : ""}`} onClick={() => onChange(choice)} type="button">
            {choice ? "Yes" : "No"}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === "select") {
    return (
      <div className="choice-grid">
        {question.options?.map((option) => (
          <button key={option} className={`choice ${value === option ? "selected" : ""}`} onClick={() => onChange(option)} type="button">
            {labelOption(option)}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === "multiselect") {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div className="choice-grid">
        {question.options?.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              className={`choice ${active ? "selected" : ""}`}
              onClick={() => {
                if (option === "none") return onChange(active ? [] : ["none"]);
                const withoutNone = selected.filter((item) => item !== "none");
                onChange(active ? withoutNone.filter((item) => item !== option) : [...withoutNone, option]);
              }}
              type="button"
            >
              {labelOption(option)}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "number") {
    return (
      <input
        className="text-input"
        type="number"
        min={question.min}
        value={typeof value === "number" ? value : ""}
        onChange={(event) => onChange(event.target.value === "" ? undefined : Number(event.target.value))}
        placeholder="Enter age"
      />
    );
  }

  return (
    <input
      className="text-input"
      type="text"
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder={question.id === "government_selected_mission" ? "e.g. San Francisco" : "Enter value"}
      autoCapitalize="off"
    />
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = status === "READY" ? "Ready for next step" : status === "NOT_READY" ? "Stop — fix blockers" : "Official confirmation needed";
  return <span className={`status ${status.toLowerCase()}`}>{label}</span>;
}

export default function App() {
  const [answers, setAnswers] = useState<PassportAnswers>(() => loadAnswers());
  const [started, setStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const questions = useMemo(() => visibleQuestions(questionnaire.questions, answers), [answers]);
  const current = questions[Math.min(index, Math.max(0, questions.length - 1))];
  const result = useMemo(() => evaluatePassport(answers), [answers]);

  function updateAnswer(value: unknown) {
    if (!current) return;
    const next = clearHiddenAnswers(questionnaire.questions, { ...answers, [current.id]: value } as PassportAnswers);
    setAnswers(next);
    saveAnswers(next);
  }

  function next() {
    if (!current) return;
    const required = current.required || Boolean(current.required_when);
    if (required && !isAnswered(current, answers)) return;
    if (index >= questions.length - 1) setShowResult(true);
    else setIndex((value) => value + 1);
  }

  function back() {
    if (index === 0) setStarted(false);
    else setIndex((value) => Math.max(0, value - 1));
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setAnswers({});
    setIndex(0);
    setShowResult(false);
    setStarted(false);
  }

  async function copyJson() {
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  if (!started) {
    return (
      <main className="shell">
        <header className="brandbar">
          <div className="brand-mark">OC</div>
          <div>
            <strong>Official Checklist</strong>
            <span>Verified process preflight</span>
          </div>
        </header>

        <section className="hero card">
          <p className="eyebrow">INDIA · U.S. · PASSPORT RE-ISSUE · CURRENT SF/LA SERVICING TRANSITION</p>
          <h1>Verify the application path <em>before</em> the appointment.</h1>
          <p className="lead">
            Answer a short set of questions. The evaluator checks application type, jurisdiction, re-issue reasons, Tatkaal eligibility,
            fee branch, documents, Government-form selections and VFS alignment.
          </p>
          <div className="promise-grid">
            <div><strong>1</strong><span>Classify the process</span></div>
            <div><strong>2</strong><span>Detect blockers</span></div>
            <div><strong>3</strong><span>Generate your checklist</span></div>
          </div>
          <button className="primary" onClick={() => setStarted(true)} type="button">Start preflight</button>
          {Object.keys(answers).length > 0 && <button className="link-button" onClick={reset} type="button">Clear saved answers</button>}
        </section>

        <section className="notice">
          <strong>Independent guidance.</strong> Official Checklist is not affiliated with the Government of India, CGI San Francisco, CGI Los Angeles or VFS Global.
          Official sources control whenever guidance changes or conflicts.
        </section>
      </main>
    );
  }

  if (showResult) {
    return (
      <main className="shell result-shell">
        <header className="brandbar no-print">
          <button className="link-button" onClick={() => setShowResult(false)} type="button">← Review answers</button>
          <button className="link-button" onClick={reset} type="button">Start over</button>
        </header>

        <section className="result-header card">
          <div>
            <p className="eyebrow">PREFLIGHT RESULT</p>
            <h1>{result.application_type === "reissue" ? "Passport Re-issue" : "Fresh Passport"}</h1>
            <p>{labelOption(result.applicant_category)} · {labelOption(result.jurisdiction)} · Sources verified {result.sources_verified}</p>
          </div>
          <StatusBadge status={result.status} />
        </section>

        {result.blockers.length > 0 && (
          <section className="result-section blocker-section">
            <h2>Blocking issues</h2>
            <p>Do not continue to payment, appointment, mailing or submission until these are fixed.</p>
            <ul>{result.blockers.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        )}

        {result.warnings.length > 0 && (
          <section className="result-section warning-section">
            <h2>Needs attention</h2>
            <ul>{result.warnings.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        )}

        <section className="summary-grid">
          <div className="mini-card"><span>Application</span><strong>{labelOption(result.application_type)}</strong></div>
          <div className="mini-card"><span>Applicant</span><strong>{labelOption(result.applicant_category)}</strong></div>
          <div className="mini-card"><span>Processing</span><strong>{labelOption(result.processing)}</strong></div>
          <div className="mini-card"><span>Booklet</span><strong>{labelOption(result.booklet)}</strong></div>
          <div className="mini-card wide"><span>Reason(s)</span><strong>{result.reissue_reasons.length ? result.reissue_reasons.map(labelOption).join(", ") : "Not resolved"}</strong></div>
          <div className="mini-card"><span>Current fee branch</span><strong>{result.fee ? `$${result.fee.current_total}` : "Confirm first"}</strong></div>
        </section>

        <section className="result-section">
          <h2>Required checklist</h2>
          <ol className="checklist">{result.required_documents.map((item) => <li key={item}>{item}</li>)}</ol>
        </section>

        {result.conditional_documents.length > 0 && (
          <section className="result-section">
            <h2>Conditional documents</h2>
            <ul className="checklist">{result.conditional_documents.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        )}

        <section className="next-step card">
          <p className="eyebrow">NEXT STEP</p>
          <h2>{result.next_step}</h2>
        </section>

        <section className="source-panel">
          <h2>Official-source layer</h2>
          <p>The decision graph is backed by current CGI San Francisco and VFS Global source nodes. Recheck source freshness before final submission.</p>
          <div className="source-links">
            <a href="https://www.cgisf.gov.in/page/passport-related-services/" target="_blank" rel="noreferrer">CGI San Francisco passport services ↗</a>
            <a href="https://www.cgisf.gov.in/page.php?id=consulates-in-us" target="_blank" rel="noreferrer">Current U.S. consular jurisdictions ↗</a>
            <a href="https://services.vfsglobal.com/usa/en/ind/apply-passport" target="_blank" rel="noreferrer">VFS India passport services ↗</a>
          </div>
        </section>

        <div className="action-row no-print">
          <button className="primary" onClick={() => window.print()} type="button">Print / Save PDF</button>
          <button className="secondary" onClick={copyJson} type="button">{copied ? "Copied" : "Copy result JSON"}</button>
        </div>

        <p className="footer-note">Independent guidance only. Official sources remain authoritative.</p>
      </main>
    );
  }

  const progress = questions.length ? Math.round(((index + 1) / questions.length) * 100) : 0;
  const required = current?.required || Boolean(current?.required_when);
  const canContinue = current ? !required || isAnswered(current, answers) : false;

  return (
    <main className="shell wizard-shell">
      <header className="brandbar">
        <div>
          <strong>Official Checklist</strong>
          <span>Indian passport preflight</span>
        </div>
        <button className="link-button" onClick={reset} type="button">Reset</button>
      </header>

      <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
      <p className="progress-copy">Question {index + 1} of {questions.length}</p>

      {current && (
        <section className="question-card card">
          <p className="eyebrow">PROCESS FACT</p>
          <h1>{QUESTION_LABELS[current.id] ?? current.id}</h1>
          {current.id === "government_selected_mission" && <p className="helper">Use the mission exactly as shown on your submitted Government application.</p>}
          {current.id === "change_existing_particulars" && <p className="helper">Select every change that applies. Do not hide a change to get a simpler checklist.</p>}
          {current.id === "minor_15_17_validity" && <p className="helper">CGI says applicants aged 15–17 may request a 10-year passport or validity until age 18. Fee handling differs, so select the exact application branch.</p>}
          <QuestionControl question={current} value={answers[current.id]} onChange={updateAnswer} />

          <div className="nav-row">
            <button className="secondary" onClick={back} type="button">Back</button>
            <button className="primary" disabled={!canContinue} onClick={next} type="button">
              {index >= questions.length - 1 ? "Run preflight" : "Continue"}
            </button>
          </div>
        </section>
      )}

      <p className="footer-note">Answers are stored only in this browser for this prototype. No passport document is uploaded.</p>
    </main>
  );
}
