/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { getFakeObjectId } = require('./testutil/util');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test('#example Test GET /api/books', function (done) {
    chai
      .request(server)
      .get('/api/books')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite('Routing tests', function () {
    suite('POST /api/books with title => create book object/expect book object', function () {
      test('Test POST /api/books with title', function (done) {
        chai
          .request(server)
          .post('/api/books')
          .set('content-type', 'application/x-www-form-urlencoded')
          .send({
            title: 'Moby Dick',
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, 'title', 'Books in array should contain title');
            assert.property(res.body, '_id', 'Books in array should contain _id');
            assert.equal(res.body.title, 'Moby Dick');
            done();
          });
      });

      test('Test POST /api/books with no title given', function (done) {
        chai
          .request(server)
          .post('/api/books')
          .set('content-type', 'application/x-www-form-urlencoded')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'missing required field title');
            done();
          });
      });
    });

    suite('GET /api/books => array of books', function () {
      test('Test GET /api/books', function (done) {
        chai
          .request(server)
          .get('/api/books')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], 'commentcount', 'Should contain commentcount');
            assert.property(res.body[0], 'title', 'Books in array should contain title');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');
            done();
          });
      });
    });

    suite('GET /api/books/[id] => book object with [id]', function () {
      test('Test GET /api/books/[id] with id not in db', function (done) {
        chai
          .request(server)
          .get(`/api/books/${getFakeObjectId()}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        chai
          .request(server)
          .post('/api/books')
          .set('content-type', 'application/x-www-form-urlencoded')
          .send({
            title: 'Robin Hood',
          })
          .end((err, res) => {
            const id = res.body._id;

            chai
              .request(server)
              .get(`/api/books/${id}`)
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isObject(res.body, 'response should be an object');
                assert.property(res.body, 'commentcount', 'should contain commentcount');
                assert.property(res.body, 'title', 'Books in array should contain title');
                assert.property(res.body, '_id', 'Books in array should contain _id');
                assert.equal(res.body.title, 'Robin Hood');
                done();
              });
          });
      });
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function () {
      test('Test POST /api/books/[id] with comment', function (done) {
        chai
          .request(server)
          .post('/api/books')
          .set('content-type', 'application/x-www-form-urlencoded')
          .send({
            title: 'Robin Hood',
          })
          .end((err, res) => {
            const id = res.body._id;

            chai
              .request(server)
              .post(`/api/books/${id}`)
              .set('content-type', 'application/x-www-form-urlencoded')
              .send({
                comment: 'Hood comment',
              })
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isObject(res.body, 'response should be an object');
                assert.property(res.body, 'commentcount', 'should contain commentcount');
                assert.property(res.body, '_id', 'Books in array should contain _id');
                assert.property(res.body, 'title', 'Books in array should contain title');
                assert.equal(res.body.title, 'Robin Hood');
                assert.equal(res.body.commentcount, 1);
                assert.equal(res.body._id, id);
                assert.isArray(res.body.comments, 'response should be an array');
                assert.equal(res.body.comments[0], 'Hood comment', 'should contain comment');
                done();
              });
          });
      });

      test('Test POST /api/books/[id] without comment field', function (done) {
        chai
          .request(server)
          .post('/api/books')
          .set('content-type', 'application/x-www-form-urlencoded')
          .send({
            title: 'Robin Hood',
          })
          .end((err, res) => {
            const id = res.body._id;
            chai
              .request(server)
              .post(`/api/books/${id}`)
              .set('content-type', 'application/x-www-form-urlencoded')
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body, 'missing required field comment');
                done();
              });
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function (done) {
        chai
          .request(server)
          .post(`/api/books/${getFakeObjectId()}`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send({
            comment: 'Hood comment',
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done();
          });
      });
    });

    suite('DELETE /api/books/[id] => delete book object id', function () {
      test('Test DELETE /api/books/[id] with valid id in db', function (done) {
        chai
          .request(server)
          .post('/api/books')
          .set('content-type', 'application/x-www-form-urlencoded')
          .send({
            title: 'Book for delete',
          })
          .end((err, res) => {
            const id = res.body._id;
            chai
              .request(server)
              .delete(`/api/books/${id}`)
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body, 'delete successful');
                done();
              });
          });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function (done) {
        chai
          .request(server)
          .delete(`/api/books/${getFakeObjectId()}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done();
          });
      });
    });
  });
});
