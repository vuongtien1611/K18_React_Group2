import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import {
  getProductById,
  updateProduct,
  getProductArticles,
  createProductArticle,
  updateProductArticle,
  getProductSpecs,
  createProductSpec,
  deleteProductSpec
} from '../../services/api';

const ArticleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // States for selected product
  const [product, setProduct] = useState(null);
  const [shortDescription, setShortDescription] = useState('');

  // States for Article
  const [article, setArticle] = useState(null);
  const [articleData, setArticleData] = useState({
    title: '',
    summary: '',
    content: '',
    seoTitle: '',
    seoDescription: ''
  });

  // States for Specs
  const [specs, setSpecs] = useState([]);
  const [newSpec, setNewSpec] = useState({ group: '', key: '', value: '' });

  useEffect(() => {
    if (id) {
      fetchProductData(id);
    }
  }, [id]);

  const fetchProductData = async (pId) => {
    try {
      // Fetch product details
      const prodRes = await getProductById(pId);
      setProduct(prodRes.data);
      setShortDescription(prodRes.data.shortDescription || '');

      // Fetch article
      const articleRes = await getProductArticles(pId);
      if (articleRes.data && articleRes.data.length > 0) {
        setArticle(articleRes.data[0]);
        setArticleData({
          title: articleRes.data[0].title || '',
          summary: articleRes.data[0].summary || '',
          content: articleRes.data[0].content || '',
          seoTitle: articleRes.data[0].seoTitle || '',
          seoDescription: articleRes.data[0].seoDescription || ''
        });
      } else {
        setArticle(null);
        setArticleData({ title: '', summary: '', content: '', seoTitle: '', seoDescription: '' });
      }

      // Fetch specs
      const specsRes = await getProductSpecs(pId);
      setSpecs(specsRes.data);

    } catch (error) {
      toast.error('Lỗi tải thông tin sản phẩm');
      navigate('/admin/articles');
    }
  };

  const handleSaveArticleAndDesc = async () => {
    if (!id) return;

    try {
      // Update short description
      await updateProduct(id, { shortDescription });

      // Create or update article
      const articlePayload = {
        ...articleData,
        productId: parseInt(id)
      };

      if (article) {
        await updateProductArticle(article.id, articlePayload);
      } else {
        articlePayload.createdAt = new Date().toISOString();
        const newArt = await createProductArticle(articlePayload);
        setArticle(newArt.data);
      }

      toast.success('Lưu bài viết và mô tả thành công!');
    } catch (error) {
      toast.error('Lỗi khi lưu bài viết');
      console.error(error);
    }
  };

  const handleAddSpec = async () => {
    if (!newSpec.key || !newSpec.value) {
      toast.warning('Vui lòng nhập tên và giá trị thông số');
      return;
    }

    try {
      const payload = {
        ...newSpec,
        productId: parseInt(id)
      };
      const res = await createProductSpec(payload);
      setSpecs([...specs, res.data]);
      setNewSpec({ group: '', key: '', value: '' });
      toast.success('Thêm thông số thành công');
    } catch (error) {
      toast.error('Lỗi khi thêm thông số');
    }
  };

  const handleDeleteSpec = async (specId) => {
    if (!window.confirm('Xóa thông số này?')) return;
    try {
      await deleteProductSpec(specId);
      setSpecs(specs.filter(s => s.id !== specId));
      toast.success('Xóa thông số thành công');
    } catch (error) {
      toast.error('Lỗi khi xóa thông số');
    }
  };

  if (!product) return <div className="p-4">Đang tải...</div>;

  return (
    <Container fluid className="py-4">
      <div className="d-flex align-items-center mb-4">
        <Button variant="outline-secondary" className="me-3" onClick={() => navigate('/admin/articles')}>
          &larr; Quay lại
        </Button>
        <h2 className="m-0">Chỉnh sửa bài viết: {product.name}</h2>
      </div>

      <Row>
        {/* Cột trái: Đặc điểm nổi bật & Bài viết */}
        <Col md={7}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0 fw-bold">Nội dung & Bài viết</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Mô tả ngắn (Đặc điểm nổi bật)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Hiển thị ở đầu trang chi tiết sản phẩm..."
                  />
                </Form.Group>

                <hr />
                <h6 className="fw-bold mb-3">Bài viết chi tiết (Nội dung dưới)</h6>

                <Form.Group className="mb-3">
                  <Form.Label>Tiêu đề bài viết</Form.Label>
                  <Form.Control
                    type="text"
                    value={articleData.title}
                    onChange={(e) => setArticleData({ ...articleData, title: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Tóm tắt bài viết</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={articleData.summary}
                    onChange={(e) => setArticleData({ ...articleData, summary: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Nội dung (HTML/Rich Text)</Form.Label>
                  <div style={{ height: '300px', marginBottom: '50px' }}>
                    <ReactQuill
                      theme="snow"
                      value={articleData.content}
                      onChange={(val) => setArticleData({ ...articleData, content: val })}
                      style={{ height: '100%' }}
                    />
                  </div>
                </Form.Group>

                <h6 className="fw-bold mt-4">Cấu hình SEO</h6>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>SEO Title</Form.Label>
                      <Form.Control
                        type="text"
                        value={articleData.seoTitle}
                        onChange={(e) => setArticleData({ ...articleData, seoTitle: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>SEO Description</Form.Label>
                      <Form.Control
                        type="text"
                        value={articleData.seoDescription}
                        onChange={(e) => setArticleData({ ...articleData, seoDescription: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button variant="danger" className="mt-3 w-100" onClick={handleSaveArticleAndDesc}>
                  Lưu Nội dung Bài Viết
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Cột phải: Thông số kỹ thuật */}
        <Col md={5}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0 fw-bold">Thông số kỹ thuật</h5>
            </Card.Header>
            <Card.Body>
              <Table size="sm" bordered hover>
                <thead className="table-light">
                <tr>
                  <th>Nhóm</th>
                  <th>Tên thông số</th>
                  <th>Giá trị</th>
                  <th></th>
                </tr>
                </thead>
                <tbody>
                {specs.map(s => (
                  <tr key={s.id}>
                    <td>{s.group}</td>
                    <td className="fw-semibold">{s.key}</td>
                    <td>{s.value}</td>
                    <td className="text-center">
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteSpec(s.id)}>Xóa</Button>
                    </td>
                  </tr>
                ))}
                {specs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">Chưa có thông số</td>
                  </tr>
                )}
                </tbody>
              </Table>

              <h6 className="fw-bold mt-4 mb-3">Thêm thông số mới</h6>
              <Form>
                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    placeholder="Nhóm (VD: Màn hình, Camera...)"
                    value={newSpec.group}
                    onChange={e => setNewSpec({ ...newSpec, group: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    placeholder="Tên thông số (VD: Kích thước)"
                    value={newSpec.key}
                    onChange={e => setNewSpec({ ...newSpec, key: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Giá trị (VD: 6.7 inch)"
                    value={newSpec.value}
                    onChange={e => setNewSpec({ ...newSpec, value: e.target.value })}
                  />
                </Form.Group>
                <Button variant="success" className="w-100" onClick={handleAddSpec}>
                  + Thêm thông số
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ArticleEdit;
