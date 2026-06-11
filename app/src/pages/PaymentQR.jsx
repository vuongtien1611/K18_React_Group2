import { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrders, updateOrder, updatePayment } from '../services/api';
import { toast } from 'react-toastify';
import axios from 'axios';

const PaymentQR = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const orderRes = await getOrders();
        const currentOrder = orderRes.data.find(o => o.id === parseInt(orderId));

        if (!currentOrder) {
          toast.error('Không tìm thấy đơn hàng');
          navigate('/');
          return;
        }

        setOrder(currentOrder);

        // Fetch payment
        const paymentsRes = await axios.get(`http://localhost:3000/payments?orderId=${orderId}`);
        if (paymentsRes.data.length > 0) {
          setPayment(paymentsRes.data[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error('Lỗi tải thông tin thanh toán');
      }
    };

    fetchOrderData();
  }, [orderId, navigate]);

  const handleSimulatePayment = async () => {
    try {
      if (payment) {
        await updatePayment(payment.id, {
          status: 'PAID',
          paidAmount: order.finalAmount,
          paidAt: new Date().toISOString(),
          confirmedBy: 1
        });
      }

      await updateOrder(order.id, {
        paymentStatus: 'PAID',
        status: 'PROCESSING'
      });

      toast.success('Thanh toán thành công! Đơn hàng đang được xử lý.');
      navigate('/');
    } catch (error) {
      toast.error('Lỗi khi mô phỏng thanh toán');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) return <Container className="py-5 text-center"><Spinner animation="border" variant="danger" /></Container>;

  const accountNo = "8830347378";
  const bankId = "bidv";
  const accountName = "VUONG DUC TIEN";
  // Content: [id khách hàng] thanh toán đơn hàng[id đơn hàng]
  const qrContent = payment?.qrContent || `${order.userId} thanh toan don hang ${order.id}`;

  const qrImageUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${order.finalAmount}&addInfo=${encodeURIComponent(qrContent)}&accountName=${encodeURIComponent(accountName)}`;

  return (
    <Container className="py-5" style={{ maxWidth: '600px' }}>
      <Card className="border-0 shadow">
        <Card.Body className="text-center p-5">
          <h3 className="fw-bold text-danger mb-4">Thanh toán đơn hàng #{order.id}</h3>

          <div className="mb-4">
            <img src={qrImageUrl} alt="Mã QR Thanh Toán BIDV" style={{ width: '100%', maxWidth: '350px' }} className="rounded shadow-sm" />
          </div>

          <div className="bg-light p-3 rounded mb-4 text-start d-inline-block w-100">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Nội dung chuyển khoản:</span>
              <span className="fw-bold">{payment?.qrContent}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Số tiền cần thanh toán:</span>
              <span className="fw-bold text-danger fs-5">{formatPrice(order.finalAmount)}</span>
            </div>
          </div>

          <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
            Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử để thanh toán.
            Đơn hàng sẽ tự động được xử lý sau khi thanh toán thành công.
          </p>

          <div className="d-flex flex-column gap-3">
            <Button variant="danger" size="lg" onClick={handleSimulatePayment}>
              Đã thanh toán
            </Button>
            <Button variant="outline-secondary" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PaymentQR;
