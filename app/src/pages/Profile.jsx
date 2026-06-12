import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { updateUser } from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setFormData({
      fullName: parsedUser.fullName || '',
      email: parsedUser.email || '',
      phone: parsedUser.phone || '',
      password: parsedUser.password || '',
      avatar: parsedUser.avatar || ''
    });
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.password) {
      toast.warning('Vui lòng nhập đầy đủ họ tên và mật khẩu!');
      return;
    }

    setLoading(true);
    try {
      const updatedData = {
        ...user,
        ...formData,
        updatedAt: new Date().toISOString()
      };

      const res = await updateUser(user.id, updatedData);

      // Update local storage
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);

      toast.success('Cập nhật thông tin cá nhân thành công!');
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi cập nhật!');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  return (
    <Container className="py-5" style={{ maxWidth: '1000px' }}>
      <Row>
        <Col md={4} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center p-4">
              <div className="mb-3">
                <img
                  src={user.avatar || 'https://via.placeholder.com/150'}
                  alt={user.fullName}
                  className="rounded-circle border"
                  style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                />
              </div>
              <h5 className="fw-bold mb-1">{user.fullName}</h5>
              <p className="text-muted mb-3">@{user.username}</p>

              <div className="d-flex justify-content-center gap-2 mb-4">
                <Badge bg="primary" className="px-3 py-2">Hạng: {user.rank || 'BRONZE'}</Badge>
                {user.isActive ? (
                  <Badge bg="success" className="px-3 py-2">Hoạt động</Badge>
                ) : (
                  <Badge bg="danger" className="px-3 py-2">Bị khóa</Badge>
                )}
              </div>

              <div className="text-start bg-light p-3 rounded">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted fw-semibold" style={{ fontSize: '0.9rem' }}>Vai trò:</span>
                  <span className="fw-bold">***</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted fw-semibold" style={{ fontSize: '0.9rem' }}>Chi tiêu:</span>
                  <span className="fw-bold text-danger">{formatPrice(user.totalSpent)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted fw-semibold" style={{ fontSize: '0.9rem' }}>Giảm giá:</span>
                  <span className="fw-bold text-success">{user.discountPercent || 0}%</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted fw-semibold" style={{ fontSize: '0.9rem' }}>Trạng thái xóa:</span>
                  <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>{user.isDeleted ? 'Đã xóa' : 'Không'}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted fw-semibold" style={{ fontSize: '0.9rem' }}>Ngày tạo:</span>
                  <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>{formatDate(user.createdAt)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted fw-semibold" style={{ fontSize: '0.9rem' }}>Cập nhật:</span>
                  <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>{formatDate(user.updatedAt)}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3 border-bottom">
              <h5 className="fw-bold mb-0 text-danger">Chỉnh sửa thông tin</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleUpdate}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-muted">ID Người dùng</Form.Label>
                      <Form.Control type="text" value={user.id} disabled className="bg-light" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-muted">Tên đăng nhập</Form.Label>
                      <Form.Control type="text" value={user.username} disabled className="bg-light" />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Họ và tên <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Mật khẩu <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="***"
                  />
                  <Form.Text className="text-muted">
                    Lưu ý: Mật khẩu cũ được ẩn bằng dấu *. Nhập mật khẩu mới nếu muốn thay đổi.
                  </Form.Text>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Số điện thoại</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Ảnh đại diện (URL)</Form.Label>
                  <Form.Control
                    type="text"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </Form.Group>

                <div className="d-flex justify-content-end mt-4">
                  <Button
                    variant="danger"
                    type="submit"
                    className="fw-bold px-4 py-2"
                    disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'LƯU THAY ĐỔI'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
