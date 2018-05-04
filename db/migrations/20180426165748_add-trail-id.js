
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('rides', function(table) {
      table.string('rideId');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('rides', function(table) {
      table.dropColumn('rideId');
    })
  ]);
};
