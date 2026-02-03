
export default function handler(req, res) {
    // This API route exists solely to count visits in Vercel's "Function Invocations" logs.
    // It's a server-side route, so it's harder for adblockers to block (unlike client-side scripts).
    // You can check the "Function Invocations" count for this function in your Vercel Dashboard.

    // Prevent caching so every visit registers as a new invocation
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // Return a simple success response
    res.status(200).json({ status: 'tracked' });
}
