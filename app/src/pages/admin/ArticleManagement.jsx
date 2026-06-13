import { useState, useEffect } from 'react';
import { Container, Card, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProducts } from '../../services/api';

const ArticleManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data.filter(p => !p.isDeleted));
    } catch (error) {
      toast.error('Lỗi khi tải danh sách sản phẩm');
    }
  };

  const handleSelectProduct = (pId) => {
    navigate(`/admin/articles/${pId}`);
  };

  return (
    <Container fluid className="py-4 h-100 d-flex flex-column">
      <h2 className="mb-4">Bài viết & Thông số kỹ thuật</h2>

      <Card className="border-0 shadow-sm flex-grow-1 d-flex flex-column" style={{ minHeight: '0' }}>
        <Card.Body className="d-flex flex-column">
          <Form.Group className="d-flex flex-column h-100">
            <Form.Label className="fw-bold">Tìm kiếm & Chọn sản phẩm để chỉnh sửa</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập tên sản phẩm để tìm kiếm..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="mb-3"
            />
            <div className="list-group flex-grow-1" style={{ overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.375rem' }}>
              {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                <button
                  key={p.id}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleSelectProduct(p.id)}
                >
                  <div className="d-flex align-items-center">
                    <img src={p.thumbnail} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'contain', marginRight: '15px' }} className="border rounded bg-white" />
                    <div>
                      <strong style={{ fontSize: '1.1rem' }}>{p.name}</strong>
                      <div className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>ID: {p.id} - Bấm để chỉnh sửa bài viết & thông số</div>
                    </div>
                  </div>
                </button>
              ))}
              {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                <div className="text-center py-5 text-muted">
                  <h5>Không tìm thấy sản phẩm nào phù hợp</h5>
                </div>
              )}
            </div>
          </Form.Group>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ArticleManagement;
