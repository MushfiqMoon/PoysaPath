export function FeaturesPreviewCard() {
  return (
    <aside className="features-preview" aria-label="Dashboard layout preview">
      <div className="features-preview__head">
        <div>
          <div className="features-preview__title">This month</div>
          <div className="features-preview__meta">Sample dashboard · BDT</div>
        </div>
        <span className="features-preview__tag">June</span>
      </div>
      <div className="features-preview__rows">
        <div className="features-preview__row">
          <span>Income</span>
          <strong>৳52,000</strong>
        </div>
        <div className="features-preview__row">
          <span>Expenses</span>
          <strong>৳38,400</strong>
        </div>
        <div className="features-preview__row">
          <span>Saved</span>
          <strong>৳13,600</strong>
        </div>
      </div>
      <div className="features-preview__total">
        <span className="features-preview__total-label">Savings rate</span>
        <span className="features-preview__total-value">26%</span>
      </div>
      <div className="features-preview__bar" aria-hidden>
        <i />
      </div>
      <p className="features-preview__foot">Sample layout · not your data</p>
    </aside>
  );
}
