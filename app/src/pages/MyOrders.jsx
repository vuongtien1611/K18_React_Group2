import { useState, useEffect } from 'react';
import { Container, Card, Badge, Button } from 'react-bootstrap';
import { getOrdersByUserId, getOrderItemsByOrderId } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = 2; // Giả định ID user hiện tại là 2 (Khách hàng mẫu)
        const res = await getOrdersByUserId(userId);

        // Fetch order items for each order
        const ordersWithItems = await Promise.all(res.data.map(async (order) => {
          const itemsRes = await getOrderItemsByOrderId(order.id);
          return {
            ...order,
            items: itemsRes.data
          };
        }));

        // Sort by id descending
        setOrders(ordersWithItems.sort((a, b) => b.id - a.id));
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error('Có lỗi khi tải danh sách đơn hàng');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <Badge bg="warning" text="dark">Chờ xác nhận</Badge>;
      case 'PROCESSING': return <Badge bg="info">Đang xử lý</Badge>;
      case 'SHIPPED': return <Badge bg="primary">Đang giao hàng</Badge>;
      case 'COMPLETED': return <Badge bg="success">Đã giao thành công</Badge>;
      case 'CANCELLED': return <Badge bg="danger">Đã hủy</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading) return <Container className="py-5 text-center">Đang tải...</Container>;

  return (
    <Container className="py-4" style={{ maxWidth: '1000px' }}>
      <h3 className="fw-bold mb-4">Đơn hàng của tôi</h3>

      {orders.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm">
          <Card.Body>
            <h5 className="text-muted">Bạn chưa có đơn hàng nào.</h5>
            <Button variant="danger" className="mt-3" onClick={() => navigate('/')}>Tiếp tục mua sắm</Button>
          </Card.Body>
        </Card>
      ) : (
        orders.map(order => (
          <Card key={order.id} className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
              <div>
                <span className="fw-bold me-3">Đơn hàng #{order.id}</span>
                <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                  {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                  {order.paymentMethod === 'ONLINE' ? 'Chuyển khoản QR' : 'Thanh toán khi nhận hàng (COD)'}
                </span>
                {getStatusBadge(order.status)}
              </div>
            </Card.Header>
            <Card.Body>
              {order.items && order.items.map(item => (
                <div key={item.id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                  <img
                    src={item.thumbnail}
                    alt={item.productName}
                    style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                    className="border rounded me-3"
                  />
                  <div className="flex-grow-1">
                    <div className="fw-bold">{item.productName}</div>
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>{item.variantName}</div>
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>Số lượng: {item.quantity}</div>
                  </div>
                  <div className="text-end">
                    <div className="text-danger fw-bold">{formatPrice(item.priceAtPurchase)}</div>
                  </div>
                </div>
              ))}

              <div className="d-flex justify-content-end align-items-center mt-3 gap-3">
                <span className="text-muted">Tổng số tiền:</span>
                <span className="text-danger fw-bold fs-5">{formatPrice(order.finalAmount)}</span>
              </div>
            </Card.Body>
            {order.status === 'PENDING' && order.paymentMethod === 'ONLINE' && order.paymentStatus === 'UNPAID' && (
              <Card.Footer className="bg-white text-end py-3">
                <Button variant="danger" onClick={() => navigate(`/payment-qr/${order.id}`)}>
                  Thanh toán ngay
                </Button>
              </Card.Footer>
            )}
          </Card>
        ))
      )}
    </Container>
  );
};

export default MyOrders;
