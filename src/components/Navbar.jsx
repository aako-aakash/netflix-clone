import { useEffect, useState } from "react";

const Navbar = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full px-6 py-4 transition-all duration-500
      ${show ? "bg-black" : "bg-transparent"}`}
    >
      <div className="flex items-center justify-between">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
          alt="Netflix"
          className="w-28 cursor-pointer"
        />

        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
          alt="User"
          className="w-8 h-8 rounded cursor-pointer"
        />
      </div>
    </nav>
  );
};

export default Navbar;
