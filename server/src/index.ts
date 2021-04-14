import { createConnection } from 'typeorm'
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import cors from 'cors'

import { HelloResolver } from './resolvers/hello';
import { BookResolver } from './resolvers/book';
import { UserResolver } from './resolvers/user';

import { User } from './entities/User';
import { Book } from './entities/Book';
import { COOKIE_NAME, __prod__ } from './constants';
import { MyContext } from './types';
// import { sendEmail } from './utils/sendEmail';

const main = async () => {
  //---------- TypeORM connection ----------
  //----------------------------------------

  const conn = await createConnection({
    type: 'mysql',
    database: 'bookstore',
    username: 'root',
    password: '',
    logging: true,
    synchronize: true,
    entities: [Book, User]
  })

  //----------------- Express --------------
  //----------------------------------------

  const app = express();

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true
    })
  );

  //----------- Redis (session)- --------------
  //-------------------------------------------

  const RedisStore = connectRedis(session)
  const redis = new Redis()

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years,
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: __prod__ // cookie only works in https
      },
      saveUninitialized: false, //Not storing any empty session
      secret: 'rrandqsdqsdqskldqjkldaklqs',
      resave: false,
    })
  )

  //----------- Apollo (graphql) --------------
  //-------------------------------------------

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, BookResolver, UserResolver],
      validate: false
    }),
    context: ({ req, res }: MyContext) => ({ req, res, redis })
  });

  apolloServer.applyMiddleware({
    app,
    cors: false
  });

  app.listen(4000, () => {
    console.log('server started on localhost:4000');
  });
};

main();
