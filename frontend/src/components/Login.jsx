import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Card,
  InputAdornment,
  IconButton,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function Login({ setCurrentUser, setAuthMode }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Dynamically choose between the Login and Register APIs we built
    const endpoint = isRegistering ? "/api/register" : "/api/login";
    const payload = isRegistering
      ? { fullName, email, password }
      : { email, password };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === "Success") {
        // THE CRITICAL FIX: The token must be saved under "logistics_token"
        // so App.jsx can find it and map the RBAC roles perfectly.
        localStorage.setItem("logistics_token", data.token);
        setCurrentUser(data.user);
      } else {
        setError(data.message || "Authentication failed. Please try again.");
      }
    } catch (err) {
      console.error("Failed to connect to the server:", err);
      setError(
        "Network Error: Cannot reach the backend. Is port 5000 running?",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        maxWidth: 440,
        width: "100%",
        p: { xs: 3, md: 5 },
        borderRadius: 4,
        boxShadow:
          "0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        border: "1px solid rgba(255,255,255,0.8)",
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box
          sx={{
            bgcolor: "primary.main",
            p: 1.5,
            borderRadius: 3,
            display: "flex",
            mb: 2,
          }}
        >
          <LocalShippingIcon sx={{ color: "white", fontSize: 32 }} />
        </Box>
        <Typography
          variant="h5"
          color="primary"
          fontWeight="bold"
          textAlign="center"
        >
          Logistics Portal
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mt: 1 }}
        >
          {isRegistering
            ? "Create your corporate account."
            : "Sign in to manage active network transfers."}
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
      >
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {isRegistering && (
          <TextField
            label="Full Name"
            variant="outlined"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            fullWidth
            required={isRegistering}
          />
        )}

        <TextField
          label="Corporate Email"
          type="email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
        />

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {!isRegistering && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: -1 }}>
            <Typography
              variant="caption"
              color="secondary"
              sx={{
                cursor: "pointer",
                fontWeight: 600,
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={() => setAuthMode("forgot")}
            >
              Forgot Password?
            </Typography>
          </Box>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          disabled={loading}
          sx={{ py: 1.5, mt: 1, borderRadius: 2, fontSize: "1rem" }}
        >
          {loading
            ? "Processing..."
            : isRegistering
              ? "Create Account"
              : "Sign In"}
        </Button>
      </Box>

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {isRegistering
            ? "Already have an account? "
            : "Don't have an account? "}
          <Typography
            component="span"
            variant="body2"
            color="secondary"
            fontWeight="bold"
            sx={{
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(""); // Clear errors when switching tabs
            }}
          >
            {isRegistering ? "Sign In" : "Register Here"}
          </Typography>
        </Typography>
      </Box>
    </Card>
  );
}
