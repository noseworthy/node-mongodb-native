import { expect } from 'chai';
import * as sinon from 'sinon';

import { OpMsgResponse } from '../../../mongodb';

const EXPECTED_VALIDATION_DISABLED_ARGUMENT = {
  utf8: false
};

const EXPECTED_VALIDATION_ENABLED_ARGUMENT = {
  utf8: {
    writeErrors: false
  }
};

describe('class OpMsgResponse', () => {
  let bsonSpy: sinon.SinonSpy;

  beforeEach(() => {
    bsonSpy = sinon.spy(OpMsgResponse.prototype, 'parseBsonSerializationOptions');
  });

  afterEach(() => {
    bsonSpy?.restore();
    // @ts-expect-error: Allow this to be garbage collected
    bsonSpy = null;
  });

  let client;

  afterEach(async () => {
    if (client) await client.close();
  });

  describe('enableUtf8Validation option set to false', () => {
    const option = { enableUtf8Validation: false };

    for (const passOptionTo of ['client', 'db', 'collection', 'operation']) {
      it(`should disable validation with option passed to ${passOptionTo}`, async function () {
        client = this.configuration.newClient(passOptionTo === 'client' ? option : undefined);

        const db = client.db('bson_utf8Validation_db', passOptionTo === 'db' ? option : undefined);
        const collection = db.collection(
          'bson_utf8Validation_coll',
          passOptionTo === 'collection' ? option : undefined
        );

        await collection.insertOne(
          { name: 'John Doe' },
          passOptionTo === 'operation' ? option : {}
        );

        expect(bsonSpy).to.have.been.called;
        const result = bsonSpy.lastCall.returnValue;
        expect(result).to.deep.equal(EXPECTED_VALIDATION_DISABLED_ARGUMENT);
      });
    }
  });

  describe('enableUtf8Validation option set to true', () => {
    // define client and option for tests to use
    const option = { enableUtf8Validation: true };
    for (const passOptionTo of ['client', 'db', 'collection', 'operation']) {
      it(`should enable validation with option passed to ${passOptionTo}`, async function () {
        client = this.configuration.newClient(passOptionTo === 'client' ? option : undefined);
        await client.connect();

        const db = client.db('bson_utf8Validation_db', passOptionTo === 'db' ? option : undefined);
        const collection = db.collection(
          'bson_utf8Validation_coll',
          passOptionTo === 'collection' ? option : undefined
        );

        await collection.insertOne(
          { name: 'John Doe' },
          passOptionTo === 'operation' ? option : {}
        );

        expect(bsonSpy).to.have.been.called;
        const result = bsonSpy.lastCall.returnValue;
        expect(result).to.deep.equal(EXPECTED_VALIDATION_ENABLED_ARGUMENT);
      });
    }
  });

  describe('enableUtf8Validation option not set', () => {
    const option = {};
    for (const passOptionTo of ['client', 'db', 'collection', 'operation']) {
      it(`should default to enabled with option passed to ${passOptionTo}`, async function () {
        client = this.configuration.newClient(passOptionTo === 'client' ? option : undefined);
        await client.connect();

        const db = client.db('bson_utf8Validation_db', passOptionTo === 'db' ? option : undefined);
        const collection = db.collection(
          'bson_utf8Validation_coll',
          passOptionTo === 'collection' ? option : undefined
        );

        await collection.insertOne(
          { name: 'John Doe' },
          passOptionTo === 'operation' ? option : {}
        );

        expect(bsonSpy).to.have.been.called;
        const result = bsonSpy.lastCall.returnValue;
        expect(result).to.deep.equal(EXPECTED_VALIDATION_ENABLED_ARGUMENT);
      });
    }
  });
});
