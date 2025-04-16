import { Library } from '../../../@types';
import { GraphQLAPIMapBuilder } from './node/GraphQLAPIMapBuilder';

export class ApiMapBuilder {
  static getBuilder(library: Library) {
    switch (library) {
      case 'apollo-server':
        return GraphQLAPIMapBuilder;
      default:
        console.error('⚠️ Library not supported; skipping API Map creation.');
        return null;
    }
  }
}
