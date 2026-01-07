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
    color: "bg-green-400",
  },
  {
    name: "JavaScript",
    image: "/js.png",
    level: 80,
    color: "bg-yellow-400",
  },
  {
    name: "React",
    image: "/react.png",
    level: 75,
    color: "bg-blue-500",
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
    color: "bg-blue-500",
  },
  {
    name: "MySQL",
    image: "/mysql.png",
    level: 65,
    color: "bg-blue-500",
  },
  {
    name: "MongoDB",
    image: "/mongodb.png",
    level: 60,
    color: "bg-blue-500",
  },
  {
    name: "Tailwind CSS",
    image: "/tailwind.png",
    level: 70,
    color: "bg-cyan-500",
  },
];

export const Skills = () => {
  return (
    <section className="py-12" id="skills">
      <h2 className="text-4xl font-bold text-center mb-10 title-h1">My Skills</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-8 place-items-center overflow-auto">
        {skills.map((skill) => (
          <SkillCards key={skill.name} {...skill} />
        ))}
      </div>
    </section>
  );
};
