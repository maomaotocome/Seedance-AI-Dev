import { getTranslations } from 'next-intl/server';

import { respData, respErr } from '@/shared/lib/resp';
import { getAllConfigs } from '@/shared/models/config';
import { getUserInfo } from '@/shared/models/user';
import { getPackUpgradeTier } from '@/shared/services/pack-upgrade';

export async function POST() {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respData({ offer: null });
    }

    const t = await getTranslations({
      locale: 'en',
      namespace: 'pages.pricing',
    });
    const pricing = t.raw('page.sections.pricing');
    const tier = await getPackUpgradeTier({
      userId: user.id,
      items: pricing.items,
    });

    const configs = await getAllConfigs();

    return respData({
      offer: tier
        ? {
            from_product_id: tier.item.product_id,
            expires_at: tier.expiresAt.toISOString(),
            // the first-payment credit needs a Stripe coupon
            subscription_credit:
              tier.subscriptionCreditAvailable &&
              configs.default_payment_provider === 'stripe',
          }
        : null,
    });
  } catch (e) {
    console.log('get upgrade offer failed:', e);
    return respErr('get upgrade offer failed');
  }
}
