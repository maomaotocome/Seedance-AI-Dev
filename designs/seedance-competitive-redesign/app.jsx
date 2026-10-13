const { useEffect, useMemo, useRef, useState } = React;
const { prototypeModels, prototypeMedia, prototypeCopy } = window;

function Arrow({ direction = 'right' }) {
  return <span aria-hidden="true">{direction === 'right' ? '↗' : '←'}</span>;
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </span>
  );
}

function SiteHeader({ copy, locale, setLocale, dark = false }) {
  return (
    <header className={`site-header ${dark ? 'is-dark' : ''}`}>
      <a className="brand" href="#top" aria-label="Seedance AI home">
        <BrandMark />
        <strong>Seedance AI</strong>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#create">{copy.nav.create}</a>
        <a href="#models">{copy.nav.models}</a>
        <a href="#method">{copy.nav.guides}</a>
        <a href="#models">{copy.nav.pricing}</a>
      </nav>
      <div className="header-actions">
        <button
          type="button"
          className="language-button"
          onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
        >
          {locale === 'en' ? '中' : 'EN'}
        </button>
        <button type="button" className="sign-in-button">
          {copy.nav.signIn}
        </button>
      </div>
    </header>
  );
}

function PrototypeSwitcher({
  direction,
  setDirection,
  locale,
  setLocale,
  open,
  setOpen,
  copy,
}) {
  return (
    <aside
      className={`prototype-switcher ${open ? 'is-open' : ''}`}
      aria-label="Prototype comparison controls"
    >
      <button
        type="button"
        className="switcher-handle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="switcher-plus">{open ? '−' : '+'}</span>
        <span>{open ? copy.switcher.hide : copy.switcher.show}</span>
      </button>
      {open && (
        <div className="switcher-panel">
          <div className="switcher-kicker">
            <span>{copy.switcher.label}</span>
            <b>HI-FI</b>
          </div>
          <div className="direction-list">
            {Object.entries(copy.directions).map(([key, item]) => (
              <button
                key={key}
                type="button"
                className={direction === key ? 'is-selected' : ''}
                onClick={() => {
                  setDirection(key);
                  setOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                aria-pressed={direction === key}
              >
                <span>{item.code}</span>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.note}</small>
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="switcher-language"
            onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
          >
            {copy.switcher.language}
          </button>
        </div>
      )}
    </aside>
  );
}

function MiniSetting({ label, children }) {
  return (
    <label className="mini-setting">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ShotComposer({ state, copy, locale, mode = 'theater' }) {
  const {
    prompt,
    setPrompt,
    model,
    setModelId,
    resolution,
    setResolution,
    duration,
    setDuration,
    ratio,
    setRatio,
    audio,
    setAudio,
    advanced,
    setAdvanced,
    status,
    submit,
    reset,
    error,
    credits,
  } = state;
  const common = copy.common;

  return (
    <section
      className={`shot-composer composer-${mode}`}
      id="create"
      aria-label="Shot composer"
    >
      <div className="composer-topline">
        <span>
          <i></i>
          {common.status}
        </span>
        <span className="composer-project">SEQ · 001</span>
      </div>
      <label className="prompt-field">
        <span>{common.promptLabel}</span>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={mode === 'control' ? 3 : 4}
        ></textarea>
      </label>
      <div className="composer-summary">
        <label className="model-summary">
          <span>{common.model}</span>
          <select
            value={model.id}
            onChange={(event) => setModelId(event.target.value)}
          >
            {prototypeModels.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="advanced-toggle"
          onClick={() => setAdvanced(!advanced)}
          aria-expanded={advanced}
        >
          <span>{advanced ? common.hideSettings : common.settings}</span>
          <span aria-hidden="true">{advanced ? '−' : '+'}</span>
        </button>
      </div>
      {advanced && (
        <div className="advanced-grid">
          <MiniSetting label={common.resolution}>
            <select
              value={resolution}
              onChange={(event) => setResolution(event.target.value)}
            >
              {model.resolutions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </MiniSetting>
          <MiniSetting label={common.duration}>
            <select
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
            >
              {model.durations.map((item) => (
                <option key={item} value={item}>
                  {item}s
                </option>
              ))}
            </select>
          </MiniSetting>
          <MiniSetting label={common.ratio}>
            <select
              value={ratio}
              onChange={(event) => setRatio(event.target.value)}
            >
              <option>16:9</option>
              <option>9:16</option>
              <option>1:1</option>
            </select>
          </MiniSetting>
          <button
            type="button"
            className={`audio-setting ${audio ? 'is-on' : ''}`}
            onClick={() => setAudio(!audio)}
            role="switch"
            aria-checked={audio}
          >
            <span>
              <span>{common.audio}</span>
              <small>{audio ? 'ON' : 'OFF'}</small>
            </span>
            <i></i>
          </button>
        </div>
      )}
      {error && (
        <p className="composer-error" role="alert">
          {error}
        </p>
      )}
      <div className="composer-action">
        <div className="cost-readout">
          <span>{common.cost}</span>
          <strong>
            {credits} {common.credits}
          </strong>
          <small>
            {resolution} · {duration}s · {ratio}
          </small>
        </div>
        {status === 'ready' ? (
          <button type="button" className="generate-button" onClick={submit}>
            <span>{common.submit}</span>
            <Arrow />
          </button>
        ) : status === 'loading' ? (
          <button type="button" className="generate-button is-loading" disabled>
            <span className="loading-dot"></span>
            <span>{common.submitting}</span>
          </button>
        ) : (
          <button
            type="button"
            className="generate-button is-complete"
            onClick={reset}
          >
            <span>{common.queued}</span>
            <Arrow direction="left" />
          </button>
        )}
      </div>
      <p className="truth-note">{common.truth}</p>
    </section>
  );
}

function MediaStage({
  copy,
  locale,
  mediaIndex,
  setMediaIndex,
  videoPlaying,
  setVideoPlaying,
  compact = false,
}) {
  const videoRef = useRef(null);
  const item = prototypeMedia[mediaIndex];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const saved = Number(
      localStorage.getItem('seedance-study-video-time') || 0
    );
    if (videoPlaying && Number.isFinite(saved)) video.currentTime = saved;
    if (videoPlaying) video.play().catch(() => setVideoPlaying(false));
    else video.pause();
  }, [videoPlaying, setVideoPlaying]);

  return (
    <section
      className={`media-stage ${compact ? 'is-compact' : ''}`}
      aria-label="Original media direction studies"
    >
      <div className="media-viewport">
        {videoPlaying ? (
          <video
            ref={videoRef}
            src="assets/studio-speaker-loop.mp4"
            poster="assets/studio-speaker-poster.jpg"
            playsInline
            muted
            loop
            onTimeUpdate={(event) =>
              localStorage.setItem(
                'seedance-study-video-time',
                String(event.currentTarget.currentTime)
              )
            }
          ></video>
        ) : (
          <img
            src={item.src}
            alt="Original cinematic direction study for the Seedance AI prototype"
          />
        )}
        <div className="stage-chrome">
          <span>
            {videoPlaying ? copy.common.videoStudy : copy.common.study}
          </span>
          <span>16:9 · STUDY {String(mediaIndex + 1).padStart(2, '0')}</span>
        </div>
        <button
          type="button"
          className="play-study"
          onClick={() => setVideoPlaying(!videoPlaying)}
        >
          <span>{videoPlaying ? 'Ⅱ' : '▶'}</span>
          <span>{videoPlaying ? copy.common.pause : copy.common.play}</span>
        </button>
        {!videoPlaying && (
          <div className="media-caption">
            <span>{item.label[locale]}</span>
            <strong>{item.prompt[locale]}</strong>
          </div>
        )}
      </div>
      <div className="media-selector" aria-label="Select direction study">
        {prototypeMedia.map((media, index) => (
          <button
            key={media.id}
            type="button"
            className={
              mediaIndex === index && !videoPlaying ? 'is-selected' : ''
            }
            onClick={() => {
              setMediaIndex(index);
              setVideoPlaying(false);
            }}
            aria-pressed={mediaIndex === index && !videoPlaying}
          >
            <span>0{index + 1}</span>
            <span>{media.label[locale]}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ModelRoster({ copy, locale, state, variant }) {
  const title = copy[variant].rosterTitle;
  return (
    <section className={`model-roster roster-${variant}`} id="models">
      <div className="section-heading">
        <span>MODEL ROUTING / 04</span>
        <h2>{title}</h2>
      </div>
      <div className="model-row">
        {prototypeModels.map((model, index) => {
          const active = state.model.id === model.id;
          return (
            <button
              key={model.id}
              type="button"
              className={`model-card is-${model.accent} ${active ? 'is-active' : ''}`}
              onClick={() => state.setModelId(model.id)}
              aria-pressed={active}
            >
              <span className="model-index">0{index + 1}</span>
              <span className="model-maker">{model.maker}</span>
              <strong>{model.label}</strong>
              <small>{model.note[locale]}</small>
              <span className="model-spec">
                {model.resolutions.join(' / ')} · {model.durations[0]}–
                {model.durations.at(-1)}s
              </span>
              <span className="model-open">
                {active ? 'SELECTED' : 'SELECT'}
                <Arrow />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TheaterPage({ copy, locale, setLocale, state, media }) {
  return (
    <div
      className="site-shell theater-page"
      data-screen-label="A · Creator Theater"
      id="top"
    >
      <SiteHeader copy={copy} locale={locale} setLocale={setLocale} />
      <main>
        <section className="theater-hero">
          <div className="theater-intro">
            <p className="eyebrow">{copy.theater.eyebrow}</p>
            <h1>{copy.theater.title}</h1>
            <p className="hero-body">{copy.theater.body}</p>
            <a href="#method" className="inline-link">
              {copy.common.explore}
              <Arrow />
            </a>
          </div>
          <MediaStage copy={copy} locale={locale} {...media} />
          <ShotComposer
            state={state}
            copy={copy}
            locale={locale}
            mode="theater"
          />
        </section>
        <section className="theater-method" id="method">
          <div className="method-lead">
            <span>{copy.theater.proofLabel}</span>
            <h2>{copy.theater.proofTitle}</h2>
            <p>{copy.theater.proofBody}</p>
          </div>
          <div className="method-steps">
            {copy.theater.steps.map(([number, title, body]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
        <ModelRoster
          copy={copy}
          locale={locale}
          state={state}
          variant="theater"
        />
        <ClosingStatement
          copy={copy}
          title={copy.theater.closing}
          state={state}
        />
      </main>
      <SiteFooter copy={copy} />
    </div>
  );
}

function JournalPage({ copy, locale, setLocale, state, media }) {
  return (
    <div
      className="site-shell journal-page"
      data-screen-label="B · Film Journal"
      id="top"
    >
      <SiteHeader copy={copy} locale={locale} setLocale={setLocale} />
      <main>
        <section className="journal-hero">
          <div className="journal-masthead">
            <span>{copy.journal.issue}</span>
            <span>Seedance AI</span>
            <span>2026 / 08</span>
          </div>
          <div className="journal-title">
            <p>{copy.common.status}</p>
            <h1>{copy.journal.title}</h1>
            <div>
              <p>{copy.journal.deck}</p>
              <a href="#create">
                {copy.common.primary}
                <Arrow />
              </a>
            </div>
          </div>
          <ShotComposer
            state={state}
            copy={copy}
            locale={locale}
            mode="journal"
          />
          <div className="journal-contact">
            <figure className="journal-primary-image">
              <img
                src="assets/motion-gallery.png"
                alt="Original cinematic movement direction study"
              />
              <figcaption>
                <span>PLATE 01 / MOVEMENT</span>
                <span>{copy.common.study}</span>
              </figcaption>
            </figure>
            <div className="journal-side-images">
              <figure>
                <img
                  src="assets/camera-table.png"
                  alt="Original product-light direction study"
                />
                <figcaption>PLATE 02 / OBJECT</figcaption>
              </figure>
              <figure>
                <img
                  src="assets/coastal-pavilion.png"
                  alt="Original location direction study"
                />
                <figcaption>PLATE 03 / WORLD</figcaption>
              </figure>
            </div>
            <blockquote>{copy.journal.pull}</blockquote>
          </div>
        </section>
        <section className="journal-anatomy" id="method">
          <div className="journal-anatomy-title">
            <span>DIRECTING NOTES / 01</span>
            <h2>{copy.journal.anatomy}</h2>
          </div>
          <div className="timeline-notes">
            {copy.journal.entries.map(([time, action, body]) => (
              <article key={time}>
                <time>{time}</time>
                <strong>{action}</strong>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
        <ModelRoster
          copy={copy}
          locale={locale}
          state={state}
          variant="journal"
        />
        <ClosingStatement
          copy={copy}
          title={copy.journal.closing}
          state={state}
          light
        />
      </main>
      <SiteFooter copy={copy} />
    </div>
  );
}

function ControlPage({ copy, locale, setLocale, state, media }) {
  return (
    <div
      className="site-shell control-page"
      data-screen-label="C · Creative Control Room"
      id="top"
    >
      <SiteHeader copy={copy} locale={locale} setLocale={setLocale} dark />
      <main>
        <section className="control-hero">
          <div className="control-intro">
            <span>{copy.control.eyebrow}</span>
            <h1>{copy.control.title}</h1>
            <p>{copy.control.body}</p>
          </div>
          <div className="control-workspace">
            <div className="workspace-bar">
              <span>
                <i></i>
                {copy.control.scene}
              </span>
              <span>SEQ_001 / SHOT_003</span>
              <span>00:00:10:00</span>
            </div>
            <div className="workspace-dock">
              <span>{copy.control.dock}</span>
              <ShotComposer
                state={state}
                copy={copy}
                locale={locale}
                mode="control"
              />
            </div>
            <MediaStage copy={copy} locale={locale} {...media} compact />
            <div className="workspace-inspector">
              <span>{copy.control.inspector}</span>
              <dl>
                <div>
                  <dt>{copy.common.model}</dt>
                  <dd>{state.model.label}</dd>
                </div>
                <div>
                  <dt>{copy.common.resolution}</dt>
                  <dd>{state.resolution}</dd>
                </div>
                <div>
                  <dt>{copy.common.duration}</dt>
                  <dd>{state.duration}s</dd>
                </div>
                <div>
                  <dt>{copy.common.cost}</dt>
                  <dd>{state.credits} CR</dd>
                </div>
              </dl>
              <p>{copy.common.truth}</p>
            </div>
          </div>
        </section>
        <ModelRoster
          copy={copy}
          locale={locale}
          state={state}
          variant="control"
        />
        <ClosingStatement
          copy={copy}
          title={copy.control.closing}
          state={state}
        />
      </main>
      <SiteFooter copy={copy} dark />
    </div>
  );
}

function ClosingStatement({ copy, title, state, light = false }) {
  return (
    <section className={`closing-statement ${light ? 'is-light' : ''}`}>
      <span>READY / NEXT SHOT</span>
      <h2>{title}</h2>
      <button
        type="button"
        onClick={() =>
          document
            .getElementById('create')
            ?.scrollIntoView({ behavior: 'smooth' })
        }
      >
        {copy.common.primary}
        <Arrow />
      </button>
      <p>{copy.common.independent}</p>
    </section>
  );
}

function SiteFooter({ copy, dark = false }) {
  return (
    <footer className={dark ? 'is-dark' : ''}>
      <div>
        <BrandMark />
        <strong>Seedance AI</strong>
      </div>
      <p>{copy.common.independent}</p>
      <nav>
        <a href="#create">{copy.nav.create}</a>
        <a href="#models">{copy.nav.models}</a>
        <a href="#method">{copy.nav.guides}</a>
      </nav>
      <span>© 2026 · DESIGN STUDY</span>
    </footer>
  );
}

function useShotState(copy) {
  const [prompt, setPrompt] = useState(copy.common.prompt);
  const [modelId, setModelIdRaw] = useState('seedance-2.5');
  const model =
    prototypeModels.find((item) => item.id === modelId) || prototypeModels[0];
  const [resolution, setResolution] = useState(model.resolutions.at(-1));
  const [duration, setDuration] = useState(model.durations[0]);
  const [ratio, setRatio] = useState('16:9');
  const [audio, setAudio] = useState(true);
  const [advanced, setAdvanced] = useState(false);
  const [status, setStatus] = useState('ready');
  const [error, setError] = useState('');

  useEffect(() => {
    setPrompt(copy.common.prompt);
    setError('');
  }, [copy]);

  const setModelId = (nextId) => {
    const next =
      prototypeModels.find((item) => item.id === nextId) || prototypeModels[0];
    setModelIdRaw(next.id);
    setResolution(next.resolutions.at(-1));
    setDuration(next.durations[0]);
    setStatus('ready');
  };

  const credits = useMemo(
    () => (model.rates[resolution] || 0) * duration,
    [model, resolution, duration]
  );
  const submit = () => {
    if (!prompt.trim()) {
      setError(copy.common.noPrompt);
      return;
    }
    setError('');
    setStatus('loading');
    window.setTimeout(() => setStatus('complete'), 1150);
  };
  const reset = () => setStatus('ready');

  return {
    prompt,
    setPrompt,
    model,
    setModelId,
    resolution,
    setResolution,
    duration,
    setDuration,
    ratio,
    setRatio,
    audio,
    setAudio,
    advanced,
    setAdvanced,
    status,
    submit,
    reset,
    error,
    credits,
  };
}

function App() {
  const [direction, setDirection] = useState(
    () => localStorage.getItem('seedance-competitive-direction') || 'theater'
  );
  const [locale, setLocale] = useState(
    () => localStorage.getItem('seedance-competitive-locale') || 'en'
  );
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(1);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const copy = prototypeCopy[locale];
  const state = useShotState(copy);
  const media = { mediaIndex, setMediaIndex, videoPlaying, setVideoPlaying };

  useEffect(() => {
    localStorage.setItem('seedance-competitive-direction', direction);
  }, [direction]);
  useEffect(() => {
    localStorage.setItem('seedance-competitive-locale', locale);
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <>
      <PrototypeSwitcher
        direction={direction}
        setDirection={setDirection}
        locale={locale}
        setLocale={setLocale}
        open={switcherOpen}
        setOpen={setSwitcherOpen}
        copy={copy}
      />
      {direction === 'theater' && (
        <TheaterPage
          copy={copy}
          locale={locale}
          setLocale={setLocale}
          state={state}
          media={media}
        />
      )}
      {direction === 'journal' && (
        <JournalPage
          copy={copy}
          locale={locale}
          setLocale={setLocale}
          state={state}
          media={media}
        />
      )}
      {direction === 'control' && (
        <ControlPage
          copy={copy}
          locale={locale}
          setLocale={setLocale}
          state={state}
          media={media}
        />
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
