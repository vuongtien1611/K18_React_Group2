import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-white text-dark py-5 mt-5 border-top shadow-sm">
      <Container>
        <Row>
          <Col md={3} className="mb-4">
            <h5 className="fw-bold mb-3">Tổng đài hỗ trợ</h5>
            <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
              <li className="mb-2">Gọi mua: <span className="fw-bold text-danger">1800.2097</span> (8h00 - 22h00)</li>
              <li className="mb-2">Khiếu nại: <span className="fw-bold text-danger">1800.2063</span> (8h00 - 21h30)</li>
              <li className="mb-2">Bảo hành: <span className="fw-bold text-danger">1800.2064</span> (8h00 - 21h00)</li>
            </ul>
          </Col>
          <Col md={3} className="mb-4">
            <h5 className="fw-bold mb-3">Về hệ thống cửa hàng</h5>
            <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
              <li className="mb-2"><a href="#" className="text-dark text-decoration-none hover-danger">Nội quy cửa hàng</a></li>
              <li className="mb-2"><a href="#" className="text-dark text-decoration-none hover-danger">Chất lượng phục vụ</a></li>
              <li className="mb-2"><a href="#" className="text-dark text-decoration-none hover-danger">Chính sách bảo hành</a></li>
            </ul>
          </Col>
          <Col md={3} className="mb-4">
            <h5 className="fw-bold mb-3">Chính sách mua hàng</h5>
            <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
              <li className="mb-2"><a href="#" className="text-dark text-decoration-none hover-danger">Giao hàng và thanh toán</a></li>
              <li className="mb-2"><a href="#" className="text-dark text-decoration-none hover-danger">Hướng dẫn mua online</a></li>
              <li className="mb-2"><a href="#" className="text-dark text-decoration-none hover-danger">Mua trả góp</a></li>
            </ul>
          </Col>
          <Col md={3} className="mb-4">
            <h5 className="fw-bold mb-3">Kết nối với chúng tôi</h5>
            <div className="d-flex gap-3">
              <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: 35, height: 35}}>YT</div>
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: 35, height: 35}}>FB</div>
              <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: 35, height: 35}}>ZL</div>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
