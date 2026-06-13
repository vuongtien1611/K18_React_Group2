import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Table, Card } from 'react-bootstrap';
import { getProductBySlug, getVariantsByProductId, getProductImages, getProductSpecs, getProductArticles, getCart, addToCart, updateCartItem } from '../services/api';
import { FaShoppingCart } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProductDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [images, setImages] = useState([]);
    const [specs, setSpecs] = useState([]);
    const [article, setArticle] = useState(null);

    const [selectedVariant, setSelectedVariant] = useState(null);
    const [mainImage, setMainImage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const productRes = await getProductBySlug(slug);
                if (productRes.data.length > 0) {
                    const p = productRes.data[0];
                    setProduct(p);
                    setMainImage(p.thumbnail);

                    const [variantsRes, imagesRes, specsRes, articlesRes] = await Promise.all([
                        getVariantsByProductId(p.id),
                        getProductImages(p.id),
                        getProductSpecs(p.id),
                        getProductArticles(p.id)
                    ]);

                    setVariants(variantsRes.data);
                    setImages(imagesRes.data);
                    setSpecs(specsRes.data);
                    if (articlesRes.data.length > 0) {
                        setArticle(articlesRes.data[0]);
                    }

                    if (variantsRes.data.length > 0) {
                        setSelectedVariant(variantsRes.data[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching product details:", error);
            }
        };

        if (slug) {
            fetchData();
        }
    }, [slug]);

    if (!product) return <Container className="py-5 text-center">Loading...</Container>;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const availableStock = selectedVariant ? (selectedVariant.stock - selectedVariant.reservedStock) : 0;
    const isOutOfStock = availableStock <= 0;

    const handleAddToCart = async (buyNow = false) => {
        if (!selectedVariant) return;
        if (isOutOfStock) {
            toast.error('Sản phẩm đã hết hàng!');
            return;
        }

        try {
            const cartRes = await getCart(2); // Assuming userId 2
            const existingItem = cartRes.data.find(item => item.variantId === selectedVariant.id);

            if (existingItem) {
                if (existingItem.quantity >= availableStock) {
                    toast.warning('Bạn đã thêm tối đa số lượng có sẵn vào giỏ hàng!');
                    return;
                }
                await updateCartItem(existingItem.id, { quantity: existingItem.quantity + 1 });
            } else {
                await addToCart({
                    userId: 2,
                    variantId: selectedVariant.id,
                    quantity: 1,
                    createdAt: new Date().toISOString()
                });
            }

            toast.success('Thêm vào giỏ hàng thành công!');
            if (buyNow) {
                navigate('/cart');
            }
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng.');
        }
    };

    return (
      <Container className="bg-white p-4 rounded shadow-sm">
          <div className="border-bottom pb-3 mb-4">
              <h2 className="fw-bold mb-2">{product.name}</h2>
              <div className="d-flex align-items-center text-muted" style={{ fontSize: '0.9rem' }}>
                  <span className="text-warning me-1">★</span>
                  <span className="fw-bold text-dark me-2">{product.ratingAverage}</span>
                  <span>({product.totalReviews} đánh giá)</span>
              </div>
          </div>

          <Row className="mb-5">
              <Col md={7}>
                  <div className="text-center mb-3 p-4 border rounded" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={mainImage} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                  <div className="d-flex gap-2 overflow-auto pb-2">
                      <div
                        className={`border rounded p-1 cursor-pointer ${mainImage === product.thumbnail ? 'border-danger' : ''}`}
                        style={{ width: '60px', height: '60px', cursor: 'pointer' }}
                        onClick={() => setMainImage(product.thumbnail)}
                      >
                          <img src={product.thumbnail} alt="thumb" className="w-100 h-100 object-fit-contain" />
                      </div>
                      {images.map((img) => (
                        <div
                          key={img.id}
                          className={`border rounded p-1 cursor-pointer ${mainImage === img.image ? 'border-danger' : ''}`}
                          style={{ width: '60px', height: '60px', cursor: 'pointer' }}
                          onClick={() => setMainImage(img.image)}
                        >
                            <img src={img.image} alt={`img-${img.id}`} className="w-100 h-100 object-fit-contain" />
                        </div>
                      ))}
                  </div>
              </Col>

              <Col md={5}>
                  {selectedVariant && (
                    <div className="mb-4">
                        <div className="d-flex align-items-end gap-3 mb-2">
                            <h3 className="text-danger fw-bold mb-0">{formatPrice(selectedVariant.price)}</h3>
                            {selectedVariant.oldPrice && (
                              <span className="text-muted text-decoration-line-through mb-1">{formatPrice(selectedVariant.oldPrice)}</span>
                            )}
                        </div>
                        <div>
                            {isOutOfStock ? (
                              <Badge bg="danger">Hết hàng</Badge>
                            ) : (
                              <Badge bg="success">Còn {availableStock} sản phẩm</Badge>
                            )}
                        </div>
                    </div>
                  )}

                  <div className="mb-4">
                      <h6 className="fw-bold mb-2">Chọn phiên bản:</h6>
                      <div className="d-flex flex-wrap gap-2">
                          {variants.map((v) => (
                            <div
                              key={v.id}
                              className={`border rounded p-2 text-center cursor-pointer ${selectedVariant?.id === v.id ? 'border-danger bg-danger bg-opacity-10' : ''}`}
                              style={{ cursor: 'pointer', minWidth: '100px' }}
                              onClick={() => setSelectedVariant(v)}
                            >
                                <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{v.storage}</div>
                                <div className="text-danger fw-semibold" style={{ fontSize: '0.85rem' }}>{formatPrice(v.price)}</div>
                            </div>
                          ))}
                      </div>
                  </div>

                  <div className="mb-4">
                      <h6 className="fw-bold mb-2">Chọn màu:</h6>
                      <div className="d-flex flex-wrap gap-2">
                          {variants.map((v) => (
                            <div
                              key={`color-${v.id}`}
                              className={`border rounded px-3 py-2 cursor-pointer d-flex align-items-center gap-2 ${selectedVariant?.id === v.id ? 'border-danger bg-danger bg-opacity-10' : ''}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => setSelectedVariant(v)}
                            >
                                <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>{v.color}</span>
                            </div>
                          ))}
                      </div>
                  </div>

                  <Button
                    variant="danger"
                    size="lg"
                    className="w-100 mb-2 py-3 text-uppercase fw-bold d-flex flex-column align-items-center"
                    disabled={isOutOfStock}
                    onClick={() => handleAddToCart(true)}
                  >
                      Mua ngay
                      <span className="fw-normal text-lowercase" style={{ fontSize: '0.8rem' }}>(Giao nhanh từ 2 giờ hoặc nhận tại cửa hàng)</span>
                  </Button>

                  <Button
                    variant="outline-danger"
                    size="lg"
                    className="w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                    disabled={isOutOfStock}
                    onClick={() => handleAddToCart(false)}
                  >
                      <FaShoppingCart /> Thêm vào giỏ hàng
                  </Button>
              </Col>
          </Row>

          <Row>
              <Col md={8}>
                  <Card className="border-0 shadow-sm mb-4">
                      <Card.Body>
                          <h4 className="fw-bold text-danger mb-4 text-center">ĐẶC ĐIỂM NỔI BẬT</h4>
                          {article ? (
                            <div>
                                <h5 className="fw-bold mb-3">{article.title}</h5>
                                <p className="fst-italic text-muted">{article.summary}</p>
                                <div dangerouslySetInnerHTML={{ __html: article.content }} />
                            </div>
                          ) : (
                            <p>{product.shortDescription}</p>
                          )}
                      </Card.Body>
                  </Card>
              </Col>

              <Col md={4}>
                  <Card className="border-0 shadow-sm">
                      <Card.Body>
                          <h5 className="fw-bold mb-3">Thông số kỹ thuật</h5>
                          <Table striped bordered hover size="sm" className="mb-0">
                              <tbody>
                              {specs.map((spec) => (
                                <tr key={spec.id}>
                                    <td className="fw-semibold bg-light" style={{ width: '40%', fontSize: '0.9rem' }}>{spec.key}</td>
                                    <td style={{ fontSize: '0.9rem' }}>{spec.value}</td>
                                </tr>
                              ))}
                              </tbody>
                          </Table>
                      </Card.Body>
                  </Card>
              </Col>
          </Row>
      </Container>
    );
};

export default ProductDetail;
