const { Router } = require("express");
// const Blog = require("../models/user");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

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

const upload = multer({ storage: storage })

blogRuter.get('/add-new', (req, res)=>{
    return res.render('addBlog',{
        user: req.user
    });
})
blogRuter.post('/', upload.single('coverImage'), async (req, res)=>{
    const {title, body} = req.body;
    const blog = await Blog.create({
        title, body, createdBy: req.user._id, coverImageURL: `/uploads/${req.file.filename}`
    })
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

blogRuter.post('/comment/:blogId', async (req, res)=>{
    const blogId = req.params.blogId;
    await Comment.create({
        comment: req.body.comment,
        blogId: blogId,
        createdBy: req.user._id,
    })
    return res.redirect(`/blog/${blogId}`);
})

module.exports = blogRuter;