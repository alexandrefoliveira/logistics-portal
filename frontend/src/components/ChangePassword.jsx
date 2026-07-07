import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
} from "@mui/material";

export default function ChangePassword({ open, onClose, userEmail }) {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState({
    error: "",
    success: "",
    loading: false,
  });

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setStatus({ error: "", success: "", loading: true });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatus({
        error: "New passwords do not match.",
        success: "",
        loading: false,
      });
      return;
    }

    if (passwords.newPassword.length < 8) {
      setStatus({
        error: "Password must be at least 8 characters long.",
        success: "",
        loading: false,
      });
      return;
    }

    try {
      // TODO: Connect to Node.js /api/change-password endpoint
      // const response = await fetch('/api/change-password', { ... })

      setStatus({
        error: "",
        success: "Password successfully updated.",
        loading: false,
      });
      setTimeout(() => {
        onClose();
        setStatus({ error: "", success: "", loading: false });
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }, 2000);
    } catch (err) {
      setStatus({
        error:
          "Failed to update password. Please verify your current password.",
        success: "",
        loading: false,
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "white" }}
      >
        Change Password
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box component="form" sx={{ mt: 1 }}>
          {status.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {status.error}
            </Alert>
          )}
          {status.success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {status.success}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            label="Current Password"
            name="currentPassword"
            type="password"
            value={passwords.currentPassword}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="New Password"
            name="newPassword"
            type="password"
            value={passwords.newPassword}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={passwords.confirmPassword}
            onChange={handleChange}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit" disabled={status.loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={status.loading}
        >
          Update Password
        </Button>
      </DialogActions>
    </Dialog>
  );
}
