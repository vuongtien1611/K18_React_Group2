import { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { getCategories, getProducts, getVariantsByProductId } from '../services/api';

const Category = () => {
    const { slug } = useParams();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const categoriesRes = await getCategories();
                const foundCategory = categoriesRes.data.find(c => c.slug === slug);

                if (foundCategory) {
                    setCategory(foundCategory);
                    const productsRes = await getProducts();
                    const categoryProducts = productsRes.data.filter(p => p.categoryId === foundCategory.id && !p.isDeleted);

                    const productsWithVariants = await Promise.all(
                        categoryProducts.map(async (product) => {
                            const variantsRes = await getVariantsByProductId(product.id);
                            return { ...product, variants: variantsRes.data };
                        })
                    );

                    setProducts(productsWithVariants);
                } else {
                    setCategory(null);
                }
            } catch (error) {
                console.error("Error fetching category data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (loading) {
        return <Container className="my-5 text-center">Đang tải...</Container>;
    }

    if (!category) {
        return <Container className="my-5 text-center">Không tìm thấy danh mục này.</Container>;
    }

    return (
        <Container>
            <div className="mb-4">
                <h3 className="fw-bold d-flex align-items-center">
                    {category.image && <img src={category.image} alt={category.name} style={{ width: '40px', height: '40px', objectFit: 'contain', marginRight: '15px' }} />}
                    Sản phẩm {category.name}
                </h3>
            </div>

            {products.length === 0 ? (
                <p>Không có sản phẩm nào trong danh mục này.</p>
            ) : (
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
            )}
        </Container>
    );
};

export default Category;
