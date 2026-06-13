import { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col } from 'react-bootstrap';
import { getOrders, updateOrder, createOrderStatusLog, getOrderItems } from '../../services/api';
import { toast } from 'react-toastify';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filterOrderId, setFilterOrderId] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterProductName, setFilterProductName] = useState('');

  const fetchOrders = async () => {
    try {
      const [ordersRes, itemsRes] = await Promise.all([getOrders(), getOrderItems()]);
      const items = itemsRes.data || [];
      // Sort by newest
      const sorted = ordersRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const ordersWithItems = sorted.map(o => ({
        ...o,
        items: items.filter(i => i.orderId === o.id)
      }));

      setOrders(ordersWithItems);
      setFilteredOrders(ordersWithItems);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi tải danh sách đơn hàng');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Effect for filtering
  useEffect(() => {
    let result = [...orders];

    if (filterOrderId.trim()) {
      result = result.filter(o => o.id.toString() === filterOrderId.trim());
    }
    if (filterUserId.trim()) {
      result = result.filter(o => o.userId.toString() === filterUserId.trim());
    }
    if (filterPaymentMethod) {
      result = result.filter(o => o.paymentMethod === filterPaymentMethod);
    }
    if (filterStatus) {
      result = result.filter(o => o.status === filterStatus);
    }
    if (filterPaymentStatus) {
      result = result.filter(o => o.paymentStatus === filterPaymentStatus);
    }
    if (filterDate) {
      result = result.filter(o => {
        if (!o.createdAt) return false;
        const oDate = new Date(o.createdAt).toISOString().split('T')[0];
        return oDate === filterDate;
      });
    }
    if (filterProductName.trim()) {
      const term = filterProductName.toLowerCase().trim();
      result = result.filter(o =>
        o.items && o.items.some(i => i.productName && i.productName.toLowerCase().includes(term))
      );
    }

    setFilteredOrders(result);
  }, [filterOrderId, filterUserId, filterPaymentMethod, filterStatus, filterPaymentStatus, filterDate, filterProductName, orders]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <Badge bg="warning" text="dark">Chờ xác nhận</Badge>;
      case 'PROCESSING': return <Badge bg="info">Đang xử lý</Badge>;
      case 'SHIPPED': return <Badge bg="primary">Đang giao hàng</Badge>;
      case 'COMPLETED': return <Badge bg="success">Hoàn thành</Badge>;
      case 'CANCELLED': return <Badge bg="danger">Đã hủy</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handleStatusChange = async (order, newStatus) => {
    if (order.status === newStatus) return;

    try {
      // 1. Update order
      const updateData = { status: newStatus };
      if (newStatus === 'COMPLETED') {
        updateData.completedAt = new Date().toISOString();
      }
      await updateOrder(order.id, updateData);

      // 2. Create status log
      await createOrderStatusLog({
        orderId: order.id,
        fromStatus: order.status,
        toStatus: newStatus,
        changedBy: 1, // Admin ID
        note: `Admin cập nhật trạng thái sang ${newStatus}`,
        createdAt: new Date().toISOString()
      });

      toast.success(`Cập nhật đơn hàng #${order.id} thành công`);
      fetchOrders(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h2 className="mb-4 fw-bold">Quản lý Đơn hàng</h2>

      {/* Bộ lọc */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Control type="text" placeholder="Mã đơn hàng" value={filterOrderId} onChange={e => setFilterOrderId(e.target.value)} />
            </Col>
            <Col md={3}>
              <Form.Control type="text" placeholder="Mã khách hàng" value={filterUserId} onChange={e => setFilterUserId(e.target.value)} />
            </Col>
            <Col md={6}>
              <Form.Control type="text" placeholder="Tên sản phẩm trong đơn..." value={filterProductName} onChange={e => setFilterProductName(e.target.value)} />
            </Col>
            <Col md={3}>
              <Form.Select value={filterPaymentMethod} onChange={e => setFilterPaymentMethod(e.target.value)}>
                <option value="">Tất cả PT thanh toán</option>
                <option value="ONLINE">Chuyển khoản (ONLINE)</option>
                <option value="COD">Tiền mặt (COD)</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={filterPaymentStatus} onChange={e => setFilterPaymentStatus(e.target.value)}>
                <option value="">Tình trạng thanh toán</option>
                <option value="PAID">Đã thanh toán</option>
                <option value="UNPAID">Chưa thanh toán</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xác nhận</option>
                <option value="PROCESSING">Đang xử lý</option>
                <option value="SHIPPED">Đang giao hàng</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Control type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Table responsive hover>
            <thead className="table-light">
            <tr>
              <th>Mã ĐH</th>
              <th>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>Ngày tạo</th>
              <th>Tổng tiền</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
            </thead>
            <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="fw-bold">#{order.id}</td>
                <td>User #{order.userId}</td>
                <td style={{ maxWidth: '250px' }}>
                  {order.items && order.items.length > 0 ? (
                    <ul className="mb-0 ps-3" style={{ fontSize: '0.85rem' }}>
                      {order.items.map(item => (
                        <li key={item.id}>{item.productName} <span className="text-muted">(x{item.quantity})</span></li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted small">Không có dữ liệu SP</span>
                  )}
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="text-danger fw-bold">{formatPrice(order.finalAmount)}</td>
                <td>
                  {order.paymentStatus === 'PAID' ?
                    <Badge bg="success">Đã thanh toán</Badge> :
                    <Badge bg="warning" text="dark">Chưa thanh toán</Badge>
                  }
                  <div className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>{order.paymentMethod}</div>
                </td>
                <td>{getStatusBadge(order.status)}</td>
                <td>
                  <Form.Select
                    size="sm"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                    disabled={order.status === 'COMPLETED' || order.status === 'CANCELLED'}
                    style={{ width: '140px' }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </Form.Select>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted">Không tìm thấy đơn hàng nào phù hợp</td>
              </tr>
            )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default OrderManagement;

