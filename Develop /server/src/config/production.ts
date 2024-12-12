export const productionConfig = {
    allowedOrigins: [
      process.env.RENDER_EXTERNAL_URL || 'https://book-search-engine.onrender.com'
    ],
    
    mongoDbConfig: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority'
    },
    
    staticPaths: {
      client: '../../client/dist'
    }
  };