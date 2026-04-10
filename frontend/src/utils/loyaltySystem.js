// Loyalty Points Configuration
// NEW RULES:
// - Spend ₹100 = Earn 10 loyalty points
// - 10 loyalty points = ₹1 discount

const POINTS_PER_100_RS = 10; // 10 points per ₹100 spent
const POINTS_VALUE = 10; // 10 points = ₹1 discount

// Calculate points earned from order amount
export const calculatePointsEarned = (amount) => {
  // For every ₹100 spent, earn 10 points
  // Example: ₹2499 spent = 24 points (24.99 rounded down to 24)
  return Math.floor(amount / 100) * POINTS_PER_100_RS;
};

// Calculate discount from points (10 points = ₹1)
export const calculateDiscountFromPoints = (points) => {
  return Math.floor(points / POINTS_VALUE);
};

// Calculate points needed for a specific discount amount
export const calculatePointsNeeded = (discountAmount) => {
  return discountAmount * POINTS_VALUE;
};

// Add points to user after order completion
export const addPointsToUser = (userEmail, amount, orderId) => {
  const pointsEarned = calculatePointsEarned(amount);
  if (pointsEarned === 0) return false;
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex(u => u.email === userEmail);
  
  if (userIndex !== -1) {
    const currentPoints = users[userIndex].loyaltyPoints || 0;
    const updatedPoints = currentPoints + pointsEarned;
    
    users[userIndex] = {
      ...users[userIndex],
      loyaltyPoints: updatedPoints,
      totalPointsEarned: (users[userIndex].totalPointsEarned || 0) + pointsEarned,
      pointsHistory: [
        ...(users[userIndex].pointsHistory || []),
        {
          id: Date.now(),
          points: pointsEarned,
          reason: `Earned from order #${orderId} (₹${amount})`,
          orderId: orderId,
          amount: amount,
          date: new Date().toISOString(),
          type: 'earned'
        }
      ]
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.email === userEmail) {
      currentUser.loyaltyPoints = updatedPoints;
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
    
    return true;
  }
  return false;
};

// Redeem points (10 points = ₹1 discount)
export const redeemPoints = (userEmail, pointsToRedeem, orderId) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex(u => u.email === userEmail);
  
  if (userIndex !== -1) {
    const currentPoints = users[userIndex].loyaltyPoints || 0;
    
    if (currentPoints >= pointsToRedeem) {
      const updatedPoints = currentPoints - pointsToRedeem;
      const discount = calculateDiscountFromPoints(pointsToRedeem);
      
      users[userIndex] = {
        ...users[userIndex],
        loyaltyPoints: updatedPoints,
        pointsHistory: [
          ...(users[userIndex].pointsHistory || []),
          {
            id: Date.now(),
            points: pointsToRedeem,
            reason: `Redeemed ${pointsToRedeem} points for ₹${discount} off on order #${orderId}`,
            orderId: orderId,
            discount: discount,
            date: new Date().toISOString(),
            type: 'redeemed'
          }
        ]
      };
      
      localStorage.setItem('users', JSON.stringify(users));
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.email === userEmail) {
        currentUser.loyaltyPoints = updatedPoints;
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
      
      return { success: true, discount: discount, pointsUsed: pointsToRedeem };
    }
  }
  return { success: false, discount: 0, pointsUsed: 0 };
};

// Get user points
export const getUserPoints = (userEmail) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === userEmail);
  return user?.loyaltyPoints || 0;
};

// Get points history
export const getPointsHistory = (userEmail) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === userEmail);
  return user?.pointsHistory || [];
};

// Promo Code Functions
export const promoCodeExists = (code) => {
  const promoCodes = JSON.parse(localStorage.getItem('promoCodes') || '[]');
  return promoCodes.find(p => p.code === code.toUpperCase());
};

export const validatePromoCode = (code, cartTotal) => {
  const promo = promoCodeExists(code);
  
  if (!promo) {
    return { valid: false, message: 'Invalid promo code' };
  }
  
  const now = new Date();
  const expiryDate = new Date(promo.expiryDate);
  
  if (expiryDate < now) {
    return { valid: false, message: 'Promo code has expired' };
  }
  
  if (!promo.isActive) {
    return { valid: false, message: 'Promo code is inactive' };
  }
  
  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
    return { valid: false, message: 'Promo code usage limit reached' };
  }
  
  if (promo.minOrderAmount && cartTotal < promo.minOrderAmount) {
    return { valid: false, message: `Minimum order amount of ₹${promo.minOrderAmount} required` };
  }
  
  let discount = 0;
  if (promo.type === 'percentage') {
    discount = (cartTotal * promo.value) / 100;
    if (promo.maxDiscount) {
      discount = Math.min(discount, promo.maxDiscount);
    }
  } else {
    discount = Math.min(promo.value, cartTotal);
  }
  
  discount = Math.floor(discount);
  
  return { 
    valid: true, 
    discount: discount,
    promo: promo,
    message: `Promo code applied! ${promo.type === 'percentage' ? `${promo.value}% off` : `₹${promo.value} off`}`
  };
};

export const createPromoCode = (code, type, value, expiryDate, minOrderAmount = 0, maxDiscount = null, usageLimit = null) => {
  const promoCodes = JSON.parse(localStorage.getItem('promoCodes') || '[]');
  
  const existing = promoCodes.find(p => p.code === code.toUpperCase());
  if (existing) {
    return { success: false, message: 'Promo code already exists' };
  }
  
  const newPromo = {
    id: Date.now(),
    code: code.toUpperCase(),
    type: type,
    value: value,
    expiryDate: expiryDate,
    minOrderAmount: minOrderAmount || 0,
    maxDiscount: maxDiscount || null,
    usageLimit: usageLimit || null,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  
  promoCodes.push(newPromo);
  localStorage.setItem('promoCodes', JSON.stringify(promoCodes));
  return { success: true, message: 'Promo code created successfully' };
};

export const usePromoCode = (code) => {
  const promoCodes = JSON.parse(localStorage.getItem('promoCodes') || '[]');
  const index = promoCodes.findIndex(p => p.code === code.toUpperCase());
  
  if (index !== -1) {
    promoCodes[index].usedCount = (promoCodes[index].usedCount || 0) + 1;
    localStorage.setItem('promoCodes', JSON.stringify(promoCodes));
    return true;
  }
  return false;
};

export const getAllPromoCodes = () => {
  return JSON.parse(localStorage.getItem('promoCodes') || '[]');
};