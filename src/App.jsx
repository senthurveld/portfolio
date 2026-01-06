import "./App.css";
import { Background } from "./components/Background";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import ClickSpark from "./components/ClickSpark";
import { Skills } from "./components/Skills";
export const App = () => {
  return (
    <>
      <Background />
      <ClickSpark
        sparkColor="#548eb7b5"
        sparkSize={20}
        sparkRadius={10}
        sparkCount={9}
        duration={300}
      >
        <div className="relative z-40 sm:mr-25 sm:ml-25 mr-5 ml-5">
          <Navbar />
          <HeroSection />
          <Skills />
        </div>
      </ClickSpark>
    </>
  );
};
