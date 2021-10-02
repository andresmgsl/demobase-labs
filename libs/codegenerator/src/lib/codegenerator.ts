import { IMetadata } from '@demobase-labs/demobase-sdk';
import * as Handlebars from 'handlebars';
import { BehaviorSubject } from 'rxjs';

import { __rust_template } from './templates/__full_program';
import { formatName } from './utils';

const __codeMetadata = new BehaviorSubject<string>('Your code will be here');

const formatMetadata = (metadata: IMetadata) => {
  try {
    const collectionsMetadata = metadata.collections.map((collection) => {
      const formatedInstructions = metadata.instructions
        .filter((instruction) => instruction.data.collection === collection.id)
        .map((instruction) => {
          const resp = {
            name: formatName(instruction.data.name),
            arguments: metadata.instructionArguments
              .filter(
                (argument) => argument.data.instruction === instruction.id
              )
              .map((argument) => {
                return {
                  id: argument.id,
                  data: {
                    ...argument.data,
                    name: formatName(argument.data.name),
                  },
                };
              }),
            accounts: metadata.instructionAccounts
              .filter((account) => account.data.instruction === instruction.id)
              .map((account) => {
                return {
                  id: account.id,
                  data: {
                    ...account.data,
                    name: formatName(account.data.name),
                  },
                };
              }),
          };
          return resp;
        });

      const formatedCollection = {
        name: formatName(collection.data.name),
        attributes: metadata.collectionAttributes
          .filter((attribute) => attribute.data.collection === collection.id)
          .map((attribute) => {
            return {
              id: attribute.id,
              data: {
                ...attribute.data,
                name: formatName(attribute.data.name),
              },
            };
          }),
        instructions: formatedInstructions,
      };
      return formatedCollection;
    });

    if (!metadata.application) {
      throw new Error('No application given.');
    }

    const formatedMetadata = {
      id: metadata.application.id,
      name: formatName(metadata.application.data.name),
      collections: collectionsMetadata,
    };

    return formatedMetadata;
  } catch (e) {
    throw new Error(e as string);
  }
}

const getTemplateByType = (type: string): string => {
  switch (type) {
    case 'full_program':
      return __rust_template
    default:
      return __rust_template
  }

}


export const generateFullProgram = (metadata: IMetadata, type = 'full_program') => {
  try {
    const formatedMetadata = formatMetadata(metadata);

    console.log('json ->', JSON.stringify(formatedMetadata));

    const template = Handlebars.compile(getTemplateByType(type));
    const compiledTemplated = template({ program: formatedMetadata });
    const programFile = compiledTemplated;

    __codeMetadata.next(programFile);
  } catch (e) {
    throw new Error(e as string);
  }
}

export const currentCodeMetadata = __codeMetadata.asObservable();
