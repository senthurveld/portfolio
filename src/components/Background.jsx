import Squares from "./Squares";

export const Background = () => {
  return (
    <>
      <Squares
        borderColor="#37373732"
        hoverFillColor="#548eb7b5"
        squareSize={40}
        speed={0.1}
      />
    </>
  );
};
