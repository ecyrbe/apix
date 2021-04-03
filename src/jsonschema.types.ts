export type SchemaObject = ArraySchemaObject | NonArraySchemaObject;

type NonArraySchemaObjectType = 'boolean' | 'object' | 'number' | 'string' | 'integer';

type ArraySchemaObjectType = 'array';

interface ArraySchemaObject extends BaseSchemaObject {
  type: ArraySchemaObjectType;
  items: SchemaObject;
}
interface NonArraySchemaObject extends BaseSchemaObject {
  type?: NonArraySchemaObjectType;
}

interface BaseSchemaObject {
  title?: string;
  description?: string;
  format?: string;
  default?: any;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  additionalProperties?: boolean | SchemaObject;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  enum?: any[];
  properties?: {
    [name: string]: SchemaObject;
  };
  allOf?: SchemaObject[];
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  not?: SchemaObject;
}
