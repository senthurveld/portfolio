import TextType from "./TextType";

export const HeroSection = () => {
  return (
    <div
      id="home"
      className="flex justify-center lg:justify-evenly items-center lg:flex-row flex-col mt-10 mb-50"
    >
      <div className="max-w-125 inline-block fade-left">
        <div className="text-4xl md:text-6xl sm:mt-30 mt-15 font-semibold ">
          <span className="">I’m </span>
          <TextType
            text={["Senthurvel.", "React Developer.", "Coder."]}
            typingSpeed={85}
            pauseDuration={2000}
            showCursor={true}
            cursorCharacter="|"
          />
        </div>
        <p className="text-xl">
          I’m a <span className="sub-hightlight">Front-End Developer</span>{" "}
          passionate about building web applications using{" "}
          <span className="sub-hightlight">JavaScript and React.</span> I create
          responsive, user-friendly interfaces, clean UI, reusable components,
          and maintainable code. Always learning and{" "}
          <span className="sub-hightlight">experimenting</span> with modern
          frontend tools.
        </p>
      </div>
      <div className="relative z-10 hidden md:block p-5 pp-img fade-right">
        <img
          src="../../public/Layer.png"
          alt="profile image"
          className="w-auto h-110 bg-transparent backdrop-blur-xs rounded-full"
        />
      </div>
      <div className="lg:mb-36 mb:20"></div>
    </div>
  );
};
