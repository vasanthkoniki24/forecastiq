import { motion } from "framer-motion";

export default function Card({
  children,
  className = ""
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{
        borderColor: "rgba(0,212,255,0.3)"
      }}
      className={`
        glass-card
        rounded-3xl
        p-6
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}