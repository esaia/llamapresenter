import { ProductVideo } from './ProductVideo';

/**
 * The product demo behind the console screenshot on the home page.
 *
 * A fraction of the export it started as (~4MB against the raw ~79MB), so
 * self-hosting it costs nothing a CDN would have saved. See `ProductVideo`
 * for why this and a use-case walkthrough share one element.
 */
export const DemoVideo = () => <ProductVideo src="/videos/demo.mp4" poster="/videos/demo-poster.jpg" />;
