import { PublicKey, Transaction } from '@solana/web3.js';

export interface Wallet {
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  publicKey: PublicKey;
}

export interface ApplicationInfo {
  authority: string;
  name: string;
}

export interface Application {
  id: string;
  data: ApplicationInfo;
}

export interface CollectionInfo {
  authority: string;
  application: string;
  name: string;
}

export interface Collection {
  id: string;
  data: CollectionInfo;
}

export interface CollectionAttributeInfo {
  authority: string;
  application: string;
  collection: string;
  name: string;
  kind: {
    id: number;
    name: string;
    size: number;
  };
  modifier: {
    id: number;
    name: string;
    size: number;
  };
}

export interface CollectionAttribute {
  id: string;
  data: CollectionAttributeInfo;
}

export interface CollectionInstructionInfo {
  authority: string;
  application: string;
  collection: string;
  name: string;
}

export interface CollectionInstruction {
  id: string;
  data: CollectionInstructionInfo;
}

export interface InstructionArgumentInfo {
  authority: string;
  application: string;
  collection: string;
  instruction: string;
  name: string;
  kind: {
    id: number;
    name: string;
    size: number;
  };
  modifier: {
    id: number;
    name: string;
    size: number;
  };
}

export interface InstructionArgument {
  id: string;
  data: InstructionArgumentInfo;
}

export interface InstructionAccountInfo {
  authority: string;
  application: string;
  collection: string;
  instruction: string;
  name: string;
  kind: {
    id: number;
    name: string;
  };
  accountCollection: string;
  markAttribute: {
    id: number;
    name: string;
  };
}

export interface InstructionAccount {
  id: string;
  data: InstructionAccountInfo;
}

export type AccountBoolAttributeKind = 0 | 1 | 2;

export interface ProgramMetadata {
  id: string | undefined;
  name: string | undefined;
  collections:
    | {
        name: string;
        attributes: {
          attributeType: string;
          bump: number;
          name: string;
          size: number;
        }[];
        instructions: {
          name: string;
          arguments: {
              attributeType: string;
              bump: number;
              name: string;
          }[];
      }[] | undefined;
      }[]
    | undefined;
}
export interface IMetadata {
  application: Application | null;
  collections: Collection[];
  collectionAttributes: CollectionAttribute[];
  instructions: CollectionInstruction[];
  instructionArguments: InstructionArgument[];
  instructionAccounts: InstructionAccount[];
}