import { useNavigate } from "react-router-dom";
import "./MCQLibrary.css";

export default function MCQCategoryPage() {
  const navigate = useNavigate();

  const categories = [
    {
      title: "Technical MCQ",
      value: "Technical MCQ",
      icon: "💻",
      desc: "Programming, CS fundamentals, core technical concepts"
    },
    {
      title: "Aptitude",
      value: "Aptitude",
      icon: "📊",
      desc: "Quantitative, logical reasoning & problem solving"
    },
    {
      title: "Verbal",
      value: "Verbal",
      icon: "🗣️",
      desc: "Grammar, comprehension & communication skills"
    }
  ];

  return (
    <div className="mcq-page">
      <h1 className="mcq-title">MCQ Library</h1>
      <p className="mcq-subtitle">
        Choose a category to start practicing
      </p>

      <div className="mcq-grid">
        {categories.map((cat) => (
          <div
            key={cat.value}
            className="mcq-card category-card"
            onClick={() => navigate(`/mcqs/category/${cat.value}`)}
          >
            <div className="mcq-icon">{cat.icon}</div>
            <h2>{cat.title}</h2>
            <p className="mcq-desc">{cat.desc}</p>
            <span className="mcq-action">Explore →</span>
          </div>
        ))}
      </div>
    </div>
  );
}
