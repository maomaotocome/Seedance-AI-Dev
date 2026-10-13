import {
  calculateSeedanceCredits,
  SEEDANCE_PRODUCT_MODELS,
  type SeedanceProductModel,
} from '@/config/seedance';
import { VideoBudget } from '@/shared/components/pricing/video-budget';

type PricingDetailsSection = {
  rates: {
    kicker: string;
    title: string;
    description: string;
    headers: string[];
    unit: string;
  };
  faq: {
    title: string;
    items: Array<{ question: string; answer: string }>;
  };
};

const RESOLUTIONS = ['480p', '720p'] as const;
const CLIP_SECONDS = 5;

export function PricingDetails({
  section,
}: {
  section: PricingDetailsSection;
}) {
  const { rates, faq } = section;
  const models = Object.keys(SEEDANCE_PRODUCT_MODELS) as SeedanceProductModel[];
  const clipCredits = (model: SeedanceProductModel, resolution: string) =>
    calculateSeedanceCredits({ model, resolution, duration: CLIP_SECONDS });

  return (
    <div className="bg-director-paper text-director-paper-text">
      <div className="container mx-auto max-w-6xl space-y-16 pb-20 lg:pb-28">
        <VideoBudget />
        <section id="credit-rates" className="scroll-mt-28">
          <div className="mb-7 border-b border-black/12 pb-5">
            <p className="mb-1 font-mono text-[10px] tracking-[0.16em] text-black/45 uppercase">
              {rates.kicker}
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
              {rates.title}
            </h2>
          </div>
          <p className="max-w-3xl text-[17px] leading-8 text-black/72">
            {rates.description}
          </p>
          <div className="mt-8 overflow-x-auto border border-black/12">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead className="bg-director-paper-3">
                <tr>
                  {rates.headers.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="border-b border-black/12 px-4 py-3 font-mono text-[11px] tracking-[0.08em] uppercase"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {models.map((model) => (
                  <tr
                    key={model}
                    className="border-b border-black/10 last:border-0"
                  >
                    <th
                      scope="row"
                      className="px-4 py-4 align-top leading-6 font-medium text-black"
                    >
                      {SEEDANCE_PRODUCT_MODELS[model].label}
                    </th>
                    {RESOLUTIONS.map((resolution) => (
                      <td
                        key={`rate-${resolution}`}
                        className="px-4 py-4 align-top leading-6 text-black/68"
                      >
                        {clipCredits(model, resolution) / CLIP_SECONDS}{' '}
                        {rates.unit}
                      </td>
                    ))}
                    {RESOLUTIONS.map((resolution) => (
                      <td
                        key={`clip-${resolution}`}
                        className="px-4 py-4 align-top leading-6 text-black/68"
                      >
                        {clipCredits(model, resolution)} {rates.unit}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="faq" className="scroll-mt-28">
          <div className="mb-7 border-b border-black/12 pb-5">
            <span className="text-director-orange-text block font-mono text-xs">
              FAQ
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
              {faq.title}
            </h2>
          </div>
          <div className="divide-y divide-black/12 border-y border-black/12">
            {faq.items.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold marker:content-none">
                  {item.question}
                  <span className="text-director-orange-text font-mono text-xl font-normal group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl pr-8 text-sm leading-7 text-black/65">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
