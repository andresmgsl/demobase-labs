import * as Handlebars from 'handlebars';

import { IMetadata } from '..';
import { __rust_template } from './__template';
import { IGenerateFileResponse, IProgramMetadataExt } from './types';
import { formatName } from './utils';



export function formatMetadata(metadata: IMetadata): IProgramMetadataExt {
  
  const collectionsMetadata = metadata.collections.map((collection) => {
    const formatedInstructions = metadata.instructions
      .filter((instruction) => instruction.data.collection === collection.id)
      .map((instruction) => {
        return {
          name: formatName(instruction.data.name),
          arguments: metadata.instructionArguments.filter((argument) => {
            argument.data.instruction === instruction.id;
          }).map(argument => {
            return {id: argument.id, data: {...argument.data, name: formatName(argument.data.name)}}
          }),
          accounts: metadata.instructionAccounts.filter((account) => {
            account.data.instruction === instruction.id;
          }).map(account => {
            return {id: account.id, data: {...account.data, name: formatName(account.data.name)}}
          }),
        };
      });

    const formatedCollection = {
      name: formatName(collection.data.name),
      attributes: metadata.collectionAttributes.filter(
        (attribute) => attribute.data.collection === collection.id
      ).map(attribute => {
        return {id: attribute.id, data: {...attribute.data, name: formatName(attribute.data.name)}}
      }),
      instructions: formatedInstructions,
    };
    return formatedCollection;
  });

  const formatedMetadata: IProgramMetadataExt = {
    id: metadata.application.id,
    name: formatName(metadata.application.data.name),
    collections: collectionsMetadata
  }


  return formatedMetadata;
}

export function generateRustFile(metadata: IMetadata): IGenerateFileResponse {
  try {

    const formatedMetadata = formatMetadata(metadata);

   
    const template = Handlebars.compile(__rust_template);
    const compiledTemplated = template({ program: formatedMetadata });
    const programFile = compiledTemplated;
    
    return { status: true, data: programFile };
  } catch (e) {
    console.error('Error:', e);
    return { status: false, data: e };
  }
}
