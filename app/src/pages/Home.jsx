import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getBanners, getCategories, getProducts, getVariantsByProductId } from '../services/api';

const Home = () => {
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bannersRes, categoriesRes, productsRes] = await Promise.all([
                    getBanners(),
                    getCategories(),
                    getProducts(),
                ]);

                setBanners(bannersRes.data.filter(b => b.position === 'HOME_TOP' && b.isActive));
                setCategories(categoriesRes.data.filter(c => !c.isDeleted));

                // Fetch variants for each product to get price
                const productsWithVariants = await Promise.all(
                    productsRes.data.filter(p => !p.isDeleted).map(async (product) => {
                        const variantsRes = await getVariantsByProductId(product.id);
                        return { ...product, variants: variantsRes.data };
                    })
                );

                setProducts(productsWithVariants);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <Container>
            {/* Banners */}
            {banners.length > 0 && (
                <Row className="mb-4">
                    <Col>
                        <Carousel>
                            {banners.map((banner) => (
                                <Carousel.Item key={banner.id}>
                                    <img
                                        className="d-block w-100 img-fluid rounded"
                                        src={banner.image}
                                        alt={banner.title}
                                        style={{
                                            spectRatio: '16 / 9',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </Col>
                </Row>
            )}

            {/* Categories */}
            <div className="mb-5">
                <h3 className="fw-bold mb-3">Danh mục nổi bật</h3>
                <Row className="g-3">
                    {categories.map((category) => (
                        <Col xs={4} md={2} key={category.id}>
                            <Link to={`/category/${category.slug}`} className="text-decoration-none text-dark">
                                <div className="text-center p-3 border rounded bg-white hover-shadow transition" style={{ cursor: 'pointer' }}>
                                    <img src={category.image} alt={category.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} className="mb-2" />
                                    <p className="mb-0 fw-semibold" style={{ fontSize: '0.9rem' }}>{category.name}</p>
                                </div>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Featured Products */}
            <div>
                <h3 className="fw-bold mb-3">Sản phẩm nổi bật</h3>
                <Row className="g-3">
                    {products.map((product) => {
                        const defaultVariant = product.variants?.[0];
                        return (
                            <Col xs={6} md={3} key={product.id}>
                                <Link to={`/product/${product.slug}`} className="text-decoration-none text-dark">
                                    <Card className="h-100 product-card border-0 shadow-sm">
                                        <Card.Img variant="top" src={product.thumbnail} className="p-3" style={{ height: '200px', objectFit: 'contain' }} />
                                        <Card.Body className="d-flex flex-column">
                                            <Card.Title className="fw-bold fs-6 mb-2">{product.name}</Card.Title>
                                            {defaultVariant && (
                                                <div className="mt-auto">
                                                    <div className="text-danger fw-bold fs-5 mb-1">{formatPrice(defaultVariant.price)}</div>
                                                    {defaultVariant.oldPrice && (
                                                        <div className="text-muted text-decoration-line-through" style={{ fontSize: '0.85rem' }}>
                                                            {formatPrice(defaultVariant.oldPrice)}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="mt-2 text-muted" style={{ fontSize: '0.8rem' }}>
                                                <span className="text-warning">★</span> {product.ratingAverage} ({product.totalReviews} đánh giá)
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Link>
                            </Col>
                        );
                    })}
                </Row>
            </div>
        </Container>
    );
};

export default Home;
