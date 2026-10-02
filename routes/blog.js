const { Router } = require("express");
// const Blog = require("../models/user");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const { requireAuthentication } = require("../middlewares/authentication");

const blogRuter = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDirectory = path.resolve(__dirname, "../public/uploads");
    fs.mkdir(uploadDirectory, { recursive: true }, (error) => {
      cb(error, uploadDirectory);
    });
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  }
})

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
        if (!allowedImageTypes.has(file.mimetype)) {
            return cb(new Error("Cover image must be a JPEG, PNG, WebP, or GIF file"));
        }
        return cb(null, true);
    }
});
const uploadCoverImage = (req, res, next) => {
    upload.single("coverImage")(req, res, (error) => {
        if (!error) return next();
        if (error instanceof multer.MulterError || error.message === "Cover image must be a JPEG, PNG, WebP, or GIF file") {
            return res.status(400).send(error.message);
        }
        return next(error);
    });
};

blogRuter.get('/add-new', requireAuthentication, (req, res)=>{
    return res.render('addBlog',{
        user: req.user
    });
})
blogRuter.post('/', requireAuthentication, uploadCoverImage, async (req, res)=>{
    const { title, body } = req.body;
    if (typeof title !== "string" || !title.trim() || title.trim().length > 120) {
        return res.status(400).send("Title is required and must be 120 characters or fewer.");
    }
    if (typeof body !== "string" || !body.trim() || body.trim().length > 50000) {
        return res.status(400).send("Blog content is required and must be 50,000 characters or fewer.");
    }

    const blogData = {
        title: title.trim(),
        body: body.trim(),
        createdBy: req.user._id
    };
    if (req.file) {
        blogData.coverImageURL = `/uploads/${req.file.filename}`;
    }
    const blog = await Blog.create(blogData);
    return res.redirect(`/blog/${blog._id}`);
})

blogRuter.get('/:id', async (req, res)=>{
    const blogId = req.params.id;
    const comments = await Comment.find({ blogId: blogId}).populate("createdBy");
    const blog = await Blog.findOne({
        _id: blogId
    }).populate("createdBy");
    return res.render('blogDetail',{
        blog: blog,
        user: req.user,
        comments: comments
    });
})

blogRuter.post('/comment/:blogId', requireAuthentication, async (req, res)=>{
    const blogId = req.params.blogId;
    const commentText = req.body.comment;
    if (!mongoose.isValidObjectId(blogId)) {
        return res.status(400).send("Invalid blog ID.");
    }
    if (typeof commentText !== "string" || !commentText.trim() || commentText.trim().length > 2000) {
        return res.status(400).send("Comment is required and must be 2,000 characters or fewer.");
    }
    const blogExists = await Blog.exists({ _id: blogId });
    if (!blogExists) {
        return res.status(404).send("Blog not found.");
    }

    await Comment.create({
        comment: commentText.trim(),
        blogId: blogId,
        createdBy: req.user._id,
    })
    return res.redirect(`/blog/${blogId}`);
})

module.exports = blogRuter;