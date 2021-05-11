/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

const BOOK = require('../models/book');

module.exports = function (app) {
  app
    .route('/api/books')

    .get(async function (req, res) {
      let findAll = await BOOK.find();

      res.json(
        findAll.map(book => {
          return {
            title: book.title,
            _id: book._id,
            commentcount: book.commentcount,
          };
        })
      );

      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })

    .post(async function (req, res) {
      let title = req.body.title;
      console.log(title);

      if (typeof title === 'undefined') {
        return res.status(200).json('missing required field title');
      }
      try {
        const findOne = new BOOK({
          title: req.body.title,
          commentcount: 0,
        });
        await findOne.save();
        res.json({
          _id: findOne._id,
          title: findOne.title,
        });
      } catch (error) {
        // console.log(error);
        res.status(500).json('Server error');
      }
      //response will contain new book object including at least _id and title
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
      res.json({ ok: 'ok' });
    });

  app
    .route('/api/books/:id')
    .get(function (req, res) {
      let bookid = req.params.id;
      res.json({ ok: 'ok' });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      res.json({ ok: 'ok' });
      //json res format same as .get
    })

    .delete(function (req, res) {
      let bookid = req.params.id;
      res.json({ ok: 'ok' });
      //if successful response will be 'delete successful'
    });
};
