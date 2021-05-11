/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

const mongoose = require('mongoose');
const BOOK = require('../models/book');
const COMMENT = require('../models/comment');

module.exports = function (app) {
  //response will be array of book objects
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
    })

    .post(async function (req, res) {
      //response will contain new book object including at least _id and title
      let title = req.body.title;

      if (typeof title === 'undefined' || title === '') {
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
        res.status(500).json('Server error');
      }
    })

    .delete(async function (req, res) {
      //there were no more conditions in the user story....
      try {
        await BOOK.deleteMany({});
        await COMMENT.deleteMany({});
        return res.json('complete delete successful');
      } catch (error) {
        return res.json({ error: 'server error' });
      }
    });

  app
    .route('/api/books/:id')
    .get(async function (req, res) {
      let bookId = req.params.id;

      try {
        const book = await BOOK.findById(bookId);

        if (!book) {
          return res.json('no book exists');
        }

        res.status(200).json({
          title: book.title,
          comments: book.comments,
          _id: book._id,
          commentcount: book.commentcount,
        });
      } catch (error) {
        return res.status(500).json('Server error');
      }
    })

    .post(async function (req, res) {
      //json res format same as .get
      let bookid = req.params.id;
      let comment = req.body.comment;
      console.log(comment);

      if (comment === undefined || typeof comment === undefined) {
        return res.json('missing required field comment');
      }

      const createdComment = new COMMENT({
        comment,
        creator: bookid,
      });

      let book;

      try {
        book = await BOOK.findById(bookid);
      } catch (error) {
        return res.json('Server error');
      }

      if (!book) {
        return res.json('no book exists');
      }

      try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdComment.save({ session: sess });

        book.comments.push(createdComment);
        book.commentcount = book.commentcount + 1;
        await book.save({ session: sess });
        await sess.commitTransaction();
      } catch (err) {
        return res.json('Creating comment failed, please try again');
      }

      //or can do with aggregate and unwind() in mongoDB server...
      try {
        const bookWithComment = await BOOK.findById(bookid).populate({
          path: 'comments',
          select: 'comment commentcount -_id ',
        });

        const bookInfo = {
          title: bookWithComment.title,
          _id: bookWithComment._id,
          commentcount: bookWithComment.commentcount,
          comments: bookWithComment.comments.map(commentObj => commentObj.comment),
        };

        return res.json(bookInfo);
      } catch (error) {
        return res.json('fetching comments failed, please try again');
      }
    })

    .delete(async function (req, res) {
      //if successful response will be 'delete successful'
      let bookid = req.params.id;
      let book;
      let comments;

      book = await BOOK.findById(bookid);
      comments = await COMMENT.findOne({ creator: bookid });

      if (!book) {
        return res.json('no book exists');
      }

      try {
        await BOOK.deleteOne({ _id: bookid });
      } catch (error) {
        return res.json({ error: 'server error', _id: bookid });
      }

      if (comments) {
        try {
          await COMMENT.deleteMany({ creator: bookid });
        } catch (error) {
          return res.json({ error: 'server error', _id: bookid });
        }
      }

      return res.json('delete successful');
    });
};
