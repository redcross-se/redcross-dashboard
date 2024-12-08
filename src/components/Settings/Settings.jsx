import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Avatar,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import { axiosInstance } from "../../configs/axios.instance";
import { uploadProfilePicture } from "../../configs/imagekit.config";

function a11yProps(index) {
  return {
    id: `settings-tab-${index}`,
    "aria-controls": `settings-tabpanel-${index}`,
  };
}

const Settings = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [user, setUser] = useState({
    email: "",
    phoneNumber: "",
    fullName: "",
    dob: "",
    bloodType: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [alerts, setAlerts] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get("/auth/me");
        setUser(response.data);
        setProfilePreview(response.data.profilePicture);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
      setProfilePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put("/user/update-profile", user);
      setAlerts({
        open: true,
        severity: "success",
        message: "Profile updated successfully!",
      });
    } catch (error) {
      setAlerts({
        open: true,
        severity: "error",
        message: error.response?.data?.message || "Failed to update profile.",
      });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlerts({
        open: true,
        severity: "error",
        message: "New passwords do not match.",
      });
      return;
    }
    try {
      await axiosInstance.put("/user/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setAlerts({
        open: true,
        severity: "success",
        message: "Password changed successfully!",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setAlerts({
        open: true,
        severity: "error",
        message: error.response?.data?.message || "Failed to change password.",
      });
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!profilePicture) {
      setAlerts({
        open: true,
        severity: "error",
        message: "No file selected.",
      });
      return;
    }
    try {
      const uploadData = await uploadProfilePicture(profilePicture);
      // Update user's profile picture in the backend
      await axiosInstance.post("/user/upload-profile-picture", {
        profilePicture: uploadData.url,
      });
      setProfilePreview(uploadData.url);
      setAlerts({
        open: true,
        severity: "success",
        message: "Profile picture uploaded successfully!",
      });
    } catch (error) {
      setAlerts({
        open: true,
        severity: "error",
        message:
          error.response?.data?.message || "Failed to upload profile picture.",
      });
    }
  };

  const handleCloseAlert = () => {
    setAlerts({ ...alerts, open: false });
  };

  return (
    <Container maxWidth="" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          aria-label="settings tabs"
        >
          <Tab label="Profile" {...a11yProps(0)} />
          <Tab label="Change Password" {...a11yProps(1)} />
          <Tab label="Profile Picture" {...a11yProps(2)} />
        </Tabs>
      </Box>
      {/* Profile Tab */}
      {tabIndex === 0 && (
        <Box sx={{ p: 3 }}>
          <form onSubmit={handleUpdateProfile}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Full Name"
                  name="fullName"
                  value={user.fullName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={user.email}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  value={user.phoneNumber}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={user.dob ? user.dob.split("T")[0] : ""}
                  onChange={handleInputChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {/* Add more fields as necessary */}
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Update Profile
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      )}
      {/* Change Password Tab */}
      {tabIndex === 1 && (
        <Box sx={{ p: 3 }}>
          <form onSubmit={handleChangePassword}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Change Password
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      )}
      {/* Profile Picture Tab */}
      {tabIndex === 2 && (
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar
                src={profilePreview}
                alt="Profile Picture"
                sx={{ width: 100, height: 100 }}
              />
            </Grid>
            <Grid item>
              <Button variant="contained" component="label">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleProfilePictureChange}
                />
              </Button>
            </Grid>
            {profilePicture && (
              <Grid item>
                <Typography variant="body2">
                  Selected File: {profilePicture.name}
                </Typography>
              </Grid>
            )}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUploadProfilePicture}
              >
                Upload Profile Picture
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
      {/* Alert Snackbar */}
      <Snackbar
        open={alerts.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alerts.severity}
          sx={{ width: "100%" }}
        >
          {alerts.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;
