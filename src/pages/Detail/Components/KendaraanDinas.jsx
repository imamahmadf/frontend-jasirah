import React from "react";
import {
  Card,
  CardBody,
  Heading,
  Icon,
  VStack,
  HStack,
  Text,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiTruck, FiAlertCircle } from "react-icons/fi";

function KendaraanDinas({ detailPerjalanan, cardBg, borderColor, headerBg }) {
  const kendaraan = detailPerjalanan?.kendaraanDina;
  const sectionBg = useColorModeValue("white", "gray.800");
  const vehicleBg = useColorModeValue("gray.50", "gray.700");
  const borderCardColor = useColorModeValue("gray.200", "gray.600");
  const borderWhiteColor = useColorModeValue("gray.100", "gray.600");

  return (
    <Card
      bg={cardBg}
      borderColor={borderColor}
      shadow="sm"
      borderRadius="xl"
      overflow="hidden"
      h="100%"
      display="flex"
      flexDirection="column"
      border="1px"
    >
      {/* Header */}
      <Box
        p={6}
        borderBottom="1px"
        borderColor={borderCardColor}
        bg={sectionBg}
      >
        <HStack spacing={2}>
          <Icon as={FiTruck} boxSize={4} color="teal.600" />
          <Heading size="sm" fontWeight="semibold" color="gray.900">
            Kendaraan Dinas
          </Heading>
        </HStack>
      </Box>

      {/* Body */}
      <CardBody p={6} flex={1}>
        <Box
          bg={vehicleBg}
          borderRadius="xl"
          border="1px"
          borderColor={borderCardColor}
          p={6}
          textAlign="center"
          position="relative"
          overflow="hidden"
          transition="all 0.2s"
          _hover={{
            borderColor: "gray.300",
          }}
        >
          {/* Background pattern */}
          <Box
            position="absolute"
            top={0}
            right={0}
            p={4}
            opacity={0.05}
            zIndex={0}
          >
            <Icon as={FiTruck} boxSize={20} color="gray.400" />
          </Box>

          <VStack spacing={3} position="relative" zIndex={1}>
            <Box
              w="56px"
              h="56px"
              bg="white"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={3}
              shadow="sm"
              border="1px"
              borderColor={borderWhiteColor}
              transition="transform 0.2s"
              _groupHover={{
                transform: "scale(1.05)",
              }}
            >
              <Box position="relative">
                <Icon as={FiTruck} boxSize={6} color="gray.300" />
                <Box
                  position="absolute"
                  top="-4px"
                  right="-4px"
                  bg="gray.100"
                  borderRadius="full"
                  p={0.5}
                  border="1px"
                  borderColor="white"
                >
                  <Icon as={FiAlertCircle} boxSize={2.5} color="gray.400" />
                </Box>
              </Box>
            </Box>

            {kendaraan ? (
              <>
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={1}>
                  Menggunakan Kendaraan Dinas
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {kendaraan.kendaraan?.merek || "-"} - KT{" "}
                  {kendaraan.kendaraan?.nomor || "-"}{" "}
                  {kendaraan.kendaraan?.seri || ""}
                </Text>
              </>
            ) : (
              <>
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={1}>
                  Tidak Menggunakan Kendaraan Dinas
                </Text>
                <Text
                  fontSize="xs"
                  color="gray.500"
                  maxW="200px"
                  mx="auto"
                  lineHeight="relaxed"
                >
                  Perjalanan ini tercatat tidak menggunakan fasilitas kendaraan
                  dinas.
                </Text>
              </>
            )}
          </VStack>
        </Box>
      </CardBody>
    </Card>
  );
}

export default KendaraanDinas;
