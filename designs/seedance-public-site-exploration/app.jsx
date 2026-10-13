const { useEffect, useMemo, useRef, useState } = React;

function clampModelState(model, state) {
  const resolution = model.resolutions.includes(state.resolution)
    ? state.resolution
    : model.resolutions[0];
  const duration = model.durations.includes(Number(state.duration))
    ? Number(state.duration)
    : model.durations[0];
  const scene = model.scenes.includes(state.scene) ? state.scene : model.scenes[0];
  return {
    resolution,
    duration,
    scene,
    audio: model.audio ? state.audio : false
  };
}

function calculatePrototypeCredits(model, resolution, duration, audio) {
  const rates = audio && model.audioCredit ? model.audioCredit : model.credit;
  return (rates[resolution] || 0) * Number(duration);
}

function Mark({ className = "" }) {
  return (
    <span className={`brand-mark ${className}`} aria-hidden="true">
      <span></span><span></span><span></span>
    </span>
  );
}

function PrototypeControls({ direction, setDirection, page, setPage, locale, setLocale, open, setOpen, copy }) {
  return (
    <aside className={`prototype-controls ${open ? "is-open" : "is-closed"}`} aria-label="Prototype controls">
      <button className="prototype-handle" type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="handle-mark" aria-hidden="true">＋</span>
        <span>{open ? copy.toolbar.hide : copy.toolbar.show}</span>
      </button>
      {open && (
        <div className="prototype-panel">
          <div className="prototype-panel-head">
            <div>
              <strong>Seedance AI</strong>
              <span>Public-site prototype</span>
            </div>
            <span className="prototype-badge">RESEARCH</span>
          </div>

          <fieldset>
            <legend>{copy.toolbar.direction}</legend>
            <div className="direction-options">
              {["a", "b", "c"].map((key) => (
                <button key={key} type="button" className={direction === key ? "is-selected" : ""} onClick={() => setDirection(key)} aria-pressed={direction === key}>
                  <span>{key.toUpperCase()}</span>
                  <strong>{copy.direction[key].name}</strong>
                  <small>{copy.direction[key].note}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="control-row">
            <fieldset>
              <legend>{copy.toolbar.page}</legend>
              <div className="segmented compact">
                <button type="button" className={page === "home" ? "is-selected" : ""} onClick={() => setPage("home")}>{copy.toolbar.home}</button>
                <button type="button" className={page === "guide" ? "is-selected" : ""} onClick={() => setPage("guide")}>{copy.toolbar.guide}</button>
              </div>
            </fieldset>
            <fieldset>
              <legend>{copy.toolbar.language}</legend>
              <div className="segmented compact">
                <button type="button" className={locale === "en" ? "is-selected" : ""} onClick={() => setLocale("en")}>EN</button>
                <button type="button" className={locale === "zh" ? "is-selected" : ""} onClick={() => setLocale("zh")}>中文</button>
              </div>
            </fieldset>
          </div>
        </div>
      )}
    </aside>
  );
}

function SiteHeader({ copy, page, setPage, locale, setLocale }) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" onClick={(event) => { event.preventDefault(); setPage("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
        <Mark />
        <span>Seedance AI</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#generator">{copy.nav.create}</a>
        <a href="#models">{copy.nav.models}</a>
        <button type="button" onClick={() => { setPage("guide"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{copy.nav.guides}</button>
        <a href="#pricing">{copy.nav.pricing}</a>
      </nav>
      <div className="header-actions">
        <button className="language-toggle" type="button" onClick={() => setLocale(locale === "en" ? "zh" : "en")} aria-label="Switch language">
          {locale === "en" ? "中" : "EN"}
        </button>
        <button className="sign-in" type="button">{copy.nav.signIn}</button>
      </div>
    </header>
  );
}

function StatusLine({ children }) {
  return (
    <div className="status-line">
      <span className="status-dot" aria-hidden="true"></span>
      <span>{children}</span>
    </div>
  );
}

function FieldLabel({ children, meta }) {
  return (
    <span className="field-label">
      <span>{children}</span>
      {meta && <span>{meta}</span>}
    </span>
  );
}

function Segmented({ options, value, onChange, getLabel = (item) => item, disabled = false }) {
  return (
    <div className="segmented" role="group">
      {options.map((item) => (
        <button key={item} type="button" className={value === item ? "is-selected" : ""} onClick={() => onChange(item)} aria-pressed={value === item} disabled={disabled}>
          {getLabel(item)}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button className="switch-row" type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} disabled={disabled}>
      <span className="switch-track"><span></span></span>
      <span>{label}</span>
    </button>
  );
}

function OutputStage({ copy, status, model, resolution, duration, credits }) {
  return (
    <section
      className={`output-stage is-${status}`}
      aria-labelledby="output-title"
      aria-live="polite"
      aria-busy={status === "loading"}
      aria-atomic="true"
    >
      <div className="output-head">
        <div>
          <FieldLabel meta={copy.generator.prototype}>{copy.generator.output}</FieldLabel>
          <strong id="output-title">{model.label}</strong>
        </div>
        <span className="timecode">00:00:{String(duration).padStart(2, "0")}:00</span>
      </div>

      <div className="projection-frame">
        <div className="frame-guides" aria-hidden="true"><span></span><span></span></div>
        {status === "loading" ? (
          <div className="stage-message loading-message" role="status">
            <span className="progress-orbit" aria-hidden="true"></span>
            <strong>{copy.generator.generating}</strong>
            <span>{model.label} · {resolution} · {duration}s</span>
          </div>
        ) : status === "success" ? (
          <div className="stage-message success-message" role="status">
            <span className="slate-check" aria-hidden="true">✓</span>
            <strong>{copy.generator.outputDone}</strong>
            <span>{copy.generator.outputDoneHint}</span>
          </div>
        ) : (
          <div className="stage-message">
            <Mark className="stage-mark" />
            <strong>{copy.generator.outputEmpty}</strong>
            <span>{copy.generator.outputHint}</span>
          </div>
        )}
        <div className="frame-meta">
          <span>16:9</span><span>{resolution}</span><span>{credits} CR</span>
        </div>
      </div>

      <div className="output-foot">
        <span>{status === "success" ? copy.generator.outputDone : copy.generator.ready}</span>
        <span>{model.maker} · {duration}s · {resolution}</span>
      </div>
    </section>
  );
}

function CostLedger({ copy, model, scene, resolution, duration, audio, credits }) {
  const rows = [
    [copy.generator.model, model.label],
    [copy.generator.scene, copy.generator.scenes[scene]],
    [copy.generator.duration, `${duration}s`],
    [copy.generator.resolution, resolution],
    [copy.generator.audio, audio ? "ON" : "OFF"],
    [copy.generator.cost, `${credits} CR`]
  ];
  return (
    <aside className="cost-ledger" aria-label="Live cost and settings ledger">
      <FieldLabel>LIVE LEDGER</FieldLabel>
      <div className="ledger-status"><span></span>{copy.generator.ready}</div>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
        ))}
      </dl>
      <p>{copy.hero.disclaimer}</p>
    </aside>
  );
}

function Generator({ copy, locale, direction, compact = false }) {
  const [modelId, setModelId] = useState("seedance-2.5");
  const [scene, setScene] = useState("text");
  const [resolution, setResolution] = useState("480p");
  const [duration, setDuration] = useState(5);
  const [audio, setAudio] = useState(true);
  const [prompt, setPrompt] = useState(copy.generator.defaultPrompt);
  const [status, setStatus] = useState("ready");
  const timerRef = useRef(null);
  const model = seedanceModels.find((item) => item.id === modelId) || seedanceModels[0];

  useEffect(() => {
    setPrompt(copy.generator.defaultPrompt);
  }, [locale]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  useEffect(() => {
    const next = clampModelState(model, { scene, resolution, duration, audio });
    setScene(next.scene);
    setResolution(next.resolution);
    setDuration(next.duration);
    setAudio(next.audio);
    setStatus("ready");
  }, [modelId]);

  const credits = useMemo(
    () => calculatePrototypeCredits(model, resolution, duration, audio),
    [model, resolution, duration, audio]
  );

  const handleGenerate = () => {
    window.clearTimeout(timerRef.current);
    if (!prompt.trim()) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    timerRef.current = window.setTimeout(() => setStatus("success"), 1250);
  };

  return (
    <div id="generator" className={`generator-shell direction-${direction} ${compact ? "is-compact" : ""}`}>
      <div className="generator-titlebar">
        <div>
          <span className="slate-number">A01</span>
          <div><strong>{copy.generator.title}</strong><span>{copy.generator.project}</span></div>
        </div>
        <div className="generator-readout"><span>{copy.generator.ready}</span><strong>{credits} CR</strong></div>
      </div>

      <div className="generator-grid">
        <form className="generator-form" onSubmit={(event) => { event.preventDefault(); handleGenerate(); }}>
          <div className="form-block workflow-block">
            <FieldLabel>{copy.generator.scene}</FieldLabel>
            <Segmented options={model.scenes} value={scene} onChange={setScene} getLabel={(item) => copy.generator.scenes[item]} />
          </div>

          <label className={`form-block prompt-block ${status === "error" ? "has-error" : ""}`}>
            <FieldLabel meta={`${prompt.length}/4000`}>{copy.generator.prompt}</FieldLabel>
            <textarea value={prompt} onChange={(event) => { setPrompt(event.target.value); if (status === "error") setStatus("ready"); }} placeholder={copy.generator.placeholder} rows={compact ? 4 : 5}></textarea>
            {status === "error" && <span className="field-error" role="alert">{copy.generator.validation}</span>}
          </label>

          {scene !== "text" && (
            <div className="form-block reference-block">
              <FieldLabel>{copy.generator.reference}</FieldLabel>
              <button type="button" className="upload-zone">
                <span className="upload-plus">＋</span>
                <span><strong>{copy.generator.addReference}</strong><small>{copy.generator.referenceHelp}</small></span>
              </button>
            </div>
          )}

          <div className="form-block settings-block">
            <label>
              <FieldLabel>{copy.generator.model}</FieldLabel>
              <select value={modelId} onChange={(event) => setModelId(event.target.value)}>
                {seedanceModels.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <div>
              <FieldLabel>{copy.generator.resolution}</FieldLabel>
              <Segmented options={model.resolutions} value={resolution} onChange={setResolution} />
            </div>
            <div>
              <FieldLabel>{copy.generator.duration}</FieldLabel>
              <Segmented options={model.durations} value={duration} onChange={setDuration} getLabel={(item) => `${item}s`} />
            </div>
            <div>
              <FieldLabel>{copy.generator.aspect}</FieldLabel>
              <Segmented options={["16:9", "9:16", "1:1"]} value="16:9" onChange={() => {}} />
            </div>
          </div>

          <div className="form-actions">
            <Toggle checked={audio} onChange={setAudio} label={copy.generator.audio} disabled={!model.audio || status === "loading"} />
            <div className="cost-readout"><span>{copy.generator.cost}</span><strong>{credits} {copy.generator.credits}</strong></div>
            <button className="generate-button" data-state={status} type="submit" disabled={status === "loading"}>
              <span>{status === "loading" ? copy.generator.generating : copy.generator.generate}</span><span aria-hidden="true">→</span>
            </button>
          </div>
        </form>

        <OutputStage copy={copy} status={status} model={model} resolution={resolution} duration={duration} credits={credits} />
        {direction === "c" && <CostLedger copy={copy} model={model} scene={scene} resolution={resolution} duration={duration} audio={audio} credits={credits} />}
      </div>
    </div>
  );
}

function Hero({ copy, locale, direction }) {
  return (
    <section className="home-hero" id="top">
      <div className="hero-copy">
        <StatusLine>{copy.hero.status}</StatusLine>
        <h1>{copy.hero.title}</h1>
        <p>{copy.hero.body}</p>
        <a className="text-link" href="#models">{copy.hero.guide}<span aria-hidden="true">↗</span></a>
      </div>
      <Generator copy={copy} locale={locale} direction={direction} />
      <div className="hero-facts">
        {copy.hero.facts.map(([title, body]) => <div key={title}><strong>{title}</strong><span>{body}</span></div>)}
      </div>
      <p className="hero-disclaimer">{copy.hero.disclaimer}</p>
    </section>
  );
}

function SectionIntro({ label, title, body, dark = false }) {
  return (
    <header className={`section-intro ${dark ? "is-dark" : ""}`}>
      {body && <span className="section-label">{label}</span>}
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </header>
  );
}

function ProofSection({ copy }) {
  return (
    <section className="proof-section page-section">
      <SectionIntro label={copy.proof.label} title={copy.proof.title} body={copy.proof.body} />
      <div className="proof-ledger">
        {copy.proof.items.map(([number, title, body]) => (
          <article key={number}>
            <span>{number}</span><h3>{title}</h3><p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ModelRoster({ copy, setPage, direction }) {
  const items = seedanceModels.filter((item) => ["kling-3.0", "wan-2.7", "minimax-h3", "grok-imagine-video-1.5"].includes(item.id));
  if (direction === "c") {
    return (
      <section className="model-ledger-section page-section" id="models">
        <SectionIntro label={copy.roster.label} title={copy.roster.title} />
        <div className="model-table" role="table" aria-label="Current model comparison">
          <div className="model-table-head" role="row"><span>MODEL</span><span>WORKFLOW</span><span>OUTPUT</span><span>STATUS</span><span></span></div>
          {items.map((item) => (
            <div className="model-table-row" role="row" key={item.id}>
              <strong>{item.label}<small>{item.maker}</small></strong>
              <span>{item.scenes.length} modes · {item.durations[0]}–{item.durations[item.durations.length - 1]}s</span>
              <span>{item.resolutions.join(" / ")}</span>
              <span>{item.status}</span>
              <button type="button" onClick={() => { setPage("guide"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{copy.roster.open} ↗</button>
            </div>
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className="model-roster page-section" id="models">
      <SectionIntro label={copy.roster.label} title={copy.roster.title} dark />
      <div className="model-strip">
        {items.map((item, index) => (
          <article key={item.id}>
            <div className="model-card-head"><span>0{index + 1}</span><span>{item.status}</span></div>
            <h3>{item.label}</h3><p>{copy.roster.items[item.id]}</p>
            <dl><div><dt>TIME</dt><dd>{item.durations[0]}–{item.durations[item.durations.length - 1]}s</dd></div><div><dt>OUTPUT</dt><dd>{item.resolutions.join(" / ")}</dd></div></dl>
            <button type="button" onClick={() => { setPage("guide"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{copy.roster.open}<span aria-hidden="true">↗</span></button>
          </article>
        ))}
      </div>
    </section>
  );
}

function ContactSheet({ copy }) {
  return (
    <section className="contact-section page-section">
      <SectionIntro label={copy.contact.label} title={copy.contact.title} />
      <div className="contact-sheet">
        {copy.contact.frames.map(([shot, title, meta], index) => (
          <figure key={shot}>
            <div className={`contact-frame frame-${index + 1}`}>
              <span className="frame-crosshair" aria-hidden="true"></span>
              <span>{title}</span>
            </div>
            <figcaption><strong>{shot}</strong><span>{meta}</span></figcaption>
          </figure>
        ))}
      </div>
      <p className="contact-note">{copy.contact.note}</p>
    </section>
  );
}

function PromptSection({ copy }) {
  return (
    <section className="prompt-section page-section">
      <SectionIntro label={copy.prompt.label} title={copy.prompt.title} body={copy.prompt.body} dark />
      <div className="prompt-timeline">
        {copy.prompt.rows.map(([time, title, body]) => <article key={time}><time>{time}</time><h3>{title}</h3><p>{body}</p></article>)}
      </div>
    </section>
  );
}

function HomePage({ copy, locale, direction, setPage }) {
  return (
    <main>
      <Hero copy={copy} locale={locale} direction={direction} />
      {direction === "b" ? <ContactSheet copy={copy} /> : <ProofSection copy={copy} />}
      <ModelRoster copy={copy} setPage={setPage} direction={direction} />
      {direction === "b" ? <ProofSection copy={copy} /> : <ContactSheet copy={copy} />}
      <PromptSection copy={copy} />
    </main>
  );
}

function CapabilityTable({ copy }) {
  return (
    <section className="capability-section page-section">
      <SectionIntro label={copy.guide.availability} title={copy.proof.title} body={copy.proof.body} />
      <div className="capability-table">
        <div className="capability-head"><span>CONTROL</span><span>{copy.guide.availability}</span><span>{copy.guide.upstream}</span></div>
        {copy.guide.rows.map(([label, product, upstream]) => <div className="capability-row" key={label}><strong>{label}</strong><span>{product}</span><span>{upstream}</span></div>)}
      </div>
    </section>
  );
}

function GuidePage({ copy, locale, direction }) {
  return (
    <main className="guide-page" id="top">
      <section className="guide-hero">
        <div className="guide-copy">
          <StatusLine>{copy.guide.status}</StatusLine>
          <h1>{copy.guide.title}</h1>
          <p>{copy.guide.body}</p>
          <a className="primary-link" href="#generator">{copy.guide.cta}<span>→</span></a>
          <small>{copy.guide.source}</small>
        </div>
        <aside className="guide-call-sheet">
          <FieldLabel>CALL SHEET · S25</FieldLabel>
          <div><span>MODEL</span><strong>Seedance 2.5</strong></div>
          <div><span>WORKFLOW</span><strong>Text · Image · Reference</strong></div>
          <div><span>PRODUCT OUTPUT</span><strong>480p · 720p</strong></div>
          <div><span>DURATION</span><strong>5–30s</strong></div>
          <div><span>AUDIO</span><strong>Optional</strong></div>
        </aside>
      </section>
      <section className="guide-generator page-section"><Generator copy={copy} locale={locale} direction={direction} compact /></section>
      <CapabilityTable copy={copy} />
      <PromptSection copy={copy} />
    </main>
  );
}

function SiteFooter({ copy }) {
  return (
    <footer className="site-footer" id="pricing">
      <div><Mark /><p>{copy.footer.statement}</p></div>
      <div><strong>Seedance AI</strong><span>{copy.footer.legal}</span><span>© 2026</span></div>
    </footer>
  );
}

function App() {
  const [direction, setDirection] = useState(() => localStorage.getItem("seedance-prototype-direction") || "a");
  const [page, setPage] = useState("home");
  const [locale, setLocale] = useState("en");
  const [controlsOpen, setControlsOpen] = useState(false);
  const copy = seedanceCopy[locale];

  useEffect(() => localStorage.setItem("seedance-prototype-direction", direction), [direction]);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);

  return (
    <div className={`prototype direction-${direction} page-${page}`} data-screen-label={`${direction.toUpperCase()} · ${page}`}>
      <PrototypeControls direction={direction} setDirection={setDirection} page={page} setPage={setPage} locale={locale} setLocale={setLocale} open={controlsOpen} setOpen={setControlsOpen} copy={copy} />
      <div className="site-shell">
        <SiteHeader copy={copy} page={page} setPage={setPage} locale={locale} setLocale={setLocale} />
        {page === "home" ? <HomePage copy={copy} locale={locale} direction={direction} setPage={setPage} /> : <GuidePage copy={copy} locale={locale} direction={direction} />}
        <SiteFooter copy={copy} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
