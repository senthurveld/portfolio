import styles from "./Navbar.module.css";

export const Navbar = () => {
  return (
    <>
      <div
        className="flex flex-row justify-around items-center p-4 md:p-1 bg-transparent backdrop-blur-xs w-12/12 m-auto rounded-xl mt-1 sticky top-1 z-40"
      >
        <div className={`hidden md:block text-center ${styles.sub}`}>
          <a href="#home">
            <h2 className="font-light text-2xl logo-heading tracking-widest">
              Senthurvel
            </h2>
            <p className={`font-extralight italic -translate-y-2 ${styles}`}>
              portfolio
            </p>
          </a>
        </div>
        <div className="flex ">
          <ul
            className={`flex justify-between gap-15 font-semibold md:font-normal  ${styles.navlink}`}
          >
            <li>
              <a href="#home"> Home </a>
            </li>
            <li>
              <a href="#skills"> Skills </a>
            </li>
            <li>
              <a href="#contact"> Contact </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
