export type CreditPlan = {
  product_id: string;
  title: string;
  amount: number;
  credits: number;
  interval: string;
  valid_days: number;
};

export function estimateVideoBudget(plan: CreditPlan, costCredits: number) {
  if (
    !Number.isSafeInteger(costCredits) ||
    costCredits <= 0 ||
    plan.credits <= 0 ||
    plan.amount < 0
  )
    throw new Error('Invalid video budget');
  return {
    payment: plan.amount / 100,
    dollarsPerVideo: (plan.amount / 100 / plan.credits) * costCredits,
    completeVideos: Math.floor(plan.credits / costCredits),
    leftoverCredits: plan.credits % costCredits,
  };
}
