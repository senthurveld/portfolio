const ProjectCard = ({ title, image, liveUrl }) => {
  return (
    <a
      href={liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative min-w-[320px] md:min-w-100 h-65
                 rounded-2xl overflow-hidden
                 bg-white/10 backdrop-blur-xl border border-white/20
                 shadow-lg project-card"
    >
      {/* Image fits container (NO crop) */}
      <div className="w-full h-full flex items-center justify-center p-0">
        <img
          src={image}
          alt={title}
          className="max-w-full max-h-fit object-center
                     group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Hover Overlay */}
      <div
        className="
          absolute inset-0 flex flex-col justify-end p-5
          bg-white/0 custom-pro overlay 
        "
      >
        <h3 className="text-xl font-semibold pro-name ">{title}</h3>
        <p className="text-xs text-gray-100 mt-1"> View Live Project →</p>
      </div>
    </a>
  );
};

export default ProjectCard;
