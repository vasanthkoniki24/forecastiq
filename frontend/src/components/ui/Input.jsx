export default function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  name,
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm text-textMuted">
          {label}
        </label>
      )}

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
        className={`
          w-full
          px-4 py-3
          rounded-xl
          bg-secondaryBg
          border
          text-textMain
          outline-none
          transition-all duration-300
          placeholder:text-textMuted
          ${
            error
              ? "border-danger"
              : "border-borderSubtle focus:border-cyan"
          }
        `}
      />

      {error && (
        <p className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}