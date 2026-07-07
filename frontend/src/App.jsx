import { useState } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  TextField,
  Alert,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
  Badge,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Menu,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Icons
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import TimelineIcon from "@mui/icons-material/Timeline";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

// Import Custom Components
import ChangePassword from "./components/ChangePassword";
import ResetPassword from "./components/ResetPassword";

const theme = createTheme({
  palette: {
    primary: { main: "#0A2540" },
    secondary: { main: "#007BFF" },
    background: { default: "#F8FAFC", paper: "#FFFFFF" },
    success: { main: "#10B981" },
    error: { main: "#EF4444" },
    warning: { main: "#F59E0B" },
    info: { main: "#3B82F6" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.5px" },
    h5: { fontWeight: 600, letterSpacing: "-0.5px" },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: "none", "&:hover": { boxShadow: "none" } },
      },
    },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, color: "#64748B", backgroundColor: "#F8FAFC" },
      },
    },
  },
});

const drawerWidth = 260;
const CHART_COLORS = ["#007BFF", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const CARRIER_EQUIP = [
  "53' Dry Van",
  "Flatbed",
  "Refrigerated",
  "LTL",
  "Ocean Container",
];

// Mock Data
const mockTransfers = [
  {
    id: "TRX-8902",
    type: "Material",
    origin: "Shelburne",
    dest: "Feversham",
    status: "PENDING_QUOTE",
    date: "Jul 03, 2026",
    requestor: "Alexandre Oliveira",
  },
  {
    id: "TRX-8901",
    type: "Equipment",
    origin: "Shelburne",
    dest: "Calgary",
    status: "APPROVED",
    date: "Jul 02, 2026",
    requestor: "John Fudge",
  },
  {
    id: "TRX-8899",
    type: "Material",
    origin: "Vendor",
    dest: "Shelburne",
    status: "IN_TRANSIT",
    date: "Jul 01, 2026",
    requestor: "Mitch Flynn",
  },
  {
    id: "TRX-8895",
    type: "Equipment",
    origin: "BMP",
    dest: "Shelburne",
    status: "COMPLETED",
    date: "Jun 28, 2026",
    requestor: "Alexandre Oliveira",
  },
];

const mockUsers = [
  {
    id: 1,
    full_name: "Alexandre Oliveira",
    email: "aoliveira@iceriversprings.com",
    role: "Admin",
    created_at: "2026-01-15T00:00:00Z",
  },
  {
    id: 2,
    full_name: "John Fudge",
    email: "jfudge@iceriversprings.com",
    role: "Executive",
    created_at: "2026-02-20T00:00:00Z",
  },
  {
    id: 3,
    full_name: "New User",
    email: "newuser@iceriversprings.com",
    role: "Requester",
    created_at: "2026-07-01T00:00:00Z",
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState("Dashboard");

  // Auth State (login, register, or forgot)
  const [authMode, setAuthMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Dialog States
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

  // Equipment Wizard State
  const [equipStep, setEquipStep] = useState(0);
  const [equipForm, setEquipForm] = useState({
    originName: "",
    destName: "",
    shippingEarliest: "",
    shippingLatest: "",
    equipId: "",
    projectCode: "",
    hsCode: "",
    unitValue: "",
    description: "",
    pallets: "",
    weight: "",
    dimensions: "",
    carrier: "",
  });

  const [dateFocus, setDateFocus] = useState({
    earliest: false,
    latest: false,
  });

  // Feature states
  const [usersList, setUsersList] = useState(mockUsers);
  const [equipFile, setEquipFile] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [updatesMap, setUpdatesMap] = useState({});
  const [newUpdateText, setNewUpdateText] = useState("");

  const handleRoleChange = (userId, newRole) => {
    setUsersList(
      usersList.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    );
  };

  const openReviewModal = (transfer) => {
    setSelectedTransfer(transfer);
    setNewUpdateText("");
    setIsReviewModalOpen(true);
  };

  const handlePostUpdate = () => {
    if (!newUpdateText.trim() || !selectedTransfer) return;
    const timestamp = new Date().toLocaleString();
    const update = {
      id: Date.now(),
      user_name: currentUser.full_name,
      text: newUpdateText,
      date: timestamp,
    };
    setUpdatesMap((prev) => ({
      ...prev,
      [selectedTransfer.id]: [update, ...(prev[selectedTransfer.id] || [])],
    }));
    setNewUpdateText("");
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError("");

    if (email.includes("@iceriversprings.com") || email.includes("@bmpp.com")) {
      setCurrentUser({
        id: 1,
        full_name: authMode === "register" ? fullName : "Alexandre Oliveira",
        email: email,
        role: authMode === "register" ? "Requester" : "Admin",
      });
      setActiveView("Dashboard");
    } else {
      setAuthError(
        "Access Denied: Only authorized corporate domains are allowed.",
      );
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView("Dashboard");
    setEquipStep(0);
    setAuthMode("login");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "info";
      case "PENDING_QUOTE":
        return "warning";
      case "IN_TRANSIT":
        return "primary";
      case "COMPLETED":
        return "success";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  const facilityData = [
    { name: "Shelburne", value: 12 },
    { name: "Grafton", value: 5 },
    { name: "Feversham", value: 3 },
    { name: "Calgary", value: 2 },
  ];

  const statusData = [
    { name: "Pending", Transfers: 4 },
    { name: "Approved", Transfers: 8 },
    { name: "In Transit", Transfers: 5 },
    { name: "Completed", Transfers: 15 },
  ];

  if (!currentUser) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(circle at 50% 0%, #E0E7FF 0%, #F8FAFC 60%, #F1F5F9 100%)",
            p: 2,
          }}
        >
          <Card
            elevation={0}
            sx={{
              maxWidth: 440,
              width: "100%",
              p: 5,
              borderRadius: 4,
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05)",
              border: "1px solid rgba(255,255,255,0.8)",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            {authMode === "forgot" ? (
              <ResetPassword setAuthMode={setAuthMode} />
            ) : (
              <>
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
                  <Typography variant="h5" color="primary" align="center">
                    {authMode === "register"
                      ? "Create Logistics Account"
                      : "Sign in to Logistics Portal"}
                  </Typography>
                </Box>

                {authError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {authError}
                  </Alert>
                )}

                <form onSubmit={handleAuthSubmit}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                  >
                    {authMode === "register" && (
                      <TextField
                        placeholder="Full Name"
                        variant="outlined"
                        fullWidth
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <PeopleIcon
                              sx={{ mr: 1, color: "text.secondary" }}
                            />
                          ),
                        }}
                      />
                    )}
                    <TextField
                      placeholder="name@iceriversprings.com"
                      variant="outlined"
                      fullWidth
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <EmailOutlinedIcon
                            sx={{ mr: 1, color: "text.secondary" }}
                          />
                        ),
                      }}
                    />
                    <TextField
                      placeholder="••••••••"
                      variant="outlined"
                      fullWidth
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <LockOutlinedIcon
                            sx={{ mr: 1, color: "text.secondary" }}
                          />
                        ),
                      }}
                    />

                    {authMode === "login" && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mt: -1,
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
                            "&:hover": { textDecoration: "underline" },
                          }}
                        >
                          Forgot Password?
                        </Link>
                      </Box>
                    )}

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      sx={{ py: 1.8 }}
                    >
                      {authMode === "register" ? "Create Account" : "Sign In"}
                    </Button>

                    <Typography
                      variant="body2"
                      align="center"
                      color="text.secondary"
                    >
                      {authMode === "register"
                        ? "Already have an account? "
                        : "Don't have an account? "}
                      <Link
                        component="button"
                        type="button"
                        onClick={() => {
                          setAuthMode(
                            authMode === "register" ? "login" : "register",
                          );
                          setAuthError("");
                        }}
                        sx={{
                          fontWeight: 600,
                          color: "primary.main",
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {authMode === "register" ? "Sign In" : "Sign Up"}
                      </Link>
                    </Typography>
                  </Box>
                </form>
              </>
            )}
          </Card>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh", width: "100%" }}>
        {/* TOP APP BAR */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`,
            bgcolor: "background.paper",
            color: "text.primary",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography variant="h6">{activeView}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                color="inherit"
                onClick={(e) => setNotificationAnchorEl(e.currentTarget)}
              >
                <Badge badgeContent={2} color="secondary">
                  <NotificationsIcon sx={{ color: "text.secondary" }} />
                </Badge>
              </IconButton>
              <Menu
                anchorEl={notificationAnchorEl}
                open={Boolean(notificationAnchorEl)}
                onClose={() => setNotificationAnchorEl(null)}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: "hidden",
                    filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.15))",
                    mt: 1.5,
                    width: 320,
                    borderRadius: 3,
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: "1px solid #E2E8F0",
                    bgcolor: "#F8FAFC",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="primary"
                  >
                    Notifications
                  </Typography>
                </Box>
                <MenuItem sx={{ py: 1.5, borderBottom: "1px solid #F1F5F9" }}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="primary"
                    >
                      TRX-8902 Pending Quote
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Carrier has updated the lane pricing.
                    </Typography>
                  </Box>
                </MenuItem>
              </Menu>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  pl: 2,
                  borderLeft: "1px solid #E2E8F0",
                }}
              >
                <Avatar
                  sx={{ bgcolor: "secondary.main", width: 32, height: 32 }}
                >
                  {currentUser.full_name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {currentUser.full_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {currentUser.role}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* SIDEBAR */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "primary.main",
              color: "white",
            },
          }}
        >
          <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                bgcolor: "secondary.main",
                p: 1,
                borderRadius: 2,
                display: "flex",
              }}
            >
              <LocalShippingIcon sx={{ color: "white" }} />
            </Box>
            <Typography variant="h6" fontWeight="bold">
              Logistics Portal
            </Typography>
          </Box>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
          <List sx={{ px: 2, pt: 2 }}>
            {["Dashboard", "Transfer Registry", "Equipment Move"].map(
              (text, index) => {
                const icons = [
                  <DashboardIcon />,
                  <AssignmentIcon />,
                  <PrecisionManufacturingIcon />,
                ];
                return (
                  <ListItem
                    key={text}
                    selected={activeView === text}
                    onClick={() => setActiveView(text)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                      "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.15)" },
                    }}
                  >
                    <ListItemIcon sx={{ color: "white" }}>
                      {icons[index]}
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </ListItem>
                );
              },
            )}

            {currentUser.role === "Admin" && (
              <ListItem
                selected={activeView === "User Management"}
                onClick={() => setActiveView("User Management")}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                  "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.15)" },
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="User Management" />
              </ListItem>
            )}
          </List>

          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              onClick={() => setIsChangePasswordOpen(true)}
              startIcon={<VpnKeyIcon />}
              sx={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}
            >
              Change Password
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}
            >
              Sign Out
            </Button>
          </Box>
        </Drawer>

        {/* MAIN CONTENT AREA */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 4,
            pt: 12,
            bgcolor: "background.default",
            width: "100%",
            overflowX: "hidden",
          }}
        >
          <Container maxWidth="xl" sx={{ width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 5,
              }}
            >
              <Box>
                <Typography variant="h4" color="primary" gutterBottom>
                  {activeView === "Dashboard"
                    ? "Analytics Overview"
                    : activeView === "Transfer Registry"
                      ? "Logistics Registry"
                      : activeView === "Equipment Move"
                        ? "New Equipment Transfer"
                        : "User Management"}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {activeView === "Dashboard"
                    ? "Real-time insights and metrics across all logistics lanes."
                    : activeView === "Transfer Registry"
                      ? "View and manage all active network transfers."
                      : activeView === "Equipment Move"
                        ? "Follow the steps to submit a capital asset for relocation."
                        : "Manage logistics portal access and user roles."}
                </Typography>
              </Box>
            </Box>

            {/* DASHBOARD VIEW */}
            {activeView === "Dashboard" && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 3,
                    width: "100%",
                    flexWrap: { xs: "wrap", md: "nowrap" },
                  }}
                >
                  {[
                    "Pending Quotes",
                    "Active Logistics",
                    "Completed Deliveries",
                  ].map((title, index) => (
                    <Card
                      key={title}
                      elevation={0}
                      sx={{
                        flex: 1,
                        minWidth: 250,
                        p: 3,
                        borderRadius: "40px",
                        border: "1px solid #E2E8F0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight="600"
                          textTransform="uppercase"
                        >
                          {title}
                        </Typography>
                        <Typography
                          variant="h3"
                          color="primary"
                          sx={{ mt: 1, fontWeight: "800" }}
                        >
                          {index === 0 ? "4" : index === 1 ? "12" : "143"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ bgcolor: "#EFF6FF", p: 1.5, borderRadius: "50%" }}
                      >
                        <TimelineIcon
                          sx={{ fontSize: 32, color: "secondary.main" }}
                        />
                      </Box>
                    </Card>
                  ))}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 3,
                    width: "100%",
                    flexDirection: { xs: "column", lg: "row" },
                  }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      flex: 1,
                      p: 3,
                      borderRadius: 4,
                      border: "1px solid #E2E8F0",
                      height: 420,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Transfers by Facility
                    </Typography>
                    <Box sx={{ flexGrow: 1, position: "relative" }}>
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={facilityData}
                              cx="50%"
                              cy="50%"
                              innerRadius="55%"
                              outerRadius="80%"
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {facilityData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    CHART_COLORS[index % CHART_COLORS.length]
                                  }
                                />
                              ))}
                            </Pie>
                            <ChartTooltip
                              contentStyle={{
                                borderRadius: 8,
                                border: "none",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                              }}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={36}
                              iconType="square"
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Box>
                  </Card>
                  <Card
                    elevation={0}
                    sx={{
                      flex: 1,
                      p: 3,
                      borderRadius: 4,
                      border: "1px solid #E2E8F0",
                      height: 420,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Transfer Status Distribution
                    </Typography>
                    <Box sx={{ flexGrow: 1, position: "relative" }}>
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={statusData}
                            margin={{
                              top: 20,
                              right: 20,
                              left: -20,
                              bottom: 0,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#E2E8F0"
                            />
                            <XAxis
                              dataKey="name"
                              tick={{ fontSize: 12 }}
                              interval={0}
                              angle={-15}
                              textAnchor="end"
                              height={60}
                              dy={10}
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{ fontSize: 12 }}
                            />
                            <ChartTooltip
                              cursor={{ fill: "#F8FAFC" }}
                              contentStyle={{
                                borderRadius: 8,
                                border: "none",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                              }}
                            />
                            <Bar
                              dataKey="Transfers"
                              fill="#007BFF"
                              radius={[4, 4, 0, 0]}
                              barSize={50}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Box>
                  </Card>
                </Box>
              </Box>
            )}

            {/* TRANSFER REGISTRY VIEW */}
            {activeView === "Transfer Registry" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{ borderRadius: 4, border: "1px solid #E2E8F0" }}
                >
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Transfer ID</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Routing</TableCell>
                        <TableCell>Requestor</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockTransfers.map((transfer) => (
                        <TableRow
                          key={transfer.id}
                          hover
                          onClick={() => openReviewModal(transfer)}
                          sx={{
                            cursor: "pointer",
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell
                            sx={{ fontWeight: 600, color: "primary.main" }}
                          >
                            {transfer.id}
                          </TableCell>
                          <TableCell>{transfer.type}</TableCell>
                          <TableCell>
                            {transfer.origin} → {transfer.dest}
                          </TableCell>
                          <TableCell>{transfer.requestor}</TableCell>
                          <TableCell>{transfer.date}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={transfer.status.replace(/_/g, " ")}
                              color={getStatusColor(transfer.status)}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                color: "white",
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* EQUIPMENT MOVE VIEW (WIZARD) */}
            {activeView === "Equipment Move" && (
              <Card
                elevation={0}
                sx={{
                  p: { xs: 3, md: 5 },
                  borderRadius: 4,
                  border: "1px solid #E2E8F0",
                  maxWidth: 900,
                  mx: "auto",
                }}
              >
                <Stepper activeStep={equipStep} alternativeLabel sx={{ mb: 6 }}>
                  {[
                    "Routing & Schedule",
                    "Capital Asset Compliance",
                    "Physical Logistics",
                  ].map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <Box component="form" sx={{ width: "100%", mt: 2 }}>
                  {equipStep === 0 && (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 4 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: 3,
                          flexDirection: { xs: "column", sm: "row" },
                        }}
                      >
                        <TextField
                          type="datetime-local"
                          label="Earliest Shipping"
                          value={equipForm.shippingEarliest}
                          onChange={(e) =>
                            setEquipForm({
                              ...equipForm,
                              shippingEarliest: e.target.value,
                            })
                          }
                          onFocus={() =>
                            setDateFocus((prev) => ({
                              ...prev,
                              earliest: true,
                            }))
                          }
                          onBlur={() =>
                            setDateFocus((prev) => ({
                              ...prev,
                              earliest: false,
                            }))
                          }
                          InputLabelProps={{
                            shrink:
                              dateFocus.earliest ||
                              !!equipForm.shippingEarliest,
                          }}
                          sx={{
                            flex: 1,
                            "& input": {
                              color:
                                dateFocus.earliest ||
                                !!equipForm.shippingEarliest
                                  ? "inherit"
                                  : "transparent",
                            },
                          }}
                        />
                        <TextField
                          type="datetime-local"
                          label="Latest Shipping"
                          value={equipForm.shippingLatest}
                          onChange={(e) =>
                            setEquipForm({
                              ...equipForm,
                              shippingLatest: e.target.value,
                            })
                          }
                          onFocus={() =>
                            setDateFocus((prev) => ({ ...prev, latest: true }))
                          }
                          onBlur={() =>
                            setDateFocus((prev) => ({ ...prev, latest: false }))
                          }
                          InputLabelProps={{
                            shrink:
                              dateFocus.latest || !!equipForm.shippingLatest,
                          }}
                          sx={{
                            flex: 1,
                            "& input": {
                              color:
                                dateFocus.latest || !!equipForm.shippingLatest
                                  ? "inherit"
                                  : "transparent",
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {equipStep === 1 && (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 4 }}
                    >
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        Exact Project and HS Tariff codes are strictly required
                        for compliance.
                      </Alert>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 3,
                          flexDirection: { xs: "column", sm: "row" },
                        }}
                      >
                        <TextField
                          label="Equip ID"
                          placeholder="EQ-00000"
                          InputLabelProps={{ shrink: true }}
                          value={equipForm.equipId}
                          onChange={(e) =>
                            setEquipForm({
                              ...equipForm,
                              equipId: e.target.value,
                            })
                          }
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          label="Project Code"
                          placeholder="PRJ-123"
                          InputLabelProps={{ shrink: true }}
                          value={equipForm.projectCode}
                          onChange={(e) =>
                            setEquipForm({
                              ...equipForm,
                              projectCode: e.target.value,
                            })
                          }
                          sx={{ flex: 1 }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 3,
                          flexDirection: { xs: "column", sm: "row" },
                        }}
                      >
                        <TextField
                          label="HS Code (Tariff)"
                          placeholder="8471.30.01"
                          InputLabelProps={{ shrink: true }}
                          value={equipForm.hsCode}
                          onChange={(e) =>
                            setEquipForm({
                              ...equipForm,
                              hsCode: e.target.value,
                            })
                          }
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          type="number"
                          label="Unit Value ($)"
                          placeholder="0.00"
                          InputLabelProps={{ shrink: true }}
                          value={equipForm.unitValue}
                          onChange={(e) =>
                            setEquipForm({
                              ...equipForm,
                              unitValue: e.target.value,
                            })
                          }
                          sx={{ flex: 1 }}
                        />
                      </Box>
                      <TextField
                        fullWidth
                        label="Full Equipment Description"
                        placeholder="Detailed description of the asset..."
                        InputLabelProps={{ shrink: true }}
                        multiline
                        rows={3}
                        value={equipForm.description}
                        onChange={(e) =>
                          setEquipForm({
                            ...equipForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </Box>
                  )}

                  {equipStep === 2 && (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 4 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: 3,
                          flexDirection: { xs: "column", sm: "row" },
                        }}
                      >
                        <TextField
                          type="number"
                          label="Pallet Count"
                          placeholder="0"
                          InputLabelProps={{ shrink: true }}
                          value={equipForm.pallets}
                          onChange={(e) =>
                            setEquipForm({
                              ...equipForm,
                              pallets: e.target.value,
                            })
                          }
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          type="number"
                          label="Total Weight (lbs/kg)"
                          placeholder="0.00"
                          InputLabelProps={{ shrink: true }}
                          value={equipForm.weight}
                          onChange={(e) =>
                            setEquipForm({
                              ...equipForm,
                              weight: e.target.value,
                            })
                          }
                          sx={{ flex: 1 }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 3,
                          flexDirection: { xs: "column", sm: "row" },
                        }}
                      >
                        <TextField
                          label="Dimensions (L x W x H)"
                          placeholder="e.g. 48x40x60"
                          InputLabelProps={{ shrink: true }}
                          value={equipForm.dimensions}
                          onChange={(e) =>
                            setEquipForm({
                              ...equipForm,
                              dimensions: e.target.value,
                            })
                          }
                          sx={{ flex: 1 }}
                        />
                        <FormControl variant="outlined" sx={{ flex: 1 }}>
                          <InputLabel>Carrier Equipment Needed</InputLabel>
                          <Select
                            label="Carrier Equipment Needed"
                            value={equipForm.carrier}
                            onChange={(e) =>
                              setEquipForm({
                                ...equipForm,
                                carrier: e.target.value,
                              })
                            }
                          >
                            {CARRIER_EQUIP.map((equip) => (
                              <MenuItem key={equip} value={equip}>
                                {equip}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="overline"
                          color="text.secondary"
                          sx={{ display: "block", mb: 1 }}
                        >
                          Supporting Documentation (Optional)
                        </Typography>
                        <input
                          type="file"
                          style={{ display: "none" }}
                          id="equip-file-upload"
                          onChange={(e) => setEquipFile(e.target.files[0])}
                        />
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AttachFileIcon />}
                            onClick={() =>
                              document
                                .getElementById("equip-file-upload")
                                .click()
                            }
                          >
                            Attach File
                          </Button>
                          {equipFile && (
                            <Chip
                              label={equipFile.name}
                              onDelete={() => setEquipFile(null)}
                              size="small"
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 6,
                      pt: 3,
                      borderTop: "1px solid #E2E8F0",
                    }}
                  >
                    {equipStep > 0 ? (
                      <Button
                        variant="contained"
                        onClick={() => setEquipStep((prev) => prev - 1)}
                        sx={{
                          bgcolor: "#E2E8F0",
                          color: "#1E293B",
                          "&:hover": { bgcolor: "#CBD5E1" },
                        }}
                      >
                        Back
                      </Button>
                    ) : (
                      <Box /> // Empty box to keep the "Next" button pushed to the right
                    )}
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        if (equipStep === 2) {
                          setActiveView("Transfer Registry");
                          setEquipStep(0);
                        } else {
                          setEquipStep((prev) => prev + 1);
                        }
                      }}
                    >
                      {equipStep === 2 ? "Submit Request" : "Next Step"}
                    </Button>
                  </Box>
                </Box>
              </Card>
            )}

            {/* USER MANAGEMENT VIEW */}
            {activeView === "User Management" &&
              currentUser.role === "Admin" && (
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{ borderRadius: 4, border: "1px solid #E2E8F0" }}
                >
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>User ID</TableCell>
                        <TableCell>Full Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Joined Date</TableCell>
                        <TableCell>Logistics Role</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {usersList.map((user) => (
                        <TableRow
                          key={user.id}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600 }}>
                            USR-{String(user.id).padStart(4, "0")}
                          </TableCell>
                          <TableCell>{user.full_name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                              <Select
                                value={user.role}
                                onChange={(e) =>
                                  handleRoleChange(user.id, e.target.value)
                                }
                                sx={{
                                  bgcolor:
                                    user.role === "Admin" ? "#EFF6FF" : "white",
                                  fontWeight: 600,
                                }}
                              >
                                {[
                                  "Admin",
                                  "Dispatcher",
                                  "Plant Manager",
                                  "Requester",
                                  "Read-Only",
                                ].map((role) => (
                                  <MenuItem key={role} value={role}>
                                    {role}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

            {/* TRANSFER REVIEW MODAL (ACTIVITY FEED) */}
            <Dialog
              open={isReviewModalOpen}
              onClose={() => setIsReviewModalOpen(false)}
              maxWidth="md"
              fullWidth
              PaperProps={{ sx: { borderRadius: 3 } }}
            >
              {selectedTransfer && (
                <>
                  <DialogTitle
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocalShippingIcon /> {selectedTransfer.id} Details
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => setIsReviewModalOpen(false)}
                      sx={{ color: "white" }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </DialogTitle>
                  <DialogContent dividers sx={{ p: 4, bgcolor: "#F8FAFC" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 3,
                      }}
                    >
                      <Box>
                        <Typography variant="overline" color="text.secondary">
                          Routing
                        </Typography>
                        <Typography variant="h6">
                          {selectedTransfer.origin} → {selectedTransfer.dest}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="overline" color="text.secondary">
                          Current Status
                        </Typography>
                        <Box mt={0.5}>
                          <Chip
                            label={selectedTransfer.status.replace(/_/g, " ")}
                            color={getStatusColor(selectedTransfer.status)}
                            size="small"
                            sx={{ fontWeight: 600, color: "white" }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                      Activity & Updates
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "white",
                        borderRadius: 2,
                        border: "1px solid #E2E8F0",
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          alignItems: "flex-start",
                        }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Post a comment, delivery note, or status update..."
                          value={newUpdateText}
                          onChange={(e) => setNewUpdateText(e.target.value)}
                          multiline
                          maxRows={3}
                          sx={{ bgcolor: "white" }}
                        />
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handlePostUpdate}
                          disabled={!newUpdateText.trim()}
                          sx={{ py: 1, minWidth: "120px" }}
                          startIcon={<SendIcon />}
                        >
                          Post
                        </Button>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      {!(
                        updatesMap[selectedTransfer.id] &&
                        updatesMap[selectedTransfer.id].length > 0
                      ) ? (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          align="center"
                          sx={{ py: 2 }}
                        >
                          No updates have been posted yet.
                        </Typography>
                      ) : (
                        updatesMap[selectedTransfer.id].map((update) => (
                          <Box
                            key={update.id}
                            sx={{
                              p: 2,
                              bgcolor: "white",
                              borderRadius: 2,
                              border: "1px solid #E2E8F0",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 0.5,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                fontWeight="bold"
                                color="primary"
                              >
                                {update.user_name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {update.date}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{ whiteSpace: "pre-wrap" }}
                            >
                              {update.text}
                            </Typography>
                          </Box>
                        ))
                      )}
                    </Box>
                  </DialogContent>
                </>
              )}
            </Dialog>

            {/* NEW: CHANGE PASSWORD MODAL */}
            <ChangePassword
              open={isChangePasswordOpen}
              onClose={() => setIsChangePasswordOpen(false)}
              userEmail={currentUser?.email}
            />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
