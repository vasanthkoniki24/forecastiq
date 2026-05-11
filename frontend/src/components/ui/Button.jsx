import { motion } from "framer-motion";

export default function Button({
  children,
  type = "button",
  onClick,
  disabled = false,
  className = "",
  loading = false
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-cyan text-primaryBg
        px-5 py-3
        rounded-xl
        font-semibold
        transition-all duration-300
        shadow-glow
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      <span className="relative z-10">
        {loading ? "Processing..." : children}
      </span>

      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "200%" }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 bg-white/10 skew-x-12"
      />
    </motion.button>
  );
}