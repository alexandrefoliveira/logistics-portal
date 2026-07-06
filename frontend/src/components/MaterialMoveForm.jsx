import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Box,
  Divider,
} from "@mui/material";

// Pre-populated data directly from the specification
const locations = [
  "IRS-SHELBURNE",
  "IRS-FEVESHAM",
  "IRS-CALGARY",
  "IRS-GRAFTON",
  "BMP",
  "Vendor",
  "Customer",
];
const carrierEquip = [
  "Standard 53' Van",
  "Flatbed",
  "Drop Deck",
  "LTL",
  "Tarps",
];

export default function MaterialMoveForm({ setView }) {
  const [formData, setFormData] = useState({
    originName: "",
    destName: "",
    shippingEarliest: "",
    shippingLatest: "",
    materialNumber: "",
    description: "",
    pallets: "",
    weight: "",
    dimensions: "",
    carrier: "",
  });

  // The "Hard Stop" logic: Checks if any value in the formData object is empty
  const isFormComplete = Object.values(formData).every(
    (value) => String(value).trim() !== "",
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormComplete) {
      console.log("Submitting perfectly structured payload:", formData);
      // TODO: Axios POST to Node.js /api/requests
      setView("dashboard");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" fontWeight="bold" color="primary">
            Material Movement Form
          </Typography>
          <Button variant="outlined" onClick={() => setView("dashboard")}>
            Cancel
          </Button>
        </Box>
        <Divider sx={{ mb: 4 }} />

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Headers: Locations */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                required
                label="Origin Site (From)"
                name="originName"
                value={formData.originName}
                onChange={handleChange}
              >
                {locations.map((loc) => (
                  <MenuItem key={loc} value={loc}>
                    {loc}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                required
                label="Destination Site (To)"
                name="destName"
                value={formData.destName}
                onChange={handleChange}
              >
                {locations.map((loc) => (
                  <MenuItem key={loc} value={loc}>
                    {loc}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Headers: Timelines */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="datetime-local"
                label="Shipping Earliest"
                name="shippingEarliest"
                InputLabelProps={{ shrink: true }}
                value={formData.shippingEarliest}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="datetime-local"
                label="Shipping Latest"
                name="shippingLatest"
                InputLabelProps={{ shrink: true }}
                value={formData.shippingLatest}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>Material Payload Details</Divider>
            </Grid>

            {/* Data Grid */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Material Number"
                name="materialNumber"
                value={formData.materialNumber}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                required
                label="Material Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                type="number"
                label="Number of Pallets"
                name="pallets"
                value={formData.pallets}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                type="number"
                label="Total Weight (lbs/kg)"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Dimensions (L x W x H)"
                name="dimensions"
                placeholder="e.g., 48x40x60"
                value={formData.dimensions}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>Carrier Info</Divider>
            </Grid>

            {/* Footer */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                required
                label="Carrier Equipment Needed"
                name="carrier"
                value={formData.carrier}
                onChange={handleChange}
              >
                {carrierEquip.map((equip) => (
                  <MenuItem key={equip} value={equip}>
                    {equip}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                disabled={!isFormComplete}
                sx={{ mt: 3, py: 2, fontWeight: "bold" }}
              >
                Submit Complete Request
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
