import ProjectCard from "./ProjectCard";

const projects = [
  {
    title: "Event Photo Studio",
    image: "/photography.png",
    liveUrl: "https://your-live-link.com",
  },
  {
    title: "Expense Splitter",
    image: "/expense.png",
    liveUrl: "https://your-live-link.com",
  },
  {
    title: "Country Explorer",
    image: "/country.png",
    liveUrl: "https://your-live-link.com",
  },
  {
    title: "Movie fetch",
    image: "/movie.png",
    liveUrl: "https://your-live-link.com",
  },
  {
    title: "MobileShop Website",
    image: "/mobileshop.png",
    liveUrl: "https://your-live-link.com",
  },
  {
    title: "Quiz Timer App",
    image: "/quiz.png",
    liveUrl: "https://your-live-link.com",
  },
  {
    title: "To Do List App",
    image: "/todo.png",
    liveUrl: "https://your-live-link.com",
  },
  {
    title: "Weather App",
    image: "/weather.png",
    liveUrl: "https://your-live-link.com",
  },
  {
    title: "",
    image: "",
    liveUrl: "",
  },
];

export const ProjectsRow = () => {
  return (
    <section className="py-12 mt-10 mb-20" id="projects">
      <h2 className="text-5xl font-extrabold text-center mt-0 mb-25 title-h1">
        MY PROJECTS
      </h2>

      <div className="flex gap-6 overflow-x-auto pb-4 scroll-bar">
        {projects.map((project, index) => (
          <ProjectCard key={index} {...project} />
        ))}
      </div>
    </section>
  );
};




