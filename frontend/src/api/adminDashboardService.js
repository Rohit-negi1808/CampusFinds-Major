import { getLostItems, getFoundItems, getClaims, getUsers, getFeedback } from './adminService';

export const getStats = async () => {
  try {
    const [lost, found, claims, users, feedback] = await Promise.all([
      getLostItems(), getFoundItems(), getClaims(), getUsers(), getFeedback()
    ]);
    const pending = claims.filter(c => c.status === 'waiting' || c.status === 'pending').length;
    const pendingFeedback = feedback.filter(f => f.status === 'pending').length;
    return {
      totalLost: lost.length, totalFound: found.length,
      totalClaims: claims.length, pendingClaims: pending,
      totalUsers: users.length, totalContacts: feedback.length, pendingFeedbacks: pendingFeedback,
    };
  } catch { return { totalLost:0, totalFound:0, totalClaims:0, pendingClaims:0, totalUsers:0, totalContacts:0, pendingFeedbacks:0 }; }
};

export const getRecentLostItems  = () => getLostItems().then(d => [...d].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,7));
export const getRecentFoundItems = () => getFoundItems().then(d => [...d].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,7));
export const getRecentClaims     = () => getClaims().then(d => [...d].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,7));
