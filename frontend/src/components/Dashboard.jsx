import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MoreVertIcon from "@mui/icons-material/MoreVert";
// Notice the 'd' at the end of 'Outlined' below!
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

// Mock data for the enterprise table
const recentTransfers = [
  {
    id: "TRX-8902",
    type: "Material",
    origin: "Shelburne",
    dest: "Feversham",
    status: "Pending Quote",
    date: "Jul 03, 2026",
  },
  {
    id: "TRX-8901",
    type: "Equipment",
    origin: "Shelburne",
    dest: "Calgary",
    status: "Approved",
    date: "Jul 02, 2026",
  },
  {
    id: "TRX-8899",
    type: "Material",
    origin: "Vendor",
    dest: "Shelburne",
    status: "In Transit",
    date: "Jul 01, 2026",
  },
  {
    id: "TRX-8895",
    type: "Equipment",
    origin: "BMP",
    dest: "Shelburne",
    status: "Completed",
    date: "Jun 28, 2026",
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case "Approved":
      return { bg: "#e0f2fe", text: "#0284c7" }; // Modern light blue
    case "Pending Quote":
      return { bg: "#fef3c7", text: "#d97706" }; // Modern amber
    case "In Transit":
      return { bg: "#f3e8ff", text: "#9333ea" }; // Modern purple
    case "Completed":
      return { bg: "#dcfce7", text: "#16a34a" }; // Modern green
    default:
      return { bg: "#f1f5f9", text: "#475569" };
  }
};

export default function Dashboard({ setView }) {
  return (
    <Box sx={{ backgroundColor: "#fafafa", minHeight: "100vh", pb: 10 }}>
      {/* MODERN TOP NAVIGATION */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 32,
                height: 32,
                backgroundColor: "#111827",
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocalShippingOutlinedIcon sx={{ color: "#fff", fontSize: 18 }} />
            </Box>
            <Typography
              variant="h6"
              fontWeight="700"
              color="#111827"
              letterSpacing="-0.5px"
            >
              Logistics Portal
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={3}>
            <Typography
              variant="body2"
              color="#6b7280"
              sx={{ cursor: "pointer", "&:hover": { color: "#111827" } }}
            >
              Documentation
            </Typography>
            <Typography
              variant="body2"
              color="#6b7280"
              sx={{ cursor: "pointer", "&:hover": { color: "#111827" } }}
            >
              Support
            </Typography>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: "0.875rem",
                fontWeight: "600",
                backgroundColor: "#f3f4f6",
                color: "#111827",
                border: "1px solid #e5e7eb",
              }}
            >
              AO
            </Avatar>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 8 }}>
        {/* HERO GREETING */}
        <Box mb={6}>
          <Typography
            variant="h3"
            fontWeight="800"
            color="#111827"
            letterSpacing="-1px"
            gutterBottom
          >
            Good afternoon, Alexandre.
          </Typography>
          <Typography variant="h6" fontWeight="400" color="#6b7280">
            Here is the current status of your facility transfers and pending
            approvals.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* QUICK ACTIONS */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="subtitle2"
              fontWeight="700"
              color="#9ca3af"
              textTransform="uppercase"
              letterSpacing="1px"
              mb={2}
            >
              New Request
            </Typography>

            <Paper
              elevation={0}
              onClick={() => setView("material")}
              sx={{
                p: 3,
                mb: 2,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#111827",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                },
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Box display="flex" alignItems="center" gap={1.5}>
                  <LocalShippingOutlinedIcon sx={{ color: "#111827" }} />
                  <Typography
                    variant="subtitle1"
                    fontWeight="600"
                    color="#111827"
                  >
                    Material Move
                  </Typography>
                </Box>
                <ArrowForwardIcon sx={{ color: "#9ca3af", fontSize: 18 }} />
              </Box>
              <Typography variant="body2" color="#6b7280">
                Standard routing for raw materials and finished goods.
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              onClick={() => setView("equipment")}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#111827",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                },
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Box display="flex" alignItems="center" gap={1.5}>
                  <PrecisionManufacturingOutlinedIcon
                    sx={{ color: "#111827" }}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight="600"
                    color="#111827"
                  >
                    Equipment Move
                  </Typography>
                </Box>
                <ArrowForwardIcon sx={{ color: "#9ca3af", fontSize: 18 }} />
              </Box>
              <Typography variant="body2" color="#6b7280">
                Capital assets requiring HS Tariff and Project Code tracking.
              </Typography>
            </Paper>
          </Grid>

          {/* ACTIVE TRANSFERS DATA TABLE */}
          <Grid item xs={12} md={8}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                variant="subtitle2"
                fontWeight="700"
                color="#9ca3af"
                textTransform="uppercase"
                letterSpacing="1px"
              >
                Recent Transfers
              </Typography>
              <Button
                variant="text"
                size="small"
                sx={{
                  color: "#111827",
                  fontWeight: "600",
                  textTransform: "none",
                }}
              >
                View All Archives
              </Button>
            </Box>

            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              <Table sx={{ minWidth: 650 }}>
                <TableHead
                  sx={{
                    backgroundColor: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <TableRow>
                    <TableCell
                      sx={{
                        color: "#6b7280",
                        fontWeight: "600",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                      }}
                    >
                      ID
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#6b7280",
                        fontWeight: "600",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Type
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#6b7280",
                        fontWeight: "600",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Route
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#6b7280",
                        fontWeight: "600",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: "#6b7280",
                        fontWeight: "600",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Date
                    </TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentTransfers.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:hover": { backgroundColor: "#f9fafb" },
                      }}
                    >
                      <TableCell sx={{ fontWeight: "600", color: "#111827" }}>
                        {row.id}
                      </TableCell>
                      <TableCell sx={{ color: "#4b5563" }}>
                        {row.type}
                      </TableCell>
                      <TableCell sx={{ color: "#4b5563" }}>
                        {row.origin} → {row.dest}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(row.status).bg,
                            color: getStatusColor(row.status).text,
                            fontWeight: "600",
                            fontSize: "0.75rem",
                            borderRadius: 1.5,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: "#6b7280", fontSize: "0.875rem" }}
                      >
                        {row.date}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" sx={{ color: "#9ca3af" }}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            {/* SYSTEM ALERTS WIDGET */}
            <Box
              mt={4}
              p={3}
              sx={{
                backgroundColor: "#f8fafc",
                borderRadius: 3,
                border: "1px dashed #cbd5e1",
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              {/* FIXED CheckCircleOutlinedIcon used below! */}
              <CheckCircleOutlinedIcon sx={{ color: "#10b981", mt: 0.5 }} />
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight="700"
                  color="#111827"
                >
                  System Systems Nominal
                </Typography>
                <Typography variant="body2" color="#6b7280">
                  Database connected. React frontend successfully compiling. All
                  APIs are currently responsive.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
