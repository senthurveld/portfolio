export const SkillCards = ({ name, image, level, color }) => {
  return (
    <div className="w-full max-w-md rounded-2xl shadow-md p-6 hover:shadow-2xl backdrop-blur-xs transition ease-linear">
      {/* Skill Image */}
      <div className="flex items-center gap-4">
        <img
          src={image}
          alt={name}
          className="w-18 h-16 object-contain skill-img"
        />
        <h3 className="text-2xl font-normal text-gray-900 skill-title">
          {name}
        </h3>
      </div>

      {/* Progress Bar */}
      <div className="md:mt-6">
        <div className="flex justify-between text-sm font-semibold text-gray-900 mb-1">
          <span className="font-medium">Level</span>
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
