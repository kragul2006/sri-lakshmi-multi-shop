import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPointsToUser, getAllPromoCodes, createPromoCode } from '../utils/loyaltySystem';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoFormData, setPromoFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    expiryDate: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: ''
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    readyOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(user);
    if (userData.email !== 'admin@example.com') {
      navigate('/');
      return;
    }
    loadData();
  }, []);

  const loadData = () => {
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    const activeOrders = savedOrders.filter(o => 
      o.pickupStatus !== 'Picked Up' && 
      o.status !== 'Completed' && 
      o.status !== 'Cancelled' &&
      o.pickupStatus !== 'Cancelled'
    );
    const cancelledOrdersList = savedOrders.filter(o => 
      o.status === 'Cancelled' || o.pickupStatus === 'Cancelled'
    );
    const completedOrdersList = savedOrders.filter(o => 
      (o.pickupStatus === 'Picked Up' || o.status === 'Completed') && 
      o.status !== 'Cancelled'
    );
    
    setOrders(activeOrders);
    setCancelledOrders(cancelledOrdersList);
    setCompletedOrders(completedOrdersList);

    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(savedUsers);

    const savedMessages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
    setMessages(savedMessages);

    // Load promo codes
    const savedPromoCodes = getAllPromoCodes();
    setPromoCodes(savedPromoCodes);

    fetchProducts();
    calculateStats(activeOrders, cancelledOrdersList, completedOrdersList, savedUsers, savedMessages);
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      const savedProducts = localStorage.getItem('admin_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
    }
  };

  const calculateStats = (activeOrdersList, cancelledOrdersList, completedOrdersList, usersList, messagesList) => {
    const totalRevenue = completedOrdersList.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = activeOrdersList.filter(o => o.pickupStatus === 'Pending' || o.status === 'Confirmed').length;
    const readyOrders = activeOrdersList.filter(o => o.pickupStatus === 'Ready' || o.status === 'Ready for Pickup').length;
    const unreadMessages = messagesList.filter(m => m.status === 'unread').length;

    setStats({
      totalOrders: activeOrdersList.length + cancelledOrdersList.length + completedOrdersList.length,
      totalRevenue: totalRevenue,
      totalUsers: usersList.length,
      totalProducts: products.length || 10,
      pendingOrders: pendingOrders,
      readyOrders: readyOrders,
      completedOrders: completedOrdersList.length,
      cancelledOrders: cancelledOrdersList.length,
      unreadMessages: unreadMessages
    });
  };

  const updatePickupStatus = (orderId, newStatus) => {
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = allOrders.find(o => o.id === orderId);
    
    let updatedAllOrders = allOrders.map(order =>
      order.id === orderId ? { 
        ...order, 
        pickupStatus: newStatus === 'Cancelled' ? 'Cancelled' : newStatus,
        status: newStatus === 'Cancelled' ? 'Cancelled' : 
                newStatus === 'Picked Up' ? 'Completed' : 
                newStatus === 'Ready' ? 'Ready for Pickup' : 'Confirmed'
      } : order
    );
    
    if (newStatus === 'Ready' || newStatus === 'Picked Up') {
      if (!order.pointsAdded) {
        const pointsEarned = Math.floor(order.totalAmount / 100) * 10;
        if (pointsEarned > 0) {
          addPointsToUser(order.customerEmail, order.totalAmount, order.id);
          
          updatedAllOrders = updatedAllOrders.map(o =>
            o.id === orderId ? { ...o, pointsAdded: true, pointsEarned: pointsEarned } : o
          );
        }
      }
    }
    
    localStorage.setItem('orders', JSON.stringify(updatedAllOrders));
    
    if (newStatus === 'Ready') {
      const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const notificationExists = existingNotifications.some(n => n.orderId === orderId && n.type === 'ready');
      
      if (!notificationExists) {
        const pointsEarned = Math.floor(order.totalAmount / 100) * 10;
        const newNotification = {
          id: Date.now(),
          orderId: orderId,
          userEmail: order.customerEmail,
          type: 'ready',
          title: '🎉 Order Ready for Pickup!',
          message: `Your order #${orderId} is now ready for pickup. You earned ${pointsEarned} loyalty points!`,
          pickupDateTime: order.pickupDateTime,
          read: false,
          createdAt: new Date().toISOString()
        };
        existingNotifications.push(newNotification);
        localStorage.setItem('notifications', JSON.stringify(existingNotifications));
        window.dispatchEvent(new Event('notificationsUpdated'));
      }
    }
    
    loadData();
    alert(`Order ${orderId} status updated to ${newStatus}`);
  };

  const deleteCompletedOrder = (orderId) => {
    if (window.confirm('Are you sure you want to remove this completed order from history?')) {
      const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = allOrders.filter(o => o.id !== orderId);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      loadData();
      alert('Order removed from history');
    }
  };

  const markMessageAsRead = (messageId) => {
    const updatedMessages = messages.map(msg =>
      msg.id === messageId ? { ...msg, status: 'read' } : msg
    );
    setMessages(updatedMessages);
    localStorage.setItem('contact_messages', JSON.stringify(updatedMessages));
    calculateStats(orders, cancelledOrders, completedOrders, users, updatedMessages);
  };

  const deleteMessage = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      const updatedMessages = messages.filter(msg => msg.id !== messageId);
      setMessages(updatedMessages);
      localStorage.setItem('contact_messages', JSON.stringify(updatedMessages));
      calculateStats(orders, cancelledOrders, completedOrders, users, updatedMessages);
      alert('Message deleted successfully');
    }
  };

  // Promo Code Functions
  const handlePromoInputChange = (e) => {
    setPromoFormData({ ...promoFormData, [e.target.name]: e.target.value });
  };

  const handleCreatePromo = (e) => {
    e.preventDefault();
    
    if (!promoFormData.code || !promoFormData.value || !promoFormData.expiryDate) {
      alert('Please fill all required fields');
      return;
    }
    
    const result = createPromoCode(
      promoFormData.code,
      promoFormData.type,
      parseFloat(promoFormData.value),
      promoFormData.expiryDate,
      parseFloat(promoFormData.minOrderAmount) || 0,
      promoFormData.maxDiscount ? parseFloat(promoFormData.maxDiscount) : null,
      promoFormData.usageLimit ? parseInt(promoFormData.usageLimit) : null
    );
    
    if (result.success) {
      alert('Promo code created successfully!');
      setShowPromoForm(false);
      setEditingPromo(null);
      setPromoFormData({
        code: '',
        type: 'percentage',
        value: '',
        expiryDate: '',
        minOrderAmount: '',
        maxDiscount: '',
        usageLimit: ''
      });
      loadData();
    } else {
      alert(result.message);
    }
  };

  const handleDeletePromo = (promoId) => {
    if (window.confirm('Are you sure you want to delete this promo code?')) {
      const updatedPromos = promoCodes.filter(p => p.id !== promoId);
      localStorage.setItem('promoCodes', JSON.stringify(updatedPromos));
      loadData();
      alert('Promo code deleted successfully');
    }
  };

  const handleTogglePromoStatus = (promoId) => {
    const updatedPromos = promoCodes.map(promo =>
      promo.id === promoId ? { ...promo, isActive: !promo.isActive } : promo
    );
    localStorage.setItem('promoCodes', JSON.stringify(updatedPromos));
    loadData();
    alert('Promo code status updated');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Picked Up': return '#27ae60';
      case 'Completed': return '#27ae60';
      case 'Ready': return '#3498db';
      case 'Ready for Pickup': return '#3498db';
      case 'Confirmed': return '#f39c12';
      case 'Pending': return '#e74c3c';
      case 'Cancelled': return '#7f8c8d';
      default: return '#95a5a6';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Picked Up': return '#d4edda';
      case 'Completed': return '#d4edda';
      case 'Ready': return '#d1ecf1';
      case 'Ready for Pickup': return '#d1ecf1';
      case 'Confirmed': return '#fff3cd';
      case 'Pending': return '#f8d7da';
      case 'Cancelled': return '#e9ecef';
      default: return '#e9ecef';
    }
  };

  const styles = {
    container: { maxWidth: '1400px', margin: '0 auto', padding: '20px' },
    header: { background: 'linear-gradient(135deg, #2c3e50, #1a252f)', color: 'white', padding: '30px', borderRadius: '15px', marginBottom: '30px' },
    headerTitle: { fontSize: '32px', marginBottom: '10px' },
    headerSubtitle: { fontSize: '14px', opacity: 0.8 },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px', marginBottom: '30px' },
    statCard: { backgroundColor: 'white', borderRadius: '12px', padding: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' },
    statValue: { fontSize: '28px', fontWeight: 'bold', color: '#e67e22' },
    statLabel: { fontSize: '11px', color: '#7f8c8d', marginTop: '5px' },
    tabs: { display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #eee', flexWrap: 'wrap' },
    tab: { padding: '12px 24px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', border: 'none', background: 'none', color: '#7f8c8d' },
    activeTab: { color: '#e67e22', borderBottom: '3px solid #e67e22' },
    tableContainer: { backgroundColor: 'white', borderRadius: '12px', overflow: 'auto', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
    th: { padding: '15px', textAlign: 'left', backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee', fontWeight: '600', color: '#2c3e50' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    statusBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'inline-block' },
    select: { padding: '8px', borderRadius: '5px', border: '1px solid #ddd', cursor: 'pointer', fontSize: '12px' },
    viewBtn: { padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', marginRight: '5px' },
    deleteBtn: { padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
    editBtn: { padding: '6px 12px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', marginRight: '5px' },
    addButton: { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
    formContainer: { backgroundColor: 'white', borderRadius: '15px', padding: '25px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    formTitle: { fontSize: '20px', marginBottom: '20px', color: '#2c3e50' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column' },
    label: { fontWeight: '600', marginBottom: '8px', color: '#2c3e50' },
    input: { padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' },
    select: { padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' },
    submitBtn: { backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', marginTop: '20px' },
    cancelBtn: { backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', marginLeft: '10px' },
    activeBadge: { backgroundColor: '#27ae60', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '11px' },
    inactiveBadge: { backgroundColor: '#e74c3c', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '11px' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', borderRadius: '15px', padding: '30px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' },
    closeBtn: { background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#7f8c8d' },
    messageCard: { backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '15px' },
    messageSubject: { fontSize: '16px', fontWeight: '600', color: '#2c3e50', marginBottom: '10px' },
    messageMeta: { display: 'flex', gap: '15px', fontSize: '12px', color: '#7f8c8d', marginBottom: '10px', flexWrap: 'wrap' },
    messageText: { fontSize: '14px', color: '#666', lineHeight: '1.5', marginBottom: '10px' },
    messageReply: { backgroundColor: '#fff3cd', padding: '10px', borderRadius: '8px', marginTop: '10px', fontSize: '13px' },
    manageProductsBtn: { backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginTop: '20px' },
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Dashboard...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>📦 Sri Lakshmi Multi Shop - Admin Dashboard</h1>
        <p style={styles.headerSubtitle}>Manage Orders, Customers, PromoCodes & Products</p>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}><div style={styles.statValue}>₹{stats.totalRevenue.toLocaleString()}</div><div style={styles.statLabel}>Total Revenue</div></div>
        <div style={styles.statCard}><div style={styles.statValue}>{stats.totalOrders}</div><div style={styles.statLabel}>Total Orders</div></div>
        <div style={styles.statCard}><div style={styles.statValue}>{stats.totalUsers}</div><div style={styles.statLabel}>Total Customers</div></div>
        <div style={styles.statCard}><div style={styles.statValue}>{stats.totalProducts}</div><div style={styles.statLabel}>Total Products</div></div>
        <div style={styles.statCard}><div style={styles.statValue}>{stats.pendingOrders}</div><div style={styles.statLabel}>Pending Pickup</div></div>
        <div style={styles.statCard}><div style={styles.statValue}>{stats.readyOrders}</div><div style={styles.statLabel}>Ready for Pickup</div></div>
        <div style={styles.statCard}><div style={styles.statValue}>{stats.completedOrders}</div><div style={styles.statLabel}>Completed</div></div>
        <div style={styles.statCard}><div style={styles.statValue}>{stats.cancelledOrders}</div><div style={styles.statLabel}>Cancelled</div></div>
        <div style={styles.statCard}><div style={styles.statValue}>{stats.unreadMessages}</div><div style={styles.statLabel}>Unread Messages</div></div>
      </div>

      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(activeTab === 'orders' ? styles.activeTab : {}) }} onClick={() => setActiveTab('orders')}>📋 Active Orders ({orders.length})</button>
        <button style={{ ...styles.tab, ...(activeTab === 'completed' ? styles.activeTab : {}) }} onClick={() => setActiveTab('completed')}>✅ Completed Orders ({completedOrders.length})</button>
        <button style={{ ...styles.tab, ...(activeTab === 'cancelled' ? styles.activeTab : {}) }} onClick={() => setActiveTab('cancelled')}>❌ Cancelled Orders ({cancelledOrders.length})</button>
        <button style={{ ...styles.tab, ...(activeTab === 'messages' ? styles.activeTab : {}) }} onClick={() => setActiveTab('messages')}>📧 Customer Messages ({messages.filter(m => m.status === 'unread').length} new)</button>
        <button style={{ ...styles.tab, ...(activeTab === 'promocodes' ? styles.activeTab : {}) }} onClick={() => setActiveTab('promocodes')}>🎟️ Promo Codes ({promoCodes.length})</button>
        <button style={{ ...styles.tab, ...(activeTab === 'users' ? styles.activeTab : {}) }} onClick={() => setActiveTab('users')}>👥 Customers ({users.length})</button>
        <button style={{ ...styles.tab, ...(activeTab === 'products' ? styles.activeTab : {}) }} onClick={() => setActiveTab('products')}>📦 Products ({products.length})</button>
      </div>

      {/* Active Orders Tab */}
      {activeTab === 'orders' && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Order ID</th><th style={styles.th}>Date</th><th style={styles.th}>Customer</th><th style={styles.th}>Items</th><th style={styles.th}>Total</th><th style={styles.th}>Pickup Slot</th><th style={styles.th}>Status</th><th style={styles.th}>Actions</th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={styles.td}><strong>{order.orderId || order.id}</strong></td>
                  <td style={styles.td}>{order.date}</td>
                  <td style={styles.td}><strong>{order.customerName}</strong><br /><small>{order.customerEmail}</small></td>
                  <td style={styles.td}>{order.items.length} item(s)</td>
                  <td style={styles.td}><strong style={{ color: '#e67e22' }}>₹{order.totalAmount}</strong></td>
                  <td style={styles.td}><small>{order.pickupDateTime || 'Not scheduled'}</small></td>
                  <td style={styles.td}>
                    <select value={order.pickupStatus || 'Pending'} onChange={(e) => updatePickupStatus(order.id, e.target.value)} style={{ ...styles.select, backgroundColor: getStatusBgColor(order.pickupStatus || 'Pending'), color: getStatusColor(order.pickupStatus || 'Pending'), fontWeight: '600' }}>
                      <option value="Pending">⏳ Pending</option>
                      <option value="Ready">✅ Ready for Pickup</option>
                      <option value="Picked Up">📦 Picked Up</option>
                      <option value="Cancelled">❌ Cancelled</option>
                    </select>
                  </td>
                  <td style={styles.td}><button style={styles.viewBtn} onClick={() => setSelectedOrder(order)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Completed Orders Tab */}
      {activeTab === 'completed' && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Order ID</th><th style={styles.th}>Date</th><th style={styles.th}>Customer</th><th style={styles.th}>Items</th><th style={styles.th}>Total</th><th style={styles.th}>Pickup Slot</th><th style={styles.th}>Points Earned</th><th style={styles.th}>Actions</th></tr></thead>
            <tbody>
              {completedOrders.map((order) => (
                <tr key={order.id}>
                  <td style={styles.td}><strong>{order.orderId || order.id}</strong></td>
                  <td style={styles.td}>{order.date}</td>
                  <td style={styles.td}><strong>{order.customerName}</strong><br /><small>{order.customerEmail}</small></td>
                  <td style={styles.td}>{order.items.length} item(s)</td>
                  <td style={styles.td}><strong style={{ color: '#e67e22' }}>₹{order.totalAmount}</strong></td>
                  <td style={styles.td}><small>{order.pickupDateTime || 'Not scheduled'}</small></td>
                  <td style={styles.td}><span style={{ color: '#27ae60', fontWeight: 'bold' }}>{order.pointsEarned || Math.floor(order.totalAmount / 100) * 10} points</span></td>
                  <td style={styles.td}><button style={styles.viewBtn} onClick={() => setSelectedOrder(order)}>View</button><button style={styles.deleteBtn} onClick={() => deleteCompletedOrder(order.id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cancelled Orders Tab */}
      {activeTab === 'cancelled' && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Order ID</th><th style={styles.th}>Date</th><th style={styles.th}>Customer</th><th style={styles.th}>Items</th><th style={styles.th}>Total</th><th style={styles.th}>Cancellation Reason</th><th style={styles.th}>Status</th><th style={styles.th}>Actions</th></tr></thead>
            <tbody>
              {cancelledOrders.map((order) => (
                <tr key={order.id}>
                  <td style={styles.td}><strong>{order.orderId || order.id}</strong></td>
                  <td style={styles.td}>{order.date}</td>
                  <td style={styles.td}><strong>{order.customerName}</strong><br /><small>{order.customerEmail}</small></td>
                  <td style={styles.td}>{order.items.length} item(s)</td>
                  <td style={styles.td}><strong style={{ color: '#e67e22' }}>₹{order.totalAmount}</strong></td>
                  <td style={styles.td}><small>{order.cancellationReason || 'No reason provided'}</small></td>
                  <td style={styles.td}><span style={{ ...styles.statusBadge, backgroundColor: '#e9ecef', color: '#7f8c8d' }}>❌ Cancelled</span></td>
                  <td style={styles.td}><button style={styles.viewBtn} onClick={() => setSelectedOrder(order)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>#</th><th style={styles.th}>Date</th><th style={styles.th}>Customer</th><th style={styles.th}>Subject</th><th style={styles.th}>Message</th><th style={styles.th}>Status</th><th style={styles.th}>Actions</th></tr></thead>
            <tbody>
              {messages.map((msg, index) => (
                <tr key={msg.id} style={{ backgroundColor: msg.status === 'unread' ? '#fff8f0' : 'white' }}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{new Date(msg.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}><strong>{msg.name}</strong><br /><small>{msg.email}</small><br /><small>{msg.phone || 'No phone'}</small></td>
                  <td style={styles.td}><strong>{msg.subject}</strong></td>
                  <td style={styles.td}>{msg.message.length > 50 ? msg.message.substring(0, 50) + '...' : msg.message}</td>
                  <td style={styles.td}><span style={{ ...styles.statusBadge, backgroundColor: msg.status === 'unread' ? '#e74c3c' : '#27ae60', color: 'white' }}>{msg.status === 'unread' ? 'Unread' : 'Read'}</span></td>
                  <td style={styles.td}><button style={styles.viewBtn} onClick={() => setSelectedMessage(msg)}>View</button>{msg.status === 'unread' && <button style={{...styles.viewBtn, backgroundColor: '#27ae60'}} onClick={() => markMessageAsRead(msg.id)}>Mark Read</button>}<button style={styles.deleteBtn} onClick={() => deleteMessage(msg.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Promo Codes Tab */}
      {activeTab === 'promocodes' && (
        <div>
          <div style={{ marginBottom: '20px', textAlign: 'right' }}>
            <button onClick={() => { setShowPromoForm(true); setEditingPromo(null); setPromoFormData({ code: '', type: 'percentage', value: '', expiryDate: '', minOrderAmount: '', maxDiscount: '', usageLimit: '' }); }} style={styles.addButton}>+ Create New Promo Code</button>
          </div>
          
          {showPromoForm && (
            <div style={styles.formContainer}>
              <h3 style={styles.formTitle}>{editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}</h3>
              <form onSubmit={handleCreatePromo}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}><label style={styles.label}>Code *</label><input type="text" name="code" value={promoFormData.code} onChange={handlePromoInputChange} style={styles.input} required placeholder="WELCOME10" /></div>
                  <div style={styles.formGroup}><label style={styles.label}>Type *</label><select name="type" value={promoFormData.type} onChange={handlePromoInputChange} style={styles.select}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount (₹)</option></select></div>
                  <div style={styles.formGroup}><label style={styles.label}>Value *</label><input type="number" name="value" value={promoFormData.value} onChange={handlePromoInputChange} style={styles.input} required placeholder="10 for 10% or ₹10" /></div>
                  <div style={styles.formGroup}><label style={styles.label}>Expiry Date *</label><input type="date" name="expiryDate" value={promoFormData.expiryDate} onChange={handlePromoInputChange} style={styles.input} required /></div>
                  <div style={styles.formGroup}><label style={styles.label}>Min Order Amount (₹)</label><input type="number" name="minOrderAmount" value={promoFormData.minOrderAmount} onChange={handlePromoInputChange} style={styles.input} placeholder="Optional" /></div>
                  <div style={styles.formGroup}><label style={styles.label}>Max Discount (₹)</label><input type="number" name="maxDiscount" value={promoFormData.maxDiscount} onChange={handlePromoInputChange} style={styles.input} placeholder="For percentage codes" /></div>
                  <div style={styles.formGroup}><label style={styles.label}>Usage Limit</label><input type="number" name="usageLimit" value={promoFormData.usageLimit} onChange={handlePromoInputChange} style={styles.input} placeholder="Unlimited if empty" /></div>
                </div>
                <div><button type="submit" style={styles.submitBtn}>Create Promo Code</button><button type="button" onClick={() => { setShowPromoForm(false); setEditingPromo(null); }} style={styles.cancelBtn}>Cancel</button></div>
              </form>
            </div>
          )}
          
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Code</th><th style={styles.th}>Type</th><th style={styles.th}>Value</th><th style={styles.th}>Expiry</th><th style={styles.th}>Min Order</th><th style={styles.th}>Uses</th><th style={styles.th}>Status</th><th style={styles.th}>Actions</th></tr></thead>
              <tbody>
                {promoCodes.map((promo) => (
                  <tr key={promo.id}>
                    <td style={styles.td}><strong>{promo.code}</strong></td>
                    <td style={styles.td}>{promo.type === 'percentage' ? 'Percentage' : 'Fixed'}</td>
                    <td style={styles.td}>{promo.type === 'percentage' ? `${promo.value}%` : `₹${promo.value}`}</td>
                    <td style={styles.td}>{new Date(promo.expiryDate).toLocaleDateString()}</td>
                    <td style={styles.td}>{promo.minOrderAmount ? `₹${promo.minOrderAmount}` : '-'}</td>
                    <td style={styles.td}>{promo.usedCount || 0}/{promo.usageLimit || '∞'}</td>
                    <td style={styles.td}><span style={promo.isActive ? styles.activeBadge : styles.inactiveBadge}>{promo.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => handleTogglePromoStatus(promo.id)}>{promo.isActive ? 'Deactivate' : 'Activate'}</button>
                      <button style={styles.deleteBtn} onClick={() => handleDeletePromo(promo.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {promoCodes.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>No promo codes created yet. Click "Create New Promo Code" to get started.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>#</th><th style={styles.th}>Name</th><th style={styles.th}>Email</th><th style={styles.th}>Phone</th><th style={styles.th}>Registered On</th><th style={styles.th}>Loyalty Points</th></tr></thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id || index}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}><strong>{user.name}</strong></td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{user.phone}</td>
                  <td style={styles.td}>{user.createdAt?.split('T')[0] || 'N/A'}</td>
                  <td style={styles.td}><strong style={{ color: '#e67e22' }}>{user.loyaltyPoints || 0} points</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div style={styles.tableContainer}>
          <div style={{ padding: '30px', textAlign: 'center' }}>
            <p style={{ marginBottom: '20px', fontSize: '16px', color: '#7f8c8d' }}>Manage your products - Add, Edit, or Remove products from your store</p>
            <button onClick={() => navigate('/admin-products')} style={styles.manageProductsBtn}>📦 Go to Product Management</button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={styles.modal} onClick={() => setSelectedOrder(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}><h2>Order Details - {selectedOrder.orderId || selectedOrder.id}</h2><button style={styles.closeBtn} onClick={() => setSelectedOrder(null)}>×</button></div>
            <div><h3>Customer Information</h3><p><strong>Name:</strong> {selectedOrder.customerName}</p><p><strong>Email:</strong> {selectedOrder.customerEmail}</p><p><strong>Phone:</strong> {selectedOrder.customerPhone}</p><p><strong>Address:</strong> {selectedOrder.shippingAddress || 'Store Pickup'}</p></div>
            <div style={{ marginTop: '20px' }}><h3>Order Items</h3>{selectedOrder.items?.map((item, idx) => (<div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>{item.name} - ₹{item.price} x {item.quantity} = ₹{item.price * item.quantity}</div>))}<p style={{ marginTop: '10px', fontWeight: 'bold' }}>Total: ₹{selectedOrder.totalAmount}</p>{selectedOrder.pointsEarned > 0 && <p style={{ marginTop: '10px', color: '#27ae60' }}>💎 Loyalty Points Earned: {selectedOrder.pointsEarned} points</p>}</div>
          </div>
        </div>
      )}

      {/* Message Details Modal */}
      {selectedMessage && (
        <div style={styles.modal} onClick={() => setSelectedMessage(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}><h2>Message from {selectedMessage.name}</h2><button style={styles.closeBtn} onClick={() => setSelectedMessage(null)}>×</button></div>
            <div style={styles.messageCard}><div style={styles.messageSubject}>📧 {selectedMessage.subject}</div><div style={styles.messageMeta}><span>👤 {selectedMessage.name}</span><span>✉️ {selectedMessage.email}</span>{selectedMessage.phone && <span>📞 {selectedMessage.phone}</span>}<span>📅 {new Date(selectedMessage.createdAt).toLocaleString()}</span></div><div style={styles.messageText}>{selectedMessage.message}</div><div style={styles.messageReply}><strong>💡 Reply to customer:</strong><br />Email: <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a><br />Phone: <a href={`tel:${selectedMessage.phone}`}>{selectedMessage.phone}</a></div></div>
            <button onClick={() => { markMessageAsRead(selectedMessage.id); setSelectedMessage(null); }} style={{ ...styles.viewBtn, width: '100%', marginTop: '10px' }}>Mark as Read</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;