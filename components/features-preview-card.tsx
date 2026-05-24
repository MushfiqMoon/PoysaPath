export function FeaturesPreviewCard() {
  return (
    <aside className="features-preview" aria-label="Dashboard layout preview">
      <div className="features-preview__head">
        <div>
          <div className="features-preview__title">This month</div>
          <div className="features-preview__meta">Sample dashboard · BDT</div>
        </div>
        <span className="features-preview__tag">preview</span>
      </div>
      <div className="features-preview__rows">
        <div className="features-preview__row">
          <span>Today</span>
          <strong>৳—</strong>
        </div>
        <div className="features-preview__row">
          <span>Month to date</span>
          <strong>৳—</strong>
        </div>
        <div className="features-preview__row">
          <span>Top category</span>
          <strong>—</strong>
        </div>
      </div>
      <div className="features-preview__total">
        <span className="features-preview__total-label">Budget used</span>
        <span className="features-preview__total-value">—</span>
      </div>
      <div className="features-preview__bar" aria-hidden>
        <i />
      </div>
      <p className="features-preview__foot">Sample layout · not your data</p>
    </aside>
  );
}
