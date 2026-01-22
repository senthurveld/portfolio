import ProjectCard from "./ProjectCard";

const projects = [
  {
    title: "Bharathi Photo Studio",
    image: "/photography.png",
    liveUrl: "https://senthurveld.github.io/photography-site/",
  },
  {
    title: "Musix App - VibeSpot",
    image: "/musixapp.png",
    liveUrl: "https://musix-app.up.railway.app/",
  },
  {
    title: "Expense Splitter",
    image: "/expense.png",
    liveUrl: "https://senthurveld.github.io/expense-splitter/",
  },
  {
    title: "Country Explorer",
    image: "/country.png",
    liveUrl: "https://senthurveld.github.io/country-explorer/",
  },
  {
    title: "Movie fetch",
    image: "/movie.png",
    liveUrl:
      "https://senthurveld.github.io/mini-projects/fetch-movie/index.html",
  },
  {
    title: "MobileShop Website",
    image: "/mobileshop.png",
    liveUrl: "https://senthurveld.github.io/mobileshop/",
  },
  {
    title: "Quiz Timer App",
    image: "/quiz.png",
    liveUrl: "https://senthurveld.github.io/mini-projects/quiz-app/index.html",
  },
  {
    title: "To Do List App",
    image: "/todo.png",
    liveUrl:
      "https://senthurveld.github.io/mini-projects/to-do%20app/index.html",
  },
  {
    title: "Weather App",
    image: "/weather.png",
    liveUrl:
      "https://senthurveld.github.io/mini-projects/Weather%20App/index.html",
  },
  {
    title: "",
    image: "",
    liveUrl: "",
  },
];

export const ProjectsRow = () => {
  return (
    <section className="py-12 mt-10 mb-20 margintb" id="projects">
      <h2 className="text-5xl font-extrabold text-center mt-0 mb-25 title-h1">
        MY PROJECTS
      </h2>

      <div className="flex gap-6 overflow-x-auto pb-4 scroll-bar fade-up">
        {projects.map((project, index) => (
          <ProjectCard key={index} {...project} />
        ))}
      </div>
    </section>
  );
};




