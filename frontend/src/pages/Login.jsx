import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import { loginUser, getCurrentUser } from "../api/authApi";
import { getApiError } from "../api/axios";

import { useAuthStore } from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();

  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError("");

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      return "Email is required";
    }

    if (!formData.password.trim()) {
      return "Password is required";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const loginResponse = await loginUser(formData);

      const token = loginResponse.access_token;

      setAuth({
        token,
        user: null
      });

      const user = await getCurrentUser();

      setAuth({
        token,
        user
      });

      navigate("/dashboard");
    } catch (err) {
      setError(getApiError(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        px-6
      "
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          glass-card
          w-full
          max-w-md
          rounded-3xl
          p-8
        "
      >
        <div className="mb-8">
          <h1 className="text-4xl font-display text-cyan">
            ForecastIQ
          </h1>

          <p className="text-textMuted mt-2">
            AI-powered demand forecasting platform
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />

          {error && (
            <div
              className="
                bg-danger/10
                border
                border-danger/30
                text-danger
                px-4 py-3
                rounded-xl
                text-sm
              "
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={loading}
          >
            Login
          </Button>
        </form>

        <p className="text-textMuted text-sm mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-cyan"
          >
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}