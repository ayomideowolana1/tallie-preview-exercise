import { Model, ModelOptions, QueryContext } from "objection";

export class BaseModel extends Model {
  id!: number | string;
  createdAt!: Date;
  updatedAt!: Date;

  static get hidden(): string[] {
    return [];
  }

  static get idColumn() {
    return "id";
  }

  // Automatically set timestamps
  $beforeInsert(queryContext: QueryContext) {
    super.$beforeInsert(queryContext);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  $beforeUpdate(opt: ModelOptions, queryContext: QueryContext) {
    super.$beforeUpdate(opt, queryContext);
    this.updatedAt = new Date();
  }
  

  // Format dates properly
  $parseDatabaseJson(json: any) {
    json = super.$parseDatabaseJson(json);
    
    if (json.createdAt) {
      json.createdAt = new Date(json.createdAt);
    }
    
    if (json.updatedAt) {
      json.updatedAt = new Date(json.updatedAt);
    }
    
    return json;
  }
}