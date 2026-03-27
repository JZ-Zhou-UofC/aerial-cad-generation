"use client";
import React from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";

interface NotificationBubbleProps {
  open: boolean;
  message: string;
  severity: AlertColor; // "error" | "warning" | "info" | "success"
  onClose: (event?: React.SyntheticEvent | Event, reason?: string) => void;
}

const NotificationBubble: React.FC<NotificationBubbleProps> = ({
  open,
  message,
  severity,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000} // auto-hide after 5 seconds
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{
          padding: "20px",
          fontSize: "1.5rem",
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationBubble;
