import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getUserPoints, redeemPoints, usePromoCode } from '../utils/loyaltySystem';

function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showPickupTime, setShowPickupTime] = useState(false);
  const [pickupData, setPickupData] = useState({ date: '', timeSlot: '' });
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  
  // Discount state from cart
  const [usePoints, setUsePoints] = useState(false);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [originalSubtotal, setOriginalSubtotal] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [pointsValue, setPointsValue] = useState(0);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  // Generate available dates (today + next 7 days)
  const generateAvailableDates = () => {
    const now = new Date();
    const dates = [];
    for (let i = 0; i <= 7; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let label = '';
      if (i === 0) {
        label = `Today, ${date.toLocaleDateString('en-IN')}`;
      } else if (i === 1) {
        label = `Tomorrow, ${date.toLocaleDateString('en-IN')}`;
      } else {
        label = `${dayNames[date.getDay()]}, ${date.toLocaleDateString('en-IN')}`;
      }
      dates.push({
        value: date.toISOString().split('T')[0],
        label: label,
        date: date,
        isToday: i === 0,
        isTomorrow: i === 1
      });
    }
    return dates;
  };

  // Generate available time slots based on selected date
  const generateTimeSlots = (selectedDateValue) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const datesList = generateAvailableDates();
    const selectedDateObj = datesList.find(d => d.value === selectedDateValue);
    const isToday = selectedDateObj?.isToday || false;
    
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
    
    if (isToday) {
      let nextSlotHour = currentHour + 1;
      if (currentMinute > 0) {
        nextSlotHour = currentHour + 2;
      }
      const availableSlots = allSlots.filter(slot => slot.start >= nextSlotHour && slot.start <= 20);
      return availableSlots;
    } else {
      return [...allSlots];
    }
  };

  // Initialize dates and time slots
  useEffect(() => {
    const dates = generateAvailableDates();
    setAvailableDates(dates);
    
    if (dates.length > 0) {
      const defaultDate = dates[0].value;
      setPickupData(prev => ({ ...prev, date: defaultDate }));
      
      const slots = generateTimeSlots(defaultDate);
      setAvailableTimeSlots(slots);
      if (slots.length > 0) {
        setPickupData(prev => ({ ...prev, timeSlot: slots[0].value }));
      }
    }
  }, []);

  // Update time slots when date changes
  useEffect(() => {
    if (pickupData.date) {
      const slots = generateTimeSlots(pickupData.date);
      setAvailableTimeSlots(slots);
      if (slots.length > 0) {
        setPickupData(prev => ({ ...prev, timeSlot: slots[0].value }));
      } else {
        setPickupData(prev => ({ ...prev, timeSlot: '' }));
      }
    }
  }, [pickupData.date]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setFormData(prev => ({
        ...prev,
        fullName: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || ''
      }));
      
      const points = getUserPoints(userData.email);
      setUserPoints(points);
      setPointsValue(Math.floor(points / 10));
    } else {
      navigate('/login');
    }
    
    // Load discount data from localStorage (passed from cart)
    const savedSubtotal = localStorage.getItem('cartSubtotal');
    const savedPointsDiscount = localStorage.getItem('cartPointsDiscount');
    const savedPromoDiscount = localStorage.getItem('cartPromoDiscount');
    const savedAppliedPromo = localStorage.getItem('cartAppliedPromo');
    const savedPointsUsed = localStorage.getItem('cartPointsUsed');
    const savedUsePoints = localStorage.getItem('cartUsePoints');
    
    const cartTotal = getTotalPrice();
    if (savedSubtotal) {
      setOriginalSubtotal(parseFloat(savedSubtotal));
    } else {
      setOriginalSubtotal(cartTotal);
    }
    if (savedPointsDiscount) setPointsDiscount(parseFloat(savedPointsDiscount));
    if (savedPromoDiscount) setPromoDiscount(parseFloat(savedPromoDiscount));
    if (savedAppliedPromo && savedAppliedPromo !== 'null') setAppliedPromo(JSON.parse(savedAppliedPromo));
    if (savedPointsUsed) setPointsUsed(parseInt(savedPointsUsed));
    if (savedUsePoints) setUsePoints(savedUsePoints === 'true');
    
    // Clear stored data after retrieving
    localStorage.removeItem('cartSubtotal');
    localStorage.removeItem('cartPointsDiscount');
    localStorage.removeItem('cartPromoDiscount');
    localStorage.removeItem('cartAppliedPromo');
    localStorage.removeItem('cartPointsUsed');
    localStorage.removeItem('cartUsePoints');
    
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate, getTotalPrice]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const totalDiscount = (usePoints ? pointsDiscount : 0) + promoDiscount;
  const finalPayable = Math.max(0, originalSubtotal - totalDiscount);
  
  // Validate points usage before placing order
  const canUsePoints = originalSubtotal > pointsValue;

  const handlePlaceOrder = () => {
    if (!pickupData.timeSlot) {
      alert('Please select a pickup time slot');
      return;
    }
    
    // Final validation for points usage
    if (usePoints && originalSubtotal <= pointsValue) {
      alert(`Order total (₹${originalSubtotal}) must be greater than your points value (₹${pointsValue}) to use loyalty points.`);
      return;
    }
    
    setIsSubmitting(true);
    
    const selectedSlot = availableTimeSlots.find(slot => slot.value === pickupData.timeSlot);
    const selectedDate = availableDates.find(date => date.value === pickupData.date);
    const pickupDateTime = `${selectedDate?.label || pickupData.date} (${selectedSlot?.label || 'Time slot'})`;
    const orderId = `ORD${Date.now()}`;
    
    // Redeem points if used
    if (usePoints && pointsUsed > 0 && user) {
      const result = redeemPoints(user.email, pointsUsed, orderId);
      if (result.success) {
        console.log(`Redeemed ${pointsUsed} points for ₹${pointsDiscount} discount`);
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
      customerName: formData.fullName,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      items: cartItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        image: item.image
      })),
      originalAmount: originalSubtotal,
      discountAmount: totalDiscount,
      totalAmount: finalPayable,
      pointsUsed: pointsUsed,
      pointsEarned: 0,
      promoCode: appliedPromo?.code,
      status: 'Confirmed',
      pickupStatus: 'Pending',
      paymentMethod: 'Cash on Delivery',
      pickupDateTime: pickupDateTime,
      pickupDate: pickupData.date,
      pickupTimeSlot: selectedSlot?.label || pickupData.timeSlot,
      pointsAdded: false,
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.zipCode}, ${formData.country}`
    };
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    clearCart();
    
    // Create admin notification
    const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    adminNotifications.push({
      id: Date.now(),
      orderId: orderId,
      type: 'new_order',
      title: '🛍️ New Order Received!',
      message: `New order #${orderId} from ${formData.fullName} for ₹${finalPayable}`,
      customerName: formData.fullName,
      totalAmount: finalPayable,
      read: false,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
    window.dispatchEvent(new Event('adminNotificationsUpdated'));
    
    setIsSubmitting(false);
    setOrderPlaced(true);
    
    setTimeout(() => {
      navigate('/profile');
    }, 3000);
  };

  const styles = {
    container: { maxWidth: '800px', margin: '0 auto', padding: '40px 20px' },
    title: { fontSize: '32px', marginBottom: '10px', color: '#2c3e50', textAlign: 'center' },
    subtitle: { textAlign: 'center', color: '#7f8c8d', marginBottom: '30px' },
    card: { backgroundColor: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' },
    sectionTitle: { fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#2c3e50' },
    input: { width: '100%', padding: '14px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '16px' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' },
    pickupSection: { marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px' },
    pickupTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#2c3e50' },
    pickupGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' },
    select: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer' },
    orderSummary: { backgroundColor: '#f8f9fa', borderRadius: '15px', padding: '20px', marginBottom: '20px' },
    summaryItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' },
    summaryTotal: { display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', fontSize: '18px', fontWeight: 'bold', color: '#e67e22' },
    discountRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', color: '#27ae60' },
    placeOrderBtn: { width: '100%', padding: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' },
    continueBtn: { width: '100%', padding: '15px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '20px' },
    successContainer: { textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' },
    successIcon: { fontSize: '60px', color: '#27ae60', marginBottom: '20px' },
    infoText: { fontSize: '12px', color: '#666', marginTop: '10px', textAlign: 'center' },
    pointsCard: { backgroundColor: '#fff8f0', borderRadius: '12px', padding: '15px', marginBottom: '20px', border: '1px solid #ffe0b3' },
    pointsValue: { fontSize: '18px', fontWeight: 'bold', color: '#e67e22' },
    pointsWarning: { fontSize: '12px', color: '#e74c3c', marginTop: '5px' },
    discountBox: { backgroundColor: '#d4edda', padding: '10px', borderRadius: '8px', marginBottom: '15px' },
    warningBox: { backgroundColor: '#fff3cd', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', color: '#856404', textAlign: 'center' },
    successBox: { backgroundColor: '#d4edda', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', color: '#155724', textAlign: 'center' },
  };

  if (orderPlaced) {
    return (
      <div style={styles.container}>
        <div style={styles.successContainer}>
          <div style={styles.successIcon}>✓</div>
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for shopping with Sri Lakshmi Multi Shop</p>
          <p>Your order has been received and will be processed soon.</p>
          <button onClick={() => navigate('/profile')} style={styles.continueBtn}>View My Orders</button>
        </div>
      </div>
    );
  }

  if (!showPickupTime) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Checkout</h1>
        <p style={styles.subtitle}>Enter your details to continue</p>
        
        <div style={styles.card}>
          {/* Loyalty Points Warning if trying to use but order total too low */}
          {usePoints && originalSubtotal <= pointsValue && (
            <div style={styles.pointsCard}>
              <div style={{ color: '#e74c3c', fontSize: '14px', marginBottom: '10px' }}>
                ⚠️ Order total (₹{originalSubtotal}) must be greater than your points value (₹{pointsValue}) to use loyalty points.
              </div>
            </div>
          )}
          
          {/* Discount Summary Box */}
          {(usePoints || appliedPromo) && (
            <div style={styles.discountBox}>
              <strong>💰 Discount Applied:</strong>
              {usePoints && pointsDiscount > 0 && <div>💎 Points Discount: -₹{pointsDiscount}</div>}
              {appliedPromo && <div>🎟️ Promo Code ({appliedPromo.code}): -₹{promoDiscount}</div>}
              <div style={{ marginTop: '5px', fontWeight: 'bold' }}>Total Savings: ₹{totalDiscount}</div>
            </div>
          )}
          
          <div style={styles.sectionTitle}>Shipping Information</div>
          
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={styles.input} required />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={styles.input} required />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Street Address *</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} style={styles.input} required />
          </div>
          
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>City *</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>State *</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} style={styles.input} required />
            </div>
          </div>
          
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>ZIP Code *</label>
              <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Country *</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} style={styles.input} required />
            </div>
          </div>
          
          <div style={styles.orderSummary}>
            <h4>Order Summary</h4>
            {cartItems.map((item, index) => (
              <div key={index} style={styles.summaryItem}>
                <span>{item.name} x {item.quantity || 1}</span>
                <span>₹{(item.price * (item.quantity || 1)).toFixed(2)}</span>
              </div>
            ))}
            <div style={styles.summaryItem}>
              <span>Subtotal</span>
              <span>₹{originalSubtotal.toFixed(2)}</span>
            </div>
            {usePoints && pointsDiscount > 0 && (
              <div style={styles.discountRow}>
                <span>💎 Points Discount</span>
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
              <span>Total Amount</span>
              <span>₹{finalPayable.toFixed(2)}</span>
            </div>
          </div>
          
          <button onClick={() => setShowPickupTime(true)} style={styles.continueBtn}>
            Continue to Select Pickup Time →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Select Pickup Time</h1>
      <p style={styles.subtitle}>Choose when you want to pick up your order</p>
      
      <div style={styles.card}>
        {(usePoints || appliedPromo) && (
          <div style={styles.pointsCard}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>💰 Discount Applied</div>
            {usePoints && pointsDiscount > 0 && <div>💎 Points Discount: -₹{pointsDiscount}</div>}
            {appliedPromo && <div>🎟️ Promo Code ({appliedPromo.code}): -₹{promoDiscount}</div>}
            <div style={{ marginTop: '5px', fontWeight: 'bold' }}>Total Savings: ₹{totalDiscount}</div>
          </div>
        )}
        
        <div style={styles.pickupSection}>
          <div style={styles.pickupTitle}>📅 Schedule Your Pickup</div>
          
          {pickupData.date && availableDates.find(d => d.value === pickupData.date)?.isToday && availableTimeSlots.length === 0 && (
            <div style={styles.warningBox}>
              ⚠️ No time slots available for today. Please select tomorrow or another date.
            </div>
          )}
          
          {pickupData.date && availableDates.find(d => d.value === pickupData.date)?.isToday && availableTimeSlots.length > 0 && (
            <div style={styles.warningBox}>
              ⏰ For today's pickup, slots are available from next hour onwards
            </div>
          )}
          
          {pickupData.date && !availableDates.find(d => d.value === pickupData.date)?.isToday && (
            <div style={styles.successBox}>
              📅 For {availableDates.find(d => d.value === pickupData.date)?.label}, all time slots (9 AM - 9 PM) are available
            </div>
          )}
          
          <div style={styles.pickupGrid}>
            <div>
              <label style={styles.label}>Pickup Date</label>
              <select 
                value={pickupData.date} 
                onChange={(e) => setPickupData({ ...pickupData, date: e.target.value })} 
                style={styles.select}
              >
                {availableDates.map((date, i) => (
                  <option key={i} value={date.value}>{date.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={styles.label}>Pickup Time Slot</label>
              <select 
                value={pickupData.timeSlot} 
                onChange={(e) => setPickupData({ ...pickupData, timeSlot: e.target.value })} 
                style={styles.select}
                disabled={availableTimeSlots.length === 0}
              >
                {availableTimeSlots.length === 0 ? (
                  <option value="">No slots available</option>
                ) : (
                  availableTimeSlots.map((slot, i) => (
                    <option key={i} value={slot.value}>{slot.label}</option>
                  ))
                )}
              </select>
            </div>
          </div>
          
          <div style={styles.infoText}>
            📍 Pickup Location: Sri Lakshmi Multi Shop<br />
            No 102, Odiampet Road, Vilianur, Puducherry - 605110
          </div>
        </div>
        
        <div style={styles.orderSummary}>
          <h4>Order Summary</h4>
          {cartItems.map((item, index) => (
            <div key={index} style={styles.summaryItem}>
              <span>{item.name} x {item.quantity || 1}</span>
              <span>₹{(item.price * (item.quantity || 1)).toFixed(2)}</span>
            </div>
          ))}
          <div style={styles.summaryItem}>
            <span>Subtotal</span>
            <span>₹{originalSubtotal.toFixed(2)}</span>
          </div>
          {usePoints && pointsDiscount > 0 && (
            <div style={styles.discountRow}>
              <span>💎 Points Discount</span>
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
            <span>Total Amount</span>
            <span>₹{finalPayable.toFixed(2)}</span>
          </div>
        </div>
        
        <button 
          onClick={handlePlaceOrder} 
          disabled={isSubmitting || availableTimeSlots.length === 0} 
          style={{ 
            ...styles.placeOrderBtn, 
            opacity: (isSubmitting || availableTimeSlots.length === 0) ? 0.6 : 1, 
            cursor: (isSubmitting || availableTimeSlots.length === 0) ? 'not-allowed' : 'pointer' 
          }}
        >
          {isSubmitting ? 'Placing Order...' : `Confirm Order • Pay ₹${finalPayable.toFixed(2)}`}
        </button>
        
        <button 
          onClick={() => setShowPickupTime(false)} 
          style={{ ...styles.continueBtn, backgroundColor: '#95a5a6', marginTop: '10px' }}
        >
          ← Back to Details
        </button>
      </div>
    </div>
  );
}

export default CheckoutPage;