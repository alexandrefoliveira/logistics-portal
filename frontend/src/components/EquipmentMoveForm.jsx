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
  Stepper,
  Step,
  StepLabel,
  Alert,
} from "@mui/material";

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
const steps = [
  "Routing & Schedule",
  "Capital Asset Compliance",
  "Physical Logistics",
];

export default function EquipmentMoveForm({ setView }) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    originName: "",
    destName: "",
    shippingEarliest: "",
    shippingLatest: "",
    equipId: "",
    projectCode: "",
    hsCode: "",
    unitValue: "",
    description: "",
    manufacturer: "",
    serialNumber: "",
    countryOfOrigin: "",
    pallets: "",
    weight: "",
    dimensions: "",
    carrier: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Validation logic per step
  const isStepComplete = () => {
    if (activeStep === 0)
      return (
        formData.originName &&
        formData.destName &&
        formData.shippingEarliest &&
        formData.shippingLatest
      );
    if (activeStep === 1)
      return (
        formData.equipId &&
        formData.projectCode &&
        formData.hsCode &&
        formData.unitValue &&
        formData.description
      );
    if (activeStep === 2)
      return (
        formData.pallets &&
        formData.weight &&
        formData.dimensions &&
        formData.carrier
      );
    return false;
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting validated Multi-Step payload:", formData);
    setView("dashboard");
  };

  // Step Content Renderer
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3} mt={1}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Earliest Shipping"
                name="shippingEarliest"
                InputLabelProps={{ shrink: true }}
                value={formData.shippingEarliest}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Latest Shipping"
                name="shippingLatest"
                InputLabelProps={{ shrink: true }}
                value={formData.shippingLatest}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3} mt={1}>
            <Grid item xs={12}>
              <Alert severity="warning">
                Exact Project and HS Tariff codes are strictly required for
                compliance.
              </Alert>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Equip ID"
                name="equipId"
                value={formData.equipId}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Project Code"
                name="projectCode"
                value={formData.projectCode}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="HS Code (Tariff)"
                name="hsCode"
                value={formData.hsCode}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Unit Value ($)"
                name="unitValue"
                value={formData.unitValue}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Equipment Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Serial Number"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Country of Origin"
                name="countryOfOrigin"
                value={formData.countryOfOrigin}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3} mt={1}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Pallet Count"
                name="pallets"
                value={formData.pallets}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
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
                label="Dimensions (L x W x H)"
                name="dimensions"
                placeholder="e.g. 48x40x60"
                value={formData.dimensions}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
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
          </Grid>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 5, borderRadius: 3 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          mb={4}
          color="primary"
        >
          Equipment Transfer Request
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box
          component="form"
          onSubmit={
            activeStep === steps.length - 1
              ? handleSubmit
              : (e) => e.preventDefault()
          }
        >
          {renderStepContent(activeStep)}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 6,
              pt: 2,
              borderTop: "1px solid #eee",
            }}
          >
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              size="large"
            >
              Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!isStepComplete()}
              >
                Submit Transfer
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                size="large"
                disabled={!isStepComplete()}
              >
                Next Step
              </Button>
            )}
          </Box>
        </Box>

        <Box textAlign="center" mt={3}>
          <Button
            variant="text"
            size="small"
            onClick={() => setView("dashboard")}
          >
            Cancel & Return to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
