// src/pages/PerjalananKadis/Components/SubmitButton.jsx
import React from "react";
import { Button, Container } from "@chakra-ui/react";

const SubmitButton = ({ isLoading }) => {
  return (
    <Container maxW="1280px" variant="primary" p={0} mb="40px">
      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        loadingText="Mengunduh..."
        width="100%"
        height="60px"
        fontSize="18px"
        fontWeight="600"
      >
        Submit
      </Button>
    </Container>
  );
};

export default SubmitButton;
