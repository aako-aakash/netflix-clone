import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useMemo, useState } from "react";
import Home from "../pages/Home";
import Search from "../pages/Search";
import MyList from "../pages/MyList";
import MovieDetails from "../pages/MovieDetails";
import Watch from "../pages/Watch";
import ProfileSelect from "../pages/ProfileSelect";
import IntroSplash from "../components/IntroSplash";
import { useProfile } from "../hooks/useProfile";

export default function App() {
  const { hasProfile } = useProfile();

  const shouldShowIntroInitially = useMemo(() => {
    try {
      return true;
    } catch {
      return true;
    }
  }, []);

  const [showIntro, setShowIntro] = useState(shouldShowIntroInitially);

  const handleIntroDone = () => {
    try {
      sessionStorage.setItem("netflix_clone_intro_seen_v1", "1");
    } catch {}
    setShowIntro(false);
  };

  if (showIntro) {
    return <IntroSplash onDone={handleIntroDone} />;
  }

  if (!hasProfile) {
    return <ProfileSelect />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/my-list" element={<MyList />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}