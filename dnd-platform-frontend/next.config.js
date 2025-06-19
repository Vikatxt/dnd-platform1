/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*' // порт твого Express-сервера
      }
    ]
    images: {
      domains: [
        'cdn.discordapp.com',             // Discord OAuth / CDN
        'lh3.googleusercontent.com',      // Google профіль
        'firebasestorage.googleapis.com', // Firebase Storage
        'my-bucket.s3.amazonaws.com',     // Amazon S3
        'your-own-cdn.example.com'        // власний CDN або бекенд
      ]
    }
    
  }
  
}

module.exports = nextConfig
