import React, { useState } from "react";
import { Box, Typography, TextField, Button, Alert, Link } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";

export default function ResetPassword({ setAuthMode }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ error: "", success: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: "", success: "" });

    if (!email) {
      setStatus({
        error: "Please enter your corporate email address.",
        success: "",
      });
      return;
    }

    try {
      // TODO: Connect to your actual Node.js endpoint
      // const response = await fetch('/api/forgot-password', { ... });

      setStatus({
        error: "",
        success: `If an account exists for ${email}, a reset link has been sent.`,
      });
    } catch (err) {
      setStatus({
        error: "Failed to request password reset. Please try again.",
        success: "",
      });
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 5,
        }}
      >
        <Box
          sx={{
            bgcolor: "secondary.main",
            color: "white",
            p: 1.5,
            borderRadius: 3,
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <VpnKeyOutlinedIcon sx={{ fontSize: 32 }} />
        </Box>
        <Typography variant="h5" color="primary" align="center">
          Password Recovery
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          mt={1}
        >
          Enter your email and we'll send you a link to reset your password.
        </Typography>
      </Box>

      {status.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {status.error}
        </Alert>
      )}
      {status.success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {status.success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            placeholder="name@iceriversprings.com"
            variant="outlined"
            fullWidth
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!status.success}
            InputProps={{
              startAdornment: (
                <EmailOutlinedIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ py: 1.8 }}
            disabled={!!status.success}
          >
            Send Reset Link
          </Button>

          <Typography variant="body2" align="center" color="text.secondary">
            Remember your password?{" "}
            <Link
              component="button"
              type="button"
              onClick={() => setAuthMode("login")}
              sx={{
                fontWeight: 600,
                color: "primary.main",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Back to Sign In
            </Link>
          </Typography>
        </Box>
      </form>
    </Box>
  );
}
