import { useAuthStore } from "../../store/authStore";

export default function Topbar() {
  const user = useAuthStore((state) => state.user);

  return (
    <header
      className="
        h-20
        border-b
        border-borderSubtle
        px-6
        flex
        items-center
        justify-between
        bg-secondaryBg/40
        backdrop-blur-xl
      "
    >
      <div>
        <h2 className="text-xl font-semibold">
          Welcome back
        </h2>

        <p className="text-textMuted text-sm">
          Forecasting intelligence dashboard
        </p>
      </div>

      <div
        className="
          px-4 py-2
          rounded-2xl
          bg-white/5
          border border-borderSubtle
        "
      >
        <p className="text-sm">
          {user?.full_name || "User"}
        </p>

        <p className="text-xs text-textMuted">
          {user?.email || ""}
        </p>
      </div>
    </header>
  );
}