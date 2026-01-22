import { SkillCards } from "./SkillCards";

const skills = [
  {
    name: "HTML",
    image: "/html.png",
    level: 90,
    color: "bg-orange-400",
  },
  {
    name: "CSS",
    image: "/css.png",
    level: 90,
    color: "bg-blue-600/60",
  },
  {
    name: "JavaScript",
    image: "/js.png",
    level: 80,
    color: "bg-yellow-300",
  },
  {
    name: "React",
    image: "/react.png",
    level: 75,
    color: "bg-blue-400",
  },
  {
    name: "Node",
    image: "/node.png",
    level: 50,
    color: "bg-green-500",
  },
  {
    name: "Express",
    image: "/express.png",
    level: 50,
    color: "bg-gray-500",
  },
  {
    name: "MySQL",
    image: "/mysql.png",
    level: 65,
    color: "bg-orange-500",
  },
  {
    name: "MongoDB",
    image: "/mongodb.png",
    level: 60,
    color: "bg-green-500",
  },
  {
    name: "Tailwind CSS",
    image: "/tailwind.png",
    level: 70,
    color: "bg-cyan-500",
  },
  {
    name: "GitHUb",
    image: "/github.png",
    level: 85,
    color: "bg-gray-700",
  },
];

export const Skills = () => {
  return (
    <section className="py-12" id="skills">
      <h1 className="text-5xl font-extrabold text-center mt-10 mb-0 title-h1">
        MY SKILLS
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 lg:gap-8 gap-2 place-items-center mb-3 overflow-auto fade-up margintb">
        {skills.map((skill) => (
          <SkillCards key={skill.name} {...skill} />
        ))}
      </div>
    </section>
  );
};
