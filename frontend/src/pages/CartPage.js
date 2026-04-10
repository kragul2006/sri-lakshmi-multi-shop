import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getUserPoints, validatePromoCode } from '../utils/loyaltySystem';

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const [user, setUser] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [pointsValue, setPointsValue] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoMessageType, setPromoMessageType] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      const points = getUserPoints(userData.email);
      setUserPoints(points);
      const value = Math.floor(points / 10); // 10 points = ₹1
      setPointsValue(value);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const subtotal = getTotalPrice();
  
  // Calculate points discount - ONLY if subtotal > points value
  const handlePointsRedemption = () => {
    if (!usePoints) {
      // Check if order total is greater than points value
      if (subtotal <= pointsValue) {
        alert(`Order total (₹${subtotal}) must be greater than your points value (₹${pointsValue}) to use loyalty points. Please add more items to your cart.`);
        setUsePoints(false);
        return;
      }
      
      // Maximum points to redeem = user points (but cannot exceed order total)
      const maxPointsToRedeem = Math.min(userPoints, Math.floor(subtotal * 10));
      const discount = Math.floor(maxPointsToRedeem / 10);
      setPointsDiscount(discount);
      setPointsUsed(maxPointsToRedeem);
      setUsePoints(true);
    } else {
      setPointsDiscount(0);
      setPointsUsed(0);
      setUsePoints(false);
    }
  };

  const handleApplyPromo = () => {
    if (!promoCodeInput.trim()) {
      setPromoMessage('Please enter a promo code');
      setPromoMessageType('error');
      return;
    }
    
    const result = validatePromoCode(promoCodeInput, subtotal - pointsDiscount);
    
    if (result.valid) {
      setAppliedPromo({ code: promoCodeInput.toUpperCase(), discount: result.discount });
      setPromoDiscount(result.discount);
      setPromoMessage(result.message);
      setPromoMessageType('success');
      setPromoCodeInput('');
      setTimeout(() => setPromoMessage(''), 3000);
    } else {
      setPromoMessage(result.message);
      setPromoMessageType('error');
      setTimeout(() => setPromoMessage(''), 3000);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoDiscount(0);
    setPromoMessage('');
  };

  const totalDiscount = (usePoints ? pointsDiscount : 0) + promoDiscount;
  const finalTotal = Math.max(0, subtotal - totalDiscount);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    if (isOffline) {
      alert('You are offline. Please check your internet connection to proceed with checkout.');
      return;
    }
    
    // Store cart total and discount info for checkout
    localStorage.setItem('cartSubtotal', subtotal);
    localStorage.setItem('cartPointsDiscount', pointsDiscount);
    localStorage.setItem('cartPromoDiscount', promoDiscount);
    localStorage.setItem('cartAppliedPromo', JSON.stringify(appliedPromo));
    localStorage.setItem('cartPointsUsed', pointsUsed);
    localStorage.setItem('cartUsePoints', usePoints);
    
    navigate('/checkout');
  };

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
    title: { fontSize: '32px', marginBottom: '30px', color: '#2c3e50', textAlign: 'center' },
    offlineWarning: { backgroundColor: '#fff3cd', color: '#856404', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
    emptyCart: { textAlign: 'center', padding: '60px', backgroundColor: '#f8f9fa', borderRadius: '15px' },
    emptyCartIcon: { fontSize: '60px', marginBottom: '20px' },
    shopBtn: { marginTop: '20px', padding: '12px 30px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' },
    cartItems: { backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' },
    cartHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.5fr', backgroundColor: '#f8f9fa', padding: '15px', fontWeight: '600', borderBottom: '1px solid #eee' },
    cartItem: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.5fr', alignItems: 'center', padding: '15px', borderBottom: '1px solid #eee' },
    productInfo: { display: 'flex', gap: '15px', alignItems: 'center' },
    productImage: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px' },
    productName: { fontWeight: '600', color: '#2c3e50' },
    quantityControls: { display: 'flex', alignItems: 'center', gap: '10px' },
    quantityBtn: { width: '30px', height: '30px', borderRadius: '5px', border: '1px solid #ddd', backgroundColor: '#f8f9fa', cursor: 'pointer', fontSize: '16px' },
    removeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#e74c3c' },
    cartSummary: { backgroundColor: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', padding: '10px 0' },
    discountRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', padding: '10px 0', color: '#27ae60' },
    summaryTotal: { display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '2px solid #eee', fontSize: '18px', fontWeight: 'bold', color: '#e67e22' },
    pointsCard: { backgroundColor: '#fff8f0', borderRadius: '12px', padding: '15px', marginBottom: '20px', border: '1px solid #ffe0b3' },
    pointsHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' },
    pointsIcon: { fontSize: '30px' },
    pointsInfo: { flex: 1 },
    pointsValue: { fontSize: '20px', fontWeight: 'bold', color: '#e67e22' },
    pointsLabel: { fontSize: '12px', color: '#7f8c8d' },
    pointsWarning: { fontSize: '11px', color: '#e74c3c', marginTop: '5px' },
    usePointsCheckbox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ffe0b3', cursor: 'pointer' },
    promoSection: { backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '15px', marginBottom: '20px' },
    promoInputGroup: { display: 'flex', gap: '10px', marginBottom: '10px' },
    promoInput: { flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', textTransform: 'uppercase' },
    promoButton: { padding: '10px 20px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    promoMessage: { fontSize: '12px', marginTop: '5px' },
    promoSuccess: { color: '#27ae60' },
    promoError: { color: '#e74c3c' },
    appliedPromoBox: { backgroundColor: '#d4edda', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    checkoutBtn: { width: '100%', padding: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '20px' },
    checkoutBtnDisabled: { backgroundColor: '#95a5a6', cursor: 'not-allowed' },
    continueBtn: { width: '100%', padding: '12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', marginTop: '10px' },
  };

  if (cartItems.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyCart}>
          <div style={styles.emptyCartIcon}>🛒</div>
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <Link to="/products">
            <button style={styles.shopBtn}>Continue Shopping</button>
          </Link>
        </div>
      </div>
    );
  }

  const canUsePoints = subtotal > pointsValue;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Shopping Cart ({cartItems.length} items)</h1>
      
      {isOffline && (
        <div style={styles.offlineWarning}>
          <span>⚠️</span>
          <span>You are offline. Your cart is saved locally and will be available when you reconnect.</span>
        </div>
      )}
      
      <div style={styles.cartItems}>
        <div style={styles.cartHeader}>
          <div>Product</div>
          <div>Price</div>
          <div>Quantity</div>
          <div>Total</div>
          <div></div>
        </div>
        
        {cartItems.map((item) => (
          <div key={item.id} style={styles.cartItem}>
            <div style={styles.productInfo}>
              <img src={item.image} alt={item.name} style={styles.productImage} />
              <div style={styles.productName}>{item.name}</div>
            </div>
            <div>₹{item.price}</div>
            <div style={styles.quantityControls}>
              <button style={styles.quantityBtn} onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}>-</button>
              <span>{item.quantity || 1}</span>
              <button style={styles.quantityBtn} onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}>+</button>
            </div>
            <div>₹{(item.price * (item.quantity || 1)).toFixed(2)}</div>
            <div>
              <button style={styles.removeBtn} onClick={() => removeFromCart(item.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
      
      <div style={styles.cartSummary}>
        {/* Loyalty Points Section */}
        {user && userPoints > 0 && (
          <div style={styles.pointsCard}>
            <div style={styles.pointsHeader}>
              <div style={styles.pointsIcon}>💎</div>
              <div style={styles.pointsInfo}>
                <div style={styles.pointsValue}>{userPoints.toLocaleString()} Points</div>
                <div style={styles.pointsLabel}>Value: ₹{pointsValue} (10 points = ₹1)</div>
              </div>
            </div>
            {!canUsePoints && (
              <div style={styles.pointsWarning}>
                ⚠️ Order total (₹{subtotal}) must be greater than points value (₹{pointsValue}) to use loyalty points.
                <br />Add more items to your cart to use your points.
              </div>
            )}
            <div style={styles.usePointsCheckbox} onClick={canUsePoints ? handlePointsRedemption : undefined}>
              <span>💎 Use my points for discount {!canUsePoints && '(Not available - order total too low)'}</span>
              <input 
                type="checkbox" 
                checked={usePoints} 
                onChange={handlePointsRedemption} 
                disabled={!canUsePoints}
              />
            </div>
          </div>
        )}

        {/* Promo Code Section */}
        <div style={styles.promoSection}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>🎟️ Have a Promo Code?</div>
          {!appliedPromo ? (
            <>
              <div style={styles.promoInputGroup}>
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  style={styles.promoInput}
                />
                <button onClick={handleApplyPromo} style={styles.promoButton}>Apply</button>
              </div>
              {promoMessage && (
                <div style={{ ...styles.promoMessage, ...(promoMessageType === 'success' ? styles.promoSuccess : styles.promoError) }}>
                  {promoMessage}
                </div>
              )}
            </>
          ) : (
            <div style={styles.appliedPromoBox}>
              <span>✅ Promo code <strong>{appliedPromo.code}</strong> applied! ₹{appliedPromo.discount} off</span>
              <button onClick={handleRemovePromo} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}>Remove</button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div style={styles.summaryRow}>
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {usePoints && pointsDiscount > 0 && (
          <div style={styles.discountRow}>
            <span>💎 Points Discount (10 points = ₹1)</span>
            <span>- ₹{pointsDiscount.toFixed(2)}</span>
          </div>
        )}
        {promoDiscount > 0 && (
          <div style={styles.discountRow}>
            <span>🎟️ Promo Code Discount</span>
            <span>- ₹{promoDiscount.toFixed(2)}</span>
          </div>
        )}
        <div style={styles.summaryTotal}>
          <span>Total</span>
          <span>₹{finalTotal.toFixed(2)}</span>
        </div>
        
        <button 
          style={{
            ...styles.checkoutBtn,
            ...(isOffline ? styles.checkoutBtnDisabled : {})
          }}
          onClick={handleCheckout}
          disabled={isOffline}
        >
          {isOffline ? 'Offline - Cannot Checkout' : `Proceed to Checkout →`}
        </button>
        
        <Link to="/products">
          <button style={styles.continueBtn}>
            Continue Shopping
          </button>
        </Link>
      </div>
    </div>
  );
}

export default CartPage;