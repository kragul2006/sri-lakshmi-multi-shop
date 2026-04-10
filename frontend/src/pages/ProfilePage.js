import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserPoints, getPointsHistory } from '../utils/loyaltySystem';

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [showPointsHistory, setShowPointsHistory] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(savedUser);
    setUser(userData);
    
    const points = getUserPoints(userData.email);
    setUserPoints(points);
    const history = getPointsHistory(userData.email);
    setPointsHistory(history);
    
    createSampleOrdersIfNeeded(userData);
    loadOrders(userData);
    loadNotifications(userData);
  }, [navigate]);

  const createSampleOrdersIfNeeded = (userData) => {
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = allOrders.filter(order => 
      order.customerEmail === userData.email || 
      order.customerPhone === userData.phone
    );
    
    if (userOrders.length === 0) {
      const now = new Date();
      const sampleOrders = [
        {
          id: 'ORD' + Date.now(),
          orderId: 'ORD' + Date.now(),
          date: now.toISOString().split('T')[0],
          createdAt: now.toISOString(),
          customerName: userData.name,
          customerEmail: userData.email,
          customerPhone: userData.phone || '9876543210',
          items: [{ name: 'Premium Non-Stick Cookware Set', price: 2499, quantity: 1, image: 'https://images.unsplash.com/photo-1584990347449-d6c4f3e4f1b6?w=100' }],
          totalAmount: 2499,
          originalAmount: 2499,
          discountAmount: 0,
          pointsUsed: 0,
          pointsEarned: 240,
          status: 'Confirmed',
          pickupStatus: 'Pending',
          paymentMethod: 'Cash on Delivery',
          pickupDateTime: 'Tomorrow, 10:00 AM - 11:00 AM',
          cancelDeadline: new Date(now.getTime() + 60 * 60 * 1000).toISOString()
        }
      ];
      const updatedOrders = [...allOrders, ...sampleOrders];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
    }
  };

  const loadOrders = (userData) => {
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const currentUserOrders = allOrders.filter(order => 
      order.customerEmail === userData.email || 
      order.customerPhone === userData.phone
    );
    
    const now = new Date();
    const updatedOrders = currentUserOrders.map(order => {
      if (order.status === 'Cancelled' || order.pickupStatus === 'Picked Up' || order.status === 'Delivered') {
        return { ...order, cancellable: false };
      }
      if (order.cancelDeadline) {
        const deadline = new Date(order.cancelDeadline);
        const isCancellable = now < deadline;
        return { ...order, cancellable: isCancellable };
      }
      return { ...order, cancellable: false };
    });
    
    setOrders(updatedOrders);
    sortOrders(updatedOrders, sortOrder);
  };

  const sortOrders = (ordersList, order) => {
    const sorted = [...ordersList];
    if (order === 'newest') {
      sorted.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    } else if (order === 'oldest') {
      sorted.sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
    }
    setFilteredOrders(sorted);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
    sortOrders(orders, order);
  };

  const loadNotifications = (userData) => {
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const userNotifications = allNotifications.filter(n => n.userEmail === userData.email);
    setNotifications(userNotifications);
  };

  const getStatusBadge = (order) => {
    if (order.status === 'Cancelled') {
      return { text: '❌ Cancelled', color: '#e74c3c', bg: '#f8d7da' };
    }
    const status = order.pickupStatus || order.status;
    switch (status) {
      case 'Picked Up':
      case 'Delivered':
      case 'Completed':
        return { text: '✅ Delivered', color: '#27ae60', bg: '#d4edda' };
      case 'Ready':
      case 'Ready for Pickup':
        return { text: '🎉 Ready for Pickup', color: '#3498db', bg: '#d1ecf1' };
      case 'Processing':
        return { text: '⏳ Processing', color: '#f39c12', bg: '#fff3cd' };
      case 'Confirmed':
        return { text: '⏳ Confirmed', color: '#f39c12', bg: '#fff3cd' };
      default:
        return { text: '📦 Pending', color: '#e74c3c', bg: '#f8d7da' };
    }
  };

  const getTimeRemaining = (cancelDeadline) => {
    if (!cancelDeadline) return null;
    const now = new Date();
    const deadline = new Date(cancelDeadline);
    const diff = deadline - now;
    if (diff <= 0) return null;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) return `${hours}h ${remainingMinutes}m`;
    return `${minutes} minutes`;
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const openCancelModal = (order) => {
    setCancellingOrder(order);
    setCancellationReason('');
    setShowCancelModal(true);
  };

  const confirmCancellation = () => {
    if (!cancellationReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }
    
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = allOrders.map(order => {
      if (order.id === cancellingOrder.id) {
        return {
          ...order,
          status: 'Cancelled',
          pickupStatus: 'Cancelled',
          cancellationReason: cancellationReason,
          cancelledAt: new Date().toISOString(),
          cancellable: false
        };
      }
      return order;
    });
    
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    adminNotifications.push({
      id: Date.now(),
      orderId: cancellingOrder.id,
      type: 'cancellation',
      title: '❌ Order Cancelled by Customer',
      message: `Order #${cancellingOrder.id} cancelled by ${cancellingOrder.customerName}. Reason: ${cancellationReason}`,
      customerName: cancellingOrder.customerName,
      totalAmount: cancellingOrder.totalAmount,
      read: false,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
    window.dispatchEvent(new Event('adminNotificationsUpdated'));
    
    loadOrders(user);
    setShowCancelModal(false);
    setCancellingOrder(null);
    setCancellationReason('');
    alert('Order cancelled successfully! Refund will be processed within 3-5 business days.');
  };

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
    profileHeader: { backgroundColor: 'white', borderRadius: '20px', padding: '30px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '30px' },
    profileAvatar: { width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #e67e22, #f39c12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: 'white', fontWeight: 'bold' },
    profileInfo: { flex: 1 },
    profileName: { fontSize: '28px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '10px' },
    profileEmail: { fontSize: '16px', color: '#7f8c8d', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '10px' },
    pointsCard: { backgroundColor: '#fff8f0', borderRadius: '16px', padding: '20px', marginBottom: '20px', border: '1px solid #ffe0b3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' },
    pointsLeft: { display: 'flex', alignItems: 'center', gap: '15px' },
    pointsIcon: { fontSize: '40px' },
    pointsInfo: { textAlign: 'left' },
    pointsValue: { fontSize: '28px', fontWeight: 'bold', color: '#e67e22' },
    pointsLabel: { fontSize: '12px', color: '#7f8c8d' },
    pointsRight: { textAlign: 'right' },
    pointsRedeemValue: { fontSize: '24px', fontWeight: 'bold', color: '#27ae60' },
    shopBtn: { backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    historyBtn: { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', marginTop: '10px' },
    sortBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
    sortLabel: { fontSize: '14px', color: '#666' },
    sortSelect: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', fontSize: '14px' },
    cancelInfo: { fontSize: '13px', color: '#e74c3c', backgroundColor: '#fff3cd', padding: '8px 15px', borderRadius: '20px' },
    ordersList: { backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    orderItem: { padding: '20px', borderBottom: '1px solid #eee', transition: 'background 0.3s ease' },
    orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' },
    orderId: { fontSize: '16px', fontWeight: '600', color: '#e67e22' },
    orderDate: { fontSize: '12px', color: '#999', marginTop: '5px' },
    cancelTimer: { fontSize: '11px', color: '#e74c3c', marginTop: '5px', fontWeight: '500', backgroundColor: '#fff3cd', display: 'inline-block', padding: '2px 8px', borderRadius: '12px' },
    orderProducts: { display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' },
    orderProduct: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '10px' },
    productImage: { width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' },
    orderTotal: { textAlign: 'right', fontSize: '16px', fontWeight: 'bold', color: '#e67e22' },
    pointsEarned: { fontSize: '12px', color: '#27ae60', marginTop: '5px' },
    buttonGroup: { display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' },
    viewDetailsBtn: { padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
    cancelBtn: { padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
    emptyOrders: { textAlign: 'center', padding: '60px', color: '#7f8c8d' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', borderRadius: '20px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto', padding: '25px' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' },
    textarea: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', marginBottom: '15px', resize: 'vertical' },
    confirmCancelBtn: { width: '100%', padding: '12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' },
    historyModal: { backgroundColor: 'white', borderRadius: '20px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto', padding: '25px' },
    historyItem: { padding: '12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    historyPoints: { fontWeight: 'bold', color: '#e67e22' },
    historyDate: { fontSize: '12px', color: '#999' },
    historyReason: { fontSize: '13px', color: '#666' },
  };

  if (!user) return null;

  return (
    <div style={styles.container}>
      <div style={styles.profileHeader}>
        <div style={styles.profileAvatar}>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
        <div style={styles.profileInfo}>
          <h1 style={styles.profileName}>{user.name}</h1>
          <div style={styles.profileEmail}>📧 {user.email}</div>
          <div style={styles.profileEmail}>📞 {user.phone || '+91 98765 43210'}</div>
          <div style={styles.profileEmail}>📅 Member since 2024</div>
        </div>
      </div>

      <div style={styles.pointsCard}>
        <div style={styles.pointsLeft}>
          <div style={styles.pointsIcon}>💎</div>
          <div style={styles.pointsInfo}>
            <div style={styles.pointsValue}>{userPoints.toLocaleString()} Points</div>
            <div style={styles.pointsLabel}>Total Loyalty Points</div>
          </div>
        </div>
        <div style={styles.pointsRight}>
          <div style={styles.pointsRedeemValue}>₹{Math.floor(userPoints / 10)} value</div>
          <div style={styles.pointsLabel}>10 points = ₹1 discount</div>
          <div style={styles.pointsLabel}>Earn 10 points per ₹100 spent</div>
          <button style={styles.historyBtn} onClick={() => setShowPointsHistory(true)}>View History</button>
        </div>
      </div>

      {showPointsHistory && (
        <div style={styles.modalOverlay} onClick={() => setShowPointsHistory(false)}>
          <div style={styles.historyModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}><h3>Points History</h3><button style={styles.closeBtn} onClick={() => setShowPointsHistory(false)}>×</button></div>
            {pointsHistory.length === 0 ? <p style={{ textAlign: 'center', padding: '40px' }}>No points history yet</p> : pointsHistory.map(item => (
              <div key={item.id} style={styles.historyItem}>
                <div><div style={{ fontWeight: 'bold' }}>{item.type === 'earned' ? '+ ' : '- '}{item.points} points</div><div style={styles.historyReason}>{item.reason}</div><div style={styles.historyDate}>{new Date(item.date).toLocaleDateString()}</div></div>
                <div style={{ ...styles.historyPoints, color: item.type === 'earned' ? '#27ae60' : '#e74c3c' }}>{item.type === 'earned' ? '+' : '-'}{item.points}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.sortBar}>
        <div><span style={styles.sortLabel}>Sort by:</span><select value={sortOrder} onChange={(e) => handleSortChange(e.target.value)} style={styles.sortSelect}><option value="newest">📅 Newest First</option><option value="oldest">📅 Oldest First</option></select></div>
        <div style={styles.cancelInfo}>⏰ Orders can be cancelled within 1 hour of placing</div>
      </div>

      <div style={styles.ordersList}>
        {filteredOrders.length === 0 ? (
          <div style={styles.emptyOrders}><div style={{ fontSize: '50px' }}>📦</div><h3>No orders yet</h3><p>Start shopping to see your orders here!</p><button onClick={() => navigate('/products')} style={styles.shopBtn}>Shop Now</button></div>
        ) : (
          filteredOrders.map((order) => {
            const statusBadge = getStatusBadge(order);
            const timeRemaining = order.cancellable ? getTimeRemaining(order.cancelDeadline) : null;
            const isCancelled = order.status === 'Cancelled';
            return (
              <div key={order.id} style={styles.orderItem}>
                <div style={styles.orderHeader}>
                  <div><span style={styles.orderId}>Order #{order.id}</span><div style={styles.orderDate}>Placed on: {order.date}</div>{timeRemaining && !isCancelled && <div style={styles.cancelTimer}>⏰ Cancel available for: {timeRemaining}</div>}</div>
                  <span style={{ ...styles.orderStatus, backgroundColor: statusBadge.bg, color: statusBadge.color }}>{statusBadge.text}</span>
                </div>
                <div style={styles.orderProducts}>{order.items.slice(0, 2).map((item, idx) => (<div key={idx} style={styles.orderProduct}><img src={item.image} alt={item.name} style={styles.productImage} /><div><div style={{ fontWeight: '500', fontSize: '13px' }}>{item.name}</div><div style={{ color: '#e67e22', fontSize: '12px' }}>₹{item.price} x {item.quantity}</div></div></div>))}{order.items.length > 2 && <div style={styles.orderProduct}><div>+{order.items.length - 2} more items</div></div>}</div>
                <div style={styles.orderTotal}>Total: ₹{order.totalAmount}</div>
                {order.pointsEarned > 0 && <div style={styles.pointsEarned}>💎 Earned {order.pointsEarned} points (10 points per ₹100 spent)</div>}
                {order.pointsUsed > 0 && <div style={{ ...styles.pointsEarned, color: '#e67e22' }}>💎 Used {order.pointsUsed} points (₹{Math.floor(order.pointsUsed / 10)} discount)</div>}
                <div style={styles.buttonGroup}>
                  <button style={styles.viewDetailsBtn} onClick={() => openOrderDetails(order)}>View Order Details →</button>
                  {order.cancellable && !isCancelled && <button style={styles.cancelBtn} onClick={() => openCancelModal(order)}>❌ Cancel Order</button>}
                  {isCancelled && <span style={{ fontSize: '12px', color: '#e74c3c', padding: '6px 12px' }}>Cancelled on {new Date(order.cancelledAt).toLocaleDateString()}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showOrderModal && selectedOrder && (
        <div style={styles.modalOverlay} onClick={() => setShowOrderModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}><h3>Order Details - #{selectedOrder.id}</h3><button style={styles.closeBtn} onClick={() => setShowOrderModal(false)}>×</button></div>
            <div><h4>📋 Order Information</h4><p><strong>Order Date:</strong> {selectedOrder.date}</p><p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'Cash on Delivery'}</p><p><strong>Order Status:</strong> {getStatusBadge(selectedOrder).text}</p>{selectedOrder.cancellationReason && <p><strong>Cancellation Reason:</strong> {selectedOrder.cancellationReason}</p>}</div>
            <div style={{ marginTop: '20px' }}><h4>👤 Customer Details</h4><p><strong>Name:</strong> {selectedOrder.customerName}</p><p><strong>Email:</strong> {selectedOrder.customerEmail}</p><p><strong>Phone:</strong> {selectedOrder.customerPhone}</p></div>
            <div style={{ marginTop: '20px' }}><h4>📅 Pickup Details</h4><p><strong>Pickup Date & Time:</strong> {selectedOrder.pickupDateTime || 'Not scheduled'}</p></div>
            <div style={{ marginTop: '20px' }}><h4>🛍️ Products</h4><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th style={{ textAlign: 'left', padding: '8px' }}>Product</th><th style={{ textAlign: 'left', padding: '8px' }}>Price</th><th style={{ textAlign: 'left', padding: '8px' }}>Qty</th><th style={{ textAlign: 'left', padding: '8px' }}>Subtotal</th></tr></thead><tbody>{selectedOrder.items.map((item, idx) => (<tr key={idx}><td style={{ padding: '8px' }}>{item.name}</td><td style={{ padding: '8px' }}>₹{item.price}</td><td style={{ padding: '8px' }}>{item.quantity}</td><td style={{ padding: '8px' }}>₹{item.price * item.quantity}</td></tr>))}</tbody><tfoot><tr><td colSpan="3" style={{ textAlign: 'right', padding: '10px', fontWeight: 'bold' }}>Total:</td><td style={{ padding: '10px', fontWeight: 'bold', color: '#e67e22' }}>₹{selectedOrder.totalAmount}</td></tr></tfoot></table></div>
            {selectedOrder.pointsEarned > 0 && <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '8px' }}>💎 You earned {selectedOrder.pointsEarned} loyalty points (10 points per ₹100 spent)</div>}
            {selectedOrder.pointsUsed > 0 && <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>💎 You used {selectedOrder.pointsUsed} points (₹{Math.floor(selectedOrder.pointsUsed / 10)} discount)</div>}
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#d4edda', borderRadius: '10px' }}><strong>📍 Pickup Location:</strong><br />Sri Lakshmi Multi Shop<br />No 102, Odiampet Road, Vilianur, Puducherry - 605110</div>
          </div>
        </div>
      )}

      {showCancelModal && cancellingOrder && (
        <div style={styles.modalOverlay} onClick={() => setShowCancelModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}><h3>Cancel Order #{cancellingOrder.id}</h3><button style={styles.closeBtn} onClick={() => setShowCancelModal(false)}>×</button></div>
            <p style={{ marginBottom: '15px', color: '#e74c3c' }}>⚠️ Are you sure you want to cancel this order?</p>
            <p style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>Order Total: <strong>₹{cancellingOrder.totalAmount}</strong></p>
            <p style={{ marginBottom: '15px', fontSize: '13px', color: '#27ae60' }}>Refund will be processed within 3-5 business days.</p>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Reason for cancellation:</label>
            <textarea rows="3" placeholder="Please tell us why you're cancelling this order..." value={cancellationReason} onChange={(e) => setCancellationReason(e.target.value)} style={styles.textarea} />
            <button style={styles.confirmCancelBtn} onClick={confirmCancellation}>Confirm Cancellation</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;