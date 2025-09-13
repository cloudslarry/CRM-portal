import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import LockIcon from "@mui/icons-material/Lock";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import emailjs from "emailjs-com";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function ForgotPassword() {
  const navigate = useNavigate();
  const { user } = useParams(); // 'user' will be 'student' or 'faculty'

  const [registrationNumber, setRegistrationNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const idLabel = useMemo(() =>
    user === 'student' ? 'Student Registration Number' : 'Faculty ID',
    [user]
  );
  const userTypeTitle = useMemo(() =>
    user?.charAt(0).toUpperCase() + user?.slice(1),
    [user]
  );

  const handleIdSubmit = async (e) => {
    e.preventDefault();
    if (!registrationNumber) {
      toast.error(`Please enter your ${idLabel}`);
      return;
    }
    try {
      setLoading(true);
      // This logic correctly chooses /api/auth/ for students
      const apiUrl = user === 'student' 
        ? '/api/auth/get-email-by-id' 
        : '/api/faculty/get-email-by-id';

      const res = await axios.post(apiUrl, { registrationNumber });
      
      setEmail(res.data.email);
      toast.success(`An OTP will be sent to: ${res.data.email}`);
      setStep(1);
    } catch (error) {
      toast.error(error.response?.data?.error || `${idLabel} not found`);
    } finally {
      setLoading(false);
    }
  };

  const sendOtpHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    const otpGenerated = Math.floor(100000 + Math.random() * 900000);
    setGeneratedOtp(String(otpGenerated));
    try {
      const templateParams = { to_email: email, otp: otpGenerated };
      await emailjs.send(
        "service_y9pwjm4", // 🔹 Replace with your EmailJS Service ID
        "template_7aw1h0q", // 🔹 Replace with your EmailJS Template ID
        templateParams,
        "HFUQMuLkjAkMHqGCg" // 🔹 Replace with your EmailJS Public Key
      );
      toast.success("OTP sent to your email");
      setStep(2);
    } catch (error) {
      toast.error("Failed to send OTP");
      console.error("EmailJS Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitOtpHandler = async (e) => {
    e.preventDefault();
    if (otp !== String(generatedOtp)) {
      toast.error("Invalid OTP. Please try again.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      // This logic correctly chooses /api/auth/ for students
      const resetUrl = user === 'student'
        ? '/api/auth/reset-password'
        : '/api/faculty/reset-password';
        
      await axios.post(resetUrl, {
        registrationNumber,
        newPassword,
      });
      toast.success(`Password reset successful for ${idLabel}: ${registrationNumber}`);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 450, mx: "auto", mt: 8, p: 3, boxShadow: 3, borderRadius: 2, textAlign: "center",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Forgot Password - {userTypeTitle}
      </Typography>

      {step === 0 && (
        <Box component="form" onSubmit={handleIdSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={idLabel}
                required
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" fullWidth variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Next"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Other steps (Send OTP and Reset Password forms) remain the same */}
      {step === 1 && (
         <Box component="form" onSubmit={sendOtpHandler}>
           <Typography textAlign="center" sx={{ mb: 2 }}>
             OTP will be sent to: <b>{email}</b>
           </Typography>
           <Button type="submit" fullWidth variant="contained" startIcon={<SendIcon />} disabled={loading}>
             {loading ? "Sending..." : "Send OTP"}
           </Button>
         </Box>
      )}

      {step === 2 && (
        <Box component="form" onSubmit={submitOtpHandler}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Enter OTP" required value={otp} onChange={(e) => setOtp(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><VpnKeyIcon color="primary" /></InputAdornment>),}}/>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth type="password" label="New Password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><LockIcon color="primary" /></InputAdornment>),}}/>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth type="password" label="Confirm Password" required value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><CheckCircleIcon color="primary" /></InputAdornment>),}}/>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" fullWidth variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Reset Password"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}

export default ForgotPassword;