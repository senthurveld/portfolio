export const SkillCards = ({ name, image, level, color = "bg-red-500" }) => {
  return (
    <div className="w-full max-w-sm rounded-2xl shadow-xl p-6 hover:shadow-md transition backdrop-opacity-10">
      {/* Skill Image */}
      <div className="flex items-center gap-4">
        <img src={image} alt={name} className="w-18 h-14 object-contain" />
        <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
      </div>

      {/* Progress Bar */}
      <div className="mt-5">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Level</span>
          <span>{level}%</span>
        </div>

        <div className="w-full h-3 bg-gray-200  rounded-full overflow-hidden">
          <div
            className={`h-full ${color} rounded-full transition-all duration-700`}
            style={{ width: `${level}%` }}
          />
        </div>
      </div>
    </div>
  );
};


