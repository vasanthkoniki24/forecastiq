const badgeVariants = {
  success: "bg-success/15 text-success",
  danger: "bg-danger/15 text-danger",
  warning: "bg-warning/15 text-warning",
  info: "bg-cyan/15 text-cyan"
};

export default function Badge({
  children,
  variant = "info"
}) {
  return (
    <span
      className={`
        inline-flex items-center
        px-3 py-1
        rounded-full
        text-xs font-semibold
        ${badgeVariants[variant]}
      `}
    >
      {children}
    </span>
  );
}