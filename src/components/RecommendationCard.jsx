const RecommendationCard = ({ title, content }) => {
  return (
    <div
      className="p-4 border-l-4 shadow-sm rounded"
      style={{
        backgroundColor: "var(--card-light)",
        borderLeftColor: "var(--text-dark)",
        color: "var(--text-dark)",
        fontFamily: "var(--font-main)",
      }}
    >
      <h2 className="font-semibold text-lg mb-2">{title}</h2>
      <p className="whitespace-pre-line text-sm">{content}</p>
    </div>
  );
};

export default RecommendationCard;
