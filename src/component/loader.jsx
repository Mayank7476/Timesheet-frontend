import "./loader.css";

const Loader = ({ text = "....THINK GAS...." }) => {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>{text}</p>
    </div>
  );
};

export default Loader;