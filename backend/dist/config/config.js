var config = {};
// api
config = {};
//config.bdb_url = 'http://energycert.westeurope.cloudapp.azure.com:49984/';
//config.ws_url = 'ws://energycert.westeurope.cloudapp.azure.com:9985/api/v1/streams/valid_transactions';
//config.bdb_url = 'http://'+process.env.BIGCHAINDB_HOST+':9984/api/v1/';
//config.ws_url = 'ws://'+process.env.BIGCHAINDB_HOST+':9985/api/v1/streams/valid_transactions';
config.bdb_url = 'http://127.0.0.1:9984/api/v1/';
config.ws_url = 'ws://127.0.0.1:9985/api/v1/streams/valid_transactions';
config.xtech_api_url = "https://wallet.staging.payxapi.com/apiv2/wallet/";
// process.env.MYSQL_HOST
config.db = {};
config.db.host = process.env.MYSQL_HOST;
config.db.username = 'user';
config.db.password = '1234';
config.db.database = 'database';
config.db.dialect = 'mysql';
config.db.logging = false;
config.db.operatorsAliases = false;
module.exports = config;
