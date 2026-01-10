import TextType from "./TextType";
import { Mail, GithubIcon, Linkedin } from "lucide-react";
import Magnet from "./Magnet";
import './Button.css'
export const HeroSection = () => {
  return (
    <div
      id="home"
      className="flex justify-center lg:justify-evenly items-center lg:flex-row flex-col mt-10 mb-30 margintb"
    >
      <div className="max-w-145 inline-block fade-left">
        <div className="text-4xl md:text-6xl sm:mt-5 mt-10 font-semibold custom-h1 mb-14">
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
        <div className="flex gap-6 mt-20 ml-2 pp-icons">
          <a href="#contact" className="pp-icons">
            <Mail
              className="hover:stroke-blue-500"
              size={26}
              strokeWidth={1.7}
            />
          </a>
          <a
            href="https://www.linkedin.com/in/senthurveld"
            target="_blank"
            rel="noopener noreferrer"
            className="pp-icons"
          >
            <Linkedin
              className="hover:stroke-blue-500"
              size={26}
              strokeWidth={1.7}
            />
          </a>
          <a
            href="https://github.com/senthurveld"
            target="_blank"
            rel="noopener noreferrer"
            className="pp-icons"
          >
            <GithubIcon
              className="hover:stroke-blue-500"
              size={26}
              strokeWidth={1.7}
            />
          </a>
          <a
            // download
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-15 -mt-4"
          >
            <Magnet padding={70} magnetStrength={1}>
              <button className=" energy-btn">
                Download CV
              </button>
            </Magnet>
          </a>
        </div>
      </div>
      {/* Hero Image  */}
      <div className="relative z-10 hidden md:block p-5 pp-img mt-5">
        <img
          src="/Layer.png"
          alt="profile image"
          className="w-auto h-105 bg-transparent max-sm:backdrop-blur-xs rounded-full fade-right hero-img"
        />
      </div>
    </div>
  );
};
