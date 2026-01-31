import Navbar from "../components/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Placeholder content to enable scroll */}
      <div className="h-[200vh] pt-32 text-center text-gray-400">
        Scroll to see navbar effect
      </div>
    </div>
  );
};

export default Home;
