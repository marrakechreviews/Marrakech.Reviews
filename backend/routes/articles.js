const express = require("express");
const router = express.Router();
const {
  getArticles,
  getArticleById,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
} = require("../controllers/articleController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").get(getArticles).post(protect, admin, createArticle);
router.route("/slug/:slug").get(getArticleBySlug);
router
  .route("/:id")
  .get(getArticleById)
  .put(protect, admin, updateArticle)
  .delete(protect, admin, deleteArticle);

module.exports = router;


