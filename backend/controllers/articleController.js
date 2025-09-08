const asyncHandler = require("express-async-handler");
const { Parser } = require('json2csv');
const Article = require("../models/Article");
const User = require("../models/User");

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
const getArticles = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.pageSize) || 10;
  const page = parseInt(req.query.pageNumber) || 1;
  const keyword = req.query.keyword
    ? {
        $or: [
          { title: { $regex: req.query.keyword, $options: "i" } },
          { content: { $regex: req.query.keyword, $options: "i" } },
          { category: { $regex: req.query.keyword, $options: "i" } },
          { tags: { $regex: req.query.keyword, $options: "i" } },
        ],
      }
    : {};

  const count = await Article.countDocuments({ ...keyword });
  const articles = await Article.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ articles, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get single article by slug
// @route   GET /api/articles/slug/:slug
// @access  Public
const getArticleBySlug = asyncHandler(async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug }).populate(
    "author",
    "name email"
  );

  if (article) {
    res.json(article);
  } else {
    res.status(404);
    throw new Error("Article not found");
  }
});

// @desc    Get single article by ID
// @route   GET /api/articles/:id
// @access  Public
const getArticleById = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id).populate(
    "author",
    "name email"
  );

  if (article) {
    res.json(article);
  } else {
    res.status(404);
    throw new Error("Article not found");
  }
});

// @desc    Create an article
// @route   POST /api/articles
// @access  Private/Admin
const createArticle = asyncHandler(async (req, res) => {
  const { title, content, category, tags, image, metaTitle, metaDescription, keywords, isPublished } = req.body;

  // Explicitly generate slug here as a workaround for persistent validation issues
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim("-"); // Remove leading/trailing hyphens

  const article = new Article({
    title,
    slug, // Set the generated slug
    content,
    author: req.user._id, // Assuming user is authenticated and available in req.user
    category,
    tags,
    image,
    metaTitle,
    metaDescription,
    keywords,
    isPublished,
  });

  const createdArticle = await article.save();
  res.status(201).json(createdArticle);
});

// @desc    Update an article
// @route   PUT /api/articles/:id
// @access  Private/Admin
const updateArticle = asyncHandler(async (req, res) => {
  const { title, content, category, tags, image, metaTitle, metaDescription, keywords, isPublished } = req.body;

  const article = await Article.findById(req.params.id);

  if (article) {
    article.title = title || article.title;
    article.content = content || article.content;
    article.category = category || article.category;
    article.tags = tags || article.tags;
    article.image = image || article.image;
    article.metaTitle = metaTitle || article.metaTitle;
    article.metaDescription = metaDescription || article.metaDescription;
    article.keywords = keywords || article.keywords;
    article.isPublished = isPublished !== undefined ? isPublished : article.isPublished;

    const updatedArticle = await article.save();
    res.json(updatedArticle);
  } else {
    res.status(404);
    throw new Error("Article not found");
  }
});

// @desc    Delete an article
// @route   DELETE /api/articles/:id
// @access  Private/Admin
const deleteArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (article) {
    await Article.deleteOne({ _id: article._id });
    res.json({ message: "Article removed" });
  } else {
    res.status(404);
    throw new Error("Article not found");
  }
});

// @desc    Export articles to CSV
// @route   POST /api/articles/export
// @access  Private/Admin
const exportArticles = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  let articles;
  if (ids && ids.length > 0) {
    articles = await Article.find({ _id: { $in: ids } }).populate('author', 'name');
  } else {
    articles = await Article.find({}).populate('author', 'name');
  }

  const articlesData = articles.map(article => {
    return {
      refId: article.refId,
      refModel: 'Article',
      title: article.title,
      author: article.author ? article.author.name : 'N/A',
      category: article.category,
      tags: article.tags.join(', '),
      isPublished: article.isPublished,
      createdAt: article.createdAt.toDateString(),
    };
  });

  const fields = ['refId', 'refModel', 'title', 'author', 'category', 'tags', 'isPublished', 'createdAt'];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(articlesData);

  res.header('Content-Type', 'text/csv');
  res.attachment('articles.csv');
  res.send(csv);
});

module.exports = {
  getArticles,
  getArticleById,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  exportArticles,
};


