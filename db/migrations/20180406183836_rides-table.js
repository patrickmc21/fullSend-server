exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('rides', function(table) {
      table.increments('id').primary();
      table.string('epoch');
      table.string('distance');
      table.string('elapsedTime');
      table.string('date');
      table.string('trailName');
      table.string('location');
      table.string('difficulty');
      table.string('img');
      table.string('summary');
      table.integer('userId').unsigned()
      table.foreign('userId')
        .references('userId');
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('rides')
  ]);
};
