export const SkillCards = ({ name, image, level, color }) => {
  return (
    <div className="w-full max-w-sm rounded-2xl shadow-sm p-6 hover:shadow-2xl transition">
      {/* Skill Image */}
      <div className="flex items-center gap-4">
        <img src={image} alt={name} className="w-18 h-14 object-contain" />
        <h3 className="text-2xl font-normal text-gray-800 skill-title">
          {name}
        </h3>
      </div>

      {/* Progress Bar */}
      <div className="mt-5">
        <div className="flex justify-between text-sm text-gray-800 mb-1">
          <span className="">Level</span>
          <span className="font-medium">{level}%</span>
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
