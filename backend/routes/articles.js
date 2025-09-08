const express = require("express");
const router = express.Router();
const {
  getArticles,
  getArticleById,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  exportArticles,
} = require("../controllers/articleController");
const { generateAIArticles } = require("../controllers/aiArticleController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").get(getArticles).post(protect, admin, createArticle);
router.route("/export").get(protect, admin, exportArticles);
router.route("/generate-ai").post(protect, admin, generateAIArticles);
router.route("/slug/:slug").get(getArticleBySlug);
router
  .route("/:id")
  .get(getArticleById)
  .put(protect, admin, updateArticle)
  .delete(protect, admin, deleteArticle);

module.exports = router;

