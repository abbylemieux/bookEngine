import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import path from 'node:path';
import db from './config/connection.js';
import routes from './routes/index.js';
import { schema } from './schema.js'; 
import { contextMiddleware } from './authMiddleware.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// If we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// REST routes
app.use(routes);

// GraphQL setup
const startApolloServer = async () => {
  const server = new ApolloServer({
    schema,
    context: contextMiddleware,
  });

  await server.start();

  // Use Apollo Server middleware with Express
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => contextMiddleware({ req }),
    })
  );

  // Start the server
  db.once('open', () => {
    app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
    console.log(`🚀 GraphQL endpoint available at http://localhost:${PORT}/graphql`);
  });
};

startApolloServer();
