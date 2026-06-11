import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { getCart, getVariantById, getProductById, updateCartItem, deleteCartItem } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCartData = async () => {
    try {
      const cartRes = await getCart();
      const items = await Promise.all(cartRes.data.map(async (cartItem) => {
        const variantRes = await getVariantById(cartItem.variantId);
        const productRes = await getProductById(variantRes.data.productId);
        return {
          ...cartItem,
          variant: variantRes.data,
          product: productRes.data,
          availableStock: variantRes.data.stock - variantRes.data.reservedStock
        };
      }));
      setCartItems(items);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleUpdateQuantity = async (id, currentQty, availableStock, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    if (newQty > availableStock) {
      toast.warning('Vượt quá số lượng sản phẩm có sẵn!');
      return;
    }

    try {
      await updateCartItem(id, { quantity: newQty });
      setCartItems(cartItems.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    } catch (error) {
      toast.error('Lỗi khi cập nhật giỏ hàng');
    }
  };

  const handleDelete = async (id) => {
    try {
      // Workaround: Thay vì dùng DELETE (đang bị lỗi 500 do json-server), ta dùng PATCH để đổi userId thành -1
      // Điều này sẽ làm sản phẩm "biến mất" khỏi giỏ hàng của user hiện tại một cách an toàn.
      await updateCartItem(id, { userId: -1 });

      setCartItems(cartItems.filter(item => item.id !== id));
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      const errorMsg = error.response ? `HTTP ${error.response.status}` : error.message;
      toast.error(`Lỗi khi xóa sản phẩm: ${errorMsg}`);
    }
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.variant.price * item.quantity), 0);

  if (loading) return <Container className="py-5 text-center">Đang tải giỏ hàng...</Container>;

  if (cartItems.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h4 className="mb-4">Giỏ hàng của bạn đang trống</h4>
        <Link to="/">
          <Button variant="danger">Về trang chủ</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container style={{ maxWidth: '800px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/" className="text-danger text-decoration-none fw-semibold">
          &lt; Mua thêm sản phẩm khác
        </Link>
        <h4 className="fw-bold m-0">Giỏ hàng của bạn</h4>
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          {cartItems.map((item) => (
            <div key={item.id} className="d-flex py-3 border-bottom position-relative">
              <Button
                variant="link"
                className="text-muted position-absolute top-0 end-0 p-3 text-decoration-none"
                onClick={() => handleDelete(item.id)}
              >
                <FaTrash />
              </Button>

              <div style={{ width: '100px' }}>
                <img src={item.variant.image || item.product.thumbnail} alt={item.product.name} className="w-100 object-fit-contain" />
              </div>

              <div className="flex-grow-1 ms-3">
                <h6 className="fw-bold mb-1">{item.product.name}</h6>
                <div className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                  Màu: {item.variant.color} | Dung lượng: {item.variant.storage}
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-danger fw-bold me-2">{formatPrice(item.variant.price)}</span>
                    {item.variant.oldPrice && <span className="text-muted text-decoration-line-through" style={{ fontSize: '0.85rem' }}>{formatPrice(item.variant.oldPrice)}</span>}
                  </div>
                  <div className="d-flex align-items-center border rounded">
                    <Button
                      variant="light"
                      size="sm"
                      className="border-0 px-2 fw-bold"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, item.availableStock, -1)}
                    >-</Button>
                    <span className="px-3">{item.quantity}</span>
                    <Button
                      variant="light"
                      size="sm"
                      className="border-0 px-2 fw-bold"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, item.availableStock, 1)}
                    >+</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="d-flex justify-content-between align-items-center mt-4">
            <span className="fw-bold">Tạm tính:</span>
            <span className="text-danger fw-bold fs-5">{formatPrice(totalPrice)}</span>
          </div>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center bg-white p-3 border rounded shadow-sm sticky-bottom mb-4">
        <div>
          <div className="fw-bold">Tổng tiền:</div>
          <div className="text-danger fw-bold fs-4">{formatPrice(totalPrice)}</div>
        </div>
        <Button
          variant="danger"
          size="lg"
          className="px-5 text-uppercase fw-bold"
          onClick={() => navigate('/checkout')}
        >
          ĐẶT HÀNG
        </Button>
      </div>
    </Container>
  );
};

export default Cart;
