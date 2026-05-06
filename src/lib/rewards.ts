export function getRewardStats(totalOrders: number, rewardsUsed: number) {
  const totalRewards = Math.floor(totalOrders / 5);
  const availableRewards = Math.max(totalRewards - rewardsUsed, 0);
  const nextRewardIn = totalOrders % 5 === 0 ? 5 : 5 - (totalOrders % 5);

  return {
    totalRewards,
    availableRewards,
    nextRewardIn,
  };
}
