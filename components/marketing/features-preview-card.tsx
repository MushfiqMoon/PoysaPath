export function FeaturesPreviewCard() {
  return (
    <aside className="features-preview" aria-label="Dashboard layout preview">
      <div className="features-preview__head">
        <div>
          <div className="features-preview__title">Money Coach</div>
          <div className="features-preview__meta">Sample guidance · BDT</div>
        </div>
        <span className="features-preview__tag">AI optional</span>
      </div>
      <div className="features-preview__rows">
        <div className="features-preview__row">
          <span>Goal history</span>
          <strong>3 adds</strong>
        </div>
        <div className="features-preview__row">
          <span>Spend-less challenge</span>
          <strong>Food</strong>
        </div>
        <div className="features-preview__row">
          <span>Next reminder</span>
          <strong>Rent</strong>
        </div>
        <div className="features-preview__row">
          <span>Monthly report</span>
          <strong>Ready</strong>
        </div>
      </div>
      <div className="features-preview__total">
        <span className="features-preview__total-label">Next action</span>
        <span className="features-preview__total-value">Stay under target</span>
      </div>
      <div className="features-preview__bar" aria-hidden>
        <i />
      </div>
      <p className="features-preview__foot">Sample layout · not your data</p>
    </aside>
  );
}
