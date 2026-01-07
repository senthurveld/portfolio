const ProjectCard = ({ title, image, liveUrl }) => {
  return (
    <a
      href={liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="min-w-[320px] md:min-w-95 h-60 rounded-2xl overflow-hidden
                 bg-white/10 backdrop-blur-xl border border-white/20
                 shadow-lg hover:scale-105 transition-transform duration-300"
    >
      {/* Image */}
      <img src={image} alt={title} className="w-full h-40 object-cover" />

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-300 mt-1">
          Click to view live project →
        </p>
      </div>
    </a>
  );
};

export default ProjectCard;
