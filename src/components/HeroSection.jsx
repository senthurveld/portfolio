import TextType from "./TextType";
import { Mail, GithubIcon, Linkedin } from "lucide-react";

export const HeroSection = () => {
  return (
    <div
      id="home"
      className="flex justify-center lg:justify-evenly items-center lg:flex-row flex-col mt-10 mb-30"
    >
      <div className="max-w-145 inline-block fade-left">
        <div className="text-4xl md:text-6xl sm:mt-5 mt-10 font-semibold custom-h1 mb-4">
          <span className="">I’m </span>
          <TextType
            text={["Senthurvel.", "React Developer.", "Coder."]}
            typingSpeed={85}
            pauseDuration={2000}
            showCursor={true}
            cursorCharacter="|"
          />
        </div>
        <p className="text-xl font-medium">
          I’m a <span className="sub-hightlight">Front-End Developer</span>{" "}
          passionate about building web applications using{" "}
          <span className="sub-hightlight">JavaScript and React.</span> I create
          responsive, user-friendly interfaces, clean UI, reusable components,
          and maintainable code. Always learning and{" "}
          <span className="sub-hightlight">experimenting</span> with modern
          frontend tools.
        </p>
        <div className="flex gap-6 mt-4 ml-2 pp-icons">
          <a href="" className="pp-icons">
            <Mail
              className="hover:stroke-blue-500"
              size={26}
              strokeWidth={1.9}
            />
          </a>
          <a href="" className="pp-icons">
            <Linkedin
              className="hover:stroke-blue-500"
              size={26}
              strokeWidth={1.9}
            />
          </a>
          <a href="" className="pp-icons">
            <GithubIcon
              className="hover:stroke-blue-500"
              size={26}
              strokeWidth={1.9}
            />
          </a>
        </div>
      </div>

      <div className="relative z-10 hidden md:block p-5 pp-img mt-5">
        <img
          src="../../public/Layer.png"
          alt="profile image"
          className="w-auto h-105 bg-transparent max-sm:backdrop-blur-xs rounded-full fade-right"
        />
      </div>
      {/* <div className="lg:mb-36 mb:20"></div> */}
    </div>
  );
};
