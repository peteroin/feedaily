// backend/otpService.js
import otpGenerator from "otp-generator";

export function generateOtp(contextId) {
//   const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
//   if (contextId) {
//     otpStore.set(contextId, otp);
//   }
//   return otp;
    return otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
}

export function getOtp(contextId) {
  return otpStore.get(contextId);
}

export function validateOtp(contextId, enteredOtp) {
  const realOtp = otpStore.get(contextId);
  if (!realOtp) return false;
  const valid = enteredOtp === realOtp;
  if (valid) otpStore.delete(contextId);
  return valid;
}

export function removeOtp(contextId) {
  otpStore.delete(contextId);
}
