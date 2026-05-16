// src/pages/Perjalanan/components/SubmitButton.jsx
import React from "react";
import { Button, Container } from "@chakra-ui/react";

const SubmitButton = ({ isLoading }) => {
  return (
    <Container maxW="1280px" variant="primary" p={0}>
      <Button
        type="submit" // ✅ ini penting agar Formik menangani validasi
        variant="primary"
        isLoading={isLoading}
        loadingText="Mengunduh..."
        width="100%"
        height="60px"
      >
        Submit
      </Button>
    </Container>
  );
};

export default SubmitButton;
