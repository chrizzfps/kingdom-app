import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
}

export function SEO({ title, description, image }: SEOProps) {
    const siteTitle = 'KINGDOM AGENCY | PROPUESTAS';
    const defaultDescription = 'Propuesta comercial exclusiva de Kingdom Agency.';
    const defaultImage = '/Isotipo.svg'; // Fallback if no hero image

    const metaTitle = title ? `${title} | KINGDOM` : siteTitle;
    const metaDescription = description || defaultDescription;
    const metaImage = image || defaultImage;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />
        </Helmet>
    );
}
