import { Outlet, Link } from 'react-router-dom';
import { Container, Row, Col, Nav } from 'react-bootstrap';

const AdminLayout = () => {
  return (
    <Container fluid>
      <Row>
        <Col md={2} className="bg-dark text-white min-vh-100 p-3">
          <h4 className="mb-4 text-center">Admin Panel</h4>
          <Nav className="flex-column gap-2">
            <Link to="/admin" className="text-white text-decoration-none">Dashboard</Link>
            <Link to="/admin/orders" className="text-white text-decoration-none">Đơn hàng</Link>
            <Link to="/admin/products" className="text-white text-decoration-none">Sản phẩm</Link>
            <Link to="/admin/categories" className="text-white text-decoration-none">Danh mục</Link>
            <Link to="/admin/articles" className="text-white text-decoration-none">Bài viết & Thông số</Link>
            <Link to="/" className="text-warning text-decoration-none mt-4">← Về trang khách</Link>
          </Nav>
        </Col>
        <Col md={10} className="p-4 bg-light">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;
