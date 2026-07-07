import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Avatar,
  Link,
  Collapse,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

// Extracted from Project Contacts.xlsx
const AUTHORIZED_USERS = [
  "llima@iceriversprings.com",
  "cduncan@iceriversprings.com",
  "jhorner@bmpextrusion.com",
  "wlegere@bluemountainplastics.com",
  "kstrehl@iceriversprings.com",
  "conradwilliams@iceriversprings.com",
  "dgagnon@iceriversprings.com",
  "aelhourani@iceriversprings.com",
  "sfonseca@iceriversprings.com",
  "tparker@bluemountainplastics.com",
  "vsoni@iceriversprings.com",
];

export default function Login({ setToken }) {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    // Pre-submission validation
    if (!credentials.email || !credentials.password) {
      setError("Both email and password are required.");
      return;
    }

    const normalizedEmail = credentials.email.toLowerCase().trim();

    // Strict validation against the provided project contacts
    if (!AUTHORIZED_USERS.includes(normalizedEmail)) {
      setError(
        "Unauthorized access. Your email is not on the approved project contacts list.",
      );
      return;
    }

    // TODO: Wire this up to the Node.js /api/login endpoint
    // For now, we simulate a successful token retrieval
    setToken("secure-jwt-mock-token");
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!credentials.email) {
      setError(
        "Please enter your corporate email address to reset your password.",
      );
      return;
    }

    // TODO: Wire this up to the Node.js /api/forgot-password endpoint
    setInfoMessage(
      `If an account exists for ${credentials.email}, a reset link has been sent.`,
    );
  };

  const toggleView = (e) => {
    e.preventDefault();
    setIsForgotPassword(!isForgotPassword);
    setError("");
    setInfoMessage("");
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
        <Paper elevation={3} sx={{ p: 4, width: "100%", borderRadius: 2 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar
              sx={{ m: 1, bgcolor: "primary.main", width: 56, height: 56 }}
            >
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Typography component="h1" variant="h5" fontWeight="bold">
              Logistics Portal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isForgotPassword
                ? "Password Recovery"
                : "Secure Access Required"}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {infoMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {infoMessage}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={isForgotPassword ? handleForgotPassword : handleLogin}
            noValidate
          >
            <TextField
              margin="normal"
              required
              fullWidth
              label="Corporate Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={credentials.email}
              onChange={handleChange}
              error={!!error && !credentials.email}
            />

            <Collapse in={!isForgotPassword}>
              <TextField
                margin="normal"
                required={!isForgotPassword}
                fullWidth
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={handleChange}
                error={!!error && !credentials.password && !isForgotPassword}
              />
            </Collapse>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: "bold" }}
            >
              {isForgotPassword ? "Send Reset Link" : "Sign In"}
            </Button>

            <Box textAlign="center" mt={1}>
              <Link component="button" variant="body2" onClick={toggleView}>
                {isForgotPassword ? "Return to Sign In" : "Forgot Password?"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
