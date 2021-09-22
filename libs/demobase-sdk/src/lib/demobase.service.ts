import { Idl, Program, Provider } from '@project-serum/anchor';
import {
  Commitment,
  ConfirmOptions,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import { encode } from 'bs58';

import * as idl from './idl.json';
import { ApplicationAccount, CollectionAccount, Wallet } from './types';
import {
  ApplicationAccountParser,
  APPLICATION_ACCOUNT_DATA_SIZE,
  APPLICATION_ACCOUNT_NAME,
  CollectionAccountParser,
  COLLECTION_ACCOUNT_DATA_SIZE,
  COLLECTION_ACCOUNT_NAME,
  createCollectionAddress,
  DEMOBASE_PROGRAM_ID,
  findCollectionAddress,
  getAccountDiscriminator,
} from './utils';

export class DemobaseService {
  _program: Program | null = null;

  get programId() {
    return this._program ? this._program.programId : null;
  }

  get connection() {
    return this._program ? this._program.provider.connection : null;
  }

  get wallet() {
    return this._program ? this._program.provider.wallet : null;
  }

  setProgram(program: Program) {
    this._program = program;
  }

  setProgramFromConfig(
    connection: Connection,
    wallet: Wallet,
    opts?: ConfirmOptions
  ) {
    const provider = new Provider(
      connection,
      wallet,
      opts || Provider.defaultOptions()
    );
    const program = new Program(idl as Idl, DEMOBASE_PROGRAM_ID, provider);
    this.setProgram(program);
  }

  static create(connection: Connection, wallet: Wallet, opts?: ConfirmOptions) {
    const service = new DemobaseService();
    service.setProgramFromConfig(connection, wallet, opts);

    return service;
  }

  static fromProgram(program: Program) {
    const service = new DemobaseService();
    service.setProgram(program);

    return service;
  }

  async createApplication(applicationName: string) {
    if (!this._program) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    const application = Keypair.generate();

    return this._program.rpc.createApplication(applicationName, {
      accounts: {
        application: application.publicKey,
        authority: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [application],
    });
  }

  async getApplications(
    commitment?: Commitment
  ): Promise<ApplicationAccount[]> {
    if (!this.connection) {
      throw Error('Connection is not available');
    }

    const filters = [
      { dataSize: APPLICATION_ACCOUNT_DATA_SIZE },
      {
        memcmp: {
          bytes: encode(getAccountDiscriminator(APPLICATION_ACCOUNT_NAME)),
          offset: 0,
        },
      },
    ];

    const programAccounts = await this.connection.getProgramAccounts(
      DEMOBASE_PROGRAM_ID,
      {
        filters,
        commitment,
      }
    );

    return programAccounts.map(({ account, pubkey }) =>
      ApplicationAccountParser(pubkey, account)
    );
  }

  async getApplication(
    applicationId: PublicKey,
    commitment?: Commitment
  ): Promise<ApplicationAccount | null> {
    if (!this.connection) {
      throw Error('Connection is not available');
    }

    const account = await this.connection.getAccountInfo(
      applicationId,
      commitment
    );

    return account && ApplicationAccountParser(applicationId, account);
  }

  async createCollection(applicationId: PublicKey, collectionName: string) {
    if (!this._program) {
      throw Error('Program is not available');
    }

    if (!this.wallet) {
      throw Error('Wallet is not available');
    }

    const [collectionId, collectionBump] = await findCollectionAddress(
      applicationId,
      collectionName
    );

    return this._program.rpc.createCollection(collectionName, collectionBump, {
      accounts: {
        collection: collectionId,
        application: applicationId,
        authority: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
  }

  async getCollections(commitment?: Commitment): Promise<CollectionAccount[]> {
    if (!this.connection) {
      throw Error('Connection is not available');
    }

    const filters = [
      { dataSize: COLLECTION_ACCOUNT_DATA_SIZE },
      {
        memcmp: {
          bytes: encode(getAccountDiscriminator(COLLECTION_ACCOUNT_NAME)),
          offset: 0,
        },
      },
    ];

    const programAccounts = await this.connection.getProgramAccounts(
      DEMOBASE_PROGRAM_ID,
      {
        filters,
        commitment,
      }
    );

    return programAccounts.map(({ account, pubkey }) =>
      CollectionAccountParser(pubkey, account)
    );
  }

  async getCollectionsByApplication(
    applicationId: PublicKey,
    commitment?: Commitment
  ): Promise<CollectionAccount[]> {
    if (!this.connection) {
      throw Error('Connection is not available');
    }

    const filters = [
      { dataSize: COLLECTION_ACCOUNT_DATA_SIZE },
      {
        memcmp: {
          bytes: encode(getAccountDiscriminator(COLLECTION_ACCOUNT_NAME)),
          offset: 0,
        },
      },
      {
        memcmp: {
          bytes: applicationId.toBase58(),
          offset: 41,
        },
      },
    ];

    const programAccounts = await this.connection.getProgramAccounts(
      DEMOBASE_PROGRAM_ID,
      {
        filters,
        commitment,
      }
    );

    return programAccounts.map(({ account, pubkey }) =>
      CollectionAccountParser(pubkey, account)
    );
  }

  async getCollection(
    applicationId: PublicKey,
    collectionName: string,
    collectionBump: number,
    commitment?: Commitment
  ): Promise<CollectionAccount | null> {
    if (!this.connection) {
      throw Error('Connection is not available');
    }

    const collectionId = await createCollectionAddress(
      applicationId,
      collectionName,
      collectionBump
    );

    const account = await this.connection.getAccountInfo(
      collectionId,
      commitment
    );

    return account && CollectionAccountParser(collectionId, account);
  }
}
