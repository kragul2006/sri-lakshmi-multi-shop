import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserPoints, redeemPoints, addPointsToUser, usePromoCode, validatePromoCode } from '../utils/loyaltySystem';

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { product, quantity = 1, totalAmount } = location.state || {};
  const [user, setUser] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showPickupTime, setShowPickupTime] = useState(false);
  const [pickupData, setPickupData] = useState({ date: '', timeSlot: '' });
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  
  // Points & Promo State
  const [userPoints, setUserPoints] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoMessageType, setPromoMessageType] = useState('');

  const getAvailableTimeSlots = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const allSlots = [
      { start: 9, end: 10, label: '09:00 AM - 10:00 AM', value: '9-10' },
      { start: 10, end: 11, label: '10:00 AM - 11:00 AM', value: '10-11' },
      { start: 11, end: 12, label: '11:00 AM - 12:00 PM', value: '11-12' },
      { start: 12, end: 13, label: '12:00 PM - 01:00 PM', value: '12-13' },
      { start: 13, end: 14, label: '01:00 PM - 02:00 PM', value: '13-14' },
      { start: 14, end: 15, label: '02:00 PM - 03:00 PM', value: '14-15' },
      { start: 15, end: 16, label: '03:00 PM - 04:00 PM', value: '15-16' },
      { start: 16, end: 17, label: '04:00 PM - 05:00 PM', value: '16-17' },
      { start: 17, end: 18, label: '05:00 PM - 06:00 PM', value: '17-18' },
      { start: 18, end: 19, label: '06:00 PM - 07:00 PM', value: '18-19' },
      { start: 19, end: 20, label: '07:00 PM - 08:00 PM', value: '19-20' },
      { start: 20, end: 21, label: '08:00 PM - 09:00 PM', value: '20-21' },
    ];
    let nextSlotHour = currentHour + 1;
    if (currentMinute > 0) nextSlotHour = currentHour + 2;
    return allSlots.filter(slot => slot.start >= nextSlotHour && slot.start <= 20);
  };

  const getAvailableDates = () => {
    const now = new Date();
    const dates = [];
    for (let i = 0; i <= 7; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let label = i === 0 ? `Today, ${date.toLocaleDateString('en-IN')}` : i === 1 ? `Tomorrow, ${date.toLocaleDateString('en-IN')}` : `${dayNames[date.getDay()]}, ${date.toLocaleDateString('en-IN')}`;
      dates.push({ value: date.toISOString().split('T')[0], label, date: date, isToday: i === 0 });
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  useEffect(() => {
    const slots = getAvailableTimeSlots();
    setAvailableTimeSlots(slots);
    if (slots.length > 0) setPickupData(prev => ({ ...prev, timeSlot: slots[0].value }));
    if (availableDates.length > 0) setPickupData(prev => ({ ...prev, date: availableDates[0].value }));
  }, []);

  useEffect(() => {
    if (pickupData.date) {
      const slots = getAvailableTimeSlots();
      setAvailableTimeSlots(slots);
      if (slots.length > 0) setPickupData(prev => ({ ...prev, timeSlot: slots[0].value }));
    }
  }, [pickupData.date]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      const points = getUserPoints(userData.email);
      setUserPoints(points);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const finalTotal = totalAmount || 0;
  const totalDiscount = (usePoints ? pointsDiscount : 0) + promoDiscount;
  const finalPayable = Math.max(0, finalTotal - totalDiscount);

  const handlePointsRedemption = () => {
    if (!usePoints) {
      const maxPointsToRedeem = Math.min(userPoints, Math.floor(finalTotal * 10));
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
    
    const result = validatePromoCode(promoCodeInput, finalTotal - (usePoints ? pointsDiscount : 0));
    
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

  const handlePayment = () => {
    setProcessing(true);
    
    const selectedSlot = availableTimeSlots.find(slot => slot.value === pickupData.timeSlot);
    const selectedDate = availableDates.find(date => date.value === pickupData.date);
    const pickupDateTime = `${selectedDate?.label || pickupData.date} (${selectedSlot?.label || pickupData.timeSlot})`;
    const orderId = `ORD${Date.now()}`;
    
    // Redeem points if used
    if (usePoints && pointsUsed > 0) {
      const result = redeemPoints(user.email, pointsUsed, orderId);
      if (result.success) {
        console.log(`Redeemed ${pointsUsed} points for ₹${pointsDiscount} discount`);
        setUserPoints(userPoints - pointsUsed);
      }
    }
    
    // Use promo code if applied
    if (appliedPromo) {
      usePromoCode(appliedPromo.code);
    }
    
    const order = {
      id: orderId,
      orderId: orderId,
      date: new Date().toISOString().split('T')[0],
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone || 'Not provided',
      items: [{ name: product.name, price: product.price, quantity, image: product.image }],
      originalAmount: finalTotal,
      discountAmount: totalDiscount,
      totalAmount: finalPayable,
      pointsUsed: pointsUsed,
      pointsEarned: 0,
      promoCode: appliedPromo?.code,
      status: 'Confirmed',
      pickupStatus: 'Pending',
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online',
      pickupDateTime: pickupDateTime,
      pickupDate: pickupData.date,
      pickupTimeSlot: selectedSlot?.label || pickupData.timeSlot,
      pointsAdded: false
    };
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    adminNotifications.push({ 
      id: Date.now(), 
      orderId: orderId, 
      type: 'new_order', 
      title: '🛍️ New Order Received!', 
      message: `New order #${orderId} from ${user.name} for ₹${finalPayable}`,
      customerName: user.name, 
      totalAmount: finalPayable, 
      read: false, 
      createdAt: new Date().toISOString() 
    });
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
    window.dispatchEvent(new Event('adminNotificationsUpdated'));
    
    setProcessing(false);
    setPaymentSuccess(true);
    setTimeout(() => navigate('/profile'), 2000);
  };

  const styles = {
    container: { maxWidth: '600px', margin: '0 auto', padding: '40px 20px' },
    card: { backgroundColor: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' },
    title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#2c3e50', textAlign: 'center' },
    productInfo: { display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '10px' },
    productImage: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px' },
    productDetails: { flex: 1 },
    productName: { fontSize: '16px', fontWeight: '600', marginBottom: '5px', color: '#2c3e50' },
    productPrice: { fontSize: '18px', color: '#e67e22', fontWeight: 'bold' },
    summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', padding: '10px 0', borderBottom: '1px solid #eee' },
    discountRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', padding: '10px 0', color: '#27ae60' },
    totalRow: { display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', fontSize: '20px', fontWeight: 'bold', color: '#e67e22', borderTop: '2px solid #e67e22' },
    paymentMethods: { marginTop: '20px', marginBottom: '20px' },
    paymentTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#2c3e50' },
    paymentOption: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', marginBottom: '10px', border: '2px solid #e0e0e0', borderRadius: '10px', cursor: 'pointer' },
    paymentOptionSelected: { borderColor: '#e67e22', backgroundColor: '#fff8f0' },
    pickupSection: { marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px' },
    pickupTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#2c3e50' },
    pickupGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' },
    select: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white' },
    payButton: { width: '100%', padding: '14px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '20px' },
    successOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
    successCard: { backgroundColor: 'white', padding: '40px', borderRadius: '20px', textAlign: 'center', maxWidth: '400px' },
    successIcon: { fontSize: '60px', color: '#27ae60', marginBottom: '20px' },
    infoText: { fontSize: '12px', color: '#666', marginTop: '10px', textAlign: 'center' },
    pointsCard: { backgroundColor: '#fff8f0', borderRadius: '12px', padding: '15px', marginBottom: '20px', border: '1px solid #ffe0b3' },
    pointsHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' },
    pointsIcon: { fontSize: '30px' },
    pointsInfo: { flex: 1 },
    pointsValue: { fontSize: '20px', fontWeight: 'bold', color: '#e67e22' },
    pointsLabel: { fontSize: '12px', color: '#7f8c8d' },
    usePointsCheckbox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ffe0b3', cursor: 'pointer' },
    promoSection: { backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '15px', marginBottom: '20px' },
    promoInputGroup: { display: 'flex', gap: '10px', marginBottom: '10px' },
    promoInput: { flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', textTransform: 'uppercase' },
    promoButton: { padding: '10px 20px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    promoMessage: { fontSize: '12px', marginTop: '5px' },
    promoSuccess: { color: '#27ae60' },
    promoError: { color: '#e74c3c' },
    appliedPromoBox: { backgroundColor: '#d4edda', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  };

  if (!product) return <div style={{ textAlign: 'center', padding: '50px' }}>No product selected</div>;
  
  if (paymentSuccess) {
    return (
      <div style={styles.successOverlay}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✓</div>
          <h2>Order Placed Successfully!</h2>
          <p>Your order has been confirmed!</p>
          <p>Thank you for shopping with Sri Lakshmi Multi Shop</p>
          <p style={{ marginTop: '10px', color: '#666' }}>Redirecting to your orders...</p>
        </div>
      </div>
    );
  }

  if (!showPickupTime) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Complete Your Order</h2>
          
          {/* Product Info */}
          <div style={styles.productInfo}>
            <img src={product.image} alt={product.name} style={styles.productImage} />
            <div style={styles.productDetails}>
              <div style={styles.productName}>{product.name}</div>
              <div style={styles.productPrice}>₹{product.price}</div>
              <div>Quantity: {quantity}</div>
            </div>
          </div>

          {/* Loyalty Points Section */}
          {userPoints > 0 && (
            <div style={styles.pointsCard}>
              <div style={styles.pointsHeader}>
                <div style={styles.pointsIcon}>💎</div>
                <div style={styles.pointsInfo}>
                  <div style={styles.pointsValue}>{userPoints.toLocaleString()} Points</div>
                  <div style={styles.pointsLabel}>Available (10 points = ₹1 discount)</div>
                </div>
              </div>
              <div style={styles.usePointsCheckbox} onClick={handlePointsRedemption}>
                <span>💎 Use my points for discount</span>
                <input type="checkbox" checked={usePoints} onChange={handlePointsRedemption} />
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
          <div style={styles.summaryRow}><span>Subtotal</span><span>₹{finalTotal}</span></div>
          {usePoints && pointsDiscount > 0 && <div style={styles.discountRow}><span>💎 Points Discount (10 points = ₹1)</span><span>- ₹{pointsDiscount}</span></div>}
          {promoDiscount > 0 && <div style={styles.discountRow}><span>🎟️ Promo Code Discount</span><span>- ₹{promoDiscount}</span></div>}
          <div style={styles.totalRow}><span>Total to Pay</span><span>₹{finalPayable}</span></div>
          
          {/* Payment Method */}
          <div style={styles.paymentMethods}>
            <div style={styles.paymentTitle}>Select Payment Method</div>
            <div onClick={() => setPaymentMethod('cod')} style={{ ...styles.paymentOption, ...(paymentMethod === 'cod' ? styles.paymentOptionSelected : {}) }}>
              <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
              <div><strong>💰 Cash on Delivery</strong><div style={{ fontSize: '12px', color: '#666' }}>Pay when you pickup</div></div>
            </div>
            <div onClick={() => setPaymentMethod('online')} style={{ ...styles.paymentOption, ...(paymentMethod === 'online' ? styles.paymentOptionSelected : {}) }}>
              <input type="radio" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
              <div><strong>💳 Online Payment</strong><div style={{ fontSize: '12px', color: '#666' }}>Pay via UPI, Card, NetBanking</div></div>
            </div>
          </div>
          
          <button onClick={() => setShowPickupTime(true)} style={styles.payButton}>Continue to Select Pickup Time →</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Select Pickup Time</h2>
        
        <div style={styles.productInfo}>
          <img src={product.image} alt={product.name} style={styles.productImage} />
          <div style={styles.productDetails}>
            <div style={styles.productName}>{product.name}</div>
            <div style={styles.productPrice}>₹{product.price}</div>
            <div>Quantity: {quantity}</div>
          </div>
        </div>

        {/* Show Points and Promo Summary */}
        {(usePoints || appliedPromo) && (
          <div style={styles.pointsCard}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>💰 Discount Summary</div>
            {usePoints && pointsDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span>💎 Points Discount:</span><span>- ₹{pointsDiscount}</span></div>}
            {appliedPromo && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span>🎟️ Promo Code ({appliedPromo.code}):</span><span>- ₹{promoDiscount}</span></div>}
          </div>
        )}

        <div style={styles.pickupSection}>
          <div style={styles.pickupTitle}>📅 Schedule Your Pickup</div>
          <div style={styles.pickupGrid}>
            <div>
              <label style={{ fontSize: '14px', marginBottom: '5px', display: 'block' }}>Pickup Date</label>
              <select value={pickupData.date} onChange={(e) => setPickupData({ ...pickupData, date: e.target.value })} style={styles.select}>
                {availableDates.map((date, i) => (<option key={i} value={date.value}>{date.label}</option>))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '14px', marginBottom: '5px', display: 'block' }}>Pickup Time Slot</label>
              <select value={pickupData.timeSlot} onChange={(e) => setPickupData({ ...pickupData, timeSlot: e.target.value })} style={styles.select}>
                {availableTimeSlots.map((slot, i) => (<option key={i} value={slot.value}>{slot.label}</option>))}
              </select>
            </div>
          </div>
          <div style={styles.infoText}>📍 Pickup Location: Sri Lakshmi Multi Shop, No 102, Odiampet Road, Vilianur, Puducherry - 605110</div>
        </div>

        <div style={styles.summaryRow}><span>Subtotal</span><span>₹{finalTotal}</span></div>
        {usePoints && pointsDiscount > 0 && <div style={styles.discountRow}><span>💎 Points Discount</span><span>- ₹{pointsDiscount}</span></div>}
        {promoDiscount > 0 && <div style={styles.discountRow}><span>🎟️ Promo Code</span><span>- ₹{promoDiscount}</span></div>}
        <div style={styles.totalRow}><span>Total to Pay</span><span>₹{finalPayable}</span></div>
        
        <button onClick={handlePayment} disabled={processing} style={styles.payButton}>
          {processing ? 'Processing...' : `Confirm Order • Pay ₹${finalPayable}`}
        </button>
        <button onClick={() => setShowPickupTime(false)} style={{ ...styles.payButton, backgroundColor: '#95a5a6', marginTop: '10px' }}>← Back</button>
      </div>
    </div>
  );
}

export default PaymentPage;