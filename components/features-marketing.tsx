import { MarketingHeadline } from "@/components/marketing-headline";
import type { FeatureItem, FeatureSection } from "@/lib/features-catalog";
import { FEATURE_ICONS } from "@/lib/features-icons";

function FeatureIcon({ item }: { item: FeatureItem }) {
  const Icon = FEATURE_ICONS[item.icon];

  return (
    <div className="features-icon" aria-hidden>
      <Icon className="h-7 w-7" strokeWidth={1.75} />
    </div>
  );
}

function FeatureCard({ item }: { item: FeatureItem }) {
  return (
    <article className="features-card">
      <FeatureIcon item={item} />
      <h3 className="features-card__title">{item.title}</h3>
      <p className="features-card__desc">{item.description}</p>
    </article>
  );
}

function FeatureSectionBlock({ section }: { section: FeatureSection }) {
  return (
    <section className="features-section">
      <div className="features-section-head">
        <div>
          <span className="features-eyebrow">{section.eyebrow}</span>
          <h2 className="features-section-head__title">
            <MarketingHeadline title={section.title} titleEm={section.titleEm} />
          </h2>
        </div>
        <p className="features-section-head__desc">{section.description}</p>
      </div>
      <ul className="features-grid">
        {section.items.map((item) => (
          <li key={item.id}>
            <FeatureCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

type FeaturesMarketingProps = {
  sections: FeatureSection[];
};

export function FeaturesMarketing({ sections }: FeaturesMarketingProps) {
  return (
    <div className="features-page">
      {sections.map((section) => (
        <FeatureSectionBlock key={section.eyebrow} section={section} />
      ))}
    </div>
  );
}
