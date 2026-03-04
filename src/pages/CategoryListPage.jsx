import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getToken, getRole, logout } from "../utils/auth";
import HumanLoader from "../components/loaders/HumanLoader";
import "./CategoryListPage.css";

export default function CategoryListPage() {
  const { courseId } = useParams();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const navigate = useNavigate();
  const role = getRole();

  /* ---------- FETCH CATEGORIES (MIN 3s LOADER) ---------- */
  const fetchCategories = useCallback(async () => {
    setPageLoading(true);
    const startTime = Date.now();

    try {
      const res = await fetch(
        `https://tssplatform.onrender.com/categories?courseId=${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      if (res.status === 401 || res.status === 403) {
        logout();
        navigate("/login");
        return;
      }

      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(3000 - elapsed, 0);
      setTimeout(() => setPageLoading(false), remaining);
    }
  }, [courseId, navigate]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ---------- ADD CATEGORY (ADMIN ONLY) ---------- */
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        "https://tssplatform.onrender.com/categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            name: newCategory,
            courseId
          })
        }
      );

      if (res.status === 401 || res.status === 403) {
        logout();
        navigate("/login");
        return;
      }

      setNewCategory("");
      setShowAddDialog(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- LOADER ---------- */
  if (pageLoading) {
    return <HumanLoader
            loadingText="Preparing categories"
            successText="Ready to practice!"
            duration={2000}
          />;
  }

  return (
    <div className="category-page">
      <div className="category-header">
        <div>
          <h2>Select Category</h2>
          <p>Pick a category to start solving questions</p>
        </div>

        {/* 🔐 ADMIN ONLY */}
        {role === "admin" && (
          <button
            className="add-category-btn"
            onClick={() => setShowAddDialog(true)}
          >
            + Add Category
          </button>
        )}
      </div>

      <div className="category-grid">
        {categories.map(cat => (
          <div key={cat._id} className="category-card">
            <h3>{cat.name}</h3>

            <button
              className="category-btn"
              onClick={() => setSelectedCategory(cat)}
            >
              View Questions →
            </button>
          </div>
        ))}
      </div>

      {/* ---------- SOLVE DIALOG ---------- */}
      {selectedCategory && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>{selectedCategory.name}</h3>
            <p>Are you ready to start solving questions?</p>

            <div className="dialog-actions">
              <button
                className="dialog-cancel"
                onClick={() => setSelectedCategory(null)}
              >
                Cancel
              </button>
              <button
                className="dialog-confirm"
                onClick={() =>
                  navigate(`/categories/${selectedCategory._id}`)
                }
              >
                Proceed →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- ADD CATEGORY DIALOG (ADMIN ONLY) ---------- */}
      {role === "admin" && showAddDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Add Category</h3>

            <input
              className="dialog-input"
              placeholder="Enter category name"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
            />

            <div className="dialog-actions">
              <button
                className="dialog-cancel"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </button>
              <button
                className="dialog-confirm"
                onClick={handleAddCategory}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
