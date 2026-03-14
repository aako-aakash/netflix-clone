import { useProfile } from "../hooks/useProfile";

export default function ProfileSelect() {
  const { profiles, selectProfile } = useProfile();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Who’s watching?
        </h1>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => selectProfile(profile.id)}
              className="group flex flex-col items-center"
            >
              <div className="h-28 w-28 md:h-36 md:w-36 overflow-hidden rounded-md border border-transparent bg-white/5 transition group-hover:scale-105 group-hover:border-white/50">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="mt-3 text-white/70 group-hover:text-white">
                {profile.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}