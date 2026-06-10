import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongo;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-key-for-jest-tests-only';
  process.env.JWT_ACCESS_EXPIRE = '15m';
  process.env.NODE_ENV = 'test';
  process.env.CLIENT_URL = 'http://localhost:5173';

  mongo = await MongoMemoryServer.create({
    binary: { version: '6.0.14' },
  });
  await mongoose.connect(mongo.getUri());
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
}, 60000);

afterEach(async () => {
  for (const collection of Object.values(mongoose.connection.collections)) {
    await collection.deleteMany({});
  }
});
