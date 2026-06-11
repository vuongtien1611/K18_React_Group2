import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  getCart, getVariantById, getProductById, getAddresses, updateAddress, getCoupons,
  createOrder, createOrderItem, createPayment, deleteCartItem, createStockLog, updateVariant, createOrderStatusLog
} from '../services/api';
import { toast } from 'react-toastify';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [note, setNote] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartRes, addressRes] = await Promise.all([
          getCart(2),
          getAddresses(2)
        ]);

        if (cartRes.data.length === 0) {
          navigate('/cart');
          return;
        }

        const items = await Promise.all(cartRes.data.map(async (cartItem) => {
          const variantRes = await getVariantById(cartItem.variantId);
          const productRes = await getProductById(variantRes.data.productId);
          return {
            ...cartItem,
            variant: variantRes.data,
            product: productRes.data
          };
        }));

        setCartItems(items);
        setAddresses(addressRes.data);
        if (addressRes.data.length > 0) {
          setSelectedAddress(addressRes.data.find(a => a.isDefault) || addressRes.data[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error('Lỗi khi tải dữ liệu thanh toán');
      }
    };
    fetchData();
  }, [navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.variant.price * item.quantity), 0);
  const shippingFee = 30000;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENT') {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
      if (discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const finalAmount = subtotal + shippingFee - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await getCoupons();
      const coupon = res.data.find(c => c.code === couponCode && c.isActive);

      if (!coupon) {
        setCouponError('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
        setAppliedCoupon(null);
        return;
      }
      if (subtotal < coupon.minOrderValue) {
        setCouponError(`Đơn hàng tối thiểu ${formatPrice(coupon.minOrderValue)} để áp dụng.`);
        setAppliedCoupon(null);
        return;
      }

      setCouponError('');
      setAppliedCoupon(coupon);
      toast.success('Áp dụng mã giảm giá thành công!');
    } catch (error) {
      toast.error('Lỗi khi kiểm tra mã giảm giá');
    }
  };

  const handleSaveAddress = async () => {
    if (!editingAddress.fullName || !editingAddress.phone || !editingAddress.detail) {
      toast.warning('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }
    setSavingAddress(true);
    try {
      await updateAddress(editingAddress.id, editingAddress);

      const newAddresses = addresses.map(addr => addr.id === editingAddress.id ? editingAddress : addr);
      setAddresses(newAddresses);

      if (selectedAddress?.id === editingAddress.id) {
        setSelectedAddress(editingAddress);
      }

      toast.success('Cập nhật địa chỉ thành công');
      setShowAddressModal(false);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật địa chỉ');
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create Order
      const orderData = {
        userId: 2,
        addressId: selectedAddress.id,
        status: "PENDING",
        paymentStatus: "UNPAID",
        paymentMethod: paymentMethod,
        couponId: appliedCoupon ? appliedCoupon.id : null,
        totalAmount: subtotal,
        discountAmount: discountAmount,
        shippingFee: shippingFee,
        finalAmount: finalAmount,
        note: note,
        cancelReason: "",
        confirmedBy: null,
        completedAt: null,
        isDeleted: false,
        createdAt: new Date().toISOString()
      };

      const orderRes = await createOrder(orderData);
      const newOrder = orderRes.data;

      // 2. Create Order Items & Update Stock & Stock Logs
      for (const item of cartItems) {
        await createOrderItem({
          orderId: newOrder.id,
          productId: item.product?.id,
          variantId: item.variant?.id,
          productName: item.product?.name || "Sản phẩm",
          variantName: `${item.variant?.color} - ${item.variant?.storage}`,
          thumbnail: item.variant?.image || item.product?.thumbnail || "",
          priceAtPurchase: item.variant?.price || 0,
          quantity: item.quantity || 1,
          subtotal: (item.variant?.price || 0) * (item.quantity || 1)
        });

        try {
          const currentStock = parseInt(item.variant?.stock || 0);
          const qty = parseInt(item.quantity || 1);
          const newStock = currentStock - qty;

          if (item.variant?.id) {
            await updateVariant(item.variant.id, { stock: newStock });
            await createStockLog({
              variantId: item.variant.id,
              type: "EXPORT",
              quantity: -qty,
              stockBefore: currentStock,
              stockAfter: newStock,
              reason: "Khách đặt hàng",
              createdBy: 2,
              orderId: newOrder.id,
              createdAt: new Date().toISOString()
            });
          }
        } catch (stockErr) {
          console.warn("Stock update failed", stockErr);
        }
      }

      // 3. Create Status Log
      try {
        await createOrderStatusLog({
          orderId: newOrder.id,
          fromStatus: null,
          toStatus: "PENDING",
          changedBy: 2,
          note: "Khách hàng tạo đơn",
          createdAt: new Date().toISOString()
        });
      } catch (logErr) {
        console.warn("Status log failed", logErr);
      }

      // 4. Create Payment (if ONLINE)
      if (paymentMethod === 'ONLINE') {
        try {
          await createPayment({
            orderId: newOrder.id,
            method: "ONLINE",
            status: "UNPAID",
            transactionCode: null,
            qrContent: `${orderData.userId} thanh toan don hang ${newOrder.id}`,
            paidAmount: 0,
            paidAt: null,
            confirmedBy: null,
            createdAt: new Date().toISOString()
          });
        } catch (payErr) {
          console.warn("Payment create failed", payErr);
        }
      }

      // 5. Clear Cart
      for (const item of cartItems) {
        try {
          await deleteCartItem(item.id);
        } catch (cartErr) {
          console.warn("Delete cart item failed", cartErr);
        }
      }

      toast.success('Đặt hàng thành công!');

      if (paymentMethod === 'ONLINE') {
        navigate(`/payment-qr/${newOrder.id}`);
      } else {
        navigate('/admin/orders');
      }

    } catch (error) {
      console.error(error);
      let errorMsg = error.message;
      if (error.response) {
        errorMsg += ` - Status: ${error.response.status} - Data: ${JSON.stringify(error.response.data)}`;
      }
      toast.error('Có lỗi xảy ra khi đặt hàng: ' + errorMsg);
      setSubmitting(false);
    }
  };

  if (loading) return <Container className="py-5 text-center">Đang tải...</Container>;

  return (
    <Container style={{ maxWidth: '1000px' }}>
      <h3 className="fw-bold mb-4">Thanh toán</h3>
      <Row>
        <Col md={7}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h5 className="fw-bold mb-3">Thông tin giao hàng</h5>
              {addresses.map(addr => (
                <div
                  key={addr.id}
                  className={`p-3 border rounded mb-2 cursor-pointer d-flex justify-content-between align-items-center shadow-sm transition-all ${selectedAddress?.id === addr.id ? 'border-danger bg-danger bg-opacity-10' : ''}`}
                  onClick={() => setSelectedAddress(addr)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <div className="fw-bold fs-6">{addr.fullName} - {addr.phone} {addr.isDefault && <span className="badge bg-danger ms-2">Mặc định</span>}</div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.9rem' }}>
                      {addr.detail}, {addr.ward}, {addr.district}, {addr.province}
                    </div>
                  </div>
                  <Button
                    variant="light"
                    size="sm"
                    className="px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAddress({ ...addr });
                      setShowAddressModal(true);
                    }}
                  >
                    Sửa
                  </Button>
                </div>
              ))}

              <Form.Group className="mt-4">
                <Form.Label className="fw-bold">Ghi chú đơn hàng</Form.Label>
                <Form.Control as="textarea" rows={2} placeholder="Nhập ghi chú (không bắt buộc)" value={note} onChange={e => setNote(e.target.value)} />
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h5 className="fw-bold mb-3">Phương thức thanh toán</h5>
              <div className="d-flex flex-column gap-2">
                <div
                  className={`p-3 border rounded cursor-pointer d-flex align-items-center gap-2 ${paymentMethod === 'ONLINE' ? 'border-danger bg-danger bg-opacity-10' : ''}`}
                  onClick={() => setPaymentMethod('ONLINE')}
                  style={{ cursor: 'pointer' }}
                >
                  <Form.Check type="radio" checked={paymentMethod === 'ONLINE'} readOnly />
                  <div>
                    <div className="fw-bold">Chuyển khoản QR (Khuyên dùng)</div>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>Quét mã QR qua ứng dụng ngân hàng</div>
                  </div>
                </div>
                <div
                  className={`p-3 border rounded cursor-pointer d-flex align-items-center gap-2 ${paymentMethod === 'COD' ? 'border-danger bg-danger bg-opacity-10' : ''}`}
                  onClick={() => setPaymentMethod('COD')}
                  style={{ cursor: 'pointer' }}
                >
                  <Form.Check type="radio" checked={paymentMethod === 'COD'} readOnly />
                  <div>
                    <div className="fw-bold">Thanh toán khi nhận hàng (COD)</div>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>Thanh toán bằng tiền mặt khi giao hàng</div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={5}>
          <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Body>
              <h5 className="fw-bold mb-3">Đơn hàng của bạn</h5>

              <div className="mb-3">
                {cartItems.map(item => (
                  <div key={item.id} className="d-flex align-items-center mb-3">
                    <img src={item.variant.image || item.product.thumbnail} alt={item.product.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} className="border rounded" />
                    <div className="ms-2 flex-grow-1">
                      <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{item.product.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{item.variant.color} - {item.variant.storage}</div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{formatPrice(item.variant.price)}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>x{item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>

              <hr />

              <div className="mb-3">
                <Form.Group className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Mã giảm giá"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon}
                  />
                  {!appliedCoupon ? (
                    <Button variant="dark" onClick={handleApplyCoupon}>Áp dụng</Button>
                  ) : (
                    <Button variant="outline-danger" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}>Hủy</Button>
                  )}
                </Form.Group>
                {couponError && <div className="text-danger mt-1" style={{ fontSize: '0.85rem' }}>{couponError}</div>}
                {appliedCoupon && <div className="text-success mt-1" style={{ fontSize: '0.85rem' }}>Đã áp dụng: {appliedCoupon.code}</div>}
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tạm tính:</span>
                <span className="fw-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Phí vận chuyển:</span>
                <span className="fw-semibold">{formatPrice(shippingFee)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Giảm giá:</span>
                  <span className="fw-semibold">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <hr />

              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold fs-5">Tổng tiền:</span>
                <span className="text-danger fw-bold fs-4">{formatPrice(finalAmount)}</span>
              </div>

              <Button
                variant="danger"
                size="lg"
                className="w-100 fw-bold text-uppercase"
                onClick={handlePlaceOrder}
                disabled={submitting}
              >
                {submitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} backdrop="static" keyboard={false}>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-danger">Sửa địa chỉ nhận hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingAddress && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Họ và tên <span className="text-danger">*</span></Form.Label>
                <Form.Control type="text" value={editingAddress.fullName} onChange={(e) => setEditingAddress({ ...editingAddress, fullName: e.target.value })} placeholder="Nhập họ tên" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Số điện thoại <span className="text-danger">*</span></Form.Label>
                <Form.Control type="text" value={editingAddress.phone} onChange={(e) => setEditingAddress({ ...editingAddress, phone: e.target.value })} placeholder="Nhập số điện thoại" />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Tỉnh/Thành phố</Form.Label>
                    <Form.Control type="text" value={editingAddress.province} onChange={(e) => setEditingAddress({ ...editingAddress, province: e.target.value })} placeholder="Ví dụ: Hồ Chí Minh" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Quận/Huyện</Form.Label>
                    <Form.Control type="text" value={editingAddress.district} onChange={(e) => setEditingAddress({ ...editingAddress, district: e.target.value })} placeholder="Ví dụ: Quận 1" />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Phường/Xã</Form.Label>
                <Form.Control type="text" value={editingAddress.ward} onChange={(e) => setEditingAddress({ ...editingAddress, ward: e.target.value })} placeholder="Ví dụ: Phường Bến Nghé" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Địa chỉ chi tiết <span className="text-danger">*</span></Form.Label>
                <Form.Control type="text" value={editingAddress.detail} onChange={(e) => setEditingAddress({ ...editingAddress, detail: e.target.value })} placeholder="Số nhà, tên đường..." />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowAddressModal(false)} className="fw-semibold">Hủy</Button>
          <Button variant="danger" disabled={savingAddress} onClick={handleSaveAddress} className="fw-semibold">
            {savingAddress ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default Checkout;
