export type Connection = {
  CONNECTION_STRING: string;
  DB: string;
  DBNAME: string;
};

export const connection: Connection = {
  CONNECTION_STRING:
    process.env.CONNECTION_STRING || 'connection_string_placeholder',
  DB: process.env.DB || 'MYSQL',
  DBNAME: process.env.DBNAME || 'TEST',
};
