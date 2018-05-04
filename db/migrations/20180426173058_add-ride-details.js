
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('rides', function(table) {
      table.string('details');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('rides', function(table) {
      table.dropColumn('details');
    })
  ]);
};
