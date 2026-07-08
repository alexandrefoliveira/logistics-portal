import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Link,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

export default function Login({ setCurrentUser, setAuthMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Both email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || data.status === "Error") {
        setError(data.error || data.message || "Invalid login credentials.");
        setLoading(false);
        return;
      }

      // --- CRITICAL JWT SECURITY STEP ---
      // Save the secure token to the browser so the user stays logged in
      localStorage.setItem("logistics_token", data.token);

      // Unlock the dashboard
      setCurrentUser(data.user);
    } catch (err) {
      console.error("Login fetch error:", err);
      setError(
        "Unable to connect to the server. Is the Node.js backend running?",
      );
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 5,
            width: "100%",
            borderRadius: 4,
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05)",
            border: "1px solid rgba(0,0,0,0.1)",
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
                color: "white",
                p: 1.5,
                borderRadius: 3,
                mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocalShippingIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography
              component="h1"
              variant="h5"
              color="primary"
              fontWeight="bold"
            >
              Sign in to Logistics Portal
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Corporate Email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            {setAuthMode && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 1,
                  mb: 1,
                }}
              >
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => setAuthMode("forgot")}
                  sx={{
                    fontWeight: 600,
                    color: "primary.main",
                    textDecoration: "none",
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2, mb: 3, py: 1.8, fontWeight: "bold" }}
            >
              {loading ? "Verifying..." : "Sign In"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
