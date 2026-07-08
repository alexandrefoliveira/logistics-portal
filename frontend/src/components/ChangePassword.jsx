import React, { useState } from "react";
import axios from "axios";
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

// Ensure this matches your backend port!
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ChangePassword({ open, onClose, currentUser }) {
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); // Prevent page refresh
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
      // 1. Grab the security token saved during Login
      const token = localStorage.getItem("logistics_token");

      // 2. Explicitly attach the token to the Axios headers
      const response = await axios.put(
        `${API_BASE_URL}/api/users/${currentUser?.id}/password`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // This proves to the backend you are allowed to make changes!
          },
        },
      );

      if (response.data.status === "Success") {
        setStatus({
          error: "",
          success: "Password successfully updated in the database!",
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
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setStatus({
        error:
          err.response?.data?.message ||
          err.response?.data?.error ||
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
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "white" }}
        >
          Change Password
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
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

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              required
              fullWidth
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwords.currentPassword}
              onChange={handleChange}
              disabled={status.loading || !!status.success}
            />
            <TextField
              required
              fullWidth
              label="New Password"
              name="newPassword"
              type="password"
              value={passwords.newPassword}
              onChange={handleChange}
              disabled={status.loading || !!status.success}
            />
            <TextField
              required
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={handleChange}
              disabled={status.loading || !!status.success}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} color="inherit" disabled={status.loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={status.loading || !!status.success}
          >
            Update Password
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
